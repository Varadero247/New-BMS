import type { Metadata } from "next";
import { DM_Sans, Sora } from 'next/font/google';
import "./globals.css";
import { I18nProvider } from '@ims/i18n';
import Sidebar from "@/components/sidebar";

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const sora = Sora({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: "IMS - Workflow Management",
  description: "Industry Workflows and Process Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <I18nProvider>
          <div className="flex h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
