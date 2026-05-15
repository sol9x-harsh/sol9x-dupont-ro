import { create } from 'zustand';
import type { WaterType } from '@/core/chemistry/conductivity/conductivity-strategy';

export type { WaterType };

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
  designTemperature: number; // primary simulation temperature (renamed from temperature)
  minTemperature: number;
  maxTemperature: number;
}

export type FeedPreset =
  | 'groundwater'
  | 'seawater'
  | 'brackish'
  | 'municipal'
  | 'custom';

export interface FeedStream {
  id: string;
  preset: FeedPreset;
  waterType: WaterType;
  chemistry: FeedChemistry;
  streamLabel: string;
  blendPercentage: number;
}

interface FeedState {
  // --- Active Stream Proxies (Backward Compatibility) ---
  preset: FeedPreset;
  waterType: WaterType;
  chemistry: FeedChemistry;
  streamLabel: string;

  // --- Multi-Stream State ---
  streams: Record<string, FeedStream>;
  activeStreamId: string;
  activeTemperatureView: 'min' | 'design' | 'max';

  // --- Actions ---
  setPreset: (preset: FeedPreset) => void;
  setWaterType: (waterType: WaterType) => void;
  updateIon: <K extends keyof IonComposition>(ion: K, value: number) => void;
  updateChemistryField: <K extends keyof Omit<FeedChemistry, 'ions'>>(
    field: K,
    value: number,
  ) => void;
  setStreamLabel: (label: string) => void;
  setActiveTemperatureView: (mode: 'min' | 'design' | 'max') => void;

  // --- Stream Management ---
  addStream: () => void;
  removeStream: (id: string) => void;
  setActiveStream: (id: string) => void;
  setStreamBlendPercentage: (id: string, percentage: number) => void;

  hydrateFeed: (
    data: Partial<{
      preset: FeedPreset;
      waterType: WaterType;
      chemistry: FeedChemistry;
      streamLabel: string;
      streams: Record<string, FeedStream>;
      activeStreamId: string;
    }>,
  ) => void;
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
  designTemperature: 25,
  minTemperature: 21,
  maxTemperature: 30,
};

