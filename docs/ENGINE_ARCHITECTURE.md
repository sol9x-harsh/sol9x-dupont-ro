# Engine Architecture

## Overview

The Transfilm calculation engine lives entirely in `src/core/`. It is a deterministic, functional engineering computation layer with no UI coupling.

All modules are pure TypeScript. No React. No Zustand. No side effects.

---

## Directory Structure

```
src/core/
├── constants/       — Engineering constants (ions, physics, membranes, thresholds, units)
├── types/           — Shared TypeScript interfaces and types
├── units/           — Pure unit conversion functions
├── utils/           — Shared math, formatting, and guard utilities
├── chemistry/       — Chemistry engine (Phase 2+)
├── hydraulics/      — Hydraulic engine (Phase 3+)
├── membrane/        — Membrane transport engine (Phase 4+)
├── validation/      — Validation engine (Phase 5+)
└── simulation/      — Simulation orchestration (Phase 6+)
```

---

## Module Responsibilities

### `constants/`

Static engineering data. No logic. Imported by all other modules.

- `ions.ts` — Ion metadata: MW, valence, symbol, category
- `physics.ts` — Gas constant, water density, pressure conversion factors
- `membrane.ts` — Placeholder membrane defaults (A, B, rejection, area, flux)
- `thresholds.ts` — Warning/error limits (charge balance, pressure, recovery, flux)
- `units.ts` — Union types for all supported unit labels

### `types/`

TypeScript interfaces shared across the entire engine. No logic.

- `common.types.ts` — Severity, ValidationResult, UnitSystem, WithUnit
- `chemistry.types.ts` — ChemistryStream, IonConcentrations, ChargeBalance
- `flow.types.ts` — FlowStream, RecoveryCalc, StageFlows, SystemFlows
- `membrane.types.ts` — MembraneMeta, VesselConfig, StageConfig, PassConfig
- `simulation.types.ts` — SimulationResult, SimulationWarning, ConvergenceMetadata

### `units/`

Pure conversion functions. Each takes a number, returns a number.

- `pressure.ts` — bar ↔ psi, kPa, atm
- `flow.ts` — m³/h ↔ gpm, m³/d, L/h, gpd, mgd
- `concentration.ts` — mg/L ↔ meq/L, mmol/L, g/L, ppm
- `temperature.ts` — °C ↔ °F, K

### `utils/`

Lightweight shared helpers. No domain knowledge.

- `math.ts` — round, safeDivide, clamp, lerp, isFiniteNumber
- `format.ts` — formatEngValue, formatPercent, formatFlow, formatPressure
- `guards.ts` — fallbackIfInvalid, nonNegative, clampRecovery

---

## Design Principles

1. Pure functions only — no global state, no mutation
2. All inputs/outputs explicitly typed
3. No hidden calculation chains — every computation is traceable
4. Units are always explicit — functions take/return labeled unit types
5. Constants are never hard-coded inline — always imported from `constants/`
