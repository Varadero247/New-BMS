'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Textarea,
  AIDisclosure } from '@ims/ui';
import {
  Plus,
  Workflow,
  Search,
  Loader2,
  Sparkles,
  CheckCircle,
  Settings2,
  ChevronDown,
  ChevronUp,
  Target } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROCESS_TYPES = [
  { value: 'MANAGEMENT', label: 'Management', color: 'bg-purple-100 text-purple-800' },
  { value: 'CORE', label: 'Core', color: 'bg-blue-100 text-blue-800' },
  { value: 'SUPPORT', label: 'Support', color: 'bg-green-100 text-green-800' },
] as const;

const PROCESS_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'RETIRED', label: 'Retired', color: 'bg-red-100 text-red-800' },
] as const;

const MEASUREMENT_FREQUENCIES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
] as const;

const REVIEW_FREQUENCIES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'BI_ANNUALLY', label: 'Bi-Annually' },
  { value: 'ON_CHANGE', label: 'On Change' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProcessRecord {
  id: string;
  referenceNumber: string;
  processName: string;
  processType: string;
  isoClause: string | null;
  department: string;
  processOwner: string;
  version: string;
  status: string;
  purposeScope: string;
  inputs: string;
  outputs: string;
  customerOfOutput: string | null;
  resourcesRequired: string | null;
  competenceNeeded: string | null;
  keyActivities: string | null;
  controlsMethods: string | null;
  kpi1Description: string | null;
  kpi1Target: string | null;
  kpi2Description: string | null;
  kpi2Target: string | null;
  kpi3Description: string | null;
  kpi3Target: string | null;
  monitoringMethod: string | null;
  measurementFrequency: string | null;
  precedingProcesses: string | null;
  followingProcesses: string | null;
  relatedDocuments: string | null;
  relatedRiskRef: string | null;
  relatedLegalRef: string | null;
  reviewFrequency: string;
  lastReviewed: string | null;
  nextReviewDate: string | null;
  reviewNotes: string | null;
  aiAnalysis: string | null;
  aiProcessGaps: string | null;
  aiRiskPoints: string | null;
  aiKpiSuggestions: string | null;
  aiIsoAlignment: string | null;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  processName: string;
  processType: string;
  isoClause: string;
  department: string;
  processOwner: string;
  version: string;
  status: string;
  purposeScope: string;
  inputs: string;
  outputs: string;
  customerOfOutput: string;
  resourcesRequired: string;
  competenceNeeded: string;
  keyActivities: string;
  controlsMethods: string;
  kpi1Description: string;
  kpi1Target: string;
  kpi2Description: string;
  kpi2Target: string;
  kpi3Description: string;
  kpi3Target: string;
  monitoringMethod: string;
  measurementFrequency: string;
  precedingProcesses: string;
  followingProcesses: string;
  relatedDocuments: string;
  relatedRiskRef: string;
  relatedLegalRef: string;
  reviewFrequency: string;
  lastReviewed: string;
  nextReviewDate: string;
  reviewNotes: string;
}

const emptyForm: FormData = {
  processName: '',
  processType: 'CORE',
  isoClause: '',
  department: '',
  processOwner: '',
  version: '1.0',
  status: 'DRAFT',
  purposeScope: '',
  inputs: '',
  outputs: '',
  customerOfOutput: '',
  resourcesRequired: '',
  competenceNeeded: '',
  keyActivities: '',
  controlsMethods: '',
  kpi1Description: '',
  kpi1Target: '',
  kpi2Description: '',
  kpi2Target: '',
  kpi3Description: '',
  kpi3Target: '',
  monitoringMethod: '',
  measurementFrequency: '',
  precedingProcesses: '',
  followingProcesses: '',
  relatedDocuments: '',
  relatedRiskRef: '',
  relatedLegalRef: '',
  reviewFrequency: 'ANNUALLY',
  lastReviewed: '',
  nextReviewDate: '',
  reviewNotes: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBadge(
  value: string,
  options: readonly { value: string; label: string; color: string }[]
) {
  const opt = options.find((o) => o.value === value);
  return opt ? <Badge className={opt.color}>{opt.label}</Badge> : <Badge>{value}</Badge>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProcessesClient() {
  const [records, setRecords] = useState<ProcessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessRecord | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiExpandedId, setAiExpandedId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterType) params.processType = filterType;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/processes', { params });
      setRecords(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to fetch processes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterStatus]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (r: ProcessRecord) => {
    setEditing(r);
    setForm({
      processName: r.processName,
      processType: r.processType,
      isoClause: r.isoClause || '',
      department: r.department,
      processOwner: r.processOwner,
      version: r.version,
      status: r.status,
      purposeScope: r.purposeScope,
      inputs: r.inputs,
      outputs: r.outputs,
      customerOfOutput: r.customerOfOutput || '',
      resourcesRequired: r.resourcesRequired || '',
      competenceNeeded: r.competenceNeeded || '',
      keyActivities: r.keyActivities || '',
      controlsMethods: r.controlsMethods || '',
      kpi1Description: r.kpi1Description || '',
      kpi1Target: r.kpi1Target || '',
      kpi2Description: r.kpi2Description || '',
      kpi2Target: r.kpi2Target || '',
      kpi3Description: r.kpi3Description || '',
      kpi3Target: r.kpi3Target || '',
      monitoringMethod: r.monitoringMethod || '',
      measurementFrequency: r.measurementFrequency || '',
      precedingProcesses: r.precedingProcesses || '',
      followingProcesses: r.followingProcesses || '',
      relatedDocuments: r.relatedDocuments || '',
      relatedRiskRef: r.relatedRiskRef || '',
      relatedLegalRef: r.relatedLegalRef || '',
      reviewFrequency: r.reviewFrequency,
      lastReviewed: r.lastReviewed ? r.lastReviewed.split('T')[0] : '',
      nextReviewDate: r.nextReviewDate ? r.nextReviewDate.split('T')[0] : '',
      reviewNotes: r.reviewNotes || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload: any = { ...form };
      if (!payload.measurementFrequency) delete payload.measurementFrequency;
      if (!payload.isoClause) delete payload.isoClause;
      if (!payload.lastReviewed) delete payload.lastReviewed;
      if (!payload.nextReviewDate) delete payload.nextReviewDate;

      if (editing) {
        await api.put(`/processes/${editing.id}`, payload);
      } else {
        await api.post('/processes', payload);
      }
      setModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this process?')) return;
    try {
      await api.delete(`/processes/${id}`);
      fetchRecords();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const stats = {
    total: records.length,
    active: records.filter((r) => r.status === 'ACTIVE').length,
    management: records.filter((r) => r.processType === 'MANAGEMENT').length,
    core: records.filter((r) => r.processType === 'CORE').length,
    support: records.filter((r) => r.processType === 'SUPPORT').length };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Process Register</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 9001:2015 process management with turtle diagrams
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Process
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Workflow className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Processes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.management}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.core}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Core</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Workflow className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.support}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Support</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search processes..."
                  placeholder="Search processes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {PROCESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {PROCESS_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Workflow className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Processes Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first process to get started with the process register.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Add Process
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                        {r.referenceNumber}
                      </span>
                      {getBadge(r.processType, PROCESS_TYPES)}
                      {getBadge(r.status, PROCESS_STATUSES)}
                      {r.version && (
                        <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600">
                          v{r.version}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {r.processName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {r.purposeScope}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Owner: {r.processOwner}</span>
                      <span>Dept: {r.department}</span>
                      {r.isoClause && <span>ISO: {r.isoClause}</span>}
                      {r.reviewFrequency && (
                        <span>Review: {r.reviewFrequency.replace('_', ' ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    >
                      {expandedId === r.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(r.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Expanded: Turtle Diagram */}
                {expandedId === r.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                      Turtle Diagram
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Inputs</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{r.inputs}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-green-700 mb-1">Outputs</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{r.outputs}</p>
                      </div>
                      {r.resourcesRequired && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-yellow-700 mb-1">
                            Resources Required
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {r.resourcesRequired}
                          </p>
                        </div>
                      )}
                      {r.competenceNeeded && (
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-1">
                            Competence Needed
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {r.competenceNeeded}
                          </p>
                        </div>
                      )}
                      {r.keyActivities && (
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-indigo-700 mb-1">
                            Key Activities
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {r.keyActivities}
                          </p>
                        </div>
                      )}
                      {r.controlsMethods && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-orange-700 mb-1">
                            Controls & Methods
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {r.controlsMethods}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* KPIs */}
                    {(r.kpi1Description || r.kpi2Description || r.kpi3Description) && (
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Performance KPIs
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {r.kpi1Description && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-gray-600">KPI 1</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {r.kpi1Description}
                              </p>
                              {r.kpi1Target && (
                                <p className="text-xs text-blue-600 mt-1">Target: {r.kpi1Target}</p>
                              )}
                            </div>
                          )}
                          {r.kpi2Description && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-gray-600">KPI 2</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {r.kpi2Description}
                              </p>
                              {r.kpi2Target && (
                                <p className="text-xs text-blue-600 mt-1">Target: {r.kpi2Target}</p>
                              )}
                            </div>
                          )}
                          {r.kpi3Description && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-gray-600">KPI 3</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {r.kpi3Description}
                              </p>
                              {r.kpi3Target && (
                                <p className="text-xs text-blue-600 mt-1">Target: {r.kpi3Target}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Linkage */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {r.precedingProcesses && <span>Preceding: {r.precedingProcesses}</span>}
                      {r.followingProcesses && <span>Following: {r.followingProcesses}</span>}
                      {r.customerOfOutput && <span>Customer: {r.customerOfOutput}</span>}
                    </div>

                    {/* AI Analysis */}
                    {r.aiAnalysis && (
                      <div className="border-t pt-3">
                        <button
                          onClick={() => setAiExpandedId(aiExpandedId === r.id ? null : r.id)}
                          className="flex items-center gap-2 text-sm font-medium text-purple-700"
                        >
                          <Sparkles className="h-4 w-4" /> AI Analysis
                          {aiExpandedId === r.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        {aiExpandedId === r.id && (
                          <div className="mt-2 bg-purple-50 p-3 rounded-lg space-y-2 text-sm">
                            <p>{r.aiAnalysis}</p>
                            {r.aiProcessGaps && (
                              <p>
                                <strong>Gaps:</strong> {r.aiProcessGaps}
                              </p>
                            )}
                            {r.aiRiskPoints && (
                              <p>
                                <strong>Risk Points:</strong> {r.aiRiskPoints}
                              </p>
                            )}
                            {r.aiKpiSuggestions && (
                              <p>
                                <strong>KPI Suggestions:</strong> {r.aiKpiSuggestions}
                              </p>
                            )}
                            {r.aiIsoAlignment && (
                              <p>
                                <strong>ISO Alignment:</strong> {r.aiIsoAlignment}
                              </p>
                            )}
                            <AIDisclosure
                              variant="inline"
                              provider="claude"
                              analysisType="Process Analysis"
                              confidence={0.85}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Process' : 'New Process'}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Process Name *</Label>
                <Input
                  value={form.processName}
                  onChange={(e) => setForm({ ...form, processName: e.target.value })}
                />
              </div>
              <div>
                <Label>Process Type *</Label>
                <Select
                  value={form.processType}
                  onChange={(e) => setForm({ ...form, processType: e.target.value })}
                >
                  {PROCESS_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {PROCESS_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Department *</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div>
                <Label>Process Owner *</Label>
                <Input
                  value={form.processOwner}
                  onChange={(e) => setForm({ ...form, processOwner: e.target.value })}
                />
              </div>
              <div>
                <Label>Version</Label>
                <Input
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                />
              </div>
              <div>
                <Label>ISO Clause</Label>
                <Input
                  value={form.isoClause}
                  onChange={(e) => setForm({ ...form, isoClause: e.target.value })}
                  placeholder="e.g. 8.1"
                />
              </div>
            </div>
          </div>

          {/* Turtle Diagram */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Turtle Diagram
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Purpose / Scope *</Label>
                <Textarea
                  value={form.purposeScope}
                  onChange={(e) => setForm({ ...form, purposeScope: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Inputs *</Label>
                <Textarea
                  value={form.inputs}
                  onChange={(e) => setForm({ ...form, inputs: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Outputs *</Label>
                <Textarea
                  value={form.outputs}
                  onChange={(e) => setForm({ ...form, outputs: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Customer of Output</Label>
                <Input
                  value={form.customerOfOutput}
                  onChange={(e) => setForm({ ...form, customerOfOutput: e.target.value })}
                />
              </div>
              <div>
                <Label>Resources Required</Label>
                <Textarea
                  value={form.resourcesRequired}
                  onChange={(e) => setForm({ ...form, resourcesRequired: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Competence Needed</Label>
                <Textarea
                  value={form.competenceNeeded}
                  onChange={(e) => setForm({ ...form, competenceNeeded: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Key Activities</Label>
                <Textarea
                  value={form.keyActivities}
                  onChange={(e) => setForm({ ...form, keyActivities: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Controls & Methods</Label>
                <Textarea
                  value={form.controlsMethods}
                  onChange={(e) => setForm({ ...form, controlsMethods: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Performance KPIs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>KPI 1 Description</Label>
                <Input
                  value={form.kpi1Description}
                  onChange={(e) => setForm({ ...form, kpi1Description: e.target.value })}
                />
              </div>
              <div>
                <Label>KPI 1 Target</Label>
                <Input
                  value={form.kpi1Target}
                  onChange={(e) => setForm({ ...form, kpi1Target: e.target.value })}
                />
              </div>
              <div>
                <Label>KPI 2 Description</Label>
                <Input
                  value={form.kpi2Description}
                  onChange={(e) => setForm({ ...form, kpi2Description: e.target.value })}
                />
              </div>
              <div>
                <Label>KPI 2 Target</Label>
                <Input
                  value={form.kpi2Target}
                  onChange={(e) => setForm({ ...form, kpi2Target: e.target.value })}
                />
              </div>
              <div>
                <Label>KPI 3 Description</Label>
                <Input
                  value={form.kpi3Description}
                  onChange={(e) => setForm({ ...form, kpi3Description: e.target.value })}
                />
              </div>
              <div>
                <Label>KPI 3 Target</Label>
                <Input
                  value={form.kpi3Target}
                  onChange={(e) => setForm({ ...form, kpi3Target: e.target.value })}
                />
              </div>
              <div>
                <Label>Monitoring Method</Label>
                <Input
                  value={form.monitoringMethod}
                  onChange={(e) => setForm({ ...form, monitoringMethod: e.target.value })}
                />
              </div>
              <div>
                <Label>Measurement Frequency</Label>
                <Select
                  value={form.measurementFrequency}
                  onChange={(e) => setForm({ ...form, measurementFrequency: e.target.value })}
                >
                  <option value="">Select...</option>
                  {MEASUREMENT_FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Linkage */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Process Linkage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Preceding Processes</Label>
                <Input
                  value={form.precedingProcesses}
                  onChange={(e) => setForm({ ...form, precedingProcesses: e.target.value })}
                />
              </div>
              <div>
                <Label>Following Processes</Label>
                <Input
                  value={form.followingProcesses}
                  onChange={(e) => setForm({ ...form, followingProcesses: e.target.value })}
                />
              </div>
              <div>
                <Label>Related Documents</Label>
                <Input
                  value={form.relatedDocuments}
                  onChange={(e) => setForm({ ...form, relatedDocuments: e.target.value })}
                />
              </div>
              <div>
                <Label>Related Risk Ref</Label>
                <Input
                  value={form.relatedRiskRef}
                  onChange={(e) => setForm({ ...form, relatedRiskRef: e.target.value })}
                />
              </div>
              <div>
                <Label>Related Legal Ref</Label>
                <Input
                  value={form.relatedLegalRef}
                  onChange={(e) => setForm({ ...form, relatedLegalRef: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Review */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Review Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Review Frequency</Label>
                <Select
                  value={form.reviewFrequency}
                  onChange={(e) => setForm({ ...form, reviewFrequency: e.target.value })}
                >
                  {REVIEW_FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Last Reviewed</Label>
                <Input
                  type="date"
                  value={form.lastReviewed}
                  onChange={(e) => setForm({ ...form, lastReviewed: e.target.value })}
                />
              </div>
              <div>
                <Label>Next Review Date</Label>
                <Input
                  type="date"
                  value={form.nextReviewDate}
                  onChange={(e) => setForm({ ...form, nextReviewDate: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <Label>Review Notes</Label>
                <Textarea
                  value={form.reviewNotes}
                  onChange={(e) => setForm({ ...form, reviewNotes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !form.processName ||
              !form.department ||
              !form.processOwner ||
              !form.purposeScope ||
              !form.inputs ||
              !form.outputs
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : editing ? (
              'Update Process'
            ) : (
              'Create Process'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
