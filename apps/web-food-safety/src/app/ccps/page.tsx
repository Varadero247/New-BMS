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
import { Plus, Search, Crosshair, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface CCP {
  id: string;
  name: string;
  processStep?: string;
  hazardType: string;
  criticalLimit?: string;
  monitoringFrequency?: string;
  correctiveAction?: string;
  status: string;
  createdAt: string;
}

const initialForm = {
  name: '',
  processStep: '',
  hazardType: 'BIOLOGICAL',
  criticalLimit: '',
  monitoringFrequency: 'CONTINUOUS',
  correctiveAction: '',
  status: 'ACTIVE',
};

export default function CCPsPage() {
  const [items, setItems] = useState<CCP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CCP | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/ccps');
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
  function openEdit(c: CCP) {
    setEditing(c);
    setForm({
      name: c.name,
      processStep: c.processStep || '',
      hazardType: c.hazardType,
      criticalLimit: c.criticalLimit || '',
      monitoringFrequency: c.monitoringFrequency || 'CONTINUOUS',
      correctiveAction: c.correctiveAction || '',
      status: c.status,
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/ccps/${editing.id}`, form);
      } else {
        await api.post('/ccps', form);
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
    if (!confirm('Delete this CCP?')) return;
    try {
      await api.delete(`/ccps/${id}`);
      load();
    } catch (e) {
      alert(axios.isAxiosError(e) && e.response?.data?.error?.message || 'Failed');
    }
  }

  const filtered = items.filter((i) =>
    JSON.stringify(i).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Critical Control Points
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage HACCP critical control points
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add CCP
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total CCPs</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <Crosshair className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter((i) => i.status === 'ACTIVE' || i.status === 'IN_CONTROL').length}
                  </p>
                </div>
                <Crosshair className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Needs Attention</p>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      items.filter((i) => i.status === 'DEVIATION' || i.status === 'OUT_OF_CONTROL')
                        .length
                    }
                  </p>
                </div>
                <Crosshair className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search CCPs..."
                placeholder="Search CCPs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crosshair className="h-5 w-5 text-orange-600" />
              CCPs ({filtered.length})
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
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Process Step
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Hazard Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Critical Limit
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Monitoring
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
                    {filtered.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {c.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{c.processStep || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{c.hazardType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{c.criticalLimit || '—'}</td>
                        <td className="py-3 px-4 text-gray-600">{c.monitoringFrequency || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              c.status === 'ACTIVE' || c.status === 'IN_CONTROL'
                                ? 'bg-green-100 text-green-700'
                                : c.status === 'DEVIATION'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {c.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
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
                <Crosshair className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No CCPs found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add CCP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit CCP' : 'Add CCP'}
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
              <label className="block text-sm font-medium mb-1">CCP Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Process Step</label>
              <input
                value={form.processStep}
                onChange={(e) => setForm({ ...form, processStep: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. Cooking, Cooling"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hazard Type</label>
              <select
                value={form.hazardType}
                onChange={(e) => setForm({ ...form, hazardType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="BIOLOGICAL">Biological</option>
                <option value="CHEMICAL">Chemical</option>
                <option value="PHYSICAL">Physical</option>
                <option value="ALLERGENIC">Allergenic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="IN_CONTROL">In Control</option>
                <option value="DEVIATION">Deviation</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Critical Limit</label>
              <input
                value={form.criticalLimit}
                onChange={(e) => setForm({ ...form, criticalLimit: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                placeholder="e.g. ≥75°C for 15s"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monitoring Frequency</label>
              <select
                value={form.monitoringFrequency}
                onChange={(e) => setForm({ ...form, monitoringFrequency: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="CONTINUOUS">Continuous</option>
                <option value="EVERY_BATCH">Every Batch</option>
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Corrective Action</label>
            <textarea
              value={form.correctiveAction}
              onChange={(e) => setForm({ ...form, correctiveAction: e.target.value })}
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
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
