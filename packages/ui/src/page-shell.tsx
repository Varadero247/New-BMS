'use client';

import * as React from 'react';
import { cn } from './utils';
import { AppNav, type AppNavProps } from './app-nav';
import { AppSidebar, type SidebarItem } from './app-sidebar';

export interface PageShellProps {
  moduleName: string;
  moduleColor: string;
  sidebarItems: SidebarItem[];
  activeNavId: string;
  user: { name: string; initials: string };
  navTabs?: React.ReactNode;
  notificationSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({
  moduleName,
  moduleColor,
  sidebarItems,
  activeNavId,
  user,
  navTabs,
  notificationSlot,
  children,
  className,
}: PageShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div
      className={cn('flex flex-col h-screen', className)}
      style={{ background: 'var(--ink, #080B12)' }}
    >
      {/* Top nav */}
      <AppNav
        moduleName={moduleName}
        moduleColor={moduleColor}
        user={user}
        notificationSlot={notificationSlot}
      >
        {navTabs}
      </AppNav>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed bottom-4 left-4 z-50 md:hidden flex items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            background: 'var(--surface, #162032)',
            border: '1px solid var(--border, #1E2E48)',
            color: 'var(--silver, #8EA8CC)',
          }}
          aria-label="Toggle navigation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Sidebar - mobile */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <AppSidebar
            items={sidebarItems}
            activeId={activeNavId}
            moduleColor={moduleColor}
          />
        </div>

        {/* Sidebar - desktop */}
        <div className="hidden md:block">
          <AppSidebar
            items={sidebarItems}
            activeId={activeNavId}
            moduleColor={moduleColor}
          />
        </div>

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 overflow-auto p-6"
          style={{ background: 'var(--ink, #080B12)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
