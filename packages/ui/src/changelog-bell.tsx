'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from './utils';

export interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: 'new_feature' | 'improvement' | 'bug_fix' | 'security';
  modules: string[];
  publishedAt: string;
}

export interface ChangelogBellProps {
  entries: ChangelogEntry[];
  unreadCount: number;
  onOpen?: () => void;
  onViewAll?: () => void;
  className?: string;
}

const categoryChip: Record<ChangelogEntry['category'], { label: string; className: string }> = {
  new_feature: {
    label: 'New',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  improvement: {
    label: 'Improved',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  bug_fix: {
    label: 'Fix',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  security: {
    label: 'Security',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function ChangelogBell({
  entries,
  unreadCount,
  onOpen,
  onViewAll,
  className,
}: ChangelogBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleToggle = useCallback(() => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) onOpen?.();
  }, [open, onOpen]);

  const displayEntries = entries.slice(0, 5);

  return (
    <div className={cn('relative inline-block', className)} ref={containerRef}>
      {/* Megaphone icon button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'relative inline-flex items-center justify-center h-9 w-9 rounded-md',
          'border border-border bg-card text-foreground',
          'hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
        aria-label={`Changelog${unreadCount > 0 ? ` (${unreadCount} new)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Megaphone SVG */}
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-96 max-h-[28rem] bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col"
          role="dialog"
          aria-label="Changelog"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <h3 className="text-sm font-semibold text-foreground">What&apos;s New</h3>
          </div>

          {/* Entry list */}
          <div className="overflow-y-auto flex-1">
            {displayEntries.length === 0 ? (
              <div className="flex items-center justify-center p-10 text-sm text-muted-foreground">
                No changelog entries yet
              </div>
            ) : (
              <ul>
                {displayEntries.map((entry) => {
                  const chip = categoryChip[entry.category];
                  return (
                    <li
                      key={entry.id}
                      className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] font-semibold rounded',
                            chip.className
                          )}
                        >
                          {chip.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                          {timeAgo(entry.publishedAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {entry.description}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {onViewAll && (
            <div className="px-4 py-2.5 border-t border-border shrink-0">
              <button
                type="button"
                onClick={() => {
                  onViewAll();
                  setOpen(false);
                }}
                className="w-full text-center text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
              >
                View All Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
