'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Grid3X3,
  CalendarClock,
  FileCheck2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  LogOut,
  Settings,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    defaultOpen: true,
    items: [
      { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Compliance',
    defaultOpen: true,
    items: [
      { label: 'Controls', href: '/controls', icon: <ShieldCheck className="h-5 w-5" /> },
      { label: 'SoD Matrix', href: '/sod-matrix', icon: <Grid3X3 className="h-5 w-5" /> },
    ],
  },
  {
    label: 'Tax',
    defaultOpen: true,
    items: [
      { label: 'HMRC Calendar', href: '/hmrc-calendar', icon: <CalendarClock className="h-5 w-5" /> },
      { label: 'IR35', href: '/ir35', icon: <FileCheck2 className="h-5 w-5" /> },
    ],
  },
];

function NavGroupSection({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(group.defaultOpen ?? false);

  const hasActive = group.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors ${
          hasActive
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
      >
        {group.label}
        {open ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200 font-medium'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border bg-emerald-50 dark:bg-emerald-900/10">
        <h1 className="text-lg font-bold font-display text-emerald-900 dark:text-emerald-100">
          Financial Compliance
        </h1>
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Regulatory & Tax Compliance
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navGroups.map((group) => (
          <NavGroupSection key={group.label} group={group} />
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
          IMS Dashboard
        </a>
        <a
          href="http://localhost:3004"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </a>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
