'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Droplets,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Bell,
  LayoutGrid,
  List,
  FolderPlus,
  Folder,
  FolderOpen,
  Flame,
  ArrowLeft,
} from 'lucide-react';
import { CreateProjectModal } from '@/components/modals/CreateProjectModal';

/* ─── Data ─── */
const PROJECTS = [
  {
    name: 'Chennai SWRO Desalination - Phase II',
    client: 'Tata Projects Ltd.',
    projectNo: 'SOL-24-001',
    status: 'Verified',
    updated: '2 min ago',
    hot: true,
    folder: 'Seawater',
  },
  {
    name: 'Jamnagar Brackish Water RO Plant',
    client: 'Reliance Industries',
    projectNo: 'SOL-24-002',
    status: 'Draft',
    updated: '1 h ago',
    hot: false,
    folder: 'Brackish',
  },
  {
    name: 'Dahej Industrial Effluent Plant',
    client: 'GIDC',
    projectNo: 'SOL-24-006',
    status: 'Verified',
    updated: '1 day ago',
    hot: false,
    folder: 'Waste Water',
  },
  {
    name: 'Vizag Port Desalination Unit',
    client: 'Adani Ports',
    projectNo: 'SOL-24-003',
    status: 'Verified',
    updated: '5 min ago',
    hot: true,
    folder: 'Seawater',
  },
];

const FOLDERS = ['Seawater', 'Brackish', 'Waste Water'];

// Count projects per folder
function projectsInFolder(folder: string) {
  return PROJECTS.filter((p) => p.folder === folder).length;
}

const STATUS = {
  Verified: {
    dot: 'bg-[hsl(215,55%,45%)]',
    badge:
      'bg-[hsl(215,50%,95%)] text-[hsl(215,55%,35%)] border-[hsl(215,55%,45%)]/25',
    icon: CheckCircle2,
    label: 'Verified',
  },
  Draft: {
    dot: 'bg-[hsl(215,15%,60%)]',
    badge: 'bg-muted text-muted-foreground border-border',
    icon: AlertCircle,
    label: 'Draft',
  },
} as const;

const TABS = ['All Projects', 'Verified', 'Drafts'];

