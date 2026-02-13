'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, Receipt } from 'lucide-react';
import { api } from '@/lib/api';

interface Invoice { id: string; invoiceNumber: string; date: string; dueDate: string; amount: number; currency: string; status: string; }

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { load(); }, []);
  async function load() { try { const res = await api.get('/customer/invoices'); setInvoices(res.data.data || []); } catch (e) { console.error('Error:', e); } finally { setLoading(false); } }
  const filtered = invoices.filter(i => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) { return (<div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>); }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Invoices</h1><p className="text-gray-500 mt-1">View and manage your invoices</p></div>
        </div>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search invoices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full" /></div></div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-teal-600" />Invoices ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 px-4 font-medium text-gray-500">Invoice #</th><th className="text-left py-3 px-4 font-medium text-gray-500">Date</th><th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th><th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th><th className="text-left py-3 px-4 font-medium text-gray-500">Status</th></tr></thead>
              <tbody>{filtered.map(inv => (<tr key={inv.id} className="border-b hover:bg-gray-50"><td className="py-3 px-4 font-mono">{inv.invoiceNumber}</td><td className="py-3 px-4 text-gray-600">{inv.date ? new Date(inv.date).toLocaleDateString() : '-'}</td><td className="py-3 px-4 text-gray-600">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}</td><td className="py-3 px-4 text-right font-medium">{inv.currency || '$'}{inv.amount?.toLocaleString()}</td><td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span></td></tr>))}</tbody></table></div>
            ) : (<div className="text-center py-12 text-gray-500"><Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No invoices found</p></div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
