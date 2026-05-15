'use client';

import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
import { useROConfigStore } from '@/store/ro-config-store';
import { useSimulationStore } from '@/store/simulation-store';
import {
  selectTotalPermeateFlow,
  selectConcentrateFlow,
  selectSystemRecoveryPercent,
  selectFeedTDS,
  selectBlendedPermeateTDS,
  selectSystemFlows,
} from '@/store/simulation/simulation-selectors';

export function SystemDesignPFD({ editable = false }: { editable?: boolean }) {
  const flows = useSimulationStore(selectSystemFlows);
  const permeateFlow = useSimulationStore(selectTotalPermeateFlow);
  const concentrateFlow = useSimulationStore(selectConcentrateFlow);
  const permeateTDS = useSimulationStore(selectBlendedPermeateTDS);

  const { 
    feedFlow: storeFeedFlow, 
    permeateFlow: storePermeateFlow,
    setFeedFlow,
    setPermeateFlow,
    setSystemRecovery
  } = useROConfigStore();

  const displayFeed = editable ? storeFeedFlow : (flows?.feedFlowM3h ?? 0);
  const displayPermeate = editable ? storePermeateFlow : (permeateFlow ?? 0);
  const displayConcentrate = concentrateFlow ?? 0;

  return (
    <div className='flex items-center justify-between relative max-w-5xl mx-auto py-12'>
      {/* 1. Feed Block */}
      <div className='relative z-10'>
        <div className='w-48 bg-white border border-border/60 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md'>
          <div className='bg-feed/3 px-3 py-2 border-b border-border/40 flex items-center gap-2'>
            <div className='w-2.5 h-2.5 rounded-full border-2 border-feed bg-white' />
            <span className='text-[10px] font-bold text-feed uppercase tracking-wider'>
              Feed Water
            </span>
          </div>
          <div className='p-3 flex items-center gap-2'>
            {editable ? (
              <NumericInput
                value={displayFeed}
                onChange={(val) => {
                  if (val > 0) {
                    // Update feed flow. The store's setFeedFlow keeps recovery constant by default.
                    // But if we want to follow the "Feed and Product are inputs" logic,
                    // changing Feed while Product is fixed means Recovery must change.
                    if (displayPermeate > 0) {
                      const newRec = (displayPermeate / val) * 100;
                      if (newRec > 0 && newRec <= 99) {
                        setFeedFlow(val); // This will update storeFeedFlow
                        setSystemRecovery(parseFloat(newRec.toFixed(2)));
                      } else {
                        setFeedFlow(val);
                      }
                    } else {
                      setFeedFlow(val);
                    }
                  }
                }}
                className='h-9 font-mono text-sm font-bold bg-slate-50/50 border-border focus-visible:ring-feed/30 w-[80px]'
                precision={2}
              />
            ) : (
              <Input
                value={displayFeed > 0 ? displayFeed.toFixed(2) : '—'}
                readOnly
                className='h-9 font-mono text-sm font-bold bg-slate-50/50 border-border/40 focus-visible:ring-feed/30 w-[80px]'
              />
            )}
            <span className='text-[10px] text-muted-foreground font-mono font-bold bg-slate-100/50 px-1.5 py-1 rounded-md'>
              m³/h
            </span>
          </div>
        </div>
        <div className='absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-feed bg-white z-20' />
      </div>

      {/* Connector Line 1 */}
      <div className='flex-1 h-px bg-feed relative mx-[-2px]'>
        <div className='absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-feed' />
        <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent w-20 animate-flow-horizontal' />
      </div>

      {/* 2. RO Block */}
      <div className='relative z-10'>
        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-primary bg-white z-20 -translate-x-1/2' />
        <div className='w-24 h-12 bg-primary-soft/30 border border-border rounded flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer group'>
          <div className='flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 transition-opacity'>
            <div className='w-0.5 h-0.5 bg-primary rounded-full' />
            <div className='w-0.5 h-0.5 bg-primary rounded-full' />
            <div className='w-0.5 h-0.5 bg-primary rounded-full' />
          </div>
          <span className='text-xs font-black text-primary tracking-tighter'>
            RO
          </span>
        </div>
        <div className='absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-primary bg-white z-20 translate-x-1/2' />
      </div>

      {/* Connector Line 2 */}
      <div className='flex-1 h-px bg-permeate relative mx-[-2px]'>
        <div className='absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-[6px] border-l-permeate' />
        <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent w-20 animate-flow-horizontal' />
      </div>

      {/* 3. Product Block */}
      <div className='relative z-10'>
        <div className='absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-permeate bg-white z-20' />
        <div className='w-48 bg-white border border-border/60 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md'>
          <div className='bg-permeate/3 px-3 py-2 border-b border-border/40 flex items-center gap-2'>
            <div className='w-2.5 h-2.5 rounded-full border-2 border-permeate-soft bg-white' />
            <span className='text-[10px] font-bold text-permeate uppercase tracking-wider'>
              Product Water
            </span>
          </div>
          <div className='p-3 flex items-center gap-2'>
            {editable ? (
              <NumericInput
                value={displayPermeate}
                onChange={(val) => {
                  if (displayFeed > 0 && val > 0) {
                    const rec = (val / displayFeed) * 100;
                    if (rec > 0 && rec < 100) {
                      setPermeateFlow(val); // This will update storePermeateFlow and recalculate Recovery
                    }
                  }
                }}
                className='h-9 font-mono text-sm font-bold bg-slate-50/50 border-border focus-visible:ring-permeate/30 w-[80px]'
                precision={2}
              />
            ) : (
              <Input
                value={displayPermeate > 0 ? displayPermeate.toFixed(2) : '—'}
                readOnly
                className='h-9 font-mono text-sm font-bold bg-slate-50/50 border-border/40 focus-visible:ring-permeate/30 w-[80px]'
              />
            )}
            <span className='text-[10px] text-muted-foreground font-mono font-bold bg-slate-100/50 px-1.5 py-1 rounded-md'>
              m³/h
            </span>
          </div>
          {permeateTDS !== null && (
            <div className='px-3 pb-2 text-[9px] font-mono text-permeate/70 font-bold'>
              TDS: {Math.round(permeateTDS).toLocaleString('en-US')} mg/L
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
