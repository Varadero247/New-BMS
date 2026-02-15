'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, Zap, Pencil, Trash2, Leaf } from 'lucide-react';
import { api } from '@/lib/api';

interface EnergyRecord {
  id: string;
  source: string;
  type: string;
  consumption: number;
  unit: string;
  facility: string;
  period: string;
  cost: number;
  renewable: boolean;
  status: string;
}

type FormData = Omit<EnergyRecord, 'id'>;

const typeColors: Record<string, string> = {
  ELECTRICITY: 'bg-yellow-100 text-yellow-700',
  NATURAL_GAS: 'bg-orange-100 text-orange-700',
  DIESEL: 'bg-red-100 text-red-700',
  SOLAR: 'bg-green-100 text-green-700',
  WIND: 'bg-emerald-100 text-emerald-700',
  BIOMASS: 'bg-lime-100 text-lime-700',
};

const empty: FormData = {
  source: '',
  type: 'ELECTRICITY',
  consumption: 0,
  unit: 'kWh',
  facility: '',
  period: '',
  cost: 0,
  renewable: false,
  status: 'PENDING',
};

export default function EnergyPage() {
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [renewableFilter, setRenewableFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EnergyRecord | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadRecords(); }, []);

  async function loadRecords() {
    try {
      const res = await api.get('/energy');
      setRecords(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setForm(empty); setModalOpen(true); }
  function openEdit(r: EnergyRecord) {
    setEditing(r);
    setForm({ source: r.source, type: r.type, consumption: r.consumption, unit: r.unit, facility: r.facility, period: r.period, cost: r.cost, renewable: r.renewable, status: r.status });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/energy/${editing.id}`, form);
        setRecords(prev => prev.map(r => r.id === editing.id ? res.data.data : r));
      } else {
        const res = await api.post('/energy', form);
        setRecords(prev => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/energy/${id}`);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeleteId(null); }
  }

  const filtered = records.filter(r => {
    const matchesSearch = !searchTerm || JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRenewable = renewableFilter === '' || (renewableFilter === 'true' ? r.renewable : !r.renewable);
    return matchesSearch && matchesRenewable;
  });

  const totalConsumption = records.reduce((s, r) => s + (r.consumption || 0), 0);
  const renewableConsumption = records.filter(r => r.renewable).reduce((s, r) => s + (r.consumption || 0), 0);
  const renewablePct = totalConsumption > 0 ? Math.round((renewableConsumption / totalConsumption) * 100) : 0;
  const totalCost = records.reduce((s, r) => s + (r.cost || 0), 0);

  if (loading) return <div className="p-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-1/4" /><div className="h-64 bg-gray-200 rounded" /></div></div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Energy Consumption</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track energy usage, renewables, and costs</p>
          </div>
          <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Log Energy
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Consumption', value: `${totalConsumption.toLocaleString()} kWh`, color: 'text-gray-800', bg: 'bg-gray-50 dark:bg-gray-800' },
            { label: 'Renewable Energy', value: `${renewableConsumption.toLocaleString()} kWh`, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Renewable %', value: `${renewablePct}%`, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Total Cost', value: `£${totalCost.toLocaleString()}`, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(c => (
            <Card key={c.label}><CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">{c.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </CardContent></Card>
          ))}
        </div>

        <Card className="mb-6"><CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input type="text" placeholder="Search energy records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={renewableFilter} onChange={e => setRenewableFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Sources</option>
              <option value="true">Renewable Only</option>
              <option value="false">Non-Renewable</option>
            </select>
          </div>
        </CardContent></Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-green-600" />Energy Records ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Consumption</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Facility</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Period</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Cost</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Renewable</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{r.source}</td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeColors[r.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>{r.type?.replace(/_/g, ' ')}</span></td>
                        <td className="py-3 px-4 text-right">{r.consumption.toLocaleString()} {r.unit}</td>
                        <td className="py-3 px-4 text-gray-600">{r.facility}</td>
                        <td className="py-3 px-4 text-gray-600">{r.period}</td>
                        <td className="py-3 px-4 text-right font-medium">£{r.cost?.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          {r.renewable
                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700"><Leaf className="h-3 w-3" />Yes</span>
                            : <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600">No</span>}
                        </td>
                        <td className="py-3 px-4"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${r.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                        <td className="py-3 px-4 text-right"><div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(r)} className="text-gray-400 dark:text-gray-500 hover:text-green-600"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(r.id)} className="text-gray-400 dark:text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No energy records found</p>
                <p className="text-sm mt-1">Click "Log Energy" to add your first record</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Energy Record' : 'Log Energy Consumption'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source *</label>
              <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. National Grid, Rooftop Solar" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Energy Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="ELECTRICITY">Electricity</option>
                <option value="NATURAL_GAS">Natural Gas</option>
                <option value="DIESEL">Diesel</option>
                <option value="SOLAR">Solar</option>
                <option value="WIND">Wind</option>
                <option value="BIOMASS">Biomass</option>
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consumption</label>
              <input type="number" value={form.consumption} onChange={e => setForm(f => ({ ...f, consumption: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="kWh">kWh</option>
                <option value="MWh">MWh</option>
                <option value="GJ">GJ</option>
                <option value="m³">m³ (gas)</option>
              </select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost (£)</label>
              <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facility</label>
              <input value={form.facility} onChange={e => setForm(f => ({ ...f, facility: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Site or facility name" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
              <input value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Q1 2026" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
              </select></div>
            <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.renewable} onChange={e => setForm(f => ({ ...f, renewable: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Renewable Energy Source</span>
            </label></div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.source} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Log Energy'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Energy Record" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this energy record?</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
