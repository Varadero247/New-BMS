'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Policy {
  id: string;
  title: string;
  description?: string;
  policyType: string;
  status: string;
  version: string;
  approvedBy?: string;
  approvedAt?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

const policyTypeOptions = ['AI_GOVERNANCE', 'DATA_MANAGEMENT', 'ETHICS', 'RISK_MANAGEMENT', 'TRANSPARENCY', 'HUMAN_OVERSIGHT', 'SECURITY', 'PRIVACY', 'OTHER'];
const statusOptions = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-orange-100 text-orange-700',
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    policyType: 'AI_GOVERNANCE',
    status: 'DRAFT',
    version: '1.0',
    content: '',
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  async function loadPolicies() {
    try {
      setError(null);
      const res = await api.get('/policies');
      setPolicies(res.data.data || []);
    } catch (err) {
      console.error('Error loading policies:', err);
      setError('Failed to load policies.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingPolicy(null);
    setForm({ title: '', description: '', policyType: 'AI_GOVERNANCE', status: 'DRAFT', version: '1.0', content: '' });
    setModalOpen(true);
  }

  function openEditModal(policy: Policy) {
    setEditingPolicy(policy);
    setForm({
      title: policy.title,
      description: policy.description || '',
      policyType: policy.policyType,
      status: policy.status,
      version: policy.version,
      content: policy.content || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await api.put(`/policies/${editingPolicy.id}`, form);
      } else {
        await api.post('/policies', form);
      }
      setModalOpen(false);
      loadPolicies();
    } catch (err) {
      console.error('Error saving policy:', err);
      setError('Failed to save policy.');
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.put(`/policies/${id}`, { status: 'APPROVED', approvedBy: 'Current User' });
      loadPolicies();
    } catch (err) {
      console.error('Error approving policy:', err);
      setError('Failed to approve policy.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.delete(`/policies/${id}`);
      loadPolicies();
    } catch (err) {
      console.error('Error deleting policy:', err);
      setError('Failed to delete policy.');
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
            <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
            <p className="text-gray-500 mt-1">AI governance policies and documentation</p>
          </div>
          <button onClick={openAddModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Add Policy
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {policies.length > 0 ? (
                policies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{policy.title}</p>
                      {policy.description && <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{policy.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{policy.policyType.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[policy.status] || 'bg-gray-100 text-gray-700'}`}>
                        {policy.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">v{policy.version}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{policy.approvedBy || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(policy)} className="text-indigo-600 hover:text-indigo-700 text-sm mr-3">Edit</button>
                      {policy.status === 'UNDER_REVIEW' && (
                        <button onClick={() => handleApprove(policy.id)} className="text-green-600 hover:text-green-700 text-sm mr-3">Approve</button>
                      )}
                      <button onClick={() => handleDelete(policy.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No policies found</td>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editingPolicy ? 'Edit Policy' : 'Add Policy'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={3} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.policyType} onChange={(e) => setForm({ ...form, policyType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {policyTypeOptions.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {statusOptions.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input type="text" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={5} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    {editingPolicy ? 'Update' : 'Create'}
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
