import type { SystemOverviewReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";

export function buildSystemOverviewReport(
  output: SimulationOutput
): SystemOverviewReport {
  const { summary, hydraulics, chemistry } = output;

  return {
    totalUnits: 1,
    online: 1,
    standby: 0,
    roRecoveryPercent: summary.systemRecoveryPercent,
    systemFeedM3h: hydraulics.flows.feedFlowM3h,
    systemPermeateM3h: summary.totalPermeateFlowM3h,
    systemConcentrateM3h: summary.concentrateFlowM3h,
    feedTDSMgL: summary.feedTDSMgL,
    permeateTDSMgL: summary.blendedPermeateTDSMgL,
    concentrateTDSMgL: summary.concentrateTDSMgL,
    averageFluxLMH: summary.averageFluxLMH,
    lowestNdpBar: summary.lowestNdpBar,
    maxCPFactor: summary.maxCPFactor,
  };
}
