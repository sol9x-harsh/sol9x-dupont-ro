'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Droplets,
  MoreHorizontal,
  Clock,
  LogOut,
  LayoutGrid,
  List,
  FolderPlus,
  Folder,
  FolderOpen,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import type { ViewMode } from '@/types/project.types';
import { CreateProjectModal } from '@/features/dashboard/modals/CreateProjectModal';
import { STATUS } from '@/features/dashboard/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ChevronRight, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { ProjectsGridSkeleton, FolderSkeleton } from '@/features/dashboard/components/ProjectSkeleton';
import { SignoutModal } from '@/components/shared/modals/SignoutModal';

interface DashboardProject {
  id: string;
  name: string;
  client: string;
  projectNo: string;
  status: 'Verified' | 'Draft';
  updated: string;
  hot: boolean;
  folder: string;
}

interface DashboardFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export default function ProjectsView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();

  // Instant fallback for unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);



  const [openCreate, setOpenCreate] = useState(false);

  const [openFolder, setOpenFolder] = useState(false);
  const [showSignout, setShowSignout] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderColor, setFolderColor] = useState('hsl(215,55%,40%)');
  const [folderDescription, setFolderDescription] = useState('');

  // Project Rename states
  const [renamingProject, setRenamingProject] =
    useState<DashboardProject | null>(null);
  const [newName, setNewName] = useState('');

  // Deletion states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<DashboardFolder | null>(
    null,
  );

  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);

  // Queries
  const { data: projectsData, isLoading: loadingProjects, isPlaceholderData: isProjectsPlaceholder } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });

  const { data: foldersData, isLoading: loadingFolders } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const res = await fetch('/api/folders');
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    staleTime: 60000,
    placeholderData: keepPreviousData,
  });

  const projects = projectsData?.projects ?? [];
  const folders = foldersData?.folders ?? [];

  // Mutations
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);
      queryClient.setQueryData(['projects'], (old: any) => ({
        ...old,
        projects: old.projects.filter((p: any) => p.id !== id),
      }));
      return { previousProjects };
    },
    onSuccess: () => {
      toast.success('Project deleted successfully');
      setDeletingId(null);
    },
    onError: (err, id, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast.error('Failed to delete project');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = isEditingFolder ? 'PATCH' : 'POST';
      const url = isEditingFolder
        ? `/api/folders/${editingFolderId}`
        : '/api/folders';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save folder');
      return res.json();
    },
    onMutate: async (newFolder) => {
      await queryClient.cancelQueries({ queryKey: ['folders'] });
      const previousFolders = queryClient.getQueryData(['folders']);
      if (!isEditingFolder) {
        queryClient.setQueryData(['folders'], (old: any) => ({
          ...old,
          folders: [...(old?.folders ?? []), { ...newFolder, id: 'temp-' + Date.now() }],
        }));
      }
      return { previousFolders };
    },
    onSuccess: () => {
      toast.success(isEditingFolder ? 'Folder updated' : 'Folder created');
      setOpenFolder(false);
      resetFolderState();
    },
    onError: (err: any, variables, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(['folders'], context.previousFolders);
      }
      toast.error(err.message || 'Failed to save folder');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folder: DashboardFolder) => {
      if (folder.id === 'virtual') return { virtual: true, name: folder.name };
      const res = await fetch(`/api/folders/${folder.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete folder');
      return res.json();
    },
    onMutate: async (folder) => {
      await queryClient.cancelQueries({ queryKey: ['folders'] });
      const previousFolders = queryClient.getQueryData(['folders']);
      queryClient.setQueryData(['folders'], (old: any) => ({
        ...old,
        folders: old?.folders?.filter((f: any) => f.id !== folder.id) ?? [],
      }));
      return { previousFolders };
    },
    onSuccess: () => {
      toast.success('Folder removed');
      setFolderToDelete(null);
      if (currentFolder === folderToDelete?.name) setCurrentFolder(null);
    },
    onError: (err, folder, context) => {
      if (context?.previousFolders) {
        queryClient.setQueryData(['folders'], context.previousFolders);
      }
      toast.error('Failed to delete folder');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const renameProjectMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: { name } }),
      });
      if (!res.ok) throw new Error('Failed to rename project');
      return res.json();
    },
    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      const previousProjects = queryClient.getQueryData(['projects']);
      queryClient.setQueryData(['projects'], (old: any) => ({
        ...old,
        projects: old.projects.map((p: any) =>
          p.id === id ? { ...p, name } : p
        ),
      }));
      return { previousProjects };
    },
    onSuccess: () => {
      toast.success('Project renamed');
      setRenamingProject(null);
      setNewName('');
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      toast.error('Failed to rename project');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const resetFolderState = () => {
    setFolderName('');
    setFolderDescription('');
    setFolderColor('hsl(215,55%,40%)');
    setIsEditingFolder(false);
    setEditingFolderId(null);
  };

  const handleCreateFolder = () => {
    createFolderMutation.mutate({
      name: folderName.trim(),
      description: folderDescription,
      color: folderColor,
    });
  };

  const openEditFolder = (f: DashboardFolder) => {
    setFolderName(f.name);
    setFolderDescription(f.description || '');
    setFolderColor(f.color || 'hsl(215,55%,40%)');
    setEditingFolderId(f.id);
    setIsEditingFolder(true);
    setOpenFolder(true);
  };

  const allFolderNames = useMemo(() => [
    ...new Set([
      ...folders.map((f: DashboardFolder) => f.name),
      ...projects.map((p: DashboardProject) => p.folder).filter(Boolean),
    ]),
  ], [folders, projects]);

  const projectsInFolder = (folderName: string) =>
    projects.filter((p: DashboardProject) => p.folder === folderName).length;

  const filtered = useMemo(() => projects.filter((p: DashboardProject) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = currentFolder
      ? p.folder === currentFolder
      : activeFolder
        ? p.folder === activeFolder
        : true;
    return matchesSearch && matchesFolder;
  }), [projects, search, currentFolder, activeFolder]);

  // Prevent "sneak peek" render while session is checking or unauthenticated
  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  return (
    <div
      className='min-h-screen'
      style={{
        background:
          'linear-gradient(180deg, hsl(215,25%,97%) 0%, hsl(210,20%,95%) 100%)',
      }}
    >
      <CreateProjectModal
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreate={(id) => router.push(`/studio/${id}`)}
      />

      {/* ── Create/Edit Folder Dialog ── */}
      <Dialog open={openFolder} onOpenChange={setOpenFolder}>
        <DialogContent className='max-w-md p-0 overflow-hidden'>
          {/* Gradient header */}
          <div
            className='px-6 pt-6 pb-5'
            style={{
              background:
                'linear-gradient(135deg, hsl(215,50%,95%), hsl(210,45%,92%))',
            }}
          >
            <div className='flex items-center gap-3 mb-3'>
              <div
                className='w-10 h-10 rounded-xl flex items-center justify-center shadow-md'
                style={{
                  background:
                    'linear-gradient(135deg, hsl(215,55%,30%), hsl(210,50%,42%))',
                  boxShadow: '0 4px 12px hsl(215,55%,30%,0.25)',
                }}
              >
                <FolderPlus className='w-5 h-5 text-white' />
              </div>
              <div>
                <DialogTitle className='font-display text-lg'>
                  {isEditingFolder ? 'Edit Folder' : 'Create Folder'}
                </DialogTitle>
                <DialogDescription className='text-[12px] text-muted-foreground mt-0.5'>
                  {isEditingFolder
                    ? 'Update folder details and color'
                    : 'Organize your RO design projects'}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className='px-6 py-5 space-y-5'>
            {/* Folder Name */}
            <div>
              <label className='text-[11px] uppercase tracking-widest text-muted-foreground font-bold block mb-2'>
                <span className='text-destructive mr-0.5'>*</span> Folder Name
              </label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder='e.g. Middle East Projects'
                className='h-10 text-sm border-border/80 focus-visible:ring-[hsl(215,55%,45%)]/30'
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className='text-[11px] uppercase tracking-widest text-muted-foreground font-bold block mb-2'>
                Description{' '}
                <span className='text-muted-foreground/50 normal-case tracking-normal'>
                  (optional)
                </span>
              </label>
              <textarea
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                placeholder='Brief description of this folder...'
                className='w-full h-16 min-h-16 rounded-lg border border-border/80 bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(215,55%,45%)]/20 focus-visible:border-[hsl(215,55%,45%)]/40 transition-all placeholder:text-muted-foreground/75'
              />
            </div>

            {/* Color Selector */}
            <div>
              <label className='text-[11px] uppercase tracking-widest text-muted-foreground font-bold block mb-2'>
                Folder Color
              </label>
              <div className='flex items-center gap-2'>
                {[
                  'hsl(215,55%,40%)',
                  'hsl(200,55%,45%)',
                  'hsl(160,45%,42%)',
                  'hsl(45,65%,50%)',
                  'hsl(25,65%,50%)',
                  'hsl(340,55%,50%)',
                  'hsl(280,45%,50%)',
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setFolderColor(c)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                      folderColor === c
                        ? 'border-foreground/40 ring-2 ring-[hsl(215,55%,45%)]/20 scale-110'
                        : 'border-transparent hover:border-border'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border/40 bg-muted/20'>
            <Button
              variant='ghost'
              onClick={() => {
                setOpenFolder(false);
                resetFolderState();
              }}
              className='h-9 px-4 text-[13px] font-medium'
            >
              Cancel
            </Button>
            <Button
              disabled={!folderName.trim() || createFolderMutation.isPending}
              onClick={handleCreateFolder}
              className='h-9 px-5 gap-2 text-[13px] font-semibold transition-all hover:opacity-90'
              style={{
                background:
                  'linear-gradient(135deg, hsl(215,55%,30%), hsl(210,50%,42%))',
                boxShadow: '0 4px 16px -4px hsl(215,55%,30%/0.4)',
                color: 'white',
              }}
            >
              <FolderPlus className='w-3.5 h-3.5' />
              {isEditingFolder ? 'Save Changes' : 'Create Folder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Top Nav ── */}
      <header
        className='h-[64px] border-b bg-white/80 backdrop-blur-xl sticky top-0 z-20'
        style={{ borderColor: 'hsl(215,20%,90%)' }}
      >
        <div className='max-w-[1440px] mx-auto px-6 lg:px-8 flex items-center h-full w-full gap-4'>
          <div className='flex items-center gap-2.5'>
            <div
              className='w-9 h-9 rounded-xl flex items-center justify-center shadow-md'
              style={{
                background:
                  'linear-gradient(135deg, hsl(215,55%,30%), hsl(210,50%,42%))',
                boxShadow: '0 4px 12px hsl(215,55%,30%,0.25)',
              }}
            >
              <span className='font-display font-bold text-white text-[11px]'>
                TM
              </span>
            </div>
            <div>
              <div className='font-display font-semibold text-foreground text-[13px] tracking-wide leading-none'>
                TRANSFILM
              </div>
              <div className='text-[8px] uppercase tracking-[0.2em] text-muted-foreground font-medium leading-none mt-0.5'>
                RO Design Studio
              </div>
            </div>
          </div>

          <div className='ml-auto flex items-center gap-2.5'>
            <div
              className='w-8 h-8 rounded-lg border border-border/80 flex items-center justify-center text-[11px] font-bold text-foreground cursor-pointer hover:ring-2 hover:ring-[hsl(215,55%,35%)]/20 transition-all'
              style={{
                background:
                  'linear-gradient(135deg, hsl(215,55%,35%,0.12), hsl(210,50%,42%,0.12))',
              }}
              title={session?.user?.email ?? ''}
            >
              {(session?.user?.name ?? session?.user?.email ?? 'U')
                .split(' ')
                .map((w: string) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <button
              onClick={() => setShowSignout(true)}
              className='w-8 h-8 rounded-lg border border-border/80 bg-card flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all group'
              title='Sign out'
            >
              <LogOut className='w-3.5 h-3.5 group-hover:scale-110 transition-transform' />
            </button>
          </div>
        </div>
      </header>

      <div className='max-w-[1440px] mx-auto px-6 lg:px-8 py-8'>
        {/* ── Page Header ── */}
        <div className='flex items-center justify-between gap-6 mb-5'>
          <div>
            {/* Breadcrumb */}
            <div className='flex items-center gap-2 mb-2 flex-wrap'>
              <button
                onClick={() => {
                  setCurrentFolder(null);
                  setActiveFolder(null);
                }}
                className='text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground hover:text-foreground transition-colors'
              >
                Workspace
              </button>
              <ChevronRightIcon />
              <button
                onClick={() => {
                  setCurrentFolder(null);
                  setActiveFolder(null);
                }}
                className={`text-[10px] uppercase tracking-[0.2em] font-semibold transition-colors ${
                  currentFolder
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-[hsl(215,55%,38%)]'
                }`}
              >
                Projects
              </button>
              {currentFolder && (
                <>
                  <ChevronRightIcon />
                  <span className='text-[10px] uppercase tracking-[0.2em] font-semibold text-[hsl(215,55%,38%)] flex items-center gap-1'>
                    <FolderOpen className='w-3 h-3' /> {currentFolder}
                  </span>
                </>
              )}
            </div>
            <div className='flex items-center gap-3'>
              {currentFolder && (
                <button
                  onClick={() => setCurrentFolder(null)}
                  className='w-8 h-8 rounded-xl border border-border/80 bg-card hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shrink-0'
                  aria-label='Go back'
                >
                  <ArrowLeft className='w-4 h-4' />
                </button>
              )}
              <h1 className='font-display text-[32px] font-semibold tracking-tight text-foreground leading-none'>
                {currentFolder ?? 'Your Projects'}
              </h1>
            </div>
            <p className='text-[14px] text-muted-foreground mt-2 max-w-2xl'>
              {currentFolder ? (
                <>
                  {folders.find(
                    (f: DashboardFolder) => f.name === currentFolder,
                  )?.description && (
                    <span className='block mb-1 text-foreground/80'>
                      {
                        folders.find(
                          (f: DashboardFolder) => f.name === currentFolder,
                        )?.description
                      }
                    </span>
                  )}
                  <span className='text-[12px] opacity-80'>
                    {projectsInFolder(currentFolder)} project
                    {projectsInFolder(currentFolder) !== 1 ? 's' : ''} in this
                    folder
                  </span>
                </>
              ) : (
                'All RO design jobs across your engineering team.'
              )}
            </p>
          </div>

          <div className='flex items-center gap-2.5 shrink-0'>
            <div className='relative'>
              <Search className='w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search projects...'
                className='pl-9 h-9 w-[220px] text-[13px] bg-card border-border/80 rounded-xl'
              />
            </div>
            {!loadingProjects && (
              <>
                <Button
                  variant='outline'
                  onClick={() => setOpenFolder(true)}
                  className='h-9 gap-2 text-[13px] font-semibold border-border/80 hover:border-[hsl(215,55%,38%)]/50 hover:text-[hsl(215,55%,38%)] transition-all'
                >
                  <FolderPlus className='w-4 h-4' />
                  New Folder
                </Button>
                <Button
                  onClick={() => setOpenCreate(true)}
                  className='h-9 gap-2 text-[13px] font-semibold transition-all hover:opacity-90'
                  style={{
                    background:
                      'linear-gradient(135deg, hsl(215,55%,30%), hsl(210,50%,42%))',
                    boxShadow: '0 4px 16px -4px hsl(215,55%,30%/0.4)',
                    color: 'white',
                  }}
                >
                  <Plus className='w-4 h-4' />
                  New Project
                </Button>
              </>
            )}
            <div className='w-px h-5 bg-border/60' />
            <div className='flex items-center gap-0.5 bg-muted/80 rounded-lg p-0.5 border border-border/40'>
              {(
                [
                  ['grid', LayoutGrid],
                  ['list', List],
                ] as const
              ).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                    viewMode === mode
                      ? 'bg-card shadow-sm text-foreground ring-1 ring-border/50'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className='w-3.5 h-3.5' />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className='flex items-center gap-3 mb-7 pb-5 border-b border-border/30'>
          <div className='flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground'>
            <span className='text-foreground font-semibold text-[13px]'>{projects.length}</span>
            <span>projects</span>
          </div>
          <span className='w-px h-3 bg-border' />
          <div className='flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground'>
            <span className='text-foreground font-semibold text-[13px]'>{allFolderNames.length}</span>
            <span>folders</span>
          </div>
          {currentFolder && (
            <>
              <span className='w-px h-3 bg-border' />
              <div className='flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground'>
                <FolderOpen className='w-3 h-3' />
                <span className='text-[hsl(215,55%,38%)] font-semibold'>{currentFolder}</span>
              </div>
            </>
          )}
          {search && filtered.length > 0 && (
            <>
              <span className='w-px h-3 bg-border' />
              <span className='text-[11px] font-mono text-muted-foreground'>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
              </span>
            </>
          )}
        </div>

        {/* ── Folders Section (root only) ── */}
        {!currentFolder && (
          <div className='mb-8'>
            <div className='flex items-center gap-2 mb-3'>
              <Folder className='w-3.5 h-3.5 text-muted-foreground/80' />
              <span className='text-[11px] uppercase tracking-[0.15em] font-bold text-muted-foreground'>
                Folders
              </span>
              <span className='ml-1 text-[10px] font-mono bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50'>
                {allFolderNames.length}
              </span>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
              {loadingFolders && !foldersData && (
                <>
                  <FolderSkeleton />
                  <FolderSkeleton />
                  <FolderSkeleton />
                </>
              )}
              {allFolderNames.map((fn) => {
                const count = projectsInFolder(fn);
                const folderData = folders.find(
                  (f: DashboardFolder) => f.name === fn,
                );
                return (
                  <div
                    key={fn}
                    onClick={() => {
                      setCurrentFolder(fn);
                      setActiveFolder(null);
                    }}
                    className='group relative flex flex-col items-start gap-2 p-3.5 rounded-xl border border-border bg-card hover:border-[hsl(215,55%,38%)]/40 hover:shadow-lg hover:shadow-[hsl(215,55%,38%)]/10 transition-all duration-300 text-left cursor-pointer'
                  >
                    <div className='absolute top-2.5 right-2.5 z-10'>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className='w-8 h-8 rounded-lg hover:bg-muted bg-card/40 backdrop-blur-sm border border-border/20 flex items-center justify-center text-muted-foreground transition-all shadow-sm'>
                            <MoreHorizontal className='w-4 h-4' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-40'>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              if (folderData) {
                                openEditFolder(folderData);
                              } else {
                                // For folders not in DB, open create with this name
                                setFolderName(fn);
                                setFolderColor('hsl(215,55%,40%)');
                                setIsEditingFolder(false);
                                setOpenFolder(true);
                              }
                            }}
                          >
                            <Edit2 className='mr-2 h-4 w-4' />
                            {folderData ? 'Edit Folder' : 'Save Folder Info'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              if (folderData) {
                                setFolderToDelete(folderData);
                              } else {
                                // For virtual folders, treat as delete by name
                                setFolderToDelete({ id: 'virtual', name: fn });
                              }
                            }}
                            className='text-destructive focus:text-destructive'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete Folder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div
                      className='w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm'
                      style={{
                        background: folderData?.color
                          ? `${folderData.color}15`
                          : 'linear-gradient(135deg, hsl(215,50%,94%), hsl(210,60%,94%))',
                      }}
                    >
                      <Folder
                        className='w-5 h-5'
                        style={{
                          color: folderData?.color || 'hsl(215,55%,38%)',
                        }}
                      />
                    </div>
                    <div>
                      <div className='font-display font-semibold text-[14px] text-foreground leading-tight group-hover:text-[hsl(215,55%,38%)] transition-colors'>
                        {fn}
                      </div>
                      <div className='text-[10px] text-muted-foreground mt-0.5 font-mono bg-muted/50 w-fit px-1.5 py-0.5 rounded'>
                        {count} project{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* ── Projects Section Heading ── */}
        <div className='flex items-center gap-2 mb-4'>
          <Droplets className='w-3.5 h-3.5 text-muted-foreground/80' />
          <span className='text-[11px] uppercase tracking-[0.15em] font-bold text-muted-foreground'>
            {currentFolder ?? 'All Projects'}
          </span>
          {!loadingProjects && (
            <span className='ml-1 text-[10px] font-mono bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50'>
              {filtered.length}
            </span>
          )}
        </div>

        {/* ── Project Grid ── */}
        {loadingProjects && !projectsData && (
          <ProjectsGridSkeleton viewMode={viewMode} />
        )}

        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children'
              : 'flex flex-col gap-2.5 stagger-children'
          }
        >
          {/* New project card */}
          {!loadingProjects && (
            <button
              onClick={() => setOpenCreate(true)}
              className={`group relative rounded-2xl border-2 border-dashed border-[hsl(215,55%,38%)]/40 hover:border-[hsl(215,55%,38%)] hover:bg-[hsl(215,55%,38%)]/5 hover:scale-[1.01] hover:shadow-lg hover:shadow-[hsl(215,55%,38%)]/5 transition-all duration-300 text-center ${
                viewMode === 'grid'
                  ? 'flex flex-col items-center justify-center p-6 min-h-[140px]'
                  : 'flex items-center gap-4 px-5 py-4'
              }`}
            >
              <div
                className={`rounded-2xl text-[hsl(215,55%,38%)] flex items-center justify-center group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[hsl(215,55%,38%)]/10 transition-all duration-300 ${
                  viewMode === 'grid' ? 'w-12 h-12 mb-3' : 'w-9 h-9 shrink-0'
                }`}
                style={{
                  background:
                    'linear-gradient(135deg, hsl(215,50%,94%), hsl(210,45%,92%))',
                }}
              >
                <Plus className='w-5 h-5' />
              </div>
              <div>
                <div className='font-display font-semibold text-foreground text-[14px]'>
                  New Project
                </div>
                {viewMode === 'grid' && (
                  <div className='text-[12px] text-muted-foreground mt-0.5'>
                    Start a fresh RO design
                  </div>
                )}
              </div>
            </button>
          )}

          {filtered.map((p: DashboardProject) => {
            const sc = STATUS[p.status as keyof typeof STATUS];
            const StatusIcon = sc.icon;

            if (viewMode === 'list') {
              return (
                <div
                  key={p.name}
                  onClick={() => router.push(`/studio/${p.id}`)}
                  className='group bg-card rounded-xl border border-border/80 hover:border-[hsl(215,55%,38%)]/30 hover:shadow-md transition-all duration-200 cursor-pointer px-5 py-3.5 flex items-center gap-4'
                >
                  <div
                    className='w-9 h-9 rounded-xl text-[hsl(215,55%,38%)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'
                    style={{
                      background:
                        'linear-gradient(135deg, hsl(215,50%,94%), hsl(210,60%,94%))',
                    }}
                  >
                    <Droplets className='w-4 h-4' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <div className='font-display font-semibold text-[14px] text-foreground truncate'>
                        {p.name}
                      </div>
                      <Badge
                        variant='outline'
                        className='text-[9px] font-mono py-0 h-4 border-primary/20 text-primary bg-primary/5'
                      >
                        {p.projectNo}
                      </Badge>
                      {p.hot && (
                        <Flame className='w-3.5 h-3.5 text-[hsl(215,55%,45%)] shrink-0' />
                      )}
                    </div>
                    <div className='flex items-center gap-2 mt-0.5'>
                      {p.client && (
                        <div className='text-[10px] text-muted-foreground font-medium flex items-center gap-1'>
                          <span className='w-1 h-1 rounded-full bg-muted-foreground/30' />
                          {p.client}
                        </div>
                      )}
                      {p.folder && (
                        <div className='text-[10px] text-muted-foreground flex items-center gap-1'>
                          <Folder className='w-3 h-3' />
                          {p.folder}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant='outline'
                    className={`text-[11px] gap-1.5 px-2.5 py-1 font-medium shrink-0 ${sc.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </Badge>
                  <div className='text-[11px] text-muted-foreground font-mono shrink-0 hidden lg:flex items-center gap-1'>
                    <Clock className='w-3 h-3' /> {p.updated}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className='w-8 h-8 rounded-lg hover:bg-muted bg-card/20 flex items-center justify-center text-muted-foreground transition-all shrink-0 border border-border/10'>
                        <MoreHorizontal className='w-4 h-4' />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-48' onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={() => router.push(`/studio/${p.id}`)}
                      >
                        <ExternalLink className='mr-2 h-4 w-4' /> Open Studio
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setRenamingProject(p);
                          setNewName(p.name);
                        }}
                      >
                        <Edit2 className='mr-2 h-4 w-4' /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeletingId(p.id)}
                        className='text-destructive focus:text-destructive'
                      >
                        <Trash2 className='mr-2 h-4 w-4' /> Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            }

            return (
              <div
                key={p.name}
                onClick={() => router.push(`/studio/${p.id}`)}
                className='group relative bg-card rounded-2xl border border-border/80 hover:border-[hsl(215,55%,38%)]/30 hover:shadow-lg hover:shadow-[hsl(215,55%,38%)]/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col'
              >
                <div
                  className='absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  style={{
                    background:
                      'linear-gradient(90deg, hsl(215,55%,35%), hsl(210,50%,45%))',
                  }}
                />
                <div className='p-5 flex-1'>
                  <div className='flex items-start justify-between mb-4'>
                    <div
                      className='w-10 h-10 rounded-xl text-[hsl(215,55%,38%)] flex items-center justify-center group-hover:scale-105 transition-transform duration-200'
                      style={{
                        background:
                          'linear-gradient(135deg, hsl(215,50%,94%), hsl(210,60%,94%))',
                      }}
                    >
                      <Droplets className='w-[18px] h-[18px]' />
                    </div>
                    <div className='flex items-center gap-1.5'>
                      {p.hot && (
                        <div className='w-6 h-6 rounded-lg bg-[hsl(215,50%,94%)] flex items-center justify-center'>
                          <Flame className='w-3 h-3 text-[hsl(215,55%,40%)]' />
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className='w-8 h-8 rounded-lg hover:bg-muted bg-card/20 flex items-center justify-center text-muted-foreground transition-all border border-border/10'>
                            <MoreHorizontal className='w-4 h-4' />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48' onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem
                            onClick={() => router.push(`/studio/${p.id}`)}
                          >
                            <ExternalLink className='mr-2 h-4 w-4' /> Open
                            Studio
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRenamingProject(p);
                              setNewName(p.name);
                            }}
                          >
                            <Edit2 className='mr-2 h-4 w-4' /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingId(p.id)}
                            className='text-destructive focus:text-destructive'
                          >
                            <Trash2 className='mr-2 h-4 w-4' /> Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className='flex items-center gap-1.5 mb-2'>
                    <Badge
                      variant='outline'
                      className='text-[9px] font-mono py-0 h-4 border-primary/20 text-primary bg-primary/10'
                    >
                      {p.projectNo}
                    </Badge>
                  </div>
                  <div className='font-display font-semibold text-[14px] text-foreground leading-snug line-clamp-2 min-h-[2.4rem]'>
                    {p.name}
                  </div>
                  <div className='flex flex-col gap-1.5 mt-3'>
                    {p.client && (
                      <div className='text-[10px] text-muted-foreground font-medium flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-primary/20' />
                        {p.client}
                      </div>
                    )}
                    {p.folder && (
                      <div className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                        <Folder className='w-3 h-3' /> {p.folder}
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/20'>
                  <div className='flex items-center gap-1 text-[11px] text-muted-foreground'>
                    <Clock className='w-3 h-3' />
                    <span>{p.updated}</span>
                  </div>
                  <Badge
                    variant='outline'
                    className={`text-[10px] gap-1.5 px-2 py-0.5 font-medium ${sc.badge}`}
                  >
                    <StatusIcon className='w-3 h-3' />
                    {sc.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className='text-center py-20'>
            <div className='w-14 h-14 rounded-2xl bg-muted/80 flex items-center justify-center mx-auto mb-4'>
              <Search className='w-6 h-6 text-muted-foreground/75' />
            </div>
            <div className='font-display font-semibold text-foreground text-lg'>
              No projects found
            </div>
            <div className='text-muted-foreground text-sm mt-1'>
              Try adjusting your search or create a new project.
            </div>
          </div>
        )}
      </div>

      {/* ── Confirmation Dialogs ── */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and all its simulation cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectMutation.mutate(deletingId!)}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending
                ? 'Deleting...'
                : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!folderToDelete}
        onOpenChange={(o) => !o && setFolderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the folder organization. Projects within this
              folder will be moved to the root workspace. They will not be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFolderMutation.mutate(folderToDelete!)}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteFolderMutation.isPending ? 'Removing...' : 'Remove Folder'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Rename Project Dialog ── */}
      <Dialog
        open={!!renamingProject}
        onOpenChange={(o) => !o && setRenamingProject(null)}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Enter a new name for your project. This will update the project
              identity across the system.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Label className='text-xs text-muted-foreground mb-2 block'>
              New Project Name
            </Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder='Enter project name'
              autoFocus
            />
          </div>
          <AlertDialogFooter className='mt-2'>
            <Button variant='ghost' onClick={() => setRenamingProject(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                renameProjectMutation.mutate({
                  id: renamingProject!.id,
                  name: newName,
                })
              }
              disabled={
                !newName.trim() ||
                newName === renamingProject?.name ||
                renameProjectMutation.isPending
              }
              style={{
                background:
                  'linear-gradient(135deg, hsl(215,55%,30%), hsl(210,50%,42%))',
                color: 'white',
              }}
            >
              {renameProjectMutation.isPending
                ? 'Renaming...'
                : 'Rename Project'}
            </Button>
          </AlertDialogFooter>
        </DialogContent>
      </Dialog>
      <SignoutModal 
        open={showSignout} 
        onOpenChange={setShowSignout} 
        context="active engineering workspace"
      />
    </div>
  );
}


/* ── Tiny helper ── */
function ChevronRightIcon() {
  return (
    <svg
      className='w-3 h-3 text-muted-foreground/75'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 5l7 7-7 7'
      />
    </svg>
  );
}
