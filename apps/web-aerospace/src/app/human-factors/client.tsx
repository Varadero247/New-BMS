'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card, CardContent,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import {
  Plus, Search, Loader2, Users,
  AlertTriangle, Brain, BarChart3,
  Clock, Activity,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HFIncident {
  id: string;
  refNumber?: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  incidentDate: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

interface FatigueAssessment {
  id: string;
  refNumber?: string;
  personnelName: string;
  hoursWorked: number;
  restHours: number;
  fatigueScore: number;
  riskLevel?: string;
  createdAt: string;
  updatedAt: string;
}

interface DirtyDozenStat {
  category: string;
  count: number;
}

interface DashboardData {
  totalIncidents: number;
  bySeverity: { severity: string; count: number }[];
  dirtyDozen: DirtyDozenStat[];
  recentIncidents?: HFIncident[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIRTY_DOZEN = [
  'Lack of Communication',
  'Complacency',
  'Lack of Knowledge',
  'Distraction',
  'Lack of Teamwork',
  'Fatigue',
  'Lack of Resources',
  'Pressure',
  'Lack of Assertiveness',
  'Stress',
  'Lack of Awareness',
  'Norms',
] as const;

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSeverityVariant(severity: string): 'success' | 'warning' | 'info' | 'secondary' | 'danger' | 'destructive' {
  switch (severity) {
    case 'LOW': return 'secondary';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'danger';
    case 'CRITICAL': return 'destructive';
    default: return 'info';
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'LOW': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-300';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300';
  }
}

function getFatigueRiskColor(score: number): string {
  if (score <= 3) return 'bg-green-100 text-green-700 border-green-300';
  if (score <= 5) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  if (score <= 7) return 'bg-orange-100 text-orange-700 border-orange-300';
  return 'bg-red-100 text-red-700 border-red-300';
}

function getFatigueRiskLabel(score: number): string {
  if (score <= 3) return 'LOW';
  if (score <= 5) return 'MODERATE';
  if (score <= 7) return 'HIGH';
  return 'CRITICAL';
}

function getCategoryBarColor(index: number): string {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
  ];
  return colors[index % colors.length];
}

// ---------------------------------------------------------------------------
// Empty form states
// ---------------------------------------------------------------------------

const emptyIncidentForm = {
  title: '',
  description: '',
  category: DIRTY_DOZEN[0] as string,
  severity: 'MEDIUM' as string,
  incidentDate: new Date().toISOString().split('T')[0],
};

const emptyFatigueForm = {
  personnelName: '',
  hoursWorked: '',
  restHours: '',
  fatigueScore: '5',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HumanFactorsClient() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'incidents' | 'fatigue' | 'dashboard'>('incidents');

  // Incidents state
  const [incidents, setIncidents] = useState<HFIncident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState(emptyIncidentForm);

  // Fatigue state
  const [fatigueAssessments, setFatigueAssessments] = useState<FatigueAssessment[]>([]);
  const [fatigueLoading, setFatigueLoading] = useState(true);
  const [showFatigueModal, setShowFatigueModal] = useState(false);
  const [fatigueForm, setFatigueForm] = useState(emptyFatigueForm);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dirtyDozenData, setDirtyDozenData] = useState<DirtyDozenStat[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Shared state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchIncidents = useCallback(async () => {
    setIncidentsLoading(true);
    try {
      const response = await api.get('/human-factors/incidents');
      setIncidents(response.data.data || []);
    } catch (err) {
      console.error('Failed to load HF incidents:', err);
    } finally {
      setIncidentsLoading(false);
    }
  }, []);

  const fetchFatigue = useCallback(async () => {
    setFatigueLoading(true);
    try {
      const response = await api.get('/human-factors/fatigue');
      setFatigueAssessments(response.data.data || []);
    } catch (err) {
      console.error('Failed to load fatigue assessments:', err);
    } finally {
      setFatigueLoading(false);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const [dashRes, ddRes] = await Promise.all([
        api.get('/human-factors/dashboard'),
        api.get('/human-factors/dirty-dozen'),
      ]);
      setDashboardData(dashRes.data.data || null);
      setDirtyDozenData(ddRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchFatigue();
    fetchDashboard();
  }, [fetchIncidents, fetchFatigue, fetchDashboard]);

  // ---------------------------------------------------------------------------
  // Submit handlers
  // ---------------------------------------------------------------------------

  const handleCreateIncident = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/human-factors/incidents', incidentForm);
      setShowIncidentModal(false);
      setIncidentForm(emptyIncidentForm);
      fetchIncidents();
      fetchDashboard();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create incident');
      console.error('Failed to create HF incident:', err);
    } finally {
      setSubmitting(false);
    }
  }, [incidentForm, fetchIncidents, fetchDashboard]);

  const handleCreateFatigue = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/human-factors/fatigue', {
        personnelName: fatigueForm.personnelName,
        hoursWorked: Number(fatigueForm.hoursWorked),
        restHours: Number(fatigueForm.restHours),
        fatigueScore: Number(fatigueForm.fatigueScore),
      });
      setShowFatigueModal(false);
      setFatigueForm(emptyFatigueForm);
      fetchFatigue();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create fatigue assessment');
      console.error('Failed to create fatigue assessment:', err);
    } finally {
      setSubmitting(false);
    }
  }, [fatigueForm, fetchFatigue]);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredIncidents = useMemo(() => incidents.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.refNumber || '').toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }), [incidents, searchQuery]);

  const filteredFatigue = useMemo(() => fatigueAssessments.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.personnelName.toLowerCase().includes(query) ||
      (item.refNumber || '').toLowerCase().includes(query)
    );
  }), [fatigueAssessments, searchQuery]);

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = ({ text }: { text: string }) => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">{text}</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Dirty Dozen bar chart
  // ---------------------------------------------------------------------------

  const maxDDCount = useMemo(() => {
    const max = Math.max(...dirtyDozenData.map(d => d.count), 1);
    return max;
  }, [dirtyDozenData]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Human Factors</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Aviation human factors management -- Dirty Dozen analysis and fatigue risk</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {[
            { key: 'incidents' as const, label: 'Incidents', icon: AlertTriangle },
            { key: 'fatigue' as const, label: 'Fatigue', icon: Activity },
            { key: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* TAB: Incidents                                                     */}
        {/* ================================================================= */}
        {activeTab === 'incidents' && (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search by title, ref number, category..." placeholder="Search by title, ref number, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => { setIncidentForm(emptyIncidentForm); setError(''); setShowIncidentModal(true); }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Report Incident
              </Button>
            </div>

            {/* Incidents list */}
            {incidentsLoading ? <LoadingSpinner text="Loading human factors incidents..." /> : filteredIncidents.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Ref</th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Title</th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Category (Dirty Dozen)</th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Severity</th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredIncidents.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-sm font-mono text-indigo-600 font-medium">{item.refNumber || '--'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                              {item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">{item.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={getSeverityVariant(item.severity)}>
                                {item.severity}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">
                                {new Date(item.incidentDate).toLocaleDateString()}
                              </span>
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
                <AlertTriangle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Human Factors Incidents</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Report a human factors incident to begin tracking Dirty Dozen categories.
                </p>
                <Button
                  onClick={() => { setIncidentForm(emptyIncidentForm); setError(''); setShowIncidentModal(true); }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Report First Incident
                </Button>
              </div>
            )}

            {!incidentsLoading && incidents.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredIncidents.length} of {incidents.length} incidents
              </div>
            )}
          </>
        )}

        {/* ================================================================= */}
        {/* TAB: Fatigue                                                       */}
        {/* ================================================================= */}
        {activeTab === 'fatigue' && (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search by personnel name..." placeholder="Search by personnel name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => { setFatigueForm(emptyFatigueForm); setError(''); setShowFatigueModal(true); }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                New Assessment
              </Button>
            </div>

            {/* Fatigue list */}
            {fatigueLoading ? <LoadingSpinner text="Loading fatigue assessments..." /> : filteredFatigue.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Ref</th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Personnel Name</th>
                          <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Hours Worked</th>
                          <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Rest Hours</th>
                          <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Fatigue Score</th>
                          <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Risk Level</th>
                          <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredFatigue.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                            <td className="px-4 py-3">
                              <span className="text-sm font-mono text-indigo-600 font-medium">{item.refNumber || '--'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.personnelName}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{item.hoursWorked}h</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{item.restHours}h</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${getFatigueRiskColor(item.fatigueScore)}`}>
                                {item.fatigueScore}/10
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${getFatigueRiskColor(item.fatigueScore)}`}>
                                {item.riskLevel || getFatigueRiskLabel(item.fatigueScore)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-600">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
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
                <Activity className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Fatigue Assessments</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create a fatigue assessment to begin monitoring personnel fatigue risk.
                </p>
                <Button
                  onClick={() => { setFatigueForm(emptyFatigueForm); setError(''); setShowFatigueModal(true); }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  First Assessment
                </Button>
              </div>
            )}

            {!fatigueLoading && fatigueAssessments.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredFatigue.length} of {fatigueAssessments.length} assessments
              </div>
            )}
          </>
        )}

        {/* ================================================================= */}
        {/* TAB: Dashboard                                                     */}
        {/* ================================================================= */}
        {activeTab === 'dashboard' && (
          <>
            {dashboardLoading ? <LoadingSpinner text="Loading dashboard..." /> : (
              <div className="space-y-8">
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Incidents</p>
                          <p className="text-3xl font-bold">{dashboardData?.totalIncidents || 0}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-indigo-500" />
                      </div>
                    </CardContent>
                  </Card>
                  {(dashboardData?.bySeverity || []).map((item) => (
                    <Card key={item.severity}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.severity}</p>
                            <p className="text-3xl font-bold">{item.count}</p>
                          </div>
                          <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Dirty Dozen Analysis */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Dirty Dozen Category Analysis</h3>
                    {dirtyDozenData.length > 0 ? (
                      <div className="space-y-3">
                        {dirtyDozenData.map((item, idx) => (
                          <div key={item.category} className="flex items-center gap-4">
                            <div className="w-48 text-sm text-gray-700 dark:text-gray-300 text-right truncate" title={item.category}>
                              {item.category}
                            </div>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-6 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getCategoryBarColor(idx)} transition-all duration-500`}
                                style={{ width: `${(item.count / maxDDCount) * 100}%` }}
                              />
                            </div>
                            <div className="w-10 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
                              {item.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                        <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">No Dirty Dozen data available yet.</p>
                        <p className="text-xs mt-1">Report human factors incidents to populate this analysis.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Incidents by Severity breakdown */}
                {dashboardData?.bySeverity && dashboardData.bySeverity.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Incidents by Severity</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {dashboardData.bySeverity.map((item) => (
                          <div key={item.severity} className="text-center">
                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 mb-2 ${getSeverityColor(item.severity)}`}>
                              <span className="text-xl font-bold">{item.count}</span>
                            </div>
                            <p className="text-sm text-gray-600">{item.severity}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create HF Incident                                            */}
      {/* ==================================================================== */}
      <Modal isOpen={showIncidentModal} onClose={() => setShowIncidentModal(false)} title="Report Human Factors Incident" size="lg">
        <form onSubmit={handleCreateIncident}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Incident Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hf-title">Title *</Label>
                  <Input
                    id="hf-title"
                    value={incidentForm.title}
                    onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                    required
                    placeholder="e.g. Missed inspection step during engine change"
                  />
                </div>

                <div>
                  <Label htmlFor="hf-description">Description *</Label>
                  <Textarea
                    id="hf-description"
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                    required
                    rows={4}
                    placeholder="Detailed description of the human factors incident..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hf-category">Category (Dirty Dozen) *</Label>
                    <Select
                      id="hf-category"
                      value={incidentForm.category}
                      onChange={(e) => setIncidentForm({ ...incidentForm, category: e.target.value })}
                    >
                      {DIRTY_DOZEN.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hf-severity">Severity *</Label>
                    <Select
                      id="hf-severity"
                      value={incidentForm.severity}
                      onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                    >
                      {SEVERITIES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="hf-date">Incident Date *</Label>
                  <Input
                    id="hf-date"
                    type="date"
                    value={incidentForm.incidentDate}
                    onChange={(e) => setIncidentForm({ ...incidentForm, incidentDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowIncidentModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Reporting...</span>
              ) : 'Report Incident'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Create Fatigue Assessment                                     */}
      {/* ==================================================================== */}
      <Modal isOpen={showFatigueModal} onClose={() => setShowFatigueModal(false)} title="New Fatigue Assessment" size="lg">
        <form onSubmit={handleCreateFatigue}>
          <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Assessment Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fa-name">Personnel Name *</Label>
                  <Input
                    id="fa-name"
                    value={fatigueForm.personnelName}
                    onChange={(e) => setFatigueForm({ ...fatigueForm, personnelName: e.target.value })}
                    required
                    placeholder="e.g. John Smith"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fa-hoursWorked">Hours Worked (last 24h) *</Label>
                    <Input
                      id="fa-hoursWorked"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={fatigueForm.hoursWorked}
                      onChange={(e) => setFatigueForm({ ...fatigueForm, hoursWorked: e.target.value })}
                      required
                      placeholder="e.g. 12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fa-restHours">Rest Hours (last 24h) *</Label>
                    <Input
                      id="fa-restHours"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={fatigueForm.restHours}
                      onChange={(e) => setFatigueForm({ ...fatigueForm, restHours: e.target.value })}
                      required
                      placeholder="e.g. 8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fa-fatigueScore">Fatigue Score (1-10) *</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="fa-fatigueScore"
                      type="range"
                      min="1"
                      max="10"
                      value={fatigueForm.fatigueScore}
                      onChange={(e) => setFatigueForm({ ...fatigueForm, fatigueScore: e.target.value })}
                      className="flex-1"
                    />
                    <span className={`inline-flex items-center text-sm font-bold px-3 py-1 rounded-full border ${getFatigueRiskColor(Number(fatigueForm.fatigueScore))}`}>
                      {fatigueForm.fatigueScore}/10
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <span>1 - Alert</span>
                    <span>5 - Moderate</span>
                    <span>10 - Exhausted</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Risk Level: <span className="font-semibold">{getFatigueRiskLabel(Number(fatigueForm.fatigueScore))}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowFatigueModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700">
              {submitting ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span>
              ) : 'Save Assessment'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
