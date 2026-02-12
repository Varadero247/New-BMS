'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ArrowRightLeft,
  History,
  Warehouse,
  BarChart3,
  FileText,
  Home,
  Settings,
  Tags,
  Truck,
  AlertTriangle,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Stock Levels', href: '/stock-levels', icon: Layers },
  { name: 'Stock Adjustments', href: '/adjustments', icon: ArrowRightLeft },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 bg-sky-50">
        <h1 className="text-xl font-bold text-sky-900">Inventory Control</h1>
        <p className="text-xs text-sky-600 mt-1">Stock Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sky-100 text-sky-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-sky-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Quick Actions
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/products?lowStock=true"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-orange-700 hover:bg-orange-50 transition-colors"
              >
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">Low Stock Alerts</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* External Links */}
        <div className="mt-6 pt-6 border-t border-gray-200">
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
