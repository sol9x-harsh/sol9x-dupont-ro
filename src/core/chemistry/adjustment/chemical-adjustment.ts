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
  SO4_eq: 48.03, // equivalent weight
};

// Simplified pKa values at 25C
const pK1 = 6.35;
const pK2 = 10.33;
const K1 = Math.pow(10, -pK1);
const K2 = Math.pow(10, -pK2);

function calculateIonicStrength(ions: IonComposition): number {
  // Simplified ionic strength: 0.5 * sum(C_i * z_i^2)
  // C_i in mol/L
  const I = 0.5 * (
    (ions.ammonium / 18.04) * 1 +
    (ions.sodium / 22.99) * 1 +
    (ions.potassium / 39.10) * 1 +
    (ions.magnesium / 24.30) * 4 +
    (ions.calcium / 40.08) * 4 +
    (ions.strontium / 87.62) * 4 +
    (ions.barium / 137.33) * 4 +
    (ions.carbonate / 60.01) * 4 +
    (ions.bicarbonate / 61.02) * 1 +
    (ions.nitrate / 62.00) * 1 +
    (ions.fluoride / 19.00) * 1 +
    (ions.chloride / 35.45) * 1 +
    (ions.bromide / 79.90) * 1 +
    (ions.sulfate / 96.06) * 4 +
    (ions.phosphate / 94.97) * 9
  ) / 1000;
  return I;
}

function calculateTDS(ions: IonComposition): number {
  return Object.values(ions).reduce((sum, val) => sum + val, 0);
}

function calculateScaling(ions: IonComposition, ph: number, temperatureC: number): { lsi: number, sdi: number } {
  const calciumMolL = (ions.calcium / MW.Ca) / 1000;
  const bicarbMolL = (ions.bicarbonate / MW.HCO3) / 1000;
  const I = calculateIonicStrength(ions);
  const tds = calculateTDS(ions);
  
  // LSI Approximation
  const pCa = -Math.log10(calciumMolL > 0 ? calciumMolL : 1e-10);
  const pAlk = -Math.log10(bicarbMolL > 0 ? bicarbMolL : 1e-10);
  const C = 5 * Math.sqrt(I) / (1 + Math.sqrt(I)); // roughly
  const pHs = 9.3 + pCa + pAlk - C; // Simplified
  
  const lsi = ph - pHs;
  const sdi = lsi - 0.5; // Simplified
  
  return { lsi, sdi };
}

function computeAlkalinity(ions: IonComposition, ph: number): number {
  // Alk in eq/L
  const hco3 = (ions.bicarbonate / MW.HCO3) / 1000;
  const co3 = (ions.carbonate / MW.CO3) / 1000;
  const H = Math.pow(10, -ph);
  const OH = Math.pow(10, -(14 - ph));
  return hco3 + 2 * co3 + OH - H;
}

function redistributeCarbonate(ticMolL: number, ph: number): { co2: number, hco3: number, co3: number } {
  const H = Math.pow(10, -ph);
  const denom = 1 + K1 / H + (K1 * K2) / (H * H);
  const alpha0 = 1 / denom;
  const alpha1 = (K1 / H) / denom;
  const alpha2 = ((K1 * K2) / (H * H)) / denom;
  
  return {
    co2: ticMolL * alpha0 * MW.CO2 * 1000,
    hco3: ticMolL * alpha1 * MW.HCO3 * 1000,
    co3: ticMolL * alpha2 * MW.CO3 * 1000,
  };
}

function solvePhForAlkalinityAndTIC(alkEqL: number, ticMolL: number): number {
  // Simplified binary search for pH
  let low = 2.0;
  let high = 12.0;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const H = Math.pow(10, -mid);
    const denom = 1 + K1 / H + (K1 * K2) / (H * H);
    const alpha1 = (K1 / H) / denom;
    const alpha2 = ((K1 * K2) / (H * H)) / denom;
    const calcAlk = ticMolL * (alpha1 + 2 * alpha2) + Math.pow(10, -(14 - mid)) - H;
    if (calcAlk > alkEqL) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return (low + high) / 2;
}

function solvePhForAlkalinityAndCO2(alkEqL: number, co2MgL: number): number {
  const co2MolL = (co2MgL / MW.CO2) / 1000;
  let low = 2.0;
  let high = 12.0;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const H = Math.pow(10, -mid);
    const hco3 = K1 * co2MolL / H;
    const co3 = K2 * hco3 / H;
    const calcAlk = hco3 + 2 * co3 + Math.pow(10, -(14 - mid)) - H;
    if (calcAlk > alkEqL) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return (low + high) / 2;
}

