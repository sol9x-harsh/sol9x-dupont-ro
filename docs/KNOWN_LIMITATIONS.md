# Known Limitations

## Phase 1 — Infrastructure Only

### Constants are placeholders

All values in `src/core/constants/membrane.ts` are engineering defaults, not real membrane datasheet values. They must be replaced with manufacturer-specific data (Hydranautics, Toray, etc.) in a future phase.

### No automatic ion balancing (Phase 2, Chunk 2)

Charge balance analysis is read-only — it detects imbalance but does not correct it. No Na⁺ or Cl⁻ compensation is applied automatically. Balancing a stream requires manual adjustment of ion concentrations by the engineer.

### No pH-dependent equilibrium in charge balance

The charge balance engine treats HCO₃⁻ and CO₃²⁻ as fixed independent inputs. It does not account for pH-driven carbonate speciation shifts. A stream with accurate pH may still show apparent imbalance if carbonate species are not correctly distributed.

### No advanced speciation in charge balance

Activity coefficients, ion-pair formation (e.g., CaSO₄⁰, MgHCO₃⁺), and Debye-Hückel corrections are not applied. All species are treated as fully dissociated. This approximation is valid for typical brackish RO feed (TDS < 5000 mg/L) but introduces error at higher ionic strengths.

### Chemistry engine is foundational only (Phase 2, Chunk 1)

Phase 2 Chunk 1 implements ion normalization and unit conversions (mg/L ↔ meq/L, mg/L ↔ mmol/L). No charge balance, TDS summation, conductivity, osmotic pressure, or carbonate equilibrium calculations have been implemented yet. These belong to Phase 2 Chunks 2–3.

All chemistry calculations use deterministic approximations — no speciation, no activity corrections, no PHREEQC integration, no advanced thermodynamic models. The engine assumes dilute aqueous solutions (density ≈ 1 kg/L) and standard reference temperature (25°C).

### Conductivity estimation uses simplified engineering approximations (Phase 2, Chunk 4)

Conductivity is estimated using two methods: (1) empirical TDS/factor conversion (default factor 0.64, per ASTM D1125) and (2) ion-weighted summation using limiting molar conductivity factors (λ°) scaled to mg/L units. Both methods assume 25°C reference temperature with no thermal correction.

No ionic activity coefficients are applied. Ion-pair formation (e.g. CaSO₄⁰, NaHCO₃⁰) is not modeled — all species are treated as fully dissociated. This is accurate for dilute brackish streams (TDS < 5,000 mg/L) but introduces increasing error at higher ionic strengths.

No temperature compensation is implemented. Conductivity increases approximately 2% per °C deviation from 25°C. Streams at non-reference temperatures will show systematic estimation bias.

Ion weighting factors are engineering approximations derived from standard λ° values. They are not corrected for concentration polarization effects or inter-ionic interactions.

### TDS calculations use deterministic summation only (Phase 2, Chunk 3)

TDS is calculated as a direct sum of all valid ion concentrations (mg/L). No ionic strength corrections, no activity coefficients, and no precipitation equilibrium are applied. The summation assumes all species remain in solution and fully contribute to TDS. This is accurate for typical brackish RO feed (TDS < 10,000 mg/L) but may diverge slightly for high-salinity or scaling-prone streams.

No precipitation handling is implemented — ions that may precipitate (e.g. CaCO₃, CaSO₄) are not removed from the TDS sum before classification. Scaling indices and saturation limits belong to a future phase.

### No carbonate equilibrium

pH-dependent HCO₃⁻/CO₃²⁻ speciation is not implemented. Bicarbonate and carbonate concentrations are treated as independent fixed inputs. Carbonate equilibrium belongs to a future chunk.

### Osmotic pressure uses simplified van't Hoff model (Phase 2, Chunk 5)

Osmotic pressure is estimated using three methods: (1) TDS-based empirical factor (π ≈ TDS × 7.0×10⁻⁴ bar), (2) conductivity-based empirical factor (π ≈ conductivity × 4.48×10⁻⁴ bar), and (3) ion-based van't Hoff summation (π = Σ i×C_i × RT at 25°C reference temperature).

