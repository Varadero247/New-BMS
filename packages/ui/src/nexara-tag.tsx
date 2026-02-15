'use client';

import * as React from 'react';
import { cn } from './utils';

export interface NexaraTagProps {
  children: React.ReactNode;
  variant?: 'teal' | 'blue' | 'version';
  className?: string;
}

const variantStyles = {
  teal: {
    background: 'rgba(0,196,168,0.1)',
    border: '1px solid rgba(0,196,168,0.2)',
    color: 'var(--teal-core, #00C4A8)',
    fontSize: '0.72rem',
    borderRadius: 8,
    padding: '4px 12px',
  },
  blue: {
    background: 'rgba(59,120,245,0.15)',
    border: '1px solid rgba(59,120,245,0.3)',
    color: 'var(--blue-hi, #5B94FF)',
    fontSize: '0.65rem',
    borderRadius: 8,
    padding: '4px 12px',
  },
  version: {
    background: 'rgba(59,120,245,0.15)',
    border: '1px solid rgba(59,120,245,0.3)',
    color: 'var(--blue-hi, #5B94FF)',
    fontSize: '0.65rem',
    borderRadius: 6,
    padding: '3px 10px',
  },
} as const;

export function NexaraTag({ children, variant = 'teal', className }: NexaraTagProps) {
  const s = variantStyles[variant];
  return (
    <span
      className={cn('inline-flex items-center font-mono uppercase tracking-[0.1em]', className)}
      style={{
        fontFamily: "'DM Mono', monospace",
        ...s,
      }}
    >
      {children}
    </span>
  );
}
