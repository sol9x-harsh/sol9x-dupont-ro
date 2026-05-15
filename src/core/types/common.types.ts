export type Severity = "info" | "warning" | "error";

export type ValidationStatus = "valid" | "warning" | "error";

export interface ValidationResult {
  status: ValidationStatus;
  field: string;
  message: string;
  severity: Severity;
}

export interface RangeCheck {
  value: number;
  min: number;
  max: number;
  unit: string;
}

export type UnitSystem = "SI" | "US";

export interface WithUnit<T> {
  value: T;
  unit: string;
}
