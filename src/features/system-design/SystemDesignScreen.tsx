'use client';

import { Card } from '@/components/ui/card';
import { SystemDesignPFD } from '@/components/report/SystemDesignPFD';

export function SystemDesignScreen() {
  return (
    <div
      className='px-6 py-4 lg:px-8 lg:py-6 space-y-6 max-w-[1600px] mx-auto fade-up'
      role='main'
      aria-label='System Design Workspace'
    >
      {/* Header */}
      <div className='flex items-start justify-between flex-wrap gap-4'>
        <div className='space-y-1.5'>
          <h1 className='font-display text-3xl font-semibold text-foreground tracking-tight'>
            System Architecture
          </h1>
          <p className='text-sm text-muted-foreground max-w-lg'>
            Define the overall RO architecture and process layout for optimal
            desalination performance.
          </p>
        </div>
      </div>

      {/* ═══ Process Flow Diagram (PFD) ═══ */}
      <Card className='border-border/60 overflow-hidden relative bg-white shadow-elegant'>
        {/* Decorative Grid Background */}
        <div className='absolute inset-0 dot-bg opacity-[0.4] pointer-events-none' />

        <div className='p-8 relative'>
          <div className='flex items-center justify-between mb-16'>
            <div>
              <h2 className='text-sm font-semibold text-foreground flex items-center gap-2'>
                Process Flow Overview{' '}
                <span className='text-[10px] font-mono font-normal text-muted-foreground px-2 py-0.5 rounded border bg-white'>
                  PFD-RO-01
                </span>
              </h2>
              <p className='text-[11px] text-muted-foreground mt-0.5'>
                Engineering-grade process configuration
              </p>
            </div>
            <div className='flex items-center gap-4 text-[10px] font-mono'>
              <div className='flex items-center gap-1.5'>
                <div className='w-2.5 h-2.5 rounded-sm border border-feed/40 bg-feed/10' />{' '}
                <span>Feed</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <div className='w-2.5 h-2.5 rounded-sm border border-primary/40 bg-primary/10' />{' '}
                <span>RO Unit</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <div className='w-2.5 h-2.5 rounded-sm border border-permeate/40 bg-permeate/10' />{' '}
                <span>Product</span>
              </div>
            </div>
          </div>

          <SystemDesignPFD />

          {/* Bottom Info Bar */}
          <div className='mt-12 pt-6 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono'>
            <div className='flex items-center gap-6'>
              <div className='flex items-center gap-2'>
                <span className='opacity-50'>SYSTEM STATUS:</span>
                <span className='text-success font-bold flex items-center gap-1.5'>
                  <span className='w-1.5 h-1.5 rounded-full bg-success pulse-soft' />{' '}
                  NOMINAL
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='opacity-50'>EFFICIENCY:</span>
                <span className='text-foreground font-bold'>42.0%</span>
              </div>
            </div>
            <div className='hidden sm:block opacity-40'>
              SOL9X - RO ENGINEERING STUDIO - v2026.05
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
