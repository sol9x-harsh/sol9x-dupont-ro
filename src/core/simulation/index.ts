// Master simulation engine entry point
export { runSimulation, runSimulationPipeline } from "./engine";
export type { SimulationResult, SimulationContext } from "./engine";

// Output types
export type {
  SimulationOutput,
  ChemistryOutput,
  HydraulicsOutput,
  PermeateOutput,
  SystemSummaryOutput,
  SimulationStatus,
  SimulationWarning,
  WarningSeverity,
  StageOutput,
} from "./outputs";

// Validation
export {
  validateSimulationContext,
  validateFeedConditions,
  validateRecovery,
  validatePressures,
  validateStageConfiguration,
} from "./validation";
export type { ValidationResult } from "./validation";

// Constants
export { SIMULATION_DEFAULTS, SIMULATION_VERSION, WARNING_THRESHOLDS } from "./constants/simulation.constants";
