import type { FlowUnit } from "@/core/constants/units";

// Conversion factors relative to m³/h
const M3H_PER_UNIT: Record<FlowUnit, number> = {
  "m3/h": 1,
  "m3/d": 1 / 24,
  "L/h": 0.001,
  "gpm": 0.227125, // 1 US gal = 3.78541 L
  "gpd": 0.227125 / 1440,
  "mgd": 0.227125 / 1440 * 1_000_000,
};

/** Convert flow from any unit to m³/h */
export function toM3h(value: number, from: FlowUnit): number {
  return value * M3H_PER_UNIT[from];
}

/** Convert m³/h to any unit */
export function fromM3h(value: number, to: FlowUnit): number {
  return value / M3H_PER_UNIT[to];
}

export const m3hToGpm = (m3h: number): number => fromM3h(m3h, "gpm");
export const gpmToM3h = (gpm: number): number => toM3h(gpm, "gpm");
export const m3hToM3d = (m3h: number): number => m3h * 24;
export const m3dToM3h = (m3d: number): number => m3d / 24;
export const m3hToLh = (m3h: number): number => m3h * 1000;
export const lhToM3h = (lh: number): number => lh / 1000;
