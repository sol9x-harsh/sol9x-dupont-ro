'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getMembraneCatalogByCategory } from '@/core/constants/membrane';

interface MembraneSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

type CategoryFilter = 'all' | 'bw' | 'sw' | 'nf';

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  bw: 'BW',
  sw: 'SW',
  nf: 'NF',
};

const CATEGORY_COLORS: Record<CategoryFilter, string> = {
  all: 'text-slate-600 border-slate-300 bg-slate-50 hover:bg-slate-100',
  bw: 'text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100',
  sw: 'text-cyan-700 border-cyan-300 bg-cyan-50 hover:bg-cyan-100',
  nf: 'text-violet-700 border-violet-300 bg-violet-50 hover:bg-violet-100',
};

const CATEGORY_ACTIVE: Record<CategoryFilter, string> = {
  all: 'bg-slate-700 text-white border-slate-700',
  bw: 'bg-blue-700 text-white border-blue-700',
  sw: 'bg-cyan-700 text-white border-cyan-700',
  nf: 'bg-violet-700 text-white border-violet-700',
};

const GROUP_HEADERS: Record<'sw' | 'bw' | 'nf', { label: string; color: string }> = {
  sw: { label: 'SEAWATER (SW)', color: 'text-cyan-700' },
  bw: { label: 'BRACKISH WATER (BW)', color: 'text-blue-700' },
  nf: { label: 'NANOFILTRATION (NF)', color: 'text-violet-700' },
};

export function MembraneSelector({
  value,
  onValueChange,
  disabled = false,
  className,
}: MembraneSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const catalog = useMemo(() => getMembraneCatalogByCategory(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchSearch = (label: string) => !q || label.toLowerCase().includes(q);
    return {
      sw:
        categoryFilter === 'all' || categoryFilter === 'sw'
          ? catalog.sw.filter((m) => matchSearch(m.label))
          : [],
      bw:
        categoryFilter === 'all' || categoryFilter === 'bw'
          ? catalog.bw.filter((m) => matchSearch(m.label))
          : [],
      nf:
        categoryFilter === 'all' || categoryFilter === 'nf'
          ? catalog.nf.filter((m) => matchSearch(m.label))
          : [],
    };
  }, [search, categoryFilter, catalog]);

  const totalVisible =
    filtered.sw.length + filtered.bw.length + filtered.nf.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-8 w-[200px] justify-between text-[11px] font-bold bg-white border-border shadow-sm rounded-lg px-3',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
        >
          <span className={cn('truncate', !value && 'text-muted-foreground/60')}>{value || 'Select Element'}</span>
          <ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 text-muted-foreground' />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className='w-[300px] p-0 border-border shadow-lg rounded-lg overflow-hidden'
        align='start'
        side='bottom'
      >
        {/* Search */}
        <div className='flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30'>
          <Search className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
          <input
            className='flex-1 bg-transparent text-[12px] font-mono placeholder:text-muted-foreground/60 outline-none'
            placeholder='Search membranes…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button
              className='text-[10px] text-muted-foreground hover:text-foreground'
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filter chips */}
        <div className='flex gap-1.5 px-3 py-2 border-b border-border bg-background'>
          {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'text-[10px] font-black uppercase px-2 py-0.5 rounded border transition-colors',
                categoryFilter === cat
                  ? CATEGORY_ACTIVE[cat]
                  : CATEGORY_COLORS[cat],
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Results list */}
        <div className='overflow-y-auto max-h-[300px] scroll-smooth'>
          {totalVisible === 0 ? (
            <div className='py-6 text-center text-[11px] text-muted-foreground font-mono'>
              No membranes match "{search}"
            </div>
          ) : (
            (['sw', 'bw', 'nf'] as const).map((group) => {
              const items = filtered[group];
              if (!items.length) return null;
              const { label: groupLabel, color } = GROUP_HEADERS[group];
              return (
                <div key={group}>
                  <div
                    className={cn(
                      'px-3 py-1.5 text-[9px] font-black uppercase tracking-widest sticky top-0 bg-muted/60 border-b border-border/50',
                      color,
                    )}
                  >
                    {groupLabel}
                  </div>
                  {items.map((mem) => (
                    <button
                      key={mem.label}
                      onClick={() => {
                        onValueChange(mem.label);
                        setOpen(false);
                        setSearch('');
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-left text-[11px] font-mono font-bold transition-colors',
                        mem.label === value
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted/60',
                      )}
                    >
                      <span>{mem.label}</span>
                      {mem.label === value && (
                        <Check className='h-3 w-3 text-primary shrink-0' />
                      )}
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Footer stats */}
        <div className='px-3 py-1.5 border-t border-border bg-muted/30 text-[9px] font-mono text-muted-foreground'>
          {totalVisible} element{totalVisible !== 1 ? 's' : ''} ·{' '}
          {catalog.sw.length} SW · {catalog.bw.length} BW · {catalog.nf.length} NF
        </div>
      </PopoverContent>
    </Popover>
  );
}
