import type { Severity, ValidationResult } from "./common.types";

export type SimulationStatus = "idle" | "running" | "complete" | "error";

export interface SimulationWarning {
  id: string;
  severity: Severity;
  field: string;
  message: string;
}

export interface SimulationValidation {
  isValid: boolean;
  warnings: SimulationWarning[];
  errors: ValidationResult[];
}

export interface ConvergenceMetadata {
  /** Number of iterations performed */
  iterations: number;
  /** Final residual error */
  residual: number;
  /** Whether the solver converged */
  converged: boolean;
  /** Maximum allowed iterations */
  maxIterations: number;
  /** Convergence tolerance */
  tolerance: number;
}

export interface SimulationResult<T> {
  status: SimulationStatus;
  data: T | null;
  validation: SimulationValidation;
  convergence?: ConvergenceMetadata;
  computedAt: number; // Unix ms timestamp
}
