// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
'use client';

import * as React from 'react';
import { cn } from './utils';

export interface EmptyStateProps {
  /** Icon component rendered at the top (receives className for sizing) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Primary heading text */
  title: string;
  /** Supportive description text */
  description?: string;
  /** Primary call-to-action button */
  action?: { label: string; onClick: () => void };
  className?: string;
  /** Size variant controls padding and typography */
  size?: 'sm' | 'md' | 'lg';
}

// ── Pure config helpers (unit-testable without React rendering) ───────────────

export type EmptyStateVariant = 'no-data' | 'no-results' | 'no-permission' | 'error' | 'loading';
export type EmptyStateSize = 'sm' | 'md' | 'lg';

export interface EmptyStateConfig {
  defaultTitle: string;
  defaultDescription: string;
  iconName: string;
}

const VARIANT_CONFIGS: Record<EmptyStateVariant, EmptyStateConfig> = {
  'no-data': {
    defaultTitle: 'No data yet',
    defaultDescription: 'Get started by adding your first record.',
    iconName: 'upload',
  },
  'no-results': {
    defaultTitle: 'No results found',
    defaultDescription: 'Try adjusting your search or filter to find what you are looking for.',
    iconName: 'search',
  },
  'no-permission': {
    defaultTitle: 'Access denied',
    defaultDescription: 'You do not have permission to view this content.',
    iconName: 'lock',
  },
  error: {
    defaultTitle: 'Something went wrong',
    defaultDescription: 'An unexpected error occurred. Please try again.',
    iconName: 'error',
  },
  loading: {
    defaultTitle: 'Loading…',
    defaultDescription: 'Please wait while we fetch your data.',
    iconName: 'spinner',
  },
};

/** Returns the config for a given empty state variant. */
export function getEmptyStateConfig(variant: EmptyStateVariant): EmptyStateConfig {
  return VARIANT_CONFIGS[variant] ?? VARIANT_CONFIGS['no-data'];
}

/** Returns size-specific Tailwind class groups for empty state. */
export function getEmptyStateSizeStyles(size: EmptyStateSize): {
  container: string;
  icon: string;
  title: string;
  description: string;
} {
  switch (size) {
    case 'sm':
      return {
        container: 'py-6 px-4',
        icon: 'h-8 w-8',
        title: 'text-sm font-medium',
        description: 'text-xs',
      };
    case 'lg':
      return {
        container: 'py-16 px-8',
        icon: 'h-16 w-16',
        title: 'text-xl font-semibold',
        description: 'text-base',
      };
    case 'md':
    default:
      return {
        container: 'py-12 px-6',
        icon: 'h-12 w-12',
        title: 'text-lg font-semibold',
        description: 'text-sm',
      };
  }
}

/** Resolves merged props for a variant + optional overrides. */
export function resolveEmptyStateProps(
  variant: EmptyStateVariant,
  overrides: Partial<{ title: string; description: string; size: EmptyStateSize }> = {}
): { title: string; description: string; size: EmptyStateSize; variant: EmptyStateVariant } {
  const config = getEmptyStateConfig(variant);
  return {
    title: overrides.title ?? config.defaultTitle,
    description: overrides.description ?? config.defaultDescription,
    size: overrides.size ?? 'md',
    variant,
  };
}

// ── Base Component ────────────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeStyles = getEmptyStateSizeStyles(size);
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeStyles.container,
        className
      )}
      role="status"
      aria-label={title}
      data-testid="empty-state"
    >
      {Icon && (
        <div className="mb-4">
          <Icon className={cn(sizeStyles.icon, 'text-muted-foreground')} />
        </div>
      )}
      <h3 className={cn('text-foreground mb-1', sizeStyles.title)} data-testid="empty-state-title">
        {title}
      </h3>
      {description && (
        <p
          className={cn('text-muted-foreground max-w-md leading-relaxed', sizeStyles.description)}
          data-testid="empty-state-description"
        >
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2',
            'bg-brand-600 text-white text-sm font-medium',
            'hover:bg-brand-700 active:bg-brand-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            'transition-colors disabled:pointer-events-none disabled:opacity-50',
            'dark:bg-brand-500 dark:hover:bg-brand-400'
          )}
          data-testid="empty-state-action"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Pre-built Variants ────────────────────────────────────────────────────────

export function EmptyStateNoData(props: Partial<EmptyStateProps>): React.ReactElement {
  const config = getEmptyStateConfig('no-data');
  return (
    <EmptyState
      title={props.title ?? config.defaultTitle}
      description={props.description ?? config.defaultDescription}
      icon={props.icon}
      action={props.action}
      size={props.size ?? 'md'}
      className={props.className}
    />
  );
}

export function EmptyStateNoResults(props: Partial<EmptyStateProps>): React.ReactElement {
  const config = getEmptyStateConfig('no-results');
  return (
    <EmptyState
      title={props.title ?? config.defaultTitle}
      description={props.description ?? config.defaultDescription}
      icon={props.icon}
      action={props.action}
      size={props.size ?? 'md'}
      className={props.className}
    />
  );
}

export function EmptyStateNoPermission(props: Partial<EmptyStateProps>): React.ReactElement {
  const config = getEmptyStateConfig('no-permission');
  return (
    <EmptyState
      title={props.title ?? config.defaultTitle}
      description={props.description ?? config.defaultDescription}
      icon={props.icon}
      action={props.action}
      size={props.size ?? 'md'}
      className={props.className}
    />
  );
}

export function EmptyStateError(props: Partial<EmptyStateProps>): React.ReactElement {
  const config = getEmptyStateConfig('error');
  return (
    <EmptyState
      title={props.title ?? config.defaultTitle}
      description={props.description ?? config.defaultDescription}
      icon={props.icon}
      action={props.action}
      size={props.size ?? 'md'}
      className={props.className}
    />
  );
}

export function EmptyStateLoading(props: Partial<EmptyStateProps>): React.ReactElement {
  const config = getEmptyStateConfig('loading');
  return (
    <EmptyState
      title={props.title ?? config.defaultTitle}
      description={props.description ?? config.defaultDescription}
      icon={props.icon}
      action={props.action}
      size={props.size ?? 'md'}
      className={props.className}
    />
  );
}
