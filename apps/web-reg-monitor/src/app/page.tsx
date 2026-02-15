'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@ims/ui';
import { LayoutDashboard } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { const r = await api.get('/dashboard/stats'); setStats(r.data.data || {}); } catch (e) { console.error(e); } finally { setLoading(false); } })(); }, []);
  if (loading) return (<div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" /><div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />)}</div></div></main></div>);
  return (
    <div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8"><div className="max-w-7xl mx-auto"><div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Regulatory Monitor Dashboard</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Overview and key metrics</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Object.entries(stats).map(([key, value]) => (<Card key={key} className="hover:shadow-md transition-shadow"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{key.replace(/([A-Z])/g, ' $1').trim()}</p><p className="text-2xl font-bold mt-1">{String(value)}</p></div><div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20"><LayoutDashboard className="h-6 w-6 text-cyan-600" /></div></div></CardContent></Card>))}</div>
    </div></main></div>
  );
}
