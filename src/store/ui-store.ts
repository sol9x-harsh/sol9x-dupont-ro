import { create } from "zustand";

export type ViewMode = "grid" | "list";
export type WorkspaceSection =
  | "project-profile"
  | "feed-setup"
  | "ro-config"
  | "system-design"
  | "report-center";

interface UIState {
  sidebarCollapsed: boolean;
  activeWorkspaceSection: WorkspaceSection;
  activeTab: string;
  viewMode: ViewMode;
  modals: Record<string, boolean>;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setActiveWorkspaceSection: (section: WorkspaceSection) => void;
  setActiveTab: (tab: string) => void;
  setViewMode: (mode: ViewMode) => void;
  openModal: (key: string) => void;
  closeModal: (key: string) => void;
  resetUI: () => void;
}

const defaultState = {
  sidebarCollapsed: false,
  activeWorkspaceSection: "project-profile" as WorkspaceSection,
  activeTab: "",
  viewMode: "grid" as ViewMode,
  modals: {},
};

export const useUIStore = create<UIState>((set) => ({
  ...defaultState,

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setActiveWorkspaceSection: (section) =>
    set({ activeWorkspaceSection: section }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setViewMode: (mode) => set({ viewMode: mode }),

  openModal: (key) =>
    set((state) => ({ modals: { ...state.modals, [key]: true } })),

  closeModal: (key) =>
    set((state) => ({ modals: { ...state.modals, [key]: false } })),

  resetUI: () => set(defaultState),
}));
