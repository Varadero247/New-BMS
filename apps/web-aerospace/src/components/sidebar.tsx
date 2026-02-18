'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  GitPullRequest,
  Database,
  Search,
  Shield,
  FileCheck,
  Zap,
  AlertOctagon,
  Eye,
  Home,
  Award,
  Wrench,
  Users,
  FileText,
} from 'lucide-react';

// Aerospace Section
const aerospaceNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Configuration Items', href: '/configuration', icon: Settings },
  { name: 'Engineering Changes', href: '/changes', icon: GitPullRequest },
  { name: 'Baselines', href: '/baselines', icon: Database },
  { name: 'Configuration Audits', href: '/audits', icon: Search },
  { name: 'Product Safety', href: '/product-safety', icon: Shield },
  { name: 'Compliance Tracker', href: '/compliance-tracker', icon: FileCheck },
];

// Modules Section
const modulesNavigation = [
  { name: 'First Article Inspection', href: '/fai', icon: FileCheck },
  { name: 'Special Processes', href: '/special-processes', icon: Zap },
  { name: 'Counterfeit Parts', href: '/counterfeit', icon: AlertOctagon },
  { name: 'FOD Prevention', href: '/fod', icon: Eye },
  { name: 'MRO Work Orders', href: '/workorders', icon: Wrench },
  { name: 'Human Factors', href: '/human-factors', icon: Users },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const externalLinks = [
  { name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home },
  { name: 'Quality', href: `${APP_BASE}:3003`, icon: Award },
  { name: 'Settings', href: `${APP_BASE}:3004`, icon: Settings },
];

function NavSection({ title, items, pathname }: { title?: string; items: typeof aerospaceNavigation; pathname: string }) {
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
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

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
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`} />
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
      <div className="p-6 border-b border-border bg-indigo-50 dark:bg-indigo-900/10">
        <h1 className="text-xl font-bold font-display text-indigo-900 dark:text-indigo-100">Aerospace</h1>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">AS9100D Quality Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <NavSection items={aerospaceNavigation} pathname={pathname} />
        <NavSection title="Modules" items={modulesNavigation} pathname={pathname} />

        {/* External Links */}
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
