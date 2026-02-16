'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, AlertTriangle, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface FMEA {
  id: string;
  fmeaNumber: string;
  title: string;
  fmeaType: string;
  product: string;
  status: string;
  version: string;
  owner: string;
  reviewDate: string;
  approvedBy: string;
  createdAt: string;
}

const FMEA_TYPES = ['DFMEA', 'PFMEA', 'SFMEA'];
const STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'RELEASED', 'OBSOLETE'];
const statusColor = (s: string) => s === 'APPROVED' || s === 'RELEASED' ? 'bg-green-100 text-green-700' : s === 'IN_REVIEW' ? 'bg-blue-100 text-blue-700' : s === 'OBSOLETE' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' : 'bg-yellow-100 text-yellow-700';
const typeColor = (t: string) => t === 'DFMEA' ? 'bg-orange-100 text-orange-700' : t === 'PFMEA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

const emptyForm = { title: '', fmeaType: 'PFMEA', product: '', status: 'DRAFT', version: '1.0', owner: '', reviewDate: '', approvedBy: '' };

export default function FMEAPage() {
  const [items, setItems] = useState<FMEA[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FMEA | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/fmea'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: FMEA) {
    setEditItem(item);
    setForm({ title: item.title, fmeaType: item.fmeaType, product: item.product || '', status: item.status, version: item.version || '1.0', owner: item.owner || '', reviewDate: item.reviewDate ? item.reviewDate.slice(0, 10) : '', approvedBy: item.approvedBy || '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/fmea/${editItem.id}`, form);
      else await api.post('/fmea', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/fmea/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || item.fmeaType === typeFilter;
    return matchSearch && matchType;
  });

  const stats = { total: items.length, dfmea: items.filter(i => i.fmeaType === 'DFMEA').length, pfmea: items.filter(i => i.fmeaType === 'PFMEA').length, approved: items.filter(i => i.status === 'APPROVED' || i.status === 'RELEASED').length };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">FMEA</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Failure Mode and Effects Analysis — DFMEA & PFMEA</p></div>
          <button onClick={openCreate} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus className="h-5 w-5" /> New FMEA</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total FMEAs', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'DFMEA', value: stats.dfmea, color: 'text-orange-700', bg: 'bg-orange-100' },
            { label: 'PFMEA', value: stats.pfmea, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Approved/Released', value: stats.approved, color: 'text-green-700', bg: 'bg-green-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><AlertTriangle className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search FMEAs..." placeholder="Search FMEAs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select aria-label="Filter by type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Types</option>{FMEA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-600" />FMEA Register ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">FMEA #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Version</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Review Date</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.fmeaNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.title}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColor(item.fmeaType)}`}>{item.fmeaType}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.product || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">{item.version}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.reviewDate ? new Date(item.reviewDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No FMEAs found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit FMEA' : 'New FMEA'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">FMEA Type</label><select value={form.fmeaType} onChange={e => setForm({...form, fmeaType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{FMEA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product/Part</label><input type="text" value={form.product} onChange={e => setForm({...form, product: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label><input type="text" value={form.version} onChange={e => setForm({...form, version: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Date</label><input type="date" value={form.reviewDate} onChange={e => setForm({...form, reviewDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approved By</label><input type="text" value={form.approvedBy} onChange={e => setForm({...form, approvedBy: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create FMEA'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete FMEA?</h2>
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
