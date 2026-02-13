'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Landmark,
  AlertCircle,
  Receipt,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  revenue: number;
  expenses: number;
  profit: number;
  cashPosition: number;
  arOutstanding: number;
  apOutstanding: number;
  overdueInvoices: number;
  overdueBills: number;
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: string;
  }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FinanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setData({
        revenue: 0,
        expenses: 0,
        profit: 0,
        cashPosition: 0,
        arOutstanding: 0,
        apOutstanding: 0,
        overdueInvoices: 0,
        overdueBills: 0,
        recentTransactions: [],
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Revenue',
      value: formatCurrency(data?.revenue || 0),
      subtitle: 'Current period',
      icon: TrendingUp,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      valueColor: 'text-green-700',
      href: '/reports',
    },
    {
      title: 'Expenses',
      value: formatCurrency(data?.expenses || 0),
      subtitle: 'Current period',
      icon: TrendingDown,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      valueColor: 'text-red-700',
      href: '/reports',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(data?.profit || 0),
      subtitle: (data?.profit || 0) >= 0 ? 'Profit' : 'Loss',
      icon: DollarSign,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      valueColor: (data?.profit || 0) >= 0 ? 'text-blue-700' : 'text-red-700',
      href: '/reports',
    },
    {
      title: 'Cash Position',
      value: formatCurrency(data?.cashPosition || 0),
      subtitle: 'All accounts',
      icon: Landmark,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      valueColor: 'text-indigo-700',
      href: '/banking',
    },
    {
      title: 'AR Outstanding',
      value: formatCurrency(data?.arOutstanding || 0),
      subtitle: 'Receivable',
      icon: Receipt,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      valueColor: 'text-amber-700',
      href: '/invoices',
    },
    {
      title: 'AP Outstanding',
      value: formatCurrency(data?.apOutstanding || 0),
      subtitle: 'Payable',
      icon: CreditCard,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      valueColor: 'text-orange-700',
      href: '/payables',
    },
    {
      title: 'Overdue Invoices',
      value: String(data?.overdueInvoices || 0),
      subtitle: 'Require attention',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      valueColor: 'text-red-700',
      href: '/invoices',
    },
    {
      title: 'Overdue Bills',
      value: String(data?.overdueBills || 0),
      subtitle: 'Require attention',
      icon: AlertCircle,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      valueColor: 'text-orange-700',
      href: '/payables',
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-500 mt-1">Financial overview and key metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{card.title}</p>
                        <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
                        <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
                      </div>
                      <div className={`p-3 rounded-full ${card.bgColor}`}>
                        <Icon className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/invoices"
                className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Receipt className="h-8 w-8 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Create Invoice</span>
              </Link>
              <Link
                href="/payables"
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Record Bill</span>
              </Link>
              <Link
                href="/journal"
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Journal Entry</span>
              </Link>
              <Link
                href="/reports"
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">View Reports</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-900">{tx.description}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent transactions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
