'use client';

import * as React from 'react';
import { cn } from './utils';

export interface LocationDisplayProps {
  /** Latitude in decimal degrees */
  latitude: number;
  /** Longitude in decimal degrees */
  longitude: number;
  /** GPS accuracy in metres */
  accuracy?: number;
  /** Optional label text */
  label?: string;
  /** Compact inline mode (default false) */
  compact?: boolean;
  className?: string;
}

function formatCoord(value: number, decimals = 6): string {
  return value.toFixed(decimals);
}

export function LocationDisplay({
  latitude,
  longitude,
  accuracy,
  label,
  compact = false,
  className,
}: LocationDisplayProps) {
  const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const coordString = `${formatCoord(latitude)}, ${formatCoord(longitude)}`;

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-sm text-foreground', className)}>
        {/* MapPin icon */}
        <svg
          className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-mono text-xs">{coordString}</span>
      </span>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-border bg-card p-3',
        className
      )}
    >
      {/* MapPin icon */}
      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 shrink-0">
        <svg
          className="h-5 w-5 text-brand-600 dark:text-brand-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        {label && <p className="text-sm font-medium text-foreground mb-0.5">{label}</p>}
        <p className="font-mono text-xs text-foreground">{coordString}</p>

        <div className="flex items-center gap-3 mt-1.5">
          {accuracy != null && (
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium',
                accuracy <= 10
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : accuracy <= 50
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              )}
            >
              &plusmn;{Math.round(accuracy)}m
            </span>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            {/* Navigation icon */}
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Open in Maps
          </a>
        </div>
      </div>
    </div>
  );
}
