'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileDown,
  Printer,
  LayoutDashboard,
  Check,
  ChevronRight,
  Thermometer,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ReportHeader } from '@/components/report/ReportHeader';
import { SystemSummary } from '@/components/report/SystemSummary';
import { FlowTables } from '@/components/report/FlowTables';
import { ChemicalAnalysis } from '@/components/report/ChemicalAnalysis';
import { CostBreakdown } from '@/components/report/CostBreakdown';
import { SystemDesignPFD } from '@/components/report/SystemDesignPFD';
import { ProcessFlowDiagram } from '@/components/ProcessFlowDiagram';
import {
  ProjectMetadata,
  SystemOverview,
  PassSummary,
  StreamData,
  StageFlowData,
  ElementFlowData,
  SoluteData,
  ScalingData,
  CostData,
  EnergyCostData,
  ChemicalCostData,
} from '@/components/report/report-types';

const MOCK_METADATA: ProjectMetadata = {
  projectNo: 'TP-12',
  projectName: 'Chennai SWRO Desalination - Phase II',
  dateCreated: '2026-05-01',
  lastModified: '2026-05-07',
  elements: [
    { model: 'SW30XFR-400/34', count: 6300 },
    { model: 'BW30 PRO-400', count: 500 },
  ],
  caseName: 'WAVE PRO Case 1',
  preparedBy: 'H. Kumar',
  company: 'SOL9X Engineering Services',
  customer: 'Tata Projects Ltd.',
  country: 'India',
  marketSegment: 'Municipal Drinking',
  appVersion: '8.0.1',
  designWarnings: ['System Recovery above recommended limit for seawater'],
};

const MOCK_OVERVIEW: SystemOverview = {
  totalUnits: 1,
  online: 1,
  standby: 0,
  roRecovery: 42.0,
  systemFeed: 250.0,
  systemPermeate: 105.0,
};

const MOCK_PASSES: PassSummary[] = [
  {
    name: 'Pass 1',
    waterType: 'Seawater',
    numElements: 294,
    totalActiveArea: 10937,
    feedFlow: 250.0,
    feedTds: 35206,
    feedPressure: 58.4,
    flowFactor: 0.85,
    permeateFlow: 105.0,
    avgFlux: 9.6,
    permeateTds: 88,
    netRecovery: 42.0,
    avgNdp: 12.4,
    specificEnergy: 3.85,
    temp: 28,
    pH: 8.1,
  },
  {
    name: 'Pass 2b',
    waterType: 'Brackish Water',
    numElements: 42,
    totalActiveArea: 1562,
    feedFlow: 105.0,
    feedTds: 88,
    feedPressure: 12.5,
    flowFactor: 0.95,
    permeateFlow: 94.5,
    avgFlux: 15.2,
    permeateTds: 2,
    netRecovery: 90.0,
    avgNdp: 4.8,
    specificEnergy: 0.45,
    temp: 28,
    pH: 7.2,
    chemicalDose: 'NaOH (5.2 mg/L)',
  },
];

const MOCK_STREAMS: StreamData[] = [
  { id: '1', name: 'System Feed', flow: 250.0, tds: 35206, pressure: 2.5 },
  { id: '2', name: 'Net Feed', flow: 250.0, tds: 35206, pressure: 58.4 },
  { id: '3', name: 'Concentrate', flow: 145.0, tds: 60520, pressure: 57.0 },
  { id: '4', name: 'Pass 1 Permeate', flow: 105.0, tds: 88, pressure: 0.5 },
  { id: '5', name: 'System Permeate', flow: 94.5, tds: 2, pressure: 0.2 },
];

const MOCK_STAGES: StageFlowData[] = [
  {
    stage: 1,
    elements: 294,
    pv: 42,
    elsPerPv: 7,
    feedFlow: 250.0,
    recircFlow: 0,
    feedPress: 58.4,
    boostPress: 0,
    concFlow: 145.0,
    concPress: 57.0,
    pressDrop: 1.4,
    permFlow: 75.0,
    avgFlux: 10.2,
    permPress: 0.5,
    permTds: 120,
  },
  {
    stage: 2,
    elements: 147,
    pv: 21,
    elsPerPv: 7,
    feedFlow: 145.0,
    recircFlow: 0,
    feedPress: 57.0,
    boostPress: 0,
    concFlow: 110.0,
    concPress: 56.1,
    pressDrop: 0.9,
    permFlow: 30.0,
    avgFlux: 8.4,
    permPress: 0.5,
    permTds: 450,
  },
];

