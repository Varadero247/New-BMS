'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, CreditCard, DollarSign, Clock, CheckCircle, Sparkles } from 'lucide-react';
import api, { aiApi } from '@/lib/api';
import { Modal, AIDisclosure } from '@ims/ui';

interface Loan { id: string;
  loanNumber: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  totalAmount: number;
  termMonths: number;
  installmentAmount: number;
  remainingBalance: number;
  repaidAmount: number;
  status: string;
  startDate: string;
  endDate: string;
  employee: { firstName: string;
    lastName: string;
    employeeNumber: string; }; }

export default function LoansPage() { const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [formData, setFormData] = useState({ employeeId: '',
    loanType: 'PERSONAL_LOAN',
    principalAmount: '',
    interestRate: '0',
    termMonths: '',
    startDate: '',
    paymentFrequency: 'MONTHLY',
    purpose: '' });

  useEffect(() => { fetchLoans(); }, [statusFilter, typeFilter]);

  const fetchLoans = async () => { try { const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('loanType', typeFilter);

      const response = await api.get(`/loans?${params.toString()}`);
      setLoans(response.data.data || []); } catch (error) { console.error('Error fetching loans:', error); } finally { setLoading(false); } };

  const handleApprove = async (id: string) => { try { await api.put(`/loans/${id}/approve`, { approvedById: 'system' });
      fetchLoans(); } catch (error) { console.error('Error approving loan:', error); } };

  const handleDisburse = async (id: string) => { try { await api.put(`/loans/${id}/disburse`);
      fetchLoans(); } catch (error) { console.error('Error disbursing loan:', error); } };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
    try { await api.post('/loans', { ...formData,
        principalAmount: parseFloat(formData.principalAmount),
        interestRate: parseFloat(formData.interestRate),
        termMonths: parseInt(formData.termMonths, 10),
        purpose: formData.purpose || undefined });
      setShowModal(false);
      setFormData({ employeeId: '',
        loanType: 'PERSONAL_LOAN',
        principalAmount: '',
        interestRate: '0',
        termMonths: '',
        startDate: '',
        paymentFrequency: 'MONTHLY',
        purpose: '' });
      fetchLoans(); } catch (error) { console.error('Error creating loan:', error); } };

  const formatCurrency = (amount: number) => { return new Intl.NumberFormat('en-US', { style: 'currency',
      currency: 'USD' }).format(amount); };

  const getTypeBadge = (type: string) => { const styles: Record<string, string> = { SALARY_ADVANCE: 'bg-blue-100 text-blue-800',
      PERSONAL_LOAN: 'bg-purple-100 text-purple-800',
      EMERGENCY_LOAN: 'bg-red-100 text-red-800',
      HOUSING_LOAN: 'bg-green-100 text-green-800',
      VEHICLE_LOAN: 'bg-orange-100 text-orange-800',
      EDUCATION_LOAN: 'bg-teal-100 text-teal-800',
      OTHER: 'bg-gray-100 dark:bg-gray-800 text-gray-800' };
    return styles[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800'; };

  const getStatusBadge = (status: string) => { const styles: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-800' };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800'; };

  if (loading) { return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading loans...</div>
      </div>
    ); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Loan Management</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={async () => { setAiLoading(true);
              setAiResult(null);
              try { const res = await aiApi.post('/analyze', { type: 'LOAN_CALCULATOR',
                  context: { amount: loans[0]?.principalAmount || 10000,
                    interestRate: loans[0]?.interestRate || 5,
                    termMonths: loans[0]?.termMonths || 12,
                    currency: 'USD',
                    loanType: loans[0]?.loanType || 'PERSONAL' } });
                setAiResult(res.data.data.result); } catch (error) { console.error('AI analysis error:', error); } finally { setAiLoading(false); } }}
            disabled={aiLoading}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>{aiLoading ? 'Calculating...' : 'AI Calculate'}</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Plus className="h-5 w-5" />
            <span>New Loan</span>
          </button>
        </div>
      </div>

      {/* AI Result */}
      {aiResult && (
        <div className="rounded-lg border-2 border-green-400 bg-green-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center space-x-2 text-lg font-semibold text-green-800">
              <Sparkles className="h-5 w-5" />
              <span>AI Loan Calculation</span>
            </h3>
            <button
              onClick={() => setAiResult(null)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
            >
              Dismiss
            </button>
          </div>
          <AIDisclosure
            variant="inline"
            provider="claude"
            analysisType="Loan Analysis"
            confidence={0.85}
          />
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white dark:bg-gray-900 p-3 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Payment</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {aiResult.monthlyPayment !== null
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                        aiResult.monthlyPayment
                      )
                    : 'N/A'}
                </p>
              </div>
              <div className="rounded-lg bg-white dark:bg-gray-900 p-3 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Interest</p>
                <p className="text-lg font-bold text-red-600">
                  {aiResult.totalInterest !== null
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                        aiResult.totalInterest
                      )
                    : 'N/A'}
                </p>
              </div>
              <div className="rounded-lg bg-white dark:bg-gray-900 p-3 shadow-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Repayment</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {aiResult.totalRepayment !== null
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                        aiResult.totalRepayment
                      )
                    : 'N/A'}
                </p>
              </div>
            </div>
            {aiResult.affordability && (
              <div className="rounded-lg bg-white dark:bg-gray-900 p-3 shadow-sm">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Affordability
                </p>
                <p className="text-sm text-gray-600">
                  {typeof aiResult.affordability === 'string'
                    ? aiResult.affordability
                    : aiResult.affordability.assessment ||
                      aiResult.affordability.summary ||
                      JSON.stringify(aiResult.affordability)}
                </p>
              </div>
            )}
            {aiResult.recommendations && aiResult.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recommendations:
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                  {aiResult.recommendations.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {aiResult.schedule && aiResult.schedule.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amortization Schedule (First 3 Months):
                </p>
                <table className="mt-1 w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
                      <th className="pb-1 pr-4">Month</th>
                      <th className="pb-1 pr-4">Payment</th>
                      <th className="pb-1 pr-4">Principal</th>
                      <th className="pb-1 pr-4">Interest</th>
                      <th className="pb-1">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiResult.schedule.slice(0, 3).map((row: any, i: number) => (
                      <tr key={i} className="text-gray-600">
                        <td className="pr-4">{row.month || i + 1}</td>
                        <td className="pr-4">
                          {row.payment !== null
                            ? new Intl.NumberFormat('en-US', { style: 'currency',
                                currency: 'USD' }).format(row.payment)
                            : 'N/A'}
                        </td>
                        <td className="pr-4">
                          {row.principal !== null
                            ? new Intl.NumberFormat('en-US', { style: 'currency',
                                currency: 'USD' }).format(row.principal)
                            : 'N/A'}
                        </td>
                        <td className="pr-4">
                          {row.interest !== null
                            ? new Intl.NumberFormat('en-US', { style: 'currency',
                                currency: 'USD' }).format(row.interest)
                            : 'N/A'}
                        </td>
                        <td>
                          {row.balance !== null
                            ? new Intl.NumberFormat('en-US', { style: 'currency',
                                currency: 'USD' }).format(row.balance)
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="SALARY_ADVANCE">Salary Advance</option>
          <option value="PERSONAL_LOAN">Personal Loan</option>
          <option value="EMERGENCY_LOAN">Emergency Loan</option>
          <option value="HOUSING_LOAN">Housing Loan</option>
          <option value="VEHICLE_LOAN">Vehicle Loan</option>
          <option value="EDUCATION_LOAN">Education Loan</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Loans</p>
              <p className="text-xl font-semibold">{loans.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
              <p className="text-xl font-semibold">
                {loans.filter((l) => l.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Loans</p>
              <p className="text-xl font-semibold">
                {loans.filter((l) => l.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding Balance</p>
              <p className="text-xl font-semibold">
                {formatCurrency(loans.reduce((sum, l) => sum + l.remainingBalance, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="rounded-lg bg-white dark:bg-gray-900 shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Loan #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Principal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Term
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {loans.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No loans found.
                </td>
              </tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 dark:bg-gray-800">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {loan.loanNumber}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {loan.employee.firstName} {loan.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {loan.employee.employeeNumber}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTypeBadge(loan.loanType)}`}
                    >
                      {loan.loanType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(loan.principalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {loan.interestRate}%
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {loan.termMonths} months
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(loan.remainingBalance)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Paid: {formatCurrency(loan.repaidAmount)}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(loan.status)}`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {loan.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(loan.id)}
                          className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                        >
                          Approve
                        </button>
                      )}
                      {loan.status === 'APPROVED' && (
                        <button
                          onClick={() => handleDisburse(loan.id)}
                          className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                        >
                          Disburse
                        </button>
                      )}
                      <Link
                        href={`/loans/${loan.id}`}
                        className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Loan Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Loan" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                placeholder="Employee UUID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Loan Type
              </label>
              <select
                value={formData.loanType}
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              >
                <option value="SALARY_ADVANCE">Salary Advance</option>
                <option value="PERSONAL_LOAN">Personal Loan</option>
                <option value="EMERGENCY_LOAN">Emergency Loan</option>
                <option value="HOUSING_LOAN">Housing Loan</option>
                <option value="VEHICLE_LOAN">Vehicle Loan</option>
                <option value="EDUCATION_LOAN">Education Loan</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Principal Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Term (Months)
              </label>
              <input
                type="number"
                value={formData.termMonths}
                onChange={(e) => setFormData({ ...formData, termMonths: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Frequency
            </label>
            <select
              value={formData.paymentFrequency}
              onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="BI_WEEKLY">Bi-Weekly</option>
              <option value="SEMI_MONTHLY">Semi-Monthly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Purpose (Optional)
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Create Loan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  ); }
