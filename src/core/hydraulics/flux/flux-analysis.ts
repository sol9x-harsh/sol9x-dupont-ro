import { m3hToGpm } from "@/core/units/flow";
import {
  FLUX_LOW_THRESHOLD_LMH,
  FLUX_AGGRESSIVE_THRESHOLD_LMH,
  FLUX_CRITICAL_THRESHOLD_LMH,
  FLUX_DEFAULT_PERMEABILITY_A_BWRO,
  FLUX_STANDARD_ELEMENT_AREA_M2,
  FLUX_DEFAULT_ELEMENTS_PER_VESSEL,
  FLUX_MIN_COMPUTABLE_LMH,
  FLUX_MIN_AREA_M2,
} from "@/core/hydraulics/flux/flux.constants";
import {
  calculateFlux,
  calculatePermeateFlowFromFlux,
  calculateStageProductivity,
  lmhToGfd,
  type StageProductivity,
} from "@/core/hydraulics/flux/flux-calculation";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FluxStatus = "invalid" | "normal" | "warning" | "critical";
export type FluxClassification = "low" | "normal" | "aggressive" | "critical";

export interface FluxAnalysisResult {
  fluxLMH: number;
  fluxGFD: number;
  permeateFlowM3H: number;
  permeateFlowGPM: number;
  membraneAreaM2: number;
  status: FluxStatus;
  classification: FluxClassification;
  message: string;
}

export interface StageFluxAnalysis {
  stageIndex: number;
  vesselCount: number;
  elementCount: number;
  stageAreaM2: number;
  fluxLMH: number;
  fluxGFD: number;
  permeateFlowM3H: number;
  permeateFlowGPM: number;
  status: FluxStatus;
  classification: FluxClassification;
  message: string;
}

export interface SystemFluxResult {
  stages: StageFluxAnalysis[];
  totalPermeateFlowM3H: number;
  totalPermeateFlowGPM: number;
  totalMembraneAreaM2: number;
  systemStatus: FluxStatus;
  systemMessage: string;
}

// ─── Classification helpers ───────────────────────────────────────────────────

function classifyFlux(fluxLMH: number): FluxClassification {
  if (fluxLMH < FLUX_LOW_THRESHOLD_LMH) return "low";
  if (fluxLMH < FLUX_AGGRESSIVE_THRESHOLD_LMH) return "normal";
  if (fluxLMH < FLUX_CRITICAL_THRESHOLD_LMH) return "aggressive";
  return "critical";
}

function classifyFluxStatus(fluxLMH: number): FluxStatus {
  if (fluxLMH < FLUX_MIN_COMPUTABLE_LMH) return "invalid";
  if (fluxLMH < FLUX_LOW_THRESHOLD_LMH) return "warning";
  if (fluxLMH >= FLUX_CRITICAL_THRESHOLD_LMH) return "critical";
  if (fluxLMH >= FLUX_AGGRESSIVE_THRESHOLD_LMH) return "warning";
  return "normal";
}

function buildFluxMessage(classification: FluxClassification, fluxLMH: number): string {
  switch (classification) {
    case "low":
      return `Flux ${fluxLMH.toFixed(1)} LMH is below minimum design range. Increase NDP or verify membrane permeability.`;
    case "normal":
      return `Flux ${fluxLMH.toFixed(1)} LMH is within normal operating range.`;
    case "aggressive":
      return `Flux ${fluxLMH.toFixed(1)} LMH is aggressive — elevated fouling risk. Review operating pressure and cleaning frequency.`;
    case "critical":
      return `Flux ${fluxLMH.toFixed(1)} LMH exceeds critical threshold — membrane compaction and accelerated fouling likely. Reduce operating flux.`;
  }
}

// ─── Single-point flux analysis ───────────────────────────────────────────────

/**
 * Analyze flux at a single operating point.
 * Calculates flux from NDP and permeate flow from membrane area, then classifies.
 */
export function analyzeFlux(
  ndpBar: number,
  membraneAreaM2: number,
  permeabilityA: number = FLUX_DEFAULT_PERMEABILITY_A_BWRO
): FluxAnalysisResult {
  const fluxLMH = calculateFlux(ndpBar, permeabilityA);

  if (fluxLMH === null) {
    return {
      fluxLMH: 0,
      fluxGFD: 0,
      permeateFlowM3H: 0,
      permeateFlowGPM: 0,
      membraneAreaM2: 0,
      status: "invalid",
      classification: "low",
      message: "Invalid inputs — NDP must be positive and permeability A must be greater than zero.",
    };
  }

  const productivityResult = calculatePermeateFlowFromFlux(fluxLMH, membraneAreaM2);

  if (productivityResult === null) {
    return {
      fluxLMH,
      fluxGFD: lmhToGfd(fluxLMH),
      permeateFlowM3H: 0,
      permeateFlowGPM: 0,
      membraneAreaM2: 0,
      status: "invalid",
      classification: classifyFlux(fluxLMH),
      message: "Invalid membrane area — cannot compute permeate flow.",
    };
  }

  const classification = classifyFlux(fluxLMH);
  const status = classifyFluxStatus(fluxLMH);

  return {
    fluxLMH,
    fluxGFD: lmhToGfd(fluxLMH),
    permeateFlowM3H: productivityResult.permeateFlowM3H,
    permeateFlowGPM: productivityResult.permeateFlowGPM,
    membraneAreaM2,
    status,
    classification,
    message: buildFluxMessage(classification, fluxLMH),
  };
}

