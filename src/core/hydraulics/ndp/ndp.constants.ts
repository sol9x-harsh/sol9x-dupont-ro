// Engineering constants for deterministic NDP (Net Driving Pressure) calculations.
// All pressures in bar unless noted.

// ─── Minimum viable NDP ───────────────────────────────────────────────────────
// Below this NDP the membrane cannot produce meaningful permeate.
// Typical minimum operational NDP for industrial RO: 0.5–1.0 bar
export const NDP_MIN_VIABLE_BAR = 0.5;

// NDP below this is considered insufficient — system will not produce design flux
export const NDP_INSUFFICIENT_THRESHOLD_BAR = 1.0;

// ─── Recommended operating NDP ranges (bar) ──────────────────────────────────
// BWRO typical operating NDP: 2–10 bar above osmotic pressure
export const NDP_BWRO_TYPICAL_MIN_BAR = 2.0;
export const NDP_BWRO_TYPICAL_MAX_BAR = 10.0;

// SWRO typical operating NDP: 5–20 bar above osmotic pressure
export const NDP_SWRO_TYPICAL_MIN_BAR = 5.0;
export const NDP_SWRO_TYPICAL_MAX_BAR = 20.0;

// ─── Classification thresholds (bar) ─────────────────────────────────────────
// Marginal: technically positive but below normal design NDP
export const NDP_MARGINAL_THRESHOLD_BAR = 2.0;

// Normal operating range lower bound
export const NDP_NORMAL_MIN_BAR = 2.0;

// Aggressive: NDP is high, membrane stress may be elevated
export const NDP_AGGRESSIVE_THRESHOLD_BAR = 15.0;

// Critical: excessive NDP, risk of membrane compaction or damage
export const NDP_CRITICAL_THRESHOLD_BAR = 25.0;

// ─── Engineering tolerance ────────────────────────────────────────────────────
// Below this value NDP is treated as zero (floating-point guard)
export const NDP_ZERO_TOLERANCE_BAR = 0.001;

// ─── Hydraulic delta-P guard ──────────────────────────────────────────────────
// Minimum computable hydraulic delta-P
export const NDP_MIN_HYDRAULIC_DELTA_P_BAR = 0.01;

// ─── CP Estimation ────────────────────────────────────────────────────────────
// Conservative concentration polarization factor used in deterministic NDP 
// to account for osmotic pressure amplification at the membrane surface 
// without requiring iterative solving.
export const NDP_CP_ESTIMATION_FACTOR = 1.12;

