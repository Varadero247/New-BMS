'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Activity, X, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface PMSRecord {
  id: string;
  pmsNumber: string;
  title: string;
  dataSource: string;
  findingType: string;
  severity: string;
  status: string;
  deviceName: string;
  reportedDate: string;
  dueDate: string;
  owner: string;
  description: string;
}

const DATA_SOURCES = [
  'COMPLAINTS',
  'CLINICAL_DATA',
  'LITERATURE',
  'VIGILANCE',
  'REGISTRY',
  'FIELD_SAFETY',
  'OTHER',
];
const FINDING_TYPES = [
  'SAFETY_SIGNAL',
  'BENEFIT_RISK',
  'PERFORMANCE',
  'LABELING',
  'TREND',
  'OTHER',
];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'CLOSED'];
const statusColor = (s: string) =>
  s === 'CLOSED'
    ? 'bg-green-100 text-green-700'
    : s === 'UNDER_REVIEW'
      ? 'bg-blue-100 text-blue-700'
      : s === 'ACTION_REQUIRED'
        ? 'bg-red-100 text-red-700'
        : 'bg-yellow-100 text-yellow-700';
const sevColor = (s: string) =>
  s === 'CRITICAL'
    ? 'bg-red-100 text-red-700'
    : s === 'HIGH'
      ? 'bg-orange-100 text-orange-700'
      : s === 'MEDIUM'
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-green-100 text-green-700';

const emptyForm = {
  title: '',
  dataSource: 'COMPLAINTS',
  findingType: 'SAFETY_SIGNAL',
  severity: 'MEDIUM',
  status: 'OPEN',
  deviceName: '',
  reportedDate: '',
  dueDate: '',
  owner: '',
  description: '',
};

export default function PMSPage() {
  const [items, setItems] = useState<PMSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PMSRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/pms');
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
  function openEdit(item: PMSRecord) {
    setEditItem(item);
    setForm({
      title: item.title,
      dataSource: item.dataSource,
      findingType: item.findingType,
      severity: item.severity,
      status: item.status,
      deviceName: item.deviceName || '',
      reportedDate: item.reportedDate ? item.reportedDate.slice(0, 10) : '',
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '',
      owner: item.owner || '',
      description: item.description || '',
    });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/pms/${editItem.id}`, form);
      else await api.post('/pms', form);
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
      await api.delete(`/pms/${id}`);
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
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: items.length,
    open: items.filter((i) => i.status === 'OPEN').length,
    actionRequired: items.filter((i) => i.status === 'ACTION_REQUIRED').length,
    closed: items.filter((i) => i.status === 'CLOSED').length,
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
              Post-Market Surveillance
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              MDR EU 2017/745 / 21 CFR — PMS data collection and analysis
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Finding
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Findings',
              value: stats.total,
              color: 'text-gray-900 dark:text-gray-100',
              bg: 'bg-gray-100 dark:bg-gray-800',
            },
            { label: 'Open', value: stats.open, color: 'text-yellow-700', bg: 'bg-yellow-100' },
            {
              label: 'Action Required',
              value: stats.actionRequired,
              color: 'text-red-700',
              bg: 'bg-red-100',
            },
            { label: 'Closed', value: stats.closed, color: 'text-green-700', bg: 'bg-green-100' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${s.bg}`}>
                    <Activity className={`h-5 w-5 ${s.color}`} />
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
              aria-label="Search PMS findings..."
              placeholder="Search PMS findings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full text-sm"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              PMS Findings ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        PMS #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Device
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Data Source
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Finding Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Severity
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Due Date
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono text-xs">{item.pmsNumber}</td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {item.deviceName || '-'}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {item.dataSource.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          {item.findingType.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sevColor(item.severity)}`}
                          >
                            {item.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}
                          >
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-teal-600 transition-colors"
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
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No PMS findings found</p>
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
                {editItem ? 'Edit PMS Finding' : 'Add PMS Finding'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  value={form.deviceName}
                  onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Source
                  </label>
                  <select
                    value={form.dataSource}
                    onChange={(e) => setForm({ ...form, dataSource: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {DATA_SOURCES.map((d) => (
                      <option key={d} value={d}>
                        {d.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Finding Type
                  </label>
                  <select
                    value={form.findingType}
                    onChange={(e) => setForm({ ...form, findingType: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {FINDING_TYPES.map((f) => (
                      <option key={f} value={f}>
                        {f.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
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
                        {s.replace(/_/g, ' ')}
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
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
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
                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Finding'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete PMS Finding?</h2>
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
