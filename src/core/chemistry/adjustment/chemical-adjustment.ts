import type { IonComposition } from "@/store/feed-store";
import type { ChemicalAdjustment } from "@/store/ro-config-store";

export interface AdjustedChemistry {
  ions: IonComposition;
  ph: number;
  tds: number;
  lsi: number;
  sdi: number;
  ionicStrength: number;
  temperature: number;
}

export interface ChemistryAdjustmentResult {
  beforeAdjustment: AdjustedChemistry;
  afterAcid: AdjustedChemistry;
  afterDegas: AdjustedChemistry;
  afterBase: AdjustedChemistry;
  final: AdjustedChemistry; // alias for afterBase
  antiscalantOn: boolean;
  acidDoseMgL: number;
  baseDoseMgL: number;
  dechlorinatorDoseMgL: number;
}

const MW = {
  Ca: 40.08,
  HCO3: 61.02,
  CO3: 60.01,
  CO2: 44.01,
  Na: 22.99,
  Cl: 35.45,
  SO4: 96.06,
  SO4_eq: 48.03,
};

// Henry's Law constant for CO₂ dissolution in water at 25°C.
// KH = 3.4e-2 mol/(L·atm) → converted to mg/L per µatm.
// [CO₂](mg/L) = pCO₂(µatm) × KH_MG_L_PER_UATM
// Derivation: 3.4e-2 (mol/L/atm) × 44010 (mg/mol) / 1e6 (µatm/atm)
const HENRY_KH_CO2_MG_L_PER_UATM = (3.4e-2 * 44010) / 1e6; // ≈ 1.4964e-3 mg/L/µatm

/**
 * Temperature-corrected pKa values for the carbonate system.
 * Harned & Davis (1943) equations — valid from 0 to 50°C.
 *   pK1(T) = 3404.71/T + 0.032786·T − 14.8435
 *   pK2(T) = 2902.39/T + 0.02379·T − 6.498
 * where T is in Kelvin.
 *
 * At 25°C: pK1 = 6.35, pK2 = 10.33 (matches tabulated values).
 * At 15°C: pK1 ≈ 6.42, pK2 ≈ 10.43.
 * At 35°C: pK1 ≈ 6.31, pK2 ≈ 10.22.
 */
function getTemperatureCorrectedPKa(temperatureC: number): { pK1: number; pK2: number; K1: number; K2: number } {
  const T = temperatureC + 273.15;
  const pK1 = 3404.71 / T + 0.032786 * T - 14.8435;
  const pK2 = 2902.39 / T + 0.02379 * T - 6.498;
  return {
    pK1,
    pK2,
    K1: Math.pow(10, -pK1),
    K2: Math.pow(10, -pK2),
  };
}

function calculateIonicStrength(ions: IonComposition): number {
  // I = 0.5 × Σ(Cᵢ × zᵢ²) in mol/L
  // z²: monovalent = 1, divalent = 4, trivalent = 9
  return 0.5 * (
    (ions.ammonium   / 18.04)  * 1 +
    (ions.sodium     / 22.99)  * 1 +
    (ions.potassium  / 39.10)  * 1 +
    (ions.magnesium  / 24.30)  * 4 +
    (ions.calcium    / 40.08)  * 4 +
    (ions.strontium  / 87.62)  * 4 +
    (ions.barium     / 137.33) * 4 +
    (ions.carbonate  / 60.01)  * 4 +
    (ions.bicarbonate/ 61.02)  * 1 +
    (ions.nitrate    / 62.00)  * 1 +
    (ions.fluoride   / 19.00)  * 1 +
    (ions.chloride   / 35.45)  * 1 +
    (ions.bromide    / 79.90)  * 1 +
    (ions.sulfate    / 96.06)  * 4 +
    (ions.phosphate  / 94.97)  * 9
  ) / 1000;
}

function calculateTDS(ions: IonComposition): number {
  return Object.values(ions).reduce((sum, val) => sum + val, 0);
}

