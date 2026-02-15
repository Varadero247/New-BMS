import type { Metadata } from 'next';
import { DM_Sans, Syne, DM_Mono } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@ims/i18n';
import { ThemeSwitch } from '@ims/ui';
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const syne = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700', '800'] });
const dmMono = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['300', '400', '500'] });
export const metadata: Metadata = { title: 'Incidents — Nexara IMS', description: 'Incidents management module', themeColor: '#080B12' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" data-theme="dark" className="dark" suppressHydrationWarning style={{ backgroundColor: '#080B12' }}><head><script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('nexara-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.removeAttribute('data-theme')}else{document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}}catch(e){}` }} /></head><body className={`${dmSans.variable} ${syne.variable} ${dmMono.variable} font-body antialiased`}><I18nProvider>{children}</I18nProvider><ThemeSwitch /></body></html>);
}
