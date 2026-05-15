# Calculation Dependencies

This document tracks the dependency chains between calculations as they are implemented across phases.

---

## Phase 1 — No calculations yet (infrastructure only)

Phase 1 establishes types, constants, and unit utilities. No dependency chains exist yet.

---

## Phase 2 — Chemistry Engine (Chunk 1 complete)

### Chunk 1 — Ion Normalization & Conversions [IMPLEMENTED]

```
Ion concentrations (mg/L) — raw input
  └─→ normalizeConcentrations()        [null/NaN/negative → 0; clamps to valid range]
        └─→ mgLToMeqL(ionId, mgL)      [uses: MW / |valence| as equivalent weight]
              └─→ concentrationMapToMeqL()  [batch conversion; skips neutral species]
        └─→ mgLToMmolL(ionId, mgL)     [uses: MW as divisor]
              └─→ concentrationMapToMmolL() [batch conversion]
```

### Chunk 2 — Charge Balance [IMPLEMENTED]

```
Ion concentrations (mg/L)
  └─→ normalizeConcentrations()           [Chunk 1 — normalization.ts]
        └─→ totalCationMeq()              [sums cation meq/L via mgLToMeqL]
        └─→ totalAnionMeq()               [sums anion meq/L via mgLToMeqL]
              └─→ calculateChargeImbalancePercent()
                    └─→ classifyBalanceStatus()     [valid / warning / critical / invalid]
                          └─→ analyzeChargeBalance()  [returns BalanceAnalysis]
```

Thresholds: valid ≤ 2% | warning ≤ 5% | critical ≤ 10% | invalid > 10%

### Chunk 3 — TDS Calculations [IMPLEMENTED]

```
Ion concentrations (mg/L) — raw input
  └─→ calculateTDS()                    [sums valid ion mg/L; skips unknown/invalid]
        └─→ classifyTDS()               [freshwater / low-brackish / brackish / seawater / high-salinity]
        └─→ classifyTDSStatus()         [normal / warning / critical]
              └─→ analyzeTDS()          [returns TDSResult]
        └─→ crossCheckTDS()             [deviation% vs measured TDS]
              └─→ analyzeTDSWithCrossCheck()  [returns TDSCrossCheckResult]
```

Thresholds: freshwater ≤ 500 | low-brackish ≤ 2,000 | brackish ≤ 10,000 | seawater ≤ 45,000 | high-salinity > 45,000 (mg/L)

### Chunk 4 — Conductivity Estimation [IMPLEMENTED]

```
TDS (mg/L)
  └─→ estimateConductivityFromTDS()      [µS/cm = TDS / factor; default factor 0.64]
        └─→ analyzeConductivityFromTDS() [returns ConductivityResult]

Ion concentrations (mg/L)
  └─→ estimateConductivityFromIons()     [Σ ion_i × λ_factor_i; SiO₂ contributes 0]
        └─→ analyzeConductivityFromIons()

TDS + Ion concentrations
  └─→ analyzeConductivityDual()          [ion-weighted primary; TDS fallback; cross-check]
        └─→ classifyConductivity()       [freshwater / low-brackish / brackish / seawater / high-salinity]
        └─→ classifyConductivityStatus() [normal / warning / critical]
        └─→ crossCheckConductivity()     [deviation% between TDS-based and ion-weighted]
```

Thresholds: freshwater ≤ 800 | low-brackish ≤ 3,000 | brackish ≤ 16,000 | seawater ≤ 70,000 | high-salinity > 70,000 (µS/cm)

Ion conductivity factors (µS/cm per mg/L) are derived from limiting molar conductivities λ° at 25°C.
No temperature correction, activity coefficients, or ion-pairing applied.

### Chunk 5 — Osmotic Pressure Estimation [IMPLEMENTED]

