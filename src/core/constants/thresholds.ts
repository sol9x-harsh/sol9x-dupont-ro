// Engineering warning and alarm thresholds

export const CHARGE_BALANCE = {
  /** Max acceptable charge balance error (%) before warning */
  WARNING_PERCENT: 5,
  /** Max acceptable charge balance error (%) before error */
  ERROR_PERCENT: 10,
} as const;

export const SDI = {
  /** SDI limit for standard RO membrane feed */
  MAX_STANDARD: 5,
  /** SDI limit for sensitive low-fouling operation */
  MAX_SENSITIVE: 3,
} as const;

export const TURBIDITY = {
  /** Max NTU for RO feed (warning) */
  MAX_NTU_WARNING: 0.5,
  /** Max NTU for RO feed (error) */
  MAX_NTU_ERROR: 1.0,
} as const;

export const PRESSURE = {
  /** Minimum feed pressure for typical brackish RO (bar) */
  MIN_FEED_BAR: 2,
  /** Maximum allowable operating pressure brackish (bar) */
  MAX_BRACKISH_BAR: 41,
  /** Maximum allowable operating pressure seawater (bar) */
  MAX_SEAWATER_BAR: 83,
  /** Maximum differential pressure per element (bar) */
  MAX_ELEMENT_DP_BAR: 0.7,
  /** Maximum differential pressure per vessel (bar) */
  MAX_VESSEL_DP_BAR: 3.5,
} as const;

export const RECOVERY = {
  /** Minimum system recovery (fraction) before warning */
  MIN_FRACTION: 0.3,
  /** Maximum recommended system recovery (fraction) */
  MAX_BRACKISH_FRACTION: 0.85,
  /** Maximum recommended system recovery for seawater (fraction) */
  MAX_SEAWATER_FRACTION: 0.5,
} as const;

export const FLUX = {
  /** Maximum average flux for brackish RO (L/m²/h) */
  MAX_BRACKISH_LMH: 34,
  /** Maximum average flux for seawater RO (L/m²/h) */
  MAX_SEAWATER_LMH: 17,
} as const;
