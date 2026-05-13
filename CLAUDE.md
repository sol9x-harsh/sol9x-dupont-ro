# SOL9X RO Design Studio — Project Context

## Overview

SOL9X is a high-fidelity industrial engineering SaaS platform for Reverse Osmosis (RO) system design, simulation, optimization, and reporting.

The platform is being rebuilt from a Vite React application into a scalable production-grade Next.js App Router application.

This application is NOT a generic SaaS dashboard.
It is an engineering-grade process design platform inspired by:

- DuPont WAVE
- Industrial water treatment software
- Process engineering systems
- PFD / P&ID engineering tools

The UI must feel:

- technical
- precise
- engineering-focused
- industrial
- data-dense but clean

Avoid:

- flashy startup aesthetics
- excessive gradients
- glassmorphism
- marketing-style UI

---

# Tech Stack

## Frontend

- Next.js App Router
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

---

# Architecture Principles

## Core Rules

- Maintain scalable architecture
- Keep strict TypeScript typing
- Use feature-based architecture
- Prefer reusable components
- Avoid prop drilling
- Use Zustand for shared state
- Preserve responsiveness
- Preserve engineering precision
- Avoid unnecessary abstractions

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
│ ├── project-profile/
│ ├── feed-setup/
│ ├── ro-config/
│ ├── system-design/
│ └── reporting/
│
├── services/
│ ├── calculations/
│ ├── chemistry/
│ ├── validation/
│ └── reporting/
│
├── store/
│
├── providers/
│
├── types/
│
├── hooks/
│
└── lib/

---

# Design Language

## Visual Style

The application should resemble:

- engineering software
- industrial control systems
- CAD-lite interfaces
- process simulation tools

NOT:

- crypto dashboards
- fintech UIs
- startup analytics apps

---

# Color System

Primary accent:

- Navy blue

Supporting accents:

- Slate
- Steel blue
- Cyan only when necessary

Avoid:

- Teal-heavy styling
- Neon colors
- Overly saturated palettes

---

# Typography

Preferred:

- Inter
- IBM Plex Mono

Use IBM Plex Mono for:

- engineering labels
- metrics
- process identifiers
- instrumentation labels

---

# Engineering UX Principles

Prioritize:

1. Readability
2. Data hierarchy
3. Process clarity
4. Technical density
5. Minimal cognitive load

Avoid:

- excessive whitespace
- oversized cards
- oversized typography
- decorative elements

---

# Application Modules

## 1. Authentication

Includes:

- Login
- Signup
- Forgot Password

Features:

- Email/password auth
- Social auth placeholders
- Workspace-aware login

---

# 2. Projects Dashboard

Purpose:
Centralized project management system.

Features:

- Grid/List toggle
- Search
- Filters
- Status badges
- Folder hierarchy
- Project metadata

Project cards include:

- Project Name
- Client
- Recovery %
- Status
- Last updated

---

# 3. Studio Workspace

Main engineering workspace.

Core sections:

- Project Profile
- Feed Setup
- RO Configuration
- System Architecture
- Report Center

---

# 4. Feed Setup

Purpose:
Define detailed feed water chemistry.

Features:

- Water presets
- Ion composition
- Stream configuration
- Live analytics
- Charge balance calculations
- TOC rejection
- Constraints validation

Includes:

- Cations
- Anions
- Neutrals
- TDS
- Conductivity
- SDI
- Scaling indicators

---

# 5. RO Configuration

Purpose:
Configure actual RO system architecture.

Features:

- Pass management
- Stage management
- Vessel configuration
- Flow calculator
- Chemical adjustment
- Recovery calculations

---

# 6. Process Flow Diagram (VERY IMPORTANT)

The PFD is one of the most critical components.

## PFD Style Requirements

The Process Flow Diagram must look like:

- real industrial RO engineering software
- process engineering diagrams
- simplified P&ID systems
- membrane skid schematics

NOT:

- SaaS infographics
- dashboard illustrations

## PFD Requirements

Use:

- industrial piping
- technical labels
- equipment symbols
- membrane train visuals
- engineering flow hierarchy

### Flow Colors

- Feed = solid gray/slate
- Permeate = dashed blue
- Reject = dashed orange/red

### Include Symbols

- HP Pump
- Booster Pump
- Conductivity Sensor
- Pressure Gauge
- Control Valve

### Labels

Use engineering naming:

- P-101
- RO-101
- COND-201
- PI-101

### Visual Hierarchy

Prioritize:

1. Process flow
2. Equipment
3. Instrumentation
4. Permeate
5. Reject

---

# 7. Reporting Center

Purpose:
Generate engineering-grade reports.

Features:

- PDF export
- Print mode
- Climate scenarios
- Performance tables
- Economic breakdown
- Chemical analysis

Report style:

- clean
- professional
- engineering documentation style

Avoid:

- marketing report aesthetics

---

# State Management

Use Zustand stores.

Examples:

- useProjectStore
- useFeedStore
- useROConfigStore
- useReportStore

Avoid:

- deeply nested prop drilling
- overly global state

---

# Code Quality Rules

Always:

- preserve functionality
- preserve responsiveness
- preserve dynamic rendering
- preserve calculations

Prefer:

- reusable abstractions
- modular architecture
- clean naming
- maintainable structure

Avoid:

- premature optimization
- unnecessary patterns
- giant monolithic files

---

# When Editing Existing Components

IMPORTANT:

- Preserve business logic
- Preserve calculations
- Preserve props
- Preserve responsiveness
- Modify visuals carefully
- Avoid breaking existing behavior

If redesigning:

- change visual system only
- not engineering logic

---

# Expected Engineering Feel

The product should feel like:

- software used by process engineers
- industrial RO simulation software
- enterprise engineering tooling

The user should immediately feel:
"This is serious engineering software."

---
