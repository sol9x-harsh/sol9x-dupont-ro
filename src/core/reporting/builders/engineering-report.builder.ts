import type { FullEngineeringReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { ProjectMetadata } from "@/store/project-store";
import type { Pass, ChemicalAdjustment } from "@/store/ro-config-store";
import type { FeedChemistry } from "@/store/feed-store";
import type { NormalizedWarning } from "@/store/simulation-store";

import { buildProjectMetadataReport } from "./project-metadata.builder";
import { buildSystemOverviewReport } from "./system-overview.builder";
import { buildPassSummaryReport } from "./pass-summary.builder";
import { buildStreamTableReport } from "./stream-table.builder";
import { buildStageFlowReport } from "./stage-flow.builder";
import { buildElementFlowReport } from "./element-flow.builder";
import { buildSoluteAnalysisReport } from "./solute-analysis.builder";
import { buildScalingAnalysisReport } from "./scaling-analysis.builder";
import { buildWarningSummaryReport } from "./warning-summary.builder";
import { buildCostSummaryReport, buildEnergySummaryReport } from "./cost-summary.builder";

export interface EngineeringReportInput {
  output: SimulationOutput;
  project: ProjectMetadata | null;
  passes: Pass[];
  feedChemistry: FeedChemistry;
  chemicalAdjustment: ChemicalAdjustment;
  warnings: NormalizedWarning[];
}

export function buildEngineeringReport(
  input: EngineeringReportInput
): FullEngineeringReport {
  const { output, project, passes, feedChemistry, chemicalAdjustment, warnings } = input;

  const warningSummary = buildWarningSummaryReport(
    warnings,
    warningSummary_designWarnings(warnings)
  );

  const metadata = buildProjectMetadataReport({
    project,
    passes,
    designWarnings: warningSummary.designWarnings,
  });

  return {
    generatedAt: new Date().toISOString(),
    metadata,
    systemOverview: buildSystemOverviewReport(output),
    passes: buildPassSummaryReport({ output, passes, feedChemistry }),
    streams: buildStreamTableReport(output),
    stages: buildStageFlowReport(output, passes),
    elements: buildElementFlowReport(output, passes),
    soluteAnalysis: buildSoluteAnalysisReport({
      output,
      ions: feedChemistry.ions,
      feedPH: feedChemistry.ph,
      adjustedPH: output.adjustment ? output.adjustment.final.ph : feedChemistry.ph,
    }),
    scalingAnalysis: buildScalingAnalysisReport(output, feedChemistry.ions),
    warnings: warningSummary,
    costs: buildCostSummaryReport(output, chemicalAdjustment),
    energy: buildEnergySummaryReport(output),
  };
}

function warningSummary_designWarnings(warnings: NormalizedWarning[]): string[] {
  return warnings
    .filter((w) => w.severity === "warning" || w.severity === "critical")
    .map((w) => w.message);
}
