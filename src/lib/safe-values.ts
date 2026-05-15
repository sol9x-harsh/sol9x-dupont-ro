/** Guard against NaN / Infinity / undefined in engineering display values. */

export function safeNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isFinite(n) ? n : fallback;
}

export function safePercent(v: unknown, fallback = 0): number {
  return Math.min(100, Math.max(0, safeNumber(v, fallback)));
}

export function safePressure(v: unknown, fallback = 0): number {
  return Math.max(0, safeNumber(v, fallback));
}

export function safeFlow(v: unknown, fallback = 0): number {
  return Math.max(0, safeNumber(v, fallback));
}

export function safeTDS(v: unknown, fallback = 0): number {
  return Math.max(0, safeNumber(v, fallback));
}
