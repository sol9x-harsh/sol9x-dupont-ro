/**
 * Zustand selectors for simulation output.
 *
 * Use these in React components via:
 *   const flux = useSimulationStore(selectAverageFlux);
 *
 * Selectors are plain functions — no memoisation library needed at this
 * scale. Zustand's shallow comparison handles unnecessary re-renders when
 * the referenced slice hasn't changed.
 */

import type { SimulationState } from "./simulation-store.types";

// ─── System summary ───────────────────────────────────────────────────────────

export const selectSystemSummary = (s: SimulationState) => s.output?.summary ?? null;

export const selectSimulationStatus = (s: SimulationState) => s.status;

export const selectIsCalculating = (s: SimulationState) => s.isCalculating;

export const selectLastRun = (s: SimulationState) => s.lastRun;

export const selectSystemRecoveryPercent = (s: SimulationState) =>
  s.output?.summary.systemRecoveryPercent ?? null;

export const selectFeedTDS = (s: SimulationState) =>
  s.output?.summary.feedTDSMgL ?? null;

export const selectConcentrateTDS = (s: SimulationState) =>
  s.output?.summary.concentrateTDSMgL ?? null;

// ─── Permeate quality ─────────────────────────────────────────────────────────

export const selectBlendedPermeateTDS = (s: SimulationState) =>
  s.output?.summary.blendedPermeateTDSMgL ?? null;

export const selectBlendedRejection = (s: SimulationState) =>
  s.output?.summary.blendedRejectionPercent ?? null;

export const selectTotalPermeateFlow = (s: SimulationState) =>
  s.output?.summary.totalPermeateFlowM3h ?? null;

export const selectConcentrateFlow = (s: SimulationState) =>
  s.output?.summary.concentrateFlowM3h ?? null;

// ─── Flux ─────────────────────────────────────────────────────────────────────

export const selectAverageFlux = (s: SimulationState) =>
  s.output?.summary.averageFluxLMH ?? null;

export const selectStageFluxResults = (s: SimulationState) =>
  s.output?.hydraulics.flux.stages ?? null;

// ─── NDP ──────────────────────────────────────────────────────────────────────

export const selectLowestNDP = (s: SimulationState) =>
  s.output?.summary.lowestNdpBar ?? null;

export const selectStageNDPResults = (s: SimulationState) =>
  s.output?.hydraulics.ndp.stages ?? null;

// ─── Hydraulics ───────────────────────────────────────────────────────────────

export const selectSystemFlows = (s: SimulationState) =>
  s.output?.hydraulics.flows ?? null;

export const selectSystemPressures = (s: SimulationState) =>
  s.output?.hydraulics.pressures ?? null;

export const selectMaxCPFactor = (s: SimulationState) =>
  s.output?.summary.maxCPFactor ?? null;

export const selectStageCPResults = (s: SimulationState) =>
  s.output?.hydraulics.cp.stages ?? null;

// ─── Chemistry ────────────────────────────────────────────────────────────────

export const selectChargeBalance = (s: SimulationState) =>
  s.output?.chemistry.chargeBalance ?? null;

export const selectTDSResult = (s: SimulationState) =>
  s.output?.chemistry.tds ?? null;

export const selectConductivityResult = (s: SimulationState) =>
  s.output?.chemistry.conductivity ?? null;

export const selectOsmoticPressureResult = (s: SimulationState) =>
  s.output?.chemistry.osmoticPressure ?? null;

// ─── Adjustments ──────────────────────────────────────────────────────────────

export const selectAdjustmentResult = (s: SimulationState) =>
  s.output?.adjustment ?? null;

// ─── Warnings ─────────────────────────────────────────────────────────────────

export const selectWarnings = (s: SimulationState) => s.warnings;

export const selectValidationErrors = (s: SimulationState) => s.validationErrors;

export const selectCriticalWarnings = (s: SimulationState) =>
  s.warnings.filter((w) => w.severity === "critical");

export const selectHasWarnings = (s: SimulationState) => s.warnings.length > 0;

export const selectHasCriticalWarnings = (s: SimulationState) =>
  s.warnings.some((w) => w.severity === "critical");

export const selectEngineErrors = (s: SimulationState) => s.errors;
