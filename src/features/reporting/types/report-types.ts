export interface ProjectMetadata {
  projectNo: string;
  projectName: string;
  dateCreated: string;
  lastModified: string;
  elements: { model: string; count: number }[];
  caseName: string;
  preparedBy: string;
  company: string;
  customer: string;
  country: string;
  marketSegment: string;
  appVersion: string;
  designWarnings: string[];
}

export interface SystemOverview {
  totalUnits: number;
  online: number;
  standby: number;
  roRecovery: number;
  systemFeed: number;
  systemPermeate: number;
}

export interface PassSummary {
  name: string;
  waterType: string;
  numElements: number;
  totalActiveArea: number;
  feedFlow: number;
  feedTds: number;
  feedPressure: number;
  flowFactor: number;
  permeateFlow: number;
  avgFlux: number;
  permeateTds: number;
  netRecovery: number;
  avgNdp: number;
  specificEnergy: number;
  temp: number;
  pH: number;
  chemicalDose?: string;
}

export interface StreamData {
  id: string;
  name: string;
  flow: number;
  tds: number;
  pressure: number;
}

export interface StageFlowData {
  stage: number;
  elements: number;
  pv: number;
  elsPerPv: number;
  feedFlow: number;
  recircFlow: number;
  feedPress: number;
  boostPress: number;
  concFlow: number;
  concPress: number;
  pressDrop: number;
  permFlow: number;
  avgFlux: number;
  permPress: number;
  permTds: number;
}

export interface ElementFlowData {
  name: string;
  recovery: number;
  feedFlow: number;
  feedPress: number;
  feedTds: number;
  concFlow: number;
  permFlow: number;
  permFlux: number;
  permTds: number;
}

export interface SoluteData {
  ion: string;
  rawFeed: string;
  phAdjustedFeed: string;
  concentrate: string;
  permeate: string;
}

export interface ScalingData {
  parameter: string;
  beforePh: string;
  afterPh: string;
  concentrate: string;
}

export interface CostData {
  category: string;
  flowRate: number;
  unitCost: number;
  hourlyCost: number;
  dailyCost: number;
}

export interface EnergyCostData {
  item: string;
  peakPower: number;
  energy: number;
  unitCost: number;
  cost: number;
  specificEnergy?: number;
}

export interface ChemicalCostData {
  item: string;
  unitCost: number;
  dose: number;
  volume: number;
  cost: number;
}
