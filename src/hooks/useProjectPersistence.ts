'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useProjectStore } from '@/store/project-store';
import { useFeedStore } from '@/store/feed-store';
import { useROConfigStore } from '@/store/ro-config-store';
import { useReportStore } from '@/store/report-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

function buildPayload() {
  const { currentProject } = useProjectStore.getState();
  const { preset, chemistry, streamLabel } = useFeedStore.getState();
  const { passes, feedFlow, systemRecovery, feedPressureBar, permeatePressureBar, chemicalAdjustment } =
    useROConfigStore.getState();
  const { selectedSections, climateMode, exportSettings } = useReportStore.getState();

  return {
    metadata: currentProject,
    feed: { preset, chemistry, streamLabel },
    roConfig: { passes, feedFlow, systemRecovery, feedPressureBar, permeatePressureBar, chemicalAdjustment },
    report: { selectedSections, climateMode, exportSettings },
  };
}

function formatLocalTime(d: Date) {
  return d.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
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

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isDemoProject) return null;
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error('Save failed');
      return res.json();
    },
    onMutate: () => {
      setIsDirty(false); // Reset dirty flag when save starts
    },
    onSuccess: () => {
      setSavedAt(formatLocalTime(new Date()));
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const save = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);

  // Autosave: subscribe to all store changes, debounce at AUTOSAVE_DELAY_MS
  useEffect(() => {
    if (isDemoProject) return;

    function markDirty() {
      setIsDirty(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(save, AUTOSAVE_DELAY_MS);
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
  }, [projectId, isDemoProject, save]);

  // Determine user-facing status
  let status: SaveStatus = 'saved';
  if (saveMutation.isPending) status = 'saving';
  else if (saveMutation.isError) status = 'error';
  else if (isDirty) status = 'unsaved';

  return { status, savedAt, save };
}
