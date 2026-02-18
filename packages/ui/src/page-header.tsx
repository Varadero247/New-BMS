'use client';

import * as React from 'react';
import { cn } from './utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  /** Page title — rendered as h1 with display font */
  title: string;
  /** Subtitle / description below the title */
  description?: string;
  /** Optional breadcrumb trail rendered above the title */
  breadcrumbs?: BreadcrumbItem[];
  /** Right-aligned slot for action buttons */
  actions?: React.ReactNode;
  /** Badge rendered inline with the title (e.g. count, status chip) */
  badge?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn('border-b border-border pb-4 mb-6', className)}
      aria-labelledby="page-header-title"
    >
      {/* Breadcrumb trail */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2"
        >
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span aria-hidden="true" className="text-gray-300 dark:text-gray-600">
                  /
                </span>
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground font-medium" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              id="page-header-title"
              className="font-display text-2xl font-bold text-foreground tracking-tight"
            >
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
