'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Declaration {
  id: string;
  title: string;
  version: string;
  status: string;
  scope?: string;
  statement?: string;
  exclusions?: string;
  preparedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'EXPIRED'];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
};

export default function SelfDeclarationPage() {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDeclaration, setViewDeclaration] = useState<Declaration | null>(null);

  const [form, setForm] = useState({
    title: '',
    version: '1.0',
    status: 'DRAFT',
    scope: '',
    statement: '',
    exclusions: '',
    preparedBy: '',
    validFrom: '',
    validTo: '',
  });

  useEffect(() => {
    loadDeclarations();
  }, []);

  async function loadDeclarations() {
    try {
      setError(null);
      const res = await api.get('/self-declarations');
      setDeclarations(res.data.data || []);
    } catch (err) {
      console.error('Error loading declarations:', err);
      setError('Failed to load declarations.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingDeclaration(null);
    setForm({
      title: '',
      version: '1.0',
      status: 'DRAFT',
      scope: '',
      statement: '',
      exclusions: '',
      preparedBy: '',
      validFrom: '',
      validTo: '',
    });
    setModalOpen(true);
  }

  function openEditModal(declaration: Declaration) {
    setEditingDeclaration(declaration);
    setForm({
      title: declaration.title,
      version: declaration.version,
      status: declaration.status,
      scope: declaration.scope || '',
      statement: declaration.statement || '',
      exclusions: declaration.exclusions || '',
      preparedBy: declaration.preparedBy || '',
      validFrom: declaration.validFrom ? declaration.validFrom.split('T')[0] : '',
      validTo: declaration.validTo ? declaration.validTo.split('T')[0] : '',
    });
    setModalOpen(true);
  }

  function openViewModal(declaration: Declaration) {
    setViewDeclaration(declaration);
    setViewModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingDeclaration) {
        await api.put(`/self-declarations/${editingDeclaration.id}`, form);
      } else {
        await api.post('/self-declarations', form);
      }
      setModalOpen(false);
      loadDeclarations();
    } catch (err) {
      console.error('Error saving declaration:', err);
      setError('Failed to save declaration.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this declaration?')) return;
    try {
      await api.delete(`/self-declarations/${id}`);
      loadDeclarations();
    } catch (err) {
      console.error('Error deleting declaration:', err);
      setError('Failed to delete declaration.');
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Self-Declaration
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 42001 conformance self-declarations
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            New Declaration
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {declarations.length > 0 ? (
            declarations.map((declaration) => (
              <div
                key={declaration.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {declaration.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      v{declaration.version}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[declaration.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                  >
                    {declaration.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {declaration.scope && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{declaration.scope}</p>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1 mb-4">
                  {declaration.preparedBy && <p>Prepared by: {declaration.preparedBy}</p>}
                  {declaration.approvedBy && <p>Approved by: {declaration.approvedBy}</p>}
                  {declaration.validFrom && (
                    <p>
                      Valid: {new Date(declaration.validFrom).toLocaleDateString()} -{' '}
                      {declaration.validTo
                        ? new Date(declaration.validTo).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openViewModal(declaration)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    View
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => openEditModal(declaration)}
                    className="text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    Edit
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => handleDelete(declaration.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500 dark:text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>No self-declarations found</p>
              <p className="text-sm mt-1">Create a new declaration to get started</p>
            </div>
          )}
        </div>
      </div>

      {viewModalOpen && viewDeclaration && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setViewModalOpen(false)}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {viewDeclaration.title}
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Version</p>
                    <p className="text-sm font-medium">v{viewDeclaration.version}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[viewDeclaration.status]}`}
                    >
                      {viewDeclaration.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prepared By</p>
                    <p className="text-sm">{viewDeclaration.preparedBy || '-'}</p>
                  </div>
                </div>
                {viewDeclaration.scope && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scope</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {viewDeclaration.scope}
                    </p>
                  </div>
                )}
                {viewDeclaration.statement && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Statement of Conformance
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg whitespace-pre-wrap">
                      {viewDeclaration.statement}
                    </p>
                  </div>
                )}
                {viewDeclaration.exclusions && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exclusions</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {viewDeclaration.exclusions}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setModalOpen(false)}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {editingDeclaration ? 'Edit Declaration' : 'New Declaration'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={form.version}
                      onChange={(e) => setForm({ ...form, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prepared By
                    </label>
                    <input
                      type="text"
                      value={form.preparedBy}
                      onChange={(e) => setForm({ ...form, preparedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Scope
                  </label>
                  <textarea
                    value={form.scope}
                    onChange={(e) => setForm({ ...form, scope: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statement of Conformance
                  </label>
                  <textarea
                    value={form.statement}
                    onChange={(e) => setForm({ ...form, statement: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exclusions
                  </label>
                  <textarea
                    value={form.exclusions}
                    onChange={(e) => setForm({ ...form, exclusions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valid To
                    </label>
                    <input
                      type="date"
                      value={form.validTo}
                      onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {editingDeclaration ? 'Update' : 'Create'}
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
