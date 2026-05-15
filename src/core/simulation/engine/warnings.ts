import type { BalanceAnalysis } from "@/core/chemistry/balance/balance-analysis";
import type { TDSResult } from "@/core/chemistry/tds/tds-analysis";
import type { OsmoticPressureResult } from "@/core/chemistry/osmotic/osmotic-analysis";
import type { SystemNDPResult } from "@/core/hydraulics/ndp/ndp-analysis";
import type { SystemPressures } from "@/core/hydraulics/pressure/pressure-propagation";
import type { SimulationWarning } from "@/core/simulation/outputs/quality-output";
import {
  WARNING_THRESHOLDS,
  SWRO_WARNING_THRESHOLDS,
  BWRO_WARNING_THRESHOLDS,
  SCALING_THRESHOLDS,
} from "@/core/simulation/constants/simulation.constants";
import { classifyWaterType } from "@/core/constants/membrane";
import type { ChemistryAdjustmentResult } from "@/core/chemistry/adjustment/chemical-adjustment";

// ─── Input contract ───────────────────────────────────────────────────────────

interface WarningAggregationInput {
  chargeBalance: BalanceAnalysis;
  tds: TDSResult;
  osmoticPressure: OsmoticPressureResult;
  ndp: SystemNDPResult;
  pressures: SystemPressures;
  flux: number;
  cpFactor: number;
  systemRecoveryFraction: number;
  stageCount: number;
  rejectionPercent: number;
  blendedPermeateTDSMgL: number;
  feedTDSMgL: number;
  feedTemperatureC: number;
  permeatePressureBar: number;
  adjustment?: ChemistryAdjustmentResult;
}

// ─── Deduplication helper ─────────────────────────────────────────────────────
// Each warning code may only appear once. Later entries are dropped.

function deduplicateWarnings(warnings: SimulationWarning[]): SimulationWarning[] {
  const seen = new Set<string>();
  const result: SimulationWarning[] = [];
  for (const w of warnings) {
    if (!seen.has(w.code)) {
      seen.add(w.code);
      result.push(w);
    }
  }
  return result;
}

// ─── Master aggregation ───────────────────────────────────────────────────────

