'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Shield,
  Leaf,
  Award,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const modules = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Health & Safety',
    href: 'http://localhost:3001',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    external: true,
  },
  {
    name: 'Environmental',
    href: 'http://localhost:3002',
    icon: Leaf,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    external: true,
  },
  {
    name: 'Quality',
    href: 'http://localhost:3003',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    external: true,
  },
  {
    name: 'Settings',
    href: 'http://localhost:3004',
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    external: true,
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">IMS</h1>
        <p className="text-xs text-gray-500 mt-1">Integrated Management System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {modules.map((item) => {
            const Icon = item.icon;
            const Component = item.external ? 'a' : Link;

            return (
              <li key={item.name}>
                <Component
                  href={item.href}
                  {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {item.name}
                  </span>
                  {item.external && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </Component>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
