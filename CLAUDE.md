```md
# Transfilm RO Design Studio — Project Context

## Overview

Transfilm is a high-fidelity industrial engineering SaaS platform for Reverse Osmosis (RO) system design, simulation, optimization, chemistry validation, and engineering report generation.

The platform is being rebuilt from a Vite React application into a scalable production-grade Next.js App Router application.

This application is NOT a generic SaaS dashboard.

It is an engineering-grade deterministic process design platform inspired by:

- Industrial water treatment software
- Process engineering systems
- RO simulation tools
- PFD / P&ID engineering applications

The platform must feel:

- industrial
- technical
- engineering-focused
- deterministic
- calculation-driven
- process-oriented

Avoid:

- startup dashboard aesthetics
- flashy animations
- excessive gradients
- glassmorphism
- fintech styling
- crypto dashboard visuals
- marketing UI patterns

---

# Current Project Status

The frontend architecture restructuring is COMPLETE.

The project now follows:

- feature-based architecture
- App Router route groups
- modular engineering domains
- Zustand domain stores
- centralized types
- scalable component organization

Current focus:

- backend engineering logic
- deterministic calculation engine
- chemistry engine
- flow/recovery engine
- validation system
- engineering simulation architecture

DO NOT introduce unnecessary architectural rewrites.

---

# Tech Stack

## Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Shadcn UI
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Recharts

## Backend (planned)

- MongoDB
- Mongoose
- Next.js Route Handlers

## Engineering Core

Planned deterministic calculation modules:

- chemistry engine
- membrane transport engine
- hydraulic engine
- validation engine
- reporting engine
- simulation engine

---

# Core Engineering Philosophy

Transfilm is NOT a probabilistic simulator.

It is a deterministic engineering calculation platform.

All outputs must:

- derive from explicit equations
- be traceable
- update reactively
- avoid black-box behavior

The platform follows:

- no calculate button philosophy
- reactive field updates
- dependency-driven recalculation
- engineering-grade transparency

Every input change should propagate through dependent calculations automatically.

---

# Folder Architecture

src/
├── app/
│ ├── (auth)/
│ ├── (dashboard)/
│ ├── (studio)/
│ └── api/
│
├── components/
│ ├── ui/
│ ├── layout/
│ ├── navigation/
│ └── engineering/
│
├── features/
│ ├── dashboard/
│ ├── project-profile/
│ ├── feed-setup/
│ ├── ro-config/
│ ├── system-design/
│ └── reporting/
│
├── core/
│ ├── chemistry/
│ ├── hydraulics/
│ ├── membrane/
│ ├── recovery/
│ ├── simulation/
│ └── validation/
│
├── store/
│
├── providers/
│
├── types/
│
├── schemas/
│
├── hooks/
│
├── services/
│
└── lib/

---

# Existing Zustand Stores

Current store architecture includes:

- project-store
- ui-store
- feed-store
- ro-config-store
- simulation-store
- report-store

Stores should remain:

- domain-specific
- lightweight
- scalable
- strictly typed

Avoid:

- overengineering
- excessive middleware
- giant global stores

---

# Engineering Calculation Scope

## CURRENT IMPLEMENTATION PRIORITY

Implement ONLY foundational engineering calculations first.

Priority order:

1. Charge balance calculations
2. TDS calculations
3. Conductivity estimation
4. Osmotic pressure
5. Recovery calculations
6. Flow propagation
7. Pressure propagation
8. Warning & validation system

DO NOT prematurely implement:

- advanced PHREEQC integration
- CFD-style hydraulics
- AI optimization
- advanced thermodynamic models
- dynamic spacer correlations
- boron transport
- advanced ion transport systems

The system should evolve incrementally.

---

# Chemistry Engine Requirements

The chemistry engine should support:

- ion normalization
- meq/L conversion
- charge balance calculations
- Na/Cl auto balancing
- conductivity estimation
- TDS cross-checking
- carbonate equilibrium
- osmotic pressure estimation
- scaling indicators
- pH dependency recalculation

Important:

Any chemistry-related input change must trigger dependent recalculations automatically.

---

# Engineering Equations

Core RO equations used by the platform include:

Water Flux:

Jw = A(ΔP − Δπ)

Solute Flux:

Js = B(Cm − Cp)

Osmotic Pressure:

π = iCRT

Concentration Polarization:

β = exp(Jw / k)

These equations form the foundation of the membrane transport engine.

---

# PFD / Process Flow Diagram Requirements

The PFD is one of the MOST IMPORTANT components.

The Process Flow Diagram must resemble:

- industrial RO engineering software
- membrane skid schematics
- process engineering tools
- simplified P&ID systems

NOT:

- infographic illustrations
- startup diagrams
- marketing graphics

## PFD Visual Rules

Use:

- industrial piping
- engineering flow direction
- instrumentation labels
- membrane vessel graphics
- realistic process hierarchy

### Flow Colors

- Feed = solid slate/gray
- Permeate = dashed blue
- Reject = dashed orange/red

### Instrumentation

Include engineering identifiers:

- P-101
- PI-101
- COND-201
- RO-101

### Equipment

Use:

- HP Pumps
- Booster Pumps
- Control Valves
- Conductivity Sensors
- Pressure Gauges

Prioritize:

1. process clarity
2. flow readability
3. engineering hierarchy
4. instrumentation visibility

---

# Design Language

## Visual Feel

The platform should resemble:

- industrial engineering software
- CAD-lite interfaces
- process simulation tools
- enterprise process systems

Avoid:

- oversized cards
- excessive whitespace
- decorative gradients
- playful styling
- consumer-app aesthetics

---

# Typography

Preferred fonts:

- Inter
- IBM Plex Mono

Use IBM Plex Mono for:

- engineering metrics
- labels
- instrumentation
- technical identifiers
- calculated outputs

---

# Reporting Philosophy

Reports should feel like:

- engineering documentation
- technical reports
- industrial deliverables

NOT:

- marketing reports
- SaaS analytics exports

Reports must support:

- process summaries
- chemistry analysis
- performance tables
- warnings
- system topology
- PFD inclusion
- export-ready formatting

---

# Code Quality Rules

Always:

- preserve responsiveness
- preserve calculations
- preserve engineering logic
- preserve deterministic behavior
- preserve scalability
- preserve TypeScript strictness

Prefer:

- reusable abstractions
- modular structure
- clean engineering naming
- maintainable architecture

Avoid:

- monolithic files
- unnecessary abstractions
- premature optimization
- breaking existing behavior

---

# IMPORTANT DEVELOPMENT RULES

When editing existing components:

- preserve business logic
- preserve store behavior
- preserve calculations
- preserve responsiveness
- preserve engineering workflows

If redesigning UI:

- modify visuals carefully
- DO NOT alter engineering logic

When implementing calculations:

- keep equations explicit
- keep logic traceable
- avoid hidden magic behavior
- prefer readability over cleverness

---

# Expected User Feeling

The product should immediately feel like:

- serious engineering software
- enterprise RO design tooling
- industrial process software
- membrane engineering platform

The user should think:

"This is real engineering software."
```
