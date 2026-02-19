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
import { UserCheck, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Induction {
  id: string;
  referenceNumber: string;
  courseId: string;
  employeeId: string;
  employeeName: string;
  status: string;
  scheduledDate: string;
  completedDate: string;
  score: number;
  passed: boolean;
  trainerName: string;
  location: string;
  course?: {
    title: string;
    code: string;
  };
  createdAt: string;
}

export default function InductionsClient() {
  const [inductions, setInductions] = useState<Induction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED'] as const;

  const loadInductions = useCallback(async () => {
    try {
      const response = await api.get('/inductions');
      setInductions(response.data.data || []);
    } catch (err) {
      console.error('Failed to load inductions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInductions();
  }, [loadInductions]);

  const filtered = inductions.filter((ind) => {
    if (statusFilter !== 'all' && ind.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (ind.employeeName || '').toLowerCase().includes(term) ||
        (ind.course?.title || '').toLowerCase().includes(term) ||
        (ind.referenceNumber || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' {
    if (status === 'COMPLETED') return 'secondary';
    if (status === 'IN_PROGRESS') return 'default';
    return 'outline';
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inductions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Employee induction training records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{inductions.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Inductions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {inductions.filter((i) => i.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {inductions.filter((i) => i.status === 'SCHEDULED').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {inductions.filter((i) => i.status === 'IN_PROGRESS').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              aria-label="Search inductions"
              placeholder="Search inductions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
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
                      <TableHead>Employee</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Passed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((ind) => (
                      <TableRow key={ind.id}>
                        <TableCell className="font-mono text-xs">{ind.referenceNumber}</TableCell>
                        <TableCell className="font-medium">
                          {ind.employeeName || ind.employeeId}
                        </TableCell>
                        <TableCell className="text-sm">
                          {ind.course?.title || ind.courseId}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(ind.status)}>
                            {ind.status?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {ind.scheduledDate
                            ? new Date(ind.scheduledDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {ind.completedDate
                            ? new Date(ind.completedDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {ind.score !== null ? `${ind.score}%` : '-'}
                        </TableCell>
                        <TableCell>
                          {ind.passed !== null ? (
                            <Badge variant={ind.passed ? 'secondary' : 'outline'}>
                              {ind.passed ? 'Yes' : 'No'}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No induction records found</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Induction records appear here when training records with type INDUCTION are
                  created.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
