import { create } from 'zustand';

export interface IonComposition {
  // ── Cations ────────────────────────────────────────────────────────────────
  ammonium: number;
  sodium: number;
  potassium: number;
  magnesium: number;
  calcium: number;
  strontium: number;
  barium: number;
  // ── Anions ─────────────────────────────────────────────────────────────────
  carbonate: number;
  bicarbonate: number;
  nitrate: number;
  fluoride: number;
  chloride: number;
  bromide: number;
  sulfate: number;
  phosphate: number;
  // ── Neutrals ───────────────────────────────────────────────────────────────
  silica: number;
  boron: number;
  co2: number;
}

export interface FeedChemistry {
  ions: IonComposition;
  tds: number;
  conductivity: number;
  sdi: number;
  turbidity: number;
  ph: number;
  temperature: number;
}

export type FeedPreset =
  | 'groundwater'
  | 'seawater'
  | 'brackish'
  | 'municipal'
  | 'custom';

interface FeedState {
  preset: FeedPreset;
  chemistry: FeedChemistry;
  streamLabel: string;
  setPreset: (preset: FeedPreset) => void;
  updateIon: <K extends keyof IonComposition>(ion: K, value: number) => void;
  updateChemistryField: <K extends keyof Omit<FeedChemistry, 'ions'>>(
    field: K,
    value: number,
  ) => void;
  setStreamLabel: (label: string) => void;
  hydrateFeed: (data: Partial<{ preset: FeedPreset; chemistry: FeedChemistry; streamLabel: string }>) => void;
  resetFeed: () => void;
}

const defaultChemistry: FeedChemistry = {
  ions: {
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
  },
  tds: 0,
  conductivity: 0,
  sdi: 0,
  turbidity: 0,
  ph: 7.0,
  temperature: 25,
};

export const useFeedStore = create<FeedState>((set) => ({
  preset: 'custom',
  chemistry: defaultChemistry,
  streamLabel: 'Feed-01',

  setPreset: (preset) => set({ preset }),

  updateIon: (ion, value) =>
    set((state) => ({
      chemistry: {
        ...state.chemistry,
        ions: { ...state.chemistry.ions, [ion]: value },
      },
    })),

  updateChemistryField: (field, value) =>
    set((state) => ({
      chemistry: { ...state.chemistry, [field]: value },
    })),

  setStreamLabel: (label) => set({ streamLabel: label }),

  hydrateFeed: (data) => set((state) => ({
    preset: data.preset ?? state.preset,
    chemistry: data.chemistry ?? state.chemistry,
    streamLabel: data.streamLabel ?? state.streamLabel,
  })),

  resetFeed: () =>
    set({
      preset: 'custom',
      chemistry: defaultChemistry,
      streamLabel: 'Feed-01',
    }),
}));
