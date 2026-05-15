export { useProjectStore } from "./project-store";
export type { ProjectMetadata, ProjectStatus } from "./project-store";

export { useUIStore } from "./ui-store";
export type { ViewMode, WorkspaceSection } from "./ui-store";

export { useFeedStore } from "./feed-store";
export type { FeedChemistry, IonComposition, FeedPreset } from "./feed-store";

export { useROConfigStore } from "./ro-config-store";
export type { Pass, Stage, Vessel, ChemicalAdjustment } from "./ro-config-store";

export { useSimulationStore } from "./simulation-store";
export type { SimulationStatus, NormalizedWarning, SimulationOutput } from "./simulation-store";

// Simulation module — actions, selectors, triggers
export * from "./simulation/simulation-actions";
export * from "./simulation/simulation-selectors";

export { useReportStore } from "./report-store";
export type { ClimateMode, ExportFormat, ReportSection, ExportSettings } from "./report-store";
