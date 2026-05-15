import { create } from "zustand";

export interface Vessel {
  id: string;
  label: string;
  elementsPerVessel: number;
  membraneModel: string;
}

export interface Stage {
  id: string;
  label: string;
  vessels: Vessel[];
  pressureDropBar?: number;
}

export interface Pass {
  id: string;
  label: string;
  stages: Stage[];
  recovery: number;
}

export interface ChemicalAdjustment {
  phDownOn: boolean;
  phDownChemical: string;
  phDownTargetPh: number;
  degasOn: boolean;
  degasMode: string;
  degasValue: number;
  phUpOn: boolean;
  phUpChemical: string;
  phUpTargetPh: number;
  antiScalantOn: boolean;
  antiScalantChemical: string;
  antiScalantDose: number;
  dechlorinatorOn: boolean;
  dechlorinatorChemical: string;
  dechlorinatorDose: number;
}

interface ROConfigState {
  passes: Pass[];
  feedFlow: number;
  systemRecovery: number;
  feedPressureBar: number;
  permeatePressureBar: number;
  permeateFlow: number;
  concentrateFlow: number;
  chemicalAdjustment: ChemicalAdjustment;
  setPasses: (passes: Pass[]) => void;
  setFeedFlow: (flow: number) => void;
  setSystemRecovery: (recovery: number) => void;
  setFeedPressureBar: (pressure: number) => void;
  setPermeatePressureBar: (pressure: number) => void;
  setPermeateFlow: (flow: number) => void;
  updateChemicalAdjustment: (
    patch: Partial<ChemicalAdjustment>
  ) => void;
  hydrateROConfig: (data: Partial<Omit<ROConfigState, 'setPasses' | 'setFeedFlow' | 'setSystemRecovery' | 'setFeedPressureBar' | 'setPermeatePressureBar' | 'updateChemicalAdjustment' | 'resetROConfig' | 'hydrateROConfig' | 'setPermeateFlow'>>) => void;
  resetROConfig: () => void;
}

const defaultChemicalAdjustment: ChemicalAdjustment = {
  phDownOn: false,
  phDownChemical: 'HCl(32)',
  phDownTargetPh: 6.5,
  degasOn: false,
  degasMode: 'CO2 Concentration',
  degasValue: 10,
  phUpOn: false,
  phUpChemical: 'NaOH(50)',
  phUpTargetPh: 8.0,
  antiScalantOn: false,
  antiScalantChemical: 'Na6P6O18(100)',
  antiScalantDose: 2.0,
  dechlorinatorOn: false,
  dechlorinatorChemical: 'NaHSO3',
  dechlorinatorDose: 1.0,
};

const defaultState = {
  passes: [] as Pass[],
  feedFlow: 0,
  systemRecovery: 75,
  feedPressureBar: 10.0,
  permeatePressureBar: 0.0,
  permeateFlow: 0,
  concentrateFlow: 0,
  chemicalAdjustment: defaultChemicalAdjustment,
};

export const useROConfigStore = create<ROConfigState>((set) => ({
  ...defaultState,

  setPasses: (passes) => set({ passes }),

  setFeedFlow: (feedFlow) => set((state) => {
    const permeateFlow = feedFlow * (state.systemRecovery / 100);
    return { 
      feedFlow, 
      permeateFlow,
      concentrateFlow: feedFlow - permeateFlow
    };
  }),

  setSystemRecovery: (systemRecovery) => set((state) => {
    const permeateFlow = state.feedFlow * (systemRecovery / 100);
    return { 
      systemRecovery, 
      permeateFlow,
      concentrateFlow: state.feedFlow - permeateFlow
    };
  }),

  setPermeateFlow: (permeateFlow) => set((state) => {
    const systemRecovery = state.feedFlow > 0 ? (permeateFlow / state.feedFlow) * 100 : state.systemRecovery;
    return {
      permeateFlow,
      systemRecovery: parseFloat(systemRecovery.toFixed(2)),
      concentrateFlow: state.feedFlow - permeateFlow
    };
  }),

  setFeedPressureBar: (feedPressureBar) => set({ feedPressureBar }),

  setPermeatePressureBar: (permeatePressureBar) => set({ permeatePressureBar }),

  updateChemicalAdjustment: (patch) =>
    set((state) => ({
      chemicalAdjustment: { ...state.chemicalAdjustment, ...patch },
    })),

  hydrateROConfig: (data) => set((state) => ({
    ...state,
    ...data,
  })),

  resetROConfig: () => set(defaultState),
}));
