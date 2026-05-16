/**
 * Simulation runner — master orchestration bridge.
 *
 * Responsibility:
 *   1. Read current Zustand store state
 *   2. Assemble a valid SimulationContext
 *   3. Delegate to runSimulation() (pure engine)
 *   4. Return the SimulationResult for the action layer to push into the store
 *
 * This file is the ONLY place that couples stores to the engine.
 * No physics live here. No store writes happen here.
 */

import { useFeedStore } from '@/store/feed-store';
import { useROConfigStore } from '@/store/ro-config-store';
import { runSimulation } from '@/core/simulation/engine/simulation-engine';
import { SIMULATION_DEFAULTS } from '@/core/simulation/constants/simulation.constants';
import {
  resolveMembraneProperties,
  classifyWaterType,
} from '@/core/constants/membrane';
import type { MembraneDefaults } from '@/core/constants/membrane';
import type {
  SimulationContext,
  StageGeometryContext,
} from '@/core/simulation/engine/simulation-context';
import type { IonConcentrationMap } from '@/core/chemistry/balance/charge-balance';
import type { SimulationResult } from '@/core/simulation/engine/simulation-engine';
import { simulateChemicalAdjustment } from '@/core/chemistry/adjustment/chemical-adjustment';

// ─── Context assembly ─────────────────────────────────────────────────────────

function buildIonConcentrationMap(
  ions: ReturnType<typeof useFeedStore.getState>['chemistry']['ions'],
): IonConcentrationMap {
  // Keys MUST match the IONS constant abbreviations (Ca, Mg, Na…) so that
  // charge-balance, TDS, osmotic-pressure, and conductivity lookups resolve.
  return {
    // Cations
    NH4: ions.ammonium,
    Na: ions.sodium,
    K: ions.potassium,
    Mg: ions.magnesium,
    Ca: ions.calcium,
    Sr: ions.strontium,
    Ba: ions.barium,
    // Anions
    CO3: ions.carbonate,
    HCO3: ions.bicarbonate,
    NO3: ions.nitrate,
    F: ions.fluoride,
    Cl: ions.chloride,
    Br: ions.bromide,
    SO4: ions.sulfate,
    PO4: ions.phosphate,
    // Neutrals
    SiO2: ions.silica,
    B: ions.boron,
    CO2: ions.co2,
  };
}

function buildStageRecoveryFractions(
  passes: ReturnType<typeof useROConfigStore.getState>['passes'],
): number[] {
  const fractions: number[] = [];
  for (const pass of passes) {
    const stageCount = pass.stages.length;
    if (stageCount === 0) continue;
    const passRecovery = Math.min(Math.max(pass.recovery / 100, 0), 0.99);
    const perStageFraction = 1 - Math.pow(1 - passRecovery, 1 / stageCount);
    for (let i = 0; i < stageCount; i++) {
      fractions.push(perStageFraction);
    }
  }
  return fractions;
}

// Read per-stage pressure drops from the store; fall back to engine default when not set.
function buildStagePressureDrops(
  passes: ReturnType<typeof useROConfigStore.getState>['passes'],
): number[] {
  const drops: number[] = [];
  for (const pass of passes) {
    for (const stage of pass.stages) {
      if (stage.vessels.length === 0) continue;
      drops.push(
        stage.pressureDropBar != null && stage.pressureDropBar >= 0
          ? stage.pressureDropBar
          : SIMULATION_DEFAULTS.pressureDropPerStageBar,
      );
    }
  }
  return drops;
}

function buildStageRecycleFractions(
  passes: ReturnType<typeof useROConfigStore.getState>['passes'],
): number[] {
  const fractions: number[] = [];
  for (const pass of passes) {
    for (const stage of pass.stages) {
      if (stage.vessels.length === 0) continue;
      // Convert percentage to fraction
      fractions.push((stage.recyclePercent ?? 0) / 100);
    }
  }
  return fractions;
}

function buildStageGeometries(
  passes: ReturnType<typeof useROConfigStore.getState>['passes'],
  resolvedArea: number,
): StageGeometryContext[] {
  const geometries: StageGeometryContext[] = [];
  for (const pass of passes) {
    for (const stage of pass.stages) {
      const vesselCount = stage.vessels.length;
      if (vesselCount === 0) continue;
      const elementsPerVessel =
        stage.vessels[0]?.elementsPerVessel ??
        SIMULATION_DEFAULTS.elementCountPerVessel;
      geometries.push({
        vesselCount,
        elementCountPerVessel: elementsPerVessel,
        elementAreaM2: resolvedArea,
      });
    }
  }
  return geometries;
}

// ─── Guard: minimum viable context ───────────────────────────────────────────

function isContextViable(
  feedFlowM3h: number,
  feedPressureBar: number,
  stageRecoveryFractions: number[],
  stageGeometries: StageGeometryContext[],
): boolean {
  if (feedFlowM3h <= 0) return false;
  if (feedPressureBar <= 0) return false;
  if (stageRecoveryFractions.length === 0) return false;
  if (stageGeometries.length === 0) return false;
  if (stageRecoveryFractions.length !== stageGeometries.length) return false;
  return true;
}

// ─── Membrane resolution ──────────────────────────────────────────────────────

/**
 * Extract the dominant membrane model name from the pass/stage topology.
 * Uses the first vessel's membraneModel as representative of the system.
 */
