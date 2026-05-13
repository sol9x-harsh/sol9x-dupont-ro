'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
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

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate?: () => void;
}

const SEGMENTS = [
  'Mining',
  'Municipal Drinking',
  'Municipal Wastewater',
  'Oil & Gas',
  'Pharmaceutical',
  'Power',
  'Residential',
  'Others',
];
const COUNTRIES = [
  'United States',
  'India',
  'Saudi Arabia',
  'United Arab Emirates',
  'Qatar',
  'Singapore',
  'Australia',
  'United Kingdom',
  'Germany',
];
const CURRENCIES = [
  'US Dollar (USD)',
  'Chinese Yuan (RMB)',
  'Indian Rupee (INR)',
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
  const [name, setName] = useState('');
  const [segment, setSegment] = useState('');
  const [unitSystem, setUnitSystem] = useState<'US' | 'METRIC' | 'USER'>(
    'METRIC',
  );
  const [userUnits, setUserUnits] = useState<Record<string, 'US' | 'METRIC'>>(
    Object.fromEntries(UNITS.map(([p]) => [p, 'METRIC'])),
  );

  const close = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl p-0 overflow-hidden'>
        <DialogHeader className='px-6 pt-6 pb-4 bg-gradient-to-r from-primary-soft/60 to-permeate-soft/40 border-b border-border'>
          <Badge
            variant='outline'
            className='bg-card text-primary border-primary/30 w-fit mb-1.5'
          >
            New RO Project
          </Badge>
          <DialogTitle className='font-display text-xl'>
            Create New Project
          </DialogTitle>
          <p className='text-xs text-muted-foreground'>
            Fill in project details, designer info, and settings. Every project
            starts with Case 1 by default.
          </p>
        </DialogHeader>

        <div className='px-6 py-5 max-h-[65vh] overflow-y-auto space-y-6'>
          {/* ─── Section 1: Project Details ─── */}
          <div>
            <div className='text-[11px] uppercase tracking-widest text-primary font-bold mb-3 flex items-center gap-2'>
              <Sparkles className='w-3.5 h-3.5' /> Project Details
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Project No.
                </Label>
                <Input
                  disabled
                  value='SOL-3'
                  className='mt-1.5 bg-muted/40 font-mono'
                />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Date Created
                </Label>
                <Input
                  disabled
                  value={new Date().toLocaleDateString()}
                  className='mt-1.5 bg-muted/40 font-mono'
                />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  <span className='text-destructive'>*</span> Project Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='Enter project name'
                  className='mt-1.5'
                />
              </div>
            </div>
            <div className='grid grid-cols-3 gap-4 mt-4'>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  <span className='text-destructive'>*</span> Market Segment
                </Label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger className='mt-1.5'>
                    <SelectValue placeholder='Select segment' />
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
              <div>
                <Label className='text-xs text-muted-foreground'>
                  <span className='text-destructive'>*</span> Default Case Name
                </Label>
                <Input defaultValue='Case 1' className='mt-1.5' />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Project Notes
                </Label>
                <Textarea
                  placeholder='Project related notes…'
                  className='mt-1.5 h-10 min-h-10 resize-none'
                />
              </div>
            </div>
          </div>

          {/* ─── Section 2: Designer & Customer ─── */}
          <div>
            <div className='text-[11px] uppercase tracking-widest text-primary font-bold mb-3 flex items-center gap-2'>
              <Globe2 className='w-3.5 h-3.5' /> Designer & Customer
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Designer
                </Label>
                <Input placeholder='Full name' className='mt-1.5' />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Designer's Company
                </Label>
                <Input placeholder='Company name' className='mt-1.5' />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Customer
                </Label>
                <Input placeholder='Customer name' className='mt-1.5' />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  <span className='text-destructive'>*</span> Project Location
                </Label>
                <Select>
                  <SelectTrigger className='mt-1.5'>
                    <SelectValue placeholder='Select country' />
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
              <div>
                <Label className='text-xs text-muted-foreground'>
                  State or Province
                </Label>
                <Input placeholder='State / Province' className='mt-1.5' />
              </div>
              <div>
                <Label className='text-xs text-muted-foreground'>City</Label>
                <Input placeholder='City name' className='mt-1.5' />
              </div>
            </div>
          </div>

          {/* ─── Section 3: Settings ─── */}
          <div>
            <div className='text-[11px] uppercase tracking-widest text-primary font-bold mb-3 flex items-center gap-2'>
              <Settings2 className='w-3.5 h-3.5' /> Project Settings
            </div>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <Label className='text-xs text-muted-foreground'>
                  Select Currency
                </Label>
                <Select defaultValue={CURRENCIES[0]}>
                  <SelectTrigger className='mt-1.5'>
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
                <Label className='text-xs text-muted-foreground mt-3 block'>
                  Currency Exchange Rate
                </Label>
                <Input defaultValue='1.00' className='mt-1.5 font-mono' />
                <p className='text-[10px] text-muted-foreground mt-1'>
                  Measured against USD ($)
                </p>
              </div>

              <div>
                <Label className='text-xs text-muted-foreground mb-1.5 block'>
                  Unit System
                </Label>
                <div className='flex gap-2 mb-3'>
                  {(['US', 'METRIC', 'USER'] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnitSystem(u)}
                      className={cn(
                        'flex-1 text-xs font-semibold py-2 rounded-lg border transition-all',
                        unitSystem === u
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border text-muted-foreground hover:border-primary/40',
                      )}
                    >
                      {u === 'USER' ? 'User Defined' : u}
                    </button>
                  ))}
                </div>
                <div className='rounded-lg border border-border overflow-hidden'>
                  <div className='grid grid-cols-3 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 px-3 py-2 font-semibold'>
                    <span>Parameter</span>
                    <span className='text-center'>US</span>
                    <span className='text-center'>Metric</span>
                  </div>
                  <div className='max-h-36 overflow-y-auto'>
                    {UNITS.map(([p, us, m]) => (
                      <div
                        key={p}
                        className='grid grid-cols-3 px-3 py-1.5 text-xs border-t border-border items-center'
                      >
                        <span className='text-foreground'>{p}</span>
                        <Badge
                          variant='outline'
                          onClick={() => {
                            if (unitSystem === 'USER') {
                              setUserUnits((prev) => ({ ...prev, [p]: 'US' }));
                            }
                          }}
                          className={cn(
                            'justify-self-center font-mono text-[10px] cursor-pointer transition-all',
                            (unitSystem === 'US' ||
                              (unitSystem === 'USER' && userUnits[p] === 'US')) &&
                              'bg-primary text-primary-foreground border-primary shadow-sm',
                            unitSystem === 'USER' && 'hover:border-primary/50',
                            unitSystem !== 'USER' && 'cursor-default',
                          )}
                        >
                          {us}
                        </Badge>
                        <Badge
                          variant='outline'
                          onClick={() => {
                            if (unitSystem === 'USER') {
                              setUserUnits((prev) => ({ ...prev, [p]: 'METRIC' }));
                            }
                          }}
                          className={cn(
                            'justify-self-center font-mono text-[10px] cursor-pointer transition-all',
                            (unitSystem === 'METRIC' ||
                              (unitSystem === 'USER' &&
                                userUnits[p] === 'METRIC')) &&
                              'bg-primary text-primary-foreground border-primary shadow-sm',
                            unitSystem === 'USER' && 'hover:border-primary/50',
                            unitSystem !== 'USER' && 'cursor-default',
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
          </div>
        </div>

        <div className='flex items-center justify-between gap-2 px-6 py-4 border-t border-border bg-muted/30'>
          <Button variant='ghost' onClick={close}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onCreate?.();
              close();
            }}
            disabled={!name || !segment}
            className='gap-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground'
          >
            Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
