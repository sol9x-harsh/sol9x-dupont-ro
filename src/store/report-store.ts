import { create } from "zustand";

export type ClimateMode = "standard" | "high-temp" | "low-temp" | "seasonal";
export type ExportFormat = "pdf" | "xlsx" | "csv";

export type ReportSection =
  | "project-summary"
  | "feed-analysis"
  | "system-design"
  | "performance-table"
  | "economic-breakdown"
  | "chemical-analysis"
  | "scaling-index";

export interface ExportSettings {
  format: ExportFormat;
  includeCharts: boolean;
  includePFD: boolean;
  includeRawData: boolean;
}

interface ReportState {
  selectedSections: ReportSection[];
  climateMode: ClimateMode;
  exportSettings: ExportSettings;
  toggleSection: (section: ReportSection) => void;
  setSelectedSections: (sections: ReportSection[]) => void;
  setClimateMode: (mode: ClimateMode) => void;
  updateExportSettings: (patch: Partial<ExportSettings>) => void;
  hydrateReport: (data: Partial<{ selectedSections: ReportSection[]; climateMode: ClimateMode; exportSettings: ExportSettings }>) => void;
  resetReport: () => void;
}

const defaultSections: ReportSection[] = [
  "project-summary",
  "feed-analysis",
  "system-design",
  "performance-table",
];

const defaultExportSettings: ExportSettings = {
  format: "pdf",
  includeCharts: true,
  includePFD: true,
  includeRawData: false,
};

export const useReportStore = create<ReportState>((set) => ({
  selectedSections: defaultSections,
  climateMode: "standard",
  exportSettings: defaultExportSettings,

  toggleSection: (section) =>
    set((state) => ({
      selectedSections: state.selectedSections.includes(section)
        ? state.selectedSections.filter((s) => s !== section)
        : [...state.selectedSections, section],
    })),

  setSelectedSections: (sections) => set({ selectedSections: sections }),

  setClimateMode: (climateMode) => set({ climateMode }),

  updateExportSettings: (patch) =>
    set((state) => ({
      exportSettings: { ...state.exportSettings, ...patch },
    })),

  hydrateReport: (data) => set((state) => ({
    selectedSections: data.selectedSections ?? state.selectedSections,
    climateMode: data.climateMode ?? state.climateMode,
    exportSettings: data.exportSettings ?? state.exportSettings,
  })),

  resetReport: () =>
    set({
      selectedSections: defaultSections,
      climateMode: "standard",
      exportSettings: defaultExportSettings,
    }),
}));
