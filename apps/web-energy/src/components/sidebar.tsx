'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gauge, BarChart3, TrendingDown, Target, Zap, FolderKanban, Activity, ClipboardCheck, Receipt, Bell, Shield, FileText, Home, Settings } from 'lucide-react';

const mainNav = [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }, { name: 'Performance', href: '/performance-dashboard', icon: Activity }, { name: 'Meters', href: '/meters', icon: Gauge }, { name: 'Readings', href: '/readings', icon: BarChart3 }, { name: 'Baselines', href: '/baselines', icon: TrendingDown }];
const mgmtNav = [{ name: 'Targets', href: '/targets', icon: Target }, { name: 'SEUs', href: '/seus', icon: Zap }, { name: 'Projects', href: '/projects', icon: FolderKanban }, { name: 'EnPIs', href: '/enpis', icon: Activity }];
const compNav = [{ name: 'Audits', href: '/audits', icon: ClipboardCheck }, { name: 'Bills', href: '/bills', icon: Receipt }, { name: 'Alerts', href: '/alerts', icon: Bell }, { name: 'Compliance', href: '/compliance', icon: Shield }, { name: 'Reports', href: '/reports', icon: FileText }];
const extLinks = [{ name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home }, { name: 'Settings', href: 'http://localhost:3004', icon: Settings }];

function NavSection({ title, items, pathname }: { title?: string; items: typeof mainNav; pathname: string }) {
  return (<div className={title ? 'mt-4 pt-4 border-t border-border' : ''}>{title && <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>}<ul className="space-y-1">{items.map((item) => { const Icon = item.icon; const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')); return (<li key={item.name}><Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}><Icon className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500'}`} /><span className="text-sm font-medium">{item.name}</span></Link></li>); })}</ul></div>);
}

export function Sidebar() {
  const pathname = usePathname();
  return (<aside className="w-64 bg-card border-r border-border flex flex-col"><div className="p-6 border-b border-border bg-yellow-50 dark:bg-yellow-900/10"><h1 className="text-xl font-bold font-display text-yellow-900 dark:text-yellow-100">Energy Management</h1><p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">ISO 50001 EnMS</p></div><nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation"><NavSection items={mainNav} pathname={pathname} /><NavSection title="Management" items={mgmtNav} pathname={pathname} /><NavSection title="Compliance" items={compNav} pathname={pathname} /><div className="mt-4 pt-4 border-t border-border"><p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Links</p><ul className="space-y-1">{extLinks.map((item) => { const Icon = item.icon; return (<li key={item.name}><a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"><Icon className="h-5 w-5 text-gray-500" /><span className="text-sm font-medium">{item.name}</span></a></li>); })}</ul></div></nav></aside>);
}
