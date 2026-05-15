# Engine Implementation Tracker

## Phase 1 — Foundational Infrastructure [COMPLETE]

### Completed Modules

| Module | Path | Status |
|---|---|---|
| Ion constants | `src/core/constants/ions.ts` | ✅ Done |
| Physics constants | `src/core/constants/physics.ts` | ✅ Done |
| Membrane defaults | `src/core/constants/membrane.ts` | ✅ Done |
| Engineering thresholds | `src/core/constants/thresholds.ts` | ✅ Done |
| Unit definitions | `src/core/constants/units.ts` | ✅ Done |
| Chemistry types | `src/core/types/chemistry.types.ts` | ✅ Done |
| Flow types | `src/core/types/flow.types.ts` | ✅ Done |
| Membrane types | `src/core/types/membrane.types.ts` | ✅ Done |
| Simulation types | `src/core/types/simulation.types.ts` | ✅ Done |
| Common types | `src/core/types/common.types.ts` | ✅ Done |
| Pressure conversions | `src/core/units/pressure.ts` | ✅ Done |
| Flow conversions | `src/core/units/flow.ts` | ✅ Done |
| Concentration conversions | `src/core/units/concentration.ts` | ✅ Done |
| Temperature conversions | `src/core/units/temperature.ts` | ✅ Done |
| Math utilities | `src/core/utils/math.ts` | ✅ Done |
| Format utilities | `src/core/utils/format.ts` | ✅ Done |
| Guard utilities | `src/core/utils/guards.ts` | ✅ Done |

---

## Phase 2 — Chemistry Engine [IN PROGRESS]

### Chunk 1 — Ion Normalization & meq/L Conversions [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Chemistry constants | `src/core/chemistry/constants/chemistry.constants.ts` | ✅ Done |
| Chemistry validation | `src/core/chemistry/validation/chemistry.validation.ts` | ✅ Done |
| meq/L conversions | `src/core/chemistry/conversions/meq.ts` | ✅ Done |
| mmol/L conversions | `src/core/chemistry/conversions/mmol.ts` | ✅ Done |
| Normalization utilities | `src/core/chemistry/conversions/normalization.ts` | ✅ Done |

### Chunk 2 — Charge Balance [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Balance constants | `src/core/chemistry/balance/balance.constants.ts` | ✅ Done |
| Charge balance engine | `src/core/chemistry/balance/charge-balance.ts` | ✅ Done |
| Balance analysis | `src/core/chemistry/balance/balance-analysis.ts` | ✅ Done |

### Chunk 3 — TDS Calculations [COMPLETE]

| Module | Path | Status |
|---|---|---|
| TDS constants | `src/core/chemistry/tds/tds.constants.ts` | ✅ Done |
| TDS calculation engine | `src/core/chemistry/tds/tds-calculation.ts` | ✅ Done |
| TDS analysis & classification | `src/core/chemistry/tds/tds-analysis.ts` | ✅ Done |

### Chunk 4 — Conductivity Estimation [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Conductivity constants | `src/core/chemistry/conductivity/conductivity.constants.ts` | ✅ Done |
| Conductivity calculation engine | `src/core/chemistry/conductivity/conductivity-calculation.ts` | ✅ Done |
| Conductivity analysis & classification | `src/core/chemistry/conductivity/conductivity-analysis.ts` | ✅ Done |

### Chunk 5 — Osmotic Pressure Estimation [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Osmotic constants | `src/core/chemistry/osmotic/osmotic.constants.ts` | ✅ Done |
| Osmotic calculation engine | `src/core/chemistry/osmotic/osmotic-calculation.ts` | ✅ Done |
| Osmotic analysis & classification | `src/core/chemistry/osmotic/osmotic-analysis.ts` | ✅ Done |

### Chunk 6 — Carbonate Equilibrium [PENDING]

- [ ] pH-dependent HCO₃⁻/CO₃²⁻ speciation
- [ ] Carbonate equilibrium calculation

### Chunk 7 — Scaling Indicators [PENDING]

- [ ] Langelier Saturation Index (LSI)
- [ ] Stiff-Davis Stability Index

### Chunk 8 — Membrane Transport Engine [PENDING]

- [ ] Water flux: Jw = A(ΔP − Δπ)
- [ ] NDP calculation
- [ ] Solute flux: Js = B(Cm − Cp)

## Phase 3 — Flow & Recovery Engine [IN PROGRESS]

### Chunk 1 — Flow Propagation & Recovery [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Flow constants | `src/core/hydraulics/flow/flow.constants.ts` | ✅ Done |
| Recovery calculations | `src/core/hydraulics/flow/recovery.ts` | ✅ Done |
| Concentration factor | `src/core/hydraulics/flow/concentration-factor.ts` | ✅ Done |
| Flow propagation | `src/core/hydraulics/flow/flow-propagation.ts` | ✅ Done |
| Flow analysis | `src/core/hydraulics/flow/flow-analysis.ts` | ✅ Done |

