'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, Modal } from '@ims/ui';
import { BarChart3, TrendingUp, TrendingDown, Minus, Filter, Leaf, Users, Shield, Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Metric {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  target: number;
  previousPeriod?: number;
  trend?: string;
  framework?: string;
  disclosure?: string;
  status: string;
  period?: string;
  description?: string;
}

type FormData = Omit<Metric, 'id'>;

const categoryConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  ENVIRONMENTAL: { label: 'Environmental', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200', icon: <Leaf className="h-5 w-5" /> },
  SOCIAL: { label: 'Social', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200', icon: <Users className="h-5 w-5" /> },
  GOVERNANCE: { label: 'Governance', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200', icon: <Shield className="h-5 w-5" /> },
};

const categoryBadge: Record<string, string> = {
  ENVIRONMENTAL: 'bg-green-100 text-green-700',
  SOCIAL: 'bg-blue-100 text-blue-700',
  GOVERNANCE: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  ON_TRACK: 'bg-green-100 text-green-700',
  AT_RISK: 'bg-amber-100 text-amber-700',
  OFF_TRACK: 'bg-red-100 text-red-700',
};

const empty: FormData = {
  name: '',
  category: 'ENVIRONMENTAL',
  value: 0,
  unit: '',
  target: 0,
  previousPeriod: 0,
  trend: 'STABLE',
  framework: 'GRI',
  disclosure: '',
  status: 'ON_TRACK',
  period: '',
  description: '',
};

export default function MetricsDashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Metric | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadMetrics(); }, []);

  async function loadMetrics() {
    try {
      const res = await api.get('/metrics');
      setMetrics(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(empty); setModalOpen(true); }
  function openEdit(m: Metric) {
    setEditing(m);
    setForm({ name: m.name, category: m.category, value: m.value, unit: m.unit, target: m.target, previousPeriod: m.previousPeriod || 0, trend: m.trend || 'STABLE', framework: m.framework || 'GRI', disclosure: m.disclosure || '', status: m.status, period: m.period || '', description: m.description || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/metrics/${editing.id}`, form);
        setMetrics(prev => prev.map(m => m.id === editing.id ? res.data.data : m));
      } else {
        const res = await api.post('/metrics', form);
        setMetrics(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/metrics/${id}`);
      setMetrics(prev => prev.filter(m => m.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  }

  const filtered = metrics.filter(m => {
    const matchesCat = !categoryFilter || m.category === categoryFilter;
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  const onTrack = metrics.filter(m => m.status === 'ON_TRACK').length;
  const atRisk = metrics.filter(m => m.status === 'AT_RISK').length;
  const offTrack = metrics.filter(m => m.status === 'OFF_TRACK').length;
  const overallScore = metrics.length > 0 ? Math.round((onTrack / metrics.length) * 100) : 0;

  const TrendIcon = ({ trend }: { trend?: string }) => {
    if (trend === 'UP') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'DOWN') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
  };

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ESG Metrics Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Key performance indicators across Environmental, Social and Governance dimensions</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors text-sm">
          <Plus className="h-4 w-4" /> Add Metric
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">ESG Score</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{overallScore}%</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">metrics on track</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Metrics</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{metrics.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 uppercase font-medium">On Track</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{onTrack}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-600 uppercase font-medium">At Risk</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{atRisk}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 uppercase font-medium">Off Track</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{offTrack}</p>
        </div>
      </div>

      {/* Category Overview — clickable filter */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']).map(cat => {
            const catMetrics = metrics.filter(m => m.category === cat);
            if (catMetrics.length === 0) return null;
            const catOnTrack = catMetrics.filter(m => m.status === 'ON_TRACK').length;
            const cfg = categoryConfig[cat];
            return (
              <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                className={`border rounded-xl p-4 text-left transition-colors ${categoryFilter === cat ? `${cfg.bgColor} ring-1` : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cfg.color}>{cfg.icon}</span>
                  <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{catOnTrack}/{catMetrics.length}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">on track</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Status Filter */}
      <div className="flex gap-2 items-center">
        <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        {[{ v: '', l: 'All Statuses' }, { v: 'ON_TRACK', l: 'On Track' }, { v: 'AT_RISK', l: 'At Risk' }, { v: 'OFF_TRACK', l: 'Off Track' }].map(s => (
          <button key={s.v} onClick={() => setStatusFilter(s.v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s.v ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>{s.l}</button>
        ))}
      </div>

      {/* Metrics Table */}
      {filtered.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Metric</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">Current</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">Target</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Progress</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-16">Trend</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Framework</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const progress = m.target === 0
                  ? (m.value === 0 ? 100 : 0)
                  : Math.min(100, Math.round((m.value / m.target) * 100));
                return (
                  <tr key={m.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{m.name}</p>
                      {m.disclosure && <p className="text-xs text-gray-400 dark:text-gray-500">{m.disclosure}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryBadge[m.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {m.category?.[0] || '?'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{typeof m.value === 'number' && m.value >= 1000 ? m.value.toLocaleString() : m.value}</span>
                      <span className="text-gray-400 dark:text-gray-500 ml-1 text-xs">{m.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500 dark:text-gray-400 text-xs">
                      {typeof m.target === 'number' && m.target >= 1000 ? m.target.toLocaleString() : m.target} {m.unit}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center"><TrendIcon trend={m.trend} /></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[m.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {m.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{m.framework}</td>
                    <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(m)} className="text-gray-400 dark:text-gray-500 hover:text-green-600 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteId(m.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-16 text-center text-gray-500 dark:text-gray-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No metrics found</p>
          <p className="text-sm mt-1">Click "Add Metric" to track your first ESG KPI</p>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Metric' : 'Add ESG Metric'} size="lg">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Metric Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Scope 1 Emissions, Women in Leadership" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ENVIRONMENTAL">Environmental</option>
                <option value="SOCIAL">Social</option>
                <option value="GOVERNANCE">Governance</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="OFF_TRACK">Off Track</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trend</label>
              <select value={form.trend} onChange={e => setForm(f => ({ ...f, trend: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="UP">Up</option>
                <option value="DOWN">Down</option>
                <option value="STABLE">Stable</option>
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Value</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Value</label>
              <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previous Period</label>
              <input type="number" value={form.previousPeriod} onChange={e => setForm(f => ({ ...f, previousPeriod: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. tCO₂e, %, m³, hrs" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
              <input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. FY 2025, Q4 2025" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Framework</label>
              <select value={form.framework} onChange={e => setForm(f => ({ ...f, framework: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="GRI">GRI</option>
                <option value="TCFD">TCFD</option>
                <option value="SASB">SASB</option>
                <option value="CDP">CDP</option>
                <option value="CSRD">CSRD</option>
                <option value="CUSTOM">Custom</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Disclosure Reference</label>
              <input value={form.disclosure} onChange={e => setForm(f => ({ ...f, disclosure: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. 305-1, HC-01" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Metric description and measurement methodology..." /></div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Metric'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Metric" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this metric? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
