'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, LineChart, Search, Clock, CheckCircle, AlertTriangle, RefreshCw, Eye, XCircle, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DataPoint {
  id: string;
  value: number;
  operator?: string;
  notes?: string;
  outOfControl: boolean;
  timestamp: string;
}

interface Capability {
  cpk: number;
  ppk: number;
  cp: number;
  pp: number;
  mean: number;
  stdDev: number;
  usl: number;
  lsl: number;
}

interface SpcChart {
  id: string;
  referenceNumber?: string;
  title: string;
  characteristicName: string;
  partNumber: string;
  chartType: string;
  status: string;
  usl: number;
  lsl: number;
  target: number;
  ucl?: number;
  cl?: number;
  lcl?: number;
  subgroupSize: number;
  lastDataPoint?: number;
  oocCount?: number;
  dataPoints?: DataPoint[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPC_STATUSES = [
  'ACTIVE',
  'IN_CONTROL',
  'OUT_OF_CONTROL',
  'MONITORING',
  'CLOSED',
] as const;

const CHART_TYPES = [
  'X_BAR_R',
  'X_BAR_S',
  'I_MR',
  'P_CHART',
  'NP_CHART',
  'C_CHART',
  'U_CHART',
] as const;

const chartTypeLabels: Record<string, string> = {
  X_BAR_R: 'X-bar & R',
  X_BAR_S: 'X-bar & S',
  I_MR: 'I-MR (Individual)',
  P_CHART: 'p Chart',
  NP_CHART: 'np Chart',
  C_CHART: 'c Chart',
  U_CHART: 'u Chart',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-orange-100 text-orange-700',
  IN_CONTROL: 'bg-green-100 text-green-700',
  OUT_OF_CONTROL: 'bg-red-100 text-red-700',
  MONITORING: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const emptyForm = {
  title: '',
  characteristicName: '',
  partNumber: '',
  chartType: 'X_BAR_R' as string,
  usl: '',
  lsl: '',
  target: '',
  subgroupSize: '5',
  notes: '',
};

const emptyDataForm = {
  value: '',
  operator: '',
  notes: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SpcClient() {
  // Data state
  const [charts, setCharts] = useState<SpcChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [chartTypeFilter, setChartTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Detail view
  const [selectedChart, setSelectedChart] = useState<SpcChart | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [capability, setCapability] = useState<Capability | null>(null);
  const [dataForm, setDataForm] = useState(emptyDataForm);
  const [addingData, setAddingData] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadCharts = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (chartTypeFilter !== 'all') params.append('chartType', chartTypeFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/spc?${params.toString()}`);
      setCharts(response.data.data || []);
    } catch (err) {
      console.error('Failed to load SPC charts:', err);
      setError('Failed to load SPC charts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, chartTypeFilter, searchQuery]);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  // -------------------------------------------------------------------------
  // Create Chart
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
        characteristicName: form.characteristicName,
        partNumber: form.partNumber,
        chartType: form.chartType,
        usl: parseFloat(form.usl),
        lsl: parseFloat(form.lsl),
        target: parseFloat(form.target),
        subgroupSize: parseInt(form.subgroupSize),
        notes: form.notes || undefined,
      };
      await api.post('/spc', payload);
      setShowModal(false);
      setForm(emptyForm);
      loadCharts();
    } catch (err) {
      console.error('Failed to create SPC chart:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Detail View
  // -------------------------------------------------------------------------

  async function openDetail(chart: SpcChart) {
    setShowDetail(true);
    setDetailLoading(true);
    setCapability(null);
    setDataForm(emptyDataForm);
    try {
      const [detailRes, capRes] = await Promise.all([
        api.get(`/spc/${chart.id}`),
        api.get(`/spc/${chart.id}/capability`).catch(() => ({ data: { data: null } })),
      ]);
      setSelectedChart(detailRes.data.data || chart);
      setCapability(capRes.data.data || null);
    } catch (err) {
      console.error('Failed to load SPC chart detail:', err);
      setSelectedChart(chart);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAddDataPoint(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChart || !dataForm.value) return;
    setAddingData(true);
    try {
      await api.post(`/spc/${selectedChart.id}/data`, {
        value: parseFloat(dataForm.value),
        operator: dataForm.operator || undefined,
        notes: dataForm.notes || undefined,
      });
      setDataForm(emptyDataForm);
      // Reload detail
      const [detailRes, capRes] = await Promise.all([
        api.get(`/spc/${selectedChart.id}`),
        api.get(`/spc/${selectedChart.id}/capability`).catch(() => ({ data: { data: null } })),
      ]);
      setSelectedChart(detailRes.data.data);
      setCapability(capRes.data.data || null);
      loadCharts();
    } catch (err) {
      console.error('Failed to add data point:', err);
    } finally {
      setAddingData(false);
    }
  }

  // -------------------------------------------------------------------------
  // Filtering & Stats
  // -------------------------------------------------------------------------

  const filtered = charts
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c => chartTypeFilter === 'all' || c.chartType === chartTypeFilter)
    .filter(c =>
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.characteristicName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = useMemo(() => {
    const active = charts.filter(c => c.status === 'ACTIVE' || c.status === 'IN_CONTROL' || c.status === 'MONITORING').length;
    const ooc = charts.filter(c => c.status === 'OUT_OF_CONTROL').length;
    const totalOocCount = charts.reduce((sum, c) => sum + (c.oocCount || 0), 0);
    return {
      activeCharts: active,
      outOfControl: ooc,
      avgCpk: 0, // Will be calculated from capability data if available
      studiesThisMonth: charts.filter(c => {
        const created = new Date(c.createdAt);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [charts]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  }

  function formatDateTime(dateStr: string | undefined | null): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  }

  function getCpkColor(cpk: number): string {
    if (cpk >= 1.67) return 'text-green-600 bg-green-50';
    if (cpk >= 1.33) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  }

  function getCpkLabel(cpk: number): string {
    if (cpk >= 1.67) return 'Excellent';
    if (cpk >= 1.33) return 'Acceptable';
    return 'Needs Improvement';
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">SPC Charts</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Statistical Process Control</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadCharts} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4" />
              New Chart
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Charts</p>
                  <p className="text-3xl font-bold">{stats.activeCharts}</p>
                </div>
                <LineChart className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Out of Control</p>
                  <p className="text-3xl font-bold text-red-600">{stats.outOfControl}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Studies This Month</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.studiesThisMonth}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Charts</p>
                  <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{charts.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
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
            <Button variant="outline" size="sm" onClick={loadCharts}>Retry</Button>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    aria-label="Search by title, reference, part number, characteristic..." placeholder="Search by title, reference, part number, characteristic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Status</Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {SPC_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Chart Type</Label>
                <Select value={chartTypeFilter} onChange={(e) => setChartTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  {CHART_TYPES.map(t => (
                    <option key={t} value={t}>{chartTypeLabels[t] || t}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-orange-500" />
                SPC Charts ({filtered.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map(i => (
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
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Characteristic</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Part Number</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Chart Type</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Last Value</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">OOC</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((chart) => (
                      <tr key={chart.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {chart.referenceNumber || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{chart.title}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{chart.characteristicName}</td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">{chart.partNumber}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge className="bg-orange-100 text-orange-700">
                            {chartTypeLabels[chart.chartType] || chart.chartType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={statusColors[chart.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                            {chart.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-mono">
                          {chart.lastDataPoint != null ? chart.lastDataPoint.toFixed(3) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-sm font-bold ${(chart.oocCount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {chart.oocCount || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => openDetail(chart)}
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
                <LineChart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No SPC charts found</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all' || chartTypeFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by creating your first SPC chart.'}
                </p>
                {!searchQuery && statusFilter === 'all' && chartTypeFilter === 'all' && (
                  <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4" />
                    Create First Chart
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
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New SPC Chart"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div>
              <Label htmlFor="spc-title">Chart Title *</Label>
              <Input
                id="spc-title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Bore Diameter - Op 20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spc-characteristicName">Characteristic Name *</Label>
                <Input
                  id="spc-characteristicName"
                  value={form.characteristicName}
                  onChange={e => setForm({ ...form, characteristicName: e.target.value })}
                  required
                  placeholder="e.g. Bore Diameter"
                />
              </div>
              <div>
                <Label htmlFor="spc-partNumber">Part Number *</Label>
                <Input
                  id="spc-partNumber"
                  value={form.partNumber}
                  onChange={e => setForm({ ...form, partNumber: e.target.value })}
                  required
                  placeholder="e.g. BC-2026-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spc-chartType">Chart Type</Label>
                <Select
                  id="spc-chartType"
                  value={form.chartType}
                  onChange={e => setForm({ ...form, chartType: e.target.value })}
                >
                  {CHART_TYPES.map(t => (
                    <option key={t} value={t}>{chartTypeLabels[t] || t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="spc-subgroupSize">Subgroup Size</Label>
                <Input
                  id="spc-subgroupSize"
                  type="number"
                  value={form.subgroupSize}
                  onChange={e => setForm({ ...form, subgroupSize: e.target.value })}
                  min="1"
                  max="25"
                  placeholder="5"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="spc-usl">USL (Upper Spec) *</Label>
                <Input
                  id="spc-usl"
                  type="number"
                  step="any"
                  value={form.usl}
                  onChange={e => setForm({ ...form, usl: e.target.value })}
                  required
                  placeholder="e.g. 25.05"
                />
              </div>
              <div>
                <Label htmlFor="spc-target">Target *</Label>
                <Input
                  id="spc-target"
                  type="number"
                  step="any"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}
                  required
                  placeholder="e.g. 25.00"
                />
              </div>
              <div>
                <Label htmlFor="spc-lsl">LSL (Lower Spec) *</Label>
                <Input
                  id="spc-lsl"
                  type="number"
                  step="any"
                  value={form.lsl}
                  onChange={e => setForm({ ...form, lsl: e.target.value })}
                  required
                  placeholder="e.g. 24.95"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="spc-notes">Notes</Label>
              <Textarea
                id="spc-notes"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes or comments"
              />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700">
              {submitting ? 'Creating...' : 'Create Chart'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* DETAIL MODAL                                                      */}
      {/* ================================================================= */}
      <Modal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedChart(null); }}
        title={selectedChart?.title || 'SPC Chart Detail'}
        size="lg"
      >
        {detailLoading ? (
          <div className="py-12">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}
            </div>
          </div>
        ) : selectedChart ? (
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedChart.referenceNumber && (
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{selectedChart.referenceNumber}</span>
              )}
              <Badge className="bg-orange-100 text-orange-700">
                {chartTypeLabels[selectedChart.chartType] || selectedChart.chartType}
              </Badge>
              <Badge className={statusColors[selectedChart.status] || 'bg-gray-100 dark:bg-gray-800'}>
                {selectedChart.status?.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Chart Info */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Characteristic</p>
                  <p className="text-sm font-medium">{selectedChart.characteristicName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Part Number</p>
                  <p className="text-sm font-medium font-mono">{selectedChart.partNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Subgroup Size</p>
                  <p className="text-sm font-medium">{selectedChart.subgroupSize}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm">{formatDate(selectedChart.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Control Limits & Spec Limits */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Limits</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">USL</p>
                  <p className="text-sm font-bold text-red-600">{selectedChart.usl?.toFixed(3)}</p>
                </div>
                {selectedChart.ucl != null && (
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">UCL</p>
                    <p className="text-sm font-bold text-orange-600">{selectedChart.ucl.toFixed(3)}</p>
                  </div>
                )}
                {selectedChart.cl != null && (
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">CL</p>
                    <p className="text-sm font-bold text-blue-600">{selectedChart.cl.toFixed(3)}</p>
                  </div>
                )}
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                  <p className="text-sm font-bold text-green-600">{selectedChart.target?.toFixed(3)}</p>
                </div>
                {selectedChart.lcl != null && (
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-xs text-gray-500 dark:text-gray-400">LCL</p>
                    <p className="text-sm font-bold text-orange-600">{selectedChart.lcl.toFixed(3)}</p>
                  </div>
                )}
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">LSL</p>
                  <p className="text-sm font-bold text-red-600">{selectedChart.lsl?.toFixed(3)}</p>
                </div>
              </div>
            </div>

            {/* Capability Display */}
            {capability && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Process Capability</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`text-center p-3 rounded-lg ${getCpkColor(capability.cpk)}`}>
                    <p className="text-xs font-medium opacity-70">Cpk</p>
                    <p className="text-2xl font-bold">{capability.cpk.toFixed(2)}</p>
                    <p className="text-xs mt-1">{getCpkLabel(capability.cpk)}</p>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${getCpkColor(capability.ppk)}`}>
                    <p className="text-xs font-medium opacity-70">Ppk</p>
                    <p className="text-2xl font-bold">{capability.ppk.toFixed(2)}</p>
                    <p className="text-xs mt-1">{getCpkLabel(capability.ppk)}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cp</p>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{capability.cp.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pp</p>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{capability.pp.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mean</p>
                    <p className="text-sm font-mono font-medium">{capability.mean.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Std Dev</p>
                    <p className="text-sm font-mono font-medium">{capability.stdDev.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Add Data Point */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Add Data Point</h3>
              <form onSubmit={handleAddDataPoint} className="flex flex-wrap items-end gap-3">
                <div className="min-w-[120px]">
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Value *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={dataForm.value}
                    onChange={e => setDataForm({ ...dataForm, value: e.target.value })}
                    required
                    placeholder="25.001"
                  />
                </div>
                <div className="min-w-[120px]">
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Operator</Label>
                  <Input
                    value={dataForm.operator}
                    onChange={e => setDataForm({ ...dataForm, operator: e.target.value })}
                    placeholder="e.g. John"
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Notes</Label>
                  <Input
                    value={dataForm.notes}
                    onChange={e => setDataForm({ ...dataForm, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
                <Button type="submit" disabled={addingData} className="bg-orange-600 hover:bg-orange-700">
                  {addingData ? 'Adding...' : 'Add'}
                </Button>
              </form>
            </div>

            {/* Data Points Table (last 20) */}
            {selectedChart.dataPoints && selectedChart.dataPoints.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Recent Data Points ({Math.min(selectedChart.dataPoints.length, 20)} of {selectedChart.dataPoints.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-3 py-2 text-left font-medium text-gray-600">#</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Value</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Operator</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-600">OOC</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Timestamp</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedChart.dataPoints.slice(-20).reverse().map((dp, idx) => (
                        <tr
                          key={dp.id || idx}
                          className={`border-b border-gray-50 dark:border-gray-800 ${dp.outOfControl ? 'bg-red-50' : ''}`}
                        >
                          <td className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">{selectedChart.dataPoints!.length - idx}</td>
                          <td className={`px-3 py-2 font-mono font-medium ${dp.outOfControl ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                            {dp.value.toFixed(3)}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{dp.operator || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            {dp.outOfControl ? (
                              <XCircle className="h-4 w-4 text-red-500 inline" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500 inline" />
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">{formatDateTime(dp.timestamp)}</td>
                          <td className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 max-w-[150px] truncate">{dp.notes || '-'}</td>
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
          <Button variant="outline" onClick={() => { setShowDetail(false); setSelectedChart(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
