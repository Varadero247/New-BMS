'use client';

import * as React from 'react';
import { cn } from './utils';

export interface SectorCardProps {
  name: string;
  standard: string;
  tagline?: string;
  icon?: React.ReactNode;
  color: string;
  className?: string;
}

export function SectorCard({ name, standard, tagline, icon, color, className }: SectorCardProps) {
  return (
    <div
      className={cn('overflow-hidden', className)}
      style={{
        background: 'var(--deep, #0C1220)',
        border: '1px solid var(--border, #1E2E48)',
        borderRadius: 14,
      }}
    >
      {/* Sector head */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: `${color}10` }}>
        {icon && (
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: `${color}20`,
              color,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: '0.85rem',
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
      {/* Body */}
      {tagline && (
        <div
          className="px-5 py-3"
          style={{
            borderTop: '1px solid var(--border, #1E2E48)',
            fontSize: '0.82rem',
            color: 'var(--steel, #5A7099)',
            lineHeight: 1.6,
          }}
        >
          {tagline}
        </div>
      )}
    </div>
  );
}
