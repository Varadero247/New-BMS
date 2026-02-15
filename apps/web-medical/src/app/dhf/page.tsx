'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, FolderOpen, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DHFRecord {
  id: string;
  dhfNumber: string;
  title: string;
  documentType: string;
  status: string;
  deviceName: string;
  revision: string;
  owner: string;
  approvedDate: string;
  description: string;
}

const DOC_TYPES = ['DESIGN_PLAN', 'DESIGN_INPUT', 'DESIGN_OUTPUT', 'DESIGN_REVIEW', 'VERIFICATION', 'VALIDATION', 'TRANSFER', 'CHANGE_CONTROL'];
const STATUSES = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'OBSOLETE'];
const statusColor = (s: string) => s === 'APPROVED' ? 'bg-green-100 text-green-700' : s === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-700' : s === 'OBSOLETE' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' : 'bg-yellow-100 text-yellow-700';
const typeColor = (t: string) => t === 'VERIFICATION' ? 'bg-teal-100 text-teal-700' : t === 'VALIDATION' ? 'bg-green-100 text-green-700' : t === 'DESIGN_REVIEW' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';

const emptyForm = { title: '', documentType: 'DESIGN_INPUT', status: 'DRAFT', deviceName: '', revision: '1.0', owner: '', approvedDate: '', description: '' };

export default function DHFPage() {
  const [items, setItems] = useState<DHFRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<DHFRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/dhf'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: DHFRecord) {
    setEditItem(item);
    setForm({ title: item.title, documentType: item.documentType, status: item.status, deviceName: item.deviceName || '', revision: item.revision || '1.0', owner: item.owner || '', approvedDate: item.approvedDate ? item.approvedDate.slice(0, 10) : '', description: item.description || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/dhf/${editItem.id}`, form);
      else await api.post('/dhf', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/dhf/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || item.documentType === typeFilter;
    return matchSearch && matchType;
  });

  const stats = { total: items.length, approved: items.filter(i => i.status === 'APPROVED').length, review: items.filter(i => i.status === 'UNDER_REVIEW').length, draft: items.filter(i => i.status === 'DRAFT').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Design History File</h1><p className="text-gray-500 dark:text-gray-400 mt-1">DHF — 21 CFR 820.30 design control documentation</p></div>
          <button onClick={openCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Document</button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Documents', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Approved', value: stats.approved, color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'Under Review', value: stats.review, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Draft', value: stats.draft, color: 'text-yellow-700', bg: 'bg-yellow-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><div className={`p-2 rounded-full ${s.bg}`}><FolderOpen className={`h-5 w-5 ${s.color}`} /></div></div></CardContent></Card>
          ))}
        </div>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search DHF documents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm"><option value="">All Types</option>{DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-teal-600" />DHF Documents ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">DHF #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Device</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Rev</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Owner</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Approved</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.dhfNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">{item.title}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColor(item.documentType)}`}>{item.documentType.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.deviceName || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.revision || '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.owner || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.approvedDate ? new Date(item.approvedDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-teal-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No DHF documents found</p></div>
            )}
          </CardContent>
        </Card>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-semibold">{editItem ? 'Edit DHF Document' : 'Add DHF Document'}</h2><button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label><select value={form.documentType} onChange={e => setForm({...form, documentType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{DOC_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name</label><input type="text" value={form.deviceName} onChange={e => setForm({...form, deviceName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Revision</label><input type="text" value={form.revision} onChange={e => setForm({...form, revision: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approved Date</label><input type="date" value={form.approvedDate} onChange={e => setForm({...form, approvedDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Document'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete DHF Document?</h2>
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
