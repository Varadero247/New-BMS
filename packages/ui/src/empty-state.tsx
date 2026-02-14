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
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
      role="status"
      aria-label={title}
    >
      {Icon && (
        <div className="mb-4">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2',
            'bg-brand-600 text-white text-sm font-medium',
            'hover:bg-brand-700 active:bg-brand-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            'transition-colors disabled:pointer-events-none disabled:opacity-50',
            'dark:bg-brand-500 dark:hover:bg-brand-400'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
