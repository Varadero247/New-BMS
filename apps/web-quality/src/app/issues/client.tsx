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
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Eye,
  RefreshCw,
  X,
  Building2,
  Flag,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InterestedParty {
  id: string;
  partyName: string;
}

interface Issue {
  id: string;
  issueOfConcern: string;
  bias: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'MONITORING' | 'RESOLVED' | 'CLOSED';
  notes?: string;
  party?: InterestedParty;
  partyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface IssueForm {
  issueOfConcern: string;
  bias: string;
  priority: string;
  status: string;
  notes: string;
  partyId: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    issueOfConcern: 'Increasing regulatory scrutiny in EU markets',
    bias: 'NEGATIVE',
    priority: 'HIGH',
    status: 'MONITORING',
    notes: 'Track ESRS developments',
  },
  {
    id: '2',
    issueOfConcern: 'New ISO 9001:2025 revision expected',
    bias: 'NEGATIVE',
    priority: 'MEDIUM',
    status: 'OPEN',
  },
  {
    id: '3',
    issueOfConcern: 'Digital transformation enabling process automation',
    bias: 'POSITIVE',
    priority: 'HIGH',
    status: 'MONITORING',
  },
  {
    id: '4',
    issueOfConcern: 'Key supplier consolidation reducing competition',
    bias: 'NEGATIVE',
    priority: 'MEDIUM',
    status: 'OPEN',
  },
  {
    id: '5',
    issueOfConcern: 'Remote working improving talent pool access',
    bias: 'POSITIVE',
    priority: 'LOW',
    status: 'RESOLVED',
  },
];

const BIAS_OPTIONS = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const STATUS_OPTIONS = ['OPEN', 'MONITORING', 'RESOLVED', 'CLOSED'] as const;

