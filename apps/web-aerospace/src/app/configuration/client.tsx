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
} from '@ims/ui';
import {
  Plus,
  Settings,
  Search,
  Loader2,
  Shield,
  Database,
  GitPullRequest,
  FileText,
  Cpu,
  Monitor,
  Link2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConfigurationItem {
  id: string;
  ciNumber: string;
  name: string;
  description: string;
  type: string;
  classification: string;
  status: string;
  revision: string;
  baselineId: string | null;
  baselineName?: string;
  partNumber?: string;
  serialNumber?: string;
  manufacturer?: string;
  owner?: string;
  location?: string;
  documentRef?: string;
  effectivityStart?: string;
  effectivityEnd?: string;
  createdAt: string;
  updatedAt: string;
}

interface Baseline {
  id: string;
  name: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CI_TYPES = ['HARDWARE', 'SOFTWARE', 'DOCUMENT', 'INTERFACE'] as const;

const CI_CLASSIFICATIONS = ['CRITICAL', 'MAJOR', 'MINOR', 'STANDARD'] as const;

const CI_STATUSES = [
  'DRAFT',
  'UNDER_REVIEW',
  'ACTIVE',
  'SUPERSEDED',
  'OBSOLETE',
  'ARCHIVED',
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeIcon(type: string) {
  switch (type) {
    case 'HARDWARE':
      return <Cpu className="h-4 w-4" />;
    case 'SOFTWARE':
      return <Monitor className="h-4 w-4" />;
    case 'DOCUMENT':
      return <FileText className="h-4 w-4" />;
    case 'INTERFACE':
      return <Link2 className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
}

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'HARDWARE':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'SOFTWARE':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'DOCUMENT':
      return 'bg-slate-100 text-slate-800 border-slate-300';
    case 'INTERFACE':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 border-gray-300';
  }
}

function getStatusVariant(
  status: string
): 'success' | 'warning' | 'info' | 'secondary' | 'danger' | 'destructive' {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'UNDER_REVIEW':
      return 'warning';
    case 'DRAFT':
      return 'info';
    case 'SUPERSEDED':
      return 'secondary';
    case 'OBSOLETE':
      return 'danger';
    case 'ARCHIVED':
      return 'secondary';
    default:
      return 'info';
  }
}

function getClassificationVariant(
  classification: string
): 'destructive' | 'danger' | 'warning' | 'info' {
  switch (classification) {
    case 'CRITICAL':
      return 'destructive';
    case 'MAJOR':
      return 'danger';
    case 'MINOR':
      return 'warning';
    case 'STANDARD':
      return 'info';
    default:
      return 'info';
  }
}

// ---------------------------------------------------------------------------
// Empty form state
// ---------------------------------------------------------------------------

const emptyForm = {
  name: '',
  description: '',
  ciNumber: '',
  type: 'HARDWARE' as string,
  classification: 'STANDARD' as string,
  status: 'DRAFT' as string,
  revision: 'A',
  baselineId: '' as string,
  partNumber: '',
  serialNumber: '',
  manufacturer: '',
  owner: '',
  location: '',
  documentRef: '',
  effectivityStart: '',
  effectivityEnd: '',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConfigurationClient() {
  // Data state
  const [items, setItems] = useState<ConfigurationItem[]>([]);
  const [baselines, setBaselines] = useState<Baseline[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ConfigurationItem | null>(null);

  // Form state
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter state
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // AI Analysis
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/configuration');
      setItems(response.data.data || []);
    } catch (err) {
      console.error('Failed to load configuration items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBaselines = useCallback(async () => {
    try {
      const response = await api.get('/baselines');
      setBaselines(response.data.data || []);
    } catch (err) {
      console.error('Failed to load baselines:', err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchBaselines();
  }, [fetchItems, fetchBaselines]);

  // ---------------------------------------------------------------------------
  // Submit handlers
  // ---------------------------------------------------------------------------

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError('');
      try {
        await api.post('/configuration', {
          ...form,
          baselineId: form.baselineId || undefined,
          effectivityStart: form.effectivityStart || undefined,
          effectivityEnd: form.effectivityEnd || undefined,
        });
        setShowCreateModal(false);
        setForm(emptyForm);
        setAiAnalysis('');
        setAiExpanded(false);
        fetchItems();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to create configuration item');
        console.error('Failed to create configuration item:', err);
      } finally {
        setSubmitting(false);
      }
    },
    [form, fetchItems]
  );

  const handleEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedItem) return;
      setSubmitting(true);
      setError('');
      try {
        await api.put(`/configuration/${selectedItem.id}`, {
          ...form,
          baselineId: form.baselineId || undefined,
          effectivityStart: form.effectivityStart || undefined,
          effectivityEnd: form.effectivityEnd || undefined,
        });
        setShowEditModal(false);
        setForm(emptyForm);
        setSelectedItem(null);
        fetchItems();
      } catch (err) {
        setError((err as any).response?.data?.message || 'Failed to update configuration item');
        console.error('Failed to update configuration item:', err);
      } finally {
        setSubmitting(false);
      }
    },
    [form, selectedItem, fetchItems]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !confirm(
          'Are you sure you want to delete this configuration item? This action cannot be undone.'
        )
      )
        return;
      try {
        await api.delete(`/configuration/${id}`);
        fetchItems();
      } catch (err) {
        console.error('Failed to delete configuration item:', err);
        alert((err as any).response?.data?.message || 'Failed to delete configuration item');
      }
    },
    [fetchItems]
  );

  const openEditModal = useCallback((item: ConfigurationItem) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      description: item.description || '',
      ciNumber: item.ciNumber,
      type: item.type,
      classification: item.classification,
      status: item.status,
      revision: item.revision || 'A',
      baselineId: item.baselineId || '',
      partNumber: item.partNumber || '',
      serialNumber: item.serialNumber || '',
      manufacturer: item.manufacturer || '',
      owner: item.owner || '',
      location: item.location || '',
      documentRef: item.documentRef || '',
      effectivityStart: item.effectivityStart ? item.effectivityStart.split('T')[0] : '',
      effectivityEnd: item.effectivityEnd ? item.effectivityEnd.split('T')[0] : '',
    });
    setError('');
    setShowEditModal(true);
  }, []);

  const openDetailModal = useCallback((item: ConfigurationItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  }, []);

  // ---------------------------------------------------------------------------
  // AI Analysis
  // ---------------------------------------------------------------------------

  const handleAiAnalysis = useCallback(async () => {
    setAiLoading(true);
    try {
      const response = await api.post('/ai/analyze-configuration', {
        name: form.name,
        description: form.description,
        type: form.type,
        classification: form.classification,
        revision: form.revision,
      });
      setAiAnalysis(response.data.data?.analysis || 'No analysis available.');
    } catch (err) {
      setAiAnalysis('AI analysis is currently unavailable. Please try again later.');
      console.error('AI analysis failed:', err);
    } finally {
      setAiLoading(false);
    }
  }, [form]);

  // ---------------------------------------------------------------------------
  // Filtered data
  // ---------------------------------------------------------------------------

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (classificationFilter !== 'all' && item.classification !== classificationFilter)
          return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (
            !item.name.toLowerCase().includes(query) &&
            !item.ciNumber.toLowerCase().includes(query) &&
            !(item.description || '').toLowerCase().includes(query) &&
            !(item.partNumber || '').toLowerCase().includes(query)
          ) {
            return false;
          }
        }
        return true;
      }),
    [items, typeFilter, statusFilter, classificationFilter, searchQuery]
  );

  // ---------------------------------------------------------------------------
  // Summary stats
  // ---------------------------------------------------------------------------

  const summaryStats = useMemo(
    () => ({
      total: items.length,
      hardware: items.filter((i) => i.type === 'HARDWARE').length,
      software: items.filter((i) => i.type === 'SOFTWARE').length,
      document: items.filter((i) => i.type === 'DOCUMENT').length,
      interface: items.filter((i) => i.type === 'INTERFACE').length,
      active: items.filter((i) => i.status === 'ACTIVE').length,
      draft: items.filter((i) => i.status === 'DRAFT').length,
      underReview: items.filter((i) => i.status === 'UNDER_REVIEW').length,
      critical: items.filter((i) => i.classification === 'CRITICAL').length,
      major: items.filter((i) => i.classification === 'MAJOR').length,
    }),
    [items]
  );

  // ---------------------------------------------------------------------------
  // Loading spinner
  // ---------------------------------------------------------------------------

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <span className="ml-3 text-gray-500 dark:text-gray-400">Loading configuration items...</span>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Form fields (shared between create and edit modals)
  // ---------------------------------------------------------------------------

  const renderFormFields = () => (
    <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Section A: Identification */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
          A -- Identification
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ci-name">Item Name *</Label>
              <Input
                id="ci-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Flight Control Unit FCU-200"
              />
            </div>
            <div>
              <Label htmlFor="ci-number">CI Number *</Label>
              <Input
                id="ci-number"
                value={form.ciNumber}
                onChange={(e) => setForm({ ...form, ciNumber: e.target.value })}
                required
                placeholder="e.g. CI-HW-2026-001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ci-description">Description *</Label>
            <Textarea
              id="ci-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              required
              placeholder="Detailed description of the configuration item including its function and interfaces"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ci-type">Type *</Label>
              <Select
                id="ci-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {CI_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ci-classification">Classification *</Label>
              <Select
                id="ci-classification"
                value={form.classification}
                onChange={(e) => setForm({ ...form, classification: e.target.value })}
              >
                {CI_CLASSIFICATIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="ci-status">Status *</Label>
              <Select
                id="ci-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {CI_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Section B: Configuration Details */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
          B -- Configuration Details
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ci-revision">Revision *</Label>
              <Input
                id="ci-revision"
                value={form.revision}
                onChange={(e) => setForm({ ...form, revision: e.target.value })}
                required
                placeholder="e.g. A, B, C or 1.0, 2.0"
              />
            </div>
            <div>
              <Label htmlFor="ci-partNumber">Part Number</Label>
              <Input
                id="ci-partNumber"
                value={form.partNumber}
                onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
                placeholder="e.g. PN-12345-01"
              />
            </div>
            <div>
              <Label htmlFor="ci-serialNumber">Serial Number</Label>
              <Input
                id="ci-serialNumber"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                placeholder="e.g. SN-2026-0001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ci-manufacturer">Manufacturer</Label>
              <Input
                id="ci-manufacturer"
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                placeholder="e.g. Boeing, Airbus, Honeywell"
              />
            </div>
            <div>
              <Label htmlFor="ci-baseline">Baseline</Label>
              <Select
                id="ci-baseline"
                value={form.baselineId}
                onChange={(e) => setForm({ ...form, baselineId: e.target.value })}
              >
                <option value="">-- No Baseline --</option>
                {baselines.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.status})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Section C: Ownership & Location */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
          C -- Ownership & Location
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ci-owner">Owner / Responsible Engineer</Label>
              <Input
                id="ci-owner"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="e.g. John Smith, Engineering Lead"
              />
            </div>
            <div>
              <Label htmlFor="ci-location">Location / Repository</Label>
              <Input
                id="ci-location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Vault A-3, PDM System, Git Repo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ci-documentRef">Document Reference</Label>
            <Input
              id="ci-documentRef"
              value={form.documentRef}
              onChange={(e) => setForm({ ...form, documentRef: e.target.value })}
              placeholder="e.g. DOC-2026-0042, Drawing Sheet 14"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ci-effectivityStart">Effectivity Start</Label>
              <Input
                id="ci-effectivityStart"
                type="date"
                value={form.effectivityStart}
                onChange={(e) => setForm({ ...form, effectivityStart: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ci-effectivityEnd">Effectivity End</Label>
              <Input
                id="ci-effectivityEnd"
                type="date"
                value={form.effectivityEnd}
                onChange={(e) => setForm({ ...form, effectivityEnd: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section D: AI Analysis */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <button
          type="button"
          onClick={() => setAiExpanded(!aiExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />D -- AI Configuration Analysis
          </h3>
          {aiExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </button>
        {aiExpanded && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI will analyze the configuration item details and provide AS9100D compliance
              recommendations.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleAiAnalysis}
              disabled={aiLoading || !form.name}
              className="flex items-center gap-2"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Run AI Analysis
                </>
              )}
            </Button>
            {aiAnalysis && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Configuration Items
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            AS9100D Clause 8.1.2 -- Configuration Management
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                  <p className="text-3xl font-bold">{summaryStats.total}</p>
                </div>
                <Settings className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-green-600">{summaryStats.active}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summaryStats.draft} draft
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Under Review</p>
                  <p className="text-3xl font-bold text-amber-600">{summaryStats.underReview}</p>
                </div>
                <GitPullRequest className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Critical Items</p>
                  <p className="text-3xl font-bold text-red-600">{summaryStats.critical}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {summaryStats.major} major
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> Hardware
                  </span>
                  <span className="font-medium">{summaryStats.hardware}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Monitor className="h-3 w-3" /> Software
                  </span>
                  <span className="font-medium">{summaryStats.software}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Document
                  </span>
                  <span className="font-medium">{summaryStats.document}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Link2 className="h-3 w-3" /> Interface
                  </span>
                  <span className="font-medium">{summaryStats.interface}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Types</option>
            {CI_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          >
            <option value="all">All Statuses</option>
            {CI_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
          <Select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="w-44"
          >
            <option value="all">All Classifications</option>
            {CI_CLASSIFICATIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              aria-label="Search by name, CI number, part number..."
              placeholder="Search by name, CI number, part number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded text-sm ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded text-sm ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
            >
              Grid
            </button>
          </div>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setError('');
              setAiAnalysis('');
              setAiExpanded(false);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredItems.length > 0 ? (
          viewMode === 'table' ? (
            /* Table View */
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                          CI Number
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                          Name
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                          Type
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                          Baseline
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                          Status
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                          Classification
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                          Rev
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-mono text-indigo-600 font-medium">
                              {item.ciNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.name}
                              </p>
                              {item.partNumber && (
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  P/N: {item.partNumber}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${getTypeBadgeColor(item.type)}`}
                            >
                              {getTypeIcon(item.type)}
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {item.baselineName ? (
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {item.baselineName}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={getStatusVariant(item.status)}>
                              {item.status?.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={getClassificationVariant(item.classification)}>
                              {item.classification}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-mono text-gray-600">{item.revision}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openDetailModal(item)}
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{item.name}</CardTitle>
                        <p className="text-xs font-mono text-indigo-600 mt-1">{item.ciNumber}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-indigo-600"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getTypeBadgeColor(item.type)}`}
                      >
                        {getTypeIcon(item.type)}
                        {item.type}
                      </span>
                      <Badge variant={getStatusVariant(item.status)}>
                        {item.status?.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant={getClassificationVariant(item.classification)}>
                        {item.classification}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>Rev {item.revision}</span>
                      {item.partNumber && <span>P/N: {item.partNumber}</span>}
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <Settings className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No configuration items found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start by identifying the configuration items in your aerospace product structure per
              AS9100D Clause 8.1.2.
            </p>
            <Button
              onClick={() => {
                setForm(emptyForm);
                setError('');
                setAiAnalysis('');
                setAiExpanded(false);
                setShowCreateModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Configuration Item
            </Button>
          </div>
        )}

        {/* Results count */}
        {!loading && items.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredItems.length} of {items.length} configuration items
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Create Configuration Item                                     */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Configuration Item"
        size="full"
      >
        <form onSubmit={handleCreate}>
          {renderFormFields()}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Item'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: Edit Configuration Item                                       */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Configuration Item"
        size="full"
      >
        <form onSubmit={handleEdit}>
          {renderFormFields()}
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Update Item'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL: View Configuration Item Detail                                */}
      {/* ==================================================================== */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Configuration Item Details"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedItem.name}
                </h2>
                <p className="text-sm font-mono text-indigo-600 mt-1">{selectedItem.ciNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(selectedItem.status)}>
                  {selectedItem.status?.replace(/_/g, ' ')}
                </Badge>
                <Badge variant={getClassificationVariant(selectedItem.classification)}>
                  {selectedItem.classification}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Description
              </h3>
              <p className="text-sm text-gray-600">
                {selectedItem.description || 'No description provided.'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTypeIcon(selectedItem.type)}
                  <span className="text-sm font-medium">{selectedItem.type}</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Revision</p>
                <p className="text-sm font-mono font-medium mt-1">{selectedItem.revision}</p>
              </div>
              {selectedItem.partNumber && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Part Number</p>
                  <p className="text-sm font-mono font-medium mt-1">{selectedItem.partNumber}</p>
                </div>
              )}
              {selectedItem.serialNumber && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Serial Number</p>
                  <p className="text-sm font-mono font-medium mt-1">{selectedItem.serialNumber}</p>
                </div>
              )}
              {selectedItem.manufacturer && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manufacturer</p>
                  <p className="text-sm font-medium mt-1">{selectedItem.manufacturer}</p>
                </div>
              )}
              {selectedItem.owner && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                  <p className="text-sm font-medium mt-1">{selectedItem.owner}</p>
                </div>
              )}
              {selectedItem.location && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-medium mt-1">{selectedItem.location}</p>
                </div>
              )}
              {selectedItem.documentRef && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Document Reference</p>
                  <p className="text-sm font-mono font-medium mt-1">{selectedItem.documentRef}</p>
                </div>
              )}
              {selectedItem.baselineName && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Baseline</p>
                  <p className="text-sm font-medium mt-1">{selectedItem.baselineName}</p>
                </div>
              )}
            </div>

            {/* Effectivity */}
            {(selectedItem.effectivityStart || selectedItem.effectivityEnd) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Effectivity
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {selectedItem.effectivityStart && (
                    <span>
                      Start: {new Date(selectedItem.effectivityStart).toLocaleDateString()}
                    </span>
                  )}
                  {selectedItem.effectivityEnd && (
                    <span>End: {new Date(selectedItem.effectivityEnd).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span>Created: {new Date(selectedItem.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(selectedItem.updatedAt).toLocaleString()}</span>
            </div>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedItem);
                }}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </Button>
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}
