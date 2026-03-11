// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { Metadata } from 'next';
import { DM_Sans, Syne, DM_Mono } from 'next/font/google';
import './globals.css';
import SidebarWrapper from '@/components/sidebar-wrapper';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
});
const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'Partner Portal — Nexara IMS',
  description: 'Nexara IMS Partner Portal — manage deals, commissions, NFR licences, and co-marketing materials.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className="dark"
      suppressHydrationWarning
      style={{ backgroundColor: '#080B12' }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var c=document.cookie.match(/(?:^|;\\s*)nexara-theme=([^;]+)/);var t=c?c[1]:localStorage.getItem('nexara-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.removeAttribute('data-theme')}else{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${syne.variable} ${dmMono.variable} font-body antialiased`}>
        <SidebarWrapper>{children}</SidebarWrapper>
      </body>
    </html>
  );
}
