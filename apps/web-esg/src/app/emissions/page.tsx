'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, Cloud, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface Emission {
  id: string;
  scope: string;
  source: string;
  category: string;
  amount: number;
  unit: string;
  co2Equivalent: number;
  period: string;
  status: string;
  createdAt: string;
}

type FormData = Omit<Emission, 'id' | 'createdAt'>;

const scopeColors: Record<string, string> = {
  SCOPE_1: 'bg-emerald-100 text-emerald-700',
  SCOPE_2: 'bg-amber-100 text-amber-700',
  SCOPE_3: 'bg-orange-100 text-orange-700',
};

const statusColors: Record<string, string> = {
  VERIFIED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const empty: FormData = {
  scope: 'SCOPE_1',
  source: '',
  category: '',
  amount: 0,
  unit: 'tonnes',
  co2Equivalent: 0,
  period: '',
  status: 'DRAFT',
};

export default function EmissionsPage() {
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Emission | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadEmissions(); }, []);

  async function loadEmissions() {
    try {
      const res = await api.get('/emissions');
      setEmissions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  }

  function openEdit(e: Emission) {
    setEditing(e);
    setForm({ scope: e.scope, source: e.source, category: e.category, amount: e.amount, unit: e.unit, co2Equivalent: e.co2Equivalent, period: e.period, status: e.status });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/emissions/${editing.id}`, form);
        setEmissions(prev => prev.map(e => e.id === editing.id ? res.data.data : e));
      } else {
        const res = await api.post('/emissions', form);
        setEmissions(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/emissions/${id}`);
      setEmissions(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = emissions.filter(e => {
    const matchesSearch = !searchTerm || JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope = !scopeFilter || e.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  const totalCO2 = emissions.reduce((s, e) => s + (e.co2Equivalent || 0), 0);
  const scope1 = emissions.filter(e => e.scope === 'SCOPE_1').reduce((s, e) => s + (e.co2Equivalent || 0), 0);
  const scope2 = emissions.filter(e => e.scope === 'SCOPE_2').reduce((s, e) => s + (e.co2Equivalent || 0), 0);
  const scope3 = emissions.filter(e => e.scope === 'SCOPE_3').reduce((s, e) => s + (e.co2Equivalent || 0), 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded" />)}</div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Emissions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track Scope 1, 2 & 3 greenhouse gas emissions</p>
          </div>
          <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Log Emission
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total CO2e', value: `${totalCO2.toLocaleString(undefined, { maximumFractionDigits: 1 })} t`, color: 'text-gray-800', bg: 'bg-gray-50 dark:bg-gray-800' },
            { label: 'Scope 1 (Direct)', value: `${scope1.toLocaleString(undefined, { maximumFractionDigits: 1 })} t`, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Scope 2 (Indirect)', value: `${scope2.toLocaleString(undefined, { maximumFractionDigits: 1 })} t`, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Scope 3 (Value Chain)', value: `${scope3.toLocaleString(undefined, { maximumFractionDigits: 1 })} t`, color: 'text-orange-700', bg: 'bg-orange-50' },
          ].map(c => (
            <Card key={c.label}>
              <CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">tCO2e</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input type="text" placeholder="Search emissions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <select value={scopeFilter} onChange={e => setScopeFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">All Scopes</option>
                <option value="SCOPE_1">Scope 1</option>
                <option value="SCOPE_2">Scope 2</option>
                <option value="SCOPE_3">Scope 3</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-green-600" />
              Emissions ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Source</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Scope</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">CO2e (t)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(em => (
                      <tr key={em.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{em.source}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${scopeColors[em.scope] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {em.scope?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{em.category}</td>
                        <td className="py-3 px-4 text-right">{em.amount} {em.unit}</td>
                        <td className="py-3 px-4 text-right font-medium">{em.co2Equivalent?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-600">{em.period}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[em.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                            {em.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(em)} className="text-gray-400 dark:text-gray-500 hover:text-green-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteId(em.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No emissions records found</p>
                <p className="text-sm mt-1">Click "Log Emission" to add your first record</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Emission Record' : 'Log Emission'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source *</label>
              <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Fleet Vehicles" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope *</label>
              <select value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="SCOPE_1">Scope 1 (Direct)</option>
                <option value="SCOPE_2">Scope 2 (Indirect)</option>
                <option value="SCOPE_3">Scope 3 (Value Chain)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Transport" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
              <input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Q1 2026" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="litres, kWh, km..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CO2e (tonnes)</label>
              <input type="number" value={form.co2Equivalent} onChange={e => setForm(f => ({ ...f, co2Equivalent: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.source} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Log Emission'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Emission Record" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this emission record? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
