import type { Metadata } from 'next';
import { DM_Sans, Syne, DM_Mono } from 'next/font/google';
import './globals.css';
import { ThemeSwitch } from '@ims/ui';
import { ThemingProvider } from '@ims/theming';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const syne = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700', '800'] });
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['300', '400', '500'] });

export const metadata: Metadata = {
  title: 'Partners — Nexara IMS',
  description: 'Partner portal for Nexara IMS - manage deals, referrals, and payouts',
  themeColor: '#080B12',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark" style={{ backgroundColor: '#080B12' }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('nexara-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.removeAttribute('data-theme')}else{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${syne.variable} ${dmMono.variable} font-body antialiased min-h-screen`}>
        <ThemingProvider apiUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}>{children}</ThemingProvider>
        <ThemeSwitch />
      </body>
    </html>
  );
}
