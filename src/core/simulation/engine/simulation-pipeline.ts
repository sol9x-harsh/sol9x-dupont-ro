import { analyzeChargeBalance } from "@/core/chemistry/balance/balance-analysis";
import { analyzeTDS } from "@/core/chemistry/tds/tds-analysis";
import { analyzeConductivityDual } from "@/core/chemistry/conductivity/conductivity-analysis";
import { analyzeOsmoticPressureFromIons } from "@/core/chemistry/osmotic/osmotic-analysis";
import { propagateMultiStage } from "@/core/hydraulics/flow/flow-propagation";
import { calculateConcentrationFactor, calculateConcentrateTDS } from "@/core/hydraulics/flow/concentration-factor";
import { propagateMultiStagePressure } from "@/core/hydraulics/pressure/pressure-propagation";
import { propagateNDPAcrossStages, analyzeMultiStageNDP } from "@/core/hydraulics/ndp/ndp-analysis";
import type { StageNDPInput } from "@/core/hydraulics/ndp/ndp-analysis";
import { analyzeMultiStageFlux } from "@/core/hydraulics/flux/flux-analysis";
import { analyzeMultiStageCP } from "@/core/hydraulics/concentration-polarization/cp-analysis";
import { analyzeMultiStagePermeateQuality } from "@/core/membrane/salt-passage/salt-analysis";

import type { SimulationContext } from "./simulation-context";
import type {
  SimulationOutput,
  ChemistryOutput,
  HydraulicsOutput,
  PermeateOutput,
  SystemSummaryOutput,
  SimulationStatus,
} from "@/core/simulation/outputs/simulation-output";
import type { SimulationWarning } from "@/core/simulation/outputs/quality-output";
import { aggregateWarnings } from "./warnings";

