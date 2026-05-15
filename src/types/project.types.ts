export type ProjectStatus = 'Verified' | 'Draft';

export type ViewMode = 'grid' | 'list';

export interface Project {
  id: string;
  name: string;
  client: string;
  projectNo: string;
  status: ProjectStatus;
  updated: string;
  hot: boolean;
  folder: string;
}
