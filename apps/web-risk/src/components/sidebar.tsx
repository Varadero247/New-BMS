'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ExternalLink, LogOut } from 'lucide-react';
const items = [{ label: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> }];
export default function Sidebar() {
  const pathname = usePathname();
  return (<aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col"><div className="p-4 border-b border-border bg-red-50 dark:bg-red-900/10"><h1 className="text-lg font-bold font-display text-red-900 dark:text-red-100">Risk & CAPA</h1><p className="text-xs text-red-600 dark:text-red-400">Module Dashboard</p></div><nav className="flex-1 p-3 space-y-1 overflow-y-auto">{items.map((item) => { const active = pathname === item.href; return (<Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200 font-medium' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}>{item.icon}{item.label}</Link>); })}</nav><div className="p-3 border-t border-border space-y-1"><a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"><ExternalLink className="h-5 w-5" />IMS Dashboard</a><button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 w-full"><LogOut className="h-5 w-5" />Logout</button></div></aside>);
}
