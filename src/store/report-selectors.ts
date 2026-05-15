/**
 * Report selectors — derive fully computed report-ready objects from store state.
 *
 * Usage in components:
 *   const report = useEngineeringReport();
 *   const overview = useSystemOverviewReport();
 */

import { useSimulationStore } from "@/store/simulation-store";
import { useProjectStore } from "@/store/project-store";
import { useROConfigStore } from "@/store/ro-config-store";
import { useFeedStore } from "@/store/feed-store";

import {
  buildEngineeringReport,
  buildSystemOverviewReport,
  buildStreamTableReport,
  buildStageFlowReport,
  buildSoluteAnalysisReport,
  buildScalingAnalysisReport,
  buildWarningSummaryReport,
} from "@/core/reporting/builders";

import type {
  FullEngineeringReport,
  SystemOverviewReport,
  StreamTableReport,
  StageFlowReport,
  SoluteAnalysisReport,
  ScalingAnalysisReport,
  WarningSummaryReport,
} from "@/core/reporting/models/report.models";

// ─── Full engineering report ──────────────────────────────────────────────────

export function useEngineeringReport(): FullEngineeringReport | null {
  const output = useSimulationStore((s) => s.output);
  const warnings = useSimulationStore((s) => s.warnings);
  const project = useProjectStore((s) => s.currentProject);
  const passes = useROConfigStore((s) => s.passes);
  const feedChemistry = useFeedStore((s) => s.chemistry);
  const chemicalAdjustment = useROConfigStore((s) => s.chemicalAdjustment);

  if (!output) return null;

  return buildEngineeringReport({
    output,
    project,
    passes,
    feedChemistry,
    chemicalAdjustment,
    warnings,
  });
}

// ─── Partial selectors ────────────────────────────────────────────────────────

export function useSystemOverviewReport(): SystemOverviewReport | null {
  const output = useSimulationStore((s) => s.output);
  if (!output) return null;
  return buildSystemOverviewReport(output);
}

export function useFlowTableReport(): StreamTableReport[] | null {
  const output = useSimulationStore((s) => s.output);
  if (!output) return null;
  return buildStreamTableReport(output);
}

export function useStageFlowReport(): StageFlowReport[] | null {
  const output = useSimulationStore((s) => s.output);
  const passes = useROConfigStore((s) => s.passes);
  if (!output) return null;
  return buildStageFlowReport(output, passes);
}

export function useChemicalAnalysisReport(): SoluteAnalysisReport | null {
  const output = useSimulationStore((s) => s.output);
  const feedChemistry = useFeedStore((s) => s.chemistry);
  if (!output) return null;
  return buildSoluteAnalysisReport({
    output,
    ions: feedChemistry.ions,
    feedPH: feedChemistry.ph,
    adjustedPH: output.adjustment ? output.adjustment.final.ph : feedChemistry.ph,
  });
}

export function useScalingAnalysisReport(): ScalingAnalysisReport | null {
  const output = useSimulationStore((s) => s.output);
  const ions = useFeedStore((s) => s.chemistry.ions);
  if (!output) return null;
  return buildScalingAnalysisReport(output, ions);
}

export function useWarningSummaryReport(): WarningSummaryReport {
  const warnings = useSimulationStore((s) => s.warnings);
  const designWarnings = warnings
    .filter((w) => w.severity !== "info")
    .map((w) => w.message);
  return buildWarningSummaryReport(warnings, designWarnings);
}
