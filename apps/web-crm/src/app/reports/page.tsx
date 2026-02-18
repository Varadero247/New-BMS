'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { BarChart3, TrendingUp, Target, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

interface SalesReport {
  winRate: number;
  avgDealSize: number;
  totalPipelineValue: number;
  totalRevenue: number;
  dealsWon: number;
  dealsLost: number;
  avgDaysToClose: number;
  pipelineVelocity: Array<{
    stage: string;
    avgDays: number;
    count: number;
  }>;
  forecast: Array<{
    month: string;
    projected: number;
    actual: number;
  }>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

const tabs = ['Sales Dashboard', 'Pipeline Velocity', 'Win/Loss', 'Forecast'];

export default function ReportsPage() {
  const [data, setData] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setError(null);
      const res = await api.get('/reports/sales');
      setData(res.data.data);
    } catch (err) {
      console.error('Error loading reports:', err);
      setData({
        winRate: 0,
        avgDealSize: 0,
        totalPipelineValue: 0,
        totalRevenue: 0,
        dealsWon: 0,
        dealsLost: 0,
        avgDaysToClose: 0,
        pipelineVelocity: [],
        forecast: [],
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
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sales Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Analytics and performance metrics</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-4">
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === idx
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Sales Dashboard Tab */}
        {activeTab === 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold text-green-700">
                        {(data?.winRate || 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {data?.dealsWon || 0} won / {(data?.dealsWon || 0) + (data?.dealsLost || 0)}{' '}
                        total
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-50">
                      <Target className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg Deal Size</p>
                      <p className="text-2xl font-bold text-violet-700">
                        {formatCurrency(data?.avgDealSize || 0)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Across all won deals
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-violet-50">
                      <DollarSign className="h-6 w-6 text-violet-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Pipeline Value
                      </p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency(data?.totalPipelineValue || 0)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Open opportunities
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-50">
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {formatCurrency(data?.totalRevenue || 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-emerald-50">
                      <BarChart3 className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg Days to Close</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {data?.avgDaysToClose || 0} days
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-amber-50">
                      <Target className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Pipeline Velocity Tab */}
        {activeTab === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Velocity - Average Days per Stage</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.pipelineVelocity && data.pipelineVelocity.length > 0 ? (
                <div className="space-y-4">
                  {data.pipelineVelocity.map((stage) => (
                    <div key={stage.stage} className="flex items-center gap-4">
                      <div className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stage.stage}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-violet-500 rounded-full h-6 flex items-center justify-end pr-2"
                            style={{
                              width: `${Math.min((stage.avgDays / 60) * 100, 100)}%`,
                              minWidth: '40px',
                            }}
                          >
                            <span className="text-xs text-white font-medium">{stage.avgDays}d</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-20 text-sm text-gray-500 dark:text-gray-400 text-right">
                        {stage.count} deals
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pipeline velocity data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Win/Loss Tab */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Win/Loss Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">Won</span>
                      <span className="text-sm font-medium text-green-700">
                        {data?.dealsWon || 0}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-500 rounded-full h-4"
                        style={{ width: `${data?.winRate || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-red-700">Lost</span>
                      <span className="text-sm font-medium text-red-700">
                        {data?.dealsLost || 0}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-500 rounded-full h-4"
                        style={{ width: `${100 - (data?.winRate || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-sm text-gray-600">Win Rate</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {(data?.winRate || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-sm text-gray-600">Total Deals Won</span>
                    <span className="font-medium text-green-600">{data?.dealsWon || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-sm text-gray-600">Total Deals Lost</span>
                    <span className="font-medium text-red-600">{data?.dealsLost || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-sm text-gray-600">Avg Days to Close</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {data?.avgDaysToClose || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-600">Revenue from Won</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(data?.totalRevenue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.forecast && data.forecast.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Month
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Projected
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Actual
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                          Variance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.forecast.map((row) => {
                        const variance = row.actual - row.projected;
                        return (
                          <tr
                            key={row.month}
                            className="border-b hover:bg-gray-50 dark:bg-gray-800"
                          >
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                              {row.month}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-600">
                              {formatCurrency(row.projected)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {formatCurrency(row.actual)}
                            </td>
                            <td
                              className={`py-3 px-4 text-right font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {variance >= 0 ? '+' : ''}
                              {formatCurrency(variance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No forecast data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
