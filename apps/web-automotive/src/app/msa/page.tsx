'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, BarChart2, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface MSAStudy {
  id: string;
  studyNumber: string;
  title: string;
  gaugeDescription: string;
  gaugeId: string;
  studyType: string;
  status: string;
  result: string;
  grr: number;
  ndc: number;
  owner: string;
  studyDate: string;
  createdAt: string;
}

const STUDY_TYPES = ['GRR', 'ATTRIBUTE_MSA', 'BIAS', 'LINEARITY', 'STABILITY'];
const STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETE', 'FAILED', 'ARCHIVED'];
const RESULTS = ['ACCEPTABLE', 'MARGINAL', 'UNACCEPTABLE', 'PENDING'];
const statusColor = (s: string) =>
  s === 'COMPLETE'
    ? 'bg-green-100 text-green-700'
    : s === 'FAILED'
      ? 'bg-red-100 text-red-700'
      : s === 'IN_PROGRESS'
        ? 'bg-blue-100 text-blue-700'
        : s === 'ARCHIVED'
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600'
          : 'bg-yellow-100 text-yellow-700';
const resultColor = (r: string) =>
  r === 'ACCEPTABLE'
    ? 'bg-green-100 text-green-700'
    : r === 'MARGINAL'
      ? 'bg-yellow-100 text-yellow-700'
      : r === 'UNACCEPTABLE'
        ? 'bg-red-100 text-red-700'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600';
const grrColor = (g: number) =>
  g < 10 ? 'text-green-700' : g < 30 ? 'text-yellow-700' : 'text-red-700';

const emptyForm = {
  title: '',
  gaugeDescription: '',
  gaugeId: '',
  studyType: 'GRR',
  status: 'PLANNED',
  result: 'PENDING',
  grr: 0,
  ndc: 0,
  owner: '',
  studyDate: '',
};

export default function MSAPage() {
  const [items, setItems] = useState<MSAStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<MSAStudy | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/msa');
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  function openCreate() {
    setEditItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(item: MSAStudy) {
    setEditItem(item);
    setForm({
      title: item.title,
      gaugeDescription: item.gaugeDescription || '',
      gaugeId: item.gaugeId || '',
      studyType: item.studyType,
      status: item.status,
      result: item.result || 'PENDING',
      grr: item.grr || 0,
      ndc: item.ndc || 0,
      owner: item.owner || '',
      studyDate: item.studyDate ? item.studyDate.slice(0, 10) : '',
    });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/msa/${editItem.id}`, form);
      else await api.post('/msa', form);
      setModalOpen(false);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(id: string) {
    try {
      await api.delete(`/msa/${id}`);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = items.filter((item) => {
    const matchSearch =
      !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || item.studyType === typeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    total: items.length,
    acceptable: items.filter((i) => i.result === 'ACCEPTABLE').length,
    marginal: items.filter((i) => i.result === 'MARGINAL').length,
    unacceptable: items.filter((i) => i.result === 'UNACCEPTABLE').length,
  };

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">MSA Studies</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Measurement System Analysis — Gauge R&R and attribute studies
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> New MSA Study
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Studies',
              value: stats.total,
              color: 'text-gray-900 dark:text-gray-100',
              bg: 'bg-gray-100 dark:bg-gray-800',
            },
            {
              label: 'Acceptable',
              value: stats.acceptable,
              color: 'text-green-700',
              bg: 'bg-green-100',
            },
            {
              label: 'Marginal',
              value: stats.marginal,
              color: 'text-yellow-700',
              bg: 'bg-yellow-100',
            },
            {
              label: 'Unacceptable',
              value: stats.unacceptable,
              color: 'text-red-700',
              bg: 'bg-red-100',
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${s.bg}`}>
                    <BarChart2 className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search MSA studies..."
              placeholder="Search MSA studies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
            />
          </div>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            {STUDY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-orange-600" />
              MSA Studies ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Study #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Gauge
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        GRR %
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        NDC
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Result
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
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs">{item.studyNumber}</td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {item.gaugeDescription || '-'}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {item.studyType.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold text-sm ${grrColor(item.grr || 0)}`}>
                            {item.grr !== null ? `${item.grr}%` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
                          {item.ndc || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${resultColor(item.result || 'PENDING')}`}
                          >
                            {item.result || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No MSA studies found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editItem ? 'Edit MSA Study' : 'New MSA Study'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gauge Description
                  </label>
                  <input
                    type="text"
                    value={form.gaugeDescription}
                    onChange={(e) => setForm({ ...form, gaugeDescription: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gauge ID
                  </label>
                  <input
                    type="text"
                    value={form.gaugeId}
                    onChange={(e) => setForm({ ...form, gaugeId: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Study Type
                  </label>
                  <select
                    value={form.studyType}
                    onChange={(e) => setForm({ ...form, studyType: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {STUDY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GRR %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.grr}
                    onChange={(e) => setForm({ ...form, grr: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    NDC
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.ndc}
                    onChange={(e) => setForm({ ...form, ndc: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Result
                  </label>
                  <select
                    value={form.result}
                    onChange={(e) => setForm({ ...form, result: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {RESULTS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Study Date
                  </label>
                  <input
                    type="date"
                    value={form.studyDate}
                    onChange={(e) => setForm({ ...form, studyDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || saving}
                className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Create Study'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete MSA Study?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
