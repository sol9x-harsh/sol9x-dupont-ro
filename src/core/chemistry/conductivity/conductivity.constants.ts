// Engineering constants for deterministic conductivity estimation

// ─── TDS-based estimation ─────────────────────────────────────────────────────

// Standard empirical TDS/conductivity conversion factor for typical RO feed water.
// Conductivity (µS/cm) ≈ TDS (mg/L) / factor
// Typical industrial range: 0.55–0.70. 0.64 is the ASTM/engineering default.
export const CONDUCTIVITY_TDS_FACTOR_DEFAULT = 0.45;

// Brackish seawater streams tend to have a slightly lower factor due to ionic composition
export const CONDUCTIVITY_TDS_FACTOR_SEAWATER = 0.45;

// Fresh/low-mineral waters have a slightly higher factor
export const CONDUCTIVITY_TDS_FACTOR_FRESHWATER = 0.48;

// ─── Ion-weighted molar conductivity factors ──────────────────────────────────
// Units: µS/cm per mg/L
// Derived from limiting molar conductivities (λ°) at 25°C scaled to mg/L basis:
//   factor ≈ λ° (S·cm²/mol) × 10 / molecularWeight
// These are engineering approximations — not corrected for activity or ion pairing.
//
// Reference λ° values (S·cm²/mol at 25°C):
//   Na⁺  50.1 | Ca²⁺  119 | Mg²⁺  106 | K⁺  73.5
//   Cl⁻  76.4 | SO₄²⁻  160 | HCO₃⁻  44.5 | CO₃²⁻  138.6
//   NO₃⁻  71.5 | SiO₂  ~0 (non-ionic)
// Units: µS/cm per mg/L. Derived from limiting molar conductivities (λ°) at 25°C.
// Neutrals and complex organics are assigned 0 (non-ionic at typical pH).
export const ION_CONDUCTIVITY_FACTORS: Record<string, number> = {
  // Cations
  Na:   2.73,
  Ca:   3.71,
  Mg:   5.45,
  K:    2.35,
  Ba:   0.74,
  Sr:   1.60,
  NH4:  4.91,
  // Anions
  Cl:   2.69,
  SO4:  2.08,
  HCO3: 0.91,
  CO3:  2.89,
  NO3:  1.44,
  F:    3.29,
  Br:   1.95,
  PO4:  1.51,
  // Neutrals — do not contribute to conductivity
  SiO2: 0.0,
  B:    0.0,
  CO2:  0.0,
  H2S:  0.0,
  TOC:  0.0,
};

// ─── Classification thresholds (µS/cm) ───────────────────────────────────────
// Based on standard water quality classifications
export const CONDUCTIVITY_THRESHOLD_FRESHWATER_MAX = 800;     // < 800 µS/cm
export const CONDUCTIVITY_THRESHOLD_LOW_BRACKISH_MAX = 3_000; // 800–3,000
export const CONDUCTIVITY_THRESHOLD_BRACKISH_MAX = 16_000;    // 3,000–16,000
export const CONDUCTIVITY_THRESHOLD_SEAWATER_MAX = 70_000;    // 16,000–70,000
// > 70,000 µS/cm = high-salinity brine

// ─── Engineering status thresholds (µS/cm) ───────────────────────────────────
export const CONDUCTIVITY_WARNING_THRESHOLD_US_CM = 16_000;
export const CONDUCTIVITY_CRITICAL_THRESHOLD_US_CM = 70_000;

// ─── Cross-check tolerance ────────────────────────────────────────────────────
// Allowable deviation between TDS-derived and ion-weighted conductivity estimates (%)
export const CONDUCTIVITY_CROSS_CHECK_TOLERANCE_PCT = 15;

// ─── Minimum computable conductivity ─────────────────────────────────────────
export const CONDUCTIVITY_MIN_COMPUTABLE_US_CM = 0.1;
