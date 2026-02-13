'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Truck, Users, Route, Calendar, Building2, MapPin,
  FileText, ScrollText, Package, Clock, BarChart3, ClipboardCheck, StickyNote,
  ExternalLink, LogOut
} from 'lucide-react';

interface NavItem { label: string; href: string; icon: React.ReactNode; }
interface NavSection { title: string; items: NavItem[]; }

const sections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: 'Jobs', href: '/jobs', icon: <Truck className="h-5 w-5" /> },
      { label: 'Map View', href: '/map-view', icon: <MapPin className="h-5 w-5" /> },
      { label: 'Technicians', href: '/technicians', icon: <Users className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Routes', href: '/routes', icon: <Route className="h-5 w-5" /> },
      { label: 'Schedules', href: '/schedules', icon: <Calendar className="h-5 w-5" /> },
      { label: 'Customers', href: '/customers', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Sites', href: '/sites', icon: <MapPin className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Financial',
    items: [
      { label: 'Invoices', href: '/invoices', icon: <FileText className="h-5 w-5" /> },
      { label: 'Contracts', href: '/contracts', icon: <ScrollText className="h-5 w-5" /> },
      { label: 'Parts Used', href: '/parts-used', icon: <Package className="h-5 w-5" /> },
      { label: 'Time Entries', href: '/time-entries', icon: <Clock className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'KPIs', href: '/kpis', icon: <BarChart3 className="h-5 w-5" /> },
      { label: 'Checklists', href: '/checklists', icon: <ClipboardCheck className="h-5 w-5" /> },
      { label: 'Job Notes', href: '/job-notes', icon: <StickyNote className="h-5 w-5" /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-sky-50 border-r border-sky-200 min-h-screen flex flex-col">
      <div className="p-4 border-b border-sky-200">
        <h1 className="text-lg font-bold text-sky-900">Field Service</h1>
        <p className="text-xs text-sky-600">Dispatch & Operations</p>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1 px-3">
              {section.title}
            </p>
            {section.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-sky-200 text-sky-900 font-medium'
                      : 'text-gray-600 hover:bg-sky-100 hover:text-sky-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sky-200 space-y-1">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-sky-100 hover:text-sky-900"
        >
          <ExternalLink className="h-5 w-5" />
          IMS Dashboard
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 w-full"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
