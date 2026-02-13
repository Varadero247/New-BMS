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
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-teal-50">
        <h1 className="text-xl font-bold text-teal-900">Customer Portal</h1>
        <p className="text-xs text-teal-600 mt-1">Self-Service Portal</p>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
            return (
              <li key={item.name}>
                <Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-teal-100 text-teal-900' : 'text-gray-700 hover:bg-gray-100'}`}>
                  <Icon className={`h-5 w-5 ${isActive ? 'text-teal-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Links</p>
          <ul className="space-y-1">
            {externalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}><a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"><Icon className="h-5 w-5 text-gray-500" /><span className="text-sm font-medium">{item.name}</span></a></li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
