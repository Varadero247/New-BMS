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
import { Plus, Search, GraduationCap, Edit, Trash2, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface TrainingRecord {
  id: string;
  title?: string;
  topic?: string;
  trainee?: string;
  traineeName?: string;
  trainer?: string;
  trainerName?: string;
  type?: string;
  duration?: number;
  durationUnit?: string;
  scheduledDate?: string;
  completedDate?: string;
  score?: number;
  passMark?: number;
  expiryDate?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const initialForm = {
  title: '',
  trainee: '',
  trainer: '',
  type: 'FOOD_SAFETY',
  duration: '',
  durationUnit: 'hours',
  scheduledDate: '',
  notes: '',
  passMark: '75',
  status: 'SCHEDULED',
};

export default function TrainingPage() {
  const [items, setItems] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingRecord | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function load() {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/training${params}`);
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
  function openEdit(r: TrainingRecord) {
    setEditing(r);
    setForm({
      title: r.title || r.topic || '',
      trainee: r.trainee || r.traineeName || '',
      trainer: r.trainer || r.trainerName || '',
      type: r.type || 'FOOD_SAFETY',
      duration: r.duration?.toString() || '',
      durationUnit: r.durationUnit || 'hours',
      scheduledDate: r.scheduledDate ? r.scheduledDate.split('T')[0] : '',
      notes: r.notes || '',
      passMark: r.passMark?.toString() || '75',
      status: r.status,
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSave() {
    setFormError('');
    if (!form.title.trim()) {
      setFormError('Training title is required');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = { title: form.title, type: form.type, status: form.status };
      if (form.trainee) payload.trainee = form.trainee;
      if (form.trainer) payload.trainer = form.trainer;
      if (form.duration) payload.duration = parseFloat(form.duration);
      if (form.durationUnit) payload.durationUnit = form.durationUnit;
      if (form.scheduledDate) payload.scheduledDate = form.scheduledDate;
      if (form.passMark) payload.passMark = parseInt(form.passMark);
      if (form.notes) payload.notes = form.notes;
      if (editing) {
        await api.put(`/training/${editing.id}`, payload);
      } else {
        await api.post('/training', payload);
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
    if (!confirm('Delete this training record?')) return;
    try {
      await api.delete(`/training/${id}`);
      load();
    } catch {
      alert('Failed');
    }
  }

  const filtered = items.filter((i) => {
    const title = i.title || i.topic || '';
    const trainee = i.trainee || i.traineeName || '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      trainee.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Food Safety Training
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Employee training records and competency tracking
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Training
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {items.filter((i) => i.status === 'SCHEDULED').length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {items.filter((i) => i.status === 'COMPLETED').length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expired/Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {items.filter((i) => i.status === 'EXPIRED' || i.status === 'FAILED').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-red-500" />
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
                  aria-label="Search by title or trainee..."
                  placeholder="Search by title or trainee..."
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
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-600" />
              Training Records ({filtered.length})
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
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Trainee
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Trainer
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Duration
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Scheduled
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Score
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
                          {r.title || r.topic || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{(r.type || '—').replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {r.trainee || r.traineeName || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.trainer || r.trainerName || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {r.duration ? `${r.duration} ${r.durationUnit || ''}`.trim() : '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                          {r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {r.score !== undefined ? (
                            <span
                              className={`font-medium ${r.score >= (r.passMark || 75) ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {r.score}%
                            </span>
                          ) : (
                            '—'
                          )}
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
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>No training records found</p>
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Training
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Training Record' : 'Add Training Record'}
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Training Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              placeholder="e.g. HACCP Awareness Training"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="FOOD_SAFETY">Food Safety</option>
                <option value="HACCP">HACCP</option>
                <option value="GMP">GMP</option>
                <option value="ALLERGEN">Allergen Awareness</option>
                <option value="HYGIENE">Personal Hygiene</option>
                <option value="INDUCTION">Induction</option>
                <option value="REFRESHER">Refresher</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Trainee</label>
              <input
                value={form.trainee}
                onChange={(e) => setForm({ ...form, trainee: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trainer</label>
              <input
                value={form.trainer}
                onChange={(e) => setForm({ ...form, trainer: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <select
                value={form.durationUnit}
                onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pass Mark (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.passMark}
                onChange={(e) => setForm({ ...form, passMark: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Scheduled Date</label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
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
            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
