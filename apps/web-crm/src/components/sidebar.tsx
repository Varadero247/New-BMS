'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Building2,
  
  FileText,
  UserPlus,
  Briefcase,
  Award,
  Megaphone,
  Mail,
  BarChart3,
  TrendingUp,
  Home,
  Settings,
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/pipeline', icon: Kanban },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Accounts', href: '/accounts', icon: Building2 },
];

const salesNavigation = [
  { name: 'Deals', href: '/deals', icon: Briefcase },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Leads', href: '/leads', icon: UserPlus },
];

const marketingNavigation = [
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Email Sequences', href: '/sequences', icon: Mail },
];

const partnersNavigation = [
  { name: 'Partner Portal', href: '/partners', icon: Briefcase },
  { name: 'Leaderboard', href: '/partners/leaderboard', icon: Award },
];

const reportsNavigation = [
  { name: 'Sales Dashboard', href: '/reports', icon: BarChart3 },
  { name: 'Forecast', href: '/forecast', icon: TrendingUp },
];

const quickLinks = [
  { name: 'Templates', href: '/templates', icon: FileText },
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
      {/* Logo */}
      <div className="p-6 border-b border-border bg-violet-50 dark:bg-violet-900/10">
        <h1 className="text-xl font-bold font-display text-violet-900 dark:text-violet-100">CRM</h1>
        <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">Customer Relationship Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <NavSection items={mainNavigation} pathname={pathname} />
        <NavSection title="Sales" items={salesNavigation} pathname={pathname} />
        <NavSection title="Marketing" items={marketingNavigation} pathname={pathname} />
        <NavSection title="Partners" items={partnersNavigation} pathname={pathname} />
        <NavSection title="Reports" items={reportsNavigation} pathname={pathname} />
        <NavSection title="Quick Links" items={quickLinks} pathname={pathname} />

        {/* External Links */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            External
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
