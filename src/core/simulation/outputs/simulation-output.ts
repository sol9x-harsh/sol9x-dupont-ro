import type { BalanceAnalysis } from "@/core/chemistry/balance/balance-analysis";
import type { TDSResult } from "@/core/chemistry/tds/tds-analysis";
import type { ConductivityDualResult } from "@/core/chemistry/conductivity/conductivity-analysis";
import type { OsmoticPressureResult } from "@/core/chemistry/osmotic/osmotic-analysis";
import type { SystemFlows } from "@/core/hydraulics/flow/flow-propagation";
import type { SystemPressures } from "@/core/hydraulics/pressure/pressure-propagation";
import type { SystemNDPResult } from "@/core/hydraulics/ndp/ndp-analysis";
import type { SystemFluxResult } from "@/core/hydraulics/flux/flux-analysis";
import type { SystemCPResult } from "@/core/hydraulics/concentration-polarization/cp-analysis";
import type { SystemQualityResult } from "@/core/membrane/salt-passage/salt-analysis";
import type { ChemistryAdjustmentResult } from "@/core/chemistry/adjustment/chemical-adjustment";
import type { SimulationWarning } from "./quality-output";

export interface ChemistryOutput {
  chargeBalance: BalanceAnalysis;
  tds: TDSResult;
  conductivity: ConductivityDualResult;
  osmoticPressure: OsmoticPressureResult;
}

export interface HydraulicsOutput {
  flows: SystemFlows;
  pressures: SystemPressures;
  ndp: SystemNDPResult;
  flux: SystemFluxResult;
  cp: SystemCPResult;
}

export interface PermeateOutput {
  quality: SystemQualityResult;
}

export type SimulationStatus = "ok" | "warning" | "critical" | "invalid";

export interface SystemSummaryOutput {
  feedTDSMgL: number;
  systemRecoveryFraction: number;
  systemRecoveryPercent: number;
  blendedPermeateTDSMgL: number;
  blendedRejectionPercent: number;
  totalPermeateFlowM3h: number;
  concentrateFlowM3h: number;
  concentrateTDSMgL: number;
  averageFluxLMH: number;
  lowestNdpBar: number;
  maxCPFactor: number;
  status: SimulationStatus;
  warnings: SimulationWarning[];
}

export interface SimulationOutput {
  chemistry: ChemistryOutput;
  adjustment?: ChemistryAdjustmentResult;
  hydraulics: HydraulicsOutput;
  permeate: PermeateOutput;
  summary: SystemSummaryOutput;
  warnings: SimulationWarning[];
}
