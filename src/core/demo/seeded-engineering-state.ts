/**
 * Seeded Chennai SWRO demo state.
 *
 * Single source of truth for temporary engineering demo data.
 * All stores initialize from this state on studio mount.
 * Replace with real DB hydration once backend is integrated.
 *
 * Spec: 250 m³/h feed · 35 000 mg/L seawater · 42% recovery
 *       55.4 bar · 2 stages (42 + 21 vessels) · 7 els/vessel
 *       SW30HRLE-400i membrane
 */

import type { FeedChemistry, FeedPreset } from "@/store/feed-store";
import type { Pass } from "@/store/ro-config-store";
import type { ProjectMetadata } from "@/store/project-store";

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const SEEDED_FEED_PRESET: FeedPreset = "seawater";

export const SEEDED_FEED_STREAM_LABEL = "Feed-01";

export const SEEDED_FEED_CHEMISTRY: FeedChemistry = {
  ions: {
    ammonium: 0,
    sodium: 10800,
    potassium: 380,
    magnesium: 1290,
    calcium: 410,
    strontium: 8,
    barium: 0.05,
    carbonate: 0,
    bicarbonate: 140,
    nitrate: 0,
    fluoride: 1.3,
    chloride: 19400,
    bromide: 0,
    sulfate: 2700,
    phosphate: 0,
    silica: 2,
    boron: 5,
    co2: 0,
  },
  tds: 35000,
  conductivity: 53000,
  sdi: 2.5,
  turbidity: 0.08,
  ph: 8.1,
  temperature: 28,
};

// ─── Project ──────────────────────────────────────────────────────────────────

export const SEEDED_PROJECT: ProjectMetadata = {
  id: "demo-chennai-swro-001",
  name: "Chennai SWRO Plant — Demo",
  client: "SOL9X Demo Client",
  location: "Chennai, Tamil Nadu, India",
  description: "Seawater RO desalination — 250 m³/h feed — SW30HRLE-400i",
  status: "active",
  recovery: 42,
  createdAt: "2026-01-15T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
  notes: "Demo project — seeded state for development.",
};

// ─── RO Configuration ────────────────────────────────────────────────────────

export const SEEDED_FEED_FLOW = 250;
export const SEEDED_SYSTEM_RECOVERY = 42;
export const SEEDED_FEED_PRESSURE_BAR = 55.4;

function makeVessels(
  passIdx: number,
  stageIdx: number,
  count: number,
  elementsPerVessel: number
) {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${passIdx + 1}-s${stageIdx + 1}-v${i + 1}`,
    label: `V${i + 1}`,
    elementsPerVessel,
    membraneModel: "SW30HRLE-400i",
  }));
}

export const SEEDED_PASSES: Pass[] = [
  {
    id: "pass-1",
    label: "Pass 1",
    recovery: 42,
    stages: [
      {
        id: "stage-1",
        label: "Stage 1",
        vessels: makeVessels(0, 0, 42, 7),
      },
      {
        id: "stage-2",
        label: "Stage 2",
        vessels: makeVessels(0, 1, 21, 7),
      },
    ],
  },
];
