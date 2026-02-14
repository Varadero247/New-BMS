'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck,
  ClipboardList,
  BarChart3,
  LineChart,
  AlertTriangle,
  FileText,
  Truck,
  Users,
  Home,
  Settings,
  Award,
  BookOpen,
  Layers,
} from 'lucide-react';

// Automotive Core Navigation
const coreNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'APQP Projects', href: '/apqp', icon: FolderKanban },
  { name: 'PPAP', href: '/ppap', icon: FileCheck },
  { name: 'Control Plans', href: '/control-plans', icon: ClipboardList },
  { name: 'MSA Studies', href: '/msa', icon: BarChart3 },
  { name: 'SPC Charts', href: '/spc', icon: LineChart },
];

// Modules Section
const modulesNavigation = [
  { name: 'FMEA', href: '/fmea', icon: AlertTriangle },
  { name: '8D Reports', href: '/8d', icon: FileText },
  { name: 'Supplier Development', href: '/supplier-dev', icon: Truck },
  { name: 'Customer Specific', href: '/customer-reqs', icon: Users },
  { name: 'CSR Register', href: '/csr', icon: BookOpen },
  { name: 'Layered Process Audits', href: '/lpa', icon: Layers },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Quality', href: 'http://localhost:3003', icon: Award },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

function NavSection({ title, items, pathname }: { title?: string; items: typeof coreNavigation; pathname: string }) {
  return (
    <div className={title ? 'mt-4 pt-4 border-t border-border' : ''}>
      {title && (
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500'}`} />
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
      <div className="p-6 border-b border-border bg-orange-50 dark:bg-orange-900/10">
        <h1 className="text-xl font-bold font-display text-orange-900 dark:text-orange-100">Automotive</h1>
        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">IATF 16949 QMS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <NavSection items={coreNavigation} pathname={pathname} />
        <NavSection title="Modules" items={modulesNavigation} pathname={pathname} />

        {/* External Links */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Quick Links
          </p>
          <ul className="space-y-1">
            {externalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  >
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
