// Engineering constants for deterministic osmotic pressure estimation
// Model: simplified van't Hoff equation — π = iCRT
// No activity coefficients, osmotic coefficients, or concentration polarization.

// ─── van't Hoff gas constant ──────────────────────────────────────────────────
// R = 0.08314 L·bar / (mol·K)
export const R_L_BAR_PER_MOL_K = 0.08314;

// ─── Reference temperature ────────────────────────────────────────────────────
// Standard engineering reference: 25°C = 298.15 K
export const REFERENCE_TEMPERATURE_K = 298.15;

// ─── Dissociation factors (i) — van't Hoff approximations ────────────────────
// i represents effective number of particles per formula unit when fully dissociated.
// These are practical engineering approximations, not osmotic coefficient corrections.
//
// Ionic species: i = |valence| particles (fully dissociated assumption)
// Neutral species (SiO₂): i = 1 (undissociated, molecular contribution)
//
// Sources: Perry's Chemical Engineers' Handbook; Crittenden et al., MWH Water Treatment
export const ION_DISSOCIATION_FACTORS: Record<string, number> = {
  Na:   1,    // Na⁺ — monovalent, fully dissociated
  Ca:   1,    // Ca²⁺ — counted as 1 particle (paired with anion in the sum)
  Mg:   1,    // Mg²⁺ — same convention
  K:    1,    // K⁺ — monovalent
  Cl:   1,    // Cl⁻ — monovalent
  SO4:  1,    // SO₄²⁻ — counted as 1 particle
  HCO3: 1,    // HCO₃⁻ — monovalent
  CO3:  1,    // CO₃²⁻ — counted as 1 particle
  NO3:  1,    // NO₃⁻ — monovalent
  SiO2: 1,    // SiO₂ — non-ionic, molecular contribution (i=1)
};
// NOTE: Each ion contributes independently — the sum of all ion mmol/L × i × RT
// implicitly captures the full solute particle count without double-counting
// cation-anion pairs. This is the standard RO engineering approach.

// ─── TDS-based osmotic estimation factor ─────────────────────────────────────
// Practical engineering rule-of-thumb: π (bar) ≈ TDS (mg/L) × factor
// Derived from van't Hoff at 25°C for typical NaCl-dominated brackish water.
// Factor range: 6.0–8.0 × 10⁻⁴ bar·L/mg
//
// Conservative midpoint for mixed-ion brackish streams: 7.0 × 10⁻⁴
// Seawater streams tend toward the lower end (~6.5 × 10⁻⁴) due to higher MW salts.
export const OSMOTIC_PRESSURE_TDS_FACTOR_BAR_PER_MG_L = 7.0e-4;

// ─── Conductivity-based osmotic estimation factor ─────────────────────────────
// Practical correlation: π (bar) ≈ conductivity (µS/cm) × factor
// Derived from empirical TDS/conductivity ratio combined with TDS→osmotic factor.
// conductivity (µS/cm) × 0.64 (factor) → TDS (mg/L) × 7.0e-4 → π (bar)
// Net factor ≈ 0.64 × 7.0e-4 = 4.48 × 10⁻⁴ bar per µS/cm
export const OSMOTIC_PRESSURE_CONDUCTIVITY_FACTOR_BAR_PER_US_CM = 4.48e-4;

// ─── Pressure classification thresholds (bar) ─────────────────────────────────
// Based on typical RO application ranges
export const OSMOTIC_THRESHOLD_FRESHWATER_MAX_BAR = 1.0;    // < 1 bar — low-pressure RO / NF
export const OSMOTIC_THRESHOLD_LOW_BRACKISH_MAX_BAR = 4.0;  // 1–4 bar — BWRO low-end
export const OSMOTIC_THRESHOLD_BRACKISH_MAX_BAR = 14.0;     // 4–14 bar — standard BWRO
export const OSMOTIC_THRESHOLD_SEAWATER_MAX_BAR = 35.0;     // 14–35 bar — SWRO range

// ─── Engineering status thresholds (bar) ─────────────────────────────────────
// Above 14 bar → membrane selection and HP pump sizing warning
// Above 35 bar → seawater / high-pressure territory requiring SWRO design
export const OSMOTIC_WARNING_THRESHOLD_BAR = 14.0;
export const OSMOTIC_CRITICAL_THRESHOLD_BAR = 35.0;

// ─── Minimum computable osmotic pressure ─────────────────────────────────────
export const OSMOTIC_MIN_COMPUTABLE_BAR = 0.001;
