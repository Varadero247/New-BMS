'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Policy {
  id: string;
  title: string;
  content?: string;
  category: string;
  status: string;
  approvedBy?: string;
  effectiveDate?: string;
  createdAt: string;
  updatedAt: string;
}

const categoryOptions = [
  'ANTI_BRIBERY',
  'GIFTS',
  'WHISTLEBLOWING',
  'CONFLICT_OF_INTEREST',
  'SANCTIONS',
];
const statusOptions = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const categoryColors: Record<string, string> = {
  ANTI_BRIBERY: 'bg-rose-100 text-rose-700',
  GIFTS: 'bg-purple-100 text-purple-700',
  WHISTLEBLOWING: 'bg-orange-100 text-orange-700',
  CONFLICT_OF_INTEREST: 'bg-yellow-100 text-yellow-700',
  SANCTIONS: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-orange-100 text-orange-700',
};

const categoryLabels: Record<string, string> = {
  ANTI_BRIBERY: 'Anti-Bribery',
  GIFTS: 'Gifts & Hospitality',
  WHISTLEBLOWING: 'Whistleblowing',
  CONFLICT_OF_INTEREST: 'Conflict of Interest',
  SANCTIONS: 'Sanctions',
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [expandedContent, setExpandedContent] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'ANTI_BRIBERY',
    status: 'DRAFT',
    approvedBy: '',
    effectiveDate: '',
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
    setForm({
      title: '',
      content: '',
      category: 'ANTI_BRIBERY',
      status: 'DRAFT',
      approvedBy: '',
      effectiveDate: '',
    });
    setModalOpen(true);
  }

  function openEditModal(policy: Policy) {
    setEditingPolicy(policy);
    setForm({
      title: policy.title,
      content: policy.content || '',
      category: policy.category,
      status: policy.status,
      approvedBy: policy.approvedBy || '',
      effectiveDate: policy.effectiveDate ? policy.effectiveDate.split('T')[0] : '',
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

  async function handlePublish(id: string) {
    try {
      await api.put(`/policies/${id}`, { status: 'PUBLISHED' });
      loadPolicies();
    } catch (err) {
      console.error('Error publishing policy:', err);
      setError('Failed to publish policy.');
    }
  }

  async function handleArchive(id: string) {
    try {
      await api.put(`/policies/${id}`, { status: 'ARCHIVED' });
      loadPolicies();
    } catch (err) {
      console.error('Error archiving policy:', err);
      setError('Failed to archive policy.');
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

  const filtered = policies.filter((p) => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const draftCount = policies.filter((p) => p.status === 'DRAFT').length;
  const publishedCount = policies.filter((p) => p.status === 'PUBLISHED').length;
  const archivedCount = policies.filter((p) => p.status === 'ARCHIVED').length;

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Anti-Bribery Policies
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage anti-bribery policies per ISO 37001
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Add Policy
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Policies</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{policies.length}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">across all categories</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
            <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">live policies</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
            <p className="text-2xl font-bold text-gray-600">{draftCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">pending review</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Archived</p>
            <p className="text-2xl font-bold text-orange-600">{archivedCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">superseded</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              aria-label="Search policies..."
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <select
              aria-label="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Policy cards */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            {policies.length === 0
              ? 'No policies found. Add one to get started.'
              : 'No policies match your filters.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((policy) => (
              <div
                key={policy.id}
                className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${policy.status === 'ARCHIVED' ? 'opacity-60' : ''}`}
              >
                <div className="px-6 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {policy.title}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[policy.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                      >
                        {categoryLabels[policy.category] || policy.category}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[policy.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                      >
                        {policy.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {policy.approvedBy && <span>Approved by: {policy.approvedBy}</span>}
                      {policy.effectiveDate && (
                        <span>
                          Effective: {new Date(policy.effectiveDate).toLocaleDateString()}
                        </span>
                      )}
                      <span>Updated: {new Date(policy.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {policy.content && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedContent(expandedContent === policy.id ? null : policy.id)
                          }
                          className="text-xs text-rose-600 hover:underline"
                        >
                          {expandedContent === policy.id ? 'Hide content' : 'View content'}
                        </button>
                        {expandedContent === policy.id && (
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {policy.content}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {policy.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublish(policy.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    {policy.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleArchive(policy.id)}
                        className="px-3 py-1.5 bg-orange-100 text-orange-700 text-sm rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(policy)}
                      className="px-3 py-1.5 text-rose-600 border border-rose-200 text-sm rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="px-3 py-1.5 text-red-600 border border-red-200 text-sm rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setModalOpen(false)}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingPolicy ? 'Edit Policy' : 'Add Policy'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Anti-Bribery and Corruption Policy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {categoryLabels[c]}
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
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={form.effectiveDate}
                      onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Approved By
                  </label>
                  <input
                    type="text"
                    value={form.approvedBy}
                    onChange={(e) => setForm({ ...form, approvedBy: e.target.value })}
                    placeholder="Name of approver"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Policy Content
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Full policy text or summary..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows={8}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
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
