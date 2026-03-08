// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Metadata } from 'next';
import './globals.css';
import { OnboardingProvider } from '@/context/OnboardingContext';

export const metadata: Metadata = {
  title: 'Nexara IMS — Organisation Setup',
  description: 'Set up your Nexara IMS organisation — region, compliance, and ISO standards configuration.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Lato:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-[#0B1E38] text-gray-900 dark:text-white antialiased">
        <OnboardingProvider>{children}</OnboardingProvider>
      </body>
    </html>
  );
}
