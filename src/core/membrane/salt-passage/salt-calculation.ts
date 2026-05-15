import {
  SALT_REJECTION_MAX_PERCENT,
  SALT_REJECTION_MIN_PERCENT,
  CONCENTRATION_MIN_MGL,
  PERMEATE_CONDUCTIVITY_FACTOR,
} from "@/core/membrane/salt-passage/salt.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RejectionResult {
  rejectionPercent: number;
  saltPassagePercent: number;
  feedConcentrationMgL: number;
  permeateConcentrationMgL: number;
}

export interface PermeateQualityResult {
  feedTDSMgL: number;
  permeateTDSMgL: number;
  rejectionPercent: number;
  saltPassagePercent: number;
  permeateConductivityUsCm: number;
}

export interface StagePermeateResult {
  stageIndex: number;
  feedTDSMgL: number;
  permeateTDSMgL: number;
  rejectionPercent: number;
  saltPassagePercent: number;
  rejectTDSMgL: number;
}

export interface BlendedPermeateResult {
  blendedPermeateTDSMgL: number;
  blendedRejectionPercent: number;
  blendedSaltPassagePercent: number;
  totalPermeateFlowM3H: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clampRejection(r: number): number {
  return Math.min(SALT_REJECTION_MAX_PERCENT, Math.max(SALT_REJECTION_MIN_PERCENT, r));
}

function isValidConcentration(c: number): boolean {
  return Number.isFinite(c) && c >= CONCENTRATION_MIN_MGL;
}

// ─── Core rejection equations ─────────────────────────────────────────────────

/**
 * Calculate salt rejection from feed and permeate concentrations.
 *   R = (1 − Cp / Cf) × 100
 *
 * Returns null if inputs are invalid or Cf is zero.
 */
export function calculateSaltRejection(
  feedConcentrationMgL: number,
  permeateConcentrationMgL: number
): RejectionResult | null {
  if (
    !isValidConcentration(feedConcentrationMgL) ||
    !isValidConcentration(permeateConcentrationMgL) ||
    feedConcentrationMgL < 1
  ) {
    return null;
  }

  const rawRejection = (1 - permeateConcentrationMgL / feedConcentrationMgL) * 100;
  const rejectionPercent = clampRejection(rawRejection);
  const saltPassagePercent = 100 - rejectionPercent;

  return {
    rejectionPercent,
    saltPassagePercent,
    feedConcentrationMgL,
    permeateConcentrationMgL: clampRejection(permeateConcentrationMgL),
  };
}

/**
 * Calculate salt passage from rejection.
 *   SP = 100 − R
 */
export function calculateSaltPassage(rejectionPercent: number): number | null {
  if (!Number.isFinite(rejectionPercent)) return null;
  return 100 - clampRejection(rejectionPercent);
}

/**
 * Calculate permeate TDS from feed TDS and rejection.
 *   Cp = Cf × (1 − R / 100)
 *
 * Returns null if inputs are invalid.
 */
export function calculatePermeateTDS(
  feedTDSMgL: number,
  rejectionPercent: number
): number | null {
  if (
    !isValidConcentration(feedTDSMgL) ||
    !Number.isFinite(rejectionPercent)
  ) {
    return null;
  }

  const r = clampRejection(rejectionPercent);
  return feedTDSMgL * (1 - r / 100);
}

/**
 * Estimate permeate conductivity from permeate TDS.
 *   Conductivity ≈ TDS / factor (µS/cm)
 *
 * Uses a fixed empirical factor for dilute permeate streams.
 * Returns null if permeateTDSMgL is invalid.
 */
export function calculatePermeateConductivity(permeateTDSMgL: number): number | null {
  if (!isValidConcentration(permeateTDSMgL)) return null;
  return permeateTDSMgL / PERMEATE_CONDUCTIVITY_FACTOR;
}

// ─── Full permeate quality ─────────────────────────────────────────────────────

/**
 * Calculate complete single-stage permeate quality from feed TDS and rejection.
 * Returns null if any input is invalid.
 */
export function calculateSingleStagePermeateQuality(
  feedTDSMgL: number,
  rejectionPercent: number
): PermeateQualityResult | null {
  const permeateTDS = calculatePermeateTDS(feedTDSMgL, rejectionPercent);
  if (permeateTDS === null) return null;

  const conductivity = calculatePermeateConductivity(permeateTDS);
  if (conductivity === null) return null;

  const r = clampRejection(rejectionPercent);

  return {
    feedTDSMgL,
    permeateTDSMgL: permeateTDS,
    rejectionPercent: r,
    saltPassagePercent: 100 - r,
    permeateConductivityUsCm: conductivity,
  };
}

// ─── Multi-stage permeate quality ─────────────────────────────────────────────

export interface StageInput {
  stageIndex: number;
  feedTDSMgL: number;
  rejectionPercent: number;
  recoveryFraction: number;  // Qp / Qf for this stage, used in blending
}

/**
 * Propagate feed TDS through multiple stages.
 * Concentrate of stage N (rejectTDS = feedTDS × CF) becomes feed of stage N+1.
 * CF = 1 / (1 − recovery).
 *
 * rejectionPercent is the same for all stages unless overridden per stage.
 */
export function calculateMultiStagePermeateQuality(
  stages: StageInput[]
): StagePermeateResult[] {
  if (!stages.length) return [];

  const results: StagePermeateResult[] = [];

  for (const stage of stages) {
    const { stageIndex, feedTDSMgL, rejectionPercent, recoveryFraction } = stage;

    if (
      !isValidConcentration(feedTDSMgL) ||
      !Number.isFinite(rejectionPercent) ||
      !Number.isFinite(recoveryFraction) ||
      recoveryFraction <= 0 ||
      recoveryFraction >= 1
    ) {
      results.push({
        stageIndex,
        feedTDSMgL: feedTDSMgL,
        permeateTDSMgL: 0,
        rejectionPercent: 0,
        saltPassagePercent: 100,
        rejectTDSMgL: feedTDSMgL,
      });
      continue;
    }

    const r = clampRejection(rejectionPercent);
    const permeateTDS = feedTDSMgL * (1 - r / 100);
    const cf = 1 / (1 - recoveryFraction);
    const rejectTDS = feedTDSMgL * cf;

    results.push({
      stageIndex,
      feedTDSMgL,
      permeateTDSMgL: permeateTDS,
      rejectionPercent: r,
      saltPassagePercent: 100 - r,
      rejectTDSMgL: rejectTDS,
    });
  }

  return results;
}

// ─── Blended permeate quality ─────────────────────────────────────────────────

export interface StagePermeateFlowInput {
  permeateTDSMgL: number;
  permeateFlowM3H: number;
}

/**
 * Calculate flow-weighted blended permeate quality across multiple stages.
 * Uses volumetric weighted average: TDS_blend = Σ(TDS_i × Q_i) / Σ(Q_i)
 *
 * Returns null if no valid stages or total flow is zero.
 */
export function calculateBlendedPermeateQuality(
  stages: StagePermeateFlowInput[]
): BlendedPermeateResult | null {
  const valid = stages.filter(
    (s) =>
      isValidConcentration(s.permeateTDSMgL) &&
      Number.isFinite(s.permeateFlowM3H) &&
      s.permeateFlowM3H > 0
  );

  if (!valid.length) return null;

  const totalFlow = valid.reduce((sum, s) => sum + s.permeateFlowM3H, 0);
  if (totalFlow <= 0) return null;

  const blendedTDS =
    valid.reduce((sum, s) => sum + s.permeateTDSMgL * s.permeateFlowM3H, 0) / totalFlow;

  return {
    blendedPermeateTDSMgL: blendedTDS,
    blendedRejectionPercent: NaN,  // requires feed TDS — not available here
    blendedSaltPassagePercent: NaN,
    totalPermeateFlowM3H: totalFlow,
  };
}

/**
 * Calculate flow-weighted blended permeate quality with feed TDS context.
 * Allows rejection and salt passage to be reported for the blended stream.
 */
export function calculateBlendedPermeateWithRejection(
  stages: StagePermeateFlowInput[],
  feedTDSMgL: number
): BlendedPermeateResult | null {
  const base = calculateBlendedPermeateQuality(stages);
  if (!base || !isValidConcentration(feedTDSMgL) || feedTDSMgL < 1) return base;

  const rejResult = calculateSaltRejection(feedTDSMgL, base.blendedPermeateTDSMgL);
  if (!rejResult) return base;

  return {
    ...base,
    blendedRejectionPercent: rejResult.rejectionPercent,
    blendedSaltPassagePercent: rejResult.saltPassagePercent,
  };
}

// ─── Concentrate TDS rise ─────────────────────────────────────────────────────

/**
 * Calculate reject (concentrate) TDS from feed TDS and recovery.
 *   TDS_reject = TDS_feed × CF = TDS_feed / (1 − recovery)
 *
 * Returns null if recovery is invalid or would cause divide-by-zero.
 */
export function calculateConcentrateTDS(
  feedTDSMgL: number,
  recoveryFraction: number
): number | null {
  if (
    !isValidConcentration(feedTDSMgL) ||
    !Number.isFinite(recoveryFraction) ||
    recoveryFraction <= 0 ||
    recoveryFraction >= 1
  ) {
    return null;
  }
  return feedTDSMgL / (1 - recoveryFraction);
}
