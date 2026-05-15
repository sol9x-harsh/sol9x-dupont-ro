export type MembraneType = "brackish" | "seawater" | "nf" | "ulf";

export interface MembraneMeta {
  id: string;
  manufacturer: string;
  model: string;
  type: MembraneType;
  /** Active area (m²) */
  activeArea: number;
  /** Water permeability A (L/m²/h/bar) */
  permeabilityA: number;
  /** Solute permeability B (L/m²/h) */
  permeabilityB: number;
  /** Nominal salt rejection (fraction) */
  nominalRejection: number;
  /** Max operating pressure (bar) */
  maxPressureBar: number;
}

export interface VesselConfig {
  vesselId: string;
  elementsPerVessel: number;
  membrane: MembraneMeta;
}

export interface StageConfig {
  stageIndex: number;
  vessels: VesselConfig[];
  /** Vessels in parallel */
  vesselCount: number;
  /** Elements per vessel */
  elementsPerVessel: number;
}

export interface PassConfig {
  passIndex: number;
  stages: StageConfig[];
}

export interface SystemMembraneConfig {
  passes: PassConfig[];
  totalElements: number;
  totalActiveArea: number;
}
