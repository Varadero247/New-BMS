'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Search,
  Linkedin,
  LogOut,
  Shield,
  CalendarCheck,
  Lightbulb,
  FileText,
  ShieldCheck,
  Users,
  Receipt,
  MessageSquare,
  Newspaper,
  TrendingUp,
  Heart,
  Rocket,
  Handshake,
  CalendarClock,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { href: '/growth-dashboard', label: 'Growth Dashboard', icon: BarChart3 },
  { href: '/prospect-research', label: 'Prospect Research', icon: Search },
  { href: '/linkedin-tracker', label: 'LinkedIn Tracker', icon: Linkedin },
  { href: '/monthly-review', label: 'Monthly Review', icon: CalendarCheck },
  { href: '/feature-requests', label: 'Feature Requests', icon: Lightbulb },
  { href: '/contracts', label: 'Contracts', icon: FileText },
  { href: '/data-requests', label: 'DSARs', icon: ShieldCheck },
  { href: '/meetings', label: 'Meetings', icon: Users },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/expansion', label: 'Expansion', icon: TrendingUp },
  { href: '/health-score', label: 'Health Scores', icon: Heart },
  { href: '/renewal', label: 'Renewals', icon: CalendarClock },
  { href: '/winback', label: 'Win-back', icon: RotateCcw },
  { href: '/onboarding', label: 'Onboarding', icon: Rocket },
  { href: '/partner-onboarding', label: 'Partner Onboarding', icon: Handshake },
  { href: '/digest', label: 'Digest', icon: Newspaper },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/chat', label: 'AI Assistant', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0F2440] border-r border-[#1B3A6B]/30 flex flex-col z-50">
      <div className="p-6 border-b border-[#1B3A6B]/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1B3A6B] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Nexara</h1>
            <p className="text-gray-400 dark:text-gray-500 text-xs">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1B3A6B] text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-white hover:bg-[#1B3A6B]/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#1B3A6B]/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
