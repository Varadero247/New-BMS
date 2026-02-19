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
  GitBranch,
  Search,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle,
  Shield,
  ChevronDown,
  ChevronUp } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANGE_TYPES = [
  { value: 'DOCUMENT_UPDATE', label: 'Document Update' },
  { value: 'PROCESS_CHANGE', label: 'Process Change' },
  { value: 'PRODUCT_CHANGE', label: 'Product Change' },
  { value: 'SYSTEM_CHANGE', label: 'System Change' },
  { value: 'REGULATORY_RESPONSE', label: 'Regulatory Response' },
  { value: 'CUSTOMER_REQUIREMENT', label: 'Customer Requirement' },
  { value: 'CORRECTIVE_ACTION', label: 'Corrective Action' },
  { value: 'IMPROVEMENT', label: 'Improvement' },
  { value: 'EMERGENCY_CHANGE', label: 'Emergency Change' },
] as const;

const CHANGE_PRIORITIES = [
  { value: 'ROUTINE', label: 'Routine', color: 'bg-green-100 text-green-800' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-orange-100 text-orange-800' },
  { value: 'EMERGENCY', label: 'Emergency', color: 'bg-red-100 text-red-800' },
] as const;

const CHANGE_STATUSES = [
  { value: 'REQUESTED', label: 'Requested', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
  { value: 'IMPACT_ASSESSED', label: 'Impact Assessed', color: 'bg-blue-100 text-blue-800' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'IMPLEMENTATION', label: 'Implementation', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'VERIFICATION', label: 'Verification', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-200 text-green-900' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
] as const;

const IMPACT_LEVELS = [
  { value: 'NONE', label: 'None', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChangeRecord {
  id: string;
  referenceNumber: string;
  title: string;
  changeType: string;
  priority: string;
  status: string;
  isoClause: string | null;
  requestedBy: string;
  department: string;
  dateRequested: string;
  currentState: string;
  proposedChange: string;
  reasonForChange: string;
  linkedDocument: string | null;
  linkedProcess: string | null;
  linkedNcCapa: string | null;
  qualityImpact: string | null;
  customerImpact: string | null;
  processImpact: string | null;
  hsImpact: string | null;
  envImpact: string | null;
  regulatoryImpact: string | null;
  financialImpact: string | null;
  estimatedCost: number | null;
  affectedProcesses: string | null;
  affectedDocuments: string | null;
  stakeholdersToNotify: string | null;
  trainingRequired: boolean | null;
  trainingDescription: string | null;
  validationRequired: boolean | null;
  validationDescription: string | null;
  reviewedBy: string | null;
  approvedBy: string | null;
  approvalDate: string | null;
  approvalNotes: string | null;
  rejectionReason: string | null;
  implementationPlan: string | null;
  targetDate: string | null;
  actualDate: string | null;
  implementedBy: string | null;
  verifiedBy: string | null;
  effective: string | null;
  lessonsLearned: string | null;
  aiAnalysis: string | null;
  aiHiddenRisks: string | null;
  aiAffectedProcesses: string | null;
  aiImplementationSteps: string | null;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  changeType: string;
  priority: string;
  status: string;
  isoClause: string;
  requestedBy: string;
  department: string;
  currentState: string;
  proposedChange: string;
  reasonForChange: string;
  linkedDocument: string;
  linkedProcess: string;
  linkedNcCapa: string;
  qualityImpact: string;
  customerImpact: string;
  processImpact: string;
  hsImpact: string;
  envImpact: string;
  regulatoryImpact: string;
  financialImpact: string;
  estimatedCost: string;
  affectedProcesses: string;
  affectedDocuments: string;
  stakeholdersToNotify: string;
  trainingRequired: boolean;
  trainingDescription: string;
  validationRequired: boolean;
  validationDescription: string;
  approvedBy: string;
  approvalNotes: string;
  rejectionReason: string;
  implementationPlan: string;
  targetDate: string;
  implementedBy: string;
  lessonsLearned: string;
}

const emptyForm: FormData = {
  title: '',
  changeType: 'PROCESS_CHANGE',
  priority: 'ROUTINE',
  status: 'REQUESTED',
  isoClause: '',
  requestedBy: '',
  department: '',
  currentState: '',
  proposedChange: '',
  reasonForChange: '',
  linkedDocument: '',
  linkedProcess: '',
  linkedNcCapa: '',
  qualityImpact: '',
  customerImpact: '',
  processImpact: '',
  hsImpact: '',
  envImpact: '',
  regulatoryImpact: '',
  financialImpact: '',
  estimatedCost: '',
  affectedProcesses: '',
  affectedDocuments: '',
  stakeholdersToNotify: '',
  trainingRequired: false,
  trainingDescription: '',
  validationRequired: false,
  validationDescription: '',
  approvedBy: '',
  approvalNotes: '',
  rejectionReason: '',
  implementationPlan: '',
  targetDate: '',
  implementedBy: '',
  lessonsLearned: '' };

function getBadge(
  value: string,
  options: readonly { value: string; label: string; color: string }[]
) {
  const opt = options.find((o) => o.value === value);
  return opt ? <Badge className={opt.color}>{opt.label}</Badge> : <Badge>{value}</Badge>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChangesClient() {
  const [records, setRecords] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ChangeRecord | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiExpandedId, setAiExpandedId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterType) params.changeType = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      const res = await api.get('/changes', { params });
      setRecords(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to fetch changes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterStatus, filterPriority]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (r: ChangeRecord) => {
    setEditing(r);
    setForm({
      title: r.title,
      changeType: r.changeType,
      priority: r.priority,
      status: r.status,
      isoClause: r.isoClause || '',
      requestedBy: r.requestedBy,
      department: r.department,
      currentState: r.currentState,
      proposedChange: r.proposedChange,
      reasonForChange: r.reasonForChange,
      linkedDocument: r.linkedDocument || '',
      linkedProcess: r.linkedProcess || '',
      linkedNcCapa: r.linkedNcCapa || '',
      qualityImpact: r.qualityImpact || '',
      customerImpact: r.customerImpact || '',
      processImpact: r.processImpact || '',
      hsImpact: r.hsImpact || '',
      envImpact: r.envImpact || '',
      regulatoryImpact: r.regulatoryImpact || '',
      financialImpact: r.financialImpact || '',
      estimatedCost: r.estimatedCost?.toString() || '',
      affectedProcesses: r.affectedProcesses || '',
      affectedDocuments: r.affectedDocuments || '',
      stakeholdersToNotify: r.stakeholdersToNotify || '',
      trainingRequired: r.trainingRequired || false,
      trainingDescription: r.trainingDescription || '',
      validationRequired: r.validationRequired || false,
      validationDescription: r.validationDescription || '',
      approvedBy: r.approvedBy || '',
      approvalNotes: r.approvalNotes || '',
      rejectionReason: r.rejectionReason || '',
      implementationPlan: r.implementationPlan || '',
      targetDate: r.targetDate ? r.targetDate.split('T')[0] : '',
      implementedBy: r.implementedBy || '',
      lessonsLearned: r.lessonsLearned || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload: any = {
        ...form,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined };
      // Clean empty optional fields
      [
        'isoClause',
        'qualityImpact',
        'customerImpact',
        'processImpact',
        'hsImpact',
        'envImpact',
        'regulatoryImpact',
        'financialImpact',
        'targetDate',
      ].forEach((k) => {
        if (!payload[k]) delete payload[k];
      });
      if (!payload.estimatedCost) delete payload.estimatedCost;

      if (editing) {
        await api.put(`/changes/${editing.id}`, payload);
      } else {
        await api.post('/changes', payload);
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
    if (!window.confirm('Delete this change request?')) return;
    try {
      await api.delete(`/changes/${id}`);
      fetchRecords();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const stats = {
    total: records.length,
    open: records.filter((r) => !['CLOSED', 'CANCELLED', 'REJECTED'].includes(r.status)).length,
    approved: records.filter((r) => r.status === 'APPROVED' || r.status === 'IMPLEMENTATION')
      .length,
    closed: records.filter((r) => r.status === 'CLOSED').length };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Change Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ISO 9001:2015 change control with impact assessment
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Request Change
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GitBranch className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Changes</p>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Approved/Implementing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Shield className="h-5 w-5 text-gray-600" />
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
                  aria-label="Search changes..."
                  placeholder="Search changes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {CHANGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {CHANGE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {CHANGE_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
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
            <GitBranch className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Change Requests Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Submit a change request to start the change management process.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Request Change
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
                      {getBadge(r.priority, CHANGE_PRIORITIES)}
                      {getBadge(r.status, CHANGE_STATUSES)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {r.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {r.reasonForChange}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Type: {CHANGE_TYPES.find((t) => t.value === r.changeType)?.label}</span>
                      <span>Requested by: {r.requestedBy}</span>
                      <span>Dept: {r.department}</span>
                      {r.targetDate && (
                        <span>Target: {new Date(r.targetDate).toLocaleDateString()}</span>
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

                {/* Expanded */}
                {expandedId === r.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {/* Change Description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Current State</p>
                        <p className="text-sm">{r.currentState}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-blue-600 mb-1">Proposed Change</p>
                        <p className="text-sm">{r.proposedChange}</p>
                      </div>
                    </div>

                    {/* Impact Assessment */}
                    {(r.qualityImpact || r.customerImpact || r.processImpact) && (
                      <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Impact Assessment
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { label: 'Quality', val: r.qualityImpact },
                            { label: 'Customer', val: r.customerImpact },
                            { label: 'Process', val: r.processImpact },
                            { label: 'H&S', val: r.hsImpact },
                            { label: 'Environmental', val: r.envImpact },
                            { label: 'Regulatory', val: r.regulatoryImpact },
                            { label: 'Financial', val: r.financialImpact },
                          ]
                            .filter((i) => i.val && i.val !== 'NONE')
                            .map((i) => (
                              <div
                                key={i.label}
                                className="text-center p-2 rounded bg-gray-50 dark:bg-gray-800"
                              >
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {i.label}
                                </p>
                                {getBadge(i.val!, IMPACT_LEVELS)}
                              </div>
                            ))}
                        </div>
                        {r.estimatedCost !== null && r.estimatedCost > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Estimated Cost: ${r.estimatedCost.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Approval */}
                    {r.approvedBy && (
                      <div className="bg-green-50 p-3 rounded-lg text-sm">
                        <p className="font-semibold text-green-700">Approved by: {r.approvedBy}</p>
                        {r.approvalDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Date: {new Date(r.approvalDate).toLocaleDateString()}
                          </p>
                        )}
                        {r.approvalNotes && <p className="mt-1">{r.approvalNotes}</p>}
                      </div>
                    )}
                    {r.rejectionReason && (
                      <div className="bg-red-50 p-3 rounded-lg text-sm">
                        <p className="font-semibold text-red-700">Rejection Reason</p>
                        <p>{r.rejectionReason}</p>
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
                            {r.aiHiddenRisks && (
                              <p>
                                <strong>Hidden Risks:</strong> {r.aiHiddenRisks}
                              </p>
                            )}
                            {r.aiAffectedProcesses && (
                              <p>
                                <strong>Affected Processes:</strong> {r.aiAffectedProcesses}
                              </p>
                            )}
                            {r.aiImplementationSteps && (
                              <p>
                                <strong>Implementation Steps:</strong> {r.aiImplementationSteps}
                              </p>
                            )}
                            <AIDisclosure
                              variant="inline"
                              provider="claude"
                              analysisType="Change Impact Analysis"
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
        title={editing ? 'Edit Change Request' : 'New Change Request'}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Change Details
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
                <Label>Change Type *</Label>
                <Select
                  value={form.changeType}
                  onChange={(e) => setForm({ ...form, changeType: e.target.value })}
                >
                  {CHANGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {CHANGE_PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
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
                    {CHANGE_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <Label>Requested By *</Label>
                <Input
                  value={form.requestedBy}
                  onChange={(e) => setForm({ ...form, requestedBy: e.target.value })}
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
                <Label>ISO Clause</Label>
                <Input
                  value={form.isoClause}
                  onChange={(e) => setForm({ ...form, isoClause: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Change Description
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Current State *</Label>
                <Textarea
                  value={form.currentState}
                  onChange={(e) => setForm({ ...form, currentState: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Proposed Change *</Label>
                <Textarea
                  value={form.proposedChange}
                  onChange={(e) => setForm({ ...form, proposedChange: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Reason for Change *</Label>
                <Textarea
                  value={form.reasonForChange}
                  onChange={(e) => setForm({ ...form, reasonForChange: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Linked Document</Label>
                  <Input
                    value={form.linkedDocument}
                    onChange={(e) => setForm({ ...form, linkedDocument: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Linked Process</Label>
                  <Input
                    value={form.linkedProcess}
                    onChange={(e) => setForm({ ...form, linkedProcess: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Linked NC/CAPA</Label>
                  <Input
                    value={form.linkedNcCapa}
                    onChange={(e) => setForm({ ...form, linkedNcCapa: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Impact Assessment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Impact Assessment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'qualityImpact', label: 'Quality' },
                { key: 'customerImpact', label: 'Customer' },
                { key: 'processImpact', label: 'Process' },
                { key: 'hsImpact', label: 'H&S' },
                { key: 'envImpact', label: 'Environmental' },
                { key: 'regulatoryImpact', label: 'Regulatory' },
                { key: 'financialImpact', label: 'Financial' },
              ].map((i) => (
                <div key={i.key}>
                  <Label>{i.label}</Label>
                  <Select
                    value={(form as Record<string, unknown>)[i.key]}
                    onChange={(e) => setForm({ ...form, [i.key]: e.target.value })}
                  >
                    <option value="">N/A</option>
                    {IMPACT_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
              <div>
                <Label>Estimated Cost</Label>
                <Input
                  type="number"
                  value={form.estimatedCost}
                  onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Affected Processes</Label>
                <Input
                  value={form.affectedProcesses}
                  onChange={(e) => setForm({ ...form, affectedProcesses: e.target.value })}
                />
              </div>
              <div>
                <Label>Affected Documents</Label>
                <Input
                  value={form.affectedDocuments}
                  onChange={(e) => setForm({ ...form, affectedDocuments: e.target.value })}
                />
              </div>
              <div>
                <Label>Stakeholders to Notify</Label>
                <Input
                  value={form.stakeholdersToNotify}
                  onChange={(e) => setForm({ ...form, stakeholdersToNotify: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.trainingRequired}
                  onChange={(e) => setForm({ ...form, trainingRequired: e.target.checked })}
                  className="rounded"
                />
                <Label>Training Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.validationRequired}
                  onChange={(e) => setForm({ ...form, validationRequired: e.target.checked })}
                  className="rounded"
                />
                <Label>Validation Required</Label>
              </div>
            </div>
          </div>

          {/* Implementation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2">
              Implementation & Approval
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Approved By</Label>
                <Input
                  value={form.approvedBy}
                  onChange={(e) => setForm({ ...form, approvedBy: e.target.value })}
                />
              </div>
              <div>
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Implementation Plan</Label>
                <Textarea
                  value={form.implementationPlan}
                  onChange={(e) => setForm({ ...form, implementationPlan: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Implemented By</Label>
                <Input
                  value={form.implementedBy}
                  onChange={(e) => setForm({ ...form, implementedBy: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
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
              submitting ||
              !form.title ||
              !form.requestedBy ||
              !form.department ||
              !form.currentState ||
              !form.proposedChange ||
              !form.reasonForChange
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : editing ? (
              'Update Change'
            ) : (
              'Submit Change'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
