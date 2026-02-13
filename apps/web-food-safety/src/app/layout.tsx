import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'Food Safety - IMS', description: 'HACCP-based Food Safety Management System' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={inter.className}><div className="flex h-screen"><Sidebar /><main className="flex-1 overflow-auto bg-gray-50">{children}</main></div></body></html>);
}