function extractMembraneModelName(
  passes: ReturnType<typeof useROConfigStore.getState>['passes'],
): string | null {
  for (const pass of passes) {
    for (const stage of pass.stages) {
      if (stage.vessels.length > 0 && stage.vessels[0].membraneModel) {
        return stage.vessels[0].membraneModel;
      }
    }
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildSimulationContext(): SimulationContext | null {
  const feed = useFeedStore.getState();
  const roConfig = useROConfigStore.getState();

  // Derive feed TDS for membrane selection (ions sum or measured TDS).
  const ionSum = Object.values(feed.chemistry.ions).reduce((s, v) => s + v, 0);
  const effectiveTDS = feed.chemistry.tds > 0 ? feed.chemistry.tds : ionSum;

  const temperatureC =
    feed.activeTemperatureView === 'min'
      ? feed.chemistry.minTemperature
      : feed.activeTemperatureView === 'max'
        ? feed.chemistry.maxTemperature
        : feed.chemistry.designTemperature;

  const adjustmentResult = simulateChemicalAdjustment(
    feed.chemistry.ions,
    feed.chemistry.ph,
    temperatureC,
    roConfig.chemicalAdjustment,
  );
  const finalIons = adjustmentResult.final.ions;
  const finalPh = adjustmentResult.final.ph;

  // Resolve membrane properties from model name stored in vessels,
  // falling back to TDS-based auto-classification.
  const modelName = extractMembraneModelName(roConfig.passes);
  const membrane = resolveMembraneProperties(modelName, effectiveTDS);

  const stageRecoveryFractions = buildStageRecoveryFractions(roConfig.passes);
  const stageGeometries = buildStageGeometries(
    roConfig.passes,
    membrane.activeArea,
  );

  // Use feedPressureBar from the store (seeded / user-set).
  const feedPressureBar =
    roConfig.feedPressureBar > 0 ? roConfig.feedPressureBar : 10.0;
  // Calculate bypass flow
  const passOptimizationMode = roConfig.passOptimizationMode;
  const bypassValue = roConfig.bypassValue;
  const bypassMode = roConfig.bypassMode;
  const bypassFlowM3h = passOptimizationMode === 'Bypass' 
    ? (bypassMode === 'Percent' ? roConfig.feedFlow * bypassValue / 100 : bypassValue)
    : 0;

  // RO net feed is total feed minus bypass
  const feedFlowM3h = roConfig.feedFlow - bypassFlowM3h;

  if (
    !isContextViable(
      feedFlowM3h,
      feedPressureBar,
      stageRecoveryFractions,
      stageGeometries,
    )
  ) {
    return null;
  }

  // Read per-stage pressure drops from each Stage.pressureDropBar (user-entered ΔP PIPI).
  const stagePressureDrops = buildStagePressureDrops(roConfig.passes);

  // Use user-entered permeate back pressure; fall back to engine default if not set.
  const permeatePressureBar =
    roConfig.permeatePressureBar >= 0
      ? roConfig.permeatePressureBar
      : SIMULATION_DEFAULTS.permeatePressureBar;

  const context: SimulationContext = {
    feed: {
      concentrations: buildIonConcentrationMap(finalIons),
      measuredTDSMgL: feed.chemistry.tds > 0 ? feed.chemistry.tds : null,
      measuredConductivityUsCm:
        feed.chemistry.conductivity > 0 ? feed.chemistry.conductivity : null,
      temperatureC,
      pH: finalPh,
    },
    hydraulics: {
      feedFlowM3h,
      feedPressureBar,
      permeatePressureBar,
      stageRecoveryFractions,
      stagePressureDropsBar: stagePressureDrops,
      stageRecycleFractions: buildStageRecycleFractions(roConfig.passes),
      bypassFlowM3h,
    },
    membrane: {
      rejectionPercent: membrane.nominalRejection * 100,
      permeabilityA: membrane.permeabilityA,
      massTransferCoefficientMS: SIMULATION_DEFAULTS.massTransferCoefficientMS,
    },
    configuration: {
      stageCount: stageGeometries.length,
      stages: stageGeometries,
    },
    adjustmentResult,
  };

  return context;
}

export function runSimulationFromStores(
  context: SimulationContext,
): SimulationResult {
  const result = runSimulation(context);
  if (result.success && result.output) {
    result.output.adjustment = context.adjustmentResult;
    
    // Apply Bypass Blending Post-Simulation
    const bypassFlow = context.hydraulics.bypassFlowM3h ?? 0;
    if (bypassFlow > 0) {
      const roPermFlow = result.output.summary.totalPermeateFlowM3h;
      const roPermTDS = result.output.summary.blendedPermeateTDSMgL;
      
      // We assume bypass has the feed TDS (adjusted or raw). 
      // Typically bypass is raw treated feed.
      const bypassTDS = context.feed.measuredTDSMgL ?? 0; 

      const newTotalPermFlow = roPermFlow + bypassFlow;
      const newTotalTDS = newTotalPermFlow > 0 
        ? (roPermFlow * roPermTDS + bypassFlow * bypassTDS) / newTotalPermFlow 
        : 0;

      result.output.summary.totalPermeateFlowM3h = newTotalPermFlow;
      result.output.summary.blendedPermeateTDSMgL = newTotalTDS;
      
      // Also adjust system recovery to reflect total feed
      const totalFeed = context.hydraulics.feedFlowM3h + bypassFlow;
      if (totalFeed > 0) {
        result.output.summary.systemRecoveryPercent = (newTotalPermFlow / totalFeed) * 100;
      }
    }
  }
  return result;
}
