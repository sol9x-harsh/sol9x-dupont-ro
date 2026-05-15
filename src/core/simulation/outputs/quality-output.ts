export type WarningSeverity = "info" | "warning" | "critical";

export interface SimulationWarning {
  code: string;
  severity: WarningSeverity;
  message: string;
  value?: number;
  threshold?: number;
}

export interface StageOutput {
  stageIndex: number;
  feedFlowM3h: number;
  permeateFlowM3h: number;
  concentrateFlowM3h: number;
  recoveryFraction: number;
  inletPressureBar: number;
  outletPressureBar: number;
  ndpBar: number;
  fluxLMH: number;
  cpFactor: number;
  feedTDSMgL: number;
  permeateTDSMgL: number;
  concentrateTDSMgL: number;
  rejectionPercent: number;
}
