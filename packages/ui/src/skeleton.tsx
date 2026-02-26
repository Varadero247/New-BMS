// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
'use client';

import { cn } from './utils';

// ── Base Skeleton ─────────────────────────────────────────────────────────────

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
  rounded?: boolean;
  animate?: boolean;
}

// ── Pure helpers (unit-testable without rendering) ────────────────────────────

/** Computes resolved pixel/percent dimensions for a skeleton element. */
export function getSkeletonDimensions(props: {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}): { width: string | number; height: string | number } {
  const { width, height, variant } = props;
  if (variant === 'circular') {
    return { width: width ?? 40, height: height ?? 40 };
  }
  if (variant === 'rectangular') {
    return { width: width ?? '100%', height: height ?? 120 };
  }
  // text
  return { width: width ?? '100%', height: height ?? 16 };
}

/** Returns Tailwind class for animation. */
export function getSkeletonAnimationClass(animate: boolean): string {
  return animate ? 'animate-pulse' : '';
}

/** Returns the last-line width percentage for multi-line text skeletons. */
export function getLastLineWidth(lineIndex: number, totalLines: number): string {
  if (totalLines <= 1) return '100%';
  if (lineIndex === totalLines - 1) return '75%';
  return '100%';
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  lines = 1,
  rounded = false,
  animate = true,
}: SkeletonProps) {
  const baseStyles = cn('bg-gray-200 dark:bg-gray-700', animate ? 'animate-pulse' : '');

  if (variant === 'circular') {
    const dims = getSkeletonDimensions({ width, height, variant });
    return (
      <div
        className={cn(baseStyles, 'rounded-full', className)}
        style={{ width: dims.width, height: dims.height }}
        aria-hidden="true"
      />
    );
  }

  if (variant === 'rectangular') {
    const dims = getSkeletonDimensions({ width, height, variant });
    return (
      <div
        className={cn(baseStyles, rounded ? 'rounded-full' : 'rounded-md', className)}
        style={{ width: dims.width, height: dims.height }}
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
          className={cn(baseStyles, 'rounded h-4')}
          style={{
            width: getLastLineWidth(i, lines),
            height: height ?? undefined,
          }}
        />
      ))}
    </div>
  );
}

// ── Composite Skeletons ───────────────────────────────────────────────────────

export interface SkeletonTextProps {
  lines?: number;
  width?: string;
  className?: string;
  animate?: boolean;
}

export function SkeletonText({ lines = 3, width = '100%', className, animate = true }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 && lines > 1 ? '75%' : width}
          animate={animate}
        />
      ))}
    </div>
  );
}

export interface SkeletonCardProps {
  rows?: number;
  hasAvatar?: boolean;
  hasImage?: boolean;
  className?: string;
  animate?: boolean;
}

export function SkeletonCard({
  rows = 3,
  hasAvatar = false,
  hasImage = false,
  className,
  animate = true,
}: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border p-4 space-y-3', className)} aria-hidden="true">
      {hasImage && <Skeleton variant="rectangular" height={180} animate={animate} />}
      {hasAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={40} height={40} animate={animate} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" animate={animate} />
            <Skeleton variant="text" width="40%" animate={animate} />
          </div>
        </div>
      )}
      <SkeletonText lines={rows} animate={animate} />
    </div>
  );
}

export interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
  animate?: boolean;
}

export function SkeletonTable({ rows = 5, cols = 4, className, animate = true }: SkeletonTableProps) {
  return (
    <div className={cn('w-full', className)} aria-hidden="true">
      {/* Header */}
      <div className="flex gap-3 mb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / cols}%`} height={20} animate={animate} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 mb-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} variant="text" width={`${100 / cols}%`} animate={animate} />
          ))}
        </div>
      ))}
    </div>
  );
}

export interface SkeletonListProps {
  items?: number;
  hasIcon?: boolean;
  hasSubtitle?: boolean;
  className?: string;
  animate?: boolean;
}

export function SkeletonList({
  items = 5,
  hasIcon = false,
  hasSubtitle = false,
  className,
  animate = true,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {hasIcon && <Skeleton variant="circular" width={32} height={32} animate={animate} />}
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" animate={animate} />
            {hasSubtitle && <Skeleton variant="text" width="60%" animate={animate} />}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface SkeletonFormProps {
  fields?: number;
  hasSubmit?: boolean;
  className?: string;
  animate?: boolean;
}

export function SkeletonForm({ fields = 4, hasSubmit = true, className, animate = true }: SkeletonFormProps) {
  return (
    <div className={cn('space-y-4', className)} aria-hidden="true">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton variant="text" width="30%" height={14} animate={animate} />
          <Skeleton variant="rectangular" height={40} animate={animate} />
        </div>
      ))}
      {hasSubmit && <Skeleton variant="rectangular" width="25%" height={40} animate={animate} />}
    </div>
  );
}

export interface SkeletonStatsProps {
  count?: number;
  className?: string;
  animate?: boolean;
}

export function SkeletonStats({ count = 4, className, animate = true }: SkeletonStatsProps) {
  return (
    <div className={cn('grid gap-4', `grid-cols-${count}`, className)} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-2">
          <Skeleton variant="text" width="60%" height={14} animate={animate} />
          <Skeleton variant="text" width="80%" height={32} animate={animate} />
          <Skeleton variant="text" width="40%" height={12} animate={animate} />
        </div>
      ))}
    </div>
  );
}
