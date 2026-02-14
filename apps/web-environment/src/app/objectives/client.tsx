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
import {
  Plus,
  Target,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  Calendar,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types & Enums
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { value: 'ENERGY_REDUCTION', label: 'Energy Reduction' },
  { value: 'WATER_REDUCTION', label: 'Water Reduction' },
  { value: 'WASTE_REDUCTION', label: 'Waste Reduction' },
  { value: 'EMISSIONS_REDUCTION', label: 'Emissions Reduction' },
  { value: 'BIODIVERSITY', label: 'Biodiversity' },
  { value: 'POLLUTION_PREVENTION', label: 'Pollution Prevention' },
  { value: 'LEGAL_COMPLIANCE', label: 'Legal Compliance' },
  { value: 'SUPPLY_CHAIN', label: 'Supply Chain' },
  { value: 'CIRCULAR_ECONOMY', label: 'Circular Economy' },
  { value: 'NET_ZERO', label: 'Net Zero' },
  { value: 'NATURE_POSITIVE', label: 'Nature Positive' },
  { value: 'COMMUNITY', label: 'Community' },
  { value: 'OTHER', label: 'Other' },
] as const;

const STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'ON_TRACK', label: 'On Track' },
  { value: 'AT_RISK', label: 'At Risk' },
  { value: 'BEHIND', label: 'Behind' },
  { value: 'ACHIEVED', label: 'Achieved' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'DEFERRED', label: 'Deferred' },
] as const;

const STATUS_COLOURS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  ON_TRACK: 'bg-blue-100 text-blue-800',
  AT_RISK: 'bg-yellow-100 text-yellow-800',
  BEHIND: 'bg-red-100 text-red-800',
  ACHIEVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  DEFERRED: 'bg-purple-100 text-purple-800',
};

const STATUS_BADGE_VARIANT: Record<string, 'secondary' | 'info' | 'warning' | 'danger' | 'success' | 'outline' | 'default'> = {
  NOT_STARTED: 'secondary',
  ON_TRACK: 'info',
  AT_RISK: 'warning',
  BEHIND: 'danger',
  ACHIEVED: 'success',
  CANCELLED: 'secondary',
  DEFERRED: 'outline',
};

const CATEGORY_COLOURS: Record<string, string> = {
  ENERGY_REDUCTION: 'bg-amber-100 text-amber-800',
  WATER_REDUCTION: 'bg-cyan-100 text-cyan-800',
  WASTE_REDUCTION: 'bg-orange-100 text-orange-800',
  EMISSIONS_REDUCTION: 'bg-emerald-100 text-emerald-800',
  BIODIVERSITY: 'bg-lime-100 text-lime-800',
  POLLUTION_PREVENTION: 'bg-rose-100 text-rose-800',
  LEGAL_COMPLIANCE: 'bg-indigo-100 text-indigo-800',
  SUPPLY_CHAIN: 'bg-violet-100 text-violet-800',
  CIRCULAR_ECONOMY: 'bg-teal-100 text-teal-800',
  NET_ZERO: 'bg-green-100 text-green-800',
  NATURE_POSITIVE: 'bg-emerald-100 text-emerald-800',
  COMMUNITY: 'bg-sky-100 text-sky-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const ISO_CLAUSES = ['6.2', '8.1', '9.1', '10.1'] as const;

const SDG_OPTIONS = [
  { value: 'SDG 6', label: 'SDG 6 - Clean Water' },
  { value: 'SDG 7', label: 'SDG 7 - Affordable Energy' },
  { value: 'SDG 11', label: 'SDG 11 - Sustainable Cities' },
  { value: 'SDG 12', label: 'SDG 12 - Responsible Consumption' },
  { value: 'SDG 13', label: 'SDG 13 - Climate Action' },
  { value: 'SDG 14', label: 'SDG 14 - Life Below Water' },
  { value: 'SDG 15', label: 'SDG 15 - Life on Land' },
] as const;

const REVIEW_FREQUENCIES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
] as const;

