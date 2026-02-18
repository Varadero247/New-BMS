'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Server,
  Shield,
  CheckSquare,
  AlertTriangle,
  AlertOctagon,
  ClipboardCheck,
  Scan,
  Crosshair,
  FileText,
  Eye,
  UserCheck,
  Clock,
  Home,
  Settings,
  Map,
  BarChart3,
} from 'lucide-react';

const ismsNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Scope', href: '/scope', icon: Target },
  { name: 'Assets', href: '/assets', icon: Server },
];

const controlsNavigation = [
  { name: 'Annex A Controls', href: '/controls', icon: Shield },
  { name: 'Controls Dashboard', href: '/controls-dashboard', icon: BarChart3 },
  { name: 'SoA', href: '/controls/soa', icon: CheckSquare },
];

const riskNavigation = [
  { name: 'Risk Register', href: '/risks', icon: AlertTriangle },
  { name: 'Heat Map', href: '/risks/heat-map', icon: AlertTriangle },
];

const incidentsNavigation = [
  { name: 'Security Incidents', href: '/incidents', icon: AlertOctagon },
];

const assessmentsNavigation = [
  { name: 'Audits', href: '/audits', icon: ClipboardCheck },
  { name: 'Vulnerability Scans', href: '/scans', icon: Scan },
  { name: 'Pen Tests', href: '/pen-tests', icon: Crosshair },
];

const privacyNavigation = [
  { name: 'ROPA', href: '/privacy/ropa', icon: FileText },
  { name: 'DPIA', href: '/privacy/dpia', icon: Eye },
  { name: 'DSAR', href: '/privacy/dsar', icon: UserCheck },
  { name: 'Data Map', href: '/data-map', icon: Map },
];

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const quickLinks = [
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home },
  { name: 'Settings', href: `${APP_BASE}:3004`, icon: Settings },
];

function NavSection({
  title,
  items,
  pathname,
}: {
  title?: string;
  items: typeof ismsNavigation;
  pathname: string;
}) {
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
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
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
                <Icon
                  className={`h-5 w-5 ${isExactActive || isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`}
                />
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
      {/* Logo */}
      <div className="p-6 border-b border-border bg-teal-50 dark:bg-teal-900/10">
        <h1 className="text-xl font-bold font-display text-teal-900 dark:text-teal-100">
          Information Security
        </h1>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">ISO 27001 / 27701 ISMS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <NavSection items={ismsNavigation} pathname={pathname} />
        <NavSection title="Controls" items={controlsNavigation} pathname={pathname} />
        <NavSection title="Risk" items={riskNavigation} pathname={pathname} />
        <NavSection title="Incidents" items={incidentsNavigation} pathname={pathname} />
        <NavSection title="Assessments" items={assessmentsNavigation} pathname={pathname} />
        <NavSection title="Privacy (ISO 27701)" items={privacyNavigation} pathname={pathname} />

        {/* Quick Links */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Quick Links
          </p>
          <ul className="space-y-1">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              const isExternal = item.href.startsWith('http');
              const isActive =
                !isExternal && (pathname === item.href || pathname.startsWith(item.href + '/'));

              if (isExternal) {
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </a>
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
