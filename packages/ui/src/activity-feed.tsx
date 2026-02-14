'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from './utils';

// ============================================
// Types
// ============================================

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'commented'
  | 'assigned'
  | 'attachment_added'
  | 'ai_analysis_run'
  | 'review_completed'
  | 'deleted'
  | 'approved'
  | 'rejected';

export interface ActivityEntry {
  id: string;
  orgId: string;
  recordType: string;
  recordId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: ActivityAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  metadata?: Record<string, unknown>;
  createdAt: string | Date;
}

export interface ActivityFeedProps {
  /** Record type to fetch activity for (e.g. 'risk', 'incident') */
  recordType?: string;
  /** Record ID to fetch activity for */
  recordId?: string;
  /** Base URL for API requests (e.g. 'http://localhost:4000') */
  apiBaseUrl?: string;
  /** Directly provide entries instead of fetching */
  entries?: ActivityEntry[];
  /** Additional CSS class */
  className?: string;
}

export interface ActivityFeedInlineProps {
  /** Record type to fetch activity for */
  recordType?: string;
  /** Record ID to fetch activity for */
  recordId?: string;
  /** Base URL for API requests */
  apiBaseUrl?: string;
  /** Directly provide entries instead of fetching */
  entries?: ActivityEntry[];
  /** Callback when "View all" is clicked */
  onViewAll?: () => void;
  /** Additional CSS class */
  className?: string;
}

// ============================================
// Helpers
// ============================================

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getActionDescription(entry: ActivityEntry): string {
  switch (entry.action) {
    case 'created':
      return `created this ${entry.recordType}`;
    case 'updated':
      if (entry.field) {
        return `updated ${entry.field}`;
      }
      return `updated this ${entry.recordType}`;
    case 'status_changed':
      if (entry.oldValue && entry.newValue) {
        return `changed status from ${entry.oldValue} to ${entry.newValue}`;
      }
      return 'changed the status';
    case 'commented':
      return 'added a comment';
    case 'assigned':
      if (entry.newValue) {
        return `assigned to ${entry.newValue}`;
      }
      return 'updated assignment';
    case 'attachment_added':
      return 'added an attachment';
    case 'ai_analysis_run':
      return 'ran AI analysis';
    case 'review_completed':
      return 'completed a review';
    case 'deleted':
      return `deleted this ${entry.recordType}`;
    case 'approved':
      return `approved this ${entry.recordType}`;
    case 'rejected':
      return `rejected this ${entry.recordType}`;
    default:
      return `performed an action on this ${entry.recordType}`;
  }
}

// Action icon SVG paths (inline to avoid external dependencies)
const actionIcons: Record<ActivityAction, { path: string; color: string }> = {
  created: {
    path: 'M12 4v16m8-8H4',
    color: 'text-green-500',
  },
  updated: {
    path: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z',
    color: 'text-blue-500',
  },
  status_changed: {
    path: 'M13 7l5 5m0 0l-5 5m5-5H6',
    color: 'text-amber-500',
  },
  commented: {
    path: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    color: 'text-purple-500',
  },
  assigned: {
    path: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
    color: 'text-cyan-500',
  },
  attachment_added: {
    path: 'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13',
    color: 'text-gray-500',
  },
  ai_analysis_run: {
    path: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    color: 'text-yellow-500',
  },
  review_completed: {
    path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-green-600',
  },
  deleted: {
    path: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    color: 'text-red-500',
  },
  approved: {
    path: 'M5 13l4 4L19 7',
    color: 'text-green-600',
  },
  rejected: {
    path: 'M6 18L18 6M6 6l12 12',
    color: 'text-red-500',
  },
};

