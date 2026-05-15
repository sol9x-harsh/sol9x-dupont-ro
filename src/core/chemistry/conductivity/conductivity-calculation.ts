import { IONS } from '@/core/constants/ions';
import { safeConcentration } from '@/core/chemistry/conversions/normalization';
import type { IonConcentrationMap } from '@/core/chemistry/balance/charge-balance';
import {
  CONDUCTIVITY_TDS_FACTOR_DEFAULT,
  ION_CONDUCTIVITY_FACTORS,
  CONDUCTIVITY_MIN_COMPUTABLE_US_CM,
  CONDUCTIVITY_CROSS_CHECK_TOLERANCE_PCT,
} from '@/core/chemistry/conductivity/conductivity.constants';

export type ConductivityEstimationMethod = 'tds' | 'ion-weighted' | 'hybrid';

// ─── TDS-based estimation ─────────────────────────────────────────────────────

/**
 * Estimate conductivity from TDS using the standard empirical conversion:
 *   conductivity (µS/cm) ≈ TDS (mg/L) / factor
 *
 * Default factor 0.64 (ASTM D1125 engineering convention).
 * Returns 0 for invalid or non-positive TDS.
 */
export function estimateConductivityFromTDS(
  tdsMgL: number,
  factor: number = CONDUCTIVITY_TDS_FACTOR_DEFAULT,
): number {
  if (!Number.isFinite(tdsMgL) || tdsMgL <= 0) return 0;
  if (!Number.isFinite(factor) || factor <= 0) return 0;
  return tdsMgL / factor;
}

// ─── Ion-weighted estimation ──────────────────────────────────────────────────

/**
 * Estimate conductivity by summing per-ion conductivity contributions:
 *   conductivity (µS/cm) = Σ [ion_i (mg/L) × factor_i (µS/cm per mg/L)]
 *
 * - Unknown ions are skipped.
 * - Neutral species (SiO₂) contribute 0 via their factor.
 * - Invalid/NaN/negative values are treated as zero.
 */
export function estimateConductivityFromIons(
  concentrations: IonConcentrationMap,
): number {
  let totalTDS = 0;
  let total = 0;

  for (const [ionId, raw] of Object.entries(concentrations)) {
    const ion = IONS[ionId as keyof typeof IONS];
    if (!ion) continue;

    const mgL = safeConcentration(raw);
    if (mgL <= 0) continue;

    totalTDS += mgL;

    const factor = ION_CONDUCTIVITY_FACTORS[ionId];
    if (factor === undefined || !Number.isFinite(factor)) continue;

    total += mgL * factor;
  }

  // Ionic-strength correction: λ° values are at infinite dilution; at seawater
  // concentrations (~0.7 mol/L) the actual conductivity is ~25-30% lower.
  // I_proxy (mol/L) ≈ TDS(mg/L) / 40,000 (empirical average equivalent weight)
  // Onsager-like attenuation: 1 / (1 + 0.40 × √I)
  const iProxy = totalTDS / 40_000;
  const attenuation = 1 / (1 + 0.4 * Math.sqrt(iProxy));

  return total * attenuation;
}

// ─── Hybrid estimation ────────────────────────────────────────────────────────

/**
 * Hybrid estimate: average of TDS-based and ion-weighted estimates.
 * Useful when both a measured TDS and an ion breakdown are available.
 * Degrades gracefully if one method returns zero.
 */
export function estimateConductivityHybrid(
  tdsMgL: number,
  concentrations: IonConcentrationMap,
  factor: number = CONDUCTIVITY_TDS_FACTOR_DEFAULT,
): number {
  const fromTDS = estimateConductivityFromTDS(tdsMgL, factor);
  const fromIons = estimateConductivityFromIons(concentrations);

  if (fromTDS <= 0 && fromIons <= 0) return 0;
  if (fromTDS <= 0) return fromIons;
  if (fromIons <= 0) return fromTDS;

  return (fromTDS + fromIons) / 2;
}

// ─── Cross-check ──────────────────────────────────────────────────────────────

/**
 * Cross-check two conductivity estimates (e.g. TDS-based vs ion-weighted).
 * Returns deviation percent and whether it falls within the tolerance threshold.
 *
 * Formula: deviation% = |a - b| / ((a + b) / 2) × 100
 */
export function crossCheckConductivity(
  estimateA: number,
  estimateB: number,
  tolerancePct: number = CONDUCTIVITY_CROSS_CHECK_TOLERANCE_PCT,
): { deviationPct: number; isWithinTolerance: boolean } {
  const avg = (estimateA + estimateB) / 2;

  if (!Number.isFinite(avg) || avg < CONDUCTIVITY_MIN_COMPUTABLE_US_CM) {
    return { deviationPct: 0, isWithinTolerance: true };
  }

  const deviationPct = (Math.abs(estimateA - estimateB) / avg) * 100;

  return {
    deviationPct,
    isWithinTolerance: deviationPct <= tolerancePct,
  };
}
