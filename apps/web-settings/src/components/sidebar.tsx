'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Shield,
  Sparkles,
  Settings as SettingsIcon,
  Home,
  Activity,
  UserCircle,
  Bell,
  Palette,
  Plug,
  Key,
  ToggleLeft,
  Award,
  ShieldCheck,
  Megaphone,
  Lock,
  UserCog,
  Webhook,
  Activity as ActivityIcon,
  Upload,
  FileJson,
  Clock,
  ShieldAlert,
  Scale,
  FileText,
  Store,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Roles & Permissions', href: '/roles', icon: Shield },
  { name: 'Access Log', href: '/access-log', icon: Activity },
  { name: 'My Profile', href: '/my-profile', icon: UserCircle },
  { name: 'AI Configuration', href: '/ai-config', icon: Sparkles },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Appearance', href: '/appearance', icon: Palette },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'System Status', href: '/system-status', icon: ActivityIcon },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Certifications', href: '/certifications', icon: Award },
  { name: 'IP Allowlist', href: '/ip-allowlist', icon: ShieldCheck },
  { name: 'Feature Flags', href: '/feature-flags', icon: ToggleLeft },
  { name: 'SSO (SAML)', href: '/sso', icon: Lock },
  { name: 'SCIM Provisioning', href: '/scim', icon: UserCog },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'Platform Status', href: '/status', icon: ActivityIcon },
  { name: 'Changelog', href: '/changelog', icon: Megaphone },
  { name: 'Data Import', href: '/data-import', icon: Upload },
  { name: 'API Docs', href: '/api-docs', icon: FileJson },
  { name: 'Scheduled Reports', href: '/scheduled-reports', icon: Clock },
  { name: 'Privacy (DSAR)', href: '/privacy', icon: ShieldAlert },
  { name: 'Legal (DPA)', href: '/legal', icon: Scale },
  { name: 'Audit Log', href: '/audit-log', icon: Shield },
  { name: 'System Settings', href: '/system', icon: SettingsIcon },
];

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';

const externalLinks = [{ name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home }];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border bg-gray-50 dark:bg-gray-800/50">
        <h1 className="text-xl font-bold font-display text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">System Administration</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* External Links */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            Quick Links
          </p>
          <ul className="space-y-1">
            {externalLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
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
