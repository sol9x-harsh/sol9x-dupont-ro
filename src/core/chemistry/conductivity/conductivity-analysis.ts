import type { IonConcentrationMap } from '@/core/chemistry/balance/charge-balance';
import {
  CONDUCTIVITY_THRESHOLD_FRESHWATER_MAX,
  CONDUCTIVITY_THRESHOLD_LOW_BRACKISH_MAX,
  CONDUCTIVITY_THRESHOLD_BRACKISH_MAX,
  CONDUCTIVITY_THRESHOLD_SEAWATER_MAX,
  CONDUCTIVITY_WARNING_THRESHOLD_US_CM,
  CONDUCTIVITY_CRITICAL_THRESHOLD_US_CM,
  CONDUCTIVITY_MIN_COMPUTABLE_US_CM,
  CONDUCTIVITY_CROSS_CHECK_TOLERANCE_PCT,
  CONDUCTIVITY_TDS_FACTOR_DEFAULT,
  CONDUCTIVITY_SEAWATER_TDS_THRESHOLD_MG_L,
} from '@/core/chemistry/conductivity/conductivity.constants';
import {
  estimateConductivityFromTDS,
  estimateConductivityFromIons,
  crossCheckConductivity,
  type ConductivityEstimationMethod,
} from '@/core/chemistry/conductivity/conductivity-calculation';
import {
  getConductivityStrategy,
  type WaterType,
} from '@/core/chemistry/conductivity/conductivity-strategy';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConductivityClassification =
  | 'freshwater'
  | 'low-brackish'
  | 'brackish'
  | 'seawater'
  | 'high-salinity';

export type ConductivityStatus = 'normal' | 'warning' | 'critical';

export interface ConductivityResult {
  conductivityUsCm: number;
  estimationMethod: ConductivityEstimationMethod;
  classification: ConductivityClassification;
  status: ConductivityStatus;
  message: string;
}

export interface ConductivityDualResult extends ConductivityResult {
  tdsBasedUsCm: number;
  ionWeightedUsCm: number;
  deviationPct: number;
  crossCheckPassed: boolean;
  crossCheckMessage: string;
}

// ─── Classification ───────────────────────────────────────────────────────────

export function classifyConductivity(
  conductivityUsCm: number,
): ConductivityClassification {
  if (conductivityUsCm <= CONDUCTIVITY_THRESHOLD_FRESHWATER_MAX)
    return 'freshwater';
  if (conductivityUsCm <= CONDUCTIVITY_THRESHOLD_LOW_BRACKISH_MAX)
    return 'low-brackish';
  if (conductivityUsCm <= CONDUCTIVITY_THRESHOLD_BRACKISH_MAX)
    return 'brackish';
  if (conductivityUsCm <= CONDUCTIVITY_THRESHOLD_SEAWATER_MAX)
    return 'seawater';
  return 'high-salinity';
}

export function classifyConductivityStatus(
  conductivityUsCm: number,
): ConductivityStatus {
  if (conductivityUsCm >= CONDUCTIVITY_CRITICAL_THRESHOLD_US_CM)
    return 'critical';
  if (conductivityUsCm >= CONDUCTIVITY_WARNING_THRESHOLD_US_CM)
    return 'warning';
  return 'normal';
}

function buildConductivityMessage(
  conductivityUsCm: number,
  classification: ConductivityClassification,
  status: ConductivityStatus,
  method: ConductivityEstimationMethod,
): string {
  if (conductivityUsCm < CONDUCTIVITY_MIN_COMPUTABLE_US_CM) {
    return 'Conductivity is effectively zero — no dissolved ions detected.';
  }

  const classLabel: Record<ConductivityClassification, string> = {
    freshwater: 'freshwater',
    'low-brackish': 'low-brackish water',
    brackish: 'brackish water',
    seawater: 'seawater',
    'high-salinity': 'high-salinity brine',
  };

  const methodLabel: Record<ConductivityEstimationMethod, string> = {
    tds: 'TDS-based',
    'ion-weighted': 'ion-weighted',
    hybrid: 'hybrid',
  };

  const base = `Conductivity ${conductivityUsCm.toFixed(0)} µS/cm (${methodLabel[method]}) — ${classLabel[classification]}.`;

  if (status === 'critical') {
    return `${base} Exceeds seawater range — verify feed stream and SWRO design basis.`;
  }
  if (status === 'warning') {
    return `${base} High conductivity — review membrane selection and operating pressure.`;
  }
  return base;
}

// ─── Single-method analysis ───────────────────────────────────────────────────

/**
 * Estimate and classify conductivity from TDS only.
 */
export function analyzeConductivityFromTDS(
  tdsMgL: number,
  factor: number = CONDUCTIVITY_TDS_FACTOR_DEFAULT,
): ConductivityResult {
  const conductivityUsCm = estimateConductivityFromTDS(tdsMgL, factor);
  const classification = classifyConductivity(conductivityUsCm);
  const status = classifyConductivityStatus(conductivityUsCm);
  const message = buildConductivityMessage(
    conductivityUsCm,
    classification,
    status,
    'tds',
  );

  return {
    conductivityUsCm,
    estimationMethod: 'tds',
    classification,
    status,
    message,
  };
}

