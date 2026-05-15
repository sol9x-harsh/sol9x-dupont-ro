export interface FlowStream {
  /** Flow rate (m³/h) */
  flowM3h: number;
  /** Pressure (bar) */
  pressureBar: number;
  /** TDS (mg/L) */
  tds: number;
}

export interface RecoveryCalc {
  /** Feed flow (m³/h) */
  feedFlow: number;
  /** Permeate flow (m³/h) */
  permeateFlow: number;
  /** Reject flow (m³/h) */
  rejectFlow: number;
  /** Recovery fraction (0–1) */
  recovery: number;
}

export interface StageFlows {
  stageIndex: number;
  feed: FlowStream;
  permeate: FlowStream;
  reject: FlowStream;
  recovery: number;
}

export interface SystemFlows {
  feed: FlowStream;
  permeate: FlowStream;
  reject: FlowStream;
  systemRecovery: number;
  stages: StageFlows[];
}
