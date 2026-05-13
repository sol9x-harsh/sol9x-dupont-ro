'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Droplets } from 'lucide-react';
import Image from 'next/image';
import loginHero from '../assets/login-hero-v5.png';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push('/projects'), 800);
  };

  return (
    <div className='h-screen w-full flex bg-white overflow-hidden font-sans'>
      {/* Left Panel: Hero Section */}
      <div className='hidden lg:flex lg:w-[48%] relative overflow-hidden group'>
        <div className='absolute inset-0'>
          <Image
            src={loginHero}
            alt='SOL9X Hero'
            fill
            className='object-cover scale-105 group-hover:scale-100 transition-transform duration-2000 ease-out'
            priority
          />
          {/* Theme Gradient Overlay */}
          <div className='absolute inset-0 bg-primary/20 mix-blend-multiply' />
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90' />
        </div>

        <div className='relative z-10 w-full h-full flex flex-col justify-between p-16 xl:p-20'>
          {/* Logo */}
          <div className='flex items-center gap-3.5'>
            <div className='w-12 h-12 rounded-2xl flex items-center justify-center bg-primary shadow-2xl shadow-primary/20'>
              <Droplets className='w-7 h-7 text-white' />
            </div>
            <div className='font-display font-black text-white text-3xl tracking-tighter'>
              SOL9X
            </div>
          </div>

          {/* Bottom Content */}
          <div className='space-y-10'>
            <div className='space-y-5 max-w-xl'>
              <h2 className='text-6xl xl:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight'>
                Design Smarter.
                <br />
                Scale Faster.
                <br />
                Create Anywhere.
              </h2>
              <p className='text-white/60 text-lg leading-relaxed max-w-sm font-medium'>
                Advanced RO simulation and engineering studio built for modern
                water treatment teams.
              </p>
            </div>

            {/* Pagination dots */}
            <div className='flex items-center gap-2.5'>
              <div className='w-10 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/40' />
              <div className='w-1.5 h-1.5 rounded-full bg-white/20' />
              <div className='w-1.5 h-1.5 rounded-full bg-white/20' />
              <div className='w-1.5 h-1.5 rounded-full bg-white/20' />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form Section */}
      <div className='flex-1 flex flex-col items-center justify-center bg-white relative'>
        <div className='w-full max-w-[420px] px-8 lg:px-0 animate-in fade-in slide-in-from-right-8 duration-1000'>
          {/* Header */}
          <div className='mb-12'>
            <h1 className='text-4xl font-display font-bold text-slate-900 tracking-tight mb-3.5'>
              {mode === 'signin' ? 'Welcome Back!' : 'Get Started'}
            </h1>
            <p className='text-slate-500 text-base leading-relaxed'>
              {mode === 'signin'
                ? 'Access your engineering workspace and start designing stunning RO systems.'
                : 'Join the next generation of water engineers and start designing smarter.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className='space-y-7'>
            {mode === 'signup' && (
              <div className='space-y-2.5'>
                <Label className='text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1'>
                  Full Name
                </Label>
                <Input
                  placeholder='Arjun Patel'
                  className='h-12 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary focus:ring-primary/5 transition-all rounded-xl'
                />
              </div>
            )}

            <div className='space-y-2.5'>
              <Label className='text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1'>
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300' />
                <Input
                  type='email'
                  placeholder='engineer@sol9x.com'
                  className='pl-11 h-12 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary focus:ring-primary/5 transition-all rounded-xl'
                />
              </div>
            </div>

            <div className='space-y-2.5'>
              <div className='flex items-center justify-between px-1'>
                <Label className='text-[11px] font-bold uppercase tracking-widest text-slate-400'>
                  Password
                </Label>
                {mode === 'signin' && (
                  <a
                    href='#'
                    className='text-[11px] font-bold text-primary hover:opacity-80 transition-opacity'
                  >
                    FORGOT PASSWORD?
                  </a>
                )}
              </div>
              <div className='relative'>
                <Lock className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300' />
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder='••••••••'
                  className='pl-11 pr-11 h-12 bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-primary focus:ring-primary/5 transition-all rounded-xl'
                />
                <button
                  type='button'
                  onClick={() => setShowPw(!showPw)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors'
                >
                  {showPw ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            <div className='flex items-center gap-2 px-1'>
              <input
                type='checkbox'
                id='remember'
                className='w-4 h-4 rounded border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer'
              />
              <label
                htmlFor='remember'
                className='text-sm text-slate-500 font-medium cursor-pointer'
              >
                Remember this device
              </label>
            </div>

            <Button
              type='submit'
              disabled={loading}
              className='w-full h-14 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98] mt-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20'
            >
              {loading ? (
                <span className='flex items-center gap-3'>
                  <svg className='animate-spin w-5 h-5' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                      fill='none'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className='flex items-center justify-center gap-2'>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className='w-4 h-4' />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className='mt-12 pt-10 border-t border-slate-100 text-center'>
            <p className='text-sm text-slate-500 font-medium'>
              {mode === 'signin'
                ? "Don't have an account yet?"
                : 'Already a member?'}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className='ml-2 text-primary font-bold hover:underline transition-all underline-offset-4'
              >
                {mode === 'signin' ? 'Register here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
