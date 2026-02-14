'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  AIDisclosure,
} from '@ims/ui';
import {
  Plus, Target, Search, Loader2, Sparkles,
  AlertCircle, Clock, CheckCircle, TrendingUp,
  ChevronDown, ChevronUp, Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const OBJECTIVE_CATEGORIES = [
  { value: 'CUSTOMER_SATISFACTION', label: 'Customer Satisfaction' },
  { value: 'PRODUCT_QUALITY', label: 'Product Quality' },
  { value: 'PROCESS_EFFICIENCY', label: 'Process Efficiency' },
  { value: 'SUPPLIER_PERFORMANCE', label: 'Supplier Performance' },
  { value: 'COMPLIANCE', label: 'Compliance' },
  { value: 'DEFECT_REDUCTION', label: 'Defect Reduction' },
  { value: 'ON_TIME_DELIVERY', label: 'On-Time Delivery' },
  { value: 'AUDIT_PERFORMANCE', label: 'Audit Performance' },
  { value: 'IMPROVEMENT', label: 'Improvement' },
  { value: 'REVENUE', label: 'Revenue' },
  { value: 'CERTIFICATION', label: 'Certification' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'OTHER', label: 'Other' },
] as const;

const OBJECTIVE_STATUSES = [
  { value: 'NOT_STARTED', label: 'Not Started', color: 'bg-gray-100 text-gray-600' },
  { value: 'ON_TRACK', label: 'On Track', color: 'bg-green-100 text-green-800' },
  { value: 'AT_RISK', label: 'At Risk', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'BEHIND', label: 'Behind', color: 'bg-red-100 text-red-800' },
  { value: 'ACHIEVED', label: 'Achieved', color: 'bg-green-200 text-green-900' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
  { value: 'DEFERRED', label: 'Deferred', color: 'bg-blue-100 text-blue-800' },
] as const;

const MILESTONE_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'bg-gray-100 text-gray-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  status: string;
  notes: string | null;
  completedDate: string | null;
}

interface ObjectiveRecord {
  id: string;
  referenceNumber: string;
  title: string;
  objectiveStatement: string;
  category: string;
  status: string;
  policyCommitment: string | null;
  isoClause: string | null;
  linkedProcesses: string | null;
  linkedRisks: string | null;
  linkedOpportunities: string | null;
  kpiDescription: string;
  baselineValue: number;
  targetValue: number;
  currentValue: number | null;
  unit: string;
  owner: string;
  department: string;
  targetDate: string;
  resourcesRequired: string | null;
  progressNotes: string | null;
  progressPercent: number;
  milestones: Milestone[];
  aiAnalysis: string | null;
  aiSmartScore: string | null;
  aiKpiSuggestions: string | null;
  aiMilestones: string | null;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  title: string;
  objectiveStatement: string;
  category: string;
  status: string;
  policyCommitment: string;
  isoClause: string;
  linkedProcesses: string;
  linkedRisks: string;
  linkedOpportunities: string;
  kpiDescription: string;
  baselineValue: string;
  targetValue: string;
  currentValue: string;
  unit: string;
  owner: string;
  department: string;
  targetDate: string;
  resourcesRequired: string;
  progressNotes: string;
  progressPercent: string;
}

interface MilestoneForm {
  title: string;
  targetDate: string;
  notes: string;
}

const emptyForm: FormData = {
  title: '', objectiveStatement: '', category: 'PRODUCT_QUALITY', status: 'NOT_STARTED',
  policyCommitment: '', isoClause: '', linkedProcesses: '', linkedRisks: '',
  linkedOpportunities: '', kpiDescription: '', baselineValue: '0', targetValue: '0',
  currentValue: '', unit: '', owner: '', department: '', targetDate: '',
  resourcesRequired: '', progressNotes: '', progressPercent: '0',
};

const emptyMilestone: MilestoneForm = { title: '', targetDate: '', notes: '' };

function getBadge(value: string, options: readonly { value: string; label: string; color: string }[]) {
  const opt = options.find(o => o.value === value);
  return opt ? <Badge className={opt.color}>{opt.label}</Badge> : <Badge>{value}</Badge>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ObjectivesClient() {
  const [records, setRecords] = useState<ObjectiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ObjectiveRecord | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiExpandedId, setAiExpandedId] = useState<string | null>(null);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState<MilestoneForm>(emptyMilestone);
  const [milestoneObjId, setMilestoneObjId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/objectives', { params });
      setRecords(res.data.data.items || []);
    } catch (err) {
      console.error('Failed to fetch objectives:', err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (r: ObjectiveRecord) => {
    setEditing(r);
    setForm({
      title: r.title, objectiveStatement: r.objectiveStatement, category: r.category,
      status: r.status, policyCommitment: r.policyCommitment || '', isoClause: r.isoClause || '',
      linkedProcesses: r.linkedProcesses || '', linkedRisks: r.linkedRisks || '',
      linkedOpportunities: r.linkedOpportunities || '', kpiDescription: r.kpiDescription,
      baselineValue: r.baselineValue.toString(), targetValue: r.targetValue.toString(),
      currentValue: r.currentValue?.toString() || '', unit: r.unit,
      owner: r.owner, department: r.department,
      targetDate: r.targetDate ? r.targetDate.split('T')[0] : '',
      resourcesRequired: r.resourcesRequired || '', progressNotes: r.progressNotes || '',
      progressPercent: r.progressPercent?.toString() || '0',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload: any = {
        ...form,
        baselineValue: Number(form.baselineValue),
        targetValue: Number(form.targetValue),
        currentValue: form.currentValue ? Number(form.currentValue) : undefined,
        progressPercent: Number(form.progressPercent) || 0,
      };
      if (!payload.isoClause) delete payload.isoClause;

      if (editing) {
        await api.put(`/objectives/${editing.id}`, payload);
      } else {
        await api.post('/objectives', payload);
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
    if (!window.confirm('Delete this objective?')) return;
    try {
      await api.delete(`/objectives/${id}`);
      fetchRecords();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ─── Milestones ────────────────────────────────────────────────────────
  const openAddMilestone = (objId: string) => {
    setMilestoneObjId(objId);
    setMilestoneForm(emptyMilestone);
    setMilestoneModalOpen(true);
  };

  const handleAddMilestone = async () => {
    if (!milestoneObjId) return;
    try {
      setSubmitting(true);
      await api.post(`/objectives/${milestoneObjId}/milestones`, milestoneForm);
      setMilestoneModalOpen(false);
      fetchRecords();
    } catch (err) {
      console.error('Add milestone failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMilestoneStatus = async (objId: string, msId: string, status: string) => {
    try {
      await api.put(`/objectives/${objId}/milestones/${msId}`, { status });
      fetchRecords();
    } catch (err) {
      console.error('Update milestone failed:', err);
    }
  };

  const handleDeleteMilestone = async (objId: string, msId: string) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await api.delete(`/objectives/${objId}/milestones/${msId}`);
      fetchRecords();
    } catch (err) {
      console.error('Delete milestone failed:', err);
    }
  };

  const stats = {
    total: records.length,
    onTrack: records.filter(r => r.status === 'ON_TRACK').length,
    atRisk: records.filter(r => r.status === 'AT_RISK' || r.status === 'BEHIND').length,
    achieved: records.filter(r => r.status === 'ACHIEVED').length,
  };

  // Calculate KPI progress percentage
  const getKpiProgress = (r: ObjectiveRecord) => {
    if (!r.currentValue || r.targetValue === r.baselineValue) return 0;
    const progress = ((r.currentValue - r.baselineValue) / (r.targetValue - r.baselineValue)) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Objectives</h1>
          <p className="text-sm text-gray-500 mt-1">ISO 9001:2015 quality objectives with KPI tracking</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Objective
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Target className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-gray-500">Total Objectives</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.onTrack}</p><p className="text-xs text-gray-500">On Track</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><AlertCircle className="h-5 w-5 text-orange-600" /></div><div><p className="text-2xl font-bold">{stats.atRisk}</p><p className="text-xs text-gray-500">At Risk / Behind</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-200 rounded-lg"><CheckCircle className="h-5 w-5 text-green-700" /></div><div><p className="text-2xl font-bold">{stats.achieved}</p><p className="text-xs text-gray-500">Achieved</p></div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {OBJECTIVE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {OBJECTIVE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Objectives Found</h3>
            <p className="text-gray-500 mb-4">Define quality objectives to track performance against targets.</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> New Objective</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map(r => {
            const kpiProgress = getKpiProgress(r);
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">{r.referenceNumber}</span>
                        <Badge className="bg-blue-100 text-blue-800">{OBJECTIVE_CATEGORIES.find(c => c.value === r.category)?.label}</Badge>
                        {getBadge(r.status, OBJECTIVE_STATUSES)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{r.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.objectiveStatement}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span>Owner: {r.owner}</span>
                        <span>Dept: {r.department}</span>
                        <span>Target: {new Date(r.targetDate).toLocaleDateString()}</span>
                        <span>Progress: {r.progressPercent}%</span>
                      </div>

                      {/* KPI Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">KPI: {r.kpiDescription}</span>
                          <span className="font-medium">{r.currentValue ?? r.baselineValue} / {r.targetValue} {r.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${kpiProgress >= 100 ? 'bg-green-500' : kpiProgress >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                            style={{ width: `${kpiProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                        {expandedId === r.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(r)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-700">Delete</Button>
                    </div>
                  </div>

                  {/* Expanded */}
                  {expandedId === r.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* KPI Details */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500">Baseline</p>
                          <p className="text-lg font-bold">{r.baselineValue} {r.unit}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-blue-600">Current</p>
                          <p className="text-lg font-bold text-blue-700">{r.currentValue ?? '—'} {r.unit}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-green-600">Target</p>
                          <p className="text-lg font-bold text-green-700">{r.targetValue} {r.unit}</p>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-700">Milestones ({r.milestones?.length || 0})</h4>
                          <Button variant="outline" size="sm" onClick={() => openAddMilestone(r.id)}>
                            <Plus className="h-3 w-3 mr-1" /> Add Milestone
                          </Button>
                        </div>
                        {r.milestones && r.milestones.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-3 text-gray-600">Milestone</th>
                                  <th className="text-left py-2 px-3 text-gray-600">Target Date</th>
                                  <th className="text-left py-2 px-3 text-gray-600">Status</th>
                                  <th className="text-left py-2 px-3 text-gray-600">Completed</th>
                                  <th className="text-right py-2 px-3 text-gray-600">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.milestones.map(ms => (
                                  <tr key={ms.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-3">{ms.title}</td>
                                    <td className="py-2 px-3">{new Date(ms.targetDate).toLocaleDateString()}</td>
                                    <td className="py-2 px-3">{getBadge(ms.status, MILESTONE_STATUSES)}</td>
                                    <td className="py-2 px-3">{ms.completedDate ? new Date(ms.completedDate).toLocaleDateString() : '—'}</td>
                                    <td className="py-2 px-3 text-right">
                                      <div className="flex justify-end gap-1">
                                        {ms.status === 'PENDING' && (
                                          <Button variant="outline" size="sm" onClick={() => handleUpdateMilestoneStatus(r.id, ms.id, 'IN_PROGRESS')}>Start</Button>
                                        )}
                                        {ms.status === 'IN_PROGRESS' && (
                                          <Button variant="outline" size="sm" onClick={() => handleUpdateMilestoneStatus(r.id, ms.id, 'COMPLETED')}>Complete</Button>
                                        )}
                                        <Button variant="outline" size="sm" onClick={() => handleDeleteMilestone(r.id, ms.id)} className="text-red-600">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No milestones defined yet.</p>
                        )}
                      </div>

                      {/* Linkage */}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {r.linkedProcesses && <span>Processes: {r.linkedProcesses}</span>}
                        {r.linkedRisks && <span>Risks: {r.linkedRisks}</span>}
                        {r.linkedOpportunities && <span>Opportunities: {r.linkedOpportunities}</span>}
                        {r.resourcesRequired && <span>Resources: {r.resourcesRequired}</span>}
                      </div>

                      {/* AI Analysis */}
                      {r.aiAnalysis && (
                        <div className="border-t pt-3">
                          <button onClick={() => setAiExpandedId(aiExpandedId === r.id ? null : r.id)} className="flex items-center gap-2 text-sm font-medium text-purple-700">
                            <Sparkles className="h-4 w-4" /> AI Analysis
                            {aiExpandedId === r.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                          {aiExpandedId === r.id && (
                            <div className="mt-2 bg-purple-50 p-3 rounded-lg space-y-2 text-sm">
                              <p>{r.aiAnalysis}</p>
                              {r.aiSmartScore && <p><strong>SMART Score:</strong> {r.aiSmartScore}</p>}
                              {r.aiKpiSuggestions && <p><strong>KPI Suggestions:</strong> {r.aiKpiSuggestions}</p>}
                              {r.aiMilestones && <p><strong>Milestone Suggestions:</strong> {r.aiMilestones}</p>}
                              <AIDisclosure variant="inline" provider="claude" analysisType="Objective Analysis" confidence={0.85} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Objective Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Objective' : 'New Objective'} size="lg">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Objective Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="md:col-span-2"><Label>Objective Statement *</Label><Textarea value={form.objectiveStatement} onChange={e => setForm({...form, objectiveStatement: e.target.value})} rows={2} /></div>
              <div><Label>Category *</Label>
                <Select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {OBJECTIVE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </Select>
              </div>
              {editing && (
                <div><Label>Status</Label>
                  <Select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {OBJECTIVE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </div>
              )}
              <div><Label>Owner *</Label><Input value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} /></div>
              <div><Label>Department *</Label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
              <div><Label>Target Date *</Label><Input type="date" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} /></div>
              <div><Label>ISO Clause</Label><Input value={form.isoClause} onChange={e => setForm({...form, isoClause: e.target.value})} /></div>
              <div className="md:col-span-2"><Label>Policy Commitment</Label><Input value={form.policyCommitment} onChange={e => setForm({...form, policyCommitment: e.target.value})} /></div>
              <div><Label>Resources Required</Label><Textarea value={form.resourcesRequired} onChange={e => setForm({...form, resourcesRequired: e.target.value})} rows={2} /></div>
            </div>
          </div>

          {/* KPI */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">KPI Measurement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>KPI Description *</Label><Input value={form.kpiDescription} onChange={e => setForm({...form, kpiDescription: e.target.value})} /></div>
              <div><Label>Baseline Value *</Label><Input type="number" value={form.baselineValue} onChange={e => setForm({...form, baselineValue: e.target.value})} /></div>
              <div><Label>Target Value *</Label><Input type="number" value={form.targetValue} onChange={e => setForm({...form, targetValue: e.target.value})} /></div>
              <div><Label>Current Value</Label><Input type="number" value={form.currentValue} onChange={e => setForm({...form, currentValue: e.target.value})} /></div>
              <div><Label>Unit *</Label><Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="%, pcs, days, etc." /></div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Progress %</Label><Input type="number" min="0" max="100" value={form.progressPercent} onChange={e => setForm({...form, progressPercent: e.target.value})} /></div>
              <div className="md:col-span-2"><Label>Progress Notes</Label><Textarea value={form.progressNotes} onChange={e => setForm({...form, progressNotes: e.target.value})} rows={2} /></div>
            </div>
          </div>

          {/* Linkage */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Linkage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Linked Processes</Label><Input value={form.linkedProcesses} onChange={e => setForm({...form, linkedProcesses: e.target.value})} /></div>
              <div><Label>Linked Risks</Label><Input value={form.linkedRisks} onChange={e => setForm({...form, linkedRisks: e.target.value})} /></div>
              <div><Label>Linked Opportunities</Label><Input value={form.linkedOpportunities} onChange={e => setForm({...form, linkedOpportunities: e.target.value})} /></div>
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || !form.title || !form.objectiveStatement || !form.kpiDescription || !form.owner || !form.department || !form.targetDate || !form.unit}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : editing ? 'Update Objective' : 'Create Objective'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal isOpen={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} title="Add Milestone" size="md">
        <div className="space-y-4 p-1">
          <div><Label>Milestone Title *</Label><Input value={milestoneForm.title} onChange={e => setMilestoneForm({...milestoneForm, title: e.target.value})} /></div>
          <div><Label>Target Date *</Label><Input type="date" value={milestoneForm.targetDate} onChange={e => setMilestoneForm({...milestoneForm, targetDate: e.target.value})} /></div>
          <div><Label>Notes</Label><Textarea value={milestoneForm.notes} onChange={e => setMilestoneForm({...milestoneForm, notes: e.target.value})} rows={2} /></div>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setMilestoneModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMilestone} disabled={submitting || !milestoneForm.title || !milestoneForm.targetDate}>
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : 'Add Milestone'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
