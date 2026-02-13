'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

interface KPI { id: string; name: string; category: string; value: number; unit: string; target: number; trend: string; period: string; }

export default function KPIsPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/kpis'); setKpis(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = kpis.filter(k => JSON.stringify(k).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">KPIs</h1><p className="text-gray-500 mt-1">Key performance indicators for maintenance</p></div>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search KPIs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-600" />KPIs ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Name</th><th className="text-left py-3 px-4 font-medium text-gray-500">Category</th><th className="text-right py-3 px-4 font-medium text-gray-500">Value</th><th className="text-right py-3 px-4 font-medium text-gray-500">Target</th><th className="text-left py-3 px-4 font-medium text-gray-500">Trend</th><th className="text-left py-3 px-4 font-medium text-gray-500">Period</th></tr></thead>
              <tbody>{filtered.map(kpi => (<tr key={kpi.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 text-gray-900 font-medium">{kpi.name}</td><td className="py-3 px-4 text-gray-600">{kpi.category}</td><td className="py-3 px-4 text-right font-medium">{kpi.value} {kpi.unit}</td><td className="py-3 px-4 text-right text-gray-600">{kpi.target} {kpi.unit}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${kpi.trend === 'UP' ? 'bg-green-100 text-green-700' : kpi.trend === 'DOWN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{kpi.trend}</span></td><td className="py-3 px-4 text-gray-600">{kpi.period}</td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No KPIs found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
