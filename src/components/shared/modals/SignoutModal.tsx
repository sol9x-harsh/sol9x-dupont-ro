'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: string; // e.g. "active engineering session"
}

export function SignoutModal({ open, onOpenChange, context }: SignoutModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const signoutMutation = useMutation({
    mutationFn: async () => {
      // Deliberate delay to give a premium, interactive feel
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Call custom signout API to forcefully clear all cookies
      const res = await fetch('/api/auth/signout', { method: 'POST' });
      if (!res.ok) {
        console.warn('Signout API returned an error, proceeding with client cache clear anyway.');
      }
      
      // Clear all React Query data to prevent stale data on re-login
      queryClient.clear();
      
      // Instantly redirect to login
      router.replace('/login');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[420px] p-0 overflow-hidden bg-white border-0 shadow-2xl'>
        {/* Top destructive accent - subtle */}
        <div className='h-1.5 w-full bg-red-500/10' />
        
        <div className='p-6'>
          <DialogHeader className='space-y-4'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0'>
                <AlertTriangle className='w-6 h-6 text-red-500' />
              </div>
              <div>
                <DialogTitle className='font-display text-xl font-bold text-slate-900 tracking-tight'>
                  Sign Out
                </DialogTitle>
                <DialogDescription className='text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-0.5'>
                  Confirm Termination
                </DialogDescription>
              </div>
            </div>
            
            <div className='space-y-3 pt-2'>
              <p className='text-sm text-slate-600 leading-relaxed'>
                Are you sure you want to sign out? {context && `Your ${context} will be terminated.`}
              </p>
              
              <div className='bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5'>
                <div className='flex items-center gap-3'>
                  <div className='w-1.5 h-1.5 rounded-full bg-red-400' />
                  <span className='text-[11px] text-slate-500 font-medium'>Active session tokens will be revoked</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-1.5 h-1.5 rounded-full bg-slate-300' />
                  <span className='text-[11px] text-slate-500 font-medium'>Unsaved changes in the browser will be lost</span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <DialogFooter className='p-6 pt-0 flex flex-col sm:flex-row gap-3'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={signoutMutation.isPending}
            className='flex-1 h-11 rounded-xl border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all'
          >
            CANCEL
          </Button>
          <Button
            onClick={() => signoutMutation.mutate()}
            disabled={signoutMutation.isPending}
            variant='outline'
            className='flex-1 h-11 rounded-xl border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-2 transition-all shadow-sm'
          >
            {signoutMutation.isPending ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                SIGNING OUT...
              </>
            ) : (
              <>
                <LogOut className='w-4 h-4' />
                SIGN OUT
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
