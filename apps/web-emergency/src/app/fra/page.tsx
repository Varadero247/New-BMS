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
import { FileSearch, Plus, Search, AlertTriangle, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import Sidebar from '@/components/sidebar';
import { api } from '@/lib/api';
import Link from 'next/link';

interface FRA {
  id: string;
  referenceNumber: string;
  premisesId: string;
  premisesName: string;
  assessorName: string;
  assessmentDate: string;
  reviewDate: string;
  status: string;
  overallRiskRating: string;
  findingsCount: number;
  actionsOpen: number;
  createdAt: string;
}

const STATUS_FILTERS = ['ALL', 'CURRENT', 'ACTION_REQUIRED', 'OVERDUE', 'NOT_COMPLETED'] as const;

const RISK_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  VERY_HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'CURRENT':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'ACTION_REQUIRED':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'OVERDUE':
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

export default function FRAPage() {
  const [fras, setFras] = useState<FRA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadFRAs = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const r = await api.get('/fra', { params });
      setFras(r.data.data || []);
    } catch (e: unknown) {
      setError('Failed to load fire risk assessments.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => { loadFRAs(); }, [loadFRAs]);

  const overdue = fras.filter((f) => f.status === 'OVERDUE').length;
  const actionRequired = fras.filter((f) => f.status === 'ACTION_REQUIRED').length;
  const current = fras.filter((f) => f.status === 'CURRENT').length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Fire Risk Assessments
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                FSO 2005 compliant FRAs across all premises
              </p>
            </div>
            <Link href="/fra/new">
              <Button
                className="flex items-center gap-2 text-white"
                style={{ backgroundColor: '#F04B5A' }}
              >
                <Plus className="h-4 w-4" />
                New FRA
              </Button>
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{fras.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total FRAs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{current}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-amber-600">{actionRequired}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Action Required</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold" style={{ color: '#F04B5A' }}>{overdue}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by premises or assessor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === f
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={statusFilter === f ? { backgroundColor: '#F04B5A' } : undefined}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* FRA Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="animate-pulse space-y-4 p-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              ) : fras.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Premises</TableHead>
                        <TableHead>Assessor</TableHead>
                        <TableHead>Assessment Date</TableHead>
                        <TableHead>Review Due</TableHead>
                        <TableHead>Risk Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Open Actions</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fras.map((fra) => (
                        <TableRow key={fra.id}>
                          <TableCell className="font-mono text-xs">{fra.referenceNumber}</TableCell>
                          <TableCell className="font-medium">{fra.premisesName}</TableCell>
                          <TableCell>{fra.assessorName}</TableCell>
                          <TableCell className="text-sm">
                            {fra.assessmentDate
                              ? new Date(fra.assessmentDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {fra.reviewDate ? (
                              <span
                                className={
                                  new Date(fra.reviewDate) < new Date()
                                    ? 'text-red-600 font-medium'
                                    : ''
                                }
                              >
                                {new Date(fra.reviewDate).toLocaleDateString()}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {fra.overallRiskRating ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  RISK_COLORS[fra.overallRiskRating] || RISK_COLORS.MEDIUM
                                }`}
                              >
                                {fra.overallRiskRating.replace(/_/g, ' ')}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <StatusIcon status={fra.status} />
                              <span className="text-sm">{fra.status?.replace(/_/g, ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {fra.actionsOpen > 0 ? (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-bold"
                                style={{ backgroundColor: '#FEE2E4', color: '#F04B5A' }}
                              >
                                {fra.actionsOpen} open
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link href={`/premises/${fra.premisesId}?tab=fra`}>
                              <Button size="sm" variant="outline" className="gap-1">
                                View <ChevronRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileSearch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No fire risk assessments found</p>
                  <Link href="/fra/new">
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First FRA
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
