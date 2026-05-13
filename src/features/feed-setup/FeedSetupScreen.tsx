'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  BookMarked,
  Save,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Waves,
  Info,
  Activity,
  Zap,
  Recycle,
  RefreshCw,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresetModal } from '@/components/modals/PresetModal';

type Ion = { sym: string; name: string; value: number };

const CATIONS: Ion[] = [
  { sym: 'NH₄', name: 'Ammonium', value: 0.05 },
  { sym: 'Na', name: 'Sodium', value: 10770 },
  { sym: 'K', name: 'Potassium', value: 399 },
  { sym: 'Mg', name: 'Magnesium', value: 1290 },
  { sym: 'Ca', name: 'Calcium', value: 411 },
  { sym: 'Sr', name: 'Strontium', value: 8.1 },
  { sym: 'Ba', name: 'Barium', value: 0.01 },
];
const ANIONS: Ion[] = [
  { sym: 'CO₃', name: 'Carbonate', value: 6.0 },
  { sym: 'HCO₃', name: 'Bicarbonate', value: 142 },
  { sym: 'NO₃', name: 'Nitrate', value: 0.7 },
  { sym: 'F', name: 'Fluoride', value: 1.3 },
  { sym: 'Cl', name: 'Chloride', value: 19400 },
  { sym: 'Br', name: 'Bromide', value: 67 },
  { sym: 'SO₄', name: 'Sulfate', value: 2710 },
  { sym: 'PO₄', name: 'Phosphate', value: 0.06 },
];
const NEUTRALS: Ion[] = [
  { sym: 'SiO₂', name: 'Silica', value: 1.5 },
  { sym: 'B', name: 'Boron', value: 4.6 },
  { sym: 'CO₂', name: 'Carbon Dioxide', value: 2.0 },
];

