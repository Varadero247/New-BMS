'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  FileSpreadsheet,
  Search,
  AlertOctagon,
  Clock,
  CheckCircle,
  Trash2,
  Brain,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TrendingDown,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FmeaRow {
  id?: string;
  itemProcessStep: string;
  functionRequirement: string;
  failureMode: string;
  effectOfFailure: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  actionPriority: string;
  recommendedActions: string;
  assignedTo: string;
  dueDate: string;
  actionsTaken: string;
  revisedSeverity: number;
  revisedOccurrence: number;
  revisedDetection: number;
  revisedRpn: number;
  status: string;
  _isNew?: boolean;
  _isDeleted?: boolean;
  _isDirty?: boolean;
}

interface Fmea {
  id: string;
  referenceNumber?: string;
  fmeaType: string;
  title: string;
  productProcess: string;
  partNumberRev: string;
  customer: string;
  teamMembers: string;
  scopeDescription: string;
  linkedProcess: string;
  status: string;
  dateInitiated: string;
  nextReviewDate: string;
  rows: FmeaRow[];
  totalFailureModes: number;
  highRPNCount: number;
  openActions: number;
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

const FMEA_TYPES = ['DFMEA', 'PFMEA', 'SFMEA'] as const;

const FMEA_STATUSES = [
  'DRAFT',
  'IN_PROGRESS',
  'UNDER_REVIEW',
  'APPROVED',
  'IMPLEMENTED',
  'CLOSED',
] as const;

const ROW_STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CLOSED'] as const;

const _ACTION_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;

const typeLabels: Record<string, string> = {
  DFMEA: 'Design FMEA',
  PFMEA: 'Process FMEA',
  SFMEA: 'System FMEA',
};

const typeColors: Record<string, string> = {
  DFMEA: 'bg-blue-100 text-blue-700',
  PFMEA: 'bg-green-100 text-green-700',
  SFMEA: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  IMPLEMENTED: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

function rpnColor(rpn: number): string {
  if (rpn > 200) return 'bg-red-100 text-red-800';
  if (rpn >= 80) return 'bg-amber-100 text-amber-800';
  return 'bg-green-100 text-green-800';
}

function _rpnBadgeVariant(rpn: number): 'destructive' | 'warning' | 'success' {
  if (rpn > 200) return 'destructive';
  if (rpn >= 80) return 'warning';
  return 'success';
}

function createEmptyRow(): FmeaRow {
  return {
    itemProcessStep: '',
    functionRequirement: '',
    failureMode: '',
    effectOfFailure: '',
    severity: 1,
    occurrence: 1,
    detection: 1,
    rpn: 1,
    actionPriority: 'LOW',
    recommendedActions: '',
    assignedTo: '',
    dueDate: '',
    actionsTaken: '',
    revisedSeverity: 1,
    revisedOccurrence: 1,
    revisedDetection: 1,
    revisedRpn: 1,
    status: 'OPEN',
    _isNew: true,
    _isDirty: true,
  };
}

const emptyForm = {
  fmeaType: 'PFMEA' as string,
  title: '',
  productProcess: '',
  partNumberRev: '',
  customer: '',
  teamMembers: '',
  scopeDescription: '',
  linkedProcess: '',
  status: 'DRAFT' as string,
  dateInitiated: new Date().toISOString().split('T')[0],
  nextReviewDate: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FmeaClient() {
  // Data state
  const [fmeas, setFmeas] = useState<Fmea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Detail modal
  const [selectedFmea, setSelectedFmea] = useState<Fmea | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('header');

  // Rows editing
  const [rows, setRows] = useState<FmeaRow[]>([]);
  const [savingRow, setSavingRow] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis>({
    loading: false,
    result: null,
    error: null,
  });

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadFmeas = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('fmeaType', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/fmea?${params.toString()}`);
      setFmeas(response.data.data || []);
    } catch (err) {
      console.error('Failed to load FMEAs:', err);
      setError('Failed to load FMEAs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadFmeas();
  }, [loadFmeas]);

  async function loadFmeaDetail(id: string) {
    setDetailLoading(true);
    try {
      const response = await api.get(`/fmea/${id}`);
      const fmea = response.data.data;
      setSelectedFmea(fmea);
      setRows(fmea.rows || []);
      setActiveTab('header');
      setAiAnalysis({ loading: false, result: null, error: null });
      setExpandedRow(null);
      setShowDetail(true);
    } catch (err) {
      console.error('Failed to load FMEA detail:', err);
    } finally {
      setDetailLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // Create FMEA
  // -------------------------------------------------------------------------

  function openCreateModal() {
    setForm(emptyForm);
    setShowCreateModal(true);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/fmea', {
        ...form,
        dateInitiated: form.dateInitiated || undefined,
        nextReviewDate: form.nextReviewDate || undefined,
      });
      setShowCreateModal(false);
      setForm(emptyForm);
      loadFmeas();
    } catch (err) {
      console.error('Failed to create FMEA:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Row Management
  // -------------------------------------------------------------------------

  function addRow() {
    setRows((prev) => [...prev, createEmptyRow()]);
    setExpandedRow(rows.length);
  }

  function updateRow(index: number, field: keyof FmeaRow, value: string | number | boolean) {
    setRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value, _isDirty: true };

      // Auto-calculate RPN
      if (field === 'severity' || field === 'occurrence' || field === 'detection') {
        const s = field === 'severity' ? Number(value) : Number(row.severity);
        const o = field === 'occurrence' ? Number(value) : Number(row.occurrence);
        const d = field === 'detection' ? Number(value) : Number(row.detection);
        row.rpn = s * o * d;
      }

      // Auto-calculate revised RPN
      if (
        field === 'revisedSeverity' ||
        field === 'revisedOccurrence' ||
        field === 'revisedDetection'
      ) {
        const rs = field === 'revisedSeverity' ? Number(value) : Number(row.revisedSeverity);
        const ro = field === 'revisedOccurrence' ? Number(value) : Number(row.revisedOccurrence);
        const rd = field === 'revisedDetection' ? Number(value) : Number(row.revisedDetection);
        row.revisedRpn = rs * ro * rd;
      }

      // Auto-determine action priority from RPN
      if (field === 'severity' || field === 'occurrence' || field === 'detection') {
        if (row.rpn > 200) row.actionPriority = 'HIGH';
        else if (row.rpn >= 80) row.actionPriority = 'MEDIUM';
        else row.actionPriority = 'LOW';
      }

      updated[index] = row;
      return updated;
    });
  }

  async function saveRow(index: number) {
    const row = rows[index];
    if (!selectedFmea) return;
    const rowId = row.id || `new-${index}`;
    setSavingRow(rowId);
    try {
      const payload = {
        itemProcessStep: row.itemProcessStep,
        functionRequirement: row.functionRequirement,
        failureMode: row.failureMode,
        effectOfFailure: row.effectOfFailure,
        severity: Number(row.severity),
        occurrence: Number(row.occurrence),
        detection: Number(row.detection),
        rpn: Number(row.rpn),
        actionPriority: row.actionPriority,
        recommendedActions: row.recommendedActions,
        assignedTo: row.assignedTo,
        dueDate: row.dueDate || undefined,
        actionsTaken: row.actionsTaken,
        revisedSeverity: Number(row.revisedSeverity),
        revisedOccurrence: Number(row.revisedOccurrence),
        revisedDetection: Number(row.revisedDetection),
        revisedRpn: Number(row.revisedRpn),
        status: row.status,
      };

      if (row._isNew || !row.id) {
        const response = await api.post(`/fmea/${selectedFmea.id}/rows`, payload);
        const savedRow = response.data.data;
        setRows((prev) => {
          const updated = [...prev];
          updated[index] = { ...savedRow, _isNew: false, _isDirty: false };
          return updated;
        });
      } else {
        const response = await api.put(`/fmea/${selectedFmea.id}/rows/${row.id}`, payload);
        const savedRow = response.data.data;
        setRows((prev) => {
          const updated = [...prev];
          updated[index] = { ...savedRow, _isNew: false, _isDirty: false };
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to save row:', err);
    } finally {
      setSavingRow(null);
    }
  }

  async function deleteRow(index: number) {
    const row = rows[index];
    if (row._isNew || !row.id) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      if (expandedRow === index) setExpandedRow(null);
      return;
    }
    if (!selectedFmea) return;
    try {
      await api.delete(`/fmea/${selectedFmea.id}/rows/${row.id}`);
      setRows((prev) => prev.filter((_, i) => i !== index));
      if (expandedRow === index) setExpandedRow(null);
    } catch (err) {
      console.error('Failed to delete row:', err);
    }
  }

  // -------------------------------------------------------------------------
  // AI Analysis
  // -------------------------------------------------------------------------

  async function runAiAnalysis() {
    if (!selectedFmea) return;
    setAiAnalysis({ loading: true, result: null, error: null });
    try {
      const response = await api.post('/fmea/ai-analysis', {
        fmeaId: selectedFmea.id,
        fmeaType: selectedFmea.fmeaType,
        title: selectedFmea.title,
        productProcess: selectedFmea.productProcess,
        rows: rows.map((r) => ({
          failureMode: r.failureMode,
          effectOfFailure: r.effectOfFailure,
          severity: r.severity,
          occurrence: r.occurrence,
          detection: r.detection,
          rpn: r.rpn,
          recommendedActions: r.recommendedActions,
          actionsTaken: r.actionsTaken,
          revisedRpn: r.revisedRpn,
          status: r.status,
        })),
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

  const filtered = fmeas
    .filter((f) => typeFilter === 'all' || f.fmeaType === typeFilter)
    .filter((f) => statusFilter === 'all' || f.status === statusFilter)
    .filter(
      (f) =>
        !searchQuery ||
        f.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.productProcess?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = useMemo(
    () => ({
      total: fmeas.length,
      active: fmeas.filter((f) => f.status === 'IN_PROGRESS' || f.status === 'UNDER_REVIEW').length,
      highRpn: fmeas.reduce((sum, f) => sum + (f.highRPNCount || 0), 0),
      openActions: fmeas.reduce((sum, f) => sum + (f.openActions || 0), 0),
    }),
    [fmeas]
  );

  // Row summary (for detail view)
  const rowSummary = useMemo(() => {
    const nonDeletedRows = rows.filter((r) => !r._isDeleted);
    const totalModes = nonDeletedRows.length;
    const highRpn = nonDeletedRows.filter((r) => r.rpn > 200).length;
    const mediumRpn = nonDeletedRows.filter((r) => r.rpn >= 80 && r.rpn <= 200).length;
    const lowRpn = nonDeletedRows.filter((r) => r.rpn < 80).length;
    const openActs = nonDeletedRows.filter(
      (r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS'
    ).length;
    const avgInitialRpn =
      totalModes > 0 ? Math.round(nonDeletedRows.reduce((s, r) => s + r.rpn, 0) / totalModes) : 0;
    const revisedRows = nonDeletedRows.filter(
      (r) =>
        r.revisedRpn > 0 &&
        (r.revisedSeverity > 1 || r.revisedOccurrence > 1 || r.revisedDetection > 1)
    );
    const avgRevisedRpn =
      revisedRows.length > 0
        ? Math.round(revisedRows.reduce((s, r) => s + r.revisedRpn, 0) / revisedRows.length)
        : 0;
    return { totalModes, highRpn, mediumRpn, lowRpn, openActs, avgInitialRpn, avgRevisedRpn };
  }, [rows]);

  function _highestRpn(fmea: Fmea): number {
    // Use highRPNCount as heuristic; for cards we use stored max or fallback
    return fmea.highRPNCount || 0;
  }

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

  // -------------------------------------------------------------------------
  // Number Input Helper
  // -------------------------------------------------------------------------

  function NumberRating({
    value,
    onChange,
    max = 10,
  }: {
    value: number;
    onChange: (v: number) => void;
    max?: number;
  }) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-14 h-8 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">FMEA Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Failure Mode and Effects Analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadFmeas} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New FMEA
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total FMEAs</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileSpreadsheet className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">High RPN ({'>'}200)</p>
                  <p className="text-3xl font-bold text-red-600">{stats.highRpn}</p>
                </div>
                <AlertOctagon className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Open Actions</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.openActions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertOctagon className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadFmeas}>
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
                    aria-label="Search by title, reference, product..."
                    placeholder="Search by title, reference, product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  FMEA Type
                </Label>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  {FMEA_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {typeLabels[t] || t}
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
                  {FMEA_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FMEA List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                FMEA Records ({filtered.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((fmea) => (
                  <div
                    key={fmea.id}
                    onClick={() => loadFmeaDetail(fmea.id)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {fmea.referenceNumber && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {fmea.referenceNumber}
                            </span>
                          )}
                          <Badge
                            className={typeColors[fmea.fmeaType] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {typeLabels[fmea.fmeaType] || fmea.fmeaType}
                          </Badge>
                          <Badge
                            className={statusColors[fmea.status] || 'bg-gray-100 dark:bg-gray-800'}
                          >
                            {fmea.status?.replace(/_/g, ' ')}
                          </Badge>
                          {fmea.highRPNCount > 0 && (
                            <Badge variant="destructive">{fmea.highRPNCount} High RPN</Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {fmea.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          {fmea.productProcess && (
                            <span>Product/Process: {fmea.productProcess}</span>
                          )}
                          <span>{fmea.totalFailureModes || 0} failure modes</span>
                          <span>{fmea.openActions || 0} open actions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm ml-4 shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Rows</p>
                          <p className="font-bold">{fmea.totalFailureModes || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">High RPN</p>
                          <p
                            className={`font-bold ${fmea.highRPNCount > 0 ? 'text-red-600' : 'text-green-600'}`}
                          >
                            {fmea.highRPNCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileSpreadsheet className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  No FMEAs found
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by creating your first FMEA.'}
                </p>
                {!searchQuery && typeFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Create First FMEA
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* CREATE FMEA MODAL                                                 */}
      {/* ================================================================= */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New FMEA"
        size="full"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fmea-type">FMEA Type *</Label>
                <Select
                  id="fmea-type"
                  value={form.fmeaType}
                  onChange={(e) => setForm({ ...form, fmeaType: e.target.value })}
                >
                  {FMEA_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {typeLabels[t]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="fmea-status">Status</Label>
                <Select
                  id="fmea-status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {FMEA_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="fmea-title">Title *</Label>
              <Input
                id="fmea-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. PFMEA - Assembly Line A"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fmea-productProcess">Product / Process</Label>
                <Input
                  id="fmea-productProcess"
                  value={form.productProcess}
                  onChange={(e) => setForm({ ...form, productProcess: e.target.value })}
                  placeholder="Product or process name"
                />
              </div>
              <div>
                <Label htmlFor="fmea-partNumberRev">Part Number / Revision</Label>
                <Input
                  id="fmea-partNumberRev"
                  value={form.partNumberRev}
                  onChange={(e) => setForm({ ...form, partNumberRev: e.target.value })}
                  placeholder="e.g. PN-001 Rev B"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fmea-customer">Customer</Label>
                <Input
                  id="fmea-customer"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fmea-linkedProcess">Linked Process</Label>
                <Input
                  id="fmea-linkedProcess"
                  value={form.linkedProcess}
                  onChange={(e) => setForm({ ...form, linkedProcess: e.target.value })}
                  placeholder="Link to a QMS process"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fmea-teamMembers">Team Members</Label>
              <Textarea
                id="fmea-teamMembers"
                value={form.teamMembers}
                onChange={(e) => setForm({ ...form, teamMembers: e.target.value })}
                rows={2}
                placeholder="List team members (comma-separated)"
              />
            </div>

            <div>
              <Label htmlFor="fmea-scopeDescription">Scope Description</Label>
              <Textarea
                id="fmea-scopeDescription"
                value={form.scopeDescription}
                onChange={(e) => setForm({ ...form, scopeDescription: e.target.value })}
                rows={3}
                placeholder="Describe the scope and boundaries of this FMEA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fmea-dateInitiated">Date Initiated</Label>
                <Input
                  id="fmea-dateInitiated"
                  type="date"
                  value={form.dateInitiated}
                  onChange={(e) => setForm({ ...form, dateInitiated: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fmea-nextReviewDate">Next Review Date</Label>
                <Input
                  id="fmea-nextReviewDate"
                  type="date"
                  value={form.nextReviewDate}
                  onChange={(e) => setForm({ ...form, nextReviewDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create FMEA'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* DETAIL / ANALYSIS MODAL                                           */}
      {/* ================================================================= */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedFmea?.title || 'FMEA Detail'}
        size="full"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Loading FMEA details...</span>
          </div>
        ) : selectedFmea ? (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {[
                { id: 'header', label: 'Header' },
                { id: 'table', label: `Analysis Table (${rows.length})` },
                { id: 'summary', label: 'Summary' },
                { id: 'ai', label: 'AI Analysis' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {/* Tab A: FMEA Header */}
              {activeTab === 'header' && (
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">FMEA Type</p>
                        <Badge
                          className={
                            typeColors[selectedFmea.fmeaType] || 'bg-gray-100 dark:bg-gray-800'
                          }
                        >
                          {typeLabels[selectedFmea.fmeaType] || selectedFmea.fmeaType}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <Badge
                          className={
                            statusColors[selectedFmea.status] || 'bg-gray-100 dark:bg-gray-800'
                          }
                        >
                          {selectedFmea.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Reference</p>
                        <p className="text-sm font-mono">{selectedFmea.referenceNumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Product / Process
                        </p>
                        <p className="text-sm">{selectedFmea.productProcess || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Part Number / Revision
                        </p>
                        <p className="text-sm">{selectedFmea.partNumberRev || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="text-sm">{selectedFmea.customer || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date Initiated</p>
                        <p className="text-sm">{formatDate(selectedFmea.dateInitiated)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Next Review Date</p>
                        <p className="text-sm">{formatDate(selectedFmea.nextReviewDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Linked Process</p>
                        <p className="text-sm">{selectedFmea.linkedProcess || '-'}</p>
                      </div>
                    </div>
                    {selectedFmea.teamMembers && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Team Members</p>
                        <p className="text-sm mt-1">{selectedFmea.teamMembers}</p>
                      </div>
                    )}
                    {selectedFmea.scopeDescription && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Scope Description
                        </p>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {selectedFmea.scopeDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab B: FMEA Analysis Table */}
              {activeTab === 'table' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {rows.length} failure mode(s)
                    </p>
                    <Button onClick={addRow} className="flex items-center gap-2" size="sm">
                      <Plus className="h-4 w-4" />
                      Add Row
                    </Button>
                  </div>

                  {rows.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                      <FileSpreadsheet className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No failure modes added yet
                      </p>
                      <Button
                        onClick={addRow}
                        variant="outline"
                        className="flex items-center gap-2 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Add First Row
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      {/* Compact table header */}
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-2 py-2 text-left font-medium text-gray-600 w-8">#</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600 min-w-[120px]">
                              Step / Item
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600 min-w-[120px]">
                              Failure Mode
                            </th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600 min-w-[100px]">
                              Effect
                            </th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600 w-12">
                              S
                            </th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600 w-12">
                              O
                            </th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600 w-12">
                              D
                            </th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600 w-16">
                              RPN
                            </th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600 w-16">
                              Priority
                            </th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600 w-14">
                              Status
                            </th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600 w-20">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, index) => {
                            const isExpanded = expandedRow === index;
                            const isSaving = savingRow === (row.id || `new-${index}`);
                            return (
                              <React.Fragment key={row.id || `new-${index}`}>
                                {/* Compact row */}
                                <tr
                                  className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 ${row._isDirty ? 'bg-yellow-50' : ''}`}
                                >
                                  <td className="px-2 py-2 text-gray-400 dark:text-gray-500">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.itemProcessStep}
                                      onChange={(e) =>
                                        updateRow(index, 'itemProcessStep', e.target.value)
                                      }
                                      className="w-full border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Process step"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.failureMode}
                                      onChange={(e) =>
                                        updateRow(index, 'failureMode', e.target.value)
                                      }
                                      className="w-full border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Failure mode"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      type="text"
                                      value={row.effectOfFailure}
                                      onChange={(e) =>
                                        updateRow(index, 'effectOfFailure', e.target.value)
                                      }
                                      className="w-full border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Effect"
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <NumberRating
                                      value={row.severity}
                                      onChange={(v) => updateRow(index, 'severity', v)}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <NumberRating
                                      value={row.occurrence}
                                      onChange={(v) => updateRow(index, 'occurrence', v)}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <NumberRating
                                      value={row.detection}
                                      onChange={(v) => updateRow(index, 'detection', v)}
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <Badge className={rpnColor(row.rpn)}>{row.rpn}</Badge>
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <Badge
                                      className={
                                        row.actionPriority === 'HIGH'
                                          ? 'bg-red-100 text-red-800'
                                          : row.actionPriority === 'MEDIUM'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-green-100 text-green-800'
                                      }
                                    >
                                      {row.actionPriority}
                                    </Badge>
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <select
                                      value={row.status}
                                      onChange={(e) => updateRow(index, 'status', e.target.value)}
                                      className="text-xs border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5"
                                    >
                                      {ROW_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                          {s.replace(/_/g, ' ')}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <div className="flex items-center gap-1 justify-center">
                                      <button
                                        type="button"
                                        onClick={() => setExpandedRow(isExpanded ? null : index)}
                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 transition-colors"
                                        title={isExpanded ? 'Collapse' : 'Expand'}
                                      >
                                        {isExpanded ? (
                                          <ChevronUp className="h-3 w-3" />
                                        ) : (
                                          <ChevronDown className="h-3 w-3" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => saveRow(index)}
                                        disabled={isSaving}
                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
                                        title="Save row"
                                      >
                                        {isSaving ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <CheckCircle className="h-3 w-3" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteRow(index)}
                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                                        title="Delete row"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Expanded row detail */}
                                {isExpanded && (
                                  <tr className="bg-gray-50 dark:bg-gray-800">
                                    <td colSpan={11} className="px-4 py-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs font-medium text-gray-600 block mb-1">
                                            Function / Requirement
                                          </label>
                                          <textarea
                                            value={row.functionRequirement}
                                            onChange={(e) =>
                                              updateRow(
                                                index,
                                                'functionRequirement',
                                                e.target.value
                                              )
                                            }
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            rows={2}
                                            placeholder="Function or requirement being analysed"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-gray-600 block mb-1">
                                            Recommended Actions
                                          </label>
                                          <textarea
                                            value={row.recommendedActions}
                                            onChange={(e) =>
                                              updateRow(index, 'recommendedActions', e.target.value)
                                            }
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            rows={2}
                                            placeholder="Recommended corrective/preventive actions"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">
                                              Assigned To
                                            </label>
                                            <input
                                              type="text"
                                              value={row.assignedTo}
                                              onChange={(e) =>
                                                updateRow(index, 'assignedTo', e.target.value)
                                              }
                                              className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                              placeholder="Assignee"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">
                                              Due Date
                                            </label>
                                            <input
                                              type="date"
                                              value={row.dueDate ? row.dueDate.split('T')[0] : ''}
                                              onChange={(e) =>
                                                updateRow(index, 'dueDate', e.target.value)
                                              }
                                              className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-gray-600 block mb-1">
                                            Actions Taken
                                          </label>
                                          <textarea
                                            value={row.actionsTaken}
                                            onChange={(e) =>
                                              updateRow(index, 'actionsTaken', e.target.value)
                                            }
                                            className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            rows={2}
                                            placeholder="Actions taken to date"
                                          />
                                        </div>

                                        {/* Revised ratings */}
                                        <div className="col-span-2">
                                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-2">
                                            <TrendingDown className="h-3 w-3" />
                                            Revised Ratings (Post-Action)
                                          </h4>
                                          <div className="flex items-center gap-4 flex-wrap">
                                            <div className="flex items-center gap-2">
                                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                                S:
                                              </label>
                                              <NumberRating
                                                value={row.revisedSeverity}
                                                onChange={(v) =>
                                                  updateRow(index, 'revisedSeverity', v)
                                                }
                                              />
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                                O:
                                              </label>
                                              <NumberRating
                                                value={row.revisedOccurrence}
                                                onChange={(v) =>
                                                  updateRow(index, 'revisedOccurrence', v)
                                                }
                                              />
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                                D:
                                              </label>
                                              <NumberRating
                                                value={row.revisedDetection}
                                                onChange={(v) =>
                                                  updateRow(index, 'revisedDetection', v)
                                                }
                                              />
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <label className="text-xs text-gray-500 dark:text-gray-400">
                                                Revised RPN:
                                              </label>
                                              <Badge className={rpnColor(row.revisedRpn)}>
                                                {row.revisedRpn}
                                              </Badge>
                                            </div>
                                            {row.rpn > 0 &&
                                              row.revisedRpn > 0 &&
                                              row.revisedRpn < row.rpn && (
                                                <span className="text-xs text-green-600 flex items-center gap-1">
                                                  <TrendingDown className="h-3 w-3" />
                                                  {Math.round(
                                                    ((row.rpn - row.revisedRpn) / row.rpn) * 100
                                                  )}
                                                  % reduction
                                                </span>
                                              )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex justify-end mt-3">
                                        <Button
                                          size="sm"
                                          onClick={() => saveRow(index)}
                                          disabled={isSaving}
                                          className="flex items-center gap-2"
                                        >
                                          {isSaving ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <CheckCircle className="h-3 w-3" />
                                          )}
                                          Save Row
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab C: Summary */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                      FMEA Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold">{rowSummary.totalModes}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Total Failure Modes
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">{rowSummary.highRpn}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          High RPN ({'>'}200)
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-amber-600">{rowSummary.mediumRpn}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Medium RPN (80-200)
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">{rowSummary.lowRpn}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Low RPN ({'<'}80)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-amber-600">{rowSummary.openActs}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Open Actions
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold">{rowSummary.avgInitialRpn}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Avg Initial RPN
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {rowSummary.avgRevisedRpn}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Avg Revised RPN
                        </p>
                        {rowSummary.avgInitialRpn > 0 &&
                          rowSummary.avgRevisedRpn > 0 &&
                          rowSummary.avgRevisedRpn < rowSummary.avgInitialRpn && (
                            <p className="text-xs text-green-600 mt-1">
                              {Math.round(
                                ((rowSummary.avgInitialRpn - rowSummary.avgRevisedRpn) /
                                  rowSummary.avgInitialRpn) *
                                  100
                              )}
                              % improvement
                            </p>
                          )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* RPN Distribution Bar */}
                  {rowSummary.totalModes > 0 && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        RPN Distribution
                      </h4>
                      <div className="flex h-6 rounded-full overflow-hidden">
                        {rowSummary.highRpn > 0 && (
                          <div
                            className="bg-red-500 flex items-center justify-center text-white text-xs"
                            style={{
                              width: `${(rowSummary.highRpn / rowSummary.totalModes) * 100}%`,
                            }}
                          >
                            {rowSummary.highRpn}
                          </div>
                        )}
                        {rowSummary.mediumRpn > 0 && (
                          <div
                            className="bg-amber-400 flex items-center justify-center text-white text-xs"
                            style={{
                              width: `${(rowSummary.mediumRpn / rowSummary.totalModes) * 100}%`,
                            }}
                          >
                            {rowSummary.mediumRpn}
                          </div>
                        )}
                        {rowSummary.lowRpn > 0 && (
                          <div
                            className="bg-green-500 flex items-center justify-center text-white text-xs"
                            style={{
                              width: `${(rowSummary.lowRpn / rowSummary.totalModes) * 100}%`,
                            }}
                          >
                            {rowSummary.lowRpn}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-red-500" /> High ({'>'}200)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-amber-400" /> Medium (80-200)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-green-500" /> Low ({'<'}80)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab D: AI FMEA Analysis */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI FMEA Analysis
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={runAiAnalysis}
                        disabled={aiAnalysis.loading}
                        className="flex items-center gap-2"
                      >
                        {aiAnalysis.loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analysing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4" />
                            Run Analysis
                          </>
                        )}
                      </Button>
                    </div>
                    {aiAnalysis.loading && (
                      <div className="flex items-center gap-3 text-sm text-blue-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>
                          AI is analysing failure modes, risk patterns, and generating
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
                          analysisType="FMEA Analysis"
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
                        Click &quot;Run Analysis&quot; to get AI-powered analysis of failure modes,
                        detection strategies, and risk reduction recommendations.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDetail(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
