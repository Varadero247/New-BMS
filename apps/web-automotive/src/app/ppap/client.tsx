'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, FileCheck, Search, Clock, CheckCircle, AlertTriangle, RefreshCw, Eye, Edit2, XCircle, Send } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PpapElement {
  elementNumber: number;
  name: string;
  status: string;
  notes: string;
  documentUrl?: string;
}

interface PpapReadiness {
  totalElements: number;
  completedElements: number;
  percentComplete: number;
  ready: boolean;
}

interface Ppap {
  id: string;
  referenceNumber?: string;
  partNumber: string;
  partName: string;
  customer: string;
  submissionLevel: number;
  status: string;
  elements?: PpapElement[];
  pswSubmittedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PPAP_STATUSES = [
  'DRAFT',
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'ON_HOLD',
] as const;

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
};

const PPAP_ELEMENTS: string[] = [
  'Design Records',
  'Authorized Engineering Change Documents',
  'Customer Engineering Approval',
  'Design FMEA',
  'Process Flow Diagram',
  'Process FMEA',
  'Control Plan',
  'Measurement System Analysis Studies',
  'Dimensional Results',
  'Records of Material / Performance Tests',
  'Initial Process Studies',
  'Qualified Laboratory Documentation',
  'Appearance Approval Report',
  'Sample Production Parts',
  'Master Sample',
  'Checking Aids',
  'Customer-Specific Requirements',
  'Part Submission Warrant (PSW)',
];

const elementStatusColors: Record<string, string> = {
  NOT_STARTED: 'text-gray-400',
  IN_PROGRESS: 'text-yellow-500',
  COMPLETED: 'text-green-500',
  NOT_APPLICABLE: 'text-gray-300',
};

