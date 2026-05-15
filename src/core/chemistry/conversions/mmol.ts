import { IONS } from "@/core/constants/ions";
import {
  validateIonId,
  validateConcentrationMgL,
  validateMolecularWeight,
} from "@/core/chemistry/validation/chemistry.validation";

/**
 * Convert mg/L → mmol/L for a given ion.
 * mmol/L = mg/L / molecularWeight
 * Returns null if value is null/undefined/NaN.
 */
export function mgLToMmolL(ionId: string, mgL: number | null | undefined): number | null {
  if (mgL === null || mgL === undefined || !Number.isFinite(mgL)) return null;

  const ionCheck = validateIonId(ionId);
  if (!ionCheck.valid) throw new Error(ionCheck.reason);

  const concCheck = validateConcentrationMgL(mgL, ionId);
  if (!concCheck.valid) throw new Error(concCheck.reason);

  const mwCheck = validateMolecularWeight(ionId);
  if (!mwCheck.valid) throw new Error(mwCheck.reason);

  const ion = IONS[ionId as keyof typeof IONS];
  return mgL / ion.molecularWeight;
}

/**
 * Convert mmol/L → mg/L for a given ion.
 * mg/L = mmol/L × molecularWeight
 * Returns null if value is null/undefined/NaN.
 */
export function mmolLToMgL(ionId: string, mmolL: number | null | undefined): number | null {
  if (mmolL === null || mmolL === undefined || !Number.isFinite(mmolL)) return null;
  if (mmolL < 0) throw new Error(`Negative mmol/L value: ${mmolL}`);

  const ionCheck = validateIonId(ionId);
  if (!ionCheck.valid) throw new Error(ionCheck.reason);

  const mwCheck = validateMolecularWeight(ionId);
  if (!mwCheck.valid) throw new Error(mwCheck.reason);

  const ion = IONS[ionId as keyof typeof IONS];
  return mmolL * ion.molecularWeight;
}

/**
 * Convert a full concentration map (mg/L) to mmol/L.
 */
export function concentrationMapToMmolL(
  concentrations: Partial<Record<string, number | null>>
): Record<string, number | null> {
  const result: Record<string, number | null> = {};

  for (const [ionId, value] of Object.entries(concentrations)) {
    result[ionId] = mgLToMmolL(ionId, value);
  }

  return result;
}
