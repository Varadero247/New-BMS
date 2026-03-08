// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { Metadata } from 'next';
import './globals.css';
import SidebarWrapper from '@/components/sidebar-wrapper';

export const metadata: Metadata = {
  title: 'Partner Portal — Nexara IMS',
  description: 'Nexara IMS Partner Portal — manage deals, commissions, NFR licences, and co-marketing materials.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-gray-950 text-gray-100">
        <SidebarWrapper>{children}</SidebarWrapper>
      </body>
    </html>
  );
}
