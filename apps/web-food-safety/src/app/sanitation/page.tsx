'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Sparkles, Edit, Trash2, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface SanitationRecord {
  id: string;
  area?: string;
  zone?: string;
  procedure?: string;
  chemical?: string;
  concentration?: string;
  frequency?: string;
  method?: string;
  performedBy?: string;
  verifiedBy?: string;
  scheduledDate?: string;
  completedDate?: string;
  result?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const initialForm = {
  area: '', procedure: '', chemical: '', concentration: '', frequency: 'DAILY',
  method: '', performedBy: '', scheduledDate: '', notes: '', status: 'SCHEDULED',
};

export default function SanitationPage() {
  const [items, setItems] = useState<SanitationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SanitationRecord | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/sanitation${params}`);
      setItems(res.data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(initialForm); setFormError(''); setModalOpen(true); }
  function openEdit(r: SanitationRecord) {
    setEditing(r);
    setForm({
      area: r.area || r.zone || '',
      procedure: r.procedure || '',
      chemical: r.chemical || '',
      concentration: r.concentration || '',
      frequency: r.frequency || 'DAILY',
      method: r.method || '',
      performedBy: r.performedBy || '',
      scheduledDate: r.scheduledDate ? r.scheduledDate.split('T')[0] : '',
      notes: r.notes || '',
      status: r.status,
    });
    setFormError(''); setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.area.trim()) { setFormError('Area is required'); return; }
    setSubmitting(true);
    try {
      const payload: any = { area: form.area, frequency: form.frequency, status: form.status };
      if (form.procedure) payload.procedure = form.procedure;
      if (form.chemical) payload.chemical = form.chemical;
      if (form.concentration) payload.concentration = form.concentration;
      if (form.method) payload.method = form.method;
      if (form.performedBy) payload.performedBy = form.performedBy;
      if (form.scheduledDate) payload.scheduledDate = form.scheduledDate;
      if (form.notes) payload.notes = form.notes;
      if (editing) { await api.put(`/sanitation/${editing.id}`, payload); }
      else { await api.post('/sanitation', payload); }
      setModalOpen(false); load();
    } catch (e: any) { setFormError(e?.response?.data?.error?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this sanitation record?')) return;
    try { await api.delete(`/sanitation/${id}`); load(); } catch { alert('Failed'); }
  }

  const filtered = items.filter(i => {
    const area = i.area || i.zone || '';
    return area.toLowerCase().includes(search.toLowerCase()) || (i.procedure || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sanitation</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Cleaning and sanitation schedule management</p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Record</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p><p className="text-2xl font-bold">{items.length}</p></div><Sparkles className="h-8 w-8 text-orange-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p><p className="text-2xl font-bold text-blue-600">{items.filter(i => i.status === 'SCHEDULED').length}</p></div><Sparkles className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Completed</p><p className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'COMPLETED').length}</p></div><CheckCircle className="h-8 w-8 text-green-500" /></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">Overdue/Failed</p><p className="text-2xl font-bold text-red-600">{items.filter(i => i.status === 'OVERDUE' || i.status === 'FAILED').length}</p></div><Sparkles className="h-8 w-8 text-red-500" /></div></CardContent></Card>
        </div>

        {/* Filters */}
        <Card className="mb-6"><CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search by area or procedure..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-orange-600" />Sanitation Records ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}</div>
            : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Area / Zone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Procedure</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Chemical</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Frequency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Performed By</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Scheduled</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${r.status === 'OVERDUE' || r.status === 'FAILED' ? 'bg-red-50' : ''}`}>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{r.area || r.zone || '—'}</td>
                        <td className="py-3 px-4 text-gray-600">{r.procedure || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{r.chemical ? `${r.chemical}${r.concentration ? ` (${r.concentration})` : ''}` : '—'}</td>
                        <td className="py-3 px-4"><Badge variant="outline">{r.frequency || '—'}</Badge></td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{r.performedBy || '—'}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : '—'}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{r.status.replace(/_/g,' ')}</span></td>
                        <td className="py-3 px-4"><div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No sanitation records found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Record</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Sanitation Record' : 'Add Sanitation Record'} size="lg">
        <div className="space-y-4">
          {formError && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Area / Zone *</label>
              <input value={form.area} onChange={e => setForm({...form, area: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="e.g. Processing Area A" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Procedure</label>
              <input value={form.procedure} onChange={e => setForm({...form, procedure: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="SOP-SAN-001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chemical</label>
              <input value={form.chemical} onChange={e => setForm({...form, chemical: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="e.g. Sodium hypochlorite" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Concentration</label>
              <input value={form.concentration} onChange={e => setForm({...form, concentration: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" placeholder="e.g. 200 ppm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="AS_NEEDED">As Needed</option>
                <option value="AFTER_EACH_USE">After Each Use</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none">
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scheduled Date</label>
              <input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Performed By</label>
            <input value={form.performedBy} onChange={e => setForm({...form, performedBy: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes / Method</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none" />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
