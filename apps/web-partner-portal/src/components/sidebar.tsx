// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function PoundSterlingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="17" x2="6" y2="17" />
      <path d="M9 17V8a3 3 0 0 1 6 0" />
      <path d="M9 12h6" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10" />
      <line x1="12" y1="10" x2="12" y2="10" />
      <line x1="16" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="8" y2="14" />
      <line x1="12" y1="14" x2="12" y2="14" />
      <line x1="16" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="12" y2="18" />
      <line x1="16" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <HomeIcon />, exact: true },
  { href: '/deals', label: 'My Deals', icon: <BriefcaseIcon /> },
  { href: '/deals/register', label: 'Deal Registration', icon: <PlusCircleIcon /> },
  { href: '/commissions', label: 'Commissions', icon: <PoundSterlingIcon /> },
  { href: '/nfr', label: 'NFR Licences', icon: <KeyIcon /> },
  { href: '/tier', label: 'Tier & Benefits', icon: <StarIcon /> },
  { href: '/stack-calculator', label: 'Stack Calculator', icon: <CalculatorIcon /> },
  { href: '/collateral', label: 'Co-marketing', icon: <LayersIcon /> },
  { href: '/profile', label: 'Profile', icon: <UserIcon /> },
];

const TIER_COLOURS: Record<string, string> = {
  REFERRAL: 'bg-blue-600 text-white',
  RESELLER: 'bg-emerald-600 text-white',
  STRATEGIC: 'bg-amber-500 text-white',
  WHITE_LABEL: 'bg-purple-600 text-white',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [partnerTier, setPartnerTier] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');

  useEffect(() => {
    setPartnerTier(localStorage.getItem('partner_tier') || '');
    setPartnerName(localStorage.getItem('partner_name') || '');
  }, []);

  function handleLogout() {
    localStorage.removeItem('partner_portal_token');
    localStorage.removeItem('partner_tier');
    localStorage.removeItem('partner_name');
    router.push('/login');
  }

  function isActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }

  const tierColour = partnerTier ? (TIER_COLOURS[partnerTier] || 'bg-gray-600 text-white') : '';

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-950 border-r border-gray-800 px-4 py-6 shrink-0">
      {/* Logo */}
      <div className="mb-6">
        <span className="text-xl font-bold text-emerald-400 tracking-tight">Nexara</span>
        <span className="ml-2 text-xs text-gray-500 font-medium uppercase tracking-widest">Partner</span>
      </div>

      {/* Tier badge */}
      {partnerTier && (
        <div className="mb-5">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${tierColour}`}>
            {partnerTier} PARTNER
          </div>
          {partnerName && (
            <p className="mt-1.5 text-sm text-gray-400 truncate">{partnerName}</p>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={active ? 'text-emerald-400' : 'text-gray-500'}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
      >
        <LogOutIcon />
        Logout
      </button>
    </aside>
  );
}
