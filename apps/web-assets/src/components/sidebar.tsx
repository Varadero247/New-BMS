'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  LayoutDashboard,
  Package,
  Wrench,
  Gauge,
  ClipboardCheck,
  MapPin,
  TrendingDown,
  Home,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface NavGroup {
  title: string;
  clause?: string;
  items: NavItem[];
  collapsible?: boolean;
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Asset Registry',
    clause: '7',
    collapsible: true,
    items: [
      { name: 'Assets', href: '/assets', icon: Package },
      { name: 'Locations', href: '/locations', icon: MapPin },
      { name: 'Depreciation', href: '/depreciation', icon: TrendingDown },
    ],
  },
  {
    title: 'Maintenance',
    clause: '8',
    collapsible: true,
    items: [
      { name: 'Work Orders', href: '/work-orders', icon: Wrench },
      { name: 'Calibrations', href: '/calibrations', icon: Gauge },
      { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
    ],
  },
];

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const externalLinks: NavItem[] = [
  { name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home, external: true },
  { name: 'Settings', href: `${APP_BASE}:3004`, icon: Settings, external: true },
];

function CollapsibleSection({ group, pathname }: { group: NavGroup; pathname: string }) {
  const hasActive = group.items.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
  );
  const [open, setOpen] = React.useState(hasActive || !group.collapsible);

  return (
    <div className={group.clause ? 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700' : ''}>
      {group.collapsible ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-3 mb-1 cursor-pointer group"
        >
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {group.title}
          </span>
          <ChevronDown className={`h-3 w-3 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        group.title !== 'Overview' && (
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            {group.title}
          </p>
        )
      )}
      {open && (
        <ul className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full min-h-screen">
      <div className="p-4 border-b border-border bg-cyan-50 dark:bg-cyan-900/10">
        <h1 className="text-lg font-bold font-display text-cyan-900 dark:text-cyan-100">Asset Management</h1>
        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">ISO 55001 Asset Lifecycle</p>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto" aria-label="Asset module navigation">
        {navGroups.map((group) => (
          <CollapsibleSection key={group.title} group={group} pathname={pathname} />
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <ul className="space-y-0.5">
          {externalLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <a href={item.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Icon className="h-4 w-4 text-gray-400 dark:text-gray-400" />
                  <span>{item.name}</span>
                </a>
              </li>
            );
          })}
          <li>
            <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 w-full transition-colors">
              <LogOut className="h-4 w-4 text-gray-400" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
