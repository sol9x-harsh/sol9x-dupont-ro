'use client';

import { useState, Fragment, useEffect, useCallback, useMemo } from 'react';
import { simulateChemicalAdjustment } from '@/core/chemistry/adjustment/chemical-adjustment';
import { useSimulationStore } from '@/store/simulation-store';
import {
  selectAverageFlux,
  selectSystemRecoveryPercent,
  selectTotalPermeateFlow,
  selectConcentrateFlow,
  selectFeedTDS,
  selectSystemPressures,
  selectLowestNDP,
  selectBlendedPermeateTDS,
  selectBlendedRejection,
  selectAdjustmentResult,
  selectWarnings,
  selectValidationErrors,
} from '@/store/simulation/simulation-selectors';
import { useROConfigStore } from '@/store/ro-config-store';
import { useFeedStore } from '@/store/feed-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Plus,
  X,
  Eye,
  EyeOff,
  Info,
  Settings2,
  Beaker,
  Droplets,
  Zap,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { MembraneSelector } from './components/MembraneSelector';
import {
  ProcessFlowDiagram,
  type PassConfig,
} from '@/components/engineering/pfd/ProcessFlowDiagram';

import { IonBalanceModal } from '@/features/ro-config/modals/IonBalanceModal';
import { ConstraintModal } from '@/features/ro-config/modals/ConstraintModal';
import { TOCModal } from '@/features/ro-config/modals/TOCModal';
import { cn } from '@/lib/utils';
import { NumericInput } from '@/components/ui/numeric-input';