function IonGroup({
  title,
  ions,
  color,
  isNeutral = false,
}: {
  title: string;
  ions: Ion[];
  color: string;
  isNeutral?: boolean;
}) {
  const total = ions.reduce((acc, ion) => acc + ion.value, 0);

  const headerTheme =
    title === 'Cations'
      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      : title === 'Anions'
        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
        : 'bg-muted/50 text-muted-foreground border-border/50';

  const cellTheme =
    title === 'Cations'
      ? 'focus-visible:ring-blue-500/30'
      : title === 'Anions'
        ? 'focus-visible:ring-orange-500/30'
        : 'focus-visible:ring-slate-500/30';

  return (
    <Card className='border-border/60 overflow-hidden flex flex-col h-full bg-white shadow-sm'>
      <div className='px-4 py-3 border-b border-border/40 flex items-center justify-between bg-white'>
        <div className='flex items-center gap-2.5'>
          <div
            className={`w-1.5 h-4 rounded-full ${title === 'Cations' ? 'bg-blue-500' : title === 'Anions' ? 'bg-orange-500' : 'bg-slate-400'}`}
          />
          <h3 className='font-display font-bold text-xs uppercase tracking-widest text-foreground'>
            {title}
          </h3>
        </div>
        <div className='flex items-center gap-2'>
          <Badge
            variant='outline'
            className='text-[10px] font-mono bg-card border-border/60 text-muted-foreground shadow-sm'
          >
            {ions.length} ions
          </Badge>
        </div>
      </div>
      <div className='overflow-x-auto flex-1'>
        <table className='w-full text-[11px] border-collapse' role='grid'>
          <thead
            className={`${headerTheme} font-bold uppercase tracking-[0.1em] text-[9px] border-b`}
          >
            <tr>
              <th className='px-3 py-3 text-left border-r border-black/5 dark:border-white/5'>
                Symbol
              </th>
              <th className='px-3 py-3 text-right border-r border-black/5 dark:border-white/5'>
                mg/L
              </th>
              {!isNeutral && (
                <>
                  <th className='px-3 py-3 text-right border-r border-black/5 dark:border-white/5'>
                    ppm CaCO₃
                  </th>
                  <th className='px-3 py-3 text-right'>meq/L</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-border/40'>
            {ions.map((ion) => (
              <tr
                key={ion.sym}
                className='hover:bg-muted/30 transition-colors group'
              >
                <td className='px-3 py-1.5 font-bold text-muted-foreground bg-slate-50/50 w-16 text-[10px]'>
                  {ion.sym}
                </td>
                <td className='p-0 border-l border-border/40'>
                  <Input
                    defaultValue={ion.value.toFixed(3)}
                    className={`h-9 text-right font-mono text-[11px] border-transparent rounded-none bg-transparent hover:bg-muted/50 focus-visible:bg-card focus-visible:border-primary/30 focus-visible:ring-1 ${cellTheme} transition-all`}
                  />
                </td>
                {!isNeutral && (
                  <>
                    <td className='p-0 border-l border-border/40 bg-slate-50/30'>
                      <Input
                        defaultValue={(ion.value * 2.15).toFixed(3)}
                        className={`h-9 text-right font-mono text-[11px] border-transparent rounded-none bg-transparent hover:bg-muted/50 focus-visible:bg-card focus-visible:border-primary/30 focus-visible:ring-1 ${cellTheme} transition-all`}
                      />
                    </td>
                    <td className='p-0 border-l border-border/40'>
                      <Input
                        defaultValue={(ion.value / 22.4).toFixed(3)}
                        className={`h-9 text-right font-mono text-[11px] border-transparent rounded-none bg-transparent hover:bg-muted/50 focus-visible:bg-card focus-visible:border-primary/30 focus-visible:ring-1 ${cellTheme} transition-all`}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
           <tfoot className='bg-white border-t-2 border-border/60 text-foreground font-bold'>
            <tr>
              <td className='px-3 py-3 uppercase text-[9px] tracking-wider bg-white border-b border-border/40 text-muted-foreground'>
                Total
              </td>
              <td className='px-3 py-3 text-right font-mono border-l border-border/40 text-primary'>
                {total.toFixed(3)}
              </td>
              {!isNeutral && (
                <>
                  <td className='px-3 py-3 text-right font-mono border-l border-border/40 bg-slate-50/50 text-muted-foreground'>
                    {(total * 2.15).toFixed(3)}
                  </td>
                  <td className='px-3 py-3 text-right font-mono border-l border-border/40 text-muted-foreground'>
                    {(total / 22.4).toFixed(3)}
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

/* ─── Input field helper with label, unit and optional range hint ─── */
function FieldInput({
  label,
  value,
  unit,
  range,
  required,
  className = '',
}: {
  label: string;
  value: string;
  unit?: string;
  range?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className='text-[11px] text-muted-foreground font-medium block mb-1.5'>
        {required && <span className='text-destructive mr-0.5'>*</span>}
        {label}
      </label>
      <div className='flex items-center gap-1.5'>
        <Input
          defaultValue={value}
          className='h-9 font-mono text-sm border-input bg-card'
        />
        {unit && (
          <span className='text-[11px] text-muted-foreground font-mono shrink-0'>
            {unit}
          </span>
        )}
      </div>
      {range && (
        <p className='text-[10px] text-muted-foreground/60 mt-1 italic'>
          {range}
        </p>
      )}
    </div>
  );
}

export function FeedSetupScreen() {
  const [streams, setStreams] = useState(['Stream 01', 'Stream 02']);
  const [activeStream, setActiveStream] = useState('Stream 01');
  const [presetOpen, setPresetOpen] = useState(false);
  const [presetMode, setPresetMode] = useState<'choose' | 'save'>('choose');

  const openLibrary = (mode: 'choose' | 'save') => {
    setPresetMode(mode);
    setPresetOpen(true);
  };

  const addStream = () => {
    const nextNum = streams.length + 1;
    const newStream = `Stream ${nextNum.toString().padStart(2, '0')}`;
    setStreams([...streams, newStream]);
    setActiveStream(newStream);
  };

  const removeStream = (streamToRemove: string) => {
    if (streams.length <= 1) return;
    const newStreams = streams.filter(s => s !== streamToRemove);
    setStreams(newStreams);
    if (activeStream === streamToRemove) {
      setActiveStream(newStreams[0]);
    }
  };

  return (
    <div
      className='px-6 py-4 lg:px-8 lg:py-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/80'
      role='main'
      aria-label='Feed Setup Workspace'
    >
      <PresetModal
        open={presetOpen}
        onOpenChange={setPresetOpen}
        initialMode={presetMode}
      />

      <div className='flex items-start justify-between flex-wrap gap-4 mb-8'>
        <div className='space-y-1.5'>
          <h1 className='font-display text-3xl font-semibold text-foreground tracking-tight'>
            Feed Setup
          </h1>
          <p className='text-sm text-muted-foreground max-w-lg'>
            Define source water chemistry, ions, and pre-treatment conditions.
          </p>
        </div>
      </div>

      {/* ── Stream Selection Tabs ── */}
      <div className='flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide'>
        {streams.map((stream) => (
          <button
            key={stream}
            onClick={() => setActiveStream(stream)}
            className={cn(
              'h-10 pl-5 pr-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border relative group/stream',
              activeStream === stream
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-500 border-border hover:border-primary/30 hover:text-primary'
            )}
          >
            <Waves className={cn('w-3.5 h-3.5', activeStream === stream ? 'text-white/70' : 'text-primary/40')} />
            <span className='mr-1'>{stream}</span>
            {streams.length > 1 && (
              <div
                className={cn(
                  'w-5 h-5 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover/stream:opacity-100',
                  activeStream === stream 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-red-50 text-slate-300 hover:text-red-500'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  removeStream(stream);
                }}
              >
                <X className='w-3 h-3' />
              </div>
            )}
          </button>
        ))}
        <Button
          variant='outline'
          size='icon'
          onClick={addStream}
          className='h-10 w-10 rounded-xl border-dashed border-2 border-slate-200 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shrink-0'
        >
          <Plus className='w-4 h-4' />
        </Button>
      </div>
      {/* ── Status Header ── */}
      <div className='flex items-center justify-between mb-8 bg-white border border-border rounded-2xl px-6 py-5 shadow-sm hover:border-primary/30 transition-all duration-300'>
        <div className='flex flex-col gap-1.5'>
          <div className='flex items-center gap-2.5 mb-0.5'>
            <Badge variant='outline' className='bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0'>
              Active Profile
            </Badge>
            <div className='flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest'>
              <div className='w-1 h-1 rounded-full bg-primary animate-pulse' />
              {activeStream}
            </div>
          </div>
          <h2 className='text-2xl font-display font-bold text-slate-900 tracking-tight'>
            Seawater - <span className='text-primary'>Bay of Bengal</span>
          </h2>
        </div>
        
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            className='h-11 px-5 gap-2.5 text-xs font-bold border-border hover:bg-slate-50 text-slate-600 rounded-xl transition-all'
            onClick={() => openLibrary('choose')}
          >
            <BookMarked className='w-4 h-4 text-primary' /> 
            Browse Library
          </Button>
          <Button
            className='h-11 px-6 gap-2.5 text-xs font-bold bg-primary text-white hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5'
            onClick={() => openLibrary('save')}
          >
            <Save className='w-4 h-4' /> 
            Save to Library
          </Button>
        </div>
      </div>

      {/* ── Source Water Properties ── */}
      <Card className='mb-6 border-border/40 shadow-sm overflow-hidden bg-white'>
        <div className='px-5 py-3 border-b border-border/40 bg-white flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <Droplets className='w-4 h-4 text-primary' />
            Source Water Properties
          </h2>
        </div>

        <div className='p-5 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6'>
          {/* Column 1: Classification */}
          <div className='md:col-span-3 space-y-5'>
            <div>
              <h3 className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-1.5'>
                <Waves className='w-3 h-3' /> Classification
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='text-[11px] text-muted-foreground font-medium block mb-1.5'>
                    Water Type
                  </label>
                  <Select defaultValue='seawater'>
                    <SelectTrigger className='h-9 text-sm'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='surface'>Surface Water</SelectItem>
                      <SelectItem value='brackish'>Brackish Well</SelectItem>
                      <SelectItem value='seawater'>Seawater</SelectItem>
                      <SelectItem value='tertiary'>
                        Tertiary Effluent
                      </SelectItem>
                      <SelectItem value='custom'>Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-[11px] text-muted-foreground font-medium block mb-1.5'>
                    Water Sub-Type
                  </label>
                  <Select defaultValue='sdi5'>
                    <SelectTrigger className='h-9 text-sm'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='sdi5'>SDI &lt; 5</SelectItem>
                      <SelectItem value='sdi3'>SDI &lt; 3</SelectItem>
                      <SelectItem value='sdi1'>SDI &lt; 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className='hidden md:block md:col-span-1'>
            <div className='w-px h-full bg-border/40 mx-auto' />
          </div>

          {/* Column 2: Physical & Temperature */}
          <div className='md:col-span-4 space-y-5'>
            <div>
              <h3 className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-1.5'>
                <Zap className='w-3 h-3' /> Physical Properties
              </h3>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <FieldInput
                  label='pH @ 28.0 °C'
                  value='8.10'
                  range='Range 0 – 14'
                  required
                />
                <div>
                  <label className='text-[11px] text-muted-foreground font-medium block mb-1.5'>
                    pH @ 25.0 °C
                  </label>
                  <Input
                    defaultValue='8.14'
                    disabled
                    className='h-9 font-mono text-sm bg-primary-soft/50 border-primary/20 text-primary'
                  />
                  <p className='text-[10px] text-muted-foreground/60 mt-1 italic'>
                    Auto-calculated
                  </p>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-3'>
                <FieldInput
                  label='Min Temp'
                  value='24.0'
                  unit='°C'
                  range='1-45'
                />
                <FieldInput
                  label='Design Temp'
                  value='28.0'
                  unit='°C'
                  required
                />
                <FieldInput
                  label='Max Temp'
                  value='33.0'
                  unit='°C'
                  range='1-45'
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className='hidden md:block md:col-span-1'>
            <div className='w-px h-full bg-border/40 mx-auto' />
          </div>

          {/* Column 3: Contents */}
          <div className='md:col-span-3 space-y-5'>
            <div>
              <h3 className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-1.5'>
                <AlertTriangle className='w-3 h-3' /> Contaminants
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <FieldInput
                    label='Turbidity'
                    value='1.50'
                    unit='NTU'
                    range='0-300'
                  />
                  <FieldInput
                    label='TSS'
                    value='2.00'
                    unit='mg/L'
                    range='0-100'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <FieldInput label='SDI₁₅' value='4.00' range='0-5' />
                  <FieldInput
                    label='Organics'
                    value='0.80'
                    unit='mg/L'
                    range='0-40'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Solute Configuration & Quick Entry ── */}
      <Card className='mb-6 border-border/40 shadow-sm overflow-hidden bg-white'>
        <div className='px-5 py-3 border-b border-border/40 bg-white flex items-center justify-between flex-wrap gap-4'>
          <h2 className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <Activity className='w-4 h-4 text-primary' />
            Solute Configuration
          </h2>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 bg-background border border-border/60 rounded-md px-2 py-1 shadow-sm'>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-1'>
                Balance:
              </span>
              <Select defaultValue='all'>
                <SelectTrigger className='h-6 text-[11px] w-[120px] border-transparent bg-transparent shadow-none focus:ring-0 focus:ring-offset-0'>
                  <SelectValue placeholder='Select...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all' className='text-[11px]'>
                    All Ions
                  </SelectItem>
                  <SelectItem value='cations' className='text-[11px]'>
                    Cations
                  </SelectItem>
                  <SelectItem value='anions' className='text-[11px]'>
                    Anions
                  </SelectItem>
                  <SelectItem value='co2' className='text-[11px]'>
                    Total CO₂/HCO₃
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className='w-px h-4 bg-border/60' />
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10'
                title='Reconcile Ions'
              >
                <RefreshCw className='w-3.5 h-3.5' />
              </Button>
            </div>

            <div className='flex items-center gap-1 bg-background border border-border/60 rounded-md px-2 py-1 shadow-sm'>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold pl-1 pr-0.5'>
                Adjust pH
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10'
                title='Update pH'
              >
                <RefreshCw className='w-3.5 h-3.5' />
              </Button>
            </div>
          </div>
        </div>

        <div className='p-5'>
          <Tabs defaultValue='quick' className='w-full'>
            <TabsList className='mb-6 bg-slate-50/50 border border-border/50 h-9'>
              <TabsTrigger value='quick' className='text-xs px-6'>
                Quick Entry
              </TabsTrigger>
              <TabsTrigger value='manual' className='text-xs px-6'>
                Add Solutes Manually
              </TabsTrigger>
            </TabsList>

            <TabsContent value='quick' className='mt-0'>
              <div className='flex items-center gap-6'>
                <div className='space-y-2 max-w-sm w-full'>
                  <label className='text-[11px] text-muted-foreground font-medium block'>
                    Target Concentration
                  </label>
                  <div className='flex items-center gap-2'>
                    <Input
                      defaultValue=''
                      placeholder='Enter value'
                      className='h-9 font-mono text-sm bg-card'
                    />
                    <Select defaultValue='mgNaCl'>
                      <SelectTrigger className='h-9 text-xs w-[140px] bg-card'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='mgNaCl'>mg/L NaCl</SelectItem>
                        <SelectItem value='ppm'>ppm</SelectItem>
                        <SelectItem value='meq'>meq/L</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className='text-[10px] text-muted-foreground/60 italic'>
                    Acceptable range: 0 – 70,000
                  </p>
                </div>

                <div className='hidden md:block w-px h-16 bg-border/40 mx-4' />

                <div className='flex-1 text-sm text-muted-foreground'>
                  <p className='leading-relaxed'>
                    Enter a target concentration value to automatically scale
                    and balance all currently active ions in the water
                    composition while preserving their relative ratios.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='manual' className='mt-0'>
              <div className='space-y-3'>
                <p className='text-[11px] text-muted-foreground font-medium block'>
                  Select a solute to add it to the composition tables below:
                </p>
                <div className='flex flex-wrap gap-2.5'>
                  {[
                    'Sodium (Na)',
                    'Calcium (Ca)',
                    'Ammonia (NH₄)',
                    'Chloride (Cl)',
                    'Sulfate (SO₄)',
                    'Potassium (K)',
                    'Magnesium (Mg)',
                  ].map((s) => (
                    <Button
                      key={s}
                      variant='outline'
                      size='sm'
                      className='text-xs h-8 px-3.5 gap-1.5 hover:border-primary/40 hover:text-primary transition-colors bg-card shadow-sm'
                    >
                      + {s}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* ── Ions Section ── */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mb-4'>
        <div className='lg:col-span-4'>
          <IonGroup title='Cations' ions={CATIONS} color='bg-permeate/80' />
        </div>
        <div className='lg:col-span-5'>
          <IonGroup title='Anions' ions={ANIONS} color='bg-concentrate/80' />
        </div>
        <div className='lg:col-span-3'>
          <IonGroup
            title='Neutrals'
            ions={NEUTRALS}
            color='bg-muted-foreground/30 text-muted-foreground'
            isNeutral
          />
        </div>
      </div>

      {/* ── Live Analytics Bar ── */}
      <div className='flex items-center justify-around flex-wrap gap-6 mb-6 bg-white border border-border/60 shadow-sm rounded-xl px-6 py-6 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-permeate/5 pointer-events-none' />
        <div className='absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent' />
        {[
          {
            label: 'Total Dissolved Solids',
            value: '35,206.37',
            unit: 'mg/L',
            color: 'text-foreground',
          },
          {
            label: 'Charge Balance',
            value: '0.000003',
            unit: 'meq/L',
            color: 'text-success',
          },
          {
            label: 'Estimated Conductivity',
            value: '52,480.00',
            unit: 'µS/cm',
            color: 'text-primary',
          },
        ].map((item, idx, arr) => (
          <div
            key={item.label}
            className='flex flex-col items-center gap-1 z-10'
          >
            <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5'>
              {item.label}
              {idx === 1 && <CheckCircle2 className='w-3 h-3 text-success' />}
            </span>
            <div className='flex items-baseline gap-1.5'>
              <span className={`font-mono font-bold text-lg ${item.color}`}>
                {item.value}
              </span>
              <span className='text-[10px] text-muted-foreground/80 font-medium'>
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Card className='border-border/40 shadow-sm overflow-hidden bg-white mt-6'>
        <div className='px-5 pt-5 pb-3 flex items-center justify-between'>
          <h2 className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <Info className='w-4 h-4 text-primary' />
            Additional Feed Water Information
          </h2>
        </div>
        <div className='px-5 pb-5'>
          <Textarea
            placeholder='Enter any additional notes, observations, or special requirements regarding the feed water chemistry...'
            className='min-h-[150px] resize-y bg-white text-sm border-border/40 focus-visible:ring-primary/20'
          />
        </div>
      </Card>
    </div>
  );
}
