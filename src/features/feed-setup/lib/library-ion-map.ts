import type { FeedChemistry, IonComposition } from '@/store/feed-store';

// Maps LIBRARY display symbol keys → feed store IonComposition keys
const SYMBOL_TO_KEY: Record<string, keyof IonComposition> = {
  'NH₄': 'ammonium',
  Na: 'sodium',
  K: 'potassium',
  Mg: 'magnesium',
  Ca: 'calcium',
  Sr: 'strontium',
  Ba: 'barium',
  'CO₃': 'carbonate',
  'HCO₃': 'bicarbonate',
  'NO₃': 'nitrate',
  F: 'fluoride',
  Cl: 'chloride',
  Br: 'bromide',
  'SO₄': 'sulfate',
  'PO₄': 'phosphate',
  'SiO₂': 'silica',
  B: 'boron',
  'CO₂': 'co2',
};

export interface LibraryEntry {
  id: string;
  name: string;
  type: string;
  tds: number;
  ph: number;
  sdi: number;
  temp: number;
  minTemp?: number;
  maxTemp?: number;
  cations: Record<string, number>;
  anions: Record<string, number>;
  neutrals: Record<string, number>;
  isGlobal?: boolean;
}

const ZERO_IONS: IonComposition = {
  ammonium: 0,
  sodium: 0,
  potassium: 0,
  magnesium: 0,
  calcium: 0,
  strontium: 0,
  barium: 0,
  carbonate: 0,
  bicarbonate: 0,
  nitrate: 0,
  fluoride: 0,
  chloride: 0,
  bromide: 0,
  sulfate: 0,
  phosphate: 0,
  silica: 0,
  boron: 0,
  co2: 0,
};

function mapGroup(group: Record<string, number>): Partial<IonComposition> {
  const out: Partial<IonComposition> = {};
  for (const [sym, val] of Object.entries(group)) {
    const key = SYMBOL_TO_KEY[sym];
    if (key) out[key] = val;
  }
  return out;
}

export function mapLibraryToFeedChemistry(entry: LibraryEntry): FeedChemistry {
  const ions: IonComposition = {
    ...ZERO_IONS,
    ...mapGroup(entry.cations),
    ...mapGroup(entry.anions),
    ...mapGroup(entry.neutrals),
  };

  return {
    ions,
    tds: entry.tds,
    ph: entry.ph,
    sdi: entry.sdi,
    designTemperature: entry.temp,
    minTemperature: entry.minTemp ?? 21,
    maxTemperature: entry.maxTemp ?? 30,
    // Derived fields — chemistry engine recalculates these reactively
    conductivity: 0,
    turbidity: 0,
  };
}

// Reverse: convert a feed store IonComposition back to the LIBRARY symbol groups
// Used when displaying live store data in the Save mode ionic summary tables.
const KEY_TO_SYMBOL: Record<keyof IonComposition, string> = {
  ammonium: 'NH₄',
  sodium: 'Na',
  potassium: 'K',
  magnesium: 'Mg',
  calcium: 'Ca',
  strontium: 'Sr',
  barium: 'Ba',
  carbonate: 'CO₃',
  bicarbonate: 'HCO₃',
  nitrate: 'NO₃',
  fluoride: 'F',
  chloride: 'Cl',
  bromide: 'Br',
  sulfate: 'SO₄',
  phosphate: 'PO₄',
  silica: 'SiO₂',
  boron: 'B',
  co2: 'CO₂',
};

const CATION_KEYS: (keyof IonComposition)[] = [
  'ammonium',
  'sodium',
  'potassium',
  'magnesium',
  'calcium',
  'strontium',
  'barium',
];
const ANION_KEYS: (keyof IonComposition)[] = [
  'carbonate',
  'bicarbonate',
  'nitrate',
  'fluoride',
  'chloride',
  'bromide',
  'sulfate',
  'phosphate',
];
const NEUTRAL_KEYS: (keyof IonComposition)[] = ['silica', 'boron', 'co2'];

export function ionsToCationGroups(ions: IonComposition) {
  return Object.fromEntries(
    CATION_KEYS.map((k) => [KEY_TO_SYMBOL[k], ions[k]]),
  );
}
export function ionsToAnionGroups(ions: IonComposition) {
  return Object.fromEntries(ANION_KEYS.map((k) => [KEY_TO_SYMBOL[k], ions[k]]));
}
export function ionsToNeutralGroups(ions: IonComposition) {
  return Object.fromEntries(
    NEUTRAL_KEYS.map((k) => [KEY_TO_SYMBOL[k], ions[k]]),
  );
}