const MOCK_ELEMENTS: ElementFlowData[] = [
  {
    name: 'Element 1',
    recovery: 8.5,
    feedFlow: 5.95,
    feedPress: 58.4,
    feedTds: 35206,
    concFlow: 5.45,
    permFlow: 0.51,
    permFlux: 12.4,
    permTds: 45,
  },
  {
    name: 'Element 7',
    recovery: 6.2,
    feedFlow: 4.12,
    feedPress: 57.2,
    feedTds: 58400,
    concFlow: 3.86,
    permFlow: 0.26,
    permFlux: 6.8,
    permTds: 120,
  },
];

const MOCK_SOLUTES: SoluteData[] = [
  {
    ion: 'Sodium (Na⁺)',
    rawFeed: '10,810',
    phAdjustedFeed: '10,810',
    concentrate: '18,520',
    permeate: '28.4',
  },
  {
    ion: 'Chloride (Cl⁻)',
    rawFeed: '19,350',
    phAdjustedFeed: '19,350',
    concentrate: '33,200',
    permeate: '52.1',
  },
  {
    ion: 'Sulfate (SO₄⁻²)',
    rawFeed: '2,710',
    phAdjustedFeed: '2,710',
    concentrate: '4,650',
    permeate: '1.2',
  },
  {
    ion: 'Calcium (Ca⁺²)',
    rawFeed: '410',
    phAdjustedFeed: '410',
    concentrate: '704',
    permeate: '0.4',
  },
  {
    ion: 'Conductivity (µS/cm)',
    rawFeed: '52,480',
    phAdjustedFeed: '52,480',
    concentrate: '88,400',
    permeate: '142',
  },
  {
    ion: 'pH',
    rawFeed: '8.10',
    phAdjustedFeed: '6.90',
    concentrate: '7.45',
    permeate: '5.85',
  },
];

const MOCK_SCALING: ScalingData[] = [
  { parameter: 'LSI', beforePh: '0.42', afterPh: '-1.20', concentrate: '0.85' },
  {
    parameter: 'Stiff & Davis Index',
    beforePh: '-0.15',
    afterPh: '-1.85',
    concentrate: '0.12',
  },
  {
    parameter: 'CaSO₄ (% Saturation)',
    beforePh: '32%',
    afterPh: '32%',
    concentrate: '58%',
  },
  {
    parameter: 'BaSO₄ (% Saturation)',
    beforePh: '8%',
    afterPh: '8%',
    concentrate: '14%',
  },
  {
    parameter: 'SiO₂ (% Saturation)',
    beforePh: '12%',
    afterPh: '12%',
    concentrate: '22%',
  },
];

const MOCK_WATER_COSTS: CostData[] = [
  {
    category: 'Service Water',
    flowRate: 250.0,
    unitCost: 0.12,
    hourlyCost: 30.0,
    dailyCost: 720.0,
  },
  {
    category: 'Waste Water Disposal',
    flowRate: 145.0,
    unitCost: 0.08,
    hourlyCost: 11.6,
    dailyCost: 278.4,
  },
];

const MOCK_ENERGY_COSTS: EnergyCostData[] = [
  {
    item: 'High Pressure Pump (Pass 1)',
    peakPower: 420.5,
    energy: 385.2,
    unitCost: 0.1,
    cost: 38.52,
    specificEnergy: 3.668,
  },
  {
    item: 'Booster Pump',
    peakPower: 45.2,
    energy: 41.8,
    unitCost: 0.1,
    cost: 4.18,
    specificEnergy: 0.182,
  },
];

const MOCK_CHEMICAL_COSTS: ChemicalCostData[] = [
  { item: 'NaOH (50%)', unitCost: 0.45, dose: 5.2, volume: 1.45, cost: 0.65 },
  { item: 'Antiscalant', unitCost: 4.2, dose: 2.5, volume: 0.62, cost: 2.6 },
];

