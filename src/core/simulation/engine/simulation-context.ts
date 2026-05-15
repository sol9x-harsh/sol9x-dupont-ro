import type { IonConcentrationMap } from "@/core/chemistry/balance/charge-balance";
import type { ChemistryAdjustmentResult } from "@/core/chemistry/adjustment/chemical-adjustment";

export interface FeedChemistryContext {
  concentrations: IonConcentrationMap;
  measuredTDSMgL?: number | null;
  measuredConductivityUsCm?: number | null;
  temperatureC?: number;
  pH?: number | null;
}

export interface HydraulicsContext {
  feedFlowM3h: number;
  feedPressureBar: number;
  permeatePressureBar: number;
  stageRecoveryFractions: number[];
  stagePressureDropsBar: number[];
}

export interface MembraneContext {
  rejectionPercent: number;
  permeabilityA: number;
  massTransferCoefficientMS?: number;
}

export interface StageGeometryContext {
  vesselCount: number;
  elementCountPerVessel: number;
  elementAreaM2: number;
}

export interface ConfigurationContext {
  stageCount: number;
  stages: StageGeometryContext[];
}

export interface SimulationContext {
  feed: FeedChemistryContext;
  hydraulics: HydraulicsContext;
  membrane: MembraneContext;
  configuration: ConfigurationContext;
  adjustmentResult?: ChemistryAdjustmentResult;
}
