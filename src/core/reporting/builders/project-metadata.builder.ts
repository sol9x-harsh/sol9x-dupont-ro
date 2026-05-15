import type { ProjectMetadataReport } from "@/core/reporting/models/report.models";
import type { ProjectMetadata } from "@/store/project-store";
import type { Pass } from "@/store/ro-config-store";
import {
  REPORT_APP_VERSION,
  REPORT_COMPANY,
  REPORT_DEFAULT_CASE_NAME,
  REPORT_DEFAULT_MARKET_SEGMENT,
} from "@/core/reporting/constants/report.constants";

export interface ProjectMetadataBuilderInput {
  project: ProjectMetadata | null;
  passes: Pass[];
  designWarnings: string[];
}

export function buildProjectMetadataReport(
  input: ProjectMetadataBuilderInput
): ProjectMetadataReport {
  const { project, passes, designWarnings } = input;

  // Derive element summary from RO config passes
  const elementMap = new Map<string, number>();
  for (const pass of passes) {
    for (const stage of pass.stages) {
      for (const vessel of stage.vessels) {
        const model = vessel.membraneModel || "Unknown";
        const count = vessel.elementsPerVessel;
        elementMap.set(model, (elementMap.get(model) ?? 0) + count);
      }
    }
  }
  const elements = Array.from(elementMap.entries()).map(([model, count]) => ({
    model,
    count,
  }));

  const now = new Date().toISOString().split("T")[0];

  return {
    projectNo: project?.id?.slice(0, 8).toUpperCase() ?? "N/A",
    projectName: project?.name ?? "Untitled Project",
    dateCreated: project?.createdAt?.split("T")[0] ?? now,
    lastModified: project?.updatedAt?.split("T")[0] ?? now,
    caseName: REPORT_DEFAULT_CASE_NAME,
    preparedBy: "Engineer",
    company: REPORT_COMPANY,
    customer: project?.client ?? "—",
    country: project?.location ?? "—",
    marketSegment: REPORT_DEFAULT_MARKET_SEGMENT,
    appVersion: REPORT_APP_VERSION,
    elements: elements.length > 0 ? elements : [{ model: "—", count: 0 }],
    designWarnings,
  };
}
