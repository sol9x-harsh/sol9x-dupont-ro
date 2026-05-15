'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  FolderOpen,
  Save,
  Trash2,
  Search,
  Waves,
  Droplets,
  Zap,
  Info,
  ChevronRight,
  Activity,
  Loader2,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeedStore } from '@/store/feed-store';
import type { FeedChemistry, IonComposition } from '@/store/feed-store';
import {
  mapLibraryToFeedChemistry,
  ionsToCationGroups,
  ionsToAnionGroups,
  ionsToNeutralGroups,
  type LibraryEntry,
} from '@/features/feed-setup/lib/library-ion-map';
import {
  totalCationMeq,
  totalAnionMeq,
} from '@/core/chemistry/balance/charge-balance';

import { LIBRARY } from '@/features/feed-setup/lib/library-presets';

type Mode = 'choose' | 'save';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialMode?: Mode;
  onApply?: (chemistry: FeedChemistry, profileName: string, waterType: string) => void;
}

// Unified entry type for both hardcoded and API-saved entries
interface UnifiedEntry {
  id: string;
  name: string;
  type: string;
  tds: number;
  ph: number;
  sdi: number;
  temp: number;
  minTemp?: number;
  maxTemp?: number;
  cations: Record<string, number>;
  anions: Record<string, number>;
  neutrals: Record<string, number>;
  isGlobal: boolean;
  feedChemistry?: FeedChemistry; // set only for API-saved entries
}

interface ApiEntry {
  id: string;
  name: string;
  preset: string;
  chemistry: {
    ions: Record<string, number>;
    tds: number;
    conductivity: number;
    sdi: number;
    turbidity: number;
    ph: number;
    temperature?: number; // legacy
    designTemperature?: number;
    minTemperature?: number;
    maxTemperature?: number;
  };
  isGlobal: boolean;
  tags: string[];
}

function apiEntryToUnified(e: ApiEntry): UnifiedEntry {
  const ions = e.chemistry.ions as unknown as IonComposition;
  return {
    id: e.id,
    name: e.name,
    type: e.preset || 'Custom',
    tds: e.chemistry.tds,
    ph: e.chemistry.ph,
    sdi: e.chemistry.sdi ?? 0,
    temp: e.chemistry.temperature ?? e.chemistry.designTemperature ?? 25,
    minTemp: e.chemistry.minTemperature ?? 21,
    maxTemp: e.chemistry.maxTemperature ?? 30,
    cations: ionsToCationGroups(ions),
    anions: ionsToAnionGroups(ions),
    neutrals: ionsToNeutralGroups(ions),
    isGlobal: e.isGlobal,
    feedChemistry: {
      ions: ions,
      tds: e.chemistry.tds,
      conductivity: e.chemistry.conductivity ?? 0,
      sdi: e.chemistry.sdi ?? 0,
      turbidity: e.chemistry.turbidity ?? 0,
      ph: e.chemistry.ph,
      designTemperature:
        e.chemistry.designTemperature ?? e.chemistry.temperature ?? 25,
      minTemperature: e.chemistry.minTemperature ?? 21,
      maxTemperature: e.chemistry.maxTemperature ?? 30,
    },
  };
}