export const useFeedStore = create<FeedState>((set) => ({
  preset: 'custom',
  waterType: 'Custom',
  chemistry: defaultChemistry,
  streamLabel: 'Stream 1',
  activeTemperatureView: 'design',

  streams: {
    'stream-1': {
      id: 'stream-1',
      streamLabel: 'Stream 1',
      preset: 'custom',
      waterType: 'Custom',
      chemistry: defaultChemistry,
      blendPercentage: 100,
    },
  },
  activeStreamId: 'stream-1',

  setPreset: (preset) =>
    set((state) => {
      const stream = state.streams[state.activeStreamId];
      return {
        preset,
        streams: {
          ...state.streams,
          [state.activeStreamId]: { ...stream, preset },
        },
      };
    }),

  setWaterType: (waterType) =>
    set((state) => {
      const stream = state.streams[state.activeStreamId];
      return {
        waterType,
        streams: {
          ...state.streams,
          [state.activeStreamId]: { ...stream, waterType },
        },
      };
    }),

  updateIon: (ion, value) =>
    set((state) => {
      const stream = state.streams[state.activeStreamId];
      const newChemistry = {
        ...stream.chemistry,
        ions: { ...stream.chemistry.ions, [ion]: value },
      };
      return {
        chemistry: newChemistry,
        streams: {
          ...state.streams,
          [state.activeStreamId]: { ...stream, chemistry: newChemistry },
        },
      };
    }),

  updateChemistryField: (field, value) =>
    set((state) => {
      const stream = state.streams[state.activeStreamId];
      const newChemistry = { ...stream.chemistry, [field]: value };
      return {
        chemistry: newChemistry,
        streams: {
          ...state.streams,
          [state.activeStreamId]: { ...stream, chemistry: newChemistry },
        },
      };
    }),

  setStreamLabel: (label) =>
    set((state) => {
      const stream = state.streams[state.activeStreamId];
      return {
        streamLabel: label,
        streams: {
          ...state.streams,
          [state.activeStreamId]: { ...stream, streamLabel: label },
        },
      };
    }),

  setActiveTemperatureView: (mode) => set({ activeTemperatureView: mode }),

  addStream: () =>
    set((state) => {
      const nextNum = Object.keys(state.streams).length + 1;
      const newId = `stream-${nextNum}`;
      const newLabel = `Stream ${nextNum}`;

      // Rebalance: old streams take a proportional hit, new stream starts at 0 or equal?
      // Wave Pro starts new streams at 0%. Let's default to 0% and let user adjust.
      const newStream: FeedStream = {
        id: newId,
        streamLabel: newLabel,
        preset: 'custom',
        waterType: 'Custom',
        chemistry: defaultChemistry,
        blendPercentage: 0,
      };

      return {
        streams: { ...state.streams, [newId]: newStream },
        activeStreamId: newId,
        preset: newStream.preset,
        waterType: newStream.waterType,
        chemistry: newStream.chemistry,
        streamLabel: newStream.streamLabel,
      };
    }),

  removeStream: (id) =>
    set((state) => {
      const keys = Object.keys(state.streams);
      if (keys.length <= 1) return state; // cannot remove last stream

      const newStreams = { ...state.streams };
      const removedPercentage = newStreams[id].blendPercentage;
      delete newStreams[id];

      // Rebalance remaining streams
      const remainingKeys = Object.keys(newStreams);
      if (remainingKeys.length > 0 && removedPercentage > 0) {
        const currentSum = remainingKeys.reduce(
          (sum, key) => sum + newStreams[key].blendPercentage,
          0,
        );
        if (currentSum === 0) {
          newStreams[remainingKeys[0]].blendPercentage = 100;
        } else {
          remainingKeys.forEach((key) => {
            newStreams[key].blendPercentage +=
              (newStreams[key].blendPercentage / currentSum) *
              removedPercentage;
          });
        }
      }

      let newActiveId = state.activeStreamId;
      if (newActiveId === id) {
        newActiveId = remainingKeys[0];
      }

      // Re-sequence the streams
      const resequencedStreams: Record<string, FeedStream> = {};
      let nextActiveId = newActiveId;

      remainingKeys.forEach((oldKey, index) => {
        const newNum = index + 1;
        const newKey = `stream-${newNum}`;
        const newLabel = `Stream ${newNum}`;

        resequencedStreams[newKey] = {
          ...newStreams[oldKey],
          id: newKey,
          streamLabel: newStreams[oldKey].streamLabel.startsWith('Stream ')
            ? newLabel
            : newStreams[oldKey].streamLabel,
        };

        if (oldKey === newActiveId) {
          nextActiveId = newKey;
        }
      });

      const activeStream = resequencedStreams[nextActiveId];

      return {
        streams: resequencedStreams,
        activeStreamId: nextActiveId,
        preset: activeStream.preset,
        waterType: activeStream.waterType,
        chemistry: activeStream.chemistry,
        streamLabel: activeStream.streamLabel,
      };
    }),

  setActiveStream: (id) =>
    set((state) => {
      const stream = state.streams[id];
      if (!stream) return state;

      return {
        activeStreamId: id,
        preset: stream.preset,
        waterType: stream.waterType,
        chemistry: stream.chemistry,
        streamLabel: stream.streamLabel,
      };
    }),

  setStreamBlendPercentage: (id, percentage) =>
    set((state) => {
      const newStreams = { ...state.streams };
      const streamToUpdate = newStreams[id];
      if (!streamToUpdate) return state;

      let validPercentage = Math.max(0, Math.min(100, percentage));
      const previousPercentage = streamToUpdate.blendPercentage;
      const diff = validPercentage - previousPercentage;

      const otherKeys = Object.keys(newStreams).filter((k) => k !== id);

      if (otherKeys.length === 0) {
        validPercentage = 100;
        newStreams[id] = { ...streamToUpdate, blendPercentage: 100 };
      } else {
        newStreams[id] = {
          ...streamToUpdate,
          blendPercentage: validPercentage,
        };
        const otherSum = otherKeys.reduce(
          (sum, key) => sum + newStreams[key].blendPercentage,
          0,
        );

        if (otherSum === 0) {
          // If others are all 0, distribute remainder equally
          const remainder = 100 - validPercentage;
          const split = remainder / otherKeys.length;
          otherKeys.forEach((key) => {
            newStreams[key] = { ...newStreams[key], blendPercentage: split };
          });
        } else {
          // Distribute proportionally
          const targetOtherSum = 100 - validPercentage;
          otherKeys.forEach((key) => {
            const proportion = newStreams[key].blendPercentage / otherSum;
            newStreams[key] = {
              ...newStreams[key],
              blendPercentage: targetOtherSum * proportion,
            };
          });
        }
      }

      return { streams: newStreams };
    }),

  hydrateFeed: (data) =>
    set((state) => {
      const chem = data.chemistry as
        | (FeedChemistry & { temperature?: number })
        | undefined;
      const designTemperature =
        chem?.designTemperature ??
        (chem as { temperature?: number } | undefined)?.temperature ??
        state.chemistry.designTemperature;

      const mergedChemistry = chem
        ? { ...state.chemistry, ...chem, designTemperature }
        : state.chemistry;

      const streams = data.streams ?? {
        'stream-1': {
          id: 'stream-1',
          streamLabel: data.streamLabel ?? 'Stream 1',
          preset: data.preset ?? state.preset,
          waterType: data.waterType ?? state.waterType ?? 'Custom',
          chemistry: mergedChemistry,
          blendPercentage: 100,
        },
      };
      const activeStreamId = data.activeStreamId ?? 'stream-1';
      const activeStream = streams[activeStreamId] || Object.values(streams)[0];

      return {
        streams,
        activeStreamId: activeStream.id,
        preset: activeStream.preset,
        waterType: activeStream.waterType,
        chemistry: activeStream.chemistry,
        streamLabel: activeStream.streamLabel,
      };
    }),

  resetFeed: () =>
    set({
      preset: 'custom',
      waterType: 'Custom',
      chemistry: defaultChemistry,
      streamLabel: 'Stream 1',
      streams: {
        'stream-1': {
          id: 'stream-1',
          streamLabel: 'Stream 1',
          preset: 'custom',
          waterType: 'Custom',
          chemistry: defaultChemistry,
          blendPercentage: 100,
        },
      },
      activeStreamId: 'stream-1',
    }),
}));

