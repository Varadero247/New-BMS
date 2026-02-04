'use client';

import { useState, useEffect } from 'react';
import { Plus, Receipt, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

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
        <button className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          <Plus className="h-5 w-5" />
          <span>New Expense</span>
        </button>
      </div>

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
    </div>
  );
}
