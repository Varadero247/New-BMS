import type { Metadata } from 'next';
import { DM_Sans, Sora, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600'],
});
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Resolvex IMS — Unified Compliance Intelligence',
  description:
    'Resolvex unifies ISO 9001, 14001, 45001, 27001 and 26 more standards into a single AI-powered management system.',
  openGraph: {
    title: 'Resolvex IMS',
    description: 'Every standard. One intelligent platform.',
    url: 'https://resolvex.io',
    siteName: 'Resolvex IMS',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resolvex IMS',
    description: 'Unified Compliance Intelligence',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('resolvex-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.removeAttribute('data-theme')}else{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${sora.variable} ${jetbrainsMono.variable} font-body antialiased bg-surface-dark text-gray-100 cursor-none`}>
        {children}
      </body>
    </html>
  );
}
