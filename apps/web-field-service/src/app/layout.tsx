import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@ims/i18n/src/provider';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'IMS - Field Service Management',
  description: 'Field service operations, dispatch, and technician management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${sora.variable} font-body`}><I18nProvider>{children}</I18nProvider></body>
    </html>
  );
}
