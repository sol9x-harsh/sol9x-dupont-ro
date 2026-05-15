import { barToPsi, barToKpa } from "@/core/units/pressure";
import {
  PRESSURE_MIN_COMPUTABLE_BAR,
  PRESSURE_DROP_MAX_PER_VESSEL_BAR,
  PRESSURE_DROP_DEFAULT_PER_ELEMENT_BAR,
} from "@/core/hydraulics/pressure/pressure.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PressureDropResult {
  pressureDropBar: number;
  pressureDropPsi: number;
  pressureDropKpa: number;
}

// ─── Pressure drop calculation ────────────────────────────────────────────────

/**
 * Calculate outlet pressure from inlet pressure and pressure drop.
 *   Pout = Pin − ΔP
 *
 * Returns null if inlet pressure is invalid.
 * Clamps outlet to 0 — negative outlet pressure is physically invalid.
 */
export function calculateOutletPressure(
  inletPressureBar: number,
  pressureDropBar: number
): number | null {
  if (
    !Number.isFinite(inletPressureBar) ||
    inletPressureBar < PRESSURE_MIN_COMPUTABLE_BAR
  ) {
    return null;
  }

  const drop = Number.isFinite(pressureDropBar) && pressureDropBar >= 0
    ? pressureDropBar
    : 0;

  return Math.max(inletPressureBar - drop, 0);
}

/**
 * Calculate pressure drop from known inlet and outlet pressures.
 *   ΔP = Pin − Pout
 *
 * Returns null if either pressure is invalid.
 * Clamps to 0 — pressure drop cannot be negative.
 */
export function calculatePressureDrop(
  inletPressureBar: number,
  outletPressureBar: number
): PressureDropResult | null {
  if (
    !Number.isFinite(inletPressureBar) ||
    inletPressureBar < PRESSURE_MIN_COMPUTABLE_BAR ||
    !Number.isFinite(outletPressureBar) ||
    outletPressureBar < 0
  ) {
    return null;
  }

  const bar = Math.max(inletPressureBar - outletPressureBar, 0);
  return {
    pressureDropBar: bar,
    pressureDropPsi: barToPsi(bar),
    pressureDropKpa: barToKpa(bar),
  };
}

/**
 * Estimate total pressure drop for a vessel from element count.
 *   ΔP = elementCount × ΔP_per_element
 *
 * Uses conservative default per-element ΔP if none provided.
 * Caps at the per-vessel engineering maximum.
 */
export function estimatePressureDropFromElements(
  elementCount: number,
  pressureDropPerElementBar: number = PRESSURE_DROP_DEFAULT_PER_ELEMENT_BAR
): PressureDropResult {
  const n = Number.isFinite(elementCount) && elementCount > 0
    ? Math.round(elementCount)
    : 0;

  const dropPerEl = Number.isFinite(pressureDropPerElementBar) && pressureDropPerElementBar >= 0
    ? pressureDropPerElementBar
    : PRESSURE_DROP_DEFAULT_PER_ELEMENT_BAR;

  const bar = Math.min(n * dropPerEl, PRESSURE_DROP_MAX_PER_VESSEL_BAR);
  return {
    pressureDropBar: bar,
    pressureDropPsi: barToPsi(bar),
    pressureDropKpa: barToKpa(bar),
  };
}

/**
 * Concentrate pressure equals outlet pressure of the last stage.
 * This is a simple alias that documents intent — same formula as calculateOutletPressure.
 */
export function calculateConcentratePressure(
  feedPressureBar: number,
  pressureDropBar: number
): number | null {
  return calculateOutletPressure(feedPressureBar, pressureDropBar);
}
