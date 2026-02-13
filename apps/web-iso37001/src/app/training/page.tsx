'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface TrainingRecord {
  id: string;
  title: string;
  description?: string;
  trainingType: string;
  targetAudience: string;
  instructor?: string;
  scheduledDate: string;
  completionDate?: string;
  status: string;
  attendees: number;
  completedCount: number;
  duration?: string;
  materials?: string;
  createdAt: string;
  updatedAt: string;
}

const trainingTypeOptions = ['ANTI_BRIBERY_AWARENESS', 'POLICY_TRAINING', 'DUE_DILIGENCE', 'GIFTS_HOSPITALITY', 'WHISTLEBLOWING', 'RISK_ASSESSMENT', 'MANAGEMENT_TRAINING', 'REFRESHER', 'OTHER'];
const targetAudienceOptions = ['ALL_STAFF', 'MANAGEMENT', 'SALES', 'PROCUREMENT', 'FINANCE', 'COMPLIANCE', 'BOARD', 'THIRD_PARTIES', 'NEW_JOINERS'];
const statusOptions = ['PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const statusColors: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function TrainingPage() {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    trainingType: 'ANTI_BRIBERY_AWARENESS',
    targetAudience: 'ALL_STAFF',
    instructor: '',
    scheduledDate: '',
    completionDate: '',
    status: 'PLANNED',
    attendees: 0,
    completedCount: 0,
    duration: '',
    materials: '',
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
    setForm({ title: '', description: '', trainingType: 'ANTI_BRIBERY_AWARENESS', targetAudience: 'ALL_STAFF', instructor: '', scheduledDate: '', completionDate: '', status: 'PLANNED', attendees: 0, completedCount: 0, duration: '', materials: '' });
    setModalOpen(true);
  }

  function openEditModal(record: TrainingRecord) {
    setEditingRecord(record);
    setForm({
      title: record.title,
      description: record.description || '',
      trainingType: record.trainingType,
      targetAudience: record.targetAudience,
      instructor: record.instructor || '',
      scheduledDate: record.scheduledDate ? record.scheduledDate.split('T')[0] : '',
      completionDate: record.completionDate ? record.completionDate.split('T')[0] : '',
      status: record.status,
      attendees: record.attendees,
      completedCount: record.completedCount,
      duration: record.duration || '',
      materials: record.materials || '',
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
    if (record.status === 'COMPLETED' || record.status === 'CANCELLED') return false;
    if (!record.scheduledDate) return false;
    return new Date(record.scheduledDate) < new Date();
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
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
            <h1 className="text-3xl font-bold text-gray-900">Training</h1>
            <p className="text-gray-500 mt-1">Anti-bribery training records and completion tracking</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
            Schedule Training
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Training</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length > 0 ? (
                records.map((record) => {
                  const overdue = isOverdue(record);
                  const completionRate = record.attendees > 0 ? Math.round((record.completedCount / record.attendees) * 100) : 0;
                  return (
                    <tr key={record.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{record.title}</p>
                        {record.instructor && <p className="text-xs text-gray-500">Instructor: {record.instructor}</p>}
                        {overdue && <span className="text-xs text-red-600 font-medium">OVERDUE</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.trainingType.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.targetAudience.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className={`rounded-full h-2 ${completionRate === 100 ? 'bg-green-500' : completionRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${completionRate}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{record.completedCount}/{record.attendees}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.scheduledDate ? new Date(record.scheduledDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[record.status] || 'bg-gray-100 text-gray-700'}`}>
                          {record.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(record)} className="text-rose-600 hover:text-rose-700 text-sm mr-3">Edit</button>
                        <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No training records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setModalOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingRecord ? 'Edit Training' : 'Schedule Training'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.trainingType} onChange={(e) => setForm({ ...form, trainingType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {trainingTypeOptions.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {targetAudienceOptions.map((a) => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                    <input type="text" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input type="text" placeholder="e.g. 2 hours" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                      {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                    <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                    <input type="date" value={form.completionDate} onChange={(e) => setForm({ ...form, completionDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Attendees</label>
                    <input type="number" min={0} value={form.attendees} onChange={(e) => setForm({ ...form, attendees: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completed Count</label>
                    <input type="number" min={0} value={form.completedCount} onChange={(e) => setForm({ ...form, completedCount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
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
