'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, CheckSquare, Edit2, Trash2, Ban } from 'lucide-react';
import { api } from '@/lib/api';

interface Checklist {
  id: string;
  name: string;
  category: string;
  items: number;
  completedItems: number;
  assignedTo: string;
  asset: string;
  dueDate: string;
  description: string;
  status: string;
}

const statusColors: Record<string, string> = { PENDING: 'bg-gray-100 text-gray-700', IN_PROGRESS: 'bg-yellow-100 text-yellow-700', COMPLETED: 'bg-green-100 text-green-700', OVERDUE: 'bg-red-100 text-red-700' };
const EMPTY_FORM = { name: '', category: '', assignedTo: '', asset: '', dueDate: '', description: '', status: 'PENDING' };

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Checklist | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/checklists'); setChecklists(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const filtered = checklists.filter(c => {
    const matchesSearch = !searchTerm || JSON.stringify(c).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: checklists.length,
    pending: checklists.filter(c => c.status === 'PENDING').length,
    inProgress: checklists.filter(c => c.status === 'IN_PROGRESS').length,
    completed: checklists.filter(c => c.status === 'COMPLETED').length,
  };

  function openCreate() { setForm({ ...EMPTY_FORM }); setError(''); setCreateOpen(true); }
  function openEdit(c: Checklist) {
    setSelected(c);
    setForm({ name: c.name||'', category: c.category||'', assignedTo: c.assignedTo||'', asset: c.asset||'', dueDate: c.dueDate ? c.dueDate.slice(0,10) : '', description: c.description||'', status: c.status||'PENDING' });
    setError(''); setEditOpen(true);
  }
  function openDelete(c: Checklist) { setSelected(c); setDeleteOpen(true); }

  async function handleCreate() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try { await api.post('/checklists', form); setCreateOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to create'); } finally { setSaving(false); }
  }
  async function handleEdit() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try { await api.put(`/checklists/${selected!.id}`, form); setEditOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to update'); } finally { setSaving(false); }
  }
  async function handleDelete() {
    setSaving(true);
    try { await api.delete(`/checklists/${selected!.id}`); setDeleteOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to delete'); } finally { setSaving(false); }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Checklist name" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Safety, Maintenance" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Asset</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))} placeholder="Asset name/tag" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Technician name" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="PENDING">Pending</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Checklist description..." /></div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Checklists</h1><p className="text-gray-500 mt-1">Maintenance checklists and templates</p></div>
          <button onClick={openCreate} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Create Checklist</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending', value: stats.pending, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Completed', value: stats.completed, color: 'text-green-600', bg: 'bg-green-50' },
          ].map(card => (
            <Card key={card.label}><CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500">{card.label}</p><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p></div>
                <div className={`p-3 rounded-full ${card.bg}`}><CheckSquare className={`h-6 w-6 ${card.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <Card className="mb-6"><CardContent className="pt-5"><div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search checklists..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All Statuses</option><option value="PENDING">Pending</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select>
        </div></CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-amber-600" />Checklists ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">{['Name','Category','Asset','Progress','Assigned To','Due Date','Status','Actions'].map(h => <th key={h} className="text-left py-3 px-4 font-medium text-gray-500">{h}</th>)}</tr></thead>
                <tbody>{filtered.map(cl => {
                  const progress = cl.items ? Math.round((cl.completedItems / cl.items) * 100) : 0;
                  return (
                    <tr key={cl.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{cl.name}</td>
                      <td className="py-3 px-4 text-gray-600">{cl.category || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{cl.asset || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${progress}%` }} /></div>
                          <span className="text-xs text-gray-500">{cl.completedItems || 0}/{cl.items || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{cl.assignedTo || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{cl.dueDate ? new Date(cl.dueDate).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[cl.status] || 'bg-gray-100 text-gray-700'}`}>{cl.status?.replace(/_/g,' ')}</span></td>
                      <td className="py-3 px-4"><div className="flex items-center gap-2"><button onClick={() => openEdit(cl)} className="text-gray-400 hover:text-amber-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => openDelete(cl)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
                    </tr>
                  );
                })}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500"><CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-40" /><p className="font-medium">No checklists found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Checklist" size="lg"><FormFields /><ModalFooter><button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button><button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Create'}</button></ModalFooter></Modal>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Checklist" size="lg"><FormFields /><ModalFooter><button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button><button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></ModalFooter></Modal>
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Checklist" size="sm"><div className="flex items-start gap-3"><div className="flex-shrink-0 p-2 bg-red-100 rounded-full"><Ban className="h-5 w-5 text-red-600" /></div><p className="text-sm text-gray-700">Delete <span className="font-semibold">{selected?.name}</span>?</p></div><ModalFooter><button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button><button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button></ModalFooter></Modal>
    </div>
  );
}
