import {
  RECOVERY_BRACKISH_WARNING_FRACTION,
  RECOVERY_BRACKISH_CRITICAL_FRACTION,
  FLOW_MIN_COMPUTABLE_M3H,
} from "@/core/hydraulics/flow/flow.constants";
import {
  calculateRecovery,
  calculateConcentrateFlow,
  recoveryToPercent,
} from "@/core/hydraulics/flow/recovery";
import {
  calculateConcentrationFactor,
  classifyConcentrationFactorStatus,
} from "@/core/hydraulics/flow/concentration-factor";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecoveryClassification =
  | "low"
  | "normal"
  | "aggressive"
  | "critical"
  | "invalid";

export type FlowStatus = "normal" | "warning" | "critical";

export interface FlowAnalysisResult {
  feedFlowM3h: number;
  permeateFlowM3h: number;
  concentrateFlowM3h: number;
  recoveryFraction: number;
  recoveryPercent: number;
  concentrationFactor: number | null;
  recoveryClassification: RecoveryClassification;
  status: FlowStatus;
  message: string;
}

// ─── Recovery classification ──────────────────────────────────────────────────

export function classifyRecovery(
  recoveryFraction: number
): RecoveryClassification {
  if (!Number.isFinite(recoveryFraction) || recoveryFraction < 0 || recoveryFraction > 1) {
    return "invalid";
  }
  if (recoveryFraction < 0.30) return "low";
  if (recoveryFraction < RECOVERY_BRACKISH_WARNING_FRACTION) return "normal";
  if (recoveryFraction < RECOVERY_BRACKISH_CRITICAL_FRACTION) return "aggressive";
  return "critical";
}

export function classifyFlowStatus(
  recoveryFraction: number,
  concentrationFactor: number | null
): FlowStatus {
  const cfStatus =
    concentrationFactor !== null
      ? classifyConcentrationFactorStatus(concentrationFactor)
      : "normal";

  const recoveryClassification = classifyRecovery(recoveryFraction);

  if (
    recoveryClassification === "critical" ||
    cfStatus === "critical" ||
    recoveryClassification === "invalid"
  ) {
    return "critical";
  }

  if (
    recoveryClassification === "aggressive" ||
    cfStatus === "warning" ||
    recoveryClassification === "low"
  ) {
    return "warning";
  }

  return "normal";
}

// ─── Message builder ──────────────────────────────────────────────────────────

function buildFlowMessage(
  recoveryPercent: number,
  cf: number | null,
  recoveryClassification: RecoveryClassification,
  status: FlowStatus
): string {
  const cfStr = cf !== null ? `, CF = ${cf.toFixed(2)}` : "";

  switch (recoveryClassification) {
    case "invalid":
      return "Invalid flow inputs — recovery cannot be calculated.";
    case "low":
      return `Recovery ${recoveryPercent.toFixed(1)}%${cfStr} is below recommended minimum. Review feed flow and permeate demand.`;
    case "critical":
      return `Recovery ${recoveryPercent.toFixed(1)}%${cfStr} exceeds critical threshold — scaling and fouling risk is high. Reduce recovery or add antiscalant.`;
    case "aggressive":
      return `Recovery ${recoveryPercent.toFixed(1)}%${cfStr} is aggressive — evaluate scaling indices and membrane element limits.`;
    case "normal":
    default: {
      if (status === "warning") {
        return `Recovery ${recoveryPercent.toFixed(1)}%${cfStr} is within normal range but concentration factor warrants review.`;
      }
      return `Recovery ${recoveryPercent.toFixed(1)}%${cfStr} is within normal operating range.`;
    }
  }
}

// ─── Full analysis ────────────────────────────────────────────────────────────

/**
 * Full deterministic flow analysis from feed and permeate flow.
 * Returns all derived hydraulic quantities and engineering classification.
 */
export function analyzeFlows(
  feedFlowM3h: number,
  permeateFlowM3h: number
): FlowAnalysisResult {
  const invalidResult = (): FlowAnalysisResult => ({
    feedFlowM3h,
    permeateFlowM3h,
    concentrateFlowM3h: 0,
    recoveryFraction: 0,
    recoveryPercent: 0,
    concentrationFactor: null,
    recoveryClassification: "invalid",
    status: "critical",
    message: "Invalid flow inputs — feed flow must be a positive finite number.",
  });

  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H ||
    !Number.isFinite(permeateFlowM3h) ||
    permeateFlowM3h < 0
  ) {
    return invalidResult();
  }

  const recoveryFraction = calculateRecovery(feedFlowM3h, permeateFlowM3h) ?? 0;
  const recoveryPercent = recoveryToPercent(recoveryFraction);
  const concentrateFlowM3h = calculateConcentrateFlow(feedFlowM3h, permeateFlowM3h);
  const concentrationFactor = calculateConcentrationFactor(recoveryFraction);
  const recoveryClassification = classifyRecovery(recoveryFraction);
  const status = classifyFlowStatus(recoveryFraction, concentrationFactor);
  const message = buildFlowMessage(
    recoveryPercent,
    concentrationFactor,
    recoveryClassification,
    status
  );

  return {
    feedFlowM3h,
    permeateFlowM3h,
    concentrateFlowM3h,
    recoveryFraction,
    recoveryPercent,
    concentrationFactor,
    recoveryClassification,
    status,
    message,
  };
}

/**
 * Full deterministic flow analysis from feed flow and recovery fraction.
 */
export function analyzeFlowsFromRecovery(
  feedFlowM3h: number,
  recoveryFraction: number
): FlowAnalysisResult {
  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H
  ) {
    return analyzeFlows(feedFlowM3h, 0);
  }

  const permeateFlowM3h = feedFlowM3h * Math.min(Math.max(recoveryFraction, 0), 1);
  return analyzeFlows(feedFlowM3h, permeateFlowM3h);
}
