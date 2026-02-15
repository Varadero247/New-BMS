'use client';

import * as React from 'react';
import { cn } from './utils';

export interface ChangelogBannerProps {
  title: string;
  body: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ChangelogBanner({ title, body, icon, className }: ChangelogBannerProps) {
  return (
    <div
      className={cn('flex items-start gap-3', className)}
      style={{
        background: 'rgba(0,196,168,0.08)',
        border: '1px solid rgba(0,196,168,0.2)',
        borderRadius: 10,
        padding: '20px 24px',
      }}
    >
      {icon && (
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            background: 'rgba(0,196,168,0.15)',
            borderRadius: 8,
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
            fontSize: '0.9rem',
            color: 'var(--teal-core, #00C4A8)',
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--steel, #5A7099)',
            lineHeight: 1.6,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}
