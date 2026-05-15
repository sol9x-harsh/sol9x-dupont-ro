import type { SimulationContext } from "@/core/simulation/engine/simulation-context";
import type { SimulationWarning } from "@/core/simulation/outputs/quality-output";

export interface ValidationResult {
  isValid: boolean;
  warnings: SimulationWarning[];
  errors: SimulationWarning[];
}

/**
 * Validate feed conditions for minimum viability.
 * These are hard guards — if they fail, the simulation cannot produce
 * meaningful results and must be blocked.
 */
export function validateFeedConditions(
  context: SimulationContext
): SimulationWarning[] {
  const warnings: SimulationWarning[] = [];
  const { feed } = context;

  const totalConc = Object.values(feed.concentrations).reduce<number>(
    (sum, v) => sum + (typeof v === "number" ? v : 0),
    0
  );

  if (totalConc <= 0) {
    warnings.push({
      code: "FEED_EMPTY",
      severity: "critical",
      message: "Feed chemistry contains no ion concentrations.",
    });
  }

  if (feed.temperatureC !== undefined && (feed.temperatureC < 0 || feed.temperatureC > 80)) {
    warnings.push({
      code: "FEED_TEMPERATURE_OOB",
      severity: "warning",
      message: `Feed temperature ${feed.temperatureC}°C is outside the valid operating range (0–80°C).`,
      value: feed.temperatureC,
    });
  }

  return warnings;
}

/**
 * Validate recovery fractions for mathematical validity only.
 * Engineering-level recovery warnings (TDS-aware, stage-count-aware)
 * are handled by the warning engine post-simulation to avoid duplicates.
 */
export function validateRecovery(
  stageRecoveryFractions: number[]
): SimulationWarning[] {
  const warnings: SimulationWarning[] = [];

  for (let i = 0; i < stageRecoveryFractions.length; i++) {
    const r = stageRecoveryFractions[i];
    if (r < 0 || r >= 1) {
      warnings.push({
        code: `RECOVERY_INVALID_STAGE_${i}`,
        severity: "critical",
        message: `Stage ${i + 1} recovery fraction ${r.toFixed(3)} is out of range [0, 1).`,
        value: r,
      });
    }
  }

  // System-level hard ceiling: prevent mathematically absurd states.
  const systemRecovery = stageRecoveryFractions.reduce(
    (acc, r) => acc + (1 - acc) * r,
    0
  );
  if (systemRecovery >= 0.99) {
    warnings.push({
      code: "RECOVERY_IMPOSSIBLE",
      severity: "critical",
      message: `System recovery ${(systemRecovery * 100).toFixed(1)}% approaches 100%. This is physically impossible — concentrate flow approaches zero.`,
      value: systemRecovery,
      threshold: 0.99,
    });
  }

  return warnings;
}

/**
 * Validate pressures for mathematical validity.
 * Engineering-level pressure warnings (membrane limits, stage ΔP)
 * are handled by the warning engine post-simulation.
 */
export function validatePressures(
  feedPressureBar: number,
  stagePressureDropsBar: number[]
): SimulationWarning[] {
  const warnings: SimulationWarning[] = [];

  if (feedPressureBar <= 0) {
    warnings.push({
      code: "PRESSURE_FEED_INVALID",
      severity: "critical",
      message: `Feed pressure ${feedPressureBar} bar must be positive.`,
      value: feedPressureBar,
    });
  }

  return warnings;
}

export function validateStageConfiguration(
  context: SimulationContext
): SimulationWarning[] {
  const warnings: SimulationWarning[] = [];
  const { configuration, hydraulics } = context;

  if (configuration.stageCount <= 0) {
    warnings.push({
      code: "CONFIG_NO_STAGES",
      severity: "critical",
      message: "Simulation must have at least one stage.",
    });
  }

  if (hydraulics.feedFlowM3h <= 0) {
    warnings.push({
      code: "CONFIG_FEED_FLOW_INVALID",
      severity: "critical",
      message: `Feed flow ${hydraulics.feedFlowM3h} m³/h must be positive.`,
      value: hydraulics.feedFlowM3h,
    });
  }

  for (let i = 0; i < configuration.stages.length; i++) {
    const stage = configuration.stages[i];
    if (stage.vesselCount <= 0) {
      warnings.push({
        code: `CONFIG_VESSELS_STAGE_${i}`,
        severity: "critical",
        message: `Stage ${i + 1} must have at least one pressure vessel.`,
      });
    }
    if (stage.elementAreaM2 <= 0) {
      warnings.push({
        code: `CONFIG_ELEMENT_AREA_STAGE_${i}`,
        severity: "critical",
        message: `Stage ${i + 1} element area must be positive.`,
      });
    }
  }

  return warnings;
}

export function validateSimulationContext(
  context: SimulationContext
): ValidationResult {
  const all: SimulationWarning[] = [
    ...validateFeedConditions(context),
    ...validateRecovery(context.hydraulics.stageRecoveryFractions),
    ...validatePressures(
      context.hydraulics.feedPressureBar,
      context.hydraulics.stagePressureDropsBar
    ),
    ...validateStageConfiguration(context),
  ];

  const errors = all.filter((w) => w.severity === "critical");
  const warnings = all.filter((w) => w.severity !== "critical");

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}
