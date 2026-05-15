import { m3hToLh, lhToM3h, m3hToGpm } from "@/core/units/flow";
import {
  FLUX_DEFAULT_PERMEABILITY_A_BWRO,
  FLUX_MIN_COMPUTABLE_LMH,
  FLUX_MIN_AREA_M2,
  FLUX_GFD_TO_LMH,
  FLUX_LMH_TO_GFD,
  FLUX_STANDARD_ELEMENT_AREA_M2,
  FLUX_DEFAULT_ELEMENTS_PER_VESSEL,
} from "@/core/hydraulics/flux/flux.constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FluxResult {
  fluxLMH: number;
  fluxGFD: number;
  permeateFlowM3H: number;
  permeateFlowGPM: number;
  membraneAreaM2: number;
}

export interface VesselProductivity {
  elementCount: number;
  elementAreaM2: number;
  vesselAreaM2: number;
  fluxLMH: number;
  permeateFlowM3H: number;
  permeateFlowGPM: number;
}

export interface StageProductivity {
  vesselCount: number;
  elementCount: number;
  stageAreaM2: number;
  fluxLMH: number;
  permeateFlowM3H: number;
  permeateFlowGPM: number;
}

// ─── Unit conversion helpers ──────────────────────────────────────────────────

export const lmhToGfd = (lmh: number): number => lmh * FLUX_LMH_TO_GFD;
export const gfdToLmh = (gfd: number): number => gfd * FLUX_GFD_TO_LMH;

// ─── Core flux equations ──────────────────────────────────────────────────────

/**
 * Calculate membrane water flux.
 *   Jw = A × NDP
 *
 * where A is the water permeability coefficient (LMH/bar) and NDP is in bar.
 * Returns null if inputs are invalid or NDP ≤ 0.
 */
export function calculateFlux(
  ndpBar: number,
  permeabilityA: number = FLUX_DEFAULT_PERMEABILITY_A_BWRO
): number | null {
  if (
    !Number.isFinite(ndpBar) ||
    ndpBar <= 0 ||
    !Number.isFinite(permeabilityA) ||
    permeabilityA <= 0
  ) {
    return null;
  }

  return permeabilityA * ndpBar;
}

/**
 * Calculate permeate flow from flux and membrane area.
 *   Qp = Jw × Area
 *
 * fluxLMH: water flux (L/m²/h)
 * areaM2: active membrane area (m²)
 * Returns FluxResult or null if inputs are invalid.
 */
export function calculatePermeateFlowFromFlux(
  fluxLMH: number,
  areaM2: number
): FluxResult | null {
  if (
    !Number.isFinite(fluxLMH) ||
    fluxLMH < FLUX_MIN_COMPUTABLE_LMH ||
    !Number.isFinite(areaM2) ||
    areaM2 < FLUX_MIN_AREA_M2
  ) {
    return null;
  }

  // Qp (L/h) = Jw (L/m²/h) × A (m²)
  const permeateFlowLH = fluxLMH * areaM2;
  const permeateFlowM3H = lhToM3h(permeateFlowLH);

  return {
    fluxLMH,
    fluxGFD: lmhToGfd(fluxLMH),
    permeateFlowM3H,
    permeateFlowGPM: m3hToGpm(permeateFlowM3H),
    membraneAreaM2: areaM2,
  };
}

/**
 * Back-calculate flux from known permeate flow and membrane area.
 *   Jw = Qp / Area
 *
 * Useful when permeate flow is measured and flux needs to be derived.
 */
export function calculateFluxFromPermeateFlow(
  permeateFlowM3H: number,
  areaM2: number
): FluxResult | null {
  if (
    !Number.isFinite(permeateFlowM3H) ||
    permeateFlowM3H <= 0 ||
    !Number.isFinite(areaM2) ||
    areaM2 < FLUX_MIN_AREA_M2
  ) {
    return null;
  }

  const permeateFlowLH = m3hToLh(permeateFlowM3H);
  const fluxLMH = permeateFlowLH / areaM2;

  return {
    fluxLMH,
    fluxGFD: lmhToGfd(fluxLMH),
    permeateFlowM3H,
    permeateFlowGPM: m3hToGpm(permeateFlowM3H),
    membraneAreaM2: areaM2,
  };
}

/**
 * Calculate specific flux (flux per unit NDP).
 *   Jspec = Jw / NDP
 *
 * Specific flux equals permeability A under ideal conditions.
 * Useful for diagnosing membrane performance degradation over time.
 * Returns null if inputs are invalid.
 */
export function calculateSpecificFlux(
  fluxLMH: number,
  ndpBar: number
): number | null {
  if (
    !Number.isFinite(fluxLMH) ||
    fluxLMH < FLUX_MIN_COMPUTABLE_LMH ||
    !Number.isFinite(ndpBar) ||
    ndpBar <= 0
  ) {
    return null;
  }

  return fluxLMH / ndpBar;
}

// ─── Membrane productivity builders ──────────────────────────────────────────

/**
 * Calculate productivity for a single pressure vessel.
 * vesselElementCount: number of membrane elements in the vessel
 * fluxLMH: average flux across all elements in the vessel
 * elementAreaM2: active area per element
 */
export function calculateVesselProductivity(
  fluxLMH: number,
  vesselElementCount: number = FLUX_DEFAULT_ELEMENTS_PER_VESSEL,
  elementAreaM2: number = FLUX_STANDARD_ELEMENT_AREA_M2
): VesselProductivity | null {
  if (
    !Number.isFinite(fluxLMH) ||
    fluxLMH < FLUX_MIN_COMPUTABLE_LMH ||
    !Number.isFinite(vesselElementCount) ||
    vesselElementCount <= 0 ||
    !Number.isFinite(elementAreaM2) ||
    elementAreaM2 < FLUX_MIN_AREA_M2
  ) {
    return null;
  }

  const n = Math.round(vesselElementCount);
  const vesselAreaM2 = n * elementAreaM2;
  const permeateFlowLH = fluxLMH * vesselAreaM2;
  const permeateFlowM3H = lhToM3h(permeateFlowLH);

  return {
    elementCount: n,
    elementAreaM2,
    vesselAreaM2,
    fluxLMH,
    permeateFlowM3H,
    permeateFlowGPM: m3hToGpm(permeateFlowM3H),
  };
}

/**
 * Calculate productivity for a stage (multiple vessels in parallel).
 * vesselCount: number of pressure vessels in this stage
 * fluxLMH: average flux across the stage
 * vesselElementCount: elements per vessel
 * elementAreaM2: active area per element
 */
export function calculateStageProductivity(
  fluxLMH: number,
  vesselCount: number,
  vesselElementCount: number = FLUX_DEFAULT_ELEMENTS_PER_VESSEL,
  elementAreaM2: number = FLUX_STANDARD_ELEMENT_AREA_M2
): StageProductivity | null {
  if (
    !Number.isFinite(vesselCount) ||
    vesselCount <= 0
  ) {
    return null;
  }

  const vessel = calculateVesselProductivity(fluxLMH, vesselElementCount, elementAreaM2);
  if (vessel === null) return null;

  const n = Math.round(vesselCount);
  const stageAreaM2 = vessel.vesselAreaM2 * n;
  const permeateFlowM3H = vessel.permeateFlowM3H * n;

  return {
    vesselCount: n,
    elementCount: vessel.elementCount * n,
    stageAreaM2,
    fluxLMH,
    permeateFlowM3H,
    permeateFlowGPM: m3hToGpm(permeateFlowM3H),
  };
}