No activity coefficients are applied. All ion species are treated as fully dissociated (i = 1 per species). Ion-pair formation (e.g. CaSO₄⁰, MgHCO₃⁺), osmotic coefficient corrections, and Pitzer model corrections are not implemented. This approximation is accurate for dilute brackish streams (TDS < 5,000 mg/L) but introduces increasing error at higher ionic strengths typical of seawater.

No concentration polarization correction is applied at this layer. Membrane-side concentration enhancement (β = exp(Jw/k)) belongs to the membrane transport engine (Phase 4). The osmotic pressure calculated here represents bulk feed-side osmotic pressure only.

No temperature correction is applied. All van't Hoff calculations use the reference temperature of 25°C (298.15 K). Streams at operating temperatures other than 25°C will show systematic osmotic pressure estimation bias.

The TDS-based and conductivity-based methods use fixed empirical factors valid for typical NaCl-dominated brackish water. Streams with unusual ionic composition (e.g. high sulfate, high bicarbonate, or high silica) may show greater deviation from these factors.

### No advanced ion transport or speciation

Boron transport, silica scaling kinetics, ion-pair formation, and Debye-Hückel activity corrections are not implemented. The engine uses simplified equivalent weight and molecular weight relationships only.

### No PHREEQC integration

The platform does not integrate with PHREEQC or any external geochemical solver. All future chemistry calculations will use explicit deterministic equations (van't Hoff, Langelier, etc.) rather than PHREEQC. PHREEQC integration is not planned for the near term.

### No advanced ion transport

Boron transport, silica scaling kinetics, and ion-pair activity corrections are not implemented. The engine uses simplified activity models only.

### Flow engine uses deterministic single-pass hydraulic approximation (Phase 3, Chunk 1)

Flow propagation uses direct algebraic relationships: Qp = Qf × r, Qc = Qf − Qp, CF = 1/(1−r). No iterative stage solving, no pressure-dependent flow correction, and no element-level solving are implemented at this stage.

No pressure propagation is implemented. Net driving pressure (NDP = ΔP − Δπ) requires feed pressure and osmotic pressure inputs which belong to Phase 3 Chunk 2.

No membrane transport is implemented. Water flux (Jw = A × NDP) and permeate quality depend on the membrane transport engine (Phase 4) which is not yet implemented. Recovery is currently a user-defined input, not a calculated output of the flux engine.

No concentration polarization correction is applied to flow calculations. The concentration factor CF = 1/(1−r) applies to bulk stream TDS only. Membrane-side concentration enhancement (β = exp(Jw/k)) belongs to Phase 4.

No flux calculations are implemented at this layer. Average flux (Jw), flux per element, and flux warnings belong to Phase 3 Chunk 3. Recovery limits are enforced by threshold checks only, not by flux-constrained simulation.

Multi-stage flow propagation assumes concentrate of stage N is the full feed of stage N+1 with no blending, bypass, or inter-stage pressure addition. This is a conservative single-pass algebraic model.

### Pressure propagation uses simplified algebraic model (Phase 3, Chunk 2)

Pressure propagation uses a direct algebraic model: Pout = Pin − ΔP. No hydraulic friction modeling, no Darcy-Weisbach correlations, no spacer drag models, and no CFD-style flow resistance are implemented. Pressure drop values are either user-supplied or estimated from element count using a fixed default (0.17 bar/element) which is a conservative engineering default, not a flux-dependent calculation.

No pump curves or pump head calculations are implemented. Feed pressure is a direct user input. Pump sizing, efficiency, and operating point curves belong to a future phase.

Pressure drop is not flow-dependent in this layer. In real RO systems ΔP varies with flux, spacer geometry, and element age. The current model uses fixed per-element or per-stage pressure drops as first-pass engineering estimates only.

No NDP (net driving pressure) is calculated in this chunk. NDP = ΔP − Δπ requires osmotic pressure (Phase 2 Chunk 5) and belongs to Phase 3 Chunk 3. Pressure results from this chunk feed directly into that calculation.

Outlet pressure is clamped to zero — the model does not propagate sub-atmospheric conditions or back-pressure effects.

No thermodynamic temperature correction

Membrane permeability temperature correction factors (TCF) are not yet applied. All calculations assume 25°C reference conditions.

### Concentration polarization uses simplified exponential film model (Phase 3, Chunk 5)

CP is calculated using the stagnant film model: CP = exp(Jw / k). This is a single-point, bulk-average approximation.

No CFD or spacer hydrodynamics. The mass transfer coefficient k is a fixed engineering input — it is not derived from Reynolds number, Sherwood number correlations, spacer geometry, or channel hydraulics. Real k values depend on cross-flow velocity, feed spacer mesh angle, channel height, and element age. The default k (2.0×10⁻⁵ m/s) is a conservative 8" spiral-wound engineering estimate at standard cross-flow velocity only.

No axial membrane profiling. CP and Cm are calculated at a single representative point per stage. In real elements, CP varies along the axial length — lowest at the inlet (highest cross-flow) and highest near the concentrate end (lowest cross-flow and highest local flux decline). Element-level axial CP profiling requires spatial integration and belongs to Phase 4.

No fouling or scaling coupling. Elevated CP increases the risk of CaCO₃, CaSO₄, and silica scaling at the membrane surface, but no precipitation equilibrium, Langelier index correction, or fouling resistance is modeled here. Scaling chemistry belongs to Phase 2 Chunk 7 (scaling indicators).

No temperature dependence on k. The mass transfer coefficient increases with temperature (higher diffusivity). All calculations assume 25°C reference conditions. Operating at elevated temperatures will produce conservative (over-estimated) CP values.

Multi-stage CP analysis treats stages independently. Bulk concentration per stage must be supplied externally (e.g. from flow/CF engine: Cb_stage = TDS_feed × CF). No automatic propagation of concentrate-to-feed concentration between stages is performed within this module.

### Flux calculations use deterministic single-point approximation (Phase 3, Chunk 4)

Flux is calculated as Jw = A × NDP using bulk feed-side NDP. This is a single-point approximation only.

No temperature correction is applied. Membrane permeability A is temperature-dependent (typically +3% per °C above 25°C via TCF). All flux calculations use A at reference temperature (25°C). Operating at non-reference temperatures will produce systematic estimation bias.

No concentration polarization correction is applied. In real RO systems the membrane-side concentration is higher than bulk feed concentration due to the concentration polarization layer (β = exp(Jw/k)). This increases the effective osmotic pressure at the membrane surface and reduces actual NDP and flux. Concentration polarization modeling belongs to Phase 4.

No fouling correction is applied. Membrane fouling (biofilm, scaling, colloidal fouling) reduces the effective permeability A over time. Fouling correction factors, MFI, SDI-based derating, and flux decline modeling are not implemented. All calculations assume clean membrane performance.

No salt passage or rejection calculation is performed in this layer. Solute flux (Js = B × ΔC) and permeate TDS are not calculated here. Salt passage belongs to Phase 4 (membrane transport engine).

No spatial flux profiling. Flux varies along the element train — highest at the inlet element and lowest at the concentrate end due to declining NDP as osmotic pressure increases along the vessel. This layer calculates a single representative average flux per stage only. Element-level flux profiling belongs to Phase 4.

No membrane aging or compaction modeling. Permeability A is treated as a fixed input. Long-term compaction, chemical degradation, and age-dependent performance changes are not modeled.

Multi-stage flux analysis assumes independent stages. No hydraulic or chemical coupling between stages is modeled at this layer. Osmotic pressure rise from stage to stage is not automatically propagated — each stage receives an independent NDP input.

### NDP calculations use deterministic single-point approximation (Phase 3, Chunk 3)

NDP is calculated as: NDP = (P_feed − P_permeate) − π_feed. This is a bulk feed-side approximation only.

No concentration polarization correction is applied. In real RO systems the membrane-side osmotic pressure is higher than bulk feed osmotic pressure due to concentration polarization (β = exp(Jw/k)). The actual effective NDP is therefore lower than what this layer calculates. Concentration polarization belongs to Phase 4 (membrane transport engine).

No permeate-side osmotic correction is applied. Permeate osmotic pressure (typically small, ~0.1–0.5 bar) is not subtracted from the driving force. This introduces a minor overestimate of NDP at typical rejections.

No membrane transport solving. Water flux (Jw = A × NDP) is not calculated in this layer. NDP is exposed as a standalone engineering quantity for feasibility analysis only. Flux calculations belong to Phase 4.

No iterative element-level solving. NDP is calculated at a single representative pressure point per stage (the outlet/concentrate pressure). In real systems NDP varies along the element train — it is highest at inlet and decreases toward the concentrate end. Element-level NDP profiling belongs to Phase 4.

Multi-stage osmotic pressure scaling uses CF × π_feed as a first-pass approximation. This assumes the osmotic pressure at each stage scales linearly with the concentration factor. This is a deterministic algebraic approximation and does not account for ion-specific rejection differences.

### Salt passage uses deterministic bulk rejection approximation only (Phase 3, Chunk 6)

Salt rejection and permeate quality are calculated using a simplified bulk equation: R = (1 − Cp/Cf) × 100. This is a single-point, bulk-average approximation.

No ion-specific rejection modeling. All dissolved species (Na⁺, Ca²⁺, Cl⁻, SO₄²⁻, etc.) are treated as a single lumped TDS value. In real RO systems, each ion has a different rejection coefficient driven by charge, hydrated radius, and diffusivity. The bulk approximation underestimates rejection of divalent ions and overestimates rejection of monovalent ions such as boron.

No temperature correction. Salt rejection is weakly temperature-dependent — at elevated temperatures, membrane permeability increases and salt diffusion rates rise, reducing rejection slightly. No temperature correction factor (TCF) is applied. All calculations assume 25°C reference conditions.

No fouling correction. Membrane fouling (biofilm, scaling, colloidal fouling) reduces effective rejection over time by increasing internal concentration polarization and membrane surface conductance. No age factor, fouling resistance, or MFI-based derating is applied.

No membrane aging or compaction modeling. The B-value (solute permeability) is treated as implicitly fixed in the rejection input. Long-term compaction, chemical degradation, and age-dependent rejection decline are not modeled.

No concentration polarization coupling at this layer. The permeate TDS is calculated from bulk feed TDS, not membrane surface concentration. In reality, CP increases the membrane-side concentration and worsens permeate quality compared to bulk calculations. CP coupling belongs to Phase 4.

Permeate conductivity uses a fixed empirical factor (0.55 µS/cm per mg/L TDS). This is a first-pass approximation for dilute, NaCl-dominated permeate streams. Permeates with unusual composition (e.g. high silica, high boron) may deviate from this factor.

Multi-stage concentrate rise uses simple CF = 1/(1−r) approximation. No ion-specific rejection differences, no precipitation of scaling species, and no ion-selective rejection are modeled across stages.

### Simulation orchestration is deterministic single-pass only (Phase 4, Chunk 1)

The simulation pipeline (`runSimulation`) executes all calculation engines in a fixed sequential order. Each step uses outputs from the previous step but no iterative feedback loop exists. The result represents a single algebraic pass through the system.

Recovery is a user-defined input per stage. In real RO design tools (e.g. standard design tools), recovery is a calculated output of the flux engine given a target permeate flow and element geometry. This platform treats recovery as a specified input and calculates flux from it — the inverse approach.

No convergence loop is implemented. Flux and osmotic pressure are not re-balanced iteratively. If flux drives osmotic pressure up significantly, NDP is not recalculated to reflect the new osmotic conditions. This belongs to Phase 5.

No transient simulation. All calculations assume steady-state operating conditions. No startup, shutdown, cleaning-in-place (CIP), or flux-decline-over-time dynamics are modeled.

No optimization engine. The pipeline runs a specified configuration forward — it does not search for optimal recovery, pressure, or staging ratios. Optimization belongs to a future phase.

No backend persistence. The simulation engine is a pure in-memory TypeScript function. It does not persist results to any database or external system. Persistence belongs to the backend layer.

Multi-stage CP and osmotic pressure scaling use deterministic CF-based approximations. Bulk concentration per stage is estimated as `TDS_feed × CF_stage`. This does not account for ion-selective rejection or precipitation losses between stages.

### Zustand integration uses synchronous full reruns (Phase 4, Chunk 2)

The simulation trigger (`simulation-trigger.ts`) performs a full deterministic rerun every time feed chemistry or RO config changes. There is no debouncing, throttling, or batching — every store update fires `runSimulation()` immediately and synchronously on the main thread.

This is intentional for Phase 4 Chunk 2 scope. For typical input sizes (1–4 stages, 13 ions) the engine runs in under 1ms. Debouncing should be added before the platform scales to high-frequency input (e.g. slider drag events) to avoid blocking React render cycles.

No incremental recalculation graph. The engine cannot skip unaffected calculation steps. Changing feed TDS reruns all 11 pipeline steps even if only chemistry is affected. A dependency-aware incremental runner belongs to a future chunk.

No async workers. All simulation work runs synchronously on the main JavaScript thread. For multi-pass systems or future element-level solving, a Web Worker offload will be required to prevent UI jank.

Feed pressure is currently a hardcoded default (10 bar) in `simulation-runner.ts`. This is a placeholder until the RO config store exposes a per-pass operating pressure field. Simulations will produce correct relative results but absolute pressure-dependent outputs (NDP, flux) assume BWRO mid-range conditions.

Per-stage recovery is evenly distributed across stages within a pass. The store holds a single pass-level recovery percentage; the runner splits it equally using the formula `r_stage = 1 − (1 − r_pass)^(1/n)`. Stage-level individual recovery inputs are not yet supported in the UI.

### UI binding uses synchronous reactive rendering only (Phase 4, Chunk 3)

All simulation outputs are bound to UI components via Zustand selectors. UI updates synchronously on every store mutation — there is no debouncing, throttling, or batching between user input and render.

No backend persistence. Simulation results exist only in-memory in the Zustand store. Refreshing the browser discards all results. Persistence belongs to a future backend phase.

No async workers. All simulation computation runs synchronously on the main JavaScript thread. For complex multi-pass configurations, this may introduce brief UI blocking during recalculation. Web Worker offload belongs to a future chunk.

No optimization engine. The UI bindings expose forward-simulation outputs (flux, NDP, recovery, permeate quality). No inverse solver or automated optimization of pressure, recovery, or staging ratios is implemented. Optimization belongs to a future phase.

Deterministic live rerender only. The current binding layer re-renders exactly when simulation output changes in the Zustand store. No speculative rendering, no incremental updates, and no partial result streaming are implemented.

### No CFD hydraulics

Feed spacer correlations, channel pressure drop models, and turbulence effects are not modeled. Hydraulics will use simplified Darcy-Weisbach approximations when implemented.

### No simulation convergence

No iterative solver exists yet. Element-level and stage-level solving will be implemented in Phase 4–6.

### Unit conversions are simplified

Flow conversions use a fixed density approximation. Concentration conversions assume dilute solutions (density ≈ 1 kg/L). These are valid for typical RO feed water but not for concentrated brines.

### Report engine uses linearized element-level approximation (Phase 4, Chunk 4)

Element-level flow data (`ElementFlowReport`) is derived by distributing stage-level flows evenly across vessels and elements using simple division. This is a linearized first-pass approximation. Real element-level profiles show a declining flux profile along the vessel (highest flux at element 1, lowest at element N) due to rising osmotic pressure and decreasing NDP. The report shows lead and tail elements only, scaled by fixed correction factors (±15% / ±30%) rather than numerically integrated axial profiles.

Full element-level solving with axial flux profiling belongs to Phase 5 (Membrane Transport Engine).

### Scaling analysis uses simplified saturation approximations (Phase 4, Chunk 4)

Scaling indicators (LSI, SDI, CaSO₄%, BaSO₄%, SiO₂%) are calculated using simplified empirical formulae and solubility product ratios. The Langelier Saturation Index is approximated from ionic strength and carbonate chemistry without full carbonate speciation. BaSO₄ saturation uses a simplified Ksp estimate. CaSO₄ and SiO₂ saturation use linear concentration factor scaling.

Full scaling analysis with PHREEQC-grade speciation, temperature-corrected Ksp values, and ion activity corrections belongs to a future phase.

### Specific energy and cost estimates are based on simplified pump power model (Phase 4, Chunk 4)

Specific energy is estimated as SE = P_feed / (η_pump × η_motor × recovery). This assumes a single high-pressure pump with fixed efficiency (80% pump, 95% motor). No energy recovery device (ERD/pressure exchanger), booster pump staging, or variable frequency drive (VFD) modeling is included. ERD efficiency can reduce specific energy for SWRO by 1.5–2.0 kWh/m³.

### Report pH correction is not yet implemented

The pH adjustment column in the solute analysis table shows feed pH for both raw and pH-adjusted columns. Full acid/base dosing chemistry with carbonate equilibrium recalculation belongs to Phase 5.
