'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, Target, Pencil, Trash2, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ESGTarget {
  id: string;
  name: string;
  category: string;
  baselineYear: number;
  targetYear: number;
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: string;
  progress: number;
  description?: string;
}

type FormData = Omit<ESGTarget, 'id' | 'progress'>;

const statusColors: Record<string, string> = {
  ON_TRACK: 'bg-green-100 text-green-700',
  AT_RISK: 'bg-yellow-100 text-yellow-700',
  BEHIND: 'bg-red-100 text-red-700',
  ACHIEVED: 'bg-blue-100 text-blue-700',
  NOT_STARTED: 'bg-gray-100 text-gray-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  ON_TRACK: <TrendingUp className="h-3.5 w-3.5" />,
  AT_RISK: <AlertTriangle className="h-3.5 w-3.5" />,
  BEHIND: <AlertTriangle className="h-3.5 w-3.5" />,
  ACHIEVED: <CheckCircle className="h-3.5 w-3.5" />,
  NOT_STARTED: <Clock className="h-3.5 w-3.5" />,
};

const empty: FormData = {
  name: '',
  category: 'EMISSIONS',
  baselineYear: 2020,
  targetYear: 2030,
  baselineValue: 0,
  targetValue: 0,
  currentValue: 0,
  unit: 'tCO2e',
  status: 'NOT_STARTED',
  description: '',
};

export default function TargetsPage() {
  const [targets, setTargets] = useState<ESGTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ESGTarget | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { loadTargets(); }, []);

  async function loadTargets() {
    try {
      const res = await api.get('/targets');
      setTargets(res.data.data || []);
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

  function openEdit(t: ESGTarget) {
    setEditing(t);
    setForm({ name: t.name, category: t.category, baselineYear: t.baselineYear, targetYear: t.targetYear, baselineValue: t.baselineValue, targetValue: t.targetValue, currentValue: t.currentValue, unit: t.unit, status: t.status, description: t.description || '' });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/targets/${editing.id}`, form);
        setTargets(prev => prev.map(t => t.id === editing.id ? res.data.data : t));
      } else {
        const res = await api.post('/targets', form);
        setTargets(prev => [res.data.data, ...prev]);
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
      await api.delete(`/targets/${id}`);
      setTargets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = targets.filter(t => {
    const matchesSearch = !searchTerm || JSON.stringify(t).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const achieved = targets.filter(t => t.status === 'ACHIEVED').length;
  const onTrack = targets.filter(t => t.status === 'ON_TRACK').length;
  const atRisk = targets.filter(t => t.status === 'AT_RISK' || t.status === 'BEHIND').length;
  const avgProgress = targets.length > 0 ? Math.round(targets.reduce((s, t) => s + (t.progress || 0), 0) / targets.length) : 0;

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
            <h1 className="text-3xl font-bold text-gray-900">ESG Targets</h1>
            <p className="text-gray-500 mt-1">Track sustainability targets and reduction commitments</p>
          </div>
          <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <Plus className="h-5 w-5" /> Add Target
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Targets', value: targets.length, color: 'text-gray-800', bg: 'bg-gray-50' },
            { label: 'On Track', value: onTrack, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'At Risk / Behind', value: atRisk, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(c => (
            <Card key={c.label}>
              <CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
                <p className="text-xs text-gray-500 font-medium uppercase">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search targets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">All Statuses</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="BEHIND">Behind</option>
                <option value="ACHIEVED">Achieved</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Targets ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Baseline → Target</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.baselineYear} → {t.targetYear}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{t.category?.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <span>{t.baselineValue} → </span>
                          <span className="font-medium text-green-700">{t.targetValue} {t.unit}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${(t.progress || 0) >= 100 ? 'bg-green-500' : (t.progress || 0) >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(t.progress || 0, 100)}%` }} />
                            </div>
                            <span className="text-xs font-medium w-9">{t.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusColors[t.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusIcons[t.status]}
                            {t.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openEdit(t)} className="text-gray-400 hover:text-green-600 transition-colors"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteId(t.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No targets found</p>
                <p className="text-sm mt-1">Click "Add Target" to set your first sustainability target</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Target' : 'Add ESG Target'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Net Zero Emissions by 2030" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="EMISSIONS">Emissions</option>
                <option value="ENERGY">Energy</option>
                <option value="WATER">Water</option>
                <option value="WASTE">Waste</option>
                <option value="SOCIAL">Social</option>
                <option value="GOVERNANCE">Governance</option>
                <option value="BIODIVERSITY">Biodiversity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="tCO2e, kWh, m³..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baseline Year</label>
              <input type="number" value={form.baselineYear} onChange={e => setForm(f => ({ ...f, baselineYear: parseInt(e.target.value) || 2020 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
              <input type="number" value={form.targetYear} onChange={e => setForm(f => ({ ...f, targetYear: parseInt(e.target.value) || 2030 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baseline Value</label>
              <input type="number" value={form.baselineValue} onChange={e => setForm(f => ({ ...f, baselineValue: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
              <input type="number" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
              <input type="number" value={form.currentValue} onChange={e => setForm(f => ({ ...f, currentValue: parseFloat(e.target.value) || 0 }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="NOT_STARTED">Not Started</option>
              <option value="ON_TRACK">On Track</option>
              <option value="AT_RISK">At Risk</option>
              <option value="BEHIND">Behind</option>
              <option value="ACHIEVED">Achieved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Describe the target and how it will be achieved..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Target'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Target" size="sm">
        <p className="text-sm text-gray-600">Are you sure you want to delete this target? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-700 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={() => deleteId && handleDelete(deleteId)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
