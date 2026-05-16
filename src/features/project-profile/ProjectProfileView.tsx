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
import { useProjectStore } from '@/store/project-store';
import { useState, useEffect } from 'react';
import { useMetadata } from '@/hooks/useMetadata';

// Metadata is now fetched from the hook
const DEFAULT_SEGMENTS = [
  'Mining',
  'Municipal Drinking',
  'Municipal Wastewater',
  'Oil & Gas',
  'Pharmaceutical',
  'Power',
  'Residential',
  'Others',
];

export function ProjectProfileView() {
  const { currentProject, updateProject } = useProjectStore();
  const { data: meta } = useMetadata();

  const SEGMENTS = meta?.segments ?? DEFAULT_SEGMENTS;
  const COUNTRIES = meta?.countries ?? ['United States', 'India'];
  const CURRENCIES = meta?.currencies ?? ['US Dollar (USD)'];
  const [unitSystem, setUnitSystem] = useState<'US' | 'METRIC' | 'USER'>(
    currentProject?.unitSystem || 'METRIC',
  );
  const [userUnits, setUserUnits] = useState<Record<string, 'US' | 'METRIC'>>(
    currentProject?.userUnits || {},
  );

  const [formData, setFormData] = useState({
    name: currentProject?.name || '',
    projectNo: currentProject?.projectNo || '',
    client: currentProject?.client || '',
    segment: currentProject?.segment || 'Municipal Drinking',
    designer: currentProject?.designer || '',
    company: currentProject?.company || '',
    location: currentProject?.location || 'India',
    state: currentProject?.state || '',
    city: currentProject?.city || '',
    notes: currentProject?.notes || '',
    currency: currentProject?.currency || 'US Dollar (USD)',
    exchangeRate: currentProject?.exchangeRate || '1.00',
  });

  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name || '',
        projectNo: currentProject.projectNo || '',
        client: currentProject.client || '',
        segment: currentProject.segment || 'Municipal Drinking',
        designer: currentProject.designer || '',
        company: currentProject.company || '',
        location: currentProject.location || 'India',
        state: currentProject.state || '',
        city: currentProject.city || '',
        notes: currentProject.notes || '',
        currency: currentProject.currency || 'US Dollar (USD)',
        exchangeRate: currentProject.exchangeRate || '1.00',
      });
      if (currentProject.unitSystem) setUnitSystem(currentProject.unitSystem);
      if (currentProject.userUnits) setUserUnits(currentProject.userUnits);
    }
  }, [currentProject]);

  const handleChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Sync to store for persistence
    updateProject({
      ...newData,
      unitSystem,
      userUnits,
    });
  };

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
          <Badge variant='outline' className='bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-full font-medium'>
            Changes saved automatically
          </Badge>
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
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder='Project Name'
                    className='h-11 font-medium bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm'
                  />
                </div>
                
                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Project Number
                  </Label>
                  <Input
                    value={formData.projectNo || 'TBD'}
                    className='h-11 font-mono bg-slate-100/50 border-slate-200 border-dashed text-slate-500 rounded-sm'
                    disabled
                  />
                </div>
                
                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Market Segment
                  </Label>
                  <Select 
                    value={formData.segment} 
                    onValueChange={(v) => handleChange('segment', v)}
                  >
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
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder='Project Notes & Summary'
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
                  <Input 
                    value={formData.designer} 
                    onChange={(e) => handleChange('designer', e.target.value)}
                    className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm' 
                  />
                </div>
                
                <div className='col-span-12 md:col-span-6 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5'>
                    <Building2 className='w-3.5 h-3.5' /> Company
                  </Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm'
                  />
                </div>
                
                <div className='col-span-12 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    Customer / Client
                  </Label>
                  <Input 
                    value={formData.client} 
                    onChange={(e) => handleChange('client', e.target.value)}
                    className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm' 
                  />
                </div>
                
                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5'>
                    <MapPin className='w-3.5 h-3.5' /> Location
                  </Label>
                  <Select 
                    value={formData.location}
                    onValueChange={(v) => handleChange('location', v)}
                  >
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
                  <Input 
                    value={formData.state} 
                    onChange={(e) => handleChange('state', e.target.value)}
                    className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm' 
                  />
                </div>
                
                <div className='col-span-12 md:col-span-4 space-y-2'>
                  <Label className='text-xs font-semibold text-slate-600 uppercase tracking-wider'>
                    City
                  </Label>
                  <Input 
                    value={formData.city} 
                    onChange={(e) => handleChange('city', e.target.value)}
                    className='h-11 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-sm' 
                  />
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
                            onClick={() => {
                              setUnitSystem(u);
                              updateProject({ unitSystem: u });
                            }}
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
                          onSelect={(u) => {
                            const next = { ...userUnits, Flow: u };
                            setUserUnits(next);
                            updateProject({ userUnits: next });
                          }}
                        />
                        <UnitRow
                          label='Pressure'
                          us={['psi']}
                          metric={['bar']}
                          system={unitSystem}
                          selected={userUnits['Pressure']}
                          onSelect={(u) => {
                            const next = { ...userUnits, Pressure: u };
                            setUserUnits(next);
                            updateProject({ userUnits: next });
                          }}
                        />
                        <UnitRow
                          label='Temperature'
                          us={['°F']}
                          metric={['°C']}
                          system={unitSystem}
                          selected={userUnits['Temperature']}
                          onSelect={(u) => {
                            const next = { ...userUnits, Temperature: u };
                            setUserUnits(next);
                            updateProject({ userUnits: next });
                          }}
                        />
                        <UnitRow
                          label='Flux'
                          us={['gfd']}
                          metric={['LMH']}
                          system={unitSystem}
                          selected={userUnits['Flux']}
                          onSelect={(u) => {
                            const next = { ...userUnits, Flux: u };
                            setUserUnits(next);
                            updateProject({ userUnits: next });
                          }}
                        />
                        <UnitRow
                          label='Area'
                          us={['ft²']}
                          metric={['m²']}
                          system={unitSystem}
                          selected={userUnits['Area']}
                          onSelect={(u) => {
                            const next = { ...userUnits, Area: u };
                            setUserUnits(next);
                            updateProject({ userUnits: next });
                          }}
                        />
                        <UnitRow
                          label='Conductivity'
                          us={['-']}
                          metric={['µS/cm']}
                          system={unitSystem}
                          selected={userUnits['Conductivity']}
                          onSelect={(u) => {
                            const next = { ...userUnits, Conductivity: u };
                            setUserUnits(next);
                            updateProject({ userUnits: next });
                          }}
                        />
                        <UnitRow
                          label='Density'
                          us={['lb/gal']}
                          metric={['g/cm³']}
                          system={unitSystem}
                          selected={userUnits['Density']}
                          onSelect={(u) => {
                            const next = { ...userUnits, Density: u };
                            setUserUnits(next);
                            updateProject({ userUnits: next });
                          }}
                        />
                        <UnitRow
                          label='Length'
                          us={['in']}
                          metric={['mm']}
                          system={unitSystem}
                          selected={userUnits['Length']}
                          onSelect={(u) => {
                            const next = { ...userUnits, Length: u };
                            setUserUnits(next);
                            updateProject({ userUnits: next });
                          }}
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
                    <Select 
                      value={formData.currency}
                      onValueChange={(v) => handleChange('currency', v)}
                    >
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
                        value={formData.exchangeRate}
                        onChange={(e) => handleChange('exchangeRate', e.target.value)}
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
