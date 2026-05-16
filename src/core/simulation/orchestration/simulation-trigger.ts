/**
 * Simulation trigger — reactive recalculation orchestration.
 *
 * Subscribes to Zustand store changes and triggers deterministic
 * reruns when engineering-relevant state changes.
 *
 * Design rules:
 * - No debouncing (Phase 4 Chunk 2 scope — add in a future chunk)
 * - No workers (future chunk)
 * - Full deterministic rerun per update (no incremental graph)
 * - Subscriptions are tear-down-safe (returns unsubscribe functions)
 *
 * Usage (call once at app startup, e.g. in a provider):
 *   const unsubscribe = initSimulationTriggers();
 *   // on unmount: unsubscribe();
 */

import { useFeedStore, isTempHierarchyValid } from '@/store/feed-store';
import { useROConfigStore } from '@/store/ro-config-store';
import { runSimulation } from '@/store/simulation/simulation-actions';

type UnsubscribeFn = () => void;

// ─── Dependency snapshots ─────────────────────────────────────────────────────
// We compare shallow snapshots to avoid triggering on unrelated store updates.

type FeedSnapshot = {
  ions: string; // JSON-stringified for stable comparison
  tds: number;
  conductivity: number;
  designTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  activeTemperatureView: string;
  ph: number;
};

type ROConfigSnapshot = {
  feedFlow: number;
  systemRecovery: number;
  feedPressureBar: number;
  permeatePressureBar: number;
  passCount: number;
  chemicalAdjustment: string;
  bypassSignature: string;
  stageSignature: string; // JSON-encoded pass/stage topology + per-stage pressure drops
};

function snapshotFeed(): FeedSnapshot {
  const { chemistry, activeTemperatureView } = useFeedStore.getState();
  return {
    ions: JSON.stringify(chemistry.ions),
    tds: chemistry.tds,
    conductivity: chemistry.conductivity,
    designTemperature: chemistry.designTemperature,
    minTemperature: chemistry.minTemperature,
    maxTemperature: chemistry.maxTemperature,
    activeTemperatureView,
    ph: chemistry.ph,
  };
}

function snapshotROConfig(): ROConfigSnapshot {
  const {
    feedFlow,
    systemRecovery,
    feedPressureBar,
    permeatePressureBar,
    passes,
    chemicalAdjustment,
    passOptimizationMode,
    bypassMode,
    bypassValue,
  } = useROConfigStore.getState();
  return {
    feedFlow,
    systemRecovery,
    feedPressureBar,
    permeatePressureBar,
    passCount: passes.length,
    chemicalAdjustment: JSON.stringify(chemicalAdjustment),
    bypassSignature: `${passOptimizationMode}-${bypassMode}-${bypassValue}`,
    stageSignature: JSON.stringify(
      passes.map((p) => ({
        id: p.id,
        recovery: p.recovery,
        stages: p.stages.map((s) => ({
          id: s.id,
          pressureDropBar: s.pressureDropBar,
          vessels: s.vessels.map((v) => ({
            id: v.id,
            elements: v.elementsPerVessel,
            membrane: v.membraneModel,
          })),
        })),
      })),
    ),
  };
}

function snapshotsEqual<T extends Record<string, unknown>>(
  a: T,
  b: T,
): boolean {
  for (const key in a) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

// ─── Trigger logic ────────────────────────────────────────────────────────────

/**
 * Initialise reactive simulation triggers.
 *
 * Returns a cleanup function. Call it to stop all subscriptions
 * (e.g. when the Studio layout unmounts).
 */
export function initSimulationTriggers(): UnsubscribeFn {
  let lastFeed = snapshotFeed();
  let lastROConfig = snapshotROConfig();

  const unsubFeed = useFeedStore.subscribe(() => {
    const next = snapshotFeed();
    if (!snapshotsEqual(next, lastFeed)) {
      lastFeed = next;
      if (!isTempHierarchyValid()) return; // skip — invalid temp hierarchy
      runSimulation();
    }
  });

  const unsubROConfig = useROConfigStore.subscribe(() => {
    const next = snapshotROConfig();
    if (!snapshotsEqual(next, lastROConfig)) {
      lastROConfig = next;
      runSimulation();
    }
  });

  return () => {
    unsubFeed();
    unsubROConfig();
  };
}

/**
 * Manually trigger a simulation rerun.
 * Use this after programmatic store mutations that bypass the subscriber.
 */
export function triggerSimulation(): void {
  runSimulation();
}
