'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, AlertOctagon } from 'lucide-react';
import { api } from '@/lib/api';

interface NCR { id: string; ncrNumber: string; title: string; category: string; severity: string; dueDate: string; status: string; createdAt: string; }

export default function NCRsPage() {
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/supplier/ncrs'); setNcrs(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = ncrs.filter(n => JSON.stringify(n).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6"><div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Non-Conformance Reports</h1><p className="text-gray-500 dark:text-gray-400 mt-1">View and respond to NCRs</p></div></div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search NCRs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertOctagon className="h-5 w-5 text-cyan-600" />NCRs ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">NCR #</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Severity</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Due Date</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th></tr></thead>
              <tbody>{filtered.map(ncr => (<tr key={ncr.id} className="border-b hover:bg-gray-50 dark:bg-gray-800"><td className="py-3 px-4 font-mono">{ncr.ncrNumber}</td><td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{ncr.title}</td><td className="py-3 px-4 text-gray-600">{ncr.category}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ncr.severity === 'CRITICAL' || ncr.severity === 'MAJOR' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{ncr.severity}</span></td><td className="py-3 px-4 text-gray-600">{ncr.dueDate ? new Date(ncr.dueDate).toLocaleDateString() : '-'}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ncr.status === 'CLOSED' ? 'bg-green-100 text-green-700' : ncr.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{ncr.status?.replace(/_/g, ' ')}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500 dark:text-gray-400"><AlertOctagon className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No NCRs found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
