// Engineering constants for deterministic salt passage and permeate quality estimation.
// Based on standard industrial RO membrane operating guidelines.

// ─── Rejection ranges (%) ──────────────────────────────────────────────────────
// BWRO membranes (brackish water RO): typical system rejection 95–99.5%
export const BWRO_REJECTION_MIN_PERCENT = 95.0;
export const BWRO_REJECTION_TYPICAL_PERCENT = 98.0;
export const BWRO_REJECTION_MAX_PERCENT = 99.7;

// SWRO membranes (seawater RO): typical system rejection 99–99.8%
export const SWRO_REJECTION_MIN_PERCENT = 99.0;
export const SWRO_REJECTION_TYPICAL_PERCENT = 99.5;
export const SWRO_REJECTION_MAX_PERCENT = 99.85;

// ─── Salt passage warning thresholds (%) ──────────────────────────────────────
// Salt passage = 100 − rejection
export const SALT_PASSAGE_NORMAL_MAX_PERCENT = 2.0;    // ≤ 2% SP: normal operation
export const SALT_PASSAGE_WARNING_PERCENT = 5.0;       // > 2%: elevated, review membrane
export const SALT_PASSAGE_CRITICAL_PERCENT = 10.0;     // > 5%: poor rejection, investigate
// > 10%: membrane failure or severe fouling

// ─── Permeate quality thresholds (mg/L TDS) ──────────────────────────────────
// Permeate TDS classification for drinking water and industrial applications
export const PERMEATE_TDS_EXCELLENT_MGL = 50;     // < 50 mg/L: excellent product quality
export const PERMEATE_TDS_GOOD_MGL = 150;          // < 150 mg/L: good product quality
export const PERMEATE_TDS_ACCEPTABLE_MGL = 500;    // < 500 mg/L: acceptable (WHO drinking water limit)
// ≥ 500 mg/L: poor — exceeds typical drinking water standards

// ─── Permeate conductivity thresholds (µS/cm) ────────────────────────────────
export const PERMEATE_COND_EXCELLENT_US_CM = 80;   // < 80 µS/cm: excellent
export const PERMEATE_COND_GOOD_US_CM = 250;       // < 250 µS/cm: good
export const PERMEATE_COND_ACCEPTABLE_US_CM = 800; // < 800 µS/cm: acceptable
// ≥ 800 µS/cm: poor

// ─── Conductivity / TDS correlation ──────────────────────────────────────────
// Permeate conductivity estimation from TDS.
// Default factor for low-TDS permeate (NaCl-dominated, near-pure water approximation):
//   Permeate is more dilute than feed — conductivity factor slightly higher than feed.
// Conservative engineering estimate: 0.50–0.65 µS/cm per mg/L TDS for low-TDS streams.
export const PERMEATE_CONDUCTIVITY_FACTOR = 0.55;   // µS/cm per mg/L TDS

// ─── Engineering tolerances ───────────────────────────────────────────────────
export const SALT_REJECTION_MAX_PERCENT = 100.0;    // physical maximum
export const SALT_REJECTION_MIN_PERCENT = 0.0;      // physical minimum
export const CONCENTRATION_MIN_MGL = 0.0;           // negative concentrations are invalid
export const TDS_MIN_VALID_MGL = 1.0;               // below this feed TDS calculation is unreliable
