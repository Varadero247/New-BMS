'use client';

import * as React from 'react';
import { cn } from './utils';

export interface TopBarProps {
  /** Current user display name */
  userName?: string;
  /** Current user initials (fallback for avatar) */
  userInitials?: string;
  /** Optional avatar URL */
  avatarUrl?: string;
  /** Organisation / tenant name */
  orgName?: string;
  /** Plan badge (e.g. "Pro", "Enterprise") */
  planBadge?: React.ReactNode;
  /** Slot for search trigger (Cmd+K button) */
  searchSlot?: React.ReactNode;
  /** Slot for notification bell */
  notificationSlot?: React.ReactNode;
  /** Called when user avatar/menu is clicked */
  onUserMenuClick?: () => void;
  className?: string;
}

export function TopBar({
  userName,
  userInitials,
  avatarUrl,
  orgName,
  planBadge,
  searchSlot,
  notificationSlot,
  onUserMenuClick,
  className,
}: TopBarProps) {
  return (
    <header
      className={cn('h-[50px] border-b flex items-center justify-between px-6 shrink-0', className)}
    >
      {/* Left: org name + plan badge */}
      <div className="flex items-center gap-3">
        {orgName && <span className="text-label-md text-foreground">{orgName}</span>}
        {planBadge}
      </div>

      {/* Right: search, notifications, user */}
      <div className="flex items-center gap-3">
        {searchSlot}
        {notificationSlot}
        <button
          onClick={onUserMenuClick}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-full flex items-center justify-center text-label-sm font-semibold text-white bg-brand-gradient">
              {userInitials || '?'}
            </div>
          )}
          {userName && (
            <span className="text-body-sm text-foreground hidden sm:block">{userName}</span>
          )}
        </button>
      </div>
    </header>
  );
}
