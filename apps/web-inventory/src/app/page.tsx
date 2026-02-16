'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  DollarSign,
  BarChart,
} from 'lucide-react';
import { inventoryApi } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalQuantityOnHand: number;
  totalInventoryValue: number;
  lowStockCount: number;
  recentTransactions: number;
  warehouses: any[];
  lowStockProducts: any[];
  transactionSummary: any;
}

export default function InventoryDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [summaryRes, warehousesRes, lowStockRes, transactionsRes] = await Promise.all([
        inventoryApi.getInventorySummary().catch(() => ({ data: { data: null } })),
        inventoryApi.getWarehouses({ limit: 5 }).catch(() => ({ data: { data: [] } })),
        inventoryApi.getLowStockProducts().catch(() => ({ data: { data: [] } })),
        inventoryApi.getTransactionSummary().catch(() => ({ data: { data: null } })),
      ]);

      const summary = summaryRes.data?.data || {
        totalProducts: 0,
        totalQuantityOnHand: 0,
        totalInventoryValue: 0,
        lowStockCount: 0,
        recentTransactions: 0,
      };

      setStats({
        ...summary,
        warehouses: warehousesRes.data?.data || [],
        lowStockProducts: (lowStockRes.data?.data || []).slice(0, 5),
        transactionSummary: transactionsRes.data?.data || null,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Unable to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inventory Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time inventory overview and stock management</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <button onClick={() => { setError(''); setLoading(true); loadDashboardData(); }} className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline ml-4 shrink-0">Retry</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                </div>
                <div className="p-3 bg-sky-100 dark:bg-sky-900 rounded-full">
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
                  <p className="text-2xl font-bold">{(stats?.totalQuantityOnHand || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <BarChart className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Units across all warehouses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Inventory Value</p>
                  <p className="text-2xl font-bold">${(stats?.totalInventoryValue || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.lowStockCount || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <Link href="/products?lowStock=true" className="text-xs text-sky-600 hover:underline mt-2 inline-block">
                View all alerts
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Summary */}
        {stats?.transactionSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total In (30 days)</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{(stats.transactionSummary.totals?.totalIn || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Out (30 days)</p>
                    <p className="text-2xl font-bold text-red-600">
                      -{(stats.transactionSummary.totals?.totalOut || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Transactions (30 days)</p>
                    <p className="text-2xl font-bold">{stats.transactionSummary.totals?.totalTransactions || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <ArrowRightLeft className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.lowStockProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border-l-4 border-orange-500">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</span>
                          {product.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600">
                              {product.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">{product.totalStock}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">/ {product.reorderPoint} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No low stock alerts</p>
              )}
            </CardContent>
          </Card>

          {/* Warehouses Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-sky-500" />
                Warehouses Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.warehouses && stats.warehouses.length > 0 ? (
                <div className="space-y-3">
                  {stats.warehouses.map((warehouse: any) => (
                    <Link
                      key={warehouse.id}
                      href={`/warehouses?id=${warehouse.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{warehouse.name}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{warehouse.code}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{warehouse.stats?.totalProducts || 0} products</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{(warehouse.stats?.totalQuantity || 0).toLocaleString()} units</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No warehouses configured</p>
              )}
              <Link
                href="/warehouses"
                className="block text-center text-sm text-sky-600 hover:underline mt-4"
              >
                Manage Warehouses
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/products?action=new"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-sky-500 hover:shadow-sm transition-all"
            >
              <Package className="h-8 w-8 text-sky-500" />
              <div>
                <p className="font-medium">Add Product</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create new product</p>
              </div>
            </Link>

            <Link
              href="/adjustments"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-sky-500 hover:shadow-sm transition-all"
            >
              <ArrowRightLeft className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">Stock Adjustment</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Adjust inventory levels</p>
              </div>
            </Link>

            <Link
              href="/adjustments?type=transfer"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-sky-500 hover:shadow-sm transition-all"
            >
              <Warehouse className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Transfer Stock</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Move between warehouses</p>
              </div>
            </Link>

            <Link
              href="/reports"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-sky-500 hover:shadow-sm transition-all"
            >
              <BarChart className="h-8 w-8 text-orange-500" />
              <div>
                <p className="font-medium">View Reports</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Analytics & insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
