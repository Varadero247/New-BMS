'use client';

import * as React from 'react';
import { cn } from './utils';

export interface ModuleChipProps {
  name: string;
  standard: string;
  color: string;
  className?: string;
}

export function ModuleChip({ name, standard, color, className }: ModuleChipProps) {
  return (
    <div
      className={cn('flex items-stretch overflow-hidden', className)}
      style={{
        background: 'var(--deep, #0C1220)',
        border: '1px solid var(--border, #1E2E48)',
        borderRadius: 10,
        padding: '14px 16px',
      }}
    >
      <div
        className="shrink-0 self-stretch mr-3"
        style={{
          width: 3,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: '0.8rem',
            color: 'var(--white, #EDF3FC)',
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.62rem',
            color: 'var(--muted, #344D72)',
          }}
        >
          {standard}
        </div>
      </div>
    </div>
  );
}
