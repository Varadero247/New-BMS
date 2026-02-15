'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, TrendingUp, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SPCChart {
  id: string;
  chartNumber: string;
  title: string;
  characteristic: string;
  partNumber: string;
  chartType: string;
  status: string;
  cpk: number;
  ppk: number;
  sampleSize: number;
  frequency: string;
  owner: string;
  lastUpdated: string;
  createdAt: string;
}

const CHART_TYPES = ['X_BAR_R', 'X_BAR_S', 'I_MR', 'P_CHART', 'NP_CHART', 'C_CHART', 'U_CHART'];
const STATUSES = ['ACTIVE', 'SUSPENDED', 'ARCHIVED'];
const FREQUENCIES = ['HOURLY', 'SHIFT', 'DAILY', 'WEEKLY', 'PER_BATCH'];
const statusColor = (s: string) => s === 'ACTIVE' ? 'bg-green-100 text-green-700' : s === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600';
const cpkColor = (c: number) => c >= 1.67 ? 'text-green-700' : c >= 1.33 ? 'text-blue-700' : c >= 1.0 ? 'text-yellow-700' : 'text-red-700';

const emptyForm = { title: '', characteristic: '', partNumber: '', chartType: 'X_BAR_R', status: 'ACTIVE', cpk: 0, ppk: 0, sampleSize: 5, frequency: 'SHIFT', owner: '', lastUpdated: '' };

export default function SPCPage() {
  const [items, setItems] = useState<SPCChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SPCChart | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/spc'); setItems(res.data.data || []); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  function openCreate() { setEditItem(null); setForm(emptyForm); setModalOpen(true); }
  function openEdit(item: SPCChart) {
    setEditItem(item);
    setForm({ title: item.title, characteristic: item.characteristic || '', partNumber: item.partNumber || '', chartType: item.chartType, status: item.status, cpk: item.cpk || 0, ppk: item.ppk || 0, sampleSize: item.sampleSize || 5, frequency: item.frequency || 'SHIFT', owner: item.owner || '', lastUpdated: item.lastUpdated ? item.lastUpdated.slice(0, 10) : '' });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/spc/${editItem.id}`, form);
      else await api.post('/spc', form);
      setModalOpen(false); load();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    try { await api.delete(`/spc/${id}`); load(); } catch (e) { console.error(e); } finally { setDeleteId(null); }
  }

  const filtered = items.filter(item => {
    const matchSearch = !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const capable = items.filter(i => (i.cpk || 0) >= 1.33);
  const avgCpk = items.length > 0 ? (items.reduce((acc, i) => acc + (i.cpk || 0), 0) / items.length).toFixed(2) : '0.00';
  const stats = { total: items.length, active: items.filter(i => i.status === 'ACTIVE').length, capable: capable.length, avgCpk };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SPC Charts</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Statistical Process Control — capability monitoring</p></div>
          <button onClick={openCreate} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"><Plus className="h-5 w-5" /> New SPC Chart</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Charts', value: stats.total, color: 'text-gray-900 dark:text-gray-100', bg: 'bg-gray-100 dark:bg-gray-800' },
            { label: 'Active', value: stats.active, color: 'text-blue-700', bg: 'bg-blue-100' },
            { label: 'Capable (Cpk≥1.33)', value: stats.capable, color: 'text-green-700', bg: 'bg-green-100' },
            { label: 'Avg Cpk', value: stats.avgCpk, color: cpkColor(parseFloat(String(stats.avgCpk))), bg: 'bg-orange-100' },
          ].map(s => (
            <Card key={s.label}><CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div>
                <div className={`p-2 rounded-full ${s.bg}`}><TrendingUp className={`h-5 w-5 ${s.color}`} /></div>
              </div>
            </CardContent></Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" placeholder="Search SPC charts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm" /></div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-orange-600" />SPC Charts ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Chart #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Characteristic</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Cpk</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Ppk</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr></thead>
                <tbody>{filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                    <td className="py-3 px-4 font-mono text-xs">{item.chartNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{item.title}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs max-w-xs truncate">{item.characteristic || '-'}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.chartType.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-center"><span className={`font-bold text-sm ${cpkColor(item.cpk || 0)}`}>{item.cpk != null ? item.cpk.toFixed(2) : '-'}</span></td>
                    <td className="py-3 px-4 text-center"><span className={`font-bold text-sm ${cpkColor(item.ppk || 0)}`}>{item.ppk != null ? item.ppk.toFixed(2) : '-'}</span></td>
                    <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}>{item.status}</span></td>
                    <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" /><p>No SPC charts found</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{editItem ? 'Edit SPC Chart' : 'New SPC Chart'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Characteristic</label><input type="text" value={form.characteristic} onChange={e => setForm({...form, characteristic: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part Number</label><input type="text" value={form.partNumber} onChange={e => setForm({...form, partNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chart Type</label><select value={form.chartType} onChange={e => setForm({...form, chartType: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{CHART_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cpk</label><input type="number" step="0.01" value={form.cpk} onChange={e => setForm({...form, cpk: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ppk</label><input type="number" step="0.01" value={form.ppk} onChange={e => setForm({...form, ppk: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Size</label><input type="number" min="1" value={form.sampleSize} onChange={e => setForm({...form, sampleSize: parseInt(e.target.value) || 5})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label><select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{FREQUENCIES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input type="text" value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={!form.title || saving} className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">{saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create Chart'}</button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete SPC Chart?</h2>
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
