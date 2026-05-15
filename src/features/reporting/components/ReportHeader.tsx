'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectMetadata } from '@/features/reporting/types/report-types';
import { Sparkles, Globe2, Settings2, Info } from 'lucide-react';

export function ReportHeader({ data }: { data: ProjectMetadata }) {
  return (
    <Card className='p-6 mb-6 border-border bg-linear-to-br from-card via-primary-soft/10 to-permeate-soft/5 relative overflow-hidden'>
      <div className='absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none' />

      <div className='relative grid grid-cols-1 md:grid-cols-12 gap-8'>
        {/* Project Info */}
        <div className='md:col-span-6 space-y-4'>
          <div className='flex items-center gap-3'>
            <Badge
              variant='outline'
              className='bg-primary-soft text-primary border-primary/30 font-mono text-[10px]'
            >
              {data.projectNo}
            </Badge>
            <Badge
              variant='outline'
              className='bg-success-soft text-success border-success/30 text-[10px]'
            >
              VERIFIED
            </Badge>
          </div>
          <h1 className='font-display text-3xl font-bold tracking-tight text-foreground'>
            {data.projectName}
          </h1>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div>
              <span className='text-muted-foreground uppercase tracking-wider text-[10px] font-bold block mb-1'>
                Date Created
              </span>
              <span className='font-mono'>{data.dateCreated}</span>
            </div>
            <div>
              <span className='text-muted-foreground uppercase tracking-wider text-[10px] font-bold block mb-1'>
                Last Modified
              </span>
              <span className='font-mono'>{data.lastModified}</span>
            </div>
          </div>
        </div>

        {/* Elements & Tech */}
        <div className='md:col-span-3 space-y-4 border-l border-border pl-6'>
          <div className='text-[10px] uppercase tracking-[0.2em] text-primary font-bold flex items-center gap-2'>
            <Sparkles className='w-3.5 h-3.5' /> Elements Used
          </div>
          <div className='space-y-3'>
            {data.elements.map((el, i) => (
              <div
                key={i}
                className='flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-border'
              >
                <span className='text-xs font-semibold'>{el.model}</span>
                <Badge variant='secondary' className='font-mono text-[10px]'>
                  {el.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* People & Organization */}
        <div className='md:col-span-3 space-y-4 border-l border-border pl-6'>
          <div className='text-[10px] uppercase tracking-[0.2em] text-primary font-bold flex items-center gap-2'>
            <Globe2 className='w-3.5 h-3.5' /> Org & Personnel
          </div>
          <div className='space-y-2 text-xs'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Prepared By:</span>
              <span className='font-semibold text-foreground'>
                {data.preparedBy}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Company:</span>
              <span className='font-semibold text-foreground text-right'>
                {data.company}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Customer:</span>
              <span className='font-semibold text-foreground text-right'>
                {data.customer}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Market:</span>
              <span className='font-semibold text-foreground'>
                {data.marketSegment}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className='mt-6 pt-4 border-t border-border flex items-center justify-between text-[10px] font-mono text-muted-foreground'>
        <div className='flex items-center gap-4'>
          <span className='flex items-center gap-1.5'>
            <Settings2 className='w-3 h-3' /> Studio Version {data.appVersion}
          </span>
          <span className='flex items-center gap-1.5'>
            <Globe2 className='w-3 h-3' /> {data.country}
          </span>
        </div>
        {data.designWarnings.length > 0 && (
          <div className='flex items-center gap-2 text-warning font-bold'>
            <Info className='w-3 h-3' /> {data.designWarnings.length} DESIGN
            WARNINGS DETECTED
          </div>
        )}
      </div>
    </Card>
  );
}
