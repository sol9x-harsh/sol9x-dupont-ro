import {
  TDS_THRESHOLD_FRESHWATER_MAX,
  TDS_THRESHOLD_LOW_BRACKISH_MAX,
  TDS_THRESHOLD_BRACKISH_MAX,
  TDS_THRESHOLD_SEAWATER_MAX,
  TDS_WARNING_THRESHOLD_MG_L,
  TDS_CRITICAL_THRESHOLD_MG_L,
  TDS_MIN_COMPUTABLE_MG_L,
} from "@/core/chemistry/tds/tds.constants";
import { TDS_CROSS_CHECK_TOLERANCE_PCT } from "@/core/chemistry/constants/chemistry.constants";
import {
  calculateTDS,
  crossCheckTDS,
} from "@/core/chemistry/tds/tds-calculation";
import type { IonConcentrationMap } from "@/core/chemistry/balance/charge-balance";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TDSClassification =
  | "freshwater"
  | "low-brackish"
  | "brackish"
  | "seawater"
  | "high-salinity";

export type TDSStatus = "normal" | "warning" | "critical";

export interface TDSResult {
  tdsMgL: number;
  classification: TDSClassification;
  status: TDSStatus;
  message: string;
}

export interface TDSCrossCheckResult extends TDSResult {
  measuredTDSMgL: number;
  deviationPct: number;
  crossCheckPassed: boolean;
  crossCheckMessage: string;
}

// ─── Classification ───────────────────────────────────────────────────────────

/**
 * Classify TDS into industrial water quality categories.
 * Thresholds are based on standard RO engineering practice and WHO guidelines.
 */
export function classifyTDS(tdsMgL: number): TDSClassification {
  if (tdsMgL <= TDS_THRESHOLD_FRESHWATER_MAX) return "freshwater";
  if (tdsMgL <= TDS_THRESHOLD_LOW_BRACKISH_MAX) return "low-brackish";
  if (tdsMgL <= TDS_THRESHOLD_BRACKISH_MAX) return "brackish";
  if (tdsMgL <= TDS_THRESHOLD_SEAWATER_MAX) return "seawater";
  return "high-salinity";
}

/**
 * Determine engineering status from TDS value.
 * Warning and critical thresholds reflect practical RO operating limits.
 */
export function classifyTDSStatus(tdsMgL: number): TDSStatus {
  if (tdsMgL >= TDS_CRITICAL_THRESHOLD_MG_L) return "critical";
  if (tdsMgL >= TDS_WARNING_THRESHOLD_MG_L) return "warning";
  return "normal";
}

function buildTDSMessage(
  tdsMgL: number,
  classification: TDSClassification,
  status: TDSStatus
): string {
  if (tdsMgL < TDS_MIN_COMPUTABLE_MG_L) {
    return "TDS is effectively zero — no dissolved solids detected.";
  }

  const classLabel: Record<TDSClassification, string> = {
    freshwater: "freshwater",
    "low-brackish": "low-brackish water",
    brackish: "brackish water",
    seawater: "seawater",
    "high-salinity": "high-salinity brine",
  };

  const base = `TDS ${tdsMgL.toFixed(1)} mg/L — classified as ${classLabel[classification]}.`;

  if (status === "critical") {
    return `${base} Exceeds seawater range — verify feed chemistry or SWRO design basis.`;
  }
  if (status === "warning") {
    return `${base} High TDS — confirm membrane selection and operating pressure.`;
  }
  return base;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

/**
 * Run full TDS analysis from a raw ion concentration map.
 * Returns classification, status, and engineering message.
 */
export function analyzeTDS(concentrations: IonConcentrationMap): TDSResult {
  const tdsMgL = calculateTDS(concentrations);
  const classification = classifyTDS(tdsMgL);
  const status = classifyTDSStatus(tdsMgL);
  const message = buildTDSMessage(tdsMgL, classification, status);

  return { tdsMgL, classification, status, message };
}

/**
 * Run TDS analysis and cross-check against a measured TDS value.
 * Useful for validating lab-reported TDS against ion-sum TDS.
 */
export function analyzeTDSWithCrossCheck(
  concentrations: IonConcentrationMap,
  measuredTDSMgL: number
): TDSCrossCheckResult {
  const base = analyzeTDS(concentrations);
  const { deviationPct, isWithinTolerance } = crossCheckTDS(
    base.tdsMgL,
    measuredTDSMgL,
    TDS_CROSS_CHECK_TOLERANCE_PCT
  );

  const crossCheckMessage = isWithinTolerance
    ? `Ion-summed TDS matches measured TDS within ${TDS_CROSS_CHECK_TOLERANCE_PCT}% tolerance (deviation: ${deviationPct.toFixed(1)}%).`
    : `Ion-summed TDS deviates ${deviationPct.toFixed(1)}% from measured TDS — review ion concentrations or measured value.`;

  return {
    ...base,
    measuredTDSMgL,
    deviationPct,
    crossCheckPassed: isWithinTolerance,
    crossCheckMessage,
  };
}

// ─── Classification helpers (exported for external use) ───────────────────────

export function isFreshwater(tdsMgL: number): boolean {
  return tdsMgL <= TDS_THRESHOLD_FRESHWATER_MAX;
}

export function isBrackish(tdsMgL: number): boolean {
  return (
    tdsMgL > TDS_THRESHOLD_LOW_BRACKISH_MAX &&
    tdsMgL <= TDS_THRESHOLD_BRACKISH_MAX
  );
}

export function isSeawater(tdsMgL: number): boolean {
  return (
    tdsMgL > TDS_THRESHOLD_BRACKISH_MAX &&
    tdsMgL <= TDS_THRESHOLD_SEAWATER_MAX
  );
}

export function isHighSalinity(tdsMgL: number): boolean {
  return tdsMgL > TDS_THRESHOLD_SEAWATER_MAX;
}
