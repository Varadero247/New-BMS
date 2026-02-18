'use client';

import { cn } from './utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  description?: string;
  className?: string;
}

const trendStyles = {
  up: { color: 'text-green-600 dark:text-green-400', arrow: 'M5 10l7-7m0 0l7 7m-7-7v18' },
  down: { color: 'text-red-600 dark:text-red-400', arrow: 'M19 14l-7 7m0 0l-7-7m7 7V3' },
  neutral: { color: 'text-gray-500 dark:text-gray-400', arrow: 'M5 12h14' },
};

export function StatCard({ label, value, icon, trend, description, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  trendStyles[trend.direction].color
                )}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={trendStyles[trend.direction].arrow}
                  />
                </svg>
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
