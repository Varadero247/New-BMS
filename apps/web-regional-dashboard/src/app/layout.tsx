// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Regional Dashboard — IMS',
  description: 'APAC Regional Compliance & Tax Intelligence Dashboard',
};

const navLinks = [
  { href: '/',            label: 'Overview',    icon: '🌏' },
  { href: '/countries',  label: 'Countries',   icon: '🗺️' },
  { href: '/taxes',      label: 'Tax League',  icon: '💰' },
  { href: '/iso',        label: 'ISO Standards', icon: '📋' },
  { href: '/compliance', label: 'Compliance',  icon: '✅' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-56 bg-indigo-900 text-white flex flex-col shrink-0 min-h-screen">
          <div className="px-4 py-5 border-b border-indigo-700">
            <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">IMS Platform</div>
            <div className="text-lg font-bold">Regional Dashboard</div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
              >
                <span>{l.icon}</span>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-indigo-700 text-xs text-indigo-400">
            20 APAC Countries · Phase 138
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
