'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, Users, Pencil, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '@/lib/api';

interface SocialMetric {
  id: string;
  category: string;
  metric: string;
  value: number;
  unit: string;
  period: string;
  target: number;
  description: string;
  status: string;
}

type FormData = Omit<SocialMetric, 'id'>;

const statusColors: Record<string, string> = {
  ON_TRACK: 'bg-green-100 text-green-700',
  AT_RISK: 'bg-yellow-100 text-yellow-700',
  BEHIND: 'bg-red-100 text-red-700',
  ACHIEVED: 'bg-blue-100 text-blue-700',
};

const categoryColors: Record<string, string> = {
  DIVERSITY: 'bg-purple-100 text-purple-700',
  HEALTH_SAFETY: 'bg-red-100 text-red-700',
  TRAINING: 'bg-blue-100 text-blue-700',
  COMMUNITY: 'bg-green-100 text-green-700',
  LABOUR: 'bg-amber-100 text-amber-700',
  HUMAN_RIGHTS: 'bg-rose-100 text-rose-700',
};

const empty: FormData = {
  category: 'DIVERSITY',
  metric: '',
  value: 0,
  unit: '%',
  period: '',
  target: 0,
  description: '',
  status: 'ON_TRACK',
};

export default function SocialPage() {
  const [metrics, setMetrics] = useState<SocialMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SocialMetric | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      const res = await api.get('/social');
      setMetrics(res.data.data || []);
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
  function openEdit(m: SocialMetric) {
    setEditing(m);
    setForm({
      category: m.category,
      metric: m.metric,
      value: m.value,
      unit: m.unit,
      period: m.period,
      target: m.target,
      description: m.description,
      status: m.status,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/social/${editing.id}`, form);
        setMetrics((prev) => prev.map((m) => (m.id === editing.id ? res.data.data : m)));
      } else {
        const res = await api.post('/social', form);
        setMetrics((prev) => [res.data.data, ...prev]);
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
      await api.delete(`/social/${id}`);
      setMetrics((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = metrics.filter((m) => {
    const matchesSearch =
      !searchTerm || JSON.stringify(m).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !categoryFilter || m.category === categoryFilter;
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const onTrack = metrics.filter((m) => m.status === 'ON_TRACK' || m.status === 'ACHIEVED').length;
  const atRisk = metrics.filter((m) => m.status === 'AT_RISK' || m.status === 'BEHIND').length;
  const categories = [...new Set(metrics.map((m) => m.category))].length;

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Social Metrics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track social impact, diversity, health & safety, and community metrics
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" /> Add Metric
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Metrics',
              value: metrics.length,
              color: 'text-gray-800',
              bg: 'bg-gray-50 dark:bg-gray-800',
            },
            {
              label: 'On Track / Achieved',
              value: onTrack,
              color: 'text-green-700',
              bg: 'bg-green-50',
            },
            { label: 'At Risk / Behind', value: atRisk, color: 'text-red-700', bg: 'bg-red-50' },
            {
              label: 'Categories Tracked',
              value: categories,
              color: 'text-blue-700',
              bg: 'bg-blue-50',
            },
          ].map((c) => (
            <Card key={c.label}>
              <CardContent className={`pt-5 pb-4 ${c.bg} rounded-lg`}>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
                  {c.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search social metrics..."
                  placeholder="Search social metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                <option value="DIVERSITY">Diversity & Inclusion</option>
                <option value="HEALTH_SAFETY">Health & Safety</option>
                <option value="TRAINING">Training & Development</option>
                <option value="COMMUNITY">Community</option>
                <option value="LABOUR">Labour Practices</option>
                <option value="HUMAN_RIGHTS">Human Rights</option>
              </select>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="BEHIND">Behind</option>
                <option value="ACHIEVED">Achieved</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Social Metrics ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Metric
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Value
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Target
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        vs Target
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Period
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => {
                      const diff = m.value - m.target;
                      return (
                        <tr key={m.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${categoryColors[m.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                            >
                              {m.category?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {m.metric}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {m.value} {m.unit}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">
                            {m.target} {m.unit}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {diff > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : diff < 0 ? (
                                <TrendingDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              {diff > 0 ? '+' : ''}
                              {diff.toFixed(1)}
                              {m.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{m.period}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[m.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                            >
                              {m.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEdit(m)}
                                className="text-gray-400 dark:text-gray-500 hover:text-green-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteId(m.id)}
                                className="text-gray-400 dark:text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No social metrics found</p>
                <p className="text-sm mt-1">Click "Add Metric" to start tracking social KPIs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Social Metric' : 'Add Social Metric'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="DIVERSITY">Diversity & Inclusion</option>
                <option value="HEALTH_SAFETY">Health & Safety</option>
                <option value="TRAINING">Training & Development</option>
                <option value="COMMUNITY">Community</option>
                <option value="LABOUR">Labour Practices</option>
                <option value="HUMAN_RIGHTS">Human Rights</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Metric Name *
              </label>
              <input
                value={form.metric}
                onChange={(e) => setForm((f) => ({ ...f, metric: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Women in Leadership, Lost Time Injury Rate"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Value
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target
              </label>
              <input
                type="number"
                value={form.target}
                onChange={(e) =>
                  setForm((f) => ({ ...f, target: parseFloat(e.target.value) || 0 }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <input
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="%, hours, #..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Period
              </label>
              <input
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Q1 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="BEHIND">Behind</option>
                <option value="ACHIEVED">Achieved</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Additional context or notes..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.metric}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Metric'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Social Metric"
        size="sm"
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this social metric?</p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setDeleteId(null)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteId && handleDelete(deleteId)}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
