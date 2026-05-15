import {
  PRESSURE_MIN_COMPUTABLE_BAR,
  PRESSURE_DROP_DEFAULT_PER_STAGE_BAR,
} from "@/core/hydraulics/pressure/pressure.constants";
import { calculateOutletPressure } from "@/core/hydraulics/pressure/pressure-drop";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StagePressures {
  stageIndex: number;       // 0-based
  inletPressureBar: number;
  pressureDropBar: number;
  outletPressureBar: number;
}

export interface SystemPressures {
  feedPressureBar: number;
  concentratePressureBar: number;
  totalPressureDropBar: number;
  stages: StagePressures[];
}

// ─── Single-stage propagation ─────────────────────────────────────────────────

/**
 * Propagate pressure through a single RO stage.
 *   Pout = Pin − ΔP
 *
 * Returns null for invalid inlet pressure.
 * Invalid or negative pressure drop is treated as zero.
 */
export function propagateStagePressure(
  inletPressureBar: number,
  pressureDropBar: number = PRESSURE_DROP_DEFAULT_PER_STAGE_BAR,
  stageIndex: number = 0
): StagePressures | null {
  if (
    !Number.isFinite(inletPressureBar) ||
    inletPressureBar < PRESSURE_MIN_COMPUTABLE_BAR
  ) {
    return null;
  }

  const drop = Number.isFinite(pressureDropBar) && pressureDropBar >= 0
    ? pressureDropBar
    : 0;

  const outletPressureBar = calculateOutletPressure(inletPressureBar, drop) ?? 0;

  return {
    stageIndex,
    inletPressureBar,
    pressureDropBar: drop,
    outletPressureBar,
  };
}

// ─── Multi-stage propagation ──────────────────────────────────────────────────

/**
 * Propagate pressure through multiple RO stages in series.
 *
 * Outlet pressure of stage N becomes inlet pressure of stage N+1.
 * Each stage has its own pressure drop value.
 *
 * If pressureDropsBar is shorter than stageCount, the last provided drop is
 * repeated for remaining stages (engineering fallback to avoid empty arrays).
 *
 * Returns null if feed pressure is invalid or no stages are defined.
 */
export function propagateMultiStagePressure(
  feedPressureBar: number,
  pressureDropsBar: number[]
): SystemPressures | null {
  if (
    !Number.isFinite(feedPressureBar) ||
    feedPressureBar < PRESSURE_MIN_COMPUTABLE_BAR ||
    !Array.isArray(pressureDropsBar) ||
    pressureDropsBar.length === 0
  ) {
    return null;
  }

  const stages: StagePressures[] = [];
  let currentPressure = feedPressureBar;
  const fallbackDrop =
    pressureDropsBar[pressureDropsBar.length - 1] ?? PRESSURE_DROP_DEFAULT_PER_STAGE_BAR;

  for (let i = 0; i < pressureDropsBar.length; i++) {
    const drop = pressureDropsBar[i] ?? fallbackDrop;

    const stage = propagateStagePressure(currentPressure, drop, i);
    if (stage === null) break; // outlet hit zero — no pressure left to propagate

    stages.push(stage);
    currentPressure = stage.outletPressureBar;

    if (currentPressure < PRESSURE_MIN_COMPUTABLE_BAR) break;
  }

  const concentratePressureBar = stages.length > 0
    ? stages[stages.length - 1].outletPressureBar
    : 0;

  const totalPressureDropBar = feedPressureBar - concentratePressureBar;

  return {
    feedPressureBar,
    concentratePressureBar,
    totalPressureDropBar: Math.max(totalPressureDropBar, 0),
    stages,
  };
}

/**
 * Convenience: propagate N identical stages each with the same pressure drop.
 */
export function propagateUniformStagePressures(
  feedPressureBar: number,
  stageCount: number,
  pressureDropPerStageBar: number = PRESSURE_DROP_DEFAULT_PER_STAGE_BAR
): SystemPressures | null {
  if (
    !Number.isFinite(stageCount) ||
    stageCount < 1
  ) {
    return null;
  }

  const drops = Array.from({ length: Math.round(stageCount) }, () => pressureDropPerStageBar);
  return propagateMultiStagePressure(feedPressureBar, drops);
}