function ActionIcon({ action, className }: { action: ActivityAction; className?: string }) {
  const icon = actionIcons[action] || actionIcons.updated;
  return (
    <svg
      className={cn('h-4 w-4', icon.color, className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icon.path} />
    </svg>
  );
}

// ============================================
// ActivityFeed (Full)
// ============================================

export function ActivityFeed({
  recordType,
  recordId,
  apiBaseUrl,
  entries: entriesProp,
  className,
}: ActivityFeedProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>(entriesProp || []);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchEntries = useCallback(
    async (currentOffset: number, append: boolean) => {
      if (!apiBaseUrl || !recordType || !recordId) return;

      setLoading(true);
      setError(null);

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(
          `${apiBaseUrl}/api/activity?recordType=${encodeURIComponent(recordType)}&recordId=${encodeURIComponent(recordId)}&limit=${limit}&offset=${currentOffset}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch activity (${res.status})`);
        }

        const json = await res.json();
        const data = json.data || json;

        if (append) {
          setEntries((prev) => [...prev, ...(data.entries || [])]);
        } else {
          setEntries(data.entries || []);
        }
        setTotal(data.total || 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    },
    [apiBaseUrl, recordType, recordId, limit]
  );

  useEffect(() => {
    if (entriesProp) {
      setEntries(entriesProp);
      return;
    }
    if (apiBaseUrl && recordType && recordId) {
      fetchEntries(0, false);
    }
  }, [entriesProp, apiBaseUrl, recordType, recordId, fetchEntries]);

  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchEntries(newOffset, true);
  };

  const hasMore = entries.length < total;

  return (
    <div className={cn('w-full', className)}>
      <h3 className="text-sm font-semibold text-foreground mb-4">Activity</h3>

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 mb-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {entries.length === 0 && !loading ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No activity yet
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[17px] top-0 bottom-0 w-px bg-border" aria-hidden="true" />

          <ul className="space-y-0" role="list" aria-label="Activity feed">
            {entries.map((entry) => (
              <ActivityItem key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-4 py-2',
              'border border-border bg-card text-sm font-medium text-foreground',
              'hover:bg-muted transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {loading && entries.length === 0 && (
        <div className="flex items-center justify-center py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
    </div>
  );
}

// ============================================
// ActivityItem
// ============================================

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {/* Avatar / Icon circle */}
      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card border border-border">
        {entry.userAvatar ? (
          <img
            src={entry.userAvatar}
            alt={entry.userName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="text-[10px] font-semibold text-muted-foreground">
            {getInitials(entry.userName)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">{entry.userName}</span>
          <ActionIcon action={entry.action} />
          <span className="text-sm text-muted-foreground">{getActionDescription(entry)}</span>
          <span className="text-xs text-muted-foreground/70 ml-auto shrink-0">
            {timeAgo(entry.createdAt)}
          </span>
        </div>

        {/* Field change detail */}
        {entry.action === 'updated' && entry.field && entry.oldValue && entry.newValue && (
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="line-through text-red-400 dark:text-red-500">{entry.oldValue}</span>
            <span className="mx-1.5">&rarr;</span>
            <span className="text-green-600 dark:text-green-400">{entry.newValue}</span>
          </div>
        )}

        {/* Comment text */}
        {entry.action === 'commented' && entry.comment && (
          <div className="mt-1.5 rounded-lg border border-border bg-muted/50 px-3 py-2">
            <p className="text-sm text-foreground whitespace-pre-wrap">{entry.comment}</p>
          </div>
        )}
      </div>
    </li>
  );
}

// ============================================
// ActivityFeedInline (Compact)
// ============================================

export function ActivityFeedInline({
  recordType,
  recordId,
  apiBaseUrl,
  entries: entriesProp,
  onViewAll,
  className,
}: ActivityFeedInlineProps) {
  const [entries, setEntries] = useState<ActivityEntry[]>(entriesProp?.slice(0, 5) || []);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(entriesProp?.length || 0);

  useEffect(() => {
    if (entriesProp) {
      setEntries(entriesProp.slice(0, 5));
      setTotal(entriesProp.length);
      return;
    }
    if (!apiBaseUrl || !recordType || !recordId) return;

    const fetchInline = async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(
          `${apiBaseUrl}/api/activity?recordType=${encodeURIComponent(recordType)}&recordId=${encodeURIComponent(recordId)}&limit=5&offset=0`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setEntries(data.entries || []);
          setTotal(data.total || 0);
        }
      } catch {
        // Silently fail for inline variant
      } finally {
        setLoading(false);
      }
    };

    fetchInline();
  }, [entriesProp, apiBaseUrl, recordType, recordId]);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Activity
        </h4>
        {total > 5 && onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            View all ({total})
          </button>
        )}
      </div>

      {loading && entries.length === 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}

      {entries.length === 0 && !loading ? (
        <p className="text-xs text-muted-foreground py-2">No activity yet</p>
      ) : (
        <ul className="space-y-2" role="list" aria-label="Recent activity">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-2">
              <ActionIcon action={entry.action} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">
                  <span className="font-medium">{entry.userName}</span>{' '}
                  <span className="text-muted-foreground">{getActionDescription(entry)}</span>
                </p>
                <p className="text-[10px] text-muted-foreground/70">{timeAgo(entry.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