export function simulateChemicalAdjustment(
  initialIons: IonComposition,
  initialPh: number,
  temperatureC: number,
  config: ChemicalAdjustment
): ChemistryAdjustmentResult {
  
  const createSnapshot = (ions: IonComposition, ph: number): AdjustedChemistry => {
    const { lsi, sdi } = calculateScaling(ions, ph, temperatureC);
    return {
      ions: { ...ions },
      ph,
      tds: calculateTDS(ions),
      lsi,
      sdi,
      ionicStrength: calculateIonicStrength(ions),
      temperature: temperatureC,
    };
  };

  const beforeAdjustment = createSnapshot(initialIons, initialPh);
  
  // 1. Acid Dosing (↓ pH)
  let currentIons = { ...initialIons };
  let currentPh = initialPh;

  let dechlorinatorDoseMgL = 0;
  if (config.dechlorinatorOn && config.dechlorinatorDose > 0) {
    dechlorinatorDoseMgL = config.dechlorinatorDose;
    currentIons.sodium += (dechlorinatorDoseMgL * (22.99 / 104.06));
    currentIons.sulfate += (dechlorinatorDoseMgL * (96.06 / 104.06));
  }

  let ticMolL = ((currentIons.co2 / MW.CO2) + (currentIons.bicarbonate / MW.HCO3) + (currentIons.carbonate / MW.CO3)) / 1000;
  let alkEqL = computeAlkalinity(currentIons, currentPh);
  
  let acidDoseMgL = 0;
  if (config.phDownOn && config.phDownTargetPh < currentPh) {
    const targetPh = config.phDownTargetPh;
    const newAlk = computeAlkalinity(currentIons, targetPh); // if we just changed pH keeping TIC same, what's new alk?
    // wait, if we keep TIC same, the distribution changes:
    const { co2, hco3, co3 } = redistributeCarbonate(ticMolL, targetPh);
    currentIons.co2 = co2;
    currentIons.bicarbonate = hco3;
    currentIons.carbonate = co3;
    
    const targetAlk = computeAlkalinity(currentIons, targetPh);
    const deltaAlk = alkEqL - targetAlk; // amount of acid added in eq/L
    
    if (config.phDownChemical.includes('HCl')) {
      currentIons.chloride += deltaAlk * MW.Cl * 1000;
      acidDoseMgL = deltaAlk * 36.46 * 1000; // HCl molecular weight
    } else if (config.phDownChemical.includes('H2SO4')) {
      currentIons.sulfate += deltaAlk * MW.SO4_eq * 1000;
      acidDoseMgL = deltaAlk * 49.04 * 1000; // H2SO4 equivalent weight
    }
    
    alkEqL = targetAlk;
    currentPh = targetPh;
  }
  const afterAcid = createSnapshot(currentIons, currentPh);
  
  // 2. Degas
  if (config.degasOn) {
    let newCo2 = currentIons.co2;
    if (config.degasMode === 'CO2 % Removal') {
      newCo2 = currentIons.co2 * (1 - (config.degasValue / 100));
    } else if (config.degasMode === 'CO2 Concentration') {
      newCo2 = config.degasValue;
    }
    
    // pH adjusts because CO2 is removed, but alkalinity is conserved.
    currentPh = solvePhForAlkalinityAndCO2(alkEqL, newCo2);
    currentIons.co2 = newCo2;
    // update TIC
    const co2MolL = (newCo2 / MW.CO2) / 1000;
    const H = Math.pow(10, -currentPh);
    const hco3MolL = K1 * co2MolL / H;
    const co3MolL = K2 * hco3MolL / H;
    
    currentIons.bicarbonate = hco3MolL * MW.HCO3 * 1000;
    currentIons.carbonate = co3MolL * MW.CO3 * 1000;
    ticMolL = co2MolL + hco3MolL + co3MolL;
  }
  const afterDegas = createSnapshot(currentIons, currentPh);

  // 3. Base Dosing (↑ pH)
  let baseDoseMgL = 0;
  if (config.phUpOn && config.phUpTargetPh > currentPh) {
    const targetPh = config.phUpTargetPh;
    const { co2, hco3, co3 } = redistributeCarbonate(ticMolL, targetPh);
    currentIons.co2 = co2;
    currentIons.bicarbonate = hco3;
    currentIons.carbonate = co3;
    
    const targetAlk = computeAlkalinity(currentIons, targetPh);
    const deltaAlk = targetAlk - alkEqL; // amount of base added in eq/L
    
    if (config.phUpChemical.includes('NaOH')) {
      currentIons.sodium += deltaAlk * MW.Na * 1000;
      baseDoseMgL = deltaAlk * 40.0 * 1000; // NaOH molecular weight
    }
    
    alkEqL = targetAlk;
    currentPh = targetPh;
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
