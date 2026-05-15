import { FLOW_MIN_COMPUTABLE_M3H } from "@/core/hydraulics/flow/flow.constants";
import {
  calculatePermeateFlow,
  calculateConcentrateFlowFromRecovery,
} from "@/core/hydraulics/flow/recovery";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StageFlows {
  stageIndex: number;    // 0-based
  feedFlowM3h: number;
  permeateFlowM3h: number;
  concentrateFlowM3h: number;
  recoveryFraction: number;
}

export interface SystemFlows {
  feedFlowM3h: number;
  totalPermeateFlowM3h: number;
  concentrateFlowM3h: number;
  systemRecoveryFraction: number;
  stages: StageFlows[];
}

// ─── Single-stage flow propagation ───────────────────────────────────────────

/**
 * Propagate flows through a single RO stage given feed flow and stage recovery.
 * Returns null if inputs are invalid.
 */
export function propagateSingleStage(
  feedFlowM3h: number,
  stageRecoveryFraction: number,
  stageIndex: number = 0
): StageFlows | null {
  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H ||
    !Number.isFinite(stageRecoveryFraction) ||
    stageRecoveryFraction < 0 ||
    stageRecoveryFraction >= 1
  ) {
    return null;
  }

  const permeateFlowM3h = calculatePermeateFlow(feedFlowM3h, stageRecoveryFraction);
  const concentrateFlowM3h = calculateConcentrateFlowFromRecovery(feedFlowM3h, stageRecoveryFraction);

  return {
    stageIndex,
    feedFlowM3h,
    permeateFlowM3h,
    concentrateFlowM3h,
    recoveryFraction: stageRecoveryFraction,
  };
}

// ─── Multi-stage flow propagation ────────────────────────────────────────────

/**
 * Propagate flows through multiple RO stages in series.
 *
 * In a series arrangement the concentrate of stage N becomes the feed of stage N+1.
 * Each stage operates at its own per-stage recovery fraction.
 *
 * Returns null if feed flow or recovery array are invalid.
 * Stages with invalid recovery are skipped (treated as pass-through).
 */
export function propagateMultiStage(
  feedFlowM3h: number,
  stageRecoveryFractions: number[]
): SystemFlows | null {
  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H ||
    !Array.isArray(stageRecoveryFractions) ||
    stageRecoveryFractions.length === 0
  ) {
    return null;
  }

  const stages: StageFlows[] = [];
  let currentFeedFlow = feedFlowM3h;
  let totalPermeate = 0;

  for (let i = 0; i < stageRecoveryFractions.length; i++) {
    const r = stageRecoveryFractions[i];

    const stage = propagateSingleStage(currentFeedFlow, r, i);
    if (stage === null) continue; // skip invalid stage, feed passes through unchanged

    stages.push(stage);
    totalPermeate += stage.permeateFlowM3h;
    currentFeedFlow = stage.concentrateFlowM3h;
  }

  const concentrateFlowM3h = currentFeedFlow;
  const systemRecoveryFraction =
    feedFlowM3h >= FLOW_MIN_COMPUTABLE_M3H
      ? Math.min(totalPermeate / feedFlowM3h, 1)
      : 0;

  return {
    feedFlowM3h,
    totalPermeateFlowM3h: totalPermeate,
    concentrateFlowM3h,
    systemRecoveryFraction,
    stages,
  };
}

// ─── Flow balance check ───────────────────────────────────────────────────────

/**
 * Verify that Qf ≈ Qp + Qc within tolerance.
 * Returns true if the flow balance closes within the given fractional tolerance.
 */
export function checkFlowBalance(
  feedFlowM3h: number,
  permeateFlowM3h: number,
  concentrateFlowM3h: number,
  toleranceFraction: number = 0.001
): boolean {
  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H
  ) {
    return false;
  }

  const sum = permeateFlowM3h + concentrateFlowM3h;
  const deviation = Math.abs(feedFlowM3h - sum) / feedFlowM3h;
  return deviation <= toleranceFraction;
}
