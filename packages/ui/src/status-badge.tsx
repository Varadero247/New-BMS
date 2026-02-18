'use client';

import * as React from 'react';
import { cn } from './utils';

/** Compliance status for a record or module */
export type ComplianceStatus = 'compliant' | 'at-risk' | 'non-compliant' | 'in-review' | 'pending';

export interface StatusBadgeProps {
  /** The compliance status to display */
  status: ComplianceStatus;
  /** Optional custom label override */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const statusConfig: Record<
  ComplianceStatus,
  { label: string; dotColor: string; textColor: string; bgColor: string }
> = {
  compliant: {
    label: 'Compliant',
    dotColor: 'var(--teal-core)',
    textColor: 'var(--teal-core)',
    bgColor: 'rgba(0, 196, 168, 0.1)',
  },
  'at-risk': {
    label: 'At Risk',
    dotColor: 'var(--m-payroll)',
    textColor: 'var(--m-payroll)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  'non-compliant': {
    label: 'Non-Compliant',
    dotColor: 'var(--m-safety)',
    textColor: 'var(--m-safety)',
    bgColor: 'rgba(240, 75, 90, 0.1)',
  },
  'in-review': {
    label: 'In Review',
    dotColor: 'var(--blue-hi)',
    textColor: 'var(--blue-hi)',
    bgColor: 'rgba(91, 148, 255, 0.1)',
  },
  pending: {
    label: 'Pending',
    dotColor: 'var(--steel)',
    textColor: 'var(--steel)',
    bgColor: 'rgba(90, 112, 153, 0.1)',
  },
};

const sizeConfig = {
  sm: { px: '8px', py: '3px', fontSize: '0.62rem', dot: 5, gap: 5 },
  md: { px: '10px', py: '4px', fontSize: '0.7rem', dot: 6, gap: 6 },
  lg: { px: '12px', py: '5px', fontSize: '0.78rem', dot: 7, gap: 7 },
};

/**
 * StatusBadge displays a compliance status with coloured indicator dot.
 * Uses CSS custom properties for all colours — zero hardcoded hex.
 */
export function StatusBadge({ status, label, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const s = sizeConfig[size];

  return (
    <span
      className={cn('inline-flex items-center font-medium select-none', className)}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: s.fontSize,
        letterSpacing: '0.04em',
        padding: `${s.py} ${s.px}`,
        borderRadius: 6,
        backgroundColor: config.bgColor,
        color: config.textColor,
        gap: s.gap,
      }}
    >
      <span
        className="shrink-0 rounded-full"
        style={{
          width: s.dot,
          height: s.dot,
          backgroundColor: config.dotColor,
        }}
      />
      {label || config.label}
    </span>
  );
}

export default StatusBadge;