export function runSimulationPipeline(context: SimulationContext): SimulationOutput {
  const { feed, hydraulics, membrane, configuration } = context;
  const warnings: SimulationWarning[] = [];

  // ── Step 1: Chemistry normalization & charge balance ────────────────────────
  const chargeBalance = analyzeChargeBalance(feed.concentrations);

  // ── Step 2: TDS analysis ─────────────────────────────────────────────────────
  const tds = analyzeTDS(feed.concentrations);
  const feedTDSMgL = tds.tdsMgL;

  // ── Step 3: Conductivity estimation ─────────────────────────────────────────
  const conductivity = analyzeConductivityDual(feedTDSMgL, feed.concentrations);

  // ── Step 4: Osmotic pressure ─────────────────────────────────────────────────
  const osmoticPressure = analyzeOsmoticPressureFromIons(feed.concentrations, feed.temperatureC);
  const feedOsmoticPressureBar = osmoticPressure.osmoticPressureBar;

  const chemistry: ChemistryOutput = {
    chargeBalance,
    tds,
    conductivity,
    osmoticPressure,
  };

  // ── Step 5: Flow propagation ─────────────────────────────────────────────────
  const flows = propagateMultiStage(
    hydraulics.feedFlowM3h,
    hydraulics.stageRecoveryFractions,
    hydraulics.stageRecycleFractions
  ) ?? {
    feedFlowM3h: hydraulics.feedFlowM3h,
    totalPermeateFlowM3h: 0,
    concentrateFlowM3h: hydraulics.feedFlowM3h,
    systemRecoveryFraction: 0,
    stages: [],
  };

  // ── Step 6: Pressure propagation ────────────────────────────────────────────
  const pressures = propagateMultiStagePressure(
    hydraulics.feedPressureBar,
    hydraulics.stagePressureDropsBar
  ) ?? {
    feedPressureBar: hydraulics.feedPressureBar,
    concentratePressureBar: hydraulics.feedPressureBar,
    totalPressureDropBar: 0,
    stages: [],
  };

  // ── Step 7: NDP propagation ──────────────────────────────────────────────────
  // Per-stage CFs (from per-stage recovery fractions).
  const perStageCFs: number[] = hydraulics.stageRecoveryFractions.map((r) => {
    const cf = calculateConcentrationFactor(r);
    return cf ?? 1;
  });

  // Cumulative CFs: stage N feed concentration = feedTDS × cumulativeCF[N-1].
  // cumulativeCF[0] = perStageCF[0], cumulativeCF[1] = perStageCF[0] × perStageCF[1], etc.
  // For NDP, we use cumulative CFs to scale osmotic pressure realistically.
  const cumulativeCFs: number[] = [];
  let runningCF = 1;
  for (const cf of perStageCFs) {
    runningCF *= cf;
    cumulativeCFs.push(runningCF);
  }

  const concentratePressures = pressures.stages.map((s) => s.outletPressureBar);

  // Bulk NDP: uses concentrate-end osmotic pressure without CP surface amplification.
  // CP correction is unknown here (flux not yet computed), so this is used only for
  // flux estimation in Step 8. The reported NDP is recomputed after CP in Step 9b.
  const ndpBulk = propagateNDPAcrossStages(
    concentratePressures.length ? concentratePressures : [pressures.concentratePressureBar],
    feedOsmoticPressureBar,
    cumulativeCFs.length ? cumulativeCFs : [1],
    hydraulics.permeatePressureBar
  );

  // ── Step 8: Flux analysis ────────────────────────────────────────────────────
  const fluxInputs = ndpBulk.stages.map((s, i) => {
    const stageConfig = configuration.stages[i] ?? configuration.stages[0];
    return {
      ndpBar: s.ndp.ndpBar,
      vesselCount: stageConfig.vesselCount,
      vesselElementCount: stageConfig.elementCountPerVessel,
      elementAreaM2: stageConfig.elementAreaM2,
      permeabilityA: membrane.permeabilityA,
    };
  });

  const flux = analyzeMultiStageFlux(fluxInputs.length ? fluxInputs : [
    {
      ndpBar: ndpBulk.lowestNdpBar,
      vesselCount: configuration.stages[0]?.vesselCount ?? 1,
      vesselElementCount: configuration.stages[0]?.elementCountPerVessel,
      elementAreaM2: configuration.stages[0]?.elementAreaM2,
      permeabilityA: membrane.permeabilityA,
    },
  ]);

  // ── Step 9: Concentration polarization ───────────────────────────────────────
  const cpInputs = ndpBulk.stages.map((s, i) => {
    // Stage N feed TDS = system feed TDS × cumulative CF of all stages before N.
    const stageFeedTDS = i === 0
      ? feedTDSMgL
      : (calculateConcentrateTDS(feedTDSMgL, cumulativeCFs[i - 1] ?? 1) ?? feedTDSMgL);

    const stageOsmoticPressureBar = feedOsmoticPressureBar * (cumulativeCFs[i] ?? 1);
    const stageFluxLMH = flux.stages[i]?.fluxLMH ?? 0;

    return {
      fluxLMH: stageFluxLMH,
      bulkConcentrationMgL: stageFeedTDS,
      bulkOsmoticPressureBar: stageOsmoticPressureBar,
      massTransferCoefficientMS: membrane.massTransferCoefficientMS,
    };
  });

  const cp = analyzeMultiStageCP(cpInputs.length ? cpInputs : [
    {
      fluxLMH: flux.stages[0]?.fluxLMH ?? 0,
      bulkConcentrationMgL: feedTDSMgL,
      bulkOsmoticPressureBar: feedOsmoticPressureBar,
      massTransferCoefficientMS: membrane.massTransferCoefficientMS,
    },
  ]);

  // ── Step 9b: CP-corrected NDP ────────────────────────────────────────────────
  // Recompute NDP per stage using the effective osmotic pressure from CP analysis
  // (π_surface = π_bulk × exp(Jw/k)). This is the physically accurate NDP —
  // CP applies only at the membrane surface, not during bulk CF propagation.
  const correctedStageInputs: StageNDPInput[] = ndpBulk.stages.map((s, i) => {
    const cpStage = cp.stages[i];
    const effectiveOsmotic =
      cpStage?.cp.status !== "invalid" &&
      (cpStage?.cp.effectiveOsmoticPressureBar ?? 0) > 0
        ? cpStage.cp.effectiveOsmoticPressureBar
        : s.osmoticPressureBar;
    return {
      feedPressureBar: s.feedPressureBar,
      permeatePressureBar: s.permeatePressureBar,
      osmoticPressureBar: effectiveOsmotic,
    };
  });
  const ndp = correctedStageInputs.length
    ? analyzeMultiStageNDP(correctedStageInputs)
    : ndpBulk;

  const hydraulicsOutput: HydraulicsOutput = {
    flows,
    pressures,
    ndp,
    flux,
    cp,
  };

  // ── Step 10: Permeate quality & salt passage ─────────────────────────────────
  const qualityStageInputs = hydraulics.stageRecoveryFractions.map((r, i) => {
    // Stage N feed TDS = system feed TDS × cumulative CF of all stages before N.
    const stageFeedTDS = i === 0
      ? feedTDSMgL
      : (calculateConcentrateTDS(feedTDSMgL, cumulativeCFs[i - 1] ?? 1) ?? feedTDSMgL);

    return {
      stageIndex: i,
      feedTDSMgL: stageFeedTDS,
      rejectionPercent: membrane.rejectionPercent,
      recoveryFraction: r,
    };
  });

  const quality = analyzeMultiStagePermeateQuality(
    qualityStageInputs.length ? qualityStageInputs : [
      {
        stageIndex: 0,
        feedTDSMgL,
        rejectionPercent: membrane.rejectionPercent,
        recoveryFraction: hydraulics.stageRecoveryFractions[0] ?? 0,
      },
    ]
  );

  const permeate: PermeateOutput = { quality };

  // ── Step 11: System summary ──────────────────────────────────────────────────
  const systemRecoveryFraction = flows.systemRecoveryFraction;
  const finalCF = calculateConcentrationFactor(systemRecoveryFraction) ?? 1;
  const concentrateTDSMgL = calculateConcentrateTDS(feedTDSMgL, finalCF) ?? feedTDSMgL;

  const averageFluxLMH =
    flux.stages.length > 0
      ? flux.stages.reduce((sum, s) => sum + s.fluxLMH, 0) / flux.stages.length
      : 0;

  const allWarnings = aggregateWarnings({
    chargeBalance,
    tds,
    osmoticPressure,
    ndp,
    pressures,
    flux: averageFluxLMH,
    cpFactor: cp.maxCPFactor,
    systemRecoveryFraction,
    stageCount: configuration.stageCount,
    rejectionPercent: membrane.rejectionPercent,
    blendedPermeateTDSMgL: quality.blendedPermeateTDSMgL,
    feedTDSMgL,
    feedTemperatureC: feed.temperatureC ?? 25,
    permeatePressureBar: hydraulics.permeatePressureBar,
    adjustment: context.adjustmentResult,
  });

  warnings.push(...allWarnings);

  const hasWarning = warnings.some((w) => w.severity === "warning");
  const hasCritical = warnings.some((w) => w.severity === "critical");

  const status: SimulationStatus = hasCritical
    ? "critical"
    : hasWarning
    ? "warning"
    : "ok";

  const summary: SystemSummaryOutput = {
    feedTDSMgL,
    systemRecoveryFraction,
    systemRecoveryPercent: systemRecoveryFraction * 100,
    blendedPermeateTDSMgL: quality.blendedPermeateTDSMgL,
    blendedRejectionPercent: quality.blendedRejectionPercent,
    totalPermeateFlowM3h: flows.totalPermeateFlowM3h,
    concentrateFlowM3h: flows.concentrateFlowM3h,
    concentrateTDSMgL,
    averageFluxLMH,
    lowestNdpBar: ndp.lowestNdpBar,
    maxCPFactor: cp.maxCPFactor,
    status,
    warnings,
  };

  return {
    chemistry,
    hydraulics: hydraulicsOutput,
    permeate,
    summary,
    warnings,
  };
}
