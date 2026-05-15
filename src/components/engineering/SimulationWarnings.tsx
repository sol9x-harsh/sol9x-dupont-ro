'use client';

import { useState } from 'react';
import { AlertTriangle, XCircle, Info, ChevronUp, ChevronDown, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSimulationStore } from '@/store/simulation-store';
import {
  selectWarnings,
  selectValidationErrors,
} from '@/store/simulation/simulation-selectors';
import type { NormalizedWarning } from '@/store/simulation-store';

const SEVERITY_CONFIG = {
  critical: {
    icon: XCircle,
    bar: 'bg-destructive',
    bg: 'bg-destructive/5 border-destructive/20',
    text: 'text-destructive',
    label: 'CRITICAL',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-warning',
    bg: 'bg-warning/5 border-warning/20',
    text: 'text-warning',
    label: 'WARNING',
  },
  info: {
    icon: Info,
    bar: 'bg-primary',
    bg: 'bg-primary/5 border-primary/20',
    text: 'text-primary',
    label: 'INFO',
  },
} as const;

function WarningRow({ w }: { w: NormalizedWarning }) {
  const cfg = SEVERITY_CONFIG[w.severity] ?? SEVERITY_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <div className={cn('flex items-start gap-3 rounded-lg border px-4 py-3', cfg.bg)}>
      <div className={cn('w-0.5 self-stretch rounded-full shrink-0', cfg.bar)} />
      <Icon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', cfg.text)} />
      <div className='min-w-0 flex-1'>
        <span className={cn('text-[9px] font-black uppercase tracking-widest mr-2', cfg.text)}>
          {cfg.label}
        </span>
        <span className='text-[11px] text-foreground font-medium'>{w.message}</span>
      </div>
    </div>
  );
}

interface SimulationWarningsProps {
  className?: string;
  showValidationErrors?: boolean;
}

export function SimulationWarnings({
  className,
  showValidationErrors = true,
}: SimulationWarningsProps) {
  const warnings = useSimulationStore(selectWarnings);
  const validationErrors = useSimulationStore(selectValidationErrors);
  const [isExpanded, setIsExpanded] = useState(false);

  const allItems: NormalizedWarning[] = [
    ...(showValidationErrors ? validationErrors : []),
    ...warnings,
  ];

  if (allItems.length === 0) return null;

  const criticalCount = allItems.filter(w => w.severity === 'critical').length;
  const warningCount = allItems.filter(w => w.severity === 'warning').length;

  const highestSeverity = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'info';
  const cfg = SEVERITY_CONFIG[highestSeverity];
  const Icon = cfg.icon;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "p-1.5 transition-colors relative rounded-full shadow-sm hover:shadow active:scale-95 border",
          allItems.length > 0 ? "bg-white border-border text-slate-700" : "bg-transparent border-transparent text-slate-400 hover:text-primary"
        )}
      >
        <Bell className="w-5 h-5" />
        {allItems.length > 0 && (
          <span className={cn(
            "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full border-2 border-white text-[9px] font-black flex items-center justify-center text-white px-1",
            cfg.bar
          )}>
            {allItems.length > 9 ? '9+' : allItems.length}
          </span>
        )}
      </button>

      {isExpanded && allItems.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsExpanded(false)} />
          <div className="absolute right-0 top-full mt-3 w-[400px] max-h-[70vh] overflow-y-auto scrollbar-premium bg-white border border-border shadow-2xl rounded-2xl flex flex-col animate-in slide-in-from-top-2 fade-in duration-200 z-50">
            <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl shadow-sm">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-2 uppercase tracking-widest">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                System Alerts
              </h4>
              <span className={cn("text-[10px] font-mono font-black text-white px-2 py-0.5 rounded border shadow-sm", cfg.bar, "border-transparent")}>
                {allItems.length} ISSUES
              </span>
            </div>
            <div className="p-4 space-y-3 bg-slate-50/30">
              {allItems.map((w, i) => (
                <WarningRow key={`${w.code}-${i}`} w={w} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
