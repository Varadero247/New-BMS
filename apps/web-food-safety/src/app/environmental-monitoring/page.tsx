'use client';
import axios from 'axios';

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
import { Plus, Search, Microscope, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface EnvMonRecord {
  id: string;
  location?: string;
  zone?: string;
  testType?: string;
  organism?: string;
  sampleDate?: string;
  result?: string;
  value?: string | number;
  unit?: string;
  limit?: string;
  performedBy?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PASS: 'bg-green-100 text-green-700',
  FAIL: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RETEST_REQUIRED: 'bg-orange-100 text-orange-700',
};

const initialForm = {
  location: '',
  testType: 'SWAB',
  organism: '',
  sampleDate: '',
  result: '',
  value: '',
  unit: 'CFU/cm²',
  limit: '',
  performedBy: '',
  notes: '',
  status: 'PENDING',
};

export default function EnvironmentalMonitoringPage() {
  const [items, setItems] = useState<EnvMonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EnvMonRecord | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/environmental-monitoring${params}`);
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  }
  function openEdit(r: EnvMonRecord) {
    setEditing(r);
    setForm({
      location: r.location || r.zone || '',
      testType: r.testType || 'SWAB',
      organism: r.organism || '',
      sampleDate: r.sampleDate ? r.sampleDate.split('T')[0] : '',
      result: r.result || '',
      value: r.value?.toString() || '',
      unit: r.unit || 'CFU/cm²',
      limit: r.limit || '',
      performedBy: r.performedBy || '',
      notes: r.notes || '',
      status: r.status,
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.location.trim()) {
      setFormError('Location is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        location: form.location,
        testType: form.testType,
        status: form.status,
      };
      if (form.organism) payload.organism = form.organism;
      if (form.sampleDate) payload.sampleDate = form.sampleDate;
      if (form.result) payload.result = form.result;
      if (form.value) payload.value = form.value;
      if (form.unit) payload.unit = form.unit;
      if (form.limit) payload.limit = form.limit;
      if (form.performedBy) payload.performedBy = form.performedBy;
      if (form.notes) payload.notes = form.notes;
      if (editing) {
        await api.put(`/environmental-monitoring/${editing.id}`, payload);
      } else {
        await api.post('/environmental-monitoring', payload);
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setFormError(axios.isAxiosError(e) && e.response?.data?.error?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/environmental-monitoring/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const filtered = items.filter((i) => {
    const loc = i.location || i.zone || '';
    return (
      loc.toLowerCase().includes(search.toLowerCase()) ||
      (i.organism || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const fails = items.filter((i) => i.status === 'FAIL' || i.status === 'RETEST_REQUIRED');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Environmental Monitoring
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Microbiological and chemical environmental testing
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Log Sample
          </Button>
        </div>

        {fails.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">
              {fails.length} sample{fails.length > 1 ? 's' : ''} failed or require retest —
              immediate investigation required
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Samples</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Microscope className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pass</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter((i) => i.status === 'PASS').length}
                  </p>
                </div>
                <Microscope className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fail / Retest</p>
                  <p className="text-2xl font-bold text-red-600">{fails.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      items.filter((i) => i.status === 'PENDING' || i.status === 'IN_PROGRESS')
                        .length
                    }
                  </p>
                </div>
                <Microscope className="h-8 w-8 text-yellow-500" />
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
                  aria-label="Search by location or organism..."
                  placeholder="Search by location or organism..."
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
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
                <option value="RETEST_REQUIRED">Retest Required</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-orange-600" />
              Environmental Samples ({filtered.length})
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
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Test Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Organism
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Result
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Limit
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Sample Date
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
                        className={`border-b hover:bg-gray-50 dark:bg-gray-800 ${r.status === 'FAIL' ? 'bg-red-50' : ''}`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {r.location || r.zone || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{r.testType || '—'}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{r.organism || '—'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {r.value !== undefined && r.value !== ''
                            ? `${r.value} ${r.unit || ''}`.trim()
                            : r.result || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.limit ? `< ${r.limit}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.sampleDate
                            ? new Date(r.sampleDate).toLocaleDateString()
                            : new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {r.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                              <Edit className="h-4 w-4" />
                            </Button>
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
                <Microscope className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No environmental monitoring records found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Sample
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Sample Record' : 'Log Environmental Sample'}
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
              <label className="block text-sm font-medium mb-1">Location / Zone *</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. Processing Line 1 - Zone 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Test Type</label>
              <select
                value={form.testType}
                onChange={(e) => setForm({ ...form, testType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="SWAB">Surface Swab</option>
                <option value="AIR_SAMPLE">Air Sample</option>
                <option value="WATER_TEST">Water Test</option>
                <option value="RINSE">Rinse Sample</option>
                <option value="ALLERGEN_SWAB">Allergen Swab</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target Organism</label>
              <input
                value={form.organism}
                onChange={(e) => setForm({ ...form, organism: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. Listeria, TVC, E.coli"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PASS">Pass</option>
                <option value="FAIL">Fail</option>
                <option value="RETEST_REQUIRED">Retest Required</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Result Value</label>
              <input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="CFU/cm²"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Limit</label>
              <input
                value={form.limit}
                onChange={(e) => setForm({ ...form, limit: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sample Date</label>
              <input
                type="date"
                value={form.sampleDate}
                onChange={(e) => setForm({ ...form, sampleDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Performed By</label>
              <input
                value={form.performedBy}
                onChange={(e) => setForm({ ...form, performedBy: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
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
            {submitting ? 'Saving...' : editing ? 'Update' : 'Log Sample'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
