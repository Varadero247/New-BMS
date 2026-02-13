'use client';

import { cn } from './utils';

export interface ProgressBarProps {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  indeterminate?: boolean;
  showValue?: boolean;
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const variantStyles = {
  default: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-500',
  danger: 'bg-red-600',
  info: 'bg-cyan-500',
};

export function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'default',
  indeterminate = false,
  showValue = false,
  label,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showValue && !indeterminate && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{Math.round(percent)}%</span>
          )}
        </div>
      )}
      <div
        className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', sizeStyles[size])}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        {indeterminate ? (
          <div className={cn('h-full rounded-full animate-pulse w-2/3', variantStyles[variant])} style={{ animation: 'indeterminate 1.5s ease-in-out infinite' }} />
        ) : (
          <div
            className={cn('h-full rounded-full transition-all duration-300 ease-out', variantStyles[variant])}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}
