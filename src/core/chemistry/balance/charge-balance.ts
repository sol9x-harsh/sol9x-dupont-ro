import { IONS } from "@/core/constants/ions";
import { mgLToMeqL } from "@/core/chemistry/conversions/meq";
import { safeConcentration } from "@/core/chemistry/conversions/normalization";
import { BALANCE_MIN_TOTAL_MEQ_L } from "@/core/chemistry/balance/balance.constants";

export type IonConcentrationMap = Partial<Record<string, number | null | undefined>>;

export interface ChargeBalanceResult {
  cationTotalMeq: number;
  anionTotalMeq: number;
  /** |(cations - anions)| / ((cations + anions) / 2) × 100 */
  imbalancePercent: number;
  /** true when total meq/L is sufficient and imbalance is within valid threshold */
  isComputable: boolean;
}

/**
 * Sum meq/L for all cations in the concentration map.
 * Skips neutral species, unknown ions, and zero/invalid values.
 */
export function totalCationMeq(concentrations: IonConcentrationMap): number {
  let total = 0;

  for (const [ionId, raw] of Object.entries(concentrations)) {
    const ion = IONS[ionId as keyof typeof IONS];
    if (!ion || ion.valence <= 0) continue; // skip anions, neutrals, unknowns

    const mgL = safeConcentration(raw);
    if (mgL <= 0) continue;

    try {
      const meq = mgLToMeqL(ionId, mgL);
      if (meq !== null && Number.isFinite(meq)) total += meq;
    } catch {
      // skip ions that fail conversion (should not occur with validated IONS data)
    }
  }

  return total;
}

/**
 * Sum meq/L for all anions in the concentration map.
 * Skips cations, neutral species, unknown ions, and zero/invalid values.
 */
export function totalAnionMeq(concentrations: IonConcentrationMap): number {
  let total = 0;

  for (const [ionId, raw] of Object.entries(concentrations)) {
    const ion = IONS[ionId as keyof typeof IONS];
    if (!ion || ion.valence >= 0) continue; // skip cations, neutrals, unknowns

    const mgL = safeConcentration(raw);
    if (mgL <= 0) continue;

    try {
      const meq = mgLToMeqL(ionId, mgL);
      if (meq !== null && Number.isFinite(meq)) total += meq;
    } catch {
      // skip
    }
  }

  return total;
}

/**
 * Calculate charge imbalance percentage.
 *
 * Formula (standard analytical chemistry convention):
 *   imbalance% = |cations - anions| / ((cations + anions) / 2) × 100
 *
 * Returns 0 when the total sum is below the minimum computable threshold.
 */
export function calculateChargeImbalancePercent(
  cationTotal: number,
  anionTotal: number
): number {
  const denominator = (cationTotal + anionTotal) / 2;

  if (!Number.isFinite(denominator) || denominator < BALANCE_MIN_TOTAL_MEQ_L) {
    return 0;
  }

  return ((cationTotal - anionTotal) / denominator) * 100;
}

/**
 * Run a full charge balance calculation from a raw concentration map.
 */
export function computeChargeBalance(
  concentrations: IonConcentrationMap
): ChargeBalanceResult {
  const cationTotalMeq = totalCationMeq(concentrations);
  const anionTotalMeq = totalAnionMeq(concentrations);
  const totalMeq = cationTotalMeq + anionTotalMeq;

  const isComputable = totalMeq >= BALANCE_MIN_TOTAL_MEQ_L;

  const imbalancePercent = isComputable
    ? calculateChargeImbalancePercent(cationTotalMeq, anionTotalMeq)
    : 0;

  return {
    cationTotalMeq,
    anionTotalMeq,
    imbalancePercent,
    isComputable,
  };
}
