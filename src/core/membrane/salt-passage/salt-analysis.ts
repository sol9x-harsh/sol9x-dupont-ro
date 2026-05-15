import {
  SALT_PASSAGE_NORMAL_MAX_PERCENT,
  SALT_PASSAGE_WARNING_PERCENT,
  SALT_PASSAGE_CRITICAL_PERCENT,
  PERMEATE_TDS_EXCELLENT_MGL,
  PERMEATE_TDS_GOOD_MGL,
  PERMEATE_TDS_ACCEPTABLE_MGL,
  PERMEATE_COND_EXCELLENT_US_CM,
  PERMEATE_COND_GOOD_US_CM,
  PERMEATE_COND_ACCEPTABLE_US_CM,
} from "@/core/membrane/salt-passage/salt.constants";
import {
  calculateSingleStagePermeateQuality,
  calculateMultiStagePermeateQuality,
  calculateBlendedPermeateWithRejection,
  type StageInput,
  type StagePermeateFlowInput,
} from "@/core/membrane/salt-passage/salt-calculation";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PermeateStatus = "normal" | "warning" | "critical";
export type PermeateClassification = "excellent" | "good" | "acceptable" | "poor";

export interface PermeateQualityAnalysis {
  feedTDSMgL: number;
  permeateTDSMgL: number;
  rejectionPercent: number;
  saltPassagePercent: number;
  permeateConductivityUsCm: number;
  status: PermeateStatus;
  classification: PermeateClassification;
  message: string;
}

export interface StageQualityAnalysis {
  stageIndex: number;
  feedTDSMgL: number;
  permeateTDSMgL: number;
  rejectionPercent: number;
  saltPassagePercent: number;
  rejectTDSMgL: number;
  classification: PermeateClassification;
  status: PermeateStatus;
}

export interface SystemQualityResult {
  stages: StageQualityAnalysis[];
  blendedPermeateTDSMgL: number;
  blendedRejectionPercent: number;
  blendedSaltPassagePercent: number;
  systemStatus: PermeateStatus;
  systemMessage: string;
}

// ─── Classification helpers ───────────────────────────────────────────────────

function classifyBySaltPassage(saltPassagePercent: number): PermeateStatus {
  if (!Number.isFinite(saltPassagePercent)) return "critical";
  if (saltPassagePercent > SALT_PASSAGE_CRITICAL_PERCENT) return "critical";
  if (saltPassagePercent > SALT_PASSAGE_WARNING_PERCENT) return "warning";
  return "normal";
}

function classifyByPermeateTDS(permeateTDSMgL: number): PermeateClassification {
  if (permeateTDSMgL < PERMEATE_TDS_EXCELLENT_MGL) return "excellent";
  if (permeateTDSMgL < PERMEATE_TDS_GOOD_MGL) return "good";
  if (permeateTDSMgL < PERMEATE_TDS_ACCEPTABLE_MGL) return "acceptable";
  return "poor";
}

function classifyByConductivity(conductivityUsCm: number): PermeateClassification {
  if (conductivityUsCm < PERMEATE_COND_EXCELLENT_US_CM) return "excellent";
  if (conductivityUsCm < PERMEATE_COND_GOOD_US_CM) return "good";
  if (conductivityUsCm < PERMEATE_COND_ACCEPTABLE_US_CM) return "acceptable";
  return "poor";
}

function resolveClassification(
  tdsBased: PermeateClassification,
  conductivityBased: PermeateClassification
): PermeateClassification {
  const rank: Record<PermeateClassification, number> = {
    excellent: 0,
    good: 1,
    acceptable: 2,
    poor: 3,
  };
  return rank[tdsBased] >= rank[conductivityBased] ? tdsBased : conductivityBased;
}

function buildQualityMessage(
  classification: PermeateClassification,
  status: PermeateStatus,
  permeateTDSMgL: number,
  rejectionPercent: number,
  saltPassagePercent: number
): string {
  const base = `Permeate TDS ${permeateTDSMgL.toFixed(1)} mg/L, rejection ${rejectionPercent.toFixed(2)}%, salt passage ${saltPassagePercent.toFixed(2)}%.`;

  if (status === "critical") {
    if (saltPassagePercent > SALT_PASSAGE_CRITICAL_PERCENT) {
      return `${base} CRITICAL: Excessive salt passage (${saltPassagePercent.toFixed(2)}%) — possible membrane breach or severe fouling. Immediate investigation required.`;
    }
    return `${base} CRITICAL: Poor permeate quality exceeds acceptable threshold.`;
  }

  if (status === "warning") {
    return `${base} WARNING: Elevated salt passage (${saltPassagePercent.toFixed(2)}%) — review membrane condition, operating pressure, and fouling state.`;
  }

  switch (classification) {
    case "excellent":
      return `${base} Excellent product water quality — well within design targets.`;
    case "good":
      return `${base} Good product water quality — within normal operating range.`;
    case "acceptable":
      return `${base} Acceptable product water quality — within limits but monitor for degradation.`;
    default:
      return `${base} Poor product quality — permeate TDS exceeds 500 mg/L. Review rejection performance.`;
  }
}

