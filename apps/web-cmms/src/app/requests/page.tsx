'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';

interface MaintenanceRequest { id: string; requestNumber: string; title: string; description: string; requestedBy: string; priority: string; location: string; status: string; createdAt: string; }

export default function RequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/requests'); setRequests(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = requests.filter(r => JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1><p className="text-gray-500 mt-1">Submit and track maintenance requests</p></div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> New Request</button>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search requests..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-amber-600" />Requests ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Request #</th><th className="text-left py-3 px-4 font-medium text-gray-500">Title</th><th className="text-left py-3 px-4 font-medium text-gray-500">Requested By</th><th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th><th className="text-left py-3 px-4 font-medium text-gray-500">Location</th><th className="text-left py-3 px-4 font-medium text-gray-500">Date</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th></tr></thead>
              <tbody>{filtered.map(req => (<tr key={req.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 font-mono">{req.requestNumber}</td><td className="py-3 px-4 text-gray-900 font-medium">{req.title}</td><td className="py-3 px-4 text-gray-600">{req.requestedBy}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${req.priority === 'HIGH' || req.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{req.priority}</span></td><td className="py-3 px-4 text-gray-600">{req.location}</td><td className="py-3 px-4 text-gray-600">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status?.replace(/_/g, ' ')}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No maintenance requests found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
