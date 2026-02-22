'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Package, Truck, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Order {
  id: string;
  referenceNumber: string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  deliveryDate?: string;
  totalValue: number;
  lineItems: number;
  trackingRef?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    referenceNumber: 'PTL-ORD-2026-001',
    description: 'Precision Components Batch — Q1 Production Run',
    status: 'DELIVERED',
    orderDate: '2026-01-10T08:00:00Z',
    deliveryDate: '2026-01-28T14:00:00Z',
    totalValue: 34500,
    lineItems: 12,
    trackingRef: 'DHL-GB-2026-88421',
  },
  {
    id: '2',
    referenceNumber: 'PTL-ORD-2026-002',
    description: 'Maintenance Consumables — Monthly Replenishment',
    status: 'SHIPPED',
    orderDate: '2026-02-08T09:30:00Z',
    deliveryDate: '2026-02-25T12:00:00Z',
    totalValue: 4850,
    lineItems: 7,
    trackingRef: 'FDX-IE-2026-14923',
  },
  {
    id: '3',
    referenceNumber: 'PTL-ORD-2026-003',
    description: 'Custom Fabrication — Structural Frame Assembly',
    status: 'PROCESSING',
    orderDate: '2026-02-14T11:00:00Z',
    totalValue: 18200,
    lineItems: 4,
  },
  {
    id: '4',
    referenceNumber: 'PTL-ORD-2026-004',
    description: 'Calibration Services — Annual Instrument Package',
    status: 'PENDING',
    orderDate: '2026-02-20T15:00:00Z',
    totalValue: 6300,
    lineItems: 3,
  },
  {
    id: '5',
    referenceNumber: 'PTL-ORD-2025-089',
    description: 'Prototype Tooling — Project Alpha Phase 2',
    status: 'CANCELLED',
    orderDate: '2025-12-01T10:00:00Z',
    totalValue: 9100,
    lineItems: 2,
  },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const ALL_STATUSES = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
type StatusFilter = (typeof ALL_STATUSES)[number];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await api.get('/portal/orders');
      setOrders(res.data.data || []);
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }

  const filtered = orders
    .filter((o) => statusFilter === 'ALL' || o.status === statusFilter)
    .filter(
      (o) =>
        search === '' ||
        o.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.description.toLowerCase().includes(search.toLowerCase()) ||
        (o.trackingRef ?? '').toLowerCase().includes(search.toLowerCase())
    );

  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => ['PENDING', 'PROCESSING'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalValue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalValue, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Order history and shipment tracking</p>
          </div>
          <Package className="h-7 w-7 text-teal-500 mt-1 flex-shrink-0" />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: totalOrders, color: 'text-gray-900 dark:text-white' },
            { label: 'In Progress', value: pendingCount, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Delivered', value: deliveredCount, color: 'text-green-600 dark:text-green-400' },
            {
              label: 'Total Value',
              value: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(totalValue),
              color: 'text-teal-600 dark:text-teal-400',
            },
          ].map((s) => (
            <Card key={s.label} className="border border-gray-200 dark:border-gray-700">
              <CardContent className="py-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-4 w-4 text-teal-500" />
              Orders ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Reference</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Order Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Est. Delivery</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Tracking</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                          {o.referenceNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200 max-w-xs">
                          <p className="font-medium truncate">{o.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{o.lineItems} line item{o.lineItems !== 1 ? 's' : ''}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                            {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                          {new Date(o.orderDate).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                          {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {o.trackingRef ? (
                            <span className="font-mono text-teal-600 dark:text-teal-400">{o.trackingRef}</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(o.totalValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No orders found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
