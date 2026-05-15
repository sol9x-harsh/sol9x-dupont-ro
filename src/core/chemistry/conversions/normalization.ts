import { ION_IDS } from "@/core/constants/ions";
import { CONCENTRATION_ZERO_THRESHOLD } from "@/core/chemistry/constants/chemistry.constants";

export type ConcentrationMap = Partial<Record<string, number | null | undefined>>;
export type NormalizedConcentrationMap = Record<string, number>;

/**
 * Normalize a raw concentration map:
 * - undefined/null → 0
 * - NaN/Infinity → 0
 * - negative values → 0 (clamped)
 * - values below engineering zero threshold → 0
 *
 * Returns a complete map for all known ions.
 */
export function normalizeConcentrations(
  input: ConcentrationMap
): NormalizedConcentrationMap {
  const result: NormalizedConcentrationMap = {};

  for (const ionId of ION_IDS) {
    const raw = input[ionId];
    result[ionId] = safeConcentration(raw);
  }

  return result;
}

/**
 * Normalize only the ions present in the input map.
 * Does not fill missing ions with zero.
 */
export function normalizeConcentrationsPartial(
  input: ConcentrationMap
): NormalizedConcentrationMap {
  const result: NormalizedConcentrationMap = {};

  for (const [ionId, raw] of Object.entries(input)) {
    result[ionId] = safeConcentration(raw);
  }

  return result;
}

/**
 * Convert a raw concentration value to a safe engineering number.
 * null | undefined | NaN | Infinity | negative → 0
 */
export function safeConcentration(value: number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (!Number.isFinite(value)) return 0;
  if (value < CONCENTRATION_ZERO_THRESHOLD) return 0;
  return value;
}

/**
 * Remove ions with zero or near-zero concentrations from a map.
 * Useful for reducing computation in downstream engines.
 */
export function removeZeroConcentrations(
  map: NormalizedConcentrationMap
): NormalizedConcentrationMap {
  const result: NormalizedConcentrationMap = {};

  for (const [ionId, value] of Object.entries(map)) {
    if (value > CONCENTRATION_ZERO_THRESHOLD) {
      result[ionId] = value;
    }
  }

  return result;
}

/**
 * Clamp all concentrations in a map to [0, maxValue].
 */
export function clampConcentrations(
  map: NormalizedConcentrationMap,
  maxValue: number
): NormalizedConcentrationMap {
  const result: NormalizedConcentrationMap = {};

  for (const [ionId, value] of Object.entries(map)) {
    result[ionId] = Math.min(Math.max(0, value), maxValue);
  }

  return result;
}
