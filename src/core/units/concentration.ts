// For dilute aqueous solutions: 1 mg/L ≈ 1 ppm (by mass, density ~1 kg/L)
// meq/L and mmol/L conversions require molecular weight and valence

/** mg/L to ppm (valid for dilute solutions, density ≈ 1 kg/L) */
export const mgLToPpm = (mgL: number): number => mgL;

/** ppm to mg/L */
export const ppmToMgL = (ppm: number): number => ppm;

/** mg/L to g/L */
export const mgLToGL = (mgL: number): number => mgL / 1000;

/** g/L to mg/L */
export const gLToMgL = (gL: number): number => gL * 1000;

/**
 * Convert mg/L to meq/L
 * @param mgL - concentration in mg/L
 * @param molecularWeight - g/mol
 * @param valence - absolute value of ion charge
 */
export function mgLToMeqL(mgL: number, molecularWeight: number, valence: number): number {
  return (mgL / molecularWeight) * Math.abs(valence);
}

/**
 * Convert meq/L to mg/L
 */
export function meqLToMgL(meqL: number, molecularWeight: number, valence: number): number {
  return (meqL / Math.abs(valence)) * molecularWeight;
}

/**
 * Convert mg/L to mmol/L
 */
export function mgLToMmolL(mgL: number, molecularWeight: number): number {
  return mgL / molecularWeight;
}

/**
 * Convert mmol/L to mg/L
 */
export function mmolLToMgL(mmolL: number, molecularWeight: number): number {
  return mmolL * molecularWeight;
}
