import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@ims/i18n/src/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IMS - Field Service Management',
  description: 'Field service operations, dispatch, and technician management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
