'use client';

import { useState, Fragment } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
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
import { ProcessFlowDiagram } from '@/components/ProcessFlowDiagram';
import { IonBalanceModal } from '@/components/modals/IonBalanceModal';
import { ConstraintModal } from '@/components/modals/ConstraintModal';
import { TOCModal } from '@/components/modals/TOCModal';
import { cn } from '@/lib/utils';

export function ROConfigScreen() {
  const [flowOpen, setFlowOpen] = useState(false);
  const [passOptimizationMode, setPassOptimizationMode] = useState<
    'Bypass' | 'None'
  >('Bypass');
  const [chemOpen, setChemOpen] = useState(false);
  const [phDownOn, setPhDownOn] = useState(false);
  const [degasOn, setDegasOn] = useState(false);
  const [phUpOn, setPhUpOn] = useState(false);
  const [antiScalantOn, setAntiScalantOn] = useState(false);
  const [dechlorinatorOn, setDechlorinatorOn] = useState(false);
  const [degasMode, setDegasMode] = useState('CO2 Concentration');
  const [ionOpen, setIonOpen] = useState(false);
  const [conOpen, setConOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  // Pass & Stage Management
  const [passes, setPasses] = useState<string[]>(['p1']);
  const [activePass, setActivePass] = useState('p1');

  const [passData, setPassData] = useState<
    Record<
      string,
      {
        id: string;
        vessels: number;
        elements: number;
        isd?: boolean;
        isdElements?: string[];
      }[]
    >
  >({
    p1: [
      { id: 's1', vessels: 42, elements: 7 },
      { id: 's2', vessels: 21, elements: 7 },
    ],
  });

  const [showPFD, setShowPFD] = useState(true);

  // Project Data State
  const [projectData, setProjectData] = useState({
    feedFlow: 250.0,
    permeateFlow: 105.0,
    rejectFlow: 145.0,
    recovery: 42.0,
    pumpPressure: 55.4, // Seawater pressure
    feedTDS: 35000,
    permeateTDS: 280,
    rejectTDS: 60300,
  });
  const [smallCommercial, setSmallCommercial] = useState(false);

  // Sync Logic: Increase/Decrease rows with Pass additions/deletions
  const addPass = () => {
    const id = `p${passes.length + 1}`;
    setPasses([...passes, id]);
    setPassData({
      ...passData,
      [id]: [{ id: 's1', vessels: 10, elements: 7 }],
    });
    setActivePass(id);
  };

  const removePass = (id: string) => {
    if (passes.length === 1) return;
    const next = passes.filter((p) => p !== id);
    setPasses(next);
    if (activePass === id) setActivePass(next[0]);
  };

  const activeStages = passData[activePass] || [];

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
      },
    ];
    setPassData({ ...passData, [activePass]: newStages });
  };

  const removeStage = () => {
    if (activeStages.length <= 1) return;
    setPassData({ ...passData, [activePass]: activeStages.slice(0, -1) });
  };

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

      {/* Flow Calculator Dialog */}
      <Dialog open={flowOpen} onOpenChange={setFlowOpen}>
        <DialogContent className='max-w-[1100px] p-0 overflow-hidden bg-white'>
          <div className='px-6 py-5 bg-slate-50/50 flex flex-col gap-1'>
            <DialogTitle className='font-display text-xl text-primary font-semibold'>
              Flow Calculator
            </DialogTitle>
            <p className='text-sm text-slate-500'>
              Please edit flow values for your RO system
            </p>
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
                  <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                    <span>Feed Flow Rate</span>
                    <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                      1
                    </span>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <Input
                      defaultValue={projectData.feedFlow.toFixed(2)}
                      className='h-9 bg-slate-100 border-slate-200 focus-visible:ring-primary/20 rounded-sm'
                    />
                    <span className='text-sm text-slate-500 min-w-[30px]'>
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
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>Feed Flow</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        1
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        defaultValue={projectData.feedFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>Product Flow</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        20
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        defaultValue={projectData.permeateFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>Concentrate Flow</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        21
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        defaultValue={projectData.rejectFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>System Recovery</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        20/1
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        defaultValue={projectData.recovery.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 min-w-[30px]'>
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
                    <span className='text-sm font-medium text-slate-700'>
                      Net
                    </span>
                  </div>

                  <div>
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>Net Feed</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        5
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        defaultValue={projectData.feedFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>Net Recovery</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        8/5
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        defaultValue={projectData.recovery.toFixed(2)}
                        className='h-9 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 min-w-[30px]'>
                        %
                      </span>
                    </div>
                    <p className='text-[10px] text-slate-400 mt-1.5'>
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
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>Permeate Flow</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        8
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        defaultValue={projectData.permeateFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>Flux</span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        defaultValue='4805.32'
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 rounded-sm'
                      />
                      <div className='h-9 bg-slate-200/60 px-2 flex items-center justify-center rounded-sm'>
                        <span className='text-sm text-slate-500'>LMH</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-sm text-slate-600 mb-1.5'>
                      <span>Concentrate Flow</span>
                      <span className='border border-slate-200 text-xs px-1.5 rounded-sm bg-white font-mono'>
                        10
                      </span>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <Input
                        disabled
                        defaultValue={projectData.rejectFlow.toFixed(2)}
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 min-w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Concentrate Recycle */}
              <div className='flex-1 px-6 border-r border-slate-200'>
                <h3 className='text-[15px] font-medium text-primary mb-4'>
                  Concentrate Recycle
                </h3>
                <div className='space-y-5'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      className='accent-primary w-4 h-4 rounded-sm border-slate-300 cursor-pointer'
                    />
                    <span className='text-sm font-medium text-slate-700'>
                      Pass 1
                    </span>
                  </div>

                  <div className='flex gap-4 items-center'>
                    <div className='flex items-center gap-2 flex-1'>
                      <input
                        type='radio'
                        disabled
                        className='w-4 h-4 opacity-50 cursor-not-allowed'
                      />
                      <Input
                        disabled
                        defaultValue='0.00'
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 flex-1 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 w-[20px]'>%</span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                      <input
                        type='radio'
                        disabled
                        className='w-4 h-4 opacity-50 cursor-not-allowed'
                      />
                      <Input
                        disabled
                        defaultValue='0.00'
                        className='h-9 bg-slate-200/60 border-transparent text-slate-500 flex-1 rounded-sm'
                      />
                      <span className='text-sm text-slate-500 w-[30px]'>
                        m³/h
                      </span>
                    </div>
                  </div>
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
                      <span className='text-sm font-medium text-slate-700'>
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
                      <span className='text-sm font-medium text-slate-700'>
                        None
                      </span>
                    </div>
                  </div>

                  {passOptimizationMode === 'Bypass' && (
                    <div className='space-y-3 pt-2'>
                      <div className='flex justify-between items-end'>
                        <span className='text-sm text-slate-600 mb-2'>
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
                          className='accent-primary w-4 h-4 cursor-pointer'
                        />
                        <Input
                          disabled
                          defaultValue='0.00'
                          className='h-9 bg-slate-200/60 border-transparent text-slate-500 flex-1 rounded-sm'
                        />
                        <span className='text-sm text-slate-500 w-[30px]'>
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
                          readOnly
                          checked
                          name='sysPerm'
                          className='accent-primary w-4 h-4 cursor-pointer'
                        />
                        <Input
                          defaultValue='0.00'
                          className='h-9 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-sm flex-1'
                        />
                        <span className='text-sm text-slate-500 w-[30px]'>
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
              className='rounded-full px-6 text-slate-700 border-slate-300 hover:bg-slate-50'
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
            <p className='text-[13px] text-muted-foreground mt-1'>
              You may add chemicals/degas from here. Based on your selection
              table gets updated. Please note that LSI and S&DI require non zero
              Ca and CO₂ Concentrations.
            </p>
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
                      phDownOn ? 'text-primary' : 'text-slate-600',
                    )}
                  >
                    ↓ pH
                  </span>
                  <button
                    onClick={() => setPhDownOn(!phDownOn)}
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
                          : 'right-1.5 text-slate-500',
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
                  <Select disabled={!phDownOn} defaultValue='HCl(32)'>
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs',
                        phDownOn
                          ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                          : 'bg-slate-50 border-transparent text-slate-400',
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
                    <Input
                      disabled={!phDownOn}
                      defaultValue={phDownOn ? '6.50' : ''}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0',
                        phDownOn ? 'bg-white text-slate-800' : 'bg-slate-50',
                      )}
                    />
                    <div className='px-2 text-[10px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                      pH
                    </div>
                  </div>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <Input
                      disabled={!phDownOn}
                      defaultValue={phDownOn ? '0.00' : ''}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0',
                        phDownOn ? 'bg-white text-slate-800' : 'bg-slate-50',
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
                      degasOn ? 'text-primary' : 'text-slate-600',
                    )}
                  >
                    Degas
                  </span>
                  <button
                    onClick={() => setDegasOn(!degasOn)}
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
                          : 'right-1.5 text-slate-500',
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
                      onChange={() => setDegasMode('CO2 % Removal')}
                      className='accent-primary w-3.5 h-3.5 cursor-pointer disabled:opacity-50'
                      disabled={!degasOn}
                    />
                    <div className='flex-1'>
                      <span className='text-[10px] leading-tight text-slate-500 font-medium block'>
                        CO₂ %<br />
                        Removal
                      </span>
                    </div>
                    <div className='flex items-center border border-border rounded-md h-7 overflow-hidden w-[65px]'>
                      <Input
                        disabled={!degasOn || degasMode !== 'CO2 % Removal'}
                        defaultValue='0.00'
                        className={cn(
                          'h-full flex-1 border-0 rounded-none text-xs font-mono px-1.5 text-right focus-visible:ring-0',
                          degasOn && degasMode === 'CO2 % Removal'
                            ? 'bg-white text-slate-800'
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
                      onChange={() => setDegasMode('CO2 Partial Pressure')}
                      className='accent-primary w-3.5 h-3.5 cursor-pointer disabled:opacity-50'
                      disabled={!degasOn}
                    />
                    <div className='flex-1'>
                      <span className='text-[10px] leading-tight text-slate-500 font-medium block'>
                        CO₂ Partial
                        <br />
                        Pressure
                      </span>
                    </div>
                    <div className='flex items-center border border-border rounded-md h-7 overflow-hidden w-[65px]'>
                      <Input
                        disabled={
                          !degasOn || degasMode !== 'CO2 Partial Pressure'
                        }
                        defaultValue='0.00'
                        className={cn(
                          'h-full flex-1 border-0 rounded-none text-xs font-mono px-1.5 text-right focus-visible:ring-0',
                          degasOn && degasMode === 'CO2 Partial Pressure'
                            ? 'bg-white text-slate-800'
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
                        onChange={() => setDegasMode('CO2 Concentration')}
                        className='accent-primary w-3.5 h-3.5 cursor-pointer disabled:opacity-50'
                        disabled={!degasOn}
                      />
                    </div>
                    <div className='flex-1 pt-1'>
                      <span className='text-[10px] leading-tight text-slate-500 font-medium block'>
                        CO₂
                        <br />
                        Concentration
                      </span>
                    </div>
                    <div className='flex flex-col items-end w-[65px]'>
                      <div className='flex items-center border border-border rounded-md h-7 overflow-hidden w-full'>
                        <Input
                          disabled={
                            !degasOn || degasMode !== 'CO2 Concentration'
                          }
                          defaultValue={
                            degasOn && degasMode === 'CO2 Concentration'
                              ? '10.00'
                              : '0.00'
                          }
                          className={cn(
                            'h-full flex-1 border-0 rounded-none text-xs font-mono px-1 text-right focus-visible:ring-0',
                            degasOn && degasMode === 'CO2 Concentration'
                              ? 'bg-white text-slate-800'
                              : 'bg-slate-50',
                          )}
                        />
                        <div className='px-1 text-[9px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                          mg/L
                        </div>
                      </div>
                      <span className='text-[8px] text-slate-400 mt-1 font-medium'>
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
                      phUpOn ? 'text-primary' : 'text-slate-600',
                    )}
                  >
                    ↑ pH
                  </span>
                  <button
                    onClick={() => setPhUpOn(!phUpOn)}
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
                          : 'right-1.5 text-slate-500',
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
                  <Select disabled={!phUpOn} defaultValue='NaOH(50)'>
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs',
                        phUpOn
                          ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                          : 'bg-slate-50 border-transparent text-slate-400',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='NaOH(50)'>NaOH(50)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <Input
                      disabled={!phUpOn}
                      defaultValue={phUpOn ? '0.00' : ''}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0',
                        phUpOn ? 'bg-white text-slate-800' : 'bg-slate-50',
                      )}
                    />
                    <div className='px-2 text-[10px] text-muted-foreground border-l border-border bg-muted/20 h-full flex items-center font-bold'>
                      pH
                    </div>
                  </div>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <Input
                      disabled={!phUpOn}
                      defaultValue={phUpOn ? '0.00' : ''}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0',
                        phUpOn ? 'bg-white text-slate-800' : 'bg-slate-50',
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
                      antiScalantOn ? 'text-primary' : 'text-slate-600',
                    )}
                  >
                    Anti-Scalant
                  </span>
                  <button
                    onClick={() => setAntiScalantOn(!antiScalantOn)}
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
                          : 'right-1.5 text-slate-500',
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
                    defaultValue='Na6P6O18(100)'
                  >
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs',
                        antiScalantOn
                          ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                          : 'bg-slate-50 border-transparent text-slate-400',
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
                    <Input
                      disabled={!antiScalantOn}
                      defaultValue={antiScalantOn ? '' : ''}
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0',
                        antiScalantOn
                          ? 'bg-white text-slate-800'
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
                      dechlorinatorOn ? 'text-primary' : 'text-slate-600',
                    )}
                  >
                    Dechlorinator
                  </span>
                  <button
                    onClick={() => setDechlorinatorOn(!dechlorinatorOn)}
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
                          : 'right-1.5 text-slate-500',
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
                  <Select disabled={!dechlorinatorOn}>
                    <SelectTrigger
                      className={cn(
                        'h-8 text-xs',
                        dechlorinatorOn
                          ? 'border-primary/40 bg-primary/5 text-primary font-semibold'
                          : 'bg-slate-50 border-transparent text-slate-400',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='NaHSO3'>NaHSO₃</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-background border border-border rounded-md h-8 overflow-hidden w-full'>
                    <Input
                      disabled={!dechlorinatorOn}
                      defaultValue=''
                      className={cn(
                        'h-full flex-1 border-0 rounded-none text-xs font-mono px-2 focus-visible:ring-0',
                        dechlorinatorOn
                          ? 'bg-white text-slate-800'
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
                <table className='w-full text-xs text-left min-w-[500px]'>
                  <thead>
                    <tr className='bg-slate-100/80 text-slate-700 font-bold border-b border-border'>
                      <th className='py-3 px-4 w-[30%]'>Measurement</th>
                      <th className='py-3 px-4'>Before Adjustment</th>
                      {degasOn && (
                        <th className='py-3 px-4 text-primary'>After Degas</th>
                      )}
                      <th className='py-3 px-4'>RO Pass1 Concentrate</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border bg-white font-medium text-slate-600'>
                    {[
                      {
                        label: 'pH',
                        b: '7.20',
                        a: '11.15',
                        r: degasOn ? '11.69' : '7.15',
                      },
                      {
                        label: 'LSI*',
                        b: '-1.38',
                        a: '0.88',
                        r: degasOn ? '1.94' : '-0.29',
                      },
                      {
                        label: 'Stiff & Davis Index*',
                        b: '-0.24',
                        a: '1.97',
                        r: degasOn ? '2.53' : '0.36',
                      },
                      {
                        label: 'TD Solutes (mg/L)',
                        b: '151.57',
                        a: '94.84',
                        r: degasOn ? '378.58' : '606.26',
                      },
                      {
                        label: 'Ionic Strength (molal)',
                        b: '0.00',
                        a: '0.00',
                        r: '0.01',
                      },
                      {
                        label: 'HCO₃⁻ (mg/L)',
                        b: '80.12',
                        a: '1.56',
                        r: degasOn ? '1.48' : '320.40',
                      },
                      {
                        label: 'CO₂ (mg/L)',
                        b: '8.56',
                        a: '0.00',
                        r: degasOn ? '0.00' : '34.28',
                      },
                      {
                        label: 'CO₃²⁻ (mg/L)',
                        b: '0.07',
                        a: '12.11',
                        r: degasOn ? '53.09' : '0.33',
                      },
                    ].map((row, i) => (
                      <tr
                        key={i}
                        className='hover:bg-slate-50/80 transition-colors'
                      >
                        <td className='py-2.5 px-4'>{row.label}</td>
                        <td className='py-2.5 px-4 font-mono'>{row.b}</td>
                        {degasOn && (
                          <td
                            className={cn(
                              'py-2.5 px-4 font-mono font-semibold',
                              parseFloat(row.a) > 0 && row.label.includes('*')
                                ? 'text-destructive'
                                : 'text-primary',
                            )}
                          >
                            {row.a}
                          </td>
                        )}
                        <td
                          className={cn(
                            'py-2.5 px-4 font-mono',
                            parseFloat(row.r) > 0 && row.label.includes('*')
                              ? 'text-destructive font-bold'
                              : '',
                          )}
                        >
                          {row.r}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Side Panels */}
              <div className='lg:col-span-1 space-y-4'>
                <div className='border border-border rounded-xl p-4 shadow-sm bg-white'>
                  <h4 className='text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3'>
                    Temperature
                  </h4>
                  <Select defaultValue='Design'>
                    <SelectTrigger className='h-8 text-xs bg-slate-50 mb-3'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Design'>Design</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className='flex items-center bg-muted/30 border border-transparent rounded-md h-8 overflow-hidden'>
                    <Input
                      disabled
                      defaultValue='15.0'
                      className='flex-1 h-full border-0 bg-transparent rounded-none px-2 text-xs font-mono text-slate-500 focus-visible:ring-0'
                    />
                    <div className='px-3 h-full flex items-center justify-center bg-white border-l border-border text-[10px] font-bold text-slate-400'>
                      °C
                    </div>
                  </div>
                </div>

                <div className='border border-border rounded-xl p-4 shadow-sm bg-white'>
                  <h4 className='text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3'>
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
                      disabled
                      defaultValue={projectData.recovery.toFixed(2)}
                      className='flex-1 h-full border-0 bg-transparent rounded-none px-2 text-xs font-mono text-slate-500 focus-visible:ring-0'
                    />
                    <div className='px-3 h-full flex items-center justify-center bg-white border-l border-border text-[10px] font-bold text-slate-400'>
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
          <Select defaultValue='design'>
            <SelectTrigger className='h-8 text-xs w-28 bg-muted/20 border-border'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='minimum'>Minimum</SelectItem>
              <SelectItem value='design'>Design</SelectItem>
              <SelectItem value='maximum'>Maximum</SelectItem>
            </SelectContent>
          </Select>
          <div className='flex items-center border border-border rounded-md bg-muted/20 overflow-hidden'>
            <Input
              defaultValue='28.0'
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
              feedFlow={projectData.feedFlow}
              permeateFlow={projectData.permeateFlow}
              rejectFlow={projectData.rejectFlow}
              recovery={projectData.recovery}
              pumpPressure={projectData.pumpPressure}
              feedTDS={projectData.feedTDS}
              permeateTDS={projectData.permeateTDS}
              rejectTDS={projectData.rejectTDS}
              stages={activeStages}
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
                  'px-6 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative',
                  activePass === p
                    ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50',
                )}
              >
                Pass {i + 1}
              </button>
              {passes.length > 1 && activePass === p && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePass(p);
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
            className='h-9 px-4 text-[10px] font-bold text-primary hover:bg-white rounded-lg gap-1.5'
          >
            <Plus className='w-3.5 h-3.5' /> ADD PASS
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <div className='h-8 w-[1px] bg-border/60 mx-2' />
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
              badge: 2,
            },
          ].map((btn) => (
            <Button
              key={btn.id}
              variant='outline'
              size='sm'
              onClick={btn.onClick}
              className='h-9 rounded-xl border-border bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all gap-2 px-4 shadow-sm relative'
            >
              <btn.icon className={cn('w-3.5 h-3.5', btn.color)} />
              {btn.label}
              {btn.badge && (
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
          <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary' />
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
              <Settings2 className='w-4 h-4 text-primary' />
            </div>
            <div>
              <h3 className='text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold'>
                Design Settings
              </h3>
              <div className='text-xs font-bold text-slate-700'>
                Pass {passes.indexOf(activePass) + 1} Configuration
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-[10px] text-slate-500 font-bold uppercase tracking-wider'>
                  No of Stages
                </span>
                <span className='text-[10px] font-mono text-primary font-bold bg-primary/5 px-2 py-0.5 rounded'>
                  {activeStages.length} STAGES
                </span>
              </div>
              <div className='flex items-center bg-slate-50 border border-border rounded-xl h-11 overflow-hidden w-full shadow-inner'>
                <button
                  onClick={removeStage}
                  className='w-12 h-full flex items-center justify-center hover:bg-white hover:text-primary text-slate-400 border-r border-border transition-colors text-lg'
                >
                  −
                </button>
                <div className='flex-1 text-center font-display font-bold text-base text-slate-700'>
                  {activeStages.length}
                </div>
                <button
                  onClick={addStage}
                  className='w-12 h-full flex items-center justify-center hover:bg-white hover:text-primary text-slate-400 border-l border-border transition-colors text-lg'
                >
                  +
                </button>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <div className='text-[10px] text-slate-500 font-bold uppercase tracking-wider'>
                  Flow Factor
                </div>
                <Input
                  defaultValue='0.85'
                  className='h-10 text-sm font-mono font-bold bg-slate-50 border-border focus-visible:ring-primary/20 rounded-xl'
                />
              </div>
              <div className='space-y-2'>
                <div className='text-[10px] text-slate-500 font-bold uppercase tracking-wider'>
                  Temp Correction
                </div>
                <div className='h-10 flex items-center justify-center bg-slate-50 border border-border rounded-xl text-xs font-mono font-bold text-slate-400'>
                  1.024
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='text-[10px] text-slate-500 font-bold uppercase tracking-wider'>
                Permeate Back Pressure
              </div>
              <div className='flex items-center bg-slate-50 border border-border rounded-xl h-11 overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-primary/10 transition-all'>
                <Input
                  defaultValue='0.00'
                  className='h-full flex-1 border-0 rounded-none text-sm font-mono font-bold bg-transparent focus-visible:ring-0 px-4'
                />
                <div className='px-4 text-[10px] text-slate-400 border-l border-border h-full flex items-center font-black'>
                  BAR
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
              <h3 className='text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold'>
                Real-time Pass Metrics
              </h3>
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-emerald-500' />
                <span className='text-[10px] font-bold text-slate-500'>
                  HEALTHY
                </span>
              </div>
              <Badge
                variant='outline'
                className='font-mono text-[10px] bg-slate-50 text-slate-500 border-border px-3'
              >
                UPDATED: 12:42 UTC
              </Badge>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {[
              {
                label: 'Net Feed',
                val: projectData.feedFlow.toFixed(2),
                unit: 'm³/h',
                color: 'text-slate-900',
                icon: Zap,
                trend: '+2.4%',
              },
              {
                label: 'Net Recovery',
                val: projectData.recovery.toFixed(1),
                unit: '%',
                color: 'text-primary',
                icon: Layers,
                trend: 'OPTIMAL',
              },
              {
                label: 'Permeate Flow',
                val: projectData.permeateFlow.toFixed(2),
                unit: 'm³/h',
                color: 'text-permeate',
                icon: Droplets,
                trend: 'STABLE',
              },
              {
                label: 'Avg Flux',
                val: '9.6',
                unit: 'LMH',
                readonly: true,
                icon: Info,
                trend: '-0.2',
              },
            ].map((f) => (
              <div
                key={f.label}
                className='p-4 rounded-2xl border border-border/50 bg-slate-50/30 group hover:border-primary/20 transition-all'
              >
                <div className='flex items-center justify-between mb-3'>
                  <div className='w-7 h-7 rounded-lg bg-white border border-border/50 flex items-center justify-center shadow-sm'>
                    <f.icon className='w-3.5 h-3.5 text-slate-400' />
                  </div>
                  <span
                    className={cn(
                      'text-[9px] font-black tracking-tighter',
                      f.trend === 'OPTIMAL' || f.trend === 'STABLE'
                        ? 'text-emerald-500'
                        : 'text-slate-400',
                    )}
                  >
                    {f.trend}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate'>
                    {f.label}
                  </span>
                  <div className='flex items-baseline gap-1 mt-1'>
                    <span
                      className={cn(
                        'text-2xl font-display font-bold tracking-tighter',
                        f.color,
                      )}
                    >
                      {f.val}
                    </span>
                    <span className='text-[10px] font-mono font-bold text-slate-400'>
                      {f.unit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sub-metrics secondary row */}
          <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border/40 pt-6'>
            <div className='flex flex-col'>
              <span className='text-[9px] font-bold text-slate-400 uppercase'>
                CONCENTRATE
              </span>
              <span className='text-sm font-mono font-bold text-warning'>
                {projectData.rejectFlow.toFixed(2)}{' '}
                <span className='text-[10px] text-slate-400 font-medium'>
                  m³/h
                </span>
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[9px] font-bold text-slate-400 uppercase'>
                SYSTEM PRESSURE
              </span>
              <span className='text-sm font-mono font-bold text-slate-700'>
                58.4{' '}
                <span className='text-[10px] text-slate-400 font-medium'>
                  BAR
                </span>
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[9px] font-bold text-slate-400 uppercase'>
                FEED TDS
              </span>
              <span className='text-sm font-mono font-bold text-slate-700'>
                35,206{' '}
                <span className='text-[10px] text-slate-400 font-medium'>
                  mg/L
                </span>
              </span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[9px] font-bold text-slate-400 uppercase'>
                POWER REQ.
              </span>
              <span className='text-sm font-mono font-bold text-slate-700'>
                420.5{' '}
                <span className='text-[10px] text-slate-400 font-medium'>
                  kW
                </span>
              </span>
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
              <div className='text-sm font-bold text-slate-800'>
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
              <tr className='bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-border'>
                <th className='px-6 py-5 w-20 text-center border-r border-border/50'>
                  STAGE
                </th>
                <th className='px-6 py-5'>VESSELS</th>
                <th className='px-6 py-5'>ELS/PV</th>
                <th className='px-6 py-5 border-r border-border/50'>TOTAL</th>
                <th className='px-6 py-5 min-w-[480px]'>
                  MEMBRANE ELEMENT SELECTION
                </th>
                <th className='px-6 py-5'>FLOW FACTOR</th>
                <th className='px-6 py-5'>ΔP PIPI</th>
                <th className='px-6 py-5'>BACK PRESS</th>
                <th className='px-6 py-5 pr-8'>RECYCLE</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {activeStages.map((stg, idx) => (
                <Fragment key={stg.id}>
                  <tr className='group hover:bg-slate-50 transition-colors'>
                    <td className='px-6 py-5 text-center border-r border-border/50'>
                      <div className='w-9 h-9 rounded-xl bg-slate-100 border border-border flex items-center justify-center text-xs font-black text-slate-700 group-hover:bg-primary/10 group-hover:text-primary transition-all mx-auto shadow-sm'>
                        {idx + 1}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
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
                        className='h-10 w-24 text-sm font-mono font-bold border-border bg-white text-slate-700 shadow-sm rounded-xl'
                      />
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center bg-white border border-border rounded-xl h-10 overflow-hidden w-32 shadow-sm'>
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
                          className='w-10 h-full flex items-center justify-center hover:bg-slate-50 text-slate-400 border-r border-border transition-colors'
                        >
                          −
                        </button>
                        <div className='flex-1 text-center font-display font-bold text-sm text-slate-700'>
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
                          className='w-10 h-full flex items-center justify-center hover:bg-slate-50 text-slate-400 border-l border-border transition-colors'
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className='px-6 py-5 border-r border-border/50'>
                      <div className='h-10 w-20 bg-slate-50 rounded-xl flex items-center justify-center font-mono text-sm font-black text-slate-400 border border-border/50 shadow-inner'>
                        {stg.vessels * stg.elements}
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-4 bg-slate-50/50 p-1.5 rounded-xl border border-border/50'>
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
                            className='text-[10px] font-black text-slate-500 uppercase cursor-pointer'
                          >
                            Single
                          </label>
                        </div>
                        <Select
                          disabled={!!stg.isd}
                          defaultValue='SW30HRLE-400i'
                        >
                          <SelectTrigger className='h-8 text-[11px] w-[200px] bg-white border-border font-bold rounded-lg shadow-sm'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='SW30HRLE-400i'>
                              SW30HRLE-400i
                            </SelectItem>
                            <SelectItem value='SW30XHR-440i'>
                              SW30XHR-440i
                            </SelectItem>
                            <SelectItem value='SWC6-MAX'>SWC6-MAX</SelectItem>
                          </SelectContent>
                        </Select>
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
                              stg.isd ? 'text-primary' : 'text-slate-400',
                            )}
                          >
                            ISD
                          </label>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <Input
                        defaultValue='0.85'
                        className='h-10 w-24 text-sm font-mono font-bold border-border bg-white text-slate-700 shadow-sm rounded-xl'
                      />
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center h-10 bg-white border border-border rounded-xl overflow-hidden shadow-sm'>
                        <Input
                          defaultValue='0.70'
                          className='h-full w-14 border-0 rounded-none text-sm font-mono font-bold px-3 focus-visible:ring-0 bg-transparent'
                        />
                        <div className='px-3 h-full flex items-center bg-slate-50 border-l border-border text-[10px] text-slate-400 font-black'>
                          BAR
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center h-10 bg-white border border-border rounded-xl overflow-hidden shadow-sm'>
                        <Input
                          defaultValue='0.00'
                          className='h-full w-14 border-0 rounded-none text-sm font-mono font-bold px-3 focus-visible:ring-0 bg-transparent'
                        />
                        <div className='px-3 h-full flex items-center bg-slate-50 border-l border-border text-[10px] text-slate-400 font-black'>
                          BAR
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5 pr-8'>
                      <div className='flex items-center h-10 bg-white border border-border rounded-xl overflow-hidden shadow-sm'>
                        <Input
                          defaultValue='0.00'
                          className='h-full w-14 border-0 rounded-none text-sm font-mono font-bold px-3 focus-visible:ring-0 bg-transparent'
                        />
                        <div className='px-3 h-full flex items-center bg-slate-50 border-l border-border text-[10px] text-slate-400 font-black'>
                          %
                        </div>
                      </div>
                    </td>
                  </tr>
                  {stg.isd && (
                    <tr className='bg-emerald-50/40 border-t-0'>
                      <td colSpan={10} className='px-6 pb-6 pt-1'>
                        <div className='flex flex-wrap gap-4'>
                          {[...Array(stg.elements)].map((_, i) => {
                            const val = stg.isdElements?.[i] || '';
                            return (
                              <div
                                key={i}
                                className='flex flex-col gap-1.5 w-[140px]'
                              >
                                <label className='text-[10px] font-bold text-slate-500'>
                                  Element {i + 1}
                                </label>
                                <Select
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
                                >
                                  <SelectTrigger
                                    className={`h-8 text-[11px] font-bold bg-white focus:ring-primary/20 ${!val ? 'border-destructive/60' : 'border-input'}`}
                                  >
                                    <SelectValue placeholder='Select Element' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='SW30HRLE-400i'>
                                      SW30HRLE-400i
                                    </SelectItem>
                                    <SelectItem value='SW30XHR-440i'>
                                      SW30XHR-440i
                                    </SelectItem>
                                    <SelectItem value='SWC6-MAX'>
                                      SWC6-MAX
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
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
