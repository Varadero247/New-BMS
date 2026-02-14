'use client';

import { useState } from 'react';
import { cn } from './utils';
import type { PresenceUser, LockResult } from '@ims/presence';

export interface RecordPresenceProps {
  recordType: string;
  recordId: string;
  currentUserId: string;
  viewers: PresenceUser[];
  isLocked: boolean;
  lockedBy: PresenceUser | null;
  onAcquireLock: (force?: boolean) => Promise<LockResult>;
  onReleaseLock: () => Promise<void>;
  className?: string;
}

// Lucide-style inline SVG icons
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-4 w-4', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const bgColors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function getColor(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return bgColors[hash % bgColors.length];
}

const MAX_AVATARS = 3;

export function RecordPresence({
  recordType,
  recordId,
  currentUserId,
  viewers,
  isLocked,
  lockedBy,
  onAcquireLock,
  onReleaseLock,
  className,
}: RecordPresenceProps) {
  const [forceLoading, setForceLoading] = useState(false);

  // Filter out the current user from the viewer list display
  const otherViewers = viewers.filter(v => v.userId !== currentUserId);
  const visibleViewers = otherViewers.slice(0, MAX_AVATARS);
  const overflowCount = otherViewers.length - MAX_AVATARS;

  const handleEditAnyway = async () => {
    setForceLoading(true);
    try {
      await onAcquireLock(true);
    } finally {
      setForceLoading(false);
    }
  };

  if (otherViewers.length === 0 && !isLocked) {
    return null; // Nothing to show
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Avatar stack of viewers */}
      {otherViewers.length > 0 && (
        <div className="flex items-center gap-2">
          <UsersIcon className="text-muted-foreground" />
          <div className="flex -space-x-2">
            {visibleViewers.map((viewer) => (
              <div
                key={viewer.userId}
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white ring-2 ring-white dark:ring-gray-900',
                  viewer.avatar ? '' : getColor(viewer.userName)
                )}
                title={viewer.userName}
              >
                {viewer.avatar ? (
                  <img
                    src={viewer.avatar}
                    alt={viewer.userName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(viewer.userName)
                )}
              </div>
            ))}
            {overflowCount > 0 && (
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900">
                +{overflowCount}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {otherViewers.length === 1
              ? `${otherViewers[0].userName} is viewing`
              : `${otherViewers.length} people viewing`}
          </span>
        </div>
      )}

      {/* Lock warning banner */}
      {isLocked && lockedBy && lockedBy.userId !== currentUserId && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <AlertTriangleIcon className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {lockedBy.userName} is currently editing this record.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Changes may conflict if you edit simultaneously.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleEditAnyway}
                disabled={forceLoading}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium',
                  'bg-amber-600 text-white hover:bg-amber-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
                )}
              >
                <LockIcon className="h-3 w-3" />
                {forceLoading ? 'Acquiring...' : 'Edit Anyway'}
              </button>
              <button
                type="button"
                onClick={() => {
                  // View only - no action needed, just dismiss
                }}
                className={cn(
                  'inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium',
                  'border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
                  'hover:bg-amber-100 dark:hover:bg-amber-900/30',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
                )}
              >
                View Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
