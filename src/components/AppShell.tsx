'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Droplets,
  Settings2,
  FileText,
  ChevronDown,
  Bell,
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  Save,
  Loader2,
  ChevronLeft,
  User,
  Search,
  Zap,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

export type Screen = 'profile' | 'design' | 'feed' | 'config' | 'report';

const NAV: {
  id: Screen;
  label: string;
  icon: any;
  hint: string;
  shortDesc: string;
}[] = [
  {
    id: 'design',
    label: 'System Design',
    icon: LayoutGrid,
    hint: 'Architecture',
    shortDesc: 'Array & PFD layout',
  },
  {
    id: 'feed',
    label: 'Feed Setup',
    icon: Droplets,
    hint: 'Chemistry',
    shortDesc: 'Water chemistry & ions',
  },
  {
    id: 'config',
    label: 'RO Configuration',
    icon: Settings2,
    hint: 'Membranes',
    shortDesc: 'Stages & elements',
  },
  {
    id: 'report',
    label: 'Report',
    icon: FileText,
    hint: 'Export',
    shortDesc: 'PDF & Excel output',
  },
];

interface Props {
  active: Screen;
  onChange: (s: Screen) => void;
  units: 'SI' | 'US';
  onUnits: (u: 'SI' | 'US') => void;
  children: React.ReactNode;
}

