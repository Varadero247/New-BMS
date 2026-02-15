'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cloud,
  Target,
  Trash2,
  Droplets,
  Zap,
  Users,
  Shield,
  FileText,
  BookOpen,
  Grid3X3,
  UserCheck,
  ClipboardCheck,
  Home,
  Settings,
  BarChart3,
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Emissions', href: '/emissions', icon: Cloud },
  { name: 'Emissions Dashboard', href: '/emissions-dashboard', icon: BarChart3 },
  { name: 'Targets', href: '/targets', icon: Target },
];

const environmentalNavigation = [
  { name: 'Waste', href: '/waste', icon: Trash2 },
  { name: 'Water', href: '/water', icon: Droplets },
  { name: 'Energy', href: '/energy', icon: Zap },
];

const socialGovernanceNavigation = [
  { name: 'Social Metrics', href: '/social', icon: Users },
  { name: 'Governance', href: '/governance', icon: Shield },
];

const reportingNavigation = [
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Frameworks', href: '/frameworks', icon: BookOpen },
  { name: 'Materiality', href: '/materiality', icon: Grid3X3 },
  { name: 'Stakeholders', href: '/stakeholders', icon: UserCheck },
  { name: 'Audits', href: '/audits', icon: ClipboardCheck },
  { name: 'Initiatives', href: '/initiatives', icon: Target },
  { name: 'Metrics Dashboard', href: '/metrics-dashboard', icon: BarChart3 },
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
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
      <div className="p-6 border-b border-border bg-green-50 dark:bg-green-900/10">
        <h1 className="text-xl font-bold font-display text-green-900 dark:text-green-100">ESG Management</h1>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">Environmental, Social & Governance</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <NavSection items={mainNavigation} pathname={pathname} />
        <NavSection title="Environmental" items={environmentalNavigation} pathname={pathname} />
        <NavSection title="Social & Governance" items={socialGovernanceNavigation} pathname={pathname} />
        <NavSection title="Reporting" items={reportingNavigation} pathname={pathname} />

        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Quick Links
          </p>
          <ul className="space-y-1">
            {externalLinks.map((item) => {
              const Icon = item.icon;
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
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
