'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  totalEmployees: number;
  currentPayroll: {
    runNumber: string;
    status: string;
    totalGross: number;
    totalNet: number;
  } | null;
  pendingExpenses: number;
  pendingLoans: number;
  upcomingTaxDeadlines: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [runsRes] = await Promise.all([
        api.get('/payroll/runs'),
      ]);

      setRecentRuns(runsRes.data.data?.slice(0, 5) || []);

      // Calculate stats from payroll runs
      const runs = runsRes.data.data || [];
      const currentRun = runs.find((r: any) => r.status === 'PROCESSING' || r.status === 'DRAFT');

      setStats({
        totalEmployees: runs[0]?.employeeCount || 0,
        currentPayroll: currentRun ? {
          runNumber: currentRun.runNumber,
          status: currentRun.status,
          totalGross: currentRun.totalGross,
          totalNet: currentRun.totalNet,
        } : null,
        pendingExpenses: 0,
        pendingLoans: 0,
        upcomingTaxDeadlines: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payroll Dashboard</h1>
        <Link
          href="/payroll/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          New Payroll Run
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Payroll Runs</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {recentRuns.length}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Period Gross</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(stats?.currentPayroll?.totalGross || 0)}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Period Net</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(stats?.currentPayroll?.totalNet || 0)}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Employees Paid</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                {stats?.totalEmployees || 0}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/payroll"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:bg-gray-800"
            >
              <Wallet className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Process Payroll</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Run payroll cycle</p>
              </div>
            </Link>
            <Link
              href="/expenses"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:bg-gray-800"
            >
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Review Expenses</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending approvals</p>
              </div>
            </Link>
            <Link
              href="/loans"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:bg-gray-800"
            >
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Manage Loans</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Employee loans</p>
              </div>
            </Link>
            <Link
              href="/tax"
              className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50 dark:bg-gray-800"
            >
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Tax Filings</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tax compliance</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Payroll Runs */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Payroll Runs</h2>
          {recentRuns.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No payroll runs yet</p>
          ) : (
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <Link
                  key={run.id}
                  href={`/payroll/${run.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-full p-2 ${
                      run.status === 'COMPLETED' ? 'bg-green-100' :
                      run.status === 'PROCESSING' ? 'bg-yellow-100' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {run.status === 'COMPLETED' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : run.status === 'PROCESSING' ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{run.runNumber}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(run.totalNet)}</p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      run.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      run.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      run.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-800'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
