'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FileSearch,
  AlertTriangle,
  BookOpen,
  Users,
  CalendarCheck,
  Wrench,
  Home,
  Settings,
  ChevronDown,
  LogOut,
  Siren,
  Flame,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface NavGroup {
  title: string;
  clause?: string;
  items: NavItem[];
  collapsible?: boolean;
}

const ACCENT = '#F04B5A';

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Premises & Assessment',
    clause: '1',
    collapsible: true,
    items: [
      { name: 'Premises', href: '/premises', icon: Building2 },
      { name: 'Fire Risk Assessments', href: '/fra', icon: FileSearch },
    ],
  },
  {
    title: 'Emergency Response',
    clause: '2',
    collapsible: true,
    items: [
      { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
      { name: 'Business Continuity', href: '/bcp', icon: BookOpen },
    ],
  },
  {
    title: 'People & Safety',
    clause: '3',
    collapsible: true,
    items: [
      { name: 'PEEPs', href: '/peep', icon: Users },
      { name: 'Drills', href: '/drills', icon: CalendarCheck },
      { name: 'Equipment', href: '/equipment', icon: Wrench },
    ],
  },
];

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const externalLinks: NavItem[] = [
  { name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home, external: true },
  { name: 'Settings', href: `${APP_BASE}:3004`, icon: Settings, external: true },
];

function CollapsibleSection({ group, pathname }: { group: NavGroup; pathname: string }) {
  const hasActive = group.items.some(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)),
  );
  const [open, setOpen] = React.useState(hasActive || !group.collapsible);

  return (
    <div className={group.clause ? 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700' : ''}>
      {group.collapsible ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-3 mb-1 cursor-pointer group"
        >
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {group.title}
          </span>
          <ChevronDown
            className={`h-3 w-3 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      ) : (
        group.title !== 'Overview' && (
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            {group.title}
          </p>
        )
      )}
      {open && (
        <ul className="space-y-0.5">
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  style={isActive ? { backgroundColor: ACCENT } : undefined}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleDeclareEmergency() {
    router.push('/incidents/declare');
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full min-h-screen">
      <div className="p-4 border-b border-border" style={{ backgroundColor: '#FEE2E4' }}>
        <div className="flex items-center gap-2 mb-1">
          <Flame className="h-5 w-5" style={{ color: ACCENT }} />
          <h1 className="text-lg font-bold font-display" style={{ color: '#B91C2A' }}>
            Emergency
          </h1>
        </div>
        <p className="text-xs mt-0.5" style={{ color: ACCENT }}>
          Fire, Emergency &amp; Disaster Management
        </p>
      </div>

      <div className="p-3 border-b border-border">
        <button
          onClick={handleDeclareEmergency}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
          style={{ backgroundColor: ACCENT }}
        >
          <Siren className="h-4 w-4" />
          Declare Emergency
        </button>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto" aria-label="Emergency module navigation">
        {navGroups.map((group) => (
          <CollapsibleSection key={group.title} group={group} pathname={pathname} />
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <ul className="space-y-0.5">
          {externalLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-400 dark:text-gray-400" />
                  <span>{item.name}</span>
                </a>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 w-full transition-colors"
            >
              <LogOut className="h-4 w-4 text-gray-400" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
