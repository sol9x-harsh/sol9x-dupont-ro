export const PRESSURE_UNITS = ["bar", "psi", "kPa", "atm"] as const;
export type PressureUnit = (typeof PRESSURE_UNITS)[number];

export const FLOW_UNITS = ["m3/h", "m3/d", "L/h", "gpm", "gpd", "mgd"] as const;
export type FlowUnit = (typeof FLOW_UNITS)[number];

export const CONCENTRATION_UNITS = ["mg/L", "ppm", "meq/L", "mmol/L", "g/L"] as const;
export type ConcentrationUnit = (typeof CONCENTRATION_UNITS)[number];

export const TEMPERATURE_UNITS = ["°C", "°F", "K"] as const;
export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number];

export const FLUX_UNITS = ["L/m²/h", "gfd"] as const;
export type FluxUnit = (typeof FLUX_UNITS)[number];

export const AREA_UNITS = ["m²", "ft²"] as const;
export type AreaUnit = (typeof AREA_UNITS)[number];