export function AppShell({
  active,
  onChange,
  units,
  onUnits,
  children,
}: Props) {
  const idx = NAV.findIndex((n) => n.id === active);
  const isWorkflowStep = idx !== -1;
  const prev = isWorkflowStep && idx > 0 ? NAV[idx - 1] : null;
  const next = isWorkflowStep && idx < NAV.length - 1 ? NAV[idx + 1] : null;
  const progress = isWorkflowStep ? ((idx + 1) / NAV.length) * 100 : 0;
  const [saving, setSaving] = React.useState(false);
  const [savedAt, setSavedAt] = React.useState<string | null>('14:32 UTC');
  const [collapsed, setCollapsed] = React.useState(false);
  const router = useRouter();

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const now = new Date();
      setSavedAt(
        now.getUTCHours().toString().padStart(2, '0') +
          ':' +
          now.getUTCMinutes().toString().padStart(2, '0') +
          ' UTC',
      );
    }, 900);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className='flex h-screen w-full bg-slate-50 overflow-hidden'
        role='application'
        aria-label='SOL9X RO Design Studio'
      >
        {/* Sidebar */}
        <aside
          className={cn(
            'shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border relative transition-all duration-500 ease-premium shadow-md z-20',
            collapsed ? 'w-[80px]' : 'w-[280px]',
          )}
          aria-label='Design workflow navigation'
        >
          {/* Decorative background elements */}
          <div className='absolute inset-0 opacity-40 pointer-events-none dot-bg' />

          {/* Brand header & Toggle */}
          <div
            className={cn(
              'relative h-[80px] flex items-center transition-all duration-300',
              collapsed ? 'px-4 justify-center' : 'px-6 justify-between',
            )}
          >
            <div className='flex items-center gap-3'>
              <div className='w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-blue-900/10 relative overflow-hidden group cursor-pointer'>
                <div className='absolute inset-0 bg-linear-to-br from-primary to-primary-glow opacity-100 group-hover:scale-110 transition-transform duration-500' />
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent)]' />
                <span className='relative font-display font-bold text-white text-lg'>
                  S9
                </span>
              </div>
              {!collapsed && (
                <div className='leading-tight animate-in fade-in slide-in-from-left-4 duration-500 delay-150'>
                  <div className='font-display font-bold text-slate-900 text-base tracking-tight'>
                    SOL9X
                  </div>
                  <div className='text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold'>
                    Studio v4.0
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-primary transition-all active:scale-90',
                collapsed ? 'hidden' : 'block',
              )}
              title='Collapse Sidebar'
            >
              <PanelLeftClose className='w-5 h-5' />
            </button>
          </div>

          {/* If collapsed, show open toggle below logo */}
          {collapsed && (
            <div className='flex justify-center mb-4'>
              <button
                onClick={() => setCollapsed(false)}
                className='p-2 rounded-xl bg-slate-100 text-primary hover:bg-primary/10 transition-all active:scale-90'
                title='Expand Sidebar'
              >
                <PanelLeftOpen className='w-5 h-5' />
              </button>
            </div>
          )}

          {/* Navigation Section */}
          <div className='px-4 mb-2'>
            {!collapsed && (
              <span className='px-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold'>
                Workflow Steps
              </span>
            )}
          </div>

          <nav
            className={cn(
              'flex-1 overflow-y-auto scrollbar-premium transition-all duration-300 space-y-1',
              collapsed ? 'px-3 mt-2' : 'px-4',
            )}
          >
            {NAV.map((n, i) => {
              const Icon = n.icon;
              const isActive = active === n.id;
              const isComplete = i < idx;

              return (
                <Tooltip key={n.id} open={collapsed ? undefined : false}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onChange(n.id)}
                      className={cn(
                        'w-full flex items-center rounded-xl transition-all duration-300 relative group animate-in fade-in slide-in-from-left-4',
                        collapsed
                          ? 'h-[52px] justify-center'
                          : 'px-3 py-3 gap-3',
                        isActive
                          ? 'bg-slate-50 text-primary shadow-sm ring-1 ring-slate-200'
                          : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-900',
                      )}
                      style={{ animationDelay: `${400 + i * 50}ms` }}
                    >
                      {/* Active indicator bar */}
                      {isActive && !collapsed && (
                        <div className='absolute left-[-1px] top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary' />
                      )}

                      <div
                        className={cn(
                          'flex items-center justify-center shrink-0 transition-all duration-300',
                          collapsed ? 'w-10 h-10' : 'w-10 h-10',
                          isActive
                            ? 'bg-primary/10 text-primary rounded-xl'
                            : isComplete
                              ? 'bg-success/5 text-success rounded-xl'
                              : 'bg-slate-50 text-slate-400 rounded-xl group-hover:bg-slate-100',
                        )}
                      >
                        {isComplete ? (
                          <Check className='w-4 h-4 stroke-[3]' />
                        ) : (
                          <Icon className='w-5 h-5 stroke-[2]' />
                        )}
                      </div>

                      {!collapsed && (
                        <div className='flex-1 text-left min-w-0'>
                          <div
                            className={cn(
                              'font-bold text-sm leading-tight truncate transition-colors',
                              isActive ? 'text-slate-900' : 'text-slate-600',
                            )}
                          >
                            {n.label}
                          </div>
                          <div className='text-[10px] mt-0.5 text-slate-400 font-medium truncate'>
                            {n.shortDesc}
                          </div>
                        </div>
                      )}

                      {isActive && !collapsed && (
                        <div className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
                      )}
                    </button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent
                      side='right'
                      className='bg-slate-900 text-white border-none px-3 py-2 shadow-xl'
                    >
                      <div className='flex flex-col gap-0.5'>
                        <span className='font-bold text-xs'>{n.label}</span>
                        <span className='text-[10px] text-slate-400'>
                          {n.shortDesc}
                        </span>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* Workspace Section */}
          <div className='mt-auto pt-4'>
            <div className='px-4 mb-2'>
              {!collapsed && (
                <span className='px-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold'>
                  Workspace
                </span>
              )}
            </div>
            <div className={cn('px-4 space-y-1', collapsed && 'px-3')}>
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
                    'w-10 h-10 flex items-center justify-center shrink-0 transition-all duration-300 rounded-xl',
                    active === 'profile'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100',
                  )}
                >
                  <Settings2 className='w-5 h-5 stroke-[2]' />
                </div>
                {!collapsed && (
                  <div className='flex-1 text-left min-w-0'>
                    <div
                      className={cn(
                        'font-bold text-sm leading-tight truncate',
                        active === 'profile'
                          ? 'text-slate-900'
                          : 'text-slate-600',
                      )}
                    >
                      Settings
                    </div>
                    <div className='text-[10px] text-slate-400 font-medium truncate'>
                      Profile & Region
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* User Profile / Logout */}
          <div className='p-4 mt-2'>
            <div
              className={cn(
                'bg-slate-50 border border-border/60 rounded-2xl p-2 transition-all duration-500 relative overflow-hidden group/user shadow-sm hover:shadow-md hover:border-primary/20',
                collapsed
                  ? 'h-14 w-14 flex items-center justify-center'
                  : 'flex items-center gap-3',
              )}
            >
              <div className='relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20'>
                <span className='font-display font-bold text-white text-xs'>
                  JD
                </span>
              </div>

              {!collapsed && (
                <div className='relative flex-1 min-w-0'>
                  <div className='text-xs font-bold text-slate-900 truncate'>
                    John Doe
                  </div>
                  <div className='text-[10px] text-slate-400 font-bold truncate uppercase tracking-wider'>
                    SOL9X Pvt Ltd
                  </div>
                </div>
              )}

              {!collapsed && (
                <button className='relative p-2 text-slate-300 hover:text-destructive transition-colors'>
                  <LogOut className='w-4 h-4' />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Border Decor */}
          <div className='absolute right-0 top-0 bottom-0 w-px bg-sidebar-border/50' />
        </aside>

        {/* Main Container */}
        <div className='flex-1 flex flex-col min-w-0 transition-all duration-500 ease-premium'>
          {/* Simplified Header */}
          <header
            className='h-[64px] shrink-0 bg-white border-b border-slate-100 flex items-center px-8 relative z-10'
            role='banner'
          >
            <div className='flex items-center gap-2 flex-1 min-w-0'>
              <button
                onClick={() => router.push('/projects')}
                className='text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0 hover:text-primary transition-colors cursor-pointer'
              >
                Projects
              </button>
              <ChevronRight className='w-3.5 h-3.5 text-slate-300' />
              <h1 className='font-display font-bold text-slate-900 truncate text-base tracking-tight'>
                Chennai SWRO - Desalination Plant
              </h1>
            </div>

            <div className='flex items-center gap-6'>
              <div className='text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block'>
                Saved at {savedAt}
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className='h-9 rounded-lg text-white font-bold text-xs px-5 gap-2 border-0 shadow-sm transition-all active:scale-95'
                style={{ backgroundColor: 'hsl(215, 55%, 35%)' }}
              >
                {saving ? (
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                ) : (
                  <Save className='w-3.5 h-3.5' />
                )}
                SAVE
              </Button>

              <button className='p-1.5 text-slate-400 hover:text-primary transition-colors relative'>
                <Bell className='w-5 h-5' />
                <span className='absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 border-2 border-white' />
              </button>
            </div>
          </header>

          <main
            className='flex-1 overflow-auto bg-slate-50/50 scrollbar-premium'
            role='main'
          >
            <div key={active} className='px-8 pt-4 pb-8 fade-up'>
              {children}
            </div>
          </main>

          {/* Compact Navigation Footer */}
          <footer className='h-[64px] shrink-0 border-t border-slate-100 bg-white/70 backdrop-blur-xl flex items-center px-6 gap-4 z-20'>
            <button
              disabled={!prev}
              onClick={() => prev && onChange(prev.id)}
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
                    'h-1.5 rounded-full transition-all duration-700 ease-premium',
                    i === idx
                      ? 'w-10 bg-primary shadow-sm shadow-primary/20'
                      : i < idx
                        ? 'w-2 bg-success/60'
                        : 'w-2 bg-slate-200',
                  )}
                />
              ))}
            </div>

            <Button
              disabled={!next && active !== 'profile'}
              onClick={() => {
                if (active === 'profile') {
                  onChange(NAV[0].id);
                } else if (next) {
                  onChange(next.id);
                }
              }}
              className='h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-blue-500/10 rounded-xl gap-2 transition-all active:scale-95 border-0'
            >
              <span className='hidden sm:inline'>
                {next ? 'NEXT STEP' : 'FINISH DESIGN'}
              </span>
              <span className='sm:hidden'>{next ? 'NEXT' : 'FINISH'}</span>
              <ArrowRight className='w-3.5 h-3.5' />
            </Button>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
