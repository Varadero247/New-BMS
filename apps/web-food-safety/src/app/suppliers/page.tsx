'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ims/ui';
import { Plus, Search, Building2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Item {
  id: string;
  [key: string]: unknown;
}

export default function SuppliersPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/suppliers');
        setItems(r.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter((i) =>
    JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Approved Suppliers
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Food supplier qualification and management
            </p>
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add Supplier
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search suppliers..."
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              Suppliers ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Rating</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                          {(item.name as string) || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {(item.category as string) || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {(item.rating as string) || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              item.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : item.status === 'CONDITIONAL'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {(item.status as string) || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No suppliers found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
