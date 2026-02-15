'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Receipt,
  Users,
  CreditCard,
  Building2,
  ShoppingCart,
  Landmark,
  Calculator,
  BarChart3,
  PiggyBank,
  Link2,
  Home,
  Settings,
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Chart of Accounts', href: '/accounts', icon: BookOpen },
  { name: 'Journal', href: '/journal', icon: FileText },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const receivablesNavigation = [
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Customers', href: '/customers', icon: Users },
];

const payablesNavigation = [
  { name: 'Bills', href: '/payables', icon: CreditCard },
  { name: 'Suppliers', href: '/suppliers', icon: Building2 },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
];

const bankingNavigation = [
  { name: 'Banking', href: '/banking', icon: Landmark },
  { name: 'Tax', href: '/tax', icon: Calculator },
];

const reportsNavigation = [
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Budgets', href: '/budgets', icon: PiggyBank },
  { name: 'Budget Dashboard', href: '/budget-dashboard', icon: BarChart3 },
  { name: 'Integrations', href: '/integrations', icon: Link2 },
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
      <div className="p-6 border-b border-border bg-indigo-50 dark:bg-indigo-900/10">
        <h1 className="text-xl font-bold font-display text-indigo-900 dark:text-indigo-100">Finance & Accounting</h1>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Financial Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <NavSection items={mainNavigation} pathname={pathname} />
        <NavSection title="Receivables" items={receivablesNavigation} pathname={pathname} />
        <NavSection title="Payables" items={payablesNavigation} pathname={pathname} />
        <NavSection title="Banking & Tax" items={bankingNavigation} pathname={pathname} />
        <NavSection title="Reports" items={reportsNavigation} pathname={pathname} />

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
