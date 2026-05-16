'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sparkles, Globe2, Settings2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMetadata } from '@/hooks/useMetadata';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate?: (projectId: string) => void;
}

// We now use metadata from the hook
const DEFAULT_SEGMENTS = [
  'Mining',
  'Municipal Drinking',
  'Municipal Wastewater',
  'Oil & Gas',
  'Pharmaceutical',
  'Power',
  'Residential',
  'Others',
];

const UNITS = [
  ['Flow', 'gpm', 'm³/h'],
  ['Pressure', 'psi', 'bar'],
  ['Temperature', '°F', '°C'],
  ['Flux', 'gfd', 'LMH'],
  ['Area', 'ft²', 'm²'],
  ['Conductivity', '-', 'µS/cm'],
  ['Density', 'lb/gal', 'g/cm³'],
  ['Length', 'in', 'mm'],
];

export function CreateProjectModal({ open, onOpenChange, onCreate }: Props) {
  const queryClient = useQueryClient();
  const { data: meta } = useMetadata();

  const SEGMENTS = meta?.segments ?? DEFAULT_SEGMENTS;
  const COUNTRIES = meta?.countries ?? ['United States', 'India'];
  const CURRENCIES = meta?.currencies ?? ['US Dollar (USD)'];

  // Basic Info
  const [name, setName] = useState('');
  const [segment, setSegment] = useState('Municipal Drinking');
  const [client, setClient] = useState('');
  const [folder, setFolder] = useState<string>('none');
  const [notes, setNotes] = useState('');

  // Stakeholders
  const [designer, setDesigner] = useState('');
  const [company, setCompany] = useState('');

  // Location
  const [location, setLocation] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  // Settings
  const [currency, setCurrency] = useState('US Dollar (USD)');
  const [exchangeRate, setExchangeRate] = useState('1.00');
  const [unitSystem, setUnitSystem] = useState<'US' | 'METRIC' | 'USER'>(
    'METRIC',
  );
  const [userUnits, setUserUnits] = useState<Record<string, 'US' | 'METRIC'>>(
    Object.fromEntries(UNITS.map(([p]) => [p, 'METRIC'])),
  );

  const { data: foldersData } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const res = await fetch('/api/folders');
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    enabled: open,
    staleTime: 300000, // 5 minutes cache for folders in modal
  });

  const folders = foldersData?.folders ?? [];

  const [createError, setCreateError] = useState('');

  const close = () => {
    onOpenChange(false);
    setCreateError('');
    setName('');
    setClient('');
    setSegment('Municipal Drinking');
    setFolder('none');
    setNotes('');
    setDesigner('');
    setCompany('');
    setState('');
    setCity('');
  };

  const createProjectMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create project');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      close();
      onCreate?.(data.id);
    },
    onError: (err: any) => {
      setCreateError(err.message);
    },
  });

  const handleCreate = () => {
    createProjectMutation.mutate({
      name,
      segment,
      folder: folder === 'none' ? '' : folder,
      designer,
      company,
      client,
      location,
      state,
      city,
      currency,
      exchangeRate,
      unitSystem,
      userUnits,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col max-h-[96vh] sm:max-h-[90vh]'>
        {/* Header Section - Fixed */}
        <div className='relative px-6 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 bg-slate-50 border-b border-slate-100 shrink-0 overflow-hidden'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl' />
          <div className='relative flex items-center justify-between'>
            <div className='space-y-1'>
              <Badge
                variant='outline'
                className='bg-primary/5 text-primary border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 w-fit block'
              >
                New Design Project
              </Badge>
              <DialogTitle className='font-display text-xl sm:text-2xl font-semibold text-slate-900 leading-tight'>
                Configure New RO Project
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm text-slate-500 max-w-lg mt-1.5'>
                Define your project scope, engineering standards, and
                stakeholder information to initialize your design workflow.
              </DialogDescription>
            </div>
            <div className='hidden sm:flex flex-col items-end shrink-0'>
              <div className='text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-l border-slate-200 pl-4 py-1'>
                Project ID: SOL-2024
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content - Flexible */}
        <div className='flex-1 overflow-y-auto scrollbar-premium px-6 sm:px-8 py-6 sm:py-8'>
          <div className='grid grid-cols-12 gap-8 lg:gap-10'>
            {/* Left Column: Core Identity */}
            <div className='col-span-12 lg:col-span-7 space-y-8 sm:space-y-10'>
              {/* Identity Section */}
              <section className='space-y-5 sm:space-y-6'>
                <div className='flex items-center gap-2.5 border-b border-slate-100 pb-3'>
                  <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                    <Sparkles className='w-4 h-4' />
                  </div>
                  <h3 className='text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500'>
                    Project Identity
                  </h3>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6'>
                  <div className='sm:col-span-2 space-y-2'>
                    <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                      <span className='text-destructive mr-1'>*</span> Project
                      Name
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='e.g. SWRO Desalination - Jeddah Phase III'
                      className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium focus-visible:ring-primary/20 rounded-md'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                      Market Segment
                    </Label>
                    <Select value={segment} onValueChange={setSegment}>
                      <SelectTrigger className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-md'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEGMENTS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                      Storage Folder
                    </Label>
                    <Select value={folder} onValueChange={setFolder}>
                      <SelectTrigger className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-md'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>Root Workspace</SelectItem>
                        {folders.map((f: { name: string }) => (
                          <SelectItem key={f.name} value={f.name}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='sm:col-span-2 space-y-2'>
                    <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                      Project Scope & Notes
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder='Brief overview of the design goals…'
                      className='min-h-[80px] bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-primary/20 rounded-md resize-none'
                    />
                  </div>
                </div>
              </section>

              {/* Stakeholders Section */}
              <section className='space-y-5 sm:space-y-6'>
                <div className='flex items-center gap-2.5 border-b border-slate-100 pb-3'>
                  <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                    <Globe2 className='w-4 h-4' />
                  </div>
                  <h3 className='text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500'>
                    Stakeholders & Location
                  </h3>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6'>
                  <div className='space-y-2'>
                    <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                      Designer
                    </Label>
                    <Input
                      value={designer}
                      onChange={(e) => setDesigner(e.target.value)}
                      placeholder='John Doe'
                      className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-md'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                      Organization
                    </Label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder='Company Name'
                      className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-md'
                    />
                  </div>
                  <div className='sm:col-span-2 space-y-2'>
                    <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                      Customer / Client
                    </Label>
                    <Input
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder='Client Name'
                      className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-md'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                      Project Country
                    </Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-md'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                        State
                      </Label>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder='State'
                        className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-md'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                        City
                      </Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder='City'
                        className='h-10 sm:h-11 bg-slate-50 border-slate-200 text-slate-900 font-medium rounded-md'
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Technical Settings */}
            <div className='col-span-12 lg:col-span-5'>
              <div className='space-y-8'>
                <section className='space-y-5 sm:space-y-6'>
                  <div className='flex items-center gap-2.5 border-b border-slate-100 pb-3'>
                    <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                      <Settings2 className='w-4 h-4' />
                    </div>
                    <h3 className='text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500'>
                      Technical Standards
                    </h3>
                  </div>

                  <div className='p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-6'>
                    <div className='space-y-3'>
                      <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                        Regional Currency
                      </Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className='h-10 sm:h-11 bg-white border-slate-200 text-slate-900 font-semibold rounded-md shadow-sm'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className='flex items-center gap-2 px-1'>
                        <span className='text-[9px] sm:text-[10px] font-bold text-slate-500'>
                          RATE
                        </span>
                        <Input
                          value={exchangeRate}
                          onChange={(e) => setExchangeRate(e.target.value)}
                          className='h-7 sm:h-8 w-20 sm:w-24 font-mono text-[10px] sm:text-xs bg-white border-slate-300 text-slate-900 font-bold'
                        />
                        <span className='text-[9px] sm:text-[10px] text-slate-500 font-medium'>
                          vs USD ($)
                        </span>
                      </div>
                    </div>

                    <div className='space-y-4 pt-2 border-t border-slate-200'>
                      <Label className='text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider'>
                        Engineering Unit System
                      </Label>
                      <div className='bg-slate-200/50 p-1 rounded-lg grid grid-cols-3 gap-1'>
                        {(['US', 'METRIC', 'USER'] as const).map((u) => (
                          <button
                            key={u}
                            onClick={() => setUnitSystem(u)}
                            className={cn(
                              'text-[9px] sm:text-[10px] font-bold py-1.5 rounded-md transition-all uppercase tracking-wider',
                              unitSystem === u
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700',
                            )}
                          >
                            {u === 'USER' ? 'Custom' : u}
                          </button>
                        ))}
                      </div>

                      <div className='rounded-lg border border-slate-300 bg-white overflow-hidden shadow-sm'>
                        <div className='max-h-[220px] overflow-y-auto scrollbar-premium'>
                          {UNITS.map(([p, us, m]) => (
                            <div
                              key={p}
                              className='grid grid-cols-[1fr_50px_60px] gap-2 px-3 py-2.5 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors'
                            >
                              <span className='text-[10px] sm:text-[11px] font-bold text-slate-700 truncate'>
                                {p}
                              </span>
                              <Badge
                                variant='outline'
                                onClick={() =>
                                  unitSystem === 'USER' &&
                                  setUserUnits((v) => ({ ...v, [p]: 'US' }))
                                }
                                className={cn(
                                  'h-5 sm:h-6 justify-center font-mono text-[9px] sm:text-[10px] font-black cursor-pointer border-2 transition-all',
                                  unitSystem === 'US' ||
                                    (unitSystem === 'USER' &&
                                      userUnits[p] === 'US')
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'text-slate-400 border-slate-100',
                                )}
                              >
                                {us}
                              </Badge>
                              <Badge
                                variant='outline'
                                onClick={() =>
                                  unitSystem === 'USER' &&
                                  setUserUnits((v) => ({ ...v, [p]: 'METRIC' }))
                                }
                                className={cn(
                                  'h-5 sm:h-6 justify-center font-mono text-[9px] sm:text-[10px] font-black cursor-pointer border-2 transition-all',
                                  unitSystem === 'METRIC' ||
                                    (unitSystem === 'USER' &&
                                      userUnits[p] === 'METRIC')
                                    ? 'bg-primary text-white border-primary shadow-sm'
                                    : 'text-slate-400 border-slate-100',
                                )}
                              >
                                {m}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className='p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3'>
                  <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary'>
                    <Sparkles className='w-4 h-4' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-wider'>
                      Engineering Guide
                    </p>
                    <p className='text-[9px] sm:text-[10px] text-slate-600 leading-relaxed font-medium'>
                      Your selected unit system will propagate across all design
                      tabs. You can customize individual units after creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Fixed */}
        <div className='px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              onClick={close}
              disabled={createProjectMutation.isPending}
              className='text-sm text-slate-500 hover:text-slate-900 font-semibold'
            >
              Cancel
            </Button>
            {createError && (
              <span className='hidden sm:inline text-[11px] font-bold text-destructive uppercase tracking-widest animate-in fade-in slide-in-from-left-2'>
                {createError}
              </span>
            )}
          </div>
          <Button
            onClick={handleCreate}
            disabled={!name || createProjectMutation.isPending}
            className='h-10 sm:h-11 px-6 sm:px-8 rounded-full font-bold text-[10px] sm:text-xs uppercase tracking-widest gap-3 shadow-lg shadow-primary/30 transition-all active:scale-[0.98]'
            style={{
              background:
                'linear-gradient(135deg, hsl(215,55%,35%), hsl(210,50%,45%))',
              color: 'white',
            }}
          >
            {createProjectMutation.isPending ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Initializing…
              </>
            ) : (
              <>
                Create Design
                <ChevronRight className='w-4 h-4' />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M21 12a9 9 0 1 1-6.219-8.56' />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='m9 18 6-6-6-6' />
  </svg>
);
