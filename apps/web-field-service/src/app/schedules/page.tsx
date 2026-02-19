'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Modal, ModalFooter } from '@ims/ui';
import { Plus, Search, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface Schedule {
  id: string;
  jobName?: string;
  title?: string;
  technicianName?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  timeSlot?: string;
  duration?: number;
  status?: string;
  type?: string;
  recurrence?: string;
  notes?: string;
  [key: string]: any;
}

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const emptyForm = {
  title: '',
  technicianName: '',
  scheduledDate: '',
  scheduledTime: '',
  duration: '',
  type: 'PREVENTIVE',
  recurrence: 'NONE',
  status: 'PENDING',
  notes: '',
};

export default function SchedulesPage() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Schedule | null>(null);
  const [deleteItem, setDeleteItem] = useState<Schedule | null>(null);
  const [form, setForm] = useState<Record<string, any>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/schedules');
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
    return (
      (!q || JSON.stringify(i).toLowerCase().includes(q)) &&
      (!statusFilter || i.status === statusFilter)
    );
  });

  const stats = {
    total: items.length,
    confirmed: items.filter((i) => i.status === 'CONFIRMED').length,
    pending: items.filter((i) => i.status === 'PENDING').length,
    cancelled: items.filter((i) => i.status === 'CANCELLED').length,
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };
  const openEdit = (item: Schedule) => {
    setEditItem(item);
    setForm({
      title: item.title || item.jobName || '',
      technicianName: item.technicianName || '',
      scheduledDate: item.scheduledDate ? item.scheduledDate.split('T')[0] : '',
      scheduledTime: item.scheduledTime || item.timeSlot || '',
      duration: item.duration || '',
      type: item.type || 'PREVENTIVE',
      recurrence: item.recurrence || 'NONE',
      status: item.status || 'PENDING',
      notes: item.notes || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editItem) await api.put(`/schedules/${editItem.id}`, form);
      else await api.post('/schedules', form);
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(axios.isAxiosError(e) && e.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await api.delete(`/schedules/${deleteItem.id}`);
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
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Schedules</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Service scheduling and calendar management
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2 font-medium"
            >
              <Plus className="h-5 w-5" /> New Schedule
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Schedules',
                value: stats.total,
                icon: Calendar,
                bg: 'bg-sky-50',
                color: 'text-sky-600',
                border: 'border-sky-200',
              },
              {
                label: 'Confirmed',
                value: stats.confirmed,
                icon: CheckCircle,
                bg: 'bg-green-50',
                color: 'text-green-600',
                border: 'border-green-200',
              },
              {
                label: 'Pending',
                value: stats.pending,
                icon: Clock,
                bg: 'bg-yellow-50',
                color: 'text-yellow-600',
                border: 'border-yellow-200',
              },
              {
                label: 'Cancelled',
                value: stats.cancelled,
                icon: XCircle,
                bg: 'bg-red-50',
                color: 'text-red-600',
                border: 'border-red-200',
              },
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

          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                aria-label="Search schedules..."
                placeholder="Search schedules..."
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
              {['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-sky-600" /> Schedules ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Job / Title
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Technician
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">
                          Recurrence
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-sky-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                            {item.title || item.jobName || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.technicianName || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.scheduledDate
                              ? new Date(item.scheduledDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.scheduledTime || item.timeSlot || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.type || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{item.recurrence || '-'}</td>
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
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40" />
                  <p className="font-medium">No schedules found</p>
                  <p className="text-sm mt-1">Create your first schedule to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Schedule' : 'New Schedule'}
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
                Title / Job Name *
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. Quarterly HVAC Inspection"
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
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['PREVENTIVE', 'REACTIVE', 'INSPECTION', 'INSTALLATION', 'EMERGENCY'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
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
                Time
              </label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (hrs)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recurrence
              </label>
              <select
                value={form.recurrence}
                onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'].map((r) => (
                  <option key={r} value={r}>
                    {r}
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
                {['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Additional notes..."
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
            {saving ? 'Saving...' : editItem ? 'Update Schedule' : 'Create Schedule'}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Delete Schedule"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Delete <span className="font-semibold">{deleteItem?.title || deleteItem?.jobName}</span>?
          This action cannot be undone.
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
