import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { I18nProvider } from '@ims/i18n/src/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IMS Dashboard',
  description: 'Integrated Management System - ISO 45001, 14001, 9001',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider><Providers>{children}</Providers></I18nProvider>
      </body>
    </html>
  );
}