/* ─── Component ─── */
export default function Projects() {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  // currentFolder = folder the user has "navigated into" (null = root)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const filtered = PROJECTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    // When inside a folder, only show projects of that folder
    const matchesFolder = currentFolder
      ? p.folder === currentFolder
      : activeFolder
        ? p.folder === activeFolder
        : true;
    if (activeTab === 1)
      return matchesSearch && matchesFolder && p.status === 'Verified';
    if (activeTab === 2)
      return matchesSearch && matchesFolder && p.status === 'Draft';
    return matchesSearch && matchesFolder;
  });

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
        onCreate={() => router.push('/studio')}
      />

      {/* ── Create Folder Dialog ── */}
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
                  Create Folder
                </DialogTitle>
                <p className='text-[12px] text-muted-foreground mt-0.5'>
                  Organize your RO design projects
                </p>
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
                className='h-10 text-sm border-border/60 focus-visible:ring-[hsl(215,55%,45%)]/30'
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
                placeholder='Brief description of this folder...'
                className='w-full h-16 min-h-16 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(215,55%,45%)]/20 focus-visible:border-[hsl(215,55%,45%)]/40 transition-all placeholder:text-muted-foreground/40'
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
                ].map((c, i) => (
                  <button
                    key={c}
                    className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                      i === 0
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
              onClick={() => setOpenFolder(false)}
              className='h-9 px-4 text-[13px] font-medium'
            >
              Cancel
            </Button>
            <Button
              disabled={!folderName.trim()}
              onClick={() => {
                setOpenFolder(false);
                setFolderName('');
              }}
              className='h-9 px-5 gap-2 text-[13px] font-semibold transition-all hover:opacity-90'
              style={{
                background:
                  'linear-gradient(135deg, hsl(215,55%,30%), hsl(210,50%,42%))',
                boxShadow: '0 4px 16px -4px hsl(215,55%,30%/0.4)',
                color: 'white',
              }}
            >
              <FolderPlus className='w-3.5 h-3.5' />
              Create Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Top Nav ── */}
      <header
        className='h-[64px] border-b bg-white/80 backdrop-blur-xl sticky top-0 z-20 flex items-center px-6 gap-4'
        style={{ borderColor: 'hsl(215,20%,90%)' }}
      >
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
              S9
            </span>
          </div>
          <div>
            <div className='font-display font-semibold text-foreground text-[13px] tracking-wide leading-none'>
              SOL9X
            </div>
            <div className='text-[8px] uppercase tracking-[0.2em] text-muted-foreground font-medium leading-none mt-0.5'>
              RO Design Studio
            </div>
          </div>
        </div>

        <div className='ml-auto flex items-center gap-2.5'>
          <button className='relative w-8 h-8 rounded-lg border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all'>
            <Bell className='w-4 h-4' />
            <span className='absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(215,55%,45%)] border-2 border-card' />
          </button>
          <div
            className='w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-[11px] font-bold text-foreground cursor-pointer hover:ring-2 hover:ring-[hsl(215,55%,35%)]/20 transition-all'
            style={{
              background:
                'linear-gradient(135deg, hsl(215,55%,35%,0.12), hsl(210,50%,42%,0.12))',
            }}
          >
            RS
          </div>
          <button className='w-8 h-8 rounded-lg border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all'>
            <LogOut className='w-3.5 h-3.5' />
          </button>
        </div>
      </header>

      <div className='max-w-[1440px] mx-auto px-6 lg:px-8 py-8'>
        {/* ── Page Header ── */}
        <div className='flex items-start justify-between gap-6 mb-8'>
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
                  className='w-8 h-8 rounded-xl border border-border/60 bg-card hover:bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shrink-0'
                  aria-label='Go back'
                >
                  <ArrowLeft className='w-4 h-4' />
                </button>
              )}
              <h1 className='font-display text-[32px] font-semibold tracking-tight text-foreground leading-none'>
                {currentFolder ?? 'Your Projects'}
              </h1>
            </div>
            <p className='text-[14px] text-muted-foreground mt-2'>
              {currentFolder
                ? `${projectsInFolder(currentFolder)} project${projectsInFolder(currentFolder) !== 1 ? 's' : ''} in this folder`
                : 'All RO design jobs across your engineering team.'}
            </p>
          </div>

          <div className='flex items-center gap-2.5 shrink-0'>
            <Button
              variant='outline'
              onClick={() => setOpenFolder(true)}
              className='h-9 gap-2 text-[13px] font-semibold border-border/60 hover:border-[hsl(215,55%,38%)]/50 hover:text-[hsl(215,55%,38%)] transition-all'
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
          </div>
        </div>

        {/* ── Folders Section (root only) ── */}
        {!currentFolder && (
          <div className='mb-6'>
            <div className='flex items-center mb-3'>
              <span className='text-[11px] uppercase tracking-[0.15em] font-bold text-muted-foreground'>
                Folders
              </span>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
              {FOLDERS.map((f) => {
                const count = projectsInFolder(f);
                return (
                  <button
                    key={f}
                    onClick={() => {
                      setCurrentFolder(f);
                      setActiveFolder(null);
                    }}
                    className='group flex flex-col items-start gap-2 p-3.5 rounded-xl border border-border/60 bg-card hover:border-[hsl(215,55%,38%)]/40 hover:shadow-md hover:shadow-[hsl(215,55%,38%)]/5 transition-all duration-200 text-left'
                  >
                    <div
                      className='w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200'
                      style={{
                        background:
                          'linear-gradient(135deg, hsl(215,50%,94%), hsl(210,60%,94%))',
                      }}
                    >
                      <Folder className='w-4 h-4 text-[hsl(215,55%,38%)]' />
                    </div>
                    <div>
                      <div className='font-display font-semibold text-[13px] text-foreground leading-tight'>
                        {f}
                      </div>
                      <div className='text-[10px] text-muted-foreground mt-0.5 font-mono'>
                        {count} project{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className='flex items-center gap-3 mb-5'>
          <div className='flex items-center gap-1 bg-muted/60 rounded-xl p-1 border border-border/40'>
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setActiveTab(i)}
                className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === i
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className='relative flex-1 max-w-[320px] ml-auto'>
            <Search className='w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search projects...'
              className='pl-9 h-9 text-[13px] bg-card border-border/60 rounded-xl'
            />
          </div>

          <div className='flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5 border border-border/40'>
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

        {/* ── Project Grid ── */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children'
              : 'flex flex-col gap-2.5 stagger-children'
          }
        >
          {/* New project card */}
          <button
            onClick={() => setOpenCreate(true)}
            className={`group relative rounded-2xl border-2 border-dashed border-border/50 hover:border-[hsl(215,55%,38%)]/40 hover:bg-[hsl(215,55%,38%)]/[0.03] transition-all duration-300 text-center ${
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

          {filtered.map((p) => {
            const sc = STATUS[p.status as keyof typeof STATUS];
            const StatusIcon = sc.icon;

            if (viewMode === 'list') {
              return (
                <div
                  key={p.name}
                  onClick={() => router.push('/studio')}
                  className='group bg-card rounded-xl border border-border/60 hover:border-[hsl(215,55%,38%)]/30 hover:shadow-md transition-all duration-200 cursor-pointer px-5 py-3.5 flex items-center gap-4'
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
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className='w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0'
                  >
                    <MoreHorizontal className='w-3.5 h-3.5' />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={p.name}
                onClick={() => router.push('/studio')}
                className='group relative bg-card rounded-2xl border border-border/60 hover:border-[hsl(215,55%,38%)]/30 hover:shadow-lg hover:shadow-[hsl(215,55%,38%)]/5 transition-all duration-300 cursor-pointer overflow-hidden'
              >
                <div
                  className='absolute inset-x-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  style={{
                    background:
                      'linear-gradient(90deg, hsl(215,55%,35%), hsl(210,50%,45%))',
                  }}
                />
                <div className='p-5'>
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
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className='w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-all'
                      >
                        <MoreHorizontal className='w-3.5 h-3.5' />
                      </button>
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
            <div className='w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4'>
              <Search className='w-6 h-6 text-muted-foreground/40' />
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
    </div>
  );
}

/* ── Tiny helper ── */
function ChevronRightIcon() {
  return (
    <svg
      className='w-3 h-3 text-muted-foreground/40'
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
