import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@ims/i18n/src/provider';
import { Sidebar } from '@/components/sidebar';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'CRM - IMS',
  description: 'Customer Relationship Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${sora.variable} font-body`}>
        <I18nProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
