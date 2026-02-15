'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, FileText, Download } from 'lucide-react';
import { api } from '@/lib/api';

interface Document { id: string; name: string; type: string; category: string; size: string; uploadedAt: string; status: string; }

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/supplier/documents'); setDocuments(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = documents.filter(d => JSON.stringify(d).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6"><div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Documents</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Upload and manage documents</p></div><button className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Upload Document</button></div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search documents..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-cyan-600" />Documents ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Size</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Uploaded</th><th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th><th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
              <tbody>{filtered.map(doc => (<tr key={doc.id} className="border-b hover:bg-gray-50 dark:bg-gray-800"><td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{doc.name}</td><td className="py-3 px-4 text-gray-600">{doc.type}</td><td className="py-3 px-4 text-gray-600">{doc.category}</td><td className="py-3 px-4 text-gray-600">{doc.size}</td><td className="py-3 px-4 text-gray-600">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' : doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{doc.status}</span></td><td className="py-3 px-4 text-right"><button className="text-gray-400 dark:text-gray-500 hover:text-cyan-600"><Download className="h-4 w-4" /></button></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500 dark:text-gray-400"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No documents found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
