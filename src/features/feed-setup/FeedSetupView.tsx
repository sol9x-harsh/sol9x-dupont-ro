'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import {
  BookMarked,
  Save,
  Droplets,
  AlertTriangle,
  Waves,
  Info,
  Activity,
  Zap,
  RefreshCw,
  Plus,
  X,
  FlaskConical,
  Pencil,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumericInput } from '@/components/ui/numeric-input';
import { PresetModal } from '@/features/feed-setup/modals/PresetModal';

import { useFeedStore, getBlendedChemistry } from '@/store/feed-store';
import type { IonComposition, WaterType } from '@/store/feed-store';
import {
  fmtConc,
  fmtMeq,
  fmtChargeBalance,
  fmtOsmotic,
  fmtConductivity,
  fmtTDS,
} from '@/lib/fmt';
import {
  totalCationMeq,
  totalAnionMeq,
} from '@/core/chemistry/balance/charge-balance';
import { analyzeTDS } from '@/core/chemistry/tds/tds-analysis';
import { analyzeConductivityDual } from '@/core/chemistry/conductivity/conductivity-analysis';
import { estimateOsmoticPressureFromIons } from '@/core/chemistry/osmotic/osmotic-calculation';

// ─── Equivalent weights (g/eq) for meq/L and ppm CaCO₃ conversions ───────────

const EQ_WEIGHT: Partial<Record<keyof IonComposition, number>> = {
  // Cations
  ammonium: 18.038, // 18.038 / 1
  sodium: 22.99, // 22.99 / 1
  potassium: 39.1, // 39.10 / 1
  magnesium: 12.155, // 24.31 / 2
  calcium: 20.04, // 40.08 / 2
  strontium: 43.81, // 87.62 / 2
  barium: 68.665, // 137.33 / 2
  // Anions
  carbonate: 30.005, // 60.01 / 2
  bicarbonate: 61.02,
  nitrate: 62.0,
  fluoride: 19.0,
  chloride: 35.45,
  bromide: 79.904,
  sulfate: 48.03, // 96.06 / 2
  phosphate: 31.657, // 94.971 / 3
  // Neutrals: no meq/L
};

const CACACO3_EQ = 50.04;

function toMeqL(key: keyof IonComposition, mgL: number): number {
  const ew = EQ_WEIGHT[key];
  if (!ew || !isFinite(mgL) || mgL <= 0) return 0;
  return mgL / ew;
}

function toPpmCaCO3(key: keyof IonComposition, mgL: number): number {
  return toMeqL(key, mgL) * CACACO3_EQ;
}

// ─── Ion row configuration ────────────────────────────────────────────────────

interface IonRowConfig {
  storeKey: keyof IonComposition;
  sym: string;
  name: string;
  isNeutral?: boolean;
}

const CATION_ROWS: IonRowConfig[] = [
  { storeKey: 'ammonium', sym: 'NH₄⁺', name: 'Ammonium' },
  { storeKey: 'sodium', sym: 'Na⁺', name: 'Sodium' },
  { storeKey: 'potassium', sym: 'K⁺', name: 'Potassium' },
  { storeKey: 'magnesium', sym: 'Mg²⁺', name: 'Magnesium' },
  { storeKey: 'calcium', sym: 'Ca²⁺', name: 'Calcium' },
  { storeKey: 'strontium', sym: 'Sr²⁺', name: 'Strontium' },
  { storeKey: 'barium', sym: 'Ba²⁺', name: 'Barium' },
];

const ANION_ROWS: IonRowConfig[] = [
  { storeKey: 'carbonate', sym: 'CO₃²⁻', name: 'Carbonate' },
  { storeKey: 'bicarbonate', sym: 'HCO₃⁻', name: 'Bicarbonate' },
  { storeKey: 'nitrate', sym: 'NO₃⁻', name: 'Nitrate' },
  { storeKey: 'fluoride', sym: 'F⁻', name: 'Fluoride' },
  { storeKey: 'chloride', sym: 'Cl⁻', name: 'Chloride' },
  { storeKey: 'bromide', sym: 'Br⁻', name: 'Bromide' },
  { storeKey: 'sulfate', sym: 'SO₄²⁻', name: 'Sulfate' },
  { storeKey: 'phosphate', sym: 'PO₄³⁻', name: 'Phosphate' },
];

const NEUTRAL_ROWS: IonRowConfig[] = [
  { storeKey: 'silica', sym: 'SiO₂', name: 'Silica', isNeutral: true },
  { storeKey: 'boron', sym: 'B', name: 'Boron', isNeutral: true },
  { storeKey: 'co2', sym: 'CO₂', name: 'Carbon Dioxide', isNeutral: true },
];

// ─── Ion concentration table ──────────────────────────────────────────────────

