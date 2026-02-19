'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
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
  Search,
  Loader2,
  Pencil,
  Filter,
  ArrowRight,
  AlertTriangle,
  Shield,
  Clock,
  User } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DesignControl {
  id: string;
  referenceNumber: string;
  name: string;
  description: string;
  deviceName: string;
  deviceClass: string;
  regulatoryPathway: string;
  currentStage: string;
  status: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DESIGN_STAGES = [
  'Planning',
  'Input',
  'Output',
  'Review',
  'Verification',
  'Validation',
  'Transfer',
] as const;

const DEVICE_CLASSES = ['I', 'II', 'III'] as const;

const REGULATORY_PATHWAYS = [
  '510(k)',
  'PMA',
  'De Novo',
  'CE Marking',
  'TGA',
  'Health Canada',
  'PMDA',
  'Other',
] as const;

const STATUSES = ['DRAFT', 'ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as const;

const STAGE_DESCRIPTIONS: Record<string, string> = {
  Planning: 'Define design plan, team, and milestones per 7.3.2',
  Input: 'Document functional, performance, regulatory requirements per 7.3.3',
  Output: 'Document design output meeting input requirements per 7.3.4',
  Review: 'Systematic review of design results per 7.3.5',
  Verification: 'Confirm outputs meet inputs per 7.3.6',
  Validation: 'Confirm device meets user needs per 7.3.7',
  Transfer: 'Transfer design to production per 7.3.8' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDeviceClassColor(deviceClass: string): string {
  switch (deviceClass) {
    case 'I':
      return 'bg-blue-100 text-blue-800';
    case 'II':
      return 'bg-orange-100 text-orange-800';
    case 'III':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  }
}

function getDeviceClassBadgeVariant(
  deviceClass: string
): 'info' | 'warning' | 'danger' | 'secondary' {
  switch (deviceClass) {
    case 'I':
      return 'info';
    case 'II':
      return 'warning';
    case 'III':
      return 'danger';
    default:
      return 'secondary';
  }
}

function getStageColor(stage: string): string {
  switch (stage) {
    case 'Planning':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
    case 'Input':
      return 'bg-blue-100 text-blue-800';
    case 'Output':
      return 'bg-indigo-100 text-indigo-800';
    case 'Review':
      return 'bg-purple-100 text-purple-800';
    case 'Verification':
      return 'bg-amber-100 text-amber-800';
    case 'Validation':
      return 'bg-teal-100 text-teal-800';
    case 'Transfer':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  }
}

function getStageBadgeVariant(
  stage: string
): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (stage) {
    case 'Planning':
      return 'secondary';
    case 'Input':
      return 'info';
    case 'Output':
      return 'info';
    case 'Review':
      return 'warning';
    case 'Verification':
      return 'warning';
    case 'Validation':
      return 'success';
    case 'Transfer':
      return 'success';
    default:
      return 'outline';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700';
    case 'ACTIVE':
      return 'bg-teal-100 text-teal-700';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-700';
    case 'ON_HOLD':
      return 'bg-amber-100 text-amber-700';
    case 'COMPLETED':
      return 'bg-green-100 text-green-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700';
  }
}

function getStatusBadgeVariant(
  status: string
): 'secondary' | 'info' | 'warning' | 'success' | 'danger' | 'outline' {
  switch (status) {
    case 'DRAFT':
      return 'secondary';
    case 'ACTIVE':
      return 'info';
    case 'IN_PROGRESS':
      return 'info';
    case 'ON_HOLD':
      return 'warning';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'outline';
  }
}

function getStageIndex(stage: string): number {
  return DESIGN_STAGES.indexOf(stage as (typeof DESIGN_STAGES)[number]);
}

// ---------------------------------------------------------------------------
// Empty form state
// ---------------------------------------------------------------------------

const emptyForm = {
  name: '',
  description: '',
  deviceName: '',
  deviceClass: 'I' as string,
  regulatoryPathway: '510(k)' as string,
  currentStage: 'Planning' as string,
  status: 'DRAFT' as string,
  assignedTo: '' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DesignControlsClient() {
  // Data state
  const [designControls, setDesignControls] = useState<DesignControl[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DesignControl | null>(null);

  // Form state
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceClassFilter, setDeviceClassFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Detail view
  const [selectedRecord, setSelectedRecord] = useState<DesignControl | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchDesignControls = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/design-controls');
      setDesignControls(response.data.data || []);
    } catch (err) {
      console.error('Failed to load design controls:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesignControls();
  }, [fetchDesignControls]);

  // ---------------------------------------------------------------------------
  // Create handler
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      try {
        await api.post('/design-controls', form);
        setShowCreateModal(false);
        setForm(emptyForm);
        fetchDesignControls();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to create design control record');
        console.error('Failed to create design control:', err);
      } finally {
        setSubmitting(false);
      }
    },
    [form, fetchDesignControls]
  );

  // ---------------------------------------------------------------------------
  // Edit handler
  // ---------------------------------------------------------------------------

  const handleEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingRecord) return;
      setSubmitting(true);
      setError('');
      try {
        await api.put(`/design-controls/${editingRecord.id}`, form);
        setShowEditModal(false);
        setEditingRecord(null);
        setForm(emptyForm);
        fetchDesignControls();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to update design control record');
        console.error('Failed to update design control:', err);
      } finally {
        setSubmitting(false);
      }
    },
    [form, editingRecord, fetchDesignControls]
  );

  // ---------------------------------------------------------------------------
  // Open edit modal
  // ---------------------------------------------------------------------------

  const openEditModal = useCallback((record: DesignControl) => {
    setEditingRecord(record);
    setForm({
      name: record.name,
      description: record.description || '',
      deviceName: record.deviceName || '',
      deviceClass: record.deviceClass || 'I',
      regulatoryPathway: record.regulatoryPathway || '510(k)',
      currentStage: record.currentStage || 'Planning',
      status: record.status || 'DRAFT',
      assignedTo: record.assignedTo || '' });
    setError('');
    setShowEditModal(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Open detail modal
  // ---------------------------------------------------------------------------

  const openDetailModal = useCallback((record: DesignControl) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredDesignControls = useMemo(() => {
    return designControls.filter((dc) => {
      if (stageFilter !== 'all' && dc.currentStage !== stageFilter) return false;
      if (statusFilter !== 'all' && dc.status !== statusFilter) return false;
      if (deviceClassFilter !== 'all' && dc.deviceClass !== deviceClassFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = dc.name?.toLowerCase().includes(query);
        const matchesRef = dc.referenceNumber?.toLowerCase().includes(query);
        const matchesDevice = dc.deviceName?.toLowerCase().includes(query);
        const matchesAssigned = dc.assignedTo?.toLowerCase().includes(query);
        if (!matchesName && !matchesRef && !matchesDevice && !matchesAssigned) return false;
      }
      return true;
    });
  }, [designControls, stageFilter, statusFilter, deviceClassFilter, searchQuery]);

  // ---------------------------------------------------------------------------
  // Summary stats
  // ---------------------------------------------------------------------------

  const summaryStats = useMemo(
    () => ({
      total: designControls.length,
      active: designControls.filter((dc) => dc.status === 'ACTIVE' || dc.status === 'IN_PROGRESS')
        .length,
      completed: designControls.filter((dc) => dc.status === 'COMPLETED').length,
      onHold: designControls.filter((dc) => dc.status === 'ON_HOLD').length,
      classI: designControls.filter((dc) => dc.deviceClass === 'I').length,
      classII: designControls.filter((dc) => dc.deviceClass === 'II').length,
      classIII: designControls.filter((dc) => dc.deviceClass === 'III').length,
      byStage: DESIGN_STAGES.reduce(
        (acc, stage) => {
          acc[stage] = designControls.filter((dc) => dc.currentStage === stage).length;
          return acc;
        },
        {} as Record<string, number>
      ) }),
    [designControls]
  );

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading design controls...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Design Control Form (shared between create and edit)
  // ---------------------------------------------------------------------------

  const DesignControlForm = ({
    onSubmit,
    isEdit }: {
    onSubmit: (e: React.FormEvent) => Promise<void>;
    isEdit: boolean;
  }) => (
    <form onSubmit={onSubmit}>
      <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* SECTION A: PROJECT IDENTIFICATION */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
            A -- Project Identification
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dc-name">Project Name *</Label>
              <Input
                id="dc-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Cardiac Monitoring System v2.0"
              />
            </div>

            <div>
              <Label htmlFor="dc-description">Description *</Label>
              <Textarea
                id="dc-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                required
                placeholder="Describe the medical device design project scope, objectives, and intended use"
              />
            </div>

            <div>
              <Label htmlFor="dc-deviceName">Device Name *</Label>
              <Input
                id="dc-deviceName"
                value={form.deviceName}
                onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
                required
                placeholder="e.g. CardioMonitor Pro"
              />
            </div>
          </div>
        </div>

        {/* SECTION B: CLASSIFICATION & REGULATORY */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
            B -- Classification & Regulatory
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dc-deviceClass">Device Classification *</Label>
              <Select
                id="dc-deviceClass"
                value={form.deviceClass}
                onChange={(e) => setForm({ ...form, deviceClass: e.target.value })}
              >
                {DEVICE_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}{' '}
                    {cls === 'I' ? '(Low Risk)' : cls === 'II' ? '(Moderate Risk)' : '(High Risk)'}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {form.deviceClass === 'I' &&
                  'General controls only (e.g., bandages, examination gloves)'}
                {form.deviceClass === 'II' &&
                  'General + special controls (e.g., powered wheelchairs, infusion pumps)'}
                {form.deviceClass === 'III' &&
                  'General + special controls + premarket approval (e.g., pacemakers, heart valves)'}
              </p>
            </div>

            <div>
              <Label htmlFor="dc-regulatoryPathway">Regulatory Pathway *</Label>
              <Select
                id="dc-regulatoryPathway"
                value={form.regulatoryPathway}
                onChange={(e) => setForm({ ...form, regulatoryPathway: e.target.value })}
              >
                {REGULATORY_PATHWAYS.map((pathway) => (
                  <option key={pathway} value={pathway}>
                    {pathway}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* SECTION C: DESIGN STAGE & STATUS */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
            C -- Design Stage & Status
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dc-currentStage">Current Design Stage *</Label>
                <Select
                  id="dc-currentStage"
                  value={form.currentStage}
                  onChange={(e) => setForm({ ...form, currentStage: e.target.value })}
                >
                  {DESIGN_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="dc-status">Status *</Label>
                <Select
                  id="dc-status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Stage progress visualization */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Design Stage Progress:
              </p>
              <div className="flex items-center gap-1">
                {DESIGN_STAGES.map((stage, index) => {
                  const currentIndex = getStageIndex(form.currentStage);
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;
                  const isFuture = index > currentIndex;

                  return (
                    <div key={stage} className="flex items-center flex-1">
                      <div
                        className={`flex-1 py-1.5 px-1 rounded text-center text-xs font-medium ${
                          isCompleted
                            ? 'bg-teal-500 text-white'
                            : isCurrent
                              ? 'bg-teal-100 text-teal-700 border-2 border-teal-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        {stage}
                      </div>
                      {index < DESIGN_STAGES.length - 1 && (
                        <ArrowRight
                          className={`h-3 w-3 mx-0.5 flex-shrink-0 ${
                            isCompleted ? 'text-teal-500' : 'text-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage description */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <p className="text-xs font-medium text-teal-700">
                {form.currentStage}: {STAGE_DESCRIPTIONS[form.currentStage]}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION D: ASSIGNMENT */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
            D -- Assignment
          </h3>
          <div>
            <Label htmlFor="dc-assignedTo">Assigned To *</Label>
            <Input
              id="dc-assignedTo"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              required
              placeholder="e.g. Dr. Sarah Chen, Lead Design Engineer"
            />
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => (isEdit ? setShowEditModal(false) : setShowCreateModal(false))}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </span>
          ) : isEdit ? (
            'Update Design Control'
          ) : (
            'Create Design Control'
          )}
        </Button>
      </ModalFooter>
    </form>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Design Controls</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            ISO 13485 Clause 7.3 -- Design and Development Controls
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Projects</p>
                  <p className="text-3xl font-bold">{summaryStats.total}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summaryStats.active} active / {summaryStats.completed} completed
                  </p>
                </div>
                <Pencil className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class I Devices</p>
                  <p className="text-3xl font-bold text-blue-600">{summaryStats.classI}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Low risk</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class II Devices</p>
                  <p className="text-3xl font-bold text-orange-600">{summaryStats.classII}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Moderate risk</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Class III Devices</p>
                  <p className="text-3xl font-bold text-red-600">{summaryStats.classIII}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">High risk</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stage Pipeline Overview */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-1">
              {DESIGN_STAGES.map((stage, index) => (
                <div key={stage} className="flex items-center flex-1">
                  <div
                    className={`flex-1 rounded-lg p-3 text-center cursor-pointer transition-colors ${
                      stageFilter === stage
                        ? 'bg-teal-500 text-white shadow-md'
                        : summaryStats.byStage[stage] > 0
                          ? 'bg-teal-50 border border-teal-200 hover:bg-teal-100'
                          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setStageFilter(stageFilter === stage ? 'all' : stage)}
                  >
                    <p
                      className={`text-lg font-bold ${
                        stageFilter === stage
                          ? 'text-white'
                          : summaryStats.byStage[stage] > 0
                            ? 'text-teal-700'
                            : 'text-gray-400'
                      }`}
                    >
                      {summaryStats.byStage[stage]}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        stageFilter === stage
                          ? 'text-teal-100'
                          : summaryStats.byStage[stage] > 0
                            ? 'text-teal-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {stage}
                    </p>
                  </div>
                  {index < DESIGN_STAGES.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-300 dark:text-gray-600 mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              aria-label="Search by name, reference, device, or assignee..."
              placeholder="Search by name, reference, device, or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(stageFilter !== 'all' || statusFilter !== 'all' || deviceClassFilter !== 'all') && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-700">
                Active
              </span>
            )}
          </Button>

          <Button
            onClick={() => {
              setForm(emptyForm);
              setError('');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            New Design Control
          </Button>
        </div>

        {/* Expanded filter row */}
        {showFilters && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Stage</Label>
              <Select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Stages</option>
                {DESIGN_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Device Class</Label>
              <Select
                value={deviceClassFilter}
                onChange={(e) => setDeviceClassFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">All Classes</option>
                {DEVICE_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStageFilter('all');
                setStatusFilter('all');
                setDeviceClassFilter('all');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredDesignControls.length} of {designControls.length} design control
            records
          </p>
        </div>

        {/* Design Controls Table */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredDesignControls.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Project #
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Name
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Device Class
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Stage
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Assigned To
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDesignControls.map((dc) => (
                      <tr
                        key={dc.id}
                        className="hover:bg-gray-50 dark:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => openDetailModal(dc)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">
                            {dc.referenceNumber || '--'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {dc.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {dc.deviceName}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getDeviceClassBadgeVariant(dc.deviceClass)}>
                            Class {dc.deviceClass}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStageBadgeVariant(dc.currentStage)}>
                              {dc.currentStage}
                            </Badge>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              ({getStageIndex(dc.currentStage) + 1}/{DESIGN_STAGES.length})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusBadgeVariant(dc.status)}>
                            {dc.status?.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {dc.assignedTo || '--'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(dc)}
                              className="text-xs"
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16">
            <Pencil className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No design control records found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start by creating a new design control project to track your medical device
              development per ISO 13485 Clause 7.3.
            </p>
            <Button
              onClick={() => {
                setForm(emptyForm);
                setError('');
                setShowCreateModal(true);
              }}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Design Control
            </Button>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* MODAL: Create Design Control                                           */}
      {/* ====================================================================== */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Design Control Project"
        size="lg"
      >
        <DesignControlForm onSubmit={handleCreate} isEdit={false} />
      </Modal>

      {/* ====================================================================== */}
      {/* MODAL: Edit Design Control                                             */}
      {/* ====================================================================== */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRecord(null);
        }}
        title={`Edit: ${editingRecord?.name || 'Design Control'}`}
        size="lg"
      >
        <DesignControlForm onSubmit={handleEdit} isEdit={true} />
      </Modal>

      {/* ====================================================================== */}
      {/* MODAL: Detail View                                                     */}
      {/* ====================================================================== */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRecord(null);
        }}
        title={selectedRecord?.name || 'Design Control Details'}
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={getDeviceClassBadgeVariant(selectedRecord.deviceClass)}>
                Class {selectedRecord.deviceClass}
              </Badge>
              <Badge variant={getStageBadgeVariant(selectedRecord.currentStage)}>
                {selectedRecord.currentStage}
              </Badge>
              <Badge variant={getStatusBadgeVariant(selectedRecord.status)}>
                {selectedRecord.status?.replace(/_/g, ' ')}
              </Badge>
              {selectedRecord.referenceNumber && (
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                  {selectedRecord.referenceNumber}
                </span>
              )}
            </div>

            {/* Stage progress */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Design Stage Progress:
              </p>
              <div className="flex items-center gap-1">
                {DESIGN_STAGES.map((stage, index) => {
                  const currentIndex = getStageIndex(selectedRecord.currentStage);
                  const isCompleted = index < currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <div key={stage} className="flex items-center flex-1">
                      <div
                        className={`flex-1 py-1.5 px-1 rounded text-center text-xs font-medium ${
                          isCompleted
                            ? 'bg-teal-500 text-white'
                            : isCurrent
                              ? 'bg-teal-100 text-teal-700 border-2 border-teal-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        {stage}
                      </div>
                      {index < DESIGN_STAGES.length - 1 && (
                        <ArrowRight
                          className={`h-3 w-3 mx-0.5 flex-shrink-0 ${
                            isCompleted ? 'text-teal-500' : 'text-gray-300'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Device Name
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedRecord.deviceName || '--'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Regulatory Pathway
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {selectedRecord.regulatoryPathway || '--'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Assigned To
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  {selectedRecord.assignedTo || '--'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Created
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  {new Date(selectedRecord.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                Description
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {selectedRecord.description || 'No description provided.'}
              </p>
            </div>

            {/* Current stage requirements */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-xs font-medium text-teal-700 uppercase mb-1">
                Current Stage Requirements ({selectedRecord.currentStage})
              </p>
              <p className="text-sm text-teal-800">
                {STAGE_DESCRIPTIONS[selectedRecord.currentStage]}
              </p>
            </div>

            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRecord(null);
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedRecord);
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Record
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}
