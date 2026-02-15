'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Code, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SoftwareRecord {
  id: string;
  swNumber: string;
  name: string;
  version: string;
  safetyClass: string;
  status: string;
  deviceName: string;
  language: string;
  anomalyCount: number;
  owner: string;
  releaseDate: string;
}

const SAFETY_CLASSES = ['CLASS_A', 'CLASS_B', 'CLASS_C'];
const STATUSES = ['DEVELOPMENT', 'TESTING', 'RELEASED', 'RETIRED', 'RECALLED'];
const statusColor = (s: string) => s === 'RELEASED' ? 'bg-green-100 text-green-700' : s === 'TESTING' ? 'bg-blue-100 text-blue-700' : s === 'RECALLED' ? 'bg-red-100 text-red-700' : s === 'RETIRED' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600' : 'bg-yellow-100 text-yellow-700';
const classColor = (c: string) => c === 'CLASS_A' ? 'bg-green-100 text-green-700' : c === 'CLASS_B' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';

const emptyForm = { name: '', version: '1.0.0', safetyClass: 'CLASS_B', status: 'DEVELOPMENT', deviceName: '', language: '', anomalyCount: 0, owner: '', releaseDate: '' };

export default function SoftwarePage() {
  const [items, setItems] = useState<SoftwareRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SoftwareRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/software'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: SoftwareRecord) {
    setEditItem(item);
    setForm({ name: item.name, version: item.version || '1.0.0', safetyClass: item.safetyClass, status: item.status, deviceName: item.deviceName || '', language: item.language || '', anomalyCount: item.anomalyCount || 0, owner: item.owner || '', releaseDate: item.releaseDate ? item.releaseDate.slice(0, 10) : '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/software/${editItem.id}`, form);
      else await api.post('/software', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/software/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = { total: items.length, released: items.filter(i => i.status === 'RELEASED').length, development: items.filter(i => i.status === 'DEVELOPMENT' || i.status === 'TESTING').length, anomalies: items.reduce((a, i) => a + (i.anomalyCount || 0), 0) };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Software of Unknown Provenance</h1><p className="text-gray-500 dark:text-gray-400 mt-1">IEC 62304 — medical device software lifecycle</p></div>
          <button onClick={openCreate} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Software</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total SW Items', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Released', value: stats.released, color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'In Development', value: stats.development, color: 'text-teal-700', bg: 'bg-teal-100' },
            { label: 'Total Anomalies', value: stats.anomalies, color: stats.anomalies > 0 ? 'text-orange-700' : 'text-gray-600', bg: stats.anomalies > 0 ? 'bg-orange-100' : 'bg-gray-100 dark:bg-gray-800' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><Code className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search software items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Code className="h-5 w-5 text-teal-600" />Software Items ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">SW #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Version</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Safety Class</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Device</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Anomalies</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Release</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.swNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.version}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${classColor(item.safetyClass)}`}>{item.safetyClass.replace(/_/g, ' ')}</span></td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.deviceName || '-'}</td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${item.anomalyCount > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{item.anomalyCount}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span></td>
                    <td className="py-3 px-4 text-gray-600">{item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : '-'}</td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-teal-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><Code className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No software items found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit Software' : 'Add Software'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label><input type="text" value={form.version} onChange={e => setForm({...form, version: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label><input type="text" placeholder="e.g. Python, C++" value={form.language} onChange={e => setForm({...form, language: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Safety Class (IEC 62304)</label><select value={form.safetyClass} onChange={e => setForm({...form, safetyClass: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{SAFETY_CLASSES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Device Name</label><input type="text" value={form.deviceName} onChange={e => setForm({...form, deviceName: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Known Anomalies</label><input type="number" min={0} value={form.anomalyCount} onChange={e => setForm({...form, anomalyCount: parseInt(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Release Date</label><input type="date" value={form.releaseDate} onChange={e => setForm({...form, releaseDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.name || saving} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Software'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Software Item?</h2>
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
