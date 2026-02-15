'use client';

import * as React from 'react';
import { cn } from './utils';
import { NexaraLogo } from './nexara-logo';

export interface AppNavProps {
  moduleName: string;
  moduleColor: string;
  user: { name: string; initials: string };
  children?: React.ReactNode;
  notificationSlot?: React.ReactNode;
  className?: string;
}

export function AppNav({
  moduleName,
  moduleColor,
  user,
  children,
  notificationSlot,
  className,
}: AppNavProps) {
  return (
    <header
      className={cn(
        'h-[50px] flex items-center justify-between px-4 shrink-0',
        className
      )}
      style={{
        background: 'var(--surface, #162032)',
        borderBottom: '1px solid var(--border, #1E2E48)',
      }}
    >
      {/* Left: logo + module name */}
      <div className="flex items-center gap-3">
        <NexaraLogo size="sm" />
        <span
          className="text-[0.78rem] font-medium font-body"
          style={{ color: moduleColor, fontFamily: "'DM Sans', sans-serif" }}
        >
          {moduleName}
        </span>
      </div>

      {/* Centre: nav tabs (passed as children) */}
      <nav className="hidden md:flex items-center gap-1">
        {children}
      </nav>

      {/* Right: notification + avatar */}
      <div className="flex items-center gap-3">
        {notificationSlot}
        <div
          className="flex items-center justify-center rounded-full font-display font-bold text-[0.65rem] text-white select-none"
          style={{
            width: 28,
            height: 28,
            background: 'var(--g-brand)',
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
          }}
          title={user.name}
        >
          {user.initials}
        </div>
      </div>
    </header>
  );
}

export interface NavTabProps {
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

export function NavTab({ label, active, href, onClick }: NavTabProps) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={cn(
        'px-3 py-2 text-[0.78rem] font-body transition-colors relative',
        active
          ? 'font-medium'
          : 'hover:opacity-80'
      )}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: active ? 'var(--blue-hi, #5B94FF)' : 'var(--steel, #5A7099)',
        borderBottom: active ? '2px solid var(--blue-hi, #5B94FF)' : '2px solid transparent',
      }}
    >
      {label}
    </Tag>
  );
}
