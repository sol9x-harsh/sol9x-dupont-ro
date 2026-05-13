'use client';

import { Input } from '@/components/ui/input';

export function SystemDesignPFD() {
  return (
    <div className='flex items-center justify-between relative max-w-5xl mx-auto py-12'>
      {/* 1. Feed Block */}
      <div className='relative z-10'>
        <div className='w-48 bg-white border border-border/60 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md'>
          <div className='bg-feed/[0.03] px-3 py-2 border-b border-border/40 flex items-center gap-2'>
            <div className='w-2.5 h-2.5 rounded-full border-2 border-feed bg-white' />
            <span className='text-[10px] font-bold text-feed uppercase tracking-wider'>
              Feed Water
            </span>
          </div>
          <div className='p-3 flex items-center gap-2'>
            <Input
              defaultValue='250.00'
              className='h-9 font-mono text-sm font-bold bg-slate-50/50 border-border/40 focus-visible:ring-feed/30'
            />
            <span className='text-[10px] text-muted-foreground font-mono font-bold bg-slate-100/50 px-1.5 py-1 rounded-md'>
              m³/h
            </span>
          </div>
        </div>
        {/* Connection Point Right */}
        <div className='absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-feed bg-white z-20' />
      </div>

      {/* Connector Line 1 */}
      <div className='flex-1 h-px bg-feed relative mx-[-2px]'>
        <div className='absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-feed' />
        {/* Flow Animation */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-20 animate-flow-horizontal' />
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
        <div className='absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-permeate' />
        {/* Flow Animation */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-20 animate-flow-horizontal' />
      </div>

      {/* 3. Product Block */}
      <div className='relative z-10'>
        <div className='absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-permeate bg-white z-20' />
        <div className='w-48 bg-white border border-border/60 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md'>
          <div className='bg-permeate/[0.03] px-3 py-2 border-b border-border/40 flex items-center gap-2'>
            <div className='w-2.5 h-2.5 rounded-full border-2 border-permeate-soft bg-white' />
            <span className='text-[10px] font-bold text-permeate uppercase tracking-wider'>
              Product Water
            </span>
          </div>
          <div className='p-3 flex items-center gap-2'>
            <Input
              defaultValue='105.00'
              className='h-9 font-mono text-sm font-bold bg-slate-50/50 border-border/40 focus-visible:ring-permeate/30'
            />
            <span className='text-[10px] text-muted-foreground font-mono font-bold bg-slate-100/50 px-1.5 py-1 rounded-md'>
              m³/h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
