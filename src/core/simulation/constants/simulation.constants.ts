export const SIMULATION_VERSION = "4.2.0";

export const SIMULATION_DEFAULTS = {
  permeatePressureBar: 1.0,
  massTransferCoefficientMS: 2e-5,
  membranePermeabilityA: 3.5,
  rejectionPercent: 98.5,
  pressureDropPerStageBar: 1.7,
  elementCountPerVessel: 7,
  elementAreaM2: 37.2,
} as const;

export const WARNING_THRESHOLDS = {
  // ── Recovery ────────────────────────────────────────────────────────────────
  highRecoveryFraction: 0.80,
  criticalRecoveryFraction: 0.85,

  // ── NDP ─────────────────────────────────────────────────────────────────────
  lowNdpBar: 2.0,
  nearZeroNdpBar: 0.5,

  // ── Flux ────────────────────────────────────────────────────────────────────
  lowFluxLMH: 5.0,          // Below min operating range
  aggressiveFluxLMH: 25.0,
  criticalFluxLMH: 34.0,

  // ── CP ──────────────────────────────────────────────────────────────────────
  criticalCPFactor: 1.40,

  // ── Rejection & Water Quality ───────────────────────────────────────────────
  poorRejectionPercent: 95.0,
  highPermeateTDSMgL: 500,         // Potable limit
  criticalPermeateTDSMgL: 1000,    // Non-potable

  // ── Boron ───────────────────────────────────────────────────────────────────
  boronLimitMgL: 2.4,              // WHO guideline
  boronCriticalMgL: 5.0,

  // ── Osmotic ─────────────────────────────────────────────────────────────────
  criticalOsmoticPressureBar: 35.0,

  // ── Charge Balance ──────────────────────────────────────────────────────────
  chargeImbalanceWarningPct: 5.0,
  chargeImbalanceCriticalPct: 10.0,

  // ── Pressure ────────────────────────────────────────────────────────────────
  maxFeedPressureBar: 83,          // SWRO membrane max
  maxFeedPressureBWROBar: 41,      // BWRO membrane max
  maxStagePressureDropBar: 3.5,    // Per-vessel limit
  maxPermeatePressureBar: 3.5,     // Permeate back-pressure limit
} as const;

// SWRO-specific thresholds — tighter limits for seawater conditions.
export const SWRO_WARNING_THRESHOLDS = {
  highRecoveryFraction: 0.50,
  criticalRecoveryFraction: 0.55,
  aggressiveFluxLMH: 14.0,
  criticalFluxLMH: 17.0,
  lowFluxLMH: 5.0,
} as const;

// BWRO-specific thresholds
export const BWRO_WARNING_THRESHOLDS = {
  highRecoveryFraction: 0.80,
  criticalRecoveryFraction: 0.90,
  aggressiveFluxLMH: 25.0,
  criticalFluxLMH: 34.0,
  lowFluxLMH: 8.0,
} as const;

export const SCALING_THRESHOLDS = {
  lsiWarning: 0.0,
  lsiCritical: 1.0,
  lsiWithAntiscalant: 1.8,
  sdiWarning: 0.0,
  sdiCritical: 0.5,
  sdiWithAntiscalant: 1.0,
  caSO4SatWarning: 100,
  caSO4WithAntiscalant: 200,
  baSO4SatWarning: 100,
  baSO4WithAntiscalant: 6000,
  sio2SatWarning: 100,
  sio2WithAntiscalant: 100,
  /** SiO2 solubility increases with temperature; 120 mg/L at 25°C */
  sio2BaseSolubilityMgL: 120,
} as const;
