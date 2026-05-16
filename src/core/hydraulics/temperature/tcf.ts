import { TEMP_REF_KELVIN, TEMP_ABSOLUTE_ZERO } from "@/core/constants/physics";
import type { WaterType } from "@/core/constants/membrane";

// Activation energy coefficients (K) derived from Arrhenius water transport model.
// Source: ASTM D4516; DowFilmtec / Hydranautics design guidelines.
// BWRO: ~22 kJ/mol (~2640 K), SWRO: ~25 kJ/mol (~3020 K), NF: ~17 kJ/mol (~2000 K).
const TCF_ACTIVATION_ENERGY_K: Record<WaterType, number> = {
  bwro: 2640,
  swro: 3020,
  nf: 2000,
};

/**
 * Temperature Correction Factor for membrane water permeability (Arrhenius model).
 *
 *   TCF = exp[ Eₐ × (1/T_ref − 1/T) ]
 *
 * T_ref = 298.15 K (25°C, standard datasheet condition).
 * TCF = 1.0 at 25°C; < 1 below 25°C (lower flux); > 1 above 25°C (higher flux).
 *
 * Typical values:
 *   BWRO @ 15°C → TCF ≈ 0.74  (26% flux reduction)
 *   BWRO @ 35°C → TCF ≈ 1.33  (33% flux increase)
 *   SWRO @ 15°C → TCF ≈ 0.70  (30% flux reduction)
 *   SWRO @ 35°C → TCF ≈ 1.40  (40% flux increase)
 */
export function calculateTCF(
  temperatureC: number,
  waterType: WaterType = "bwro"
): number {
  const T_K = temperatureC + TEMP_ABSOLUTE_ZERO;
  if (T_K <= 0 || !Number.isFinite(T_K)) return 1;
  const Ea = TCF_ACTIVATION_ENERGY_K[waterType] ?? TCF_ACTIVATION_ENERGY_K.bwro;
  return Math.exp(Ea * (1 / TEMP_REF_KELVIN - 1 / T_K));
}

/**
 * Apply TCF to a reference permeability A measured at 25°C.
 *   A_eff(T) = A_ref × TCF(T)
 *
 * All manufacturer datasheets report A at 25°C standard test conditions.
 * This must be corrected before using A in Jw = A × NDP calculations.
 */
export function correctPermeabilityForTemperature(
  permeabilityARef: number,
  temperatureC: number,
  waterType: WaterType = "bwro"
): number {
  if (!Number.isFinite(permeabilityARef) || permeabilityARef <= 0) {
    return permeabilityARef;
  }
  return permeabilityARef * calculateTCF(temperatureC, waterType);
}
