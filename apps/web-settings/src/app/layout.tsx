import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { I18nProvider } from '@ims/i18n/src/provider';
import { Sidebar } from '@/components/sidebar';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: 'Settings - IMS',
  description: 'IMS System Settings and Administration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${sora.variable} font-body`}>
        <I18nProvider>
          <Providers>
            <div className="flex h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
