'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Server,
  Wrench,
  CalendarCheck,
  ClipboardCheck,
  CheckSquare,
  Package,
  Building2,
  MapPin,
  BarChart3,
  Clock,
  Gauge,
  MessageSquare,
  CalendarDays,
  HeartPulse,
  Home,
  Settings,
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assets', href: '/assets', icon: Server },
  { name: 'Asset Health', href: '/asset-health', icon: HeartPulse },
  { name: 'Work Orders', href: '/work-orders', icon: Wrench },
  { name: 'Scheduler', href: '/scheduler', icon: CalendarDays },
];

const maintenanceNavigation = [
  { name: 'Preventive Plans', href: '/preventive-plans', icon: CalendarCheck },
  { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
  { name: 'Checklists', href: '/checklists', icon: CheckSquare },
];

const resourcesNavigation = [
  { name: 'Parts Inventory', href: '/parts', icon: Package },
  { name: 'Vendors', href: '/vendors', icon: Building2 },
  { name: 'Locations', href: '/locations', icon: MapPin },
];

const analyticsNavigation = [
  { name: 'KPIs', href: '/kpis', icon: BarChart3 },
  { name: 'Downtime', href: '/downtime', icon: Clock },
  { name: 'Meter Readings', href: '/meters', icon: Gauge },
  { name: 'Requests', href: '/requests', icon: MessageSquare },
];

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const externalLinks = [
  { name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home },
  { name: 'Settings', href: `${APP_BASE}:3004`, icon: Settings },
];

function NavSection({ title, items, pathname }: { title?: string; items: typeof mainNavigation; pathname: string }) {
  return (
    <div className={title ? 'mt-4 pt-4 border-t border-border' : ''}>
      {title && (
        <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          {title}
        </p>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
          const isExactActive = pathname === item.href;

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isExactActive || isActive
                    ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-5 w-5 ${isExactActive || isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border bg-amber-50 dark:bg-amber-900/10">
        <h1 className="text-xl font-bold font-display text-amber-900 dark:text-amber-100">CMMS</h1>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Maintenance Management</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <NavSection items={mainNavigation} pathname={pathname} />
        <NavSection title="Maintenance" items={maintenanceNavigation} pathname={pathname} />
        <NavSection title="Resources" items={resourcesNavigation} pathname={pathname} />
        <NavSection title="Analytics" items={analyticsNavigation} pathname={pathname} />

        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Quick Links</p>
          <ul className="space-y-1">
            {externalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
