'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Workflow,
  AlertOctagon,
  Scale,
  Target,
  ClipboardList,
  BarChart3,
  Home,
  Settings,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  FileSpreadsheet,
  Lightbulb,
  Truck,
  GitBranch,
  ShieldAlert,
  Shield,
  Layers,
  CheckCircle,
  Columns,
  Users,
  BookOpen,
  Search,
  GraduationCap,
  Wrench,
  LineChart,
  Star,
  ChevronDown,
  Compass,
  LayoutGrid,
} from 'lucide-react';
import React from 'react';

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

// ISO 9001:2015 Clause-Grouped Navigation
const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Compliance Dashboard', href: '/compliance-dashboard', icon: CheckCircle },
    ],
  },
  {
    title: 'Context (Cl. 4)',
    clause: '4',
    collapsible: true,
    items: [
      { name: 'Context (SWOT/PESTLE)', href: '/context', icon: Compass },
      { name: 'Interested Parties', href: '/interested-parties', icon: Users },
      { name: 'QMS Scope', href: '/scope', icon: FileText },
      { name: 'Processes', href: '/processes', icon: Workflow },
      { name: 'Process Map', href: '/process-map', icon: LayoutGrid },
    ],
  },
  {
    title: 'Leadership (Cl. 5)',
    clause: '5',
    collapsible: true,
    items: [
      { name: 'Quality Policy', href: '/policy', icon: Shield },
      { name: 'Objectives', href: '/objectives', icon: Target },
      { name: 'RACI Matrix', href: '/raci', icon: BarChart3 },
    ],
  },
  {
    title: 'Planning (Cl. 6)',
    clause: '6',
    collapsible: true,
    items: [
      { name: 'Risks & Opportunities', href: '/risks', icon: AlertTriangle },
      { name: 'Risk Register', href: '/risk-register', icon: ShieldAlert },
    ],
  },
  {
    title: 'Support (Cl. 7)',
    clause: '7',
    collapsible: true,
    items: [
      { name: 'Documents', href: '/documents', icon: FileText },
      { name: 'Document Register', href: '/document-register', icon: FileSpreadsheet },
      { name: 'Competences', href: '/competences', icon: GraduationCap },
      { name: 'Calibrations', href: '/calibrations', icon: Wrench },
      { name: 'Training', href: '/training', icon: BookOpen },
    ],
  },
  {
    title: 'Operations (Cl. 8)',
    clause: '8',
    collapsible: true,
    items: [
      { name: 'Non-Conformance', href: '/nonconformances', icon: AlertOctagon },
      { name: 'Actions', href: '/actions', icon: ClipboardList },
      { name: 'CAPA', href: '/capa', icon: ClipboardCheck },
      { name: 'CAPA Board', href: '/capa/board', icon: Columns },
      { name: 'Design & Development', href: '/design-development', icon: Layers },
      { name: 'FMEA', href: '/fmea', icon: FileSpreadsheet },
      { name: 'Supplier Quality', href: '/suppliers', icon: Truck },
      { name: 'Releases', href: '/releases', icon: CheckCircle },
      { name: 'Change Management', href: '/changes', icon: GitBranch },
      { name: 'Counterfeit Prevention', href: '/counterfeit', icon: ShieldAlert },
      { name: 'Product Safety', href: '/product-safety', icon: Shield },
    ],
  },
  {
    title: 'Performance (Cl. 9)',
    clause: '9',
    collapsible: true,
    items: [
      { name: 'Metrics', href: '/metrics', icon: LineChart },
      { name: 'Customer Satisfaction', href: '/customer-satisfaction', icon: Star },
      { name: 'Audits', href: '/audits', icon: Search },
      { name: 'Management Reviews', href: '/management-reviews', icon: ClipboardList },
      { name: 'Investigations', href: '/investigations', icon: Search },
    ],
  },
  {
    title: 'Improvement (Cl. 10)',
    clause: '10',
    collapsible: true,
    items: [
      { name: 'Continual Improvement', href: '/improvements', icon: Lightbulb },
      { name: 'Legal Register', href: '/legal', icon: Scale },
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

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const externalLinks: NavItem[] = [
  { name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home, external: true },
  { name: 'Settings', href: `${APP_BASE}:3004`, icon: Settings, external: true },
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
          Quality
        </h1>
        <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
          ISO 9001:2015 QMS
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto" aria-label="Quality module navigation">
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
