import { BAR_TO_PSI, PSI_TO_BAR, BAR_TO_KPA, KPA_TO_BAR, BAR_TO_ATM, ATM_TO_BAR } from "@/core/constants/physics";
import type { PressureUnit } from "@/core/constants/units";

export const barToPsi = (bar: number): number => bar * BAR_TO_PSI;
export const psiToBar = (psi: number): number => psi * PSI_TO_BAR;
export const barToKpa = (bar: number): number => bar * BAR_TO_KPA;
export const kpaToBar = (kpa: number): number => kpa * KPA_TO_BAR;
export const barToAtm = (bar: number): number => bar * BAR_TO_ATM;
export const atmToBar = (atm: number): number => atm * ATM_TO_BAR;

/** Convert any supported pressure unit to bar */
export function toBar(value: number, from: PressureUnit): number {
  switch (from) {
    case "bar": return value;
    case "psi": return psiToBar(value);
    case "kPa": return kpaToBar(value);
    case "atm": return atmToBar(value);
  }
}

/** Convert bar to any supported pressure unit */
export function fromBar(value: number, to: PressureUnit): number {
  switch (to) {
    case "bar": return value;
    case "psi": return barToPsi(value);
    case "kPa": return barToKpa(value);
    case "atm": return barToAtm(value);
  }
}
