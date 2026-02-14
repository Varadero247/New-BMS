'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Receipt, CheckCircle, Clock, AlertTriangle, DollarSign, Zap, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Bill {
  id: string;
  provider: string;
  energyType: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  amount: number;
  currency?: string;
  usage?: number;
  unit?: string;
  status: string;
  dueDate?: string;
  invoiceNumber?: string;
  notes?: string;
}

const ENERGY_TYPES = ['ELECTRICITY', 'GAS', 'WATER', 'HEAT', 'OIL', 'OTHER'];
const STATUS_OPTIONS = ['UNPAID', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED'];

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  UNPAID: { label: 'Unpaid', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  OVERDUE: { label: 'Overdue', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
  DISPUTED: { label: 'Disputed', className: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500', icon: Clock },
};

const empty: Partial<Bill> = { provider: '', energyType: 'ELECTRICITY', amount: 0, currency: 'USD', usage: 0, unit: 'kWh', status: 'UNPAID', invoiceNumber: '', notes: '' };

export default function BillsPage() {
  const [items, setItems] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Bill>>(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const load = async () => {
    try { const r = await api.get('/bills'); setItems(r.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    const m = JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase());
    const ms = !filterStatus || i.status === filterStatus;
    const mt = !filterType || i.energyType === filterType;
    return m && ms && mt;
  });

  const totalPaid = items.filter(i => i.status === 'PAID').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalUnpaid = items.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const stats = {
    total: items.length,
    paid: items.filter(i => i.status === 'PAID').length,
    overdue: items.filter(i => i.status === 'OVERDUE').length,
    totalPaid,
    totalUnpaid,
  };

  const openCreate = () => { setEditItem({ ...empty }); setIsEditing(false); setModalOpen(true); };
  const openEdit = (item: Bill) => {
    setEditItem({
      ...item,
      billingPeriodStart: item.billingPeriodStart ? new Date(item.billingPeriodStart).toISOString().slice(0, 10) : '',
      billingPeriodEnd: item.billingPeriodEnd ? new Date(item.billingPeriodEnd).toISOString().slice(0, 10) : '',
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : '',
    });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEditing && editItem.id) { await api.put(`/bills/${editItem.id}`, editItem); }
      else { await api.post('/bills', editItem); }
      setModalOpen(false); await load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/bills/${deleteId}`); setDeleteModal(false); await load(); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Energy Bills</h1>
            <p className="text-gray-500 mt-1">Utility billing and cost tracking</p>
          </div>
          <button onClick={openCreate} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Add Bill
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Bills</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div><div className="p-3 bg-yellow-50 rounded-full"><Receipt className="h-6 w-6 text-yellow-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Paid</p><p className="text-2xl font-bold text-green-700">{stats.paid}</p></div><div className="p-3 bg-green-50 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Amount Paid</p><p className="text-2xl font-bold text-emerald-700">${totalPaid.toLocaleString()}</p></div><div className="p-3 bg-emerald-50 rounded-full"><DollarSign className="h-6 w-6 text-emerald-600" /></div></div></CardContent></Card>
          <Card><CardContent className="pt-5"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Outstanding</p><p className="text-2xl font-bold text-red-700">${totalUnpaid.toLocaleString()}</p></div><div className="p-3 bg-red-50 rounded-full"><AlertTriangle className="h-6 w-6 text-red-600" /></div></div></CardContent></Card>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search bills..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Types</option>
            {ENERGY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-yellow-600" />Bills ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Provider</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Invoice No.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Usage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Due</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(item => {
                      const sc = statusConfig[item.status] || statusConfig.UNPAID;
                      const Icon = sc.icon;
                      return (
                        <tr key={item.id} className="border-b hover:bg-yellow-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.provider}</td>
                          <td className="py-3 px-4"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">{item.energyType}</span></td>
                          <td className="py-3 px-4 text-gray-500 font-mono text-xs">{item.invoiceNumber || '-'}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {item.billingPeriodStart ? new Date(item.billingPeriodStart).toLocaleDateString() : '-'}{item.billingPeriodEnd ? ` – ${new Date(item.billingPeriodEnd).toLocaleDateString()}` : ''}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">${Number(item.amount).toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-mono text-gray-600">{item.usage ? `${Number(item.usage).toLocaleString()} ${item.unit || ''}` : '-'}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}</td>
                          <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.className}`}><Icon className="h-3 w-3" />{sc.label}</span></td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-yellow-100 text-yellow-700"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => { setDeleteId(item.id); setDeleteModal(true); }} className="p-1.5 rounded hover:bg-red-100 text-red-600"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No bills found</p>
                <p className="text-sm mt-1">Add your first energy bill to track costs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? 'Edit Bill' : 'Add Energy Bill'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
              <input value={editItem.provider || ''} onChange={e => setEditItem(p => ({ ...p, provider: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. National Grid" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energy Type</label>
              <select value={editItem.energyType || 'ELECTRICITY'} onChange={e => setEditItem(p => ({ ...p, energyType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {ENERGY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input value={editItem.invoiceNumber || ''} onChange={e => setEditItem(p => ({ ...p, invoiceNumber: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={editItem.dueDate || ''} onChange={e => setEditItem(p => ({ ...p, dueDate: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period Start</label>
              <input type="date" value={editItem.billingPeriodStart || ''} onChange={e => setEditItem(p => ({ ...p, billingPeriodStart: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period End</label>
              <input type="date" value={editItem.billingPeriodEnd || ''} onChange={e => setEditItem(p => ({ ...p, billingPeriodEnd: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input type="number" step="0.01" value={editItem.amount || ''} onChange={e => setEditItem(p => ({ ...p, amount: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage</label>
              <input type="number" value={editItem.usage || ''} onChange={e => setEditItem(p => ({ ...p, usage: Number(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input value={editItem.unit || ''} onChange={e => setEditItem(p => ({ ...p, unit: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="kWh" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={editItem.status || 'UNPAID'} onChange={e => setEditItem(p => ({ ...p, status: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={editItem.notes || ''} onChange={e => setEditItem(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
        </div>
        <ModalFooter>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !editItem.provider} className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {isEditing ? 'Save Changes' : 'Add Bill'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Bill" size="sm">
        <p className="text-gray-600 text-sm">Are you sure you want to delete this bill?</p>
        <ModalFooter>
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
