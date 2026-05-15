/**
 * Round to a fixed number of decimal places.
 */
export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Safe division — returns fallback (default 0) when divisor is zero.
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (denominator === 0) return fallback;
  return numerator / denominator;
}

/**
 * Clamp a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between a and b at fraction t (0–1).
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Returns true if value is a finite, non-NaN number.
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && isFinite(value) && !isNaN(value);
}
