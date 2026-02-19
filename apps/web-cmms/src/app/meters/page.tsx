'use client';
import axios from 'axios';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Gauge, Edit2, Trash2, TrendingUp, Ban } from 'lucide-react';
import { api } from '@/lib/api';

interface MeterReading {
  id: string;
  asset: string;
  assetId: string;
  meter: string;
  meterType: string;
  value: number;
  unit: string;
  readingDate: string;
  readBy: string;
  previousValue: number;
  notes: string;
}

const EMPTY_FORM = {
  asset: '',
  meter: '',
  meterType: 'HOURS',
  value: '',
  unit: '',
  readingDate: new Date().toISOString().slice(0, 10),
  readBy: '',
  previousValue: '',
  notes: '',
};

export default function MetersPage() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<MeterReading | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/meters');
      setReadings(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = readings.filter((r) => {
    const matchesSearch =
      !searchTerm || JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || r.meterType === typeFilter;
    return matchesSearch && matchesType;
  });

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setError('');
    setCreateOpen(true);
  }
  function openEdit(r: MeterReading) {
    setSelected(r);
    setForm({
      asset: r.asset || '',
      meter: r.meter || '',
      meterType: r.meterType || 'HOURS',
      value: r.value?.toString() || '',
      unit: r.unit || '',
      readingDate: r.readingDate ? r.readingDate.slice(0, 10) : '',
      readBy: r.readBy || '',
      previousValue: r.previousValue?.toString() || '',
      notes: r.notes || '',
    });
    setError('');
    setEditOpen(true);
  }
  function openDelete(r: MeterReading) {
    setSelected(r);
    setDeleteOpen(true);
  }

  async function handleCreate() {
    if (!form.asset.trim()) {
      setError('Asset is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/meters', {
        ...form,
        value: parseFloat(form.value) || 0,
        previousValue: parseFloat(form.previousValue) || 0,
      });
      setCreateOpen(false);
      await load();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.error || 'Failed to create');
    } finally {
      setSaving(false);
    }
  }
  async function handleEdit() {
    setSaving(true);
    setError('');
    try {
      await api.put(`/meters/${selected!.id}`, {
        ...form,
        value: parseFloat(form.value) || 0,
        previousValue: parseFloat(form.previousValue) || 0,
      });
      setEditOpen(false);
      await load();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete() {
    setSaving(true);
    try {
      await api.delete(`/meters/${selected!.id}`);
      setDeleteOpen(false);
      await load();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.error || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  }

  const FormFields = () => (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asset *
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.asset}
            onChange={(e) => setForm((f) => ({ ...f, asset: e.target.value }))}
            placeholder="Asset name/tag"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meter Name
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.meter}
            onChange={(e) => setForm((f) => ({ ...f, meter: e.target.value }))}
            placeholder="e.g. Runtime Hours"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meter Type
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.meterType}
            onChange={(e) => setForm((f) => ({ ...f, meterType: e.target.value }))}
          >
            <option value="HOURS">Hours</option>
            <option value="CYCLES">Cycles</option>
            <option value="DISTANCE">Distance</option>
            <option value="ENERGY">Energy</option>
            <option value="PRESSURE">Pressure</option>
            <option value="TEMPERATURE">Temperature</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            placeholder="h, km, kWh, bar..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Previous Value
          </label>
          <input
            type="number"
            step="any"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.previousValue}
            onChange={(e) => setForm((f) => ({ ...f, previousValue: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Value
          </label>
          <input
            type="number"
            step="any"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reading Date
          </label>
          <input
            type="date"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.readingDate}
            onChange={(e) => setForm((f) => ({ ...f, readingDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Read By
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.readBy}
            onChange={(e) => setForm((f) => ({ ...f, readBy: e.target.value }))}
            placeholder="Technician name"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Additional notes..."
          />
        </div>
      </div>
    </div>
  );

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Meter Readings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track equipment meter readings and usage
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Log Reading
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: 'Total Readings',
              value: readings.length,
              icon: Gauge,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: "Today's Readings",
              value: readings.filter(
                (r) =>
                  r.readingDate &&
                  r.readingDate.slice(0, 10) === new Date().toISOString().slice(0, 10)
              ).length,
              icon: TrendingUp,
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Assets Tracked',
              value: new Set(readings.map((r) => r.asset)).size,
              icon: Gauge,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.bg}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search meter readings..."
                  placeholder="Search meter readings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <select
                aria-label="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="HOURS">Hours</option>
                <option value="CYCLES">Cycles</option>
                <option value="DISTANCE">Distance</option>
                <option value="ENERGY">Energy</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-amber-600" />
              Meter Readings ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {[
                        'Asset',
                        'Meter',
                        'Type',
                        'Previous',
                        'Current',
                        'Change',
                        'Date',
                        'Read By',
                        'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const change = r.value - (r.previousValue || 0);
                      return (
                        <tr key={r.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                            {r.asset}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{r.meter}</td>
                          <td className="py-3 px-4 text-gray-600">{r.meterType}</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                            {r.previousValue} {r.unit}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {r.value} {r.unit}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs font-medium ${change > 0 ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                              {change > 0 ? '+' : ''}
                              {change.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {r.readingDate ? new Date(r.readingDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{r.readBy || '-'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEdit(r)}
                                className="text-gray-400 dark:text-gray-500 hover:text-amber-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDelete(r)}
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
                <Gauge className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No meter readings found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Log Meter Reading"
        size="lg"
      >
        <FormFields />
        <ModalFooter>
          <button
            onClick={() => setCreateOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Log Reading'}
          </button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Reading" size="lg">
        <FormFields />
        <ModalFooter>
          <button
            onClick={() => setEditOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={saving}
            className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Reading"
        size="sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
            <Ban className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Delete this meter reading for <span className="font-semibold">{selected?.asset}</span>?
          </p>
        </div>
        <ModalFooter>
          <button
            onClick={() => setDeleteOpen(false)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Deleting...' : 'Delete'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
