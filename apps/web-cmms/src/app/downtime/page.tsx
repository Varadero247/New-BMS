'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface DowntimeEvent { id: string; asset: string; reason: string; startTime: string; endTime: string; duration: number; impact: string; category: string; status: string; }

export default function DowntimePage() {
  const [events, setEvents] = useState<DowntimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/downtime'); setEvents(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = events.filter(e => JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Downtime Analysis</h1><p className="text-gray-500 mt-1">Track and analyze equipment downtime</p></div>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search downtime events..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-amber-600" />Downtime Events ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Asset</th><th className="text-left py-3 px-4 font-medium text-gray-500">Reason</th><th className="text-left py-3 px-4 font-medium text-gray-500">Category</th><th className="text-left py-3 px-4 font-medium text-gray-500">Start</th><th className="text-left py-3 px-4 font-medium text-gray-500">End</th><th className="text-right py-3 px-4 font-medium text-gray-500">Duration (h)</th><th className="text-left py-3 px-4 font-medium text-gray-500">Impact</th></tr></thead>
              <tbody>{filtered.map(evt => (<tr key={evt.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 text-gray-900 font-medium">{evt.asset}</td><td className="py-3 px-4 text-gray-600">{evt.reason}</td><td className="py-3 px-4 text-gray-600">{evt.category}</td><td className="py-3 px-4 text-gray-600">{evt.startTime ? new Date(evt.startTime).toLocaleString() : '-'}</td><td className="py-3 px-4 text-gray-600">{evt.endTime ? new Date(evt.endTime).toLocaleString() : 'Ongoing'}</td><td className="py-3 px-4 text-right font-medium">{evt.duration?.toFixed(1)}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${evt.impact === 'HIGH' ? 'bg-red-100 text-red-700' : evt.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{evt.impact}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><Clock className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No downtime events found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
