'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { Modal } from '@ims/ui';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';

interface HmrcDeadline {
  id: string;
  title: string;
  description?: string;
  type?: string;
  dueDate: string;
  filingRef?: string;
  status?: string;
  submittedDate?: string;
  submittedBy?: string;
  notes?: string;
  createdAt: string;
}

const DEADLINE_TYPES = [
  'Corporation Tax',
  'VAT Return',
  'PAYE',
  'Self Assessment',
  'CIS Return',
  'P11D',
  'Annual Accounts',
  'Confirmation Statement',
  'Other',
];

const STATUS_OPTIONS = ['PENDING', 'SUBMITTED', 'OVERDUE', 'EXTENSION_REQUESTED'];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  PENDING: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  SUBMITTED: {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  OVERDUE: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  EXTENSION_REQUESTED: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

const emptyForm = {
  title: '',
  description: '',
  type: '',
  dueDate: '',
  filingRef: '',
  status: 'PENDING',
  submittedDate: '',
  submittedBy: '',
  notes: '',
};

export default function HmrcCalendarClient() {
  const [items, setItems] = useState<HmrcDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await api.get('/hmrc-calendar');
      setItems(res.data.data || []);
      setError('');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load deadlines');
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
    if (!form.title.trim() || !form.dueDate) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        submittedDate: form.submittedDate
          ? new Date(form.submittedDate).toISOString()
          : null,
      };
      await api.post('/hmrc-calendar', payload);
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      alert(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const now = new Date();

  function getDeadlineUrgency(dueDate: string, status?: string) {
    if (status === 'SUBMITTED') return 'submitted';
    const due = new Date(dueDate);
    if (due < now) return 'overdue';
    const daysUntil = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil <= 7) return 'urgent';
    if (daysUntil <= 30) return 'upcoming';
    return 'future';
  }

  const urgencyBorder: Record<string, string> = {
    overdue: 'border-l-4 border-l-red-500',
    urgent: 'border-l-4 border-l-amber-500',
    upcoming: 'border-l-4 border-l-blue-500',
    future: 'border-l-4 border-l-gray-300 dark:border-l-gray-600',
    submitted: 'border-l-4 border-l-emerald-500',
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.filingRef?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || item.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                HMRC Calendar
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Track tax filing deadlines and submissions
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Deadline
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search deadlines..."
                aria-label="Search deadlines"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by type"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Types</option>
              {DEADLINE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
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
                  className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No deadlines found</p>
              <p className="text-sm mt-1">
                {search || typeFilter
                  ? 'Try adjusting your filters'
                  : 'Add your first HMRC deadline'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const urgency = getDeadlineUrgency(item.dueDate, item.status);
                const cfg = statusConfig[item.status || 'PENDING'] || statusConfig.PENDING;
                const dueDate = new Date(item.dueDate);
                const daysUntil = Math.ceil(
                  (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-shadow ${urgencyBorder[urgency]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {item.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                            {cfg.icon}
                            {(item.status || 'PENDING').replace(/_/g, ' ')}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {item.type && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                              {item.type}
                            </span>
                          )}
                          {item.filingRef && (
                            <span>Ref: {item.filingRef}</span>
                          )}
                          {item.submittedDate && (
                            <span>
                              Submitted:{' '}
                              {new Date(item.submittedDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {dueDate.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            urgency === 'overdue'
                              ? 'text-red-600 font-semibold'
                              : urgency === 'urgent'
                              ? 'text-amber-600 font-semibold'
                              : urgency === 'submitted'
                              ? 'text-emerald-600'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {urgency === 'overdue'
                            ? `${Math.abs(daysUntil)} days overdue`
                            : urgency === 'submitted'
                            ? 'Filed'
                            : `${daysUntil} days remaining`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New HMRC Deadline"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Q4 VAT Return"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="Description of the filing..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select type</option>
                {DEADLINE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filing Reference
              </label>
              <input
                type="text"
                value={form.filingRef}
                onChange={(e) =>
                  setForm({ ...form, filingRef: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="UTR or reference number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Submitted Date
              </label>
              <input
                type="date"
                value={form.submittedDate}
                onChange={(e) =>
                  setForm({ ...form, submittedDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Submitted By
              </label>
              <input
                type="text"
                value={form.submittedBy}
                onChange={(e) =>
                  setForm({ ...form, submittedBy: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="Name of person who submitted"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
              placeholder="Additional notes..."
            />
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
              disabled={saving || !form.title.trim() || !form.dueDate}
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
