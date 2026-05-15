import type { StreamTableReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import { REPORT_TDS_TO_CONDUCTIVITY_FACTOR } from "@/core/reporting/constants/report.constants";

export function buildStreamTableReport(
  output: SimulationOutput
): StreamTableReport[] {
  const { summary, hydraulics, chemistry } = output;

  const feedConductivity = chemistry.conductivity.conductivityUsCm;
  // Estimate concentrate and permeate conductivity by scaling from TDS ratio
  const concentrationFactor = summary.feedTDSMgL > 0
    ? summary.concentrateTDSMgL / summary.feedTDSMgL
    : 1;
  const permeateFraction = summary.feedTDSMgL > 0
    ? summary.blendedPermeateTDSMgL / summary.feedTDSMgL
    : 0;
  const concentrateConductivity = feedConductivity * concentrationFactor;
  const permeateConductivity = feedConductivity * permeateFraction;

  const feedPressure = hydraulics.pressures.feedPressureBar;
  const concentratePressure = hydraulics.pressures.concentratePressureBar;
  const feedOsmoticBar = chemistry.osmoticPressure.osmoticPressureBar;

  // Derive suction-side pressure (before HP pump) — typically 2-3 bar
  // This is the raw feed header pressure entering the skid
  const suctionPressureBar = Math.max(feedPressure * 0.05, 1.5);

  // Derive permeate back-pressure from stage data if available,
  // otherwise estimate from the pressure model
  const lastStage = hydraulics.pressures.stages[hydraulics.pressures.stages.length - 1];
  const permeateBackpressureBar = lastStage
    ? Math.max(lastStage.outletPressureBar * 0.02, 0.1)
    : 0.3;

  return [
    {
      id: "S-001",
      name: "System Feed",
      flowM3h: hydraulics.flows.feedFlowM3h,
      tdsMgL: summary.feedTDSMgL,
      pressureBar: suctionPressureBar,
      conductivityUScm: feedConductivity,
      osmoticPressureBar: feedOsmoticBar,
    },
    {
      id: "S-002",
      name: "Net Feed",
      flowM3h: hydraulics.flows.feedFlowM3h,
      tdsMgL: summary.feedTDSMgL,
      pressureBar: feedPressure,
      conductivityUScm: feedConductivity,
      osmoticPressureBar: feedOsmoticBar,
    },
    {
      id: "S-003",
      name: "Concentrate",
      flowM3h: summary.concentrateFlowM3h,
      tdsMgL: summary.concentrateTDSMgL,
      pressureBar: concentratePressure,
      conductivityUScm: concentrateConductivity,
    },
    {
      id: "S-004",
      name: "Pass 1 Permeate",
      flowM3h: summary.totalPermeateFlowM3h,
      tdsMgL: summary.blendedPermeateTDSMgL,
      pressureBar: permeateBackpressureBar,
      conductivityUScm: permeateConductivity,
    },
    {
      id: "S-005",
      name: "System Permeate",
      flowM3h: summary.totalPermeateFlowM3h,
      tdsMgL: summary.blendedPermeateTDSMgL,
      pressureBar: permeateBackpressureBar,
      conductivityUScm: permeateConductivity,
    },
  ];
}
