'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ImpactAssessment {
  id: string;
  title: string;
  description?: string;
  system: string;
  impactLevel: string;
  status: string;
  assessor?: string;
  findings?: string;
  recommendations?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const impactLevelOptions = ['NEGLIGIBLE', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];
const statusOptions = ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'ARCHIVED'];

const impactColors: Record<string, string> = {
  NEGLIGIBLE: 'bg-gray-100 text-gray-700',
  LOW: 'bg-green-100 text-green-700',
  MODERATE: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  VERY_HIGH: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  APPROVED: 'bg-indigo-100 text-indigo-700',
  ARCHIVED: 'bg-orange-100 text-orange-700',
};

export default function ImpactAssessmentsPage() {
  const [assessments, setAssessments] = useState<ImpactAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<ImpactAssessment | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    system: '',
    impactLevel: 'MODERATE',
    status: 'DRAFT',
    assessor: '',
    findings: '',
    recommendations: '',
  });

  useEffect(() => {
    loadAssessments();
  }, []);

  async function loadAssessments() {
    try {
      setError(null);
      const res = await api.get('/impact-assessments');
      setAssessments(res.data.data || []);
    } catch (err) {
      console.error('Error loading impact assessments:', err);
      setError('Failed to load impact assessments.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingAssessment(null);
    setForm({ title: '', description: '', system: '', impactLevel: 'MODERATE', status: 'DRAFT', assessor: '', findings: '', recommendations: '' });
    setModalOpen(true);
  }

  function openEditModal(assessment: ImpactAssessment) {
    setEditingAssessment(assessment);
    setForm({
      title: assessment.title,
      description: assessment.description || '',
      system: assessment.system,
      impactLevel: assessment.impactLevel,
      status: assessment.status,
      assessor: assessment.assessor || '',
      findings: assessment.findings || '',
      recommendations: assessment.recommendations || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingAssessment) {
        await api.put(`/impact-assessments/${editingAssessment.id}`, form);
      } else {
        await api.post('/impact-assessments', form);
      }
      setModalOpen(false);
      loadAssessments();
    } catch (err) {
      console.error('Error saving impact assessment:', err);
      setError('Failed to save impact assessment.');
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.put(`/impact-assessments/${id}`, { status: 'APPROVED', approvedBy: 'Current User' });
      loadAssessments();
    } catch (err) {
      console.error('Error approving assessment:', err);
      setError('Failed to approve assessment.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await api.delete(`/impact-assessments/${id}`);
      loadAssessments();
    } catch (err) {
      console.error('Error deleting assessment:', err);
      setError('Failed to delete assessment.');
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Impact Assessments</h1>
            <p className="text-gray-500 mt-1">AI system impact assessments per ISO 42001 Clause 6.1.4</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            New Assessment
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessor</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assessments.length > 0 ? (
                assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                      {assessment.description && <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{assessment.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{assessment.system}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${impactColors[assessment.impactLevel] || 'bg-gray-100 text-gray-700'}`}>
                        {assessment.impactLevel.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[assessment.status] || 'bg-gray-100 text-gray-700'}`}>
                        {assessment.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{assessment.assessor || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(assessment)} className="text-indigo-600 hover:text-indigo-700 text-sm mr-3">Edit</button>
                      {assessment.status === 'COMPLETED' && (
                        <button onClick={() => handleApprove(assessment.id)} className="text-green-600 hover:text-green-700 text-sm mr-3">Approve</button>
                      )}
                      <button onClick={() => handleDelete(assessment.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No impact assessments found</td>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingAssessment ? 'Edit Assessment' : 'New Impact Assessment'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AI System</label>
                    <input type="text" value={form.system} onChange={(e) => setForm({ ...form, system: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessor</label>
                    <input type="text" value={form.assessor} onChange={(e) => setForm({ ...form, assessor: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Impact Level</label>
                    <select value={form.impactLevel} onChange={(e) => setForm({ ...form, impactLevel: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {impactLevelOptions.map((l) => <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Findings</label>
                  <textarea value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                  <textarea value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    {editingAssessment ? 'Update' : 'Create'}
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
