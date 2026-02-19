'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Shield,
  Leaf,
  Award,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Users,
  DollarSign,
  FileText,
  Briefcase,
  GitBranch,
  FolderKanban,
  Car,
  Stethoscope,
  Plane,
  PiggyBank,
  UserCircle,
  ShieldCheck,
  TreePine,
  Wrench,
  Building2,
  Truck,
  BarChart3,
  UtensilsCrossed,
  Zap,
  Brain,
  Scale,
  AlertTriangle,
  GraduationCap,
  HardHat,
  FileSearch,
  MessageSquare,
  ScrollText,
  ClipboardCheck,
  Eye,
  Siren,
  BookCheck,
  Activity,
  ClipboardList,
  FlaskConical,
  Flame,
  Handshake,
  Store,
  HelpCircle } from 'lucide-react';
import { LocaleSwitcher } from '@ims/i18n';

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';
function moduleUrl(port: number): string {
  return `${APP_BASE}:${port}`;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  external?: boolean;
  onClick?: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const internalLinks: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100' },
  {
    name: 'Executive Summary',
    href: '/executive-summary',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100' },
  {
    name: 'Templates',
    href: '/templates',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100' },
  {
    name: 'Compliance Calendar',
    href: '/compliance-calendar',
    icon: CalendarCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100' },
  {
    name: 'Audit Trail',
    href: '/audit-trail',
    icon: ClipboardList,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100' },
  {
    name: 'System Status',
    href: '/system-status',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-100' },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: Store,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100' },
];

const sections: NavSection[] = [
  {
    title: 'ISO Compliance',
    items: [
      {
        name: 'Health & Safety',
        href: moduleUrl(3001),
        icon: Shield,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        external: true },
      {
        name: 'Environmental',
        href: moduleUrl(3002),
        icon: Leaf,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        external: true },
      {
        name: 'Quality',
        href: moduleUrl(3003),
        icon: Award,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        external: true },
      {
        name: 'ESG',
        href: moduleUrl(3016),
        icon: TreePine,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
        external: true },
      {
        name: 'Food Safety',
        href: moduleUrl(3020),
        icon: UtensilsCrossed,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        external: true },
      {
        name: 'Energy',
        href: moduleUrl(3021),
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        external: true },
      {
        name: 'ISO 42001 (AI)',
        href: moduleUrl(3024),
        icon: Brain,
        color: 'text-fuchsia-600',
        bgColor: 'bg-fuchsia-100',
        external: true },
      {
        name: 'ISO 37001 (Anti-Bribery)',
        href: moduleUrl(3025),
        icon: Scale,
        color: 'text-rose-600',
        bgColor: 'bg-rose-100',
        external: true },
      {
        name: 'InfoSec',
        href: moduleUrl(3015),
        icon: ShieldCheck,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        external: true },
      {
        name: 'Aerospace',
        href: moduleUrl(3012),
        icon: Plane,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100',
        external: true },
      {
        name: 'Chemicals',
        href: moduleUrl(3044),
        icon: FlaskConical,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        external: true },
    ] },
  {
    title: 'Operations',
    items: [
      {
        name: 'Inventory',
        href: moduleUrl(3005),
        icon: Package,
        color: 'text-sky-600',
        bgColor: 'bg-sky-100',
        external: true },
      {
        name: 'HR',
        href: moduleUrl(3006),
        icon: Users,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        external: true },
      {
        name: 'Payroll',
        href: moduleUrl(3007),
        icon: DollarSign,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        external: true },
      {
        name: 'Workflows',
        href: moduleUrl(3008),
        icon: GitBranch,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        external: true },
      {
        name: 'Project Management',
        href: moduleUrl(3009),
        icon: FolderKanban,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        external: true },
      {
        name: 'Finance',
        href: moduleUrl(3013),
        icon: PiggyBank,
        color: 'text-lime-600',
        bgColor: 'bg-lime-100',
        external: true },
      {
        name: 'CRM',
        href: moduleUrl(3014),
        icon: UserCircle,
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        external: true },
      {
        name: 'CMMS',
        href: moduleUrl(3017),
        icon: Wrench,
        color: 'text-stone-600',
        bgColor: 'bg-stone-100',
        external: true },
      {
        name: 'Field Service',
        href: moduleUrl(3023),
        icon: Truck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        external: true },
      {
        name: 'Analytics',
        href: moduleUrl(3022),
        icon: BarChart3,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        external: true },
    ] },
  {
    title: 'Portals & Specialist',
    items: [
      {
        name: 'Customer Portal',
        href: moduleUrl(3018),
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        external: true },
      {
        name: 'Supplier Portal',
        href: moduleUrl(3019),
        icon: Briefcase,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        external: true },
      {
        name: 'Medical Devices',
        href: moduleUrl(3011),
        icon: Stethoscope,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        external: true },
      {
        name: 'Automotive',
        href: moduleUrl(3010),
        icon: Car,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        external: true },
      {
        name: 'Partners Portal',
        href: moduleUrl(3026),
        icon: Handshake,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
        external: true },
    ] },
  {
    title: 'Risk & Governance',
    items: [
      {
        name: 'Risk & CAPA',
        href: moduleUrl(3031),
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        external: true },
      {
        name: 'Incidents',
        href: moduleUrl(3041),
        icon: Siren,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        external: true },
      {
        name: 'Audits',
        href: moduleUrl(3042),
        icon: BookCheck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        external: true },
      {
        name: 'Complaints',
        href: moduleUrl(3036),
        icon: MessageSquare,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        external: true },
      {
        name: 'Regulatory Monitor',
        href: moduleUrl(3040),
        icon: Eye,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        external: true },
      {
        name: 'Mgmt Review',
        href: moduleUrl(3043),
        icon: ClipboardCheck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        external: true },
      {
        name: 'Permit to Work',
        href: moduleUrl(3039),
        icon: HardHat,
        color: 'text-rose-600',
        bgColor: 'bg-rose-100',
        external: true },
      {
        name: 'Emergency',
        href: moduleUrl(3045),
        icon: Flame,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        external: true },
    ] },
  {
    title: 'Resources',
    items: [
      {
        name: 'Training',
        href: moduleUrl(3032),
        icon: GraduationCap,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        external: true },
      {
        name: 'Suppliers',
        href: moduleUrl(3033),
        icon: Building2,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        external: true },
      {
        name: 'Assets',
        href: moduleUrl(3034),
        icon: Package,
        color: 'text-sky-600',
        bgColor: 'bg-sky-100',
        external: true },
      {
        name: 'Documents',
        href: moduleUrl(3035),
        icon: FileSearch,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        external: true },
      {
        name: 'Contracts',
        href: moduleUrl(3037),
        icon: ScrollText,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
        external: true },
      {
        name: 'Fin. Compliance',
        href: moduleUrl(3038),
        icon: DollarSign,
        color: 'text-lime-600',
        bgColor: 'bg-lime-100',
        external: true },
    ] },
];

function NavLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const className =
    'flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group w-full text-left';

  if (item.onClick) {
    return (
      <li>
        <button onClick={item.onClick} className={className}>
          <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
            <Icon className={`h-4 w-4 ${item.color}`} />
          </div>
          <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:text-gray-100 dark:group-hover:text-gray-100">
            {item.name}
          </span>
        </button>
      </li>
    );
  }

  const Component = item.external ? 'a' : Link;
  return (
    <li>
      <Component
        href={item.href}
        {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
        className={className}
      >
        <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
          <Icon className={`h-4 w-4 ${item.color}`} />
        </div>
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:text-gray-100 dark:group-hover:text-gray-100">
          {item.name}
        </span>
        {item.external && <ChevronRight className="h-3 w-3 text-gray-400 dark:text-gray-500" />}
      </Component>
    </li>
  );
}

function CollapsibleSection({ section }: { section: NavSection }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1 w-full text-left"
      >
        <ChevronDown
          className={`h-3 w-3 text-gray-400 dark:text-gray-500 transition-transform ${open ? '' : '-rotate-90'}`}
        />
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {section.title}
        </span>
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5">
          {section.items.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border bg-brand-50 dark:bg-brand-900/10">
        <h1 className="text-xl font-bold font-display text-brand-900 dark:text-brand-100">IMS</h1>
        <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
          Integrated Management System
        </p>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4" aria-label="Module navigation">
        <ul className="space-y-1">
          {internalLinks.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </ul>
        {sections.map((section) => (
          <CollapsibleSection key={section.title} section={section} />
        ))}
        {/* Settings & Help */}
        <div className="mt-3 border-t border-border pt-3">
          <ul>
            <NavLink
              item={{
                name: 'Settings',
                href: moduleUrl(3004),
                icon: Settings,
                color: 'text-gray-600',
                bgColor: 'bg-gray-100 dark:bg-gray-800',
                external: true }}
            />
            <NavLink
              item={{
                name: 'Help & Discovery',
                href: '#',
                icon: HelpCircle,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100 dark:bg-blue-900',
                onClick: () => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('nexara:open-discovery-guide'));
                  }
                } }}
            />
          </ul>
        </div>
      </nav>
      {/* User section */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="px-3">
          <LocaleSwitcher />
        </div>
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
