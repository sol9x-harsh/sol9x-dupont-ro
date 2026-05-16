'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Beaker } from 'lucide-react';
import { useROConfigStore } from '@/store/ro-config-store';
import { NumericInput } from '@/components/ui/numeric-input';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function TOCModal({ open, onOpenChange }: Props) {
  const tocFeedMgL         = useROConfigStore((s) => s.chemicalAdjustment.tocFeedMgL);
  const tocRejectionPercent = useROConfigStore((s) => s.chemicalAdjustment.tocRejectionPercent);
  const updateChemicalAdjustment = useROConfigStore((s) => s.updateChemicalAdjustment);

  // Local draft state — committed on "Apply".
  const [draftFeed, setDraftFeed]       = useState(tocFeedMgL);
  const [draftRej,  setDraftRej]        = useState(tocRejectionPercent);

  // Sync draft when modal is opened with current store values.
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setDraftFeed(tocFeedMgL);
      setDraftRej(tocRejectionPercent);
    }
    onOpenChange(o);
  };

  const feedValid = draftFeed >= 0 && Number.isFinite(draftFeed);
  const rejValid  = draftRej >= 0 && draftRej <= 100;
  const valid     = feedValid && rejValid;

  const permTOC = feedValid && rejValid
    ? (draftFeed * (1 - draftRej / 100)).toFixed(3)
    : '—';

  const handleApply = () => {
    if (!valid) return;
    updateChemicalAdjustment({
      tocFeedMgL: draftFeed,
      tocRejectionPercent: draftRej,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-2 mb-1'>
            <Badge
              variant='outline'
              className='bg-primary-soft text-primary border-primary/30'
            >
              Engineering Utility
            </Badge>
            <Badge variant='outline' className='font-mono text-[10px]'>
              §16.7
            </Badge>
          </div>
          <DialogTitle className='font-display text-xl flex items-center gap-2'>
            <Beaker className='w-5 h-5 text-primary' /> TOC Rejection
          </DialogTitle>
          <p className='text-sm text-muted-foreground'>
            Specify feed TOC and membrane rejection for permeate quality estimation.
          </p>
        </DialogHeader>

        <div className='space-y-5 pt-2'>
          {/* Feed TOC input */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>
                Feed TOC
              </span>
              <div className='flex items-center gap-1.5'>
                <NumericInput
                  value={draftFeed}
                  onChange={(val) => setDraftFeed(val)}
                  precision={2}
                  className='h-9 w-24 font-mono text-right'
                />
                <span className='text-xs text-muted-foreground font-mono'>mg/L</span>
              </div>
            </div>
            {!feedValid && (
              <div className='text-[11px] text-destructive mt-1'>
                Feed TOC must be ≥ 0.
              </div>
            )}
          </div>

          {/* TOC rejection slider + input */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-[10px] uppercase tracking-wider text-muted-foreground font-bold'>
                Rejection
              </span>
              <div className='flex items-center gap-1.5'>
                <Input
                  type='number'
                  value={draftRej}
                  min={0}
                  max={100}
                  step={0.5}
                  onChange={(e) => setDraftRej(Number(e.target.value))}
                  className='h-9 w-20 font-mono text-right'
                />
                <span className='text-xs text-muted-foreground font-mono'>%</span>
              </div>
            </div>
            <Slider
              value={[draftRej]}
              onValueChange={(v) => setDraftRej(v[0])}
              min={0}
              max={100}
              step={0.5}
            />
            {!rejValid && (
              <div className='text-[11px] text-destructive mt-1.5'>
                Rejection must be between 0 and 100%.
              </div>
            )}
          </div>

          {/* Result summary */}
          <div className='rounded-lg border border-border bg-muted/40 p-4 space-y-2.5'>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>Feed TOC</span>
              <span className='font-mono font-semibold'>
                {feedValid ? `${draftFeed.toFixed(2)} mg/L` : '—'}
              </span>
            </div>
            <div className='flex items-center justify-between text-xs'>
              <span className='text-muted-foreground'>Rejection applied</span>
              <span className='font-mono font-semibold'>
                {rejValid ? `${draftRej.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className='h-px bg-border' />
            <div className='flex items-center justify-between'>
              <span className='text-xs text-foreground font-semibold'>
                Estimated Permeate TOC
              </span>
              <span className='font-mono font-semibold text-primary'>
                {permTOC} mg/L
              </span>
            </div>
          </div>

          <div className='text-[11px] text-muted-foreground italic'>
            Affects permeate TOC estimation only. Does not influence ion
            transport, osmotic pressure, or flux calculations.
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={handleApply}
            className='bg-linear-to-r from-primary to-primary-glow text-primary-foreground'
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