```
Ion concentrations (mg/L)
  └─→ mgLToMmolL()                         [Chunk 1 — mmol.ts]
        └─→ estimateOsmoticPressureFromIons()  [Σ i×C_i (mmol/L) × R × T; van't Hoff at 25°C]
              └─→ analyzeOsmoticPressureFromIons()

TDS (mg/L)
  └─→ estimateOsmoticPressureFromTDS()     [π = TDS × 7.0×10⁻⁴ bar; engineering approximation]
        └─→ analyzeOsmoticPressureFromTDS()

Conductivity (µS/cm)
  └─→ estimateOsmoticPressureFromConductivity()  [π = conductivity × 4.48×10⁻⁴ bar]
        └─→ analyzeOsmoticPressureFromConductivity()

Osmotic pressure (bar)
  └─→ classifyOsmoticPressure()   [freshwater / low-brackish / brackish / seawater / high-salinity]
  └─→ classifyOsmoticStatus()     [normal / warning / critical]
  └─→ OsmoticPressureResult       [bar, psi, kPa, method, classification, status, message]
        └─→ NDP (Phase 4)         [NDP = ΔP − Δπ — feeds membrane flux engine]
```

Thresholds: freshwater ≤ 1 bar | low-brackish ≤ 4 bar | brackish ≤ 14 bar | seawater ≤ 35 bar | high-salinity > 35 bar

### Chunk 6 — Carbonate Equilibrium [PENDING]

```
pH + Temperature
  └─→ Carbonate equilibrium   [shifts HCO3/CO3 distribution]
```

---

## Phase 3 — Salt Passage & Permeate Quality

### Chunk 6 — Salt Passage [IMPLEMENTED]

```
Feed TDS (mg/L) + Rejection (%)
  └─→ calculatePermeateTDS()              [Cp = Cf × (1 − R/100)]
        └─→ calculateSaltPassage()        [SP = 100 − R]
        └─→ calculatePermeateConductivity() [conductivity = TDS / 0.55 µS/cm per mg/L]
              └─→ calculateSingleStagePermeateQuality()  [PermeateQualityResult]
                    └─→ analyzePermeateQuality()         [PermeateQualityAnalysis with status + classification]

Feed TDS + Per-stage recovery + Rejection
  └─→ calculateMultiStagePermeateQuality()   [propagates concentrate TDS stage-to-stage]
        └─→ rejectTDS = feedTDS / (1 − recovery)  [concentrate rise per stage]
        └─→ calculateBlendedPermeateWithRejection()  [flow-weighted blended permeate TDS]
              └─→ analyzeMultiStagePermeateQuality()    [SystemQualityResult]

Product Water
  └─→ classifyByPermeateTDS()   [excellent < 50 | good < 150 | acceptable < 500 | poor ≥ 500 mg/L]
  └─→ classifyBySaltPassage()   [normal ≤ 2% | warning ≤ 5% | critical ≤ 10% | failure > 10%]
  └─→ Reporting Engine (Phase 6)
```

Dependency chain:
```
Feed TDS
  → Rejection (%)
    → Salt Passage (%)
      → Permeate Quality (mg/L TDS)
        → Product Water Classification
          → Conductivity Estimation (µS/cm)
            → Reporting
```

---

## Phase 3 — Flow & Recovery Engine

### Chunk 1 — Flow Propagation & Recovery [IMPLEMENTED]

```
Feed flow (Qf, m³/h) + Permeate flow (Qp, m³/h)
  └─→ calculateRecovery()                [r = Qp / Qf; clamped to [0,1]]
        └─→ recoveryToPercent()          [r% = r × 100]

Feed flow + Recovery fraction
  └─→ calculatePermeateFlow()            [Qp = Qf × r]
  └─→ calculateConcentrateFlowFromRecovery()  [Qc = Qf × (1 − r)]
  └─→ calculateConcentrateFlow()         [Qc = Qf − Qp]

Recovery fraction
  └─→ calculateConcentrationFactor()     [CF = 1 / (1 − r)]
        └─→ calculateConcentrateTDS()    [TDSc = TDSf × CF]
        └─→ classifyConcentrationFactorStatus()  [normal / warning / critical]
        └─→ analyzeConcentrationFactor() [returns ConcentrationFactorResult]

Feed flow + Per-stage recovery fractions
  └─→ propagateSingleStage()             [StageFlows for one stage]
  └─→ propagateMultiStage()              [SystemFlows; concentrate of N → feed of N+1]
        └─→ checkFlowBalance()           [verify |Qf − (Qp + Qc)| / Qf ≤ tolerance]

Feed flow + Permeate flow
  └─→ analyzeFlows()                     [FlowAnalysisResult: all quantities + classification]
  └─→ analyzeFlowsFromRecovery()         [same, from recovery fraction]
        └─→ classifyRecovery()           [low / normal / aggressive / critical / invalid]
        └─→ classifyFlowStatus()         [normal / warning / critical]
```