const emptyForm = {
  partNumber: '',
  partName: '',
  customer: '',
  submissionLevel: 3,
  notes: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PpapClient() {
  // Data state
  const [ppaps, setPpaps] = useState<Ppap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Detail view
  const [selectedPpap, setSelectedPpap] = useState<Ppap | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [readiness, setReadiness] = useState<PpapReadiness | null>(null);
  const [elementEditing, setElementEditing] = useState<number | null>(null);
  const [elementForm, setElementForm] = useState({ status: '', notes: '' });
  const [savingElement, setSavingElement] = useState(false);
  const [submittingPsw, setSubmittingPsw] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadPpaps = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (customerFilter !== 'all') params.append('customer', customerFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/ppap?${params.toString()}`);
      setPpaps(response.data.data || []);
    } catch (err) {
      console.error('Failed to load PPAPs:', err);
      setError('Failed to load PPAPs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, customerFilter, searchQuery]);

  useEffect(() => {
    loadPpaps();
  }, [loadPpaps]);

  // -------------------------------------------------------------------------
  // Create PPAP
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
        ...form,
        submissionLevel: Number(form.submissionLevel),
      };
      await api.post('/ppap', payload);
      setShowModal(false);
      setForm(emptyForm);
      loadPpaps();
    } catch (err) {
      console.error('Failed to create PPAP:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Detail View
  // -------------------------------------------------------------------------

  async function openDetail(ppap: Ppap) {
    setShowDetail(true);
    setDetailLoading(true);
    setReadiness(null);
    setElementEditing(null);
    try {
      const [detailRes, readinessRes] = await Promise.all([
        api.get(`/ppap/${ppap.id}`),
        api.get(`/ppap/${ppap.id}/readiness`),
      ]);
      setSelectedPpap(detailRes.data.data || ppap);
      setReadiness(readinessRes.data.data || null);
    } catch (err) {
      console.error('Failed to load PPAP detail:', err);
      setSelectedPpap(ppap);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleElementSave(elementNum: number) {
    if (!selectedPpap) return;
    setSavingElement(true);
    try {
      await api.put(`/ppap/${selectedPpap.id}/elements/${elementNum}`, elementForm);
      // Reload detail
      const [detailRes, readinessRes] = await Promise.all([
        api.get(`/ppap/${selectedPpap.id}`),
        api.get(`/ppap/${selectedPpap.id}/readiness`),
      ]);
      setSelectedPpap(detailRes.data.data);
      setReadiness(readinessRes.data.data || null);
      setElementEditing(null);
    } catch (err) {
      console.error('Failed to update element:', err);
    } finally {
      setSavingElement(false);
    }
  }

  async function handlePswSubmit() {
    if (!selectedPpap) return;
    setSubmittingPsw(true);
    try {
      await api.post(`/ppap/${selectedPpap.id}/psw`);
      // Reload detail
      const [detailRes, readinessRes] = await Promise.all([
        api.get(`/ppap/${selectedPpap.id}`),
        api.get(`/ppap/${selectedPpap.id}/readiness`),
      ]);
      setSelectedPpap(detailRes.data.data);
      setReadiness(readinessRes.data.data || null);
      loadPpaps();
    } catch (err) {
      console.error('Failed to submit PSW:', err);
    } finally {
      setSubmittingPsw(false);
    }
  }

  // -------------------------------------------------------------------------
  // Filtering & Stats
  // -------------------------------------------------------------------------

  const customers = useMemo(() => {
    const set = new Set(ppaps.map(p => p.customer).filter(Boolean));
    return Array.from(set).sort();
  }, [ppaps]);

  const filtered = ppaps
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => customerFilter === 'all' || p.customer === customerFilter)
    .filter(p =>
      !searchQuery ||
      p.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = useMemo(() => ({
    total: ppaps.length,
    inProgress: ppaps.filter(p => p.status === 'IN_PROGRESS').length,
    submitted: ppaps.filter(p => p.status === 'SUBMITTED').length,
    approved: ppaps.filter(p => p.status === 'APPROVED').length,
  }), [ppaps]);

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

  function getElementsCompleted(ppap: Ppap): number {
    if (!ppap.elements) return 0;
    return ppap.elements.filter(el => el.status === 'COMPLETED' || el.status === 'NOT_APPLICABLE').length;
  }

  function getCompletionPercent(ppap: Ppap): number {
    return Math.round((getElementsCompleted(ppap) / 18) * 100);
  }

  function getElementStatus(elementNum: number): PpapElement | undefined {
    if (!selectedPpap?.elements) return undefined;
    return selectedPpap.elements.find(el => el.elementNumber === elementNum);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className={`h-5 w-5 ${elementStatusColors[status]}`} />;
      case 'IN_PROGRESS':
        return <Clock className={`h-5 w-5 ${elementStatusColors[status]}`} />;
      case 'NOT_APPLICABLE':
        return <span className="h-5 w-5 text-center text-gray-300 dark:text-gray-600 text-xs font-bold">N/A</span>;
      default:
        return <XCircle className={`h-5 w-5 ${elementStatusColors['NOT_STARTED']}`} />;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">PPAP Submissions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Production Part Approval Process</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadPpaps} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4" />
              New PPAP
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total PPAPs</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileCheck className="h-8 w-8 text-orange-500" />
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.submitted}</p>
                </div>
                <Send className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
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
            <Button variant="outline" size="sm" onClick={loadPpaps}>Retry</Button>
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
                    aria-label="Search by part number, name, reference, customer..." placeholder="Search by part number, name, reference, customer..."
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
                  {PPAP_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Customer</Label>
                <Select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
                  <option value="all">All Customers</option>
                  {customers.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PPAP Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-orange-500" />
                PPAP Submissions ({filtered.length})
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
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Part Number</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Part Name</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Level</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Completion</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ppap) => {
                      const completion = getCompletionPercent(ppap);
                      return (
                        <tr key={ppap.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              {ppap.referenceNumber || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-sm">{ppap.partNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ppap.partName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{ppap.customer}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-orange-100 text-orange-700">L{ppap.submissionLevel}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={statusColors[ppap.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                              {ppap.status?.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    completion === 100 ? 'bg-green-500' : completion >= 50 ? 'bg-orange-500' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${completion}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{completion}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => openDetail(ppap)}
                              className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <FileCheck className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No PPAPs found</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all' || customerFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by creating your first PPAP submission.'}
                </p>
                {!searchQuery && statusFilter === 'all' && customerFilter === 'all' && (
                  <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4" />
                    Create First PPAP
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
        title="New PPAP Submission"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ppap-partNumber">Part Number *</Label>
                <Input
                  id="ppap-partNumber"
                  value={form.partNumber}
                  onChange={e => setForm({ ...form, partNumber: e.target.value })}
                  required
                  placeholder="e.g. BC-2026-001"
                />
              </div>
              <div>
                <Label htmlFor="ppap-partName">Part Name *</Label>
                <Input
                  id="ppap-partName"
                  value={form.partName}
                  onChange={e => setForm({ ...form, partName: e.target.value })}
                  required
                  placeholder="e.g. Brake Caliper Assembly"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ppap-customer">Customer *</Label>
                <Input
                  id="ppap-customer"
                  value={form.customer}
                  onChange={e => setForm({ ...form, customer: e.target.value })}
                  required
                  placeholder="e.g. Toyota Motor Corp"
                />
              </div>
              <div>
                <Label htmlFor="ppap-submissionLevel">Submission Level</Label>
                <Select
                  id="ppap-submissionLevel"
                  value={String(form.submissionLevel)}
                  onChange={e => setForm({ ...form, submissionLevel: parseInt(e.target.value) })}
                >
                  <option value="1">Level 1 - Warrant Only</option>
                  <option value="2">Level 2 - Warrant + Samples</option>
                  <option value="3">Level 3 - Warrant + Full Data</option>
                  <option value="4">Level 4 - Per Customer Direction</option>
                  <option value="5">Level 5 - Complete Data at Site</option>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="ppap-notes">Notes</Label>
              <Textarea
                id="ppap-notes"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes or comments"
              />
            </div>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-700">
              {submitting ? 'Creating...' : 'Create PPAP'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* DETAIL MODAL                                                      */}
      {/* ================================================================= */}
      <Modal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelectedPpap(null); setElementEditing(null); }}
        title={selectedPpap ? `PPAP: ${selectedPpap.partNumber} - ${selectedPpap.partName}` : 'PPAP Detail'}
        size="lg"
      >
        {detailLoading ? (
          <div className="py-12">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}
            </div>
          </div>
        ) : selectedPpap ? (
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedPpap.referenceNumber && (
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{selectedPpap.referenceNumber}</span>
              )}
              <Badge className="bg-orange-100 text-orange-700">Level {selectedPpap.submissionLevel}</Badge>
              <Badge className={statusColors[selectedPpap.status] || 'bg-gray-100 dark:bg-gray-800'}>
                {selectedPpap.status?.replace(/_/g, ' ')}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Part Number</p>
                  <p className="text-sm font-medium font-mono">{selectedPpap.partNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Part Name</p>
                  <p className="text-sm font-medium">{selectedPpap.partName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                  <p className="text-sm font-medium">{selectedPpap.customer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm">{formatDate(selectedPpap.createdAt)}</p>
                </div>
              </div>
              {selectedPpap.pswSubmittedAt && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">PSW Submitted</p>
                  <p className="text-sm font-medium text-green-600">{formatDate(selectedPpap.pswSubmittedAt)}</p>
                </div>
              )}
            </div>

            {/* Readiness Progress */}
            {readiness && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Readiness</h3>
                  <span className={`text-sm font-bold ${readiness.ready ? 'text-green-600' : 'text-orange-600'}`}>
                    {readiness.percentComplete}% Complete ({readiness.completedElements}/{readiness.totalElements})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      readiness.ready ? 'bg-green-500' : readiness.percentComplete >= 50 ? 'bg-orange-500' : 'bg-red-400'
                    }`}
                    style={{ width: `${readiness.percentComplete}%` }}
                  />
                </div>
                {readiness.ready && (
                  <p className="text-xs text-green-600 mt-2 font-medium">All elements complete - Ready for PSW submission</p>
                )}
              </div>
            )}

            {/* 18 Elements Checklist */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">PPAP Elements (18)</h3>
              <div className="space-y-1">
                {PPAP_ELEMENTS.map((name, idx) => {
                  const elementNum = idx + 1;
                  const element = getElementStatus(elementNum);
                  const currentStatus = element?.status || 'NOT_STARTED';
                  const isEditing = elementEditing === elementNum;

                  return (
                    <div key={elementNum} className={`flex items-center gap-3 p-2 rounded ${isEditing ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100'}`}>
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-6 text-right">{elementNum}</span>
                      <div className="flex-shrink-0">{getStatusIcon(currentStatus)}</div>
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{name}</span>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={elementForm.status}
                            onChange={e => setElementForm({ ...elementForm, status: e.target.value })}
                            className="text-xs py-1"
                          >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="NOT_APPLICABLE">N/A</option>
                          </Select>
                          <input
                            type="text"
                            placeholder="Notes..."
                            value={elementForm.notes}
                            onChange={e => setElementForm({ ...elementForm, notes: e.target.value })}
                            className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 w-32"
                          />
                          <button
                            type="button"
                            onClick={() => handleElementSave(elementNum)}
                            disabled={savingElement}
                            className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 disabled:opacity-50"
                          >
                            {savingElement ? '...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setElementEditing(null)}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 px-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {element?.notes && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 max-w-[120px] truncate">{element.notes}</span>
                          )}
                          <Badge className={`text-xs ${
                            currentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            currentStatus === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                            currentStatus === 'NOT_APPLICABLE' ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          }`}>
                            {currentStatus.replace(/_/g, ' ')}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => {
                              setElementEditing(elementNum);
                              setElementForm({ status: currentStatus, notes: element?.notes || '' });
                            }}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                            title="Edit element"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PSW Submission */}
            {selectedPpap.status !== 'APPROVED' && selectedPpap.status !== 'SUBMITTED' && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Part Submission Warrant</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Submit the PSW to the customer for approval. Ensure all required elements are complete.
                </p>
                <Button
                  onClick={handlePswSubmit}
                  disabled={submittingPsw}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submittingPsw ? 'Submitting...' : 'Submit PSW'}
                </Button>
              </div>
            )}
          </div>
        ) : null}

        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowDetail(false); setSelectedPpap(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
