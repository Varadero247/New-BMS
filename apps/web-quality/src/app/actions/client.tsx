'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  ModalFooter,
  Input,
  Label,
  Select,
  Textarea } from '@ims/ui';
import {
  Plus,
  ClipboardList,
  Search,
  Loader2,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle,
  Target,
  CalendarDays } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_TYPES = [
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'PREVENTIVE', label: 'Preventive' },
  { value: 'IMPROVEMENT', label: 'Improvement' },
  { value: 'AUDIT_FINDING', label: 'Audit Finding' },
  { value: 'RISK_TREATMENT', label: 'Risk Treatment' },
  { value: 'OBJECTIVE_SUPPORT', label: 'Objective Support' },
  { value: 'LEGAL_COMPLIANCE', label: 'Legal Compliance' },
  { value: 'OTHER', label: 'Other' },
] as const;

const ACTION_PRIORITIES = [
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' },
] as const;

const ACTION_STATUSES = [
  { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
  {
    value: 'PENDING_VERIFICATION',
    label: 'Pending Verification',
    color: 'bg-purple-100 text-purple-800' },
  { value: 'VERIFIED', label: 'Verified', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
] as const;

const ACTION_SOURCES = [
  { value: 'NC', label: 'Nonconformance' },
  { value: 'CAPA', label: 'CAPA' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'RISK_ASSESSMENT', label: 'Risk Assessment' },
  { value: 'MANAGEMENT_REVIEW', label: 'Management Review' },
  { value: 'CUSTOMER_FEEDBACK', label: 'Customer Feedback' },
  { value: 'PROCESS_IMPROVEMENT', label: 'Process Improvement' },
  { value: 'LEGAL_REQUIREMENT', label: 'Legal Requirement' },
  { value: 'OTHER', label: 'Other' },
] as const;

const VERIFICATION_METHODS = [
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'TESTING', label: 'Testing' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'MONITORING', label: 'Monitoring' },
  { value: 'OTHER', label: 'Other' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActionRecord {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  actionType: string;
  priority: string;
  status: string;
  source: string;
  sourceReference: string;
  assignedTo: string;
  department: string;
  dueDate: string;
  completionDate: string;
  percentComplete: number;
  progressNotes: string;
  expectedOutcome: string;
  verificationMethod: string;
  verifiedBy: string;
  verificationDate: string;
  effective: boolean;
  linkedNc: string;
  linkedCapa: string;
  linkedProcess: string;
  linkedFmea: string;
  createdAt: string;
  updatedAt: string;
}

interface ActionForm {
  title: string;
  actionType: string;
  priority: string;
  source: string;
  sourceReference: string;
  description: string;
  expectedOutcome: string;
  assignedTo: string;
  department: string;
  dueDate: string;
  status: string;
  progressNotes: string;
  completionDate: string;
  percentComplete: number;
  verificationMethod: string;
  verifiedBy: string;
  verificationDate: string;
  effective: boolean;
  linkedNc: string;
  linkedCapa: string;
  linkedProcess: string;
  linkedFmea: string;
}

interface AiAnalysis {
  riskLevel: string;
  suggestedPriority: string;
  recommendedActions: string[];
  potentialImpact: string;
  suggestedTimeline: string;
  complianceNotes: string;
}

const emptyForm: ActionForm = {
  title: '',
  actionType: 'CORRECTIVE',
  priority: 'MEDIUM',
  source: 'NC',
  sourceReference: '',
  description: '',
  expectedOutcome: '',
  assignedTo: '',
  department: '',
  dueDate: '',
  status: 'OPEN',
  progressNotes: '',
  completionDate: '',
  percentComplete: 0,
  verificationMethod: 'INSPECTION',
  verifiedBy: '',
  verificationDate: '',
  effective: false,
  linkedNc: '',
  linkedCapa: '',
  linkedProcess: '',
  linkedFmea: '' };

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActionsClient() {
  // Data state
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ActionForm>({ ...emptyForm });
  const [activeSection, setActiveSection] = useState<string>('A');
  const [formError, setFormError] = useState<string | null>(null);

  // AI state
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);

  // ─── Data Loading ─────────────────────────────────────────────────

  const loadActions = useCallback(async () => {
    try {
      setError(null);
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.actionType = typeFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (sourceFilter !== 'all') params.source = sourceFilter;
      const response = await api.get('/actions', { params });
      setActions(response.data.data || []);
    } catch (err) {
      console.error('Failed to load actions:', err);
      setError('Failed to load actions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter, priorityFilter, sourceFilter]);

  useEffect(() => {
    loadActions();
  }, [loadActions]);

  // ─── Helpers ──────────────────────────────────────────────────────

  const isOverdue = (dueDate: string, status: string): boolean => {
    if (!dueDate) return false;
    if (['COMPLETED', 'VERIFIED', 'CANCELLED'].includes(status)) return false;
    return new Date(dueDate) < new Date();
  };

  const getPriorityBadge = (priority: string) => {
    const p = ACTION_PRIORITIES.find((ap) => ap.value === priority);
    return p ? (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.color}`}>{p.label}</span>
    ) : (
      <Badge variant="outline">{priority}</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = ACTION_STATUSES.find((as2) => as2.value === status);
    return s ? (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
    ) : (
      <Badge variant="outline">{status}</Badge>
    );
  };

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const counts = {
    total: actions.length,
    open: actions.filter((a) => a.status === 'OPEN' || a.status === 'IN_PROGRESS').length,
    overdue: actions.filter((a) => isOverdue(a.dueDate, a.status)).length,
    completedThisMonth: actions.filter(
      (a) =>
        (a.status === 'COMPLETED' || a.status === 'VERIFIED') &&
        a.completionDate &&
        new Date(a.completionDate) >= startOfMonth
    ).length };

  // ─── Filtering ────────────────────────────────────────────────────

  const filteredActions = actions.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.referenceNumber?.toLowerCase().includes(q) ||
        a.assignedTo?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ─── Modal Handlers ───────────────────────────────────────────────

  function openCreateModal() {
    setForm({ ...emptyForm });
    setActiveSection('A');
    setFormError(null);
    setAiAnalysis(null);
    setAiExpanded(false);
    setModalOpen(true);
  }

  function updateForm(field: keyof ActionForm, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required.');
      setActiveSection('A');
      return;
    }
    if (!form.dueDate) {
      setFormError('Due date is required.');
      setActiveSection('B');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        title: form.title,
        actionType: form.actionType,
        priority: form.priority,
        source: form.source,
        description: form.description || undefined,
        expectedOutcome: form.expectedOutcome || undefined,
        sourceReference: form.sourceReference || undefined,
        assignedTo: form.assignedTo || undefined,
        department: form.department || undefined,
        dueDate: form.dueDate || undefined,
        status: form.status,
        progressNotes: form.progressNotes || undefined,
        completionDate: form.completionDate || undefined,
        percentComplete: form.percentComplete,
        verificationMethod: form.verificationMethod || undefined,
        verifiedBy: form.verifiedBy || undefined,
        verificationDate: form.verificationDate || undefined,
        effective: form.effective,
        linkedNc: form.linkedNc || undefined,
        linkedCapa: form.linkedCapa || undefined,
        linkedProcess: form.linkedProcess || undefined,
        linkedFmea: form.linkedFmea || undefined };
      await api.post('/actions', payload);
      setModalOpen(false);
      setForm({ ...emptyForm });
      loadActions();
    } catch (err) {
      console.error('Failed to create action:', err);
      setFormError('Failed to create action. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── AI Analysis ──────────────────────────────────────────────────

  async function generateAiAnalysis() {
    if (!form.title || form.title.length < 10) return;
    setAiLoading(true);
    try {
      const response = await api.post('/actions/ai-analyse', {
        title: form.title,
        actionType: form.actionType,
        priority: form.priority,
        source: form.source,
        description: form.description,
        expectedOutcome: form.expectedOutcome });
      const data = response.data.data;
      if (data) {
        setAiAnalysis(data);
        setAiExpanded(true);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally {
      setAiLoading(false);
    }
  }

  // ─── Section Definitions ──────────────────────────────────────────

  const sections = [
    { key: 'A', label: 'Action Detail' },
    { key: 'B', label: 'Assignment' },
    { key: 'C', label: 'Progress' },
    { key: 'D', label: 'Verification' },
    { key: 'E', label: 'Cross-Links' },
    { key: 'F', label: 'AI Analysis' },
  ];

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quality Actions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track corrective, preventive, and improvement actions across the quality system
            </p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Action
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Actions</p>
                  <p className="text-3xl font-bold">{counts.total}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                  <p className="text-3xl font-bold text-blue-600">{counts.open}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
                  <p className="text-3xl font-bold text-red-600">{counts.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed This Month</p>
                  <p className="text-3xl font-bold text-green-600">{counts.completedThisMonth}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search actions by title, reference, assignee..."
                  placeholder="Search actions by title, reference, assignee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                {ACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="all">All Statuses</option>
                {ACTION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="all">All Priorities</option>
                {ACTION_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="all">All Sources</option>
                {ACTION_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Actions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              Actions ({filteredActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                ))}
              </div>
            ) : filteredActions.length > 0 ? (
              <div className="space-y-4">
                {filteredActions.map((action) => {
                  const overdue = isOverdue(action.dueDate, action.status);
                  return (
                    <div
                      key={action.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        overdue
                          ? 'border-red-300 bg-red-50 hover:border-red-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              {action.referenceNumber}
                            </span>
                            {getStatusBadge(action.status)}
                            {getPriorityBadge(action.priority)}
                            <Badge variant="outline">
                              {ACTION_TYPES.find((t) => t.value === action.actionType)?.label ||
                                action.actionType?.replace(/_/g, ' ')}
                            </Badge>
                            {overdue && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {action.title}
                          </h3>
                          {action.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {action.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                            {action.assignedTo && <span>Assigned: {action.assignedTo}</span>}
                            {action.source && (
                              <span>
                                Source:{' '}
                                {ACTION_SOURCES.find((s) => s.value === action.source)?.label ||
                                  action.source}
                              </span>
                            )}
                          </div>
                          {/* Progress Bar */}
                          {action.percentComplete > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{action.percentComplete}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    action.percentComplete >= 100
                                      ? 'bg-green-500'
                                      : action.percentComplete >= 50
                                        ? 'bg-blue-500'
                                        : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${Math.min(action.percentComplete, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          <div
                            className={`text-sm flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}
                          >
                            <Clock className="h-4 w-4" />
                            {action.dueDate
                              ? new Date(action.dueDate).toLocaleDateString()
                              : 'No due date'}
                          </div>
                          {overdue && action.dueDate && (
                            <p className="text-xs text-red-500 mt-1">
                              {Math.ceil(
                                (new Date().getTime() - new Date(action.dueDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{' '}
                              days overdue
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <ClipboardList className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-1">No actions found</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  Create your first quality action to start tracking corrective and preventive
                  measures.
                </p>
                <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Create First Action
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Create Action Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Quality Action"
        size="full"
      >
        <form onSubmit={handleSubmit}>
          {/* Section Tabs */}
          <div className="flex gap-1 mb-6 border-b overflow-x-auto">
            {sections.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveSection(s.key)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === s.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {s.key}. {s.label}
              </button>
            ))}
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {/* Section A: Action Detail */}
            {activeSection === 'A' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  A -- Action Detail
                </div>
                <div>
                  <Label htmlFor="act-title">Title *</Label>
                  <Input
                    id="act-title"
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    required
                    placeholder="Brief description of the action required"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="act-type">Action Type *</Label>
                    <Select
                      id="act-type"
                      value={form.actionType}
                      onChange={(e) => updateForm('actionType', e.target.value)}
                    >
                      {ACTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="act-priority">Priority *</Label>
                    <Select
                      id="act-priority"
                      value={form.priority}
                      onChange={(e) => updateForm('priority', e.target.value)}
                    >
                      {ACTION_PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="act-source">Source</Label>
                    <Select
                      id="act-source"
                      value={form.source}
                      onChange={(e) => updateForm('source', e.target.value)}
                    >
                      {ACTION_SOURCES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="act-sourceRef">Source Reference</Label>
                    <Input
                      id="act-sourceRef"
                      value={form.sourceReference}
                      onChange={(e) => updateForm('sourceReference', e.target.value)}
                      placeholder="e.g., NC-001, CAPA-005, Audit ref"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="act-description">Description *</Label>
                  <Textarea
                    id="act-description"
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={4}
                    placeholder="Detailed description of the action to be taken, including context and reasoning"
                  />
                </div>
                <div>
                  <Label htmlFor="act-expectedOutcome">Expected Outcome</Label>
                  <Textarea
                    id="act-expectedOutcome"
                    value={form.expectedOutcome}
                    onChange={(e) => updateForm('expectedOutcome', e.target.value)}
                    rows={2}
                    placeholder="What successful completion of this action looks like"
                  />
                </div>
              </div>
            )}

            {/* Section B: Assignment */}
            {activeSection === 'B' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  B -- Assignment
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="act-assignedTo">Assigned To *</Label>
                    <Input
                      id="act-assignedTo"
                      value={form.assignedTo}
                      onChange={(e) => updateForm('assignedTo', e.target.value)}
                      placeholder="Person responsible for completing this action"
                    />
                  </div>
                  <div>
                    <Label htmlFor="act-department">Department</Label>
                    <Input
                      id="act-department"
                      value={form.department}
                      onChange={(e) => updateForm('department', e.target.value)}
                      placeholder="e.g., Quality, Production, Engineering"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="act-dueDate">Due Date *</Label>
                    <Input
                      id="act-dueDate"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => updateForm('dueDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="act-status">Status</Label>
                    <Select
                      id="act-status"
                      value={form.status}
                      onChange={(e) => updateForm('status', e.target.value)}
                    >
                      {ACTION_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Section C: Progress */}
            {activeSection === 'C' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  C -- Progress
                </div>
                <div>
                  <Label htmlFor="act-progressNotes">Progress Notes</Label>
                  <Textarea
                    id="act-progressNotes"
                    value={form.progressNotes}
                    onChange={(e) => updateForm('progressNotes', e.target.value)}
                    rows={4}
                    placeholder="Log of progress updates, milestones, and obstacles"
                  />
                </div>
                <div>
                  <Label htmlFor="act-completionDate">Completion Date</Label>
                  <Input
                    id="act-completionDate"
                    type="date"
                    value={form.completionDate}
                    onChange={(e) => updateForm('completionDate', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave blank until the action is actually completed.
                  </p>
                </div>
                <div>
                  <Label htmlFor="act-percentComplete">
                    Percent Complete: {form.percentComplete}%
                  </Label>
                  <input
                    id="act-percentComplete"
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={form.percentComplete}
                    onChange={(e) => updateForm('percentComplete', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section D: Verification */}
            {activeSection === 'D' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  D -- Verification
                </div>
                <div>
                  <Label htmlFor="act-verificationMethod">Verification Method</Label>
                  <Select
                    id="act-verificationMethod"
                    value={form.verificationMethod}
                    onChange={(e) => updateForm('verificationMethod', e.target.value)}
                  >
                    {VERIFICATION_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="act-verifiedBy">Verified By</Label>
                    <Input
                      id="act-verifiedBy"
                      value={form.verifiedBy}
                      onChange={(e) => updateForm('verifiedBy', e.target.value)}
                      placeholder="Name of person who verified effectiveness"
                    />
                  </div>
                  <div>
                    <Label htmlFor="act-verificationDate">Verification Date</Label>
                    <Input
                      id="act-verificationDate"
                      type="date"
                      value={form.verificationDate}
                      onChange={(e) => updateForm('verificationDate', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.effective}
                      onChange={(e) => updateForm('effective', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Action verified as effective
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Check this box once the action has been verified to have resolved the issue
                    effectively.
                  </p>
                </div>
              </div>
            )}

            {/* Section E: Cross-Links */}
            {activeSection === 'E' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  E -- Cross-Links
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Link this action to related quality records for traceability.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="act-linkedNc">Linked Nonconformance</Label>
                    <Input
                      id="act-linkedNc"
                      value={form.linkedNc}
                      onChange={(e) => updateForm('linkedNc', e.target.value)}
                      placeholder="NC reference, e.g., NC-2024-0012"
                    />
                  </div>
                  <div>
                    <Label htmlFor="act-linkedCapa">Linked CAPA</Label>
                    <Input
                      id="act-linkedCapa"
                      value={form.linkedCapa}
                      onChange={(e) => updateForm('linkedCapa', e.target.value)}
                      placeholder="CAPA reference, e.g., CAPA-2024-0003"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="act-linkedProcess">Linked Process</Label>
                    <Input
                      id="act-linkedProcess"
                      value={form.linkedProcess}
                      onChange={(e) => updateForm('linkedProcess', e.target.value)}
                      placeholder="Process name or reference"
                    />
                  </div>
                  <div>
                    <Label htmlFor="act-linkedFmea">Linked FMEA</Label>
                    <Input
                      id="act-linkedFmea"
                      value={form.linkedFmea}
                      onChange={(e) => updateForm('linkedFmea', e.target.value)}
                      placeholder="FMEA reference"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section F: AI Analysis */}
            {activeSection === 'F' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  F -- AI Action Analysis
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Action Analysis
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={generateAiAnalysis}
                      disabled={aiLoading || !form.title || form.title.length < 10}
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analysing...
                        </>
                      ) : (
                        'Analyse with AI'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600 mb-3">
                    Enter a title and description (title 10+ chars), then click to generate
                    AI-powered risk assessment, priority recommendations, and compliance notes.
                  </p>

                  {aiAnalysis && (
                    <div className="space-y-3 mt-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Risk Level
                        </p>
                        <p className="text-sm text-gray-800">{aiAnalysis.riskLevel}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Suggested Priority
                        </p>
                        <p className="text-sm text-gray-800">{aiAnalysis.suggestedPriority}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Potential Impact
                        </p>
                        <p className="text-sm text-gray-800">{aiAnalysis.potentialImpact}</p>
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Suggested Timeline
                        </p>
                        <p className="text-sm text-gray-800">{aiAnalysis.suggestedTimeline}</p>
                      </div>
                      {aiAnalysis.recommendedActions &&
                        aiAnalysis.recommendedActions.length > 0 && (
                          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Recommended Steps
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                              {aiAnalysis.recommendedActions.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Compliance Notes
                        </p>
                        <p className="text-sm text-gray-800">{aiAnalysis.complianceNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <div className="flex justify-between w-full">
              <div>
                {activeSection !== 'A' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const idx = sections.findIndex((s) => s.key === activeSection);
                      if (idx > 0) setActiveSection(sections[idx - 1].key);
                    }}
                  >
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                {activeSection !== 'F' ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const idx = sections.findIndex((s) => s.key === activeSection);
                      if (idx < sections.length - 1) setActiveSection(sections[idx + 1].key);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting || !form.title}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Action'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