### Chunk 2 — Pressure Propagation [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Pressure constants | `src/core/hydraulics/pressure/pressure.constants.ts` | ✅ Done |
| Pressure drop engine | `src/core/hydraulics/pressure/pressure-drop.ts` | ✅ Done |
| Pressure propagation | `src/core/hydraulics/pressure/pressure-propagation.ts` | ✅ Done |
| Pressure analysis | `src/core/hydraulics/pressure/pressure-analysis.ts` | ✅ Done |

### Chunk 3 — NDP Calculations [COMPLETE]

| Module | Path | Status |
|---|---|---|
| NDP constants | `src/core/hydraulics/ndp/ndp.constants.ts` | ✅ Done |
| NDP calculation engine | `src/core/hydraulics/ndp/ndp-calculation.ts` | ✅ Done |
| NDP analysis & classification | `src/core/hydraulics/ndp/ndp-analysis.ts` | ✅ Done |

### Chunk 4 — Flux Calculations [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Flux constants | `src/core/hydraulics/flux/flux.constants.ts` | ✅ Done |
| Flux calculation engine | `src/core/hydraulics/flux/flux-calculation.ts` | ✅ Done |
| Flux analysis & classification | `src/core/hydraulics/flux/flux-analysis.ts` | ✅ Done |

### Chunk 5 — Concentration Polarization [COMPLETE]

| Module | Path | Status |
|---|---|---|
| CP constants | `src/core/hydraulics/concentration-polarization/cp.constants.ts` | ✅ Done |
| CP calculation engine | `src/core/hydraulics/concentration-polarization/cp-calculation.ts` | ✅ Done |
| CP analysis & classification | `src/core/hydraulics/concentration-polarization/cp-analysis.ts` | ✅ Done |

### Chunk 6 — Salt Passage & Permeate Quality [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Salt constants | `src/core/membrane/salt-passage/salt.constants.ts` | ✅ Done |
| Salt calculation engine | `src/core/membrane/salt-passage/salt-calculation.ts` | ✅ Done |
| Permeate quality analysis | `src/core/membrane/salt-passage/salt-analysis.ts` | ✅ Done |

### Chunk 7 — Simulation Orchestration [PENDING]

- [ ] Single-pass stage orchestration
- [ ] Live integration layer
- [ ] Report integration

## Phase 4 — Simulation Orchestration Engine [COMPLETE — Chunk 1]

### Chunk 1 — Deterministic Simulation Pipeline [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Simulation context | `src/core/simulation/engine/simulation-context.ts` | ✅ Done |
| Simulation pipeline | `src/core/simulation/engine/simulation-pipeline.ts` | ✅ Done |
| Warning aggregation | `src/core/simulation/engine/warnings.ts` | ✅ Done |
| Simulation engine | `src/core/simulation/engine/simulation-engine.ts` | ✅ Done |
| Output models | `src/core/simulation/outputs/simulation-output.ts` | ✅ Done |
| Quality output types | `src/core/simulation/outputs/quality-output.ts` | ✅ Done |
| Validation layer | `src/core/simulation/validation/simulation-validation.ts` | ✅ Done |
| Simulation constants | `src/core/simulation/constants/simulation.constants.ts` | ✅ Done |
| Barrel exports | `src/core/simulation/index.ts` | ✅ Done |

### Chunk 2 — Zustand Integration [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Simulation store (expanded) | `src/store/simulation-store.ts` | ✅ Done |
| Simulation actions | `src/store/simulation/simulation-actions.ts` | ✅ Done |
| Simulation selectors | `src/store/simulation/simulation-selectors.ts` | ✅ Done |
| Store module barrel | `src/store/simulation/index.ts` | ✅ Done |
| Simulation runner | `src/core/simulation/orchestration/simulation-runner.ts` | ✅ Done |
| Simulation trigger | `src/core/simulation/orchestration/simulation-trigger.ts` | ✅ Done |
| Orchestration barrel | `src/core/simulation/orchestration/index.ts` | ✅ Done |

**Pending (future chunks):**
- [ ] UI bindings (hook into Studio layout, results panel)
- [ ] Report integration (map SimulationOutput → ReportData)
- [ ] Auto-refresh dashboards on output change
- [ ] Debounced recalculation (avoid thrashing on rapid input)
- [ ] Incremental recalculation graph (skip unaffected steps)

