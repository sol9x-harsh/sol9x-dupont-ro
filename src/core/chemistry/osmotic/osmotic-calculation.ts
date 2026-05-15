import { IONS } from "@/core/constants/ions";
import { safeConcentration } from "@/core/chemistry/conversions/normalization";
import { mgLToMmolL } from "@/core/chemistry/conversions/mmol";
import { barToPsi, barToKpa } from "@/core/units/pressure";
import {
  R_L_BAR_PER_MOL_K,
  REFERENCE_TEMPERATURE_K,
  ION_DISSOCIATION_FACTORS,
  OSMOTIC_PRESSURE_TDS_FACTOR_BAR_PER_MG_L,
  OSMOTIC_PRESSURE_CONDUCTIVITY_FACTOR_BAR_PER_US_CM,
  OSMOTIC_MIN_COMPUTABLE_BAR,
} from "@/core/chemistry/osmotic/osmotic.constants";

// Same shape used across chemistry modules — defined locally to avoid circular imports
type IonConcentrationMap = Partial<Record<string, number | null | undefined>>;

export type OsmoticEstimationMethod = "tds" | "conductivity" | "ion-based";

export interface OsmoticPressureRaw {
  osmoticPressureBar: number;
  osmoticPressurePsi: number;
  osmoticPressureKpa: number;
  estimationMethod: OsmoticEstimationMethod;
}

// ─── TDS-based estimation ─────────────────────────────────────────────────────

/**
 * Estimate osmotic pressure from TDS using the engineering rule-of-thumb:
 *   π (bar) ≈ TDS (mg/L) × 7.0×10⁻⁴
 *
 * Valid for mixed-ion brackish RO feed at 25°C reference temperature.
 * Returns 0 for invalid or non-positive TDS.
 */
export function estimateOsmoticPressureFromTDS(
  tdsMgL: number
): OsmoticPressureRaw {
  if (!Number.isFinite(tdsMgL) || tdsMgL <= 0) {
    return { osmoticPressureBar: 0, osmoticPressurePsi: 0, osmoticPressureKpa: 0, estimationMethod: "tds" };
  }

  const bar = tdsMgL * OSMOTIC_PRESSURE_TDS_FACTOR_BAR_PER_MG_L;
  return {
    osmoticPressureBar: bar,
    osmoticPressurePsi: barToPsi(bar),
    osmoticPressureKpa: barToKpa(bar),
    estimationMethod: "tds",
  };
}

// ─── Conductivity-based estimation ───────────────────────────────────────────

/**
 * Estimate osmotic pressure from conductivity using the empirical correlation:
 *   π (bar) ≈ conductivity (µS/cm) × 4.48×10⁻⁴
 *
 * Returns 0 for invalid or non-positive conductivity.
 */
export function estimateOsmoticPressureFromConductivity(
  conductivityUsCm: number
): OsmoticPressureRaw {
  if (!Number.isFinite(conductivityUsCm) || conductivityUsCm <= 0) {
    return { osmoticPressureBar: 0, osmoticPressurePsi: 0, osmoticPressureKpa: 0, estimationMethod: "conductivity" };
  }

  const bar = conductivityUsCm * OSMOTIC_PRESSURE_CONDUCTIVITY_FACTOR_BAR_PER_US_CM;
  return {
    osmoticPressureBar: bar,
    osmoticPressurePsi: barToPsi(bar),
    osmoticPressureKpa: barToKpa(bar),
    estimationMethod: "conductivity",
  };
}

// ─── Ion-based estimation (van't Hoff) ───────────────────────────────────────

/**
 * Estimate osmotic pressure from ion concentrations using simplified van't Hoff:
 *   π = Σ [i × C_i (mmol/L)] × R × T
 *
 * Where:
 *   i   = dissociation factor (1 per ion species in engineering approximation)
 *   C_i = molar concentration (mmol/L → mol/L for calculation)
 *   R   = 0.08314 L·bar / (mol·K)
 *   T   = 298.15 K (25°C reference)
 *
 * All species treated as fully dissociated. No activity coefficients applied.
 * Unknown ions and invalid/negative concentrations are skipped.
 */
export function estimateOsmoticPressureFromIons(
  concentrations: IonConcentrationMap,
  temperatureC: number = 25
): OsmoticPressureRaw {
  let totalMmolL = 0;

  for (const [ionId, raw] of Object.entries(concentrations)) {
    const ion = IONS[ionId as keyof typeof IONS];
    if (!ion) continue;

    const mgL = safeConcentration(raw);
    if (mgL <= 0) continue;

    let mmolL: number | null;
    try {
      mmolL = mgLToMmolL(ionId, mgL);
    } catch {
      continue;
    }
    if (mmolL === null || !Number.isFinite(mmolL) || mmolL <= 0) continue;

    const i = ION_DISSOCIATION_FACTORS[ionId] ?? 1;
    totalMmolL += i * mmolL;
  }

  if (totalMmolL < OSMOTIC_MIN_COMPUTABLE_BAR) {
    return { osmoticPressureBar: 0, osmoticPressurePsi: 0, osmoticPressureKpa: 0, estimationMethod: "ion-based" };
  }

  // Convert mmol/L → mol/L, then apply van't Hoff: π = nRT
  const molPerL = totalMmolL / 1000;
  const temperatureK = temperatureC + 273.15;
  const bar = molPerL * R_L_BAR_PER_MOL_K * temperatureK;

  return {
    osmoticPressureBar: bar,
    osmoticPressurePsi: barToPsi(bar),
    osmoticPressureKpa: barToKpa(bar),
    estimationMethod: "ion-based",
  };
}
