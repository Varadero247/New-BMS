'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
import {
  Plus,
  Lightbulb,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Brain,
  Loader2,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Target,
  DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Improvement {
  id: string;
  referenceNumber?: string;
  title: string;
  description: string;
  currentState: string;
  proposedSolution: string;
  expectedBenefits: string;
  category: string;
  source: string;
  submittedBy: string;
  department: string;
  dateSubmitted: string;
  status: string;
  pdcaStage: string;
  estimatedCost: number | null;
  estimatedTime: string;
  estimatedSaving: number | null;
  qualityImpact: string;
  customerImpact: string;
  processImpact: string;
  environmentalImpact: string;
  priorityScore: number | null;
  evaluationNotes: string;
  approvedBy: string;
  approvalDate: string;
  linkedActions: string;
  pilotRequired: boolean;
  pilotResults: string;
  implementationDate: string;
  implementedBy: string;
  kpiToMeasure: string;
  baselineMetric: string;
  targetMetric: string;
  actualCost: number | null;
  actualSaving: number | null;
  qualityImprovement: string;
  lessonsLearned: string;
  shareAcrossIms: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AiAnalysis {
  loading: boolean;
  result: string | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  'PROCESS_IMPROVEMENT',
  'PRODUCT_QUALITY',
  'COST_REDUCTION',
  'EFFICIENCY',
  'CUSTOMER_SATISFACTION',
  'SAFETY',
  'ENVIRONMENTAL',
  'INNOVATION',
  'WASTE_REDUCTION',
  'TRAINING',
] as const;

const SOURCES = [
  'EMPLOYEE_SUGGESTION',
  'AUDIT_FINDING',
  'CUSTOMER_FEEDBACK',
  'MANAGEMENT_REVIEW',
  'NC_ANALYSIS',
  'BENCHMARKING',
  'KAIZEN_EVENT',
  'DATA_ANALYSIS',
] as const;

const STATUSES = [
  'IDEA_SUBMITTED',
  'UNDER_EVALUATION',
  'APPROVED',
  'IN_PROGRESS',
  'IMPLEMENTED',
  'BENEFITS_REALISED',
] as const;

const STATUS_ORDER: Record<string, number> = {
  IDEA_SUBMITTED: 0,
  UNDER_EVALUATION: 1,
  APPROVED: 2,
  IN_PROGRESS: 3,
  IMPLEMENTED: 4,
  BENEFITS_REALISED: 5,
};

const PDCA_STAGES = ['PLAN', 'DO', 'CHECK', 'ACT'] as const;

const IMPACT_LEVELS = ['NONE', 'LOW', 'MEDIUM', 'HIGH'] as const;

const statusColors: Record<string, string> = {
  IDEA_SUBMITTED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  UNDER_EVALUATION: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  IMPLEMENTED: 'bg-green-100 text-green-700',
  BENEFITS_REALISED: 'bg-emerald-100 text-emerald-800',
};

const statusBadgeVariant = (
  status: string
): 'secondary' | 'info' | 'default' | 'warning' | 'success' => {
  switch (status) {
    case 'IDEA_SUBMITTED':
      return 'secondary';
    case 'UNDER_EVALUATION':
      return 'info';
    case 'APPROVED':
      return 'default';
    case 'IN_PROGRESS':
      return 'warning';
    case 'IMPLEMENTED':
      return 'success';
    case 'BENEFITS_REALISED':
      return 'success';
    default:
      return 'secondary';
  }
};

const categoryColors: Record<string, string> = {
  PROCESS_IMPROVEMENT: 'bg-blue-100 text-blue-700',
  PRODUCT_QUALITY: 'bg-purple-100 text-purple-700',
  COST_REDUCTION: 'bg-green-100 text-green-700',
  EFFICIENCY: 'bg-amber-100 text-amber-700',
  CUSTOMER_SATISFACTION: 'bg-pink-100 text-pink-700',
  SAFETY: 'bg-red-100 text-red-700',
  ENVIRONMENTAL: 'bg-teal-100 text-teal-700',
  INNOVATION: 'bg-indigo-100 text-indigo-700',
  WASTE_REDUCTION: 'bg-orange-100 text-orange-700',
  TRAINING: 'bg-cyan-100 text-cyan-700',
};

const pdcaColors: Record<string, string> = {
  PLAN: 'bg-blue-600 text-white',
  DO: 'bg-green-600 text-white',
  CHECK: 'bg-amber-500 text-white',
  ACT: 'bg-red-600 text-white',
};

function impactColor(level: string): string {
  switch (level) {
    case 'HIGH':
      return 'text-red-600';
    case 'MEDIUM':
      return 'text-amber-600';
    case 'LOW':
      return 'text-green-600';
    default:
      return 'text-gray-400';
  }
}

function priorityColor(score: number | null): string {
  if (!score) return 'bg-gray-100 dark:bg-gray-800 text-gray-600';
  if (score >= 80) return 'bg-red-100 text-red-800';
  if (score >= 50) return 'bg-amber-100 text-amber-800';
  return 'bg-green-100 text-green-800';
}

const emptyForm = {
  title: '',
  description: '',
  currentState: '',
  proposedSolution: '',
  expectedBenefits: '',
  category: 'PROCESS_IMPROVEMENT' as string,
  source: 'EMPLOYEE_SUGGESTION' as string,
  submittedBy: '',
  department: '',
  dateSubmitted: new Date().toISOString().split('T')[0],
  status: 'IDEA_SUBMITTED' as string,
  pdcaStage: 'PLAN' as string,
  estimatedCost: '' as string,
  estimatedTime: '',
  estimatedSaving: '' as string,
  qualityImpact: 'NONE' as string,
  customerImpact: 'NONE' as string,
  processImpact: 'NONE' as string,
  environmentalImpact: 'NONE' as string,
  evaluationNotes: '',
  approvedBy: '',
  approvalDate: '',
  linkedActions: '',
  pilotRequired: false,
  pilotResults: '',
  implementationDate: '',
  implementedBy: '',
  kpiToMeasure: '',
  baselineMetric: '',
  targetMetric: '',
  actualCost: '' as string,
  actualSaving: '' as string,
  qualityImprovement: '',
  lessonsLearned: '',
  shareAcrossIms: false,
};

// ---------------------------------------------------------------------------
// Priority Score Calculator
// ---------------------------------------------------------------------------

function calculatePriorityScore(form: typeof emptyForm): number {
  const impactValues: Record<string, number> = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
  const qImpact = impactValues[form.qualityImpact] || 0;
  const cImpact = impactValues[form.customerImpact] || 0;
  const pImpact = impactValues[form.processImpact] || 0;
  const eImpact = impactValues[form.environmentalImpact] || 0;

  const savingBonus = form.estimatedSaving ? Math.min(Number(form.estimatedSaving) / 1000, 10) : 0;
  const costPenalty = form.estimatedCost ? Math.min(Number(form.estimatedCost) / 2000, 5) : 0;

  const rawScore =
    qImpact * 10 + cImpact * 8 + pImpact * 6 + eImpact * 4 + savingBonus - costPenalty;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ImprovementsClient() {
  // Data state
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pdcaFilter, setPdcaFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeSection, setActiveSection] = useState<string>('idea');

  // Detail modal
  const [selectedImprovement, setSelectedImprovement] = useState<Improvement | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis>({
    loading: false,
    result: null,
    error: null,
  });

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadImprovements = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/improvements');
      setImprovements(response.data.data || []);
    } catch (err) {
      console.error('Failed to load improvements:', err);
      setError('Failed to load improvements. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImprovements();
  }, [loadImprovements]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const priorityScore = calculatePriorityScore(form);
      await api.post('/improvements', {
        ...form,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : null,
        estimatedSaving: form.estimatedSaving ? Number(form.estimatedSaving) : null,
        actualCost: form.actualCost ? Number(form.actualCost) : null,
        actualSaving: form.actualSaving ? Number(form.actualSaving) : null,
        priorityScore,
        dateSubmitted: form.dateSubmitted || undefined,
        approvalDate: form.approvalDate || undefined,
        implementationDate: form.implementationDate || undefined,
      });
      setShowModal(false);
      setForm(emptyForm);
      setActiveSection('idea');
      loadImprovements();
    } catch (err) {
      console.error('Failed to create improvement:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateModal() {
    setForm(emptyForm);
    setActiveSection('idea');
    setShowModal(true);
  }

  function openDetail(improvement: Improvement) {
    setSelectedImprovement(improvement);
    setAiAnalysis({ loading: false, result: null, error: null });
    setShowDetail(true);
  }

  async function runAiAnalysis(improvement: Improvement) {
    setAiAnalysis({ loading: true, result: null, error: null });
    try {
      const response = await api.post('/improvements/ai-analysis', {
        improvementId: improvement.id,
        title: improvement.title,
        category: improvement.category,
        description: improvement.description,
        currentState: improvement.currentState,
        proposedSolution: improvement.proposedSolution,
        expectedBenefits: improvement.expectedBenefits,
        estimatedCost: improvement.estimatedCost,
        estimatedSaving: improvement.estimatedSaving,
        qualityImpact: improvement.qualityImpact,
        customerImpact: improvement.customerImpact,
        status: improvement.status,
      });
      setAiAnalysis({
        loading: false,
        result: response.data.data?.analysis || 'No analysis available.',
        error: null,
      });
    } catch (err) {
      console.error('AI analysis failed:', err);
      setAiAnalysis({
        loading: false,
        result: null,
        error: 'AI analysis failed. Please try again.',
      });
    }
  }

  // -------------------------------------------------------------------------
  // Filtering & Summary
  // -------------------------------------------------------------------------

  const filtered = improvements
    .filter((i) => categoryFilter === 'all' || i.category === categoryFilter)
    .filter((i) => statusFilter === 'all' || i.status === statusFilter)
    .filter((i) => pdcaFilter === 'all' || i.pdcaStage === pdcaFilter)
    .filter((i) => sourceFilter === 'all' || i.source === sourceFilter)
    .filter(
      (i) =>
        !searchQuery ||
        i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.submittedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const counts = useMemo(
    () => ({
      total: improvements.length,
      underEvaluation: improvements.filter((i) => i.status === 'UNDER_EVALUATION').length,
      inProgress: improvements.filter((i) => i.status === 'IN_PROGRESS').length,
      benefitsRealised: improvements.filter((i) => i.status === 'BENEFITS_REALISED').length,
    }),
    [improvements]
  );

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  }

  function formatCurrency(val: number | null | undefined): string {
    if (val === null) return '-';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(val);
  }

  // Priority score computed live
  const liveScore = calculatePriorityScore(form);

  // -------------------------------------------------------------------------
  // Section navigation for create modal
  // -------------------------------------------------------------------------

  const sections = [
    { id: 'idea', label: 'Improvement Idea', icon: Lightbulb },
    { id: 'impact', label: 'Impact Assessment', icon: BarChart3 },
    { id: 'evaluation', label: 'Evaluation', icon: Target },
    { id: 'implementation', label: 'Implementation', icon: ArrowRight },
    { id: 'benefits', label: 'Benefits Realisation', icon: DollarSign },
  ];

  // -------------------------------------------------------------------------
  // Status Pipeline
  // -------------------------------------------------------------------------

  function StatusPipeline({ currentStatus }: { currentStatus: string }) {
    const currentIdx = STATUS_ORDER[currentStatus] ?? -1;
    return (
      <div className="flex items-center gap-1 overflow-x-auto py-1">
        {STATUSES.map((status, idx) => {
          const isComplete = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={status} className="flex items-center">
              {idx > 0 && (
                <div className={`w-4 h-0.5 ${idx <= currentIdx ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
              <div
                className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-medium'
                    : isComplete
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Continual Improvement
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track improvement ideas from submission to benefits realisation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadImprovements}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit Idea
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Ideas</p>
                  <p className="text-3xl font-bold">{counts.total}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Under Evaluation</p>
                  <p className="text-3xl font-bold text-blue-600">{counts.underEvaluation}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-3xl font-bold text-amber-600">{counts.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Benefits Realised</p>
                  <p className="text-3xl font-bold text-green-600">{counts.benefitsRealised}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadImprovements}>
              Retry
            </Button>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search by title, reference, submitter..."
                    placeholder="Search by title, reference, submitter..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Category
                </Label>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Status
                </Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[120px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  PDCA Stage
                </Label>
                <Select value={pdcaFilter} onChange={(e) => setPdcaFilter(e.target.value)}>
                  <option value="all">All</option>
                  {PDCA_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Source
                </Label>
                <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                  <option value="all">All Sources</option>
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Improvements List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Improvement Ideas ({filtered.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-28 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((imp) => (
                  <div
                    key={imp.id}
                    onClick={() => openDetail(imp)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {imp.referenceNumber && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {imp.referenceNumber}
                            </span>
                          )}
                          <Badge
                            className={
                              categoryColors[imp.category] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {imp.category?.replace(/_/g, ' ')}
                          </Badge>
                          <Badge
                            className={statusColors[imp.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {imp.status?.replace(/_/g, ' ')}
                          </Badge>
                          <Badge
                            className={
                              pdcaColors[imp.pdcaStage] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {imp.pdcaStage}
                          </Badge>
                          {imp.priorityScore !== null && (
                            <Badge className={priorityColor(imp.priorityScore)}>
                              Score: {imp.priorityScore}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {imp.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {imp.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                          {imp.submittedBy && <span>By: {imp.submittedBy}</span>}
                          {imp.department && <span>Dept: {imp.department}</span>}
                          {imp.source && <span>Source: {imp.source.replace(/_/g, ' ')}</span>}
                          <span>Submitted: {formatDate(imp.dateSubmitted)}</span>
                        </div>
                        {/* Mini status pipeline */}
                        <div className="mt-2">
                          <StatusPipeline currentStatus={imp.status} />
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 dark:text-gray-500 text-right ml-4 shrink-0">
                        {imp.estimatedSaving !== null && imp.estimatedSaving > 0 && (
                          <div className="text-green-600 font-medium">
                            {formatCurrency(imp.estimatedSaving)}
                          </div>
                        )}
                        {imp.estimatedCost !== null && imp.estimatedCost > 0 && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Cost: {formatCurrency(imp.estimatedCost)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Lightbulb className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  No improvement ideas found
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery ||
                  categoryFilter !== 'all' ||
                  statusFilter !== 'all' ||
                  pdcaFilter !== 'all' ||
                  sourceFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by submitting your first improvement idea.'}
                </p>
                {!searchQuery &&
                  categoryFilter === 'all' &&
                  statusFilter === 'all' &&
                  pdcaFilter === 'all' &&
                  sourceFilter === 'all' && (
                    <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                      <Plus className="h-4 w-4" />
                      Submit First Idea
                    </Button>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* CREATE MODAL                                                      */}
      {/* ================================================================= */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Submit Improvement Idea"
        size="full"
      >
        <form onSubmit={handleSubmit}>
          {/* Section Navigation */}
          <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {/* Section A: Improvement Idea */}
            {activeSection === 'idea' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Improvement Idea
                </h3>

                <div>
                  <Label htmlFor="imp-title">Title *</Label>
                  <Input
                    id="imp-title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="Brief title for the improvement idea"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imp-category">Category *</Label>
                    <Select
                      id="imp-category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imp-source">Source</Label>
                    <Select
                      id="imp-source"
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                    >
                      {SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imp-submittedBy">Submitted By</Label>
                    <Input
                      id="imp-submittedBy"
                      value={form.submittedBy}
                      onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imp-department">Department</Label>
                    <Input
                      id="imp-department"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="e.g. Production, Quality"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imp-dateSubmitted">Date Submitted</Label>
                  <Input
                    id="imp-dateSubmitted"
                    type="date"
                    value={form.dateSubmitted}
                    onChange={(e) => setForm({ ...form, dateSubmitted: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="imp-description">Description *</Label>
                  <Textarea
                    id="imp-description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    required
                    placeholder="Describe the improvement opportunity"
                  />
                </div>

                <div>
                  <Label htmlFor="imp-currentState">Current State</Label>
                  <Textarea
                    id="imp-currentState"
                    value={form.currentState}
                    onChange={(e) => setForm({ ...form, currentState: e.target.value })}
                    rows={3}
                    placeholder="Describe the current situation or problem"
                  />
                </div>

                <div>
                  <Label htmlFor="imp-proposedSolution">Proposed Solution</Label>
                  <Textarea
                    id="imp-proposedSolution"
                    value={form.proposedSolution}
                    onChange={(e) => setForm({ ...form, proposedSolution: e.target.value })}
                    rows={3}
                    placeholder="What improvement do you propose?"
                  />
                </div>

                <div>
                  <Label htmlFor="imp-expectedBenefits">Expected Benefits</Label>
                  <Textarea
                    id="imp-expectedBenefits"
                    value={form.expectedBenefits}
                    onChange={(e) => setForm({ ...form, expectedBenefits: e.target.value })}
                    rows={2}
                    placeholder="What benefits are expected from this improvement?"
                  />
                </div>
              </div>
            )}

            {/* Section B: Impact Assessment */}
            {activeSection === 'impact' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Impact Assessment
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imp-estimatedCost">Estimated Cost</Label>
                    <Input
                      id="imp-estimatedCost"
                      type="number"
                      min="0"
                      step="100"
                      value={form.estimatedCost}
                      onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imp-estimatedSaving">Estimated Saving</Label>
                    <Input
                      id="imp-estimatedSaving"
                      type="number"
                      min="0"
                      step="100"
                      value={form.estimatedSaving}
                      onChange={(e) => setForm({ ...form, estimatedSaving: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imp-estimatedTime">Estimated Time to Implement</Label>
                  <Input
                    id="imp-estimatedTime"
                    value={form.estimatedTime}
                    onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })}
                    placeholder="e.g. 2 weeks, 3 months"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imp-qualityImpact">Quality Impact</Label>
                    <Select
                      id="imp-qualityImpact"
                      value={form.qualityImpact}
                      onChange={(e) => setForm({ ...form, qualityImpact: e.target.value })}
                    >
                      {IMPACT_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imp-customerImpact">Customer Impact</Label>
                    <Select
                      id="imp-customerImpact"
                      value={form.customerImpact}
                      onChange={(e) => setForm({ ...form, customerImpact: e.target.value })}
                    >
                      {IMPACT_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imp-processImpact">Process Impact</Label>
                    <Select
                      id="imp-processImpact"
                      value={form.processImpact}
                      onChange={(e) => setForm({ ...form, processImpact: e.target.value })}
                    >
                      {IMPACT_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imp-environmentalImpact">Environmental Impact</Label>
                    <Select
                      id="imp-environmentalImpact"
                      value={form.environmentalImpact}
                      onChange={(e) => setForm({ ...form, environmentalImpact: e.target.value })}
                    >
                      {IMPACT_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Live Priority Score */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority Score (auto-calculated)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Based on impact assessments, cost, and savings
                      </p>
                    </div>
                    <Badge className={`text-lg px-4 py-1 ${priorityColor(liveScore)}`}>
                      {liveScore}
                    </Badge>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        liveScore >= 80
                          ? 'bg-red-500'
                          : liveScore >= 50
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${liveScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section C: Evaluation */}
            {activeSection === 'evaluation' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Evaluation & Approval
                </h3>

                <div>
                  <Label htmlFor="imp-status">Status</Label>
                  <Select
                    id="imp-status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="imp-evaluationNotes">Evaluation Notes</Label>
                  <Textarea
                    id="imp-evaluationNotes"
                    value={form.evaluationNotes}
                    onChange={(e) => setForm({ ...form, evaluationNotes: e.target.value })}
                    rows={4}
                    placeholder="Notes from evaluation review"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imp-approvedBy">Approved By</Label>
                    <Input
                      id="imp-approvedBy"
                      value={form.approvedBy}
                      onChange={(e) => setForm({ ...form, approvedBy: e.target.value })}
                      placeholder="Approver name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imp-approvalDate">Approval Date</Label>
                    <Input
                      id="imp-approvalDate"
                      type="date"
                      value={form.approvalDate}
                      onChange={(e) => setForm({ ...form, approvalDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imp-pdcaStage">PDCA Stage</Label>
                  <Select
                    id="imp-pdcaStage"
                    value={form.pdcaStage}
                    onChange={(e) => setForm({ ...form, pdcaStage: e.target.value })}
                  >
                    {PDCA_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                  <div className="flex gap-2 mt-2">
                    {PDCA_STAGES.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setForm({ ...form, pdcaStage: stage })}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          form.pdcaStage === stage
                            ? pdcaColors[stage]
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Section D: Implementation */}
            {activeSection === 'implementation' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Implementation
                </h3>

                <div>
                  <Label htmlFor="imp-linkedActions">Linked Actions</Label>
                  <Textarea
                    id="imp-linkedActions"
                    value={form.linkedActions}
                    onChange={(e) => setForm({ ...form, linkedActions: e.target.value })}
                    rows={2}
                    placeholder="Reference numbers of linked actions or CAPAs"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Pilot Required</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Does this improvement require a pilot before full implementation?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, pilotRequired: !form.pilotRequired })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.pilotRequired ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                        form.pilotRequired ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {form.pilotRequired && (
                  <div>
                    <Label htmlFor="imp-pilotResults">Pilot Results</Label>
                    <Textarea
                      id="imp-pilotResults"
                      value={form.pilotResults}
                      onChange={(e) => setForm({ ...form, pilotResults: e.target.value })}
                      rows={3}
                      placeholder="Results and findings from the pilot"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imp-implementationDate">Implementation Date</Label>
                    <Input
                      id="imp-implementationDate"
                      type="date"
                      value={form.implementationDate}
                      onChange={(e) => setForm({ ...form, implementationDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imp-implementedBy">Implemented By</Label>
                    <Input
                      id="imp-implementedBy"
                      value={form.implementedBy}
                      onChange={(e) => setForm({ ...form, implementedBy: e.target.value })}
                      placeholder="Who implemented this?"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imp-kpiToMeasure">KPI to Measure</Label>
                  <Input
                    id="imp-kpiToMeasure"
                    value={form.kpiToMeasure}
                    onChange={(e) => setForm({ ...form, kpiToMeasure: e.target.value })}
                    placeholder="Key metric to track effectiveness"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imp-baselineMetric">Baseline Metric</Label>
                    <Input
                      id="imp-baselineMetric"
                      value={form.baselineMetric}
                      onChange={(e) => setForm({ ...form, baselineMetric: e.target.value })}
                      placeholder="Current baseline value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imp-targetMetric">Target Metric</Label>
                    <Input
                      id="imp-targetMetric"
                      value={form.targetMetric}
                      onChange={(e) => setForm({ ...form, targetMetric: e.target.value })}
                      placeholder="Target value to achieve"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section E: Benefits Realisation */}
            {activeSection === 'benefits' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Benefits Realisation
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imp-actualCost">Actual Cost</Label>
                    <Input
                      id="imp-actualCost"
                      type="number"
                      min="0"
                      step="100"
                      value={form.actualCost}
                      onChange={(e) => setForm({ ...form, actualCost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imp-actualSaving">Actual Saving</Label>
                    <Input
                      id="imp-actualSaving"
                      type="number"
                      min="0"
                      step="100"
                      value={form.actualSaving}
                      onChange={(e) => setForm({ ...form, actualSaving: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="imp-qualityImprovement">Quality Improvement Achieved</Label>
                  <Textarea
                    id="imp-qualityImprovement"
                    value={form.qualityImprovement}
                    onChange={(e) => setForm({ ...form, qualityImprovement: e.target.value })}
                    rows={3}
                    placeholder="Describe measurable quality improvements"
                  />
                </div>

                <div>
                  <Label htmlFor="imp-lessonsLearned">Lessons Learned</Label>
                  <Textarea
                    id="imp-lessonsLearned"
                    value={form.lessonsLearned}
                    onChange={(e) => setForm({ ...form, lessonsLearned: e.target.value })}
                    rows={3}
                    placeholder="Key takeaways and lessons from this improvement"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Share Across IMS</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Share this improvement and lessons learned with other IMS modules
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, shareAcrossIms: !form.shareAcrossIms })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form.shareAcrossIms ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                        form.shareAcrossIms ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                {sections.findIndex((s) => s.id === activeSection) + 1} / {sections.length}
              </div>
              <div className="flex items-center gap-2">
                {activeSection !== 'idea' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const idx = sections.findIndex((s) => s.id === activeSection);
                      if (idx > 0) setActiveSection(sections[idx - 1].id);
                    }}
                  >
                    Previous
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                {activeSection !== 'benefits' ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const idx = sections.findIndex((s) => s.id === activeSection);
                      if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Improvement'}
                  </Button>
                )}
              </div>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* DETAIL MODAL                                                      */}
      {/* ================================================================= */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedImprovement?.title || 'Improvement Detail'}
        size="full"
      >
        {selectedImprovement && (
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            {/* Status Pipeline */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Progress
              </h3>
              <StatusPipeline currentStatus={selectedImprovement.status} />
            </div>

            {/* Section A: Improvement Idea */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Improvement Idea
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Title</p>
                  <p className="text-sm font-medium">{selectedImprovement.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                  <Badge
                    className={
                      categoryColors[selectedImprovement.category] || 'bg-gray-100 dark:bg-gray-800'
                    }
                  >
                    {selectedImprovement.category?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
                  <p className="text-sm">{selectedImprovement.source?.replace(/_/g, ' ') || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Submitted By</p>
                  <p className="text-sm">{selectedImprovement.submittedBy || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                  <p className="text-sm">{selectedImprovement.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date Submitted</p>
                  <p className="text-sm">{formatDate(selectedImprovement.dateSubmitted)}</p>
                </div>
              </div>
              {selectedImprovement.description && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedImprovement.description}
                  </p>
                </div>
              )}
              {selectedImprovement.currentState && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current State</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedImprovement.currentState}
                  </p>
                </div>
              )}
              {selectedImprovement.proposedSolution && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Proposed Solution</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedImprovement.proposedSolution}
                  </p>
                </div>
              )}
              {selectedImprovement.expectedBenefits && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Expected Benefits</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedImprovement.expectedBenefits}
                  </p>
                </div>
              )}
            </div>

            {/* Section B: Impact Assessment */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Impact Assessment
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Cost</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(selectedImprovement.estimatedCost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Saving</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatCurrency(selectedImprovement.estimatedSaving)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Time</p>
                  <p className="text-sm">{selectedImprovement.estimatedTime || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Priority Score</p>
                  {selectedImprovement.priorityScore !== null ? (
                    <Badge className={priorityColor(selectedImprovement.priorityScore)}>
                      {selectedImprovement.priorityScore}
                    </Badge>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">-</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quality Impact</p>
                  <p
                    className={`text-sm font-medium ${impactColor(selectedImprovement.qualityImpact)}`}
                  >
                    {selectedImprovement.qualityImpact || 'NONE'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customer Impact</p>
                  <p
                    className={`text-sm font-medium ${impactColor(selectedImprovement.customerImpact)}`}
                  >
                    {selectedImprovement.customerImpact || 'NONE'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Process Impact</p>
                  <p
                    className={`text-sm font-medium ${impactColor(selectedImprovement.processImpact)}`}
                  >
                    {selectedImprovement.processImpact || 'NONE'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Environmental Impact</p>
                  <p
                    className={`text-sm font-medium ${impactColor(selectedImprovement.environmentalImpact)}`}
                  >
                    {selectedImprovement.environmentalImpact || 'NONE'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section C: Evaluation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Evaluation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <Badge
                    className={
                      statusColors[selectedImprovement.status] || 'bg-gray-100 dark:bg-gray-800'
                    }
                  >
                    {selectedImprovement.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDCA Stage</p>
                  <Badge
                    className={
                      pdcaColors[selectedImprovement.pdcaStage] ||
                      'bg-gray-100 dark:bg-gray-800 text-gray-700'
                    }
                  >
                    {selectedImprovement.pdcaStage}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approved By</p>
                  <p className="text-sm">{selectedImprovement.approvedBy || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approval Date</p>
                  <p className="text-sm">{formatDate(selectedImprovement.approvalDate)}</p>
                </div>
              </div>
              {selectedImprovement.evaluationNotes && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Evaluation Notes</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedImprovement.evaluationNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Section D: Implementation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Implementation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Implementation Date</p>
                  <p className="text-sm">{formatDate(selectedImprovement.implementationDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Implemented By</p>
                  <p className="text-sm">{selectedImprovement.implementedBy || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pilot Required</p>
                  <p className="text-sm">{selectedImprovement.pilotRequired ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">KPI to Measure</p>
                  <p className="text-sm">{selectedImprovement.kpiToMeasure || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Baseline Metric</p>
                  <p className="text-sm">{selectedImprovement.baselineMetric || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Target Metric</p>
                  <p className="text-sm">{selectedImprovement.targetMetric || '-'}</p>
                </div>
              </div>
              {selectedImprovement.linkedActions && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Linked Actions</p>
                  <p className="text-sm mt-1">{selectedImprovement.linkedActions}</p>
                </div>
              )}
              {selectedImprovement.pilotResults && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pilot Results</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedImprovement.pilotResults}
                  </p>
                </div>
              )}
            </div>

            {/* Section E: Benefits Realisation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Benefits Realisation
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Actual Cost</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(selectedImprovement.actualCost)}
                  </p>
                  {selectedImprovement.actualCost !== null &&
                    selectedImprovement.estimatedCost !== null &&
                    selectedImprovement.estimatedCost > 0 && (
                      <p
                        className={`text-xs mt-1 ${
                          selectedImprovement.actualCost <= selectedImprovement.estimatedCost
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {selectedImprovement.actualCost <= selectedImprovement.estimatedCost
                          ? 'Under budget'
                          : 'Over budget'}{' '}
                        (
                        {Math.round(
                          ((selectedImprovement.actualCost - selectedImprovement.estimatedCost) /
                            selectedImprovement.estimatedCost) *
                            100
                        )}
                        %)
                      </p>
                    )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Actual Saving</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatCurrency(selectedImprovement.actualSaving)}
                  </p>
                  {selectedImprovement.actualSaving !== null &&
                    selectedImprovement.estimatedSaving !== null &&
                    selectedImprovement.estimatedSaving > 0 && (
                      <p
                        className={`text-xs mt-1 ${
                          selectedImprovement.actualSaving >= selectedImprovement.estimatedSaving
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {Math.round(
                          (selectedImprovement.actualSaving / selectedImprovement.estimatedSaving) *
                            100
                        )}
                        % of target
                      </p>
                    )}
                </div>
              </div>
              {selectedImprovement.qualityImprovement && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quality Improvement Achieved
                  </p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedImprovement.qualityImprovement}
                  </p>
                </div>
              )}
              {selectedImprovement.lessonsLearned && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lessons Learned</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {selectedImprovement.lessonsLearned}
                  </p>
                </div>
              )}
              <div className="mt-3">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg inline-flex ${
                    selectedImprovement.shareAcrossIms
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${selectedImprovement.shareAcrossIms ? 'bg-green-500' : 'bg-gray-300'}`}
                  />
                  <span className="text-sm">
                    {selectedImprovement.shareAcrossIms
                      ? 'Shared across IMS'
                      : 'Not shared across IMS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section F: AI Evaluation */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Evaluation
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runAiAnalysis(selectedImprovement)}
                  disabled={aiAnalysis.loading}
                  className="flex items-center gap-2"
                >
                  {aiAnalysis.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Run Evaluation
                    </>
                  )}
                </Button>
              </div>
              {aiAnalysis.loading && (
                <div className="flex items-center gap-3 text-sm text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>
                    AI is evaluating feasibility, ROI, and generating implementation
                    recommendations...
                  </span>
                </div>
              )}
              {aiAnalysis.result && (
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-900 rounded-lg p-4 mt-2">
                  {aiAnalysis.result}
                  <AIDisclosure
                    variant="inline"
                    provider="claude"
                    analysisType="Improvement Analysis"
                    confidence={0.85}
                  />
                </div>
              )}
              {aiAnalysis.error && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mt-2">
                  {aiAnalysis.error}
                </div>
              )}
              {!aiAnalysis.loading && !aiAnalysis.result && !aiAnalysis.error && (
                <p className="text-sm text-blue-600">
                  Click &quot;Run Evaluation&quot; to get AI-powered feasibility analysis, ROI
                  assessment, and implementation recommendations.
                </p>
              )}
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDetail(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