Recovery thresholds: low < 30% | normal 30–80% | aggressive 80–85% | critical ≥ 85%
CF thresholds: normal < 5.0 | warning 5.0–8.0 | critical ≥ 8.0

### Chunk 2 — Pressure Propagation [IMPLEMENTED]

```
Feed pressure (Pin, bar)
  └─→ propagateStagePressure()          [Pout = Pin − ΔP; single stage]
  └─→ propagateMultiStagePressure()     [series; Pout_N → Pin_N+1; returns SystemPressures]
  └─→ propagateUniformStagePressures()  [N identical stages, same ΔP each]

Inlet + Outlet pressure
  └─→ calculatePressureDrop()           [ΔP = Pin − Pout; bar / psi / kPa]
  └─→ analyzePressureDrop()             [vs PRESSURE_DROP_MAX_PER_VESSEL_BAR; PressureDropAnalysis]

Element count
  └─→ estimatePressureDropFromElements()  [ΔP ≈ n × ΔP_per_element; capped at vessel max]

Inlet pressure
  └─→ calculateOutletPressure()         [Pout = Pin − ΔP; clamped to 0]
  └─→ calculateConcentratePressure()    [alias of calculateOutletPressure for last stage]
  └─→ analyzeStagePressure()            [StagePressureAnalysis: bar+psi, classification, status, message]
        └─→ classifyPressure()          [low / normal-bwro / high-bwro / swro / critical]
        └─→ classifyPressureStatus()    [normal / warning / critical]

Concentrate pressure (bar) [Phase 3 Chunk 2 output]
  └─→ NDP = ΔP − Δπ  [Phase 3 Chunk 3 — requires osmotic pressure from Phase 2 Chunk 5]
        └─→ Jw = A × NDP  [Phase 4 — membrane transport]
```

Pressure thresholds: low < 1 bar | BWRO ≤ 20 bar | warning ≤ 20 bar | SWRO ≤ 83 bar | critical > 83 bar
ΔP vessel limit: 3.5 bar | ΔP element default: 0.17 bar/element

### Chunk 3 — NDP Calculations [IMPLEMENTED]

```
Feed pressure (P_feed, bar) + Permeate pressure (P_permeate, bar)
  └─→ calculateHydraulicDeltaP()         [ΔP = P_feed − P_permeate; null if invalid]
        └─→ calculateNDP()               [NDP = ΔP − π_feed; bar / psi / kPa]
              └─→ calculateEffectiveDrivingPressure()  [NDP clamped to 0 for flux guards]
              └─→ analyzeNDP()           [NDPAnalysisResult: status + classification + message]
                    └─→ classifyNDP()    [insufficient / marginal / normal / aggressive]
                    └─→ classifyNDPStatus()  [invalid / warning / normal / critical]

Feed pressure per stage + Osmotic pressure per stage
  └─→ analyzeMultiStageNDP()            [SystemNDPResult: per-stage analysis + system status]

Concentrate pressures (bar) + Concentration factors + Feed osmotic pressure
  └─→ propagateNDPAcrossStages()        [scales osmotic pressure by CF per stage; deterministic]
        └─→ analyzeMultiStageNDP()      [stage NDP results + system status]
```

NDP thresholds: insufficient < 1.0 bar | marginal < 2.0 bar | normal 2–15 bar | aggressive ≥ 15 bar | critical ≥ 25 bar

Feed Pressure → Osmotic Pressure → Hydraulic ΔP → NDP → Flux (Phase 4) → Permeate Production

### Chunk 4 — Flux Calculations [IMPLEMENTED]

