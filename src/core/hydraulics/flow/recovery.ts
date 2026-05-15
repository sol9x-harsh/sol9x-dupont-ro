import {
  RECOVERY_MIN_FRACTION,
  RECOVERY_MAX_FRACTION,
  FLOW_MIN_COMPUTABLE_M3H,
} from "@/core/hydraulics/flow/flow.constants";

// ─── Recovery calculation ─────────────────────────────────────────────────────

/**
 * Calculate system recovery as a decimal fraction.
 *   r = Qp / Qf
 *
 * Returns null for invalid inputs (zero/negative/NaN feed flow).
 * Clamps result to [0, 1].
 */
export function calculateRecovery(
  feedFlowM3h: number,
  permeateFlowM3h: number
): number | null {
  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H ||
    !Number.isFinite(permeateFlowM3h) ||
    permeateFlowM3h < 0
  ) {
    return null;
  }

  const r = permeateFlowM3h / feedFlowM3h;
  return Math.min(Math.max(r, 0), RECOVERY_MAX_FRACTION);
}

/**
 * Convert recovery fraction to percentage.
 * e.g. 0.75 → 75.0
 */
export function recoveryToPercent(recoveryFraction: number): number {
  return recoveryFraction * 100;
}

/**
 * Convert recovery percentage to fraction.
 * e.g. 75.0 → 0.75
 */
export function recoveryToFraction(recoveryPercent: number): number {
  return recoveryPercent / 100;
}

// ─── Permeate flow ────────────────────────────────────────────────────────────

/**
 * Calculate permeate flow from feed flow and recovery fraction.
 *   Qp = Qf × r
 *
 * Returns 0 for invalid inputs.
 */
export function calculatePermeateFlow(
  feedFlowM3h: number,
  recoveryFraction: number
): number {
  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H ||
    !Number.isFinite(recoveryFraction) ||
    recoveryFraction < 0 ||
    recoveryFraction > RECOVERY_MAX_FRACTION
  ) {
    return 0;
  }

  return feedFlowM3h * recoveryFraction;
}

// ─── Concentrate flow ─────────────────────────────────────────────────────────

/**
 * Calculate concentrate (reject) flow.
 *   Qc = Qf − Qp
 *
 * Returns 0 if result would be negative (guards against rounding edge cases).
 */
export function calculateConcentrateFlow(
  feedFlowM3h: number,
  permeateFlowM3h: number
): number {
  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H ||
    !Number.isFinite(permeateFlowM3h) ||
    permeateFlowM3h < 0
  ) {
    return 0;
  }

  return Math.max(feedFlowM3h - permeateFlowM3h, 0);
}

/**
 * Calculate concentrate flow directly from feed flow and recovery fraction.
 *   Qc = Qf × (1 − r)
 */
export function calculateConcentrateFlowFromRecovery(
  feedFlowM3h: number,
  recoveryFraction: number
): number {
  if (
    !Number.isFinite(feedFlowM3h) ||
    feedFlowM3h < FLOW_MIN_COMPUTABLE_M3H ||
    !Number.isFinite(recoveryFraction) ||
    recoveryFraction < 0 ||
    recoveryFraction >= RECOVERY_MAX_FRACTION
  ) {
    return 0;
  }

  return feedFlowM3h * (1 - recoveryFraction);
}

// ─── Recovery validation ──────────────────────────────────────────────────────

/**
 * Check whether a recovery fraction falls within physically valid bounds.
 */
export function isValidRecovery(recoveryFraction: number): boolean {
  return (
    Number.isFinite(recoveryFraction) &&
    recoveryFraction >= RECOVERY_MIN_FRACTION &&
    recoveryFraction < RECOVERY_MAX_FRACTION
  );
}
