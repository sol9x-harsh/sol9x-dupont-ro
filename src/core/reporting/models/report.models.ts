// ─── Pure engineering report models ──────────────────────────────────────────
// No UI logic. No React imports. Export-ready structured data only.

export interface ProjectMetadataReport {
  projectNo: string;
  projectName: string;
  dateCreated: string;
  lastModified: string;
  caseName: string;
  preparedBy: string;
  company: string;
  customer: string;
  country: string;
  marketSegment: string;
  appVersion: string;
  elements: { model: string; count: number }[];
  designWarnings: string[];
}

export interface SystemOverviewReport {
  totalUnits: number;
  online: number;
  standby: number;
  roRecoveryPercent: number;
  systemFeedM3h: number;
  systemPermeateM3h: number;
  systemConcentrateM3h: number;
  feedTDSMgL: number;
  permeateTDSMgL: number;
  concentrateTDSMgL: number;
  averageFluxLMH: number;
  lowestNdpBar: number;
  maxCPFactor: number;
}

export interface PassSummaryReport {
  name: string;
  waterType: string;
  numElements: number;
  totalActiveAreaM2: number;
  feedFlowM3h: number;
  feedTDSMgL: number;
  feedPressureBar: number;
  flowFactor: number;
  permeateFlowM3h: number;
  avgFluxLMH: number;
  permeateTDSMgL: number;
  netRecoveryPercent: number;
  avgNdpBar: number;
  specificEnergykWh: number;
  tempC: number;
  pH: number;
  chemicalDose?: string;
}

export interface StreamTableReport {
  id: string;
  name: string;
  flowM3h: number;
  tdsMgL: number;
  pressureBar: number;
  conductivityUScm?: number;
  osmoticPressureBar?: number;
}

export interface StageFlowReport {
  stageIndex: number;
  elementCount: number;
  vesselCount: number;
  elementsPerVessel: number;
  feedFlowM3h: number;
  concentrateFlowM3h: number;
  feedPressureBar: number;
  concentratePressureBar: number;
  pressureDropBar: number;
  permeateFlowM3h: number;
  avgFluxLMH: number;
  permeatePressureBar: number;
  permeateTDSMgL: number;
  recoveryPercent: number;
  ndpBar: number;
  cpFactor: number;
}

export interface ElementFlowReport {
  name: string;
  recoveryPercent: number;
  feedFlowM3h: number;
  feedPressureBar: number;
  feedTDSMgL: number;
  concentrateFlowM3h: number;
  permeateFlowM3h: number;
  permeateFluxLMH: number;
  permeateTDSMgL: number;
}

export interface SoluteRowReport {
  ion: string;
  rawFeedMgL: string;
  phAdjustedFeedMgL: string;
  concentrateMgL: string;
  permeateMgL: string;
}

export interface SoluteAnalysisReport {
  rows: SoluteRowReport[];
  feedPH: number;
  adjustedPH: number;
  concentratePH: number;
  feedConductivityUScm: number;
  concentrateConductivityUScm: number;
  permeateConductivityUScm: number;
}

export interface ScalingRowReport {
  parameter: string;
  beforePH: string;
  afterPH: string;
  concentrate: string;
}

export interface ScalingAnalysisReport {
  rows: ScalingRowReport[];
  lsi: number | null;
  sdix: number | null;
}

export interface WarningSummaryReport {
  warnings: {
    code: string;
    severity: "info" | "warning" | "critical";
    message: string;
    value?: number;
    threshold?: number;
  }[];
  hasWarnings: boolean;
  hasCritical: boolean;
  designWarnings: string[];
}

export interface CostSummaryReport {
  waterCosts: {
    category: string;
    flowRateM3h: number;
    unitCostPerM3: number;
    hourlyCost: number;
    dailyCost: number;
  }[];
  energyCosts: {
    item: string;
    peakPowerkW: number;
    energykWh: number;
    unitCostPerKwh: number;
    cost: number;
    specificEnergykWhM3?: number;
  }[];
  chemicalCosts: {
    item: string;
    unitCostPerKg: number;
    doseMgL: number;
    volumeKgH: number;
    cost: number;
  }[];
}

export interface EnergySummaryReport {
  specificEnergykWhM3: number;
  totalPowerkW: number;
  feedPressureBar: number;
  systemRecoveryPercent: number;
}

export interface FullEngineeringReport {
  generatedAt: string;
  metadata: ProjectMetadataReport;
  systemOverview: SystemOverviewReport;
  passes: PassSummaryReport[];
  streams: StreamTableReport[];
  stages: StageFlowReport[];
  elements: ElementFlowReport[];
  soluteAnalysis: SoluteAnalysisReport;
  scalingAnalysis: ScalingAnalysisReport;
  warnings: WarningSummaryReport;
  costs: CostSummaryReport;
  energy: EnergySummaryReport;
}
