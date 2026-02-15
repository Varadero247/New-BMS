'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, ClipboardCheck, Edit, Trash2, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Audit {
  id: string;
  title?: string;
  name?: string;
  type: string;
  scheduledDate?: string;
  completedDate?: string;
  auditor?: string;
  scope?: string;
  findings?: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const initialForm = { title: '', type: 'INTERNAL', scheduledDate: '', auditor: '', scope: '', status: 'SCHEDULED' };

export default function AuditsPage() {
  const [items, setItems] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Audit | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/audits${params}`);
      setItems(res.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(initialForm); setFormError(''); setModalOpen(true); }
  function openEdit(a: Audit) {
    setEditing(a);
    setForm({ title: a.title || a.name || '', type: a.type, scheduledDate: a.scheduledDate ? a.scheduledDate.split('T')[0] : '', auditor: a.auditor || '', scope: a.scope || '', status: a.status });
    setFormError(''); setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.title.trim()) { setFormError('Title is required'); return; }
    setSubmitting(true);
    try {
      const payload: any = { title: form.title, type: form.type, status: form.status };
      if (form.scheduledDate) payload.scheduledDate = form.scheduledDate;
      if (form.auditor) payload.auditor = form.auditor;
      if (form.scope) payload.scope = form.scope;
      if (editing) { await api.put(`/audits/${editing.id}`, payload); }
      else { await api.post('/audits', payload); }
      setModalOpen(false); load();
    } catch (e: any) { setFormError(e?.response?.data?.error?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this audit?')) return;
    try { await api.delete(`/audits/${id}`); load(); } catch { alert('Failed'); }
  }

  const filtered = items.filter(i => {
    const name = i.title || i.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Food Safety Audits</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Internal and external audit management</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Schedule Audit</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total</p><p className="text-2xl font-bold">{items.length}</p></div><ClipboardCheck className="h-8 w-8 text-orange-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p><p className="text-2xl font-bold text-blue-600">{items.filter(i => i.status === 'SCHEDULED').length}</p></div><Calendar className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p><p className="text-2xl font-bold text-yellow-600">{items.filter(i => i.status === 'IN_PROGRESS').length}</p></div><ClipboardCheck className="h-8 w-8 text-yellow-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Completed</p><p className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'COMPLETED').length}</p></div><ClipboardCheck className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        </div>

        {/* Filters */}
        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search audits..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-orange-600" />Audits ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}</div>
            : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Auditor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Scheduled</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{a.title || a.name}</p>
                          {a.scope && <p className="text-xs text-gray-500 dark:text-gray-400">{a.scope}</p>}
                        </td>
                        <td className="py-3 px-4"><Badge variant="outline">{a.type}</Badge></td>
                        <td className="py-3 px-4 text-gray-600">{a.auditor || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{a.scheduledDate ? new Date(a.scheduledDate).toLocaleDateString() : '—'}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[a.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{a.status.replace(/_/g,' ')}</span></td>
                        <td className="py-3 px-4"><div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No audits found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Schedule Audit</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Audit' : 'Schedule Audit'} size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{formError}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Audit Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
                <option value="REGULATORY">Regulatory</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="CERTIFICATION">Certification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Scheduled Date</label>
              <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Auditor</label>
              <input value={form.auditor} onChange={e => setForm({...form, auditor: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Scope</label>
            <textarea value={form.scope} onChange={e => setForm({...form, scope: e.target.value})}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Schedule'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
