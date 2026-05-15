import { create } from "zustand";

export type ProjectStatus = "draft" | "active" | "completed" | "archived";

export interface ProjectMetadata {
  id: string;
  name: string;
  client: string;
  location: string;
  description: string;
  status: ProjectStatus;
  recovery: number;
  createdAt: string;
  updatedAt: string;
  notes: string;
  // Extended fields
  projectNo?: string;
  segment?: string;
  designer?: string;
  company?: string;
  state?: string;
  city?: string;
  currency?: string;
  exchangeRate?: string;
  unitSystem?: 'US' | 'METRIC' | 'USER';
  userUnits?: Record<string, 'US' | 'METRIC'>;
}

interface ProjectState {
  selectedProjectId: string | null;
  currentProject: ProjectMetadata | null;
  setSelectedProjectId: (id: string | null) => void;
  setCurrentProject: (project: ProjectMetadata | null) => void;
  updateProject: (project: Partial<ProjectMetadata>) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProjectId: null,
  currentProject: null,

  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  setCurrentProject: (project) =>
    set({ currentProject: project, selectedProjectId: project?.id ?? null }),

  updateProject: (data) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, ...data }
        : (data as ProjectMetadata),
    })),

  resetProject: () => set({ selectedProjectId: null, currentProject: null }),
}));
