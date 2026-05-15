import { create } from "zustand";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { SimulationWarning } from "@/core/simulation/outputs/quality-output";

export type SimulationStatus = "idle" | "running" | "completed" | "failed" | "invalid";

export interface NormalizedWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

interface SimulationState {
  // Execution state
  isCalculating: boolean;
  status: SimulationStatus;
  lastRun: string | null;

  // Results
  output: SimulationOutput | null;
  warnings: NormalizedWarning[];
  validationErrors: NormalizedWarning[];
  errors: string[];

  // Actions
  setOutput: (output: SimulationOutput, warnings: NormalizedWarning[]) => void;
  setCalculating: (calculating: boolean) => void;
  setStatus: (status: SimulationStatus) => void;
  setValidationErrors: (errors: NormalizedWarning[]) => void;
  setFailed: (error: string) => void;
  clearSimulation: () => void;

  // Legacy compat (kept for existing UI consumers)
  isRunning: boolean;
  progress: number;
  setIsRunning: (running: boolean) => void;
  setProgress: (progress: number) => void;
  addWarning: (warning: NormalizedWarning) => void;
  addError: (error: string) => void;
  clearResults: () => void;
}

const defaultState = {
  isCalculating: false,
  isRunning: false,
  status: "idle" as SimulationStatus,
  lastRun: null,
  progress: 0,
  output: null,
  warnings: [],
  validationErrors: [],
  errors: [],
};

export const useSimulationStore = create<SimulationState>((set) => ({
  ...defaultState,

  setOutput: (output, warnings) =>
    set({
      output,
      warnings,
      validationErrors: [],
      errors: [],
      status: output.summary.status === "invalid" ? "invalid" : "completed",
      isCalculating: false,
      isRunning: false,
      lastRun: new Date().toISOString(),
    }),

  setCalculating: (isCalculating) =>
    set({ isCalculating, isRunning: isCalculating, status: isCalculating ? "running" : "idle" }),

  setStatus: (status) => set({ status }),

  setValidationErrors: (validationErrors) =>
    set({ validationErrors, status: "invalid", isCalculating: false, isRunning: false }),

  setFailed: (error) =>
    set((state) => ({
      errors: [...state.errors, error],
      status: "failed",
      isCalculating: false,
      isRunning: false,
    })),

  clearSimulation: () => set(defaultState),

  // Legacy compat
  setIsRunning: (isRunning) => set({ isRunning, isCalculating: isRunning }),
  setProgress: (progress) => set({ progress }),
  addWarning: (warning) => set((state) => ({ warnings: [...state.warnings, warning] })),
  addError: (error) => set((state) => ({ errors: [...state.errors, error] })),
  clearResults: () => set(defaultState),
}));

// Re-export engine warning type for consumers
export type { SimulationWarning, SimulationOutput };
