import {
  CP_DEFAULT_MASS_TRANSFER_COEFFICIENT_MS,
  CP_LMH_TO_MS,
  CP_MIN_FLUX_LMH,
  CP_MIN_MASS_TRANSFER_MS,
  CP_MAX_COMPUTABLE_EXPONENT,
} from "@/core/hydraulics/concentration-polarization/cp.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CPResult {
  cpFactor: number;
  fluxLMH: number;
  massTransferCoefficientMS: number;
}

export interface MembraneSurfaceConcentrationResult {
  cpFactor: number;
  bulkConcentrationMgL: number;
  membraneSurfaceConcentrationMgL: number;
}

export interface EffectiveOsmoticPressureResult {
  cpFactor: number;
  bulkOsmoticPressureBar: number;
  effectiveOsmoticPressureBar: number;
  osmoticAmplificationBar: number;
}

// ─── Core CP equation ─────────────────────────────────────────────────────────

/**
 * Calculate the concentration polarization factor.
 *   CP = exp(Jw / k)
 *
 * fluxLMH: membrane water flux (L/m²/h)
 * massTransferCoefficientMS: feed-side mass transfer coefficient (m/s)
 *
 * The exponent is clamped to prevent physically unrealistic overflow.
 * Returns null if inputs are invalid.
 */
export function calculateCPFactor(
  fluxLMH: number,
  massTransferCoefficientMS: number = CP_DEFAULT_MASS_TRANSFER_COEFFICIENT_MS
): CPResult | null {
  if (
    !Number.isFinite(fluxLMH) ||
    fluxLMH < CP_MIN_FLUX_LMH ||
    !Number.isFinite(massTransferCoefficientMS) ||
    massTransferCoefficientMS < CP_MIN_MASS_TRANSFER_MS
  ) {
    return null;
  }

  const fluxMS = fluxLMH * CP_LMH_TO_MS;
  const exponent = Math.min(fluxMS / massTransferCoefficientMS, CP_MAX_COMPUTABLE_EXPONENT);
  const cpFactor = Math.exp(exponent);

  return {
    cpFactor,
    fluxLMH,
    massTransferCoefficientMS,
  };
}

/**
 * Calculate membrane surface concentration.
 *   Cm = Cb × CP
 *
 * bulkConcentrationMgL: bulk feed-side TDS or ion concentration (mg/L)
 * Returns null if CP cannot be computed or bulk concentration is invalid.
 */
export function calculateMembraneSurfaceConcentration(
  bulkConcentrationMgL: number,
  fluxLMH: number,
  massTransferCoefficientMS: number = CP_DEFAULT_MASS_TRANSFER_COEFFICIENT_MS
): MembraneSurfaceConcentrationResult | null {
  if (
    !Number.isFinite(bulkConcentrationMgL) ||
    bulkConcentrationMgL < 0
  ) {
    return null;
  }

  const cpResult = calculateCPFactor(fluxLMH, massTransferCoefficientMS);
  if (cpResult === null) return null;

  return {
    cpFactor: cpResult.cpFactor,
    bulkConcentrationMgL,
    membraneSurfaceConcentrationMgL: bulkConcentrationMgL * cpResult.cpFactor,
  };
}

/**
 * Calculate effective osmotic pressure at the membrane surface.
 *   π_eff = π_bulk × CP
 *
 * This amplified osmotic pressure is what the membrane actually experiences.
 * The difference (π_eff − π_bulk) is the osmotic amplification due to CP.
 * Returns null if CP cannot be computed or bulk osmotic pressure is invalid.
 */
export function calculateEffectiveOsmoticPressure(
  bulkOsmoticPressureBar: number,
  fluxLMH: number,
  massTransferCoefficientMS: number = CP_DEFAULT_MASS_TRANSFER_COEFFICIENT_MS
): EffectiveOsmoticPressureResult | null {
  if (
    !Number.isFinite(bulkOsmoticPressureBar) ||
    bulkOsmoticPressureBar < 0
  ) {
    return null;
  }

  const cpResult = calculateCPFactor(fluxLMH, massTransferCoefficientMS);
  if (cpResult === null) return null;

  const effectiveOsmoticPressureBar = bulkOsmoticPressureBar * cpResult.cpFactor;

  return {
    cpFactor: cpResult.cpFactor,
    bulkOsmoticPressureBar,
    effectiveOsmoticPressureBar,
    osmoticAmplificationBar: effectiveOsmoticPressureBar - bulkOsmoticPressureBar,
  };
}
