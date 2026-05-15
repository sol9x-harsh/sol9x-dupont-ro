import { barToPsi, barToKpa } from "@/core/units/pressure";
import {
  OSMOTIC_THRESHOLD_FRESHWATER_MAX_BAR,
  OSMOTIC_THRESHOLD_LOW_BRACKISH_MAX_BAR,
  OSMOTIC_THRESHOLD_BRACKISH_MAX_BAR,
  OSMOTIC_THRESHOLD_SEAWATER_MAX_BAR,
  OSMOTIC_WARNING_THRESHOLD_BAR,
  OSMOTIC_CRITICAL_THRESHOLD_BAR,
  OSMOTIC_MIN_COMPUTABLE_BAR,
} from "@/core/chemistry/osmotic/osmotic.constants";
import {
  estimateOsmoticPressureFromTDS,
  estimateOsmoticPressureFromConductivity,
  estimateOsmoticPressureFromIons,
  type OsmoticEstimationMethod,
} from "@/core/chemistry/osmotic/osmotic-calculation";

type IonConcentrationMap = Partial<Record<string, number | null | undefined>>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type OsmoticClassification =
  | "freshwater"
  | "low-brackish"
  | "brackish"
  | "seawater"
  | "high-salinity";

export type OsmoticStatus = "normal" | "warning" | "critical";

export interface OsmoticPressureResult {
  osmoticPressureBar: number;
  osmoticPressurePsi: number;
  osmoticPressureKpa: number;
  estimationMethod: OsmoticEstimationMethod;
  classification: OsmoticClassification;
  status: OsmoticStatus;
  message: string;
}

// ─── Classification ───────────────────────────────────────────────────────────

export function classifyOsmoticPressure(
  bar: number
): OsmoticClassification {
  if (bar <= OSMOTIC_THRESHOLD_FRESHWATER_MAX_BAR) return "freshwater";
  if (bar <= OSMOTIC_THRESHOLD_LOW_BRACKISH_MAX_BAR) return "low-brackish";
  if (bar <= OSMOTIC_THRESHOLD_BRACKISH_MAX_BAR) return "brackish";
  if (bar <= OSMOTIC_THRESHOLD_SEAWATER_MAX_BAR) return "seawater";
  return "high-salinity";
}

export function classifyOsmoticStatus(bar: number): OsmoticStatus {
  if (bar >= OSMOTIC_CRITICAL_THRESHOLD_BAR) return "critical";
  if (bar >= OSMOTIC_WARNING_THRESHOLD_BAR) return "warning";
  return "normal";
}

function buildOsmoticMessage(
  bar: number,
  classification: OsmoticClassification,
  status: OsmoticStatus,
  method: OsmoticEstimationMethod
): string {
  if (bar < OSMOTIC_MIN_COMPUTABLE_BAR) {
    return "Osmotic pressure is effectively zero — no dissolved solutes detected.";
  }

  const classLabel: Record<OsmoticClassification, string> = {
    freshwater: "freshwater",
    "low-brackish": "low-brackish water",
    brackish: "brackish water",
    seawater: "seawater",
    "high-salinity": "high-salinity brine",
  };

  const methodLabel: Record<OsmoticEstimationMethod, string> = {
    tds: "TDS-based",
    conductivity: "conductivity-based",
    "ion-based": "ion-based van't Hoff",
  };

  const base = `Osmotic pressure ${bar.toFixed(2)} bar (${methodLabel[method]}) — ${classLabel[classification]}.`;

  if (status === "critical") {
    return `${base} Exceeds seawater threshold — SWRO design basis and HP pump sizing required.`;
  }
  if (status === "warning") {
    return `${base} High osmotic pressure — verify membrane selection and net driving pressure.`;
  }
  return base;
}

function buildResult(
  bar: number,
  method: OsmoticEstimationMethod
): OsmoticPressureResult {
  const classification = classifyOsmoticPressure(bar);
  const status = classifyOsmoticStatus(bar);
  const message = buildOsmoticMessage(bar, classification, status, method);

  return {
    osmoticPressureBar: bar,
    osmoticPressurePsi: barToPsi(bar),
    osmoticPressureKpa: barToKpa(bar),
    estimationMethod: method,
    classification,
    status,
    message,
  };
}

// ─── Single-method analysis ───────────────────────────────────────────────────

export function analyzeOsmoticPressureFromTDS(
  tdsMgL: number
): OsmoticPressureResult {
  const raw = estimateOsmoticPressureFromTDS(tdsMgL);
  return buildResult(raw.osmoticPressureBar, "tds");
}

export function analyzeOsmoticPressureFromConductivity(
  conductivityUsCm: number
): OsmoticPressureResult {
  const raw = estimateOsmoticPressureFromConductivity(conductivityUsCm);
  return buildResult(raw.osmoticPressureBar, "conductivity");
}

export function analyzeOsmoticPressureFromIons(
  concentrations: IonConcentrationMap,
  temperatureC: number = 25
): OsmoticPressureResult {
  const raw = estimateOsmoticPressureFromIons(concentrations, temperatureC);
  return buildResult(raw.osmoticPressureBar, "ion-based");
}

// ─── Boolean range helpers ────────────────────────────────────────────────────

export function isFreshwaterOsmotic(bar: number): boolean {
  return bar <= OSMOTIC_THRESHOLD_FRESHWATER_MAX_BAR;
}

export function isLowBrackishOsmotic(bar: number): boolean {
  return bar > OSMOTIC_THRESHOLD_FRESHWATER_MAX_BAR && bar <= OSMOTIC_THRESHOLD_LOW_BRACKISH_MAX_BAR;
}

export function isBrackishOsmotic(bar: number): boolean {
  return bar > OSMOTIC_THRESHOLD_LOW_BRACKISH_MAX_BAR && bar <= OSMOTIC_THRESHOLD_BRACKISH_MAX_BAR;
}

export function isSeawaterOsmotic(bar: number): boolean {
  return bar > OSMOTIC_THRESHOLD_BRACKISH_MAX_BAR && bar <= OSMOTIC_THRESHOLD_SEAWATER_MAX_BAR;
}

export function isHighSalinityOsmotic(bar: number): boolean {
  return bar > OSMOTIC_THRESHOLD_SEAWATER_MAX_BAR;
}
