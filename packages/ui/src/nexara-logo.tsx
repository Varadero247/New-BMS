'use client';

import * as React from 'react';
import { cn } from './utils';

export interface NexaraLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'light' | 'gradient' | 'mark-only';
  showTagline?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { mark: 20, text: 'text-sm', gap: 'gap-1.5' },
  sm: { mark: 32, text: 'text-base', gap: 'gap-2' },
  md: { mark: 40, text: 'text-xl', gap: 'gap-2.5' },
  lg: { mark: 56, text: 'text-2xl', gap: 'gap-3' },
  xl: { mark: 72, text: 'text-4xl', gap: 'gap-4' },
} as const;

function NexaraMark({
  size,
  gradientId,
  coreId,
  strokeColor,
}: {
  size: number;
  gradientId: string;
  coreId: string;
  strokeColor?: string;
}) {
  const stroke = strokeColor || `url(#${gradientId})`;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      {/* Outer arc */}
      <path
        d="M 40 6 A 34 34 0 1 1 7.5 55"
        stroke={stroke}
        strokeWidth="1.2"
        strokeDasharray="6 4"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Mid arc */}
      <path
        d="M 40 16 A 24 24 0 1 1 19.5 57.2"
        stroke={stroke}
        strokeWidth="1.6"
        strokeDasharray="5 3.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Inner arc */}
      <path
        d="M 40 26 A 14 14 0 1 1 26.9 50.9"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Radial spokes */}
      <line x1="40" y1="6" x2="40" y2="27" stroke={stroke} strokeWidth="1" opacity="0.3" />
      <line
        x1="69.5"
        y1="20.5"
        x2="52.4"
        y2="29.4"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.25"
      />
      <line x1="74" y1="54.5" x2="53.9" y2="45.7" stroke={stroke} strokeWidth="1" opacity="0.25" />
      {/* Core glow */}
      <circle cx="40" cy="40" r="10" fill={`url(#${coreId})`} opacity="0.25" />
      {/* Core dot */}
      <circle cx="40" cy="40" r="5.5" fill={stroke} />
      <circle cx="40" cy="40" r="2.5" fill="white" opacity="0.92" />
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="80"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3B78F5" />
          <stop offset="60%" stopColor="#5B94FF" />
          <stop offset="100%" stopColor="#00C4A8" />
        </linearGradient>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B78F5" stopOpacity="1" />
          <stop offset="100%" stopColor="#00C4A8" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function NexaraLogo({
  size = 'md',
  variant = 'default',
  showTagline = false,
  className,
}: NexaraLogoProps) {
  const id = React.useId();
  const gradientId = `nxG-${id.replace(/:/g, '')}`;
  const coreId = `nxCore-${id.replace(/:/g, '')}`;
  const s = sizeMap[size];

  const wordmarkColor =
    variant === 'light'
      ? 'text-[#0C1220]'
      : variant === 'gradient'
        ? 'text-white'
        : 'text-[var(--white,#EDF3FC)]';

  const strokeColor = variant === 'gradient' ? 'white' : undefined;

  if (variant === 'mark-only') {
    return (
      <span className={cn('inline-flex', className)}>
        <NexaraMark size={s.mark} gradientId={gradientId} coreId={coreId} />
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center', s.gap, className)}>
      <NexaraMark size={s.mark} gradientId={gradientId} coreId={coreId} strokeColor={strokeColor} />
      <span className="flex flex-col">
        <span
          className={cn(
            'font-display font-[800] leading-none tracking-[-0.03em]',
            s.text,
            wordmarkColor
          )}
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          nexara
        </span>
        {showTagline && (
          <span
            className="font-mono text-[0.6rem] tracking-[0.18em] uppercase"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: 'var(--steel, #5A7099)',
            }}
          >
            Every standard. One intelligent platform.
          </span>
        )}
      </span>
    </span>
  );
}