function IonGroup({
  title,
  rows,
  ions,
  onIonChange,
  isRecalculating,
}: {
  title: 'Cations' | 'Anions' | 'Neutrals';
  rows: IonRowConfig[];
  ions: IonComposition;
  onIonChange: (key: keyof IonComposition, value: number) => void;
  isRecalculating?: boolean;
}) {
  const isNeutralGroup = title === 'Neutrals';

  const total = rows.reduce(
    (acc, r) => acc + (isFinite(ions[r.storeKey]) ? ions[r.storeKey] : 0),
    0,
  );

  const accentColor =
    title === 'Cations'
      ? {
          bar: 'bg-blue-500',
          header: 'bg-blue-50/80 text-blue-800',
          ring: 'focus-within:ring-blue-500/30 border-blue-100',
        }
      : title === 'Anions'
        ? {
            bar: 'bg-orange-500',
            header: 'bg-orange-50/80 text-orange-800',
            ring: 'focus-within:ring-orange-500/30 border-orange-100',
          }
        : {
            bar: 'bg-slate-400',
            header: 'bg-slate-50/80 text-slate-800',
            ring: 'focus-within:ring-slate-400/30 border-slate-100',
          };

  return (
    <Card className='border-border/60 overflow-hidden flex flex-col bg-white shadow-sm h-full'>
      {/* Table header */}
      <div className='px-3 py-2.5 border-b border-border/40 flex items-center justify-between bg-white shrink-0'>
        <div className='flex items-center gap-2'>
          <div className={`w-1.5 h-3.5 rounded-full ${accentColor.bar}`} />
          <h3 className='font-display font-bold text-[11px] uppercase tracking-widest text-foreground'>
            {title}
          </h3>
        </div>
        <Badge
          variant='outline'
          className='text-[10px] bg-card border-border/60 text-muted-foreground h-5 px-2'
        >
          {rows.length} ions
        </Badge>
      </div>

      <div className='flex-1 flex flex-col overflow-x-auto'>
        <div className='flex-1'>
          <table
            className='w-full text-[11px] border-collapse table-fixed'
            role='grid'
          >
            <thead
              className={cn(accentColor.header, 'border-b border-border/40')}
            >
              <tr>
                <th
                  className={cn(
                    'px-3 py-2 text-left font-semibold text-[10px] uppercase tracking-wider',
                    isNeutralGroup ? 'w-1/2' : 'w-1/4',
                  )}
                >
                  Ion
                </th>
                <th
                  className={cn(
                    'px-3 py-2 text-right font-semibold text-[10px] uppercase tracking-wider',
                    isNeutralGroup ? 'w-1/2' : 'w-1/4',
                  )}
                >
                  mg/L
                </th>
                {!isNeutralGroup && (
                  <>
                    <th className='px-3 py-2 text-right font-semibold text-[10px] uppercase tracking-wider hidden sm:table-cell w-1/4'>
                      ppm CaCO₃
                    </th>
                    <th className='px-3 py-2 text-right font-semibold text-[10px] uppercase tracking-wider w-1/4'>
                      meq/L
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-border/30'>
              {rows.map((row) => {
                const mgL = ions[row.storeKey] ?? 0;
                const meqL = toMeqL(row.storeKey, mgL);
                const ppmCaCO3 = toPpmCaCO3(row.storeKey, mgL);
                const hasValue = mgL > 0;

                return (
                  <tr
                    key={row.storeKey}
                    className='hover:bg-muted/10 transition-colors group'
                  >
                    <td
                      className={cn(
                        'px-3 py-1.5 bg-slate-50/40 border-r border-border/30',
                        isNeutralGroup ? 'w-1/2' : 'w-1/4',
                      )}
                    >
                      <div className='font-bold text-[11px] text-slate-700 leading-tight'>
                        {row.sym}
                      </div>
                    </td>
                    <td
                      className={cn(
                        'p-0 border-r border-border/30 relative',
                        accentColor.ring,
                        'focus-within:ring-1 focus-within:z-10 focus-within:bg-white',
                        isNeutralGroup ? 'w-1/2' : 'w-1/4',
                      )}
                    >
                      <NumericInput
                        value={mgL}
                        onChange={(v) => onIonChange(row.storeKey, v)}
                        min={0}
                        precision={3}
                        placeholder='0.000'
                        className={cn(
                          'h-[34px] w-full text-right text-[12px] px-2 rounded-none border-transparent bg-transparent focus:bg-transparent shadow-none focus-visible:ring-0',
                          hasValue
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground/40 focus:text-foreground focus:font-medium',
                        )}
                        aria-label={`${row.name} concentration in mg/L`}
                      />
                    </td>
                    {!isNeutralGroup && (
                      <>
                        <td className='px-3 py-1.5 text-right font-mono text-[11px] border-r border-border/30 bg-slate-50/20 text-muted-foreground hidden sm:table-cell w-1/4'>
                          {isRecalculating ? (
                            <span className='inline-block w-14 h-3 rounded animate-pulse bg-slate-200' />
                          ) : mgL > 0 ? (
                            fmtConc(ppmCaCO3)
                          ) : (
                            <span className='text-muted-foreground/30'>—</span>
                          )}
                        </td>
                        <td className='px-3 py-1.5 text-right font-mono text-[11px] text-muted-foreground w-1/4'>
                          {isRecalculating ? (
                            <span className='inline-block w-12 h-3 rounded animate-pulse bg-slate-200' />
                          ) : mgL > 0 ? (
                            fmtMeq(meqL)
                          ) : (
                            <span className='text-muted-foreground/30'>—</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sticky Footer */}
        <table className='w-full text-[11px] border-collapse table-fixed mt-auto bg-slate-50/60 border-t-2 border-border/60 shrink-0'>
          <tbody>
            <tr>
              <td
                className={cn(
                  'px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold border-r border-border/30',
                  isNeutralGroup ? 'w-1/2' : 'w-1/4',
                )}
              >
                Total
              </td>
              <td
                className={cn(
                  'px-3 py-2 text-right font-mono text-[12px] font-bold text-primary',
                  isNeutralGroup ? 'w-1/2' : 'w-1/4',
                  !isNeutralGroup && 'border-r border-border/30',
                )}
              >
                {isRecalculating ? (
                  <span className='inline-block w-16 h-3.5 rounded animate-pulse bg-slate-200' />
                ) : (
                  fmtConc(total)
                )}
              </td>
              {!isNeutralGroup && (
                <>
                  <td className='px-3 py-2 text-right font-mono text-[11px] border-r border-border/30 text-muted-foreground hidden sm:table-cell w-1/4'>
                    {isRecalculating ? (
                      <span className='inline-block w-14 h-3 rounded animate-pulse bg-slate-200' />
                    ) : (
                      fmtConc(
                        rows.reduce(
                          (s, r) =>
                            s + toPpmCaCO3(r.storeKey, ions[r.storeKey] ?? 0),
                          0,
                        ),
                      )
                    )}
                  </td>
                  <td className='px-3 py-2 text-right font-mono text-[11px] font-bold text-muted-foreground w-1/4'>
                    {isRecalculating ? (
                      <span className='inline-block w-12 h-3 rounded animate-pulse bg-slate-200' />
                    ) : (
                      fmtMeq(
                        rows.reduce(
                          (s, r) =>
                            s + toMeqL(r.storeKey, ions[r.storeKey] ?? 0),
                          0,
                        ),
                      )
                    )}
                  </td>
                </>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Physical properties field ────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  unit,
  range,
  required,
  className = '',
  onChange,
  readOnly,
  error,
}: {
  label: string;
  value: string | number;
  unit?: string;
  range?: string;
  required?: boolean;
  className?: string;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  error?: string;
}) {
  return (
    <div className={className}>
      <label className='text-[11px] text-muted-foreground font-medium block mb-1.5'>
        {required && <span className='text-destructive mr-0.5'>*</span>}
        {label}
      </label>
      <div className='flex items-center gap-1.5'>
        <NumericInput
          value={Number(value)}
          disabled={readOnly}
          onChange={(v) => onChange?.(v)}
          precision={3}
          className={cn(
            'h-9 font-mono text-sm border-input rounded-md px-3 border',
            readOnly
              ? 'bg-slate-100 border-slate-200 text-slate-500 opacity-80'
              : error
                ? 'bg-red-50 border-red-400 text-red-700'
                : 'bg-card',
          )}
        />
        {unit && (
          <span className='text-[11px] text-muted-foreground font-mono shrink-0'>
            {unit}
          </span>
        )}
      </div>
      {error ? (
        <p className='text-[10px] text-red-500 mt-1 font-medium'>{error}</p>
      ) : (
        range && (
          <p className='text-[10px] text-muted-foreground/60 mt-1 italic'>
            {range}
          </p>
        )
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

function formatStreamLabel(label: string): string {
  if (!label) return 'Stream 1';
  if (label.toLowerCase() === 'feed-01' || label.toLowerCase() === 'stream 01') return 'Stream 1';
  if (label.toLowerCase().startsWith('feed-0')) return label.replace(/feed-0/i, 'Stream ');
  if (label.toLowerCase().startsWith('stream 0')) return label.replace(/stream 0/i, 'Stream ');
  return label;
}

export function FeedSetupView() {
  const streamsMap = useFeedStore((s) => s.streams);
  const activeStreamId = useFeedStore((s) => s.activeStreamId);
  const addStream = useFeedStore((s) => s.addStream);
  const removeStream = useFeedStore((s) => s.removeStream);
  const setActiveStreamStore = useFeedStore((s) => s.setActiveStream);
  const setStreamLabelStore = useFeedStore((s) => s.setStreamLabel);
  const setStreamBlendPercentage = useFeedStore(
    (s) => s.setStreamBlendPercentage,
  );

  const streamsList = Object.values(streamsMap);
  const activeStreamLabel = formatStreamLabel(
    streamsMap[activeStreamId]?.streamLabel || 'Stream 1'
  );
  const [presetOpen, setPresetOpen] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState<string | null>(null);
  const [presetMode, setPresetMode] = useState<'choose' | 'save'>('choose');
  const [activeProfileName, setActiveProfileName] = useState<string | null>(
    null,
  );

  const setActiveStream = (id: string) => {
    setActiveStreamStore(id);
    setActiveProfileName(null);
  };
  const [isEditingStreamName, setIsEditingStreamName] = useState(false);
  const [editStreamNameValue, setEditStreamNameValue] = useState('');
  const [quickCompound, setQuickCompound] = useState<'NaCl' | 'MgSO4'>('NaCl');
  const [inputError, setInputError] = useState(false);
  const quickInputRef = useRef<HTMLInputElement>(null);
  const [doseValue, setDoseValue] = useState<string>('');

  const [directInputError, setDirectInputError] = useState(false);
  const directInputRef = useRef<HTMLInputElement>(null);

  const [isRecalculating, setIsRecalculating] = useState(false);
  const recalcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (recalcTimer.current) clearTimeout(recalcTimer.current);
    },
    [],
  );

  const ions = useFeedStore((s) => s.chemistry.ions);
  const ph = useFeedStore((s) => s.chemistry.ph);
  const designTemperature = useFeedStore((s) => s.chemistry.designTemperature);
  const minTemperature = useFeedStore((s) => s.chemistry.minTemperature);
  const maxTemperature = useFeedStore((s) => s.chemistry.maxTemperature);
  const activeTemperatureView = useFeedStore((s) => s.activeTemperatureView);
  const setActiveTemperatureView = useFeedStore(
    (s) => s.setActiveTemperatureView,
  );
  const turbidity = useFeedStore((s) => s.chemistry.turbidity);
  const sdi = useFeedStore((s) => s.chemistry.sdi);
  const waterType = useFeedStore((s) => s.waterType);
  const setWaterType = useFeedStore((s) => s.setWaterType);
  const updateIon = useFeedStore((s) => s.updateIon);
  const updateChemistryField = useFeedStore((s) => s.updateChemistryField);
  const hydrateFeed = useFeedStore((s) => s.hydrateFeed);

  const triggerRecalc = () => {
    setIsRecalculating(true);
    if (recalcTimer.current) clearTimeout(recalcTimer.current);
    recalcTimer.current = setTimeout(() => setIsRecalculating(false), 220);
  };

  const handleIonUpdate = (key: keyof IonComposition, value: number) => {
    updateIon(key, value);
    triggerRecalc();
  };

  // Default amounts (mg/L) applied when manual-add input is empty
  const ION_DEFAULT_ADD: Partial<Record<keyof IonComposition, number>> = {
    sodium: 50,
    calcium: 20,
    magnesium: 10,
    potassium: 10,
    ammonium: 2,
    strontium: 1,
    barium: 0.5,
    chloride: 50,
    sulfate: 20,
    bicarbonate: 30,
    nitrate: 5,
    fluoride: 1,
    bromide: 1,
    phosphate: 0.5,
    carbonate: 2,
    silica: 10,
    boron: 0.5,
    co2: 5,
  };

  const handleDirectAddIon = (ionKey: keyof IonComposition) => {
    setDirectInputError(false);
    const raw = directInputRef.current?.value ?? '';
    const numVal = parseFloat(raw);
    
    // If input is empty or zero, calculate amount needed for charge balance
    if (!isFinite(numVal) || numVal <= 0) {
      const isCation = CATION_ROWS.some(r => r.storeKey === ionKey);
      const ew = EQ_WEIGHT[ionKey];
      if (!ew) return;

      // Use current live totals
      const cationTotal = totalCationMeq(concMap);
      const anionTotal = totalAnionMeq(concMap);
      
      let neededMeqL = 0;
      if (isCation) {
        // Needed = Anions - (Other Cations)
        const currentMeq = (ions[ionKey] ?? 0) / ew;
        neededMeqL = anionTotal - (cationTotal - currentMeq);
      } else {
        // Needed = Cations - (Other Anions)
        const currentMeq = (ions[ionKey] ?? 0) / ew;
        neededMeqL = cationTotal - (anionTotal - currentMeq);
      }

      const newValMgL = Math.max(0, neededMeqL * ew);
      handleIonUpdate(ionKey, newValMgL);
    } else {
      // If a value is entered, add it to the current concentration
      const current = ions[ionKey] ?? 0;
      handleIonUpdate(ionKey, Math.max(0, current + numVal));
    }
    
    if (directInputRef.current) directInputRef.current.value = '';
  };

  // Build a flat concentration map once per render using IONS chemical symbol keys
  // (charge-balance, conductivity, and osmotic engines all key off IONS[id])
  const concMap: Record<string, number> = {
    NH4: ions.ammonium ?? 0,
    Na: ions.sodium ?? 0,
    K: ions.potassium ?? 0,
    Mg: ions.magnesium ?? 0,
    Ca: ions.calcium ?? 0,
    Sr: ions.strontium ?? 0,
    Ba: ions.barium ?? 0,
    CO3: ions.carbonate ?? 0,
    HCO3: ions.bicarbonate ?? 0,
    NO3: ions.nitrate ?? 0,
    F: ions.fluoride ?? 0,
    Cl: ions.chloride ?? 0,
    Br: ions.bromide ?? 0,
    SO4: ions.sulfate ?? 0,
    PO4: ions.phosphate ?? 0,
    SiO2: ions.silica ?? 0,
    B: ions.boron ?? 0,
    CO2: ions.co2 ?? 0,
  };

  // Active temperature for sensitivity display (Min/Design/Max context)
  const activeTemp =
    activeTemperatureView === 'min'
      ? minTemperature
      : activeTemperatureView === 'max'
        ? maxTemperature
        : designTemperature;

  const blendedChemistry = getBlendedChemistry();
  const blendedConcMap: Record<string, number> = {
    NH4: blendedChemistry.ions.ammonium ?? 0,
    Na: blendedChemistry.ions.sodium ?? 0,
    K: blendedChemistry.ions.potassium ?? 0,
    Mg: blendedChemistry.ions.magnesium ?? 0,
    Ca: blendedChemistry.ions.calcium ?? 0,
    Sr: blendedChemistry.ions.strontium ?? 0,
    Ba: blendedChemistry.ions.barium ?? 0,
    CO3: blendedChemistry.ions.carbonate ?? 0,
    HCO3: blendedChemistry.ions.bicarbonate ?? 0,
    NO3: blendedChemistry.ions.nitrate ?? 0,
    F: blendedChemistry.ions.fluoride ?? 0,
    Cl: blendedChemistry.ions.chloride ?? 0,
    Br: blendedChemistry.ions.bromide ?? 0,
    SO4: blendedChemistry.ions.sulfate ?? 0,
    PO4: blendedChemistry.ions.phosphate ?? 0,
    SiO2: blendedChemistry.ions.silica ?? 0,
    B: blendedChemistry.ions.boron ?? 0,
    CO2: blendedChemistry.ions.co2 ?? 0,
  };
  const blendedTDSResult = analyzeTDS(blendedConcMap);
  const blendedConductivityResult = analyzeConductivityDual(
    blendedTDSResult.tdsMgL,
    blendedConcMap,
    waterType,
  );

  // Inline temperature hierarchy validation errors
  const minTempError =
    minTemperature >= designTemperature
      ? 'Min Temp must be below Design Temp'
      : undefined;
  const designTempError =
    designTemperature <= minTemperature
      ? 'Design Temp must exceed Min Temp'
      : designTemperature >= maxTemperature
        ? 'Design Temp must be below Max Temp'
        : undefined;
  const maxTempError =
    maxTemperature <= designTemperature
      ? 'Max Temp must exceed Design Temp'
      : maxTemperature > 45
        ? 'Max Temp cannot exceed 45 °C'
        : undefined;

  // Live analytics — derived directly from feed store, no simulation run needed
  const tdsResult = analyzeTDS(concMap);
  const cationMeq = totalCationMeq(concMap);
  const anionMeq = totalAnionMeq(concMap);
  const chargeBalanceMeqL = cationMeq - anionMeq;
  const hasBalance = cationMeq + anionMeq > 0.01;
  const isChargeBalanced = hasBalance && Math.abs(chargeBalanceMeqL) < 0.01;
  const hasIons = Object.values(concMap).some((val) => val > 0);
  const conductivityResult = analyzeConductivityDual(
    tdsResult.tdsMgL,
    concMap,
    waterType,
  );
  const conductivityUsCm = conductivityResult.conductivityUsCm;
  const osmoticPressureBar = estimateOsmoticPressureFromIons(
    concMap,
    activeTemp,
  ).osmoticPressureBar;

  // Converts mg/L of a compound to mg/L of the target ion using mass fractions
  // NaCl MW=58.44, MgSO4 MW=120.37
  const toMgLForIon = (
    value: number,
    compound: 'NaCl' | 'MgSO4',
    ionKey: keyof IonComposition,
  ): number => {
    if (compound === 'NaCl') {
      if (ionKey === 'sodium') return value * (22.99 / 58.44);
      if (ionKey === 'chloride') return value * (35.45 / 58.44);
      return value;
    }
    // MgSO4
    if (ionKey === 'magnesium') return value * (24.31 / 120.37);
    if (ionKey === 'sulfate') return value * (96.06 / 120.37);
    return value;
  };

  const handleAddSolute = (ionKey: keyof IonComposition) => {
    // Read directly from the DOM ref — avoids stale closure if user clicks
    // an ion button immediately after typing without blurring the input first
    const raw = quickInputRef.current?.value ?? '';
    const numVal = parseFloat(raw);
    if (!isFinite(numVal) || numVal <= 0) {
      setInputError(true);
      setTimeout(() => setInputError(false), 2000);
      quickInputRef.current?.focus();
      return;
    }
    setInputError(false);
    const delta = toMgLForIon(numVal, quickCompound, ionKey);
    const current = ions[ionKey] ?? 0;
    handleIonUpdate(ionKey, Math.max(0, current + delta));
  };

  // Applies the compound dose to BOTH constituent ions simultaneously
  const handleApplyCompoundDose = () => {
    const raw = quickInputRef.current?.value ?? '';
    const numVal = parseFloat(raw);
    if (!isFinite(numVal) || numVal <= 0) {
      setInputError(true);
      setTimeout(() => setInputError(false), 2000);
      quickInputRef.current?.focus();
      return;
    }
    setInputError(false);
    if (quickCompound === 'NaCl') {
      handleIonUpdate(
        'sodium',
        Math.max(0, (ions.sodium ?? 0) + numVal * (22.99 / 58.44)),
      );
      handleIonUpdate(
        'chloride',
        Math.max(0, (ions.chloride ?? 0) + numVal * (35.45 / 58.44)),
      );
    } else {
      handleIonUpdate(
        'magnesium',
        Math.max(0, (ions.magnesium ?? 0) + numVal * (24.31 / 120.37)),
      );
      handleIonUpdate(
        'sulfate',
        Math.max(0, (ions.sulfate ?? 0) + numVal * (96.06 / 120.37)),
      );
    }
    if (quickInputRef.current) quickInputRef.current.value = '';
  };

  const handleAdjustBalance = (mode: string) => {
    const cationTotal = cationMeq;
    const anionTotal = anionMeq;

    if (mode === 'cations') {
      const naEW = EQ_WEIGHT.sodium!;
      const currentNaMeq = (ions.sodium ?? 0) / naEW;
      const neededNaMeq = anionTotal - (cationTotal - currentNaMeq);
      const newNa = neededNaMeq * naEW;
      if (newNa >= 0) handleIonUpdate('sodium', newNa);
    } else if (mode === 'anions') {
      const clEW = EQ_WEIGHT.chloride!;
      const currentClMeq = (ions.chloride ?? 0) / clEW;
      const neededClMeq = cationTotal - (anionTotal - currentClMeq);
      const newCl = neededClMeq * clEW;
      if (newCl >= 0) handleIonUpdate('chloride', newCl);
    } else if (mode === 'all') {
      if (cationTotal > anionTotal) {
        const clEW = EQ_WEIGHT.chloride!;
        const currentClMeq = (ions.chloride ?? 0) / clEW;
        const neededClMeq = cationTotal - (anionTotal - currentClMeq);
        const newCl = neededClMeq * clEW;
        if (newCl >= 0) handleIonUpdate('chloride', newCl);
      } else {
        const naEW = EQ_WEIGHT.sodium!;
        const currentNaMeq = (ions.sodium ?? 0) / naEW;
        const neededNaMeq = anionTotal - (cationTotal - currentNaMeq);
        const newNa = neededNaMeq * naEW;
        if (newNa >= 0) handleIonUpdate('sodium', newNa);
      }
    } else if (mode === 'co2') {
      const hco3EW = EQ_WEIGHT.bicarbonate!;
      const currentHCO3Meq = (ions.bicarbonate ?? 0) / hco3EW;
      const gap = cationTotal - anionTotal;
      const newHCO3Meq = currentHCO3Meq + gap;
      if (newHCO3Meq >= 0) handleIonUpdate('bicarbonate', newHCO3Meq * hco3EW);
    }
  };

  const handleAdjustPH = () => {
    const K1 = Math.pow(10, -6.35);
    const K2 = Math.pow(10, -10.33);
    const H = Math.pow(10, -ph);
    const MW_CO2 = 44.01;
    const MW_HCO3 = 61.02;
    const MW_CO3 = 60.01;

    const molCO2 = (ions.co2 ?? 0) / (MW_CO2 * 1000);
    const molHCO3 = (ions.bicarbonate ?? 0) / (MW_HCO3 * 1000);
    const molCO3 = (ions.carbonate ?? 0) / (MW_CO3 * 1000);
    const CT = molCO2 + molHCO3 + molCO3;

    if (CT <= 0) return;

    const denom = H * H + K1 * H + K1 * K2;
    const alpha0 = (H * H) / denom;
    const alpha1 = (K1 * H) / denom;
    const alpha2 = (K1 * K2) / denom;

    handleIonUpdate('co2', alpha0 * CT * MW_CO2 * 1000);
    handleIonUpdate('bicarbonate', alpha1 * CT * MW_HCO3 * 1000);
    handleIonUpdate('carbonate', alpha2 * CT * MW_CO3 * 1000);
  };

  return (
    <div
      className='px-4 py-3 lg:px-6 lg:py-4 max-w-[1600px] mx-auto min-h-screen bg-slate-50/80'
      role='main'
      aria-label='Feed Setup Workspace'
    >
      <PresetModal
        open={presetOpen}
        onOpenChange={setPresetOpen}
        initialMode={presetMode}
        onApply={(chemistry, profileName, presetType) => {
          const typeMap: Record<string, WaterType> = {
            'Seawater': 'Sea Water',
            'Sea Water': 'Sea Water',
            'Surface Water': 'Surface Water',
            'Well Water': 'Well Water',
            'Wastewater': 'Waste Water',
            'Waste Water': 'Waste Water',
            'Municipal Water': 'Municipal Water',
            'Softened Water': 'Softened Water',
            'RO/NF Permeate': 'RO/NF Permeate',
          };
          const mappedType: WaterType = typeMap[presetType] ?? 'Custom';
          hydrateFeed({ chemistry, preset: 'custom', waterType: mappedType });
          setActiveProfileName(profileName);
          triggerRecalc();
        }}
      />

      <AlertDialog
        open={!!streamToDelete}
        onOpenChange={(open) => !open && setStreamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stream</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stream? This action cannot be
              undone. The stream's blend percentage will be distributed among
              the remaining streams.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
              onClick={() => {
                if (streamToDelete) {
                  removeStream(streamToDelete);
                  triggerRecalc();
                }
                setStreamToDelete(null);
              }}
            >
              Delete Stream
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='flex items-start justify-between flex-wrap gap-3 mb-4'>
        <div className='space-y-0.5'>
          <h1 className='font-display text-2xl font-semibold text-foreground tracking-tight'>
            Feed Setup
          </h1>
          <p className='text-sm text-muted-foreground max-w-lg'>
            Define source water chemistry, ions, and pre-treatment conditions.
          </p>
        </div>
        {streamsList.length > 1 && (
          <div className='flex items-center gap-4 bg-primary/5 px-4 py-2 rounded-xl border border-primary/20 shrink-0'>
            <div className='flex flex-col'>
              <span className='text-[10px] uppercase tracking-wider text-primary font-bold'>
                Blended TDS
              </span>
              <span className='font-mono font-bold text-slate-800 text-lg leading-none mt-0.5'>
                {isRecalculating ? (
                  <span className='inline-block w-16 h-4 rounded animate-pulse bg-slate-200' />
                ) : (
                  fmtTDS(blendedTDSResult.tdsMgL)
                )}{' '}
                <span className='text-[10px] text-slate-500 font-sans'>
                  mg/L
                </span>
              </span>
            </div>
            <div className='w-px h-8 bg-primary/20' />
            <div className='flex flex-col'>
              <span className='text-[10px] uppercase tracking-wider text-primary font-bold'>
                Blended Cond.
              </span>
              <span className='font-mono font-bold text-slate-800 text-lg leading-none mt-0.5'>
                {isRecalculating ? (
                  <span className='inline-block w-16 h-4 rounded animate-pulse bg-slate-200' />
                ) : (
                  fmtConductivity(blendedConductivityResult.conductivityUsCm)
                )}{' '}
                <span className='text-[10px] text-slate-500 font-sans'>
                  µS/cm
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Stream tabs ── */}
      <div className='flex flex-wrap items-center gap-3 mb-5 pb-2'>
        {streamsList.map((stream) => {
          const isActive = activeStreamId === stream.id;
          return (
            <div
              key={stream.id}
              onClick={() => setActiveStream(stream.id)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveStream(stream.id);
                }
              }}
              className={cn(
                'group flex items-center gap-3 h-11 pl-4 pr-3 rounded-xl border select-none transition-all duration-200 cursor-pointer shrink-0',
                isActive
                  ? 'bg-primary/5 border-primary/30 shadow-sm ring-1 ring-primary/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <div className='flex items-center gap-2'>
                <Waves
                  className={cn(
                    'w-4 h-4 transition-colors duration-200',
                    isActive
                      ? 'text-primary'
                      : 'text-slate-400 group-hover:text-primary/60',
                  )}
                />
                <span
                  className={cn(
                    'text-[13px] font-semibold tracking-tight',
                    isActive ? 'text-primary' : 'text-slate-700',
                  )}
                >
                  {formatStreamLabel(stream.streamLabel)}
                </span>
              </div>

              {streamsList.length > 1 && (
                <div className='flex items-center gap-2 border-l border-slate-200 pl-3 ml-1'>
                  <div className='flex items-baseline gap-0.5'>
                    <NumericInput
                      min={0}
                      max={100}
                      precision={0}
                      value={Math.round(stream.blendPercentage || 0)}
                      onChange={(val) => {
                        if (isFinite(val)) {
                          setStreamBlendPercentage(stream.id, val);
                          triggerRecalc();
                        }
                      }}
                      className={cn(
                        'w-8 h-6 bg-transparent border-transparent text-right font-mono font-bold text-[14px] p-0 shadow-none focus:ring-0 focus:outline-none transition-colors',
                        isActive ? 'text-primary' : 'text-slate-700',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[11px] font-bold',
                        isActive ? 'text-primary/60' : 'text-slate-400',
                      )}
                    >
                      %
                    </span>
                  </div>

                  <div
                    className='opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md transition-all text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer ml-1'
                    onClick={(e) => {
                      e.stopPropagation();
                      setStreamToDelete(stream.id);
                    }}
                    title='Delete stream'
                  >
                    <X className='w-3.5 h-3.5' />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <button
          onClick={addStream}
          className='h-11 w-11 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all shrink-0 ml-1'
          title='Add stream'
        >
          <Plus className='w-4 h-4' />
        </button>
      </div>

      {/* ── Profile status bar ── */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 bg-white border border-border/60 rounded-xl p-4 shadow-sm transition-all'>
        <div className='flex flex-col gap-1.5'>
          <h2 className='text-sm text-slate-700 flex items-center gap-2'>
            You are currently viewing parameters for:{' '}
            {activeProfileName ? (
              <span className='text-primary font-bold'>
                {activeProfileName}
              </span>
            ) : isEditingStreamName ? (
              <div className='flex items-center gap-2'>
                <input
                  autoFocus
                  type='text'
                  value={editStreamNameValue}
                  onChange={(e) => setEditStreamNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editStreamNameValue.trim()) {
                      setStreamLabelStore(editStreamNameValue.trim());
                      setIsEditingStreamName(false);
                    } else if (e.key === 'Escape') {
                      setIsEditingStreamName(false);
                    }
                  }}
                  onBlur={() => {
                    if (editStreamNameValue.trim()) {
                      setStreamLabelStore(editStreamNameValue.trim());
                    }
                    setIsEditingStreamName(false);
                  }}
                  className='h-7 px-2 text-sm font-semibold text-primary border border-primary/40 rounded focus:outline-none focus:ring-1 focus:ring-primary w-48'
                />
              </div>
            ) : (
              <div
                className='flex items-center gap-1.5 text-primary font-semibold group cursor-pointer hover:bg-primary/5 px-2 py-0.5 rounded transition-colors -ml-2'
                onClick={() => {
                  setEditStreamNameValue(activeStreamLabel);
                  setIsEditingStreamName(true);
                }}
              >
                <span>Feed Setup - {activeStreamLabel}</span>
                <Pencil className='w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity' />
              </div>
            )}
          </h2>
        </div>
        <div className='flex items-center gap-3 w-full sm:w-auto'>
          <Button
            variant='outline'
            className='flex-1 sm:flex-none h-10 px-4 gap-2 text-xs font-bold border-border/60 hover:bg-slate-50 text-slate-600 rounded-lg transition-all shadow-sm'
            onClick={() => {
              setPresetMode('choose');
              setPresetOpen(true);
            }}
          >
            <BookMarked className='w-4 h-4 text-primary' />
            Browse Library
          </Button>
          <Button
            className='flex-1 sm:flex-none h-10 px-5 gap-2 text-xs font-bold bg-primary text-white hover:bg-primary/90 rounded-lg shadow-sm transition-all'
            onClick={() => {
              setPresetMode('save');
              setPresetOpen(true);
            }}
          >
            <Save className='w-4 h-4' />
            Save to Library
          </Button>
        </div>
      </div>

      {/* ── Source Water Properties ── */}
      <Card className='mb-3 border-border/40 shadow-sm overflow-hidden bg-white'>
        <div className='px-4 py-2.5 border-b border-border/40 bg-white flex items-center'>
          <h2 className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <Droplets className='w-4 h-4 text-primary' />
            Source Water Properties
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40'>
          {/* ── Column 1: Classification ── */}
          <div className='p-4 space-y-3'>
            <h3 className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5'>
              <Waves className='w-3 h-3' /> Classification
            </h3>
            <div>
              <label className='text-[11px] text-muted-foreground font-medium block mb-1.5'>
                Water Type
              </label>
              <Select
                value={waterType}
                onValueChange={(v) => setWaterType(v as WaterType)}
              >
                <SelectTrigger className='h-9 text-sm bg-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='RO/NF Permeate'>RO/NF Permeate</SelectItem>
                  <SelectItem value='Softened Water'>Softened Water</SelectItem>
                  <SelectItem value='Municipal Water'>
                    Municipal Water
                  </SelectItem>
                  <SelectItem value='Well Water'>Well Water</SelectItem>
                  <SelectItem value='Surface Water'>Surface Water</SelectItem>
                  <SelectItem value='Sea Water'>Sea Water</SelectItem>
                  <SelectItem value='Waste Water'>Waste Water</SelectItem>
                  <SelectItem value='Custom'>Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='text-[11px] text-muted-foreground font-medium block mb-1.5'>
                Pre-treatment Quality
              </label>
              <Select defaultValue='sdi5'>
                <SelectTrigger className='h-9 text-sm bg-white'>
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

          {/* ── Column 2: Physical Properties ── */}
          <div className='p-4 space-y-3'>
            <h3 className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5'>
              <Zap className='w-3 h-3' /> Physical Properties
            </h3>

            {/* pH */}
            <div className='grid grid-cols-2 gap-3'>
              <FieldInput
                label='Design pH'
                value={ph}
                range='Range 0–14'
                required
                onChange={(v) => {
                  if (isFinite(v) && v >= 0 && v <= 14)
                    updateChemistryField('ph', v);
                }}
              />
              <FieldInput
                label='pH @ 25 °C'
                value={(ph + 0.015 * (designTemperature - 25)).toFixed(2)}
                readOnly
              />
            </div>

            {/* Temperature Range */}
            <div className='grid grid-cols-3 gap-2'>
              <FieldInput
                label='Min Temp'
                value={minTemperature}
                unit='°C'
                range={`1–${designTemperature - 1}`}
                error={minTempError}
                onChange={(v) => {
                  if (isFinite(v) && v >= 1 && v <= 45)
                    updateChemistryField('minTemperature', v);
                }}
              />
              <FieldInput
                label='Design Temp'
                value={designTemperature}
                unit='°C'
                range={`${minTemperature + 1}–${maxTemperature - 1}`}
                error={designTempError}
                required
                onChange={(v) => {
                  if (isFinite(v) && v >= 1 && v <= 45)
                    updateChemistryField('designTemperature', v);
                }}
              />
              <FieldInput
                label='Max Temp'
                value={maxTemperature}
                unit='°C'
                range={`${designTemperature + 1}–45`}
                error={maxTempError}
                onChange={(v) => {
                  if (isFinite(v) && v >= 1 && v <= 45)
                    updateChemistryField('maxTemperature', v);
                }}
              />
            </div>
          </div>

          {/* ── Column 3: Contaminants ── */}
          <div className='p-4 space-y-3'>
            <h3 className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5'>
              <AlertTriangle className='w-3 h-3' /> Contaminants & Fouling
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              <FieldInput
                label='Turbidity'
                value={turbidity}
                unit='NTU'
                range='0–300'
                onChange={(v) => {
                  if (isFinite(v) && v >= 0)
                    updateChemistryField('turbidity', v);
                }}
              />
              <FieldInput label='TSS' value={2.0} unit='mg/L' range='0–100' />
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <FieldInput
                label='SDI₁₅'
                value={sdi}
                range='0–5'
                onChange={(v) => {
                  if (isFinite(v) && v >= 0 && v <= 5)
                    updateChemistryField('sdi', v);
                }}
              />
              <FieldInput
                label='Organics (TOC)'
                value={0.8}
                unit='mg/L'
                range='0–40'
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Solute Configuration ── */}
      <Card
        className={cn(
          'mb-3 border-border/40 shadow-sm overflow-hidden bg-white',
          isChargeBalanced && 'opacity-50 pointer-events-none',
        )}
        style={{ fontFamily: "'Open Sans', sans-serif" }}
      >
        <div className='px-4 py-2.5 border-b border-border/40 bg-white flex items-center gap-2'>
          <FlaskConical className='w-4 h-4 text-primary' />
          <h2 className='text-sm font-semibold text-foreground'>
            Solute Configuration
          </h2>
        </div>

        <div className='divide-y divide-border/30'>
          {/* ── Primary tools: 2-column grid ── */}
          <div className='grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/30'>
            {/* Panel A — Dose Concentration */}
            <div className='p-4 flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-3.5 rounded-full bg-violet-400' />
                <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                  Dose Concentration
                </span>
                <span className='text-[10px] text-muted-foreground/40'>
                  compound → ions
                </span>
              </div>

              {/* Input row */}
              <div className='flex items-center gap-2'>
                <div
                  className={cn(
                    'flex items-stretch border rounded-md overflow-hidden bg-white',
                    inputError ? 'border-destructive/60' : 'border-border/60',
                  )}
                >
                  <input
                    ref={quickInputRef}
                    type='number'
                    min='0'
                    step='any'
                    placeholder='0.000'
                    onFocus={() => setInputError(false)}
                    onChange={(e) => setDoseValue(e.target.value)}
                    className='w-24 h-9 px-3 font-mono text-sm bg-transparent outline-none border-none text-foreground placeholder:text-muted-foreground/30'
                  />
                  <div className='flex items-center px-2 bg-slate-50 border-l border-border/50'>
                    <span className='text-[10px] text-muted-foreground/60 select-none'>
                      mg/L
                    </span>
                  </div>
                </div>
                <Select
                  value={quickCompound}
                  onValueChange={(v) =>
                    setQuickCompound(v as typeof quickCompound)
                  }
                >
                  <SelectTrigger className='h-9 text-[11px] w-[86px] border-border/60 bg-white shadow-none focus:ring-1 focus:ring-primary/20 px-2.5 font-bold'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='NaCl' className='text-[11px]'>
                      NaCl
                    </SelectItem>
                    <SelectItem value='MgSO4' className='text-[11px]'>
                      MgSO₄
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Live preview */}
              <div className='rounded border border-border/40 bg-slate-50 px-3 py-2 text-[11px] leading-relaxed min-h-[38px] flex items-center'>
                {(() => {
                  const v = parseFloat(doseValue);
                  if (isFinite(v) && v > 0) {
                    if (quickCompound === 'NaCl') {
                      return (
                        <span>
                          <span className='text-blue-600 font-semibold font-mono'>
                            {((v * 22.99) / 58.44).toFixed(2)}
                          </span>
                          <span className='text-slate-400'> Na⁺ </span>
                          <span className='text-slate-300'>+</span>
                          <span className='text-orange-600 font-semibold font-mono'>
                            {' '}
                            {((v * 35.45) / 58.44).toFixed(2)}
                          </span>
                          <span className='text-slate-400'> Cl⁻ </span>
                          <span className='text-slate-300 text-[10px]'>
                            mg/L
                          </span>
                        </span>
                      );
                    }
                    return (
                      <span>
                        <span className='text-blue-600 font-semibold font-mono'>
                          {((v * 24.31) / 120.37).toFixed(2)}
                        </span>
                        <span className='text-slate-400'> Mg²⁺ </span>
                        <span className='text-slate-300'>+</span>
                        <span className='text-orange-600 font-semibold font-mono'>
                          {' '}
                          {((v * 96.06) / 120.37).toFixed(2)}
                        </span>
                        <span className='text-slate-400'> SO₄²⁻ </span>
                        <span className='text-slate-300 text-[10px]'>mg/L</span>
                      </span>
                    );
                  }
                  return (
                    <span className='text-slate-300 text-[10px] italic'>
                      {quickCompound === 'NaCl'
                        ? 'Na⁺ 39.4%  +  Cl⁻ 60.6%'
                        : 'Mg²⁺ 20.2%  +  SO₄²⁻ 79.8%'}
                    </span>
                  );
                })()}
              </div>

              {inputError && (
                <p className='text-[10px] text-destructive -mt-1'>
                  ⚠ Enter a compound dose value first
                </p>
              )}

              <button
                onClick={handleApplyCompoundDose}
                className='self-start flex items-center gap-1.5 h-8 px-3.5 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded hover:bg-violet-100 hover:border-violet-400/70 active:scale-[0.97] transition-all duration-100'
              >
                <Plus className='w-3.5 h-3.5' />
                Apply Dose
              </button>
            </div>

            {/* Panel B — Manual Ion Addition */}
            <div className='p-4 flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-3.5 rounded-full bg-emerald-400' />
                <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                  Manual Ion Addition
                </span>
                <span className='text-[10px] text-muted-foreground/40'>
                  direct mg/L
                </span>
              </div>

              {/* Input */}
              <div className='flex items-center gap-2'>
                <div
                  className={cn(
                    'flex items-stretch border rounded-md overflow-hidden bg-white',
                    directInputError
                      ? 'border-destructive/60'
                      : 'border-border/60',
                  )}
                >
                  <input
                    ref={directInputRef}
                    type='number'
                    min='0'
                    step='any'
                    placeholder='auto'
                    onFocus={() => setDirectInputError(false)}
                    className='w-24 h-9 px-3 font-mono text-sm bg-transparent outline-none border-none text-foreground placeholder:text-muted-foreground/30'
                  />
                  <div className='flex items-center px-2 bg-slate-50 border-l border-border/50'>
                    <span className='text-[10px] text-muted-foreground/60 select-none'>
                      mg/L
                    </span>
                  </div>
                </div>
                <span className='text-[10px] text-muted-foreground/40'>
                  empty = ion default
                </span>
              </div>

              {/* Ion button groups */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2.5'>
                  <span className='text-[9px] font-bold uppercase tracking-widest text-blue-400/80 w-11 shrink-0 text-right'>
                    Cat+
                  </span>
                  <div className='flex flex-wrap gap-1'>
                    {(
                      [
                        { key: 'sodium', sym: 'Na⁺', def: 50 },
                        { key: 'calcium', sym: 'Ca²⁺', def: 20 },
                        { key: 'magnesium', sym: 'Mg²⁺', def: 10 },
                        { key: 'potassium', sym: 'K⁺', def: 10 },
                        { key: 'ammonium', sym: 'NH₄⁺', def: 2 },
                      ] as {
                        key: keyof IonComposition;
                        sym: string;
                        def: number;
                      }[]
                    ).map(({ key, sym, def }) => (
                      <button
                        key={key}
                        onClick={() => handleDirectAddIon(key)}
                        title={`+${def} mg/L if empty`}
                        className='h-7 px-2.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 rounded hover:bg-blue-100 hover:border-blue-400/70 active:scale-95 transition-all duration-100'
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
                <div className='flex items-center gap-2.5'>
                  <span className='text-[9px] font-bold uppercase tracking-widest text-orange-400/80 w-11 shrink-0 text-right'>
                    An−
                  </span>
                  <div className='flex flex-wrap gap-1'>
                    {(
                      [
                        { key: 'chloride', sym: 'Cl⁻', def: 50 },
                        { key: 'sulfate', sym: 'SO₄²⁻', def: 20 },
                        { key: 'bicarbonate', sym: 'HCO₃⁻', def: 30 },
                        { key: 'nitrate', sym: 'NO₃⁻', def: 5 },
                        { key: 'silica', sym: 'SiO₂', def: 10 },
                      ] as {
                        key: keyof IonComposition;
                        sym: string;
                        def: number;
                      }[]
                    ).map(({ key, sym, def }) => (
                      <button
                        key={key}
                        onClick={() => handleDirectAddIon(key)}
                        title={`+${def} mg/L if empty`}
                        className='h-7 px-2.5 text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200/60 rounded hover:bg-orange-100 hover:border-orange-400/70 active:scale-95 transition-all duration-100'
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Utility strip: Charge Balance + Carbonate Equilibrium ── */}
          <div className='grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/30 bg-slate-50/50'>
            {/* Charge Balance */}
            <div className='px-4 py-3 flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-3 rounded-full bg-slate-300' />
                <span className='text-[9px] font-bold uppercase tracking-widest text-slate-400'>
                  Charge Balance
                </span>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {(
                  [
                    {
                      mode: 'cations',
                      label: 'via Na⁺',
                      desc: 'Adjust sodium to balance',
                    },
                    {
                      mode: 'anions',
                      label: 'via Cl⁻',
                      desc: 'Adjust chloride to balance',
                    },
                    {
                      mode: 'all',
                      label: 'Auto',
                      desc: 'Balance Na⁺ or Cl⁻ automatically',
                    },
                    {
                      mode: 'co2',
                      label: 'via HCO₃⁻',
                      desc: 'Adjust bicarbonate to balance',
                    },
                  ] as { mode: string; label: string; desc: string }[]
                ).map(({ mode, label, desc }) => (
                  <button
                    key={mode}
                    onClick={() => handleAdjustBalance(mode)}
                    title={desc}
                    className='flex items-center gap-1 h-7 px-2.5 text-[11px] text-slate-600 bg-white border border-border/60 rounded hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:scale-95 transition-all duration-100'
                  >
                    <RefreshCw className='w-2.5 h-2.5 opacity-50' />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Carbonate Equilibrium */}
            <div className='px-4 py-3 flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                <div className='w-1 h-3 rounded-full bg-teal-300' />
                <span className='text-[9px] font-bold uppercase tracking-widest text-slate-400'>
                  Carbonate Equilibrium
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <button
                  onClick={handleAdjustPH}
                  title={`Redistribute CO₂/HCO₃⁻/CO₃²⁻ at pH ${ph.toFixed(1)}`}
                  className='flex items-center gap-1.5 h-7 px-2.5 text-[11px] text-teal-700 bg-teal-50/80 border border-teal-200/70 rounded hover:bg-teal-100 hover:border-teal-400/60 active:scale-95 transition-all duration-100'
                >
                  <RefreshCw className='w-2.5 h-2.5 opacity-70' />
                  Redistribute at pH{' '}
                  <span className='font-mono'>{ph.toFixed(1)}</span>
                </button>
                <span className='text-[10px] text-muted-foreground/40'>
                  CO₂ ↔ HCO₃⁻ ↔ CO₃²⁻
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Empty State Guidance ── */}
      {!hasIons && (
        <div className='mb-4 bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center'>
          <FlaskConical className='w-10 h-10 text-primary/40 mb-3' />
          <h3 className='text-base font-bold text-slate-800 mb-1'>
            Begin Feed Chemistry Configuration
          </h3>
          <p className='text-[13px] text-slate-600 max-w-md'>
            This stream is currently empty. Use the Solute Configuration tools
            above to add compounds or manually enter ion concentrations below.
          </p>
        </div>
      )}

      {/* ── Ion Tables ── */}
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4'>
        <div className='lg:col-span-2'>
          <IonGroup
            title='Cations'
            rows={CATION_ROWS}
            ions={ions}
            onIonChange={handleIonUpdate}
            isRecalculating={isRecalculating}
          />
        </div>
        <div className='lg:col-span-2'>
          <IonGroup
            title='Anions'
            rows={ANION_ROWS}
            ions={ions}
            onIonChange={handleIonUpdate}
            isRecalculating={isRecalculating}
          />
        </div>
        <div className='lg:col-span-1'>
          <IonGroup
            title='Neutrals'
            rows={NEUTRAL_ROWS}
            ions={ions}
            onIonChange={handleIonUpdate}
            isRecalculating={isRecalculating}
          />
        </div>
      </div>

      {/* ── Simulation Warnings ── */}

      {/* ── Live Analytics Bar ── */}
      <div className='mb-4 bg-white border border-border/60 shadow-sm rounded-xl overflow-hidden'>
        <div className='grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border/40'>
          {/* TDS */}
          <div className='px-5 py-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors'>
            <div className='flex items-center gap-2 mb-1'>
              <div className='w-1.5 h-1.5 rounded-full bg-blue-500/80' />
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>
                Total Dissolved Solids
              </span>
            </div>
            <div className='flex items-baseline gap-1.5'>
              {isRecalculating ? (
                <span className='inline-block w-24 h-7 rounded animate-pulse bg-slate-200' />
              ) : (
                <span className='font-display font-bold text-2xl text-foreground tracking-tight'>
                  {fmtTDS(tdsResult.tdsMgL)}
                </span>
              )}
              <span className='text-xs text-muted-foreground font-medium'>
                mg/L
              </span>
            </div>
            {!isRecalculating && tdsResult.tdsMgL > 0 && (
              <span className='text-[10px] font-medium text-blue-600/80 bg-blue-500/10 px-2 py-0.5 rounded-full w-fit mt-1'>
                {tdsResult.classification}
              </span>
            )}
          </div>

          {/* Charge Balance */}
          <div className='px-5 py-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors'>
            <div className='flex items-center gap-2 mb-1'>
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  !hasBalance
                    ? 'bg-slate-300'
                    : Math.abs(chargeBalanceMeqL) < 0.01
                      ? 'bg-green-500'
                      : Math.abs(chargeBalanceMeqL) < 0.5
                        ? 'bg-yellow-500'
                        : 'bg-orange-500',
                )}
              />
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>
                Charge Balance
              </span>
            </div>
            <div className='flex items-baseline gap-1.5'>
              {isRecalculating ? (
                <span className='inline-block w-20 h-7 rounded animate-pulse bg-slate-200' />
              ) : (
                <span
                  className={cn(
                    'font-display font-bold text-2xl tracking-tight',
                    !hasBalance
                      ? 'text-muted-foreground'
                      : Math.abs(chargeBalanceMeqL) < 0.01
                        ? 'text-green-600'
                        : 'text-foreground',
                  )}
                >
                  {hasBalance ? fmtChargeBalance(chargeBalanceMeqL) : '—'}
                </span>
              )}
              <span className='text-xs text-muted-foreground font-medium'>
                meq/L
              </span>
            </div>
            {!isRecalculating && hasBalance && (
              <span className='text-[10px] font-mono text-muted-foreground/60 mt-1'>
                {cationMeq.toFixed(4)} cat / {anionMeq.toFixed(4)} an
              </span>
            )}
          </div>

          {/* Conductivity */}
          <div className='px-5 py-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors'>
            <div className='flex items-center gap-2 mb-1'>
              <div className='w-1.5 h-1.5 rounded-full bg-purple-500/80' />
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>
                Est. Conductivity
              </span>
            </div>
            <div className='flex items-baseline gap-1.5'>
              {isRecalculating ? (
                <span className='inline-block w-24 h-7 rounded animate-pulse bg-slate-200' />
              ) : (
                <span className='font-display font-bold text-2xl text-primary tracking-tight'>
                  {conductivityUsCm > 0
                    ? fmtConductivity(conductivityUsCm)
                    : '—'}
                </span>
              )}
              <span className='text-xs text-muted-foreground font-medium'>
                µS/cm
              </span>
            </div>
            <span className='text-[10px] font-medium text-muted-foreground/60 mt-1'>
              @ 25.0 °C
            </span>
          </div>

          {/* Osmotic Pressure */}
          <div className='px-5 py-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors'>
            <div className='flex items-center gap-2 mb-1'>
              <div className='w-1.5 h-1.5 rounded-full bg-teal-500/80' />
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>
                Osmotic Pressure
              </span>
            </div>
            <div className='flex items-baseline gap-1.5'>
              {isRecalculating ? (
                <span className='inline-block w-20 h-7 rounded animate-pulse bg-slate-200' />
              ) : (
                <span className='font-display font-bold text-2xl text-slate-700 tracking-tight'>
                  {osmoticPressureBar > 0
                    ? fmtOsmotic(osmoticPressureBar)
                    : '—'}
                </span>
              )}
              <span className='text-xs text-muted-foreground font-medium'>
                bar
              </span>
            </div>
            {activeTemperatureView !== 'design' ? (
              <span className='text-[9px] uppercase tracking-widest text-amber-500 font-bold mt-1'>
                Sensitivity · Not Simulation
              </span>
            ) : (
              <span className='text-[10px] font-medium text-muted-foreground/60 mt-1'>
                Estimated driving force
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Additional Notes ── */}
      <Card className='border-border/40 shadow-sm overflow-hidden bg-white mt-3'>
        <div className='px-4 pt-3 pb-2 flex items-center'>
          <h2 className='text-sm font-semibold text-foreground flex items-center gap-2'>
            <Info className='w-4 h-4 text-primary' />
            Additional Feed Water Information
          </h2>
        </div>
        <div className='px-4 pb-3'>
          <Textarea
            placeholder='Enter any additional notes, observations, or special requirements regarding the feed water chemistry...'
            className='min-h-[120px] resize-y bg-white text-sm border-border/40 focus-visible:ring-primary/20'
          />
        </div>
      </Card>
    </div>
  );
}
