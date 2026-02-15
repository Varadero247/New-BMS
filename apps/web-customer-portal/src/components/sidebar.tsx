'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertTriangle, Receipt, FileText, ThumbsUp, Ticket, Home, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Complaints', href: '/complaints', icon: AlertTriangle },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'NPS Survey', href: '/nps', icon: ThumbsUp },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Self-Service', href: '/self-service', icon: LayoutDashboard },
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border bg-teal-50 dark:bg-teal-900/10">
        <h1 className="text-xl font-bold font-display text-teal-900 dark:text-teal-100">Customer Portal</h1>
        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">Self-Service Portal</p>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
            return (
              <li key={item.name}>
                <Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Quick Links</p>
          <ul className="space-y-1">
            {externalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}><a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" /><span className="text-sm font-medium">{item.name}</span></a></li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
