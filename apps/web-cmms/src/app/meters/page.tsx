'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Gauge } from 'lucide-react';
import { api } from '@/lib/api';

interface MeterReading { id: string; asset: string; meter: string; value: number; unit: string; readingDate: string; readBy: string; previousValue: number; }

export default function MetersPage() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/meters'); setReadings(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = readings.filter(r => JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Meter Readings</h1><p className="text-gray-500 mt-1">Track equipment meter readings</p></div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Log Reading</button>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search meter readings..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5 text-amber-600" />Meter Readings ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Asset</th><th className="text-left py-3 px-4 font-medium text-gray-500">Meter</th><th className="text-right py-3 px-4 font-medium text-gray-500">Value</th><th className="text-right py-3 px-4 font-medium text-gray-500">Previous</th><th className="text-left py-3 px-4 font-medium text-gray-500">Date</th><th className="text-left py-3 px-4 font-medium text-gray-500">Read By</th></tr></thead>
              <tbody>{filtered.map(r => (<tr key={r.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 text-gray-900 font-medium">{r.asset}</td><td className="py-3 px-4 text-gray-600">{r.meter}</td><td className="py-3 px-4 text-right font-medium">{r.value} {r.unit}</td><td className="py-3 px-4 text-right text-gray-600">{r.previousValue} {r.unit}</td><td className="py-3 px-4 text-gray-600">{r.readingDate ? new Date(r.readingDate).toLocaleDateString() : '-'}</td><td className="py-3 px-4 text-gray-600">{r.readBy}</td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><Gauge className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No meter readings found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
