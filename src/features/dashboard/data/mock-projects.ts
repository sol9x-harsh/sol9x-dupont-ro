import type { Project } from '@/types/project.types';

export const PROJECTS: Project[] = [
  {
    id: 'sol-24-001',
    name: 'Chennai SWRO Desalination - Phase II',
    client: 'Tata Projects Ltd.',
    projectNo: 'SOL-24-001',
    status: 'Verified',
    updated: '2 min ago',
    hot: true,
    folder: 'Seawater',
  },
  {
    id: 'sol-24-002',
    name: 'Jamnagar Brackish Water RO Plant',
    client: 'Reliance Industries',
    projectNo: 'SOL-24-002',
    status: 'Draft',
    updated: '1 h ago',
    hot: false,
    folder: 'Brackish',
  },
  {
    id: 'sol-24-006',
    name: 'Dahej Industrial Effluent Plant',
    client: 'GIDC',
    projectNo: 'SOL-24-006',
    status: 'Verified',
    updated: '1 day ago',
    hot: false,
    folder: 'Waste Water',
  },
  {
    id: 'sol-24-003',
    name: 'Vizag Port Desalination Unit',
    client: 'Adani Ports',
    projectNo: 'SOL-24-003',
    status: 'Verified',
    updated: '5 min ago',
    hot: true,
    folder: 'Seawater',
  },
];

export const FOLDERS: string[] = ['Seawater', 'Brackish', 'Waste Water'];

export function projectsInFolder(folder: string): number {
  return PROJECTS.filter((p) => p.folder === folder).length;
}
