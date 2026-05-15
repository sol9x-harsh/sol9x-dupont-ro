'use client';

/**
 * NumericInput — decimal-safe controlled input for engineering values.
 *
 * Maintains local string state so the user can type freely (e.g. "0.", ".5",
 * "1.250") without cursor-jumps or destructive reformatting. Parsing and
 * min/max validation happen only on blur or Enter.
 */

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Decimal places shown on blur (default: 3) */
  precision?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function NumericInput({
  value,
  onChange,
  min,
  max,
  precision = 3,
  placeholder = '0',
  className,
  disabled,
  'aria-label': ariaLabel,
}: NumericInputProps) {
  const [draft, setDraft] = useState<string>(() =>
    formatForDisplay(value, precision),
  );
  const isFocused = useRef(false);

  // Sync from parent when not actively editing
  useEffect(() => {
    if (!isFocused.current) {
      setDraft(formatForDisplay(value, precision));
    }
  }, [value, precision]);

  function handleFocus() {
    isFocused.current = true;
    setDraft(formatForDisplay(value, precision));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow: empty, digits, one leading decimal, negative if min allows negatives
    if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
      setDraft(raw);
    }
  }

  function commit() {
    isFocused.current = false;
    const parsed = parseFloat(draft);

    if (!isFinite(parsed) || draft.trim() === '') {
      // Revert to last committed value
      setDraft(formatForDisplay(value, precision));
      return;
    }

    let clamped = parsed;
    if (min !== undefined && clamped < min) clamped = min;
    if (max !== undefined && clamped > max) clamped = max;

    setDraft(formatForDisplay(clamped, precision));
    if (clamped !== value) onChange(clamped);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      isFocused.current = false;
      setDraft(formatForDisplay(value, precision));
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <input
      type='text'
      inputMode='decimal'
      value={draft}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-full bg-transparent font-mono text-[11px] text-right',
        'border-0 outline-none ring-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    />
  );
}

function formatForDisplay(value: number, precision: number): string {
  if (!isFinite(value) || value === 0) return '';
  return value.toFixed(precision);
}
