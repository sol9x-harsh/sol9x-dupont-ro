import { round } from "./math";

/**
 * Format an engineering number with fixed decimals and a unit label.
 * Example: formatEngValue(1234.567, 2, "bar") → "1234.57 bar"
 */
export function formatEngValue(value: number, decimals: number, unit: string): string {
  return `${round(value, decimals)} ${unit}`;
}

/**
 * Format a percentage with fixed decimals.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${round(value * 100, decimals)}%`;
}

/**
 * Format a flow rate for display.
 */
export function formatFlow(m3h: number, decimals = 2): string {
  return formatEngValue(m3h, decimals, "m³/h");
}

/**
 * Format a pressure for display.
 */
export function formatPressure(bar: number, decimals = 2): string {
  return formatEngValue(bar, decimals, "bar");
}

/**
 * Format a concentration for display.
 */
export function formatConcentration(mgL: number, decimals = 1): string {
  return formatEngValue(mgL, decimals, "mg/L");
}