### Chunk 3 — UI Binding & Live Simulation Visualization [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Simulation trigger init | `src/components/layout/studio/StudioLayout.tsx` | ✅ Done |
| SimulationWarnings component | `src/components/engineering/SimulationWarnings.tsx` | ✅ Done |
| FeedSetupView live analytics | `src/features/feed-setup/FeedSetupView.tsx` | ✅ Done |
| ROConfigView live metrics panel | `src/features/ro-config/ROConfigView.tsx` | ✅ Done |
| ROConfigView PFD live props | `src/features/ro-config/ROConfigView.tsx` | ✅ Done |
| SystemDesignPFD live flows | `src/features/reporting/sections/SystemDesignPFD.tsx` | ✅ Done |
| SystemDesignView live status/efficiency | `src/features/system-design/SystemDesignView.tsx` | ✅ Done |

**Bound selectors:**
- TDS, charge balance, conductivity, osmotic pressure → FeedSetupView analytics bar
- Recovery, permeate flow, concentrate flow, avg flux, feed TDS, NDP → ROConfigView metrics
- Feed flow, permeate flow, permeate TDS → SystemDesignPFD
- System recovery, simulation status → SystemDesignView footer
- Warnings/validation errors → all Studio views via SimulationWarnings

**Pending (future chunks):**
- [ ] Report PDF integration (map SimulationOutput → ReportData)
- [ ] Backend persistence
- [ ] Optimization workflow
- [ ] Debounced recalculation (slider drag events)
- [ ] Async Web Worker offload

### Chunk 4 — Report Engine Integration [COMPLETE]

| Module | Path | Status |
|---|---|---|
| Report models | `src/core/reporting/models/report.models.ts` | ✅ Done |
| Engineering formatters | `src/core/reporting/formatters/engineering.formatters.ts` | ✅ Done |
| Report constants | `src/core/reporting/constants/report.constants.ts` | ✅ Done |
| Project metadata builder | `src/core/reporting/builders/project-metadata.builder.ts` | ✅ Done |
| System overview builder | `src/core/reporting/builders/system-overview.builder.ts` | ✅ Done |
| Pass summary builder | `src/core/reporting/builders/pass-summary.builder.ts` | ✅ Done |
| Stream table builder | `src/core/reporting/builders/stream-table.builder.ts` | ✅ Done |
| Stage flow builder | `src/core/reporting/builders/stage-flow.builder.ts` | ✅ Done |
| Element flow builder | `src/core/reporting/builders/element-flow.builder.ts` | ✅ Done |
| Solute analysis builder | `src/core/reporting/builders/solute-analysis.builder.ts` | ✅ Done |
| Scaling analysis builder | `src/core/reporting/builders/scaling-analysis.builder.ts` | ✅ Done |
| Warning summary builder | `src/core/reporting/builders/warning-summary.builder.ts` | ✅ Done |
| Cost summary builder | `src/core/reporting/builders/cost-summary.builder.ts` | ✅ Done |
| Engineering report builder | `src/core/reporting/builders/engineering-report.builder.ts` | ✅ Done |
| Sections index | `src/core/reporting/sections/index.ts` | ✅ Done |
| Core reporting barrel | `src/core/reporting/index.ts` | ✅ Done |
| Report store selectors | `src/store/report-selectors.ts` | ✅ Done |
| ReportView live integration | `src/features/reporting/ReportView.tsx` | ✅ Done |

**Architecture:**
- `FullEngineeringReport` model is the single source of truth for all report sections
- Builders are pure functions: `(SimulationOutput, storeData) → report model`
- Selectors (`useEngineeringReport`, `useSystemOverviewReport`, etc.) compose builders from live store state
- ReportView adapts live models to existing UI section types — no mock data remains

### Chunk 5 — PDF Export Engine [PENDING]

- [ ] PDF document generation (react-pdf or puppeteer)
- [ ] Print-ready page layout
- [ ] Section-level pagination
- [ ] PFD rasterization to PDF
- [ ] Export format selection (PDF / XLSX)

### Chunk 6 — Optimization & Persistence [PENDING]

- [ ] Backend persistence layer
- [ ] Optimization algorithms
- [ ] Async worker threads

## Phase 5 — Membrane Transport Engine [PENDING]

- [ ] Water flux: Jw = A(ΔP − Δπ)
- [ ] Solute flux: Js = B(Cm − Cp)
- [ ] Concentration polarization: β = exp(Jw / k)
- [ ] Element-level solving

## Phase 6 — Validation Engine [PENDING]

- [ ] Charge balance validation
- [ ] Flux limit validation
- [ ] Pressure limit validation
- [ ] Recovery limit validation
- [ ] Warning/error aggregation

## Phase 7 — Advanced Simulation Engine [PENDING]

- [ ] Multi-stage iterative solving
- [ ] Convergence loop
- [ ] System summary output