function calculateScaling(
  ions: IonComposition,
  ph: number,
  temperatureC: number,
): { lsi: number; sdi: number } {
  const calciumMolL = (ions.calcium / MW.Ca) / 1000;
  const bicarbMolL  = (ions.bicarbonate / MW.HCO3) / 1000;
  const I = calculateIonicStrength(ions);

  if (calciumMolL <= 0 || bicarbMolL <= 0) {
    return { lsi: 0, sdi: 0 };
  }

  const pCa  = -Math.log10(calciumMolL);
  const pAlk = -Math.log10(bicarbMolL);

  // pHs (Langelier saturation pH) with temperature and ionic-strength correction.
  // Davies activity correction: γ ≈ 10^(−A·z²·(√I/(1+√I) − 0.3·I)) where A≈0.509 at 25°C.
  // Simplified ionic-strength term after Langelier (1936):
  const sqrtI = Math.sqrt(I);
  const C = 9.3 * sqrtI / (1 + sqrtI); // Sontheimer's approximation for the ionic-strength factor

  // Temperature correction to pKs2 (CaCO₃ solubility product):
  // pKs2 shifts by ~0.011 per °C (decreases at higher T → more scaling risk).
  const tempCorr = 0.011 * (25 - temperatureC);
  const pHs = 9.3 + pCa + pAlk - C + tempCorr;

  const lsi = ph - pHs;

  // Stiff & Davis Stability Index: uses same pH-saturation formula but applies
  // an additional ionic-strength correction factor K that replaces the constant 9.3.
  // Simplified: K_sd ≈ 9.3 − 2.8·√I (shifts pHs upward in high-TDS water → less scaling).
  // For BWRO I ≈ 0.01–0.05: K_sd ≈ 9.0–9.2; SWRO I ≈ 0.7: K_sd ≈ 6.95.
  const K_sd = Math.max(8.0, 9.3 - 2.8 * sqrtI);
  const pHs_sd = K_sd + pCa + pAlk - C + tempCorr;
  const sdi = ph - pHs_sd;

  return { lsi, sdi };
}

function computeAlkalinity(ions: IonComposition, ph: number): number {
  // Alkalinity in eq/L = [HCO₃⁻] + 2[CO₃²⁻] + [OH⁻] − [H⁺]
  const hco3 = (ions.bicarbonate / MW.HCO3) / 1000;
  const co3  = (ions.carbonate   / MW.CO3)  / 1000;
  const H  = Math.pow(10, -ph);
  const OH = Math.pow(10, -(14 - ph));
  return hco3 + 2 * co3 + OH - H;
}

function redistributeCarbonate(
  ticMolL: number,
  ph: number,
  K1: number,
  K2: number,
): { co2: number; hco3: number; co3: number } {
  const H = Math.pow(10, -ph);
  const denom  = 1 + K1 / H + (K1 * K2) / (H * H);
  const alpha0 = 1 / denom;
  const alpha1 = (K1 / H) / denom;
  const alpha2 = (K1 * K2) / (H * H) / denom;

  return {
    co2:  ticMolL * alpha0 * MW.CO2  * 1000,
    hco3: ticMolL * alpha1 * MW.HCO3 * 1000,
    co3:  ticMolL * alpha2 * MW.CO3  * 1000,
  };
}

function solvePhForAlkalinityAndCO2(
  alkEqL: number,
  co2MgL: number,
  K1: number,
  K2: number,
): number {
  // Binary-search pH given fixed [CO₂] and total alkalinity.
  const co2MolL = (co2MgL / MW.CO2) / 1000;
  let low = 2.0, high = 12.0;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const H = Math.pow(10, -mid);
    const hco3 = K1 * co2MolL / H;
    const co3  = K2 * hco3 / H;
    const calcAlk = hco3 + 2 * co3 + Math.pow(10, -(14 - mid)) - H;
    if (calcAlk > alkEqL) high = mid; else low = mid;
  }
  return (low + high) / 2;
}

function clampIons(ions: IonComposition): IonComposition {
  const clamped: IonComposition = { ...ions };
  for (const key of Object.keys(clamped) as (keyof IonComposition)[]) {
    if (clamped[key] < 0) clamped[key] = 0;
  }
  return clamped;
}

