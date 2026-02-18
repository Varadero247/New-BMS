'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@ims/ui';
import { api } from '@/lib/api';
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  Filter,
  Cpu,
  Bot,
  Brain,
  Calendar,
  Clock,
  ShieldCheck,
  Database,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AISystem {
  id: string;
  name: string;
  description?: string;
  aiType: string;
  riskLevel: string;
  status: string;
  owner: string;
  vendor?: string;
  purpose?: string;
  deploymentDate?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
  dataTypes?: string;
  trainingData?: string;
  limitations?: string;
  provider?: string;
  model?: string;
  analysisTypes?: string;
  modules?: string;
  impactLevel?: string;
  humanOversight?: string;
  dataRetention?: string;
  reviewFrequency?: string;
  createdAt: string;
  updatedAt: string;
}

type FormData = {
  name: string;
  description: string;
  aiType: string;
  purpose: string;
  riskLevel: string;
  status: string;
  owner: string;
  vendor: string;
  deploymentDate: string;
  lastReviewDate: string;
  nextReviewDate: string;
  dataTypes: string;
  trainingData: string;
  limitations: string;
  provider: string;
  model: string;
  analysisTypes: string;
  modules: string;
  impactLevel: string;
  humanOversight: string;
  dataRetention: string;
  reviewFrequency: string;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const aiTypeOptions = [
  'MACHINE_LEARNING',
  'DEEP_LEARNING',
  'NLP',
  'COMPUTER_VISION',
  'GENERATIVE_AI',
  'ROBOTICS',
  'EXPERT_SYSTEM',
  'OTHER',
];

const riskLevelOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusOptions = ['ACTIVE', 'UNDER_REVIEW', 'RETIRED', 'PLANNED'];
const impactLevelOptions = ['NEGLIGIBLE', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH'];
const humanOversightOptions = [
  'FULL_AUTONOMY',
  'HUMAN_IN_THE_LOOP',
  'HUMAN_ON_THE_LOOP',
  'HUMAN_IN_COMMAND',
];
const dataRetentionOptions = ['30_DAYS', '90_DAYS', '1_YEAR', '3_YEARS', '7_YEARS', 'INDEFINITE'];
const reviewFrequencyOptions = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY'];

const providerOptions = [
  'Anthropic',
  'OpenAI',
  'xAI',
  'Google',
  'Meta',
  'Custom / In-House',
  'Other',
];

const claudeAnalysisTypes = [
  'Risk Assessment',
  'Document Analysis',
  'Incident Classification',
  'Compliance Checking',
  'Audit Trail Analysis',
  'Anomaly Detection',
  'Policy Generation',
  'Gap Analysis',
  'Corrective Action Recommendations',
  'Training Content Generation',
  'Report Summarisation',
  'Evidence Pack Review',
  'Regulatory Change Analysis',
  'KPI Forecasting',
  'Root Cause Analysis',
  'Supplier Risk Scoring',
  'ESG Scoring',
  'HACCP Hazard Analysis',
  'Energy Optimisation',
  'Predictive Maintenance',
  'Sentiment Analysis',
  'Natural Language Querying',
  'Template Generation',
];

const allAnalysisTypes = [
  ...claudeAnalysisTypes,
  'Image Classification',
  'Object Detection',
  'Speech-to-Text',
  'Text-to-Speech',
  'Code Generation',
  'Data Extraction',
  'Translation',
  'Embedding Generation',
];

const moduleOptions = [
  'Health & Safety',
  'Environment',
  'Quality',
  'Finance',
  'CRM',
  'InfoSec',
  'ESG',
  'CMMS',
  'Food Safety',
  'Energy',
  'Analytics',
  'HR',
  'Payroll',
  'Workflows',
  'Project Management',
  'Automotive',
  'Medical',
  'Aerospace',
  'Inventory',
  'Field Service',
  'ISO 42001',
  'ISO 37001',
  'Customer Portal',
  'Supplier Portal',
  'Dashboard',
  'Settings',
];

const riskLevelColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  RETIRED: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  PLANNED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const oversightColors: Record<string, string> = {
  FULL_AUTONOMY: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  HUMAN_IN_THE_LOOP: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  HUMAN_ON_THE_LOOP: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  HUMAN_IN_COMMAND: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

/* Pre-populated system entries */
const prePopulatedSystems: Partial<FormData>[] = [
  {
    name: 'Claude (Anthropic)',
    description:
      'Claude AI assistant powering 23 analysis types across all IMS modules including risk assessment, compliance checking, document analysis, and natural language querying.',
    aiType: 'GENERATIVE_AI',
    purpose:
      'Multi-purpose AI analysis engine for the Integrated Management System. Performs risk assessments, document analysis, compliance checking, incident classification, report summarisation, and 18 other analysis types across 26 web applications.',
    riskLevel: 'MEDIUM',
    status: 'ACTIVE',
    owner: 'AI Governance Team',
    vendor: 'Anthropic',
    provider: 'Anthropic',
    model: 'Claude Opus 4',
    analysisTypes: claudeAnalysisTypes.join(', '),
    modules: moduleOptions.join(', '),
    impactLevel: 'HIGH',
    humanOversight: 'HUMAN_IN_THE_LOOP',
    dataRetention: '1_YEAR',
    reviewFrequency: 'QUARTERLY',
    dataTypes:
      'Text documents, audit reports, compliance records, risk registers, incident reports, training records, financial data (anonymised), supplier data',
    trainingData:
      'Pre-trained foundation model. No organisation-specific fine-tuning. All analysis performed via prompting with context injection.',
    limitations:
      'Cannot access real-time external data. May produce plausible but incorrect analysis (hallucination risk). Requires human review for all compliance-critical outputs. Context window limitations for very large documents.',
  },
  {
    name: 'GPT-4o (OpenAI)',
    description:
      'OpenAI GPT-4o model used for supplementary text analysis, translation, and document classification tasks.',
    aiType: 'GENERATIVE_AI',
    purpose:
      'Supplementary AI engine for document classification, multi-language translation, and text extraction tasks where specialised processing is required.',
    riskLevel: 'MEDIUM',
    status: 'PLANNED',
    owner: 'AI Governance Team',
    vendor: 'OpenAI',
    provider: 'OpenAI',
    model: 'GPT-4o',
    analysisTypes:
      'Document Classification, Translation, Data Extraction, Text Summarisation, Embedding Generation',
    modules: 'Quality, CRM, Customer Portal, Supplier Portal',
    impactLevel: 'MODERATE',
    humanOversight: 'HUMAN_IN_THE_LOOP',
    dataRetention: '90_DAYS',
    reviewFrequency: 'QUARTERLY',
    dataTypes: 'Text documents, customer communications, supplier documentation',
    trainingData: 'Pre-trained foundation model. No custom fine-tuning.',
    limitations:
      'Data residency concerns (US-hosted). Token limits. Rate limiting under high load.',
  },
  {
    name: 'Grok (xAI)',
    description:
      'xAI Grok model evaluated for real-time regulatory monitoring and news analysis for compliance teams.',
    aiType: 'GENERATIVE_AI',
    purpose:
      'Real-time regulatory change monitoring, news analysis, and emerging risk identification from public data sources.',
    riskLevel: 'LOW',
    status: 'PLANNED',
    owner: 'Compliance Team',
    vendor: 'xAI',
    provider: 'xAI',
    model: 'Grok-2',
    analysisTypes:
      'Regulatory Change Analysis, Sentiment Analysis, News Monitoring, Emerging Risk Detection',
    modules: 'ESG, Environment, Health & Safety, Quality',
    impactLevel: 'LOW',
    humanOversight: 'HUMAN_ON_THE_LOOP',
    dataRetention: '30_DAYS',
    reviewFrequency: 'SEMI_ANNUALLY',
    dataTypes: 'Public regulatory feeds, news articles, social media (public)',
    trainingData: 'Pre-trained foundation model with real-time data access.',
    limitations:
      'Newer model with less established track record. Real-time data may include unverified information. Limited enterprise governance tooling.',
  },
];

const defaultForm: FormData = {
  name: '',
  description: '',
  aiType: 'MACHINE_LEARNING',
  purpose: '',
  riskLevel: 'LOW',
  status: 'ACTIVE',
  owner: '',
  vendor: '',
  deploymentDate: '',
  lastReviewDate: '',
  nextReviewDate: '',
  dataTypes: '',
  trainingData: '',
  limitations: '',
  provider: '',
  model: '',
  analysisTypes: '',
  modules: '',
  impactLevel: 'LOW',
  humanOversight: 'HUMAN_IN_THE_LOOP',
  dataRetention: '1_YEAR',
  reviewFrequency: 'QUARTERLY',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatLabel(value: string) {
  return value.replace(/_/g, ' ');
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isReviewOverdue(nextReview?: string) {
  if (!nextReview) return false;
  return new Date(nextReview) < new Date();
}

function daysUntilReview(nextReview?: string) {
  if (!nextReview) return null;
  const diff = Math.ceil((new Date(nextReview).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AISystemRegisterPage() {
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterProvider, setFilterProvider] = useState('');

  const [addEditOpen, setAddEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [prePopulateOpen, setPrePopulateOpen] = useState(false);

  const [editingSystem, setEditingSystem] = useState<AISystem | null>(null);
  const [viewingSystem, setViewingSystem] = useState<AISystem | null>(null);
  const [deletingSystem, setDeletingSystem] = useState<AISystem | null>(null);

  const [form, setForm] = useState<FormData>(defaultForm);
  const [formStep, setFormStep] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'overview' | 'analysis' | 'governance' | 'review'>(
    'overview'
  );

  useEffect(() => {
    loadSystems();
  }, []);

  async function loadSystems() {
    try {
      setError(null);
      const res = await api.get('/ai-systems');
      setSystems(res.data.data || []);
    } catch {
      setError('Failed to load AI systems. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingSystem(null);
    setForm(defaultForm);
    setFormStep(0);
    setAddEditOpen(true);
  }

  function openPrePopulate(template: Partial<FormData>) {
    setEditingSystem(null);
    setForm({ ...defaultForm, ...template });
    setFormStep(0);
    setPrePopulateOpen(false);
    setAddEditOpen(true);
  }

  function openEditModal(system: AISystem) {
    setEditingSystem(system);
    setForm({
      name: system.name,
      description: system.description || '',
      aiType: system.aiType,
      purpose: system.purpose || '',
      riskLevel: system.riskLevel,
      status: system.status,
      owner: system.owner,
      vendor: system.vendor || '',
      deploymentDate: system.deploymentDate ? system.deploymentDate.slice(0, 10) : '',
      lastReviewDate: system.lastReviewDate ? system.lastReviewDate.slice(0, 10) : '',
      nextReviewDate: system.nextReviewDate ? system.nextReviewDate.slice(0, 10) : '',
      dataTypes: system.dataTypes || '',
      trainingData: system.trainingData || '',
      limitations: system.limitations || '',
      provider: system.provider || '',
      model: system.model || '',
      analysisTypes: system.analysisTypes || '',
      modules: system.modules || '',
      impactLevel: system.impactLevel || 'LOW',
      humanOversight: system.humanOversight || 'HUMAN_IN_THE_LOOP',
      dataRetention: system.dataRetention || '1_YEAR',
      reviewFrequency: system.reviewFrequency || 'QUARTERLY',
    });
    setFormStep(0);
    setAddEditOpen(true);
  }

  function openViewModal(system: AISystem) {
    setViewingSystem(system);
    setViewTab('overview');
    setViewOpen(true);
  }

  function openDeleteModal(system: AISystem) {
    setDeletingSystem(system);
    setDeleteOpen(true);
  }

  function handleFormChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        deploymentDate: form.deploymentDate || undefined,
        lastReviewDate: form.lastReviewDate || undefined,
        nextReviewDate: form.nextReviewDate || undefined,
      };
      if (editingSystem) {
        await api.put(`/ai-systems/${editingSystem.id}`, payload);
      } else {
        await api.post('/ai-systems', payload);
      }
      setAddEditOpen(false);
      await loadSystems();
    } catch {
      setError('Failed to save AI system. Please check all required fields.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingSystem) return;
    setSaving(true);
    try {
      await api.delete(`/ai-systems/${deletingSystem.id}`);
      setDeleteOpen(false);
      setDeletingSystem(null);
      await loadSystems();
    } catch {
      setError('Failed to delete AI system.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = systems.filter((s) => {
    if (filterStatus && s.status !== filterStatus) return false;
    if (filterRisk && s.riskLevel !== filterRisk) return false;
    if (filterProvider && s.provider !== filterProvider) return false;
    return true;
  });

  const totalSystems = systems.length;
  const activeSystems = systems.filter((s) => s.status === 'ACTIVE').length;
  const underReviewSystems = systems.filter((s) => s.status === 'UNDER_REVIEW').length;
  const highRiskSystems = systems.filter(
    (s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL'
  ).length;
  const overdueReviews = systems.filter((s) => isReviewOverdue(s.nextReviewDate)).length;

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';
  const labelClass = 'block text-sm font-medium text-foreground mb-1';

  const formSteps = ['Basic Info', 'Provider & Model', 'Governance', 'Data & Limits'];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI System Register</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ISO 42001 Clause 6.1 -- Inventory and classification of all AI systems in the
              organisation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrePopulateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors"
            >
              <Bot className="w-4 h-4" />
              Quick Add
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add AI System
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Systems
              </p>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalSystems}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active
              </p>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeSystems}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Under Review
              </p>
            </div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {underReviewSystems}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                High/Critical Risk
              </p>
            </div>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {highRiskSystems}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-red-500" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Overdue Reviews
              </p>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{overdueReviews}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {formatLabel(s)}
                </option>
              ))}
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Risk Levels</option>
              {riskLevelOptions.map((r) => (
                <option key={r} value={r}>
                  {formatLabel(r)}
                </option>
              ))}
            </select>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Providers</option>
              {providerOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {(filterStatus || filterRisk || filterProvider) && (
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterRisk('');
                  setFilterProvider('');
                }}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear filters
              </button>
            )}
            <span className="ml-auto text-sm text-muted-foreground">
              {filtered.length} of {totalSystems} system{totalSystems !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* System Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-card border border-border rounded-xl p-6 h-64"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-16 text-center">
            <Brain className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No AI systems found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {filterStatus || filterRisk || filterProvider
                ? 'Try adjusting your filters'
                : 'Add your first AI system to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((system) => {
              const isExpanded = expandedCard === system.id;
              const reviewDays = daysUntilReview(system.nextReviewDate);
              const overdue = isReviewOverdue(system.nextReviewDate);
              const analysisCount = system.analysisTypes
                ? system.analysisTypes.split(',').filter(Boolean).length
                : 0;
              const moduleCount = system.modules
                ? system.modules.split(',').filter(Boolean).length
                : 0;

              return (
                <div
                  key={system.id}
                  className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {system.name}
                          </h3>
                        </div>
                        {system.provider && (
                          <p className="text-xs text-muted-foreground">
                            {system.provider}
                            {system.model ? ` -- ${system.model}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${riskLevelColors[system.riskLevel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                        >
                          {formatLabel(system.riskLevel)} RISK
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[system.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                        >
                          {formatLabel(system.status)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {system.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {system.description}
                      </p>
                    )}

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {analysisCount > 0 && (
                        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-lg font-bold text-foreground">{analysisCount}</p>
                          <p className="text-[10px] text-muted-foreground">Analysis Types</p>
                        </div>
                      )}
                      {moduleCount > 0 && (
                        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-lg font-bold text-foreground">{moduleCount}</p>
                          <p className="text-[10px] text-muted-foreground">Modules</p>
                        </div>
                      )}
                      {system.humanOversight && (
                        <div className="bg-muted/50 rounded-lg px-2 py-1.5 text-center">
                          <span
                            className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-medium ${oversightColors[system.humanOversight] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                          >
                            {formatLabel(system.humanOversight).replace('Human ', '')}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Oversight</p>
                        </div>
                      )}
                    </div>

                    {/* Review Schedule */}
                    {system.nextReviewDate && (
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-3 ${
                          overdue
                            ? 'bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                            : reviewDays !== null && reviewDays <= 30
                              ? 'bg-yellow-50 border border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
                              : 'bg-muted/50 text-muted-foreground'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {overdue
                            ? `Review overdue (${Math.abs(reviewDays || 0)} days ago)`
                            : `Next review: ${formatDate(system.nextReviewDate)}${reviewDays !== null ? ` (${reviewDays} days)` : ''}`}
                        </span>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border pt-3 mt-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Owner:</span>
                            <span className="ml-1 text-foreground font-medium">
                              {system.owner || '--'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Impact:</span>
                            <span className="ml-1 text-foreground font-medium">
                              {formatLabel(system.impactLevel || '--')}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Retention:</span>
                            <span className="ml-1 text-foreground font-medium">
                              {formatLabel(system.dataRetention || '--')}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Review Freq:</span>
                            <span className="ml-1 text-foreground font-medium">
                              {formatLabel(system.reviewFrequency || '--')}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deployed:</span>
                            <span className="ml-1 text-foreground font-medium">
                              {formatDate(system.deploymentDate)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Review:</span>
                            <span className="ml-1 text-foreground font-medium">
                              {formatDate(system.lastReviewDate)}
                            </span>
                          </div>
                        </div>
                        {system.analysisTypes && (
                          <div className="mt-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                              Analysis Types
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {system.analysisTypes
                                .split(',')
                                .slice(0, 8)
                                .map((t) => (
                                  <span
                                    key={t.trim()}
                                    className="inline-flex px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded"
                                  >
                                    {t.trim()}
                                  </span>
                                ))}
                              {system.analysisTypes.split(',').length > 8 && (
                                <span className="inline-flex px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground rounded">
                                  +{system.analysisTypes.split(',').length - 8} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-border px-5 py-3 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : system.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                      {isExpanded ? 'Less' : 'More'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(system)}
                        className="p-1.5 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(system)}
                        className="p-1.5 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(system)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Add / Pre-populate Modal */}
      <Modal
        isOpen={prePopulateOpen}
        onClose={() => setPrePopulateOpen(false)}
        title="Quick Add AI System"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a pre-configured AI system template to quickly register a new system. You can
            modify the details before saving.
          </p>
          {prePopulatedSystems.map((template, idx) => (
            <button
              key={idx}
              onClick={() => openPrePopulate(template)}
              className="w-full text-left bg-muted/50 hover:bg-muted border border-border rounded-lg p-4 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-foreground">{template.name}</h4>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${riskLevelColors[template.riskLevel || 'LOW']}`}
                >
                  {formatLabel(template.riskLevel || 'LOW')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span>Provider: {template.provider}</span>
                <span>Model: {template.model}</span>
                {template.analysisTypes && (
                  <span>{template.analysisTypes.split(',').length} analysis types</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Add / Edit Modal (Multi-step) */}
      <Modal
        isOpen={addEditOpen}
        onClose={() => setAddEditOpen(false)}
        title={editingSystem ? 'Edit AI System' : 'Register AI System'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-2">
            {formSteps.map((step, idx) => (
              <button
                key={step}
                type="button"
                onClick={() => setFormStep(idx)}
                className={`flex-1 text-center py-2 text-xs font-medium rounded-lg transition-colors ${
                  formStep === idx
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {step}
              </button>
            ))}
          </div>

          {/* Step 0: Basic Info */}
          {formStep === 0 && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>
                  System Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Claude (Anthropic)"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="Brief description of what this system does"
                />
              </div>
              <div>
                <label className={labelClass}>Purpose</label>
                <textarea
                  value={form.purpose}
                  onChange={(e) => handleFormChange('purpose', e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="What business problem does this system solve?"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>AI Type</label>
                  <select
                    value={form.aiType}
                    onChange={(e) => handleFormChange('aiType', e.target.value)}
                    className={inputClass}
                  >
                    {aiTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {formatLabel(t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Risk Level</label>
                  <select
                    value={form.riskLevel}
                    onChange={(e) => handleFormChange('riskLevel', e.target.value)}
                    className={inputClass}
                  >
                    {riskLevelOptions.map((r) => (
                      <option key={r} value={r}>
                        {formatLabel(r)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className={inputClass}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {formatLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Owner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.owner}
                    onChange={(e) => handleFormChange('owner', e.target.value)}
                    className={inputClass}
                    placeholder="Responsible team or person"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Vendor</label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => handleFormChange('vendor', e.target.value)}
                    className={inputClass}
                    placeholder="Third-party vendor name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Provider & Model */}
          {formStep === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Provider</label>
                  <select
                    value={form.provider}
                    onChange={(e) => handleFormChange('provider', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select provider...</option>
                    {providerOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Model</label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => handleFormChange('model', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Claude Opus 4, GPT-4o, Grok-2"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Analysis Types</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select the analysis types this system performs, or type custom ones
                  (comma-separated).
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2 max-h-32 overflow-y-auto p-2 border border-border rounded-lg bg-muted/30">
                  {allAnalysisTypes.map((type) => {
                    const selected = form.analysisTypes
                      .split(',')
                      .map((s) => s.trim())
                      .includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          const current = form.analysisTypes
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          const updated = selected
                            ? current.filter((t) => t !== type)
                            : [...current, type];
                          handleFormChange('analysisTypes', updated.join(', '));
                        }}
                        className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-background border border-border text-muted-foreground hover:border-indigo-400'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  value={form.analysisTypes}
                  onChange={(e) => handleFormChange('analysisTypes', e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="Comma-separated analysis types"
                />
              </div>
              <div>
                <label className={labelClass}>Modules</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select the IMS modules this AI system serves.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {moduleOptions.map((mod) => {
                    const selected = form.modules
                      .split(',')
                      .map((s) => s.trim())
                      .includes(mod);
                    return (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => {
                          const current = form.modules
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          const updated = selected
                            ? current.filter((m) => m !== mod)
                            : [...current, mod];
                          handleFormChange('modules', updated.join(', '));
                        }}
                        className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-background border border-border text-muted-foreground hover:border-indigo-400'
                        }`}
                      >
                        {mod}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Governance */}
          {formStep === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Impact Level</label>
                  <select
                    value={form.impactLevel}
                    onChange={(e) => handleFormChange('impactLevel', e.target.value)}
                    className={inputClass}
                  >
                    {impactLevelOptions.map((l) => (
                      <option key={l} value={l}>
                        {formatLabel(l)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Human Oversight</label>
                  <select
                    value={form.humanOversight}
                    onChange={(e) => handleFormChange('humanOversight', e.target.value)}
                    className={inputClass}
                  >
                    {humanOversightOptions.map((h) => (
                      <option key={h} value={h}>
                        {formatLabel(h)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-400 space-y-1">
                <p className="font-semibold">Human Oversight Levels (ISO 42001 A.8.5):</p>
                <p>
                  <strong>Human-in-the-Loop:</strong> Human approves every AI output before action
                  is taken.
                </p>
                <p>
                  <strong>Human-on-the-Loop:</strong> AI acts autonomously, human monitors and can
                  intervene.
                </p>
                <p>
                  <strong>Human-in-Command:</strong> Human has full control and can override/disable
                  the system.
                </p>
                <p>
                  <strong>Full Autonomy:</strong> System operates without human intervention
                  (highest risk).
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Data Retention</label>
                  <select
                    value={form.dataRetention}
                    onChange={(e) => handleFormChange('dataRetention', e.target.value)}
                    className={inputClass}
                  >
                    {dataRetentionOptions.map((d) => (
                      <option key={d} value={d}>
                        {formatLabel(d)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Review Frequency</label>
                  <select
                    value={form.reviewFrequency}
                    onChange={(e) => handleFormChange('reviewFrequency', e.target.value)}
                    className={inputClass}
                  >
                    {reviewFrequencyOptions.map((r) => (
                      <option key={r} value={r}>
                        {formatLabel(r)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Deployment Date</label>
                  <input
                    type="date"
                    value={form.deploymentDate}
                    onChange={(e) => handleFormChange('deploymentDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Review Date</label>
                  <input
                    type="date"
                    value={form.lastReviewDate}
                    onChange={(e) => handleFormChange('lastReviewDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Next Review Date</label>
                  <input
                    type="date"
                    value={form.nextReviewDate}
                    onChange={(e) => handleFormChange('nextReviewDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Data & Limits */}
          {formStep === 3 && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Data Types Processed</label>
                <textarea
                  value={form.dataTypes}
                  onChange={(e) => handleFormChange('dataTypes', e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="e.g. Personal data, financial records, images"
                />
              </div>
              <div>
                <label className={labelClass}>Training Data Description</label>
                <textarea
                  value={form.trainingData}
                  onChange={(e) => handleFormChange('trainingData', e.target.value)}
                  className={inputClass}
                  rows={2}
                  placeholder="Describe the training dataset, its source, and any preprocessing"
                />
              </div>
              <div>
                <label className={labelClass}>Known Limitations</label>
                <textarea
                  value={form.limitations}
                  onChange={(e) => handleFormChange('limitations', e.target.value)}
                  className={inputClass}
                  rows={3}
                  placeholder="Document any known limitations, biases, or failure modes"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex gap-2">
              {formStep > 0 && (
                <button
                  type="button"
                  onClick={() => setFormStep(formStep - 1)}
                  className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddEditOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              {formStep < formSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setFormStep(formStep + 1)}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : editingSystem ? 'Update System' : 'Register System'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title={viewingSystem?.name || 'AI System Details'}
        size="xl"
      >
        {viewingSystem && (
          <div className="space-y-5">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${riskLevelColors[viewingSystem.riskLevel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
              >
                Risk: {formatLabel(viewingSystem.riskLevel)}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[viewingSystem.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
              >
                {formatLabel(viewingSystem.status)}
              </span>
              {viewingSystem.humanOversight && (
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${oversightColors[viewingSystem.humanOversight] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}
                >
                  {formatLabel(viewingSystem.humanOversight)}
                </span>
              )}
              <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                {formatLabel(viewingSystem.aiType)}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {(['overview', 'analysis', 'governance', 'review'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                    viewTab === tab
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {viewTab === 'overview' && (
              <div className="space-y-4">
                {viewingSystem.description && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Description</dt>
                    <dd className="text-sm text-foreground mt-0.5">{viewingSystem.description}</dd>
                  </div>
                )}
                {viewingSystem.purpose && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Purpose</dt>
                    <dd className="text-sm text-foreground mt-0.5">{viewingSystem.purpose}</dd>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Provider</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {viewingSystem.provider || '--'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Model</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {viewingSystem.model || '--'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Owner</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {viewingSystem.owner || '--'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Vendor</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {viewingSystem.vendor || '--'}
                    </dd>
                  </div>
                </div>
              </div>
            )}

            {viewTab === 'analysis' && (
              <div className="space-y-4">
                {viewingSystem.analysisTypes ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Analysis Types ({viewingSystem.analysisTypes.split(',').length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingSystem.analysisTypes.split(',').map((t) => (
                        <span
                          key={t.trim()}
                          className="inline-flex px-2 py-1 text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-md"
                        >
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No analysis types configured.</p>
                )}
                {viewingSystem.modules ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Modules ({viewingSystem.modules.split(',').length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingSystem.modules.split(',').map((m) => (
                        <span
                          key={m.trim()}
                          className="inline-flex px-2 py-1 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md"
                        >
                          {m.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No modules configured.</p>
                )}
              </div>
            )}

            {viewTab === 'governance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Impact Level</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatLabel(viewingSystem.impactLevel || '--')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Human Oversight</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatLabel(viewingSystem.humanOversight || '--')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Data Retention</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatLabel(viewingSystem.dataRetention || '--')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Review Frequency</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatLabel(viewingSystem.reviewFrequency || '--')}
                    </dd>
                  </div>
                </div>
                {viewingSystem.dataTypes && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Data Types Processed</dt>
                    <dd className="text-sm text-foreground mt-0.5">{viewingSystem.dataTypes}</dd>
                  </div>
                )}
                {viewingSystem.trainingData && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Training Data</dt>
                    <dd className="text-sm text-foreground mt-0.5">{viewingSystem.trainingData}</dd>
                  </div>
                )}
                {viewingSystem.limitations && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Known Limitations</dt>
                    <dd className="text-sm text-foreground mt-0.5 p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                      {viewingSystem.limitations}
                    </dd>
                  </div>
                )}
              </div>
            )}

            {viewTab === 'review' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-muted-foreground">Deployment Date</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatDate(viewingSystem.deploymentDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Last Review Date</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatDate(viewingSystem.lastReviewDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Next Review Date</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatDate(viewingSystem.nextReviewDate)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Review Frequency</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatLabel(viewingSystem.reviewFrequency || '--')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Registered</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatDate(viewingSystem.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Last Updated</dt>
                    <dd className="text-sm font-medium text-foreground mt-0.5">
                      {formatDate(viewingSystem.updatedAt)}
                    </dd>
                  </div>
                </div>
                {isReviewOverdue(viewingSystem.nextReviewDate) && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                    <RotateCcw className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                      This system's review is overdue. The next review was due{' '}
                      {formatDate(viewingSystem.nextReviewDate)}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setViewOpen(false);
                  openEditModal(viewingSystem);
                }}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Edit System
              </button>
              <button
                onClick={() => setViewOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete AI System"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                This action cannot be undone
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                You are about to permanently delete{' '}
                <span className="font-semibold">{deletingSystem?.name}</span> from the AI System
                Register.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg transition-colors"
            >
              {saving ? 'Deleting...' : 'Delete System'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
