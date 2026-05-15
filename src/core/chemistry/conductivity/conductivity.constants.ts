// Engineering constants for deterministic conductivity estimation

// ─── TDS-based estimation ─────────────────────────────────────────────────────

// Standard empirical TDS/conductivity conversion factor for typical RO feed water.
// Conductivity (µS/cm) ≈ TDS (mg/L) / factor
// Typical industrial range: 0.55–0.70. 0.64 is the ASTM D1125 engineering default.
export const CONDUCTIVITY_TDS_FACTOR_DEFAULT = 0.64;

// Seawater: measured ~52391 µS/cm at 35,207 mg/L → factor ≈ 0.672
export const CONDUCTIVITY_TDS_FACTOR_SEAWATER = 0.672263;

// Fresh/low-mineral waters skew higher due to lighter ion composition
export const CONDUCTIVITY_TDS_FACTOR_FRESHWATER = 0.7;

// ─── Per-water-category default TDS conversion factors ───────────────────────
// Used by getConductivityStrategy() for water-type-aware conductivity routing.
export const CONDUCTIVITY_TDS_FACTORS_BY_CATEGORY: Record<string, number> = {
  'ro-nf-permeate': 0.6117,
  'softened-water': 0.6,
  'municipal-water': 0.635821,
  'well-water': 0.572,
  'surface-water': 0.65,
  brackish: 0.68,
  'waste-water': 0.636,
  'sea-water': 0.672263,
};

// ─── Ion-weighted molar conductivity factors ──────────────────────────────────
// Units: µS/cm per mg/L
// Derived from limiting molar conductivities (λ°) at 25°C:
//   factor = λ° (S·cm²/mol) / molecularWeight (g/mol)
// Unit derivation: κ(S/cm) = λ(S·cm²/mol) × c(mol/cm³)
//   c(mol/cm³) = c(mg/L) / (MW × 10⁶) → κ(µS/cm) = λ/MW × c(mg/L)
// These are infinite-dilution approximations. A high-ionic-strength correction
// is applied at runtime in estimateConductivityFromIons for SWRO-range feeds.
//
// Reference λ° (S·cm²/mol at 25°C):
//   Na⁺ 50.1 | Ca²⁺ 119.0 | Mg²⁺ 106.0 | K⁺ 73.5 | Ba²⁺ 127.2 | Sr²⁺ 119.0
//   NH₄⁺ 73.5 | Cl⁻ 76.4 | SO₄²⁻ 160.0 | HCO₃⁻ 44.5 | CO₃²⁻ 138.6
//   NO₃⁻ 71.5 | F⁻ 54.4 | Br⁻ 78.1 | PO₄³⁻ 207.0
export const ION_CONDUCTIVITY_FACTORS: Record<string, number> = {
  // Cations                   λ°/MW
  Na: 2.18, // 50.1/22.99
  Ca: 2.97, // 119.0/40.08
  Mg: 4.36, // 106.0/24.31
  K: 1.88, // 73.5/39.10
  Ba: 0.93, // 127.2/137.33
  Sr: 1.36, // 119.0/87.62
  NH4: 4.07, // 73.5/18.04
  // Anions
  Cl: 2.16, // 76.4/35.45
  SO4: 1.66, // 160.0/96.06
  HCO3: 0.73, // 44.5/61.02
  CO3: 2.31, // 138.6/60.01
  NO3: 1.15, // 71.5/62.00
  F: 2.86, // 54.4/19.00
  Br: 0.98, // 78.1/79.90
  PO4: 2.18, // 207.0/94.97
  // Neutrals — do not contribute to conductivity
  SiO2: 0.0,
  B: 0.0,
  CO2: 0.0,
  H2S: 0.0,
  TOC: 0.0,
};

// TDS threshold above which the feed is treated as seawater/high-ionic-strength.
// Above this value, empirical TDS correlation (CONDUCTIVITY_TDS_FACTOR_SEAWATER)
// is used as the primary estimate; ion-weighted is relegated to diagnostics.
export const CONDUCTIVITY_SEAWATER_TDS_THRESHOLD_MG_L = 15_000;

// ─── Classification thresholds (µS/cm) ───────────────────────────────────────
// Based on standard water quality classifications
export const CONDUCTIVITY_THRESHOLD_FRESHWATER_MAX = 800; // < 800 µS/cm
export const CONDUCTIVITY_THRESHOLD_LOW_BRACKISH_MAX = 3_000; // 800–3,000
export const CONDUCTIVITY_THRESHOLD_BRACKISH_MAX = 16_000; // 3,000–16,000
export const CONDUCTIVITY_THRESHOLD_SEAWATER_MAX = 70_000; // 16,000–70,000
// > 70,000 µS/cm = high-salinity brine

// ─── Engineering status thresholds (µS/cm) ───────────────────────────────────
export const CONDUCTIVITY_WARNING_THRESHOLD_US_CM = 16_000;
export const CONDUCTIVITY_CRITICAL_THRESHOLD_US_CM = 70_000;

// ─── Cross-check tolerance ────────────────────────────────────────────────────
// Allowable deviation between TDS-derived and ion-weighted conductivity estimates (%)
export const CONDUCTIVITY_CROSS_CHECK_TOLERANCE_PCT = 15;

// ─── Minimum computable conductivity ─────────────────────────────────────────
export const CONDUCTIVITY_MIN_COMPUTABLE_US_CM = 0.1;
