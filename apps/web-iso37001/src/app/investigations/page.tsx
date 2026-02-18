'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Investigation {
  id: string;
  referenceNumber: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  findings?: string;
  outcome?: string;
  investigator?: string;
  createdAt: string;
  updatedAt: string;
}

const typeOptions = ['INTERNAL', 'EXTERNAL', 'WHISTLEBLOWER'];
const statusOptions = ['OPEN', 'INVESTIGATING', 'CONCLUDED', 'CLOSED'];

const typeColors: Record<string, string> = {
  INTERNAL: 'bg-blue-100 text-blue-700',
  EXTERNAL: 'bg-purple-100 text-purple-700',
  WHISTLEBLOWER: 'bg-orange-100 text-orange-700',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  INVESTIGATING: 'bg-yellow-100 text-yellow-700',
  CONCLUDED: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Investigation | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    referenceNumber: '',
    title: '',
    description: '',
    type: 'INTERNAL',
    status: 'OPEN',
    findings: '',
    outcome: '',
    investigator: '',
  });

  useEffect(() => {
    loadInvestigations();
  }, []);

  async function loadInvestigations() {
    try {
      setError(null);
      const res = await api.get('/investigations');
      setInvestigations(res.data.data || []);
    } catch (err) {
      console.error('Error loading investigations:', err);
      setError('Failed to load investigations.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingItem(null);
    const now = new Date();
    const refNum = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setForm({
      referenceNumber: refNum,
      title: '',
      description: '',
      type: 'INTERNAL',
      status: 'OPEN',
      findings: '',
      outcome: '',
      investigator: '',
    });
    setModalOpen(true);
  }

  function openEditModal(item: Investigation) {
    setEditingItem(item);
    setForm({
      referenceNumber: item.referenceNumber,
      title: item.title,
      description: item.description || '',
      type: item.type,
      status: item.status,
      findings: item.findings || '',
      outcome: item.outcome || '',
      investigator: item.investigator || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/investigations/${editingItem.id}`, form);
      } else {
        await api.post('/investigations', form);
      }
      setModalOpen(false);
      loadInvestigations();
    } catch (err) {
      console.error('Error saving investigation:', err);
      setError('Failed to save investigation.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this investigation?')) return;
    try {
      await api.delete(`/investigations/${id}`);
      loadInvestigations();
    } catch (err) {
      console.error('Error deleting investigation:', err);
      setError('Failed to delete investigation.');
    }
  }

  const filtered = investigations.filter((i) => {
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterType && i.type !== filterType) return false;
    if (
      search &&
      !i.title.toLowerCase().includes(search.toLowerCase()) &&
      !i.referenceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !(i.investigator || '').toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const openCount = investigations.filter((i) => i.status === 'OPEN').length;
  const investigatingCount = investigations.filter((i) => i.status === 'INVESTIGATING').length;
  const concludedCount = investigations.filter((i) => i.status === 'CONCLUDED').length;
  const closedCount = investigations.filter((i) => i.status === 'CLOSED').length;
  const whistleblowerCount = investigations.filter((i) => i.type === 'WHISTLEBLOWER').length;

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Investigations</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Anti-bribery investigation case log per ISO 37001
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            New Investigation
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
            <p className="text-2xl font-bold text-red-600">{openCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">active cases</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Investigating</p>
            <p className="text-2xl font-bold text-yellow-600">{investigatingCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">in progress</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Concluded</p>
            <p className="text-2xl font-bold text-blue-600">{concludedCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">findings issued</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
            <p className="text-2xl font-bold text-gray-600">{closedCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">resolved</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Whistleblower</p>
            <p className="text-2xl font-bold text-orange-600">{whistleblowerCount}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">reports</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              aria-label="Search by title, reference or investigator..."
              placeholder="Search by title, reference or investigator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <select
              aria-label="Filter by type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">All Types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
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

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Findings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Investigator
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 dark:bg-gray-800 ${item.status === 'OPEN' ? 'border-l-2 border-l-red-400' : ''}`}
                  >
                    <td className="px-6 py-4 text-sm font-mono text-rose-600 whitespace-nowrap">
                      {item.referenceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeColors[item.type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      <span className="truncate block">
                        {item.findings || (
                          <span className="text-gray-300 dark:text-gray-600 italic">Pending</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      <span className="truncate block">
                        {item.outcome || (
                          <span className="text-gray-300 dark:text-gray-600 italic">TBD</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {item.investigator || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-rose-600 hover:text-rose-700 text-sm mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {investigations.length === 0
                      ? 'No investigations found. Open a case to get started.'
                      : 'No investigations match your filters.'}
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
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setModalOpen(false)}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingItem ? 'Edit Investigation' : 'New Investigation'}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.referenceNumber}
                      onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                      placeholder="e.g. INV-2026-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      {typeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Brief title of the investigation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detailed description of the allegation or concern..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                      Investigator
                    </label>
                    <input
                      type="text"
                      value={form.investigator}
                      onChange={(e) => setForm({ ...form, investigator: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Findings
                  </label>
                  <textarea
                    value={form.findings}
                    onChange={(e) => setForm({ ...form, findings: e.target.value })}
                    placeholder="Key findings from the investigation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Outcome
                  </label>
                  <textarea
                    value={form.outcome}
                    onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                    placeholder="Final outcome, actions taken or recommendations..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows={2}
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
                    {editingItem ? 'Update' : 'Create'}
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
