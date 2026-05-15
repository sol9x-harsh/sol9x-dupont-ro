import { safeConcentration } from '@/core/chemistry/conversions/normalization';
import {
  TDS_MIN_COMPUTABLE_MG_L,
  TDS_EXCLUDED_SPECIES,
} from '@/core/chemistry/tds/tds.constants';

// Same shape as IonConcentrationMap in charge-balance — defined locally to avoid circular imports
type IonConcentrationMap = Partial<Record<string, number | null | undefined>>;

/**
 * Calculate TDS as the sum of all valid dissolved ion concentrations (mg/L).
 *
 * - Ionic species (cations + anions) are included.
 * - Neutral dissolved species (e.g. SiO₂) are included — they contribute to TDS.
 * - Unknown ion IDs are skipped silently.
 * - Invalid, NaN, null, undefined, and negative values are treated as zero.
 *
 * Formula: TDS = Σ [ion_i] (mg/L) for all valid ions
 */
export function calculateTDS(concentrations: IonConcentrationMap): number {
  let total = 0;

  for (const [ionId, raw] of Object.entries(concentrations)) {
    if (TDS_EXCLUDED_SPECIES.has(ionId)) continue;
    const mgL = safeConcentration(raw);
    if (mgL <= 0) continue;
    total += mgL;
  }

  return total;
}

/**
 * Calculate TDS from a pre-normalized concentration map (all values already safe).
 * Skips the safeConcentration guard — use only with output of normalizeConcentrations().
 */
export function calculateTDSFromNormalized(
  concentrations: Record<string, number>,
): number {
  let total = 0;

  for (const [ionId, mgL] of Object.entries(concentrations)) {
    if (TDS_EXCLUDED_SPECIES.has(ionId)) continue;
    if (mgL <= 0) continue;
    total += mgL;
  }

  return total;
}

/**
 * Validate a measured TDS value against the ion-summed TDS.
 * Returns the deviation percent and a boolean indicating whether it is within tolerance.
 *
 * Formula: deviation% = |measured - calculated| / measured × 100
 */
export function crossCheckTDS(
  calculatedTDS: number,
  measuredTDS: number,
  tolerancePct: number,
): { deviationPct: number; isWithinTolerance: boolean } {
  if (
    !Number.isFinite(measuredTDS) ||
    measuredTDS < TDS_MIN_COMPUTABLE_MG_L ||
    !Number.isFinite(calculatedTDS)
  ) {
    return { deviationPct: 0, isWithinTolerance: true };
  }

  const deviationPct =
    (Math.abs(measuredTDS - calculatedTDS) / measuredTDS) * 100;

  return {
    deviationPct,
    isWithinTolerance: deviationPct <= tolerancePct,
  };
}
