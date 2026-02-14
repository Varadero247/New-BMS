'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TrainingRecord {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  completionRate: number;
  dueDate?: string;
  participants?: string;
  facilitator?: string;
  createdAt: string;
  updatedAt: string;
}

const typeOptions = ['ONLINE', 'CLASSROOM', 'WORKSHOP'];
const statusOptions = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];

const typeColors: Record<string, string> = {
  ONLINE: 'bg-blue-100 text-blue-700',
  CLASSROOM: 'bg-indigo-100 text-indigo-700',
  WORKSHOP: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

function getCompletionColor(rate: number): string {
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function TrainingPage() {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'ONLINE',
    status: 'SCHEDULED',
    completionRate: 0,
    dueDate: '',
    participants: '',
    facilitator: '',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      setError(null);
      const res = await api.get('/training');
      setRecords(res.data.data || []);
    } catch (err) {
      console.error('Error loading training records:', err);
      setError('Failed to load training records.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingRecord(null);
    setForm({ title: '', description: '', type: 'ONLINE', status: 'SCHEDULED', completionRate: 0, dueDate: '', participants: '', facilitator: '' });
    setModalOpen(true);
  }

  function openEditModal(record: TrainingRecord) {
    setEditingRecord(record);
    setForm({
      title: record.title,
      description: record.description || '',
      type: record.type,
      status: record.status,
      completionRate: record.completionRate,
      dueDate: record.dueDate ? record.dueDate.split('T')[0] : '',
      participants: record.participants || '',
      facilitator: record.facilitator || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/training/${editingRecord.id}`, form);
      } else {
        await api.post('/training', form);
      }
      setModalOpen(false);
      loadRecords();
    } catch (err) {
      console.error('Error saving training record:', err);
      setError('Failed to save training record.');
    }
  }

  async function handleMarkComplete(id: string) {
    try {
      await api.put(`/training/${id}`, { status: 'COMPLETED', completionRate: 100 });
      loadRecords();
    } catch (err) {
      console.error('Error completing training:', err);
      setError('Failed to mark training as complete.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this training record?')) return;
    try {
      await api.delete(`/training/${id}`);
      loadRecords();
    } catch (err) {
      console.error('Error deleting training record:', err);
      setError('Failed to delete training record.');
    }
  }

  function isOverdue(record: TrainingRecord): boolean {
    if (record.status === 'COMPLETED') return false;
    if (!record.dueDate) return false;
    return new Date(record.dueDate) < new Date();
  }

  const filtered = records.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterType && r.type !== filterType) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !(r.participants || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const scheduledCount = records.filter((r) => r.status === 'SCHEDULED').length;
  const inProgressCount = records.filter((r) => r.status === 'IN_PROGRESS').length;
  const completedCount = records.filter((r) => r.status === 'COMPLETED').length;
  const overdueCount = records.filter((r) => isOverdue(r)).length;
  const avgCompletion = records.length > 0 ? Math.round(records.reduce((sum, r) => sum + r.completionRate, 0) / records.length) : 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Anti-Bribery Training</h1>
            <p className="text-gray-500 mt-1">Track anti-bribery training records and completion rates</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
            Schedule Training
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Avg. Completion</p>
            <p className="text-2xl font-bold text-rose-600">{avgCompletion}%</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div className={`rounded-full h-1.5 ${getCompletionColor(avgCompletion)}`} style={{ width: `${avgCompletion}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Scheduled</p>
            <p className="text-2xl font-bold text-gray-600">{scheduledCount}</p>
            <p className="text-xs text-gray-400 mt-1">upcoming</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
            <p className="text-xs text-gray-400 mt-1">active</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            <p className="text-xs text-gray-400 mt-1">finished</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Overdue</p>
            <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>{overdueCount}</p>
            <p className="text-xs text-gray-400 mt-1">past due date</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by title or participants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Types</option>
              {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="">All Statuses</option>
              {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participants</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map((record) => {
                  const overdue = isOverdue(record);
                  return (
                    <tr key={record.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{record.title}</p>
                        {record.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{record.description}</p>}
                        {record.facilitator && <p className="text-xs text-gray-400 mt-0.5">Facilitator: {record.facilitator}</p>}
                        {overdue && <span className="inline-flex mt-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">OVERDUE</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors[record.type] || 'bg-gray-100 text-gray-700'}`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[record.status] || 'bg-gray-100 text-gray-700'}`}>
                          {record.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className={`rounded-full h-2 ${getCompletionColor(record.completionRate)}`} style={{ width: `${Math.min(100, record.completionRate)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{record.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <span className="truncate block">{record.participants || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {record.status !== 'COMPLETED' && (
                          <button onClick={() => handleMarkComplete(record.id)} className="text-green-600 hover:text-green-700 text-sm mr-2">Complete</button>
                        )}
                        <button onClick={() => openEditModal(record)} className="text-rose-600 hover:text-rose-700 text-sm mr-2">Edit</button>
                        <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {records.length === 0 ? 'No training records found. Schedule one to get started.' : 'No training records match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{editingRecord ? 'Edit Training' : 'Schedule Training'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Anti-Bribery Awareness for New Joiners"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Overview of training content and objectives..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completion Rate (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={form.completionRate}
                      onChange={(e) => setForm({ ...form, completionRate: parseInt(e.target.value) })}
                      className="flex-1 accent-rose-600"
                    />
                    <span className="text-sm font-semibold text-gray-700 w-12 text-right">{form.completionRate}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div className={`rounded-full h-2 transition-all ${getCompletionColor(form.completionRate)}`} style={{ width: `${form.completionRate}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
                    <input
                      type="text"
                      value={form.participants}
                      onChange={(e) => setForm({ ...form, participants: e.target.value })}
                      placeholder="e.g. All Staff, Sales Team, Board"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facilitator</label>
                    <input
                      type="text"
                      value={form.facilitator}
                      onChange={(e) => setForm({ ...form, facilitator: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                    {editingRecord ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
