'use client';

import { useEffect, useState, useMemo } from 'react';
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
  Textarea,
  AIDisclosure,
} from '@ims/ui';
import { Plus, ClipboardList, Loader2, Search, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnvAction {
  id: string;
  referenceNumber: string;
  title: string;
  actionType: string;
  priority: string;
  source: string;
  sourceReference?: string;
  description: string;
  expectedOutcome?: string;
  linkedAspectId?: string;
  linkedEventId?: string;
  linkedLegalId?: string;
  linkedObjectiveId?: string;
  assignedTo: string;
  department?: string;
  dueDate: string;
  estimatedHours?: number;
  estimatedCost?: number;
  resourcesRequired?: string;
  status: string;
  progressNotes?: string;
  completionDate?: string;
  percentComplete: number;
  evidenceRefs?: string;
  verificationMethod?: string;
  verifiedBy?: string;
  verificationDate?: string;
  verificationNotes?: string;
  effective?: string;
  createdAt: string;
}

interface ActionForm {
  title: string;
  actionType: string;
  priority: string;
  source: string;
  sourceReference: string;
  description: string;
  expectedOutcome: string;
  linkedAspectId: string;
  linkedEventId: string;
  linkedLegalId: string;
  linkedObjectiveId: string;
  assignedTo: string;
  department: string;
  dueDate: string;
  estimatedHours: number;
  estimatedCost: number;
  resourcesRequired: string;
  status: string;
  progressNotes: string;
  completionDate: string;
  percentComplete: number;
  evidenceRefs: string;
  verificationMethod: string;
  verifiedBy: string;
  verificationDate: string;
  verificationNotes: string;
  effective: string;
}

interface AiRecommendation {
  actionPlan?: string;
  priorityJustification?: string;
  suggestedTimeline?: string;
  resourceRecommendations?: string;
  riskFactors?: string;
  relatedRegulations?: string;
  [key: string]: string | undefined;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_FORM: ActionForm = {
  title: '',
  actionType: 'CORRECTIVE',
  priority: 'MEDIUM',
  source: 'ASPECT_REGISTER',
  sourceReference: '',
  description: '',
  expectedOutcome: '',
  linkedAspectId: '',
  linkedEventId: '',
  linkedLegalId: '',
  linkedObjectiveId: '',
  assignedTo: '',
  department: '',
  dueDate: '',
  estimatedHours: 0,
  estimatedCost: 0,
  resourcesRequired: '',
  status: 'OPEN',
  progressNotes: '',
  completionDate: '',
  percentComplete: 0,
  evidenceRefs: '',
  verificationMethod: '',
  verifiedBy: '',
  verificationDate: '',
  verificationNotes: '',
  effective: '',
};

const ACTION_TYPES = [
  'CORRECTIVE',
  'PREVENTIVE',
  'IMPROVEMENT',
  'LEGAL_COMPLIANCE',
  'OBJECTIVE_SUPPORT',
  'ASPECT_CONTROL',
  'EMERGENCY_RESPONSE',
  'MONITORING',
] as const;

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

const SOURCES = [
  'ASPECT_REGISTER',
  'EVENT_REPORT',
  'LEGAL_REGISTER',
  'OBJECTIVE',
  'AUDIT_FINDING',
  'MANAGEMENT_REVIEW',
  'STAKEHOLDER',
  'REGULATORY_REQUIREMENT',
  'OTHER',
] as const;

const STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'VERIFIED',
  'OVERDUE',
  'CANCELLED',
  'DEFERRED',
] as const;

const VERIFICATION_METHODS = [
  'DOCUMENT_REVIEW',
  'PHYSICAL_INSPECTION',
  'AUDIT',
  'MONITORING_DATA',
  'MANAGEMENT_SIGN_OFF',
] as const;

const KANBAN_COLUMNS = ['OPEN', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED', 'VERIFIED'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function priorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 border-gray-200';
  }
}

