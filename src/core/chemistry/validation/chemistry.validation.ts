import { IONS, ION_IDS } from "@/core/constants/ions";
import { MAX_ION_CONCENTRATION_MG_L } from "@/core/chemistry/constants/chemistry.constants";

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

export function validateIonId(ionId: string): ValidationResult {
  if (!ION_IDS.includes(ionId as keyof typeof IONS)) {
    return { valid: false, reason: `Unknown ion ID: "${ionId}"` };
  }
  return { valid: true };
}

export function validateConcentrationMgL(
  value: unknown,
  ionId?: string
): ValidationResult {
  if (value === null || value === undefined) {
    return { valid: false, reason: "Concentration is null or undefined" };
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { valid: false, reason: "Concentration is not a finite number" };
  }
  if (value < 0) {
    return {
      valid: false,
      reason: `Negative concentration${ionId ? ` for ${ionId}` : ""}: ${value} mg/L`,
    };
  }
  if (value > MAX_ION_CONCENTRATION_MG_L) {
    return {
      valid: false,
      reason: `Concentration${ionId ? ` for ${ionId}` : ""} exceeds physical limit: ${value} mg/L`,
    };
  }
  return { valid: true };
}

export function validateValence(ionId: string): ValidationResult {
  const ion = IONS[ionId as keyof typeof IONS];
  if (!ion) {
    return { valid: false, reason: `Unknown ion: "${ionId}"` };
  }
  if (ion.valence === 0) {
    return {
      valid: false,
      reason: `Ion "${ionId}" has zero valence — meq/L conversion is undefined for neutral species`,
    };
  }
  return { valid: true };
}

export function validateMolecularWeight(ionId: string): ValidationResult {
  const ion = IONS[ionId as keyof typeof IONS];
  if (!ion) {
    return { valid: false, reason: `Unknown ion: "${ionId}"` };
  }
  if (!Number.isFinite(ion.molecularWeight) || ion.molecularWeight <= 0) {
    return {
      valid: false,
      reason: `Ion "${ionId}" has invalid molecular weight: ${ion.molecularWeight}`,
    };
  }
  return { valid: true };
}
