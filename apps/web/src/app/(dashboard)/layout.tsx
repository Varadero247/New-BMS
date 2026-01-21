'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  HardHat,
  Leaf,
  Award,
  Settings,
  Menu,
  X,
  LogOut,
  AlertTriangle,
  FileText,
  Target,
  ClipboardCheck,
  GraduationCap,
  Bot,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
};

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'H&S (ISO 45001)',
    href: '/hs',
    icon: HardHat,
    children: [
      { name: 'Overview', href: '/hs' },
      { name: 'Risks', href: '/hs/risks' },
      { name: 'Incidents', href: '/hs/incidents' },
      { name: 'Legal Requirements', href: '/hs/legal' },
      { name: 'Objectives', href: '/hs/objectives' },
      { name: 'Actions', href: '/hs/actions' },
      { name: 'Safety Metrics', href: '/hs/metrics' },
    ],
  },
  {
    name: 'Environment (ISO 14001)',
    href: '/environment',
    icon: Leaf,
    children: [
      { name: 'Overview', href: '/environment' },
      { name: 'Aspects', href: '/environment/aspects' },
      { name: 'Events', href: '/environment/events' },
      { name: 'Legal Requirements', href: '/environment/legal' },
      { name: 'Objectives', href: '/environment/objectives' },
      { name: 'Actions', href: '/environment/actions' },
    ],
  },
  {
    name: 'Quality (ISO 9001)',
    href: '/quality',
    icon: Award,
    children: [
      { name: 'Overview', href: '/quality' },
      { name: 'Processes', href: '/quality/processes' },
      { name: 'Non-Conformances', href: '/quality/ncs' },
      { name: 'Legal Requirements', href: '/quality/legal' },
      { name: 'Objectives', href: '/quality/objectives' },
      { name: 'Actions', href: '/quality/actions' },
      { name: 'Quality Metrics', href: '/quality/metrics' },
    ],
  },
  {
    name: 'CAPA Tracker',
    href: '/actions',
    icon: ClipboardCheck,
  },
  {
    name: 'Training',
    href: '/training',
    icon: GraduationCap,
    children: [
      { name: 'Courses', href: '/training/courses' },
      { name: 'Matrix', href: '/training/matrix' },
      { name: 'Records', href: '/training/records' },
    ],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    children: [
      { name: '5 Whys', href: '/analytics/five-whys' },
      { name: 'Fishbone', href: '/analytics/fishbone' },
      { name: 'Pareto', href: '/analytics/pareto' },
      { name: 'Bow-Tie', href: '/analytics/bow-tie' },
      { name: 'Lean Wastes', href: '/analytics/lean-waste' },
      { name: 'Trends', href: '/analytics/trends' },
    ],
  },
  { name: 'Settings & AI', href: '/settings', icon: Settings },
];

function NavItem({ item, pathname }: { item: NavigationItem; pathname: string }) {
  const [expanded, setExpanded] = useState(
    item.children?.some((child) => pathname.startsWith(child.href)) || false
  );

  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className="w-5 h-5" />
        {item.name}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <span className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          {item.name}
        </span>
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {expanded && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-4">
          {item.children?.map((child) => {
            const childActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'block px-3 py-1.5 rounded-md text-sm transition-colors',
                  childActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {child.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card border-r transform transition-transform duration-200 lg:translate-x-0 overflow-hidden flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">IMS</span>
          </Link>
          <button
            className="lg:hidden p-2 hover:bg-muted rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        <div className="p-4 border-t shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6">
          <button
            className="lg:hidden p-2 hover:bg-muted rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Integrated Management System</span>
            <span>|</span>
            <span className="text-red-500">ISO 45001</span>
            <span className="text-green-500">ISO 14001</span>
            <span className="text-blue-500">ISO 9001</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Settings</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
