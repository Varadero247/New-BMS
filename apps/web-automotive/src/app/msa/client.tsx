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
  Textarea } from '@ims/ui';
import {
  Plus,
  BarChart3,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  XCircle } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MsaMeasurement {
  id: string;
  operator: string;
  partNumber: number;
  trialNumber: number;
  value: number;
  createdAt: string;
}

interface MsaResults {
  repeatability: number;
  reproducibility: number;
  totalGRR: number;
  ndc: number;
  result: string;
}

interface MsaStudy {
  id: string;
  referenceNumber?: string;
  title: string;
  studyType: string;
  gageName: string;
  gageId: string;
  characteristic: string;
  specification?: string;
  tolerance?: number;
  operators: string;
  numParts: number;
  numTrials: number;
  status: string;
  result?: string;
  grrPercent?: number;
  measurements?: MsaMeasurement[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MSA_STATUSES = ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;

const STUDY_TYPES = ['GRR', 'BIAS', 'LINEARITY', 'STABILITY', 'ATTRIBUTE'] as const;

const studyTypeLabels: Record<string, string> = {
  GRR: 'Gage R&R',
  BIAS: 'Bias Study',
  LINEARITY: 'Linearity Study',
  STABILITY: 'Stability Study',
  ATTRIBUTE: 'Attribute Study' };

const RESULT_VALUES = ['ACCEPTABLE', 'MARGINAL', 'UNACCEPTABLE'] as const;

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700' };

const resultColors: Record<string, string> = {
  ACCEPTABLE: 'bg-green-100 text-green-700',
  MARGINAL: 'bg-yellow-100 text-yellow-700',
  UNACCEPTABLE: 'bg-red-100 text-red-700' };

const emptyForm = {
  title: '',
  studyType: 'GRR' as string,
  gageName: '',
  gageId: '',
  characteristic: '',
  specification: '',
  tolerance: '',
  operators: '',
  numParts: '10',
  numTrials: '3',
  notes: '' };

const emptyDataForm = {
  operator: '',
  partNumber: '1',
  trialNumber: '1',
  value: '' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MsaClient() {
  // Data state
  const [studies, setStudies] = useState<MsaStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studyTypeFilter, setStudyTypeFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Detail view
  const [selectedStudy, setSelectedStudy] = useState<MsaStudy | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [results, setResults] = useState<MsaResults | null>(null);
  const [dataForm, setDataForm] = useState(emptyDataForm);
  const [addingData, setAddingData] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadStudies = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (studyTypeFilter !== 'all') params.append('studyType', studyTypeFilter);
      if (resultFilter !== 'all') params.append('result', resultFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/msa?${params.toString()}`);
      setStudies(response.data.data || []);
    } catch (err) {
      console.error('Failed to load MSA studies:', err);
      setError('Failed to load MSA studies. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, studyTypeFilter, resultFilter, searchQuery]);

  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

  // -------------------------------------------------------------------------
  // Create Study
  // -------------------------------------------------------------------------

  function openCreateModal() {
    setForm(emptyForm);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        studyType: form.studyType,
        gageName: form.gageName,
        gageId: form.gageId,
        characteristic: form.characteristic,
        specification: form.specification || undefined,
        tolerance: form.tolerance ? parseFloat(form.tolerance) : undefined,
        operators: form.operators,
        numParts: parseInt(form.numParts),
        numTrials: parseInt(form.numTrials),
        notes: form.notes || undefined };
      await api.post('/msa', payload);
      setShowModal(false);
      setForm(emptyForm);
      loadStudies();
    } catch (err) {
      console.error('Failed to create MSA study:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Detail View
  // -------------------------------------------------------------------------

  async function openDetail(study: MsaStudy) {
    setShowDetail(true);
    setDetailLoading(true);
    setResults(null);
    setDataForm({ ...emptyDataForm });
    try {
      const [detailRes, resultsRes] = await Promise.all([
        api.get(`/msa/${study.id}`),
        api.get(`/msa/${study.id}/results`).catch(() => ({ data: { data: null } })),
      ]);
      const detail = detailRes.data.data || study;
      setSelectedStudy(detail);
      setResults(resultsRes.data.data || null);
      // Pre-fill operator from study operators list
      const ops = (detail.operators || '')
        .split(',')
        .map((o: string) => o.trim())
        .filter(Boolean);
      if (ops.length > 0) {
        setDataForm((prev) => ({ ...prev, operator: ops[0] }));
      }
    } catch (err) {
      console.error('Failed to load MSA study detail:', err);
      setSelectedStudy(study);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAddMeasurement(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudy || !dataForm.value) return;
    setAddingData(true);
    try {
      await api.post(`/msa/${selectedStudy.id}/data`, {
        operator: dataForm.operator,
        partNumber: parseInt(dataForm.partNumber),
        trialNumber: parseInt(dataForm.trialNumber),
        value: parseFloat(dataForm.value) });
      // Increment trial, then part, then operator
      const numTrials = selectedStudy.numTrials || 3;
      const numParts = selectedStudy.numParts || 10;
      const ops = (selectedStudy.operators || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      let nextTrial = parseInt(dataForm.trialNumber) + 1;
      let nextPart = parseInt(dataForm.partNumber);
      let nextOpIdx = ops.indexOf(dataForm.operator);

      if (nextTrial > numTrials) {
        nextTrial = 1;
        nextPart = nextPart + 1;
        if (nextPart > numParts) {
          nextPart = 1;
          nextOpIdx = (nextOpIdx + 1) % ops.length;
        }
      }

      setDataForm({
        operator: ops[nextOpIdx] || dataForm.operator,
        partNumber: String(nextPart),
        trialNumber: String(nextTrial),
        value: '' });

      // Reload detail and results
      const [detailRes, resultsRes] = await Promise.all([
        api.get(`/msa/${selectedStudy.id}`),
        api.get(`/msa/${selectedStudy.id}/results`).catch(() => ({ data: { data: null } })),
      ]);
      setSelectedStudy(detailRes.data.data);
      setResults(resultsRes.data.data || null);
      loadStudies();
    } catch (err) {
      console.error('Failed to add measurement:', err);
    } finally {
      setAddingData(false);
    }
  }

  // -------------------------------------------------------------------------
  // Filtering & Stats
  // -------------------------------------------------------------------------

  const filtered = studies
    .filter((s) => statusFilter === 'all' || s.status === statusFilter)
    .filter((s) => studyTypeFilter === 'all' || s.studyType === studyTypeFilter)
    .filter((s) => resultFilter === 'all' || s.result === resultFilter)
    .filter(
      (s) =>
        !searchQuery ||
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.gageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.characteristic?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = useMemo(
    () => ({
      total: studies.length,
      inProgress: studies.filter((s) => s.status === 'IN_PROGRESS').length,
      acceptable: studies.filter((s) => s.result === 'ACCEPTABLE').length,
      unacceptable: studies.filter((s) => s.result === 'UNACCEPTABLE').length }),
    [studies]
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
        year: 'numeric' });
    } catch {
      return '-';
    }
  }

  function getGrrColor(grr: number): string {
    if (grr <= 10) return 'text-green-600 bg-green-50';
    if (grr <= 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }

  function getGrrLabel(grr: number): string {
    if (grr <= 10) return 'Acceptable';
    if (grr <= 30) return 'Marginal';
    return 'Unacceptable';
  }

  function getNdcColor(ndc: number): string {
    if (ndc >= 5) return 'text-green-600 bg-green-50';
    if (ndc >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">MSA Studies</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Measurement System Analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadStudies} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" />
              New Study
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Studies</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Acceptable</p>
                  <p className="text-3xl font-bold text-green-600">{stats.acceptable}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unacceptable</p>
                  <p className="text-3xl font-bold text-red-600">{stats.unacceptable}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
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
            <Button variant="outline" size="sm" onClick={loadStudies}>
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
                    aria-label="Search by title, reference, gage name, characteristic..."
                    placeholder="Search by title, reference, gage name, characteristic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="min-w-[140px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Status
                </Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {MSA_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[140px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Study Type
                </Label>
                <Select
                  value={studyTypeFilter}
                  onChange={(e) => setStudyTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {STUDY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {studyTypeLabels[t] || t}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[140px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Result
                </Label>
                <Select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}>
                  <option value="all">All Results</option>
                  {RESULT_VALUES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Studies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                MSA Studies ({filtered.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Ref #</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">
                        Study Type
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Gage Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">
                        Characteristic
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">GR&R %</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Result</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((study) => (
                      <tr
                        key={study.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {study.referenceNumber || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {study.title}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="bg-orange-100 text-orange-700">
                            {studyTypeLabels[study.studyType] || study.studyType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {study.gageName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {study.characteristic}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={
                              statusColors[study.status] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {study.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {study.grrPercent != null ? (
                            <span
                              className={`text-sm font-bold ${
                                study.grrPercent <= 10
                                  ? 'text-green-600'
                                  : study.grrPercent <= 30
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {study.grrPercent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {study.result ? (
                            <Badge
                              className={
                                resultColors[study.result] ||
                                'bg-gray-100 dark:bg-gray-800 text-gray-700'
                              }
                            >
                              {study.result}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => openDetail(study)}
                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                            title="View details"
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
                <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  No MSA studies found
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery ||
                  statusFilter !== 'all' ||
                  studyTypeFilter !== 'all' ||
                  resultFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by creating your first MSA study.'}
                </p>
                {!searchQuery &&
                  statusFilter === 'all' &&
                  studyTypeFilter === 'all' &&
                  resultFilter === 'all' && (
                    <Button
                      onClick={openCreateModal}
                      className="flex items-center gap-2 mx-auto bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Study
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New MSA Study" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div>
              <Label htmlFor="msa-title">Study Title *</Label>
              <Input
                id="msa-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Bore Diameter GR&R Study"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="msa-studyType">Study Type</Label>
                <Select
                  id="msa-studyType"
                  value={form.studyType}
                  onChange={(e) => setForm({ ...form, studyType: e.target.value })}
                >
                  {STUDY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {studyTypeLabels[t] || t}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="msa-characteristic">Characteristic *</Label>
                <Input
                  id="msa-characteristic"
                  value={form.characteristic}
                  onChange={(e) => setForm({ ...form, characteristic: e.target.value })}
                  required
                  placeholder="e.g. Bore Diameter"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="msa-gageName">Gage Name *</Label>
                <Input
                  id="msa-gageName"
                  value={form.gageName}
                  onChange={(e) => setForm({ ...form, gageName: e.target.value })}
                  required
                  placeholder="e.g. Digital Bore Gauge"
                />
              </div>
              <div>
                <Label htmlFor="msa-gageId">Gage ID *</Label>
                <Input
                  id="msa-gageId"
                  value={form.gageId}
                  onChange={(e) => setForm({ ...form, gageId: e.target.value })}
                  required
                  placeholder="e.g. BG-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="msa-specification">Specification</Label>
                <Input
                  id="msa-specification"
                  value={form.specification}
                  onChange={(e) => setForm({ ...form, specification: e.target.value })}
                  placeholder="e.g. 25.00 +/- 0.05 mm"
                />
              </div>
              <div>
                <Label htmlFor="msa-tolerance">Tolerance</Label>
                <Input
                  id="msa-tolerance"
                  type="number"
                  step="any"
                  value={form.tolerance}
                  onChange={(e) => setForm({ ...form, tolerance: e.target.value })}
                  placeholder="e.g. 0.10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="msa-operators">Operators (comma-separated) *</Label>
              <Input
                id="msa-operators"
                value={form.operators}
                onChange={(e) => setForm({ ...form, operators: e.target.value })}
                required
                placeholder="e.g. John, Jane, Bob"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="msa-numParts">Number of Parts</Label>
                <Input
                  id="msa-numParts"
                  type="number"
                  min="1"
                  max="30"
                  value={form.numParts}
                  onChange={(e) => setForm({ ...form, numParts: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div>
                <Label htmlFor="msa-numTrials">Number of Trials</Label>
                <Input
                  id="msa-numTrials"
                  type="number"
                  min="1"
                  max="10"
                  value={form.numTrials}
                  onChange={(e) => setForm({ ...form, numTrials: e.target.value })}
                  placeholder="3"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="msa-notes">Notes</Label>
              <Textarea
                id="msa-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes or comments"
              />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {submitting ? 'Creating...' : 'Create Study'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* DETAIL MODAL                                                      */}
      {/* ================================================================= */}
      <Modal
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedStudy(null);
          setResults(null);
        }}
        title={selectedStudy?.title || 'MSA Study Detail'}
        size="lg"
      >
        {detailLoading ? (
          <div className="py-12">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ) : selectedStudy ? (
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedStudy.referenceNumber && (
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                  {selectedStudy.referenceNumber}
                </span>
              )}
              <Badge className="bg-orange-100 text-orange-700">
                {studyTypeLabels[selectedStudy.studyType] || selectedStudy.studyType}
              </Badge>
              <Badge
                className={statusColors[selectedStudy.status] || 'bg-gray-100 dark:bg-gray-800'}
              >
                {selectedStudy.status?.replace(/_/g, ' ')}
              </Badge>
              {selectedStudy.result && (
                <Badge
                  className={resultColors[selectedStudy.result] || 'bg-gray-100 dark:bg-gray-800'}
                >
                  {selectedStudy.result}
                </Badge>
              )}
            </div>

            {/* Study Info */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                Study Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gage Name</p>
                  <p className="text-sm font-medium">{selectedStudy.gageName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gage ID</p>
                  <p className="text-sm font-medium font-mono">{selectedStudy.gageId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Characteristic</p>
                  <p className="text-sm font-medium">{selectedStudy.characteristic}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Specification</p>
                  <p className="text-sm font-medium">{selectedStudy.specification || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tolerance</p>
                  <p className="text-sm font-medium">
                    {selectedStudy.tolerance !== null ? selectedStudy.tolerance : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Operators</p>
                  <p className="text-sm font-medium">{selectedStudy.operators}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Parts x Trials</p>
                  <p className="text-sm font-medium">
                    {selectedStudy.numParts} x {selectedStudy.numTrials}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm">{formatDate(selectedStudy.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Measurements Expected
                  </p>
                  <p className="text-sm font-medium">
                    {(selectedStudy.operators || '').split(',').filter((o) => o.trim()).length *
                      selectedStudy.numParts *
                      selectedStudy.numTrials}
                  </p>
                </div>
              </div>
            </div>

            {/* Results Display */}
            {results && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  GR&R Results
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className={`text-center p-3 rounded-lg ${getGrrColor(results.repeatability)}`}
                  >
                    <p className="text-xs font-medium opacity-70">Repeatability</p>
                    <p className="text-2xl font-bold">{results.repeatability.toFixed(1)}%</p>
                    <p className="text-xs mt-1">Equipment Variation</p>
                  </div>
                  <div
                    className={`text-center p-3 rounded-lg ${getGrrColor(results.reproducibility)}`}
                  >
                    <p className="text-xs font-medium opacity-70">Reproducibility</p>
                    <p className="text-2xl font-bold">{results.reproducibility.toFixed(1)}%</p>
                    <p className="text-xs mt-1">Appraiser Variation</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${getGrrColor(results.totalGRR)}`}>
                    <p className="text-xs font-medium opacity-70">Total GR&R</p>
                    <p className="text-2xl font-bold">{results.totalGRR.toFixed(1)}%</p>
                    <p className="text-xs mt-1">{getGrrLabel(results.totalGRR)}</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${getNdcColor(results.ndc)}`}>
                    <p className="text-xs font-medium opacity-70">NDC</p>
                    <p className="text-2xl font-bold">{results.ndc}</p>
                    <p className="text-xs mt-1">
                      {results.ndc >= 5
                        ? 'Acceptable'
                        : results.ndc >= 3
                          ? 'Marginal'
                          : 'Unacceptable'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                  <Badge
                    className={`text-lg px-4 py-1 ${resultColors[results.result] || 'bg-gray-100 dark:bg-gray-800'}`}
                  >
                    {results.result}
                  </Badge>
                </div>
              </div>
            )}

            {/* Data Entry Form */}
            {selectedStudy.status !== 'COMPLETED' && selectedStudy.status !== 'CANCELLED' && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Add Measurement
                </h3>
                <form onSubmit={handleAddMeasurement} className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[120px]">
                    <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Operator *
                    </Label>
                    <Select
                      value={dataForm.operator}
                      onChange={(e) => setDataForm({ ...dataForm, operator: e.target.value })}
                      required
                    >
                      <option value="">Select...</option>
                      {(selectedStudy.operators || '')
                        .split(',')
                        .map((o) => o.trim())
                        .filter(Boolean)
                        .map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                    </Select>
                  </div>
                  <div className="w-20">
                    <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Part #
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max={String(selectedStudy.numParts)}
                      value={dataForm.partNumber}
                      onChange={(e) => setDataForm({ ...dataForm, partNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Trial #
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max={String(selectedStudy.numTrials)}
                      value={dataForm.trialNumber}
                      onChange={(e) => setDataForm({ ...dataForm, trialNumber: e.target.value })}
                      required
                    />
                  </div>
                  <div className="min-w-[120px]">
                    <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      Value *
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      value={dataForm.value}
                      onChange={(e) => setDataForm({ ...dataForm, value: e.target.value })}
                      required
                      placeholder="25.001"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addingData}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {addingData ? 'Adding...' : 'Add'}
                  </Button>
                </form>
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Recorded: {selectedStudy.measurements?.length || 0} /{' '}
                  {(selectedStudy.operators || '').split(',').filter((o) => o.trim()).length *
                    selectedStudy.numParts *
                    selectedStudy.numTrials}{' '}
                  measurements
                </div>
              </div>
            )}

            {/* Measurement Data Table */}
            {selectedStudy.measurements && selectedStudy.measurements.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Measurement Data ({selectedStudy.measurements.length})
                </h3>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white dark:bg-gray-900">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Operator</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600">Part #</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600">Trial #</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600">Value</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudy.measurements.map((m, idx) => (
                        <tr
                          key={m.id || idx}
                          className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-800"
                        >
                          <td className="px-3 py-2">{m.operator}</td>
                          <td className="px-3 py-2 text-center">{m.partNumber}</td>
                          <td className="px-3 py-2 text-center">{m.trialNumber}</td>
                          <td className="px-3 py-2 text-right font-mono font-medium">
                            {m.value.toFixed(4)}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(m.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowDetail(false);
              setSelectedStudy(null);
              setResults(null);
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
