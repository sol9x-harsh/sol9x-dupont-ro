import type { StageFlowReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { Pass } from "@/store/ro-config-store";
import { REPORT_DEFAULT_ELEMENT_AREA_M2 } from "@/core/reporting/constants/report.constants";

export function buildStageFlowReport(
  output: SimulationOutput,
  passes: Pass[]
): StageFlowReport[] {
  const { hydraulics } = output;
  const flowStages = hydraulics.flows.stages;
  const pressureStages = hydraulics.pressures.stages;
  const fluxStages = hydraulics.flux.stages;
  const ndpStages = hydraulics.ndp.stages;
  const cpStages = hydraulics.cp.stages;
  const qualityStages = output.permeate.quality.stages;

  // Use stage count from simulation output as source of truth
  return flowStages.map((flowStage, i) => {
    const pressStage = pressureStages[i];
    const fluxStage = fluxStages[i];
    const ndpStage = ndpStages[i];
    const cpStage = cpStages[i];
    const qualStage = qualityStages[i];

    // Derive vessel/element counts from RO config pass 1 stages
    const pass1 = passes[0];
    const configStage = pass1?.stages[i];
    let vesselCount = fluxStage?.vesselCount ?? 1;
    let elementsPerVessel = 7;
    let elementCount = fluxStage?.elementCount ?? vesselCount * elementsPerVessel;

    if (configStage) {
      vesselCount = configStage.vessels.length;
      elementsPerVessel = configStage.vessels[0]?.elementsPerVessel ?? 7;
      elementCount = vesselCount * elementsPerVessel;
    }

    // Permeate pressure: the permeate side is typically near-atmospheric.
    // Use NDP permeate backpressure if available, otherwise default to low value.
    const permeatePressureBar = ndpStage?.permeatePressureBar ?? 0.3;

    return {
      stageIndex: i + 1,
      elementCount,
      vesselCount,
      elementsPerVessel,
      feedFlowM3h: flowStage.feedFlowM3h,
      concentrateFlowM3h: flowStage.concentrateFlowM3h,
      feedPressureBar: pressStage?.inletPressureBar ?? 0,
      concentratePressureBar: pressStage?.outletPressureBar ?? 0,
      pressureDropBar: pressStage?.pressureDropBar ?? 0,
      permeateFlowM3h: flowStage.permeateFlowM3h,
      avgFluxLMH: fluxStage?.fluxLMH ?? 0,
      permeatePressureBar,
      permeateTDSMgL: qualStage?.permeateTDSMgL ?? 0,
      recoveryPercent: flowStage.recoveryFraction * 100,
      ndpBar: ndpStage?.ndp.ndpBar ?? 0,
      cpFactor: cpStage?.cp.cpFactor ?? 1,
    };
  });
}
