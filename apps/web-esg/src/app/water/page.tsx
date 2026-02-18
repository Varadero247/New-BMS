'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal } from '@ims/ui';
import { Plus, Search, Droplets, Pencil, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface WaterRecord {
  id: string;
  source: string;
  usage: number;
  unit: string;
  facility: string;
  period: string;
  recycled: number;
  discharged: number;
  status: string;
}

type FormData = Omit<WaterRecord, 'id'>;

const statusColors: Record<string, string> = {
  VERIFIED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const empty: FormData = {
  source: '',
  usage: 0,
  unit: 'm³',
  facility: '',
  period: '',
  recycled: 0,
  discharged: 0,
  status: 'PENDING',
};

export default function WaterPage() {
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WaterRecord | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const res = await api.get('/water');
      setRecords(res.data.data || []);
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
  function openEdit(r: WaterRecord) {
    setEditing(r);
    setForm({
      source: r.source,
      usage: r.usage,
      unit: r.unit,
      facility: r.facility,
      period: r.period,
      recycled: r.recycled,
      discharged: r.discharged,
      status: r.status,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/water/${editing.id}`, form);
        setRecords((prev) => prev.map((r) => (r.id === editing.id ? res.data.data : r)));
      } else {
        const res = await api.post('/water', form);
        setRecords((prev) => [res.data.data, ...prev]);
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
      await api.delete(`/water/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = records.filter((r) => {
    const matchesSearch =
      !searchTerm || JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUsage = records.reduce((s, r) => s + (r.usage || 0), 0);
  const totalRecycled = records.reduce((s, r) => s + (r.recycled || 0), 0);
  const totalDischarged = records.reduce((s, r) => s + (r.discharged || 0), 0);
  const recycledPct = totalUsage > 0 ? Math.round((totalRecycled / totalUsage) * 100) : 0;

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Water Usage</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track water consumption, recycling, and discharge
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" /> Log Water Usage
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Usage',
              value: `${totalUsage.toLocaleString()} m³`,
              color: 'text-blue-800',
              bg: 'bg-blue-50',
            },
            {
              label: 'Total Recycled',
              value: `${totalRecycled.toLocaleString()} m³`,
              color: 'text-green-700',
              bg: 'bg-green-50',
            },
            {
              label: 'Total Discharged',
              value: `${totalDischarged.toLocaleString()} m³`,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
            },
            {
              label: 'Recycled Rate',
              value: `${recycledPct}%`,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50',
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
                  aria-label="Search water records..."
                  placeholder="Search water records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-green-600" />
              Water Records ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Source
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Usage
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Facility
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Period
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Recycled
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Discharged
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
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {r.source}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {r.usage} {r.unit}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{r.facility}</td>
                        <td className="py-3 px-4 text-gray-600">{r.period}</td>
                        <td className="py-3 px-4 text-right text-green-700 font-medium">
                          {r.recycled} {r.unit}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-700">
                          {r.discharged} {r.unit}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="text-gray-400 dark:text-gray-500 hover:text-green-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(r.id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-600"
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
                <Droplets className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No water records found</p>
                <p className="text-sm mt-1">Click "Log Water Usage" to add your first record</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Water Record' : 'Log Water Usage'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source *
              </label>
              <input
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Mains supply, Borehole"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Facility
              </label>
              <input
                value={form.facility}
                onChange={(e) => setForm((f) => ({ ...f, facility: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Site or facility name"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usage
              </label>
              <input
                type="number"
                value={form.usage}
                onChange={(e) => setForm((f) => ({ ...f, usage: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recycled
              </label>
              <input
                type="number"
                value={form.recycled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recycled: parseFloat(e.target.value) || 0 }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discharged
              </label>
              <input
                type="number"
                value={form.discharged}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discharged: parseFloat(e.target.value) || 0 }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="m³">m³</option>
                <option value="litres">litres</option>
                <option value="megalitres">megalitres</option>
              </select>
            </div>
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
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
              </select>
            </div>
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
            disabled={saving || !form.source}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Log Usage'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Water Record"
        size="sm"
      >
        <p className="text-sm text-gray-600">Are you sure you want to delete this water record?</p>
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
