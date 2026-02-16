'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, BarChart3, TrendingUp, TrendingDown, Minus, Edit2, Trash2, Target, Ban } from 'lucide-react';
import { api } from '@/lib/api';

interface KPI {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  target: number;
  trend: string;
  period: string;
  description: string;
  owner: string;
  status: string;
}

const EMPTY_FORM = {
  name: '', category: 'RELIABILITY', value: '', unit: '', target: '',
  trend: 'STABLE', period: 'MONTHLY', description: '', owner: '', status: 'ACTIVE',
};

function getPerformanceColor(value: number, target: number): { bar: string; text: string; label: string } {
  if (!target) return { bar: 'bg-gray-400', text: 'text-gray-600', label: 'N/A' };
  const pct = (value / target) * 100;
  if (pct >= 95) return { bar: 'bg-green-500', text: 'text-green-700', label: 'On Track' };
  if (pct >= 75) return { bar: 'bg-amber-500', text: 'text-amber-700', label: 'At Risk' };
  return { bar: 'bg-red-500', text: 'text-red-700', label: 'Behind' };
}

export default function KPIsPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<KPI | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await api.get('/kpis'); setKpis(res.data.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }

  const filtered = kpis.filter(k => {
    const matchesSearch = !searchTerm || JSON.stringify(k).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || k.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const onTrack = kpis.filter(k => k.target && (k.value / k.target) >= 0.95).length;
  const atRisk = kpis.filter(k => k.target && (k.value / k.target) >= 0.75 && (k.value / k.target) < 0.95).length;
  const behind = kpis.filter(k => k.target && (k.value / k.target) < 0.75).length;

  function openCreate() { setForm({ ...EMPTY_FORM }); setError(''); setCreateOpen(true); }
  function openEdit(k: KPI) {
    setSelected(k);
    setForm({
      name: k.name || '', category: k.category || 'RELIABILITY',
      value: k.value?.toString() || '', unit: k.unit || '',
      target: k.target?.toString() || '', trend: k.trend || 'STABLE',
      period: k.period || 'MONTHLY', description: k.description || '',
      owner: k.owner || '', status: k.status || 'ACTIVE',
    });
    setError(''); setEditOpen(true);
  }
  function openDelete(k: KPI) { setSelected(k); setDeleteOpen(true); }

  async function handleCreate() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/kpis', { ...form, value: parseFloat(form.value) || 0, target: parseFloat(form.target) || 0 });
      setCreateOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.error || 'Failed to create'); } finally { setSaving(false); }
  }
  async function handleEdit() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      await api.put(`/kpis/${selected!.id}`, { ...form, value: parseFloat(form.value) || 0, target: parseFloat(form.target) || 0 });
      setEditOpen(false); await load();
    } catch (e: any) { setError(e?.response?.data?.error || 'Failed to update'); } finally { setSaving(false); }
  }
  async function handleDelete() {
    setSaving(true);
    try { await api.delete(`/kpis/${selected!.id}`); setDeleteOpen(false); await load(); }
    catch (e: any) { setError(e?.response?.data?.error || 'Failed to delete'); } finally { setSaving(false); }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="KPI name" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="RELIABILITY">Reliability</option><option value="MAINTENANCE">Maintenance</option><option value="COST">Cost</option><option value="SAFETY">Safety</option><option value="AVAILABILITY">Availability</option><option value="PERFORMANCE">Performance</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
            <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="QUARTERLY">Quarterly</option><option value="ANNUAL">Annual</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Value</label><input type="number" step="any" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="0" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label><input type="number" step="any" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="0" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="%, h, $, ..." /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trend</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.trend} onChange={e => setForm(f => ({ ...f, trend: e.target.value }))}>
            <option value="UP">Up</option><option value="DOWN">Down</option><option value="STABLE">Stable</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label><input className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} placeholder="KPI owner name" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="KPI description and measurement method..." /></div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">KPIs</h1><p className="text-gray-500 dark:text-gray-400 mt-1">Key performance indicators for maintenance operations</p></div>
          <button onClick={openCreate} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="h-5 w-5" /> Add KPI</button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total KPIs', value: kpis.length, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'On Track', value: onTrack, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'At Risk', value: atRisk, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Behind Target', value: behind, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <Card key={card.label}><CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p></div>
                  <div className={`p-3 rounded-full ${card.bg}`}><Icon className={`h-6 w-6 ${card.color}`} /></div>
                </div>
              </CardContent></Card>
            );
          })}
        </div>

        <Card className="mb-6"><CardContent className="pt-5"><div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" /><input type="text" aria-label="Search KPIs..." placeholder="Search KPIs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          <select aria-label="Filter by category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm"><option value="">All Categories</option><option value="RELIABILITY">Reliability</option><option value="MAINTENANCE">Maintenance</option><option value="COST">Cost</option><option value="SAFETY">Safety</option><option value="AVAILABILITY">Availability</option><option value="PERFORMANCE">Performance</option></select>
        </div></CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-600" />KPIs ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b">{['Name','Category','Progress','Value','Target','Trend','Period','Owner','Actions'].map(h => <th key={h} className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">{h}</th>)}</tr></thead>
                <tbody>{filtered.map(kpi => {
                  const perf = getPerformanceColor(kpi.value, kpi.target);
                  const pct = kpi.target ? Math.min(Math.round((kpi.value / kpi.target) * 100), 100) : 0;
                  return (
                    <tr key={kpi.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{kpi.name}</div>
                        {kpi.description && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[200px]">{kpi.description}</div>}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{kpi.category}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-2 rounded-full ${perf.bar}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${perf.text}`}>{pct}%</span>
                        </div>
                        <span className={`text-xs font-medium ${perf.text}`}>{perf.label}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{kpi.value} {kpi.unit}</td>
                      <td className="py-3 px-4 text-gray-600">{kpi.target} {kpi.unit}</td>
                      <td className="py-3 px-4">
                        {kpi.trend === 'UP' && <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><TrendingUp className="h-3 w-3" />Up</span>}
                        {kpi.trend === 'DOWN' && <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium"><TrendingDown className="h-3 w-3" />Down</span>}
                        {kpi.trend === 'STABLE' && <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs font-medium"><Minus className="h-3 w-3" />Stable</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{kpi.period}</td>
                      <td className="py-3 px-4 text-gray-600">{kpi.owner || '-'}</td>
                      <td className="py-3 px-4"><div className="flex items-center gap-2"><button onClick={() => openEdit(kpi)} className="text-gray-400 dark:text-gray-500 hover:text-amber-600"><Edit2 className="h-4 w-4" /></button><button onClick={() => openDelete(kpi)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></td>
                    </tr>
                  );
                })}</tbody>
              </table></div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400"><BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-40" /><p className="font-medium">No KPIs found</p><p className="text-sm mt-1">Add your first KPI to start tracking performance</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add KPI" size="lg"><FormFields /><ModalFooter><button onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Add KPI'}</button></ModalFooter></Modal>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit KPI" size="lg"><FormFields /><ModalFooter><button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleEdit} disabled={saving} className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button></ModalFooter></Modal>
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete KPI" size="sm"><div className="flex items-start gap-3"><div className="flex-shrink-0 p-2 bg-red-100 rounded-full"><Ban className="h-5 w-5 text-red-600" /></div><p className="text-sm text-gray-700 dark:text-gray-300">Delete KPI <span className="font-semibold">{selected?.name}</span>? This cannot be undone.</p></div><ModalFooter><button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800">Cancel</button><button onClick={handleDelete} disabled={saving} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{saving ? 'Deleting...' : 'Delete'}</button></ModalFooter></Modal>
    </div>
  );
}
