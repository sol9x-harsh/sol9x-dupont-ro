import type { PassSummaryReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { Pass } from "@/store/ro-config-store";
import type { FeedChemistry } from "@/store/feed-store";
import {
  REPORT_PASS_LABELS,
  REPORT_PASS_WATER_TYPES,
  REPORT_DEFAULT_ELEMENT_AREA_M2,
  REPORT_PUMP_EFFICIENCY,
  REPORT_MOTOR_EFFICIENCY,
} from "@/core/reporting/constants/report.constants";
import { resolveMembraneProperties } from "@/core/constants/membrane";

export interface PassSummaryBuilderInput {
  output: SimulationOutput;
  passes: Pass[];
  feedChemistry: FeedChemistry;
}

function estimateSpecificEnergy(feedPressureBar: number, recoveryFraction: number): number {
  if (recoveryFraction <= 0) return 0;
  // SE = (P × Qf) / (η_pump × η_motor × Qp) = P / (η × r)
  const pressurePa = feedPressureBar * 1e5;
  const seJm3 = pressurePa / (REPORT_PUMP_EFFICIENCY * REPORT_MOTOR_EFFICIENCY * recoveryFraction);
  return seJm3 / 3_600_000; // convert J/m³ to kWh/m³
}

export function buildPassSummaryReport(
  input: PassSummaryBuilderInput
): PassSummaryReport[] {
  const { output, passes, feedChemistry } = input;
  const { hydraulics, summary, chemistry } = output;

  // Only pass 1 has full simulation data at this stage
  const pass1Stages = hydraulics.flux.stages;
  const pressureStages = hydraulics.pressures.stages;
  const ndpStages = hydraulics.ndp.stages;
  const flowStages = hydraulics.flows.stages;

  const results: PassSummaryReport[] = [];

  passes.forEach((pass, passIdx) => {
    const label = REPORT_PASS_LABELS[passIdx] ?? `Pass ${passIdx + 1}`;
    const waterType = REPORT_PASS_WATER_TYPES[passIdx] ?? "Feed Water";

    // Count total elements across stages/vessels
    let numElements = 0;
    let totalActiveAreaM2 = 0;
    for (const stage of pass.stages) {
      for (const vessel of stage.vessels) {
        const props = resolveMembraneProperties(vessel.membraneModel, summary.feedTDSMgL);
        numElements += vessel.elementsPerVessel;
        totalActiveAreaM2 += vessel.elementsPerVessel * props.activeArea;
      }
    }

    const feedPressureBar = pressureStages[0]?.inletPressureBar ?? hydraulics.pressures.feedPressureBar;
    const avgFluxLMH = passIdx === 0
      ? (pass1Stages.length > 0
          ? pass1Stages.reduce((s, st) => s + st.fluxLMH, 0) / pass1Stages.length
          : summary.averageFluxLMH)
      : summary.averageFluxLMH;

    const recoveryFraction = passIdx === 0
      ? summary.systemRecoveryFraction
      : pass.recovery / 100;

    const feedFlowM3h = passIdx === 0 ? hydraulics.flows.feedFlowM3h : summary.totalPermeateFlowM3h;
    const permeateFlowM3h = passIdx === 0 ? summary.totalPermeateFlowM3h : feedFlowM3h * recoveryFraction;

    const avgNdpBar = ndpStages.length > 0
      ? ndpStages.reduce((s, st) => s + st.ndp.ndpBar, 0) / ndpStages.length
      : 0;

    const specificEnergy = estimateSpecificEnergy(feedPressureBar, recoveryFraction);

    const chemDose = pass.stages[0]?.vessels[0]
      ? undefined
      : undefined;

    results.push({
      name: label,
      waterType,
      numElements,
      totalActiveAreaM2: Math.round(totalActiveAreaM2),
      feedFlowM3h,
      feedTDSMgL: passIdx === 0 ? summary.feedTDSMgL : summary.blendedPermeateTDSMgL,
      feedPressureBar,
      flowFactor: 1,
      permeateFlowM3h,
      avgFluxLMH,
      permeateTDSMgL: summary.blendedPermeateTDSMgL,
      netRecoveryPercent: recoveryFraction * 100,
      avgNdpBar,
      specificEnergykWh: specificEnergy,
      tempC: feedChemistry.designTemperature,
      pH: feedChemistry.ph,
      chemicalDose: undefined,
    });
  });

  return results;
}
