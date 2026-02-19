'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@ims/ui';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Warehouse,
  DollarSign,
  Download } from 'lucide-react';
import { inventoryApi } from '@/lib/api';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ReportData {
  summary: {
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
    lowStockCount: number;
  };
  transactionSummary: {
    totals: {
      totalTransactions: number;
      totalIn: number;
      totalOut: number;
      totalValue: number;
    };
    byType: Array<{
      type: string;
      count: number;
      quantityChange: number;
      totalValue: number;
    }>;
    dailyTrend: Array<{
      date: string;
      count: number;
      total_in: number;
      total_out: number;
    }>;
  };
  warehouseBreakdown: Array<{
    id: string;
    name: string;
    code: string;
    stats: {
      totalProducts: number;
      totalQuantity: number;
      totalValue: number;
    };
  }>;
  lowStockProducts: Array<{
    id: string;
    sku: string;
    name: string;
    totalStock: number;
    reorderPoint: number;
    deficit: number;
  }>;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  async function loadReportData() {
    try {
      setLoading(true);
      const [summaryRes, transactionsRes, warehousesRes, lowStockRes] = await Promise.all([
        inventoryApi.getInventorySummary(),
        inventoryApi.getTransactionSummary({
          startDate: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString() }),
        inventoryApi.getWarehouses({ limit: 10 }),
        inventoryApi.getLowStockProducts(),
      ]);

      setReportData({
        summary: summaryRes.data?.data || {},
        transactionSummary: transactionsRes.data?.data || {},
        warehouseBreakdown: warehousesRes.data?.data || [],
        lowStockProducts: (lowStockRes.data?.data || []).slice(0, 10) });
    } catch (error) {
      console.error('Failed to load report data:', error);
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
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const transactionTypeData = {
    labels: reportData?.transactionSummary?.byType?.map((t) => t.type.replace('_', ' ')) || [],
    datasets: [
      {
        data: reportData?.transactionSummary?.byType?.map((t) => t.count) || [],
        backgroundColor: [
          '#10B981',
          '#DC2626',
          '#1E3A8A',
          '#F59E0B',
          '#8B5CF6',
          '#EC4899',
          '#059669',
          '#F97316',
          '#6366F1',
          '#10B981',
          '#0EA5E9',
        ] },
    ] };

  const dailyTrendData = {
    labels:
      reportData?.transactionSummary?.dailyTrend
        ?.slice()
        .reverse()
        .map((d) =>
          new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ) || [],
    datasets: [
      {
        label: 'Stock In',
        data:
          reportData?.transactionSummary?.dailyTrend
            ?.slice()
            .reverse()
            .map((d) => Number(d.total_in)) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true },
      {
        label: 'Stock Out',
        data:
          reportData?.transactionSummary?.dailyTrend
            ?.slice()
            .reverse()
            .map((d) => Number(d.total_out)) || [],
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true },
    ] };

  const warehouseData = {
    labels: reportData?.warehouseBreakdown?.map((w) => w.name) || [],
    datasets: [
      {
        label: 'Inventory Value ($)',
        data: reportData?.warehouseBreakdown?.map((w) => w.stats?.totalValue || 0) || [],
        backgroundColor: '#0EA5E9' },
    ] };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Inventory Reports
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Analytics, turnover, aging, and valuation reports
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-900"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold">{reportData?.summary?.totalProducts || 0}</p>
                </div>
                <div className="p-3 bg-sky-100 rounded-full">
                  <Package className="h-6 w-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Stock</p>
                  <p className="text-2xl font-bold">
                    {(reportData?.summary?.totalQuantity || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Warehouse className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inventory Value</p>
                  <p className="text-2xl font-bold">
                    ${(reportData?.summary?.totalValue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Transactions ({dateRange}d)
                  </p>
                  <p className="text-2xl font-bold">
                    {reportData?.transactionSummary?.totals?.totalTransactions || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movement Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stock In</p>
                  <p className="text-2xl font-bold text-green-600">
                    +{(reportData?.transactionSummary?.totals?.totalIn || 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Last {dateRange} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stock Out</p>
                  <p className="text-2xl font-bold text-red-600">
                    -{(reportData?.transactionSummary?.totals?.totalOut || 0).toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Last {dateRange} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Net Change</p>
                  <p
                    className={`text-2xl font-bold ${
                      (reportData?.transactionSummary?.totals?.totalIn || 0) -
                        (reportData?.transactionSummary?.totals?.totalOut || 0) >=
                      0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {(reportData?.transactionSummary?.totals?.totalIn || 0) -
                      (reportData?.transactionSummary?.totals?.totalOut || 0) >=
                    0
                      ? '+'
                      : ''}
                    {(
                      (reportData?.transactionSummary?.totals?.totalIn || 0) -
                      (reportData?.transactionSummary?.totals?.totalOut || 0)
                    ).toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Last {dateRange} days</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stock Movement Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyTrendData.labels.length > 0 ? (
                <Line
                  data={dailyTrendData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' } },
                    scales: {
                      y: { beginAtZero: true } } }}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No transaction data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Types */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionTypeData.labels.length > 0 ? (
                <div className="h-64">
                  <Doughnut
                    data={transactionTypeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'right' } } }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No transaction data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Warehouse Breakdown & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Warehouse Value */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Value by Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              {warehouseData.labels.length > 0 ? (
                <Bar
                  data={warehouseData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => '$' + Number(value).toLocaleString() } } } }}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No warehouse data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.lowStockProducts && reportData.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {reportData.lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{product.totalStock}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          / {product.reorderPoint} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  No low stock items
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