/** Returns true only when the temperature hierarchy is valid: min < design < max. */
export function isTempHierarchyValid(): boolean {
  const { minTemperature, designTemperature, maxTemperature } =
    useFeedStore.getState().chemistry;
  return (
    minTemperature < designTemperature && designTemperature < maxTemperature
  );
}

export function getBlendedChemistry(state?: FeedState): FeedChemistry {
  const feedState = state ?? useFeedStore.getState();
  const streams = Object.values(feedState.streams);

  if (streams.length === 0) return feedState.chemistry;
  if (streams.length === 1) return streams[0].chemistry;

  const blendedIons: IonComposition = {
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

  let tds = 0;
  let conductivity = 0;
  let sdi = 0;
  let turbidity = 0;
  let ph = 0;
  let designTemperature = 0;
  let minTemperature = 0;
  let maxTemperature = 0;

  for (const stream of streams) {
    const fraction = (stream.blendPercentage || 0) / 100;
    for (const key of Object.keys(blendedIons) as (keyof IonComposition)[]) {
      blendedIons[key] += (stream.chemistry.ions[key] || 0) * fraction;
    }
    tds += (stream.chemistry.tds || 0) * fraction;
    conductivity += (stream.chemistry.conductivity || 0) * fraction;
    sdi += (stream.chemistry.sdi || 0) * fraction;
    turbidity += (stream.chemistry.turbidity || 0) * fraction;
    ph += (stream.chemistry.ph || 0) * fraction;
    designTemperature += (stream.chemistry.designTemperature || 0) * fraction;
    minTemperature += (stream.chemistry.minTemperature || 0) * fraction;
    maxTemperature += (stream.chemistry.maxTemperature || 0) * fraction;
  }

  return {
    ions: blendedIons,
    tds,
    conductivity,
    sdi,
    turbidity,
    ph,
    designTemperature,
    minTemperature,
    maxTemperature,
  };
}
