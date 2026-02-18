'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { TrendingDown, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface DepreciationAsset {
  id: string;
  name: string;
  purchaseCost: number;
  currentValue: number;
  purchaseDate: string;
}

export default function DepreciationClient() {
  const [items, setItems] = useState<DepreciationAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const response = await api.get('/depreciation');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load depreciation data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items.filter(
    (item) => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchaseCost = items.reduce((sum, item) => sum + (item.purchaseCost || 0), 0);
  const totalCurrentValue = items.reduce((sum, item) => sum + (item.currentValue || 0), 0);
  const totalDepreciation = totalPurchaseCost - totalCurrentValue;

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  function getDepreciationPercent(purchase: number, current: number) {
    if (!purchase || purchase === 0) return 0;
    return ((purchase - (current || 0)) / purchase) * 100;
  }

  function getDepreciationColor(percent: number) {
    if (percent >= 80) return 'text-red-600 dark:text-red-400';
    if (percent >= 50) return 'text-orange-600 dark:text-orange-400';
    if (percent >= 25) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Depreciation</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Asset value tracking and depreciation analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tracked Assets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-cyan-600">
                {formatCurrency(totalPurchaseCost)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Purchase Cost</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totalCurrentValue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDepreciation)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Depreciation</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search assets"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Purchase Cost</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>Depreciation</TableHead>
                      <TableHead>% Depreciated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const depPercent = getDepreciationPercent(
                        item.purchaseCost,
                        item.currentValue
                      );
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-sm">
                            {item.purchaseDate
                              ? new Date(item.purchaseDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {formatCurrency(item.purchaseCost || 0)}
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {formatCurrency(item.currentValue || 0)}
                          </TableCell>
                          <TableCell className="text-sm font-mono text-red-600 dark:text-red-400">
                            {formatCurrency((item.purchaseCost || 0) - (item.currentValue || 0))}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{ width: `${Math.min(depPercent, 100)}%` }}
                                />
                              </div>
                              <span
                                className={`text-sm font-medium ${getDepreciationColor(depPercent)}`}
                              >
                                {depPercent.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingDown className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No depreciation data found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Assets with purchase cost values will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
