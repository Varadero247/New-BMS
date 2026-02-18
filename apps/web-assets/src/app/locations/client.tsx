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
import { MapPin, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface LocationCount {
  location: string;
  count: number;
}

export default function LocationsClient() {
  const [items, setItems] = useState<LocationCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const response = await api.get('/locations');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items.filter(
    (item) => !searchTerm || item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssets = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Locations</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Asset distribution by location</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Locations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-cyan-600">{totalAssets}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Assets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {items.length > 0 ? Math.round(totalAssets / items.length) : 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg per Location</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search locations"
              placeholder="Search locations..."
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
                      <TableHead>Location</TableHead>
                      <TableHead>Asset Count</TableHead>
                      <TableHead>% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems
                      .sort((a, b) => b.count - a.count)
                      .map((item) => (
                        <TableRow key={item.location}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-cyan-500" />
                              {item.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-lg font-semibold">{item.count}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[120px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-cyan-500 h-2 rounded-full"
                                  style={{
                                    width: `${totalAssets > 0 ? (item.count / totalAssets) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {totalAssets > 0
                                  ? ((item.count / totalAssets) * 100).toFixed(1)
                                  : 0}
                                %
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No locations found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Locations are derived from the asset register
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
