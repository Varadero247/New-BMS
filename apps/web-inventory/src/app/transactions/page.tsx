'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell } from '@ims/ui';
import {
  History,
  Search,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft } from 'lucide-react';
import { inventoryApi } from '@/lib/api';

interface Transaction {
  id: string;
  referenceNumber: string;
  transactionType: string;
  productId: string;
  warehouseId?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number;
  binLocation?: string;
  lotNumber?: string;
  unitCost: number;
  totalCost: number;
  reason?: string;
  notes?: string;
  performedById: string;
  transactionDate: string;
  product: { id: string; sku: string; name: string };
  warehouse?: { id: string; code: string; name: string };
  fromWarehouse?: { id: string; code: string; name: string };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  useEffect(() => {
    loadTransactions();
  }, [meta.page, transactionType, dateRange]);

  async function loadTransactions() {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page: meta.page,
        limit: meta.limit };
      if (transactionType) params.transactionType = transactionType;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;

      const res = await inventoryApi.getTransactions(params);
      setTransactions(res.data.data || []);
      setMeta(res.data.meta || meta);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTransactionIcon = (type: string) => {
    if (type.includes('IN') || type === 'RECEIPT' || type === 'RETURN' || type === 'INITIAL') {
      return <ArrowDown className="h-4 w-4 text-green-500" />;
    }
    if (type.includes('OUT') || type === 'ISSUE' || type === 'DAMAGE' || type === 'EXPIRED') {
      return <ArrowUp className="h-4 w-4 text-red-500" />;
    }
    return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
  };

  const getTransactionBadge = (type: string) => {
    const colors: Record<string, string> = {
      RECEIPT: 'bg-green-100 text-green-700',
      ISSUE: 'bg-red-100 text-red-700',
      ADJUSTMENT_IN: 'bg-green-100 text-green-700',
      ADJUSTMENT_OUT: 'bg-red-100 text-red-700',
      TRANSFER_IN: 'bg-blue-100 text-blue-700',
      TRANSFER_OUT: 'bg-purple-100 text-purple-700',
      CYCLE_COUNT: 'bg-yellow-100 text-yellow-700',
      RETURN: 'bg-orange-100 text-orange-700',
      DAMAGE: 'bg-red-100 text-red-700',
      EXPIRED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
      INITIAL: 'bg-sky-100 text-sky-700' };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
      >
        {type.replace('_', ' ')}
      </span>
    );
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      t.referenceNumber.toLowerCase().includes(searchLower) ||
      t.product.sku.toLowerCase().includes(searchLower) ||
      t.product.name.toLowerCase().includes(searchLower)
    );
  });

  const transactionTypes = [
    'RECEIPT',
    'ISSUE',
    'ADJUSTMENT_IN',
    'ADJUSTMENT_OUT',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'CYCLE_COUNT',
    'RETURN',
    'DAMAGE',
    'EXPIRED',
    'INITIAL',
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Transaction History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete audit trail of inventory movements
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search by reference, SKU, or product..."
                  placeholder="Search by reference, SKU, or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={transactionType}
                onChange={(e) => {
                  setTransactionType(e.target.value);
                  setMeta({ ...meta, page: 1 });
                }}
                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-900"
              >
                <option value="">All Types</option>
                {transactionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-40"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-40"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setTransactionType('');
                  setDateRange({ start: '', end: '' });
                  setSearch('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-sky-500" />
              Transactions ({meta.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Before</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">After</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell className="text-sm">
                          <div>
                            <p>{new Date(txn.transactionDate).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(txn.transactionDate).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{txn.referenceNumber}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(txn.transactionType)}
                            {getTransactionBadge(txn.transactionType)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{txn.product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {txn.product.sku}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {txn.transactionType.includes('TRANSFER') ? (
                            <div className="text-sm">
                              <p>{txn.fromWarehouse?.name || '-'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                → {txn.warehouse?.name || '-'}
                              </p>
                            </div>
                          ) : (
                            <span>{txn.warehouse?.name || '-'}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {txn.quantityBefore.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-semibold ${
                            txn.quantityChange > 0
                              ? 'text-green-600'
                              : txn.quantityChange < 0
                                ? 'text-red-600'
                                : ''
                          }`}
                        >
                          {txn.quantityChange > 0 ? '+' : ''}
                          {txn.quantityChange.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {txn.quantityAfter.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          ${txn.totalCost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 truncate max-w-[150px] block">
                            {txn.reason || '-'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(meta.page - 1) * meta.limit + 1} to{' '}
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page <= 1}
                      onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
