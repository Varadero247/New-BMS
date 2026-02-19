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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  AIDisclosure,
} from '@ims/ui';
import { RiskMatrix } from '@ims/charts';
import { Plus, AlertTriangle, Loader2, Search, Sparkles, Shield } from 'lucide-react';
import { api } from '@/lib/api';

const HAZARD_CATEGORIES = [
  'Physical',
  'Chemical',
  'Biological',
  'Ergonomic',
  'Psychosocial',
  'Environmental',
  'Fire',
  'Electrical',
  'Working at Height',
  'Manual Handling',
  'Other',
] as const;

const LIKELIHOOD_LABELS: Record<number, string> = {
  1: 'Rare',
  2: 'Unlikely',
  3: 'Possible',
  4: 'Likely',
  5: 'Almost Certain',
};

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Negligible',
  2: 'Minor',
  3: 'Moderate',
  4: 'Major',
  5: 'Catastrophic',
};

const STATUS_OPTIONS = ['ACTIVE', 'UNDER_REVIEW', 'MITIGATED', 'CLOSED', 'ACCEPTED'] as const;

const AI_CONTROL_FIELDS = [
  { key: 'aiControlElimination', label: 'Level 1 — Elimination', level: 1 },
  { key: 'aiControlSubstitution', label: 'Level 2 — Substitution', level: 2 },
  { key: 'aiControlEngineering', label: 'Level 3 — Engineering Controls', level: 3 },
  { key: 'aiControlAdministrative', label: 'Level 4 — Administrative Controls', level: 4 },
  { key: 'aiControlPPE', label: 'Level 5 — PPE Requirements', level: 5 },
] as const;

interface Risk {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  source: string;
  whoAtRisk: string;
  likelihood: number;
  severity: number;
  riskScore: number;
  riskLevel: string;
  aiControlElimination: string;
  aiControlSubstitution: string;
  aiControlEngineering: string;
  aiControlAdministrative: string;
  aiControlPPE: string;
  aiControlsGenerated: boolean;
  existingControls: string;
  residualLikelihood: number;
  residualSeverity: number;
  residualRiskScore: number;
  residualRiskLevel: string;
  riskOwner: string;
  legalReference: string;
  reviewDate: string;
  status: string;
  createdAt: string;
}

interface RiskForm {
  title: string;
  description: string;
  source: string;
  whoAtRisk: string;
  category: string;
  likelihood: number;
  severity: number;
  existingControls: string;
  aiControlElimination: string;
  aiControlSubstitution: string;
  aiControlEngineering: string;
  aiControlAdministrative: string;
  aiControlPPE: string;
  residualLikelihood: number;
  residualSeverity: number;
  riskOwner: string;
  legalReference: string;
  reviewDate: string;
  status: string;
}

const emptyForm: RiskForm = {
  title: '',
  description: '',
  source: '',
  whoAtRisk: '',
  category: '',
  likelihood: 0,
  severity: 0,
  existingControls: '',
  aiControlElimination: '',
  aiControlSubstitution: '',
  aiControlEngineering: '',
  aiControlAdministrative: '',
  aiControlPPE: '',
  residualLikelihood: 0,
  residualSeverity: 0,
  riskOwner: '',
  legalReference: '',
  reviewDate: '',
  status: 'ACTIVE',
};

