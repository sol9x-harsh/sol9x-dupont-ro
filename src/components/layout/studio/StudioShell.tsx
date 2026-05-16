'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { initSimulationTriggers } from '@/core/simulation/orchestration/simulation-trigger';
import {
  LayoutGrid,
  Droplets,
  Settings2,
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  Loader2,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { SimulationWarnings } from '@/components/engineering/SimulationWarnings';
import { type SaveStatus } from '@/hooks/useProjectPersistence';

export type Screen = 'profile' | 'design' | 'feed' | 'config' | 'report';

const NAV: {
  id: Screen;
  label: string;
  icon: React.ElementType;
  shortDesc: string;
}[] = [
  { id: 'design', label: 'System Design', icon: LayoutGrid, shortDesc: 'Array & PFD layout' },
  { id: 'feed',   label: 'Feed Setup',    icon: Droplets,   shortDesc: 'Water chemistry & ions' },
  { id: 'config', label: 'RO Configuration', icon: Settings2, shortDesc: 'Stages & elements' },
  { id: 'report', label: 'Report',        icon: FileText,   shortDesc: 'PDF & Excel output' },
];

interface Props {
  active: Screen;
  onChange: (s: Screen) => void;
  units?: 'SI' | 'US';
  onUnits?: (u: 'SI' | 'US') => void;
  children: React.ReactNode;
  projectName?: string;
  onSave?: () => void;
  saveStatus?: SaveStatus;
  savedAt?: string | null;
}

export function StudioShell({
  active,
  onChange,
  children,
  projectName,
  onSave,
  saveStatus: externalSaveStatus,
  savedAt: externalSavedAt,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const [collapsed, setCollapsed] = React.useState(false);
  const [internalSaving, setInternalSaving] = React.useState(false);
  const [internalSavedAt, setInternalSavedAt] = React.useState<string | null>(null);
  const [showSignoutModal, setShowSignoutModal] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const saveStatus: SaveStatus = onSave ? (externalSaveStatus ?? 'saved') : (internalSaving ? 'saving' : 'saved');
  const saving  = saveStatus === 'saving';
  const savedAt = onSave ? externalSavedAt : internalSavedAt;

  const idx = NAV.findIndex((n) => n.id === active);
  const prev = idx > 0 ? NAV[idx - 1] : null;
  const next = idx !== -1 && idx < NAV.length - 1 ? NAV[idx + 1] : null;

  useEffect(() => {
    const unsubscribe = initSimulationTriggers();
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: '/login' });
  };

  const handleSave = () => {
    if (onSave) { onSave(); return; }
    setInternalSaving(true);
    setTimeout(() => {
      setInternalSaving(false);
      setInternalSavedAt(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }) + ' UTC',
      );
    }, 900);
  };

  // Derive initials from session user
  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : session?.user?.email
      ? session.user.email[0].toUpperCase()
      : 'U';

  const userName    = session?.user?.name  ?? session?.user?.email ?? 'User';
  const userCompany = 'SOL9X';

  return (
    <TooltipProvider delayDuration={0}>
      <div className='flex h-screen w-full bg-slate-50 overflow-hidden' role='application'>

        {/* ── Sidebar ── */}
        <aside
          className={cn(
            'shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border relative transition-all duration-500 shadow-md z-20',
            collapsed ? 'w-[80px]' : 'w-[280px]',
          )}
        >
          <div className='absolute inset-0 opacity-40 pointer-events-none dot-bg' />

          {/* Brand */}
          <div
            className={cn(
              'relative h-[80px] flex items-center transition-all duration-300',
              collapsed ? 'px-4 justify-center' : 'px-6 justify-between',
            )}
          >
            <div className='flex items-center gap-3'>
              <div
                className='w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/10 relative overflow-hidden group cursor-pointer'
                onClick={() => router.push('/projects')}
              >
                <div className='absolute inset-0 bg-linear-to-br from-primary to-primary-glow' />
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]' />
                <span className='relative font-display font-bold text-white text-lg'>S9</span>
              </div>
              {!collapsed && (
                <div className='leading-tight animate-in fade-in slide-in-from-left-4 duration-500 delay-150'>
                  <div className='font-display font-bold text-slate-900 text-base tracking-tight'>SOL9X</div>
                  <div className='text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold'>Studio v4.0</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className='p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all active:scale-90'
              >
                <PanelLeftClose className='w-5 h-5' />
              </button>
            )}
          </div>

          {collapsed && (
            <div className='flex justify-center mb-4'>
              <button
                onClick={() => setCollapsed(false)}
                className='p-2 rounded-xl bg-slate-100 text-primary hover:bg-primary/10 transition-all active:scale-90'
              >
                <PanelLeftOpen className='w-5 h-5' />
              </button>
            </div>
          )}

          {/* Workflow Steps */}
          <div className='px-4 mb-2'>
            {!collapsed && (
              <span className='px-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold'>
                Workflow Steps
              </span>
            )}
          </div>

          <nav
            className={cn(
              'flex-1 overflow-y-auto scrollbar-premium space-y-1 transition-all duration-300',
              collapsed ? 'px-3 mt-2' : 'px-4',
            )}
          >
            {NAV.map((n, i) => {
              const Icon = n.icon;
              const isActive   = active === n.id;
              const isComplete = i < idx;

              return (
                <Tooltip key={n.id} open={collapsed ? undefined : false}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onChange(n.id)}
                      className={cn(
                        'w-full flex items-center rounded-xl transition-all duration-300 relative group animate-in fade-in slide-in-from-left-4',
                        collapsed ? 'h-[52px] justify-center' : 'px-3 py-3 gap-3',
                        isActive
                          ? 'bg-slate-50 text-primary shadow-sm ring-1 ring-slate-200'
                          : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-900',
                      )}
                      style={{ animationDelay: `${400 + i * 50}ms` }}
                    >
                      {isActive && !collapsed && (
                        <div className='absolute -left-px top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary' />
                      )}
                      <div
                        className={cn(
                          'w-10 h-10 flex items-center justify-center shrink-0 rounded-xl transition-all duration-300',
                          isActive   ? 'bg-primary/10 text-primary' :
                          isComplete ? 'bg-success/5 text-success'  :
                                       'bg-slate-50 text-slate-400 group-hover:bg-slate-100',
                        )}
                      >
                        {isComplete ? <Check className='w-4 h-4 stroke-3' /> : <Icon className='w-5 h-5 stroke-2' />}
                      </div>
                      {!collapsed && (
                        <div className='flex-1 text-left min-w-0'>
                          <div className={cn('font-bold text-sm leading-tight truncate', isActive ? 'text-slate-900' : 'text-slate-600')}>
                            {n.label}
                          </div>
                          <div className='text-[10px] mt-0.5 text-slate-400 font-medium truncate'>{n.shortDesc}</div>
                        </div>
                      )}
                      {isActive && !collapsed && (
                        <div className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
                      )}
                    </button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side='right' className='bg-slate-900 text-white border-none px-3 py-2 shadow-xl'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='font-bold text-xs'>{n.label}</span>
                        <span className='text-[10px] text-slate-400'>{n.shortDesc}</span>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* Workspace */}
          <div className='mt-auto pt-4'>
            <div className='px-4 mb-2'>
              {!collapsed && (
                <span className='px-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold'>Workspace</span>
              )}
            </div>
            <div className={cn('px-4 space-y-1', collapsed && 'px-3')}>
              <Tooltip open={collapsed ? undefined : false}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onChange('profile')}
                    className={cn(
                      'w-full flex items-center rounded-xl transition-all duration-300 relative group',
                      collapsed ? 'h-[52px] justify-center' : 'px-3 py-3 gap-3',
                      active === 'profile'
                        ? 'bg-slate-50 text-primary shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-900',
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 flex items-center justify-center shrink-0 rounded-xl transition-all duration-300',
                        active === 'profile' ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100',
                      )}
                    >
                      <Settings2 className='w-5 h-5 stroke-2' />
                    </div>
                    {!collapsed && (
                      <div className='flex-1 text-left min-w-0'>
                        <div className={cn('font-bold text-sm leading-tight truncate', active === 'profile' ? 'text-slate-900' : 'text-slate-600')}>
                          Settings
                        </div>
                        <div className='text-[10px] text-slate-400 font-medium truncate'>Profile & Region</div>
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side='right' className='bg-slate-900 text-white border-none px-3 py-2 shadow-xl'>
                    <div className='flex flex-col gap-0.5'>
                      <span className='font-bold text-xs'>Settings</span>
                      <span className='text-[10px] text-slate-400'>Profile & Region</span>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>

          {/* User card */}
          <div className='p-4 mt-2'>
            <div
              className={cn(
                'bg-slate-50 border border-border/60 rounded-2xl p-2 transition-all duration-500 shadow-sm hover:shadow-md hover:border-primary/20',
                collapsed ? 'h-14 w-14 flex items-center justify-center' : 'flex items-center gap-3',
              )}
            >
              <div className='relative w-10 h-10 rounded-xl bg-linear-to-br from-primary/90 to-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20'>
                <span className='font-display font-bold text-white text-xs'>{userInitials}</span>
              </div>
              {!collapsed && (
                <>
                  <div className='relative flex-1 min-w-0'>
                    <div className='text-xs font-bold text-slate-900 truncate'>{userName}</div>
                    <div className='text-[10px] text-slate-400 font-bold truncate uppercase tracking-wider'>{userCompany}</div>
                  </div>
                  <button
                    onClick={() => setShowSignoutModal(true)}
                    className='p-2 text-slate-300 hover:text-destructive transition-colors'
                    title='Sign out'
                  >
                    <LogOut className='w-4 h-4' />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className='absolute right-0 top-0 bottom-0 w-px bg-sidebar-border/50' />
        </aside>

        {/* ── Main ── */}
        <div className='flex-1 flex flex-col min-w-0 transition-all duration-500'>

          {/* Header */}
          <header className='h-[64px] shrink-0 bg-white border-b border-slate-100 flex items-center px-8 z-10'>
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <button
                onClick={() => router.push('/projects')}
                className='text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0 hover:text-primary transition-colors'
              >
                Projects
              </button>
              <ChevronRight className='w-3.5 h-3.5 text-slate-300' />
              <h1 className='font-display font-bold text-slate-900 truncate text-base tracking-tight'>
                {projectName || 'RO Design Studio'}
              </h1>
            </div>

            <div className='flex items-center gap-6'>
              {/* Save status */}
              <div className='hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest min-w-30 justify-end'>
                {saveStatus === 'unsaved' && (
                  <>
                    <span className='w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0' />
                    <span className='text-amber-500'>Unsaved changes</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <span className='w-1.5 h-1.5 rounded-full bg-red-500 shrink-0' />
                    <span className='text-red-500'>Save failed</span>
                  </>
                )}
                {(saveStatus === 'saved' || saveStatus === 'saving') && savedAt && (
                  <span className='text-slate-400'>Saved {savedAt}</span>
                )}
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className='h-9 rounded-lg text-white font-bold text-xs px-5 gap-2 border-0 shadow-sm transition-all active:scale-95'
                style={{ backgroundColor: 'hsl(215, 55%, 35%)' }}
              >
                {saving ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <Save className='w-3.5 h-3.5' />}
                SAVE
              </Button>
              <SimulationWarnings />
            </div>
          </header>

          {/* Content */}
          <main className='flex-1 overflow-auto bg-slate-50/50 scrollbar-premium' role='main'>
            <div key={active} className='px-8 pt-4 pb-8 fade-up'>
              {children}
            </div>
          </main>

          {/* Footer nav */}
          <footer className='h-[64px] shrink-0 border-t border-slate-100 bg-white/70 backdrop-blur-xl flex items-center px-6 gap-4 z-20'>
            <button
              disabled={!prev}
              onClick={() => {
                if (active === 'profile') return;
                if (prev) onChange(prev.id);
              }}
              className='flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-100 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-20 transition-all'
            >
              <ArrowLeft className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>PREVIOUS</span>
            </button>

            <div className='flex-1 flex items-center justify-center gap-2'>
              {NAV.map((n, i) => (
                <div
                  key={n.id}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-700',
                    i === idx       ? 'w-10 bg-primary shadow-sm shadow-primary/20' :
                    i < idx         ? 'w-2 bg-success/60'                           :
                                      'w-2 bg-slate-200',
                  )}
                />
              ))}
            </div>

            <Button
              disabled={!next && active !== 'profile'}
              onClick={() => {
                if (active === 'profile') onChange(NAV[0].id);
                else if (next) onChange(next.id);
              }}
              className='h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-blue-500/10 rounded-xl gap-2 transition-all active:scale-95 border-0'
            >
              <span className='hidden sm:inline'>{next ? 'NEXT STEP' : 'FINISH DESIGN'}</span>
              <span className='sm:hidden'>{next ? 'NEXT' : 'FINISH'}</span>
              <ArrowRight className='w-3.5 h-3.5' />
            </Button>
          </footer>
        </div>
      </div>

      {/* ── Sign-out confirmation modal ── */}
      {showSignoutModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center'
          role='dialog'
          aria-modal='true'
          aria-labelledby='signout-title'
        >
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-slate-950/60 backdrop-blur-sm'
            onClick={() => !signingOut && setShowSignoutModal(false)}
          />

          {/* Panel */}
          <div className='relative w-full max-w-[400px] mx-4 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200'>

            {/* Top accent bar */}
            <div className='h-[3px] w-full bg-linear-to-r from-primary via-primary-glow to-primary' />

            {/* Header */}
            <div className='flex items-start justify-between px-6 pt-5 pb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0'>
                  <AlertTriangle className='w-4 h-4 text-amber-500' />
                </div>
                <div>
                  <h2 id='signout-title' className='font-display font-bold text-slate-900 text-sm tracking-tight'>
                    Terminate Session
                  </h2>
                  <p className='text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-0.5'>
                    SOL9X Studio · Auth
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSignoutModal(false)}
                disabled={signingOut}
                className='p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-40'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Divider */}
            <div className='h-px bg-slate-100 mx-6' />

            {/* Body */}
            <div className='px-6 py-4 space-y-3'>
              <p className='text-xs text-slate-600 leading-relaxed'>
                You are about to sign out of the active engineering session for
                {' '}<span className='font-bold text-slate-900 font-mono'>{projectName || 'RO Design Studio'}</span>.
              </p>
              <div className='bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 space-y-1.5'>
                <div className='flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0' />
                  <span className='text-[11px] text-slate-500'>Unsaved calculations will be discarded</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0' />
                  <span className='text-[11px] text-slate-500'>Last saved state will be retained</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0' />
                  <span className='text-[11px] text-slate-500'>Session tokens will be cleared</span>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className='px-6 pb-5 flex items-center gap-3'>
              <button
                onClick={() => setShowSignoutModal(false)}
                disabled={signingOut}
                className='flex-1 h-9 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-40'
              >
                CANCEL
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className='flex-1 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2'
              >
                {signingOut
                  ? <><Loader2 className='w-3.5 h-3.5 animate-spin' /> SIGNING OUT…</>
                  : <><LogOut className='w-3.5 h-3.5' /> SIGN OUT</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}
