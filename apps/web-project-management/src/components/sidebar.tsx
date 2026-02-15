'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Flag,
  AlertTriangle,
  AlertCircle,
  GitPullRequest,
  Users,
  UserCheck,
  Zap,
  Clock,
  BarChart3,
  TrendingUp,
  FileText,
  Home,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks / WBS', href: '/tasks', icon: ListChecks },
  { name: 'Milestones', href: '/milestones', icon: Flag },
  { name: 'Risks', href: '/risks', icon: AlertTriangle },
  { name: 'Issues', href: '/issues', icon: AlertCircle },
  { name: 'Changes', href: '/changes', icon: GitPullRequest },
  { name: 'Resources', href: '/resources', icon: Users },
  { name: 'Stakeholders', href: '/stakeholders', icon: UserCheck },
  { name: 'Sprints', href: '/sprints', icon: Zap },
  { name: 'Timesheets', href: '/timesheets', icon: Clock },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Benefits', href: '/benefits', icon: TrendingUp },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border bg-blue-50 dark:bg-blue-900/10">
        <h1 className="text-xl font-bold font-display text-blue-900 dark:text-blue-100">Project Management</h1>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">PMBOK / ISO 21500</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
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
                      ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* External Links */}
        <div className="mt-6 pt-6 border-t border-border">
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
