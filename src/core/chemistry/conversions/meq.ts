import { IONS } from "@/core/constants/ions";
import {
  validateIonId,
  validateConcentrationMgL,
  validateValence,
  validateMolecularWeight,
} from "@/core/chemistry/validation/chemistry.validation";

/**
 * Equivalent weight = molecularWeight / |valence|
 * meq/L = mg/L / equivalentWeight
 */
export function getEquivalentWeight(ionId: string): number {
  const ionCheck = validateIonId(ionId);
  if (!ionCheck.valid) throw new Error(ionCheck.reason);

  const valCheck = validateValence(ionId);
  if (!valCheck.valid) throw new Error(valCheck.reason);

  const mwCheck = validateMolecularWeight(ionId);
  if (!mwCheck.valid) throw new Error(mwCheck.reason);

  const ion = IONS[ionId as keyof typeof IONS];
  return ion.molecularWeight / Math.abs(ion.valence);
}

/**
 * Convert mg/L → meq/L for a given ion.
 * Returns null if value is null/undefined/NaN.
 * Throws if ionId is invalid or valence is zero.
 */
export function mgLToMeqL(ionId: string, mgL: number | null | undefined): number | null {
  if (mgL === null || mgL === undefined || !Number.isFinite(mgL)) return null;

  const concCheck = validateConcentrationMgL(mgL, ionId);
  if (!concCheck.valid) throw new Error(concCheck.reason);

  const eqWeight = getEquivalentWeight(ionId);
  return mgL / eqWeight;
}

/**
 * Convert meq/L → mg/L for a given ion.
 * Returns null if value is null/undefined/NaN.
 * Throws if ionId is invalid or valence is zero.
 */
export function meqLToMgL(ionId: string, meqL: number | null | undefined): number | null {
  if (meqL === null || meqL === undefined || !Number.isFinite(meqL)) return null;
  if (meqL < 0) throw new Error(`Negative meq/L value: ${meqL}`);

  const eqWeight = getEquivalentWeight(ionId);
  return meqL * eqWeight;
}

/**
 * Convert a full concentration map (mg/L) to meq/L.
 * Skips neutral species (valence === 0) — returns null for those entries.
 */
export function concentrationMapToMeqL(
  concentrations: Partial<Record<string, number | null>>
): Record<string, number | null> {
  const result: Record<string, number | null> = {};

  for (const [ionId, value] of Object.entries(concentrations)) {
    const ion = IONS[ionId as keyof typeof IONS];
    if (!ion || ion.valence === 0) {
      result[ionId] = null;
      continue;
    }
    result[ionId] = mgLToMeqL(ionId, value);
  }

  return result;
}
