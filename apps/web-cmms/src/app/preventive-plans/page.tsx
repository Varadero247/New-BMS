'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import {
  Plus,
  Search,
  CalendarCheck,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { api } from '@/lib/api';

interface PreventivePlan {
  id: string;
  name: string;
  description: string;
  asset: string;
  assetId: string;
  frequency: string;
  frequencyUnit: string;
  lastCompleted: string;
  nextDue: string;
  assignedTo: string;
  estimatedHours: number;
  status: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  asset: '',
  frequency: '1',
  frequencyUnit: 'MONTHS',
  nextDue: '',
  assignedTo: '',
  estimatedHours: '',
  status: 'ACTIVE',
};

export default function PreventivePlansPage() {
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<PreventivePlan | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/preventive-plans');
      setPlans(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = plans.filter((p) => {
    const matchesSearch =
      !searchTerm || JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: plans.filter((p) => p.status === 'ACTIVE').length,
    overdue: plans.filter((p) => p.nextDue && new Date(p.nextDue) < new Date()).length,
    dueThisWeek: plans.filter((p) => {
      if (!p.nextDue) return false;
      const due = new Date(p.nextDue);
      const now = new Date();
      const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return due >= now && due <= week;
    }).length,
    total: plans.length,
  };

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setError('');
    setCreateOpen(true);
  }
  function openEdit(p: PreventivePlan) {
    setSelected(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      asset: p.asset || '',
      frequency: p.frequency?.toString() || '1',
      frequencyUnit: p.frequencyUnit || 'MONTHS',
      nextDue: p.nextDue ? p.nextDue.slice(0, 10) : '',
      assignedTo: p.assignedTo || '',
      estimatedHours: p.estimatedHours?.toString() || '',
      status: p.status || 'ACTIVE',
    });
    setError('');
    setEditOpen(true);
  }
  function openDelete(p: PreventivePlan) {
    setSelected(p);
    setDeleteOpen(true);
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      setError('Plan name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/preventive-plans', {
        ...form,
        frequency: parseInt(form.frequency) || 1,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
      });
      setCreateOpen(false);
      await load();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to create plan');
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit() {
    if (!form.name.trim()) {
      setError('Plan name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.put(`/preventive-plans/${selected!.id}`, {
        ...form,
        frequency: parseInt(form.frequency) || 1,
        estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
      });
      setEditOpen(false);
      await load();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api.delete(`/preventive-plans/${selected!.id}`);
      setDeleteOpen(false);
      await load();
    } catch (e: unknown) {
      setError(e?.response?.data?.error || 'Failed to delete');
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
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Plan Name *
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Monthly Oil Change"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe the maintenance tasks..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Asset
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.asset}
            onChange={(e) => setForm((f) => ({ ...f, asset: e.target.value }))}
            placeholder="Asset name or tag"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assigned To
          </label>
          <input
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.assignedTo}
            onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
            placeholder="Technician name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Frequency
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="w-20 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
            />
            <select
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.frequencyUnit}
              onChange={(e) => setForm((f) => ({ ...f, frequencyUnit: e.target.value }))}
            >
              <option value="DAYS">Days</option>
              <option value="WEEKS">Weeks</option>
              <option value="MONTHS">Months</option>
              <option value="YEARS">Years</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimated Hours
          </label>
          <input
            type="number"
            step="0.5"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.estimatedHours}
            onChange={(e) => setForm((f) => ({ ...f, estimatedHours: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Next Due Date
          </label>
          <input
            type="date"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.nextDue}
            onChange={(e) => setForm((f) => ({ ...f, nextDue: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );

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
              Preventive Maintenance Plans
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Schedule and manage preventive maintenance
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Plan
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Plans',
              value: stats.total,
              icon: CalendarCheck,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Active',
              value: stats.active,
              icon: CheckCircle,
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Overdue',
              value: stats.overdue,
              icon: AlertCircle,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              label: 'Due This Week',
              value: stats.dueThisWeek,
              icon: Clock,
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
                  aria-label="Search plans..."
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-amber-600" />
              PM Plans ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Asset
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Frequency
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Last Completed
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Next Due
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Assigned To
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((plan) => {
                      const isOverdue = plan.nextDue && new Date(plan.nextDue) < new Date();
                      return (
                        <tr key={plan.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                            {plan.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{plan.asset}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {plan.frequency} {plan.frequencyUnit || ''}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {plan.lastCompleted
                              ? new Date(plan.lastCompleted).toLocaleDateString()
                              : '-'}
                          </td>
                          <td
                            className={`py-3 px-4 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}
                          >
                            {plan.nextDue ? new Date(plan.nextDue).toLocaleDateString() : '-'}
                            {isOverdue && ' (Overdue)'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{plan.assignedTo || '-'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[plan.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                            >
                              {plan.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEdit(plan)}
                                className="text-gray-400 dark:text-gray-500 hover:text-amber-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDelete(plan)}
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
                <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No preventive plans found</p>
                <p className="text-sm mt-1">Create your first PM plan to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add PM Plan" size="lg">
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
            {saving ? 'Saving...' : 'Add Plan'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit PM Plan" size="lg">
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete PM Plan"
        size="sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
            <Ban className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <span className="font-semibold">{selected?.name}</span>?
            This action cannot be undone.
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
