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
  Link as LinkIcon,
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
  { name: 'Integrations', href: '/integrations', icon: LinkIcon },
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
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isExactActive || isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
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
        <h1 className="text-xl font-bold text-indigo-900">Finance & Accounting</h1>
        <p className="text-xs text-indigo-600 mt-1">Financial Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <NavSection items={mainNavigation} pathname={pathname} />
        <NavSection title="Receivables" items={receivablesNavigation} pathname={pathname} />
        <NavSection title="Payables" items={payablesNavigation} pathname={pathname} />
        <NavSection title="Banking & Tax" items={bankingNavigation} pathname={pathname} />
        <NavSection title="Reports" items={reportsNavigation} pathname={pathname} />

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
