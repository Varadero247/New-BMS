'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, FileText, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Invoice {
  id: string;
  invoiceNumber?: string;
  customerName?: string;
  jobNumber?: string;
  amount?: number;
  tax?: number;
  totalAmount?: number;
  date?: string;
  dueDate?: string;
  status?: string;
  notes?: string;
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const emptyForm = {
  customerName: '', jobNumber: '', amount: '', tax: '', dueDate: '',
  status: 'DRAFT', notes: '',
};

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Invoice | null>(null);
  const [deleteItem, setDeleteItem] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/invoices'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const q = searchTerm.toLowerCase();
    return (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!statusFilter || i.status === statusFilter);
  });

  const totalRevenue = items.filter(i => i.status === 'PAID').reduce((s, i) => s + (Number(i.totalAmount || i.amount) || 0), 0);
  const outstanding = items.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((s, i) => s + (Number(i.totalAmount || i.amount) || 0), 0);

  const stats = {
    total: items.length,
    paid: items.filter(i => i.status === 'PAID').length,
    overdue: items.filter(i => i.status === 'OVERDUE').length,
    totalRevenue,
    outstanding,
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (item: Invoice) => {
    setEditItem(item);
    setForm({ customerName: item.customerName || '', jobNumber: item.jobNumber || '',
      amount: item.amount || '', tax: item.tax || '',
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
      status: item.status || 'DRAFT', notes: item.notes || '' });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.customerName) { setError('Customer name is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editItem) await api.put(`/invoices/${editItem.id}`, form);
      else await api.post('/invoices', form);
      setModalOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try { await api.delete(`/invoices/${deleteItem.id}`); setDeleteItem(null); await load(); }
    catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex min-h-screen"><Sidebar />
      <main className="flex-1 p-8"><div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div>
        <div className="h-64 bg-gray-200 rounded" />
      </div></main></div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-500 mt-1">Service invoices and billing management</p>
            </div>
            <button onClick={openCreate} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium">
              <Plus className="h-5 w-5" /> Create Invoice
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Invoices', value: stats.total, icon: FileText, bg: 'bg-sky-50', color: 'text-sky-600', border: 'border-sky-200' },
              { label: 'Paid', value: stats.paid, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-200' },
              { label: 'Overdue', value: stats.overdue, icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600', border: 'border-red-200' },
              { label: 'Revenue (Paid)', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, bg: 'bg-teal-50', color: 'text-teal-600', border: 'border-teal-200' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                      <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {stats.outstanding > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700"><span className="font-semibold">${stats.outstanding.toLocaleString()}</span> outstanding across sent and overdue invoices.</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search invoices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">All Statuses</option>
              {['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-sky-600" /> Invoices ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Invoice #</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Job</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Due Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(item => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-gray-500">{item.invoiceNumber || item.id?.slice(0, 8)}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{item.customerName || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.jobNumber || '-'}</td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            {(item.totalAmount || item.amount) ? `$${Number(item.totalAmount || item.amount).toLocaleString()}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status || ''] || 'bg-gray-100 text-gray-600'}`}>
                              {item.status || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => openEdit(item)} className="text-sky-600 hover:text-sky-800 text-xs font-medium">Edit</button>
                              <button onClick={() => setDeleteItem(item)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No invoices found</p>
                  <p className="text-sm mt-1">Create your first invoice to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Invoice' : 'Create Invoice'} size="lg">
        <div className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <input value={form.jobNumber} onChange={e => setForm(f => ({ ...f, jobNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Related job number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0.00" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax ($)</label>
              <input type="number" value={form.tax} onChange={e => setForm(f => ({ ...f, tax: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0.00" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Invoice notes or payment terms..." />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">
            {saving ? 'Saving...' : editItem ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Invoice" size="sm">
        <p className="text-sm text-gray-600">Delete invoice <span className="font-semibold">{deleteItem?.invoiceNumber}</span>? This action cannot be undone.</p>
        <ModalFooter>
          <button onClick={() => setDeleteItem(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
