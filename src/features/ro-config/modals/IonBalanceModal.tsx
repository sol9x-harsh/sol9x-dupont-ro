'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const IONS = [
  { sym: 'Na⁺', mg: 580, meq: 25.23, charge: '+', contrib: 38, severe: false },
  { sym: 'Ca²⁺', mg: 142, meq: 7.09, charge: '+', contrib: 18, severe: false },
  { sym: 'Mg²⁺', mg: 68, meq: 5.59, charge: '+', contrib: 14, severe: false },
  { sym: 'K⁺', mg: 12, meq: 0.31, charge: '+', contrib: 2, severe: false },
  { sym: 'Cl⁻', mg: 920, meq: 25.96, charge: '-', contrib: 42, severe: true },
  { sym: 'SO₄²⁻', mg: 380, meq: 7.91, charge: '-', contrib: 22, severe: false },
  { sym: 'HCO₃⁻', mg: 184, meq: 3.02, charge: '-', contrib: 9, severe: false },
];

export function IonBalanceModal({ open, onOpenChange }: Props) {
  const cations = IONS.filter((i) => i.charge === '+').reduce(
    (a, b) => a + b.meq,
    0,
  );
  const anions = IONS.filter((i) => i.charge === '-').reduce(
    (a, b) => a + b.meq,
    0,
  );
  const cbe = ((cations - anions) / (cations + anions)) * 200;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <div className='flex items-center gap-2 mb-1'>
            <Badge
              variant='outline'
              className='bg-warning-soft text-warning border-warning/40'
            >
              CBE Warning
            </Badge>
            <Badge variant='outline' className='font-mono text-[10px]'>
              §16.1
            </Badge>
          </div>
          <DialogTitle className='font-display text-xl'>
            Ion Balance Review
          </DialogTitle>
          <DialogDescription>
            Charge balance error exceeds the ±5% advisory threshold. Resolve
            before continuing.
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-3 gap-3'>
          <div className='rounded-lg bg-muted/40 border border-border p-3'>
            <div className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold'>
              ΣCations
            </div>
            <div className='font-mono text-xl font-semibold mt-1'>
              {cations.toFixed(2)}
            </div>
            <div className='text-[10px] text-muted-foreground font-mono'>
              meq/L
            </div>
          </div>
          <div className='rounded-lg bg-muted/40 border border-border p-3'>
            <div className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold'>
              ΣAnions
            </div>
            <div className='font-mono text-xl font-semibold mt-1'>
              {anions.toFixed(2)}
            </div>
            <div className='text-[10px] text-muted-foreground font-mono'>
              meq/L
            </div>
          </div>
          <div className='rounded-lg bg-warning-soft border border-warning/30 p-3'>
            <div className='text-[10px] uppercase tracking-widest text-warning font-bold'>
              CBE
            </div>
            <div className='font-mono text-xl font-semibold mt-1 text-warning'>
              {cbe.toFixed(2)}%
            </div>
            <div className='text-[10px] text-muted-foreground font-mono'>
              limit ±5%
            </div>
          </div>
        </div>

        <div className='rounded-lg border border-border overflow-hidden max-h-72 overflow-y-auto'>
          <table className='w-full text-xs font-mono'>
            <thead className='bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0'>
              <tr>
                <th className='px-3 py-2 text-left'>Ion</th>
                <th className='px-3 py-2 text-right'>mg/L</th>
                <th className='px-3 py-2 text-right'>meq/L</th>
                <th className='px-3 py-2 text-left'>
                  Contribution to imbalance
                </th>
              </tr>
            </thead>
            <tbody>
              {IONS.map((i) => (
                <tr
                  key={i.sym}
                  className={`border-t border-border/60 ${i.severe ? 'bg-warning-soft/40' : ''}`}
                >
                  <td className='px-3 py-2 font-semibold'>
                    {i.sym}{' '}
                    {i.severe && (
                      <span className='ml-1 text-[10px] text-warning'>●</span>
                    )}
                  </td>
                  <td className='px-3 py-2 text-right'>{i.mg.toFixed(1)}</td>
                  <td className='px-3 py-2 text-right'>{i.meq.toFixed(2)}</td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      <div className='w-32 h-1.5 rounded-full bg-muted overflow-hidden'>
                        <div
                          className={`h-full rounded-full ${i.severe ? 'bg-warning' : 'bg-primary'}`}
                          style={{ width: `${i.contrib}%` }}
                        />
                      </div>
                      <span className='text-[10px] text-muted-foreground'>
                        {i.contrib}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex gap-2.5 p-3 rounded-lg bg-primary-soft border border-primary/20'>
          <AlertTriangle className='w-4 h-4 text-primary shrink-0 mt-0.5' />
          <div className='text-xs text-foreground'>
            Auto-Balance will adjust{' '}
            <span className='font-mono font-semibold'>Cl⁻</span> by{' '}
            <span className='font-mono font-semibold'>−0.73 meq/L</span> (−25.9
            mg/L) to bring CBE within tolerance.
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='gap-2'
          >
            <RefreshCw className='w-3.5 h-3.5' /> Edit Manually
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className='gap-2 bg-linear-to-r from-primary to-primary-glow text-primary-foreground'
          >
            <Sparkles className='w-3.5 h-3.5' /> Apply Auto-Balance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
