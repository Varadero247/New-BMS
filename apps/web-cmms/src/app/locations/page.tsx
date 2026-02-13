'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, MapPin } from 'lucide-react';
import { api } from '@/lib/api';

interface Location { id: string; name: string; code: string; type: string; parent: string; assetCount: number; status: string; }

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/locations'); setLocations(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = locations.filter(l => JSON.stringify(l).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Locations</h1><p className="text-gray-500 mt-1">Manage facility locations and zones</p></div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Location</button>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search locations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-amber-600" />Locations ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Code</th><th className="text-left py-3 px-4 font-medium text-gray-500">Name</th><th className="text-left py-3 px-4 font-medium text-gray-500">Type</th><th className="text-left py-3 px-4 font-medium text-gray-500">Parent</th><th className="text-center py-3 px-4 font-medium text-gray-500">Assets</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th></tr></thead>
              <tbody>{filtered.map(loc => (<tr key={loc.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 font-mono">{loc.code}</td><td className="py-3 px-4 text-gray-900 font-medium">{loc.name}</td><td className="py-3 px-4 text-gray-600">{loc.type}</td><td className="py-3 px-4 text-gray-600">{loc.parent || '-'}</td><td className="py-3 px-4 text-center">{loc.assetCount}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${loc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{loc.status}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No locations found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
