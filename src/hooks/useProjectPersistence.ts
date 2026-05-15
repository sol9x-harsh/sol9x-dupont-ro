'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/store/project-store';
import { useFeedStore, isTempHierarchyValid } from '@/store/feed-store';
import { useROConfigStore } from '@/store/ro-config-store';
import { useReportStore } from '@/store/report-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

/** Snapshot of all studio store state to send to the API. */
function buildPayload() {
  const { currentProject } = useProjectStore.getState();
  const { preset, waterType, chemistry, streamLabel, streams, activeStreamId } = useFeedStore.getState();
  const {
    passes,
    feedFlow,
    systemRecovery,
    feedPressureBar,
    permeatePressureBar,
    chemicalAdjustment,
  } = useROConfigStore.getState();
  const { selectedSections, climateMode, exportSettings } = useReportStore.getState();

  return {
    metadata: currentProject,
    feed: { preset, waterType, chemistry, streamLabel, streams, activeStreamId },
    roConfig: {
      passes,
      feedFlow,
      systemRecovery,
      feedPressureBar,
      permeatePressureBar,
      chemicalAdjustment,
    },
    report: { selectedSections, climateMode, exportSettings },
  };
}

function formatLocalTime(d: Date) {
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

const AUTOSAVE_DELAY_MS = 3000;
const DEMO_IDS = new Set(['demo', 'new-project', 'demo-chennai-swro-001']);

export function useProjectPersistence(projectId: string) {
  const queryClient = useQueryClient();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDemoProject = DEMO_IDS.has(projectId);

  // ── React Query mutation ──────────────────────────────────────────────────
  const saveMutation = useMutation<{ savedAt: string }, Error, void>({
    mutationKey: ['project-save', projectId],
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Save failed');
      }
      return res.json() as Promise<{ savedAt: string }>;
    },
    onMutate: () => {
      setIsDirty(false);
    },
    onSuccess: (data) => {
      // Display the timestamp returned by the server
      setSavedAt(formatLocalTime(new Date(data.savedAt)));
      // Refresh projects list so the dashboard shows current state
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      // Re-mark dirty so the next store change retriggers autosave
      setIsDirty(true);
    },
  });

  // ── Manual save ──────────────────────────────────────────────────────────
  const save = useCallback(() => {
    if (isDemoProject) return;
    if (!isTempHierarchyValid()) return; // blocked — invalid temperature hierarchy
    saveMutation.mutate();
  }, [isDemoProject, saveMutation]);

  // Stable ref so the subscription effect never stale-closes over save
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  // ── Auto-save: subscribe to store changes, debounce ──────────────────────
  useEffect(() => {
    if (isDemoProject) return;

    function markDirty() {
      setIsDirty(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (isTempHierarchyValid()) saveRef.current();
      }, AUTOSAVE_DELAY_MS);
    }

    const unsubs = [
      useFeedStore.subscribe(markDirty),
      useROConfigStore.subscribe(markDirty),
      useProjectStore.subscribe(markDirty),
      useReportStore.subscribe(markDirty),
    ];

    return () => {
      unsubs.forEach((u) => u());
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // Only re-subscribe when the project changes — not on every render
  }, [projectId, isDemoProject]);

  // ── Derived status ───────────────────────────────────────────────────────
  let status: SaveStatus = 'saved';
  if (saveMutation.isPending) status = 'saving';
  else if (saveMutation.isError) status = 'error';
  else if (isDirty) status = 'unsaved';

  return { status, savedAt, save };
}
