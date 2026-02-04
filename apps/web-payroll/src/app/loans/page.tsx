'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, CreditCard, DollarSign, Clock, CheckCircle, Users } from 'lucide-react';
import api from '@/lib/api';

interface Loan {
  id: string;
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
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchLoans();
  }, [statusFilter, typeFilter]);

  const fetchLoans = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('loanType', typeFilter);

      const response = await api.get(`/loans?${params.toString()}`);
      setLoans(response.data.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/loans/${id}/approve`, { approvedById: 'system' });
      fetchLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleDisburse = async (id: string) => {
    try {
      await api.put(`/loans/${id}/disburse`);
      fetchLoans();
    } catch (error) {
      console.error('Error disbursing loan:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      SALARY_ADVANCE: 'bg-blue-100 text-blue-800',
      PERSONAL_LOAN: 'bg-purple-100 text-purple-800',
      EMERGENCY_LOAN: 'bg-red-100 text-red-800',
      HOUSING_LOAN: 'bg-green-100 text-green-800',
      VEHICLE_LOAN: 'bg-orange-100 text-orange-800',
      EDUCATION_LOAN: 'bg-teal-100 text-teal-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading loans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
        <button className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          <Plus className="h-5 w-5" />
          <span>New Loan</span>
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
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Total Loans</p>
              <p className="text-xl font-semibold">{loans.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Pending Approval</p>
              <p className="text-xl font-semibold">
                {loans.filter((l) => l.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Active Loans</p>
              <p className="text-xl font-semibold">
                {loans.filter((l) => l.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Outstanding Balance</p>
              <p className="text-xl font-semibold">
                {formatCurrency(loans.reduce((sum, l) => sum + l.remainingBalance, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Loan #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Principal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Interest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Term
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Balance
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
            {loans.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No loans found.
                </td>
              </tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{loan.loanNumber}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {loan.employee.firstName} {loan.employee.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{loan.employee.employeeNumber}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTypeBadge(loan.loanType)}`}>
                      {loan.loanType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {formatCurrency(loan.principalAmount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {loan.interestRate}%
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {loan.termMonths} months
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(loan.remainingBalance)}</p>
                      <p className="text-xs text-gray-500">
                        Paid: {formatCurrency(loan.repaidAmount)}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(loan.status)}`}>
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
                        className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
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
    </div>
  );
}
