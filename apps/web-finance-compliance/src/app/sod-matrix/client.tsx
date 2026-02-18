'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Grid3X3, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Modal } from '@ims/ui';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface SodRule {
  id: string;
  role1: string;
  role2: string;
  conflictType?: string;
  description?: string;
  mitigatingControl?: string;
  isActive: boolean;
  createdAt: string;
}

const CONFLICT_TYPES = [
  'Authorization',
  'Custody',
  'Reconciliation',
  'Recording',
  'Approval',
  'Execution',
];

const ROLE_OPTIONS = [
  'Accounts Payable Clerk',
  'Accounts Receivable Clerk',
  'Bank Reconciliation',
  'Budget Approver',
  'Cash Handler',
  'CFO',
  'Controller',
  'Credit Manager',
  'Financial Analyst',
  'General Ledger',
  'Internal Auditor',
  'Inventory Manager',
  'IT Administrator',
  'Journal Entry Creator',
  'Payroll Administrator',
  'Procurement Officer',
  'Purchase Order Approver',
  'Tax Analyst',
  'Treasury Manager',
  'Vendor Master Editor',
];

const emptyForm = {
  role1: '',
  role2: '',
  conflictType: '',
  description: '',
  mitigatingControl: '',
  isActive: true,
};

export default function SodMatrixClient() {
  const [items, setItems] = useState<SodRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await api.get('/sod-matrix');
      setItems(res.data.data || []);
      setError('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load SoD rules');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.role1.trim() || !form.role2.trim()) return;
    if (form.role1 === form.role2) {
      alert('Role 1 and Role 2 must be different');
      return;
    }
    setSaving(true);
    try {
      await api.post('/sod-matrix', form);
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      alert(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.role1.toLowerCase().includes(search.toLowerCase()) ||
      item.role2.toLowerCase().includes(search.toLowerCase()) ||
      item.conflictType?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchActive =
      activeFilter === ''
        ? true
        : activeFilter === 'active'
          ? item.isActive !== false
          : item.isActive === false;
    return matchSearch && matchActive;
  });

  const activeCount = items.filter((i) => i.isActive !== false).length;
  const inactiveCount = items.length - activeCount;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Separation of Duties Matrix
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Define and manage role conflict rules
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Rule
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Rules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{items.length}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Active Conflicts</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {activeCount}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Mitigated / Inactive</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{inactiveCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles, conflict types..."
                aria-label="Search SoD rules"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              aria-label="Filter by active status"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Rules</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No SoD rules found</p>
              <p className="text-sm mt-1">
                {search || activeFilter
                  ? 'Try adjusting your filters'
                  : 'Define your first separation of duties rule'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Role 1
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Conflict
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Role 2
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Conflict Type
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Mitigating Control
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        item.isActive !== false
                          ? 'bg-white dark:bg-gray-900'
                          : 'bg-gray-50 dark:bg-gray-900/50 opacity-75'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
                          {item.role1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <AlertTriangle
                          className={`h-4 w-4 mx-auto ${
                            item.isActive !== false ? 'text-red-500' : 'text-gray-400'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium">
                          {item.role2}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {item.conflictType || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {item.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {item.mitigatingControl || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                            <ToggleRight className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                            <ToggleLeft className="h-4 w-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New SoD Rule" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role 1 *
              </label>
              <select
                value={form.role1}
                onChange={(e) => setForm({ ...form, role1: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select role</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role 2 *
              </label>
              <select
                value={form.role2}
                onChange={(e) => setForm({ ...form, role2: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select role</option>
                {ROLE_OPTIONS.filter((r) => r !== form.role1).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conflict Type
            </label>
            <select
              value={form.conflictType}
              onChange={(e) => setForm({ ...form, conflictType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select conflict type</option>
              {CONFLICT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="Why do these roles conflict?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mitigating Control
            </label>
            <textarea
              value={form.mitigatingControl}
              onChange={(e) => setForm({ ...form, mitigatingControl: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="Describe the compensating control, if any..."
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">Active conflict rule</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.role1.trim() || !form.role2.trim()}
              className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
