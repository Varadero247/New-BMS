'use client';

import * as React from 'react';
import { cn } from './utils';

/* -------------------------------------------------------------------------- */
/*  Shared base styles                                                        */
/* -------------------------------------------------------------------------- */

const chipBase =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap select-none';

/* -------------------------------------------------------------------------- */
/*  SeverityChip                                                              */
/* -------------------------------------------------------------------------- */

const severityStyles: Record<string, string> = {
  CRITICAL:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  HIGH:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  MEDIUM:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  LOW:
    'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300',
};

export interface SeverityChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export function SeverityChip({ severity, className, ...props }: SeverityChipProps) {
  return (
    <span
      className={cn(chipBase, severityStyles[severity] ?? severityStyles.LOW, className)}
      {...props}
    >
      {severity}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  StatusChip                                                                */
/* -------------------------------------------------------------------------- */

const statusStyles: Record<string, string> = {
  OPEN:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  UNDER_REVIEW:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  CLOSED:
    'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300',
  RESOLVED:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  DRAFT:
    'bg-slate-100 text-slate-800 dark:bg-slate-700/40 dark:text-slate-300',
  APPROVED:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  SUPERSEDED:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  CANCELLED:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const statusLabels: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  UNDER_REVIEW: 'Under Review',
  CLOSED: 'Closed',
  RESOLVED: 'Resolved',
  DRAFT: 'Draft',
  APPROVED: 'Approved',
  SUPERSEDED: 'Superseded',
  CANCELLED: 'Cancelled',
};

export type StatusValue =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'CLOSED'
  | 'RESOLVED'
  | 'DRAFT'
  | 'APPROVED'
  | 'SUPERSEDED'
  | 'CANCELLED';

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusValue;
}

export function StatusChip({ status, className, ...props }: StatusChipProps) {
  return (
    <span
      className={cn(chipBase, statusStyles[status] ?? statusStyles.OPEN, className)}
      {...props}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  ISOStatusChip                                                             */
/* -------------------------------------------------------------------------- */

const isoStyles: Record<string, string> = {
  COMPLIANT:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  PARTIAL:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  NON_COMPLIANT:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  NOT_APPLICABLE:
    'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300',
  OBSERVATION:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  MAJOR_NC:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  MINOR_NC:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

const isoLabels: Record<string, string> = {
  COMPLIANT: 'Compliant',
  PARTIAL: 'Partial',
  NON_COMPLIANT: 'Non-Compliant',
  NOT_APPLICABLE: 'N/A',
  OBSERVATION: 'Observation',
  MAJOR_NC: 'Major NC',
  MINOR_NC: 'Minor NC',
};

export type ISOStatusValue =
  | 'COMPLIANT'
  | 'PARTIAL'
  | 'NON_COMPLIANT'
  | 'NOT_APPLICABLE'
  | 'OBSERVATION'
  | 'MAJOR_NC'
  | 'MINOR_NC';

export interface ISOStatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ISOStatusValue;
}

export function ISOStatusChip({ status, className, ...props }: ISOStatusChipProps) {
  return (
    <span
      className={cn(chipBase, isoStyles[status] ?? isoStyles.NOT_APPLICABLE, className)}
      {...props}
    >
      {isoLabels[status] ?? status}
    </span>
  );
}
