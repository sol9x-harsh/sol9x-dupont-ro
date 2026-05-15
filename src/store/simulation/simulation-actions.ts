/**
 * Deterministic simulation actions.
 *
 * These are thin orchestration wrappers — they pull state from stores,
 * delegate to the simulation runner, and push results back into the
 * simulation store. No physics live here.
 */

import { useSimulationStore } from "@/store/simulation-store";
import { buildSimulationContext, runSimulationFromStores } from "@/core/simulation/orchestration/simulation-runner";
import type { NormalizedWarning } from "@/store/simulation-store";
import type { SimulationWarning } from "@/core/simulation/outputs/quality-output";

function normalizeWarnings(warnings: SimulationWarning[]): NormalizedWarning[] {
  return warnings.map((w) => ({
    code: w.code,
    message: w.message,
    severity: w.severity,
  }));
}

/** Run a fresh simulation from current store state. */
export function runSimulation(): void {
  const store = useSimulationStore.getState();
  store.setCalculating(true);

  try {
    const context = buildSimulationContext();

    if (!context) {
      store.setValidationErrors([
        {
          code: "INCOMPLETE_CONTEXT",
          message: "Simulation requires feed chemistry, hydraulic parameters, and at least one stage.",
          severity: "critical",
        },
      ]);
      return;
    }

    const result = runSimulationFromStores(context);

    if (!result.success || !result.output) {
      store.setValidationErrors(normalizeWarnings(result.validationErrors));
      return;
    }

    store.setOutput(result.output, normalizeWarnings(result.output.warnings));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown simulation error";
    store.setFailed(message);
  }
}

/** Re-run simulation — alias for runSimulation(), kept for semantic clarity in UI hooks. */
export function rerunSimulation(): void {
  runSimulation();
}

/** Clear all simulation state back to idle. */
export function clearSimulation(): void {
  useSimulationStore.getState().clearSimulation();
}

/** Push a pre-computed output directly into the store (e.g. from a worker in a future phase). */
export function updateSimulationOutput(
  output: Parameters<ReturnType<typeof useSimulationStore.getState>["setOutput"]>[0],
  warnings: NormalizedWarning[]
): void {
  useSimulationStore.getState().setOutput(output, warnings);
}

/** Overwrite warning list in the store (for UI-layer warning injection). */
export function updateWarnings(warnings: NormalizedWarning[]): void {
  const state = useSimulationStore.getState();
  // Re-use setOutput only if output already exists; otherwise just patch warnings
  if (state.output) {
    state.setOutput(state.output, warnings);
  }
}
