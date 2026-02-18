'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Search, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  description: string;
  quantity: number;
  amount: number;
  currency: string;
  deliveryDate: string;
  status: string;
  createdAt: string;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    load();
  }, []);
  async function load() {
    try {
      const res = await api.get('/supplier/purchase-orders');
      setOrders(res.data.data || []);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  }
  const filtered = orders.filter((o) =>
    JSON.stringify(o).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Purchase Orders</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View and confirm purchase orders
            </p>
          </div>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search purchase orders..."
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-cyan-600" />
              Purchase Orders ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        PO #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Qty
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Delivery Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((po) => (
                      <tr key={po.id} className="border-b hover:bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-mono">{po.poNumber}</td>
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {po.description}
                        </td>
                        <td className="py-3 px-4 text-right">{po.quantity}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          ${po.amount?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${po.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : po.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' : po.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-700' : 'bg-yellow-100 text-yellow-700'}`}
                          >
                            {po.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No purchase orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