const biasColors: Record<string, string> = {
  POSITIVE: 'bg-green-100 text-green-800',
  NEGATIVE: 'bg-red-100 text-red-800',
  NEUTRAL: 'bg-gray-100 text-gray-700',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-900',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  MONITORING: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const emptyForm: IssueForm = {
  issueOfConcern: '',
  bias: 'NEGATIVE',
  priority: 'MEDIUM',
  status: 'OPEN',
  notes: '',
  partyId: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function BiasIcon({ bias }: { bias: string }) {
  if (bias === 'POSITIVE') return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (bias === 'NEGATIVE') return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
}

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IssuesClient() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parties, setParties] = useState<InterestedParty[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [biasFilter, setBiasFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<IssueForm>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Detail modal
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get('/issues');
      const data = r.data.data;
      const items: Issue[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : MOCK_ISSUES;
      setIssues(items.length > 0 ? items : MOCK_ISSUES);
    } catch {
      // Fall back to mock data so the page is always usable
      setIssues(MOCK_ISSUES);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadParties = useCallback(async () => {
    try {
      const r = await api.get('/interested-parties');
      const data = r.data.data;
      setParties(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
    } catch {
      setParties([]);
    }
  }, []);

  useEffect(() => {
    loadIssues();
    loadParties();
  }, [loadIssues, loadParties]);

  // -------------------------------------------------------------------------
  // Derived / Filtering
  // -------------------------------------------------------------------------

  const filtered = useMemo(() => {
    return issues
      .filter((i) => biasFilter === 'all' || i.bias === biasFilter)
      .filter((i) => statusFilter === 'all' || i.status === statusFilter)
      .filter((i) => priorityFilter === 'all' || i.priority === priorityFilter)
      .filter(
        (i) =>
          !searchQuery ||
          i.issueOfConcern.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.notes ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [issues, biasFilter, statusFilter, priorityFilter, searchQuery]);

  const counts = useMemo(
    () => ({
      open: issues.filter((i) => i.status === 'OPEN').length,
      monitoring: issues.filter((i) => i.status === 'MONITORING').length,
      resolved: issues.filter((i) => i.status === 'RESOLVED').length,
      total: issues.length,
    }),
    [issues]
  );

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.issueOfConcern.trim()) {
      setFormError('Issue of Concern is required.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await api.post('/issues', {
        issueOfConcern: form.issueOfConcern,
        bias: form.bias,
        priority: form.priority,
        status: form.status,
        notes: form.notes || undefined,
        partyId: form.partyId || undefined,
      });
      setShowAddModal(false);
      setForm({ ...emptyForm });
      loadIssues();
    } catch {
      setFormError('Failed to create issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function openDetail(issue: Issue) {
    setSelectedIssue(issue);
    setShowDetailModal(true);
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
              Issues of Concern
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 9001 Cl. 4.1 — Context of the Organisation: internal &amp; external issues
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadIssues} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                setForm({ ...emptyForm });
                setFormError(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Issue
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                  <p className="text-3xl font-bold text-blue-600">{counts.open}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monitoring</p>
                  <p className="text-3xl font-bold text-purple-600">{counts.monitoring}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{counts.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-gray-400">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Issues</p>
                  <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{counts.total}</p>
                </div>
                <Flag className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadIssues}>
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
                    aria-label="Search issues"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>
              <div className="min-w-[140px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Bias</Label>
                <Select value={biasFilter} onChange={(e) => setBiasFilter(e.target.value)}>
                  <option value="all">All Biases</option>
                  {BIAS_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[140px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Status</Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[140px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Priority</Label>
                <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="all">All Priorities</option>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-500" />
              Issues ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Issue of Concern</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Bias</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Linked Party</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Notes</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((issue) => (
                      <tr
                        key={issue.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-start gap-2">
                            <BiasIcon bias={issue.bias} />
                            <span className="text-gray-900 dark:text-gray-100 font-medium line-clamp-2">
                              {issue.issueOfConcern}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${biasColors[issue.bias]}`}>
                            {issue.bias}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
                            {issue.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                          {issue.party?.partyName ?? '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs max-w-[180px]">
                          <span className="line-clamp-1">{issue.notes ?? '—'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => openDetail(issue)}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-purple-600 transition-colors"
                            aria-label="View detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <AlertTriangle className="h-14 w-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  No issues found
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery || biasFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Start by adding your first issue of concern.'}
                </p>
                {!searchQuery && biasFilter === 'all' && statusFilter === 'all' && priorityFilter === 'all' && (
                  <Button
                    onClick={() => { setForm({ ...emptyForm }); setShowAddModal(true); }}
                    className="flex items-center gap-2 mx-auto bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Issue
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===================================================================
          ADD MODAL (inline fixed overlay)
          =================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Add Issue of Concern
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ISO 9001 Cl. 4.1</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <Label htmlFor="issue-concern">Issue of Concern *</Label>
                <Textarea
                  id="issue-concern"
                  value={form.issueOfConcern}
                  onChange={(e) => setForm({ ...form, issueOfConcern: e.target.value })}
                  rows={3}
                  required
                  placeholder="Describe the internal or external issue..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issue-bias">Bias *</Label>
                  <Select
                    id="issue-bias"
                    value={form.bias}
                    onChange={(e) => setForm({ ...form, bias: e.target.value })}
                  >
                    {BIAS_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="issue-priority">Priority *</Label>
                  <Select
                    id="issue-priority"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="issue-status">Status</Label>
                <Select
                  id="issue-status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>

              {parties.length > 0 && (
                <div>
                  <Label htmlFor="issue-party">Linked Interested Party</Label>
                  <Select
                    id="issue-party"
                    value={form.partyId}
                    onChange={(e) => setForm({ ...form, partyId: e.target.value })}
                  >
                    <option value="">None</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>{p.partyName}</option>
                    ))}
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="issue-notes">Notes</Label>
                <Textarea
                  id="issue-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Optional monitoring notes or actions to take..."
                />
              </div>

              {/* Bias preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <BiasIcon bias={form.bias} />
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${biasColors[form.bias]}`}>
                    {form.bias}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[form.priority]}`}>
                    {form.priority}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[form.status]}`}>
                    {form.status}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {submitting ? 'Saving...' : 'Add Issue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          DETAIL MODAL (inline fixed overlay)
          =================================================================== */}
      {showDetailModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <BiasIcon bias={selectedIssue.bias} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Issue Detail
                </h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                  Issue of Concern
                </p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {selectedIssue.issueOfConcern}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Bias</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${biasColors[selectedIssue.bias]}`}>
                    {selectedIssue.bias}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Priority</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[selectedIssue.priority]}`}>
                    {selectedIssue.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedIssue.status]}`}>
                    {selectedIssue.status}
                  </span>
                </div>
              </div>

              {selectedIssue.party && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Linked Interested Party</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedIssue.party.partyName}
                    </span>
                  </div>
                </div>
              )}

              {selectedIssue.notes && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    {selectedIssue.notes}
                  </p>
                </div>
              )}

              {selectedIssue.createdAt && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Recorded: {formatDate(selectedIssue.createdAt)}
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