export function ReportScreen() {
  const [exportOpen, setExportOpen] = useState(false);
  const [tempMode, setTempMode] = useState<'min' | 'design' | 'max' | 'custom'>(
    'design',
  );
  const [customTemp, setCustomTemp] = useState<string>('25');

  const currentTemp =
    tempMode === 'custom'
      ? parseFloat(customTemp) || 0
      : tempMode === 'min'
        ? 12
        : tempMode === 'max'
          ? 38
          : 25;

  // Adjust mock data based on temperature
  const tempFactor = 1 + (25 - currentTemp) * 0.015;
  const fluxFactor = 1 + (currentTemp - 25) * 0.02;

  const passes = MOCK_PASSES.map((p) => ({
    ...p,
    temp: currentTemp,
    feedPressure:
      p.name === 'Pass 1' ? p.feedPressure * tempFactor : p.feedPressure,
    avgFlux: p.avgFlux * fluxFactor,
  }));

  const streams = MOCK_STREAMS.map((s) => ({
    ...s,
    pressure: s.name.includes('Feed') ? s.pressure * tempFactor : s.pressure,
  }));

  const stages = MOCK_STAGES.map((stg) => ({
    ...stg,
    feedPress: stg.feedPress * tempFactor,
    concPress: stg.concPress * tempFactor,
    avgFlux: stg.avgFlux * fluxFactor,
  }));

  const elements = MOCK_ELEMENTS.map((el) => ({
    ...el,
    feedPress: el.feedPress * tempFactor,
    permFlux: el.permFlux * fluxFactor,
  }));

  const [selectedSections, setSelectedSections] = useState<string[]>([
    'overview',
    'flow',
    'chemical',
    'economic',
    'pfd',
  ]);

  const sections = [
    {
      id: 'overview',
      title: 'System Overview & Summary',
      desc: 'Project metadata and performance metrics',
    },
    {
      id: 'flow',
      title: 'Flow & Performance Tables',
      desc: 'Stage-by-stage hydraulic details',
    },
    {
      id: 'chemical',
      title: 'Chemical & Scaling Analysis',
      desc: 'Solute concentrations and saturation indices',
    },
    {
      id: 'economic',
      title: 'Economic & Energy Breakdown',
      desc: 'Power consumption and operating costs',
    },
    {
      id: 'pfd',
      title: 'Process Flow Diagrams',
      desc: 'Visual representation of system architecture',
    },
  ];

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleExport = () => {
    // Mock export logic
    setExportOpen(false);
  };

  return (
    <div
      className='px-6 py-4 lg:px-8 lg:py-6 space-y-6 max-w-[1600px] mx-auto fade-up'
      role='main'
      aria-label='Report Screen'
    >
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className='sm:max-w-[500px] p-0 overflow-hidden bg-white border-border shadow-2xl'>
          <div className='p-6 pb-0'>
            <DialogHeader>
              <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4'>
                <FileDown className='w-6 h-6' />
              </div>
              <DialogTitle className='text-2xl font-display font-bold text-slate-900'>
                Export Report
              </DialogTitle>
              <DialogDescription className='text-slate-500'>
                Select the sections you wish to include in your PDF document.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className='p-6 space-y-3'>
            {sections.map((section) => {
              const isSelected = selectedSections.includes(section.id);
              return (
                <button
                  key={section.id}
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-3 rounded-xl border text-left transition-all group active:scale-[0.98]',
                    isSelected
                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
                      isSelected
                        ? 'bg-primary border-primary text-white scale-110'
                        : 'bg-white border-slate-200 text-transparent group-hover:border-primary/50',
                    )}
                  >
                    <Check className='w-3.5 h-3.5 stroke-[4]' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div
                      className={cn(
                        'text-sm font-bold transition-colors',
                        isSelected ? 'text-slate-900' : 'text-slate-600',
                      )}
                    >
                      {section.title}
                    </div>
                    <div className='text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5'>
                      {section.desc}
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 transition-all opacity-0 group-hover:opacity-100',
                      isSelected ? 'text-primary' : 'text-slate-300',
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div className='p-6 bg-slate-50 flex items-center justify-between border-t border-slate-100'>
            <div className='text-xs text-slate-400 font-bold'>
              {selectedSections.length} OF {sections.length} SECTIONS SELECTED
            </div>
            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => setExportOpen(false)}
                className='h-10 rounded-xl px-5 font-bold text-xs border-slate-200'
              >
                CANCEL
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedSections.length === 0}
                className='h-10 rounded-xl px-8 bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-primary/20 border-0'
              >
                GENERATE PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className='flex items-start justify-between flex-wrap gap-4'>
        <div className='space-y-1.5'>
          <h1 className='font-display text-3xl font-semibold text-foreground tracking-tight'>
            Report Center
          </h1>
          <p className='text-sm text-muted-foreground max-w-lg'>
            Comprehensive engineering report in DuPont WAVE PRO format.
          </p>
        </div>
        <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
          <div className='flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-sm'>
            {[
              { id: 'min', label: 'Min' },
              { id: 'design', label: 'Design' },
              { id: 'max', label: 'Max' },
              { id: 'custom', label: 'Specify' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setTempMode(mode.id as any)}
                className={cn(
                  'px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all',
                  tempMode === mode.id
                    ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {mode.label.toUpperCase()}
              </button>
            ))}
            {tempMode === 'custom' && (
              <div className='flex items-center gap-1.5 ml-2 pr-1 animate-in fade-in slide-in-from-left-1 duration-300'>
                <input
                  type='number'
                  value={customTemp}
                  onChange={(e) => setCustomTemp(e.target.value)}
                  className='w-12 h-6 text-[10px] font-bold bg-white border border-slate-200 rounded-md px-1.5 focus:ring-1 focus:ring-primary outline-none'
                />
                <span className='text-[10px] font-bold text-slate-400'>°C</span>
              </div>
            )}
          </div>

          <div className='flex items-center gap-3 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10'>
            <div className='flex items-center gap-2'>
              <Thermometer
                className={cn(
                  'w-3.5 h-3.5',
                  currentTemp > 30
                    ? 'text-orange-500'
                    : currentTemp < 15
                      ? 'text-blue-500'
                      : 'text-primary',
                )}
              />
              <span className='text-[10px] font-bold text-slate-700 uppercase'>
                {currentTemp}°C
              </span>
            </div>
            <div className='w-px h-3 bg-primary/20' />
            <div className='flex items-center gap-1.5'>
              <span className='text-[10px] font-medium text-slate-400 uppercase'>
                Flux
              </span>
              <span className='text-[10px] font-bold text-slate-700 uppercase'>
                {(9.6 * fluxFactor).toFixed(1)} LMH
              </span>
            </div>
            <div className='w-px h-3 bg-primary/20' />
            <div className='flex items-center gap-1.5'>
              <span className='text-[10px] font-medium text-slate-400 uppercase'>
                Press
              </span>
              <span className='text-[10px] font-bold text-slate-700 uppercase'>
                {tempFactor.toFixed(2)}x
              </span>
            </div>
          </div>

          <div className='flex-1' />

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-9 rounded-lg font-bold text-[11px] border-slate-200 px-3'
            >
              <Printer className='w-3.5 h-3.5 mr-2 text-slate-400' /> PRINT
            </Button>
            <Button
              size='sm'
              onClick={() => setExportOpen(true)}
              className='h-9 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-[11px] shadow-sm border-0 px-4'
            >
              <FileDown className='w-3.5 h-3.5 mr-2' /> EXPORT PDF
            </Button>
          </div>
        </div>
      </div>

      <ReportHeader data={MOCK_METADATA} />

      <section className='space-y-6'>
        <h2 className='text-lg font-display font-bold text-foreground border-l-4 border-primary pl-4'>
          I. System Overview & Summary
        </h2>
        <div className='flex flex-col gap-8'>
          <Card className='p-4 border-border bg-muted/5'>
            <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4'>
              Reverse Osmosis Process Diagram
            </h3>
            <div className='max-w-5xl mx-auto'>
              <ProcessFlowDiagram
                feedFlow={MOCK_OVERVIEW.systemFeed}
                permeateFlow={MOCK_OVERVIEW.systemPermeate}
                rejectFlow={
                  MOCK_OVERVIEW.systemFeed - MOCK_OVERVIEW.systemPermeate
                }
                recovery={MOCK_OVERVIEW.roRecovery}
                pumpPressure={passes[0]?.feedPressure || 58.4}
                feedTDS={passes[0]?.feedTds || 35206}
                permeateTDS={passes[0]?.permeateTds || 88}
                rejectTDS={streams.find(s => s.name.includes('Concentrate'))?.tds || 60520}
                stages={stages.map(s => ({ vessels: s.pv, elements: s.elsPerPv }))}
              />
            </div>
          </Card>

          <SystemSummary overview={MOCK_OVERVIEW} passes={passes} />

          <Card className='p-4 border-border bg-muted/5'>
            <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4'>
              System Architecture PFD
            </h3>
            <SystemDesignPFD />
          </Card>
        </div>
      </section>

      <section className='space-y-6'>
        <h2 className='text-lg font-display font-bold text-foreground border-l-4 border-permeate pl-4'>
          II. Flow & Performance Tables
        </h2>
        <div className='space-y-6'>
          <FlowTables
            streams={streams}
            pass1Stages={stages}
            pass1Elements={elements}
          />
        </div>
      </section>

      <section className='space-y-6'>
        <h2 className='text-lg font-display font-bold text-foreground border-l-4 border-primary pl-4'>
          III. Chemical & Scaling Analysis
        </h2>
        <ChemicalAnalysis
          soluteData={MOCK_SOLUTES}
          scalingData={MOCK_SCALING}
          warnings={MOCK_METADATA.designWarnings}
        />
      </section>

      <section className='space-y-6'>
        <h2 className='text-lg font-display font-bold text-foreground border-l-4 border-warning pl-4'>
          IV. Economic & Energy Breakdown
        </h2>
        <CostBreakdown
          waterCosts={MOCK_WATER_COSTS}
          energyCosts={MOCK_ENERGY_COSTS}
          chemicalCosts={MOCK_CHEMICAL_COSTS}
        />
      </section>

      {/* Footer Branding */}
      <div className='pt-10 border-t border-border text-center'>
        <p className='text-[10px] font-mono text-muted-foreground opacity-50 uppercase tracking-[0.3em]'>
          SOL9X - RO Engineering Design Studio - v2026.05.07
        </p>
      </div>
    </div>
  );
}
