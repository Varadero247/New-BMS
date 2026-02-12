'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Pencil,
  AlertTriangle,
  FolderOpen,
  CheckSquare,
  Shield,
  ClipboardCheck,
  MessageSquare,
  Truck,
  GitBranch,
  Home,
  Award,
  Settings,
  FileText,
  Barcode,
  Activity,
  Code,
} from 'lucide-react';

// Medical Device Section
const medicalNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Design Controls', href: '/design-controls', icon: Pencil },
  { name: 'Device Records (DMR/DHR)', href: '/device-records', icon: FileText },
  { name: 'Risk Management', href: '/risk-management', icon: AlertTriangle },
  { name: 'DHF Records', href: '/dhf', icon: FolderOpen },
  { name: 'Verification', href: '/verification', icon: CheckSquare },
  { name: 'Validation', href: '/validation', icon: Shield },
];

// Modules Section
const modulesNavigation = [
  { name: 'CAPA', href: '/capa', icon: ClipboardCheck },
  { name: 'Complaints', href: '/complaints', icon: MessageSquare },
  { name: 'Supplier Controls', href: '/suppliers', icon: Truck },
  { name: 'Traceability', href: '/traceability', icon: GitBranch },
  { name: 'UDI Management', href: '/udi', icon: Barcode },
  { name: 'Post-Market Surveillance', href: '/pms', icon: Activity },
  { name: 'Software Validation', href: '/software', icon: Code },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const externalLinks = [
  { name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home },
  { name: 'Quality (ISO 9001)', href: 'http://localhost:3003', icon: Award },
  { name: 'Settings', href: 'http://localhost:3004', icon: Settings },
];

function NavSection({ title, items, pathname }: { title?: string; items: typeof medicalNavigation; pathname: string }) {
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
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-teal-600' : 'text-gray-500'}`} />
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
      <div className="p-6 border-b border-gray-200 bg-teal-50">
        <h1 className="text-xl font-bold text-teal-900">Medical Devices</h1>
        <p className="text-xs text-teal-600 mt-1">ISO 13485:2016 QMS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <NavSection items={medicalNavigation} pathname={pathname} />
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