export function aggregateWarnings(input: WarningAggregationInput): SimulationWarning[] {
  const warnings: SimulationWarning[] = [];

  // Select TDS-aware thresholds for flux and recovery.
  const waterType = classifyWaterType(input.feedTDSMgL);
  const isSWRO = waterType === "swro";
  const isBWRO = waterType === "bwro";

  const fluxAggressiveThreshold = isSWRO
    ? SWRO_WARNING_THRESHOLDS.aggressiveFluxLMH
    : isBWRO
    ? BWRO_WARNING_THRESHOLDS.aggressiveFluxLMH
    : WARNING_THRESHOLDS.aggressiveFluxLMH;
  const fluxCriticalThreshold = isSWRO
    ? SWRO_WARNING_THRESHOLDS.criticalFluxLMH
    : isBWRO
    ? BWRO_WARNING_THRESHOLDS.criticalFluxLMH
    : WARNING_THRESHOLDS.criticalFluxLMH;
  const fluxLowThreshold = isSWRO
    ? SWRO_WARNING_THRESHOLDS.lowFluxLMH
    : isBWRO
    ? BWRO_WARNING_THRESHOLDS.lowFluxLMH
    : WARNING_THRESHOLDS.lowFluxLMH;
  const highRecoveryThreshold = isSWRO
    ? SWRO_WARNING_THRESHOLDS.highRecoveryFraction
    : isBWRO
    ? BWRO_WARNING_THRESHOLDS.highRecoveryFraction
    : WARNING_THRESHOLDS.highRecoveryFraction;
  const criticalRecoveryThreshold = isSWRO
    ? SWRO_WARNING_THRESHOLDS.criticalRecoveryFraction
    : isBWRO
    ? BWRO_WARNING_THRESHOLDS.criticalRecoveryFraction
    : WARNING_THRESHOLDS.criticalRecoveryFraction;

  // ── 1. Charge balance ─────────────────────────────────────────────────────
  // Only warn when the balance is actually computable (ions present).
  if (input.chargeBalance.isComputable) {
    if (input.chargeBalance.status === "critical" || input.chargeBalance.status === "invalid") {
      warnings.push({
        code: "CHEM_CHARGE_BALANCE_CRITICAL",
        severity: "critical",
        message: `Charge balance imbalance ${input.chargeBalance.imbalancePercent.toFixed(1)}% exceeds critical threshold.`,
        value: input.chargeBalance.imbalancePercent,
        threshold: WARNING_THRESHOLDS.chargeImbalanceCriticalPct,
      });
    } else if (input.chargeBalance.status === "warning") {
      warnings.push({
        code: "CHEM_CHARGE_BALANCE_WARNING",
        severity: "warning",
        message: `Charge balance imbalance ${input.chargeBalance.imbalancePercent.toFixed(1)}% exceeds recommended limit.`,
        value: input.chargeBalance.imbalancePercent,
        threshold: WARNING_THRESHOLDS.chargeImbalanceWarningPct,
      });
    }
  }

  // ── 2. TDS status ─────────────────────────────────────────────────────────
  if (input.tds.status === "critical") {
    warnings.push({
      code: "CHEM_TDS_CRITICAL",
      severity: "critical",
      message: `Feed TDS ${input.tds.tdsMgL.toFixed(0)} mg/L is in critical range. Verify membrane selection.`,
      value: input.tds.tdsMgL,
    });
  }

  // ── 3. Osmotic pressure ───────────────────────────────────────────────────
  if (input.osmoticPressure.osmoticPressureBar >= WARNING_THRESHOLDS.criticalOsmoticPressureBar) {
    warnings.push({
      code: "CHEM_OSMOTIC_CRITICAL",
      severity: "critical",
      message: `Feed osmotic pressure ${input.osmoticPressure.osmoticPressureBar.toFixed(1)} bar exceeds SWRO range. Verify system pressure.`,
      value: input.osmoticPressure.osmoticPressureBar,
      threshold: WARNING_THRESHOLDS.criticalOsmoticPressureBar,
    });
  }

  // ── 4. System recovery ────────────────────────────────────────────────────
  if (input.systemRecoveryFraction >= criticalRecoveryThreshold) {
    warnings.push({
      code: "HYD_RECOVERY_CRITICAL",
      severity: "critical",
      message: `System recovery ${(input.systemRecoveryFraction * 100).toFixed(1)}% exceeds critical threshold (${(criticalRecoveryThreshold * 100).toFixed(0)}%${isSWRO ? ' for SWRO' : isBWRO ? ' for BWRO' : ''}). Scaling risk is high.`,
      value: input.systemRecoveryFraction,
      threshold: criticalRecoveryThreshold,
    });
  } else if (input.systemRecoveryFraction >= highRecoveryThreshold) {
    warnings.push({
      code: "HYD_RECOVERY_HIGH",
      severity: "warning",
      message: `System recovery ${(input.systemRecoveryFraction * 100).toFixed(1)}% is aggressive (≥${(highRecoveryThreshold * 100).toFixed(0)}%${isSWRO ? ' for SWRO' : isBWRO ? ' for BWRO' : ''}). Monitor scaling indicators.`,
      value: input.systemRecoveryFraction,
      threshold: highRecoveryThreshold,
    });
  }

  // Recovery vs. stage count sanity: high single-stage recovery is unrealistic
  if (input.stageCount === 1 && input.systemRecoveryFraction > 0.60) {
    warnings.push({
      code: "HYD_RECOVERY_SINGLE_STAGE",
      severity: "warning",
      message: `Recovery ${(input.systemRecoveryFraction * 100).toFixed(1)}% on a single-stage system exceeds practical limit (~60%). Add stages or reduce recovery.`,
      value: input.systemRecoveryFraction,
      threshold: 0.60,
    });
  }

  // ── 5. NDP ────────────────────────────────────────────────────────────────
  if (input.ndp.lowestNdpBar < 0) {
    warnings.push({
      code: "HYD_NDP_NEGATIVE",
      severity: "critical",
      message: `Minimum NDP ${input.ndp.lowestNdpBar.toFixed(2)} bar is negative. Feed pressure is insufficient to overcome osmotic pressure — reverse flow risk.`,
      value: input.ndp.lowestNdpBar,
    });
  } else if (input.ndp.lowestNdpBar < WARNING_THRESHOLDS.nearZeroNdpBar) {
    warnings.push({
      code: "HYD_NDP_NEAR_ZERO",
      severity: "critical",
      message: `Minimum NDP ${input.ndp.lowestNdpBar.toFixed(2)} bar approaches zero. Effective driving pressure is insufficient for stable permeate production.`,
      value: input.ndp.lowestNdpBar,
      threshold: WARNING_THRESHOLDS.nearZeroNdpBar,
    });
  } else if (input.ndp.lowestNdpBar < WARNING_THRESHOLDS.lowNdpBar) {
    warnings.push({
      code: "HYD_NDP_LOW",
      severity: "warning",
      message: `Minimum NDP ${input.ndp.lowestNdpBar.toFixed(2)} bar is marginal. Consider increasing feed pressure or reducing recovery.`,
      value: input.ndp.lowestNdpBar,
      threshold: WARNING_THRESHOLDS.lowNdpBar,
    });
  }

  // ── 6. Flux ───────────────────────────────────────────────────────────────
  if (input.flux >= fluxCriticalThreshold) {
    warnings.push({
      code: "HYD_FLUX_CRITICAL",
      severity: "critical",
      message: `Average flux ${input.flux.toFixed(1)} LMH exceeds critical limit (${fluxCriticalThreshold} LMH${isSWRO ? ' for SWRO' : ''}). Membrane fouling risk is very high.`,
      value: input.flux,
      threshold: fluxCriticalThreshold,
    });
  } else if (input.flux >= fluxAggressiveThreshold) {
    warnings.push({
      code: "HYD_FLUX_AGGRESSIVE",
      severity: "warning",
      message: `Average flux ${input.flux.toFixed(1)} LMH is aggressive (≥${fluxAggressiveThreshold} LMH${isSWRO ? ' for SWRO' : ''}). Monitor fouling rate.`,
      value: input.flux,
      threshold: fluxAggressiveThreshold,
    });
  } else if (input.flux > 0 && input.flux < fluxLowThreshold) {
    warnings.push({
      code: "HYD_FLUX_LOW",
      severity: "warning",
      message: `Average flux ${input.flux.toFixed(1)} LMH is below minimum recommended (${fluxLowThreshold} LMH). Membrane area may be oversized or NDP insufficient.`,
      value: input.flux,
      threshold: fluxLowThreshold,
    });
  }

  // ── 7. CP factor ──────────────────────────────────────────────────────────
  if (input.cpFactor >= WARNING_THRESHOLDS.criticalCPFactor) {
    warnings.push({
      code: "HYD_CP_CRITICAL",
      severity: "critical",
      message: `Maximum CP factor ${input.cpFactor.toFixed(2)} exceeds critical threshold (1.40). Severe membrane surface concentration.`,
      value: input.cpFactor,
      threshold: WARNING_THRESHOLDS.criticalCPFactor,
    });
  }

  // ── 8. Pressure constraints ───────────────────────────────────────────────
  const maxMemPressure = isSWRO
    ? WARNING_THRESHOLDS.maxFeedPressureBar
    : WARNING_THRESHOLDS.maxFeedPressureBWROBar;
  if (input.pressures.feedPressureBar > maxMemPressure) {
    warnings.push({
      code: "HYD_PRESSURE_OVER_MAX",
      severity: "critical",
      message: `Feed pressure ${input.pressures.feedPressureBar.toFixed(1)} bar exceeds ${isSWRO ? 'SWRO' : 'BWRO'} membrane limit (${maxMemPressure} bar).`,
      value: input.pressures.feedPressureBar,
      threshold: maxMemPressure,
    });
  }

  // Per-stage ΔP check
  for (const stage of input.pressures.stages) {
    if (stage.pressureDropBar > WARNING_THRESHOLDS.maxStagePressureDropBar) {
      warnings.push({
        code: `HYD_STAGE_DP_HIGH_${stage.stageIndex}`,
        severity: "warning",
        message: `Stage ${stage.stageIndex + 1} ΔP ${stage.pressureDropBar.toFixed(2)} bar exceeds vessel limit (${WARNING_THRESHOLDS.maxStagePressureDropBar} bar). Possible fouling or excessive flow.`,
        value: stage.pressureDropBar,
        threshold: WARNING_THRESHOLDS.maxStagePressureDropBar,
      });
    }
  }

  // Permeate back pressure
  if (input.permeatePressureBar > WARNING_THRESHOLDS.maxPermeatePressureBar) {
    warnings.push({
      code: "HYD_PERMEATE_BP_HIGH",
      severity: "warning",
      message: `Permeate back pressure ${input.permeatePressureBar.toFixed(1)} bar is elevated (>${WARNING_THRESHOLDS.maxPermeatePressureBar} bar). Reduces effective NDP.`,
      value: input.permeatePressureBar,
      threshold: WARNING_THRESHOLDS.maxPermeatePressureBar,
    });
  }

  // ── 9. Rejection & Water Quality ──────────────────────────────────────────
  if (input.rejectionPercent < WARNING_THRESHOLDS.poorRejectionPercent) {
    warnings.push({
      code: "MEM_REJECTION_POOR",
      severity: "warning",
      message: `Membrane rejection ${input.rejectionPercent.toFixed(1)}% is below recommended minimum (95%).`,
      value: input.rejectionPercent,
      threshold: WARNING_THRESHOLDS.poorRejectionPercent,
    });
  }

  if (input.blendedPermeateTDSMgL >= WARNING_THRESHOLDS.criticalPermeateTDSMgL) {
    warnings.push({
      code: "QUAL_PERMEATE_TDS_CRITICAL",
      severity: "critical",
      message: `Permeate TDS ${input.blendedPermeateTDSMgL.toFixed(0)} mg/L exceeds ${WARNING_THRESHOLDS.criticalPermeateTDSMgL} mg/L. Product water is non-potable.`,
      value: input.blendedPermeateTDSMgL,
      threshold: WARNING_THRESHOLDS.criticalPermeateTDSMgL,
    });
  } else if (input.blendedPermeateTDSMgL >= WARNING_THRESHOLDS.highPermeateTDSMgL) {
    warnings.push({
      code: "QUAL_PERMEATE_TDS_HIGH",
      severity: "warning",
      message: `Permeate TDS ${input.blendedPermeateTDSMgL.toFixed(0)} mg/L exceeds potable limit (${WARNING_THRESHOLDS.highPermeateTDSMgL} mg/L). Consider second pass or blending.`,
      value: input.blendedPermeateTDSMgL,
      threshold: WARNING_THRESHOLDS.highPermeateTDSMgL,
    });
  }

  // ── 10. Boron leakage ─────────────────────────────────────────────────────
  // Estimate permeate boron from feed boron and rejection.
  // Boron rejection is typically 90-95% for SWRO, lower for BWRO.
  if (input.adjustment) {
    const feedBoron = input.adjustment.final.ions.boron;
    if (feedBoron > 0) {
      // Boron passage is typically 5-10% for SWRO membranes; use salt passage * 3 as proxy
      const saltPassage = 1 - (input.rejectionPercent / 100);
      const boronPassageFactor = Math.min(saltPassage * 3, 0.5); // Boron passes ~3x more than salt
      const permeateBoron = feedBoron * boronPassageFactor;
      if (permeateBoron > WARNING_THRESHOLDS.boronCriticalMgL) {
        warnings.push({
          code: "QUAL_BORON_CRITICAL",
          severity: "critical",
          message: `Estimated permeate boron ${permeateBoron.toFixed(1)} mg/L exceeds ${WARNING_THRESHOLDS.boronCriticalMgL} mg/L. Boron-specific rejection membrane required.`,
          value: permeateBoron,
          threshold: WARNING_THRESHOLDS.boronCriticalMgL,
        });
      } else if (permeateBoron > WARNING_THRESHOLDS.boronLimitMgL) {
        warnings.push({
          code: "QUAL_BORON_HIGH",
          severity: "warning",
          message: `Estimated permeate boron ${permeateBoron.toFixed(1)} mg/L exceeds WHO guideline (${WARNING_THRESHOLDS.boronLimitMgL} mg/L). Consider pH elevation or boron-selective membrane.`,
          value: permeateBoron,
          threshold: WARNING_THRESHOLDS.boronLimitMgL,
        });
      }
    }
  }

  // ── 11. Scaling Warnings ──────────────────────────────────────────────────
  if (input.adjustment) {
    const cf = input.systemRecoveryFraction > 0 ? 1 / (1 - input.systemRecoveryFraction) : 1;
    const hasAntiscalant = input.adjustment.antiscalantOn;

    // 11a. LSI Scaling
    const lsiConc = input.adjustment.final.lsi + Math.log10(cf);
    const lsiLimit = hasAntiscalant
      ? SCALING_THRESHOLDS.lsiWithAntiscalant
      : SCALING_THRESHOLDS.lsiWarning;
    const lsiCriticalLimit = hasAntiscalant
      ? SCALING_THRESHOLDS.lsiWithAntiscalant
      : SCALING_THRESHOLDS.lsiCritical;

    if (lsiConc > lsiCriticalLimit) {
      warnings.push({
        code: "SCALING_LSI_CRITICAL",
        severity: "critical",
        message: `Concentrate LSI (${lsiConc.toFixed(2)}) exceeds critical limit (${lsiCriticalLimit.toFixed(1)})${hasAntiscalant ? " with antiscalant" : ""}. High risk of CaCO₃ scaling.`,
        value: lsiConc,
        threshold: lsiCriticalLimit,
      });
    } else if (lsiConc > lsiLimit && lsiLimit < lsiCriticalLimit) {
      warnings.push({
        code: "SCALING_LSI_HIGH",
        severity: "warning",
        message: `Concentrate LSI (${lsiConc.toFixed(2)}) is positive (>${lsiLimit.toFixed(1)}). CaCO₃ scaling tendency — consider antiscalant or acid dosing.`,
        value: lsiConc,
        threshold: lsiLimit,
      });
    }

    // 11b. Stiff & Davis Index
    const sdiConc = input.adjustment.final.sdi + Math.log10(cf);
    const sdiLimit = hasAntiscalant
      ? SCALING_THRESHOLDS.sdiWithAntiscalant
      : SCALING_THRESHOLDS.sdiWarning;
    const sdiCriticalLimit = hasAntiscalant
      ? SCALING_THRESHOLDS.sdiWithAntiscalant
      : SCALING_THRESHOLDS.sdiCritical;

    if (sdiConc > sdiCriticalLimit) {
      warnings.push({
        code: "SCALING_SDI_CRITICAL",
        severity: "critical",
        message: `Concentrate S&DI (${sdiConc.toFixed(2)}) exceeds limit (${sdiCriticalLimit.toFixed(1)})${hasAntiscalant ? " with antiscalant" : ""}. CaCO₃ precipitation likely at elevated TDS.`,
        value: sdiConc,
        threshold: sdiCriticalLimit,
      });
    } else if (sdiConc > sdiLimit && sdiLimit < sdiCriticalLimit) {
      warnings.push({
        code: "SCALING_SDI_HIGH",
        severity: "warning",
        message: `Concentrate S&DI (${sdiConc.toFixed(2)}) is positive. Scaling tendency at high ionic strength.`,
        value: sdiConc,
        threshold: sdiLimit,
      });
    }

    // 11c. CaSO4 Saturation
    const ions = input.adjustment.final.ions;
    const caConc = ions.calcium * cf;
    const so4Conc = ions.sulfate * cf;
    const caSO4Sat = (caConc * so4Conc) / 2320000 * 100; // Simplified Ksp
    const caSO4Limit = hasAntiscalant
      ? SCALING_THRESHOLDS.caSO4WithAntiscalant
      : SCALING_THRESHOLDS.caSO4SatWarning;

    if (caSO4Sat > caSO4Limit) {
      warnings.push({
        code: "SCALING_CASO4_HIGH",
        severity: "critical",
        message: `CaSO₄ saturation (${caSO4Sat.toFixed(0)}%) exceeds limit (${caSO4Limit}%)${hasAntiscalant ? " with antiscalant" : ""}. Gypsum scaling risk.`,
        value: caSO4Sat,
        threshold: caSO4Limit,
      });
    }

    // 11d. BaSO4 Saturation
    const baConc = ions.barium * cf;
    const baSO4Sat = (baConc * so4Conc) / 1.42 * 100; // Simplified Ksp in (mg/L)^2
    const baSO4Limit = hasAntiscalant
      ? SCALING_THRESHOLDS.baSO4WithAntiscalant
      : SCALING_THRESHOLDS.baSO4SatWarning;

    if (baSO4Sat > baSO4Limit) {
      warnings.push({
        code: "SCALING_BASO4_HIGH",
        severity: "critical",
        message: `BaSO₄ saturation (${baSO4Sat.toFixed(0)}%) exceeds limit (${baSO4Limit}%)${hasAntiscalant ? " with antiscalant" : ""}. Barite scaling risk.`,
        value: baSO4Sat,
        threshold: baSO4Limit,
      });
    }

    // 11e. Silica Saturation (temperature-adjusted)
    // SiO2 solubility increases roughly 1.5% per °C above 25°C
    const tempFactor = 1 + 0.015 * (input.feedTemperatureC - 25);
    const adjustedSolubility = SCALING_THRESHOLDS.sio2BaseSolubilityMgL * Math.max(tempFactor, 0.5);
    const sio2Conc = ions.silica * cf;
    const sio2Sat = (sio2Conc / adjustedSolubility) * 100;
    const sio2Limit = hasAntiscalant
      ? SCALING_THRESHOLDS.sio2WithAntiscalant
      : SCALING_THRESHOLDS.sio2SatWarning;

    if (sio2Sat > sio2Limit) {
      warnings.push({
        code: "SCALING_SILICA_HIGH",
        severity: "critical",
        message: `SiO₂ saturation (${sio2Sat.toFixed(0)}%) exceeds solubility limit (${sio2Limit}%) at ${input.feedTemperatureC.toFixed(0)}°C.`,
        value: sio2Sat,
        threshold: sio2Limit,
      });
    }
  }

  // ── 12. Info-level system health ──────────────────────────────────────────
  // Only emit if there are no warnings/criticals (to avoid noise)
  const hasSeriousWarning = warnings.some(w => w.severity === "warning" || w.severity === "critical");
  if (!hasSeriousWarning && input.flux > 0 && input.ndp.lowestNdpBar > 0) {
    warnings.push({
      code: "SYS_HEALTHY",
      severity: "info",
      message: `System operating within normal parameters. Recovery ${(input.systemRecoveryFraction * 100).toFixed(1)}%, Flux ${input.flux.toFixed(1)} LMH, NDP ${input.ndp.lowestNdpBar.toFixed(1)} bar.`,
    });
  }

  return deduplicateWarnings(warnings);
}
