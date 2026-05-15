// Engineering constants for deterministic concentration polarization (CP) estimation.
// Based on standard industrial RO membrane operating guidelines.

// ─── Mass transfer coefficient defaults (m/s) ────────────────────────────────
// k is the mass transfer coefficient in the feed-side boundary layer.
// Typical values for 8" spiral-wound elements under normal cross-flow velocity:
//   BWRO channel (spacer-filled): 1.5–3.5 × 10⁻⁵ m/s
//   SWRO channel (tighter spacer): 1.0–2.5 × 10⁻⁵ m/s
// Conservative engineering default for preliminary sizing:
export const CP_DEFAULT_MASS_TRANSFER_COEFFICIENT_MS = 2.0e-5;

// Lower bound used when k is unknown and conservative CP estimate is needed
export const CP_CONSERVATIVE_MASS_TRANSFER_COEFFICIENT_MS = 1.5e-5;

// Upper bound — high cross-flow velocity, optimistic CP estimate
export const CP_OPTIMISTIC_MASS_TRANSFER_COEFFICIENT_MS = 3.5e-5;

// ─── CP factor classification thresholds ─────────────────────────────────────
// CP = exp(Jw / k); unitless multiplier on bulk concentration.
// Industry target: CP ≤ 1.2 for most brackish applications
// Warning above 1.2; critical above 1.4

export const CP_LOW_THRESHOLD = 1.05;       // below this: very low CP, possibly underfluxed
export const CP_NORMAL_MAX = 1.20;          // ASTM / manufacturer design guideline maximum
export const CP_WARNING_THRESHOLD = 1.20;   // above this: elevated fouling / scaling risk
export const CP_CRITICAL_THRESHOLD = 1.40;  // above this: severe concentration amplification

// ─── Flux unit conversion ─────────────────────────────────────────────────────
// CP equation uses Jw in m/s. LMH must be converted:
//   1 LMH = 1 L/m²/h = 1e-3 m³/m²/h = 1e-3/3600 m/s
export const CP_LMH_TO_MS = 1e-3 / 3600;

// ─── Engineering tolerances ───────────────────────────────────────────────────
export const CP_MIN_FLUX_LMH = 0.001;
export const CP_MIN_MASS_TRANSFER_MS = 1e-7;
export const CP_MAX_COMPUTABLE_EXPONENT = 5.0;  // guard against exp() overflow
