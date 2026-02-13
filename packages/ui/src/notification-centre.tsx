'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from './utils';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  href?: string;
  createdAt: string;
}

export interface NotificationCentreProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onClick?: (notification: Notification) => void;
  className?: string;
}

const typeStyles: Record<string, { dot: string; bg: string }> = {
  info: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  success: { dot: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  warning: { dot: 'bg-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  error: { dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationCentre({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClick,
  className,
}: NotificationCentreProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleClick = useCallback(
    (n: Notification) => {
      if (!n.read) onMarkRead(n.id);
      onClick?.(n);
    },
    [onMarkRead, onClick]
  );

  return (
    <div className={cn('relative', className)} ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative inline-flex items-center justify-center h-9 w-9 rounded-md border',
          'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
          'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map(n => {
                const style = typeStyles[n.type] || typeStyles.info;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors',
                      n.read
                        ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                        : `${style.bg} hover:opacity-90`
                    )}
                    onClick={() => handleClick(n)}
                  >
                    <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', n.read ? 'bg-transparent' : style.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn('text-sm truncate', n.read ? 'text-gray-700 dark:text-gray-300' : 'font-medium text-gray-900 dark:text-gray-100')}>
                          {n.title}
                        </p>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); onDismiss(n.id); }}
                          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          aria-label="Dismiss"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
