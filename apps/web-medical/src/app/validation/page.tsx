'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, FlaskConical, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ValidationRecord {
  id: string;
  valNumber: string;
  title: string;
  valMethod: string;
  status: string;
  deviceName: string;
  userNeed: string;
  protocol: string;
  acceptanceCriteria: string;
  clinicalRef: string;
  owner: string;
  executedDate: string;
  approvedDate: string;
}

const VAL_METHODS = ['SIMULATED_USE', 'CLINICAL_EVALUATION', 'USABILITY_STUDY', 'BENCH_TEST', 'ANIMAL_STUDY', 'LITERATURE_REVIEW'];
const STATUSES = ['PLANNED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONALLY_PASSED', 'WAIVED'];
const statusColor = (s: string) =>
  s === 'PASSED' ? 'bg-green-100 text-green-700' :
  s === 'FAILED' ? 'bg-red-100 text-red-700' :
  s === 'CONDITIONALLY_PASSED' ? 'bg-orange-100 text-orange-700' :
  s === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
  s === 'WAIVED' ? 'bg-gray-100 text-gray-600' :
  'bg-yellow-100 text-yellow-700';

const emptyForm = { title: '', valMethod: 'SIMULATED_USE', status: 'PLANNED', deviceName: '', userNeed: '', protocol: '', acceptanceCriteria: '', clinicalRef: '', owner: '', executedDate: '', approvedDate: '' };

export default function ValidationPage() {
  const [items, setItems] = useState<ValidationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ValidationRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/validation'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: ValidationRecord) {
    setEditItem(item);
    setForm({ title: item.title, valMethod: item.valMethod, status: item.status, deviceName: item.deviceName || '', userNeed: item.userNeed || '', protocol: item.protocol || '', acceptanceCriteria: item.acceptanceCriteria || '', clinicalRef: item.clinicalRef || '', owner: item.owner || '', executedDate: item.executedDate ? item.executedDate.slice(0, 10) : '', approvedDate: item.approvedDate ? item.approvedDate.slice(0, 10) : '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/validation/${editItem.id}`, form);
      else await api.post('/validation', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/validation/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: items.length,
    passed: items.filter(i => i.status === 'PASSED').length,
    failed: items.filter(i => i.status === 'FAILED').length,
    planned: items.filter(i => i.status === 'PLANNED' || i.status === 'IN_PROGRESS').length,
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900">Design Validation</h1><p className="text-gray-500 mt-1">ISO 13485 clause 7.3.7 — device meets user needs under intended conditions</p></div>
          <button onClick={openCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Validation</button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-100' },
            { label: 'Passed', value: stats.passed, color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'Failed', value: stats.failed, color: 'text-red-700', bg: 'bg-red-100' },
            { label: 'Planned / In Progress', value: stats.planned, color: 'text-teal-700', bg: 'bg-teal-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><div className={`p-2 rounded-full ${s.bg}`}><FlaskConical className={`h-5 w-5 ${s.color}`} /></div></div></CardContent></Card>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search validation records..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm"><option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical className="h-5 w-5 text-teal-600" />Validation Records ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Val #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Device</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Executed</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{item.valNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.valMethod.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.deviceName || '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.owner || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.executedDate ? new Date(item.executedDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-teal-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500"><FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No validation records found</p></div>
            )}
          </CardContent>
        </Card>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-semibold">{editItem ? 'Edit Validation' : 'Add Validation'}</h2><button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">User Need Reference</label><input type="text" value={form.userNeed} onChange={e => setForm({...form, userNeed: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Method</label><select value={form.valMethod} onChange={e => setForm({...form, valMethod: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{VAL_METHODS.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Validation Protocol</label><input type="text" value={form.protocol} onChange={e => setForm({...form, protocol: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Criteria</label><textarea value={form.acceptanceCriteria} onChange={e => setForm({...form, acceptanceCriteria: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Clinical Evaluation Reference</label><input type="text" value={form.clinicalRef} onChange={e => setForm({...form, clinicalRef: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Device Name</label><input type="text" value={form.deviceName} onChange={e => setForm({...form, deviceName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Executed Date</label><input type="date" value={form.executedDate} onChange={e => setForm({...form, executedDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Approved Date</label><input type="date" value={form.approvedDate} onChange={e => setForm({...form, approvedDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Validation'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Validation Record?</h2>
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