interface Milestone {
  title: string;
  dueDate: string;
}

interface ObjectiveForm {
  title: string;
  objectiveStatement: string;
  category: string;
  status: string;
  policyCommitment: string;
  iso14001Clause: string;
  linkedAspects: string[];
  sdgAlignment: string[];
  netZeroTarget: boolean;
  netZeroDescription: string;
  kpiDescription: string;
  baselineValue: number;
  baselineDate: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  measurementMethod: string;
  dataSource: string;
  startDate: string;
  targetDate: string;
  department: string;
  owner: string;
  resourcesRequired: string;
  estimatedCost: number;
  actionsRequired: boolean;
  reviewFrequency: string;
  progressNotes: string;
  progressPercent: number;
  milestones: Milestone[];
}

interface Objective extends ObjectiveForm {
  id: string;
  referenceNumber: string;
  createdAt: string;
  updatedAt: string;
  milestones: Array<Milestone & { id?: string; completed?: boolean }>;
}

interface SmartScore {
  criterion: string;
  score: number;
  feedback: string;
}

interface AiAnalysis {
  smartScores: SmartScore[];
  improvedStatement: string;
  suggestedKPIs: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emptyForm: ObjectiveForm = {
  title: '',
  objectiveStatement: '',
  category: 'EMISSIONS_REDUCTION',
  status: 'NOT_STARTED',
  policyCommitment: '',
  iso14001Clause: '',
  linkedAspects: [],
  sdgAlignment: [],
  netZeroTarget: false,
  netZeroDescription: '',
  kpiDescription: '',
  baselineValue: 0,
  baselineDate: '',
  targetValue: 0,
  currentValue: 0,
  unit: '',
  measurementMethod: '',
  dataSource: '',
  startDate: '',
  targetDate: '',
  department: '',
  owner: '',
  resourcesRequired: '',
  estimatedCost: 0,
  actionsRequired: false,
  reviewFrequency: 'QUARTERLY',
  progressNotes: '',
  progressPercent: 0,
  milestones: [],
};

function formatCategory(cat: string): string {
  return cat
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

function daysRemaining(targetDate: string): { text: string; overdue: boolean } {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)} days`, overdue: true };
  }
  if (diffDays === 0) {
    return { text: 'Due today', overdue: false };
  }
  return { text: `${diffDays} days remaining`, overdue: false };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ObjectivesClient() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ObjectiveForm>({ ...emptyForm });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<AiAnalysis | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // -----------------------------------------------------------------------
  // Load data
  // -----------------------------------------------------------------------

  useEffect(() => {
    loadObjectives();
  }, []);

  async function loadObjectives() {
    try {
      const response = await api.get('/objectives').catch(() => ({ data: { data: [] } }));
      setObjectives(response.data.data || []);
    } catch (error) {
      console.error('Failed to load objectives:', error);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------------------------------------
  // Filtered objectives
  // -----------------------------------------------------------------------

  const filtered = useMemo(() => {
    return objectives.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (categoryFilter && o.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = o.title?.toLowerCase().includes(q);
        const matchRef = o.referenceNumber?.toLowerCase().includes(q);
        const matchOwner = o.owner?.toLowerCase().includes(q);
        const matchDept = o.department?.toLowerCase().includes(q);
        if (!matchTitle && !matchRef && !matchOwner && !matchDept) return false;
      }
      return true;
    });
  }, [objectives, statusFilter, categoryFilter, searchQuery]);

  // -----------------------------------------------------------------------
  // Metrics
  // -----------------------------------------------------------------------

  const totalCount = objectives.length;
  const achievedCount = objectives.filter((o) => o.status === 'ACHIEVED').length;
  const onTrackCount = objectives.filter((o) => o.status === 'ON_TRACK').length;
  const atRiskCount = objectives.filter(
    (o) => o.status === 'AT_RISK' || o.status === 'BEHIND'
  ).length;

  // -----------------------------------------------------------------------
  // Form helpers
  // -----------------------------------------------------------------------

  function updateForm<K extends keyof ObjectiveForm>(key: K, value: ObjectiveForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addMilestone() {
    setForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', dueDate: '' }],
    }));
  }

  function updateMilestone(index: number, field: keyof Milestone, value: string) {
    setForm((prev) => {
      const updated = [...prev.milestones];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, milestones: updated };
    });
  }

  function removeMilestone(index: number) {
    setForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  }

  function toggleSdg(sdg: string) {
    setForm((prev) => {
      const current = prev.sdgAlignment;
      const next = current.includes(sdg)
        ? current.filter((s) => s !== sdg)
        : [...current, sdg];
      return { ...prev, sdgAlignment: next };
    });
  }

  function openNewModal() {
    setForm({ ...emptyForm });
    setAiGenerated(null);
    setShowModal(true);
  }

  // -----------------------------------------------------------------------
  // Submit
  // -----------------------------------------------------------------------

  async function handleSubmit() {
    if (!form.title || !form.objectiveStatement || !form.owner || !form.targetDate) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        baselineValue: Number(form.baselineValue) || 0,
        targetValue: Number(form.targetValue) || 0,
        currentValue: Number(form.currentValue) || 0,
        estimatedCost: Number(form.estimatedCost) || 0,
        progressPercent: Number(form.progressPercent) || 0,
        baselineDate: form.baselineDate ? new Date(form.baselineDate).toISOString() : null,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        targetDate: new Date(form.targetDate).toISOString(),
        milestones: form.milestones
          .filter((m) => m.title && m.dueDate)
          .map((m) => ({
            title: m.title,
            dueDate: new Date(m.dueDate).toISOString(),
          })),
      };
      await api.post('/objectives', payload);
      setShowModal(false);
      setForm({ ...emptyForm });
      setAiGenerated(null);
      await loadObjectives();
    } catch (error) {
      console.error('Failed to create objective:', error);
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------------------------------------------------
  // AI SMART Analysis
  // -----------------------------------------------------------------------

  async function runAiAnalysis() {
    setAiLoading(true);
    setAiGenerated(null);
    try {
      const response = await api.post('/objectives/ai-analyse', {
        title: form.title,
        objectiveStatement: form.objectiveStatement,
        category: form.category,
        kpiDescription: form.kpiDescription,
        targetValue: form.targetValue,
        unit: form.unit,
        targetDate: form.targetDate,
        owner: form.owner,
        department: form.department,
      });
      const data = response.data.data;
      setAiGenerated(data);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  function applySuggestions() {
    if (!aiGenerated) return;
    if (aiGenerated.improvedStatement) {
      updateForm('objectiveStatement', aiGenerated.improvedStatement);
    }
    if (aiGenerated.suggestedKPIs && aiGenerated.suggestedKPIs.length > 0) {
      updateForm('kpiDescription', aiGenerated.suggestedKPIs.join('; '));
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Environmental Objectives
            </h1>
            <p className="text-gray-500 mt-1">
              ISO 14001 Clause 6.2 -- Track and manage environmental targets
            </p>
          </div>
          <Button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Objective
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold">{totalCount}</p>
                <p className="text-sm text-gray-500">Total Objectives</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold text-green-600">{achievedCount}</p>
                <p className="text-sm text-gray-500">Achieved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-3xl font-bold text-blue-600">{onTrackCount}</p>
                <p className="text-sm text-gray-500">On Track</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <p className="text-3xl font-bold text-red-600">{atRiskCount}</p>
                <p className="text-sm text-gray-500">At Risk / Behind</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, reference, owner or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-48"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-56"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Objectives List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Environmental Objectives
              {filtered.length !== objectives.length && (
                <span className="text-sm font-normal text-gray-400 ml-2">
                  Showing {filtered.length} of {objectives.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <span className="ml-3 text-gray-500">Loading objectives...</span>
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((obj) => {
                  const progress = obj.progressPercent ?? 0;
                  const countdown = obj.targetDate
                    ? daysRemaining(obj.targetDate)
                    : null;
                  return (
                    <div
                      key={obj.id}
                      className="p-5 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-400">
                              {obj.referenceNumber}
                            </span>
                            <Badge variant={STATUS_BADGE_VARIANT[obj.status] || 'secondary'}>
                              {obj.status.replace(/_/g, ' ')}
                            </Badge>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                CATEGORY_COLOURS[obj.category] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {formatCategory(obj.category)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {obj.title}
                          </h3>
                          {obj.objectiveStatement && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {obj.objectiveStatement}
                            </p>
                          )}
                        </div>

                        {/* Progress circle */}
                        <div className="ml-4 flex-shrink-0 flex flex-col items-center">
                          <div className="relative w-16 h-16">
                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="6"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke={
                                  progress >= 100
                                    ? '#16a34a'
                                    : progress >= 70
                                    ? '#2563eb'
                                    : progress >= 40
                                    ? '#eab308'
                                    : '#ef4444'
                                }
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${(progress / 100) * 175.9} 175.9`}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>

                      {/* Footer info */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
                        {obj.targetValue != null && (
                          <span className="font-medium">
                            KPI: {obj.currentValue ?? 0} / {obj.targetValue}{' '}
                            {obj.unit || ''}
                          </span>
                        )}
                        {countdown && (
                          <span
                            className={
                              countdown.overdue
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-500'
                            }
                          >
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {countdown.text}
                          </span>
                        )}
                        {obj.owner && (
                          <span>
                            Owner: <span className="font-medium">{obj.owner}</span>
                          </span>
                        )}
                        {obj.department && (
                          <span>
                            Dept: <span className="font-medium">{obj.department}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-500">
                  No environmental objectives found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click Add Objective to set your first environmental target
                </p>
                <Button
                  onClick={openNewModal}
                  variant="outline"
                  className="mt-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Objective
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ----------------------------------------------------------------- */}
        {/* Modal -- Add Environmental Objective                              */}
        {/* ----------------------------------------------------------------- */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add Environmental Objective"
          size="full"
        >
          <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-8">
            {/* ============================================ */}
            {/* Section A - Objective Definition              */}
            {/* ============================================ */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-200 pb-2">
                A -- Objective Definition (SMART Framework)
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
                    placeholder="e.g. Reduce Scope 1 GHG emissions by 25%"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="objectiveStatement">
                    Objective Statement <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="objectiveStatement"
                    rows={3}
                    value={form.objectiveStatement}
                    onChange={(e) =>
                      updateForm('objectiveStatement', e.target.value)
                    }
                    placeholder="Describe the objective in SMART terms..."
                  />
                  <p className="text-xs text-gray-400 mt-1 italic">
                    Guidance: &quot;By [when], [who] will [action] to achieve
                    [measurable result] as measured by [KPI]&quot;
                  </p>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={form.category}
                    onChange={(e) => updateForm('category', e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={form.status}
                    onChange={(e) => updateForm('status', e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </section>

            {/* ============================================ */}
            {/* Section B - Strategic Linkage                 */}
            {/* ============================================ */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-200 pb-2">
                B -- Strategic Linkage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policyCommitment">Policy Commitment</Label>
                  <Input
                    id="policyCommitment"
                    value={form.policyCommitment}
                    onChange={(e) =>
                      updateForm('policyCommitment', e.target.value)
                    }
                    placeholder="Link to relevant policy commitment"
                  />
                </div>
                <div>
                  <Label htmlFor="iso14001Clause">ISO 14001 Clause</Label>
                  <Select
                    id="iso14001Clause"
                    value={form.iso14001Clause}
                    onChange={(e) =>
                      updateForm('iso14001Clause', e.target.value)
                    }
                  >
                    <option value="">Select clause</option>
                    {ISO_CLAUSES.map((c) => (
                      <option key={c} value={c}>
                        Clause {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>SDG Alignment</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {SDG_OPTIONS.map((sdg) => (
                      <label
                        key={sdg.value}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.sdgAlignment.includes(sdg.value)}
                          onChange={() => toggleSdg(sdg.value)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        {sdg.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.netZeroTarget}
                      onChange={(e) =>
                        updateForm('netZeroTarget', e.target.checked)
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="font-medium">Net Zero Target</span>
                  </label>
                  {form.netZeroTarget && (
                    <div className="mt-3">
                      <Label htmlFor="netZeroDescription">
                        Net Zero Description
                      </Label>
                      <Textarea
                        id="netZeroDescription"
                        rows={2}
                        value={form.netZeroDescription}
                        onChange={(e) =>
                          updateForm('netZeroDescription', e.target.value)
                        }
                        placeholder="Describe the net zero pathway..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ============================================ */}
            {/* Section C - Measurement (KPI)                */}
            {/* ============================================ */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-200 pb-2">
                C -- Measurement (KPI)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="kpiDescription">
                    KPI Description <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kpiDescription"
                    value={form.kpiDescription}
                    onChange={(e) =>
                      updateForm('kpiDescription', e.target.value)
                    }
                    placeholder="e.g. Tonnes of CO2e emitted per annum"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={form.unit}
                    onChange={(e) => updateForm('unit', e.target.value)}
                    placeholder="e.g. tCO2e, kWh, m3"
                  />
                </div>
                <div>
                  <Label htmlFor="baselineValue">Baseline Value</Label>
                  <Input
                    id="baselineValue"
                    type="number"
                    value={form.baselineValue || ''}
                    onChange={(e) =>
                      updateForm('baselineValue', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="baselineDate">Baseline Date</Label>
                  <Input
                    id="baselineDate"
                    type="date"
                    value={form.baselineDate}
                    onChange={(e) =>
                      updateForm('baselineDate', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={form.targetValue || ''}
                    onChange={(e) =>
                      updateForm('targetValue', Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input
                    id="currentValue"
                    type="number"
                    value={form.currentValue || ''}
                    onChange={(e) =>
                      updateForm('currentValue', Number(e.target.value))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="measurementMethod">Measurement Method</Label>
                  <Textarea
                    id="measurementMethod"
                    rows={2}
                    value={form.measurementMethod}
                    onChange={(e) =>
                      updateForm('measurementMethod', e.target.value)
                    }
                    placeholder="How will this KPI be measured?"
                  />
                </div>
                <div>
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Input
                    id="dataSource"
                    value={form.dataSource}
                    onChange={(e) =>
                      updateForm('dataSource', e.target.value)
                    }
                    placeholder="e.g. Energy bills, meters"
                  />
                </div>
              </div>
            </section>

            {/* ============================================ */}
            {/* Section D - Planning                          */}
            {/* ============================================ */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-200 pb-2">
                D -- Planning
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      updateForm('startDate', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">
                    Target Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={form.targetDate}
                    onChange={(e) =>
                      updateForm('targetDate', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reviewFrequency">Review Frequency</Label>
                  <Select
                    id="reviewFrequency"
                    value={form.reviewFrequency}
                    onChange={(e) =>
                      updateForm('reviewFrequency', e.target.value)
                    }
                  >
                    {REVIEW_FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={form.department}
                    onChange={(e) =>
                      updateForm('department', e.target.value)
                    }
                    placeholder="e.g. Operations"
                  />
                </div>
                <div>
                  <Label htmlFor="owner">
                    Owner <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="owner"
                    value={form.owner}
                    onChange={(e) => updateForm('owner', e.target.value)}
                    placeholder="Responsible person"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedCost">Estimated Cost</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={form.estimatedCost || ''}
                    onChange={(e) =>
                      updateForm('estimatedCost', Number(e.target.value))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-3">
                  <Label htmlFor="resourcesRequired">Resources Required</Label>
                  <Textarea
                    id="resourcesRequired"
                    rows={2}
                    value={form.resourcesRequired}
                    onChange={(e) =>
                      updateForm('resourcesRequired', e.target.value)
                    }
                    placeholder="Budget, personnel, equipment..."
                  />
                </div>
              </div>
            </section>

            {/* ============================================ */}
            {/* Section E - Milestones                        */}
            {/* ============================================ */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-200 pb-2">
                E -- Milestones
              </h3>
              {form.milestones.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-50 text-left">
                        <th className="px-4 py-2 font-medium text-green-800">
                          #
                        </th>
                        <th className="px-4 py-2 font-medium text-green-800">
                          Milestone Title
                        </th>
                        <th className="px-4 py-2 font-medium text-green-800">
                          Due Date
                        </th>
                        <th className="px-4 py-2 font-medium text-green-800 w-12" />
                      </tr>
                    </thead>
                    <tbody>
                      {form.milestones.map((m, idx) => (
                        <tr
                          key={idx}
                          className={
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }
                        >
                          <td className="px-4 py-2 text-gray-500">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              value={m.title}
                              onChange={(e) =>
                                updateMilestone(idx, 'title', e.target.value)
                              }
                              placeholder="Milestone title"
                              className="h-8"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="date"
                              value={m.dueDate}
                              onChange={(e) =>
                                updateMilestone(idx, 'dueDate', e.target.value)
                              }
                              className="h-8"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={() => removeMilestone(idx)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                              title="Remove milestone"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-2">
                  No milestones added yet.
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                className="mt-3"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Milestone
              </Button>
            </section>

            {/* ============================================ */}
            {/* Section F - AI SMART Analysis                 */}
            {/* ============================================ */}
            <section>
              <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-4 border-b border-green-200 pb-2">
                F -- AI SMART Analysis
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={runAiAnalysis}
                disabled={aiLoading || !form.title || !form.objectiveStatement}
                className="flex items-center gap-2"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-amber-500" />
                )}
                {aiLoading ? 'Analysing...' : 'Analyse with AI'}
              </Button>

              {aiGenerated && (
                <div className="mt-4 space-y-4">
                  <AIDisclosure variant="inline" provider="claude" analysisType="Objective Analysis" confidence={0.85} />
                  {/* SMART Scorecard */}
                  <div className="border border-green-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-green-50">
                          <th className="px-4 py-2 text-left font-medium text-green-800">
                            Criterion
                          </th>
                          <th className="px-4 py-2 text-center font-medium text-green-800 w-24">
                            Score
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-green-800">
                            Feedback
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(aiGenerated.smartScores || []).map((row, i) => (
                          <tr
                            key={row.criterion}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-4 py-2 font-medium">
                              {row.criterion}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span
                                className={`inline-block w-8 h-8 leading-8 rounded-full text-white text-xs font-bold ${
                                  row.score >= 4
                                    ? 'bg-green-500'
                                    : row.score >= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                              >
                                {row.score}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {row.feedback}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Improved statement */}
                  {aiGenerated.improvedStatement && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Improved Statement Suggestion
                      </p>
                      <p className="text-sm text-green-700">
                        {aiGenerated.improvedStatement}
                      </p>
                    </div>
                  )}

                  {/* Suggested KPIs */}
                  {aiGenerated.suggestedKPIs &&
                    aiGenerated.suggestedKPIs.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Suggested KPIs
                        </p>
                        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                          {aiGenerated.suggestedKPIs.map((kpi, idx) => (
                            <li key={idx}>{kpi}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={applySuggestions}
                    className="flex items-center gap-2 text-green-700 border-green-300 hover:bg-green-50"
                  >
                    <Sparkles className="h-3 w-3" />
                    Apply Suggestions
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Modal Footer */}
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !form.title ||
                !form.objectiveStatement ||
                !form.owner ||
                !form.targetDate
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Objective
                </>
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
