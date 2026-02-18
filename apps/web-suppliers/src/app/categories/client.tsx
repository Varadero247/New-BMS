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
import { Tag, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface CategoryData {
  category: string;
  count: number;
}

export default function CategoriesClient() {
  const [items, setItems] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filtered = searchTerm
    ? items.filter((i) => i.category.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  const totalSuppliers = items.reduce((sum, i) => sum + i.count, 0);
  const sorted = [...filtered].sort((a, b) => b.count - a.count);

  const colors = [
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Supplier Categories
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Breakdown of suppliers by category
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-teal-600">{totalSuppliers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Suppliers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {items.length > 0 ? Math.round(totalSuppliers / items.length) : 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg per Category</p>
            </CardContent>
          </Card>
        </div>

        {items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {sorted.slice(0, 6).map((cat, idx) => (
              <Card key={cat.category} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${colors[idx % colors.length]}`}
                  >
                    {cat.category}
                  </div>
                  <p className="text-2xl font-bold">{cat.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {totalSuppliers > 0 ? Math.round((cat.count / totalSuppliers) * 100) : 0}% of
                    total
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search categories"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            ) : sorted.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Supplier Count</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Distribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((cat, idx) => (
                      <TableRow key={cat.category}>
                        <TableCell className="font-medium">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${colors[idx % colors.length]}`}
                          >
                            {cat.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{cat.count}</TableCell>
                        <TableCell className="text-sm">
                          {totalSuppliers > 0 ? Math.round((cat.count / totalSuppliers) * 100) : 0}%
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs">
                            <div
                              className="bg-teal-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${totalSuppliers > 0 ? (cat.count / totalSuppliers) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No categories found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Categories are derived from supplier records
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
