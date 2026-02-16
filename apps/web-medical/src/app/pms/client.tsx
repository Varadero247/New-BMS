'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import {
  Plus, Search, Loader2, Filter,
  Activity, Eye, FileText, AlertTriangle,
  CheckCircle2, Clock, ChevronLeft, BarChart3,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Plan {
  id: string;
  referenceNumber: string;
  deviceName: string;
  deviceId: string;
  planTitle: string;
  description: string;
  status: string;
  lastReviewDate: string | null;
  nextReviewDate: string | null;
  reviewFrequency: string;
  psurDue: string | null;
  pmcfRequired: boolean;
  dataSourceTypes: string;
  createdAt: string;
  updatedAt: string;
}

interface PMSReport {
  id: string;
  reportType: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  submittedDate: string | null;
  createdAt: string;
}

interface DashboardData {
  totalPlans: number;
  activePlans: number;
  reportsPending: number;
  overdueReviews: number;
  upcomingReviews: Plan[];
  recentReports: PMSReport[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLAN_STATUSES = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'SUSPENDED', 'CLOSED'] as const;

const REVIEW_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'] as const;

const REPORT_TYPES = ['PSUR', 'PMCF'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadgeVariant(status: string): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (status) {
    case 'DRAFT': return 'secondary';
    case 'ACTIVE': return 'success';
    case 'UNDER_REVIEW': return 'warning';
    case 'SUSPENDED': return 'danger';
    case 'CLOSED': return 'info';
    default: return 'outline';
  }
}

function formatDate(date: string | null): string {
  if (!date) return '--';
  return new Date(date).toLocaleDateString();
}

function isOverdue(date: string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

// ---------------------------------------------------------------------------
// Empty form states
// ---------------------------------------------------------------------------

const emptyPlanForm = {
  deviceName: '',
  deviceId: '',
  planTitle: '',
  description: '',
  reviewFrequency: 'ANNUALLY' as string,
  pmcfRequired: false,
  dataSourceTypes: '',
};

const emptyReportForm = {
  reportType: 'PSUR' as string,
  title: '',
  periodStart: '',
  periodEnd: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PMSClient() {
  // View state
  const [view, setView] = useState<'list' | 'detail' | 'dashboard'>('list');

  // Data state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Form state
  const [form, setForm] = useState(emptyPlanForm);
  const [reportForm, setReportForm] = useState(emptyReportForm);

  // Common state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/pms/plans');
      setPlans(response.data.data || []);
    } catch (err) {
      console.error('Failed to load PMS plans:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get('/pms/dashboard');
      setDashboard(response.data.data || null);
    } catch (err) {
      console.error('Failed to load PMS dashboard:', err);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchDashboard();
  }, [fetchPlans, fetchDashboard]);

  const fetchPlanDetail = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/pms/plans/${id}`);
      setSelectedPlan(response.data.data);
    } catch (err) {
      console.error('Failed to load plan detail:', err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/pms/plans', form);
      setShowCreateModal(false);
      setForm(emptyPlanForm);
      fetchPlans();
      fetchDashboard();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  }, [form, fetchPlans, fetchDashboard]);

  const handleCreateReport = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const endpoint = reportForm.reportType === 'PSUR'
        ? '/pms/reports/psur'
        : '/pms/reports/pmcf';
      await api.post(endpoint, reportForm);
      setShowReportModal(false);
      setReportForm(emptyReportForm);
      fetchDashboard();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create report');
    } finally {
      setSubmitting(false);
    }
  }, [reportForm, fetchDashboard]);

  const openDetail = useCallback(async (plan: Plan) => {
    await fetchPlanDetail(plan.id);
    setView('detail');
  }, [fetchPlanDetail]);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.deviceName?.toLowerCase().includes(q) &&
          !p.referenceNumber?.toLowerCase().includes(q) &&
          !p.planTitle?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [plans, statusFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: plans.length,
      active: plans.filter(p => p.status === 'ACTIVE').length,
      reportsPending: dashboard?.reportsPending || 0,
      overdueReviews: plans.filter(p => p.nextReviewDate && new Date(p.nextReviewDate) < now && p.status === 'ACTIVE').length,
    };
  }, [plans, dashboard]);

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading PMS plans...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // DETAIL VIEW
  // ---------------------------------------------------------------------------

  if (view === 'detail' && selectedPlan) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back navigation */}
          <button
            onClick={() => { setView('list'); setSelectedPlan(null); }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to PMS Plans
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
          )}

          {/* Plan Info Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedPlan.referenceNumber}</h1>
                    <Badge variant={getStatusBadgeVariant(selectedPlan.status)}>
                      {selectedPlan.status?.replace(/_/g, ' ')}
                    </Badge>
                    {selectedPlan.pmcfRequired && (
                      <Badge variant="warning">PMCF Required</Badge>
                    )}
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">{selectedPlan.planTitle}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Device: <strong>{selectedPlan.deviceName}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => { setReportForm(emptyReportForm); setError(''); setShowReportModal(true); }}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
                    size="sm"
                  >
                    <FileText className="h-4 w-4" />
                    Create Report
                  </Button>
                </div>
              </div>

              {selectedPlan.description && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{selectedPlan.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Device ID</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">{selectedPlan.deviceId || '--'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Review Frequency</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPlan.reviewFrequency?.replace(/_/g, ' ')}</p>
                </div>
                <div className={`rounded-lg p-3 ${isOverdue(selectedPlan.nextReviewDate) ? 'bg-red-50' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Last Review</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(selectedPlan.lastReviewDate)}</p>
                </div>
                <div className={`rounded-lg p-3 ${isOverdue(selectedPlan.nextReviewDate) ? 'bg-red-50' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Next Review</p>
                  <p className={`text-sm font-medium ${isOverdue(selectedPlan.nextReviewDate) ? 'text-red-700' : 'text-gray-900 dark:text-gray-100'}`}>
                    {formatDate(selectedPlan.nextReviewDate)}
                    {isOverdue(selectedPlan.nextReviewDate) && ' (OVERDUE)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">PSUR Due</p>
                  <p className={`text-sm font-medium ${isOverdue(selectedPlan.psurDue) ? 'text-red-700' : 'text-gray-900 dark:text-gray-100'}`}>
                    {formatDate(selectedPlan.psurDue)}
                    {isOverdue(selectedPlan.psurDue) && ' (OVERDUE)'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Data Sources</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPlan.dataSourceTypes || '--'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flags */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${selectedPlan.pmcfRequired ? 'bg-amber-500' : 'bg-gray-300'}`}></span>
              <span className="text-xs text-gray-600">PMCF Required</span>
            </div>
            {isOverdue(selectedPlan.nextReviewDate) && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-600 font-medium">Review overdue</span>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* MODAL: Create Report                                                 */}
        {/* ==================================================================== */}
        <Modal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Create PMS Report"
          size="md"
        >
          <form onSubmit={handleCreateReport}>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}
              <div>
                <Label htmlFor="r-type">Report Type *</Label>
                <Select
                  id="r-type"
                  value={reportForm.reportType}
                  onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
                >
                  {REPORT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="r-title">Report Title *</Label>
                <Input
                  id="r-title"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  required
                  placeholder="e.g. Annual PSUR 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="r-periodStart">Period Start *</Label>
                  <Input
                    id="r-periodStart"
                    type="date"
                    value={reportForm.periodStart}
                    onChange={(e) => setReportForm({ ...reportForm, periodStart: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="r-periodEnd">Period End *</Label>
                  <Input
                    id="r-periodEnd"
                    type="date"
                    value={reportForm.periodEnd}
                    onChange={(e) => setReportForm({ ...reportForm, periodEnd: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span>
                ) : 'Create Report'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // DASHBOARD VIEW
  // ---------------------------------------------------------------------------

  if (view === 'dashboard' && dashboard) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back navigation */}
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-teal-600 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to PMS Plans
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">PMS Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Post-Market Surveillance Overview</p>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
                <p className="text-3xl font-bold">{dashboard.totalPlans}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Plans</p>
                <p className="text-3xl font-bold text-green-600">{dashboard.activePlans}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Reports Pending</p>
                <p className="text-3xl font-bold text-amber-600">{dashboard.reportsPending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Reviews</p>
                <p className="text-3xl font-bold text-red-600">{dashboard.overdueReviews}</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Reviews */}
          {dashboard.upcomingReviews && dashboard.upcomingReviews.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Device</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Plan</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Next Review</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {dashboard.upcomingReviews.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:bg-gray-800">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{p.deviceName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{p.planTitle}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-medium ${isOverdue(p.nextReviewDate) ? 'text-red-700' : 'text-gray-700 dark:text-gray-300'}`}>
                              {formatDate(p.nextReviewDate)}
                              {isOverdue(p.nextReviewDate) && ' (OVERDUE)'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getStatusBadgeVariant(p.status)}>{p.status?.replace(/_/g, ' ')}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reports */}
          {dashboard.recentReports && dashboard.recentReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Type</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Title</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Period</th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {dashboard.recentReports.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 dark:bg-gray-800">
                          <td className="px-6 py-4">
                            <Badge variant={r.reportType === 'PSUR' ? 'info' : 'warning'}>{r.reportType}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{r.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {formatDate(r.periodStart)} - {formatDate(r.periodEnd)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getStatusBadgeVariant(r.status)}>{r.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // LIST VIEW
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Post-Market Surveillance</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">PMS Plans, PSUR & PMCF Reports</p>
        </div>

        {/* Overdue Warning Banner */}
        {stats.overdueReviews > 0 && (
          <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {stats.overdueReviews} plan{stats.overdueReviews > 1 ? 's have' : ' has'} overdue reviews
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Overdue PMS reviews may affect regulatory compliance. Please complete reviews promptly.
              </p>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Activity className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reports Pending</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.reportsPending}</p>
                </div>
                <FileText className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overdue Reviews</p>
                  <p className="text-3xl font-bold text-red-600">{stats.overdueReviews}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              aria-label="Search by device, reference, or plan title..." placeholder="Search by device, reference, or plan title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {statusFilter !== 'all' && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">Active</span>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => { fetchDashboard(); setView('dashboard'); }}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>

          <Button
            variant="outline"
            onClick={() => { setReportForm(emptyReportForm); setError(''); setShowReportModal(true); }}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            New Report
          </Button>

          <Button
            onClick={() => { setForm(emptyPlanForm); setError(''); setShowCreateModal(true); }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        </div>

        {showFilters && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex-wrap">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Statuses</option>
                {PLAN_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredPlans.length} of {plans.length} plans
          </p>
        </div>

        {/* Plans Table */}
        {loading ? <LoadingSpinner /> : filteredPlans.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Ref #</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Device Name</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Last Review</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Next Review</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">PMCF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPlans.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => openDetail(p)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">{p.referenceNumber || '--'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.deviceName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.planTitle}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(p.status)}>
                            {p.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(p.lastReviewDate)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${isOverdue(p.nextReviewDate) ? 'text-red-700' : 'text-gray-700 dark:text-gray-300'}`}>
                            {formatDate(p.nextReviewDate)}
                            {isOverdue(p.nextReviewDate) && ' !'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`w-3 h-3 rounded-full inline-block ${p.pmcfRequired ? 'bg-amber-500' : 'bg-gray-300'}`}></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16">
            <Eye className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No PMS plans found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create post-market surveillance plans to monitor device safety and performance.</p>
            <Button
              onClick={() => { setForm(emptyPlanForm); setError(''); setShowCreateModal(true); }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Plan
            </Button>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create Plan                                                   */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create PMS Plan"
        size="lg"
      >
        <form onSubmit={handleCreate}>
          <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <Label htmlFor="p-planTitle">Plan Title *</Label>
              <Input
                id="p-planTitle"
                value={form.planTitle}
                onChange={(e) => setForm({ ...form, planTitle: e.target.value })}
                required
                placeholder="e.g. PMS Plan for CardioMonitor Pro"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="p-deviceName">Device Name *</Label>
                <Input
                  id="p-deviceName"
                  value={form.deviceName}
                  onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
                  required
                  placeholder="e.g. CardioMonitor Pro"
                />
              </div>
              <div>
                <Label htmlFor="p-deviceId">Device Identifier</Label>
                <Input
                  id="p-deviceId"
                  value={form.deviceId}
                  onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
                  placeholder="UDI or catalog number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="p-description">Description</Label>
              <Textarea
                id="p-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe the scope and objectives of this PMS plan"
              />
            </div>

            <div>
              <Label htmlFor="p-reviewFrequency">Review Frequency *</Label>
              <Select
                id="p-reviewFrequency"
                value={form.reviewFrequency}
                onChange={(e) => setForm({ ...form, reviewFrequency: e.target.value })}
              >
                {REVIEW_FREQUENCIES.map(f => (
                  <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="p-dataSourceTypes">Data Source Types</Label>
              <Input
                id="p-dataSourceTypes"
                value={form.dataSourceTypes}
                onChange={(e) => setForm({ ...form, dataSourceTypes: e.target.value })}
                placeholder="e.g. Complaints, Clinical data, Literature"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="p-pmcfRequired"
                checked={form.pmcfRequired}
                onChange={(e) => setForm({ ...form, pmcfRequired: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <Label htmlFor="p-pmcfRequired">PMCF Required</Label>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span>
              ) : 'Create Plan'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Create Report                                                 */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Create PMS Report"
        size="md"
      >
        <form onSubmit={handleCreateReport}>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            <div>
              <Label htmlFor="r2-type">Report Type *</Label>
              <Select
                id="r2-type"
                value={reportForm.reportType}
                onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
              >
                {REPORT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="r2-title">Report Title *</Label>
              <Input
                id="r2-title"
                value={reportForm.title}
                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                required
                placeholder="e.g. Annual PSUR 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="r2-periodStart">Period Start *</Label>
                <Input
                  id="r2-periodStart"
                  type="date"
                  value={reportForm.periodStart}
                  onChange={(e) => setReportForm({ ...reportForm, periodStart: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="r2-periodEnd">Period End *</Label>
                <Input
                  id="r2-periodEnd"
                  type="date"
                  value={reportForm.periodEnd}
                  onChange={(e) => setReportForm({ ...reportForm, periodEnd: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span>
              ) : 'Create Report'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
