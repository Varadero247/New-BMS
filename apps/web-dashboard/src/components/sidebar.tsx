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
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  color: string;
  bgColor: string;
  external?: boolean;
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
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Compliance Calendar',
    href: '/compliance-calendar',
    icon: CalendarCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
];

const sections: NavSection[] = [
  {
    title: 'ISO Compliance',
    items: [
      { name: 'Health & Safety', href: 'http://localhost:3001', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-100', external: true },
      { name: 'Environmental', href: 'http://localhost:3002', icon: Leaf, color: 'text-green-600', bgColor: 'bg-green-100', external: true },
      { name: 'Quality', href: 'http://localhost:3003', icon: Award, color: 'text-blue-600', bgColor: 'bg-blue-100', external: true },
      { name: 'ESG', href: 'http://localhost:3016', icon: TreePine, color: 'text-teal-600', bgColor: 'bg-teal-100', external: true },
      { name: 'Food Safety', href: 'http://localhost:3020', icon: UtensilsCrossed, color: 'text-amber-600', bgColor: 'bg-amber-100', external: true },
      { name: 'Energy', href: 'http://localhost:3021', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-100', external: true },
      { name: 'ISO 42001 (AI)', href: 'http://localhost:3024', icon: Brain, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-100', external: true },
      { name: 'ISO 37001 (Anti-Bribery)', href: 'http://localhost:3025', icon: Scale, color: 'text-rose-600', bgColor: 'bg-rose-100', external: true },
      { name: 'InfoSec', href: 'http://localhost:3015', icon: ShieldCheck, color: 'text-cyan-600', bgColor: 'bg-cyan-100', external: true },
      { name: 'Aerospace', href: 'http://localhost:3012', icon: Plane, color: 'text-slate-600', bgColor: 'bg-slate-100', external: true },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Inventory', href: 'http://localhost:3005', icon: Package, color: 'text-sky-600', bgColor: 'bg-sky-100', external: true },
      { name: 'HR', href: 'http://localhost:3006', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-100', external: true },
      { name: 'Payroll', href: 'http://localhost:3007', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-100', external: true },
      { name: 'Workflows', href: 'http://localhost:3008', icon: GitBranch, color: 'text-indigo-600', bgColor: 'bg-indigo-100', external: true },
      { name: 'Project Management', href: 'http://localhost:3009', icon: FolderKanban, color: 'text-violet-600', bgColor: 'bg-violet-100', external: true },
      { name: 'Finance', href: 'http://localhost:3013', icon: PiggyBank, color: 'text-lime-600', bgColor: 'bg-lime-100', external: true },
      { name: 'CRM', href: 'http://localhost:3014', icon: UserCircle, color: 'text-pink-600', bgColor: 'bg-pink-100', external: true },
      { name: 'CMMS', href: 'http://localhost:3017', icon: Wrench, color: 'text-stone-600', bgColor: 'bg-stone-100', external: true },
      { name: 'Field Service', href: 'http://localhost:3023', icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100', external: true },
      { name: 'Analytics', href: 'http://localhost:3022', icon: BarChart3, color: 'text-purple-600', bgColor: 'bg-purple-100', external: true },
    ],
  },
  {
    title: 'Portals & Specialist',
    items: [
      { name: 'Customer Portal', href: 'http://localhost:3018', icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-100', external: true },
      { name: 'Supplier Portal', href: 'http://localhost:3019', icon: Briefcase, color: 'text-amber-600', bgColor: 'bg-amber-100', external: true },
      { name: 'Medical Devices', href: 'http://localhost:3011', icon: Stethoscope, color: 'text-red-600', bgColor: 'bg-red-100', external: true },
      { name: 'Automotive', href: 'http://localhost:3010', icon: Car, color: 'text-gray-600', bgColor: 'bg-gray-100', external: true },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const Component = item.external ? 'a' : Link;
  return (
    <li>
      <Component
        href={item.href}
        {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
        className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
          <Icon className={`h-4 w-4 ${item.color}`} />
        </div>
        <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {item.name}
        </span>
        {item.external && (
          <ChevronRight className="h-3 w-3 text-gray-400" />
        )}
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
        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</span>
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
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">IMS</h1>
        <p className="text-xs text-gray-500 mt-1">Integrated Management System</p>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {internalLinks.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </ul>
        {sections.map((section) => (
          <CollapsibleSection key={section.title} section={section} />
        ))}
        {/* Settings */}
        <div className="mt-3 border-t border-gray-100 pt-3">
          <ul>
            <NavLink item={{ name: 'Settings', href: 'http://localhost:3004', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-100', external: true }} />
          </ul>
        </div>
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