```
NDP (bar) + Membrane permeability A (LMH/bar)
  └─→ calculateFlux()                    [Jw = A × NDP; LMH]
        └─→ calculatePermeateFlowFromFlux()   [Qp = Jw × Area; m³/h + GPM]
        └─→ calculateFluxFromPermeateFlow()   [Jw = Qp / Area; back-calculation]
        └─→ calculateSpecificFlux()           [Jspec = Jw / NDP; diagnostic]
        └─→ analyzeFlux()                     [FluxAnalysisResult: LMH, GFD, Qp, status, classification]
              └─→ classifyFlux()              [low / normal / aggressive / critical]
              └─→ classifyFluxStatus()        [invalid / normal / warning / critical]

Flux (LMH) + Vessel config (vessels, elements/vessel, area/element)
  └─→ calculateVesselProductivity()      [VesselProductivity: Qp per vessel]
  └─→ calculateStageProductivity()       [StageProductivity: Qp per stage]
        └─→ analyzeMultiStageFlux()      [SystemFluxResult: per-stage analysis + totals]
```

NDP → Flux → Permeate Production → Recovery → Concentrate Rise → Membrane Loading

Flux thresholds (general): low < 8 LMH | normal 8–25 LMH | aggressive 25–34 LMH | critical ≥ 34 LMH
BWRO: 12–25 LMH normal | SWRO: 8–14 LMH normal

### Chunk 5 — Concentration Polarization [IMPLEMENTED]

```
Flux (Jw, LMH) + Mass transfer coefficient (k, m/s)
  └─→ calculateCPFactor()                    [CP = exp(Jw/k); unitless]
        └─→ calculateMembraneSurfaceConcentration()  [Cm = Cb × CP; mg/L]
        └─→ calculateEffectiveOsmoticPressure()      [π_eff = π_bulk × CP; bar]
              └─→ osmoticAmplificationBar            [π_eff − π_bulk]

Flux + Bulk concentration + Bulk osmotic pressure
  └─→ analyzeCPFactor()         [CPAnalysisResult: CP, Cm, π_eff, amplification, status]
        └─→ classifyCP()        [low / normal / elevated / critical]
        └─→ classifyCPStatus()  [invalid / normal / warning / critical]

Per-stage: flux + bulk concentration + bulk osmotic pressure
  └─→ analyzeMultiStageCP()     [SystemCPResult: per-stage CP + max CP + system status]
```

Flux → CP → Membrane Surface Concentration → Osmotic Amplification → Effective NDP → Recovery Impact

