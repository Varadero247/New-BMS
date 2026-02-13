'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Package } from 'lucide-react';
import { api } from '@/lib/api';

interface Part { id: string; partNumber: string; name: string; category: string; quantity: number; minStock: number; unit: string; location: string; unitCost: number; status: string; }

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/parts'); setParts(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = parts.filter(p => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Parts Inventory</h1><p className="text-gray-500 mt-1">Manage spare parts and supplies</p></div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Part</button>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search parts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-amber-600" />Parts ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Part #</th><th className="text-left py-3 px-4 font-medium text-gray-500">Name</th><th className="text-left py-3 px-4 font-medium text-gray-500">Category</th><th className="text-right py-3 px-4 font-medium text-gray-500">Qty</th><th className="text-right py-3 px-4 font-medium text-gray-500">Min Stock</th><th className="text-left py-3 px-4 font-medium text-gray-500">Location</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th></tr></thead>
              <tbody>{filtered.map(part => (<tr key={part.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 font-mono">{part.partNumber}</td><td className="py-3 px-4 text-gray-900 font-medium">{part.name}</td><td className="py-3 px-4 text-gray-600">{part.category}</td><td className={`py-3 px-4 text-right font-medium ${part.quantity <= part.minStock ? 'text-red-600' : 'text-gray-900'}`}>{part.quantity}</td><td className="py-3 px-4 text-right text-gray-600">{part.minStock}</td><td className="py-3 px-4 text-gray-600">{part.location}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${part.quantity <= part.minStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{part.quantity <= part.minStock ? 'Low Stock' : 'In Stock'}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><Package className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No parts found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
