'use client';

import { useState, useRef, useMemo } from 'react';
import { simulateChemicalAdjustment } from '@/core/chemistry/adjustment/chemical-adjustment';
import { toPng } from 'html-to-image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { safeNumber } from '@/lib/safe-values';
import { generateEngineeringPDF } from '@/core/pdf/export/exportPdf';
import {
  FileDown,
  Printer,
  Check,
  ChevronRight,
  Thermometer,
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
import { ReportHeader } from '@/features/reporting/components/ReportHeader';
import { SystemSummary } from '@/features/reporting/sections/SystemSummary';
import { FlowTables } from '@/features/reporting/sections/FlowTables';
import { ChemicalAnalysis } from '@/features/reporting/sections/ChemicalAnalysis';
import { CostBreakdown } from '@/features/reporting/sections/CostBreakdown';
import { SystemDesignPFD } from '@/features/reporting/sections/SystemDesignPFD';
import { ProcessFlowDiagram } from '@/components/engineering/pfd/ProcessFlowDiagram';
import { useROConfigStore } from '@/store/ro-config-store';

import { useFeedStore } from '@/store/feed-store';
import {
  useEngineeringReport,
  useWarningSummaryReport,
} from '@/store/report-selectors';

import type {
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
} from '@/features/reporting/types/report-types';

import type { FullEngineeringReport } from '@/core/reporting/models/report.models';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Safe toFixed that guards against NaN/Infinity */
function sf(v: number, decimals: number): number {
  const n = safeNumber(v, 0);
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

// ─── Adapters: new report models → existing UI types ──────────────────────────

function toProjectMetadata(r: FullEngineeringReport): ProjectMetadata {
  return {
    projectNo: r.metadata.projectNo,
    projectName: r.metadata.projectName,
    dateCreated: r.metadata.dateCreated,
    lastModified: r.metadata.lastModified,
    elements: r.metadata.elements,
    caseName: r.metadata.caseName,
    preparedBy: r.metadata.preparedBy,
    company: r.metadata.company,
    customer: r.metadata.customer,
    country: r.metadata.country,
    marketSegment: r.metadata.marketSegment,
    appVersion: r.metadata.appVersion,
    designWarnings: r.metadata.designWarnings,
  };
}

function toSystemOverview(r: FullEngineeringReport): SystemOverview {
  return {
    totalUnits: r.systemOverview.totalUnits,
    online: r.systemOverview.online,
    standby: r.systemOverview.standby,
    roRecovery: sf(r.systemOverview.roRecoveryPercent, 1),
    systemFeed: sf(r.systemOverview.systemFeedM3h, 2),
    systemPermeate: sf(r.systemOverview.systemPermeateM3h, 2),
  };
}

function toPassSummaries(r: FullEngineeringReport): PassSummary[] {
  return r.passes.map((p) => ({
    name: p.name,
    waterType: p.waterType,
    numElements: p.numElements,
    totalActiveArea: p.totalActiveAreaM2,
    feedFlow: sf(p.feedFlowM3h, 2),
    feedTds: sf(p.feedTDSMgL, 0),
    feedPressure: sf(p.feedPressureBar, 1),
    flowFactor: p.flowFactor,
    permeateFlow: sf(p.permeateFlowM3h, 2),
    avgFlux: sf(p.avgFluxLMH, 1),
    permeateTds: sf(p.permeateTDSMgL, 0),
    netRecovery: sf(p.netRecoveryPercent, 1),
    avgNdp: sf(p.avgNdpBar, 2),
    specificEnergy: sf(p.specificEnergykWh, 3),
    temp: p.tempC,
    pH: p.pH,
    chemicalDose: p.chemicalDose,
  }));
}

function toStreams(r: FullEngineeringReport): StreamData[] {
  return r.streams.map((s) => ({
    id: s.id,
    name: s.name,
    flow: sf(s.flowM3h, 2),
    tds: sf(s.tdsMgL, 0),
    pressure: sf(s.pressureBar, 2),
  }));
}

function toStages(r: FullEngineeringReport): StageFlowData[] {
  return r.stages.map((s) => ({
    stage: s.stageIndex,
    elements: s.elementCount,
    pv: s.vesselCount,
    elsPerPv: s.elementsPerVessel,
    feedFlow: sf(s.feedFlowM3h, 2),
    recircFlow: 0,
    feedPress: sf(s.feedPressureBar, 1),
    boostPress: 0,
    concFlow: sf(s.concentrateFlowM3h, 2),
    concPress: sf(s.concentratePressureBar, 1),
    pressDrop: sf(s.pressureDropBar, 2),
    permFlow: sf(s.permeateFlowM3h, 2),
    avgFlux: sf(s.avgFluxLMH, 1),
    permPress: sf(s.permeatePressureBar, 2),
    permTds: sf(s.permeateTDSMgL, 0),
  }));
}

function toElements(r: FullEngineeringReport): ElementFlowData[] {
  return r.elements.map((el) => ({
    name: el.name,
    recovery: sf(el.recoveryPercent, 1),
    feedFlow: sf(el.feedFlowM3h, 3),
    feedPress: sf(el.feedPressureBar, 1),
    feedTds: sf(el.feedTDSMgL, 0),
    concFlow: sf(el.concentrateFlowM3h, 3),
    permFlow: sf(el.permeateFlowM3h, 3),
    permFlux: sf(el.permeateFluxLMH, 1),
    permTds: sf(el.permeateTDSMgL, 0),
  }));
}

function toSoluteData(r: FullEngineeringReport): SoluteData[] {
  return r.soluteAnalysis.rows.map((row) => ({
    ion: row.ion,
    rawFeed: row.rawFeedMgL,
    phAdjustedFeed: row.phAdjustedFeedMgL,
    concentrate: row.concentrateMgL,
    permeate: row.permeateMgL,
  }));
}

function toScalingData(r: FullEngineeringReport): ScalingData[] {
  return r.scalingAnalysis.rows.map((row) => ({
    parameter: row.parameter,
    beforePh: row.beforePH,
    afterPh: row.afterPH,
    concentrate: row.concentrate,
  }));
}

function toWaterCosts(r: FullEngineeringReport): CostData[] {
  return r.costs.waterCosts.map((c) => ({
    category: c.category,
    flowRate: sf(c.flowRateM3h, 2),
    unitCost: c.unitCostPerM3,
    hourlyCost: sf(c.hourlyCost, 2),
    dailyCost: sf(c.dailyCost, 2),
  }));
}

function toEnergyCosts(r: FullEngineeringReport): EnergyCostData[] {
  return r.costs.energyCosts.map((c) => ({
    item: c.item,
    peakPower: sf(c.peakPowerkW, 1),
    energy: sf(c.energykWh, 1),
    unitCost: c.unitCostPerKwh,
    cost: sf(c.cost, 2),
    specificEnergy:
      c.specificEnergykWhM3 !== undefined
        ? sf(c.specificEnergykWhM3, 3)
        : undefined,
  }));
}

function toChemicalCosts(r: FullEngineeringReport): ChemicalCostData[] {
  return r.costs.chemicalCosts.map((c) => ({
    item: c.item,
    unitCost: c.unitCostPerKg,
    dose: c.doseMgL,
    volume: sf(c.volumeKgH, 3),
    cost: sf(c.cost, 2),
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportView() {
  const [exportOpen, setExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pfdRef = useRef<HTMLDivElement>(null);
  const { chemistry, activeTemperatureView, setActiveTemperatureView, updateChemistryField } = useFeedStore();
  const [customTemp, setCustomTemp] = useState<string>(chemistry.designTemperature.toString());
  const chemAdj = useROConfigStore((s) => s.chemicalAdjustment);

  // Live temperature resolved from the active view — same logic as ROConfigView.
  const liveTemp =
    activeTemperatureView === 'min' ? chemistry.minTemperature :
    activeTemperatureView === 'max' ? chemistry.maxTemperature :
    chemistry.designTemperature;

  const tempLabel =
    activeTemperatureView === 'min'    ? `Min — ${chemistry.minTemperature.toFixed(1)} °C` :
    activeTemperatureView === 'max'    ? `Max — ${chemistry.maxTemperature.toFixed(1)} °C` :
                                         `Design — ${chemistry.designTemperature.toFixed(1)} °C`;

  // Always-live adjustment result — mirrors what the RO Config modal shows.
  const liveAdjustmentResult = useMemo(() =>
    simulateChemicalAdjustment(chemistry.ions, chemistry.ph, liveTemp, chemAdj),
    [chemistry.ions, chemistry.ph, liveTemp, chemAdj],
  );

  const report = useEngineeringReport();
  const warningSummary = useWarningSummaryReport();
  
  // Synchronize local mode with store mode
  const tempMode = activeTemperatureView === 'design' && parseFloat(customTemp) !== chemistry.designTemperature ? 'custom' : activeTemperatureView;

  const currentTemp =
    activeTemperatureView === 'min'
      ? chemistry.minTemperature
      : activeTemperatureView === 'max'
        ? chemistry.maxTemperature
        : chemistry.designTemperature;

  // Adapt live report data or show empty state
  const hasSimulation = report !== null;

  const metadata: ProjectMetadata = hasSimulation
    ? toProjectMetadata(report)
    : {
        projectNo: '—',
        projectName: 'No simulation run',
        dateCreated: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        elements: [],
        caseName: '—',
        preparedBy: '—',
        company: 'SOL9X Engineering Services',
        customer: '—',
        country: '—',
        marketSegment: '—',
        appVersion: '2026.05',
        designWarnings: warningSummary.designWarnings,
      };

  const overview: SystemOverview = hasSimulation
    ? toSystemOverview(report)
    : {
        totalUnits: 0,
        online: 0,
        standby: 0,
        roRecovery: 0,
        systemFeed: 0,
        systemPermeate: 0,
      };

  // Pass data directly from the simulation — no client-side temperature
  // corrections. The simulation engine already applies temperature-corrected
  // permeability, osmotic pressure, and flux profiles internally.
  const passes: PassSummary[] = hasSimulation
    ? toPassSummaries(report)
    : [];

  const streams: StreamData[] = hasSimulation
    ? toStreams(report)
    : [];

  const stages: StageFlowData[] = hasSimulation
    ? toStages(report)
    : [];

  const elements: ElementFlowData[] = hasSimulation
    ? toElements(report)
    : [];

  const soluteData: SoluteData[] = hasSimulation ? toSoluteData(report) : [];
  const scalingData: ScalingData[] = hasSimulation ? toScalingData(report) : [];
  const waterCosts: CostData[] = hasSimulation ? toWaterCosts(report) : [];
  const energyCosts: EnergyCostData[] = hasSimulation
    ? toEnergyCosts(report)
    : [];
  const chemicalCosts: ChemicalCostData[] = hasSimulation
    ? toChemicalCosts(report)
    : [];

  const refFlux = hasSimulation
    ? safeNumber(report.systemOverview.averageFluxLMH, 0)
    : 0;

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

  const handleExport = async () => {
    if (!report) {
      toast.error('No design data available', {
        description: 'Configure and run the RO design engine before exporting the report.',
      });
      return;
    }

    setExportOpen(false);
    setIsExporting(true);

    const exportToast = toast.loading('Generating Engineering Report…', {
      description: `Compiling ${selectedSections.length} section${selectedSections.length !== 1 ? 's' : ''} into PDF.`,
    });

    try {
      let pfdImage = '';
      if (pfdRef.current) {
        // Capture the PFD as a high-quality PNG
        pfdImage = await toPng(pfdRef.current, { 
          backgroundColor: '#ffffff',
          pixelRatio: 2, // Higher quality
        });
      }

      await generateEngineeringPDF(report, {
        selectedSections,
        pfdImage,
        onStatusChange: (status) => {
          if (status === 'done') {
            toast.dismiss(exportToast);
            toast.success('Engineering Report Exported', {
              description: `SOL9X_RO_Report downloaded successfully.`,
            });
          }
        },
      });
    } catch (err) {
      toast.dismiss(exportToast);
      toast.error('Export Failed', {
        description: 'An error occurred while generating the PDF. Please try again.',
      });
      console.error('[PDF Export]', err);
    } finally {
      setIsExporting(false);
    }
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
                    <Check className='w-3.5 h-3.5 stroke-4' />
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
                disabled={selectedSections.length === 0 || isExporting}
                className='h-10 rounded-xl px-8 bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-lg shadow-primary/20 border-0'
              >
                {isExporting ? 'GENERATING…' : 'GENERATE PDF'}
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
            Comprehensive engineering report.
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
                onClick={() => {
                  if (mode.id === 'custom') {
                    setActiveTemperatureView('design');
                  } else {
                    setActiveTemperatureView(mode.id as any);
                  }
                }}
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
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomTemp(val);
                    const num = parseFloat(val);
                    if (!isNaN(num) && num > 0 && num < 100) {
                      updateChemistryField('designTemperature', num);
                    }
                  }}
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

      {/* Empty state removed — studio always boots with seeded engineering state */}

      <ReportHeader data={metadata} />

      <section className='space-y-6'>
        <h2 className='text-lg font-display font-bold text-foreground border-l-4 border-primary pl-4'>
          I. System Overview & Summary
        </h2>
        <div className='flex flex-col gap-8'>
          <Card className='p-4 border-border bg-muted/5'>
            <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4'>
              Reverse Osmosis Process Diagram
            </h3>
            <div className='max-w-5xl mx-auto' ref={pfdRef}>
              <ProcessFlowDiagram
                feedFlow={overview.systemFeed}
                permeateFlow={overview.systemPermeate}
                rejectFlow={overview.systemFeed - overview.systemPermeate}
                recovery={overview.roRecovery}
                pumpPressure={passes[0]?.feedPressure ?? 0}
                feedTDS={passes[0]?.feedTds ?? 0}
                permeateTDS={passes[0]?.permeateTds ?? 0}
                rejectTDS={
                  streams.find((s) => s.name.includes('Concentrate'))?.tds ?? 0
                }
                bypassFlow={
                  useROConfigStore.getState().passOptimizationMode === 'Bypass'
                    ? (useROConfigStore.getState().bypassMode === 'Percent' 
                        ? useROConfigStore.getState().feedFlow * useROConfigStore.getState().bypassValue / 100 
                        : useROConfigStore.getState().bypassValue)
                    : 0
                }
                stages={stages.map((s) => ({
                  vessels: s.pv,
                  elements: s.elsPerPv,
                }))}
              />
            </div>
          </Card>

          <SystemSummary overview={overview} passes={passes} />

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
          soluteData={soluteData}
          scalingData={scalingData}
          warnings={metadata.designWarnings}
          adjustmentResult={liveAdjustmentResult}
          cf={hasSimulation ? (report.systemOverview.concentrateTDSMgL / Math.max(report.systemOverview.feedTDSMgL, 1)) : 1}
          temperatureC={liveTemp}
          temperatureLabel={tempLabel}
          chemAdj={chemAdj}
        />
      </section>

      <section className='space-y-6'>
        <h2 className='text-lg font-display font-bold text-foreground border-l-4 border-warning pl-4'>
          IV. Economic & Energy Breakdown
        </h2>
        <CostBreakdown
          waterCosts={waterCosts}
          energyCosts={energyCosts}
          chemicalCosts={chemicalCosts}
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
