'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { PieChart, FileText, Database, BarChart3, Bell, Download, TrendingUp, Users } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData { totalReports: number; activeDashboards: number; datasets: number; kpis: number; activeAlerts: number; scheduledExports: number; avgScore: number; activeUsers: number; }

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await api.get('/dashboard'); setData(r.data.data); } catch(e) { console.error(e); setData({ totalReports: 0, activeDashboards: 0, datasets: 0, kpis: 0, activeAlerts: 0, scheduledExports: 0, avgScore: 0, activeUsers: 0 }); } finally { setLoading(false); } })(); }, []);
  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded" />)}</div></div></div>;

  const kpis = [
    { title: 'Active Dashboards', value: String(data?.activeDashboards || 0), icon: PieChart, iconColor: 'text-purple-500', bgColor: 'bg-purple-50', valueColor: 'text-purple-700', href: '/dashboards' },
    { title: 'Total Reports', value: String(data?.totalReports || 0), icon: FileText, iconColor: 'text-blue-500', bgColor: 'bg-blue-50', valueColor: 'text-blue-700', href: '/reports' },
    { title: 'Datasets', value: String(data?.datasets || 0), icon: Database, iconColor: 'text-green-500', bgColor: 'bg-green-50', valueColor: 'text-green-700', href: '/datasets' },
    { title: 'KPIs Tracked', value: String(data?.kpis || 0), icon: BarChart3, iconColor: 'text-amber-500', bgColor: 'bg-amber-50', valueColor: 'text-amber-700', href: '/kpis' },
    { title: 'Active Alerts', value: String(data?.activeAlerts || 0), icon: Bell, iconColor: 'text-red-500', bgColor: 'bg-red-50', valueColor: 'text-red-700', href: '/alerts' },
    { title: 'Scheduled Exports', value: String(data?.scheduledExports || 0), icon: Download, iconColor: 'text-indigo-500', bgColor: 'bg-indigo-50', valueColor: 'text-indigo-700', href: '/exports' },
    { title: 'Avg Performance', value: `${data?.avgScore || 0}%`, icon: TrendingUp, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50', valueColor: 'text-emerald-700', href: '/kpis' },
    { title: 'Active Users', value: String(data?.activeUsers || 0), icon: Users, iconColor: 'text-cyan-500', bgColor: 'bg-cyan-50', valueColor: 'text-cyan-700', href: '/dashboards' },
  ];

  return (<div className="p-8"><div className="max-w-7xl mx-auto"><div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1><p className="text-gray-500 mt-1">Analytics and business intelligence overview</p></div><div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">{kpis.map(card => { const Icon = card.icon; return (<Link key={card.title} href={card.href}><Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{card.title}</p><p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p></div><div className={`p-3 rounded-full ${card.bgColor}`}><Icon className={`h-6 w-6 ${card.iconColor}`} /></div></div></CardContent></Card></Link>); })}</div></div></div>);
}
