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
  Textarea,
} from '@ims/ui';
import {
  Plus,
  Search,
  FolderOpen,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  XCircle,
  FileCheck,
  Loader2,
  BookOpen,
  ChevronRight,
  Package,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EvidenceSection {
  id: string;
  title: string;
  count?: number;
  status?: string;
}

interface EvidencePack {
  id: string;
  standardClause: string;
  title: string;
  status: 'COLLECTING' | 'READY' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  sections?: EvidenceSection[];
}

interface PackForm {
  standardClause: string;
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_PACKS: EvidencePack[] = [
  {
    id: '1',
    standardClause: '4.2',
    title: 'Context of the Organization Evidence',
    status: 'READY',
    description: 'Evidence supporting understanding of interested parties and their requirements.',
    sections: [
      { id: 's1', title: 'Interested Parties Register', count: 12 },
      { id: 's2', title: 'Issues of Concern Log', count: 5 },
      { id: 's3', title: 'Compliance Obligations Matrix', count: 8 },
    ],
  },
  {
    id: '2',
    standardClause: '6.1',
    title: 'Risk and Opportunity Evidence',
    status: 'COLLECTING',
    description: 'Evidence of risk assessment, treatment plans, and opportunity pursuit.',
    sections: [
      { id: 's4', title: 'Risk Register', count: 24 },
      { id: 's5', title: 'Opportunity Register', count: 4 },
    ],
  },
  {
    id: '3',
    standardClause: '8.1',
    title: 'Operational Planning Evidence',
    status: 'SUBMITTED',
    description: 'Operational process controls, work instructions, and monitoring records.',
    sections: [
      { id: 's6', title: 'Process Map', count: 7 },
      { id: 's7', title: 'Work Instructions', count: 31 },
      { id: 's8', title: 'Control Records', count: 18 },
    ],
  },
  {
    id: '4',
    standardClause: '9.2',
    title: 'Internal Audit Evidence Pack',
    status: 'ACCEPTED',
    description: 'Complete internal audit programme, schedules, reports, and CAPA follow-up.',
    sections: [
      { id: 's9', title: 'Audit Programme', count: 1 },
      { id: 's10', title: 'Audit Reports', count: 6 },
      { id: 's11', title: 'CAPA Follow-up Records', count: 9 },
    ],
  },
];

const statusConfig: Record<
  EvidencePack['status'],
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  COLLECTING: {
    label: 'Collecting',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  READY: {
    label: 'Ready',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  SUBMITTED: {
    label: 'Submitted',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    icon: <Upload className="h-3.5 w-3.5" />,
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    icon: <FileCheck className="h-3.5 w-3.5" />,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const ISO_CLAUSES = [
  { value: '4.1', label: '4.1 — Context of the Organization' },
  { value: '4.2', label: '4.2 — Interested Parties' },
  { value: '4.3', label: '4.3 — Scope of QMS' },
  { value: '4.4', label: '4.4 — QMS and its Processes' },
  { value: '5.1', label: '5.1 — Leadership and Commitment' },
  { value: '5.2', label: '5.2 — Quality Policy' },
  { value: '5.3', label: '5.3 — Roles and Responsibilities' },
  { value: '6.1', label: '6.1 — Risks and Opportunities' },
  { value: '6.2', label: '6.2 — Quality Objectives' },
  { value: '6.3', label: '6.3 — Planning of Changes' },
  { value: '7.1', label: '7.1 — Resources' },
  { value: '7.2', label: '7.2 — Competence' },
  { value: '7.3', label: '7.3 — Awareness' },
  { value: '7.4', label: '7.4 — Communication' },
  { value: '7.5', label: '7.5 — Documented Information' },
  { value: '8.1', label: '8.1 — Operational Planning' },
  { value: '8.2', label: '8.2 — Customer Requirements' },
  { value: '8.3', label: '8.3 — Design and Development' },
  { value: '8.4', label: '8.4 — External Providers' },
  { value: '8.5', label: '8.5 — Production and Service' },
  { value: '8.6', label: '8.6 — Release of Products' },
  { value: '8.7', label: '8.7 — Nonconforming Outputs' },
  { value: '9.1', label: '9.1 — Monitoring and Measurement' },
  { value: '9.2', label: '9.2 — Internal Audit' },
  { value: '9.3', label: '9.3 — Management Review' },
  { value: '10.1', label: '10.1 — Improvement (General)' },
  { value: '10.2', label: '10.2 — Nonconformity and CAPA' },
  { value: '10.3', label: '10.3 — Continual Improvement' },
];

const emptyForm: PackForm = {
  standardClause: '4.1',
  title: '',
  description: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function StatusBadge({ status }: { status: EvidencePack['status'] }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function ClauseTag({ clause }: { clause: string }) {
  return (
    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-200 dark:border-purple-700 flex-shrink-0">
      <div className="text-center">
        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 leading-none block">
          Cl.
        </span>
        <span className="text-sm font-extrabold text-purple-900 dark:text-purple-100 leading-tight block">
          {clause}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EvidencePackClient() {
  const [packs, setPacks] = useState<EvidencePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Generate modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [form, setForm] = useState<PackForm>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Detail modal
  const [selectedPack, setSelectedPack] = useState<EvidencePack | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadPacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get('/evidence-packs');
      const data = r.data.data;
      const items: EvidencePack[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : MOCK_PACKS;
      setPacks(items.length > 0 ? items : MOCK_PACKS);
    } catch {
      setPacks(MOCK_PACKS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    return packs
      .filter((p) => statusFilter === 'all' || p.status === statusFilter)
      .filter(
        (p) =>
          !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.standardClause.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [packs, statusFilter, searchQuery]);

  const counts = useMemo(
    () => ({
      total: packs.length,
      collecting: packs.filter((p) => p.status === 'COLLECTING').length,
      ready: packs.filter((p) => p.status === 'READY').length,
      accepted: packs.filter((p) => p.status === 'ACCEPTED').length,
      submitted: packs.filter((p) => p.status === 'SUBMITTED').length,
    }),
    [packs]
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!form.standardClause) {
      setFormError('ISO clause is required.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await api.post('/evidence-packs', {
        standardClause: form.standardClause,
        title: form.title,
        description: form.description || undefined,
      });
      setShowGenerateModal(false);
      setForm({ ...emptyForm });
      loadPacks();
    } catch {
      setFormError('Failed to generate evidence pack. Please try again.');
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
              Evidence Packs
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 9001 Automated Evidence Collection — Audit Readiness
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadPacks} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setForm({ ...emptyForm });
                setFormError(null);
                setShowGenerateModal(true);
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Generate Pack
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Packs</p>
                  <p className="text-3xl font-bold text-purple-700">{counts.total}</p>
                </div>
                <Package className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Collecting</p>
                  <p className="text-3xl font-bold text-blue-600">{counts.collecting}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ready</p>
                  <p className="text-3xl font-bold text-green-600">{counts.ready}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Accepted</p>
                  <p className="text-3xl font-bold text-emerald-600">{counts.accepted}</p>
                </div>
                <FileCheck className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <Button variant="outline" size="sm" onClick={loadPacks} className="ml-auto">
              Retry
            </Button>
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
                    aria-label="Search evidence packs"
                    placeholder="Search by title or clause..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                >
                  <option value="all">All Statuses</option>
                  <option value="COLLECTING">Collecting</option>
                  <option value="READY">Ready</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evidence Pack Cards */}
        <div>
          <CardHeader className="px-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-purple-500" />
              Evidence Packs ({filtered.length})
            </CardTitle>
          </CardHeader>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => { setSelectedPack(pack); setShowDetailModal(true); }}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 cursor-pointer hover:border-purple-400 hover:shadow-md transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <ClauseTag clause={pack.standardClause} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <StatusBadge status={pack.status} />
                        {pack.createdAt && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(pack.createdAt)}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug">
                        {pack.title}
                      </h3>
                      {pack.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {pack.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sections Preview */}
                  {pack.sections && pack.sections.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1.5">
                      {pack.sections.slice(0, 3).map((section) => (
                        <div key={section.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <BookOpen className="h-3 w-3 text-purple-400" />
                            <span className="line-clamp-1">{section.title}</span>
                          </div>
                          {section.count !== undefined && (
                            <span className="text-gray-400 dark:text-gray-500 font-mono">
                              {section.count} items
                            </span>
                          )}
                        </div>
                      ))}
                      {pack.sections.length > 3 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 pt-0.5">
                          +{pack.sections.length - 3} more section{pack.sections.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <BookOpen className="h-3.5 w-3.5" />
                      ISO 9001:{pack.standardClause}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
              <FolderOpen className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                No evidence packs found
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Generate your first evidence pack for audit readiness.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  onClick={() => { setForm({ ...emptyForm }); setShowGenerateModal(true); }}
                  className="flex items-center gap-2 mx-auto bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Generate First Pack
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================
          GENERATE MODAL
          =================================================================== */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Generate Evidence Pack
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Collect and organise evidence for an ISO 9001 clause
                </p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleGenerate} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <Label htmlFor="ep-clause">ISO 9001 Clause *</Label>
                <select
                  id="ep-clause"
                  value={form.standardClause}
                  onChange={(e) => setForm({ ...form, standardClause: e.target.value })}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                >
                  {ISO_CLAUSES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clause Preview Badge */}
              {form.standardClause && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <ClauseTag clause={form.standardClause} />
                  <div>
                    <p className="text-xs font-medium text-purple-800 dark:text-purple-300">
                      Selected Clause
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-200">
                      {ISO_CLAUSES.find((c) => c.value === form.standardClause)?.label ?? form.standardClause}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="ep-title">Pack Title *</Label>
                <Input
                  id="ep-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="e.g. Internal Audit Evidence Pack"
                />
              </div>

              <div>
                <Label htmlFor="ep-description">Description</Label>
                <Textarea
                  id="ep-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Briefly describe what evidence this pack will contain..."
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <Loader2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  The system will automatically begin collecting relevant evidence records from
                  linked modules. The pack status will change to &quot;Ready&quot; once collection
                  is complete.
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Generate Pack
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          DETAIL MODAL
          =================================================================== */}
      {showDetailModal && selectedPack && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4 flex-1 pr-4">
                <ClauseTag clause={selectedPack.standardClause} />
                <div>
                  <StatusBadge status={selectedPack.status} />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                    {selectedPack.title}
                  </h2>
                  {selectedPack.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedPack.description}
                    </p>
                  )}
                </div>
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
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Clause</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    ISO 9001:{selectedPack.standardClause}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Status</p>
                  <StatusBadge status={selectedPack.status} />
                </div>
                {selectedPack.createdAt && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Created</p>
                    <p className="text-gray-700 dark:text-gray-300">{formatDate(selectedPack.createdAt)}</p>
                  </div>
                )}
                {selectedPack.updatedAt && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Last Updated</p>
                    <p className="text-gray-700 dark:text-gray-300">{formatDate(selectedPack.updatedAt)}</p>
                  </div>
                )}
              </div>

              {/* Sections */}
              {selectedPack.sections && selectedPack.sections.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Evidence Sections ({selectedPack.sections.length})
                  </p>
                  <div className="space-y-2">
                    {selectedPack.sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-purple-400 flex-shrink-0" />
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {section.title}
                          </span>
                        </div>
                        {section.count !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {section.count} items
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Readiness Indicator */}
              <div
                className={`p-4 rounded-lg border ${
                  selectedPack.status === 'ACCEPTED'
                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                    : selectedPack.status === 'READY'
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : selectedPack.status === 'SUBMITTED'
                        ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                        : selectedPack.status === 'COLLECTING'
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedPack.status === 'ACCEPTED' && (
                    <FileCheck className="h-5 w-5 text-emerald-600" />
                  )}
                  {selectedPack.status === 'READY' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {selectedPack.status === 'SUBMITTED' && (
                    <Upload className="h-5 w-5 text-purple-600" />
                  )}
                  {selectedPack.status === 'COLLECTING' && (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  {selectedPack.status === 'REJECTED' && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedPack.status === 'ACCEPTED' && 'Evidence Accepted by Auditor'}
                      {selectedPack.status === 'READY' && 'Pack Ready for Submission'}
                      {selectedPack.status === 'SUBMITTED' && 'Awaiting Auditor Review'}
                      {selectedPack.status === 'COLLECTING' && 'Evidence Collection in Progress'}
                      {selectedPack.status === 'REJECTED' && 'Pack Rejected — Review Required'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {selectedPack.status === 'ACCEPTED' && 'This clause has been verified as compliant.'}
                      {selectedPack.status === 'READY' && 'All evidence collected. Submit to the auditor.'}
                      {selectedPack.status === 'SUBMITTED' && 'The auditor is reviewing the evidence.'}
                      {selectedPack.status === 'COLLECTING' && 'The system is gathering evidence from linked modules.'}
                      {selectedPack.status === 'REJECTED' && 'The auditor has requested additional evidence.'}
                    </p>
                  </div>
                </div>
              </div>

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
