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
  Home,
  Settings,
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Assets', href: '/assets', icon: Server },
  { name: 'Work Orders', href: '/work-orders', icon: Wrench },
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

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

function NavSection({ title, items, pathname }: { title?: string; items: typeof mainNavigation; pathname: string }) {
  return (
    <div className={title ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
      {title && (
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                    ? 'bg-amber-100 text-amber-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isExactActive || isActive ? 'text-amber-600' : 'text-gray-500'}`} />
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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-amber-50">
        <h1 className="text-xl font-bold text-amber-900">CMMS</h1>
        <p className="text-xs text-amber-600 mt-1">Maintenance Management</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <NavSection items={mainNavigation} pathname={pathname} />
        <NavSection title="Maintenance" items={maintenanceNavigation} pathname={pathname} />
        <NavSection title="Resources" items={resourcesNavigation} pathname={pathname} />
        <NavSection title="Analytics" items={analyticsNavigation} pathname={pathname} />

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Links</p>
          <ul className="space-y-1">
            {externalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    <Icon className="h-5 w-5 text-gray-500" />
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
