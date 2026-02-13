'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertTriangle, Crosshair, Activity, ClipboardCheck, Building2, RotateCcw, Link2, Sparkles, Apple, Package, AlertOctagon, GraduationCap, Microscope, Shield, Home, Settings } from 'lucide-react';

const mainNav = [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }, { name: 'Hazards', href: '/hazards', icon: AlertTriangle }, { name: 'CCPs', href: '/ccps', icon: Crosshair }, { name: 'Monitoring', href: '/monitoring', icon: Activity }];
const qualityNav = [{ name: 'NCRs', href: '/ncrs', icon: AlertOctagon }, { name: 'Audits', href: '/audits', icon: ClipboardCheck }, { name: 'Suppliers', href: '/suppliers', icon: Building2 }, { name: 'Recalls', href: '/recalls', icon: RotateCcw }];
const operationsNav = [{ name: 'Products', href: '/products', icon: Package }, { name: 'Allergens', href: '/allergens', icon: Sparkles }, { name: 'Traceability', href: '/traceability', icon: Link2 }, { name: 'Sanitation', href: '/sanitation', icon: Apple }, { name: 'Training', href: '/training', icon: GraduationCap }];
const complianceNav = [{ name: 'Env Monitoring', href: '/environmental-monitoring', icon: Microscope }, { name: 'Food Defense', href: '/food-defense', icon: Shield }];
const externalLinks = [{ name: 'IMS Dashboard', href: 'http://localhost:3000', icon: Home }, { name: 'Settings', href: 'http://localhost:3004', icon: Settings }];

function NavSection({ title, items, pathname }: { title?: string; items: typeof mainNav; pathname: string }) {
  return (<div className={title ? 'mt-4 pt-4 border-t border-gray-200' : ''}>{title && <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>}<ul className="space-y-1">{items.map((item) => { const Icon = item.icon; const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')); return (<li key={item.name}><Link href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? 'bg-orange-100 text-orange-900' : 'text-gray-700 hover:bg-gray-100'}`}><Icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-gray-500'}`} /><span className="text-sm font-medium">{item.name}</span></Link></li>); })}</ul></div>);
}

export function Sidebar() {
  const pathname = usePathname();
  return (<aside className="w-64 bg-white border-r border-gray-200 flex flex-col"><div className="p-6 border-b border-gray-200 bg-orange-50"><h1 className="text-xl font-bold text-orange-900">Food Safety</h1><p className="text-xs text-orange-600 mt-1">HACCP Management System</p></div><nav className="flex-1 p-4 overflow-y-auto"><NavSection items={mainNav} pathname={pathname} /><NavSection title="Quality" items={qualityNav} pathname={pathname} /><NavSection title="Operations" items={operationsNav} pathname={pathname} /><NavSection title="Compliance" items={complianceNav} pathname={pathname} /><div className="mt-4 pt-4 border-t border-gray-200"><p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Links</p><ul className="space-y-1">{externalLinks.map((item) => { const Icon = item.icon; return (<li key={item.name}><a href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"><Icon className="h-5 w-5 text-gray-500" /><span className="text-sm font-medium">{item.name}</span></a></li>); })}</ul></div></nav></aside>);
}
