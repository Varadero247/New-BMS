'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  FileCode,
  FileText,
  Play,
  CheckSquare,
  Users,
  Zap,
  Workflow,
  BarChart3,
  Settings,
  BookOpen,
  Webhook,
  ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },

  // Design
  { name: 'Builder', href: '/builder', icon: Workflow },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'Definitions', href: '/definitions', icon: FileCode },

  // Execution
  { name: 'Instances', href: '/instances', icon: Play },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },

  // Management
  { name: 'Approvals', href: '/approvals', icon: Users },
  { name: 'Automation', href: '/automation', icon: Zap },
  { name: 'Automation Rules', href: '/automations', icon: Zap },
  { name: 'Rules Library', href: '/rules', icon: BookOpen },

  // Analytics
  { name: 'Reports', href: '/reports', icon: BarChart3 },

  // System
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'Admin', href: '/admin', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 dark:bg-gray-950">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link href="/" className="flex items-center space-x-2">
          <GitBranch className="h-8 w-8 text-brand-500" />
          <span className="text-xl font-bold font-display text-white">Workflows</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4" aria-label="Module navigation">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-gray-300 dark:text-gray-600 hover:bg-gray-800 hover:text-white'
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
        <div className="text-xs text-gray-500 dark:text-gray-400">IMS Workflows Module v0.1.0</div>
      </div>
    </div>
  );
}
