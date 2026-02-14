'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Wrench, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface WorkOrder {
  id: string;
  woNumber: string;
  title: string;
  assetId: string;
  assetName: string;
  woType: string;
  priority: string;
  status: string;
  assignedTo: string;
  estimatedHours: number;
  actualHours: number;
  scheduledDate: string;
  completedDate: string;
  createdAt: string;
}

const WO_TYPES = ['SCHEDULED', 'UNSCHEDULED', 'INSPECTION', 'OVERHAUL', 'MODIFICATION', 'REPAIR'];
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'AOG'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETE', 'CANCELLED'];
const statusColor = (s: string) => s === 'COMPLETE' ? 'bg-green-100 text-green-700' : s === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : s === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-700' : s === 'CANCELLED' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700';
const priorityColor = (p: string) => p === 'AOG' ? 'bg-red-100 text-red-700' : p === 'HIGH' ? 'bg-orange-100 text-orange-700' : p === 'NORMAL' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600';

const emptyForm = { title: '', assetId: '', assetName: '', woType: 'SCHEDULED', priority: 'NORMAL', status: 'OPEN', assignedTo: '', estimatedHours: 0, actualHours: 0, scheduledDate: '', completedDate: '' };

export default function WorkOrdersPage() {
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<WorkOrder | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/workorders'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: WorkOrder) {
    setEditItem(item);
    setForm({ title: item.title, assetId: item.assetId || '', assetName: item.assetName || '', woType: item.woType, priority: item.priority, status: item.status, assignedTo: item.assignedTo || '', estimatedHours: item.estimatedHours || 0, actualHours: item.actualHours || 0, scheduledDate: item.scheduledDate ? item.scheduledDate.slice(0, 10) : '', completedDate: item.completedDate ? item.completedDate.slice(0, 10) : '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/workorders/${editItem.id}`, form);
      else await api.post('/workorders', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/workorders/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: items.length, open: items.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length, aog: items.filter(i => i.priority === 'AOG').length, complete: items.filter(i => i.status === 'COMPLETE').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">MRO Work Orders</h1><p className="text-gray-500 mt-1">Maintenance, Repair & Overhaul work order management</p></div>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-5 w-5" /> New Work Order</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Work Orders', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-100' },
            { label: 'Open / In Progress', value: stats.open, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'AOG Priority', value: stats.aog, color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'Complete', value: stats.complete, color: 'text-green-700', bg: 'bg-green-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><Wrench className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search work orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-indigo-600" />Work Orders ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">WO #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Asset</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Scheduled</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{item.woNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.assetName || '-'}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.woType.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColor(item.priority)}`}>{item.priority}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.assignedTo || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500"><Wrench className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No work orders found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit Work Order' : 'New Work Order'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label><input type="text" value={form.assetName} onChange={e => setForm({...form, assetName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Asset ID</label><input type="text" value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">WO Type</label><select value={form.woType} onChange={e => setForm({...form, woType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{WO_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label><input type="text" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours</label><input type="number" min="0" step="0.5" value={form.estimatedHours} onChange={e => setForm({...form, estimatedHours: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label><input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create Work Order'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Work Order?</h2>
            <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
