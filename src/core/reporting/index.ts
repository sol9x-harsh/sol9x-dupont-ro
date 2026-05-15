// ─── Report Engine Public API ─────────────────────────────────────────────────

// Models
export type {
  ProjectMetadataReport,
  SystemOverviewReport,
  PassSummaryReport,
  StreamTableReport,
  StageFlowReport,
  ElementFlowReport,
  SoluteAnalysisReport,
  SoluteRowReport,
  ScalingAnalysisReport,
  ScalingRowReport,
  WarningSummaryReport,
  CostSummaryReport,
  EnergySummaryReport,
  FullEngineeringReport,
} from "./models/report.models";

// Builders
export {
  buildProjectMetadataReport,
  buildSystemOverviewReport,
  buildPassSummaryReport,
  buildStreamTableReport,
  buildStageFlowReport,
  buildElementFlowReport,
  buildSoluteAnalysisReport,
  buildScalingAnalysisReport,
  buildWarningSummaryReport,
  buildCostSummaryReport,
  buildEnergySummaryReport,
  buildEngineeringReport,
} from "./builders";
export type { EngineeringReportInput } from "./builders";

// Formatters
export {
  formatPressure,
  formatFlow,
  formatRecovery,
  formatConductivity,
  formatOsmoticPressure,
  formatTDS,
  formatFlux,
  formatEnergy,
  formatPower,
  formatPercent,
  formatPH,
  formatNDP,
  formatTemperature,
} from "./formatters/engineering.formatters";

// Constants
export {
  REPORT_APP_VERSION,
  REPORT_COMPANY,
  REPORT_DEFAULT_ELEMENT_AREA_M2,
} from "./constants/report.constants";

// Sections
export { REPORT_SECTIONS } from "./sections";
export type { ReportSectionId } from "./sections";
