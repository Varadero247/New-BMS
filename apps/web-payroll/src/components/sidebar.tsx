'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  DollarSign,
  Heart,
  Receipt,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Calculator,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },

  // Payroll Processing
  { name: 'Payroll Runs', href: '/payroll', icon: Wallet },
  { name: 'Payslips', href: '/payslips', icon: FileText },

  // Compensation
  { name: 'Salary Structure', href: '/salary', icon: DollarSign },
  { name: 'Benefits', href: '/benefits', icon: Heart },

  // Financial
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Loans', href: '/loans', icon: CreditCard },

  // Compliance
  { name: 'Tax Compliance', href: '/tax', icon: Calculator },

  // Reports
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link href="/" className="flex items-center space-x-2">
          <Wallet className="h-8 w-8 text-green-500" />
          <span className="text-xl font-bold text-white">Payroll</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="text-xs text-gray-500">
          IMS Payroll Module v0.1.0
        </div>
      </div>
    </div>
  );
}
