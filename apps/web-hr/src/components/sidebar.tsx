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
} from 'lucide-react';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Departments', href: '/departments', icon: Building2 },
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
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
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
      <div className="p-6 border-b border-gray-200 bg-emerald-50">
        <h1 className="text-xl font-bold text-emerald-900">HR Management</h1>
        <p className="text-xs text-emerald-600 mt-1">People & Talent</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <NavSection items={mainNavigation} pathname={pathname} />
        <NavSection title="Time & Attendance" items={timeNavigation} pathname={pathname} />
        <NavSection title="Performance" items={performanceNavigation} pathname={pathname} />
        <NavSection title="Recruitment" items={recruitmentNavigation} pathname={pathname} />
        <NavSection title="Development" items={developmentNavigation} pathname={pathname} />

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
