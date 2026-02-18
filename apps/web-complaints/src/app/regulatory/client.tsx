'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@ims/ui';
import { Scale, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface RegulatoryComplaint {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  complainantName: string;
  regulatoryBody: string;
  slaDeadline: string;
  rootCause: string;
  resolution: string;
  createdAt: string;
}

function getPriorityColor(p: string) {
  switch (p) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'LOW':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

export default function RegulatoryClient() {
  const [items, setItems] = useState<RegulatoryComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get('/regulatory');
        setItems(response.data.data || []);
      } catch (err) {
        console.error('Failed to load regulatory complaints:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = items.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(term) ||
      (item.referenceNumber || '').toLowerCase().includes(term) ||
      (item.regulatoryBody || '').toLowerCase().includes(term)
    );
  });

  const openCount = filtered.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const criticalCount = filtered.filter(
    (i) => i.priority === 'CRITICAL' || i.priority === 'HIGH'
  ).length;

  if (loading)
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Regulatory Complaints
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Complaints flagged for regulatory reporting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Regulatory</p>
                  <p className="text-3xl font-bold mt-1">{filtered.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Scale className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600">{openCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">High/Critical Priority</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search regulatory complaints"
              placeholder="Search by title, ref, or regulatory body..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Regulatory Body</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SLA Deadline</TableHead>
                      <TableHead>Filed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.referenceNumber}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {item.title}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {item.regulatoryBody || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(item.category || '').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}
                          >
                            {item.priority}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === 'RESOLVED' || item.status === 'CLOSED'
                                ? 'secondary'
                                : item.status === 'ESCALATED'
                                  ? 'destructive'
                                  : 'default'
                            }
                          >
                            {(item.status || '').replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.slaDeadline ? new Date(item.slaDeadline).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Scale className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No regulatory complaints found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
