'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Droplets,
  AlertTriangle,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const authMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Registration failed');
        }
      }

      const result = await signIn('credentials', {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      router.push('/projects');
    },
    onError: (err: any) => {
      setError(err.message);
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value ?? '';
    const password = passwordRef.current?.value ?? '';
    const name = nameRef.current?.value ?? '';

    authMutation.mutate({ email, password, name });
  };

  return (
    <div className='min-h-screen w-full flex bg-white font-sans selection:bg-primary/20 selection:text-primary'>
      {/* Left Panel: Hero Section */}
      <div className='hidden lg:flex lg:w-[48%] overflow-hidden group sticky top-0 h-screen'>
        <div className='absolute inset-0'>
          <Image
            src='/assets/login-hero-v5.png'
            alt='Login Hero'
            fill
            sizes='50vw'
            className='object-cover scale-105 group-hover:scale-100 transition-transform duration-2000 ease-out'
            priority
          />
          {/* Theme Gradient Overlay */}
          <div className='absolute inset-0 bg-primary/20 mix-blend-multiply' />
          <div className='absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-transparent opacity-100' />
        </div>

        <div className='relative z-10 w-full h-full flex flex-col justify-between p-16 xl:p-20'>
          {/* Logo */}
          <div className='flex items-center gap-3.5'>
            <div className='w-14 h-14 rounded-2xl flex items-center justify-center bg-primary shadow-2xl shadow-primary/30 ring-1 ring-white/20 backdrop-blur-sm'>
              <Droplets className='w-7 h-7 text-white' />
            </div>
            <div className='font-display font-black text-white text-3xl tracking-tighter'>
              TRANSFILM
            </div>
          </div>

          {/* Bottom Content */}
          <div className='space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both'>
            <div className='space-y-6 max-w-xl'>
              <h2 className='text-[3.5rem] xl:text-[4.5rem] font-display font-black text-white leading-[1.05] tracking-tight'>
                Design Smarter.
                <br />
                Scale Faster.
                <br />
                Create Anywhere.
              </h2>
              <p className='text-white/90 text-lg xl:text-xl leading-relaxed max-w-md font-medium'>
                Advanced RO simulation and engineering studio built for modern
                water treatment teams.
              </p>
            </div>

            {/* Pagination dots */}
            <div className='flex items-center gap-3'>
              <div className='w-12 h-1.5 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' />
              <div className='w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer' />
              <div className='w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer' />
              <div className='w-2 h-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer' />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form Section */}
      <div className='flex-1 flex flex-col items-center justify-center bg-white relative py-12 lg:py-0'>
        <div className='w-full max-w-[440px] px-8 lg:px-0 animate-in fade-in slide-in-from-right-8 duration-1000'>
          {/* Header */}
          <div className='mb-10'>
            <h1 className='text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight font-display font-black text-slate-900 tracking-tight mb-3'>
              {mode === 'signin' ? 'Welcome Back.' : 'Get Started.'}
            </h1>
            <p className='text-slate-600 text-sm sm:text-[15px] leading-relaxed font-medium'>
              {mode === 'signin'
                ? 'Access your engineering workspace and start designing stunning RO systems.'
                : 'Join the next generation of water engineers and start designing smarter.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className='space-y-6'>
            {mode === 'signup' && (
              <div className='space-y-2 group'>
                <Label className='text-[11px] font-bold uppercase tracking-widest text-slate-600 ml-1 group-focus-within:text-primary transition-colors'>
                  Full Name
                </Label>
                <div className='relative'>
                  <User className='w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors' />
                  <Input
                    ref={nameRef}
                    placeholder='Arjun Patel'
                    required
                    className='pl-12 h-14 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl shadow-sm text-sm sm:text-[15px] font-medium'
                  />
                </div>
              </div>
            )}

            <div className='space-y-2 group'>
              <Label className='text-[11px] font-bold uppercase tracking-widest text-slate-600 ml-1 group-focus-within:text-primary transition-colors'>
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors' />
                <Input
                  ref={emailRef}
                  type='email'
                  placeholder='engineer@transfilm.com'
                  required
                  className='pl-12 h-14 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl shadow-sm text-sm sm:text-[15px] font-medium'
                />
              </div>
            </div>

            <div className='space-y-2 group'>
              <div className='flex items-center justify-between px-1'>
                <Label className='text-[11px] font-bold uppercase tracking-widest text-slate-600 group-focus-within:text-primary transition-colors'>
                  Password
                </Label>
              </div>
              <div className='relative'>
                <Lock className='w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors' />
                <Input
                  ref={passwordRef}
                  type={showPw ? 'text' : 'password'}
                  placeholder='••••••••'
                  required
                  className='pl-12 pr-12 h-14 bg-slate-50/50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl shadow-sm text-sm sm:text-[15px] font-medium tracking-wide'
                />
                <button
                  type='button'
                  onClick={() => setShowPw(!showPw)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 focus:text-primary transition-colors outline-none'
                >
                  {showPw ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className='flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-100 animate-in fade-in zoom-in-95 duration-200'>
                <AlertTriangle className='w-5 h-5 shrink-0 text-red-500' />
                <p>{error}</p>
              </div>
            )}

            <Button
              type='submit'
              disabled={authMutation.isPending}
              className='w-full h-14 rounded-2xl text-white font-bold text-sm sm:text-[15px] transition-all active:scale-[0.98] mt-6 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 group overflow-hidden relative'
            >
              {/* Button Shine Effect */}
              <div className='absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent' />

              {authMutation.isPending ? (
                <span className='flex items-center gap-3 relative z-10'>
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
                <span className='flex items-center justify-center gap-2 relative z-10'>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Link */}
          <div className='mt-6 text-center'>
            <p className='text-[13px] text-slate-600 font-medium'>
              {mode === 'signin'
                ? "Don't have an account?"
                : 'Already have an account?'}
              <button
                type='button'
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
                className='ml-1.5 text-slate-900 font-bold hover:underline transition-all underline-offset-2'
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
