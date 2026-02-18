'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ims/ui';
import {
  Plus,
  ClipboardCheck,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Audit {
  id: string;
  auditNumber: string;
  title: string;
  description?: string;
  auditType: string;
  status: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  auditeeDepartment?: string;
  overallRating?: string;
  totalFindings: number;
  majorNCs: number;
  minorNCs: number;
  observations: number;
  _count?: { findings: number; teamMembers: number; checklists: number };
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  PREPARATION: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  REPORTING: 'bg-orange-100 text-orange-700',
  FINDINGS_REVIEW: 'bg-pink-100 text-pink-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const typeColors: Record<string, string> = {
  INTERNAL: 'bg-blue-100 text-blue-700',
  EXTERNAL: 'bg-purple-100 text-purple-700',
  SUPPLIER: 'bg-orange-100 text-orange-700',
  CUSTOMER: 'bg-green-100 text-green-700',
  CERTIFICATION: 'bg-indigo-100 text-indigo-700',
  SURVEILLANCE: 'bg-cyan-100 text-cyan-700',
};

const ratingColors: Record<string, string> = {
  EXCELLENT: 'bg-green-100 text-green-700',
  SATISFACTORY: 'bg-blue-100 text-blue-700',
  NEEDS_IMPROVEMENT: 'bg-yellow-100 text-yellow-700',
  UNSATISFACTORY: 'bg-red-100 text-red-700',
};

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadAudits();
  }, [statusFilter, typeFilter]);

  async function loadAudits() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('auditType', typeFilter);

      const res = await api.get(`/audits?${params.toString()}`);
      setAudits(res.data.data || []);
    } catch (error) {
      console.error('Failed to load audits:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    total: audits.length,
    planned: audits.filter((a) => a.status === 'PLANNED').length,
    inProgress: audits.filter((a) => a.status === 'IN_PROGRESS').length,
    completed: audits.filter((a) => a.status === 'COMPLETED').length,
    totalFindings: audits.reduce((sum, a) => sum + a.totalFindings, 0),
    majorNCs: audits.reduce((sum, a) => sum + a.majorNCs, 0),
  };

  // Calendar view of upcoming audits
  const upcomingAudits = audits
    .filter((a) => a.status === 'PLANNED' && new Date(a.plannedStartDate) > new Date())
    .sort((a, b) => new Date(a.plannedStartDate).getTime() - new Date(b.plannedStartDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Audit Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Internal and external audit scheduling and findings
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/audits/schedule">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Schedule
              </Button>
            </Link>
            <Link href="/audits/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> New Audit
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Audits</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Planned</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Findings</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalFindings}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Major NCs</p>
                  <p className="text-2xl font-bold text-red-600">{stats.majorNCs}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Audits */}
        {upcomingAudits.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Upcoming Audits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(audit.plannedStartDate).toLocaleDateString('en-US', {
                            month: 'short',
                          })}
                        </p>
                        <p className="text-lg font-bold">
                          {new Date(audit.plannedStartDate).getDate()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{audit.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {audit.auditeeDepartment || audit.auditType}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={typeColors[audit.auditType] || 'bg-gray-100 dark:bg-gray-800'}
                    >
                      {audit.auditType}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="PLANNED">Planned</option>
                <option value="PREPARATION">Preparation</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REPORTING">Reporting</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="CUSTOMER">Customer</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="SURVEILLANCE">Surveillance</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Audits List */}
        <Card>
          <CardHeader>
            <CardTitle>Audits</CardTitle>
          </CardHeader>
          <CardContent>
            {audits.length > 0 ? (
              <div className="space-y-4">
                {audits.map((audit) => (
                  <Link key={audit.id} href={`/audits/${audit.id}`}>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{audit.title}</span>
                          <Badge
                            className={statusColors[audit.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {audit.status.replace('_', ' ')}
                          </Badge>
                          <Badge
                            className={
                              typeColors[audit.auditType] || 'bg-gray-100 dark:bg-gray-800'
                            }
                          >
                            {audit.auditType}
                          </Badge>
                          {audit.overallRating && (
                            <Badge
                              className={
                                ratingColors[audit.overallRating] || 'bg-gray-100 dark:bg-gray-800'
                              }
                            >
                              {audit.overallRating.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{audit.auditNumber}</span>
                          <span>•</span>
                          <span>
                            {new Date(audit.plannedStartDate).toLocaleDateString()} -{' '}
                            {new Date(audit.plannedEndDate).toLocaleDateString()}
                          </span>
                          {audit.auditeeDepartment && (
                            <>
                              <span>•</span>
                              <span>{audit.auditeeDepartment}</span>
                            </>
                          )}
                          {audit.totalFindings > 0 && (
                            <>
                              <span>•</span>
                              <span className={audit.majorNCs > 0 ? 'text-red-500' : ''}>
                                {audit.totalFindings} findings ({audit.majorNCs} major)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{audit._count?.teamMembers || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audits found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
