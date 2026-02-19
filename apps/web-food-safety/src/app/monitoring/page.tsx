'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
} from '@ims/ui';
import { Plus, Search, Activity, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface MonitoringRecord {
  id: string;
  ccpId?: string;
  ccpName?: string;
  parameter?: string;
  value?: string | number;
  unit?: string;
  recordedAt?: string;
  recordedBy?: string;
  status: string;
  createdAt: string;
}

const initialForm = {
  ccpId: '',
  parameter: '',
  value: '',
  unit: '',
  recordedBy: '',
  notes: '',
  status: 'IN_CONTROL',
};

export default function MonitoringPage() {
  const [items, setItems] = useState<MonitoringRecord[]>([]);
  const [ccps, setCcps] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const [monRes, ccpRes] = await Promise.all([
        api.get(`/monitoring${params}`),
        api.get('/ccps'),
      ]);
      setItems(monRes.data.data || []);
      setCcps(ccpRes.data.data || []);
    } catch {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setFormError('');
    if (!form.parameter.trim()) {
      setFormError('Parameter is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = { parameter: form.parameter, status: form.status };
      if (form.ccpId) payload.ccpId = form.ccpId;
      if (form.value) payload.value = form.value;
      if (form.unit) payload.unit = form.unit;
      if (form.recordedBy) payload.recordedBy = form.recordedBy;
      if (form.notes) payload.notes = form.notes;
      await api.post('/monitoring', payload);
      setModalOpen(false);
      setForm(initialForm);
      load();
    } catch (e: any) {
      setFormError((e as any)?.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/monitoring/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const filtered = items.filter((i) =>
    JSON.stringify(i).toLowerCase().includes(search.toLowerCase())
  );
  const deviations = items.filter((i) => i.status === 'DEVIATION' || i.status === 'OUT_OF_CONTROL');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Monitoring Records
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">CCP monitoring data and results</p>
          </div>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => {
              setForm(initialForm);
              setFormError('');
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Reading
          </Button>
        </div>

        {deviations.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">
              {deviations.length} deviation{deviations.length > 1 ? 's' : ''} detected — immediate
              corrective action required
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Control</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter((i) => i.status === 'IN_CONTROL' || i.status === 'PASS').length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Deviations</p>
                  <p className="text-2xl font-bold text-red-600">{deviations.length}</p>
                </div>
                <Activity className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      items.filter(
                        (i) => new Date(i.createdAt).toDateString() === new Date().toDateString()
                      ).length
                    }
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search records..."
                  placeholder="Search records..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="IN_CONTROL">In Control</option>
                <option value="PASS">Pass</option>
                <option value="DEVIATION">Deviation</option>
                <option value="OUT_OF_CONTROL">Out of Control</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Records ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        CCP
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Parameter
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Value
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Recorded By
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Date
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
                      <tr
                        key={r.id}
                        className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${r.status === 'DEVIATION' ? 'bg-red-50' : ''}`}
                      >
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          {r.ccpName || ccps.find((c) => c.id === r.ccpId)?.name || '—'}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {r.parameter || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {r.value !== undefined ? `${r.value} ${r.unit || ''}`.trim() : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.recordedBy || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.recordedAt
                            ? new Date(r.recordedAt).toLocaleString()
                            : new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              r.status === 'IN_CONTROL' || r.status === 'PASS'
                                ? 'bg-green-100 text-green-700'
                                : r.status === 'DEVIATION'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {r.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No monitoring records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Monitoring Reading"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CCP</label>
              <select
                value={form.ccpId}
                onChange={(e) => setForm({ ...form, ccpId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">Select CCP</option>
                {ccps.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parameter *</label>
              <input
                value={form.parameter}
                onChange={(e) => setForm({ ...form, parameter: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. Temperature"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Value</label>
              <input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. 76.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="°C"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recorded By</label>
              <input
                value={form.recordedBy}
                onChange={(e) => setForm({ ...form, recordedBy: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="IN_CONTROL">In Control</option>
                <option value="PASS">Pass</option>
                <option value="DEVIATION">Deviation</option>
                <option value="OUT_OF_CONTROL">Out of Control</option>
              </select>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Log Reading'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
