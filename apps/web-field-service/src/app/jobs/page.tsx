'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import {
  Plus,
  Search,
  Truck,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  Calendar } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Job {
  id: string;
  jobNumber?: string;
  referenceNumber?: string;
  title?: string;
  description?: string;
  customerName?: string;
  customer?: string;
  technicianName?: string;
  technician?: string;
  scheduledDate?: string;
  priority?: string;
  status?: string;
  siteAddress?: string;
  estimatedHours?: number;
  [key: string]: any;
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700' };

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  SCHEDULED: 'bg-purple-100 text-purple-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-600' };

const emptyForm = {
  title: '',
  description: '',
  customerName: '',
  technicianName: '',
  scheduledDate: '',
  priority: 'MEDIUM',
  status: 'SCHEDULED',
  siteAddress: '',
  estimatedHours: '' };

export default function JobsPage() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Job | null>(null);
  const [deleteItem, setDeleteItem] = useState<Job | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/jobs');
      setItems(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || JSON.stringify(i).toLowerCase().includes(q);
    const matchStatus = !statusFilter || i.status === statusFilter;
    const matchPriority = !priorityFilter || i.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const stats = {
    total: items.length,
    scheduled: items.filter((i) => i.status === 'SCHEDULED').length,
    inProgress: items.filter((i) => i.status === 'IN_PROGRESS').length,
    completed: items.filter((i) => i.status === 'COMPLETED').length,
    urgent: items.filter((i) => i.priority === 'URGENT').length };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };
  const openEdit = (item: Job) => {
    setEditItem(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      customerName: item.customerName || item.customer || '',
      technicianName: item.technicianName || item.technician || '',
      scheduledDate: item.scheduledDate ? item.scheduledDate.split('T')[0] : '',
      priority: item.priority || 'MEDIUM',
      status: item.status || 'SCHEDULED',
      siteAddress: item.siteAddress || '',
      estimatedHours: item.estimatedHours || '' });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.customerName) {
      setError('Title and customer are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) {
        await api.put(`/jobs/${editItem.id}`, form);
      } else {
        await api.post('/jobs', form);
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.message || 'Failed to save job.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/jobs/${deleteItem.id}`);
      setDeleteItem(null);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Jobs</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Dispatch board and job management
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" /> New Job
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                label: 'Total Jobs',
                value: stats.total,
                icon: Truck,
                bg: 'bg-sky-50',
                color: 'text-sky-600',
                border: 'border-sky-200' },
              {
                label: 'Scheduled',
                value: stats.scheduled,
                icon: Calendar,
                bg: 'bg-purple-50',
                color: 'text-purple-600',
                border: 'border-purple-200' },
              {
                label: 'In Progress',
                value: stats.inProgress,
                icon: PlayCircle,
                bg: 'bg-blue-50',
                color: 'text-blue-600',
                border: 'border-blue-200' },
              {
                label: 'Completed',
                value: stats.completed,
                icon: CheckCircle,
                bg: 'bg-green-50',
                color: 'text-green-600',
                border: 'border-green-200' },
              {
                label: 'Urgent',
                value: stats.urgent,
                icon: AlertCircle,
                bg: 'bg-red-50',
                color: 'text-red-600',
                border: 'border-red-200' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={`border ${s.border}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${s.bg}`}>
                        <Icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search jobs..."
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Statuses</option>
              {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PENDING', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Priorities</option>
              {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-sky-600" /> Jobs ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Job #</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Technician
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Scheduled
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Priority
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                            {item.jobNumber || item.referenceNumber || item.id?.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {item.title || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.customerName || item.customer || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.technicianName || item.technician || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.scheduledDate
                              ? new Date(item.scheduledDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[item.priority || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                            >
                              {item.priority || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[item.status || ''] || 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                            >
                              {item.status?.replace('_', ' ') || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteItem(item)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No jobs found</p>
                  <p className="text-sm mt-1">Create your first job to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Job' : 'New Job'}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. HVAC Maintenance Service"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer *
              </label>
              <input
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Technician
              </label>
              <input
                value={form.technicianName}
                onChange={(e) => setForm((f) => ({ ...f, technicianName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Assigned technician"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                value={form.estimatedHours}
                onChange={(e) => setForm((f) => ({ ...f, estimatedHours: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <option key={p} value={p}>
                    {p}
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
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PENDING', 'CANCELLED'].map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Address
              </label>
              <input
                value={form.siteAddress}
                onChange={(e) => setForm((f) => ({ ...f, siteAddress: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Service site address"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Job details..."
              />
            </div>
          </div>
        </div>
        <ModalFooter>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : editItem ? 'Update Job' : 'Create Job'}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} title="Delete Job" size="sm">
        <p className="text-sm text-gray-600">
          Are you sure you want to delete job{' '}
          <span className="font-semibold">{deleteItem?.title || deleteItem?.jobNumber}</span>? This
          action cannot be undone.
        </p>
        <ModalFooter>
          <button
            onClick={() => setDeleteItem(null)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
