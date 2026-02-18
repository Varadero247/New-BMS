'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Receipt, Plus, Check, X, DollarSign, Clock } from 'lucide-react';

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  vendor: string | null;
  status: string;
  expenseDate: string;
  submittedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  receiptUrl: string | null;
  createdAt: string;
}

interface Summary {
  totalApproved: { amount: number; count: number };
  totalPending: { amount: number; count: number };
}

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  SUBMITTED: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  APPROVED: { bg: 'bg-green-500/20', text: 'text-green-400' },
  REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400' },
  PAID: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
};

const CATEGORIES = ['SOFTWARE', 'HARDWARE', 'TRAVEL', 'OFFICE', 'MARKETING', 'CONSULTING', 'OTHER'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'SOFTWARE',
    vendor: '',
    receiptUrl: '',
  });

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  async function loadData() {
    try {
      const params = categoryFilter ? `?category=${categoryFilter}` : '';
      const [expRes, sumRes] = await Promise.all([
        api.get(`/api/analytics/expenses${params}`),
        api.get('/api/analytics/expenses/summary'),
      ]);
      setExpenses(expRes.data.data?.expenses || []);
      setSummary(sumRes.data.data || null);
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      await api.post('/api/analytics/expenses', {
        title: form.title,
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        vendor: form.vendor || undefined,
        receiptUrl: form.receiptUrl || undefined,
      });
      setShowCreate(false);
      setForm({
        title: '',
        description: '',
        amount: '',
        category: 'SOFTWARE',
        vendor: '',
        receiptUrl: '',
      });
      loadData();
    } catch {
      // handle error
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.post(`/api/analytics/expenses/${id}/approve`);
      loadData();
    } catch {
      // handle error
    }
  }

  async function handleReject(id: string) {
    try {
      await api.post(`/api/analytics/expenses/${id}/reject`);
      loadData();
    } catch {
      // handle error
    }
  }

  const formatCurrency = (v: number) =>
    `£${Number(v || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#080B12]">
      <Sidebar />
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Receipt className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Expenses</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Expense
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#112240] border border-[#1B3A6B]/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400 dark:text-gray-500">Pending Approval</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(summary.totalPending.amount)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {summary.totalPending.count} expenses
              </div>
            </div>
            <div className="bg-[#112240] border border-[#1B3A6B]/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  Approved This Month
                </span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(summary.totalApproved.amount)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {summary.totalApproved.count} expenses
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#112240] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Expenses Table */}
        {loading ? (
          <div className="text-gray-400 dark:text-gray-500 text-center py-12">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500 text-center py-12">
            No expenses found.
          </div>
        ) : (
          <div className="bg-[#112240] border border-[#1B3A6B]/30 rounded-xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1B3A6B]/30">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Vendor
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const badge = STATUS_BADGES[expense.status] || STATUS_BADGES.DRAFT;
                  return (
                    <tr
                      key={expense.id}
                      className="border-b border-[#1B3A6B]/10 hover:bg-[#1B3A6B]/10 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <span className="text-white text-sm font-medium">{expense.title}</span>
                        {expense.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate max-w-xs">
                            {expense.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-gray-300 text-sm">{expense.category}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-white text-sm font-medium">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          {expense.vendor || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          {formatDate(expense.expenseDate)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {expense.status === 'SUBMITTED' && (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleApprove(expense.id)}
                              className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReject(expense.id)}
                              className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Expense Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#112240] border border-[#1B3A6B]/30 rounded-xl w-full max-w-lg p-6">
              <h2 className="text-lg font-bold text-white mb-4">New Expense</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                    Title
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Expense title"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                    Vendor
                  </label>
                  <input
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Optional vendor name"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 dark:text-gray-500 block mb-1">
                    Receipt URL
                  </label>
                  <input
                    value={form.receiptUrl}
                    onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#080B12] border border-[#1B3A6B]/40 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-400 dark:text-gray-500 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!form.title || !form.amount || !form.category}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Expense
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
