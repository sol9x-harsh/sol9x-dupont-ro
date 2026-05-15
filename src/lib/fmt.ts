/**
 * Centralized engineering number formatters.
 *
 * All display values must pass through these helpers so that:
 * - Floating-point artifacts (41.9999999999986) are rounded correctly
 * - NaN / Infinity always render as the fallback string
 * - Precision is consistent across the entire studio
 */

function safeRound(v: unknown, decimals: number): number | null {
  const n = Number(v);
  if (!isFinite(n)) return null;
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

/** Flow rate — 2 decimal places, m³/h */
export function fmtFlow(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 2);
  return r === null ? fallback : r.toFixed(2);
}

/** Recovery percentage — 1 decimal, already in % units (not fraction) */
export function fmtRecovery(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 1);
  if (r === null) return fallback;
  return `${Math.min(100, Math.max(0, r)).toFixed(1)}%`;
}

/** Pressure — 1 decimal, bar */
export function fmtPressure(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 1);
  return r === null ? fallback : r.toFixed(1);
}

/** TDS — 3 decimal places, mg/L */
export function fmtTDS(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 3);
  return r === null ? fallback : r.toFixed(3);
}

/** Flux — 1 decimal, LMH */
export function fmtFlux(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 1);
  return r === null ? fallback : r.toFixed(1);
}

/** NDP — 2 decimals, bar */
export function fmtNDP(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 2);
  return r === null ? fallback : r.toFixed(2);
}

/** CP factor — 3 decimals */
export function fmtCP(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 3);
  return r === null ? fallback : r.toFixed(3);
}

/** Conductivity — 3 decimal places, µS/cm */
export function fmtConductivity(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 3);
  return r === null ? fallback : r.toFixed(3);
}

/** Osmotic pressure — 2 decimals, bar */
export function fmtOsmotic(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 2);
  return r === null ? fallback : r.toFixed(2);
}

/** Generic ion concentration — 3 decimals, mg/L */
export function fmtConc(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 3);
  return r === null ? fallback : r.toFixed(3);
}

/** meq/L — 3 decimals */
export function fmtMeq(v: unknown, fallback = '—'): string {
  const r = safeRound(v, 3);
  return r === null ? fallback : r.toFixed(3);
}

/** Charge balance difference — 6 decimal places, meq/L (Standard format) */
export function fmtChargeBalance(v: unknown, fallback = '—'): string {
  const n = Number(v);
  if (!isFinite(n)) return fallback;
  return n.toFixed(6);
}
