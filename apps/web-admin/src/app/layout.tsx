import type { Metadata } from 'next';
import { DM_Sans, Syne, DM_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const syne = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700', '800'] });
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['300', '400', '500'] });

export const metadata: Metadata = {
  title: 'Admin — Nexara IMS',
  description: 'Nexara IMS Super Admin Console',
  themeColor: '#080B12',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark" style={{ backgroundColor: '#080B12' }} suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} ${dmMono.variable} font-body antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