CP thresholds: low < 1.05 | normal < 1.20 | elevated < 1.40 | critical ≥ 1.40
Default k: 2.0×10⁻⁵ m/s (conservative 8" spiral-wound at standard cross-flow)

---

## Phase 4 — Simulation Orchestration Engine (implemented)

### Chunk 1 — Master Deterministic Pipeline [IMPLEMENTED]

Full orchestration chain executed by `runSimulation(context)` in `src/core/simulation/engine/simulation-engine.ts`:

```
SimulationContext
  ├─ feed.concentrations
  ├─ hydraulics (flows, pressures, recovery)
  ├─ membrane (rejection, A, k)
  └─ configuration (stages, vessels, element geometry)

  Step 1: Chemistry Normalization & Charge Balance
    └─→ analyzeChargeBalance(feed.concentrations)     [balance-analysis.ts]
          └─→ BalanceAnalysis { imbalancePercent, status }

  Step 2: TDS Analysis
    └─→ analyzeTDS(feed.concentrations)              [tds-analysis.ts]
          └─→ TDSResult { tdsMgL, classification, status }

  Step 3: Conductivity Estimation
    └─→ analyzeConductivityDual(tdsMgL, concentrations)  [conductivity-analysis.ts]
          └─→ ConductivityDualResult { conductivityUsCm, method, crossCheckPassed }

  Step 4: Osmotic Pressure
    └─→ analyzeOsmoticPressureFromIons(concentrations)  [osmotic-analysis.ts]
          └─→ OsmoticPressureResult { osmoticPressureBar, status }

  Step 5: Flow Propagation
    └─→ propagateMultiStage(feedFlowM3h, stageRecoveryFractions)  [flow-propagation.ts]
          └─→ SystemFlows { stages[], systemRecoveryFraction, concentrateFlowM3h }

  Step 6: Pressure Propagation
    └─→ propagateMultiStagePressure(feedPressureBar, stagePressureDrops)  [pressure-propagation.ts]
          └─→ SystemPressures { stages[], concentratePressureBar }

  Step 7: NDP Propagation
    └─→ calculateConcentrationFactor(stageRecovery)    [concentration-factor.ts → CF per stage]
    └─→ propagateNDPAcrossStages(concentratePressures, feedOsmotic, CFs, permeatePressure)
          └─→ SystemNDPResult { stages[], lowestNdpBar, highestNdpBar, systemStatus }

  Step 8: Flux Analysis
    └─→ analyzeMultiStageFlux(stageFluxInputs)  [flux-analysis.ts]
          └─→ SystemFluxResult { stages[], totalPermeateFlowM3H }

  Step 9: Concentration Polarization
    └─→ analyzeMultiStageCP(stageCPInputs)  [cp-analysis.ts]
          └─→ SystemCPResult { stages[], maxCPFactor }

  Step 10: Permeate Quality & Salt Passage
    └─→ analyzeMultiStagePermeateQuality(stageQualityInputs)  [salt-analysis.ts]
          └─→ SystemQualityResult { blendedPermeateTDSMgL, blendedRejectionPercent }

  Step 11: System Summary + Warning Aggregation
    └─→ aggregateWarnings({ chargeBalance, tds, osmotic, ndp, flux, cp, recovery, rejection })
          └─→ SimulationWarning[]
    └─→ SystemSummaryOutput {
          feedTDSMgL, systemRecoveryFraction, blendedPermeateTDSMgL,
          averageFluxLMH, lowestNdpBar, maxCPFactor, status, warnings
        }

  Output: SimulationOutput {
    chemistry: { chargeBalance, tds, conductivity, osmoticPressure }
    hydraulics: { flows, pressures, ndp, flux, cp }
    permeate: { quality }
    summary: SystemSummaryOutput
    warnings: SimulationWarning[]
  }
```

---

## Phase 4 — Zustand Integration (Phase 4, Chunk 2)

### Chunk 2 — Zustand Store Orchestration [IMPLEMENTED]

```
Zustand State (feed-store + ro-config-store)
  └─→ buildSimulationContext()              [simulation-runner.ts]
        ├─→ buildIonConcentrationMap()      [maps store ions → IonConcentrationMap]
        ├─→ buildStageRecoveryFractions()   [distributes pass recovery evenly across stages]
        ├─→ buildStagePressureDrops()       [fills per-stage ΔP from SIMULATION_DEFAULTS]
        └─→ buildStageGeometries()          [derives vesselCount, elementsPerVessel, elementAreaM2]
              └─→ SimulationContext         [validated, typed engine input]

SimulationContext
  └─→ runSimulationFromStores(context)     [simulation-runner.ts → delegates to engine]
        └─→ runSimulation(context)         [simulation-engine.ts — Phase 4 Chunk 1]
              └─→ SimulationResult { success, output, validationErrors }

SimulationResult
  └─→ simulation-actions.ts               [runSimulation() action]
        ├─→ store.setOutput()             [output + normalized warnings → simulation-store]
        └─→ store.setValidationErrors()   [validation failures → simulation-store]

simulation-store (SimulationOutput | null)
  └─→ simulation-selectors.ts            [React-ready selectors]
        ├─→ selectSystemSummary()
        ├─→ selectBlendedPermeateTDS()
        ├─→ selectAverageFlux()
        ├─→ selectLowestNDP()
        ├─→ selectMaxCPFactor()
        ├─→ selectChargeBalance()
        ├─→ selectWarnings()
        └─→ selectCriticalWarnings()
              └─→ UI components (Phase 4 Chunk 4 — pending)

Reactive triggers (simulation-trigger.ts)
  feed-store.subscribe()     → change in ions/TDS/conductivity/pH/temperature → runSimulation()
  ro-config-store.subscribe() → change in feedFlow/recovery/stage topology   → runSimulation()
```

Dependency chain:
```
User edits feed ion
  → feed-store mutation
    → simulation-trigger detects snapshot change
      → runSimulation() action
        → buildSimulationContext() from stores
          → engine runSimulation(context)
            → SimulationOutput
              → store.setOutput()
                → selectors expose updated metrics to UI
```

---

## Phase 5 — Membrane Transport (planned)

```
ΔP, Δπ, A
  └─→ Water flux Jw           [Jw = A(ΔP − Δπ)]
        └─→ Permeate flow     [Qp = Jw × area]

Feed TDS, Permeate TDS, B
  └─→ Solute flux Js          [Js = B(Cm − Cp)]

Jw, k
  └─→ Concentration polarization β  [β = exp(Jw / k)]
```

---

## Phase 5 — Validation (planned)

```
Charge balance error %
  └─→ Validation warning/error  [vs CHARGE_BALANCE thresholds]

System recovery
  └─→ Validation warning/error  [vs RECOVERY thresholds]

Average flux
  └─→ Validation warning/error  [vs FLUX thresholds]

Operating pressure
  └─→ Validation warning/error  [vs PRESSURE thresholds]
```

---

## Phase 4 — Report Engine Integration (Chunk 4)

### Report Builder Dependency Chain

```
SimulationOutput (from simulation store)
  └─→ buildSystemOverviewReport()
        └─→ SystemOverviewReport { roRecoveryPercent, feedTDSMgL, permeateTDSMgL, ... }

SimulationOutput + Pass[] + FeedChemistry
  └─→ buildPassSummaryReport()
        ├─→ hydraulics.pressures.stages[0].inletPressureBar  → feedPressureBar
        ├─→ hydraulics.flux.stages[*].fluxLMH                → avgFluxLMH
        ├─→ hydraulics.ndp.stages[*].ndp.ndpBar              → avgNdpBar
        └─→ estimateSpecificEnergy(feedPressure, recovery)   → specificEnergykWh

SimulationOutput
  └─→ buildStreamTableReport()
        ├─→ hydraulics.flows.feedFlowM3h                     → S-001, S-002 flow
        ├─→ summary.concentrateFlowM3h / concentrateTDSMgL  → S-003
        └─→ summary.totalPermeateFlowM3h / blendedPermeateTDS → S-004, S-005

SimulationOutput + Pass[]
  └─→ buildStageFlowReport()
        ├─→ hydraulics.flows.stages[i]                       → feed/concentrate/permeate flows
        ├─→ hydraulics.pressures.stages[i]                   → inlet/outlet/drop pressures
        ├─→ hydraulics.flux.stages[i].fluxLMH                → avgFluxLMH
        ├─→ hydraulics.ndp.stages[i].ndp.ndpBar              → ndpBar
        ├─→ hydraulics.cp.stages[i].cp.cpFactor              → cpFactor
        └─→ permeate.quality.stages[i].permeateTDSMgL        → permeateTDSMgL

SimulationOutput + IonComposition + feedPH
  └─→ buildSoluteAnalysisReport()
        ├─→ summary.concentrateTDSMgL / feedTDSMgL           → concentration factor CF
        ├─→ ions[key] × CF                                    → concentrate concentrations
        ├─→ ions[key] × permeateFraction                      → permeate concentrations
        └─→ chemistry.conductivity.conductivityUsCm           → conductivity rows

SimulationOutput + IonComposition
  └─→ buildScalingAnalysisReport()
        ├─→ ions.calcium / ions.bicarbonate                   → LSI approximation
        └─→ ions.* × CF                                       → CaSO₄, BaSO₄, SiO₂ saturation %

SimulationOutput + ChemicalAdjustment
  └─→ buildCostSummaryReport()
        ├─→ hydraulics.flows.feedFlowM3h × unit water cost   → water costs
        ├─→ estimatePumpPowerkW(feedFlow, feedPressure)       → energy costs
        └─→ chemicalAdjustment.antiscalantDose                → chemical costs

All of the above
  └─→ buildEngineeringReport()
        └─→ FullEngineeringReport (complete export-ready model)
```

### Store Selector Dependency Chain

```
useSimulationStore(s => s.output)        → SimulationOutput
useProjectStore(s => s.currentProject)  → ProjectMetadata
useROConfigStore(s => s.passes)          → Pass[]
useROConfigStore(s => s.chemicalAdjustment) → ChemicalAdjustment
useFeedStore(s => s.chemistry)           → FeedChemistry

All → useEngineeringReport() → FullEngineeringReport | null
```
