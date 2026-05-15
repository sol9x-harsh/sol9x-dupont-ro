import {
  RECOVERY_MAX_FRACTION,
  FLOW_MIN_COMPUTABLE_M3H,
  CONCENTRATION_FACTOR_WARNING,
  CONCENTRATION_FACTOR_CRITICAL,
} from "@/core/hydraulics/flow/flow.constants";

export type ConcentrationFactorStatus = "normal" | "warning" | "critical";

export interface ConcentrationFactorResult {
  concentrationFactor: number;
  status: ConcentrationFactorStatus;
  message: string;
}

// ─── Concentration factor calculation ────────────────────────────────────────

/**
 * Calculate concentration factor from recovery fraction.
 *   CF = 1 / (1 − r)
 *
 * Returns null for invalid or boundary recovery values (r ≥ 1 causes divide-by-zero).
 */
export function calculateConcentrationFactor(
  recoveryFraction: number
): number | null {
  if (
    !Number.isFinite(recoveryFraction) ||
    recoveryFraction < 0 ||
    recoveryFraction >= RECOVERY_MAX_FRACTION
  ) {
    return null;
  }

  return 1 / (1 - recoveryFraction);
}

/**
 * Calculate concentration factor from recovery percentage.
 *   CF = 1 / (1 − r/100)
 */
export function calculateConcentrationFactorFromPercent(
  recoveryPercent: number
): number | null {
  if (
    !Number.isFinite(recoveryPercent) ||
    recoveryPercent < 0 ||
    recoveryPercent >= 100
  ) {
    return null;
  }

  return calculateConcentrationFactor(recoveryPercent / 100);
}

/**
 * Calculate concentrate TDS from feed TDS and concentration factor.
 *   TDS_c = TDS_f × CF
 */
export function calculateConcentrateTDS(
  feedTdsMgL: number,
  concentrationFactor: number
): number | null {
  if (
    !Number.isFinite(feedTdsMgL) ||
    feedTdsMgL < 0 ||
    !Number.isFinite(concentrationFactor) ||
    concentrationFactor < 1
  ) {
    return null;
  }

  return feedTdsMgL * concentrationFactor;
}

/**
 * Estimate permeate flow recovery from feed and concentrate flows.
 *   Qp = Qf − Qc  →  r = Qp / Qf
 */
export function concentrationFactorToRecovery(cf: number): number | null {
  if (!Number.isFinite(cf) || cf <= 1) return null;
  return 1 - 1 / cf;
}

// ─── Status classification ────────────────────────────────────────────────────

export function classifyConcentrationFactorStatus(
  cf: number
): ConcentrationFactorStatus {
  if (cf >= CONCENTRATION_FACTOR_CRITICAL) return "critical";
  if (cf >= CONCENTRATION_FACTOR_WARNING) return "warning";
  return "normal";
}

// ─── Full analysis ────────────────────────────────────────────────────────────

/**
 * Calculate and classify concentration factor from recovery fraction.
 * Returns null if recovery is invalid.
 */
export function analyzeConcentrationFactor(
  recoveryFraction: number
): ConcentrationFactorResult | null {
  const cf = calculateConcentrationFactor(recoveryFraction);
  if (cf === null) return null;

  const status = classifyConcentrationFactorStatus(cf);

  let message: string;
  if (status === "critical") {
    message = `Concentration factor ${cf.toFixed(2)} exceeds critical limit — high scaling and fouling risk. Review recovery target.`;
  } else if (status === "warning") {
    message = `Concentration factor ${cf.toFixed(2)} is elevated — evaluate scaling indices before finalizing recovery.`;
  } else {
    message = `Concentration factor ${cf.toFixed(2)} is within normal operating range.`;
  }

  return { concentrationFactor: cf, status, message };
}
