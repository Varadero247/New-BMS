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
  AlertOctagon,
  Search,
  Loader2,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const NC_TYPES = [
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint' },
  { value: 'SUPPLIER', label: 'Supplier' },
  { value: 'REGULATORY', label: 'Regulatory' },
  { value: 'AUDIT_FINDING', label: 'Audit Finding' },
  { value: 'PROCESS_FAILURE', label: 'Process Failure' },
  { value: 'PRODUCT_DEFECT', label: 'Product Defect' },
  { value: 'SERVICE_FAILURE', label: 'Service Failure' },
] as const;

const NC_SOURCES = [
  { value: 'INTERNAL_AUDIT', label: 'Internal Audit' },
  { value: 'CUSTOMER_FEEDBACK', label: 'Customer Feedback' },
  { value: 'SUPPLIER_AUDIT', label: 'Supplier Audit' },
  { value: 'PROCESS_MONITORING', label: 'Process Monitoring' },
  { value: 'MANAGEMENT_REVIEW', label: 'Management Review' },
  { value: 'THIRD_PARTY_AUDIT', label: 'Third Party Audit' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'OBSERVATION', label: 'Observation' },
] as const;

const SEVERITIES = [
  { value: 'MINOR', label: 'Minor', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MODERATE', label: 'Moderate', color: 'bg-orange-100 text-orange-800' },
  { value: 'MAJOR', label: 'Major', color: 'bg-red-100 text-red-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-200 text-red-900' },
] as const;

const NC_STATUSES = [
  { value: 'REPORTED', label: 'Reported', color: 'bg-blue-100 text-blue-800' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'CONTAINED', label: 'Contained', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ROOT_CAUSE', label: 'Root Cause', color: 'bg-purple-100 text-purple-800' },
  { value: 'CAPA_RAISED', label: 'CAPA Raised', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'VERIFICATION', label: 'Verification', color: 'bg-teal-100 text-teal-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-100 text-green-800' },
] as const;

const RCA_METHODS = [
  { value: 'FIVE_WHY', label: '5-Why Analysis' },
  { value: 'FISHBONE', label: 'Fishbone (Ishikawa)' },
  { value: 'IS_IS_NOT', label: 'Is / Is Not' },
  { value: 'EIGHT_D', label: '8D' },
  { value: 'FAULT_TREE', label: 'Fault Tree' },
  { value: 'OTHER', label: 'Other' },
] as const;

const ROOT_CAUSE_CATEGORIES = [
  { value: 'HUMAN_ERROR', label: 'Human Error' },
  { value: 'PROCESS_FAILURE', label: 'Process Failure' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'MEASUREMENT', label: 'Measurement' },
  { value: 'ENVIRONMENT', label: 'Environment' },
  { value: 'MANAGEMENT_SYSTEM', label: 'Management System' },
  { value: 'SUPPLIER', label: 'Supplier' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface NCRecord {
  id: string;
  referenceNumber: string;
  ncType: string;
  source: string;
  severity: string;
  status: string;
  isoClause: string | null;
  dateReported: string;
  reportedBy: string;
  department: string;
  title: string;
  description: string;
  evidenceRef: string | null;
  whereDetected: string | null;
  quantityAffected: number | null;
  quantityUnit: string | null;
  customerImpact: boolean;
  customerImpactDesc: string | null;
  containmentRequired: boolean;
  containmentActions: string | null;
  productsQuarantined: boolean;
  customersNotified: boolean;
  containmentDate: string | null;
  rcaMethod: string | null;
  why1: string | null;
  why2: string | null;
  why3: string | null;
  why4: string | null;
  why5: string | null;
  rootCause: string | null;
  rootCauseCategory: string | null;
  capaRequired: boolean;
  capaReference: string | null;
  correctiveActions: string | null;
  preventiveActions: string | null;
  recurrencePrevention: string | null;
  closedBy: string | null;
  closureDate: string | null;
  effectivenessVerified: string | null;
  lessonsLearned: string | null;
  aiAnalysis: string | null;
  aiRootCauseSuggestions: string | null;
  aiContainmentAdequacy: string | null;
  aiCapaRecommendations: string | null;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  ncType: string;
  source: string;
  severity: string;
  status: string;
  isoClause: string;
  dateReported: string;
  reportedBy: string;
  department: string;
  title: string;
  description: string;
  evidenceRef: string;
  whereDetected: string;
  quantityAffected: string;
  quantityUnit: string;
  customerImpact: boolean;
  customerImpactDesc: string;
  containmentRequired: boolean;
  containmentActions: string;
  productsQuarantined: boolean;
  customersNotified: boolean;
  rcaMethod: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  rootCause: string;
  rootCauseCategory: string;
  capaRequired: boolean;
  capaReference: string;
  correctiveActions: string;
  preventiveActions: string;
  recurrencePrevention: string;
  lessonsLearned: string;
}

const emptyForm: FormData = {
  ncType: 'INTERNAL',
  source: 'INTERNAL_AUDIT',
  severity: 'MINOR',
  status: 'REPORTED',
  isoClause: '',
  dateReported: new Date().toISOString().split('T')[0],
  reportedBy: '',
  department: '',
  title: '',
  description: '',
  evidenceRef: '',
  whereDetected: '',
  quantityAffected: '',
  quantityUnit: '',
  customerImpact: false,
  customerImpactDesc: '',
  containmentRequired: false,
  containmentActions: '',
  productsQuarantined: false,
  customersNotified: false,
  rcaMethod: '',
  why1: '',
  why2: '',
  why3: '',
  why4: '',
  why5: '',
  rootCause: '',
  rootCauseCategory: '',
  capaRequired: false,
  capaReference: '',
  correctiveActions: '',
  preventiveActions: '',
  recurrencePrevention: '',
  lessonsLearned: '' };

function getBadge(
  value: string,
  options: readonly { value: string; label: string; color: string }[]
) {
  const opt = options.find((o) => o.value === value);
  return opt ? <Badge className={opt.color}>{opt.label}</Badge> : <Badge>{value}</Badge>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NonConformancesClient() {
  const [records, setRecords] = useState<NCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NCRecord | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiExpandedId, setAiExpandedId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterType) params.ncType = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterSeverity) params.severity = filterSeverity;
      const res = await api.get('/nonconformances', { params });
      setRecords(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to fetch NCs:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterStatus, filterSeverity]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (r: NCRecord) => {
    setEditing(r);
    setForm({
      ncType: r.ncType,
      source: r.source,
      severity: r.severity,
      status: r.status,
      isoClause: r.isoClause || '',
      dateReported: r.dateReported ? r.dateReported.split('T')[0] : '',
      reportedBy: r.reportedBy,
      department: r.department,
      title: r.title,
      description: r.description,
      evidenceRef: r.evidenceRef || '',
      whereDetected: r.whereDetected || '',
      quantityAffected: r.quantityAffected?.toString() || '',
      quantityUnit: r.quantityUnit || '',
      customerImpact: r.customerImpact,
      customerImpactDesc: r.customerImpactDesc || '',
      containmentRequired: r.containmentRequired,
      containmentActions: r.containmentActions || '',
      productsQuarantined: r.productsQuarantined,
      customersNotified: r.customersNotified,
      rcaMethod: r.rcaMethod || '',
      why1: r.why1 || '',
      why2: r.why2 || '',
      why3: r.why3 || '',
      why4: r.why4 || '',
      why5: r.why5 || '',
      rootCause: r.rootCause || '',
      rootCauseCategory: r.rootCauseCategory || '',
      capaRequired: r.capaRequired,
      capaReference: r.capaReference || '',
      correctiveActions: r.correctiveActions || '',
      preventiveActions: r.preventiveActions || '',
      recurrencePrevention: r.recurrencePrevention || '',
      lessonsLearned: r.lessonsLearned || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload: any = {
        ...form,
        quantityAffected: form.quantityAffected ? Number(form.quantityAffected) : undefined };
      if (!payload.isoClause) delete payload.isoClause;
      if (!payload.rcaMethod) delete payload.rcaMethod;
      if (!payload.rootCauseCategory) delete payload.rootCauseCategory;
      if (!payload.quantityAffected) delete payload.quantityAffected;

      if (editing) {
        await api.put(`/nonconformances/${editing.id}`, payload);
      } else {
        await api.post('/nonconformances', payload);
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
    if (!window.confirm('Delete this non-conformance?')) return;
    try {
      await api.delete(`/nonconformances/${id}`);
      fetchRecords();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const stats = {
    total: records.length,
    open: records.filter((r) => r.status !== 'CLOSED').length,
    critical: records.filter((r) => r.severity === 'CRITICAL' || r.severity === 'MAJOR').length,
    closed: records.filter((r) => r.status === 'CLOSED').length };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Non-Conformance Register
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 9001:2015 non-conformance tracking with RCA
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Report NC
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertOctagon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total NCs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Major/Critical</p>
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
                <p className="text-2xl font-bold">{stats.closed}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Closed</p>
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
                  aria-label="Search NCs..."
                  placeholder="Search NCs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {NC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {NC_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
              <option value="">All Severities</option>
              {SEVERITIES.map((s) => (
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
            <AlertOctagon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Non-Conformances Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Report a non-conformance to start tracking quality issues.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Report NC
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
                      {getBadge(r.severity, SEVERITIES)}
                      {getBadge(r.status, NC_STATUSES)}
                      {r.customerImpact && (
                        <Badge className="bg-red-100 text-red-800">Customer Impact</Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {r.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {r.description}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Type: {NC_TYPES.find((t) => t.value === r.ncType)?.label || r.ncType}
                      </span>
                      <span>Reported by: {r.reportedBy}</span>
                      <span>Dept: {r.department}</span>
                      <span>Date: {new Date(r.dateReported).toLocaleDateString()}</span>
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

                {/* Expanded Details */}
                {expandedId === r.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {/* Containment */}
                    {r.containmentRequired && (
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Containment
                        </h4>
                        <div className="bg-yellow-50 p-3 rounded-lg space-y-1 text-sm">
                          {r.containmentActions && <p>{r.containmentActions}</p>}
                          <div className="flex gap-4 text-xs">
                            {r.productsQuarantined && (
                              <Badge className="bg-orange-100 text-orange-700">
                                Products Quarantined
                              </Badge>
                            )}
                            {r.customersNotified && (
                              <Badge className="bg-blue-100 text-blue-700">
                                Customers Notified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Root Cause Analysis */}
                    {r.rcaMethod && (
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Root Cause Analysis —{' '}
                          {RCA_METHODS.find((m) => m.value === r.rcaMethod)?.label}
                        </h4>
                        {r.rcaMethod === 'FIVE_WHY' && (
                          <div className="space-y-2">
                            {[r.why1, r.why2, r.why3, r.why4, r.why5].map(
                              (w, i) =>
                                w && (
                                  <div key={i} className="bg-purple-50 p-2 rounded text-sm">
                                    <span className="font-semibold text-purple-700">
                                      Why {i + 1}:
                                    </span>{' '}
                                    {w}
                                  </div>
                                )
                            )}
                          </div>
                        )}
                        {r.rootCause && (
                          <div className="bg-red-50 p-3 rounded-lg mt-2 text-sm">
                            <p className="font-semibold text-red-700">Root Cause:</p>
                            <p>{r.rootCause}</p>
                            {r.rootCauseCategory && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Category:{' '}
                                {
                                  ROOT_CAUSE_CATEGORIES.find((c) => c.value === r.rootCauseCategory)
                                    ?.label
                                }
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CAPA & Corrective Actions */}
                    {(r.correctiveActions || r.preventiveActions || r.capaReference) && (
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Corrective & Preventive Actions
                        </h4>
                        <div className="space-y-2 text-sm">
                          {r.correctiveActions && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="font-semibold text-blue-700">Corrective:</p>
                              <p>{r.correctiveActions}</p>
                            </div>
                          )}
                          {r.preventiveActions && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <p className="font-semibold text-green-700">Preventive:</p>
                              <p>{r.preventiveActions}</p>
                            </div>
                          )}
                          {r.capaReference && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              CAPA Ref: {r.capaReference}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Closure */}
                    {r.status === 'CLOSED' && (
                      <div className="bg-green-50 p-3 rounded-lg text-sm space-y-1">
                        <p className="font-semibold text-green-700">Closed</p>
                        {r.closedBy && <p>By: {r.closedBy}</p>}
                        {r.closureDate && (
                          <p>Date: {new Date(r.closureDate).toLocaleDateString()}</p>
                        )}
                        {r.effectivenessVerified && <p>Effectiveness: {r.effectivenessVerified}</p>}
                        {r.lessonsLearned && <p>Lessons: {r.lessonsLearned}</p>}
                      </div>
                    )}

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
                            {r.aiRootCauseSuggestions && (
                              <p>
                                <strong>Root Cause Suggestions:</strong> {r.aiRootCauseSuggestions}
                              </p>
                            )}
                            {r.aiContainmentAdequacy && (
                              <p>
                                <strong>Containment Adequacy:</strong> {r.aiContainmentAdequacy}
                              </p>
                            )}
                            {r.aiCapaRecommendations && (
                              <p>
                                <strong>CAPA Recommendations:</strong> {r.aiCapaRecommendations}
                              </p>
                            )}
                            <AIDisclosure
                              variant="inline"
                              provider="claude"
                              analysisType="NCR Root Cause Analysis"
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
        title={editing ? 'Edit Non-Conformance' : 'Report Non-Conformance'}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              NC Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>NC Type *</Label>
                <Select
                  value={form.ncType}
                  onChange={(e) => setForm({ ...form, ncType: e.target.value })}
                >
                  {NC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Source *</Label>
                <Select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                >
                  {NC_SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Severity *</Label>
                <Select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                >
                  {SEVERITIES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
              {editing && (
                <div>
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    {NC_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <Label>Reported By *</Label>
                <Input
                  value={form.reportedBy}
                  onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
                />
              </div>
              <div>
                <Label>Department *</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div>
                <Label>Date Reported</Label>
                <Input
                  type="date"
                  value={form.dateReported}
                  onChange={(e) => setForm({ ...form, dateReported: e.target.value })}
                />
              </div>
              <div>
                <Label>ISO Clause</Label>
                <Input
                  value={form.isoClause}
                  onChange={(e) => setForm({ ...form, isoClause: e.target.value })}
                  placeholder="e.g. 10.2"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Where Detected</Label>
                <Input
                  value={form.whereDetected}
                  onChange={(e) => setForm({ ...form, whereDetected: e.target.value })}
                />
              </div>
              <div>
                <Label>Evidence Reference</Label>
                <Input
                  value={form.evidenceRef}
                  onChange={(e) => setForm({ ...form, evidenceRef: e.target.value })}
                />
              </div>
              <div>
                <Label>Quantity Affected</Label>
                <Input
                  type="number"
                  value={form.quantityAffected}
                  onChange={(e) => setForm({ ...form, quantityAffected: e.target.value })}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={form.quantityUnit}
                  onChange={(e) => setForm({ ...form, quantityUnit: e.target.value })}
                  placeholder="pcs, kg, etc."
                />
              </div>
            </div>
          </div>

          {/* Customer Impact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Customer Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.customerImpact}
                  onChange={(e) => setForm({ ...form, customerImpact: e.target.checked })}
                  className="rounded"
                />
                <Label>Customer Impact</Label>
              </div>
              {form.customerImpact && (
                <div className="md:col-span-2">
                  <Label>Impact Description</Label>
                  <Textarea
                    value={form.customerImpactDesc}
                    onChange={(e) => setForm({ ...form, customerImpactDesc: e.target.value })}
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Containment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Containment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.containmentRequired}
                  onChange={(e) => setForm({ ...form, containmentRequired: e.target.checked })}
                  className="rounded"
                />
                <Label>Containment Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.productsQuarantined}
                  onChange={(e) => setForm({ ...form, productsQuarantined: e.target.checked })}
                  className="rounded"
                />
                <Label>Products Quarantined</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.customersNotified}
                  onChange={(e) => setForm({ ...form, customersNotified: e.target.checked })}
                  className="rounded"
                />
                <Label>Customers Notified</Label>
              </div>
              {form.containmentRequired && (
                <div className="md:col-span-2">
                  <Label>Containment Actions</Label>
                  <Textarea
                    value={form.containmentActions}
                    onChange={(e) => setForm({ ...form, containmentActions: e.target.value })}
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Root Cause Analysis */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Root Cause Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>RCA Method</Label>
                <Select
                  value={form.rcaMethod}
                  onChange={(e) => setForm({ ...form, rcaMethod: e.target.value })}
                >
                  <option value="">Select...</option>
                  {RCA_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Root Cause Category</Label>
                <Select
                  value={form.rootCauseCategory}
                  onChange={(e) => setForm({ ...form, rootCauseCategory: e.target.value })}
                >
                  <option value="">Select...</option>
                  {ROOT_CAUSE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
              {form.rcaMethod === 'FIVE_WHY' && (
                <>
                  <div className="md:col-span-2">
                    <Label>Why 1</Label>
                    <Input
                      value={form.why1}
                      onChange={(e) => setForm({ ...form, why1: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Why 2</Label>
                    <Input
                      value={form.why2}
                      onChange={(e) => setForm({ ...form, why2: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Why 3</Label>
                    <Input
                      value={form.why3}
                      onChange={(e) => setForm({ ...form, why3: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Why 4</Label>
                    <Input
                      value={form.why4}
                      onChange={(e) => setForm({ ...form, why4: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Why 5</Label>
                    <Input
                      value={form.why5}
                      onChange={(e) => setForm({ ...form, why5: e.target.value })}
                    />
                  </div>
                </>
              )}
              <div className="md:col-span-2">
                <Label>Root Cause</Label>
                <Textarea
                  value={form.rootCause}
                  onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Corrective & Preventive Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Actions
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Corrective Actions</Label>
                <Textarea
                  value={form.correctiveActions}
                  onChange={(e) => setForm({ ...form, correctiveActions: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Preventive Actions</Label>
                <Textarea
                  value={form.preventiveActions}
                  onChange={(e) => setForm({ ...form, preventiveActions: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Recurrence Prevention</Label>
                <Textarea
                  value={form.recurrencePrevention}
                  onChange={(e) => setForm({ ...form, recurrencePrevention: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.capaRequired}
                  onChange={(e) => setForm({ ...form, capaRequired: e.target.checked })}
                  className="rounded"
                />
                <Label>CAPA Required</Label>
              </div>
              {form.capaRequired && (
                <div>
                  <Label>CAPA Reference</Label>
                  <Input
                    value={form.capaReference}
                    onChange={(e) => setForm({ ...form, capaReference: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>Lessons Learned</Label>
                <Textarea
                  value={form.lessonsLearned}
                  onChange={(e) => setForm({ ...form, lessonsLearned: e.target.value })}
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
              submitting || !form.title || !form.reportedBy || !form.department || !form.description
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : editing ? (
              'Update NC'
            ) : (
              'Report NC'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
