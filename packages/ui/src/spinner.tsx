import * as React from 'react';
import { cn } from './utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' } as const;

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <svg
        className={cn('animate-spin text-brand-500', sizeMap[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && <span className="text-body-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
