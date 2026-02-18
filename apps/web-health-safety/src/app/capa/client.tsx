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
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  AIDisclosure,
} from '@ims/ui';
import {
  Plus,
  Loader2,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────

const CAPA_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT'] as const;
const CAPA_SOURCES = [
  'INCIDENT',
  'NEAR_MISS',
  'AUDIT',
  'RISK_ASSESSMENT',
  'LEGAL',
  'MANAGEMENT_REVIEW',
  'WORKER_SUGGESTION',
  'OTHER',
] as const;
const CAPA_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const CAPA_STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'CLOSED', 'OVERDUE'] as const;
const CAPA_ACTION_TYPES = ['IMMEDIATE', 'CORRECTIVE', 'PREVENTIVE'] as const;
const CAPA_ACTION_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'VERIFIED',
  'OVERDUE',
  'CANCELLED',
] as const;

// ─── Types ────────────────────────────────────────────────────────

interface CAPAAction {
  id: string;
  title: string;
  description?: string;
  type: string;
  owner?: string;
  dueDate?: string;
  status: string;
  sortOrder: number;
  completedAt?: string;
}

interface CAPA {
  id: string;
  referenceNumber: string;
  title: string;
  capaType: string;
  source: string;
  sourceReference?: string;
  priority: string;
  status: string;
  department?: string;
  responsiblePerson?: string;
  problemStatement?: string;
  rootCauseAnalysis?: string;
  containmentActions?: string;
  successCriteria?: string;
  verificationMethod?: string;
  aiAnalysis?: string;
  aiAnalysisGenerated: boolean;
  targetCompletionDate?: string;
  closedDate?: string;
  actions: CAPAAction[];
  createdAt: string;
}

interface CAPAForm {
  title: string;
  capaType: string;
  source: string;
  sourceReference: string;
  priority: string;
  department: string;
  responsiblePerson: string;
  problemStatement: string;
  rootCauseAnalysis: string;
  containmentActions: string;
  successCriteria: string;
  verificationMethod: string;
  targetCompletionDate: string;
}

const emptyForm: CAPAForm = {
  title: '',
  capaType: 'CORRECTIVE',
  source: '',
  sourceReference: '',
  priority: 'MEDIUM',
  department: '',
  responsiblePerson: '',
  problemStatement: '',
  rootCauseAnalysis: '',
  containmentActions: '',
  successCriteria: '',
  verificationMethod: '',
  targetCompletionDate: '',
};

// ─── Helpers ──────────────────────────────────────────────────────

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'OPEN':
      return 'info' as const;
    case 'IN_PROGRESS':
      return 'warning' as const;
    case 'PENDING_VERIFICATION':
      return 'default' as const;
    case 'CLOSED':
      return 'success' as const;
    case 'OVERDUE':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

