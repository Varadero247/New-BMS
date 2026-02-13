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

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  const Tag = item.external ? 'a' : 'a';
  const props = item.external
    ? { href: item.href, target: '_blank' as const, rel: 'noopener noreferrer' }
    : { href: item.href };

  return (
    <li>
      <Tag
        {...props}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-100 text-brand-900'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        )}
      >
        {Icon && <Icon className={cn('h-5 w-5', isActive ? 'text-brand-600' : 'text-gray-500 dark:text-gray-400')} />}
        <span className="flex-1">{item.name}</span>
        {item.badge}
      </Tag>
    </li>
  );
}

function SidebarSection({ section, pathname }: { section: NavSection; pathname: string }) {
  return (
    <div className={section.title ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700' : ''}>
      {section.title && (
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {section.title}
        </p>
      )}
      <ul className="space-y-1">
        {section.items.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return <SidebarLink key={item.name} item={item} isActive={isActive} />;
        })}
      </ul>
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

  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card transition-all duration-200',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
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
        <nav className="flex-1 overflow-y-auto p-3">
          {!collapsed && navSections.map((section, i) => (
            <SidebarSection key={section.title || i} section={section} pathname={pathname} />
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

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 border-t border-border text-gray-400 hover:text-foreground transition-colors text-sm"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '\u00BB' : '\u00AB'}
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {topBar}
        <main className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
