'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PieChart, FileText, Database, BarChart3, Bell, Download, Code, Calendar, GitCompare, Home, Settings, ShieldAlert, BrainCircuit, AlertTriangle } from 'lucide-react';

const mainNav = [{ name: 'Executive Dashboard', href: '/', icon: LayoutDashboard }, { name: 'Custom Dashboards', href: '/dashboards', icon: PieChart }];
const reportsNav = [{ name: 'Reports', href: '/reports', icon: FileText }, { name: 'Datasets', href: '/datasets', icon: Database }, { name: 'Queries', href: '/queries', icon: Code }, { name: 'Natural Language Query', href: '/nlq', icon: Code }];
const intelligenceNav = [{ name: 'Unified Risks', href: '/unified-risks', icon: ShieldAlert }, { name: 'Predictions', href: '/predictions', icon: BrainCircuit }, { name: 'Anomaly Detection', href: '/anomalies', icon: AlertTriangle }];
const monitorNav = [{ name: 'KPIs', href: '/kpis', icon: BarChart3 }, { name: 'Alerts', href: '/alerts', icon: Bell }, { name: 'Exports', href: '/exports', icon: Download }, { name: 'Schedules', href: '/schedules', icon: Calendar }, { name: 'Benchmarks', href: '/benchmarks', icon: GitCompare }];
const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost';
const extLinks = [{ name: 'IMS Dashboard', href: `${APP_BASE}:3000`, icon: Home }, { name: 'Settings', href: `${APP_BASE}:3004`, icon: Settings }];

function NavSection({ title, items, pathname }: { title?: string; items: typeof mainNav; pathname: string }) {
  return (<div className={title ? 'mt-4 pt-4 border-t border-border' : ''}>{title && <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{title}</p>}<ul className="space-y-1">{items.map((item) => { const Icon = item.icon; const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')); return (<li key={item.name}><Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/30 dark:text-brand-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><Icon className={`h-5 w-5 ${isActive ? 'text-brand-600 dark:text-gold-400' : 'text-gray-500 dark:text-gray-400'}`} /><span className="text-sm font-medium">{item.name}</span></Link></li>); })}</ul></div>);
}

export function Sidebar() {
  const pathname = usePathname();
  return (<aside className="w-64 bg-card border-r border-border flex flex-col"><div className="p-6 border-b border-border bg-purple-50 dark:bg-purple-900/10"><h1 className="text-xl font-bold font-display text-purple-900 dark:text-purple-100">Analytics & BI</h1><p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Business Intelligence</p></div><nav className="flex-1 p-4 overflow-y-auto" aria-label="Module navigation"><NavSection items={mainNav} pathname={pathname} /><NavSection title="Intelligence" items={intelligenceNav} pathname={pathname} /><NavSection title="Reports" items={reportsNav} pathname={pathname} /><NavSection title="Monitoring" items={monitorNav} pathname={pathname} /><div className="mt-4 pt-4 border-t border-border"><p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Quick Links</p><ul className="space-y-1">{extLinks.map((item) => { const Icon = item.icon; return (<li key={item.name}><a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" /><span className="text-sm font-medium">{item.name}</span></a></li>); })}</ul></div></nav></aside>);
}