export function ROConfigView() {
  const [flowOpen, setFlowOpen] = useState(false);
  const [chemOpen, setChemOpen] = useState(false);
  const chemicalAdjustment = useROConfigStore((s) => s.chemicalAdjustment);
  const updateChemicalAdjustment = useROConfigStore(
    (s) => s.updateChemicalAdjustment,
  );
  const adjustmentResult = useSimulationStore(selectAdjustmentResult);
  const simOutput = useSimulationStore((s) => s.output);
  const {
    phDownOn,
    degasOn,
    phUpOn,
    antiScalantOn,
    dechlorinatorOn,
    degasMode,
  } = chemicalAdjustment;
  const [ionOpen, setIonOpen] = useState(false);
  const [conOpen, setConOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [passToDelete, setPassToDelete] = useState<string | null>(null);
  const [activeRecyclePass, setActiveRecyclePass] = useState('p1');

  // Pass & Stage Management
  const [passes, setPasses] = useState<string[]>(['p1']);
  const [activePass, setActivePass] = useState('p1');
  const [passRecovery, setPassRecovery] = useState<Record<string, number>>({
    p1: 75,
  });
  const [passFlowFactor, setPassFlowFactor] = useState<Record<string, number>>({
    p1: 0.85,
  });

  const [passData, setPassData] = useState<
    Record<
      string,
      {
        id: string;
        vessels: number;
        elements: number;
        pressureDrop: number;
        membraneModel: string;
        isd?: boolean;
        isdElements?: string[];
        recyclePercent?: number;
      }[]
    >
  >({
    p1: [
      {
        id: 's1',
        vessels: 42,
        elements: 7,
        pressureDrop: 0.7,
        membraneModel: '',
        recyclePercent: 0,
      },
      {
        id: 's2',
        vessels: 21,
        elements: 7,
        pressureDrop: 0.7,
        membraneModel: '',
        recyclePercent: 0,
      },
    ],
  });

  const [showPFD, setShowPFD] = useState(true);

  // Project Data State
  const [projectData, setProjectData] = useState({
    feedTDS: 35000,
    permeateTDS: 280,
    rejectTDS: 60300,
  });
  const [smallCommercial, setSmallCommercial] = useState(false);

  // Live simulation outputs
  const feedFlow = useROConfigStore((s) => s.feedFlow);
  const storeRecovery = useROConfigStore((s) => s.systemRecovery);
  const storePressure = useROConfigStore((s) => s.feedPressureBar);
  const storePermeatePressure = useROConfigStore((s) => s.permeatePressureBar);
  const { 
    passOptimizationMode, 
    bypassMode, 
    bypassValue, 
    concentrateRecycle,
    setPassOptimizationMode, 
    setBypassMode, 
    setBypassValue, 
    setConcentrateRecycle 
  } = useROConfigStore();
  const bypassFlow = passOptimizationMode === 'Bypass'
    ? (bypassMode === 'Percent' ? feedFlow * bypassValue / 100 : bypassValue)
    : 0;

  const liveRecovery = useSimulationStore(selectSystemRecoveryPercent);
  const livePermeateFlow = useSimulationStore(selectTotalPermeateFlow);
  const liveConcentrateFlow = useSimulationStore(selectConcentrateFlow);
  const liveFlux = useSimulationStore(selectAverageFlux);
  const liveFeedTDS = useSimulationStore(selectFeedTDS);
  const livePressures = useSimulationStore(selectSystemPressures);
  const liveLowestNDP = useSimulationStore(selectLowestNDP);
  const livePermeateTDS = useSimulationStore(selectBlendedPermeateTDS);
  const liveRejection = useSimulationStore(selectBlendedRejection);

  const warnings = useSimulationStore(selectWarnings);
  const validationErrors = useSimulationStore(selectValidationErrors);
  const constraintCount =
    (warnings?.filter((w) => w.severity !== 'info').length || 0) +
    (validationErrors?.length || 0);

  const activeTempView = useFeedStore((s) => s.activeTemperatureView);
  const setActiveTempView = useFeedStore((s) => s.setActiveTemperatureView);
  const updateFeedField = useFeedStore((s) => s.updateChemistryField);

  // Live feed chemistry — subscribed directly so the chem adj table always reflects real data.
  const feedIons          = useFeedStore((s) => s.chemistry.ions);
  const feedPh            = useFeedStore((s) => s.chemistry.ph);
  const feedMinTemp       = useFeedStore((s) => s.chemistry.minTemperature);
  const feedDesignTemp    = useFeedStore((s) => s.chemistry.designTemperature);
  const feedMaxTemp       = useFeedStore((s) => s.chemistry.maxTemperature);

  const systemTemperature =
    activeTempView === 'min' ? feedMinTemp :
    activeTempView === 'max' ? feedMaxTemp :
    feedDesignTemp;

  // Always-live adjustment result — derived from the actual feed store, not the simulation output.
  // This means the chemistry table is correct even before the main simulation has run.
  const liveAdjustmentResult = useMemo(() =>
    simulateChemicalAdjustment(feedIons, feedPh, systemTemperature, chemicalAdjustment),
    [feedIons, feedPh, systemTemperature, chemicalAdjustment],
  );

  const displayRecovery = liveRecovery ?? storeRecovery;
  const displayPermeateFlow =
    livePermeateFlow ?? (feedFlow * storeRecovery) / 100;
  const displayConcentrateFlow =
    liveConcentrateFlow ?? feedFlow - displayPermeateFlow;
  const displayFlux = liveFlux ?? 0;
  const displayFeedTDS = liveFeedTDS ?? projectData.feedTDS;
  const displayFeedPressure =
    livePressures?.stages[0]?.inletPressureBar ?? storePressure;

  // Sync Logic: Increase/Decrease rows with Pass additions/deletions
  const addPass = () => {
    if (passes.length >= 3) return;
    const id = `p${passes.length + 1}`;
    setPasses([...passes, id]);
    setPassData({
      ...passData,
      [id]: [
        {
          id: 's1',
          vessels: 10,
          elements: 7,
          pressureDrop: 0.7,
          membraneModel: '',
          recyclePercent: 0,
        },
      ],
    });
    setPassRecovery((prev) => ({ ...prev, [id]: storeRecovery }));
    setPassFlowFactor((prev) => ({ ...prev, [id]: 0.85 }));
    setActivePass(id);
  };

  const removePass = (id: string) => {
    if (passes.length === 1) return;
    const next = passes.filter((p) => p !== id);
    setPasses(next);
    if (activePass === id) setActivePass(next[0]);
  };

  const activeStages = passData[activePass] || [];

  // ── Sync local UI state → Zustand store so simulation triggers fire ──────
  const syncToStore = useCallback(() => {
    const storePasses = passes.map((passId, passIdx) => ({
      id: passId,
      label: `Pass ${passIdx + 1}`,
      recovery: passRecovery[passId] ?? storeRecovery,
      stages: (passData[passId] || []).map((stg, stgIdx) => ({
        id: stg.id,
        label: `Stage ${stgIdx + 1}`,
        pressureDropBar: stg.pressureDrop,
        recyclePercent: stg.recyclePercent ?? 0,
        vessels: Array.from({ length: Math.max(1, stg.vessels) }, (_, vi) => ({
          id: `${passId}-${stg.id}-v${vi + 1}`,
          label: `V${vi + 1}`,
          elementsPerVessel: stg.elements,
          membraneModel: stg.membraneModel || '',
        })),
      })),
    }));
    useROConfigStore.getState().setPasses(storePasses);
  }, [passes, passData, storeRecovery, passRecovery]);

  useEffect(() => {
    syncToStore();
  }, [syncToStore]);

  // If global system recovery changes (e.g. from Flow Calculator), update the first pass if it's the only one.
  useEffect(() => {
    if (passes.length === 1) {
      setPassRecovery((prev) => {
        if (prev.p1 !== storeRecovery) {
          return { ...prev, p1: storeRecovery };
        }
        return prev;
      });
    }
  }, [storeRecovery, passes.length]);

  const addStage = () => {
    if (activeStages.length >= 6) return; // limit to 6 stages to prevent insane geometry, but way above 3
    const id = `s${activeStages.length + 1}`;
    const newStages = [
      ...activeStages,
      {
        id,
        vessels: Math.max(
          1,
          Math.floor(activeStages[activeStages.length - 1].vessels / 2),
        ),
        elements: 7,
        pressureDrop: 0.7,
        membraneModel:
          activeStages[activeStages.length - 1]?.membraneModel || '',
        recyclePercent: 0,
      },
    ];
    setPassData({ ...passData, [activePass]: newStages });
  };

  const removeStage = () => {
    if (activeStages.length <= 1) return;
    setPassData({ ...passData, [activePass]: activeStages.slice(0, -1) });
  };

  // Concentration factor from simulation output for concentrate column scaling.
  // Falls back to 1 (no concentration) if the main simulation hasn't run yet.
  const cf = simOutput?.summary?.feedTDSMgL
    ? simOutput.summary.concentrateTDSMgL / simOutput.summary.feedTDSMgL
    : 1;

  // Always built from liveAdjustmentResult (derived from feed store) — never fake fallback data.
  const adj = liveAdjustmentResult;
  const tableData = [
    {
      label: 'pH',
      b:  adj.beforeAdjustment.ph.toFixed(2),
      ac: adj.afterAcid.ph.toFixed(2),
      a:  adj.afterDegas.ph.toFixed(2),
      r:  adj.final.ph.toFixed(2),
    },
    {
      label: 'LSI*',
      b:  adj.beforeAdjustment.lsi.toFixed(2),
      ac: adj.afterAcid.lsi.toFixed(2),
      a:  adj.afterDegas.lsi.toFixed(2),
      r:  (adj.final.lsi + Math.log10(Math.max(cf, 1))).toFixed(2),
    },
    {
      label: 'S&DSI*',
      b:  adj.beforeAdjustment.sdi.toFixed(2),
      ac: adj.afterAcid.sdi.toFixed(2),
      a:  adj.afterDegas.sdi.toFixed(2),
      r:  (adj.final.sdi + Math.log10(Math.max(cf, 1))).toFixed(2),
    },
    {
      label: 'TDS (mg/L)',
      b:  adj.beforeAdjustment.tds.toFixed(1),
      ac: adj.afterAcid.tds.toFixed(1),
      a:  adj.afterDegas.tds.toFixed(1),
      r:  (adj.final.tds * cf).toFixed(1),
    },
    {
      label: 'Ionic Str. (mol/L)',
      b:  adj.beforeAdjustment.ionicStrength.toFixed(4),
      ac: adj.afterAcid.ionicStrength.toFixed(4),
      a:  adj.afterDegas.ionicStrength.toFixed(4),
      r:  (adj.final.ionicStrength * cf).toFixed(4),
    },
    {
      label: 'HCO₃⁻ (mg/L)',
      b:  adj.beforeAdjustment.ions.bicarbonate.toFixed(2),
      ac: adj.afterAcid.ions.bicarbonate.toFixed(2),
      a:  adj.afterDegas.ions.bicarbonate.toFixed(2),
      r:  (adj.final.ions.bicarbonate * cf).toFixed(2),
    },
    {
      label: 'CO₂ (mg/L)',
      b:  adj.beforeAdjustment.ions.co2.toFixed(2),
      ac: adj.afterAcid.ions.co2.toFixed(2),
      a:  adj.afterDegas.ions.co2.toFixed(2),
      r:  adj.final.ions.co2.toFixed(2),
    },
    {
      label: 'CO₃²⁻ (mg/L)',
      b:  adj.beforeAdjustment.ions.carbonate.toFixed(2),
      ac: adj.afterAcid.ions.carbonate.toFixed(2),
      a:  adj.afterDegas.ions.carbonate.toFixed(2),
      r:  (adj.final.ions.carbonate * cf).toFixed(2),
    },
  ];

  return (
    <div className='px-6 py-4 lg:px-8 lg:py-6 space-y-6 max-w-[1700px] mx-auto font-sans'>
      <div className='flex items-start justify-between flex-wrap gap-4'>
        <div className='space-y-1.5'>
          <h1 className='font-display text-3xl font-semibold text-foreground tracking-tight'>
            RO Configuration
          </h1>
          <p className='text-sm text-muted-foreground max-w-lg'>
            Configure passes, stages, and element types. Define flow factors and
            system pressures for each stage.
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      <IonBalanceModal open={ionOpen} onOpenChange={setIonOpen} />
      <ConstraintModal open={conOpen} onOpenChange={setConOpen} />
      <TOCModal open={tocOpen} onOpenChange={setTocOpen} />

      <AlertDialog
        open={!!passToDelete}
        onOpenChange={(open) => !open && setPassToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pass</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pass? This will remove all
              stages and configuration within this pass. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-white hover:bg-destructive/90'
              onClick={() => {
                if (passToDelete) {
                  removePass(passToDelete);
                }
                setPassToDelete(null);
              }}
            >
              Delete Pass
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Flow Calculator Dialog */}
      <Dialog open={flowOpen} onOpenChange={setFlowOpen}>
        <DialogContent className='max-w-[1100px] p-0 overflow-hidden bg-white'>
          <div className='px-6 py-5 bg-slate-50/50 flex flex-col gap-1'>
            <DialogTitle className='font-display text-xl text-primary font-semibold'>
              Flow Calculator
            </DialogTitle>
            <DialogDescription className='text-sm text-muted-foreground'>
              Please edit flow values for your RO system
            </DialogDescription>
          </div>

          <div className='p-6 flex flex-col gap-8'>
            {/* Top Row */}
            <div className='flex gap-10'>
              {/* RO Flow */}
              <div className='w-[200px] space-y-4'>
                <h3 className='text-[15px] font-medium text-primary'>
                  RO Flow
                </h3>
                <div>
                  <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                    <span>Feed Flow Rate</span>
                    <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                      1
                    </span>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <NumericInput
                      value={feedFlow}
                      onChange={(val) => {
                        if (val > 0) {
                          useROConfigStore.getState().setFeedFlow(val);
                        }
                      }}
                      precision={2}
                      className='h-9 bg-slate-100 border-slate-200 focus-visible:ring-primary/20 rounded-sm text-left px-3'
                    />
                    <span className='text-sm text-muted-foreground min-w-[30px]'>
                      m³/h
                    </span>
                  </div>
                </div>
              </div>

              {/* RO System Summary */}
              <div className='flex-1 space-y-4'>
                <h3 className='text-[15px] font-medium text-primary'>
                  RO System Summary
                </h3>
                <div className='flex gap-4'>
                  <div className='flex-1'>
                    <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                      <span>Feed Flow</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        readOnly
                        value={feedFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-muted-foreground rounded-sm'
                      />
                      <span className='text-sm text-muted-foreground min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                      <span>Product Flow</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        readOnly
                        value={displayPermeateFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-muted-foreground rounded-sm'
                      />
                      <span className='text-sm text-muted-foreground min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                      <span>Concentrate Flow</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        readOnly
                        value={displayConcentrateFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-muted-foreground rounded-sm'
                      />
                      <span className='text-sm text-muted-foreground min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                      <span>System Recovery</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        readOnly
                        value={displayRecovery.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-muted-foreground rounded-sm'
                      />
                      <span className='text-sm text-muted-foreground min-w-[30px]'>
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className='flex items-stretch -mx-2'>
              {/* Feed & Recovery */}
              <div className='w-[260px] px-2'>
                <h3 className='text-[15px] font-medium text-primary mb-4'>
                  Feed & Recovery
                </h3>
                <div className='border border-slate-200 rounded p-4 space-y-4 shadow-sm bg-white'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='radio'
                      readOnly
                      checked
                      className='accent-primary w-4 h-4 cursor-pointer'
                    />
                    <span className='text-sm font-medium text-foreground/90'>
                      Net
                    </span>
                  </div>

                  <div>
                    <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                      <span>Net Feed</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        5
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        readOnly
                        value={feedFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-muted-foreground rounded-sm'
                      />
                      <span className='text-sm text-muted-foreground min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                      <span>Net Recovery</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        8/5
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <NumericInput
                        value={displayRecovery}
                        onChange={(val) => {
                          if (val >= 0 && val <= 100) {
                            useROConfigStore.getState().setSystemRecovery(val);
                          }
                        }}
                        precision={2}
                        min={0}
                        max={100}
                        className='h-9 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-sm text-left px-3'
                      />
                      <span className='text-sm text-muted-foreground min-w-[30px]'>
                        %
                      </span>
                    </div>
                    <p className='text-[10px] text-muted-foreground/80 mt-1.5'>
                      Recommended Range 1 – 90
                    </p>
                  </div>
                </div>
              </div>

              {/* Flow */}
              <div className='w-[220px] px-6 border-r border-slate-200'>
                <h3 className='text-[15px] font-medium text-primary mb-4'>
                  Flow
                </h3>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                      <span>Permeate Flow</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        8
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        readOnly
                        value={displayPermeateFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-muted-foreground rounded-sm'
                      />
                      <span className='text-sm text-muted-foreground min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                      <span>Flux</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        value={
                          displayFlux > 0 ? displayFlux.toFixed(2) : '0.00'
                        }
                        className='h-9 bg-slate-200/60 border-transparent text-muted-foreground rounded-sm'
                      />
                      <div className='h-9 bg-slate-200/60 px-2 flex items-center justify-center rounded-sm'>
                        <span className='text-sm text-muted-foreground'>LMH</span>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    {passes.map((pId, idx) => {
                      // Find the cumulative stage index for the last stage of this pass
                      let cumulativeIdx = -1;
                      for (let i = 0; i <= idx; i++) {
                        cumulativeIdx += (passData[passes[i]] || []).length;
                      }
                      const pFlow = simOutput?.hydraulics?.flows?.stages[cumulativeIdx]?.concentrateFlowM3h ?? 0;
                      
                      return (
                        <div key={`flow-conc-${pId}`}>
                          <div className='flex justify-between text-sm text-muted-foreground/90 mb-1.5'>
                            <span>Pass {idx + 1} Conc Flow</span>
                            <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                              {10 + idx}
                            </span>
                          </div>
                          <div className='flex gap-2 items-center'>
                            <Input
                              readOnly
                              value={pFlow.toFixed(2)}
                              className='h-9 bg-slate-200/60 border-transparent text-muted-foreground rounded-sm'
                            />
                            <span className='text-sm text-muted-foreground min-w-[30px]'>
                              m³/h
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Concentrate Recycle */}
              <div className='flex-1 px-6 border-r border-slate-200'>
                <h3 className='text-[15px] font-medium text-primary mb-4'>
                  Concentrate Recycle
                </h3>
                <div className='space-y-4'>
                  <div className='flex flex-wrap gap-2 mb-2'>
                    {passes.map((pId, idx) => (
                      <button
                        key={pId}
                        onClick={() => setActiveRecyclePass(pId)}
                        className={cn(
                          'px-3 py-1 text-[10px] font-bold rounded border transition-all',
                          activeRecyclePass === pId 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-muted-foreground hover:border-slate-300'
                        )}
                      >
                        Pass {idx + 1}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const currentRecycle = concentrateRecycle[activeRecyclePass] || { enabled: false, mode: 'Percent', value: 0 };
                    return (
                      <div className='space-y-5 animate-in fade-in slide-in-from-top-1 duration-200'>
                        <div className='flex items-center gap-2'>
                          <input
                            type='checkbox'
                            checked={currentRecycle.enabled}
                            onChange={(e) => setConcentrateRecycle(activeRecyclePass, { enabled: e.target.checked })}
                            className='accent-primary w-4 h-4 rounded-sm border-slate-300 cursor-pointer'
                          />
                          <span className='text-sm font-medium text-foreground/90'>
                            Enable Recycle
                          </span>
                        </div>

                        <div className='flex gap-4 items-center'>
                          <div className='flex items-center gap-2 flex-1'>
                            <input
                              type='radio'
                              name={`recycleMode-${activeRecyclePass}`}
                              checked={currentRecycle.mode === 'Percent'}
                              onChange={() => setConcentrateRecycle(activeRecyclePass, { mode: 'Percent' })}
                              disabled={!currentRecycle.enabled}
                              className='w-4 h-4 accent-primary cursor-pointer disabled:opacity-50'
                            />
                            <NumericInput
                              disabled={!currentRecycle.enabled || currentRecycle.mode !== 'Percent'}
                              value={currentRecycle.mode === 'Percent' ? currentRecycle.value : 0}
                              onChange={(val) => {
                                if (val >= 0 && val <= 100) {
                                  setConcentrateRecycle(activeRecyclePass, { value: val });
                                }
                              }}
                              precision={2}
                              className='h-9 bg-slate-50 border-slate-200 text-foreground/90 flex-1 rounded-sm px-2 disabled:opacity-50 font-mono text-xs'
                            />
                            <span className='text-sm text-muted-foreground w-[20px]'>%</span>
                          </div>
                          <div className='flex items-center gap-2 flex-1'>
                            <input
                              type='radio'
                              name={`recycleMode-${activeRecyclePass}`}
                              checked={currentRecycle.mode === 'Flow'}
                              onChange={() => setConcentrateRecycle(activeRecyclePass, { mode: 'Flow' })}
                              disabled={!currentRecycle.enabled}
                              className='w-4 h-4 accent-primary cursor-pointer disabled:opacity-50'
                            />
                            <NumericInput
                              disabled={!currentRecycle.enabled || currentRecycle.mode !== 'Flow'}
                              value={currentRecycle.mode === 'Flow' ? currentRecycle.value : 0}
                              onChange={(val) => {
                                if (val >= 0) {
                                  setConcentrateRecycle(activeRecyclePass, { value: val });
                                }
                              }}
                              precision={2}
                              className='h-9 bg-slate-50 border-slate-200 text-foreground/90 flex-1 rounded-sm px-2 disabled:opacity-50 font-mono text-xs'
                            />
                            <span className='text-sm text-muted-foreground w-[30px] text-[10px]'>m³/h</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Pass Optimization */}
              <div className='w-[280px] pl-6 pr-2'>
                <h3 className='text-[15px] font-medium text-primary mb-4'>
                  Pass Optimization
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center gap-6'>
                    <div className='flex items-center gap-2'>
                      <input
                        type='radio'
                        checked={passOptimizationMode === 'Bypass'}
                        onChange={() => setPassOptimizationMode('Bypass')}
                        name='passOpt'
                        className='accent-primary w-4 h-4 cursor-pointer'
                      />
                      <span className='text-sm font-medium text-foreground/90'>
                        Bypass
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <input
                        type='radio'
                        checked={passOptimizationMode === 'None'}
                        onChange={() => setPassOptimizationMode('None')}
                        name='passOpt'
                        className='accent-primary w-4 h-4 cursor-pointer'
                      />
                      <span className='text-sm font-medium text-foreground/90'>
                        None
                      </span>
                    </div>
                  </div>

                  {passOptimizationMode === 'Bypass' && (
                    <div className='space-y-3 pt-2'>
                      <div className='flex justify-between items-end'>
                        <span className='text-sm text-muted-foreground/90 mb-2'>
                          To System Permeate
                        </span>
                        <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono mb-1'>
                          13 / 1
                        </span>
                      </div>
                      <div className='flex items-center gap-2 w-full'>
                        <input
                          type='radio'
                          name='sysPerm'
                          checked={bypassMode === 'Percent'}
                          onChange={() => setBypassMode('Percent')}
                          className='accent-primary w-4 h-4 cursor-pointer'
                        />
                        <NumericInput
                          disabled={bypassMode !== 'Percent'}
                          value={bypassMode === 'Percent' ? bypassValue : 0}
                          onChange={(val) => {
                            if (val >= 0 && val <= 100) {
                              setBypassValue(val);
                            }
                          }}
                          precision={2}
                          className='h-9 bg-slate-50 border-slate-200 text-foreground/90 flex-1 rounded-sm px-2'
                        />
                        <span className='text-sm text-muted-foreground w-[30px]'>
                          %
                        </span>
                      </div>

                      <div className='flex justify-end pt-1'>
                        <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono mb-1'>
                          13
                        </span>
                      </div>
                      <div className='flex items-center gap-2 w-full'>
                        <input
                          type='radio'
                          name='sysPerm'
                          checked={bypassMode === 'Flow'}
                          onChange={() => setBypassMode('Flow')}
                          className='accent-primary w-4 h-4 cursor-pointer'
                        />
                        <NumericInput
                          disabled={bypassMode !== 'Flow'}
                          value={bypassMode === 'Flow' ? bypassValue : 0}
                          onChange={(val) => {
                            if (val >= 0 && val <= feedFlow) {
                              setBypassValue(val);
                            }
                          }}
                          precision={2}
                          className='h-9 bg-slate-50 border-slate-200 text-foreground/90 flex-1 rounded-sm px-2'
                        />
                        <span className='text-sm text-muted-foreground w-[30px]'>
                          m³/h
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-lg'>
            <Button
              variant='outline'
              onClick={() => setFlowOpen(false)}
              className='rounded-full px-6 text-foreground/90 border-slate-300 hover:bg-slate-50'
            >
              Cancel
            </Button>
            <Button
              className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6'
              onClick={() => setFlowOpen(false)}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={chemOpen} onOpenChange={setChemOpen}>
        <DialogContent className='max-w-[1100px] w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-white border-border flex flex-col'>
          <div className='px-6 py-4 border-b border-border bg-slate-50/50 shrink-0'>
            <DialogTitle className='font-display text-lg text-primary font-bold'>
              Chemical Adjustment
            </DialogTitle>
            <DialogDescription className='text-[13px] text-muted-foreground mt-1'>
              You may add chemicals/degas from here. Based on your selection
              table gets updated. Please note that LSI and S&DI require non zero
              Ca and CO₂ Concentrations.
            </DialogDescription>
          </div>
          <div className='p-6 overflow-y-auto flex flex-col gap-6 flex-1 custom-scrollbar'>
            {/* Dosing Cards Grid */}
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start'>
              {/* ↓ pH */}
              <div
                className={cn(
                  'rounded-xl p-4 border transition-colors bg-white',
                  phDownOn
                    ? 'border-primary shadow-sm ring-1 ring-primary/10'
                    : 'border-border',
                )}
              >
                <div className='flex justify-between items-center mb-4'>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      phDownOn ? 'text-primary' : 'text-muted-foreground/90',
                    )}
                  >
                    ↓ pH
                  </span>
                  <button
                    onClick={() =>
                      updateChemicalAdjustment({ phDownOn: !phDownOn })
                    }
                    className={cn(
                      'w-9 h-5 rounded-full relative flex items-center transition-colors border',
                      phDownOn
                        ? 'bg-primary border-primary'
                        : 'bg-slate-200 border-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[8px] font-bold absolute tracking-wider',
                        phDownOn
                          ? 'left-1.5 text-white'
                          : 'right-1.5 text-muted-foreground',
                      )}
                    >
                      {phDownOn ? 'ON' : 'OFF'}
                    </span>
                    <div
                      className={cn(
                        'w-3.5 h-3.5 rounded-full shadow-sm absolute transition-transform',
                        phDownOn
                          ? 'translate-x-[20px] bg-white'
                          : 'translate-x-[2px] bg-white',
                      )}
                    />
                  </button>
                </div>
                <div className='space-y-3'>
                  <Select
                    disabled={!phDownOn}
                    value={chemicalAdjustment.phDownChemical}
                    onValueChange={(val) =>
                      updateChemicalAdjustment({ phDownChemical: val })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs',
                        phDownOn
                          ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                          : 'bg-slate-50 border-transparent text-muted-foreground/80',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='HCl(32)'>HCl(32)</SelectItem>
                      <SelectItem value='H2SO4(98)'>H₂SO₄(98)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <NumericInput
                      disabled={!phDownOn}
                      value={chemicalAdjustment.phDownTargetPh || 0}
                      onChange={(val) =>
                        updateChemicalAdjustment({
                          phDownTargetPh: val,
                        })
                      }
                      precision={2}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0 text-left',
                        phDownOn ? 'bg-white text-foreground/80' : 'bg-slate-50',
                      )}
                    />
                    <div className='px-2 text-[10px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                      pH
                    </div>
                  </div>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <Input
                      disabled={!phDownOn}
                      value={
                        phDownOn
                          ? adjustmentResult?.afterAcid.lsi.toFixed(2)
                          : ''
                      }
                      readOnly
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0',
                        phDownOn ? 'bg-white text-foreground/80' : 'bg-slate-50',
                      )}
                    />
                    <div className='px-2 text-[10px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                      LSI
                    </div>
                  </div>
                </div>
              </div>

              {/* Degas */}
              <div
                className={cn(
                  'rounded-xl p-4 border transition-colors bg-white',
                  degasOn
                    ? 'border-primary shadow-sm ring-1 ring-primary/10'
                    : 'border-border',
                )}
              >
                <div className='flex justify-between items-center mb-4'>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      degasOn ? 'text-primary' : 'text-muted-foreground/90',
                    )}
                  >
                    Degas
                  </span>
                  <button
                    onClick={() =>
                      updateChemicalAdjustment({ degasOn: !degasOn })
                    }
                    className={cn(
                      'w-9 h-5 rounded-full relative flex items-center transition-colors border',
                      degasOn
                        ? 'bg-primary border-primary'
                        : 'bg-slate-200 border-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[8px] font-bold absolute tracking-wider',
                        degasOn
                          ? 'left-1.5 text-white'
                          : 'right-1.5 text-muted-foreground',
                      )}
                    >
                      {degasOn ? 'ON' : 'OFF'}
                    </span>
                    <div
                      className={cn(
                        'w-3.5 h-3.5 rounded-full shadow-sm absolute transition-transform',
                        degasOn
                          ? 'translate-x-[20px] bg-white'
                          : 'translate-x-[2px] bg-white',
                      )}
                    />
                  </button>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='radio'
                      checked={degasMode === 'CO2 % Removal'}
                      onChange={() =>
                        updateChemicalAdjustment({ degasMode: 'CO2 % Removal' })
                      }
                      className='accent-primary w-3.5 h-3.5 cursor-pointer disabled:opacity-50'
                      disabled={!degasOn}
                    />
                    <div className='flex-1'>
                      <span className='text-[10px] leading-tight text-muted-foreground font-medium block'>
                        CO₂ %<br />
                        Removal
                      </span>
                    </div>
                    <div className='flex items-center border border-border rounded-md h-7 overflow-hidden w-[65px]'>
                      <NumericInput
                        disabled={!degasOn || degasMode !== 'CO2 % Removal'}
                        value={
                          degasMode === 'CO2 % Removal'
                            ? chemicalAdjustment.degasValue || 0
                            : 0
                        }
                        onChange={(val) =>
                          updateChemicalAdjustment({
                            degasValue: val,
                          })
                        }
                        precision={1}
                        className={cn(
                          'h-full flex-1 border-0 rounded-none text-xs font-mono px-1.5 focus-visible:ring-0 text-right',
                          degasOn && degasMode === 'CO2 % Removal'
                            ? 'bg-white text-foreground/80'
                            : 'bg-slate-50',
                        )}
                      />
                      <div className='px-1.5 text-[9px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                        %
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <input
                      type='radio'
                      checked={degasMode === 'CO2 Partial Pressure'}
                      onChange={() =>
                        updateChemicalAdjustment({
                          degasMode: 'CO2 Partial Pressure',
                        })
                      }
                      className='accent-primary w-3.5 h-3.5 cursor-pointer disabled:opacity-50'
                      disabled={!degasOn}
                    />
                    <div className='flex-1'>
                      <span className='text-[10px] leading-tight text-muted-foreground font-medium block'>
                        CO₂ Partial
                        <br />
                        Pressure
                      </span>
                    </div>
                    <div className='flex items-center border border-border rounded-md h-7 overflow-hidden w-[65px]'>
                      <NumericInput
                        disabled={
                          !degasOn || degasMode !== 'CO2 Partial Pressure'
                        }
                        value={
                          degasMode === 'CO2 Partial Pressure'
                            ? chemicalAdjustment.degasValue || 0
                            : 0
                        }
                        onChange={(val) =>
                          updateChemicalAdjustment({
                            degasValue: val,
                          })
                        }
                        precision={1}
                        className={cn(
                          'h-full flex-1 border-0 rounded-none text-xs font-mono px-1.5 focus-visible:ring-0 text-right',
                          degasOn && degasMode === 'CO2 Partial Pressure'
                            ? 'bg-white text-foreground/80'
                            : 'bg-slate-50',
                        )}
                      />
                      <div className='px-1 text-[9px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                        μatm
                      </div>
                    </div>
                  </div>
                  <div className='flex items-start gap-2'>
                    <div className='pt-1'>
                      <input
                        type='radio'
                        checked={degasMode === 'CO2 Concentration'}
                        onChange={() =>
                          updateChemicalAdjustment({
                            degasMode: 'CO2 Concentration',
                          })
                        }
                        className='accent-primary w-3.5 h-3.5 cursor-pointer disabled:opacity-50'
                        disabled={!degasOn}
                      />
                    </div>
                    <div className='flex-1 pt-1'>
                      <span className='text-[10px] leading-tight text-muted-foreground font-medium block'>
                        CO₂
                        <br />
                        Concentration
                      </span>
                    </div>
                    <div className='flex flex-col items-end w-[65px]'>
                      <div className='flex items-center border border-border rounded-md h-7 overflow-hidden w-full'>
                        <NumericInput
                          disabled={
                            !degasOn || degasMode !== 'CO2 Concentration'
                          }
                          value={
                            degasMode === 'CO2 Concentration'
                              ? chemicalAdjustment.degasValue || 0
                              : 0
                          }
                          onChange={(val) =>
                            updateChemicalAdjustment({
                              degasValue: val,
                            })
                          }
                          precision={2}
                          className={cn(
                            'h-full flex-1 border-0 rounded-none text-xs font-mono px-1 focus-visible:ring-0 text-right',
                            degasOn && degasMode === 'CO2 Concentration'
                              ? 'bg-white text-foreground/80'
                              : 'bg-slate-50',
                          )}
                        />
                        <div className='px-1 text-[9px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                          mg/L
                        </div>
                      </div>
                      <span className='text-[8px] text-muted-foreground/80 mt-1 font-medium'>
                        Range 1-100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ↑ pH */}
              <div
                className={cn(
                  'rounded-xl p-4 border transition-colors bg-white',
                  phUpOn
                    ? 'border-primary shadow-sm ring-1 ring-primary/10'
                    : 'border-border',
                )}
              >
                <div className='flex justify-between items-center mb-4'>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      phUpOn ? 'text-primary' : 'text-muted-foreground/90',
                    )}
                  >
                    ↑ pH
                  </span>
                  <button
                    onClick={() =>
                      updateChemicalAdjustment({ phUpOn: !phUpOn })
                    }
                    className={cn(
                      'w-9 h-5 rounded-full relative flex items-center transition-colors border',
                      phUpOn
                        ? 'bg-primary border-primary'
                        : 'bg-slate-200 border-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[8px] font-bold absolute tracking-wider',
                        phUpOn
                          ? 'left-1.5 text-white'
                          : 'right-1.5 text-muted-foreground',
                      )}
                    >
                      {phUpOn ? 'ON' : 'OFF'}
                    </span>
                    <div
                      className={cn(
                        'w-3.5 h-3.5 rounded-full shadow-sm absolute transition-transform',
                        phUpOn
                          ? 'translate-x-[20px] bg-white'
                          : 'translate-x-[2px] bg-white',
                      )}
                    />
                  </button>
                </div>
                <div className='space-y-3'>
                  <Select
                    disabled={!phUpOn}
                    value={chemicalAdjustment.phUpChemical}
                    onValueChange={(val) =>
                      updateChemicalAdjustment({ phUpChemical: val })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs',
                        phUpOn
                          ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                          : 'bg-slate-50 border-transparent text-muted-foreground/80',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='NaOH(50)'>NaOH(50)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <NumericInput
                      disabled={!phUpOn}
                      value={chemicalAdjustment.phUpTargetPh || 0}
                      onChange={(val) =>
                        updateChemicalAdjustment({
                          phUpTargetPh: val,
                        })
                      }
                      precision={2}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0 text-left',
                        phUpOn ? 'bg-white text-foreground/80' : 'bg-slate-50',
                      )}
                    />
                    <div className='px-2 text-[10px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                      pH
                    </div>
                  </div>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <Input
                      disabled={!phUpOn}
                      value={
                        phUpOn ? adjustmentResult?.final.lsi.toFixed(2) : ''
                      }
                      readOnly
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0',
                        phUpOn ? 'bg-white text-foreground/80' : 'bg-slate-50',
                      )}
                    />
                    <div className='px-2 text-[10px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                      LSI
                    </div>
                  </div>
                </div>
              </div>

              {/* Anti-Scalant */}
              <div
                className={cn(
                  'rounded-xl p-4 border transition-colors bg-white',
                  antiScalantOn
                    ? 'border-primary shadow-sm ring-1 ring-primary/10'
                    : 'border-border',
                )}
              >
                <div className='flex justify-between items-center mb-4'>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      antiScalantOn ? 'text-primary' : 'text-muted-foreground/90',
                    )}
                  >
                    Anti-Scalant
                  </span>
                  <button
                    onClick={() =>
                      updateChemicalAdjustment({
                        antiScalantOn: !antiScalantOn,
                      })
                    }
                    className={cn(
                      'w-9 h-5 rounded-full relative flex items-center transition-colors border',
                      antiScalantOn
                        ? 'bg-primary border-primary'
                        : 'bg-slate-200 border-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[8px] font-bold absolute tracking-wider',
                        antiScalantOn
                          ? 'left-1.5 text-white'
                          : 'right-1.5 text-muted-foreground',
                      )}
                    >
                      {antiScalantOn ? 'ON' : 'OFF'}
                    </span>
                    <div
                      className={cn(
                        'w-3.5 h-3.5 rounded-full shadow-sm absolute transition-transform',
                        antiScalantOn
                          ? 'translate-x-[20px] bg-white'
                          : 'translate-x-[2px] bg-white',
                      )}
                    />
                  </button>
                </div>
                <div className='space-y-3'>
                  <Select
                    disabled={!antiScalantOn}
                    value={chemicalAdjustment.antiScalantChemical}
                    onValueChange={(val) =>
                      updateChemicalAdjustment({ antiScalantChemical: val })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs',
                        antiScalantOn
                          ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                          : 'bg-slate-50 border-transparent text-muted-foreground/80',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Na6P6O18(100)'>
                        Na₆P₆O₁₈(100)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <NumericInput
                      disabled={!antiScalantOn}
                      value={chemicalAdjustment.antiScalantDose || 0}
                      onChange={(val) =>
                        updateChemicalAdjustment({
                          antiScalantDose: val,
                        })
                      }
                      precision={2}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0 text-left',
                        antiScalantOn
                          ? 'bg-white text-foreground/80'
                          : 'bg-slate-50',
                      )}
                    />
                    <div className='px-2 text-[10px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                      mg/L
                    </div>
                  </div>
                </div>
              </div>

              {/* Dechlorinator */}
              <div
                className={cn(
                  'rounded-xl p-4 border transition-colors bg-white',
                  dechlorinatorOn
                    ? 'border-primary shadow-sm ring-1 ring-primary/10'
                    : 'border-border',
                )}
              >
                <div className='flex justify-between items-center mb-4'>
                  <span
                    className={cn(
                      'text-sm font-bold',
                      dechlorinatorOn ? 'text-primary' : 'text-muted-foreground/90',
                    )}
                  >
                    Dechlorinator
                  </span>
                  <button
                    onClick={() =>
                      updateChemicalAdjustment({
                        dechlorinatorOn: !dechlorinatorOn,
                      })
                    }
                    className={cn(
                      'w-9 h-5 rounded-full relative flex items-center transition-colors border',
                      dechlorinatorOn
                        ? 'bg-primary border-primary'
                        : 'bg-slate-200 border-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'text-[8px] font-bold absolute tracking-wider',
                        dechlorinatorOn
                          ? 'left-1.5 text-white'
                          : 'right-1.5 text-muted-foreground',
                      )}
                    >
                      {dechlorinatorOn ? 'ON' : 'OFF'}
                    </span>
                    <div
                      className={cn(
                        'w-3.5 h-3.5 rounded-full shadow-sm absolute transition-transform',
                        dechlorinatorOn
                          ? 'translate-x-[20px] bg-white'
                          : 'translate-x-[2px] bg-white',
                      )}
                    />
                  </button>
                </div>
                <div className='space-y-3'>
                  <Select
                    disabled={!dechlorinatorOn}
                    value={chemicalAdjustment.dechlorinatorChemical}
                    onValueChange={(val) =>
                      updateChemicalAdjustment({ dechlorinatorChemical: val })
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs',
                        dechlorinatorOn
                          ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                          : 'bg-slate-50 border-transparent text-muted-foreground/80',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='NaHSO3'>NaHSO₃</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <NumericInput
                      disabled={!dechlorinatorOn}
                      value={chemicalAdjustment.dechlorinatorDose || 0}
                      onChange={(val) =>
                        updateChemicalAdjustment({
                          dechlorinatorDose: val,
                        })
                      }
                      precision={2}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0 text-left',
                        dechlorinatorOn
                          ? 'bg-white text-foreground/80'
                          : 'bg-slate-50',
                      )}
                    />
                    <div className='px-2 text-[10px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                      mg/L
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2'>
              {/* Table */}
              <div className='lg:col-span-3 border border-border rounded-xl overflow-x-auto shadow-sm'>
                <table className='w-full text-xs text-left min-w-[560px]'>
                  <thead>
                    <tr className='bg-slate-100/80 text-foreground/90 font-bold border-b border-border'>
                      <th className='py-3 px-4 w-[28%]'>Measurement</th>
                      <th className='py-3 px-4'>Feed (Raw)</th>
                      {phDownOn && (
                        <th className='py-3 px-4 text-amber-600'>After Acid</th>
                      )}
                      {degasOn && (
                        <th className='py-3 px-4 text-primary'>After Degas</th>
                      )}
                      {phUpOn && (
                        <th className='py-3 px-4 text-emerald-600'>After Base</th>
                      )}
                      <th className='py-3 px-4 text-muted-foreground'>Concentrate</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border bg-white font-medium text-muted-foreground/90'>
                    {tableData.map((row, i) => {
                      const isScalingRow = row.label.includes('*');
                      return (
                        <tr key={i} className='hover:bg-slate-50/80 transition-colors'>
                          <td className='py-2.5 px-4'>{row.label}</td>
                          <td className='py-2.5 px-4 font-mono'>{row.b}</td>
                          {phDownOn && (
                            <td className={cn(
                              'py-2.5 px-4 font-mono font-semibold',
                              isScalingRow && parseFloat(row.ac) > 0 ? 'text-destructive' : 'text-amber-600',
                            )}>
                              {row.ac}
                            </td>
                          )}
                          {degasOn && (
                            <td className={cn(
                              'py-2.5 px-4 font-mono font-semibold',
                              isScalingRow && parseFloat(row.a) > 0 ? 'text-destructive' : 'text-primary',
                            )}>
                              {row.a}
                            </td>
                          )}
                          {phUpOn && (
                            <td className={cn(
                              'py-2.5 px-4 font-mono font-semibold',
                              isScalingRow && parseFloat(row.r) > 0 ? 'text-destructive' : 'text-emerald-600',
                            )}>
                              {row.r}
                            </td>
                          )}
                          <td className={cn(
                            'py-2.5 px-4 font-mono',
                            isScalingRow && parseFloat(row.r) > 0 ? 'text-destructive font-bold' : '',
                          )}>
                            {row.r}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Side Panels */}
              <div className='lg:col-span-1 space-y-4'>
                <div className='border border-border rounded-xl p-4 shadow-sm bg-white'>
                  <h4 className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3'>
                    Temperature Case
                  </h4>
                  <Select
                    value={activeTempView}
                    onValueChange={(val) => setActiveTempView(val as 'min' | 'design' | 'max')}
                  >
                    <SelectTrigger className='h-8 text-xs bg-slate-50 mb-3 border-primary/30'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='min'>Min — {feedMinTemp.toFixed(1)} °C</SelectItem>
                      <SelectItem value='design'>Design — {feedDesignTemp.toFixed(1)} °C</SelectItem>
                      <SelectItem value='max'>Max — {feedMaxTemp.toFixed(1)} °C</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-muted/30 border border-transparent rounded-md h-8 overflow-hidden'>
                    <Input
                      readOnly
                      value={systemTemperature.toFixed(1)}
                      className='flex-1 h-full border-0 bg-transparent rounded-none px-2 text-xs font-mono text-foreground/90 font-semibold focus-visible:ring-0'
                    />
                    <div className='px-3 h-full flex items-center justify-center bg-white border-l border-border text-[10px] font-bold text-muted-foreground/80'>
                      °C
                    </div>
                  </div>
                  <p className='text-[10px] text-muted-foreground mt-2'>
                    Affects pKa, osmotic pressure &amp; TCF. Set temperatures in Feed Setup.
                  </p>
                </div>

                <div className='border border-border rounded-xl p-4 shadow-sm bg-white'>
                  <h4 className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3'>
                    RO Recovery
                  </h4>
                  <Select defaultValue='Based on RO'>
                    <SelectTrigger className='h-8 text-xs bg-slate-50 mb-3'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Based on RO'>
                        Based on RO ...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-muted/30 border border-transparent rounded-md h-8 overflow-hidden'>
                    <Input
                      readOnly
                      value={displayRecovery.toFixed(2)}
                      className='flex-1 h-full border-0 bg-transparent rounded-none px-2 text-xs font-mono text-muted-foreground focus-visible:ring-0'
                    />
                    <div className='px-3 h-full flex items-center justify-center bg-white border-l border-border text-[10px] font-bold text-muted-foreground/80'>
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='px-6 py-4 bg-slate-50 flex justify-end rounded-b-xl border-t border-border shrink-0'>
            <Button
              className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-xs h-9'
              onClick={() => setChemOpen(false)}
            >
              Okay
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Top Header ── */}
      <div className='flex items-center justify-between border-b border-border pb-4'>
        <div className='flex items-center gap-3'>
          <span className='text-[13px] font-medium text-foreground opacity-90'>
            System Temperature:
          </span>
          <Select 
            value={activeTempView} 
            onValueChange={(val: any) => setActiveTempView(val)}>
            <SelectTrigger className='h-8 text-xs w-28 bg-muted/20 border-border'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='min'>Minimum</SelectItem>
              <SelectItem value='design'>Design</SelectItem>
              <SelectItem value='max'>Maximum</SelectItem>
            </SelectContent>
          </Select>
          <div className='flex items-center border border-border rounded-md bg-muted/20 overflow-hidden'>
            <NumericInput
              value={systemTemperature}
              onChange={(val) => {
                const { minTemperature, maxTemperature, designTemperature } =
                  useFeedStore.getState().chemistry;
                if (activeTempView === 'min') {
                  // min must not exceed design or max
                  updateFeedField(
                    'minTemperature',
                    Math.max(0, Math.min(val, designTemperature, maxTemperature)),
                  );
                } else if (activeTempView === 'max') {
                  // max must not go below design or min
                  updateFeedField(
                    'maxTemperature',
                    Math.min(80, Math.max(val, designTemperature, minTemperature)),
                  );
                } else {
                  // design must stay between min and max
                  updateFeedField(
                    'designTemperature',
                    Math.min(maxTemperature, Math.max(minTemperature, Math.min(80, Math.max(0, val)))),
                  );
                }
              }}
              precision={1}
              min={0}
              max={80}
              className='h-8 w-14 text-xs border-0 focus-visible:ring-0 rounded-none bg-transparent px-2 font-mono'
            />
            <div className='px-2 h-8 flex items-center bg-muted/40 text-xs text-muted-foreground border-l border-border'>
              °C
            </div>
          </div>
        </div>
        <div className='flex items-center gap-4'></div>
      </div>

      {/* ── Process Flow Diagram ── */}
      <Card className='border-border overflow-hidden bg-white relative'>
        <div
          className={`flex justify-between items-center px-4 py-2 ${showPFD ? 'absolute top-0 left-0 w-full z-10 pointer-events-none' : 'border-b border-border/20'}`}
        >
          <div className='flex items-center gap-1.5 text-xs font-bold text-primary pointer-events-auto bg-white/60 backdrop-blur-sm px-2 py-1 rounded-md'>
            Reverse Osmosis Diagram{' '}
            <Info className='w-3 h-3 text-muted-foreground/40' />
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowPFD(!showPFD)}
            className='h-6 text-[11px] gap-1 hover:bg-muted/50 text-foreground pointer-events-auto bg-white/60 backdrop-blur-sm'
          >
            {showPFD ? 'Hide' : 'Show'}{' '}
            {showPFD ? (
              <EyeOff className='w-3 h-3' />
            ) : (
              <Eye className='w-3 h-3' />
            )}
          </Button>
        </div>
        {showPFD && (
          <div className='p-6 flex justify-center min-h-[250px] relative pt-8'>
            <ProcessFlowDiagram
              feedFlow={feedFlow}
              bypassFlow={bypassFlow}
              permeateFlow={displayPermeateFlow}
              rejectFlow={displayConcentrateFlow}
              recovery={displayRecovery}
              pumpPressure={displayFeedPressure}
              feedTDS={displayFeedTDS}
              permeateTDS={livePermeateTDS ?? (liveRejection !== null ? displayFeedTDS * (1 - liveRejection / 100) : displayFeedTDS * 0.003)}
              rejectTDS={projectData.rejectTDS}
              passes={passes.map(
                (passId, passIdx): PassConfig => ({
                  label: `Pass ${passIdx + 1}`,
                  recovery: passRecovery[passId] ?? storeRecovery,
                  stages: (passData[passId] || []).map((stg) => ({
                    vessels: stg.vessels,
                    elements: stg.elements,
                  })),
                }),
              )}
            />
          </div>
        )}
      </Card>

      {/* ── Header & Pass Navigation ── */}
      <div className='flex items-center justify-between flex-wrap gap-4 bg-white/40 p-4 rounded-2xl border border-border/50 backdrop-blur-sm'>
        <div className='flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-border/50'>
          {passes.map((p, i) => (
            <div key={p} className='relative group flex items-center'>
              <button
                onClick={() => setActivePass(p)}
                className={cn(
                  'px-5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 relative flex flex-col items-center gap-0.5',
                  activePass === p
                    ? 'bg-white text-primary shadow-md ring-1 ring-primary/20 border border-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/60',
                )}
              >
                <span>Pass {i + 1}</span>
                <span
                  className={cn(
                    'text-[9px] font-mono leading-none',
                    activePass === p ? 'text-primary/70' : 'text-muted-foreground/80',
                  )}
                >
                  {(passRecovery[p] ?? storeRecovery).toFixed(0)}%
                </span>
              </button>
              {passes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPassToDelete(p);
                  }}
                  className='absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-white'
                >
                  <X className='w-2.5 h-2.5' />
                </button>
              )}
            </div>
          ))}
          <Button
            variant='ghost'
            size='sm'
            onClick={addPass}
            disabled={passes.length >= 3}
            className='h-9 px-4 text-[10px] font-bold text-primary hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg gap-1.5'
          >
            <Plus className='w-3.5 h-3.5' /> ADD PASS
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <div className='h-8 w-px bg-border/60 mx-2' />
          {[
            {
              id: 'flow',
              label: 'Flow Calculator',
              icon: Zap,
              color: 'text-primary',
              onClick: () => setFlowOpen(true),
            },
            {
              id: 'chem',
              label: 'Chemicals',
              icon: Beaker,
              color: 'text-blue-500',
              onClick: () => setChemOpen(true),
            },
            {
              id: 'toc',
              label: 'TOC',
              icon: Droplets,
              color: 'text-permeate',
              onClick: () => setTocOpen(true),
            },
            {
              id: 'con',
              label: 'Constraints',
              icon: AlertTriangle,
              color: 'text-destructive',
              onClick: () => setConOpen(true),
              badge: constraintCount,
            },
          ].map((btn) => (
            <Button
              key={btn.id}
              variant='outline'
              size='sm'
              onClick={btn.onClick}
              className='h-9 rounded-xl border-border bg-white text-[11px] font-bold text-muted-foreground/90 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all gap-2 px-4 shadow-sm relative'
            >
              <btn.icon className={cn('w-3.5 h-3.5', btn.color)} />
              {btn.label}
              {btn.badge !== undefined && btn.badge > 0 && (
                <span className='absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white font-black'>
                  {btn.badge}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-12 gap-6'>
        {/* Main Controls Block */}
        {/* Main Controls Block */}
        <Card className='col-span-12 lg:col-span-4 border-border/60 bg-white p-6 shadow-sm relative overflow-hidden group'>
          <div className='absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/40 to-primary' />
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
              <Settings2 className='w-4 h-4 text-primary' />
            </div>
            <div>
              <h3 className='text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80 font-bold'>
                Design Settings
              </h3>
              <div className='text-xs font-bold text-foreground/90'>
                Pass {passes.indexOf(activePass) + 1} Configuration
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            {/* Per-pass Recovery */}
            <div className='space-y-2'>
              <div className='text-[10px] text-muted-foreground font-bold uppercase tracking-wider'>
                Pass Recovery
              </div>
              <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all'>
                <input
                  type='number'
                  min={0}
                  max={100}
                  step={0.1}
                  value={passRecovery[activePass] ?? storeRecovery}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      setPassRecovery((prev) => ({
                        ...prev,
                        [activePass]: val,
                      }));
                      if (passes.length === 1) {
                        useROConfigStore.getState().setSystemRecovery(val);
                      }
                    }
                  }}
                  className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus:outline-none px-3 text-primary'
                />
                <div className='px-2.5 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                  %
                </div>
              </div>
            </div>

            {/* Per-pass Flow Factor */}
            <div className='space-y-2'>
              <div className='text-[10px] text-muted-foreground font-bold uppercase tracking-wider'>
                Flow Factor
              </div>
              <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all'>
                <input
                  type='number'
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={passFlowFactor[activePass] ?? 0.85}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0 && val <= 1) {
                      setPassFlowFactor((prev) => ({
                        ...prev,
                        [activePass]: val,
                      }));
                    }
                  }}
                  className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus:outline-none px-3 text-foreground'
                />
              </div>
            </div>

            {/* Per-pass Permeate Back Pressure */}
            <div className='space-y-2'>
              <div className='text-[10px] text-muted-foreground font-bold uppercase tracking-wider'>
                Permeate Back Pressure
              </div>
              <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all'>
                <Input
                  value={storePermeatePressure.toFixed(2)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      useROConfigStore.getState().setPermeatePressureBar(val);
                    }
                  }}
                  className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus-visible:ring-0 px-3 text-foreground'
                />
                <div className='px-2.5 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                  BAR
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-[10px] text-muted-foreground font-bold uppercase tracking-wider'>
                  No of Stages
                </span>
                <span className='text-[10px] font-mono text-primary font-bold bg-primary/5 px-2 py-0.5 rounded'>
                  {activeStages.length} STAGES
                </span>
              </div>
              <div className='flex items-center bg-slate-50 border border-border rounded-xl h-11 overflow-hidden w-full shadow-inner'>
                <button
                  onClick={removeStage}
                  className='w-12 h-full flex items-center justify-center hover:bg-white hover:text-primary text-muted-foreground/80 border-r border-border transition-colors text-lg'
                >
                  −
                </button>
                <div className='flex-1 text-center font-display font-bold text-base text-foreground/90'>
                  {activeStages.length}
                </div>
                <button
                  onClick={addStage}
                  className='w-12 h-full flex items-center justify-center hover:bg-white hover:text-primary text-muted-foreground/80 border-l border-border transition-colors text-lg'
                >
                  +
                </button>
              </div>
            </div>

            {/* Temp Correction (read-only) */}
            <div className='space-y-2'>
              <div className='text-[10px] text-muted-foreground font-bold uppercase tracking-wider'>
                Temp Correction
              </div>
              <div className='flex items-center h-9 border border-border rounded bg-muted/20 overflow-hidden'>
                <div className='h-full flex-1 px-3 flex items-center text-sm font-mono font-bold text-muted-foreground'>
                  1.024
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Metrics Dashboard Block */}
        {/* Metrics Dashboard Block */}
        <Card className='col-span-12 lg:col-span-8 border-border/60 bg-white p-6 shadow-sm relative'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 rounded-full bg-primary' />
              <h3 className='text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80 font-bold'>
                Real-time Pass Metrics
              </h3>
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-emerald-500' />
                <span className='text-[10px] font-bold text-muted-foreground'>
                  HEALTHY
                </span>
              </div>
              <Badge
                variant='outline'
                className='font-mono text-[10px] bg-slate-50 text-muted-foreground border-border px-3'
              >
                UPDATED: 12:42 UTC
              </Badge>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {/* Net Feed */}
            <div className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                  <Zap className='w-3.5 h-3.5 text-muted-foreground/80' />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate mb-2'>
                  Net Feed
                </span>
                <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all shadow-sm'>
                  <NumericInput
                    value={feedFlow}
                    onChange={(v) => useROConfigStore.getState().setFeedFlow(v)}
                    precision={2}
                    min={0}
                    className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus-visible:ring-0 px-3 text-foreground'
                  />
                  <div className='px-2.5 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                    m³/h
                  </div>
                </div>
              </div>
            </div>

            {/* Net Recovery */}
            <div className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                  <Layers className='w-3.5 h-3.5 text-muted-foreground/80' />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate mb-2'>
                  Net Recovery
                </span>
                <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all shadow-sm'>
                  <NumericInput
                    value={displayRecovery}
                    onChange={(v) =>
                      useROConfigStore.getState().setSystemRecovery(v)
                    }
                    precision={2}
                    min={0}
                    max={100}
                    className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus-visible:ring-0 px-3 text-primary'
                  />
                  <div className='px-2.5 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                    %
                  </div>
                </div>
              </div>
            </div>

            {/* Permeate Flow */}
            <div className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                  <Droplets className='w-3.5 h-3.5 text-muted-foreground/80' />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate mb-2'>
                  Permeate Flow
                </span>
                <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all shadow-sm'>
                  <NumericInput
                    value={displayPermeateFlow}
                    onChange={(v) => {
                      const feed = useROConfigStore.getState().feedFlow;
                      if (!feed || feed <= 0 || v < 0) return;
                      const recovery = (v / feed) * 100;
                      if (!isFinite(recovery) || recovery > 100) return;
                      useROConfigStore
                        .getState()
                        .setSystemRecovery(parseFloat(recovery.toFixed(2)));
                    }}
                    precision={2}
                    min={0}
                    className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus-visible:ring-0 px-3 text-permeate'
                  />
                  <div className='px-2.5 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                    m³/h
                  </div>
                </div>
              </div>
            </div>

            {/* Avg Flux */}
            <div className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                  <Info className='w-3.5 h-3.5 text-muted-foreground/80' />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate mb-2'>
                  Avg Flux
                </span>
                <div className='flex items-center h-9 border border-border rounded bg-muted/20 overflow-hidden shadow-sm'>
                  <div className='h-full flex-1 px-3 flex items-center text-sm font-mono font-bold text-foreground'>
                    {displayFlux > 0 ? displayFlux.toFixed(2) : '—'}
                  </div>
                  <div className='px-2.5 h-full flex items-center bg-muted/30 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                    LMH
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-metrics secondary row */}
          <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
            {/* Concentrate Flow */}
            <div className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                  <AlertTriangle className='w-3.5 h-3.5 text-warning' />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate mb-2'>
                  Concentrate Flow
                </span>
                <div className='flex items-center h-9 border border-border rounded bg-muted/20 overflow-hidden shadow-sm'>
                  <div className='h-full flex-1 px-3 flex items-center text-sm font-mono font-bold text-warning'>
                    {displayConcentrateFlow.toFixed(2)}
                  </div>
                  <div className='px-2.5 h-full flex items-center bg-muted/30 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                    m³/h
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Pressure */}
            <div className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                  <Settings2 className='w-3.5 h-3.5 text-muted-foreground/80' />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate mb-2'>
                  Feed Pressure
                </span>
                <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all shadow-sm'>
                  <NumericInput
                    value={displayFeedPressure}
                    onChange={(v) =>
                      useROConfigStore.getState().setFeedPressureBar(v)
                    }
                    precision={2}
                    className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus-visible:ring-0 px-3 text-foreground'
                  />
                  <div className='px-2.5 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                    BAR
                  </div>
                </div>
              </div>
            </div>

            {/* Feed TDS */}
            <div className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                  <Beaker className='w-3.5 h-3.5 text-muted-foreground/80' />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate mb-2'>
                  Feed TDS
                </span>
                <div className='flex items-center h-9 border border-border rounded bg-muted/20 overflow-hidden shadow-sm'>
                  <div className='h-full flex-1 px-3 flex items-center text-sm font-mono font-bold text-foreground/90'>
                    {Math.round(displayFeedTDS).toLocaleString('en-US')}
                  </div>
                  <div className='px-2.5 h-full flex items-center bg-muted/30 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                    mg/L
                  </div>
                </div>
              </div>
            </div>

            {/* Lowest NDP */}
            <div className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                  <Info className='w-3.5 h-3.5 text-muted-foreground/80' />
                </div>
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider truncate mb-2'>
                  Lowest NDP
                </span>
                <div className='flex items-center h-9 border border-border rounded bg-muted/20 overflow-hidden shadow-sm'>
                  <div className='h-full flex-1 px-3 flex items-center text-sm font-mono font-bold text-foreground/90'>
                    {liveLowestNDP !== null ? liveLowestNDP.toFixed(2) : '—'}
                  </div>
                  <div className='px-2.5 h-full flex items-center bg-muted/30 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                    BAR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Systems Stages Configuration Table ── */}
      <Card className='mt-6 border-border/60 shadow-xl shadow-slate-200/50 overflow-hidden bg-white rounded-2xl'>
        <div className='px-6 py-5 flex items-center justify-between border-b border-border bg-slate-50/50'>
          <div className='flex items-center gap-4'>
            <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20'>
              <Layers className='w-5 h-5 text-primary' />
            </div>
            <div>
              <h3 className='text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-bold leading-tight'>
                Hydraulic Configuration
              </h3>
              <div className='text-sm font-bold text-foreground/80'>
                System Stages & Elements Details
              </div>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={addStage}
            className='text-[10px] h-9 gap-2 text-primary border-primary/20 hover:bg-primary/5 font-bold px-6 rounded-xl transition-all shadow-sm'
          >
            <Plus className='w-3.5 h-3.5' /> ADD STAGE
          </Button>
        </div>

        <div className='overflow-x-auto scrollbar-premium'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-slate-50/80 text-[10px] uppercase tracking-wider text-muted-foreground font-bold border-b border-border'>
                <th className='px-6 py-4 w-20 text-center border-r border-border/50'>
                  No
                </th>
                <th className='px-6 py-4'>
                  <div className='flex flex-col gap-0.5'>
                    <span>Press Vessels</span>
                    <span className='text-[9px] font-normal lowercase'>(1 - 100000)</span>
                  </div>
                </th>
                <th className='px-6 py-4'>
                  <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-1'>
                      <span>No of Els</span>
                      <Info className='w-2.5 h-2.5 text-muted-foreground/50' />
                    </div>
                    <span className='text-[9px] font-normal lowercase'>(1 - 8)</span>
                  </div>
                </th>
                <th className='px-6 py-4 border-r border-border/50'>
                   <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-1'>
                      <span>Total</span>
                      <Info className='w-2.5 h-2.5 text-muted-foreground/50' />
                    </div>
                    <span className='invisible text-[9px]'>-</span>
                  </div>
                </th>
                <th className='px-6 py-4 min-w-[480px]'>
                   <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-1'>
                      <span>Element</span>
                      <Info className='w-2.5 h-2.5 text-muted-foreground/50' />
                    </div>
                    <span className='invisible text-[9px]'>-</span>
                  </div>
                </th>
                <th className='px-6 py-4'>
                  <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-1'>
                      <span>Flow Factor</span>
                      <Info className='w-2.5 h-2.5 text-muted-foreground/50' />
                    </div>
                    <span className='text-[9px] font-normal lowercase'>(0.1 - 1)</span>
                  </div>
                </th>
                <th className='px-6 py-4'>
                  <div className='flex flex-col gap-0.5'>
                    <div className='flex items-center gap-1'>
                      <span>Piping ΔP</span>
                      <Info className='w-2.5 h-2.5 text-muted-foreground/50' />
                    </div>
                    <span className='text-[9px] font-normal lowercase'>(0 - 10)</span>
                  </div>
                </th>
                <th className='px-6 py-4'>
                  <div className='flex flex-col gap-0.5'>
                    <span>Back Press</span>
                    <span className='text-[9px] font-normal lowercase'>(0 - 20)</span>
                  </div>
                </th>
                <th className='px-6 py-4 pr-8'>
                  <div className='flex flex-col gap-0.5'>
                    <span>Conc to Feed</span>
                    <span className='text-[9px] font-normal lowercase'>(0 - 95)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {activeStages.map((stg, idx) => (
                <Fragment key={stg.id}>
                  <tr className='group hover:bg-slate-50 transition-colors'>
                    <td className='px-6 py-5 text-center border-r border-border/50'>
                      <div className='w-9 h-9 rounded bg-slate-100 border border-border flex items-center justify-center text-xs font-black text-foreground/90 group-hover:bg-primary/10 group-hover:text-primary transition-all mx-auto shadow-sm'>
                        {idx + 1}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all w-24'>
                        <Input
                          value={stg.vessels}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setPassData({
                              ...passData,
                              [activePass]: activeStages.map((s) =>
                                s.id === stg.id ? { ...s, vessels: val } : s,
                              ),
                            });
                          }}
                          className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus-visible:ring-0 px-3 text-foreground'
                        />
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all w-32'>
                        <button
                          onClick={() =>
                            setPassData({
                              ...passData,
                              [activePass]: activeStages.map((s) =>
                                s.id === stg.id
                                  ? {
                                      ...s,
                                      elements: Math.max(1, s.elements - 1),
                                    }
                                  : s,
                              ),
                            })
                          }
                          className='w-10 h-full flex items-center justify-center hover:bg-muted/50 text-muted-foreground border-r border-border transition-colors'
                        >
                          −
                        </button>
                        <div className='flex-1 text-center font-display font-bold text-sm text-foreground'>
                          {stg.elements}
                        </div>
                        <button
                          onClick={() =>
                            setPassData({
                              ...passData,
                              [activePass]: activeStages.map((s) =>
                                s.id === stg.id
                                  ? {
                                      ...s,
                                      elements: Math.min(8, s.elements + 1),
                                    }
                                  : s,
                              ),
                            })
                          }
                          className='w-10 h-full flex items-center justify-center hover:bg-muted/50 text-muted-foreground border-l border-border transition-colors'
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className='px-6 py-5 border-r border-border/50'>
                      <div className='flex items-center h-9 border border-border rounded bg-muted/20 overflow-hidden w-20'>
                        <div className='flex-1 text-center font-mono text-sm font-black text-muted-foreground'>
                          {stg.vessels * stg.elements}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-4 bg-muted/20 p-1 rounded-md border border-border/50'>
                        <div className='flex items-center gap-2 pl-3'>
                          <input
                            type='radio'
                            id={`single-${idx}`}
                            name={`mode-${idx}`}
                            className='accent-primary w-4 h-4 cursor-pointer'
                            checked={!stg.isd}
                            onChange={() =>
                              setPassData({
                                ...passData,
                                [activePass]: activeStages.map((s) =>
                                  s.id === stg.id ? { ...s, isd: false } : s,
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`single-${idx}`}
                            className='text-[10px] font-black text-muted-foreground uppercase cursor-pointer'
                          >
                            Single
                          </label>
                        </div>
                        <MembraneSelector
                          disabled={!!stg.isd}
                          value={stg.membraneModel || ''}
                          onValueChange={(val) =>
                            setPassData({
                              ...passData,
                              [activePass]: activeStages.map((s) =>
                                s.id === stg.id
                                  ? { ...s, membraneModel: val }
                                  : s,
                              ),
                            })
                          }
                        />
                        <div className='flex items-center gap-2 pr-2 border-l border-border/50 pl-4'>
                          <input
                            type='radio'
                            id={`isd-${idx}`}
                            name={`mode-${idx}`}
                            className='accent-primary w-4 h-4 cursor-pointer'
                            checked={!!stg.isd}
                            onChange={() =>
                              setPassData({
                                ...passData,
                                [activePass]: activeStages.map((s) =>
                                  s.id === stg.id
                                    ? {
                                        ...s,
                                        isd: true,
                                        isdElements:
                                          s.isdElements ||
                                          Array(s.elements).fill(''),
                                      }
                                    : s,
                                ),
                              })
                            }
                          />
                          <label
                            htmlFor={`isd-${idx}`}
                            className={cn(
                              'text-[10px] font-black uppercase cursor-pointer',
                              stg.isd ? 'text-primary' : 'text-muted-foreground/80',
                            )}
                          >
                            ISD
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all w-24'>
                        <Input
                          defaultValue='0.85'
                          className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus-visible:ring-0 px-3 text-foreground'
                        />
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all w-24'>
                        <Input
                          value={stg.pressureDrop.toFixed(2)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              setPassData({
                                ...passData,
                                [activePass]: activeStages.map((s) =>
                                  s.id === stg.id
                                    ? { ...s, pressureDrop: val }
                                    : s,
                                ),
                              });
                            }
                          }}
                          className='h-full flex-1 min-w-0 border-0 rounded-none text-sm font-mono font-bold px-2 focus-visible:ring-0 bg-transparent text-foreground'
                        />
                        <div className='px-2 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                          BAR
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all w-24'>
                        <Input
                          defaultValue='0.00'
                          className='h-full flex-1 min-w-0 border-0 rounded-none text-sm font-mono font-bold px-2 focus-visible:ring-0 bg-transparent text-foreground'
                        />
                        <div className='px-2 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                          BAR
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5 pr-8'>
                      <div className='flex items-center h-9 border border-border rounded bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all w-24'>
                        <Input
                          value={stg.recyclePercent || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val) && val >= 0 && val <= 100) {
                              setPassData({
                                ...passData,
                                [activePass]: activeStages.map((s) =>
                                  s.id === stg.id
                                    ? { ...s, recyclePercent: val }
                                    : s,
                                ),
                              });
                            }
                          }}
                          className='h-full flex-1 min-w-0 border-0 rounded-none text-sm font-mono font-bold px-2 focus-visible:ring-0 bg-transparent text-foreground'
                        />
                        <div className='px-2.5 h-full flex items-center bg-muted/20 border-l border-border text-[9px] font-black text-muted-foreground font-mono shrink-0'>
                          %
                        </div>
                      </div>
                    </td>
                  </tr>
                  {stg.isd && (
                    <tr className='bg-slate-50/30 border-t-0'>
                      <td colSpan={9} className='px-6 pb-6 pt-2'>
                        <div className='flex items-center justify-between gap-4 py-2 px-4 bg-slate-50/50 rounded-xl border border-slate-200/60 shadow-inner'>
                          {[...Array(stg.elements)].map((_, i) => {
                            const val = stg.isdElements?.[i] || '';
                            return (
                              <div
                                key={i}
                                className='flex flex-col gap-1.5 min-w-0'
                                style={{ flex: '1 1 0' }}
                              >
                                <div className='flex items-center justify-between'>
                                  <label className='text-[9px] font-black text-slate-400 uppercase tracking-tighter'>
                                    Pos {i + 1}
                                  </label>
                                  <div className='w-1.5 h-1.5 rounded-full bg-primary/20' />
                                </div>
                                <MembraneSelector
                                  className='w-full text-[10px] h-9'
                                  value={val}
                                  onValueChange={(newVal) => {
                                    const newElements = [
                                      ...(stg.isdElements ||
                                        Array(stg.elements).fill('')),
                                    ];
                                    newElements[i] = newVal;
                                    setPassData({
                                      ...passData,
                                      [activePass]: activeStages.map((s) =>
                                        s.id === stg.id
                                          ? { ...s, isdElements: newElements }
                                          : s,
                                      ),
                                    });
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
