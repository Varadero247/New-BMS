'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, GitBranch, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface TraceabilityRecord {
  id: string;
  traceNumber: string;
  userNeed: string;
  designInput: string;
  designOutput: string;
  verificationMethod: string;
  validationMethod: string;
  status: string;
  deviceName: string;
  riskReference: string;
  owner: string;
}

const STATUSES = ['OPEN', 'LINKED', 'VERIFIED', 'VALIDATED', 'CLOSED'];
const statusColor = (s: string) => s === 'VALIDATED' || s === 'CLOSED' ? 'bg-green-100 text-green-700' : s === 'VERIFIED' ? 'bg-teal-100 text-teal-700' : s === 'LINKED' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

const emptyForm = { userNeed: '', designInput: '', designOutput: '', verificationMethod: '', validationMethod: '', status: 'OPEN', deviceName: '', riskReference: '', owner: '' };

export default function TraceabilityPage() {
  const [items, setItems] = useState<TraceabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TraceabilityRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/traceability'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: TraceabilityRecord) {
    setEditItem(item);
    setForm({ userNeed: item.userNeed, designInput: item.designInput || '', designOutput: item.designOutput || '', verificationMethod: item.verificationMethod || '', validationMethod: item.validationMethod || '', status: item.status, deviceName: item.deviceName || '', riskReference: item.riskReference || '', owner: item.owner || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/traceability/${editItem.id}`, form);
      else await api.post('/traceability', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/traceability/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: items.length, open: items.filter(i => i.status === 'OPEN').length, validated: items.filter(i => i.status === 'VALIDATED' || i.status === 'CLOSED').length, linked: items.filter(i => i.status === 'LINKED' || i.status === 'VERIFIED').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Design Traceability Matrix</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Requirement-to-verification traceability — ISO 13485 clause 7.3</p></div>
          <button onClick={openCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Link</button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Links', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Open', value: stats.open, color: 'text-yellow-700', bg: 'bg-yellow-100' },
            { label: 'Linked / Verified', value: stats.linked, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Validated', value: stats.validated, color: 'text-green-700', bg: 'bg-green-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><div className={`p-2 rounded-full ${s.bg}`}><GitBranch className={`h-5 w-5 ${s.color}`} /></div></div></CardContent></Card>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search traceability records..." placeholder="Search traceability records..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm"><option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-teal-600" />Traceability Matrix ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Trace #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">User Need</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Design Input</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Design Output</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Device</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.traceNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{item.userNeed}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate">{item.designInput || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate">{item.designOutput || '-'}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.deviceName || '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-teal-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><GitBranch className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No traceability records found</p></div>
            )}
          </CardContent>
        </Card>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-semibold">{editItem ? 'Edit Traceability Link' : 'Add Traceability Link'}</h2><button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Need *</label><input type="text" value={form.userNeed} onChange={e => setForm({...form, userNeed: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Design Input</label><input type="text" value={form.designInput} onChange={e => setForm({...form, designInput: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Design Output</label><input type="text" value={form.designOutput} onChange={e => setForm({...form, designOutput: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Method</label><input type="text" value={form.verificationMethod} onChange={e => setForm({...form, verificationMethod: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Validation Method</label><input type="text" value={form.validationMethod} onChange={e => setForm({...form, validationMethod: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name</label><input type="text" value={form.deviceName} onChange={e => setForm({...form, deviceName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Risk Reference</label><input type="text" value={form.riskReference} onChange={e => setForm({...form, riskReference: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.userNeed || saving} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Link'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Traceability Link?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
