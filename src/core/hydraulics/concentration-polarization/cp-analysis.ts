import {
  CP_DEFAULT_MASS_TRANSFER_COEFFICIENT_MS,
  CP_LOW_THRESHOLD,
  CP_WARNING_THRESHOLD,
  CP_CRITICAL_THRESHOLD,
} from "@/core/hydraulics/concentration-polarization/cp.constants";
import {
  calculateCPFactor,
  calculateMembraneSurfaceConcentration,
  calculateEffectiveOsmoticPressure,
} from "@/core/hydraulics/concentration-polarization/cp-calculation";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CPStatus = "invalid" | "normal" | "warning" | "critical";
export type CPClassification = "low" | "normal" | "elevated" | "critical";

export interface CPAnalysisResult {
  cpFactor: number;
  bulkConcentrationMgL: number;
  membraneSurfaceConcentrationMgL: number;
  effectiveOsmoticPressureBar: number;
  osmoticAmplificationBar: number;
  bulkOsmoticPressureBar: number;
  status: CPStatus;
  classification: CPClassification;
  message: string;
}

export interface StageCPInput {
  fluxLMH: number;
  bulkConcentrationMgL: number;
  bulkOsmoticPressureBar: number;
  massTransferCoefficientMS?: number;
}

export interface StageCPResult {
  stageIndex: number;
  fluxLMH: number;
  cp: CPAnalysisResult;
}

export interface SystemCPResult {
  stages: StageCPResult[];
  maxCPFactor: number;
  maxOsmoticAmplificationBar: number;
  systemStatus: CPStatus;
  systemMessage: string;
}

// ─── Classification helpers ───────────────────────────────────────────────────

function classifyCP(cpFactor: number): CPClassification {
  if (cpFactor < CP_LOW_THRESHOLD) return "low";
  if (cpFactor < CP_WARNING_THRESHOLD) return "normal";
  if (cpFactor < CP_CRITICAL_THRESHOLD) return "elevated";
  return "critical";
}

function classifyCPStatus(cpFactor: number): CPStatus {
  if (!Number.isFinite(cpFactor) || cpFactor < 1) return "invalid";
  if (cpFactor >= CP_CRITICAL_THRESHOLD) return "critical";
  if (cpFactor >= CP_WARNING_THRESHOLD) return "warning";
  return "normal";
}

function buildCPMessage(classification: CPClassification, cpFactor: number): string {
  switch (classification) {
    case "low":
      return `CP factor ${cpFactor.toFixed(3)} is very low — operating well below concentration polarization limits.`;
    case "normal":
      return `CP factor ${cpFactor.toFixed(3)} is within normal operating range (< ${CP_WARNING_THRESHOLD}).`;
    case "elevated":
      return `CP factor ${cpFactor.toFixed(3)} is elevated — increased scaling and fouling risk. Review flux and cross-flow velocity.`;
    case "critical":
      return `CP factor ${cpFactor.toFixed(3)} exceeds critical threshold (${CP_CRITICAL_THRESHOLD}) — severe membrane surface concentration. Reduce flux or increase cross-flow.`;
  }
}

// ─── Single-point CP analysis ─────────────────────────────────────────────────

/**
 * Analyze concentration polarization at a single operating point.
 * Computes CP factor, membrane surface concentration, and effective osmotic pressure.
 */
export function analyzeCPFactor(
  fluxLMH: number,
  bulkConcentrationMgL: number,
  bulkOsmoticPressureBar: number,
  massTransferCoefficientMS: number = CP_DEFAULT_MASS_TRANSFER_COEFFICIENT_MS
): CPAnalysisResult {
  const surfaceResult = calculateMembraneSurfaceConcentration(
    bulkConcentrationMgL,
    fluxLMH,
    massTransferCoefficientMS
  );

  const osmoticResult = calculateEffectiveOsmoticPressure(
    bulkOsmoticPressureBar,
    fluxLMH,
    massTransferCoefficientMS
  );

  if (surfaceResult === null || osmoticResult === null) {
    return {
      cpFactor: 0,
      bulkConcentrationMgL,
      membraneSurfaceConcentrationMgL: 0,
      effectiveOsmoticPressureBar: 0,
      osmoticAmplificationBar: 0,
      bulkOsmoticPressureBar,
      status: "invalid",
      classification: "low",
      message: "Invalid inputs — flux, bulk concentration, or mass transfer coefficient is missing or out of range.",
    };
  }

  const cpFactor = surfaceResult.cpFactor;
  const classification = classifyCP(cpFactor);
  const status = classifyCPStatus(cpFactor);

  return {
    cpFactor,
    bulkConcentrationMgL,
    membraneSurfaceConcentrationMgL: surfaceResult.membraneSurfaceConcentrationMgL,
    effectiveOsmoticPressureBar: osmoticResult.effectiveOsmoticPressureBar,
    osmoticAmplificationBar: osmoticResult.osmoticAmplificationBar,
    bulkOsmoticPressureBar,
    status,
    classification,
    message: buildCPMessage(classification, cpFactor),
  };
}

// ─── Multi-stage CP analysis ──────────────────────────────────────────────────

/**
 * Analyze CP for each stage independently.
 * Each stage receives its own flux, bulk concentration, and osmotic pressure.
 *
 * Bulk concentration per stage should be derived from the flow/CF engine
 * (CF × feed TDS). No iterative coupling here — purely deterministic.
 */
export function analyzeMultiStageCP(stages: StageCPInput[]): SystemCPResult {
  if (!stages.length) {
    return {
      stages: [],
      maxCPFactor: 0,
      maxOsmoticAmplificationBar: 0,
      systemStatus: "invalid",
      systemMessage: "No stages provided.",
    };
  }

  const stageResults: StageCPResult[] = stages.map((s, i) => ({
    stageIndex: i + 1,
    fluxLMH: s.fluxLMH,
    cp: analyzeCPFactor(
      s.fluxLMH,
      s.bulkConcentrationMgL,
      s.bulkOsmoticPressureBar,
      s.massTransferCoefficientMS ?? CP_DEFAULT_MASS_TRANSFER_COEFFICIENT_MS
    ),
  }));

  const validStages = stageResults.filter((s) => s.cp.status !== "invalid");
  const maxCPFactor = validStages.length
    ? Math.max(...validStages.map((s) => s.cp.cpFactor))
    : 0;
  const maxOsmoticAmplificationBar = validStages.length
    ? Math.max(...validStages.map((s) => s.cp.osmoticAmplificationBar))
    : 0;

  const hasInvalid = stageResults.some((s) => s.cp.status === "invalid");
  const hasCritical = stageResults.some((s) => s.cp.status === "critical");
  const hasWarning = stageResults.some((s) => s.cp.status === "warning");

  let systemStatus: CPStatus = "normal";
  if (hasInvalid) systemStatus = "invalid";
  else if (hasCritical) systemStatus = "critical";
  else if (hasWarning) systemStatus = "warning";

  const systemMessage =
    systemStatus === "normal"
      ? `All ${stages.length} stage(s) within normal CP range. Max CP factor: ${maxCPFactor.toFixed(3)}.`
      : `CP issue detected. Max CP factor: ${maxCPFactor.toFixed(3)}, osmotic amplification: ${maxOsmoticAmplificationBar.toFixed(2)} bar. Review flux and cross-flow conditions.`;

  return {
    stages: stageResults,
    maxCPFactor,
    maxOsmoticAmplificationBar,
    systemStatus,
    systemMessage,
  };
}
