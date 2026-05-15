import type { WarningSummaryReport } from "@/core/reporting/models/report.models";
import type { NormalizedWarning } from "@/store/simulation-store";

export function buildWarningSummaryReport(
  warnings: NormalizedWarning[],
  designWarnings: string[]
): WarningSummaryReport {
  return {
    warnings,
    hasWarnings: warnings.length > 0,
    hasCritical: warnings.some((w) => w.severity === "critical"),
    designWarnings,
  };
}
