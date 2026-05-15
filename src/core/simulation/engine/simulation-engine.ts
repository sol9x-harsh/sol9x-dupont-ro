import { validateSimulationContext } from "@/core/simulation/validation/simulation-validation";
import { runSimulationPipeline } from "./simulation-pipeline";
import type { SimulationContext } from "./simulation-context";
import type { SimulationOutput } from "@/core/simulation/outputs/simulation-output";
import type { SimulationWarning } from "@/core/simulation/outputs/quality-output";

export interface SimulationResult {
  success: boolean;
  output: SimulationOutput | null;
  validationErrors: SimulationWarning[];
}

/**
 * Master entry point for the SOL9X deterministic RO simulation engine.
 *
 * Validates the context, executes the deterministic pipeline, and returns
 * a fully typed simulation result. All calculations are single-pass and
 * algebraic — no iterative solving is performed.
 */
export function runSimulation(context: SimulationContext): SimulationResult {
  const validation = validateSimulationContext(context);

  if (!validation.isValid) {
    return {
      success: false,
      output: null,
      validationErrors: validation.errors,
    };
  }

  const output = runSimulationPipeline(context);

  return {
    success: true,
    output,
    validationErrors: [],
  };
}
