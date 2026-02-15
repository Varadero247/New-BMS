'use client';

import * as React from 'react';
import { cn } from './utils';

/* ────────────────────────────────────────────────────────── */
/*  Types                                                     */
/* ────────────────────────────────────────────────────────── */

export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  external?: boolean;
  badge?: React.ReactNode;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
  collapsible?: boolean;
}

export interface AppShellProps {
  /** Module display name shown in sidebar header */
  moduleName: string;
  /** Short descriptor, e.g. "ISO 45001:2018" */
  moduleDescription?: string;
  /** Accent colour class applied to sidebar header, e.g. "bg-red-50" */
  moduleAccent?: string;
  /** Accent text colour class, e.g. "text-red-900" */
  moduleAccentText?: string;
  /** Sub-text colour class, e.g. "text-red-600" */
  moduleSubText?: string;
  /** Nav sections for the sidebar */
  navSections: NavSection[];
  /** Footer links (e.g. Settings, IMS Dashboard) */
  footerLinks?: NavItem[];
  /** Current pathname (from usePathname) */
  pathname: string;
  /** TopBar component */
  topBar?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  className?: string;
}

/* ────────────────────────────────────────────────────────── */
/*  Sub-components                                            */
/* ────────────────────────────────────────────────────────── */

function SidebarLink({ item, isActive, collapsed }: { item: NavItem; isActive: boolean; collapsed?: boolean }) {
  const Icon = item.icon;
  const props = item.external
    ? { href: item.href, target: '_blank' as const, rel: 'noopener noreferrer' }
    : { href: item.href };

  return (
    <li>
      <a
        {...props}
        aria-current={isActive ? 'page' : undefined}
        title={collapsed ? item.name : undefined}
        className={cn(
          'flex items-center gap-3 rounded-lg text-sm font-medium transition-colors',
          collapsed ? 'justify-center p-2' : 'px-3 py-2',
          isActive
            ? 'bg-nexara-raised text-nexara-blue-hi'
            : 'text-nexara-steel hover:bg-nexara-raised'
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              'h-5 w-5 shrink-0',
              isActive ? 'text-nexara-blue-hi' : 'text-nexara-muted'
            )}
          />
        )}
        {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
        {!collapsed && item.badge}
      </a>
    </li>
  );
}

function SidebarSection({
  section,
  pathname,
  collapsed,
}: {
  section: NavSection;
  pathname: string;
  collapsed?: boolean;
}) {
  const [open, setOpen] = React.useState(true);

  if (collapsed) {
    return (
      <div className="space-y-1">
        {section.items.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return <SidebarLink key={item.name} item={item} isActive={isActive} collapsed />;
        })}
      </div>
    );
  }

  return (
    <div className={section.title ? 'mt-4 pt-4 border-t border-nexara-border' : ''}>
      {section.title && (
        <button
          type="button"
          onClick={() => section.collapsible && setOpen(!open)}
          className={cn(
            'flex w-full items-center justify-between px-3 mb-2',
            section.collapsible && 'cursor-pointer hover:text-gray-600 dark:hover:text-gray-300'
          )}
        >
          <span className="text-xs font-semibold text-nexara-muted uppercase tracking-wider font-mono">
            {section.title}
          </span>
          {section.collapsible && (
            <svg
              className={cn('h-3 w-3 text-gray-400 transition-transform', open && 'rotate-180')}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      )}
      {open && (
        <ul className="space-y-1">
          {section.items.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return <SidebarLink key={item.name} item={item} isActive={isActive} />;
          })}
        </ul>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  AppShell                                                  */
/* ────────────────────────────────────────────────────────── */

export function AppShell({
  moduleName,
  moduleDescription,
  moduleAccent = 'bg-brand-50',
  moduleAccentText = 'text-brand-900',
  moduleSubText = 'text-brand-600',
  navSections,
  footerLinks,
  pathname,
  topBar,
  children,
  className,
}: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape
  React.useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Module header */}
      <div className={cn('p-4 border-b border-border', moduleAccent)}>
        {collapsed ? (
          <div className={cn('text-lg font-bold text-center', moduleAccentText)}>
            {moduleName.charAt(0)}
          </div>
        ) : (
          <>
            <h1 className={cn('text-lg font-bold font-display', moduleAccentText)}>{moduleName}</h1>
            {moduleDescription && (
              <p className={cn('text-xs mt-0.5', moduleSubText)}>{moduleDescription}</p>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Module navigation">
        {navSections.map((section, i) => (
          <SidebarSection key={section.title || i} section={section} pathname={pathname} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer links */}
      {!collapsed && footerLinks && footerLinks.length > 0 && (
        <div className="p-3 border-t border-border">
          <ul className="space-y-1">
            {footerLinks.map((item) => (
              <SidebarLink key={item.name} item={item} isActive={false} />
            ))}
          </ul>
        </div>
      )}

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:block p-3 border-t border-border text-gray-400 hover:text-foreground transition-colors text-sm"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '\u00BB' : '\u00AB'}
      </button>
    </>
  );

  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Skip nav */}
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - mobile overlay */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border w-64 transition-transform duration-250 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-card transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile hamburger + topbar */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-3 text-gray-500 hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex-1">{topBar}</div>
        </div>
        <main id="main-content" className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
