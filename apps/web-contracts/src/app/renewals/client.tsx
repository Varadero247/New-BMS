'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface Contract {
  id: string;
  referenceNumber: string;
  title: string;
  counterparty: string;
  value: number;
  currency: string;
  status: string;
  endDate: string;
  renewalDate: string;
  autoRenew: boolean;
  noticePeriodDays: number;
}

function getDaysUntil(date: string) {
  if (!date) return null;
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getUrgencyColor(days: number | null) {
  if (days === null) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  if (days <= 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  if (days <= 7) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  if (days <= 14) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  if (days <= 30) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
}

export default function RenewalsClient() {
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const response = await api.get('/renewals');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load renewals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filtered = searchTerm
    ? items.filter(
        (c) =>
          c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.counterparty?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  const overdue = filtered.filter(
    (c) => getDaysUntil(c.renewalDate) !== null && getDaysUntil(c.renewalDate)! <= 0
  );
  const dueSoon = filtered.filter((c) => {
    const d = getDaysUntil(c.renewalDate);
    return d !== null && d > 0 && d <= 14;
  });
  const upcoming = filtered.filter((c) => {
    const d = getDaysUntil(c.renewalDate);
    return d !== null && d > 14;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Renewals</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Upcoming contract renewals within 30 days
            </p>
          </div>
          <Button variant="outline" onClick={loadItems} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{filtered.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">{overdue.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">{dueSoon.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Due in 14 Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {filtered.filter((c) => c.autoRenew).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Auto-Renew</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search renewals"
              placeholder="Search by title or counterparty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Counterparty</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Renewal Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Auto-Renew</TableHead>
                      <TableHead>Notice Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => {
                      const days = getDaysUntil(item.renewalDate);
                      return (
                        <TableRow
                          key={item.id}
                          className={
                            days !== null && days <= 0 ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                          }
                        >
                          <TableCell className="font-mono text-xs">
                            {item.referenceNumber}
                          </TableCell>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell className="text-sm">{item.counterparty || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {item.value
                              ? `${item.currency || '$'}${item.value.toLocaleString()}`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.renewalDate
                              ? new Date(item.renewalDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(days)}`}
                            >
                              {days !== null
                                ? days <= 0
                                  ? `${Math.abs(days)}d overdue`
                                  : `${days}d`
                                : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.autoRenew ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              >
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.noticePeriodDays ? `${item.noticePeriodDays} days` : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming renewals</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Contracts with renewal dates within 30 days will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
