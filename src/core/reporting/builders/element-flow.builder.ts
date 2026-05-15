import type { ElementFlowReport } from "@/core/reporting/models/report.models";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { Pass } from "@/store/ro-config-store";
import { resolveMembraneProperties } from "@/core/constants/membrane";

/**
 * Derive element-level flow reports by distributing stage flows evenly
 * across the vessels/elements in each stage. This is a linearized approximation
 * — a full element-by-element model is not yet implemented.
 */
export function buildElementFlowReport(
  output: SimulationOutput,
  passes: Pass[]
): ElementFlowReport[] {
  const { hydraulics } = output;
  const flowStages = hydraulics.flows.stages;
  const pressureStages = hydraulics.pressures.stages;
  const fluxStages = hydraulics.flux.stages;
  const qualityStages = output.permeate.quality.stages;

  const pass1 = passes[0];
  const results: ElementFlowReport[] = [];

  flowStages.forEach((flowStage, i) => {
    const configStage = pass1?.stages[i];
    const vesselCount = configStage?.vessels.length ?? 1;
    const elementsPerVessel = configStage?.vessels[0]?.elementsPerVessel ?? 7;
    const totalElements = vesselCount * elementsPerVessel;

    const feedFlowPerVessel = flowStage.feedFlowM3h / Math.max(vesselCount, 1);
    const permeatePerElement = flowStage.permeateFlowM3h / Math.max(totalElements, 1);
    const concentratePerVessel = flowStage.concentrateFlowM3h / Math.max(vesselCount, 1);

    const inletPressure = pressureStages[i]?.inletPressureBar ?? 0;
    const fluxLMH = fluxStages[i]?.fluxLMH ?? 0;
    const feedTDS = qualityStages[i]?.feedTDSMgL ?? output.summary.feedTDSMgL;
    const permeateTDS = qualityStages[i]?.permeateTDSMgL ?? output.summary.blendedPermeateTDSMgL;
    const recoveryFraction = flowStage.recoveryFraction;

    const modelName = configStage?.vessels[0]?.membraneModel ?? "Standard";
    const props = resolveMembraneProperties(modelName, output.summary.feedTDSMgL);

    // Report lead element (first) and tail element (last) per stage
    results.push({
      name: `Stg ${i + 1} Lead [${modelName}]`,
      recoveryPercent: recoveryFraction * 100 * (1 / elementsPerVessel) * 1.3,
      feedFlowM3h: feedFlowPerVessel,
      feedPressureBar: inletPressure,
      feedTDSMgL: feedTDS,
      concentrateFlowM3h: concentratePerVessel,
      permeateFlowM3h: permeatePerElement,
      permeateFluxLMH: fluxLMH * 1.15,
      permeateTDSMgL: permeateTDS * 0.7,
    });

    if (elementsPerVessel > 1) {
      results.push({
        name: `Stg ${i + 1} Tail [${modelName}]`,
        recoveryPercent: recoveryFraction * 100 * (1 / elementsPerVessel) * 0.7,
        feedFlowM3h: feedFlowPerVessel * 0.8,
        feedPressureBar: inletPressure - (pressureStages[i]?.pressureDropBar ?? 0),
        feedTDSMgL: feedTDS * (1 + recoveryFraction * 0.8),
        concentrateFlowM3h: concentratePerVessel,
        permeateFlowM3h: permeatePerElement * 0.85,
        permeateFluxLMH: fluxLMH * 0.85,
        permeateTDSMgL: permeateTDS * 1.3,
      });
    }
  });

  return results;
}
