'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  Target,
  Briefcase,
  GraduationCap,
  FileText,
  Home,
  Settings,
  UserPlus,
  Award,
  ClipboardList,
  Network,
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Org Chart', href: '/org-chart', icon: Network },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const timeNavigation = [
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Leave Management', href: '/leave', icon: CalendarDays },
];

const performanceNavigation = [
  { name: 'Performance', href: '/performance', icon: Target },
  { name: 'Goals', href: '/goals', icon: ClipboardList },
];

const recruitmentNavigation = [
  { name: 'Job Postings', href: '/recruitment/jobs', icon: Briefcase },
  { name: 'Applicants', href: '/recruitment/applicants', icon: UserPlus },
];

const developmentNavigation = [
  { name: 'Training', href: '/training', icon: GraduationCap },
  { name: 'Certifications', href: '/certifications', icon: Award },
  { name: 'Documents', href: '/documents', icon: FileText },
];

const complianceNavigation = [
  { name: 'GDPR Requests', href: '/gdpr', icon: ClipboardList },
];

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const externalLinks = [
  { name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home },
  { name: 'Settings', href: `${APP_BASE}:3004`, icon: Settings },
];

function NavSection({
  title,
  items,
  pathname,
}: {
  title?: string;
  items: typeof mainNavigation;
  pathname: string;
}) {
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
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

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
                <Icon
                  className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`}
                />
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
      <div className="p-6 border-b border-border bg-emerald-50 dark:bg-emerald-900/10">
        <h1 className="text-xl font-bold font-display text-emerald-900 dark:text-emerald-100">
          HR Management
        </h1>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">People & Talent</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <NavSection items={mainNavigation} pathname={pathname} />
        <NavSection title="Time & Attendance" items={timeNavigation} pathname={pathname} />
        <NavSection title="Performance" items={performanceNavigation} pathname={pathname} />
        <NavSection title="Recruitment" items={recruitmentNavigation} pathname={pathname} />
        <NavSection title="Development" items={developmentNavigation} pathname={pathname} />
        <NavSection title="Compliance" items={complianceNavigation} pathname={pathname} />

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
