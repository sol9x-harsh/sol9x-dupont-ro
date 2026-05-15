// Universal gas constant (L·atm / mol·K)
export const R_GAS_L_ATM = 0.08206;

// Universal gas constant (J / mol·K)
export const R_GAS_J = 8.314;

// Standard temperature and pressure
export const TEMP_REF_CELSIUS = 25; // °C
export const TEMP_REF_KELVIN = 298.15; // K
export const TEMP_ABSOLUTE_ZERO = 273.15; // K offset for °C → K

// Water density at 25°C (kg/m³)
export const WATER_DENSITY_KG_M3 = 997.0;

// Water density at 25°C (g/mL)
export const WATER_DENSITY_G_ML = 0.997;

// Pressure conversions (all relative to 1 bar)
export const BAR_TO_PSI = 14.5038;
export const PSI_TO_BAR = 1 / BAR_TO_PSI;
export const BAR_TO_KPA = 100;
export const KPA_TO_BAR = 0.01;
export const BAR_TO_ATM = 0.986923;
export const ATM_TO_BAR = 1.01325;

// Osmotic pressure van't Hoff constant baseline
// π = iCRT — use R_GAS_L_ATM with concentration in mol/L
export const OSMOTIC_PRESSURE_CONSTANT = R_GAS_L_ATM;