/**
 * Estimate and classify conductivity from ion concentration map only.
 */
export function analyzeConductivityFromIons(
  concentrations: IonConcentrationMap,
): ConductivityResult {
  const conductivityUsCm = estimateConductivityFromIons(concentrations);
  const classification = classifyConductivity(conductivityUsCm);
  const status = classifyConductivityStatus(conductivityUsCm);
  const message = buildConductivityMessage(
    conductivityUsCm,
    classification,
    status,
    'ion-weighted',
  );

  return {
    conductivityUsCm,
    estimationMethod: 'ion-weighted',
    classification,
    status,
    message,
  };
}

// ─── Dual-method analysis with cross-check ────────────────────────────────────

/**
 * Run both TDS-based and ion-weighted conductivity estimates.
 *
 * Primary selection logic (water-type aware):
 * - Sea Water / high-salinity (TDS > 15,000 mg/L when no waterType given):
 *   TDS-based empirical correlation is primary. Ion-weighted λ° constants are
 *   unreliable at seawater ionic strength and are kept only as a cross-check.
 * - All other water types: ion-weighted is primary when available,
 *   TDS-based is the fallback / cross-check.
 *
 * When `waterType` is supplied the routing uses the category strategy from
 * getConductivityStrategy(); otherwise it falls back to the legacy TDS-threshold
 * heuristic for backward compatibility.
 */
export function analyzeConductivityDual(
  tdsMgL: number,
  concentrations: IonConcentrationMap,
  waterType?: WaterType,
  factor: number = CONDUCTIVITY_TDS_FACTOR_DEFAULT,
): ConductivityDualResult {
  // Resolve strategy: water-type-aware path takes precedence over legacy heuristic
  const strategy = waterType
    ? getConductivityStrategy(waterType, tdsMgL)
    : null;

  const useTdsPrimary = strategy
    ? strategy.useTdsPrimary
    : tdsMgL > CONDUCTIVITY_SEAWATER_TDS_THRESHOLD_MG_L;

  const effectiveFactor = strategy?.defaultFactor ?? factor;

  const tdsBasedUsCm = estimateConductivityFromTDS(tdsMgL, effectiveFactor);
  const ionWeightedUsCm = estimateConductivityFromIons(concentrations);

  const hasBoth = tdsBasedUsCm > 0 && ionWeightedUsCm > 0;

  let conductivityUsCm: number;
  let method: ConductivityEstimationMethod;

  if (useTdsPrimary) {
    conductivityUsCm = tdsBasedUsCm;
    method = 'tds';
  } else {
    conductivityUsCm = hasBoth
      ? ionWeightedUsCm
      : ionWeightedUsCm > 0
        ? ionWeightedUsCm
        : tdsBasedUsCm;
    method = hasBoth || ionWeightedUsCm > 0 ? 'ion-weighted' : 'tds';
  }

  const classification = classifyConductivity(conductivityUsCm);
  const status = classifyConductivityStatus(conductivityUsCm);
  const reportedMethod: ConductivityEstimationMethod =
    !useTdsPrimary && hasBoth ? 'hybrid' : method;

  const message = buildConductivityMessage(
    conductivityUsCm,
    classification,
    status,
    reportedMethod,
  );

  const { deviationPct, isWithinTolerance } = crossCheckConductivity(
    tdsBasedUsCm,
    ionWeightedUsCm,
    CONDUCTIVITY_CROSS_CHECK_TOLERANCE_PCT,
  );

  const crossCheckMessage = hasBoth
    ? isWithinTolerance
      ? `TDS-based and ion-weighted estimates agree within ${CONDUCTIVITY_CROSS_CHECK_TOLERANCE_PCT}% tolerance (deviation: ${deviationPct.toFixed(1)}%).`
      : `TDS-based and ion-weighted estimates diverge by ${deviationPct.toFixed(1)}% — review ion concentrations or measured TDS.`
    : 'Cross-check skipped — only one estimation method returned a valid result.';

  return {
    conductivityUsCm,
    estimationMethod: reportedMethod,
    classification,
    status,
    message,
    tdsBasedUsCm,
    ionWeightedUsCm,
    deviationPct,
    crossCheckPassed: hasBoth ? isWithinTolerance : true,
    crossCheckMessage,
  };
}

// ─── Boolean helpers ──────────────────────────────────────────────────────────

export function isFreshwaterConductivity(usCm: number): boolean {
  return usCm <= CONDUCTIVITY_THRESHOLD_FRESHWATER_MAX;
}

export function isBrackishConductivity(usCm: number): boolean {
  return (
    usCm > CONDUCTIVITY_THRESHOLD_LOW_BRACKISH_MAX &&
    usCm <= CONDUCTIVITY_THRESHOLD_BRACKISH_MAX
  );
}

export function isSeawaterConductivity(usCm: number): boolean {
  return (
    usCm > CONDUCTIVITY_THRESHOLD_BRACKISH_MAX &&
    usCm <= CONDUCTIVITY_THRESHOLD_SEAWATER_MAX
  );
}

export function isHighSalinityConductivity(usCm: number): boolean {
  return usCm > CONDUCTIVITY_THRESHOLD_SEAWATER_MAX;
}
