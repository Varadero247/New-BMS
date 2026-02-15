'use client';

import * as React from 'react';
import { cn } from './utils';

export interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'warn';
    text: string;
  };
  className?: string;
}

export function KpiCard({ label, value, trend, className }: KpiCardProps) {
  const trendColor =
    trend?.direction === 'up'
      ? 'var(--teal-core, #00C4A8)'
      : trend?.direction === 'down'
        ? '#F04B5A'
        : '#F59E0B';

  return (
    <div
      className={cn('rounded-lg p-[14px]', className)}
      style={{
        background: 'var(--surface, #162032)',
        border: '1px solid var(--border, #1E2E48)',
        borderRadius: 8,
      }}
    >
      <div
        className="mb-[6px]"
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.62rem',
          color: 'var(--muted, #344D72)',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: '1.3rem',
          color: 'var(--white, #EDF3FC)',
        }}
      >
        {value}
      </div>
      {trend && (
        <div
          className="mt-1 text-[0.7rem]"
          style={{ color: trendColor }}
        >
          {trend.direction === 'up' && '\u2191 '}
          {trend.direction === 'down' && '\u2193 '}
          {trend.direction === 'warn' && '\u26A0 '}
          {trend.text}
        </div>
      )}
    </div>
  );
}