function priorityBadgeVariant(priority: string) {
  switch (priority) {
    case 'CRITICAL':
      return 'danger' as const;
    case 'HIGH':
      return 'warning' as const;
    case 'MEDIUM':
      return 'warning' as const;
    case 'LOW':
      return 'success' as const;
    default:
      return 'outline' as const;
  }
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'success' as const;
    case 'VERIFIED':
      return 'info' as const;
    case 'IN_PROGRESS':
      return 'warning' as const;
    case 'OVERDUE':
      return 'danger' as const;
    case 'CANCELLED':
      return 'secondary' as const;
    case 'DEFERRED':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

function actionTypeBadgeVariant(actionType: string) {
  switch (actionType) {
    case 'CORRECTIVE':
      return 'danger' as const;
    case 'PREVENTIVE':
      return 'info' as const;
    case 'IMPROVEMENT':
      return 'success' as const;
    case 'LEGAL_COMPLIANCE':
      return 'warning' as const;
    default:
      return 'outline' as const;
  }
}

function formatLabel(str: string): string {
  return str.replace(/_/g, ' ');
}

function isOverdue(dueDate: string, status: string): boolean {
  return (status === 'OPEN' || status === 'IN_PROGRESS') && new Date(dueDate) < new Date();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActionsClient() {
  const [actions, setActions] = useState<EnvAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ActionForm>(EMPTY_FORM);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<AiRecommendation | null>(null);
  const [aiExpanded, setAiExpanded] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  useEffect(() => {
    loadActions();
  }, []);

  async function loadActions() {
    try {
      const response = await api.get('/actions').catch(() => ({ data: { data: [] } }));
      setActions(response.data.data || []);
    } catch (error) {
      console.error('Failed to load actions:', error);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------

  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && a.priority !== priorityFilter) return false;
      if (typeFilter !== 'ALL' && a.actionType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.referenceNumber?.toLowerCase().includes(q) ||
          a.assignedTo?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [actions, statusFilter, priorityFilter, typeFilter, searchQuery]);

  const counts = useMemo(() => {
    const total = actions.length;
    const open = actions.filter((a) => a.status === 'OPEN').length;
    const inProgress = actions.filter((a) => a.status === 'IN_PROGRESS').length;
    const overdue = actions.filter((a) => isOverdue(a.dueDate, a.status)).length;
    const completed = actions.filter(
      (a) => a.status === 'COMPLETED' || a.status === 'VERIFIED'
    ).length;
    return { total, open, inProgress, overdue, completed };
  }, [actions]);

  /** Assign each action to its kanban column, treating overdue as a virtual status. */
  const kanbanGroups = useMemo(() => {
    const groups: Record<string, EnvAction[]> = {};
    for (const col of KANBAN_COLUMNS) {
      groups[col] = [];
    }
    for (const action of filteredActions) {
      if (isOverdue(action.dueDate, action.status)) {
        groups['OVERDUE'].push(action);
      } else if (groups[action.status]) {
        groups[action.status].push(action);
      }
    }
    return groups;
  }, [filteredActions]);

  // -------------------------------------------------------------------------
  // Form helpers
  // -------------------------------------------------------------------------

  function updateForm<K extends keyof ActionForm>(key: K, value: ActionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.title || !form.description || !form.assignedTo || !form.dueDate) return;
    setSubmitting(true);
    try {
      const payload: Record<string, any> = { ...form };
      // Convert numeric strings
      payload.estimatedHours = Number(form.estimatedHours) || 0;
      payload.estimatedCost = Number(form.estimatedCost) || 0;
      payload.percentComplete = Number(form.percentComplete) || 0;
      // Strip empty optional fields
      for (const [k, v] of Object.entries(payload)) {
        if (v === '' || v === null || v === undefined) delete payload[k];
      }
      await api.post('/actions', payload);
      setShowModal(false);
      setForm(EMPTY_FORM);
      setAiGenerated(null);
      setAiExpanded(false);
      setLoading(true);
      await loadActions();
    } catch (error) {
      console.error('Failed to create action:', error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAiAnalyse() {
    setAiLoading(true);
    try {
      const response = await api.post('/actions/ai-analyse', {
        title: form.title,
        description: form.description,
        actionType: form.actionType,
        priority: form.priority,
        source: form.source,
      });
      setAiGenerated(response.data.data || response.data);
      setAiExpanded(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setAiGenerated({
        actionPlan:
          'AI analysis is currently unavailable. Please fill in the action details manually.',
      });
      setAiExpanded(true);
    } finally {
      setAiLoading(false);
    }
  }

  function openCreateModal() {
    setForm(EMPTY_FORM);
    setAiGenerated(null);
    setAiExpanded(false);
    setShowModal(true);
  }

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  function renderColumnHeader(col: string) {
    const colorMap: Record<string, string> = {
      OPEN: 'bg-blue-500',
      IN_PROGRESS: 'bg-yellow-500',
      OVERDUE: 'bg-red-500',
      COMPLETED: 'bg-green-500',
      VERIFIED: 'bg-emerald-600',
    };
    return (
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-3 h-3 rounded-full ${colorMap[col] || 'bg-gray-400'}`} />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {formatLabel(col)}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          ({kanbanGroups[col]?.length || 0})
        </span>
      </div>
    );
  }

  function renderActionCard(action: EnvAction) {
    const overdue = isOverdue(action.dueDate, action.status);
    return (
      <div
        key={action.id}
        className={`p-4 border rounded-lg transition-colors ${
          overdue
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200 dark:border-gray-700 hover:border-green-300 bg-white'
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {action.referenceNumber}
          </span>
          <Badge className={priorityColor(action.priority)}>{action.priority}</Badge>
        </div>

        {/* Title */}
        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-1">
          {action.title}
        </h4>

        {/* Action type badge */}
        <Badge variant={actionTypeBadgeVariant(action.actionType)} className="text-xs mb-2">
          {formatLabel(action.actionType)}
        </Badge>

        {/* Description preview */}
        {action.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {action.description}
          </p>
        )}

        {/* Assigned to & due date */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="truncate max-w-[60%]">{action.assignedTo}</span>
          <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
            <Clock className="h-3 w-3" />
            {new Date(action.dueDate).toLocaleDateString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <div
            className="h-1.5 rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.min(100, action.percentComplete || 0)}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {action.percentComplete || 0}% complete
        </span>

        {/* Overdue warning */}
        {overdue && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-medium">
            <Clock className="h-3 w-3" />
            Overdue
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Environmental Actions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Corrective, preventive and improvement actions for environmental management
            </p>
          </div>
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            onClick={openCreateModal}
          >
            <Plus className="h-4 w-4" />
            Create Action
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {counts.total}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{counts.open}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{counts.inProgress}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{counts.overdue}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{counts.completed}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="search" className="mb-1 block">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="search"
                    aria-label="Search actions..."
                    placeholder="Search actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Status filter */}
              <div className="w-44">
                <Label htmlFor="status-filter" className="mb-1 block">
                  Status
                </Label>
                <Select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {formatLabel(s)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Priority filter */}
              <div className="w-40">
                <Label htmlFor="priority-filter" className="mb-1 block">
                  Priority
                </Label>
                <Select
                  id="priority-filter"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="ALL">All Priorities</option>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {formatLabel(p)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Action type filter */}
              <div className="w-48">
                <Label htmlFor="type-filter" className="mb-1 block">
                  Action Type
                </Label>
                <Select
                  id="type-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  {ACTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {formatLabel(t)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Loading actions...</span>
          </div>
        ) : filteredActions.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">
                  No environmental actions found
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                  Click Create Action to add your first action
                </p>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                  onClick={openCreateModal}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Action
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {KANBAN_COLUMNS.map((col) => (
              <div key={col} className="min-w-0">
                {renderColumnHeader(col)}
                <div className="space-y-3">
                  {(kanbanGroups[col] || []).length === 0 ? (
                    <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center text-xs text-gray-400 dark:text-gray-500">
                      No actions
                    </div>
                  ) : (
                    (kanbanGroups[col] || []).map((action) => renderActionCard(action))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Action Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create Environmental Action"
          size="full"
        >
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-8">
            {/* Section A - Action Identification */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-100 pb-2">
                A. Action Identification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="Enter action title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="actionType">Action Type</Label>
                  <Select
                    id="actionType"
                    value={form.actionType}
                    onChange={(e) => updateForm('actionType', e.target.value)}
                    className="mt-1"
                  >
                    {ACTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {formatLabel(t)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    id="priority"
                    value={form.priority}
                    onChange={(e) => updateForm('priority', e.target.value)}
                    className="mt-1"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {formatLabel(p)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select
                    id="source"
                    value={form.source}
                    onChange={(e) => updateForm('source', e.target.value)}
                    className="mt-1"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {formatLabel(s)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sourceReference">Source Reference</Label>
                  <Input
                    id="sourceReference"
                    value={form.sourceReference}
                    onChange={(e) => updateForm('sourceReference', e.target.value)}
                    placeholder="e.g. Audit #A-2024-003"
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            {/* Section B - Action Description */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-100 pb-2">
                B. Action Description
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Describe the action in detail..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="expectedOutcome">Expected Outcome</Label>
                  <Textarea
                    id="expectedOutcome"
                    value={form.expectedOutcome}
                    onChange={(e) => updateForm('expectedOutcome', e.target.value)}
                    placeholder="What is the expected result of this action?"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            {/* Section C - Assignment & Timeline */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-100 pb-2">
                C. Assignment &amp; Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="assignedTo">
                    Assigned To <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="assignedTo"
                    value={form.assignedTo}
                    onChange={(e) => updateForm('assignedTo', e.target.value)}
                    placeholder="Responsible person"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) => updateForm('department', e.target.value)}
                    placeholder="Department name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">
                    Due Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => updateForm('dueDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min={0}
                    value={form.estimatedHours}
                    onChange={(e) => updateForm('estimatedHours', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.estimatedCost}
                    onChange={(e) => updateForm('estimatedCost', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="resourcesRequired">Resources Required</Label>
                  <Input
                    id="resourcesRequired"
                    value={form.resourcesRequired}
                    onChange={(e) => updateForm('resourcesRequired', e.target.value)}
                    placeholder="Equipment, personnel, etc."
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            {/* Section D - Progress */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-100 pb-2">
                D. Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={form.status}
                    onChange={(e) => updateForm('status', e.target.value)}
                    className="mt-1"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {formatLabel(s)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={form.completionDate}
                    onChange={(e) => updateForm('completionDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="progressNotes">Progress Notes</Label>
                  <Textarea
                    id="progressNotes"
                    value={form.progressNotes}
                    onChange={(e) => updateForm('progressNotes', e.target.value)}
                    placeholder="Log progress updates..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="percentComplete">Percent Complete: {form.percentComplete}%</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      id="percentComplete"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={form.percentComplete}
                      onChange={(e) => updateForm('percentComplete', Number(e.target.value))}
                      className="flex-1 h-2 appearance-none rounded-full bg-gray-200 accent-green-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
                      {form.percentComplete}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{ width: `${form.percentComplete}%` }}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="evidenceRefs">Evidence References</Label>
                  <Input
                    id="evidenceRefs"
                    value={form.evidenceRefs}
                    onChange={(e) => updateForm('evidenceRefs', e.target.value)}
                    placeholder="Document references, file IDs..."
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            {/* Section E - Verification */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-100 pb-2">
                E. Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="verificationMethod">Verification Method</Label>
                  <Select
                    id="verificationMethod"
                    value={form.verificationMethod}
                    onChange={(e) => updateForm('verificationMethod', e.target.value)}
                    className="mt-1"
                  >
                    <option value="">-- Select --</option>
                    {VERIFICATION_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {formatLabel(m)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="verifiedBy">Verified By</Label>
                  <Input
                    id="verifiedBy"
                    value={form.verifiedBy}
                    onChange={(e) => updateForm('verifiedBy', e.target.value)}
                    placeholder="Verifier name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="verificationDate">Verification Date</Label>
                  <Input
                    id="verificationDate"
                    type="date"
                    value={form.verificationDate}
                    onChange={(e) => updateForm('verificationDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="effective">Effective</Label>
                  <Select
                    id="effective"
                    value={form.effective}
                    onChange={(e) => updateForm('effective', e.target.value)}
                    className="mt-1"
                  >
                    <option value="">-- Select --</option>
                    <option value="YES">Yes</option>
                    <option value="PARTIALLY">Partially</option>
                    <option value="NO">No</option>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="verificationNotes">Verification Notes</Label>
                  <Textarea
                    id="verificationNotes"
                    value={form.verificationNotes}
                    onChange={(e) => updateForm('verificationNotes', e.target.value)}
                    placeholder="Notes on the verification outcome..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            {/* Section F - AI Analysis */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-100 pb-2">
                F. AI Analysis
              </h3>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
                disabled={aiLoading || !form.title || !form.description}
                onClick={handleAiAnalyse}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {aiLoading ? 'Analysing...' : 'Generate AI Recommendations'}
              </Button>

              {aiGenerated && (
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-sm text-green-700 underline mb-2"
                    onClick={() => setAiExpanded(!aiExpanded)}
                  >
                    {aiExpanded ? 'Collapse AI Recommendations' : 'Expand AI Recommendations'}
                  </button>
                  {aiExpanded && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                      <AIDisclosure
                        variant="inline"
                        provider="claude"
                        analysisType="Environmental Action Recommendation"
                        confidence={0.85}
                      />
                      {aiGenerated.actionPlan && (
                        <div>
                          <p className="text-xs font-semibold text-green-800 uppercase">
                            Action Plan
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {aiGenerated.actionPlan}
                          </p>
                        </div>
                      )}
                      {aiGenerated.priorityJustification && (
                        <div>
                          <p className="text-xs font-semibold text-green-800 uppercase">
                            Priority Justification
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {aiGenerated.priorityJustification}
                          </p>
                        </div>
                      )}
                      {aiGenerated.suggestedTimeline && (
                        <div>
                          <p className="text-xs font-semibold text-green-800 uppercase">
                            Suggested Timeline
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {aiGenerated.suggestedTimeline}
                          </p>
                        </div>
                      )}
                      {aiGenerated.resourceRecommendations && (
                        <div>
                          <p className="text-xs font-semibold text-green-800 uppercase">
                            Resource Recommendations
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {aiGenerated.resourceRecommendations}
                          </p>
                        </div>
                      )}
                      {aiGenerated.riskFactors && (
                        <div>
                          <p className="text-xs font-semibold text-green-800 uppercase">
                            Risk Factors
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {aiGenerated.riskFactors}
                          </p>
                        </div>
                      )}
                      {aiGenerated.relatedRegulations && (
                        <div>
                          <p className="text-xs font-semibold text-green-800 uppercase">
                            Related Regulations
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {aiGenerated.relatedRegulations}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Modal Footer */}
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={
                submitting || !form.title || !form.description || !form.assignedTo || !form.dueDate
              }
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Action
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
