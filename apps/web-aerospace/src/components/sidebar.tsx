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
} from 'lucide-react';

// Aerospace Section
const aerospaceNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Configuration Items', href: '/configuration', icon: Settings },
  { name: 'Engineering Changes', href: '/changes', icon: GitPullRequest },
  { name: 'Baselines', href: '/baselines', icon: Database },
  { name: 'Configuration Audits', href: '/audits', icon: Search },
  { name: 'Product Safety', href: '/product-safety', icon: Shield },
];

// Modules Section
const modulesNavigation = [
  { name: 'First Article Inspection', href: '/fai', icon: FileCheck },
  { name: 'Special Processes', href: '/special-processes', icon: Zap },
  { name: 'Counterfeit Parts', href: '/counterfeit', icon: AlertOctagon },
  { name: 'FOD Prevention', href: '/fod', icon: Eye },
  { name: 'MRO Work Orders', href: '/workorders', icon: Wrench },
  { name: 'Human Factors', href: '/human-factors', icon: Users },
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Quality', href: 'http://localhost:3003', icon: Award },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

function NavSection({ title, items, pathname }: { title?: string; items: typeof aerospaceNavigation; pathname: string }) {
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
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
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
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 bg-indigo-50">
        <h1 className="text-xl font-bold text-indigo-900">Aerospace</h1>
        <p className="text-xs text-indigo-600 mt-1">AS9100D Quality Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <NavSection items={aerospaceNavigation} pathname={pathname} />
        <NavSection title="Modules" items={modulesNavigation} pathname={pathname} />

        {/* External Links */}
        <div className="mt-4 pt-4 border-t border-gray-200">
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
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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
