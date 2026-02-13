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
} from 'lucide-react';

// Quality Section
const qualityNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Compliance Dashboard', href: '/compliance-dashboard', icon: CheckCircle },
  { name: 'Risks & Opportunities', href: '/risks', icon: AlertTriangle },
  { name: 'Processes', href: '/processes', icon: Workflow },
  { name: 'Non-Conformance', href: '/nonconformances', icon: AlertOctagon },
  { name: 'Actions', href: '/actions', icon: ClipboardList },
];

// Modules Section
const modulesNavigation = [
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Document Register', href: '/document-register', icon: FileSpreadsheet },
  { name: 'CAPA', href: '/capa', icon: ClipboardCheck },
  { name: 'CAPA Board', href: '/capa/board', icon: Columns },
  { name: 'Legal Register', href: '/legal', icon: Scale },
  { name: 'FMEA', href: '/fmea', icon: FileSpreadsheet },
  { name: 'Continual Improvement', href: '/improvements', icon: Lightbulb },
  { name: 'Supplier Quality', href: '/suppliers', icon: Truck },
  { name: 'Change Management', href: '/changes', icon: GitBranch },
  { name: 'Counterfeit Prevention', href: '/counterfeit', icon: ShieldAlert },
  { name: 'Product Safety', href: '/product-safety', icon: Shield },
  { name: 'Design & Development', href: '/design-development', icon: Layers },
  { name: 'Objectives', href: '/objectives', icon: Target },
  { name: 'Calibrations', href: '/calibrations', icon: BarChart3 },
  { name: 'Competences', href: '/competences', icon: ClipboardList },
  { name: 'RACI Matrix', href: '/raci', icon: BarChart3 },
  { name: 'Releases', href: '/releases', icon: ClipboardCheck },
  { name: 'Management Reviews', href: '/management-reviews', icon: ClipboardList },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

function NavSection({ title, items, pathname }: { title?: string; items: typeof qualityNavigation; pathname: string }) {
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
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
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
      <div className="p-6 border-b border-gray-200 bg-blue-50">
        <h1 className="text-xl font-bold text-blue-900">Quality</h1>
        <p className="text-xs text-blue-600 mt-1">ISO 9001:2015 QMS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <NavSection items={qualityNavigation} pathname={pathname} />
        <NavSection title="Modules" items={modulesNavigation} pathname={pathname} />

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
