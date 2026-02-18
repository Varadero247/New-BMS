'use client';

import { cn } from './utils';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
}

export function Skeleton({ variant = 'text', width, height, className, lines = 1 }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseStyles, 'rounded-full', className)}
        style={{ width: width ?? 40, height: height ?? 40 }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={cn(baseStyles, 'rounded-md', className)}
        style={{ width: width ?? '100%', height: height ?? 120 }}
        aria-hidden="true"
      />
    );
  }

  // Text variant
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(baseStyles, 'rounded h-4', i === lines - 1 && lines > 1 && 'w-3/4')}
          style={{
            width: i === lines - 1 && lines > 1 ? '75%' : (width ?? '100%'),
            height: height ?? undefined,
          }}
        />
      ))}
    </div>
  );
}
