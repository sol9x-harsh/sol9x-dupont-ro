/**
 * Return value if it is a finite number, otherwise return the fallback.
 */
export function fallbackIfInvalid(value: number | null | undefined, fallback: number): number {
  if (value == null || !isFinite(value) || isNaN(value)) return fallback;
  return value;
}

/**
 * Ensure a concentration value is non-negative.
 */
export function nonNegative(value: number): number {
  return Math.max(0, value);
}

/**
 * Ensure a recovery fraction is within [0, 1].
 */
export function clampRecovery(recovery: number): number {
  return Math.min(Math.max(recovery, 0), 1);
}
