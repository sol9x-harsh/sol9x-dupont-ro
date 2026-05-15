import { CheckCircle2, AlertCircle } from 'lucide-react';

export const STATUS = {
  Verified: {
    dot: 'bg-[hsl(215,55%,45%)]',
    badge:
      'bg-[hsl(215,50%,95%)] text-[hsl(215,55%,35%)] border-[hsl(215,55%,45%)]/25',
    icon: CheckCircle2,
    label: 'Verified',
  },
  Draft: {
    dot: 'bg-[hsl(215,15%,60%)]',
    badge: 'bg-muted text-muted-foreground border-border',
    icon: AlertCircle,
    label: 'Draft',
  },
} as const;

export const TABS = ['All Projects', 'Verified', 'Drafts'] as const;
