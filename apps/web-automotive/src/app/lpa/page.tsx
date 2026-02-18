'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Layers, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface LPAAudit {
  id: string;
  auditNumber: string;
  title: string;
  layer: string;
  processArea: string;
  status: string;
  score: number;
  auditor: string;
  auditDate: string;
  findings: number;
  openFindings: number;
  createdAt: string;
}

const LAYERS = [
  'LAYER_1_OPERATOR',
  'LAYER_2_SUPERVISOR',
  'LAYER_3_MANAGER',
  'LAYER_4_DIRECTOR',
  'LAYER_5_EXECUTIVE',
];
const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETE', 'OVERDUE', 'CANCELLED'];
const layerLabel = (l: string) =>
  ({
    LAYER_1_OPERATOR: 'L1: Operator',
    LAYER_2_SUPERVISOR: 'L2: Supervisor',
    LAYER_3_MANAGER: 'L3: Manager',
    LAYER_4_DIRECTOR: 'L4: Director',
    LAYER_5_EXECUTIVE: 'L5: Executive',
  })[l] || l;
const layerColor = (l: string) =>
  l === 'LAYER_1_OPERATOR'
    ? 'bg-blue-100 text-blue-700'
    : l === 'LAYER_2_SUPERVISOR'
      ? 'bg-indigo-100 text-indigo-700'
      : l === 'LAYER_3_MANAGER'
        ? 'bg-purple-100 text-purple-700'
        : l === 'LAYER_4_DIRECTOR'
          ? 'bg-orange-100 text-orange-700'
          : 'bg-red-100 text-red-700';
const statusColor = (s: string) =>
  s === 'COMPLETE'
    ? 'bg-green-100 text-green-700'
    : s === 'OVERDUE'
      ? 'bg-red-100 text-red-700'
      : s === 'IN_PROGRESS'
        ? 'bg-blue-100 text-blue-700'
        : s === 'CANCELLED'
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600'
          : 'bg-yellow-100 text-yellow-700';
const scoreColor = (n: number) =>
  n >= 90 ? 'text-green-700' : n >= 70 ? 'text-yellow-700' : 'text-red-700';

const emptyForm = {
  title: '',
  layer: 'LAYER_1_OPERATOR',
  processArea: '',
  status: 'SCHEDULED',
  score: 0,
  auditor: '',
  auditDate: '',
  findings: 0,
  openFindings: 0,
};

export default function LPAPage() {
  const [items, setItems] = useState<LPAAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [layerFilter, setLayerFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<LPAAudit | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/lpa');
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
  function openEdit(item: LPAAudit) {
    setEditItem(item);
    setForm({
      title: item.title,
      layer: item.layer,
      processArea: item.processArea || '',
      status: item.status,
      score: item.score || 0,
      auditor: item.auditor || '',
      auditDate: item.auditDate ? item.auditDate.slice(0, 10) : '',
      findings: item.findings || 0,
      openFindings: item.openFindings || 0,
    });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/lpa/${editItem.id}`, form);
      else await api.post('/lpa', form);
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
      await api.delete(`/lpa/${id}`);
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
    const matchLayer = !layerFilter || item.layer === layerFilter;
    return matchSearch && matchLayer;
  });

  const totalFindings = items.reduce((acc, i) => acc + (i.openFindings || 0), 0);
  const avgScore =
    items.length > 0
      ? Math.round(items.reduce((acc, i) => acc + (i.score || 0), 0) / items.length)
      : 0;
  const stats = {
    total: items.length,
    complete: items.filter((i) => i.status === 'COMPLETE').length,
    overdue: items.filter((i) => i.status === 'OVERDUE').length,
    avgScore,
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Layered Process Audits
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              IATF 16949 multi-layer process audit programme
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Schedule Audit
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Audits',
              value: stats.total,
              color: 'text-gray-900 dark:text-gray-100',
              bg: 'bg-gray-100 dark:bg-gray-800',
            },
            {
              label: 'Complete',
              value: stats.complete,
              color: 'text-green-700',
              bg: 'bg-green-100',
            },
            { label: 'Overdue', value: stats.overdue, color: 'text-red-700', bg: 'bg-red-100' },
            {
              label: 'Avg Score',
              value: `${stats.avgScore}%`,
              color: scoreColor(stats.avgScore),
              bg: 'bg-orange-100',
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
                    <Layers className={`h-5 w-5 ${s.color}`} />
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
              aria-label="Search LPA audits..."
              placeholder="Search LPA audits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
            />
          </div>
          <select
            aria-label="Filter by layer"
            value={layerFilter}
            onChange={(e) => setLayerFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Layers</option>
            {LAYERS.map((l) => (
              <option key={l} value={l}>
                {layerLabel(l)}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-orange-600" />
              LPA Audits ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Audit #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Layer
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Process Area
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Score
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Open
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs">{item.auditNumber}</td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${layerColor(item.layer)}`}
                          >
                            {layerLabel(item.layer)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {item.processArea || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${scoreColor(item.score || 0)}`}>
                            {item.score != null ? `${item.score}%` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.openFindings > 0 ? (
                            <span className="font-bold text-red-600">{item.openFindings}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.auditDate ? new Date(item.auditDate).toLocaleDateString() : '-'}
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
                <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No LPA audits found</p>
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
                {editItem ? 'Edit LPA Audit' : 'Schedule LPA Audit'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
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
                    Layer
                  </label>
                  <select
                    value={form.layer}
                    onChange={(e) => setForm({ ...form, layer: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {LAYERS.map((l) => (
                      <option key={l} value={l}>
                        {layerLabel(l)}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Process Area
                </label>
                <input
                  type="text"
                  value={form.processArea}
                  onChange={(e) => setForm({ ...form, processArea: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Auditor
                  </label>
                  <input
                    type="text"
                    value={form.auditor}
                    onChange={(e) => setForm({ ...form, auditor: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Audit Date
                  </label>
                  <input
                    type="date"
                    value={form.auditDate}
                    onChange={(e) => setForm({ ...form, auditDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Score %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Findings
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.findings}
                    onChange={(e) => setForm({ ...form, findings: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Open Findings
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.openFindings}
                    onChange={(e) =>
                      setForm({ ...form, openFindings: parseInt(e.target.value) || 0 })
                    }
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
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Schedule Audit'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete LPA Audit?</h2>
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
