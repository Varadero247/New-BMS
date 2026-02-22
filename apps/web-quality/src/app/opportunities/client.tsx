'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Select,
  Textarea,
} from '@ims/ui';
import {
  Plus,
  Search,
  Lightbulb,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Rocket,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  likelihood: number;
  newBusiness: number;
  expansionOfCurrent: number;
  satisfyingRegs: number;
  status: 'IDENTIFIED' | 'EVALUATING' | 'PURSUING' | 'IMPLEMENTING' | 'IMPLEMENTED' | 'DECLINED';
  owner?: string;
  notes?: string;
  createdAt?: string;
}

interface OpportunityForm {
  title: string;
  description: string;
  likelihood: number;
  newBusiness: number;
  expansionOfCurrent: number;
  satisfyingRegs: number;
  status: string;
  owner: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Expand into US healthcare compliance market',
    likelihood: 4,
    newBusiness: 5,
    expansionOfCurrent: 3,
    satisfyingRegs: 4,
    status: 'PURSUING',
    owner: 'Sales Director',
  },
  {
    id: '2',
    title: 'Automate nonconformance reporting',
    likelihood: 5,
    newBusiness: 2,
    expansionOfCurrent: 4,
    satisfyingRegs: 3,
    status: 'IMPLEMENTING',
    owner: 'Quality Manager',
  },
  {
    id: '3',
    title: 'Partner with ISO certification bodies',
    likelihood: 3,
    newBusiness: 4,
    expansionOfCurrent: 2,
    satisfyingRegs: 5,
    status: 'EVALUATING',
    owner: 'CEO',
  },
  {
    id: '4',
    title: 'Offer training courses for ISO 9001',
    likelihood: 4,
    newBusiness: 5,
    expansionOfCurrent: 2,
    satisfyingRegs: 2,
    status: 'IDENTIFIED',
    owner: 'Training Manager',
  },
];

const STATUS_OPTIONS = [
  'IDENTIFIED',
  'EVALUATING',
  'PURSUING',
  'IMPLEMENTING',
  'IMPLEMENTED',
  'DECLINED',
] as const;

const statusColors: Record<string, string> = {
  IDENTIFIED: 'bg-slate-100 text-slate-700',
  EVALUATING: 'bg-blue-100 text-blue-800',
  PURSUING: 'bg-purple-100 text-purple-800',
  IMPLEMENTING: 'bg-amber-100 text-amber-800',
  IMPLEMENTED: 'bg-green-100 text-green-800',
  DECLINED: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  IDENTIFIED: <Lightbulb className="h-3.5 w-3.5" />,
  EVALUATING: <BarChart3 className="h-3.5 w-3.5" />,
  PURSUING: <Rocket className="h-3.5 w-3.5" />,
  IMPLEMENTING: <Clock className="h-3.5 w-3.5" />,
  IMPLEMENTED: <CheckCircle2 className="h-3.5 w-3.5" />,
  DECLINED: <XCircle className="h-3.5 w-3.5" />,
};

const emptyForm: OpportunityForm = {
  title: '',
  description: '',
  likelihood: 3,
  newBusiness: 3,
  expansionOfCurrent: 3,
  satisfyingRegs: 3,
  status: 'IDENTIFIED',
  owner: '',
  notes: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcScore(opp: Pick<Opportunity, 'likelihood' | 'newBusiness' | 'expansionOfCurrent' | 'satisfyingRegs'>): number {
  return opp.likelihood * (opp.newBusiness + opp.expansionOfCurrent + opp.satisfyingRegs);
}

function priorityLevel(score: number): { label: string; color: string } {
  if (score >= 48) return { label: 'Very High', color: 'text-red-700 bg-red-100' };
  if (score >= 36) return { label: 'High', color: 'text-orange-700 bg-orange-100' };
  if (score >= 24) return { label: 'Medium', color: 'text-yellow-700 bg-yellow-100' };
  if (score >= 12) return { label: 'Low', color: 'text-green-700 bg-green-100' };
  return { label: 'Minimal', color: 'text-gray-600 bg-gray-100' };
}

function ScoreBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-purple-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-4 text-right">{value}</span>
    </div>
  );
}

function RatingInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1 block text-sm">
        {label}: <span className="font-semibold text-purple-700">{value}</span>
      </Label>
      <input
        id={id}
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OpportunitiesClient() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<OpportunityForm>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Detail modal
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get('/opportunities');
      const data = r.data.data;
      const items: Opportunity[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : MOCK_OPPORTUNITIES;
      setOpportunities(items.length > 0 ? items : MOCK_OPPORTUNITIES);
    } catch {
      setOpportunities(MOCK_OPPORTUNITIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    return opportunities
      .filter((o) => statusFilter === 'all' || o.status === statusFilter)
      .filter(
        (o) =>
          !searchQuery ||
          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.owner ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [opportunities, statusFilter, searchQuery]);

  const counts = useMemo(
    () => ({
      total: opportunities.length,
      pursuing: opportunities.filter((o) => o.status === 'PURSUING' || o.status === 'IMPLEMENTING').length,
      implemented: opportunities.filter((o) => o.status === 'IMPLEMENTED').length,
      identified: opportunities.filter((o) => o.status === 'IDENTIFIED' || o.status === 'EVALUATING').length,
    }),
    [opportunities]
  );

  // Live score in add form
  const liveScore = calcScore({
    likelihood: form.likelihood,
    newBusiness: form.newBusiness,
    expansionOfCurrent: form.expansionOfCurrent,
    satisfyingRegs: form.satisfyingRegs,
  });
  const livePriority = priorityLevel(liveScore);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await api.post('/opportunities', {
        title: form.title,
        description: form.description || undefined,
        likelihood: form.likelihood,
        newBusiness: form.newBusiness,
        expansionOfCurrent: form.expansionOfCurrent,
        satisfyingRegs: form.satisfyingRegs,
        status: form.status,
        owner: form.owner || undefined,
        notes: form.notes || undefined,
      });
      setShowAddModal(false);
      setForm({ ...emptyForm });
      loadOpportunities();
    } catch {
      setFormError('Failed to save opportunity. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
              Opportunities
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 9001 Cl. 6.1 — Actions to address risks and opportunities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadOpportunities} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setForm({ ...emptyForm });
                setFormError(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Opportunity
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  <p className="text-3xl font-bold text-purple-700">{counts.total}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Pipeline</p>
                  <p className="text-3xl font-bold text-blue-600">{counts.identified}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-amber-600">{counts.pursuing}</p>
                </div>
                <Rocket className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Implemented</p>
                  <p className="text-3xl font-bold text-green-600">{counts.implemented}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    aria-label="Search opportunities"
                    placeholder="Search by title or owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Status</Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Cards Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Opportunities ({filtered.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((opp) => {
                const score = calcScore(opp);
                const priority = priorityLevel(score);
                const maxScore = 5 * 15; // likelihood 5 × (5+5+5)
                const scorePct = Math.round((score / maxScore) * 100);

                return (
                  <div
                    key={opp.id}
                    onClick={() => { setSelectedOpp(opp); setShowDetailModal(true); }}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug line-clamp-2">
                          {opp.title}
                        </h3>
                        {opp.owner && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <Users className="h-3 w-3" />
                            {opp.owner}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[opp.status]}`}>
                          {statusIcons[opp.status]}
                          {opp.status}
                        </div>
                      </div>
                    </div>

                    {/* Score Display */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Priority Score</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priority.color}`}>
                            {priority.label}
                          </span>
                          <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{score}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            scorePct >= 75
                              ? 'bg-red-500'
                              : scorePct >= 50
                                ? 'bg-orange-500'
                                : scorePct >= 30
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                          }`}
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Factor Scores */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 w-28">Likelihood</span>
                        <ScoreBar value={opp.likelihood} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 w-28">New Business</span>
                        <ScoreBar value={opp.newBusiness} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 w-28">Expansion</span>
                        <ScoreBar value={opp.expansionOfCurrent} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400 w-28">Regulation</span>
                        <ScoreBar value={opp.satisfyingRegs} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
              <Lightbulb className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                No opportunities found
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Identify your first strategic opportunity.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }}
                  className="flex items-center gap-2 mx-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add First Opportunity
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================
          ADD MODAL
          =================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add Opportunity
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ISO 9001 Cl. 6.1</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <Label htmlFor="opp-title">Title *</Label>
                <Input
                  id="opp-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Strategic opportunity title"
                />
              </div>

              <div>
                <Label htmlFor="opp-description">Description</Label>
                <Textarea
                  id="opp-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of the opportunity..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="opp-status">Status</Label>
                  <Select
                    id="opp-status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="opp-owner">Owner</Label>
                  <Input
                    id="opp-owner"
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    placeholder="Responsible person"
                  />
                </div>
              </div>

              {/* Scoring Section */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-4 border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Priority Scoring
                </h3>

                <RatingInput
                  id="opp-likelihood"
                  label="Likelihood (1–5)"
                  value={form.likelihood}
                  onChange={(v) => setForm({ ...form, likelihood: v })}
                />
                <RatingInput
                  id="opp-newBusiness"
                  label="New Business Potential (1–5)"
                  value={form.newBusiness}
                  onChange={(v) => setForm({ ...form, newBusiness: v })}
                />
                <RatingInput
                  id="opp-expansion"
                  label="Expansion of Current (1–5)"
                  value={form.expansionOfCurrent}
                  onChange={(v) => setForm({ ...form, expansionOfCurrent: v })}
                />
                <RatingInput
                  id="opp-regs"
                  label="Satisfying Regulations (1–5)"
                  value={form.satisfyingRegs}
                  onChange={(v) => setForm({ ...form, satisfyingRegs: v })}
                />

                {/* Live Score Preview */}
                <div className="flex items-center justify-between pt-2 border-t border-purple-200 dark:border-purple-700">
                  <div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                      Priority Score = {form.likelihood} × ({form.newBusiness} + {form.expansionOfCurrent} + {form.satisfyingRegs})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${livePriority.color}`}>
                      {livePriority.label}
                    </span>
                    <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                      {liveScore}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="opp-notes">Notes</Label>
                <Textarea
                  id="opp-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional context or action notes..."
                />
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? 'Saving...' : 'Add Opportunity'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          DETAIL MODAL
          =================================================================== */}
      {showDetailModal && selectedOpp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 pr-4">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${statusColors[selectedOpp.status]}`}>
                  {statusIcons[selectedOpp.status]}
                  {selectedOpp.status}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedOpp.title}
                </h2>
                {selectedOpp.owner && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-3.5 w-3.5" />
                    {selectedOpp.owner}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 flex-shrink-0"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Score Summary */}
              {(() => {
                const score = calcScore(selectedOpp);
                const priority = priorityLevel(score);
                const maxScore = 75;
                const scorePct = Math.round((score / maxScore) * 100);
                return (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        Priority Score
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priority.color}`}>
                          {priority.label}
                        </span>
                        <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                          {score}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div
                        className="h-2 rounded-full bg-purple-500 transition-all"
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Likelihood</span>
                        <div className="mt-1"><ScoreBar value={selectedOpp.likelihood} /></div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">New Business</span>
                        <div className="mt-1"><ScoreBar value={selectedOpp.newBusiness} /></div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Expansion</span>
                        <div className="mt-1"><ScoreBar value={selectedOpp.expansionOfCurrent} /></div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Regulation</span>
                        <div className="mt-1"><ScoreBar value={selectedOpp.satisfyingRegs} /></div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {selectedOpp.description && (
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedOpp.description}
                  </p>
                </div>
              )}

              {selectedOpp.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    {selectedOpp.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
