'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
  LayoutDashboard,
  Leaf,
  AlertCircle,
  Scale,
  Target,
  ClipboardList,
  RefreshCw,
  Home,
  Settings,
  ShieldAlert,
  Recycle,
  BarChart3,
  MessageSquare,
  FileText,
  ChevronDown,
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

// ISO 14001:2015 Clause-Grouped Navigation
const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Context (Cl. 4)',
    clause: '4',
    collapsible: true,
    items: [
      { name: 'Aspects & Impacts', href: '/aspects', icon: Leaf },
      { name: 'Aspect Register', href: '/aspect-register', icon: ClipboardList },
    ],
  },
  {
    title: 'Leadership (Cl. 5)',
    clause: '5',
    collapsible: true,
    items: [
      { name: 'Objectives', href: '/objectives', icon: Target },
    ],
  },
  {
    title: 'Planning (Cl. 6)',
    clause: '6',
    collapsible: true,
    items: [
      { name: 'Legal Register', href: '/legal', icon: Scale },
      { name: 'ESG / Sustainability', href: '/esg', icon: BarChart3 },
    ],
  },
  {
    title: 'Support (Cl. 7)',
    clause: '7',
    collapsible: true,
    items: [
      { name: 'Communications', href: '/communications', icon: MessageSquare },
    ],
  },
  {
    title: 'Operations (Cl. 8)',
    clause: '8',
    collapsible: true,
    items: [
      { name: 'Environmental Events', href: '/events', icon: AlertCircle },
      { name: 'Actions', href: '/actions', icon: ClipboardList },
      { name: 'CAPA', href: '/capa', icon: RefreshCw },
      { name: 'Emergency Preparedness', href: '/emergency', icon: ShieldAlert },
      { name: 'Life Cycle Assessment', href: '/lifecycle', icon: Recycle },
    ],
  },
  {
    title: 'Tools',
    collapsible: true,
    items: [
      { name: 'Templates', href: '/templates', icon: FileText },
    ],
  },
];

const externalLinks: NavItem[] = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home, external: true },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings, external: true },
];

function CollapsibleSection({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const hasActive = group.items.some(
    (item) =>
      pathname === item.href ||
      (item.href !== '/' && pathname.startsWith(item.href))
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
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-brand-600 dark:text-gold-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Module header */}
      <div className="p-4 border-b border-border bg-brand-50 dark:bg-brand-900/10">
        <h1 className="text-lg font-bold font-display text-brand-900 dark:text-brand-100">
          Environmental
        </h1>
        <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
          ISO 14001:2015 EMS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto" aria-label="Environment module navigation">
        {navGroups.map((group) => (
          <CollapsibleSection key={group.title} group={group} pathname={pathname} />
        ))}
      </nav>

      {/* External Links */}
      <div className="p-3 border-t border-border">
        <ul className="space-y-0.5">
          {externalLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-400 dark:text-gray-400" />
                  <span>{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