// ─── Single-stage analysis ────────────────────────────────────────────────────

/**
 * Analyze permeate quality for a single-stage RO system.
 * Returns an invalid result if inputs are out of range.
 */
export function analyzePermeateQuality(
  feedTDSMgL: number,
  rejectionPercent: number
): PermeateQualityAnalysis {
  const result = calculateSingleStagePermeateQuality(feedTDSMgL, rejectionPercent);

  if (!result) {
    return {
      feedTDSMgL,
      permeateTDSMgL: 0,
      rejectionPercent: 0,
      saltPassagePercent: 100,
      permeateConductivityUsCm: 0,
      status: "critical",
      classification: "poor",
      message: "Invalid inputs — feed TDS or rejection percent is missing or out of range.",
    };
  }

  const status = classifyBySaltPassage(result.saltPassagePercent);
  const tdsCls = classifyByPermeateTDS(result.permeateTDSMgL);
  const condCls = classifyByConductivity(result.permeateConductivityUsCm);
  const classification = resolveClassification(tdsCls, condCls);

  return {
    ...result,
    status,
    classification,
    message: buildQualityMessage(
      classification,
      status,
      result.permeateTDSMgL,
      result.rejectionPercent,
      result.saltPassagePercent
    ),
  };
}

// ─── Multi-stage analysis ─────────────────────────────────────────────────────

/**
 * Analyze permeate quality for each stage independently.
 * Concentrate from stage N propagates as feed to stage N+1.
 * Each stage result includes rejection classification and status.
 */
export function analyzeMultiStagePermeateQuality(
  stages: StageInput[]
): SystemQualityResult {
  if (!stages.length) {
    return {
      stages: [],
      blendedPermeateTDSMgL: 0,
      blendedRejectionPercent: 0,
      blendedSaltPassagePercent: 100,
      systemStatus: "critical",
      systemMessage: "No stages provided.",
    };
  }

  const stageResults = calculateMultiStagePermeateQuality(stages);

  const analyzed: StageQualityAnalysis[] = stageResults.map((s) => {
    const status = classifyBySaltPassage(s.saltPassagePercent);
    const classification = classifyByPermeateTDS(s.permeateTDSMgL);
    return { ...s, status, classification };
  });

  // Blended permeate: weight by recovery fraction (proportional to permeate flow)
  const blendInputs: StagePermeateFlowInput[] = stages.map((s, i) => ({
    permeateTDSMgL: stageResults[i]?.permeateTDSMgL ?? 0,
    permeateFlowM3H: s.recoveryFraction,  // proportional weight
  }));

  const blended = calculateBlendedPermeateWithRejection(blendInputs, stages[0].feedTDSMgL);

  const blendedTDS = blended?.blendedPermeateTDSMgL ?? 0;
  const blendedRejection = blended?.blendedRejectionPercent ?? 0;
  const blendedSP = blended?.blendedSaltPassagePercent ?? 100;

  const hasCritical = analyzed.some((s) => s.status === "critical");
  const hasWarning = analyzed.some((s) => s.status === "warning");
  const systemStatus: PermeateStatus = hasCritical ? "critical" : hasWarning ? "warning" : "normal";

  const systemMessage =
    systemStatus === "normal"
      ? `All ${stages.length} stage(s) within acceptable permeate quality. Blended TDS: ${blendedTDS.toFixed(1)} mg/L.`
      : `Permeate quality issue in ${analyzed.filter((s) => s.status !== "normal").length} stage(s). Blended TDS: ${blendedTDS.toFixed(1)} mg/L. Review membrane condition.`;

  return {
    stages: analyzed,
    blendedPermeateTDSMgL: blendedTDS,
    blendedRejectionPercent: blendedRejection,
    blendedSaltPassagePercent: blendedSP,
    systemStatus,
    systemMessage,
  };
}
