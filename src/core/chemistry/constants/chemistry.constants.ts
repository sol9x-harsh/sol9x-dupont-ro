// Engineering constants for chemistry calculations

// Assumption: mg/L ≈ ppm for dilute aqueous solutions (density ≈ 1 kg/L)
export const MG_L_EQUALS_PPM = true;

// Reference temperature for all chemistry calculations (°C and K)
export const REFERENCE_TEMP_C = 25;
export const REFERENCE_TEMP_K = 298.15;

// Gas constant (J / mol·K)
export const GAS_CONSTANT_R = 8.314;

// Minimum concentration treated as zero (mg/L) — avoids division artifacts
export const CONCENTRATION_ZERO_THRESHOLD = 1e-9;

// Maximum physically plausible ion concentration for typical RO feed water (mg/L)
export const MAX_ION_CONCENTRATION_MG_L = 100_000;

// Charge balance closure tolerance (meq/L absolute difference)
export const CHARGE_BALANCE_TOLERANCE_MEQ_L = 0.01;

// Charge balance error tolerance (%) — used for validation warnings
export const CHARGE_BALANCE_WARNING_PCT = 2;
export const CHARGE_BALANCE_ERROR_PCT = 10;

// TDS cross-check tolerance — allowable deviation between summed ion TDS and measured TDS (%)
export const TDS_CROSS_CHECK_TOLERANCE_PCT = 10;

// Conductivity empirical factor: TDS (mg/L) / conductivity (µS/cm) for typical waters
// Typical range: 0.55–0.70; 0.64 is a standard engineering default
export const CONDUCTIVITY_TDS_FACTOR = 0.64;
