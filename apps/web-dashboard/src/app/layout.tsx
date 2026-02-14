import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { I18nProvider } from '@ims/i18n';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700'] });

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
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.removeAttribute('data-theme')}else{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${sora.variable} font-body antialiased`}>
        <I18nProvider><Providers>{children}</Providers></I18nProvider>
      </body>
    </html>
  );
}