// ─── Multi-stage flux analysis ────────────────────────────────────────────────

export interface StageFluxInput {
  ndpBar: number;
  vesselCount: number;
  vesselElementCount?: number;
  elementAreaM2?: number;
  permeabilityA?: number;
}

/**
 * Analyze flux and productivity across multiple stages.
 * Each stage is analyzed independently — no iterative coupling.
 * Osmotic pressure rise and concentration effects are not modeled here.
 */
export function analyzeMultiStageFlux(stages: StageFluxInput[]): SystemFluxResult {
  if (!stages.length) {
    return {
      stages: [],
      totalPermeateFlowM3H: 0,
      totalPermeateFlowGPM: 0,
      totalMembraneAreaM2: 0,
      systemStatus: "invalid",
      systemMessage: "No stages provided.",
    };
  }

  const stageResults: StageFluxAnalysis[] = stages.map((s, i) => {
    const permeabilityA = s.permeabilityA ?? FLUX_DEFAULT_PERMEABILITY_A_BWRO;
    const elementAreaM2 = s.elementAreaM2 ?? FLUX_STANDARD_ELEMENT_AREA_M2;
    const vesselElementCount = s.vesselElementCount ?? FLUX_DEFAULT_ELEMENTS_PER_VESSEL;

    const fluxLMH = calculateFlux(s.ndpBar, permeabilityA);

    if (fluxLMH === null) {
      return {
        stageIndex: i + 1,
        vesselCount: s.vesselCount,
        elementCount: 0,
        stageAreaM2: 0,
        fluxLMH: 0,
        fluxGFD: 0,
        permeateFlowM3H: 0,
        permeateFlowGPM: 0,
        status: "invalid" as FluxStatus,
        classification: "low" as FluxClassification,
        message: `Stage ${i + 1}: invalid NDP or permeability — cannot calculate flux.`,
      };
    }

    const productivity: StageProductivity | null = calculateStageProductivity(
      fluxLMH,
      s.vesselCount,
      vesselElementCount,
      elementAreaM2
    );

    if (productivity === null) {
      return {
        stageIndex: i + 1,
        vesselCount: s.vesselCount,
        elementCount: 0,
        stageAreaM2: 0,
        fluxLMH,
        fluxGFD: lmhToGfd(fluxLMH),
        permeateFlowM3H: 0,
        permeateFlowGPM: 0,
        status: "invalid" as FluxStatus,
        classification: classifyFlux(fluxLMH),
        message: `Stage ${i + 1}: invalid vessel configuration.`,
      };
    }

    const classification = classifyFlux(fluxLMH);
    const status = classifyFluxStatus(fluxLMH);

    return {
      stageIndex: i + 1,
      vesselCount: productivity.vesselCount,
      elementCount: productivity.elementCount,
      stageAreaM2: productivity.stageAreaM2,
      fluxLMH,
      fluxGFD: lmhToGfd(fluxLMH),
      permeateFlowM3H: productivity.permeateFlowM3H,
      permeateFlowGPM: productivity.permeateFlowGPM,
      status,
      classification,
      message: buildFluxMessage(classification, fluxLMH),
    };
  });

  const totalPermeateFlowM3H = stageResults.reduce((sum, s) => sum + s.permeateFlowM3H, 0);
  const totalMembraneAreaM2 = stageResults.reduce((sum, s) => sum + s.stageAreaM2, 0);

  const hasInvalid = stageResults.some((s) => s.status === "invalid");
  const hasCritical = stageResults.some((s) => s.status === "critical");
  const hasWarning = stageResults.some((s) => s.status === "warning");

  let systemStatus: FluxStatus = "normal";
  if (hasInvalid) systemStatus = "invalid";
  else if (hasCritical) systemStatus = "critical";
  else if (hasWarning) systemStatus = "warning";

  const systemMessage =
    systemStatus === "normal"
      ? `All ${stages.length} stage(s) within normal flux range. Total permeate: ${totalPermeateFlowM3H.toFixed(2)} m³/h.`
      : `System flux issue detected. Total permeate: ${totalPermeateFlowM3H.toFixed(2)} m³/h. Review stage operating conditions.`;

  return {
    stages: stageResults,
    totalPermeateFlowM3H,
    totalPermeateFlowGPM: m3hToGpm(totalPermeateFlowM3H),
    totalMembraneAreaM2,
    systemStatus,
    systemMessage,
  };
}