export function simulateChemicalAdjustment(
  initialIons: IonComposition,
  initialPh: number,
  temperatureC: number,
  config: ChemicalAdjustment,
): ChemistryAdjustmentResult {

  // Derive temperature-corrected pKa values for this run.
  const { K1, K2 } = getTemperatureCorrectedPKa(temperatureC);

  const createSnapshot = (ions: IonComposition, ph: number): AdjustedChemistry => {
    const safe = clampIons(ions);
    const { lsi, sdi } = calculateScaling(safe, ph, temperatureC);
    return {
      ions: safe,
      ph,
      tds: calculateTDS(safe),
      lsi,
      sdi,
      ionicStrength: calculateIonicStrength(safe),
      temperature: temperatureC,
    };
  };

  const beforeAdjustment = createSnapshot(initialIons, initialPh);

  // ── Step 0: Dechlorinator (add first — affects ion baseline before pH adjustment) ──
  let currentIons: IonComposition = { ...initialIons };
  let currentPh = initialPh;

  let dechlorinatorDoseMgL = 0;
  if (config.dechlorinatorOn && config.dechlorinatorDose > 0) {
    dechlorinatorDoseMgL = config.dechlorinatorDose;
    // NaHSO₃ (MW 104.06) dissociates to Na⁺ + HSO₃⁻; after oxidation yields Na⁺ + SO₄²⁻.
    currentIons.sodium  += dechlorinatorDoseMgL * (MW.Na  / 104.06);
    currentIons.sulfate += dechlorinatorDoseMgL * (MW.SO4 / 104.06);
  }

  let ticMolL = (
    (currentIons.co2        / MW.CO2)  +
    (currentIons.bicarbonate / MW.HCO3) +
    (currentIons.carbonate   / MW.CO3)
  ) / 1000;
  let alkEqL = computeAlkalinity(currentIons, currentPh);

  // ── Step 1: Acid dosing (↓ pH) ───────────────────────────────────────────────
  let acidDoseMgL = 0;
  if (config.phDownOn && config.phDownTargetPh < currentPh) {
    const targetPh = config.phDownTargetPh;

    // Redistribute carbonate species at target pH (same TIC, new pH).
    const { co2, hco3, co3 } = redistributeCarbonate(ticMolL, targetPh, K1, K2);
    currentIons.co2        = co2;
    currentIons.bicarbonate = hco3;
    currentIons.carbonate   = co3;

    // Acid consumed = decrease in alkalinity (eq/L).
    const targetAlk = computeAlkalinity(currentIons, targetPh);
    const deltaAlk  = alkEqL - targetAlk; // positive = acid added

    if (config.phDownChemical.includes('HCl')) {
      // HCl → H⁺ + Cl⁻; MW 36.46, eq wt = 36.46.
      currentIons.chloride += deltaAlk * MW.Cl * 1000;
      acidDoseMgL = deltaAlk * 36.46 * 1000;
    } else if (config.phDownChemical.includes('H2SO4')) {
      // H₂SO₄ → 2H⁺ + SO₄²⁻; eq wt = 49.04.
      currentIons.sulfate += deltaAlk * MW.SO4_eq * 1000;
      acidDoseMgL = deltaAlk * 49.04 * 1000;
    }

    alkEqL    = targetAlk;
    currentPh = targetPh;
    currentIons = clampIons(currentIons);
  }
  const afterAcid = createSnapshot(currentIons, currentPh);

  // ── Step 2: Degassing (CO₂ removal) ──────────────────────────────────────────
  if (config.degasOn) {
    let newCo2MgL = currentIons.co2;

    if (config.degasMode === 'CO2 % Removal') {
      newCo2MgL = currentIons.co2 * (1 - config.degasValue / 100);

    } else if (config.degasMode === 'CO2 Concentration') {
      newCo2MgL = Math.max(0, config.degasValue);

    } else if (config.degasMode === 'CO2 Partial Pressure') {
      // Henry's Law: [CO₂] = KH × pCO₂.
      // Converts pCO₂ (µatm) → equilibrium dissolved [CO₂] (mg/L) at 25°C.
      // Only applicable if degasValue produces a lower CO₂ than current.
      const equilibriumCo2 = config.degasValue * HENRY_KH_CO2_MG_L_PER_UATM;
      newCo2MgL = Math.min(currentIons.co2, Math.max(0, equilibriumCo2));
    }

    // pH rises when CO₂ is stripped — alkalinity is conserved, [CO₂] drops.
    currentPh = solvePhForAlkalinityAndCO2(alkEqL, newCo2MgL, K1, K2);
    currentIons.co2 = newCo2MgL;

    // Recalculate HCO₃⁻ and CO₃²⁻ from the new [CO₂] and solved pH.
    const H = Math.pow(10, -currentPh);
    const co2MolL  = (newCo2MgL / MW.CO2) / 1000;
    const hco3MolL = K1 * co2MolL / H;
    const co3MolL  = K2 * hco3MolL / H;

    currentIons.bicarbonate = hco3MolL * MW.HCO3 * 1000;
    currentIons.carbonate   = co3MolL  * MW.CO3  * 1000;
    ticMolL = co2MolL + hco3MolL + co3MolL;
    currentIons = clampIons(currentIons);
  }
  const afterDegas = createSnapshot(currentIons, currentPh);

  // ── Step 3: Base dosing (↑ pH) ────────────────────────────────────────────────
  let baseDoseMgL = 0;
  if (config.phUpOn && config.phUpTargetPh > currentPh) {
    const targetPh = config.phUpTargetPh;

    const { co2, hco3, co3 } = redistributeCarbonate(ticMolL, targetPh, K1, K2);
    currentIons.co2        = co2;
    currentIons.bicarbonate = hco3;
    currentIons.carbonate   = co3;

    const targetAlk = computeAlkalinity(currentIons, targetPh);
    const deltaAlk  = targetAlk - alkEqL; // positive = base added

    if (config.phUpChemical.includes('NaOH')) {
      // NaOH → Na⁺ + OH⁻; MW 40.00.
      currentIons.sodium += deltaAlk * MW.Na * 1000;
      baseDoseMgL = deltaAlk * 40.0 * 1000;
    }

    alkEqL    = targetAlk;
    currentPh = targetPh;
    currentIons = clampIons(currentIons);
  }
  const afterBase = createSnapshot(currentIons, currentPh);

  return {
    beforeAdjustment,
    afterAcid,
    afterDegas,
    afterBase,
    final: afterBase,
    antiscalantOn: config.antiScalantOn,
    acidDoseMgL,
    baseDoseMgL,
    dechlorinatorDoseMgL,
  };
}
