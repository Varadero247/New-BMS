'use client';

import { cn } from './utils';

export interface TimelineItem {
  id: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  timestamp: string;
  badge?: { label: string; className?: string };
  user?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      {/* Connector line */}
      <div
        className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700"
        aria-hidden="true"
      />

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="relative flex gap-4">
            {/* Icon dot */}
            <div className="relative flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 z-10">
              {item.icon ? (
                <span className="h-4 w-4 text-gray-500 dark:text-gray-400">{item.icon}</span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                {item.badge && (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                      item.badge.className ||
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {item.badge.label}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-gray-500">
                <time>{item.timestamp}</time>
                {item.user && (
                  <>
                    <span aria-hidden="true">&middot;</span>
                    <span>{item.user}</span>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
