'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { StudioShell, type Screen } from '@/components/layout/studio/StudioShell';
import { SystemDesignView }   from '@/features/system-design/SystemDesignView';
import { FeedSetupView }      from '@/features/feed-setup/FeedSetupView';
import { ROConfigView }       from '@/features/ro-config/ROConfigView';
import { ReportView }         from '@/features/reporting/ReportView';
import { ProjectProfileView } from '@/features/project-profile/ProjectProfileView';
import { useProjectStore }    from '@/store/project-store';
import { useFeedStore }       from '@/store/feed-store';
import { useROConfigStore }   from '@/store/ro-config-store';
import { useReportStore }     from '@/store/report-store';
import { ROLoader }           from '@/components/ui/loader';
import { useQuery }           from '@tanstack/react-query';
import { useProjectPersistence } from '@/hooks/useProjectPersistence';

interface Props {
  params: Promise<{ projectId: string }>;
}

export default function StudioPage({ params }: Props) {
  const { projectId } = use(params);
  const router = useRouter();

  const [activeScreen, setActiveScreen] = useState<Screen>('design');
  const [units, setUnits]               = useState<'SI' | 'US'>('SI');

  const { setCurrentProject, currentProject } = useProjectStore();
  const { hydrateFeed }     = useFeedStore();
  const { hydrateROConfig } = useROConfigStore();
  const { hydrateReport }   = useReportStore();

  // 1. Fetch all project data via React Query
  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to load project');
      return res.json();
    },
    // Don't refetch on window focus while in the studio to avoid losing local unsaved changes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // 2. Hydrate all stores when project data arrives
  useEffect(() => {
    if (project) {
      setCurrentProject(project.metadata);
      if (project.feed) hydrateFeed(project.feed);
      if (project.roConfig) hydrateROConfig(project.roConfig);
      if (project.report) hydrateReport(project.report);
    }
  }, [project, setCurrentProject, hydrateFeed, hydrateROConfig, hydrateReport]);

  // 3. Enable Autosave Persistence
  const { status, savedAt, save } = useProjectPersistence(projectId);

  // Handle errors
  if (isError) {
    router.replace('/projects');
    return null;
  }

  if (isLoading) return <ROLoader />;

  return (
    <StudioShell
      active={activeScreen}
      onChange={setActiveScreen}
      units={units}
      onUnits={setUnits}
      projectName={currentProject?.name ?? projectId}
      onSave={save}
      saveStatus={status}
      savedAt={savedAt}
    >
      {activeScreen === 'profile' && <ProjectProfileView />}
      {activeScreen === 'design'  && <SystemDesignView />}
      {activeScreen === 'feed'    && <FeedSetupView />}
      {activeScreen === 'config'  && <ROConfigView />}
      {activeScreen === 'report'  && <ReportView />}
    </StudioShell>
  );
}