function getPriorityBadgeVariant(priority: string) {
  switch (priority) {
    case 'CRITICAL':
      return 'destructive' as const;
    case 'HIGH':
      return 'warning' as const;
    case 'MEDIUM':
      return 'default' as const;
    case 'LOW':
      return 'success' as const;
    default:
      return 'outline' as const;
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────

export default function CAPAClient() {
  const [capas, setCAPAs] = useState<CAPA[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CAPAForm>(emptyForm);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Expanded rows for actions
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Data loading ──

  useEffect(() => {
    loadCAPAs();
  }, []);

  async function loadCAPAs() {
    try {
      const response = await api.get('/capa');
      setCAPAs(response.data.data || []);
    } catch (error) {
      console.error('Failed to load CAPAs:', error);
    } finally {
      setLoading(false);
    }
  }

  // ── AI Analysis ──

  const handleAnalyse = useCallback(async () => {
    if (form.problemStatement.length < 20 || aiGenerated) return;

    setAiLoading(true);
    try {
      const response = await fetch('/api/capa/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capaType: form.capaType,
          source: form.source,
          priority: form.priority,
          problemStatement: form.problemStatement,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setForm((prev) => ({
          ...prev,
          rootCauseAnalysis: data.rootCauseAnalysis || prev.rootCauseAnalysis,
          containmentActions: data.containmentActions || prev.containmentActions,
          successCriteria: data.successCriteria || prev.successCriteria,
          verificationMethod: data.verificationMethod || prev.verificationMethod,
        }));
        setAiGenerated(true);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  }, [form.problemStatement, form.capaType, form.source, form.priority, aiGenerated]);

  // ── Form helpers ──

  function updateForm(field: keyof CAPAForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openModal() {
    setForm(emptyForm);
    setAiGenerated(false);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/capa', {
        title: form.title,
        capaType: form.capaType,
        source: form.source || undefined,
        sourceReference: form.sourceReference || undefined,
        priority: form.priority,
        department: form.department || undefined,
        responsiblePerson: form.responsiblePerson || undefined,
        problemStatement: form.problemStatement || undefined,
        rootCauseAnalysis: form.rootCauseAnalysis || undefined,
        containmentActions: form.containmentActions || undefined,
        successCriteria: form.successCriteria || undefined,
        verificationMethod: form.verificationMethod || undefined,
        targetCompletionDate: form.targetCompletionDate || undefined,
        aiAnalysisGenerated: aiGenerated,
      });
      setShowModal(false);
      setForm(emptyForm);
      setAiGenerated(false);
      loadCAPAs();
    } catch (error) {
      console.error('Failed to create CAPA:', error);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Row expand toggle ──

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Filtering ──

  const filteredCAPAs = capas.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (typeFilter !== 'all' && c.capaType !== typeFilter) return false;
    if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.problemStatement?.toLowerCase().includes(q) ||
        c.referenceNumber?.toLowerCase().includes(q) ||
        c.responsiblePerson?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Summary counts ──

  const counts = {
    total: capas.length,
    open: capas.filter((c) => c.status === 'OPEN').length,
    inProgress: capas.filter((c) => c.status === 'IN_PROGRESS').length,
    overdue: capas.filter((c) => c.status === 'OVERDUE').length,
    closed: capas.filter((c) => c.status === 'CLOSED').length,
  };

  const isFormValid = form.title.length > 0 && form.capaType && form.source;

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">CAPA Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 45001:2018 — Corrective & Preventive Actions
            </p>
          </div>
          <Button onClick={openModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New CAPA
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total CAPAs</p>
              <p className="text-2xl font-bold">{counts.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
              <p className="text-2xl font-bold text-blue-600">{counts.open}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{counts.inProgress}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{counts.overdue}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
              <p className="text-2xl font-bold text-green-600">{counts.closed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="search" className="text-xs text-gray-500 dark:text-gray-400">
                  Search
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="search"
                    aria-label="Search by reference, title, responsible..."
                    placeholder="Search by reference, title, responsible..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="statusFilter" className="text-xs text-gray-500 dark:text-gray-400">
                  Status
                </Label>
                <Select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1"
                >
                  <option value="all">All Statuses</option>
                  {CAPA_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="typeFilter" className="text-xs text-gray-500 dark:text-gray-400">
                  Type
                </Label>
                <Select
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="mt-1"
                >
                  <option value="all">All Types</option>
                  {CAPA_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="priorityFilter"
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  Priority
                </Label>
                <Select
                  id="priorityFilter"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="mt-1"
                >
                  <option value="all">All Priorities</option>
                  {CAPA_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CAPA Table */}
        <Card>
          <CardHeader>
            <CardTitle>CAPA Register ({filteredCAPAs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filteredCAPAs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]" />
                      <TableHead className="w-[90px]">Ref</TableHead>
                      <TableHead className="min-w-[200px]">Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Responsible</TableHead>
                      <TableHead>Target Date</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCAPAs.map((capa) => {
                      const isExpanded = expandedRows.has(capa.id);
                      const isOverdue =
                        capa.targetCompletionDate &&
                        new Date(capa.targetCompletionDate) < new Date() &&
                        capa.status !== 'CLOSED';

                      return (
                        <>
                          <TableRow
                            key={capa.id}
                            className={`cursor-pointer hover:bg-gray-50 dark:bg-gray-800 ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
                            onClick={() => toggleRow(capa.id)}
                          >
                            <TableCell>
                              {capa.actions?.length > 0 &&
                                (isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                ))}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              {capa.referenceNumber}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-sm truncate max-w-[250px]">
                                {capa.title}
                              </p>
                              {capa.problemStatement && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[250px]">
                                  {capa.problemStatement}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{capa.capaType}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {capa.source?.replace(/_/g, ' ')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityBadgeVariant(capa.priority)}>
                                {capa.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {capa.responsiblePerson || '-'}
                            </TableCell>
                            <TableCell
                              className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                              {formatDate(capa.targetCompletionDate)}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {capa.actions?.length || 0}
                                {capa.actions?.length > 0 && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                                    (
                                    {
                                      capa.actions.filter(
                                        (a) => a.status === 'COMPLETED' || a.status === 'VERIFIED'
                                      ).length
                                    }{' '}
                                    done)
                                  </span>
                                )}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(capa.status)}>
                                {capa.status?.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          {/* Expanded actions */}
                          {isExpanded && capa.actions?.length > 0 && (
                            <TableRow key={`${capa.id}-actions`}>
                              <TableCell colSpan={10} className="bg-gray-50 dark:bg-gray-800 p-4">
                                <div className="ml-8">
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                    CAPA Actions
                                  </p>
                                  <div className="space-y-2">
                                    {capa.actions.map((action) => (
                                      <div
                                        key={action.id}
                                        className="flex items-center gap-4 p-2 bg-white dark:bg-gray-900 rounded border"
                                      >
                                        <Badge
                                          variant={getStatusBadgeVariant(action.status)}
                                          className="text-[10px]"
                                        >
                                          {action.status}
                                        </Badge>
                                        <span className="text-sm font-medium flex-1">
                                          {action.title}
                                        </span>
                                        <Badge variant="outline" className="text-[10px]">
                                          {action.type}
                                        </Badge>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {action.owner || '-'}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                          {formatDate(action.dueDate)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <ShieldCheck className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No CAPAs found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Click &quot;New CAPA&quot; to create your first corrective/preventive action
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Create CAPA Modal ─────────────────────────────────── */}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="New CAPA"
          description="ISO 45001:2018 — AI-Assisted Corrective & Preventive Action"
          size="full"
        >
          <form onSubmit={handleSubmit}>
            <div className="max-h-[70vh] overflow-y-auto px-1 space-y-8">
              {/* ── Section A: CAPA Classification ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">A</span>
                  CAPA Classification
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">CAPA Title *</Label>
                    <Input
                      id="title"
                      placeholder="Short descriptive title for this CAPA"
                      value={form.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="capaType">CAPA Type *</Label>
                      <Select
                        id="capaType"
                        value={form.capaType}
                        onChange={(e) => updateForm('capaType', e.target.value)}
                        className="mt-1"
                      >
                        {CAPA_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="source">Source *</Label>
                      <Select
                        id="source"
                        value={form.source}
                        onChange={(e) => updateForm('source', e.target.value)}
                        className="mt-1"
                      >
                        <option value="">Select source...</option>
                        {CAPA_SOURCES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, ' ')}
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
                        {CAPA_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sourceReference">Source Reference</Label>
                      <Input
                        id="sourceReference"
                        placeholder="e.g. INC-001, AUDIT-2024-03"
                        value={form.sourceReference}
                        onChange={(e) => updateForm('sourceReference', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="e.g. Operations"
                        value={form.department}
                        onChange={(e) => updateForm('department', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="responsiblePerson">Responsible Person</Label>
                      <Input
                        id="responsiblePerson"
                        placeholder="Name or role"
                        value={form.responsiblePerson}
                        onChange={(e) => updateForm('responsiblePerson', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Section B: Problem Statement & AI Analysis ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
                    B
                  </span>
                  Problem Statement & Root Cause
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="problemStatement">Problem Statement</Label>
                    <Textarea
                      id="problemStatement"
                      placeholder="Describe the problem in detail (minimum 20 characters for AI analysis)..."
                      rows={3}
                      value={form.problemStatement}
                      onChange={(e) => updateForm('problemStatement', e.target.value)}
                      onBlur={handleAnalyse}
                      className="mt-1"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {form.problemStatement.length < 20
                          ? `${20 - form.problemStatement.length} more characters for AI analysis`
                          : 'AI analysis will generate on blur'}
                      </p>
                      {aiGenerated && (
                        <span className="text-xs text-purple-600 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> AI analysis applied
                        </span>
                      )}
                    </div>
                  </div>

                  {aiGenerated && (
                    <AIDisclosure
                      variant="inline"
                      provider="claude"
                      analysisType="CAPA Recommendation"
                      confidence={0.85}
                    />
                  )}

                  {aiLoading && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-purple-700">AI is analysing...</p>
                        <p className="text-xs text-purple-500">
                          Performing 5-Why root cause analysis
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="rootCauseAnalysis">Root Cause Analysis</Label>
                      {aiGenerated && form.rootCauseAnalysis && (
                        <Badge variant="info" className="text-[10px]">
                          AI Suggested
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      id="rootCauseAnalysis"
                      placeholder="5-Why or other root cause analysis..."
                      rows={3}
                      value={form.rootCauseAnalysis}
                      onChange={(e) => updateForm('rootCauseAnalysis', e.target.value)}
                      disabled={aiLoading}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="containmentActions">Containment Actions</Label>
                      {aiGenerated && form.containmentActions && (
                        <Badge variant="info" className="text-[10px]">
                          AI Suggested
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      id="containmentActions"
                      placeholder="Immediate containment actions to prevent further harm..."
                      rows={2}
                      value={form.containmentActions}
                      onChange={(e) => updateForm('containmentActions', e.target.value)}
                      disabled={aiLoading}
                      className="mt-1"
                    />
                  </div>
                </div>
              </section>

              {/* ── Section C: Verification ── */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">C</span>
                  Verification & Effectiveness
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="successCriteria">Success Criteria</Label>
                      {aiGenerated && form.successCriteria && (
                        <Badge variant="info" className="text-[10px]">
                          AI Suggested
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      id="successCriteria"
                      placeholder="How will you measure success?"
                      rows={2}
                      value={form.successCriteria}
                      onChange={(e) => updateForm('successCriteria', e.target.value)}
                      disabled={aiLoading}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="verificationMethod">Verification Method</Label>
                      {aiGenerated && form.verificationMethod && (
                        <Badge variant="info" className="text-[10px]">
                          AI Suggested
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      id="verificationMethod"
                      placeholder="How will effectiveness be verified?"
                      rows={2}
                      value={form.verificationMethod}
                      onChange={(e) => updateForm('verificationMethod', e.target.value)}
                      disabled={aiLoading}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="targetCompletionDate">Target Completion Date</Label>
                  <Input
                    id="targetCompletionDate"
                    type="date"
                    value={form.targetCompletionDate}
                    onChange={(e) => updateForm('targetCompletionDate', e.target.value)}
                    className="mt-1 w-auto"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Auto-calculated from priority if left blank
                  </p>
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !isFormValid}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Create CAPA'
                )}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </div>
  );
}
