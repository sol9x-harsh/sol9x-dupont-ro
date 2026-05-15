// Engineering constants for deterministic RO pressure propagation
// All pressures in bar unless noted. Use pressure unit utilities to convert.

// ─── Typical operating pressure ranges (bar) ─────────────────────────────────
// Based on standard industrial RO membrane datasheets and engineering practice.

// BWRO (brackish water RO): typically 5–20 bar feed pressure
export const PRESSURE_BWRO_MIN_BAR = 5.0;
export const PRESSURE_BWRO_TYPICAL_BAR = 12.0;
export const PRESSURE_BWRO_MAX_BAR = 20.0;

// SWRO (seawater RO): typically 50–80 bar feed pressure
export const PRESSURE_SWRO_MIN_BAR = 45.0;
export const PRESSURE_SWRO_TYPICAL_BAR = 60.0;
export const PRESSURE_SWRO_MAX_BAR = 83.0;

// Low-pressure NF / UF range: 2–6 bar
export const PRESSURE_NF_MIN_BAR = 2.0;
export const PRESSURE_NF_MAX_BAR = 6.0;

// ─── Engineering status thresholds (bar) ─────────────────────────────────────
// Warning: approaching BWRO maximum membrane pressure rating
export const PRESSURE_WARNING_THRESHOLD_BAR = 20.0;
// Critical: approaching SWRO maximum membrane pressure rating
export const PRESSURE_CRITICAL_THRESHOLD_BAR = 83.0;
// Below this inlet pressure the stage cannot produce meaningful permeate
export const PRESSURE_MIN_OPERATIONAL_BAR = 1.0;

// ─── Default stage pressure drop values (bar) ─────────────────────────────────
// Conservative engineering defaults for preliminary sizing.
// Actual ΔP must be calculated from element count, flux, spacer type.
//
// Typical single 8" pressure vessel (6-element): 0.5–1.5 bar depending on flux
// Conservative default for brackish: 1.0 bar per vessel
// Per-element contribution: ~0.15–0.20 bar
export const PRESSURE_DROP_DEFAULT_PER_STAGE_BAR = 1.0;
export const PRESSURE_DROP_DEFAULT_PER_ELEMENT_BAR = 0.17;
export const PRESSURE_DROP_MAX_PER_ELEMENT_BAR = 0.70;   // ASTM / manufacturer limit
export const PRESSURE_DROP_MAX_PER_VESSEL_BAR = 3.5;     // typical 7-element vessel limit

// ─── Minimum computable pressure ─────────────────────────────────────────────
export const PRESSURE_MIN_COMPUTABLE_BAR = 0.01;

// ─── Engineering tolerance ────────────────────────────────────────────────────
// Allowable deviation in pressure balance checks (bar)
export const PRESSURE_BALANCE_TOLERANCE_BAR = 0.01;
