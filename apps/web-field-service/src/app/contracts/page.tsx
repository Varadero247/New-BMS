'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, ScrollText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Contract {
  id: string;
  name?: string;
  title?: string;
  customerName?: string;
  type?: string;
  contractType?: string;
  startDate?: string;
  expiresAt?: string;
  endDate?: string;
  value?: number;
  slaHours?: number;
  status?: string;
  notes?: string;
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
  EXPIRING_SOON: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  TERMINATED: 'bg-red-100 text-red-800',
};

const emptyForm = {
  name: '', customerName: '', type: 'SERVICE_AGREEMENT', startDate: '', expiresAt: '',
  value: '', slaHours: '4', status: 'ACTIVE', notes: '',
};

export default function ContractsPage() {
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Contract | null>(null);
  const [deleteItem, setDeleteItem] = useState<Contract | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try { const r = await api.get('/contracts'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const q = searchTerm.toLowerCase();
    return (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!statusFilter || i.status === statusFilter);
  });

  const totalValue = items.filter(i => i.status === 'ACTIVE').reduce((s, i) => s + (Number(i.value) || 0), 0);
  const stats = {
    total: items.length,
    active: items.filter(i => i.status === 'ACTIVE').length,
    expiringSoon: items.filter(i => i.status === 'EXPIRING_SOON').length,
    expired: items.filter(i => i.status === 'EXPIRED').length,
    totalValue,
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setError(''); setModalOpen(true); };
  const openEdit = (item: Contract) => {
    setEditItem(item);
    setForm({ name: item.name || item.title || '', customerName: item.customerName || '',
      type: item.type || item.contractType || 'SERVICE_AGREEMENT',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      expiresAt: (item.expiresAt || item.endDate) ? (item.expiresAt || item.endDate)!.split('T')[0] : '',
      value: item.value || '', slaHours: item.slaHours || '4',
      status: item.status || 'ACTIVE', notes: item.notes || '' });
    setError(''); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.customerName) { setError('Name and customer are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editItem) await api.put(`/contracts/${editItem.id}`, form);
      else await api.post('/contracts', form);
      setModalOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try { await api.delete(`/contracts/${deleteItem.id}`); setDeleteItem(null); await load(); }
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
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contracts</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Service contracts and SLA management</p>
            </div>
            <button onClick={openCreate} className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium">
              <Plus className="h-5 w-5" /> New Contract
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Contracts', value: stats.active, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-200' },
              { label: 'Expiring Soon', value: stats.expiringSoon, icon: Clock, bg: 'bg-yellow-50', color: 'text-yellow-600', border: 'border-yellow-200' },
              { label: 'Expired', value: stats.expired, icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600', border: 'border-red-200' },
              { label: 'Active Value', value: `$${stats.totalValue.toLocaleString()}`, icon: ScrollText, bg: 'bg-sky-50', color: 'text-sky-600', border: 'border-sky-200' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div><p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p></div>
                      <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search contracts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option value="">All Statuses</option>
              {['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'DRAFT', 'TERMINATED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ScrollText className="h-5 w-5 text-sky-600" /> Contracts ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Contract Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">Value</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">SLA</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Expires</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(item => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.name || item.title || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.customerName || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{(item.type || item.contractType || '-').replace('_', ' ')}</td>
                          <td className="py-3 px-4 text-right font-medium">{item.value ? `$${Number(item.value).toLocaleString()}` : '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.slaHours ? `${item.slaHours}h` : '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{(item.expiresAt || item.endDate) ? new Date(item.expiresAt || item.endDate).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                              {item.status?.replace('_', ' ') || '-'}
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
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No contracts found</p>
                  <p className="text-sm mt-1">Create your first service contract to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Contract' : 'New Contract'} size="lg">
        <div className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. Annual Maintenance Agreement" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
              <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {['SERVICE_AGREEMENT', 'MAINTENANCE', 'SLA', 'TIME_AND_MATERIALS', 'FIXED_PRICE'].map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Value ($)</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="0.00" min="0" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SLA Response (hrs)</label>
              <input type="number" value={form.slaHours} onChange={e => setForm(f => ({ ...f, slaHours: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="4" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                {['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'DRAFT', 'TERMINATED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Contract terms and notes..." />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50">
            {saving ? 'Saving...' : editItem ? 'Update Contract' : 'Create Contract'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Contract" size="sm">
        <p className="text-sm text-gray-600">Delete <span className="font-semibold">{deleteItem?.name || deleteItem?.title}</span>? This action cannot be undone.</p>
        <ModalFooter>
          <button onClick={() => setDeleteItem(null)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
