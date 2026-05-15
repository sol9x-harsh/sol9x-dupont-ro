import { barToPsi, barToKpa } from "@/core/units/pressure";
import {
  PRESSURE_MIN_COMPUTABLE_BAR,
  PRESSURE_MIN_OPERATIONAL_BAR,
  PRESSURE_WARNING_THRESHOLD_BAR,
  PRESSURE_CRITICAL_THRESHOLD_BAR,
  PRESSURE_DROP_MAX_PER_VESSEL_BAR,
  PRESSURE_BWRO_MAX_BAR,
  PRESSURE_DROP_DEFAULT_PER_STAGE_BAR,
} from "@/core/hydraulics/pressure/pressure.constants";
import {
  calculateOutletPressure,
  calculatePressureDrop,
} from "@/core/hydraulics/pressure/pressure-drop";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PressureClassification =
  | "low"
  | "normal-bwro"
  | "high-bwro"
  | "swro"
  | "critical";

export type PressureStatus = "normal" | "warning" | "critical";

export interface StagePressureAnalysis {
  inletPressureBar: number;
  inletPressurePsi: number;
  outletPressureBar: number;
  outletPressurePsi: number;
  pressureDropBar: number;
  pressureDropPsi: number;
  classification: PressureClassification;
  status: PressureStatus;
  message: string;
}

export interface PressureDropAnalysis {
  pressureDropBar: number;
  pressureDropPsi: number;
  pressureDropKpa: number;
  isWithinVesselLimit: boolean;
  status: PressureStatus;
  message: string;
}

// ─── Classification helpers ───────────────────────────────────────────────────

export function classifyPressure(bar: number): PressureClassification {
  if (!Number.isFinite(bar) || bar < PRESSURE_MIN_OPERATIONAL_BAR) return "low";
  if (bar <= PRESSURE_BWRO_MAX_BAR) return "normal-bwro";
  if (bar <= PRESSURE_WARNING_THRESHOLD_BAR) return "high-bwro";
  if (bar <= PRESSURE_CRITICAL_THRESHOLD_BAR) return "swro";
  return "critical";
}

export function classifyPressureStatus(bar: number): PressureStatus {
  if (!Number.isFinite(bar) || bar < PRESSURE_MIN_OPERATIONAL_BAR) return "warning";
  if (bar >= PRESSURE_CRITICAL_THRESHOLD_BAR) return "critical";
  if (bar >= PRESSURE_WARNING_THRESHOLD_BAR) return "warning";
  return "normal";
}

// ─── Message builder ──────────────────────────────────────────────────────────

function buildPressureMessage(
  inletBar: number,
  outletBar: number,
  dropBar: number,
  classification: PressureClassification,
  status: PressureStatus
): string {
  if (!Number.isFinite(inletBar) || inletBar < PRESSURE_MIN_COMPUTABLE_BAR) {
    return "Invalid inlet pressure — stage pressure analysis cannot be performed.";
  }

  const classLabel: Record<PressureClassification, string> = {
    low: "below minimum operational pressure",
    "normal-bwro": "normal BWRO range",
    "high-bwro": "upper BWRO range",
    swro: "SWRO range",
    critical: "above maximum rated pressure",
  };

  const base = `Inlet ${inletBar.toFixed(1)} bar → Outlet ${outletBar.toFixed(1)} bar (ΔP ${dropBar.toFixed(2)} bar) — ${classLabel[classification]}.`;

  if (status === "critical") {
    return `${base} Exceeds maximum membrane pressure rating — verify design basis and vessel pressure rating.`;
  }
  if (status === "warning") {
    return `${base} Approaching pressure limits — review membrane selection and element pressure rating.`;
  }
  if (classification === "low") {
    return `${base} Feed pressure may be insufficient for reliable permeate production.`;
  }
  return base;
}

// ─── Stage pressure analysis ──────────────────────────────────────────────────

/**
 * Full deterministic analysis of a single stage pressure state.
 * Returns null for invalid inlet pressure.
 */
export function analyzeStagePressure(
  inletPressureBar: number,
  pressureDropBar: number = PRESSURE_DROP_DEFAULT_PER_STAGE_BAR
): StagePressureAnalysis | null {
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
  const classification = classifyPressure(inletPressureBar);
  const status = classifyPressureStatus(inletPressureBar);
  const message = buildPressureMessage(
    inletPressureBar,
    outletPressureBar,
    drop,
    classification,
    status
  );

  return {
    inletPressureBar,
    inletPressurePsi: barToPsi(inletPressureBar),
    outletPressureBar,
    outletPressurePsi: barToPsi(outletPressureBar),
    pressureDropBar: drop,
    pressureDropPsi: barToPsi(drop),
    classification,
    status,
    message,
  };
}

// ─── Pressure drop analysis ───────────────────────────────────────────────────

/**
 * Analyze a stage pressure drop against vessel engineering limits.
 */
export function analyzePressureDrop(
  inletPressureBar: number,
  outletPressureBar: number
): PressureDropAnalysis | null {
  const result = calculatePressureDrop(inletPressureBar, outletPressureBar);
  if (result === null) return null;

  const { pressureDropBar, pressureDropPsi, pressureDropKpa } = result;
  const isWithinVesselLimit = pressureDropBar <= PRESSURE_DROP_MAX_PER_VESSEL_BAR;

  const status: PressureStatus = !isWithinVesselLimit ? "critical" : "normal";

  const message = isWithinVesselLimit
    ? `Pressure drop ${pressureDropBar.toFixed(2)} bar is within vessel limit (${PRESSURE_DROP_MAX_PER_VESSEL_BAR} bar max).`
    : `Pressure drop ${pressureDropBar.toFixed(2)} bar exceeds vessel limit of ${PRESSURE_DROP_MAX_PER_VESSEL_BAR} bar — reduce flow or add vessels in parallel.`;

  return { pressureDropBar, pressureDropPsi, pressureDropKpa, isWithinVesselLimit, status, message };
}

// ─── Boolean helpers ──────────────────────────────────────────────────────────

export function isOperationalPressure(bar: number): boolean {
  return Number.isFinite(bar) && bar >= PRESSURE_MIN_OPERATIONAL_BAR;
}

export function isBWROPressure(bar: number): boolean {
  return Number.isFinite(bar) && bar >= PRESSURE_MIN_OPERATIONAL_BAR && bar <= PRESSURE_BWRO_MAX_BAR;
}

export function isSWROPressure(bar: number): boolean {
  return Number.isFinite(bar) && bar > PRESSURE_BWRO_MAX_BAR && bar <= PRESSURE_CRITICAL_THRESHOLD_BAR;
}

export function isPressureDropWithinLimit(dropBar: number): boolean {
  return Number.isFinite(dropBar) && dropBar >= 0 && dropBar <= PRESSURE_DROP_MAX_PER_VESSEL_BAR;
}
