/**
 * Inferred state type from the simulation store, used by selectors
 * to avoid importing the store implementation directly.
 */
import { useSimulationStore } from "@/store/simulation-store";

export type SimulationState = ReturnType<typeof useSimulationStore.getState>;
