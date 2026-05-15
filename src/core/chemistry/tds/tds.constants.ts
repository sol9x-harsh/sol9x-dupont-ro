// TDS classification and engineering tolerance constants

// Salinity classification thresholds (mg/L TDS)
// Based on industrial RO and WHO water quality standards
export const TDS_THRESHOLD_FRESHWATER_MAX = 500;
export const TDS_THRESHOLD_LOW_BRACKISH_MAX = 2_000;
export const TDS_THRESHOLD_BRACKISH_MAX = 10_000;
export const TDS_THRESHOLD_SEAWATER_MAX = 45_000;
// > 45,000 mg/L = high-salinity / brine

// Warning/critical thresholds for RO feed water
// Above brackish = warning; above seawater range = critical
export const TDS_WARNING_THRESHOLD_MG_L = 10_000;
export const TDS_CRITICAL_THRESHOLD_MG_L = 45_000;

// Minimum TDS to consider the stream computable (avoids noise on near-zero inputs)
export const TDS_MIN_COMPUTABLE_MG_L = 1;

// Maximum physically plausible TDS for RO feed water (saturated brine ~360,000 mg/L NaCl)
// Engineering ceiling for RO applications
export const TDS_MAX_ENGINEERING_MG_L = 80_000;

// ─── TDS exclusion list ───────────────────────────────────────────────────────
// Dissolved gases and non-ionic volatile species that do NOT contribute to TDS
// per standard RO engineering practice (ASTM D1125 aligned).
// These species remain available for carbonate equilibrium, scaling, and pH
// calculations — they are excluded from TDS summation only.
export const TDS_EXCLUDED_SPECIES = new Set<string>([
  'CO2', // dissolved carbon dioxide — volatile gas, not a dissolved solid
  'H2S', // dissolved hydrogen sulfide — volatile gas, not a dissolved solid
]);
