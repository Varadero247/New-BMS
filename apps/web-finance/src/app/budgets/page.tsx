'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Modal,
  ModalFooter,
  Input,
  Label,
} from '@ims/ui';
import { Plus, Search, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';

interface BudgetItem {
  id: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  account?: { code: string; name: string };
  fiscalYear: number;
  month: number;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  notes?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ id: string; code: string; name: string }>>([]);

  const [formData, setFormData] = useState({
    accountId: '',
    fiscalYear: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    budgetAmount: '',
    notes: '',
  });

  useEffect(() => {
    loadBudgets();
    loadAccounts();
  }, [yearFilter, monthFilter]);

  async function loadBudgets() {
    try {
      setError(null);
      const params = new URLSearchParams();
      params.append('year', yearFilter.toString());
      if (monthFilter > 0) params.append('month', monthFilter.toString());
      const res = await api.get(`/budgets?${params.toString()}`);
      setBudgets(res.data.data || []);
    } catch {
      setError('Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data.data || []);
    } catch (err) {
      console.error('Error loading accounts:', err);
    }
  }

  async function handleCreate() {
    setFormError('');
    if (!formData.accountId) {
      setFormError('Account is required');
      return;
    }
    if (!formData.budgetAmount || parseFloat(formData.budgetAmount) < 0) {
      setFormError('Valid budget amount is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/budgets', {
        ...formData,
        budgetAmount: parseFloat(formData.budgetAmount),
      });
      setCreateModalOpen(false);
      loadBudgets();
    } catch (err) {
      setFormError((err as any)?.response?.data?.error?.message || 'Failed to create budget entry.');
    } finally {
      setSubmitting(false);
    }
  }

  const filteredBudgets = budgets.filter((b) => {
    const accountName = b.account?.name || b.accountName || '';
    const accountCode = b.account?.code || b.accountCode || '';
    return (
      !searchTerm ||
      accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accountCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + (b.budgetAmount || 0), 0);
  const totalActual = filteredBudgets.reduce((sum, b) => sum + (b.actualAmount || 0), 0);
  const totalVariance = totalBudget - totalActual;

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Budget vs Actual
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track budget performance and variances
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setFormData({
                accountId: '',
                fiscalYear: yearFilter,
                month: new Date().getMonth() + 1,
                budgetAmount: '',
                notes: '',
              });
              setFormError('');
              setCreateModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Budget Entry
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    {formatCurrency(totalBudget)}
                  </p>
                </div>
                <PiggyBank className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Actual</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalActual)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Variance</p>
                  <p
                    className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-green-700' : 'text-red-700'}`}
                  >
                    {formatCurrency(totalVariance)}
                  </p>
                </div>
                {totalVariance >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search accounts..."
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <select
                aria-label="Filter by month"
                value={yearFilter}
                onChange={(e) => setYearFilter(parseInt(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(parseInt(e.target.value))}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value={0}>All Months</option>
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Budget Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-indigo-600" />
              Budget Entries ({filteredBudgets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBudgets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Account
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Year
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Month
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Budget
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Actual
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Variance
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Var %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBudgets.map((item) => {
                      const variance = (item.budgetAmount || 0) - (item.actualAmount || 0);
                      const varPercent = item.budgetAmount
                        ? (variance / item.budgetAmount) * 100
                        : 0;
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {item.account?.name || item.accountName || '-'}
                              </span>
                              {(item.account?.code || item.accountCode) && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 font-mono">
                                  {item.account?.code || item.accountCode}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.fiscalYear}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {months[(item.month || 1) - 1]}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(item.budgetAmount || 0)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatCurrency(item.actualAmount || 0)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {formatCurrency(variance)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right ${varPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {varPercent >= 0 ? '+' : ''}
                            {varPercent.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No budget entries found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Budget Entry"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div>
            <Label htmlFor="bud-account">Account *</Label>
            <select
              id="bud-account"
              value={formData.accountId}
              onChange={(e) => setFormData((p) => ({ ...p, accountId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bud-year">Fiscal Year</Label>
              <select
                id="bud-year"
                value={formData.fiscalYear}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fiscalYear: parseInt(e.target.value) }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="bud-month">Month</Label>
              <select
                id="bud-month"
                value={formData.month}
                onChange={(e) => setFormData((p) => ({ ...p, month: parseInt(e.target.value) }))}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="bud-amount">Budget Amount *</Label>
              <Input
                id="bud-amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.budgetAmount}
                onChange={(e) => setFormData((p) => ({ ...p, budgetAmount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bud-notes">Notes</Label>
            <textarea
              id="bud-notes"
              value={formData.notes}
              onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="Budget notes..."
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Entry'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
