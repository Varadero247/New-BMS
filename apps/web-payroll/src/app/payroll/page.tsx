'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api, { aiApi } from '@/lib/api';
import { Modal } from '@ims/ui';

interface PayrollRun {
  id: string;
  runNumber: string;
  payPeriodType: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: string;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  createdAt: string;
}

export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiExpanded, setAiExpanded] = useState(true);
  const [formData, setFormData] = useState({
    periodStart: '',
    periodEnd: '',
    payDate: '',
    payFrequency: 'MONTHLY',
  });

  useEffect(() => {
    fetchPayrollRuns();
  }, [statusFilter]);

  const fetchPayrollRuns = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/payroll/runs?${params.toString()}`);
      setRuns(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payroll runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/payroll/runs', formData);
      setShowModal(false);
      setFormData({
        periodStart: '',
        periodEnd: '',
        payDate: '',
        payFrequency: 'MONTHLY',
      });
      fetchPayrollRuns();
    } catch (error) {
      console.error('Error creating payroll run:', error);
    }
  };

  const handleAiValidate = async () => {
    setAiLoading(true);
    try {
      const latestRun = runs.length > 0 ? runs[0] : null;
      const res = await aiApi.post('/analyze', {
        type: 'PAYROLL_VALIDATION',
        context: {
          runNumber: latestRun?.runNumber,
          periodStart: latestRun?.periodStart,
          periodEnd: latestRun?.periodEnd,
          totalEmployees: runs.reduce((s, r) => s + r.employeeCount, 0),
          totalGross: runs.reduce((s, r) => s + r.totalGross, 0),
          totalNet: runs.reduce((s, r) => s + r.totalNet, 0),
          totalDeductions: runs.reduce((s, r) => s + (r.totalGross - r.totalNet), 0),
          currency: 'USD',
        },
      });
      setAiResult(res.data.data.result);
      setAiExpanded(true);
    } catch (error) {
      console.error('Error running AI validation:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PROCESSING: 'bg-yellow-100 text-yellow-800',
      CALCULATED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading payroll runs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Runs</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAiValidate}
            disabled={aiLoading}
            className="flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Sparkles className="h-5 w-5" />
            <span>{aiLoading ? 'Validating...' : 'AI Validate'}</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Plus className="h-5 w-5" />
            <span>New Payroll Run</span>
          </button>
        </div>
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
          <option value="PROCESSING">Processing</option>
          <option value="CALCULATED">Calculated</option>
          <option value="APPROVED">Approved</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Runs</p>
              <p className="text-xl font-semibold">{runs.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Total Gross</p>
              <p className="text-xl font-semibold">
                {formatCurrency(runs.reduce((sum, r) => sum + r.totalGross, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Employees Paid</p>
              <p className="text-xl font-semibold">
                {runs.reduce((sum, r) => sum + r.employeeCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Play className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-xl font-semibold">
                {runs.filter((r) => r.status === 'PROCESSING').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Validation Result */}
      {aiResult && (
        <div className="rounded-lg border-2 border-green-400 bg-white p-4 shadow">
          <button
            onClick={() => setAiExpanded(!aiExpanded)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Payroll Validation</h3>
              {aiResult.isValid !== undefined && (
                <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  aiResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {aiResult.isValid ? 'Valid' : 'Issues Found'}
                </span>
              )}
            </div>
            {aiExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {aiExpanded && (
            <div className="mt-4 space-y-3">
              {aiResult.averagePerEmployee !== undefined && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Average Per Employee:</span>{' '}
                  {formatCurrency(aiResult.averagePerEmployee)}
                </p>
              )}
              {aiResult.warnings && aiResult.warnings.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-yellow-700">Warnings:</p>
                  <ul className="ml-4 list-disc text-sm text-yellow-600">
                    {aiResult.warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiResult.errors && aiResult.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-700">Errors:</p>
                  <ul className="ml-4 list-disc text-sm text-red-600">
                    {aiResult.errors.map((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiResult.recommendations && aiResult.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-700">Recommendations:</p>
                  <ul className="ml-4 list-disc text-sm text-blue-600">
                    {aiResult.recommendations.map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payroll Runs Table */}
      <div className="rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Run Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Pay Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Employees
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Gross
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Net
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
            {runs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No payroll runs found. Create your first payroll run to get started.
                </td>
              </tr>
            ) : (
              runs.map((run) => (
                <tr key={run.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(run.status)}
                      <span className="font-medium text-gray-900">{run.runNumber}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(run.periodStart).toLocaleDateString()} -{' '}
                    {new Date(run.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(run.payDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {run.employeeCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(run.totalGross)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(run.totalNet)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(run.status)}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/payroll/${run.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Payroll Run Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Payroll Run" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Period Start</label>
              <input
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Period End</label>
              <input
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pay Date</label>
              <input
                type="date"
                value={formData.payDate}
                onChange={(e) => setFormData({ ...formData, payDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pay Frequency</label>
              <select
                value={formData.payFrequency}
                onChange={(e) => setFormData({ ...formData, payFrequency: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Biweekly</option>
                <option value="SEMI_MONTHLY">Semi-Monthly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
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
              Create Payroll Run
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
