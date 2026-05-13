import { create } from 'zustand';

interface ProjectState {
  // Global Project Data
  units: 'SI' | 'US';
  setUnits: (units: 'SI' | 'US') => void;

  // Flow & Performance
  feedFlow: number;
  permeateFlow: number;
  rejectFlow: number;
  recovery: number;
  pumpPressure: number;
  feedTDS: number;
  permeateTDS: number;
  rejectTDS: number;

  setFlowData: (data: Partial<ProjectState>) => void;

  // Pass Data
  passes: string[];
  activePass: string;
  passData: Record<string, { id: string; vessels: number; elements: number; }[]>;
  
  addPass: () => void;
  removePass: (id: string) => void;
  setActivePass: (id: string) => void;
  addStage: () => void;
  removeStage: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  units: 'SI',
  setUnits: (units) => set({ units }),

  feedFlow: 250.0,
  permeateFlow: 105.0,
  rejectFlow: 145.0,
  recovery: 42.0,
  pumpPressure: 55.4,
  feedTDS: 35000,
  permeateTDS: 280,
  rejectTDS: 60300,

  setFlowData: (data) => set((state) => ({ ...state, ...data })),

  passes: ['p1'],
  activePass: 'p1',
  passData: {
    p1: [
      { id: 's1', vessels: 42, elements: 7 },
      { id: 's2', vessels: 21, elements: 7 },
    ],
  },

  addPass: () => set((state) => {
    const id = `p${state.passes.length + 1}`;
    return {
      passes: [...state.passes, id],
      passData: { ...state.passData, [id]: [{ id: 's1', vessels: 10, elements: 7 }] },
      activePass: id,
    };
  }),

  removePass: (id) => set((state) => {
    if (state.passes.length === 1) return state;
    const next = state.passes.filter((p) => p !== id);
    return {
      passes: next,
      activePass: state.activePass === id ? next[0] : state.activePass,
    };
  }),

  setActivePass: (id) => set({ activePass: id }),

  addStage: () => set((state) => {
    const activeStages = state.passData[state.activePass] || [];
    if (activeStages.length >= 6) return state;
    
    const id = `s${activeStages.length + 1}`;
    const newStages = [
      ...activeStages,
      {
        id,
        vessels: Math.max(1, Math.floor(activeStages[activeStages.length - 1].vessels / 2)),
        elements: 7,
      },
    ];
    return {
      passData: { ...state.passData, [state.activePass]: newStages },
    };
  }),

  removeStage: () => set((state) => {
    const activeStages = state.passData[state.activePass] || [];
    if (activeStages.length <= 1) return state;
    return {
      passData: { ...state.passData, [state.activePass]: activeStages.slice(0, -1) },
    };
  }),
}));
