'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import {
  Plus, RefreshCw, AlertTriangle, CheckCircle, Clock, Search, ClipboardCheck,
  Calendar, BarChart3, XCircle, Play, Eye, Layers,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LpaSchedule {
  id: string;
  processArea: string;
  layer: number;
  frequency: string;
  questions: string[];
  active: boolean;
  createdAt: string;
}

interface LpaAuditResponse {
  questionIndex: number;
  question: string;
  conforming: boolean;
  notes?: string;
}

interface LpaAudit {
  id: string;
  scheduleId: string;
  processArea?: string;
  layer?: number;
  auditor?: string;
  status: string;
  score?: number;
  responses?: LpaAuditResponse[];
  completedAt?: string;
  createdAt: string;
}

interface LpaDashboard {
  totalAudits: number;
  averageScore: number;
  failRate: number;
  completedThisMonth: number;
  overdueSchedules: number;
  topIssues: { question: string; failCount: number }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = ['Schedules', 'Audits', 'Dashboard'] as const;
type Tab = typeof TABS[number];

const FREQUENCIES = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY'] as const;

const LAYERS = [
  { value: 1, label: 'Layer 1 - Team Lead' },
  { value: 2, label: 'Layer 2 - Supervisor' },
  { value: 3, label: 'Layer 3 - Plant Manager' },
  { value: 4, label: 'Layer 4 - Director / VP' },
];

const auditStatusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LpaClient() {
  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>('Schedules');

  // Schedule state
  const [schedules, setSchedules] = useState<LpaSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // Audit state
  const [audits, setAudits] = useState<LpaAudit[]>([]);
  const [auditsLoading, setAuditsLoading] = useState(true);

  // Dashboard state
  const [dashboard, setDashboard] = useState<LpaDashboard | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Common
  const [error, setError] = useState<string | null>(null);

  // Create schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    processArea: '',
    layer: 1,
    frequency: 'WEEKLY',
    questionsText: '',
  });

  // Create audit modal
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditSubmitting, setAuditSubmitting] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  // Audit detail modal
  const [showAuditDetail, setShowAuditDetail] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<LpaAudit | null>(null);
  const [auditDetailLoading, setAuditDetailLoading] = useState(false);

  // Respond / complete
  const [respondingIdx, setRespondingIdx] = useState<number | null>(null);
  const [respondForm, setRespondForm] = useState({ conforming: true, notes: '' });
  const [respondSubmitting, setRespondSubmitting] = useState(false);
  const [completingAudit, setCompletingAudit] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadSchedules = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/lpa/schedules');
      setSchedules(response.data.data || []);
    } catch (err) {
      console.error('Failed to load LPA schedules:', err);
      setError('Failed to load schedules.');
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  const loadAudits = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/lpa/audits');
      setAudits(response.data.data || []);
    } catch (err) {
      console.error('Failed to load LPA audits:', err);
      setError('Failed to load audits.');
    } finally {
      setAuditsLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/lpa/dashboard');
      setDashboard(response.data.data || null);
    } catch (err) {
      console.error('Failed to load LPA dashboard:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedules();
    loadAudits();
    loadDashboard();
  }, [loadSchedules, loadAudits, loadDashboard]);

  // -------------------------------------------------------------------------
  // Create Schedule
  // -------------------------------------------------------------------------

  function openScheduleModal() {
    setScheduleForm({ processArea: '', layer: 1, frequency: 'WEEKLY', questionsText: '' });
    setShowScheduleModal(true);
  }

  async function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setScheduleSubmitting(true);
    try {
      const questions = scheduleForm.questionsText
        .split('\n')
        .map(q => q.trim())
        .filter(Boolean);
      await api.post('/lpa/schedules', {
        processArea: scheduleForm.processArea,
        layer: Number(scheduleForm.layer),
        frequency: scheduleForm.frequency,
        questions,
      });
      setShowScheduleModal(false);
      loadSchedules();
    } catch (err) {
      console.error('Failed to create schedule:', err);
    } finally {
      setScheduleSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Create Audit
  // -------------------------------------------------------------------------

  function openAuditModal() {
    setSelectedScheduleId(schedules.length > 0 ? schedules[0].id : '');
    setShowAuditModal(true);
  }

  async function handleAuditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedScheduleId) return;
    setAuditSubmitting(true);
    try {
      await api.post('/lpa/audits', { scheduleId: selectedScheduleId });
      setShowAuditModal(false);
      loadAudits();
      loadDashboard();
    } catch (err) {
      console.error('Failed to create audit:', err);
    } finally {
      setAuditSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Audit Detail / Respond / Complete
  // -------------------------------------------------------------------------

  async function openAuditDetail(audit: LpaAudit) {
    setShowAuditDetail(true);
    setAuditDetailLoading(true);
    setRespondingIdx(null);
    try {
      const response = await api.get(`/lpa/audits`);
      const auditsData: LpaAudit[] = response.data.data || [];
      const found = auditsData.find((a: LpaAudit) => a.id === audit.id);
      setSelectedAudit(found || audit);
    } catch {
      setSelectedAudit(audit);
    } finally {
      setAuditDetailLoading(false);
    }
  }

  async function handleRespond(auditId: string, questionIndex: number) {
    setRespondSubmitting(true);
    try {
      await api.post(`/lpa/audits/${auditId}/respond`, {
        questionIndex,
        conforming: respondForm.conforming,
        notes: respondForm.notes,
      });
      // Reload audit list to get updated data
      const response = await api.get('/lpa/audits');
      const auditsData: LpaAudit[] = response.data.data || [];
      const updated = auditsData.find((a: LpaAudit) => a.id === auditId);
      if (updated) setSelectedAudit(updated);
      setAudits(auditsData);
      setRespondingIdx(null);
      setRespondForm({ conforming: true, notes: '' });
    } catch (err) {
      console.error('Failed to submit response:', err);
    } finally {
      setRespondSubmitting(false);
    }
  }

  async function handleCompleteAudit(auditId: string) {
    setCompletingAudit(true);
    try {
      await api.post(`/lpa/audits/${auditId}/complete`);
      setShowAuditDetail(false);
      setSelectedAudit(null);
      loadAudits();
      loadDashboard();
    } catch (err) {
      console.error('Failed to complete audit:', err);
    } finally {
      setCompletingAudit(false);
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  }

  const filteredSchedules = useMemo(() => {
    return schedules.filter(s =>
      !searchQuery ||
      s.processArea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.frequency?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schedules, searchQuery]);

  const filteredAudits = useMemo(() => {
    return audits.filter(a =>
      !searchQuery ||
      a.processArea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.auditor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [audits, searchQuery]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Layered Process Audits</h1>
            <p className="text-gray-500 mt-1">CQI-8 Layered Process Audit Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => { loadSchedules(); loadAudits(); loadDashboard(); }} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {activeTab === 'Schedules' && (
              <Button onClick={openScheduleModal} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4" />
                New Schedule
              </Button>
            )}
            {activeTab === 'Audits' && (
              <Button onClick={openAuditModal} disabled={schedules.length === 0} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4" />
                New Audit
              </Button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => { loadSchedules(); loadAudits(); loadDashboard(); }}>Retry</Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-orange-600 text-orange-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search (for Schedules and Audits tabs) */}
        {activeTab !== 'Dashboard' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'Schedules' ? 'Search by process area, frequency...' : 'Search by process area, auditor, status...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* =============================================================== */}
        {/* SCHEDULES TAB                                                   */}
        {/* =============================================================== */}
        {activeTab === 'Schedules' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                LPA Schedules ({filteredSchedules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}
                </div>
              ) : filteredSchedules.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Process Area</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Layer</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Frequency</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Questions</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchedules.map((schedule) => (
                        <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">{schedule.processArea}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-orange-100 text-orange-700">L{schedule.layer}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-gray-600">{schedule.frequency}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-gray-600">{schedule.questions?.length || 0}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={schedule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                              {schedule.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(schedule.createdAt)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedScheduleId(schedule.id);
                                setShowAuditModal(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                              title="Create audit from this schedule"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No schedules found</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {searchQuery
                      ? 'Try adjusting your search query.'
                      : 'Create your first LPA schedule to get started.'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={openScheduleModal} className="flex items-center gap-2 mx-auto bg-orange-600 hover:bg-orange-700">
                      <Plus className="h-4 w-4" />
                      Create First Schedule
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* =============================================================== */}
        {/* AUDITS TAB                                                      */}
        {/* =============================================================== */}
        {activeTab === 'Audits' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-orange-500" />
                LPA Audits ({filteredAudits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}
                </div>
              ) : filteredAudits.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Process Area</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Layer</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Auditor</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Score</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">Completed</th>
                        <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAudits.map((audit) => (
                        <tr key={audit.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-gray-900">{audit.processArea || '-'}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {audit.layer ? (
                              <Badge className="bg-orange-100 text-orange-700">L{audit.layer}</Badge>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{audit.auditor || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={auditStatusColors[audit.status] || 'bg-gray-100 text-gray-700'}>
                              {audit.status?.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {audit.score !== null && audit.score !== undefined ? (
                              <span className={`text-sm font-bold ${
                                audit.score >= 90 ? 'text-green-600' :
                                audit.score >= 70 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {audit.score}%
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(audit.createdAt)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(audit.completedAt)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => openAuditDetail(audit)}
                              className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                              title="View audit details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No audits found</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {searchQuery
                      ? 'Try adjusting your search query.'
                      : 'Create an audit from a schedule to get started.'}
                  </p>
                  {!searchQuery && schedules.length > 0 && (
                    <Button onClick={openAuditModal} className="flex items-center gap-2 mx-auto bg-orange-600 hover:bg-orange-700">
                      <Plus className="h-4 w-4" />
                      Create First Audit
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* =============================================================== */}
        {/* DASHBOARD TAB                                                   */}
        {/* =============================================================== */}
        {activeTab === 'Dashboard' && (
          <>
            {dashboardLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded" />)}
                </div>
              </div>
            ) : dashboard ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Audits</p>
                          <p className="text-3xl font-bold">{dashboard.totalAudits}</p>
                        </div>
                        <ClipboardCheck className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Average Score</p>
                          <p className={`text-3xl font-bold ${
                            dashboard.averageScore >= 90 ? 'text-green-600' :
                            dashboard.averageScore >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {dashboard.averageScore !== null && dashboard.averageScore !== undefined
                              ? `${Math.round(dashboard.averageScore)}%`
                              : '-'}
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Fail Rate</p>
                          <p className={`text-3xl font-bold ${
                            dashboard.failRate <= 10 ? 'text-green-600' :
                            dashboard.failRate <= 25 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {dashboard.failRate !== null && dashboard.failRate !== undefined
                              ? `${Math.round(dashboard.failRate)}%`
                              : '-'}
                          </p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Completed This Month</p>
                          <p className="text-3xl font-bold text-green-600">{dashboard.completedThisMonth}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Overdue Schedules */}
                {dashboard.overdueSchedules > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      <strong>{dashboard.overdueSchedules}</strong> overdue audit schedule{dashboard.overdueSchedules !== 1 ? 's' : ''} require attention.
                    </span>
                  </div>
                )}

                {/* Top Issues */}
                {dashboard.topIssues && dashboard.topIssues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Top Non-Conformance Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dashboard.topIssues.map((issue, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700 flex-1">{issue.question}</span>
                            <Badge className="bg-red-100 text-red-700 ml-4">
                              {issue.failCount} fail{issue.failCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!dashboard.topIssues?.length && dashboard.totalAudits === 0 && (
                  <Card>
                    <CardContent className="py-16">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">No audit data yet</h3>
                        <p className="text-sm text-gray-400">Complete some audits to see dashboard analytics.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">Dashboard unavailable</h3>
                    <p className="text-sm text-gray-400">Failed to load dashboard data.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* ================================================================= */}
      {/* CREATE SCHEDULE MODAL                                             */}
      {/* ================================================================= */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="New LPA Schedule"
        size="lg"
      >
        <form onSubmit={handleScheduleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div>
              <Label htmlFor="lpa-processArea">Process Area *</Label>
              <Input
                id="lpa-processArea"
                value={scheduleForm.processArea}
                onChange={e => setScheduleForm({ ...scheduleForm, processArea: e.target.value })}
                required
                placeholder="e.g. Welding Line A, Paint Booth 2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lpa-layer">Layer *</Label>
                <Select
                  id="lpa-layer"
                  value={String(scheduleForm.layer)}
                  onChange={e => setScheduleForm({ ...scheduleForm, layer: parseInt(e.target.value) })}
                >
                  {LAYERS.map(l => (
                    <option key={l.value} value={String(l.value)}>{l.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="lpa-frequency">Frequency *</Label>
                <Select
                  id="lpa-frequency"
                  value={scheduleForm.frequency}
                  onChange={e => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                >
                  {FREQUENCIES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="lpa-questions">Questions (one per line) *</Label>
              <Textarea
                id="lpa-questions"
                value={scheduleForm.questionsText}
                onChange={e => setScheduleForm({ ...scheduleForm, questionsText: e.target.value })}
                rows={6}
                required
                placeholder={"Is the work instruction posted and current?\nAre operators following the control plan?\nIs the error-proofing device functional?\nAre all gages within calibration?"}
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter each audit question on a separate line.
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={scheduleSubmitting} className="bg-orange-600 hover:bg-orange-700">
              {scheduleSubmitting ? 'Creating...' : 'Create Schedule'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* CREATE AUDIT MODAL                                                */}
      {/* ================================================================= */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Create Audit from Schedule"
        size="lg"
      >
        <form onSubmit={handleAuditSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div>
              <Label htmlFor="audit-schedule">Select Schedule *</Label>
              <Select
                id="audit-schedule"
                value={selectedScheduleId}
                onChange={e => setSelectedScheduleId(e.target.value)}
              >
                {schedules.length === 0 && <option value="">No schedules available</option>}
                {schedules.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.processArea} - Layer {s.layer} ({s.frequency})
                  </option>
                ))}
              </Select>
            </div>

            {selectedScheduleId && (() => {
              const sel = schedules.find(s => s.id === selectedScheduleId);
              if (!sel) return null;
              return (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Process Area</p>
                      <p className="text-sm font-medium">{sel.processArea}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Layer</p>
                      <p className="text-sm font-medium">Layer {sel.layer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Questions</p>
                      <p className="text-sm font-medium">{sel.questions?.length || 0}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Audit Questions:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {sel.questions?.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 font-mono mt-0.5">{idx + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()}
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowAuditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={auditSubmitting || !selectedScheduleId} className="bg-orange-600 hover:bg-orange-700">
              {auditSubmitting ? 'Creating...' : 'Start Audit'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* AUDIT DETAIL MODAL                                                */}
      {/* ================================================================= */}
      <Modal
        isOpen={showAuditDetail}
        onClose={() => { setShowAuditDetail(false); setSelectedAudit(null); setRespondingIdx(null); }}
        title={selectedAudit ? `LPA Audit: ${selectedAudit.processArea || 'Audit'}` : 'Audit Detail'}
        size="lg"
      >
        {auditDetailLoading ? (
          <div className="py-12">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}
            </div>
          </div>
        ) : selectedAudit ? (
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            {/* Audit Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedAudit.layer && (
                <Badge className="bg-orange-100 text-orange-700">Layer {selectedAudit.layer}</Badge>
              )}
              <Badge className={auditStatusColors[selectedAudit.status] || 'bg-gray-100'}>
                {selectedAudit.status?.replace(/_/g, ' ')}
              </Badge>
              {selectedAudit.score !== null && selectedAudit.score !== undefined && (
                <Badge className={`${
                  selectedAudit.score >= 90 ? 'bg-green-100 text-green-700' :
                  selectedAudit.score >= 70 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Score: {selectedAudit.score}%
                </Badge>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Process Area</p>
                  <p className="text-sm font-medium">{selectedAudit.processArea || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Layer</p>
                  <p className="text-sm font-medium">{selectedAudit.layer ? `Layer ${selectedAudit.layer}` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Auditor</p>
                  <p className="text-sm font-medium">{selectedAudit.auditor || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm">{formatDate(selectedAudit.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Responses / Questions */}
            {selectedAudit.responses && selectedAudit.responses.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                  <Layers className="h-4 w-4 inline-block mr-1" />
                  Audit Questions &amp; Responses
                </h3>
                <div className="space-y-2">
                  {selectedAudit.responses.map((resp, idx) => {
                    const isResponding = respondingIdx === idx;
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-3 rounded ${isResponding ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                        <span className="text-xs font-mono text-gray-400 w-6 text-right mt-0.5">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{resp.question}</p>
                          {resp.conforming !== undefined && resp.conforming !== null && !isResponding ? (
                            <div className="mt-1 flex items-center gap-2">
                              {resp.conforming ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={`text-xs font-medium ${resp.conforming ? 'text-green-600' : 'text-red-600'}`}>
                                {resp.conforming ? 'Conforming' : 'Non-Conforming'}
                              </span>
                              {resp.notes && (
                                <span className="text-xs text-gray-400 ml-2">- {resp.notes}</span>
                              )}
                            </div>
                          ) : null}

                          {isResponding && (
                            <div className="mt-2 flex items-center gap-3">
                              <Select
                                value={respondForm.conforming ? 'true' : 'false'}
                                onChange={e => setRespondForm({ ...respondForm, conforming: e.target.value === 'true' })}
                                className="text-xs py-1 w-40"
                              >
                                <option value="true">Conforming</option>
                                <option value="false">Non-Conforming</option>
                              </Select>
                              <input
                                type="text"
                                placeholder="Notes..."
                                value={respondForm.notes}
                                onChange={e => setRespondForm({ ...respondForm, notes: e.target.value })}
                                className="text-xs border border-gray-200 rounded px-2 py-1 flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => handleRespond(selectedAudit.id, idx)}
                                disabled={respondSubmitting}
                                className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 disabled:opacity-50"
                              >
                                {respondSubmitting ? '...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setRespondingIdx(null)}
                                className="text-xs text-gray-500 hover:text-gray-700 px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                        {!isResponding && selectedAudit.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRespondingIdx(idx);
                              setRespondForm({
                                conforming: resp.conforming !== undefined ? resp.conforming : true,
                                notes: resp.notes || '',
                              });
                            }}
                            className="p-1 text-gray-400 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                            title="Respond to this question"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Complete Audit */}
            {selectedAudit.status !== 'COMPLETED' && selectedAudit.status !== 'CANCELLED' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Complete Audit</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Mark this audit as complete. The score will be calculated based on responses.
                </p>
                <Button
                  onClick={() => handleCompleteAudit(selectedAudit.id)}
                  disabled={completingAudit}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completingAudit ? 'Completing...' : 'Complete Audit'}
                </Button>
              </div>
            )}
          </div>
        ) : null}

        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowAuditDetail(false); setSelectedAudit(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
