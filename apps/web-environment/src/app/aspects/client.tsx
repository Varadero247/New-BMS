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
} from '@ims/ui';
import {
  Plus,
  Leaf,
  Loader2,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Aspect {
  id: string;
  referenceNumber: string;
  activityProcess: string;
  activityCategory: string;
  department: string;
  location?: string;
  lifecyclePhases: string[];
  operatingCondition: string;
  description?: string;
  aspect: string;
  impact: string;
  impactDirection: string;
  environmentalMedia: string[];
  scaleOfImpact: string;
  scoreSeverity: number;
  scoreProbability: number;
  scoreDuration: number;
  scoreExtent: number;
  scoreReversibility: number;
  scoreRegulatory: number;
  scoreStakeholder: number;
  significanceScore: number;
  isSignificant: boolean;
  existingControls?: string;
  controlHierarchy?: string;
  residualScore?: number;
  targetScore?: number;
  legalReferences?: string;
  permitReference?: string;
  applicableStandards?: string;
  responsiblePerson?: string;
  reviewFrequency?: string;
  nextReviewDate?: string;
  status: string;
  aiSignificanceJustification?: string;
  aiControlRecommendations?: string;
  aiLegalObligations?: string;
  aiBenchmarkComparison?: string;
  aiImprovementOpportunities?: string;
  aiClimateRelevance?: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AspectForm {
  activityProcess: string;
  activityCategory: string;
  department: string;
  location: string;
  lifecyclePhases: string[];
  operatingCondition: string;
  description: string;
  aspect: string;
  impact: string;
  impactDirection: string;
  environmentalMedia: string[];
  scaleOfImpact: string;
  scoreSeverity: number;
  scoreProbability: number;
  scoreDuration: number;
  scoreExtent: number;
  scoreReversibility: number;
  scoreRegulatory: number;
  scoreStakeholder: number;
  existingControls: string;
  controlHierarchy: string;
  residualScore: number;
  targetScore: number;
  legalReferences: string;
  permitReference: string;
  applicableStandards: string;
  responsiblePerson: string;
  reviewFrequency: string;
  nextReviewDate: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const emptyForm: AspectForm = {
  activityProcess: '',
  activityCategory: 'ENERGY_USE',
  department: '',
  location: '',
  lifecyclePhases: [],
  operatingCondition: 'NORMAL',
  description: '',
  aspect: '',
  impact: '',
  impactDirection: 'ADVERSE',
  environmentalMedia: [],
  scaleOfImpact: 'LOCAL',
  scoreSeverity: 1,
  scoreProbability: 1,
  scoreDuration: 1,
  scoreExtent: 1,
  scoreReversibility: 1,
  scoreRegulatory: 1,
  scoreStakeholder: 1,
  existingControls: '',
  controlHierarchy: '',
  residualScore: 0,
  targetScore: 0,
  legalReferences: '',
  permitReference: '',
  applicableStandards: '',
  responsiblePerson: '',
  reviewFrequency: '',
  nextReviewDate: '',
  status: 'ACTIVE',
};

const ACTIVITY_CATEGORIES = [
  { value: 'ENERGY_USE', label: 'Energy Use' },
  { value: 'WATER_USE', label: 'Water Use' },
  { value: 'WASTE_GENERATION', label: 'Waste Generation' },
  { value: 'EMISSIONS_TO_AIR', label: 'Emissions to Air' },
  { value: 'DISCHARGES_TO_WATER', label: 'Discharges to Water' },
  { value: 'LAND_CONTAMINATION', label: 'Land Contamination' },
  { value: 'RESOURCE_USE', label: 'Resource Use' },
  { value: 'NOISE_VIBRATION', label: 'Noise & Vibration' },
  { value: 'BIODIVERSITY', label: 'Biodiversity' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'PROCUREMENT', label: 'Procurement' },
  { value: 'PRODUCT_DESIGN', label: 'Product Design' },
  { value: 'OTHER', label: 'Other' },
];

const LIFECYCLE_PHASES = [
  'RAW_MATERIALS',
  'DESIGN',
  'PRODUCTION',
  'TRANSPORT',
  'USE',
  'END_OF_LIFE',
  'DISPOSAL',
];

const ENVIRONMENTAL_MEDIA = [
  { value: 'AIR', label: 'Air' },
  { value: 'WATER', label: 'Water' },
  { value: 'SOIL', label: 'Soil' },
  { value: 'BIODIVERSITY', label: 'Biodiversity' },
  { value: 'HUMAN_HEALTH', label: 'Human Health' },
  { value: 'CLIMATE', label: 'Climate' },
  { value: 'NOISE', label: 'Noise' },
  { value: 'OTHER', label: 'Other' },
];

const SCORE_DESCRIPTORS = {
  scoreSeverity: {
    label: 'Severity',
    tooltip: '1 = Negligible, 2 = Minor, 3 = Moderate, 4 = Major, 5 = Catastrophic',
  },
  scoreProbability: {
    label: 'Probability',
    tooltip: '1 = Rare, 2 = Unlikely, 3 = Possible, 4 = Likely, 5 = Almost Certain',
  },
  scoreDuration: {
    label: 'Duration',
    tooltip: '1 = Momentary, 2 = Short-term, 3 = Medium-term, 4 = Long-term, 5 = Permanent',
  },
  scoreExtent: {
    label: 'Extent / Scale',
    tooltip: '1 = On-site only, 2 = Immediate vicinity, 3 = Local area, 4 = Regional, 5 = Transboundary',
  },
  scoreReversibility: {
    label: 'Reversibility',
    tooltip: '1 = Fully reversible, 2 = Largely reversible, 3 = Partially reversible, 4 = Mostly irreversible, 5 = Irreversible',
  },
  scoreRegulatory: {
    label: 'Regulatory',
    tooltip: '1 = No regulation, 2 = Guidance only, 3 = Consent / permit, 4 = Legal limit, 5 = Prosecutable offence',
  },
  scoreStakeholder: {
    label: 'Stakeholder',
    tooltip: '1 = No concern, 2 = Minor concern, 3 = Moderate concern, 4 = High concern, 5 = Major public concern',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calculateSignificance(form: AspectForm): number {
  return Math.round(
    form.scoreSeverity * 1.5 +
      form.scoreProbability * 1.5 +
      form.scoreDuration +
      form.scoreExtent +
      form.scoreReversibility +
      form.scoreRegulatory +
      form.scoreStakeholder
  );
}

function getSignificanceLevel(score: number): 'SIGNIFICANT' | 'REVIEW' | 'NOT_SIGNIFICANT' {
  if (score >= 15) return 'SIGNIFICANT';
  if (score >= 8) return 'REVIEW';
  return 'NOT_SIGNIFICANT';
}

function getSignificanceBadge(score: number) {
  const level = getSignificanceLevel(score);
  if (level === 'SIGNIFICANT') {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">Significant</Badge>
    );
  }
  if (level === 'REVIEW') {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200">Review</Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-800 border-green-200">Not Significant</Badge>
  );
}

function getScoreColor(value: number): string {
  if (value <= 1) return 'bg-green-500';
  if (value <= 2) return 'bg-lime-500';
  if (value <= 3) return 'bg-amber-500';
  if (value <= 4) return 'bg-orange-500';
  return 'bg-red-500';
}

function formatCategoryLabel(cat: string): string {
  return cat
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AspectsClient() {
  // Data
  const [aspects, setAspects] = useState<Aspect[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<AspectForm>(emptyForm);

  // AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiResults, setAiResults] = useState<Record<string, string>>({});
  const [aiExpanded, setAiExpanded] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [significanceFilter, setSignificanceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ------------------------------------------
  // Data loading
  // ------------------------------------------

  const loadAspects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/aspects');
      setAspects(response.data.data || []);
    } catch (error) {
      console.error('Failed to load aspects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAspects();
  }, [loadAspects]);

  // ------------------------------------------
  // Form handlers
  // ------------------------------------------

  function updateForm(field: keyof AspectForm, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArrayValue(field: 'lifecyclePhases' | 'environmentalMedia', value: string) {
    setForm((prev) => {
      const arr = prev[field] as string[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      const significanceScore = calculateSignificance(form);
      const isSignificant = significanceScore >= 15;
      await api.post('/aspects', {
        ...form,
        significanceScore,
        isSignificant,
        residualScore: form.residualScore || null,
        targetScore: form.targetScore || null,
        nextReviewDate: form.nextReviewDate || null,
        ...(aiGenerated
          ? {
              aiSignificanceJustification: aiResults.aiSignificanceJustification || null,
              aiControlRecommendations: aiResults.aiControlRecommendations || null,
              aiLegalObligations: aiResults.aiLegalObligations || null,
              aiBenchmarkComparison: aiResults.aiBenchmarkComparison || null,
              aiImprovementOpportunities: aiResults.aiImprovementOpportunities || null,
              aiClimateRelevance: aiResults.aiClimateRelevance || null,
              aiGenerated: true,
            }
          : {}),
      });
      setShowModal(false);
      setForm(emptyForm);
      setAiGenerated(false);
      setAiResults({});
      setAiExpanded(false);
      loadAspects();
    } catch (error) {
      console.error('Failed to save aspect:', error);
    } finally {
      setSubmitting(false);
    }
  }

  // ------------------------------------------
  // AI Analysis
  // ------------------------------------------

  async function handleAiAnalysis() {
    try {
      setAiLoading(true);
      const response = await api.post('/aspects/ai-analyse', {
        activityProcess: form.activityProcess,
        aspect: form.aspect,
        impact: form.impact,
        scoreSeverity: form.scoreSeverity,
        scoreProbability: form.scoreProbability,
        scoreDuration: form.scoreDuration,
        scoreExtent: form.scoreExtent,
        scoreReversibility: form.scoreReversibility,
        scoreRegulatory: form.scoreRegulatory,
        scoreStakeholder: form.scoreStakeholder,
      });
      const data = response.data.data || response.data;
      setAiResults({
        aiSignificanceJustification: data.aiSignificanceJustification || '',
        aiControlRecommendations: data.aiControlRecommendations || '',
        aiLegalObligations: data.aiLegalObligations || '',
        aiBenchmarkComparison: data.aiBenchmarkComparison || '',
        aiImprovementOpportunities: data.aiImprovementOpportunities || '',
        aiClimateRelevance: data.aiClimateRelevance || '',
      });
      setAiGenerated(true);
      setAiExpanded(true);
    } catch {
      // AI endpoint may not exist yet -- silently handle
      setAiGenerated(false);
    } finally {
      setAiLoading(false);
    }
  }

  // ------------------------------------------
  // Derived data
  // ------------------------------------------

  const significanceScore = calculateSignificance(form);

  const filteredAspects = aspects.filter((a) => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        a.activityProcess?.toLowerCase().includes(q) ||
        a.aspect?.toLowerCase().includes(q) ||
        a.impact?.toLowerCase().includes(q) ||
        a.referenceNumber?.toLowerCase().includes(q) ||
        a.department?.toLowerCase().includes(q);
      if (!matches) return false;
    }
    // Status
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    // Significance
    if (significanceFilter !== 'ALL') {
      const level = getSignificanceLevel(a.significanceScore);
      if (significanceFilter !== level) return false;
    }
    return true;
  });

  const totalAspects = aspects.length;
  const significantCount = aspects.filter((a) => a.significanceScore >= 15).length;
  const controlledCount = aspects.filter((a) => a.status === 'CONTROLLED').length;
  const actionCount = aspects.filter(
    (a) => a.significanceScore >= 15 && a.status !== 'CONTROLLED' && a.status !== 'CLOSED'
  ).length;

  // ------------------------------------------
  // Render
  // ------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Environmental Aspects</h1>
            <p className="text-gray-500 mt-1">
              ISO 14001 Clause 6.1.2 -- Aspects and Impacts Register
            </p>
          </div>
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => {
              setForm(emptyForm);
              setAiGenerated(false);
              setAiResults({});
              setAiExpanded(false);
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Aspect
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Aspects</p>
                  <p className="text-2xl font-bold">{totalAspects}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Significant</p>
                  <p className="text-2xl font-bold text-red-600">{significantCount}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Leaf className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Under Control</p>
                  <p className="text-2xl font-bold text-green-600">{controlledCount}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Requiring Action</p>
                  <p className="text-2xl font-bold text-amber-600">{actionCount}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <Leaf className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search aspects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="CONTROLLED">Controlled</option>
            <option value="CLOSED">Closed</option>
          </Select>
          <Select
            value={significanceFilter}
            onChange={(e) => setSignificanceFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="ALL">All Significance</option>
            <option value="SIGNIFICANT">Significant</option>
            <option value="REVIEW">Review</option>
            <option value="NOT_SIGNIFICANT">Not Significant</option>
          </Select>
        </div>

        {/* Aspects List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : filteredAspects.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No environmental aspects found
                </h3>
                <p className="text-gray-500">
                  Click Add Aspect to create your first aspect assessment
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAspects.map((a) => {
              const level = getSignificanceLevel(a.significanceScore);
              return (
                <Card
                  key={a.id}
                  className="hover:border-green-300 transition-colors cursor-pointer"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Top row: ref, badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-gray-500">
                            {a.referenceNumber}
                          </span>
                          {getSignificanceBadge(a.significanceScore)}
                          <Badge
                            className={
                              a.impactDirection === 'BENEFICIAL'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : 'bg-gray-100 text-gray-800 border-gray-200'
                            }
                          >
                            {a.impactDirection === 'BENEFICIAL' ? 'Beneficial' : 'Adverse'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              a.status === 'ACTIVE'
                                ? 'border-green-300 text-green-700'
                                : a.status === 'UNDER_REVIEW'
                                  ? 'border-amber-300 text-amber-700'
                                  : a.status === 'CONTROLLED'
                                    ? 'border-blue-300 text-blue-700'
                                    : 'border-gray-300 text-gray-700'
                            }
                          >
                            {formatCategoryLabel(a.status)}
                          </Badge>
                        </div>

                        {/* Activity / Process name */}
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {a.activityProcess}
                        </h3>

                        {/* Aspect & Impact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">Aspect: </span>
                            <span className="text-gray-700">{a.aspect}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Impact: </span>
                            <span className="text-gray-700">{a.impact}</span>
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                          <span className="text-gray-400">Scores:</span>
                          {[
                            { label: 'Sev', val: a.scoreSeverity },
                            { label: 'Prob', val: a.scoreProbability },
                            { label: 'Dur', val: a.scoreDuration },
                            { label: 'Ext', val: a.scoreExtent },
                            { label: 'Rev', val: a.scoreReversibility },
                            { label: 'Reg', val: a.scoreRegulatory },
                            { label: 'Sth', val: a.scoreStakeholder },
                          ].map((s) => (
                            <span
                              key={s.label}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600"
                            >
                              {s.label}: {s.val}
                            </span>
                          ))}
                          <span className="font-semibold text-gray-700">
                            Total: {a.significanceScore}
                          </span>
                        </div>

                        {/* Lifecycle phase tags */}
                        {a.lifecyclePhases && a.lifecyclePhases.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {a.lifecyclePhases.map((phase) => (
                              <span
                                key={phase}
                                className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200"
                              >
                                {formatCategoryLabel(phase)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Large score display */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <span
                          className={`text-3xl font-bold ${
                            level === 'SIGNIFICANT'
                              ? 'text-red-500'
                              : level === 'REVIEW'
                                ? 'text-amber-500'
                                : 'text-green-500'
                          }`}
                        >
                          {a.significanceScore}
                        </span>
                        <span className="text-xs text-gray-400">Score</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL -- Add Environmental Aspect                                 */}
        {/* ================================================================= */}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add Environmental Aspect"
          size="full"
        >
          <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-8">
            {/* ----------------------------------------------------------- */}
            {/* Section A -- Identification                                  */}
            {/* ----------------------------------------------------------- */}
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pl-3 border-l-4 border-green-500">
                A. Identification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activityProcess">Activity / Process *</Label>
                  <Input
                    id="activityProcess"
                    placeholder="e.g. Boiler operation"
                    value={form.activityProcess}
                    onChange={(e) => updateForm('activityProcess', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="activityCategory">Activity Category *</Label>
                  <Select
                    id="activityCategory"
                    value={form.activityCategory}
                    onChange={(e) => updateForm('activityCategory', e.target.value)}
                  >
                    {ACTIVITY_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    placeholder="e.g. Facilities"
                    value={form.department}
                    onChange={(e) => updateForm('department', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Building A, Plant Room"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Lifecycle Phases</Label>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {LIFECYCLE_PHASES.map((phase) => (
                      <label key={phase} className="inline-flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={form.lifecyclePhases.includes(phase)}
                          onChange={() => toggleArrayValue('lifecyclePhases', phase)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        {formatCategoryLabel(phase)}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="operatingCondition">Operating Condition *</Label>
                  <Select
                    id="operatingCondition"
                    value={form.operatingCondition}
                    onChange={(e) => updateForm('operatingCondition', e.target.value)}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="ABNORMAL">Abnormal</option>
                    <option value="EMERGENCY">Emergency</option>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the activity or process in more detail..."
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* ----------------------------------------------------------- */}
            {/* Section B -- Aspect & Impact                                 */}
            {/* ----------------------------------------------------------- */}
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pl-3 border-l-4 border-green-500">
                B. Aspect & Impact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aspect">Environmental Aspect *</Label>
                  <Input
                    id="aspect"
                    placeholder="e.g. CO2 emissions from combustion"
                    value={form.aspect}
                    onChange={(e) => updateForm('aspect', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="impact">Environmental Impact *</Label>
                  <Input
                    id="impact"
                    placeholder="e.g. Contribution to climate change"
                    value={form.impact}
                    onChange={(e) => updateForm('impact', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="impactDirection">Impact Direction *</Label>
                  <Select
                    id="impactDirection"
                    value={form.impactDirection}
                    onChange={(e) => updateForm('impactDirection', e.target.value)}
                  >
                    <option value="ADVERSE">Adverse</option>
                    <option value="BENEFICIAL">Beneficial</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scaleOfImpact">Scale of Impact *</Label>
                  <Select
                    id="scaleOfImpact"
                    value={form.scaleOfImpact}
                    onChange={(e) => updateForm('scaleOfImpact', e.target.value)}
                  >
                    <option value="LOCAL">Local</option>
                    <option value="REGIONAL">Regional</option>
                    <option value="NATIONAL">National</option>
                    <option value="GLOBAL">Global</option>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Environmental Media Affected</Label>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {ENVIRONMENTAL_MEDIA.map((media) => (
                      <label
                        key={media.value}
                        className="inline-flex items-center gap-1.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={form.environmentalMedia.includes(media.value)}
                          onChange={() => toggleArrayValue('environmentalMedia', media.value)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        {media.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ----------------------------------------------------------- */}
            {/* Section C -- Significance Scoring                            */}
            {/* ----------------------------------------------------------- */}
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pl-3 border-l-4 border-green-500">
                C. Significance Scoring
              </h3>
              <div className="space-y-5">
                {(
                  Object.keys(SCORE_DESCRIPTORS) as Array<keyof typeof SCORE_DESCRIPTORS>
                ).map((key) => {
                  const desc = SCORE_DESCRIPTORS[key];
                  const value = form[key as keyof AspectForm] as number;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <Label>
                          {desc.label}{' '}
                          {key === 'scoreSeverity' || key === 'scoreProbability' ? (
                            <span className="text-xs text-gray-400">(x1.5 weighting)</span>
                          ) : null}
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">{value}</span>
                          <span
                            className={`inline-block h-3 w-3 rounded-full ${getScoreColor(value)}`}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-1.5">{desc.tooltip}</p>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={value}
                        onChange={(e) =>
                          updateForm(key as keyof AspectForm, parseInt(e.target.value, 10))
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-green-600 bg-gray-200"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>
                  );
                })}

                {/* Calculated score display */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Calculated Significance Score</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      (Severity x 1.5) + (Probability x 1.5) + Duration + Extent + Reversibility
                      + Regulatory + Stakeholder
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-3xl font-bold ${
                        significanceScore >= 15
                          ? 'text-red-600'
                          : significanceScore >= 8
                            ? 'text-amber-600'
                            : 'text-green-600'
                      }`}
                    >
                      {significanceScore}
                    </span>
                    {getSignificanceBadge(significanceScore)}
                  </div>
                </div>
              </div>
            </section>

            {/* ----------------------------------------------------------- */}
            {/* Section D -- Controls                                        */}
            {/* ----------------------------------------------------------- */}
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pl-3 border-l-4 border-green-500">
                D. Controls
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="existingControls">Existing Controls</Label>
                  <Textarea
                    id="existingControls"
                    placeholder="Describe current control measures in place..."
                    value={form.existingControls}
                    onChange={(e) => updateForm('existingControls', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="controlHierarchy">Control Hierarchy</Label>
                  <Select
                    id="controlHierarchy"
                    value={form.controlHierarchy}
                    onChange={(e) => updateForm('controlHierarchy', e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="ELIMINATION">Elimination</option>
                    <option value="SUBSTITUTION">Substitution</option>
                    <option value="ENGINEERING">Engineering Controls</option>
                    <option value="ADMINISTRATIVE">Administrative Controls</option>
                    <option value="MONITORING">Monitoring</option>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="residualScore">Residual Score</Label>
                    <Input
                      id="residualScore"
                      type="number"
                      min={0}
                      value={form.residualScore || ''}
                      onChange={(e) =>
                        updateForm('residualScore', e.target.value ? parseInt(e.target.value, 10) : 0)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetScore">Target Score</Label>
                    <Input
                      id="targetScore"
                      type="number"
                      min={0}
                      value={form.targetScore || ''}
                      onChange={(e) =>
                        updateForm('targetScore', e.target.value ? parseInt(e.target.value, 10) : 0)
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="legalReferences">Legal References</Label>
                  <Input
                    id="legalReferences"
                    placeholder="e.g. Environmental Protection Act 1990"
                    value={form.legalReferences}
                    onChange={(e) => updateForm('legalReferences', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="permitReference">Permit Reference</Label>
                  <Input
                    id="permitReference"
                    placeholder="e.g. EPR/AB1234CD"
                    value={form.permitReference}
                    onChange={(e) => updateForm('permitReference', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="applicableStandards">Applicable Standards</Label>
                  <Input
                    id="applicableStandards"
                    placeholder="e.g. ISO 14001, ISO 50001"
                    value={form.applicableStandards}
                    onChange={(e) => updateForm('applicableStandards', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* ----------------------------------------------------------- */}
            {/* Section E -- Ownership                                       */}
            {/* ----------------------------------------------------------- */}
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pl-3 border-l-4 border-green-500">
                E. Ownership
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsiblePerson">Responsible Person</Label>
                  <Input
                    id="responsiblePerson"
                    placeholder="e.g. John Smith"
                    value={form.responsiblePerson}
                    onChange={(e) => updateForm('responsiblePerson', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="reviewFrequency">Review Frequency</Label>
                  <Select
                    id="reviewFrequency"
                    value={form.reviewFrequency}
                    onChange={(e) => updateForm('reviewFrequency', e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUALLY">Annually</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nextReviewDate">Next Review Date</Label>
                  <Input
                    id="nextReviewDate"
                    type="date"
                    value={form.nextReviewDate}
                    onChange={(e) => updateForm('nextReviewDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={form.status}
                    onChange={(e) => updateForm('status', e.target.value)}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="CONTROLLED">Controlled</option>
                    <option value="CLOSED">Closed</option>
                  </Select>
                </div>
              </div>
            </section>

            {/* ----------------------------------------------------------- */}
            {/* Section F -- AI Analysis                                     */}
            {/* ----------------------------------------------------------- */}
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pl-3 border-l-4 border-green-500">
                F. AI Analysis
              </h3>

              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
                disabled={aiLoading || !form.activityProcess || !form.aspect || !form.impact}
                onClick={handleAiAnalysis}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {aiLoading ? 'Generating AI Analysis...' : 'Generate AI Analysis'}
              </Button>

              {!form.activityProcess && !form.aspect && !form.impact && (
                <p className="text-xs text-gray-400 mt-2">
                  Fill in the Activity/Process, Aspect, and Impact fields first.
                </p>
              )}

              {aiGenerated && Object.keys(aiResults).length > 0 && (
                <div className="mt-4 border border-green-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full px-4 py-3 bg-green-50 text-left"
                    onClick={() => setAiExpanded(!aiExpanded)}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-green-800">
                      <Sparkles className="h-4 w-4" />
                      AI Analysis Results
                    </span>
                    {aiExpanded ? (
                      <ChevronUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                  {aiExpanded && (
                    <div className="p-4 space-y-4 bg-white">
                      {[
                        {
                          key: 'aiSignificanceJustification',
                          title: 'Significance Justification',
                        },
                        {
                          key: 'aiControlRecommendations',
                          title: 'Control Recommendations',
                        },
                        { key: 'aiLegalObligations', title: 'Legal Obligations' },
                        { key: 'aiBenchmarkComparison', title: 'Benchmark Comparison' },
                        {
                          key: 'aiImprovementOpportunities',
                          title: 'Improvement Opportunities',
                        },
                        { key: 'aiClimateRelevance', title: 'Climate Relevance' },
                      ].map(
                        (item) =>
                          aiResults[item.key] && (
                            <div key={item.key}>
                              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                {aiResults[item.key]}
                              </p>
                            </div>
                          )
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={
                submitting ||
                !form.activityProcess ||
                !form.department ||
                !form.aspect ||
                !form.impact
              }
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Aspect'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
