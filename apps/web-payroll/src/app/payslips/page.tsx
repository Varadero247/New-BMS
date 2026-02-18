'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, DollarSign, Clock, Search } from 'lucide-react';
import api from '@/lib/api';

interface Payslip {
  id: string;
  payslipNumber: string;
  employeeName: string;
  employeeNumber: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  grossEarnings: number;
  netPay: number;
  status: string;
  currency: string;
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');

  useEffect(() => {
    fetchPayslips();
  }, [statusFilter, employeeIdFilter]);

  const fetchPayslips = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (employeeIdFilter) params.employeeId = employeeIdFilter;

      const response = await api.get('/payslips', { params });
      setPayslips(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
      GENERATED: 'bg-yellow-100 text-yellow-800',
      CALCULATED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-indigo-100 text-indigo-800',
      PUBLISHED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading payslips...</div>
      </div>
    );
  }

  const publishedCount = payslips.filter((p) => p.status === 'PUBLISHED').length;
  const paidCount = payslips.filter((p) => p.status === 'PAID').length;
  const pendingCount = payslips.filter(
    (p) => p.status === 'DRAFT' || p.status === 'GENERATED'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payslips</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Payslips</p>
              <p className="text-xl font-semibold">{payslips.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
              <p className="text-xl font-semibold">{publishedCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
              <p className="text-xl font-semibold">{paidCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-xl font-semibold">{pendingCount}</p>
            </div>
          </div>
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
          <option value="GENERATED">Generated</option>
          <option value="CALCULATED">Calculated</option>
          <option value="APPROVED">Approved</option>
          <option value="PUBLISHED">Published</option>
          <option value="PAID">Paid</option>
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Filter by Employee ID..."
            value={employeeIdFilter}
            onChange={(e) => setEmployeeIdFilter(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Payslips Table */}
      <div className="rounded-lg bg-white dark:bg-gray-900 shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payslip Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Employee Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Employee Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pay Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pay Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Gross Earnings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Net Pay
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
            {payslips.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No payslips found. Payslips will appear here after payroll runs are processed.
                </td>
              </tr>
            ) : (
              payslips.map((payslip) => (
                <tr key={payslip.id} className="hover:bg-gray-50 dark:bg-gray-800">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {payslip.payslipNumber}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {payslip.employeeName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {payslip.employeeNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(payslip.periodStart).toLocaleDateString()} -{' '}
                    {new Date(payslip.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(payslip.payDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(payslip.grossEarnings, payslip.currency)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(payslip.netPay, payslip.currency)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(payslip.status)}`}
                    >
                      {payslip.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Link
                      href={`/payslips/${payslip.id}`}
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
    </div>
  );
}
