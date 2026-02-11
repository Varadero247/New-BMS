'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import {
  Plus, Target, Search, Loader2, Sparkles,
  AlertCircle, Clock, CheckCircle, Shield,
  Trash2, Edit3, ChevronDown, ChevronUp,
  BarChart3, AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const CAPA_TYPES = [
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'PREVENTIVE', label: 'Preventive' },
  { value: 'COMBINED', label: 'Combined' },
] as const;

const CAPA_STATUSES = [
  { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTAINMENT', label: 'Containment', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ROOT_CAUSE_ANALYSIS', label: 'Root Cause Analysis', color: 'bg-orange-100 text-orange-800' },
  { value: 'ACTION_PLANNING', label: 'Action Planning', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'IMPLEMENTATION', label: 'Implementation', color: 'bg-purple-100 text-purple-800' },
  { value: 'VERIFICATION', label: 'Verification', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
] as const;

const SEVERITIES = [
  { value: 'MINOR', label: 'Minor', color: 'bg-green-100 text-green-800' },
  { value: 'MODERATE', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MAJOR', label: 'Major', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'CATASTROPHIC', label: 'Catastrophic', color: 'bg-red-200 text-red-900' },
] as const;

const TRIGGER_SOURCES = [
  { value: 'NC', label: 'Nonconformance' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint' },
  { value: 'MANAGEMENT_REVIEW', label: 'Management Review' },
  { value: 'RISK_ASSESSMENT', label: 'Risk Assessment' },
  { value: 'PROCESS_DATA', label: 'Process Data' },
  { value: 'SUPPLIER_ISSUE', label: 'Supplier Issue' },
  { value: 'REGULATORY', label: 'Regulatory' },
  { value: 'OTHER', label: 'Other' },
] as const;

const RCA_METHODS = [
  { value: 'FIVE_WHY', label: '5 Why Analysis' },
  { value: 'FISHBONE', label: 'Fishbone / Ishikawa' },
  { value: 'EIGHT_D', label: '8D Problem Solving' },
  { value: 'IS_IS_NOT', label: 'Is / Is Not Analysis' },
  { value: 'FAULT_TREE', label: 'Fault Tree Analysis' },
  { value: 'OTHER', label: 'Other' },
] as const;

const ROOT_CAUSE_CATEGORIES = [
  { value: 'HUMAN_ERROR', label: 'Human Error' },
  { value: 'EQUIPMENT_FAILURE', label: 'Equipment Failure' },
  { value: 'PROCESS_DEFICIENCY', label: 'Process Deficiency' },
  { value: 'MATERIAL_DEFECT', label: 'Material Defect' },
  { value: 'DESIGN_FLAW', label: 'Design Flaw' },
  { value: 'TRAINING_GAP', label: 'Training Gap' },
  { value: 'SYSTEM_FAILURE', label: 'System Failure' },
  { value: 'ENVIRONMENTAL', label: 'Environmental' },
  { value: 'MANAGEMENT', label: 'Management' },
  { value: 'OTHER', label: 'Other' },
] as const;

const ACTION_PRIORITIES = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
] as const;

const ACTION_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'VERIFIED', label: 'Verified' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CapaAction {
  id?: string;
  action: string;
  assignedTo: string;
  dueDate: string;
  priority: string;
  status: string;
  notes: string;
}

interface CapaRecord {
  id: string;
  referenceNumber: string;
  capaType: string;
  title: string;
  severity: string;
  triggerSource: string;
  sourceReference: string;
  description: string;
  isoClause: string;
  status: string;
  percentComplete: number;
  targetClosureDate: string;
  actualClosureDate: string;
  progressNotes: string;
  createdAt: string;
  updatedAt: string;
  actions?: CapaAction[];
  _count?: { actions: number };
}

interface CapaForm {
  // A: Identification
  capaType: string;
  title: string;
  severity: string;
  triggerSource: string;
  sourceReference: string;
  description: string;
  isoClause: string;
  // B: Containment
  immediateActionRequired: boolean;
  actionsTaken: string;
  containmentVerifiedBy: string;
  containmentDate: string;
  // C: Root Cause Analysis
  rcaMethod: string;
  rootCauseCategory: string;
  // Five Why
  problemStatement: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  rootCauseStatement: string;
  // Fishbone
  fishbonePeople: string;
  fishboneMethod: string;
  fishboneMachine: string;
  fishboneMaterial: string;
  fishboneMeasurement: string;
  fishboneEnvironment: string;
  // 8D
  d0: string;
  d1: string;
  d2: string;
  d3: string;
  d4: string;
  d5: string;
  d6: string;
  d7: string;
  d8: string;
  // E: Effectiveness
  effectivenessCriteria: string;
  effectivenessKpi: string;
  effectivenessTarget: string;
  effectivenessMeasureMethod: string;
  // F: Status
  status: string;
  progressNotes: string;
  percentComplete: number;
  targetClosureDate: string;
  actualClosureDate: string;
  // G: Verification & Closure
  reviewDate: string;
  verifiedBy: string;
  effectivenessAssessment: string;
  recurrenceCheck: string;
  actionsEffective: boolean;
  lessonsLearned: string;
  // H: Cross-Links
  linkedNc: string;
  linkedProcess: string;
  linkedFmea: string;
  linkedDocument: string;
  linkedHsCapa: string;
  linkedEnvCapa: string;
}

interface AiCapaAnalysis {
  suggestedRootCauses: string[];
  suggestedActions: string[];
  riskAssessment: string;
  effectivenessRecommendations: string;
  complianceNotes: string;
  bestPractices: string[];
}

const emptyForm: CapaForm = {
  capaType: 'CORRECTIVE',
  title: '',
  severity: 'MODERATE',
  triggerSource: 'NC',
  sourceReference: '',
  description: '',
  isoClause: '',
  immediateActionRequired: false,
  actionsTaken: '',
  containmentVerifiedBy: '',
  containmentDate: '',
  rcaMethod: 'FIVE_WHY',
  rootCauseCategory: 'PROCESS_DEFICIENCY',
  problemStatement: '',
  why1: '',
  why2: '',
  why3: '',
  why4: '',
  why5: '',
  rootCauseStatement: '',
  fishbonePeople: '',
  fishboneMethod: '',
  fishboneMachine: '',
  fishboneMaterial: '',
  fishboneMeasurement: '',
  fishboneEnvironment: '',
  d0: '',
  d1: '',
  d2: '',
  d3: '',
  d4: '',
  d5: '',
  d6: '',
  d7: '',
  d8: '',
  effectivenessCriteria: '',
  effectivenessKpi: '',
  effectivenessTarget: '',
  effectivenessMeasureMethod: '',
  status: 'OPEN',
  progressNotes: '',
  percentComplete: 0,
  targetClosureDate: '',
  actualClosureDate: '',
  reviewDate: '',
  verifiedBy: '',
  effectivenessAssessment: '',
  recurrenceCheck: '',
  actionsEffective: false,
  lessonsLearned: '',
  linkedNc: '',
  linkedProcess: '',
  linkedFmea: '',
  linkedDocument: '',
  linkedHsCapa: '',
  linkedEnvCapa: '',
};

const emptyAction: CapaAction = {
  action: '',
  assignedTo: '',
  dueDate: '',
  priority: 'MEDIUM',
  status: 'OPEN',
  notes: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CapaClient() {
  // Data state
  const [capas, setCapas] = useState<CapaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [capaTypeFilter, setCapaTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [triggerFilter, setTriggerFilter] = useState('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CapaForm>({ ...emptyForm });
  const [activeSection, setActiveSection] = useState<string>('A');
  const [formError, setFormError] = useState<string | null>(null);

  // CAPA Actions state (for section D)
  const [capaActions, setCapaActions] = useState<CapaAction[]>([]);
  const [editingActionIdx, setEditingActionIdx] = useState<number | null>(null);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiCapaAnalysis | null>(null);

  // ─── Data Loading ─────────────────────────────────────────────────

  const loadCapas = useCallback(async () => {
    try {
      setError(null);
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (capaTypeFilter !== 'all') params.capaType = capaTypeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (triggerFilter !== 'all') params.triggerSource = triggerFilter;
      const response = await api.get('/capa', { params });
      setCapas(response.data.data || []);
    } catch (err) {
      console.error('Failed to load CAPAs:', err);
      setError('Failed to load CAPAs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, capaTypeFilter, statusFilter, severityFilter, triggerFilter]);

  useEffect(() => {
    loadCapas();
  }, [loadCapas]);

  // ─── Helpers ──────────────────────────────────────────────────────

  const getSeverityBadge = (severity: string) => {
    const s = SEVERITIES.find(sv => sv.value === severity);
    return s ? (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
        {s.label}
      </span>
    ) : <Badge variant="outline">{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const s = CAPA_STATUSES.find(cs => cs.value === status);
    return s ? (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
        {s.label}
      </span>
    ) : <Badge variant="outline">{status?.replace(/_/g, ' ')}</Badge>;
  };

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const counts = {
    total: capas.length,
    open: capas.filter(c =>
      !['CLOSED', 'CANCELLED'].includes(c.status)
    ).length,
    inVerification: capas.filter(c => c.status === 'VERIFICATION').length,
    closedThisMonth: capas.filter(c =>
      c.status === 'CLOSED' &&
      c.actualClosureDate &&
      new Date(c.actualClosureDate) >= startOfMonth
    ).length,
  };

  // ─── Filtering ────────────────────────────────────────────────────

  const filteredCapas = capas.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.referenceNumber?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ─── Modal Handlers ───────────────────────────────────────────────

  function openCreateModal() {
    setForm({ ...emptyForm });
    setCapaActions([]);
    setEditingActionIdx(null);
    setActiveSection('A');
    setFormError(null);
    setAiAnalysis(null);
    setModalOpen(true);
  }

  function updateForm(field: keyof CapaForm, value: string | number | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // ─── CAPA Actions CRUD ────────────────────────────────────────────

  function addCapaAction() {
    setCapaActions(prev => [...prev, { ...emptyAction }]);
    setEditingActionIdx(capaActions.length);
  }

  function updateCapaAction(index: number, field: keyof CapaAction, value: string) {
    setCapaActions(prev =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  }

  function removeCapaAction(index: number) {
    setCapaActions(prev => prev.filter((_, i) => i !== index));
    if (editingActionIdx === index) setEditingActionIdx(null);
  }

  // ─── Submit ───────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('CAPA title is required.');
      setActiveSection('A');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        capaType: form.capaType,
        title: form.title,
        severity: form.severity,
        triggerSource: form.triggerSource,
        sourceReference: form.sourceReference || undefined,
        description: form.description || undefined,
        isoClause: form.isoClause || undefined,
        immediateActionRequired: form.immediateActionRequired,
        actionsTaken: form.actionsTaken || undefined,
        containmentVerifiedBy: form.containmentVerifiedBy || undefined,
        containmentDate: form.containmentDate || undefined,
        rcaMethod: form.rcaMethod,
        rootCauseCategory: form.rootCauseCategory,
        problemStatement: form.problemStatement || undefined,
        why1: form.why1 || undefined,
        why2: form.why2 || undefined,
        why3: form.why3 || undefined,
        why4: form.why4 || undefined,
        why5: form.why5 || undefined,
        rootCauseStatement: form.rootCauseStatement || undefined,
        fishbonePeople: form.fishbonePeople || undefined,
        fishboneMethod: form.fishboneMethod || undefined,
        fishboneMachine: form.fishboneMachine || undefined,
        fishboneMaterial: form.fishboneMaterial || undefined,
        fishboneMeasurement: form.fishboneMeasurement || undefined,
        fishboneEnvironment: form.fishboneEnvironment || undefined,
        d0: form.d0 || undefined,
        d1: form.d1 || undefined,
        d2: form.d2 || undefined,
        d3: form.d3 || undefined,
        d4: form.d4 || undefined,
        d5: form.d5 || undefined,
        d6: form.d6 || undefined,
        d7: form.d7 || undefined,
        d8: form.d8 || undefined,
        effectivenessCriteria: form.effectivenessCriteria || undefined,
        effectivenessKpi: form.effectivenessKpi || undefined,
        effectivenessTarget: form.effectivenessTarget || undefined,
        effectivenessMeasureMethod: form.effectivenessMeasureMethod || undefined,
        status: form.status,
        progressNotes: form.progressNotes || undefined,
        percentComplete: form.percentComplete,
        targetClosureDate: form.targetClosureDate || undefined,
        actualClosureDate: form.actualClosureDate || undefined,
        reviewDate: form.reviewDate || undefined,
        verifiedBy: form.verifiedBy || undefined,
        effectivenessAssessment: form.effectivenessAssessment || undefined,
        recurrenceCheck: form.recurrenceCheck || undefined,
        actionsEffective: form.actionsEffective,
        lessonsLearned: form.lessonsLearned || undefined,
        linkedNc: form.linkedNc || undefined,
        linkedProcess: form.linkedProcess || undefined,
        linkedFmea: form.linkedFmea || undefined,
        linkedDocument: form.linkedDocument || undefined,
        linkedHsCapa: form.linkedHsCapa || undefined,
        linkedEnvCapa: form.linkedEnvCapa || undefined,
        actions: capaActions.filter(a => a.action.trim()).map(a => ({
          action: a.action,
          assignedTo: a.assignedTo || undefined,
          dueDate: a.dueDate || undefined,
          priority: a.priority,
          status: a.status,
          notes: a.notes || undefined,
        })),
      };
      await api.post('/capa', payload);
      setModalOpen(false);
      setForm({ ...emptyForm });
      setCapaActions([]);
      loadCapas();
    } catch (err) {
      console.error('Failed to create CAPA:', err);
      setFormError('Failed to create CAPA. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── AI Analysis ──────────────────────────────────────────────────

  async function generateAiAnalysis() {
    if (!form.title || form.title.length < 10) return;
    setAiLoading(true);
    try {
      const response = await api.post('/capa/ai-analyse', {
        capaType: form.capaType,
        title: form.title,
        severity: form.severity,
        triggerSource: form.triggerSource,
        description: form.description,
        problemStatement: form.problemStatement,
        rcaMethod: form.rcaMethod,
        rootCauseStatement: form.rootCauseStatement,
      });
      const data = response.data.data;
      if (data) {
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
    } finally {
      setAiLoading(false);
    }
  }

  // ─── Section Definitions ──────────────────────────────────────────

  const sections = [
    { key: 'A', label: 'Identification' },
    { key: 'B', label: 'Containment' },
    { key: 'C', label: 'Root Cause' },
    { key: 'D', label: 'Actions' },
    { key: 'E', label: 'Effectiveness' },
    { key: 'F', label: 'Status' },
    { key: 'G', label: 'Verification' },
    { key: 'H', label: 'Cross-Links' },
    { key: 'I', label: 'AI Analysis' },
  ];

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CAPA Management</h1>
            <p className="text-gray-500 mt-1">
              Corrective and Preventive Actions with root cause analysis and effectiveness verification
            </p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create CAPA
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total CAPAs</p>
                  <p className="text-3xl font-bold">{counts.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open</p>
                  <p className="text-3xl font-bold text-blue-600">{counts.open}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Verification</p>
                  <p className="text-3xl font-bold text-purple-600">{counts.inVerification}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Closed This Month</p>
                  <p className="text-3xl font-bold text-green-600">{counts.closedThisMonth}</p>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search CAPAs by title, reference, description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={capaTypeFilter}
                onChange={e => setCapaTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                {CAPA_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">All Statuses</option>
                {CAPA_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">All Severities</option>
                {SEVERITIES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <select
                value={triggerFilter}
                onChange={e => setTriggerFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="all">All Triggers</option>
                {TRIGGER_SOURCES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
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

        {/* CAPAs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              CAPAs ({filteredCapas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-28 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : filteredCapas.length > 0 ? (
              <div className="space-y-4">
                {filteredCapas.map(capa => {
                  const isOverdue =
                    capa.targetClosureDate &&
                    new Date(capa.targetClosureDate) < new Date() &&
                    !['CLOSED', 'CANCELLED'].includes(capa.status);
                  return (
                    <div
                      key={capa.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        isOverdue
                          ? 'border-red-300 bg-red-50 hover:border-red-400'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-gray-500">
                              {capa.referenceNumber}
                            </span>
                            <Badge variant="outline">
                              {CAPA_TYPES.find(t => t.value === capa.capaType)?.label || capa.capaType}
                            </Badge>
                            {getSeverityBadge(capa.severity)}
                            {getStatusBadge(capa.status)}
                            {isOverdue && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 truncate">{capa.title}</h3>
                          {capa.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {capa.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            {capa.triggerSource && (
                              <span>
                                Trigger: {TRIGGER_SOURCES.find(t => t.value === capa.triggerSource)?.label || capa.triggerSource}
                              </span>
                            )}
                            {capa._count?.actions !== undefined && (
                              <span>{capa._count.actions} action(s)</span>
                            )}
                          </div>
                          {/* Progress Bar */}
                          {capa.percentComplete > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{capa.percentComplete}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    capa.percentComplete >= 100
                                      ? 'bg-green-500'
                                      : capa.percentComplete >= 50
                                      ? 'bg-blue-500'
                                      : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${Math.min(capa.percentComplete, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          {capa.targetClosureDate && (
                            <div className={`text-sm flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                              <Clock className="h-4 w-4" />
                              {new Date(capa.targetClosureDate).toLocaleDateString()}
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-1">Target Close</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-1">No CAPAs found</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Create your first CAPA to start tracking corrective and preventive actions with root cause analysis.
                </p>
                <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Create First CAPA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Create CAPA Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create CAPA"
        size="full"
      >
        <form onSubmit={handleSubmit}>
          {/* Section Tabs */}
          <div className="flex gap-1 mb-6 border-b overflow-x-auto">
            {sections.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveSection(s.key)}
                className={`px-2.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === s.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
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
            {/* ── Section A: Identification ─────────────────────────── */}
            {activeSection === 'A' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  A -- Identification
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-type">CAPA Type *</Label>
                    <Select
                      id="capa-type"
                      value={form.capaType}
                      onChange={e => updateForm('capaType', e.target.value)}
                    >
                      {CAPA_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capa-severity">Severity *</Label>
                    <Select
                      id="capa-severity"
                      value={form.severity}
                      onChange={e => updateForm('severity', e.target.value)}
                    >
                      {SEVERITIES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="capa-title">Title *</Label>
                  <Input
                    id="capa-title"
                    value={form.title}
                    onChange={e => updateForm('title', e.target.value)}
                    required
                    placeholder="Brief description of the issue requiring CAPA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-trigger">Trigger Source *</Label>
                    <Select
                      id="capa-trigger"
                      value={form.triggerSource}
                      onChange={e => updateForm('triggerSource', e.target.value)}
                    >
                      {TRIGGER_SOURCES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capa-sourceRef">Source Reference</Label>
                    <Input
                      id="capa-sourceRef"
                      value={form.sourceReference}
                      onChange={e => updateForm('sourceReference', e.target.value)}
                      placeholder="e.g., NC-2024-0012, AUD-001"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="capa-description">Description *</Label>
                  <Textarea
                    id="capa-description"
                    value={form.description}
                    onChange={e => updateForm('description', e.target.value)}
                    rows={4}
                    placeholder="Detailed description of the nonconformance or problem triggering this CAPA"
                  />
                </div>
                <div>
                  <Label htmlFor="capa-isoClause">ISO Clause</Label>
                  <Input
                    id="capa-isoClause"
                    value={form.isoClause}
                    onChange={e => updateForm('isoClause', e.target.value)}
                    placeholder="e.g., 10.2.1, 8.7"
                  />
                </div>
              </div>
            )}

            {/* ── Section B: Containment ────────────────────────────── */}
            {activeSection === 'B' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  B -- Containment
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.immediateActionRequired}
                      onChange={e => updateForm('immediateActionRequired', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Immediate Action Required
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Toggle on if containment actions must be taken immediately to prevent further impact.
                  </p>
                </div>
                <div>
                  <Label htmlFor="capa-actionsTaken">Actions Taken</Label>
                  <Textarea
                    id="capa-actionsTaken"
                    value={form.actionsTaken}
                    onChange={e => updateForm('actionsTaken', e.target.value)}
                    rows={4}
                    placeholder="Describe immediate containment actions that have been or will be taken"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-containmentVerifiedBy">Containment Verified By</Label>
                    <Input
                      id="capa-containmentVerifiedBy"
                      value={form.containmentVerifiedBy}
                      onChange={e => updateForm('containmentVerifiedBy', e.target.value)}
                      placeholder="Person who verified containment effectiveness"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capa-containmentDate">Containment Date</Label>
                    <Input
                      id="capa-containmentDate"
                      type="date"
                      value={form.containmentDate}
                      onChange={e => updateForm('containmentDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Section C: Root Cause Analysis ────────────────────── */}
            {activeSection === 'C' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  C -- Root Cause Analysis
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-rcaMethod">RCA Method *</Label>
                    <Select
                      id="capa-rcaMethod"
                      value={form.rcaMethod}
                      onChange={e => updateForm('rcaMethod', e.target.value)}
                    >
                      {RCA_METHODS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capa-rootCauseCat">Root Cause Category</Label>
                    <Select
                      id="capa-rootCauseCat"
                      value={form.rootCauseCategory}
                      onChange={e => updateForm('rootCauseCategory', e.target.value)}
                    >
                      {ROOT_CAUSE_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* ── 5 Why Fields ─────────────────────────────────── */}
                {form.rcaMethod === 'FIVE_WHY' && (
                  <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800">5 Why Analysis</h4>
                    <div>
                      <Label htmlFor="capa-problemStatement">Problem Statement</Label>
                      <Textarea
                        id="capa-problemStatement"
                        value={form.problemStatement}
                        onChange={e => updateForm('problemStatement', e.target.value)}
                        rows={2}
                        placeholder="Clearly state the problem"
                      />
                    </div>
                    <div>
                      <Label htmlFor="capa-why1">Why 1: Why did this happen?</Label>
                      <Input
                        id="capa-why1"
                        value={form.why1}
                        onChange={e => updateForm('why1', e.target.value)}
                        placeholder="First why..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="capa-why2">Why 2: Why did that happen?</Label>
                      <Input
                        id="capa-why2"
                        value={form.why2}
                        onChange={e => updateForm('why2', e.target.value)}
                        placeholder="Second why..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="capa-why3">Why 3: Why did that happen?</Label>
                      <Input
                        id="capa-why3"
                        value={form.why3}
                        onChange={e => updateForm('why3', e.target.value)}
                        placeholder="Third why..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="capa-why4">Why 4: Why did that happen?</Label>
                      <Input
                        id="capa-why4"
                        value={form.why4}
                        onChange={e => updateForm('why4', e.target.value)}
                        placeholder="Fourth why..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="capa-why5">Why 5: Why did that happen?</Label>
                      <Input
                        id="capa-why5"
                        value={form.why5}
                        onChange={e => updateForm('why5', e.target.value)}
                        placeholder="Fifth why..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="capa-rootCause">Root Cause Statement</Label>
                      <Textarea
                        id="capa-rootCause"
                        value={form.rootCauseStatement}
                        onChange={e => updateForm('rootCauseStatement', e.target.value)}
                        rows={2}
                        placeholder="Summarize the root cause identified through the 5 Whys"
                      />
                    </div>
                  </div>
                )}

                {/* ── Fishbone Fields ──────────────────────────────── */}
                {form.rcaMethod === 'FISHBONE' && (
                  <div className="space-y-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800">Fishbone / Ishikawa Analysis (6M)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capa-fbPeople">People (Man)</Label>
                        <Textarea
                          id="capa-fbPeople"
                          value={form.fishbonePeople}
                          onChange={e => updateForm('fishbonePeople', e.target.value)}
                          rows={2}
                          placeholder="People-related causes (skills, training, fatigue, etc.)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="capa-fbMethod">Method</Label>
                        <Textarea
                          id="capa-fbMethod"
                          value={form.fishboneMethod}
                          onChange={e => updateForm('fishboneMethod', e.target.value)}
                          rows={2}
                          placeholder="Method/process-related causes"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capa-fbMachine">Machine</Label>
                        <Textarea
                          id="capa-fbMachine"
                          value={form.fishboneMachine}
                          onChange={e => updateForm('fishboneMachine', e.target.value)}
                          rows={2}
                          placeholder="Equipment/machine-related causes"
                        />
                      </div>
                      <div>
                        <Label htmlFor="capa-fbMaterial">Material</Label>
                        <Textarea
                          id="capa-fbMaterial"
                          value={form.fishboneMaterial}
                          onChange={e => updateForm('fishboneMaterial', e.target.value)}
                          rows={2}
                          placeholder="Material/supply-related causes"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="capa-fbMeasurement">Measurement</Label>
                        <Textarea
                          id="capa-fbMeasurement"
                          value={form.fishboneMeasurement}
                          onChange={e => updateForm('fishboneMeasurement', e.target.value)}
                          rows={2}
                          placeholder="Measurement/inspection-related causes"
                        />
                      </div>
                      <div>
                        <Label htmlFor="capa-fbEnvironment">Environment</Label>
                        <Textarea
                          id="capa-fbEnvironment"
                          value={form.fishboneEnvironment}
                          onChange={e => updateForm('fishboneEnvironment', e.target.value)}
                          rows={2}
                          placeholder="Environmental causes (temperature, humidity, etc.)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 8D Fields ────────────────────────────────────── */}
                {form.rcaMethod === 'EIGHT_D' && (
                  <div className="space-y-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-orange-800">8D Problem Solving</h4>
                    <div>
                      <Label htmlFor="capa-d0">D0: Emergency Response / Planning</Label>
                      <Textarea id="capa-d0" value={form.d0} onChange={e => updateForm('d0', e.target.value)} rows={2} placeholder="Awareness of problem; emergency actions" />
                    </div>
                    <div>
                      <Label htmlFor="capa-d1">D1: Establish the Team</Label>
                      <Textarea id="capa-d1" value={form.d1} onChange={e => updateForm('d1', e.target.value)} rows={2} placeholder="Team members and roles" />
                    </div>
                    <div>
                      <Label htmlFor="capa-d2">D2: Describe the Problem</Label>
                      <Textarea id="capa-d2" value={form.d2} onChange={e => updateForm('d2', e.target.value)} rows={2} placeholder="5W2H problem description" />
                    </div>
                    <div>
                      <Label htmlFor="capa-d3">D3: Interim Containment Actions</Label>
                      <Textarea id="capa-d3" value={form.d3} onChange={e => updateForm('d3', e.target.value)} rows={2} placeholder="Containment to protect customer" />
                    </div>
                    <div>
                      <Label htmlFor="capa-d4">D4: Root Cause Analysis</Label>
                      <Textarea id="capa-d4" value={form.d4} onChange={e => updateForm('d4', e.target.value)} rows={2} placeholder="Identify all potential causes and verify root cause" />
                    </div>
                    <div>
                      <Label htmlFor="capa-d5">D5: Permanent Corrective Actions</Label>
                      <Textarea id="capa-d5" value={form.d5} onChange={e => updateForm('d5', e.target.value)} rows={2} placeholder="Define and verify corrective actions" />
                    </div>
                    <div>
                      <Label htmlFor="capa-d6">D6: Implement Permanent Actions</Label>
                      <Textarea id="capa-d6" value={form.d6} onChange={e => updateForm('d6', e.target.value)} rows={2} placeholder="Implementation plan and verification" />
                    </div>
                    <div>
                      <Label htmlFor="capa-d7">D7: Prevent Recurrence</Label>
                      <Textarea id="capa-d7" value={form.d7} onChange={e => updateForm('d7', e.target.value)} rows={2} placeholder="Systemic changes to prevent recurrence" />
                    </div>
                    <div>
                      <Label htmlFor="capa-d8">D8: Congratulate the Team</Label>
                      <Textarea id="capa-d8" value={form.d8} onChange={e => updateForm('d8', e.target.value)} rows={2} placeholder="Recognition and lessons learned" />
                    </div>
                  </div>
                )}

                {/* ── IS/IS NOT, FAULT_TREE, OTHER ─────────────────── */}
                {(form.rcaMethod === 'IS_IS_NOT' || form.rcaMethod === 'FAULT_TREE' || form.rcaMethod === 'OTHER') && (
                  <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-800">
                      {RCA_METHODS.find(m => m.value === form.rcaMethod)?.label} Analysis
                    </h4>
                    <div>
                      <Label htmlFor="capa-ps">Problem Statement</Label>
                      <Textarea
                        id="capa-ps"
                        value={form.problemStatement}
                        onChange={e => updateForm('problemStatement', e.target.value)}
                        rows={3}
                        placeholder="Describe the problem being analysed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="capa-rcs">Root Cause Statement</Label>
                      <Textarea
                        id="capa-rcs"
                        value={form.rootCauseStatement}
                        onChange={e => updateForm('rootCauseStatement', e.target.value)}
                        rows={3}
                        placeholder="Summarize the identified root cause(s)"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Section D: Actions Table ──────────────────────────── */}
            {activeSection === 'D' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  D -- CAPA Actions
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Define specific corrective/preventive actions to address the root cause.
                  </p>
                  <Button type="button" size="sm" variant="outline" onClick={addCapaAction}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Action
                  </Button>
                </div>

                {capaActions.length > 0 ? (
                  <div className="space-y-3">
                    {capaActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">
                            Action #{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingActionIdx(editingActionIdx === idx ? null : idx)
                              }
                              className="text-blue-500 hover:text-blue-700 p-1"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCapaAction(idx)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label>Action Description *</Label>
                          <Textarea
                            value={action.action}
                            onChange={e => updateCapaAction(idx, 'action', e.target.value)}
                            rows={2}
                            placeholder="What action needs to be taken?"
                          />
                        </div>

                        {(editingActionIdx === idx || true) && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Assigned To</Label>
                                <Input
                                  value={action.assignedTo}
                                  onChange={e => updateCapaAction(idx, 'assignedTo', e.target.value)}
                                  placeholder="Responsible person"
                                />
                              </div>
                              <div>
                                <Label>Due Date</Label>
                                <Input
                                  type="date"
                                  value={action.dueDate}
                                  onChange={e => updateCapaAction(idx, 'dueDate', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Priority</Label>
                                <select
                                  value={action.priority}
                                  onChange={e => updateCapaAction(idx, 'priority', e.target.value)}
                                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                >
                                  {ACTION_PRIORITIES.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <select
                                  value={action.status}
                                  onChange={e => updateCapaAction(idx, 'status', e.target.value)}
                                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                >
                                  {ACTION_STATUSES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <Label>Notes</Label>
                              <Textarea
                                value={action.notes}
                                onChange={e => updateCapaAction(idx, 'notes', e.target.value)}
                                rows={2}
                                placeholder="Additional notes, updates, or observations"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      No actions yet. Click "Add Action" to define corrective/preventive actions.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Section E: Effectiveness ──────────────────────────── */}
            {activeSection === 'E' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  E -- Effectiveness Criteria
                </div>
                <div>
                  <Label htmlFor="capa-effectCriteria">Effectiveness Criteria</Label>
                  <Textarea
                    id="capa-effectCriteria"
                    value={form.effectivenessCriteria}
                    onChange={e => updateForm('effectivenessCriteria', e.target.value)}
                    rows={3}
                    placeholder="How will you determine if the CAPA was effective?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-effectKpi">Effectiveness KPI</Label>
                    <Input
                      id="capa-effectKpi"
                      value={form.effectivenessKpi}
                      onChange={e => updateForm('effectivenessKpi', e.target.value)}
                      placeholder="e.g., Defect rate, reject %, downtime"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capa-effectTarget">Effectiveness Target</Label>
                    <Input
                      id="capa-effectTarget"
                      value={form.effectivenessTarget}
                      onChange={e => updateForm('effectivenessTarget', e.target.value)}
                      placeholder="e.g., < 1% reject rate, zero recurrence"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="capa-effectMethod">Measurement Method</Label>
                  <Textarea
                    id="capa-effectMethod"
                    value={form.effectivenessMeasureMethod}
                    onChange={e => updateForm('effectivenessMeasureMethod', e.target.value)}
                    rows={2}
                    placeholder="How and when will the KPI be measured?"
                  />
                </div>
              </div>
            )}

            {/* ── Section F: Status ─────────────────────────────────── */}
            {activeSection === 'F' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  F -- Status & Progress
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-status">Status</Label>
                    <Select
                      id="capa-status"
                      value={form.status}
                      onChange={e => updateForm('status', e.target.value)}
                    >
                      {CAPA_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capa-percentComplete">
                      Percent Complete: {form.percentComplete}%
                    </Label>
                    <input
                      id="capa-percentComplete"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={form.percentComplete}
                      onChange={e => updateForm('percentComplete', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="capa-progressNotes">Progress Notes</Label>
                  <Textarea
                    id="capa-progressNotes"
                    value={form.progressNotes}
                    onChange={e => updateForm('progressNotes', e.target.value)}
                    rows={4}
                    placeholder="Log of progress updates, milestones reached, and blockers"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-targetClose">Target Closure Date</Label>
                    <Input
                      id="capa-targetClose"
                      type="date"
                      value={form.targetClosureDate}
                      onChange={e => updateForm('targetClosureDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capa-actualClose">Actual Closure Date</Label>
                    <Input
                      id="capa-actualClose"
                      type="date"
                      value={form.actualClosureDate}
                      onChange={e => updateForm('actualClosureDate', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank until CAPA is actually closed.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Section G: Verification & Closure ─────────────────── */}
            {activeSection === 'G' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  G -- Verification & Closure
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-reviewDate">Review Date</Label>
                    <Input
                      id="capa-reviewDate"
                      type="date"
                      value={form.reviewDate}
                      onChange={e => updateForm('reviewDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capa-verifiedBy">Verified By</Label>
                    <Input
                      id="capa-verifiedBy"
                      value={form.verifiedBy}
                      onChange={e => updateForm('verifiedBy', e.target.value)}
                      placeholder="Person who verified CAPA effectiveness"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="capa-effectAssess">Effectiveness Assessment</Label>
                  <Textarea
                    id="capa-effectAssess"
                    value={form.effectivenessAssessment}
                    onChange={e => updateForm('effectivenessAssessment', e.target.value)}
                    rows={3}
                    placeholder="Assessment of whether the CAPA achieved its intended result"
                  />
                </div>
                <div>
                  <Label htmlFor="capa-recurrence">Recurrence Check</Label>
                  <Textarea
                    id="capa-recurrence"
                    value={form.recurrenceCheck}
                    onChange={e => updateForm('recurrenceCheck', e.target.value)}
                    rows={2}
                    placeholder="Has the problem recurred since implementation? Evidence of no recurrence."
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.actionsEffective}
                      onChange={e => updateForm('actionsEffective', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Actions verified as effective
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Confirm that all actions have been verified and are effectively addressing the root cause.
                  </p>
                </div>
                <div>
                  <Label htmlFor="capa-lessonsLearned">Lessons Learned</Label>
                  <Textarea
                    id="capa-lessonsLearned"
                    value={form.lessonsLearned}
                    onChange={e => updateForm('lessonsLearned', e.target.value)}
                    rows={3}
                    placeholder="Key lessons from this CAPA that should be shared across the organization"
                  />
                </div>
              </div>
            )}

            {/* ── Section H: Cross-Links ────────────────────────────── */}
            {activeSection === 'H' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  H -- Cross-Links
                </div>
                <p className="text-sm text-gray-500">
                  Link this CAPA to related records across the quality and management system.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-linkedNc">Linked Nonconformance</Label>
                    <Input
                      id="capa-linkedNc"
                      value={form.linkedNc}
                      onChange={e => updateForm('linkedNc', e.target.value)}
                      placeholder="NC reference, e.g., NC-2024-0012"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capa-linkedProcess">Linked Process</Label>
                    <Input
                      id="capa-linkedProcess"
                      value={form.linkedProcess}
                      onChange={e => updateForm('linkedProcess', e.target.value)}
                      placeholder="Process name or reference"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-linkedFmea">Linked FMEA</Label>
                    <Input
                      id="capa-linkedFmea"
                      value={form.linkedFmea}
                      onChange={e => updateForm('linkedFmea', e.target.value)}
                      placeholder="FMEA reference"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capa-linkedDocument">Linked Document</Label>
                    <Input
                      id="capa-linkedDocument"
                      value={form.linkedDocument}
                      onChange={e => updateForm('linkedDocument', e.target.value)}
                      placeholder="Document number or title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capa-linkedHsCapa">Linked H&S CAPA</Label>
                    <Input
                      id="capa-linkedHsCapa"
                      value={form.linkedHsCapa}
                      onChange={e => updateForm('linkedHsCapa', e.target.value)}
                      placeholder="H&S CAPA reference"
                    />
                  </div>
                  <div>
                    <Label htmlFor="capa-linkedEnvCapa">Linked Env CAPA</Label>
                    <Input
                      id="capa-linkedEnvCapa"
                      value={form.linkedEnvCapa}
                      onChange={e => updateForm('linkedEnvCapa', e.target.value)}
                      placeholder="Environmental CAPA reference"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Section I: AI CAPA Analysis ───────────────────────── */}
            {activeSection === 'I' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  I -- AI CAPA Analysis
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI CAPA Analysis
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
                    Complete the identification and root cause sections (title 10+ chars), then click
                    to generate AI-powered root cause suggestions, action recommendations, and
                    effectiveness guidance.
                  </p>

                  {aiAnalysis && (
                    <div className="space-y-3 mt-4">
                      {aiAnalysis.suggestedRootCauses && aiAnalysis.suggestedRootCauses.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-purple-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">Suggested Root Causes</p>
                          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                            {aiAnalysis.suggestedRootCauses.map((cause, idx) => (
                              <li key={idx}>{cause}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiAnalysis.suggestedActions && aiAnalysis.suggestedActions.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-purple-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">Suggested Actions</p>
                          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                            {aiAnalysis.suggestedActions.map((act, idx) => (
                              <li key={idx}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Risk Assessment</p>
                        <p className="text-sm text-gray-800">{aiAnalysis.riskAssessment}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Effectiveness Recommendations</p>
                        <p className="text-sm text-gray-800">{aiAnalysis.effectivenessRecommendations}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 mb-1">Compliance Notes</p>
                        <p className="text-sm text-gray-800">{aiAnalysis.complianceNotes}</p>
                      </div>
                      {aiAnalysis.bestPractices && aiAnalysis.bestPractices.length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-purple-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">Best Practices</p>
                          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                            {aiAnalysis.bestPractices.map((bp, idx) => (
                              <li key={idx}>{bp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                      const idx = sections.findIndex(s => s.key === activeSection);
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
                {activeSection !== 'I' ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const idx = sections.findIndex(s => s.key === activeSection);
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
                      'Create CAPA'
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
