import type { ION_IDS } from "@/core/constants/ions";

export type IonId = (typeof ION_IDS)[number];

/** Ion concentrations keyed by ion ID, values in mg/L */
export type IonConcentrations = Partial<Record<string, number>>;

export interface ChemistryStream {
  /** mg/L concentrations per ion */
  ions: IonConcentrations;
  /** Total dissolved solids (mg/L) */
  tds: number;
  /** Estimated conductivity (µS/cm) */
  conductivity: number;
  /** pH */
  pH: number;
  /** Temperature (°C) */
  temperatureCelsius: number;
  /** Charge balance error (%) */
  chargeBalanceError: number;
}

export interface ChargeBalance {
  /** Sum of cation equivalents (meq/L) */
  cationSum: number;
  /** Sum of anion equivalents (meq/L) */
  anionSum: number;
  /** (cations - anions) / ((cations + anions) / 2) * 100 */
  errorPercent: number;
}

export interface IonEquivalent {
  ionId: string;
  mgPerL: number;
  meqPerL: number;
  mmolPerL: number;
}
