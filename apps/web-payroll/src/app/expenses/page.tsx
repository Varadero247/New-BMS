'use client';

import { useState, useEffect } from 'react';
import { Plus, Receipt, DollarSign, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { Modal } from '@ims/ui';
import api, { aiApi } from '@/lib/api';

interface Expense {
  id: string;
  expenseNumber: string;
  category: string;
  description: string;
  merchant: string | null;
  amount: number;
  currency: string;
  expenseDate: string;
  status: string;
  hasReceipt: boolean;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    category: 'TRAVEL',
    description: '',
    merchant: '',
    amount: '',
    currency: 'USD',
    expenseDate: '',
    projectCode: '',
    costCenter: '',
    isBillable: false,
    notes: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, [statusFilter, categoryFilter]);

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('page', '1');
      params.append('limit', '20');

      const response = await api.get(`/expenses?${params.toString()}`);
      setExpenses(response.data.data || []);
      setMeta(response.data.meta || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount),
        merchant: formData.merchant || undefined,
        projectCode: formData.projectCode || undefined,
        costCenter: formData.costCenter || undefined,
        notes: formData.notes || undefined,
      });
      setShowModal(false);
      setFormData({
        employeeId: '',
        category: 'TRAVEL',
        description: '',
        merchant: '',
        amount: '',
        currency: 'USD',
        expenseDate: '',
        projectCode: '',
        costCenter: '',
        isBillable: false,
        notes: '',
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/expenses/${id}/approve`, {
        approvedById: 'system',
        approvalNotes: 'Approved via web interface',
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/expenses/${id}/reject`, {
        approvedById: 'system',
        approvalNotes: 'Rejected via web interface',
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error rejecting expense:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      TRAVEL: 'bg-blue-100 text-blue-800',
      MEALS: 'bg-orange-100 text-orange-800',
      ACCOMMODATION: 'bg-purple-100 text-purple-800',
      TRANSPORTATION: 'bg-teal-100 text-teal-800',
      OFFICE_SUPPLIES: 'bg-gray-100 text-gray-800',
      SOFTWARE: 'bg-indigo-100 text-indigo-800',
      HARDWARE: 'bg-cyan-100 text-cyan-800',
      TRAINING: 'bg-green-100 text-green-800',
      COMMUNICATION: 'bg-yellow-100 text-yellow-800',
      CLIENT_ENTERTAINMENT: 'bg-pink-100 text-pink-800',
      MISCELLANEOUS: 'bg-gray-100 text-gray-800',
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      REIMBURSED: 'bg-blue-100 text-blue-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => {
              setAiLoading(true);
              setAiResult(null);
              try {
                const res = await aiApi.post('/analyze', {
                  type: 'EXPENSE_VALIDATION',
                  context: {
                    category: expenses[0]?.category || 'TRAVEL',
                    amount: expenses[0]?.amount || 0,
                    currency: 'USD',
                    description: expenses[0]?.description || '',
                    merchant: expenses[0]?.merchant || '',
                    isBillable: expenses[0]?.isBillable || false,
                    recentClaims: expenses.slice(0, 5).map(e => ({ amount: e.amount, category: e.category })),
                  },
                });
                setAiResult(res.data.data.result);
              } catch (error) {
                console.error('AI analysis error:', error);
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>{aiLoading ? 'Analyzing...' : 'AI Check'}</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Plus className="h-5 w-5" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {/* AI Result */}
      {aiResult && (
        <div className="rounded-lg border-2 border-green-400 bg-green-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-green-800">
              <Sparkles className="h-5 w-5" />
              <span>AI Expense Analysis</span>
            </h3>
            <button
              onClick={() => setAiResult(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  aiResult.isReasonable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {aiResult.isReasonable ? 'Reasonable' : 'Unreasonable'}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  aiResult.riskLevel === 'LOW'
                    ? 'bg-green-100 text-green-800'
                    : aiResult.riskLevel === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                Risk: {aiResult.riskLevel}
              </span>
            </div>
            {aiResult.policyChecks && aiResult.policyChecks.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700">Policy Checks:</p>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                  {aiResult.policyChecks.map((check: any, i: number) => (
                    <li key={i}>
                      <span className={check.passed ? 'text-green-700' : 'text-red-700'}>
                        {check.passed ? 'PASS' : 'FAIL'}
                      </span>{' '}
                      - {check.rule || check.description || check.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {aiResult.approvalRecommendation && (
              <div>
                <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                <p className="text-sm text-gray-600">{aiResult.approvalRecommendation}</p>
              </div>
            )}
            {aiResult.suggestions && aiResult.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700">Suggestions:</p>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                  {aiResult.suggestions.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="REIMBURSED">Reimbursed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="TRAVEL">Travel</option>
          <option value="MEALS">Meals</option>
          <option value="ACCOMMODATION">Accommodation</option>
          <option value="TRANSPORTATION">Transportation</option>
          <option value="OFFICE_SUPPLIES">Office Supplies</option>
          <option value="SOFTWARE">Software</option>
          <option value="HARDWARE">Hardware</option>
          <option value="TRAINING">Training</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Receipt className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-semibold">{meta.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-xl font-semibold">
                {expenses.filter((e) => e.status === 'SUBMITTED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-xl font-semibold">
                {expenses.filter((e) => e.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-xl font-semibold">
                {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Expense #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No expenses found.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Receipt className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{expense.expenseNumber}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {expense.employee.firstName} {expense.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{expense.employee.employeeNumber}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryBadge(expense.category)}`}>
                      {expense.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">
                    {expense.description}
                    {expense.merchant && (
                      <span className="block text-xs text-gray-400">@ {expense.merchant}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(expense.status)}`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    {expense.status === 'SUBMITTED' && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleApprove(expense.id)}
                          className="rounded p-1 text-green-600 hover:bg-green-50"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(expense.id)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Expense Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Expense" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                placeholder="UUID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              >
                <option value="TRAVEL">Travel</option>
                <option value="MEALS">Meals</option>
                <option value="ACCOMMODATION">Accommodation</option>
                <option value="TRANSPORTATION">Transportation</option>
                <option value="OFFICE_SUPPLIES">Office Supplies</option>
                <option value="SOFTWARE">Software</option>
                <option value="HARDWARE">Hardware</option>
                <option value="TRAINING">Training</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="CLIENT_ENTERTAINMENT">Client Entertainment</option>
                <option value="MISCELLANEOUS">Miscellaneous</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Merchant</label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expense Date</label>
              <input
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Code</label>
              <input
                type="text"
                value={formData.projectCode}
                onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost Center</label>
              <input
                type="text"
                value={formData.costCenter}
                onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isBillable}
              onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label className="text-sm text-gray-700">Billable</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              rows={2}
              placeholder="Optional"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Create Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