function getRiskScoreInfo(likelihood: number, severity: number) {
  if (!likelihood || !severity)
    return { score: 0, level: '-', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500' };
  const score = likelihood * severity;
  if (score <= 4)
    return { score, level: 'LOW', color: 'bg-green-100 text-green-800 border-green-300' };
  if (score <= 9)
    return { score, level: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
  if (score <= 16)
    return { score, level: 'HIGH', color: 'bg-orange-100 text-orange-800 border-orange-300' };
  return { score, level: 'CRITICAL', color: 'bg-red-100 text-red-800 border-red-300' };
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'info' as const;
    case 'UNDER_REVIEW':
      return 'warning' as const;
    case 'MITIGATED':
      return 'success' as const;
    case 'CLOSED':
      return 'secondary' as const;
    case 'ACCEPTED':
      return 'default' as const;
    default:
      return 'outline' as const;
  }
}

function getDefaultReviewDate(riskLevel: string): string {
  const d = new Date();
  switch (riskLevel) {
    case 'CRITICAL':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'HIGH':
      d.setMonth(d.getMonth() + 3);
      break;
    case 'MEDIUM':
      d.setMonth(d.getMonth() + 6);
      break;
    case 'LOW':
      d.setMonth(d.getMonth() + 12);
      break;
    default:
      d.setMonth(d.getMonth() + 6);
  }
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RiskForm>(emptyForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiEditedFields, setAiEditedFields] = useState<Record<string, boolean>>({});
  const [aiLegalSuggestions, setAiLegalSuggestions] = useState<
    Array<{ regulation: string; section: string; relevance: string }>
  >([]);
  const [aiLegalLoading, setAiLegalLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRisks();
  }, []);

  async function loadRisks() {
    try {
      setError(null);
      const response = await api.get('/risks');
      setRisks(response.data.data || []);
    } catch {
      setError('Failed to load risks. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleHazardBlur = useCallback(async () => {
    if (form.description.length < 20 || aiGenerated) return;
    setAiLoading(true);
    try {
      const response = await fetch('/api/risks/generate-controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hazardDescription: form.description,
          activityLocation: form.source,
          whoAtRisk: form.whoAtRisk,
          hazardCategory: form.category,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setForm((prev) => ({
          ...prev,
          aiControlElimination: data.elimination || '',
          aiControlSubstitution: data.substitution || '',
          aiControlEngineering: data.engineering || '',
          aiControlAdministrative: data.administrative || '',
          aiControlPPE: data.ppe || '',
          likelihood: data.suggestedLikelihood || prev.likelihood,
          severity: data.suggestedSeverity || prev.severity,
        }));
        setAiGenerated(true);
        setAiEditedFields({});
      }
    } catch (err) {
      console.error('Failed to generate AI controls:', err);
    } finally {
      setAiLoading(false);
    }
  }, [form.description, form.source, form.whoAtRisk, form.category, aiGenerated]);

  useEffect(() => {
    if (form.likelihood > 0 && form.severity > 0 && !form.reviewDate) {
      const info = getRiskScoreInfo(form.likelihood, form.severity);
      setForm((prev) => ({ ...prev, reviewDate: getDefaultReviewDate(info.level) }));
    }
  }, [form.likelihood, form.severity]);

  function updateForm(field: keyof RiskForm, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAiControlEdit(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (aiGenerated) setAiEditedFields((prev) => ({ ...prev, [field]: true }));
  }

  async function handleAiLegalSuggestions() {
    if (!form.title && !form.description) return;
    setAiLegalLoading(true);
    setAiLegalSuggestions([]);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: 'LEGAL_REFERENCES',
          context: {
            riskTitle: form.title,
            riskDescription: form.description,
            riskCategory: form.category,
          },
        }),
      });
      if (response.ok) {
        const json = await response.json();
        setAiLegalSuggestions(json.data?.suggestions || []);
      }
    } catch (err) {
      console.error('AI legal suggestions error:', err);
    } finally {
      setAiLegalLoading(false);
    }
  }

  function openModal() {
    setForm(emptyForm);
    setAiGenerated(false);
    setAiEditedFields({});
    setAiLegalSuggestions([]);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/risks', {
        title: form.title,
        description: form.description,
        category: form.category || undefined,
        source: form.source || undefined,
        whoAtRisk: form.whoAtRisk || undefined,
        likelihood: form.likelihood,
        severity: form.severity,
        aiControlElimination: form.aiControlElimination || undefined,
        aiControlSubstitution: form.aiControlSubstitution || undefined,
        aiControlEngineering: form.aiControlEngineering || undefined,
        aiControlAdministrative: form.aiControlAdministrative || undefined,
        aiControlPPE: form.aiControlPPE || undefined,
        aiControlsGenerated: aiGenerated,
        existingControls: form.existingControls || undefined,
        residualLikelihood: form.residualLikelihood,
        residualSeverity: form.residualSeverity,
        riskOwner: form.riskOwner || undefined,
        legalReference: form.legalReference || undefined,
        status: form.status,
        reviewDate: form.reviewDate || undefined,
      });
      setShowModal(false);
      setForm(emptyForm);
      setAiGenerated(false);
      loadRisks();
    } catch (err) {
      console.error('Failed to create risk:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (ratingFilter !== 'all' && r.riskLevel !== ratingFilter) return false;
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.referenceNumber?.toLowerCase().includes(q) ||
          r.riskOwner?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [risks, statusFilter, ratingFilter, categoryFilter, searchQuery]);

  const initialInfo = getRiskScoreInfo(form.likelihood, form.severity);
  const residualInfo = getRiskScoreInfo(form.residualLikelihood, form.residualSeverity);
  const residualWarning =
    initialInfo.score > 0 && residualInfo.score > 0 && residualInfo.score >= initialInfo.score;
  const isFormValid =
    form.title.length > 0 &&
    form.description.length >= 20 &&
    form.likelihood > 0 &&
    form.severity > 0 &&
    form.residualLikelihood > 0 &&
    form.residualSeverity > 0;

  const handleRiskMatrixCellClick = useCallback(() => {}, []);
  const riskMatrixData = useMemo(
    () =>
      risks.map((r) => ({
        id: r.id,
        likelihood: r.likelihood || r.residualLikelihood,
        severity: r.severity || r.residualSeverity,
        title: r.title,
      })),
    [risks]
  );

  const riskCounts = {
    total: risks.length,
    CRITICAL: risks.filter((r) => r.riskLevel === 'CRITICAL').length,
    HIGH: risks.filter((r) => r.riskLevel === 'HIGH').length,
    MEDIUM: risks.filter((r) => r.riskLevel === 'MEDIUM').length,
    LOW: risks.filter((r) => r.riskLevel === 'LOW').length,
  };

  return (
    <div className="p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Risk Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 45001:2018 — Occupational Health & Safety Risk Management
            </p>
          </div>
          <Button onClick={openModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Risk
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Risks</p>
              <p className="text-2xl font-bold">{riskCounts.total}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-600">{riskCounts.CRITICAL}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
              <p className="text-2xl font-bold text-orange-600">{riskCounts.HIGH}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{riskCounts.MEDIUM}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
              <p className="text-2xl font-bold text-green-600">{riskCounts.LOW}</p>
            </CardContent>
          </Card>
        </div>

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
                    aria-label="Search by reference, hazard, owner..."
                    placeholder="Search by reference, hazard, owner..."
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
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="ratingFilter" className="text-xs text-gray-500 dark:text-gray-400">
                  Risk Rating
                </Label>
                <Select
                  id="ratingFilter"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="mt-1"
                >
                  <option value="all">All Ratings</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="categoryFilter"
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  Category
                </Label>
                <Select
                  id="categoryFilter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mt-1"
                >
                  <option value="all">All Categories</option>
                  {HAZARD_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Risk Register ({filteredRisks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded" />
                    ))}
                  </div>
                ) : filteredRisks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Ref</TableHead>
                          <TableHead className="w-[80px]">Date</TableHead>
                          <TableHead className="min-w-[180px]">Hazard</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Who at Risk</TableHead>
                          <TableHead className="w-[100px] text-center">Initial</TableHead>
                          <TableHead className="min-w-[120px]">Controls</TableHead>
                          <TableHead className="w-[100px] text-center">Residual</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead className="w-[90px]">Review</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRisks.map((risk) => {
                          const initInfo = getRiskScoreInfo(risk.likelihood, risk.severity);
                          const resInfo = getRiskScoreInfo(
                            risk.residualLikelihood,
                            risk.residualSeverity
                          );
                          return (
                            <TableRow
                              key={risk.id}
                              className={
                                initInfo.level === 'CRITICAL' ? 'border-l-4 border-l-red-500' : ''
                              }
                            >
                              <TableCell className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                {risk.referenceNumber || '-'}
                              </TableCell>
                              <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(risk.createdAt)}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium text-sm truncate max-w-[220px]">
                                  {risk.title}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[220px]">
                                  {risk.description}
                                </p>
                              </TableCell>
                              <TableCell className="text-sm">{risk.source || '-'}</TableCell>
                              <TableCell className="text-sm">{risk.whoAtRisk || '-'}</TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${initInfo.color}`}
                                >
                                  {initInfo.score} {initInfo.level}
                                </span>
                              </TableCell>
                              <TableCell>
                                {risk.aiControlsGenerated ? (
                                  <div className="flex items-center gap-1 text-xs text-purple-600">
                                    <Sparkles className="h-3 w-3" />
                                    <span>5 AI controls</span>
                                  </div>
                                ) : risk.existingControls ? (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                    {risk.existingControls}
                                  </p>
                                ) : (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    -
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${resInfo.color}`}
                                >
                                  {resInfo.score} {resInfo.level}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">{risk.riskOwner || '-'}</TableCell>
                              <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(risk.reviewDate)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(risk.status)}>
                                  {risk.status?.replace(/_/g, ' ')}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Shield className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No risks found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Click &quot;Add Risk&quot; to create your first risk assessment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">5x5 Risk Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskMatrix risks={riskMatrixData} onCellClick={handleRiskMatrixCellClick} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add Risk Assessment"
          description="ISO 45001:2018 — AI-Assisted Hazard Risk Assessment"
          size="full"
        >
          <form onSubmit={handleSubmit}>
            <div className="max-h-[70vh] overflow-y-auto px-1 space-y-8">
              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">A</span>
                  Hazard Identification
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Hazard Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the hazard in detail (minimum 20 characters)..."
                      rows={3}
                      value={form.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      onBlur={handleHazardBlur}
                      className="mt-1"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {form.description.length < 20
                          ? `${20 - form.description.length} more characters needed`
                          : 'AI controls will generate on blur'}
                      </p>
                      {aiGenerated && (
                        <span className="text-xs text-purple-600 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> AI controls generated
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="title">Hazard Title / Summary *</Label>
                    <Input
                      id="title"
                      placeholder="Short title for this risk"
                      value={form.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="source">Activity / Location</Label>
                      <Input
                        id="source"
                        placeholder="e.g. Construction / Site A"
                        value={form.source}
                        onChange={(e) => updateForm('source', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whoAtRisk">Who is at Risk</Label>
                      <Input
                        id="whoAtRisk"
                        placeholder="e.g. Operatives, Visitors"
                        value={form.whoAtRisk}
                        onChange={(e) => updateForm('whoAtRisk', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Hazard Category</Label>
                      <Select
                        id="category"
                        value={form.category}
                        onChange={(e) => updateForm('category', e.target.value)}
                        className="mt-1"
                      >
                        <option value="">Select category...</option>
                        {HAZARD_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
                    B
                  </span>
                  Initial Risk Assessment (Before Controls)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="initialLikelihood">Likelihood *</Label>
                    <Select
                      id="initialLikelihood"
                      value={form.likelihood || ''}
                      onChange={(e) => updateForm('likelihood', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    >
                      <option value="">Select...</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} — {LIKELIHOOD_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="initialSeverity">Severity *</Label>
                    <Select
                      id="initialSeverity"
                      value={form.severity || ''}
                      onChange={(e) => updateForm('severity', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    >
                      <option value="">Select...</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} — {SEVERITY_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 dark:text-gray-500">
                      Initial Risk Score
                    </Label>
                    <div
                      className={`mt-1 px-4 py-2 rounded-lg border text-center font-bold text-lg ${initialInfo.color}`}
                    >
                      {initialInfo.score > 0
                        ? `${initialInfo.score} — ${initialInfo.level}`
                        : 'Select L & S'}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">C</span>
                  Control Measures (Hierarchy of Controls)
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="existingControls">Existing Controls (already in place)</Label>
                    <Textarea
                      id="existingControls"
                      placeholder="Describe any controls already in place..."
                      rows={2}
                      value={form.existingControls}
                      onChange={(e) => updateForm('existingControls', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  {(aiLoading || aiGenerated) && (
                    <AIDisclosure
                      variant="banner"
                      provider="claude"
                      analysisType="Risk Assessment"
                      confidence={0.87}
                    />
                  )}
                  {aiLoading && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          AI is generating controls...
                        </p>
                        <p className="text-xs text-purple-500">
                          Analysing hazard using ISO 45001 Hierarchy of Controls
                        </p>
                      </div>
                    </div>
                  )}
                  {AI_CONTROL_FIELDS.map(({ key, label, level }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor={key} className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${level <= 2 ? 'bg-green-100 text-green-700' : level === 3 ? 'bg-blue-100 text-blue-700' : level === 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}
                          >
                            {level}
                          </span>
                          {label}
                        </Label>
                        {aiGenerated && (
                          <Badge
                            variant={aiEditedFields[key] ? 'warning' : 'info'}
                            className="text-[10px]"
                          >
                            {aiEditedFields[key] ? 'Edited' : 'AI Suggested'}
                          </Badge>
                        )}
                      </div>
                      <Textarea
                        id={key}
                        placeholder={aiLoading ? 'Waiting for AI...' : `${label}...`}
                        rows={2}
                        value={(form as Record<string, unknown>)[key]}
                        onChange={(e) => handleAiControlEdit(key, e.target.value)}
                        disabled={aiLoading}
                        className="mt-0"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">D</span>
                  Residual Risk Assessment (After Controls)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="residualLikelihood">Residual Likelihood *</Label>
                    <Select
                      id="residualLikelihood"
                      value={form.residualLikelihood || ''}
                      onChange={(e) =>
                        updateForm('residualLikelihood', parseInt(e.target.value) || 0)
                      }
                      className="mt-1"
                    >
                      <option value="">Select...</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} — {LIKELIHOOD_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="residualSeverity">Residual Severity *</Label>
                    <Select
                      id="residualSeverity"
                      value={form.residualSeverity || ''}
                      onChange={(e) =>
                        updateForm('residualSeverity', parseInt(e.target.value) || 0)
                      }
                      className="mt-1"
                    >
                      <option value="">Select...</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} — {SEVERITY_LABELS[n]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400 dark:text-gray-500">
                      Residual Risk Score
                    </Label>
                    <div
                      className={`mt-1 px-4 py-2 rounded-lg border text-center font-bold text-lg ${residualInfo.color}`}
                    >
                      {residualInfo.score > 0
                        ? `${residualInfo.score} — ${residualInfo.level}`
                        : 'Select L & S'}
                    </div>
                  </div>
                </div>
                {residualWarning && (
                  <div className="mt-3 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-700">
                      Residual risk ({residualInfo.score}) is not lower than the initial risk (
                      {initialInfo.score}). Review your controls.
                    </p>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="bg-gray-200 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                    E
                  </span>
                  Risk Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="riskOwner">Risk Owner</Label>
                    <Input
                      id="riskOwner"
                      placeholder="Name or role of risk owner"
                      value={form.riskOwner}
                      onChange={(e) => updateForm('riskOwner', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="legalReference">Legal Reference</Label>
                      <button
                        type="button"
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded text-purple-600 border border-purple-200 hover:bg-purple-50 disabled:opacity-50"
                        disabled={aiLegalLoading || (!form.title && !form.description)}
                        onClick={handleAiLegalSuggestions}
                      >
                        {aiLegalLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        AI Suggest
                      </button>
                    </div>
                    <Input
                      id="legalReference"
                      placeholder="e.g. Work at Height Regulations 2005"
                      value={form.legalReference}
                      onChange={(e) => updateForm('legalReference', e.target.value)}
                      className="mt-1"
                    />
                    {aiLegalSuggestions.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {aiLegalSuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100"
                            onClick={() => {
                              const ref = `${suggestion.regulation}${suggestion.section ? ` — ${suggestion.section}` : ''}`;
                              updateForm(
                                'legalReference',
                                form.legalReference ? `${form.legalReference}; ${ref}` : ref
                              );
                            }}
                          >
                            <p className="text-sm font-medium text-purple-800">
                              {suggestion.regulation}
                            </p>
                            {suggestion.section && (
                              <p className="text-xs text-purple-600">{suggestion.section}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {suggestion.relevance}
                            </p>
                          </div>
                        ))}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Click a suggestion to add it
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reviewDate">Review Date</Label>
                    <Input
                      id="reviewDate"
                      type="date"
                      value={form.reviewDate}
                      onChange={(e) => updateForm('reviewDate', e.target.value)}
                      className="mt-1"
                    />
                    {initialInfo.score > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Auto-set based on {initialInfo.level} rating
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      id="status"
                      value={form.status}
                      onChange={(e) => updateForm('status', e.target.value)}
                      className="mt-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </section>
            </div>

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
                  'Save Risk Assessment'
                )}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </div>
  );
}
