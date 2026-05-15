// Charge balance thresholds for industrial RO feed water analysis

/** Charge balance error (%) below which the stream is considered acceptable */
export const BALANCE_VALID_PCT = 2;

/** Charge balance error (%) above which a warning is issued */
export const BALANCE_WARNING_PCT = 5;

/** Charge balance error (%) above which the result is classified as critical */
export const BALANCE_CRITICAL_PCT = 10;

/**
 * Minimum sum of cation + anion meq/L required to attempt a balance check.
 * Below this the sample is too dilute for a meaningful balance ratio.
 */
export const BALANCE_MIN_TOTAL_MEQ_L = 0.01;
