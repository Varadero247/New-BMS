'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, CheckSquare } from 'lucide-react';
import { api } from '@/lib/api';

interface Checklist { id: string; name: string; category: string; items: number; completedItems: number; assignedTo: string; dueDate: string; status: string; }

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/checklists'); setChecklists(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = checklists.filter(c => JSON.stringify(c).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Checklists</h1><p className="text-gray-500 mt-1">Maintenance checklists and templates</p></div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Create Checklist</button>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search checklists..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-amber-600" />Checklists ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Name</th><th className="text-left py-3 px-4 font-medium text-gray-500">Category</th><th className="text-left py-3 px-4 font-medium text-gray-500">Progress</th><th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th><th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th></tr></thead>
              <tbody>{filtered.map(cl => (<tr key={cl.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 text-gray-900 font-medium">{cl.name}</td><td className="py-3 px-4 text-gray-600">{cl.category}</td><td className="py-3 px-4"><div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${cl.items ? (cl.completedItems / cl.items) * 100 : 0}%` }} /></div><span className="text-xs">{cl.completedItems || 0}/{cl.items || 0}</span></div></td><td className="py-3 px-4 text-gray-600">{cl.assignedTo}</td><td className="py-3 px-4 text-gray-600">{cl.dueDate ? new Date(cl.dueDate).toLocaleDateString() : '-'}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cl.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : cl.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{cl.status?.replace(/_/g, ' ')}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No checklists found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
