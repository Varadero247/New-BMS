'use client';

import { cn } from './utils';

export type ServiceStatus =
  | 'operational'
  | 'degraded'
  | 'partial-outage'
  | 'major-outage'
  | 'unknown';

export interface StatusIndicatorProps {
  status: ServiceStatus;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<ServiceStatus, { color: string; label: string; bg: string }> = {
  operational: { color: 'bg-green-500', label: 'Operational', bg: 'bg-green-50 text-green-700' },
  degraded: { color: 'bg-yellow-500', label: 'Degraded', bg: 'bg-yellow-50 text-yellow-700' },
  'partial-outage': {
    color: 'bg-orange-500',
    label: 'Partial Outage',
    bg: 'bg-orange-50 text-orange-700',
  },
  'major-outage': { color: 'bg-red-500', label: 'Major Outage', bg: 'bg-red-50 text-red-700' },
  unknown: { color: 'bg-gray-400', label: 'Unknown', bg: 'bg-gray-50 text-gray-600' },
};

const sizeConfig = {
  sm: { dot: 'h-2 w-2', text: 'text-xs' },
  md: { dot: 'h-2.5 w-2.5', text: 'text-sm' },
  lg: { dot: 'h-3 w-3', text: 'text-sm' },
};

export function StatusIndicator({
  status,
  label,
  showLabel = true,
  size = 'md',
  pulse = false,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status] || statusConfig.unknown;
  const sizeStyle = sizeConfig[size];

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex">
        {pulse && status === 'operational' && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              config.color
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full', sizeStyle.dot, config.color)} />
      </span>
      {showLabel && (
        <span
          className={cn(
            'font-medium',
            sizeStyle.text,
            status === 'operational'
              ? 'text-green-700 dark:text-green-400'
              : status === 'degraded'
                ? 'text-yellow-700'
                : status === 'major-outage'
                  ? 'text-red-700'
                  : 'text-gray-600'
          )}
        >
          {label || config.label}
        </span>
      )}
    </div>
  );
}
