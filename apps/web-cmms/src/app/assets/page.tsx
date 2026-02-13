'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Server } from 'lucide-react';
import { api } from '@/lib/api';

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  location: string;
  status: string;
  criticality: string;
  manufacturer: string;
  model: string;
  installDate: string;
}

const statusColors: Record<string, string> = { OPERATIONAL: 'bg-green-100 text-green-700', DOWN: 'bg-red-100 text-red-700', MAINTENANCE: 'bg-yellow-100 text-yellow-700', DECOMMISSIONED: 'bg-gray-100 text-gray-700' };

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { loadAssets(); }, []);

  async function loadAssets() {
    try { const res = await api.get('/assets'); setAssets(res.data.data || []); } catch (error) { console.error('Error loading assets:', error); } finally { setLoading(false); }
  }

  const filtered = assets.filter(a => {
    const matchesSearch = !searchTerm || JSON.stringify(a).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Assets</h1><p className="text-gray-500 mt-1">Asset register and equipment management</p></div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Asset</button>
        </div>
        <Card className="mb-6"><CardContent className="pt-6"><div className="flex flex-wrap gap-4 items-center"><div className="flex-1 min-w-[200px]"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search assets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" /></div></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All Statuses</option><option value="OPERATIONAL">Operational</option><option value="DOWN">Down</option><option value="MAINTENANCE">Maintenance</option><option value="DECOMMISSIONED">Decommissioned</option></select></div></CardContent></Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-amber-600" />Assets ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Asset Tag</th><th className="text-left py-3 px-4 font-medium text-gray-500">Name</th><th className="text-left py-3 px-4 font-medium text-gray-500">Category</th><th className="text-left py-3 px-4 font-medium text-gray-500">Location</th><th className="text-left py-3 px-4 font-medium text-gray-500">Criticality</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th></tr></thead>
              <tbody>{filtered.map(asset => (<tr key={asset.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 font-mono text-gray-900">{asset.assetTag}</td><td className="py-3 px-4 text-gray-900 font-medium">{asset.name}</td><td className="py-3 px-4 text-gray-600">{asset.category}</td><td className="py-3 px-4 text-gray-600">{asset.location}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${asset.criticality === 'HIGH' ? 'bg-red-100 text-red-700' : asset.criticality === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{asset.criticality}</span></td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[asset.status] || 'bg-gray-100 text-gray-700'}`}>{asset.status}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><Server className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No assets found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
