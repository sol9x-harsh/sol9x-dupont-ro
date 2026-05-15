export type IonCategory = "cation" | "anion" | "neutral";

export interface IonMeta {
  id: string;
  displayName: string;
  symbol: string;
  molecularWeight: number; // g/mol
  valence: number; // signed: positive for cations, negative for anions
  category: IonCategory;
}

export const IONS: Record<string, IonMeta> = {
  // ── Cations ─────────────────────────────────────────────────────────────────
  Na: {
    id: "Na",
    displayName: "Sodium",
    symbol: "Na⁺",
    molecularWeight: 22.99,
    valence: 1,
    category: "cation",
  },
  Ca: {
    id: "Ca",
    displayName: "Calcium",
    symbol: "Ca²⁺",
    molecularWeight: 40.08,
    valence: 2,
    category: "cation",
  },
  Mg: {
    id: "Mg",
    displayName: "Magnesium",
    symbol: "Mg²⁺",
    molecularWeight: 24.31,
    valence: 2,
    category: "cation",
  },
  K: {
    id: "K",
    displayName: "Potassium",
    symbol: "K⁺",
    molecularWeight: 39.10,
    valence: 1,
    category: "cation",
  },
  Ba: {
    id: "Ba",
    displayName: "Barium",
    symbol: "Ba²⁺",
    molecularWeight: 137.327,
    valence: 2,
    category: "cation",
  },
  Sr: {
    id: "Sr",
    displayName: "Strontium",
    symbol: "Sr²⁺",
    molecularWeight: 87.62,
    valence: 2,
    category: "cation",
  },
  NH4: {
    id: "NH4",
    displayName: "Ammonium",
    symbol: "NH₄⁺",
    molecularWeight: 18.038,
    valence: 1,
    category: "cation",
  },

  // ── Anions ───────────────────────────────────────────────────────────────────
  Cl: {
    id: "Cl",
    displayName: "Chloride",
    symbol: "Cl⁻",
    molecularWeight: 35.45,
    valence: -1,
    category: "anion",
  },
  SO4: {
    id: "SO4",
    displayName: "Sulfate",
    symbol: "SO₄²⁻",
    molecularWeight: 96.06,
    valence: -2,
    category: "anion",
  },
  HCO3: {
    id: "HCO3",
    displayName: "Bicarbonate",
    symbol: "HCO₃⁻",
    molecularWeight: 61.02,
    valence: -1,
    category: "anion",
  },
  CO3: {
    id: "CO3",
    displayName: "Carbonate",
    symbol: "CO₃²⁻",
    molecularWeight: 60.01,
    valence: -2,
    category: "anion",
  },
  NO3: {
    id: "NO3",
    displayName: "Nitrate",
    symbol: "NO₃⁻",
    molecularWeight: 62.00,
    valence: -1,
    category: "anion",
  },
  F: {
    id: "F",
    displayName: "Fluoride",
    symbol: "F⁻",
    molecularWeight: 19.00,
    valence: -1,
    category: "anion",
  },
  Br: {
    id: "Br",
    displayName: "Bromide",
    symbol: "Br⁻",
    molecularWeight: 79.904,
    valence: -1,
    category: "anion",
  },
  PO4: {
    id: "PO4",
    displayName: "Phosphate",
    symbol: "PO₄³⁻",
    molecularWeight: 94.971,
    valence: -3,
    category: "anion",
  },

  // ── Neutrals ─────────────────────────────────────────────────────────────────
  SiO2: {
    id: "SiO2",
    displayName: "Silica",
    symbol: "SiO₂",
    molecularWeight: 60.08,
    valence: 0,
    category: "neutral",
  },
  B: {
    id: "B",
    displayName: "Boron",
    symbol: "B",
    molecularWeight: 10.811,
    valence: 0,
    category: "neutral",
  },
  CO2: {
    id: "CO2",
    displayName: "Carbon Dioxide",
    symbol: "CO₂",
    molecularWeight: 44.010,
    valence: 0,
    category: "neutral",
  },
} as const;

export const ION_IDS = Object.keys(IONS) as (keyof typeof IONS)[];
