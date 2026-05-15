// Section identifiers for report export selection
export const REPORT_SECTIONS = [
  "project-metadata",
  "system-overview",
  "flow-tables",
  "chemical-analysis",
  "scaling-analysis",
  "cost-breakdown",
  "energy-summary",
  "warnings",
  "pfd",
] as const;

export type ReportSectionId = (typeof REPORT_SECTIONS)[number];
