'use client';

import { Card } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Globe2,
  Settings2,
  User,
  Building2,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';

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

export function ProjectProfileScreen() {
  const [unitSystem, setUnitSystem] = useState<'US' | 'METRIC' | 'USER'>(
    'METRIC',
  );
  const [userUnits, setUserUnits] = useState<Record<string, 'US' | 'METRIC'>>(
    {},
  );

  return (
    <div className='px-6 py-4 lg:px-8 lg:py-6 space-y-6 max-w-[1700px] mx-auto fade-up font-sans'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='space-y-1.5'>
          <h1 className='font-display text-3xl font-semibold text-foreground tracking-tight'>
            Project Profile
          </h1>
          <p className='text-sm text-muted-foreground max-w-lg'>
            Manage core project information, client details, and regional
            settings.
          </p>
        </div>
        <div className='flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0'>
          <Button className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]'>
            Save Changes
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Info Column */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Section 1: Project Details */}
          <Card className='border-slate-200 shadow-sm overflow-hidden bg-white'>
            <div className='p-6 md:p-8'>
              <div className='text-[11px] uppercase tracking-[0.2em] text-primary font-bold mb-8 flex items-center gap-2 border-b border-slate-100 pb-4'>
                <Sparkles className='w-4 h-4' /> Project Identification
              </div>

              <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                <div className='col-span-12 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Project Name
                  </Label>
                  <Input
                    defaultValue='Chennai SWRO Desalination - Phase II'
                    className='h-11 font-medium bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm'
                  />
                </div>
                
                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Project Number
                  </Label>
                  <Input
                    defaultValue='SOL-24-001'
                    className='h-11 font-mono bg-slate-100/50 border-slate-200 border-dashed text-slate-500 rounded-sm'
                    disabled
                  />
                </div>
                
                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Market Segment
                  </Label>
                  <Select defaultValue='Municipal Drinking'>
                    <SelectTrigger className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm'>
                      <SelectValue />
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

                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Status
                  </Label>
                  <div className='flex items-center gap-2 h-11 px-3 rounded-sm border border-slate-200 bg-slate-50'>
                    <Badge className='bg-success text-white border-none'>
                      Verified
                    </Badge>
                    <span className='text-[10px] text-slate-500 font-mono'>
                      May 05, 2026
                    </span>
                  </div>
                </div>
              </div>

              <div className='mt-8 space-y-2'>
                <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                  Project Notes & Summary
                </Label>
                <Textarea
                  defaultValue='Phase II expansion for the Chennai Seawater Reverse Osmosis plant. Focus on high recovery and energy efficiency using isobaric energy recovery devices.'
                  className='min-h-[100px] resize-none bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm'
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Designer & Customer */}
          <Card className='border-slate-200 shadow-sm overflow-hidden bg-white mt-6'>
            <div className='p-6 md:p-8'>
              <div className='text-[11px] uppercase tracking-[0.2em] text-primary font-bold mb-8 flex items-center gap-2 border-b border-slate-100 pb-4'>
                <User className='w-4 h-4' /> Stakeholders & Location
              </div>

              <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                <div className='col-span-12 md:col-span-6 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5'>
                    <User className='w-3.5 h-3.5' /> Designer Name
                  </Label>
                  <Input defaultValue='Rajesh Sharma' className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm' />
                </div>
                
                <div className='col-span-12 md:col-span-6 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5'>
                    <Building2 className='w-3.5 h-3.5' /> Company
                  </Label>
                  <Input
                    defaultValue='SOL9X Engineering Services'
                    className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm'
                  />
                </div>
                
                <div className='col-span-12 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Customer / Client
                  </Label>
                  <Input defaultValue='Tata Projects Ltd.' className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm' />
                </div>
                
                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5'>
                    <MapPin className='w-3.5 h-3.5' /> Location
                  </Label>
                  <Select defaultValue='India'>
                    <SelectTrigger className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm'>
                      <SelectValue />
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

                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    State / Province
                  </Label>
                  <Input defaultValue='Tamil Nadu' className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm' />
                </div>
                
                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    City
                  </Label>
                  <Input defaultValue='Chennai' className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm' />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Info Column */}
        <div className='space-y-6'>
          {/* Section 3: Project Settings */}
          <Card className='border-slate-200 shadow-sm overflow-hidden sticky top-8 bg-white'>
            <div className='p-6 md:p-8'>
              <div className='text-[11px] uppercase tracking-[0.2em] text-primary font-bold mb-8 flex items-center gap-2 border-b border-slate-100 pb-4'>
                <Settings2 className='w-4 h-4' /> Global Settings
              </div>

              <div className='space-y-6'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                      Unit System
                    </Label>
                    <button className='text-[10px] font-bold text-primary hover:underline'>
                      Make Default
                    </button>
                  </div>

                  <div className='bg-slate-100 p-1 rounded-sm grid grid-cols-3 mb-6'>
                    {(['US', 'METRIC', 'USER'] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnitSystem(u)}
                        className={cn(
                          'flex items-center justify-center gap-2 text-[11px] font-bold py-2 rounded-sm transition-all uppercase tracking-wider',
                          unitSystem === u
                            ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-800',
                        )}
                      >
                        {u === 'USER' ? 'Custom' : u}
                      </button>
                    ))}
                  </div>

                  <div className='rounded-sm border border-slate-200 overflow-hidden flex flex-col'>
                    <div className='grid grid-cols-[1fr_80px_80px] gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500'>
                      <div>Property</div>
                      <div className='text-center'>US</div>
                      <div className='text-center'>Metric</div>
                    </div>
                    <div className='max-h-[350px] overflow-y-auto scrollbar-thin'>
                      <div className='flex flex-col'>
                        <UnitRow
                          label='Flow'
                          us={['gpm']}
                          metric={['m³/h']}
                          system={unitSystem}
                          selected={userUnits['Flow']}
                          onSelect={(u) =>
                            setUserUnits((prev) => ({ ...prev, Flow: u }))
                          }
                        />
                        <UnitRow
                          label='Pressure'
                          us={['psi']}
                          metric={['bar']}
                          system={unitSystem}
                          selected={userUnits['Pressure']}
                          onSelect={(u) =>
                            setUserUnits((prev) => ({ ...prev, Pressure: u }))
                          }
                        />
                        <UnitRow
                          label='Temperature'
                          us={['°F']}
                          metric={['°C']}
                          system={unitSystem}
                          selected={userUnits['Temperature']}
                          onSelect={(u) =>
                            setUserUnits((prev) => ({
                              ...prev,
                              Temperature: u,
                            }))
                          }
                        />
                        <UnitRow
                          label='Flux'
                          us={['gfd']}
                          metric={['LMH']}
                          system={unitSystem}
                          selected={userUnits['Flux']}
                          onSelect={(u) =>
                            setUserUnits((prev) => ({ ...prev, Flux: u }))
                          }
                        />
                        <UnitRow
                          label='Area'
                          us={['ft²']}
                          metric={['m²']}
                          system={unitSystem}
                          selected={userUnits['Area']}
                          onSelect={(u) =>
                            setUserUnits((prev) => ({ ...prev, Area: u }))
                          }
                        />
                        <UnitRow
                          label='Conductivity'
                          us={['-']}
                          metric={['µS/cm']}
                          system={unitSystem}
                          selected={userUnits['Conductivity']}
                          onSelect={(u) =>
                            setUserUnits((prev) => ({
                              ...prev,
                              Conductivity: u,
                            }))
                          }
                        />
                        <UnitRow
                          label='Density'
                          us={['lb/gal']}
                          metric={['g/cm³']}
                          system={unitSystem}
                          selected={userUnits['Density']}
                          onSelect={(u) =>
                            setUserUnits((prev) => ({ ...prev, Density: u }))
                          }
                        />
                        <UnitRow
                          label='Length'
                          us={['in']}
                          metric={['mm']}
                          system={unitSystem}
                          selected={userUnits['Length']}
                          onSelect={(u) =>
                            setUserUnits((prev) => ({ ...prev, Length: u }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='p-5 bg-slate-50 border border-slate-200 rounded-sm space-y-6'>
                  <div className='space-y-3'>
                    <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between'>
                      <span>Project Currency</span>
                      <Globe2 className='w-3.5 h-3.5 text-slate-400' />
                    </Label>
                    <Select defaultValue='US Dollar (USD)'>
                      <SelectTrigger className='h-11 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-sm'>
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
                  </div>

                  <div className='space-y-3'>
                    <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                      Exchange Rate (vs USD)
                    </Label>
                    <div className='relative'>
                      <Input
                        defaultValue='1.00'
                        className='h-11 pl-8 font-mono bg-white border-slate-200 focus-visible:ring-primary/20 rounded-sm'
                      />
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm'>
                        $
                      </span>
                    </div>
                  </div>
                </div>

                <div className='pt-6 mt-2 flex flex-col gap-3'>
                  <div className='flex items-center justify-between px-2 text-[11px] text-slate-500'>
                    <span className='font-medium uppercase tracking-wider'>Date Created</span>
                    <span className='font-mono bg-slate-100 px-2 py-1 rounded-sm text-slate-600 border border-slate-200'>Oct 12, 2025</span>
                  </div>
                  <div className='flex items-center justify-between px-2 text-[11px] text-slate-500'>
                    <span className='font-medium uppercase tracking-wider'>Last Modified</span>
                    <span className='font-mono bg-slate-100 px-2 py-1 rounded-sm text-slate-600 border border-slate-200'>2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats or Help */}
          <div className='p-5 rounded-sm bg-slate-50 border border-slate-200'>
            <h4 className='text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2'>
              <Sparkles className='w-3.5 h-3.5' /> Pro Tip
            </h4>
            <p className='text-xs text-slate-600 leading-relaxed'>
              Updating the unit system will automatically convert all input
              values across the design workflow. Ensure your data is backed up
              before switching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnitRow({
  label,
  us,
  metric,
  system,
  selected,
  onSelect,
}: {
  label: string;
  us: string[];
  metric: string[];
  system: string;
  selected?: 'US' | 'METRIC';
  onSelect: (u: 'US' | 'METRIC') => void;
}) {
  const isUS = system === 'US' || (system === 'USER' && selected === 'US');
  const isMetric = system === 'METRIC' || (system === 'USER' && (selected === 'METRIC' || !selected));

  return (
    <div className='grid grid-cols-[1fr_80px_80px] gap-2 px-4 py-2 items-center border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors'>
      <span className='text-xs font-medium text-slate-700'>
        {label}
      </span>
      <div className='flex justify-center'>
        {us.length > 0 ? (
          us.map((u) => (
            <button
              key={u}
              onClick={() => system === 'USER' && onSelect('US')}
              className={cn(
                'text-[11px] font-mono px-3 py-1 rounded-sm transition-all w-full max-w-[64px]',
                isUS
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700',
                system !== 'USER' && 'cursor-default'
              )}
            >
              {u}
            </button>
          ))
        ) : (
          <span className='text-slate-300'>-</span>
        )}
      </div>
      <div className='flex justify-center'>
        {metric.map((u) => (
          <button
            key={u}
            onClick={() => system === 'USER' && onSelect('METRIC')}
            className={cn(
              'text-[11px] font-mono px-3 py-1 rounded-sm transition-all w-full max-w-[64px]',
              isMetric
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700',
              system !== 'USER' && 'cursor-default'
            )}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