export function PresetModal({
  open,
  onOpenChange,
  initialMode = 'choose',
  onApply,
}: Props) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setSaveSuccess(false);
    }
  }, [open, initialMode]);

  const [selected, setSelected] = useState(LIBRARY[0].id);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('My Stream');
  const [description, setDescription] = useState('');
  const [classification, setClassification] = useState('Seawater');

  // Live feed store values (for Save mode)
  const { chemistry: liveChemistry } = useFeedStore();

  // Fetch user's saved library entries from API
  const { data: apiEntries = [] } = useQuery<ApiEntry[]>({
    queryKey: ['water-library'],
    queryFn: () => fetch('/api/library').then((r) => r.json()),
    enabled: open,
    staleTime: 30_000,
  });

  // Merge hardcoded LIBRARY (global) with API entries (user-saved + global-from-db)
  const allEntries = useMemo<UnifiedEntry[]>(() => {
    const hardcoded: UnifiedEntry[] = LIBRARY.map((e) => ({
      ...e,
      isGlobal: true,
    }));
    const fromApi = apiEntries
      .filter((e) => !e.isGlobal) // global ones are already in hardcoded list
      .map(apiEntryToUnified);
    return [...hardcoded, ...fromApi];
  }, [apiEntries]);

  // Save current feed to library
  const saveMutation = useMutation({
    mutationFn: () =>
      fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description,
          preset: classification,
          chemistry: liveChemistry,
          tags: [classification],
        }),
      }).then((r) => {
        if (!r.ok) throw new Error('Save failed');
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-library'] });
      setSaveSuccess(true);
      setTimeout(() => onOpenChange(false), 1500);
    },
  });

  // Delete a user-saved entry
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/library/${id}`, { method: 'DELETE' }).then((r) => {
        if (!r.ok) throw new Error('Delete failed');
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-library'] });
      // Select first remaining entry
      const next = allEntries.find((e) => e.id !== selected);
      if (next) setSelected(next.id);
    },
  });

  const filteredEntries = useMemo(
    () =>
      allEntries.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.type.toLowerCase().includes(search.toLowerCase()),
      ),
    [allEntries, search],
  );

  const preset = useMemo(
    () => allEntries.find((p) => p.id === selected) || allEntries[0],
    [allEntries, selected],
  );

  function handleApply() {
    if (!preset) return;
    let chemistry: FeedChemistry;
    if (preset.feedChemistry) {
      chemistry = preset.feedChemistry;
    } else {
      chemistry = mapLibraryToFeedChemistry(preset as LibraryEntry);
    }
    onApply?.(chemistry, preset.name, preset.type);
    onOpenChange(false);
  }

  // Live store ions converted to display groups (for Save mode ionic tables)
  const liveCations = useMemo(
    () => ionsToCationGroups(liveChemistry.ions),
    [liveChemistry.ions],
  );
  const liveAnions = useMemo(
    () => ionsToAnionGroups(liveChemistry.ions),
    [liveChemistry.ions],
  );
  const liveNeutrals = useMemo(
    () => ionsToNeutralGroups(liveChemistry.ions),
    [liveChemistry.ions],
  );

  const totals = (group: Record<string, number>) =>
    Object.values(group).reduce((a, b) => a + b, 0);

  const renderTable = (
    title: string,
    color: string,
    data: Record<string, number>,
  ) => (
    <div className='rounded-xl border border-border overflow-hidden bg-card shadow-sm'>
      <div
        className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-border/50 ${color}`}
      >
        {title}
      </div>
      <div className='grid grid-cols-2 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/20 font-semibold border-b border-border/40'>
        <span>Symbol</span>
        <span className='text-right'>mg/L</span>
      </div>
      <div className='max-h-[180px] overflow-y-auto scrollbar-premium'>
        {Object.entries(data).map(([k, v]) => (
          <div
            key={k}
            className='grid grid-cols-2 px-4 py-2 text-[11px] font-mono border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors'
          >
            <span className='font-bold text-slate-500'>{k}</span>
            <span className='text-right text-slate-700'>{v.toFixed(3)}</span>
          </div>
        ))}
      </div>
      <div className='grid grid-cols-2 px-4 py-2 text-[11px] font-mono font-bold bg-muted/40 border-t border-border/50'>
        <span className='text-muted-foreground uppercase text-[9px] tracking-widest'>
          Total
        </span>
        <span className='text-right text-primary'>
          {totals(data).toFixed(3)}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-6xl w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-slate-50'>
        <DialogHeader className='px-8 pt-8 pb-6 bg-white border-b border-slate-100'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2.5'>
              <div className='w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20'>
                <FolderOpen className='w-5 h-5 text-primary' />
              </div>
              <div>
                <DialogTitle className='font-display text-2xl tracking-tight'>
                  Water Library
                </DialogTitle>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Verified engineering water profiles & compositions
                </p>
              </div>
            </div>
            <div className='bg-slate-100 rounded-xl p-1 flex gap-1 shadow-inner'>
              <button
                onClick={() => setMode('choose')}
                className={cn(
                  'px-4 py-1.5 text-xs font-bold rounded-lg transition-all',
                  mode === 'choose'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-900',
                )}
              >
                Choose Profile
              </button>
              <button
                onClick={() => setMode('save')}
                className={cn(
                  'px-4 py-1.5 text-xs font-bold rounded-lg transition-all',
                  mode === 'save'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-900',
                )}
              >
                Save Current
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className='flex h-[75vh] max-h-[600px] min-h-[400px] overflow-hidden'>
          {/* ── MODE: CHOOSE ── */}
          {mode === 'choose' && (
            <>
              {/* Left Sidebar: Library List */}
              <div className='w-80 border-r border-slate-100 bg-white flex flex-col shrink-0'>
                <div className='p-4 border-b border-slate-50'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                    <Input
                      placeholder='Search profiles...'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className='pl-9 h-10 bg-slate-50 border-transparent focus:bg-white transition-all text-sm rounded-xl'
                    />
                  </div>
                </div>
                <div className='flex-1 overflow-y-auto scrollbar-premium p-3 space-y-1'>
                  {filteredEntries.map((p) => {
                    const Icon =
                      p.type === 'Seawater'
                        ? Waves
                        : p.type === 'Surface Water' || p.type === 'Lake'
                          ? Droplets
                          : Zap;
                    const isActive = selected === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelected(p.id)}
                        className={cn(
                          'w-full text-left p-3 rounded-xl transition-all group relative',
                          isActive
                            ? 'bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                            : 'hover:bg-slate-50',
                        )}
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                              isActive
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200',
                            )}
                          >
                            <Icon className='w-4 h-4' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-1.5'>
                              <span
                                className={cn(
                                  'text-xs font-bold truncate',
                                  isActive ? 'text-primary' : 'text-slate-700',
                                )}
                              >
                                {p.name}
                              </span>
                              {!p.isGlobal && (
                                <User className='w-2.5 h-2.5 text-amber-500 shrink-0' />
                              )}
                            </div>
                            <div className='text-[10px] text-slate-400 mt-0.5'>
                              {p.type} · {p.tds} mg/L
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight className='w-4 h-4 text-primary shrink-0' />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Details */}
              <div className='flex-1 overflow-y-auto scrollbar-premium p-8 bg-slate-50/50'>
                <div className='space-y-6'>
                  <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                    {[
                      { label: 'Water Type', value: preset.type, icon: Info },
                      {
                        label: 'TDS',
                        value: `${preset.tds} mg/L`,
                        icon: Activity,
                      },
                      { label: 'pH', value: preset.ph.toFixed(2), icon: Zap },
                      {
                        label: 'SDI₁₅',
                        value: preset.sdi.toFixed(1),
                        icon: Waves,
                      },
                      {
                        label: 'Temp',
                        value: `${preset.temp} °C`,
                        icon: Droplets,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className='rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow group'
                      >
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='p-1 rounded-md bg-slate-50 text-slate-400 group-hover:text-primary transition-colors'>
                            <item.icon className='w-3 h-3' />
                          </div>
                          <span className='text-[9px] uppercase tracking-[0.15em] text-slate-400 font-bold'>
                            {item.label}
                          </span>
                        </div>
                        <div className='font-display font-bold text-sm text-slate-900 tracking-tight'>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                    {renderTable(
                      'Cations',
                      'bg-blue-50/80 text-blue-600',
                      preset.cations,
                    )}
                    {renderTable(
                      'Anions',
                      'bg-orange-50/80 text-orange-600',
                      preset.anions,
                    )}
                    {renderTable(
                      'Neutrals',
                      'bg-slate-50/80 text-slate-500',
                      preset.neutrals,
                    )}
                  </div>

                  <div className='rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden'>
                    <div className='absolute top-0 right-0 p-8 opacity-5'>
                      <CheckCircle2 className='w-24 h-24 text-primary' />
                    </div>
                    {(() => {
                      const ions = preset.feedChemistry?.ions ?? mapLibraryToFeedChemistry(preset as LibraryEntry).ions;
                      const catMeq = totalCationMeq(ions as Record<string, number>);
                      const anMeq = totalAnionMeq(ions as Record<string, number>);
                      const cb = catMeq - anMeq;
                      return (
                        <div className='flex gap-12 relative z-10'>
                          <div>
                            <div className='text-[9px] uppercase tracking-widest text-primary/60 font-black mb-1'>
                              Total Solids (TDS)
                            </div>
                            <div className='font-mono text-xl font-bold text-primary'>
                              {preset.tds.toFixed(2)}{' '}
                              <span className='text-xs'>mg/L</span>
                            </div>
                          </div>
                          <div>
                            <div className='text-[9px] uppercase tracking-widest text-primary/60 font-black mb-1'>
                              Charge Balance
                            </div>
                            <div className='font-mono text-xl font-bold text-success flex items-center gap-2'>
                              <CheckCircle2 className='w-5 h-5' /> {cb.toFixed(6)}{' '}
                              <span className='text-xs uppercase tracking-wider opacity-60'>
                                meq/L
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <Button
                      onClick={handleApply}
                      className='relative z-10 h-11 px-6 rounded-xl bg-primary text-white font-bold text-xs gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all'
                    >
                      <CheckCircle2 className='w-4 h-4' /> Use This Profile
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── MODE: SAVE ── */}
          {mode === 'save' && (
            <div className='flex-1 overflow-y-auto scrollbar-premium bg-slate-50/20 p-8'>
              <div className='max-w-6xl mx-auto space-y-6'>
                <div className='bg-white rounded-2xl border border-border p-5 flex flex-col md:flex-row items-center gap-6 shadow-sm'>
                  <div className='flex-1 space-y-1.5 w-full'>
                    <Label className='text-[10px] uppercase tracking-[0.2em] text-primary font-black ml-1'>
                      Profile Identity
                    </Label>
                    <div className='relative group'>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className='h-12 rounded-xl text-base border-border bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 font-display font-bold transition-all pl-4 pr-12'
                        placeholder='Stream identification...'
                      />
                      <Save className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300' />
                    </div>
                  </div>
                  <div className='flex-1 space-y-1.5 w-full'>
                    <Label className='text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black ml-1'>
                      Description (optional)
                    </Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className='h-12 rounded-xl text-sm border-border bg-slate-50/50 focus:bg-white transition-all pl-4'
                      placeholder='e.g. Arabian Gulf post-storm sample'
                    />
                  </div>
                  <div className='w-full md:w-64 space-y-1.5'>
                    <Label className='text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black ml-1'>
                      Stream Classification
                    </Label>
                    <Select
                      value={classification}
                      onValueChange={setClassification}
                    >
                      <SelectTrigger className='h-12 rounded-xl border-border bg-slate-50/50 focus:bg-white font-bold text-slate-700'>
                        <SelectValue placeholder='Select classification' />
                      </SelectTrigger>
                      <SelectContent className='rounded-xl border-border'>
                        <SelectItem
                          value='RO/NF Permeate'
                          className='font-bold text-xs'
                        >
                          RO/NF Permeate
                        </SelectItem>
                        <SelectItem
                          value='Softened Water'
                          className='font-bold text-xs'
                        >
                          Softened Water
                        </SelectItem>
                        <SelectItem
                          value='Municipal Water'
                          className='font-bold text-xs'
                        >
                          Municipal Water
                        </SelectItem>
                        <SelectItem
                          value='Well Water'
                          className='font-bold text-xs'
                        >
                          Well Water
                        </SelectItem>
                        <SelectItem
                          value='Surface Water'
                          className='font-bold text-xs'
                        >
                          Surface Water
                        </SelectItem>
                        <SelectItem
                          value='Sea Water'
                          className='font-bold text-xs'
                        >
                          Sea Water
                        </SelectItem>
                        <SelectItem
                          value='Waste Water'
                          className='font-bold text-xs'
                        >
                          Waste Water
                        </SelectItem>
                        <SelectItem
                          value='Custom'
                          className='font-bold text-xs'
                        >
                          Custom
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
                  <div className='lg:col-span-12 space-y-4'>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        <div className='w-1 h-3 bg-primary rounded-full' />
                        <h3 className='text-[10px] font-black uppercase tracking-widest text-slate-900'>
                          Engineering Specifications (Read-Only)
                        </h3>
                      </div>
                      <Badge
                        variant='outline'
                        className='text-[9px] bg-orange-50 border-orange-100 text-orange-600 font-black px-2 py-0'
                      >
                        LOCKED TO ACTIVE STREAM
                      </Badge>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 opacity-90'>
                      {[
                        {
                          label: 'Turbidity',
                          unit: 'NTU',
                          value: liveChemistry.turbidity.toFixed(2),
                        },
                        {
                          label: 'SDI₁₅',
                          unit: '',
                          value: liveChemistry.sdi.toFixed(1),
                        },
                        {
                          label: 'pH',
                          unit: '',
                          value: liveChemistry.ph.toFixed(2),
                        },
                        {
                          label: 'Temp °C',
                          unit: '',
                          value: liveChemistry.designTemperature.toFixed(1),
                          active: true,
                        },
                        {
                          label: 'TDS',
                          unit: 'mg/L',
                          value: liveChemistry.tds.toFixed(1),
                        },
                        {
                          label: 'Conductivity',
                          unit: 'µS/cm',
                          value: liveChemistry.conductivity.toFixed(1),
                        },
                      ].map((prop) => (
                        <div
                          key={prop.label}
                          className={cn(
                            'rounded-xl border border-border p-3 shadow-sm relative overflow-hidden transition-all',
                            prop.active
                              ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10'
                              : 'bg-white',
                          )}
                        >
                          <Label className='text-[8px] uppercase tracking-widest text-slate-400 font-black mb-1.5 block'>
                            {prop.label}
                          </Label>
                          <div className='flex items-baseline gap-1.5'>
                            <span
                              className={cn(
                                'font-mono text-xs font-bold',
                                prop.active ? 'text-primary' : 'text-slate-600',
                              )}
                            >
                              {prop.value}
                            </span>
                            {prop.unit && (
                              <span className='text-[8px] font-black text-slate-300 uppercase'>
                                {prop.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-1 h-3 bg-primary rounded-full' />
                    <h3 className='text-[10px] font-black uppercase tracking-widest text-slate-900'>
                      Ionic Summary
                    </h3>
                  </div>
                  <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 opacity-95'>
                    {renderTable(
                      'Cations',
                      'bg-blue-50/80 text-blue-600',
                      liveCations,
                    )}
                    {renderTable(
                      'Anions',
                      'bg-orange-50/80 text-orange-600',
                      liveAnions,
                    )}
                    {renderTable(
                      'Neutrals',
                      'bg-slate-50/80 text-slate-500',
                      liveNeutrals,
                    )}
                  </div>
                </div>

                <div className='p-6 rounded-2xl bg-slate-900 text-white shadow-lg relative overflow-hidden group border-0 mt-2'>
                  <div className='absolute top-0 right-0 p-8 opacity-5 translate-x-1/4 -translate-y-1/4'>
                    <CheckCircle2 className='w-48 h-48' />
                  </div>
                  <div className='flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10'>
                        <Activity className='w-6 h-6 text-primary-soft' />
                      </div>
                      <div className='space-y-0.5'>
                        {saveSuccess ? (
                          <>
                            <h4 className='text-sm font-bold tracking-tight text-green-400 flex items-center gap-2'>
                              <CheckCircle2 className='w-4 h-4' /> Saved to
                              Library
                            </h4>
                            <p className='text-[10px] text-slate-400'>
                              Profile is now available in Browse Library.
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className='text-sm font-bold tracking-tight'>
                              Save to Your Library
                            </h4>
                            <p className='text-[10px] text-slate-400 leading-relaxed max-w-sm'>
                              Commits current composition as a reusable profile.
                            </p>
                          </>
                        )}
                        {saveMutation.isError && (
                          <p className='text-[10px] text-red-400'>
                            Save failed — please try again.
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => saveMutation.mutate()}
                      disabled={
                        saveMutation.isPending || saveSuccess || !name.trim()
                      }
                      className='h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2.5 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100'
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <Save className='w-4 h-4' />
                      )}
                      {saveMutation.isPending ? 'Saving…' : 'Commit & Save'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className='flex items-center justify-between gap-3 px-10 py-6 border-t border-border bg-white'>
          <div className='flex items-center gap-3'>
            {mode === 'choose' ? (
              <Button
                variant='ghost'
                disabled={
                  !preset || preset.isGlobal || deleteMutation.isPending
                }
                onClick={() => preset && deleteMutation.mutate(preset.id)}
                className='h-12 px-5 text-[11px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 hover:text-destructive gap-2 rounded-2xl disabled:opacity-30'
              >
                {deleteMutation.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Trash2 className='w-4 h-4' />
                )}
                Delete from library
              </Button>
            ) : (
              <div className='text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-xl border border-border'>
                <div className='w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]' />
                Serialization Active
              </div>
            )}
          </div>
          <div className='flex gap-4'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='h-12 px-8 text-[11px] font-black uppercase tracking-widest text-slate-500 border-border rounded-2xl hover:bg-slate-50 transition-all hover:border-slate-300'
            >
              Cancel
            </Button>
            {mode === 'choose' && (
              <Button
                onClick={handleApply}
                className='h-12 px-10 text-[11px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-slate-800 rounded-2xl gap-3 shadow-xl shadow-slate-200 transition-all active:scale-95 border-0 flex items-center'
              >
                <CheckCircle2 className='w-4 h-4' /> Use Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
