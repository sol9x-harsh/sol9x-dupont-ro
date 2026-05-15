import { barToPsi, barToKpa } from "@/core/units/pressure";
import {
  NDP_MIN_HYDRAULIC_DELTA_P_BAR,
  NDP_ZERO_TOLERANCE_BAR,
} from "@/core/hydraulics/ndp/ndp.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NDPResult {
  hydraulicDeltaPBar: number;
  osmoticPressureBar: number;
  ndpBar: number;
  ndpPsi: number;
  ndpKpa: number;
}

// ─── Core calculations ────────────────────────────────────────────────────────

/**
 * Calculate hydraulic driving force across the membrane.
 *   ΔP_hydraulic = P_feed − P_permeate
 *
 * Returns null if either pressure is invalid or feed ≤ permeate.
 */
export function calculateHydraulicDeltaP(
  feedPressureBar: number,
  permeatePressureBar: number
): number | null {
  if (
    !Number.isFinite(feedPressureBar) ||
    !Number.isFinite(permeatePressureBar) ||
    feedPressureBar < NDP_MIN_HYDRAULIC_DELTA_P_BAR
  ) {
    return null;
  }

  const deltaP = feedPressureBar - Math.max(permeatePressureBar, 0);
  return deltaP > 0 ? deltaP : 0;
}

/**
 * Calculate Net Driving Pressure (NDP).
 *   NDP = (P_feed − P_permeate) − π_feed
 *
 * NDP is the membrane-driving force available after overcoming osmotic back-pressure.
 * Negative NDP means the system cannot produce permeate at the given conditions.
 * Returns null if inputs are invalid.
 */
export function calculateNDP(
  feedPressureBar: number,
  permeatePressureBar: number,
  osmoticPressureBar: number
): NDPResult | null {
  const hydraulicDeltaP = calculateHydraulicDeltaP(feedPressureBar, permeatePressureBar);

  if (hydraulicDeltaP === null) return null;

  if (!Number.isFinite(osmoticPressureBar) || osmoticPressureBar < 0) {
    return null;
  }

  const ndpBar = hydraulicDeltaP - osmoticPressureBar;

  return {
    hydraulicDeltaPBar: hydraulicDeltaP,
    osmoticPressureBar,
    ndpBar,
    ndpPsi: barToPsi(ndpBar),
    ndpKpa: barToKpa(ndpBar),
  };
}

/**
 * Calculate effective driving pressure — NDP clamped to zero.
 * A negative NDP cannot produce permeate; effective driving pressure is 0 in that case.
 *
 * Use this when a non-negative value is required for downstream calculations
 * (e.g. flux estimation guard). For analysis and warnings, use calculateNDP directly.
 */
export function calculateEffectiveDrivingPressure(
  feedPressureBar: number,
  permeatePressureBar: number,
  osmoticPressureBar: number
): NDPResult | null {
  const raw = calculateNDP(feedPressureBar, permeatePressureBar, osmoticPressureBar);
  if (raw === null) return null;

  const clampedNdp = Math.max(raw.ndpBar, 0);
  const isEffectivelyZero = clampedNdp < NDP_ZERO_TOLERANCE_BAR;

  return {
    hydraulicDeltaPBar: raw.hydraulicDeltaPBar,
    osmoticPressureBar: raw.osmoticPressureBar,
    ndpBar: isEffectivelyZero ? 0 : clampedNdp,
    ndpPsi: isEffectivelyZero ? 0 : barToPsi(clampedNdp),
    ndpKpa: isEffectivelyZero ? 0 : barToKpa(clampedNdp),
  };
}
