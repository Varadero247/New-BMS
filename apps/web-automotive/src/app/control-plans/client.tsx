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
} from '@ims/ui';
import {
  Plus,
  ClipboardList,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Characteristic {
  id: string;
  processNumber: string;
  processName: string;
  machine: string;
  characteristicName: string;
  characteristicType: string;
  specialCharacteristic: string;
  specTolerance: string;
  evalTechnique: string;
  sampleSize: string;
  frequency: string;
  controlMethod: string;
  reactionPlan: string;
}

interface ControlPlan {
  id: string;
  referenceNumber?: string;
  title: string;
  partNumber: string;
  partName?: string;
  planType: string;
  status: string;
  revision: string;
  characteristics?: Characteristic[];
  characteristicsCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CP_STATUSES = ['DRAFT', 'ACTIVE', 'APPROVED', 'SUPERSEDED', 'ARCHIVED'] as const;

const PLAN_TYPES = ['PROTOTYPE', 'PRE_LAUNCH', 'PRODUCTION'] as const;

const planTypeLabels: Record<string, string> = {
  PROTOTYPE: 'Prototype',
  PRE_LAUNCH: 'Pre-Launch',
  PRODUCTION: 'Production',
};

const CHAR_TYPES = ['PRODUCT', 'PROCESS'] as const;

const SPECIAL_CHARS = ['', 'CC', 'SC', 'HI', 'YC', 'SH'] as const;

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  ACTIVE: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-green-100 text-green-700',
  SUPERSEDED: 'bg-yellow-100 text-yellow-700',
  ARCHIVED: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
};

const planTypeColors: Record<string, string> = {
  PROTOTYPE: 'bg-blue-100 text-blue-700',
  PRE_LAUNCH: 'bg-violet-100 text-violet-700',
  PRODUCTION: 'bg-green-100 text-green-700',
};

const emptyForm = {
  title: '',
  partNumber: '',
  partName: '',
  planType: 'PRODUCTION' as string,
  revision: 'A',
  notes: '',
};

const emptyCharForm = {
  processNumber: '',
  processName: '',
  machine: '',
  characteristicName: '',
  characteristicType: 'PRODUCT' as string,
  specialCharacteristic: '',
  specTolerance: '',
  evalTechnique: '',
  sampleSize: '',
  frequency: '',
  controlMethod: '',
  reactionPlan: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ControlPlansClient() {
  // Data state
  const [plans, setPlans] = useState<ControlPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planTypeFilter, setPlanTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Detail view
  const [selectedPlan, setSelectedPlan] = useState<ControlPlan | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add characteristic modal
  const [showCharModal, setShowCharModal] = useState(false);
  const [charForm, setCharForm] = useState(emptyCharForm);
  const [savingChar, setSavingChar] = useState(false);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);

  // Approve action
  const [approving, setApproving] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadPlans = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (planTypeFilter !== 'all') params.append('planType', planTypeFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/control-plans?${params.toString()}`);
      setPlans(response.data.data || []);
    } catch (err) {
      console.error('Failed to load control plans:', err);
      setError('Failed to load control plans. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, planTypeFilter, searchQuery]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // -------------------------------------------------------------------------
  // Create Plan
  // -------------------------------------------------------------------------

  function openCreateModal() {
    setForm(emptyForm);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/control-plans', form);
      setShowModal(false);
      setForm(emptyForm);
      loadPlans();
    } catch (err) {
      console.error('Failed to create control plan:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // Detail View
  // -------------------------------------------------------------------------

  async function openDetail(plan: ControlPlan) {
    setShowDetail(true);
    setDetailLoading(true);
    setEditingCharId(null);
    try {
      const response = await api.get(`/control-plans/${plan.id}`);
      setSelectedPlan(response.data.data || plan);
    } catch (err) {
      console.error('Failed to load control plan detail:', err);
      setSelectedPlan(plan);
    } finally {
      setDetailLoading(false);
    }
  }

  async function reloadDetail() {
    if (!selectedPlan) return;
    try {
      const response = await api.get(`/control-plans/${selectedPlan.id}`);
      setSelectedPlan(response.data.data);
    } catch (err) {
      console.error('Failed to reload detail:', err);
    }
  }

  // -------------------------------------------------------------------------
  // Add/Edit Characteristic
  // -------------------------------------------------------------------------

  function openAddCharModal() {
    setCharForm(emptyCharForm);
    setEditingCharId(null);
    setShowCharModal(true);
  }

  function openEditCharModal(char: Characteristic) {
    setCharForm({
      processNumber: char.processNumber || '',
      processName: char.processName || '',
      machine: char.machine || '',
      characteristicName: char.characteristicName || '',
      characteristicType: char.characteristicType || 'PRODUCT',
      specialCharacteristic: char.specialCharacteristic || '',
      specTolerance: char.specTolerance || '',
      evalTechnique: char.evalTechnique || '',
      sampleSize: char.sampleSize || '',
      frequency: char.frequency || '',
      controlMethod: char.controlMethod || '',
      reactionPlan: char.reactionPlan || '',
    });
    setEditingCharId(char.id);
    setShowCharModal(true);
  }

  async function handleCharSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    setSavingChar(true);
    try {
      if (editingCharId) {
        await api.put(
          `/control-plans/${selectedPlan.id}/characteristics/${editingCharId}`,
          charForm
        );
      } else {
        await api.post(`/control-plans/${selectedPlan.id}/characteristics`, charForm);
      }
      setShowCharModal(false);
      setCharForm(emptyCharForm);
      setEditingCharId(null);
      await reloadDetail();
      loadPlans();
    } catch (err) {
      console.error('Failed to save characteristic:', err);
    } finally {
      setSavingChar(false);
    }
  }

  // -------------------------------------------------------------------------
  // Approve
  // -------------------------------------------------------------------------

  async function handleApprove() {
    if (!selectedPlan) return;
    setApproving(true);
    try {
      await api.post(`/control-plans/${selectedPlan.id}/approve`);
      await reloadDetail();
      loadPlans();
    } catch (err) {
      console.error('Failed to approve control plan:', err);
    } finally {
      setApproving(false);
    }
  }

  // -------------------------------------------------------------------------
  // Filtering & Stats
  // -------------------------------------------------------------------------

  const filtered = plans
    .filter((p) => statusFilter === 'all' || p.status === statusFilter)
    .filter((p) => planTypeFilter === 'all' || p.planType === planTypeFilter)
    .filter(
      (p) =>
        !searchQuery ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.partNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = useMemo(
    () => ({
      total: plans.length,
      active: plans.filter((p) => p.status === 'ACTIVE').length,
      draft: plans.filter((p) => p.status === 'DRAFT').length,
      approved: plans.filter((p) => p.status === 'APPROVED').length,
    }),
    [plans]
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
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  }

  function getCharCount(plan: ControlPlan): number {
    if (plan.characteristics) return plan.characteristics.length;
    return plan.characteristicsCount || 0;
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Control Plans</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Process Control Documentation</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadPlans} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" />
              New Control Plan
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
                </div>
                <Edit2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
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
            <Button variant="outline" size="sm" onClick={loadPlans}>
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
                    aria-label="Search by title, reference, part number..."
                    placeholder="Search by title, reference, part number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Status
                </Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {CP_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[160px]">
                <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Plan Type
                </Label>
                <Select value={planTypeFilter} onChange={(e) => setPlanTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  {PLAN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {planTypeLabels[t] || t}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-orange-500" />
                Control Plans ({filtered.length})
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
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Part Number</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Plan Type</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Rev</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Chars</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((plan) => (
                      <tr
                        key={plan.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {plan.referenceNumber || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {plan.title}
                          </p>
                          {plan.partName && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {plan.partName}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                          {plan.partNumber}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={
                              planTypeColors[plan.planType] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {planTypeLabels[plan.planType] || plan.planType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={
                              statusColors[plan.status] ||
                              'bg-gray-100 dark:bg-gray-800 text-gray-700'
                            }
                          >
                            {plan.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-mono">
                          {plan.revision || '-'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          {getCharCount(plan)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => openDetail(plan)}
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
                <ClipboardList className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  No control plans found
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all' || planTypeFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by creating your first control plan.'}
                </p>
                {!searchQuery && statusFilter === 'all' && planTypeFilter === 'all' && (
                  <Button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 mx-auto bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Plan
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
        title="New Control Plan"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div>
              <Label htmlFor="cp-title">Title *</Label>
              <Input
                id="cp-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Brake Caliper Assembly - Production Control Plan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cp-partNumber">Part Number *</Label>
                <Input
                  id="cp-partNumber"
                  value={form.partNumber}
                  onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
                  required
                  placeholder="e.g. BC-2026-001"
                />
              </div>
              <div>
                <Label htmlFor="cp-partName">Part Name</Label>
                <Input
                  id="cp-partName"
                  value={form.partName}
                  onChange={(e) => setForm({ ...form, partName: e.target.value })}
                  placeholder="e.g. Brake Caliper Assembly"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cp-planType">Plan Type</Label>
                <Select
                  id="cp-planType"
                  value={form.planType}
                  onChange={(e) => setForm({ ...form, planType: e.target.value })}
                >
                  {PLAN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {planTypeLabels[t] || t}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="cp-revision">Revision</Label>
                <Input
                  id="cp-revision"
                  value={form.revision}
                  onChange={(e) => setForm({ ...form, revision: e.target.value })}
                  placeholder="e.g. A"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cp-notes">Notes</Label>
              <Textarea
                id="cp-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
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
              {submitting ? 'Creating...' : 'Create Plan'}
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
          setSelectedPlan(null);
        }}
        title={selectedPlan?.title || 'Control Plan Detail'}
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
        ) : selectedPlan ? (
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            {/* Header Info */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedPlan.referenceNumber && (
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                  {selectedPlan.referenceNumber}
                </span>
              )}
              <Badge
                className={planTypeColors[selectedPlan.planType] || 'bg-gray-100 dark:bg-gray-800'}
              >
                {planTypeLabels[selectedPlan.planType] || selectedPlan.planType}
              </Badge>
              <Badge
                className={statusColors[selectedPlan.status] || 'bg-gray-100 dark:bg-gray-800'}
              >
                {selectedPlan.status?.replace(/_/g, ' ')}
              </Badge>
              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600">
                Rev {selectedPlan.revision || '-'}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Part Number</p>
                  <p className="text-sm font-medium font-mono">{selectedPlan.partNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Part Name</p>
                  <p className="text-sm font-medium">{selectedPlan.partName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Characteristics</p>
                  <p className="text-sm font-medium">{selectedPlan.characteristics?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm">{formatDate(selectedPlan.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Approve Button */}
            {selectedPlan.status !== 'APPROVED' && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {approving ? 'Approving...' : 'Approve Control Plan'}
                </Button>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Changes status to APPROVED
                </span>
              </div>
            )}

            {/* Characteristics Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Characteristics ({selectedPlan.characteristics?.length || 0})
                </h3>
                <Button
                  onClick={openAddCharModal}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>

              {selectedPlan.characteristics && selectedPlan.characteristics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-2 py-2 text-left font-medium text-gray-600">Process #</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600">
                          Process Name
                        </th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600">Machine</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600">
                          Characteristic
                        </th>
                        <th className="px-2 py-2 text-center font-medium text-gray-600">Type</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-600">Special</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600">Spec/Tol</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600">Eval Tech</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-600">Sample</th>
                        <th className="px-2 py-2 text-center font-medium text-gray-600">Freq</th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600">
                          Control Method
                        </th>
                        <th className="px-2 py-2 text-left font-medium text-gray-600">
                          Reaction Plan
                        </th>
                        <th className="px-2 py-2 text-center font-medium text-gray-600">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlan.characteristics.map((char) => (
                        <tr
                          key={char.id}
                          className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-800"
                        >
                          <td className="px-2 py-2 font-mono">{char.processNumber || '-'}</td>
                          <td className="px-2 py-2">{char.processName || '-'}</td>
                          <td className="px-2 py-2">{char.machine || '-'}</td>
                          <td className="px-2 py-2 font-medium">{char.characteristicName}</td>
                          <td className="px-2 py-2 text-center">
                            <Badge
                              className={
                                char.characteristicType === 'PRODUCT'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-violet-100 text-violet-700'
                              }
                            >
                              {char.characteristicType}
                            </Badge>
                          </td>
                          <td className="px-2 py-2 text-center">
                            {char.specialCharacteristic ? (
                              <Badge className="bg-red-100 text-red-700">
                                {char.specialCharacteristic}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-2 py-2 font-mono">{char.specTolerance || '-'}</td>
                          <td className="px-2 py-2">{char.evalTechnique || '-'}</td>
                          <td className="px-2 py-2 text-center">{char.sampleSize || '-'}</td>
                          <td className="px-2 py-2 text-center">{char.frequency || '-'}</td>
                          <td className="px-2 py-2">{char.controlMethod || '-'}</td>
                          <td className="px-2 py-2">{char.reactionPlan || '-'}</td>
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => openEditCharModal(char)}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-orange-600 transition-colors rounded hover:bg-orange-50"
                              title="Edit characteristic"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No characteristics defined yet. Click Add to start.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowDetail(false);
              setSelectedPlan(null);
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* ================================================================= */}
      {/* ADD/EDIT CHARACTERISTIC MODAL                                     */}
      {/* ================================================================= */}
      <Modal
        isOpen={showCharModal}
        onClose={() => {
          setShowCharModal(false);
          setEditingCharId(null);
        }}
        title={editingCharId ? 'Edit Characteristic' : 'Add Characteristic'}
        size="lg"
      >
        <form onSubmit={handleCharSubmit}>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="char-processNumber">Process #</Label>
                <Input
                  id="char-processNumber"
                  value={charForm.processNumber}
                  onChange={(e) => setCharForm({ ...charForm, processNumber: e.target.value })}
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <Label htmlFor="char-processName">Process Name *</Label>
                <Input
                  id="char-processName"
                  value={charForm.processName}
                  onChange={(e) => setCharForm({ ...charForm, processName: e.target.value })}
                  required
                  placeholder="e.g. CNC Machining"
                />
              </div>
              <div>
                <Label htmlFor="char-machine">Machine</Label>
                <Input
                  id="char-machine"
                  value={charForm.machine}
                  onChange={(e) => setCharForm({ ...charForm, machine: e.target.value })}
                  placeholder="e.g. Mazak QTN-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="char-characteristicName">Characteristic *</Label>
                <Input
                  id="char-characteristicName"
                  value={charForm.characteristicName}
                  onChange={(e) => setCharForm({ ...charForm, characteristicName: e.target.value })}
                  required
                  placeholder="e.g. Bore Diameter"
                />
              </div>
              <div>
                <Label htmlFor="char-characteristicType">Type</Label>
                <Select
                  id="char-characteristicType"
                  value={charForm.characteristicType}
                  onChange={(e) => setCharForm({ ...charForm, characteristicType: e.target.value })}
                >
                  {CHAR_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="char-specialCharacteristic">Special Char</Label>
                <Select
                  id="char-specialCharacteristic"
                  value={charForm.specialCharacteristic}
                  onChange={(e) =>
                    setCharForm({ ...charForm, specialCharacteristic: e.target.value })
                  }
                >
                  <option value="">None</option>
                  <option value="CC">CC (Critical)</option>
                  <option value="SC">SC (Significant)</option>
                  <option value="HI">HI (High Impact)</option>
                  <option value="YC">YC (Yes Critical)</option>
                  <option value="SH">SH (Safety/Homologation)</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="char-specTolerance">Specification / Tolerance *</Label>
                <Input
                  id="char-specTolerance"
                  value={charForm.specTolerance}
                  onChange={(e) => setCharForm({ ...charForm, specTolerance: e.target.value })}
                  required
                  placeholder="e.g. 25.00 +/- 0.05 mm"
                />
              </div>
              <div>
                <Label htmlFor="char-evalTechnique">Evaluation Technique</Label>
                <Input
                  id="char-evalTechnique"
                  value={charForm.evalTechnique}
                  onChange={(e) => setCharForm({ ...charForm, evalTechnique: e.target.value })}
                  placeholder="e.g. CMM, Bore Gauge"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="char-sampleSize">Sample Size</Label>
                <Input
                  id="char-sampleSize"
                  value={charForm.sampleSize}
                  onChange={(e) => setCharForm({ ...charForm, sampleSize: e.target.value })}
                  placeholder="e.g. 5 pcs"
                />
              </div>
              <div>
                <Label htmlFor="char-frequency">Frequency</Label>
                <Input
                  id="char-frequency"
                  value={charForm.frequency}
                  onChange={(e) => setCharForm({ ...charForm, frequency: e.target.value })}
                  placeholder="e.g. Every 2 hours"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="char-controlMethod">Control Method *</Label>
              <Input
                id="char-controlMethod"
                value={charForm.controlMethod}
                onChange={(e) => setCharForm({ ...charForm, controlMethod: e.target.value })}
                required
                placeholder="e.g. X-bar & R chart"
              />
            </div>

            <div>
              <Label htmlFor="char-reactionPlan">Reaction Plan *</Label>
              <Textarea
                id="char-reactionPlan"
                value={charForm.reactionPlan}
                onChange={(e) => setCharForm({ ...charForm, reactionPlan: e.target.value })}
                required
                rows={2}
                placeholder="e.g. Stop production, sort, 100% inspect, notify supervisor"
              />
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCharModal(false);
                setEditingCharId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={savingChar}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {savingChar
                ? 'Saving...'
                : editingCharId
                  ? 'Update Characteristic'
                  : 'Add Characteristic'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
