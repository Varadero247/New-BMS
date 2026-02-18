'use client';

import * as React from 'react';

export interface NexaraIconProps {
  size?: number;
  className?: string;
}

export function NexaraIcon({ size = 16, className }: NexaraIconProps) {
  const id = React.useId();
  const gId = `nxI-${id.replace(/:/g, '')}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M 40 16 A 24 24 0 1 1 19.5 57.2"
        stroke={`url(#${gId})`}
        strokeWidth="3"
        strokeDasharray="5 3.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 40 26 A 14 14 0 1 1 26.9 50.9"
        stroke={`url(#${gId})`}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="40" cy="40" r="7" fill={`url(#${gId})`} />
      <circle cx="40" cy="40" r="3" fill="white" opacity="0.92" />
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B78F5" />
          <stop offset="60%" stopColor="#5B94FF" />
          <stop offset="100%" stopColor="#00C4A8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
