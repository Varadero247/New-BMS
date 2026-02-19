'use client';

import { useState, useEffect } from 'react';
import { Plus, Calculator, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Modal } from '@ims/ui';
import api from '@/lib/api';

interface TaxFiling { id: string;
  filingType: string;
  taxPeriod: string;
  taxYear: number;
  grossWages: number;
  taxableWages: number;
  taxWithheld: number;
  employerTax: number;
  totalTax: number;
  status: string;
  filingDeadline: string;
  filedAt: string | null;
  paymentStatus: string | null;
  payrollRun?: { runNumber: string;
    periodStart: string;
    periodEnd: string; } | null; }

interface TaxSummary { byStatus: Array<{ status: string; _count: number }>;
  totalTax: number;
  totalDue: number;
  upcomingDeadlines: TaxFiling[]; }

export default function TaxPage() { const [filings, setFilings] = useState<TaxFiling[]>([]);
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ filingType: 'WITHHOLDING',
    taxPeriod: '',
    taxYear: new Date().getFullYear().toString(),
    grossWages: '',
    taxableWages: '',
    taxWithheld: '',
    employerTax: '0',
    filingDeadline: '',
    payrollRunId: '' });

  useEffect(() => { fetchData(); }, [statusFilter, typeFilter, yearFilter]);

  const fetchData = async () => { try { const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('filingType', typeFilter);
      if (yearFilter) params.append('taxYear', yearFilter);

      const [filingsRes, summaryRes] = await Promise.all([
        api.get(`/tax/filings?${params.toString()}`),
        api.get(`/tax/summary?year=${yearFilter}`),
      ]);

      setFilings(filingsRes.data.data || []);
      setSummary(summaryRes.data.data); } catch (error) { console.error('Error fetching tax data:', error); } finally { setLoading(false); } };

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
    try { await api.post('/tax/filings', { ...formData,
        taxYear: parseInt(formData.taxYear),
        grossWages: parseFloat(formData.grossWages),
        taxableWages: parseFloat(formData.taxableWages),
        taxWithheld: parseFloat(formData.taxWithheld),
        employerTax: parseFloat(formData.employerTax),
        payrollRunId: formData.payrollRunId || undefined });
      setShowModal(false);
      setFormData({ filingType: 'WITHHOLDING',
        taxPeriod: '',
        taxYear: new Date().getFullYear().toString(),
        grossWages: '',
        taxableWages: '',
        taxWithheld: '',
        employerTax: '0',
        filingDeadline: '',
        payrollRunId: '' });
      fetchData(); } catch (error) { console.error('Error creating tax filing:', error); } };

  const formatCurrency = (amount: number) => { return new Intl.NumberFormat('en-US', { style: 'currency',
      currency: 'USD' }).format(amount); };

  const getTypeBadge = (type: string) => { const styles: Record<string, string> = { WITHHOLDING: 'bg-blue-100 text-blue-800',
      QUARTERLY: 'bg-purple-100 text-purple-800',
      ANNUAL: 'bg-green-100 text-green-800',
      AMENDMENT: 'bg-orange-100 text-orange-800',
      SOCIAL_SECURITY: 'bg-teal-100 text-teal-800',
      MEDICARE: 'bg-cyan-100 text-cyan-800',
      STATE: 'bg-indigo-100 text-indigo-800',
      LOCAL: 'bg-gray-100 dark:bg-gray-800 text-gray-800' };
    return styles[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-800'; };

  const getStatusBadge = (status: string) => { const styles: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-800',
      PREPARED: 'bg-blue-100 text-blue-800',
      FILED: 'bg-green-100 text-green-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800' };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800'; };

  const isDeadlineNear = (deadline: string) => { const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil > 0; };

  const isOverdue = (deadline: string, status: string) => { if (status === 'FILED' || status === 'PAID') return false;
    const deadlineDate = new Date(deadline);
    return deadlineDate < new Date(); };

  if (loading) { return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading tax data...</div>
      </div>
    ); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tax Compliance</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          <span>New Filing</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          {[2026, 2025, 2024, 2023].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PREPARED">Prepared</option>
          <option value="FILED">Filed</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="WITHHOLDING">Withholding</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="ANNUAL">Annual</option>
          <option value="SOCIAL_SECURITY">Social Security</option>
          <option value="MEDICARE">Medicare</option>
          <option value="STATE">State</option>
          <option value="LOCAL">Local</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Calculator className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Filings</p>
              <p className="text-xl font-semibold">{filings.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tax ({yearFilter})</p>
              <p className="text-xl font-semibold">{formatCurrency(summary?.totalTax || 0)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Due</p>
              <p className="text-xl font-semibold">{formatCurrency(summary?.totalDue || 0)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Deadlines</p>
              <p className="text-xl font-semibold">{summary?.upcomingDeadlines?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines Alert */}
      {summary?.upcomingDeadlines && summary.upcomingDeadlines.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">Upcoming Tax Deadlines</h3>
              <ul className="mt-2 space-y-1">
                {summary.upcomingDeadlines.slice(0, 3).map((filing) => (
                  <li key={filing.id} className="text-sm text-yellow-700">
                    {filing.filingType} - {filing.taxPeriod}: Due{' '}
                    {new Date(filing.filingDeadline).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tax Filings Table */}
      <div className="rounded-lg bg-white dark:bg-gray-900 shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Filing Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Taxable Wages
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tax Withheld
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Tax
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Deadline
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
            {filings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No tax filings found for {yearFilter}.
                </td>
              </tr>
            ) : (
              filings.map((filing) => (
                <tr
                  key={filing.id}
                  className={`hover:bg-gray-50 dark:bg-gray-800 ${ isOverdue(filing.filingDeadline, filing.status) ? 'bg-red-50' : '' }`}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTypeBadge(filing.filingType)}`}
                    >
                      {filing.filingType}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {filing.taxPeriod}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{filing.taxYear}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(filing.taxableWages)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(filing.taxWithheld)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(filing.totalTax)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {isDeadlineNear(filing.filingDeadline) && filing.status !== 'FILED' && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      {isOverdue(filing.filingDeadline, filing.status) && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm ${ isOverdue(filing.filingDeadline, filing.status)
                            ? 'text-red-600 font-medium'
                            : isDeadlineNear(filing.filingDeadline)
                              ? 'text-yellow-600'
                              : 'text-gray-500 dark:text-gray-400' }`}
                      >
                        {new Date(filing.filingDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${ isOverdue(filing.filingDeadline, filing.status)
                          ? 'bg-red-100 text-red-800'
                          : getStatusBadge(filing.status) }`}
                    >
                      {isOverdue(filing.filingDeadline, filing.status) ? 'OVERDUE' : filing.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {filing.status === 'PENDING' && (
                        <button className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">
                          Prepare
                        </button>
                      )}
                      {filing.status === 'PREPARED' && (
                        <button className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200">
                          File
                        </button>
                      )}
                      {filing.status === 'FILED' && !filing.paymentStatus && (
                        <button className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200">
                          Record Payment
                        </button>
                      )}
                      <button className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200">
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Tax Filing Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Tax Filing"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Filing Type
              </label>
              <select
                value={formData.filingType}
                onChange={(e) => setFormData({ ...formData, filingType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              >
                <option value="WITHHOLDING">Withholding</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUAL">Annual</option>
                <option value="AMENDMENT">Amendment</option>
                <option value="SOCIAL_SECURITY">Social Security</option>
                <option value="MEDICARE">Medicare</option>
                <option value="STATE">State</option>
                <option value="LOCAL">Local</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax Period
              </label>
              <input
                type="text"
                value={formData.taxPeriod}
                onChange={(e) => setFormData({ ...formData, taxPeriod: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                placeholder="e.g. 2026-Q1"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax Year
              </label>
              <input
                type="number"
                value={formData.taxYear}
                onChange={(e) => setFormData({ ...formData, taxYear: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Filing Deadline
              </label>
              <input
                type="date"
                value={formData.filingDeadline}
                onChange={(e) => setFormData({ ...formData, filingDeadline: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gross Wages
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.grossWages}
                onChange={(e) => setFormData({ ...formData, grossWages: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Taxable Wages
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.taxableWages}
                onChange={(e) => setFormData({ ...formData, taxableWages: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax Withheld
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.taxWithheld}
                onChange={(e) => setFormData({ ...formData, taxWithheld: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Employer Tax
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.employerTax}
                onChange={(e) => setFormData({ ...formData, employerTax: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payroll Run ID
            </label>
            <input
              type="text"
              value={formData.payrollRunId}
              onChange={(e) => setFormData({ ...formData, payrollRunId: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              placeholder="Optional UUID"
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
              Create Filing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  ); }
