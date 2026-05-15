// Engineering constants for deterministic membrane flux calculations.
// All flux values in LMH (L/m²/h) unless noted.

// ─── BWRO flux operating ranges (LMH) ────────────────────────────────────────
// Based on standard industrial 8" BWRO element engineering guidelines.
export const FLUX_BWRO_LOW_THRESHOLD_LMH = 8.0;
export const FLUX_BWRO_NORMAL_MIN_LMH = 12.0;
export const FLUX_BWRO_NORMAL_MAX_LMH = 25.0;
export const FLUX_BWRO_AGGRESSIVE_THRESHOLD_LMH = 25.0;
export const FLUX_BWRO_CRITICAL_THRESHOLD_LMH = 34.0;

// ─── SWRO flux operating ranges (LMH) ────────────────────────────────────────
export const FLUX_SWRO_LOW_THRESHOLD_LMH = 5.0;
export const FLUX_SWRO_NORMAL_MIN_LMH = 8.0;
export const FLUX_SWRO_NORMAL_MAX_LMH = 14.0;
export const FLUX_SWRO_AGGRESSIVE_THRESHOLD_LMH = 14.0;
export const FLUX_SWRO_CRITICAL_THRESHOLD_LMH = 17.0;

// ─── General flux classification thresholds (LMH) ────────────────────────────
// Used when membrane type is not specified — conservative cross-application thresholds.
export const FLUX_LOW_THRESHOLD_LMH = 8.0;
export const FLUX_AGGRESSIVE_THRESHOLD_LMH = 25.0;
export const FLUX_CRITICAL_THRESHOLD_LMH = 34.0;

// ─── Default membrane permeability A (L/m²/h/bar) ────────────────────────────
// Conservative default for preliminary sizing when A is not specified.
// BWRO typical: 3.0–5.0 LMH/bar | SWRO typical: 0.8–1.5 LMH/bar
export const FLUX_DEFAULT_PERMEABILITY_A_BWRO = 3.5;
export const FLUX_DEFAULT_PERMEABILITY_A_SWRO = 1.0;

// ─── Standard membrane active area (m²) ──────────────────────────────────────
// Standard 8" × 40" element: ~37 m² active area
export const FLUX_STANDARD_ELEMENT_AREA_M2 = 37.0;

// ─── Standard vessel configuration ───────────────────────────────────────────
// Default elements per pressure vessel (6-element industry standard)
export const FLUX_DEFAULT_ELEMENTS_PER_VESSEL = 6;

// ─── GFD conversion factor ────────────────────────────────────────────────────
// 1 GFD (gallon/ft²/day) = 1.6996 LMH
export const FLUX_GFD_TO_LMH = 1.6996;
export const FLUX_LMH_TO_GFD = 1 / 1.6996;

// ─── Engineering tolerances ───────────────────────────────────────────────────
export const FLUX_MIN_COMPUTABLE_LMH = 0.001;
export const FLUX_MIN_AREA_M2 = 0.01;
