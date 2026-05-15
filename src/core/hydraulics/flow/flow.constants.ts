// Engineering constants for deterministic RO flow and recovery calculations

// ─── Recovery thresholds (decimal fraction) ───────────────────────────────────
// Industrial defaults — align with RECOVERY thresholds in core/constants/thresholds.ts

// Below this recovery the system is under-designed or feed is too dilute
export const RECOVERY_MIN_FRACTION = 0.10;

// Normal BWRO operating range: 60–85%
export const RECOVERY_BRACKISH_NORMAL_MIN_FRACTION = 0.60;
export const RECOVERY_BRACKISH_NORMAL_MAX_FRACTION = 0.75;

// Warning above this — concentration factor risk, scaling concern
export const RECOVERY_BRACKISH_WARNING_FRACTION = 0.80;

// Critical above this — typical max for BWRO
export const RECOVERY_BRACKISH_CRITICAL_FRACTION = 0.85;

// SWRO is typically run at 40–50%
export const RECOVERY_SEAWATER_NORMAL_MAX_FRACTION = 0.45;
export const RECOVERY_SEAWATER_WARNING_FRACTION = 0.48;
export const RECOVERY_SEAWATER_CRITICAL_FRACTION = 0.50;

// Hard ceiling — physically impossible
export const RECOVERY_MAX_FRACTION = 1.0;

// ─── Concentration factor limits ─────────────────────────────────────────────
// CF = 1 / (1 − recovery)
// At 75% recovery: CF = 4.0
// At 85% recovery: CF = 6.67
export const CONCENTRATION_FACTOR_WARNING = 5.0;
export const CONCENTRATION_FACTOR_CRITICAL = 8.0;

// ─── Minimum computable flow ─────────────────────────────────────────────────
// Below this value (m³/h) a flow is treated as zero / non-computable
export const FLOW_MIN_COMPUTABLE_M3H = 0.001;

// ─── Engineering tolerance ────────────────────────────────────────────────────
// Allowable mismatch between Qf and (Qp + Qc) as fraction of Qf
export const FLOW_BALANCE_TOLERANCE_FRACTION = 0.001;
