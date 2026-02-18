'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Zap, X, Pencil, Trash2, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface SpecialProcess {
  id: string;
  processNumber: string;
  name: string;
  processType: string;
  nadcapRequired: boolean;
  approvedProcessor: string;
  certificationExpiry: string;
  status: string;
  lastAuditDate: string;
  createdAt: string;
}

const PROCESS_TYPES = [
  'HEAT_TREATMENT',
  'WELDING',
  'PLATING',
  'PAINTING',
  'NDT',
  'CHEMICAL_PROCESSING',
  'SHOT_PEENING',
  'BRAZING',
  'COMPOSITES',
];
const STATUSES = ['ACTIVE', 'APPROVED', 'SUSPENDED', 'EXPIRED', 'PENDING_RENEWAL'];
const statusColor = (s: string) =>
  s === 'ACTIVE' || s === 'APPROVED'
    ? 'bg-green-100 text-green-700'
    : s === 'SUSPENDED' || s === 'EXPIRED'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';

const emptyForm = {
  name: '',
  processType: 'WELDING',
  nadcapRequired: false,
  approvedProcessor: '',
  certificationExpiry: '',
  status: 'ACTIVE',
  lastAuditDate: '',
};

export default function SpecialProcessesPage() {
  const [items, setItems] = useState<SpecialProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SpecialProcess | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/special-processes');
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
  function openEdit(item: SpecialProcess) {
    setEditItem(item);
    setForm({
      name: item.name,
      processType: item.processType,
      nadcapRequired: item.nadcapRequired,
      approvedProcessor: item.approvedProcessor || '',
      certificationExpiry: item.certificationExpiry ? item.certificationExpiry.slice(0, 10) : '',
      status: item.status,
      lastAuditDate: item.lastAuditDate ? item.lastAuditDate.slice(0, 10) : '',
    });
    setModalOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editItem) await api.put(`/special-processes/${editItem.id}`, form);
      else await api.post('/special-processes', form);
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
      await api.delete(`/special-processes/${id}`);
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
    const matchType = !typeFilter || item.processType === typeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    total: items.length,
    active: items.filter((i) => i.status === 'ACTIVE' || i.status === 'APPROVED').length,
    nadcap: items.filter((i) => i.nadcapRequired).length,
    expiringSoon: items.filter((i) => {
      if (!i.certificationExpiry) return false;
      const d = new Date(i.certificationExpiry);
      return d <= new Date(Date.now() + 90 * 86400000);
    }).length,
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
              Special Processes
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              NADCAP accredited and controlled special processes
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Process
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Processes',
              value: stats.total,
              color: 'text-gray-900 dark:text-gray-100',
              bg: 'bg-gray-100 dark:bg-gray-800',
            },
            {
              label: 'Active/Approved',
              value: stats.active,
              color: 'text-green-700',
              bg: 'bg-green-100',
            },
            {
              label: 'NADCAP Required',
              value: stats.nadcap,
              color: 'text-purple-700',
              bg: 'bg-purple-100',
            },
            {
              label: 'Expiring Soon',
              value: stats.expiringSoon,
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
                    <Zap className={`h-5 w-5 ${s.color}`} />
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
              aria-label="Search processes..."
              placeholder="Search processes..."
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
            {PROCESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600" />
              Special Processes ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Process #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        NADCAP
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Approved Processor
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Cert Expiry
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
                    {filtered.map((item) => {
                      const isExpiring =
                        item.certificationExpiry &&
                        new Date(item.certificationExpiry) <= new Date(Date.now() + 90 * 86400000);
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4 font-mono text-xs">{item.processNumber}</td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {item.name}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            {item.processType.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.nadcapRequired ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                Required
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.approvedProcessor || '-'}
                          </td>
                          <td
                            className={`py-3 px-4 ${isExpiring ? 'text-red-600 font-medium' : 'text-gray-600'}`}
                          >
                            <div className="flex items-center gap-1">
                              {isExpiring && <Calendar className="h-3 w-3" />}
                              {item.certificationExpiry
                                ? new Date(item.certificationExpiry).toLocaleDateString()
                                : '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(item.status)}`}
                            >
                              {item.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors"
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No special processes found</p>
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
                {editItem ? 'Edit Special Process' : 'Add Special Process'}
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
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Process Type
                  </label>
                  <select
                    value={form.processType}
                    onChange={(e) => setForm({ ...form, processType: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {PROCESS_TYPES.map((t) => (
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
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="nadcap"
                  checked={form.nadcapRequired}
                  onChange={(e) => setForm({ ...form, nadcapRequired: e.target.checked })}
                  className="rounded"
                />
                <label
                  htmlFor="nadcap"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  NADCAP Accreditation Required
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Approved Processor
                </label>
                <input
                  type="text"
                  value={form.approvedProcessor}
                  onChange={(e) => setForm({ ...form, approvedProcessor: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cert Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.certificationExpiry}
                    onChange={(e) => setForm({ ...form, certificationExpiry: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Audit Date
                  </label>
                  <input
                    type="date"
                    value={form.lastAuditDate}
                    onChange={(e) => setForm({ ...form, lastAuditDate: e.target.value })}
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
                disabled={!form.name || saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Process'}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Delete Process?</h2>
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
