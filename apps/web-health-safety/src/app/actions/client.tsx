'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  AIDisclosure,
} from '@ims/ui';
import { Plus, ClipboardList, Loader2, Search, Sparkles, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────

const CAPA_TYPES = [
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'PREVENTIVE', label: 'Preventive' },
  { value: 'IMPROVEMENT', label: 'Improvement' },
] as const;

const CAPA_SOURCES = [
  { value: 'INCIDENT', label: 'Incident' },
  { value: 'NEAR_MISS', label: 'Near Miss' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'RISK_ASSESSMENT', label: 'Risk Assessment' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'MANAGEMENT_REVIEW', label: 'Management Review' },
  { value: 'WORKER_SUGGESTION', label: 'Worker Suggestion' },
  { value: 'OTHER', label: 'Other' },
] as const;

const CAPA_PRIORITIES = [
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' },
] as const;

const CAPA_STATUSES = [
  { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification', color: 'bg-purple-100 text-purple-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-100 text-green-800' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-800' },
] as const;

const ACTION_TYPES = [
  { value: 'IMMEDIATE', label: 'Immediate' },
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'PREVENTIVE', label: 'Preventive' },
] as const;

// ─── Types ────────────────────────────────────────────────────────

interface CapaAction {
  id: string;
  title: string;
  description: string;
  type: string;
  owner: string;
  dueDate: string;
  status: string;
}

interface Capa {
  id: string;
  referenceNumber: string;
  title: string;
  capaType: string;
  source: string;
  sourceReference: string;
  priority: string;
  raisedDate: string;
  targetCompletionDate: string;
  department: string;
  responsiblePerson: string;
  problemStatement: string;
  rootCauseAnalysis: string;
  containmentActions: string;
  successCriteria: string;
  verificationMethod: string;
  aiAnalysis: string;
  aiAnalysisGenerated: boolean;
  status: string;
  actions: CapaAction[];
  createdAt: string;
}

interface CapaForm {
  title: string;
  capaType: string;
  source: string;
  sourceReference: string;
  priority: string;
  targetCompletionDate: string;
  department: string;
  responsiblePerson: string;
  problemStatement: string;
  rootCauseAnalysis: string;
  containmentActions: string;
  successCriteria: string;
  verificationMethod: string;
  actions: { title: string; description: string; type: string; owner: string; dueDate: string }[];
}

const emptyForm: CapaForm = {
  title: '', capaType: 'CORRECTIVE', source: 'INCIDENT', sourceReference: '',
  priority: 'MEDIUM', targetCompletionDate: '', department: '', responsiblePerson: '',
  problemStatement: '', rootCauseAnalysis: '', containmentActions: '',
  successCriteria: '', verificationMethod: '', actions: [],
};

// ─── Component ────────────────────────────────────────────────────

export default function CapaClient() {
  const [capas, setCapas] = useState<Capa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState<CapaForm>({ ...emptyForm });
  const [section, setSection] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadCapas = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.capaType = typeFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      const response = await api.get('/capa', { params });
      setCapas(response.data.data || []);
    } catch (error) {
      console.error('Failed to load CAPAs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter, priorityFilter]);

  useEffect(() => { loadCapas(); }, [loadCapas]);

  function openModal() {
    setForm({ ...emptyForm, actions: [] });
    setSection(0);
    setModalOpen(true);
  }

  function updateForm(field: keyof CapaForm, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function addAction() {
    setForm(prev => ({
      ...prev,
      actions: [...prev.actions, { title: '', description: '', type: 'CORRECTIVE', owner: '', dueDate: '' }],
    }));
  }

  function updateAction(index: number, field: string, value: string) {
    setForm(prev => ({
      ...prev,
      actions: prev.actions.map((a, i) => i === index ? { ...a, [field]: value } : a),
    }));
  }

  function removeAction(index: number) {
    setForm(prev => ({ ...prev, actions: prev.actions.filter((_, i) => i !== index) }));
  }

  async function generateAiAnalysis() {
    if (form.problemStatement.length < 20) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/capa/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capaType: form.capaType,
          source: form.source,
          priority: form.priority,
          problemStatement: form.problemStatement,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const allActions: CapaForm['actions'] = [];
        if (data.correctiveActions) {
          data.correctiveActions.forEach((a: Record<string, unknown>) => {
            allActions.push({ title: a.title, description: '', type: 'CORRECTIVE', owner: a.owner || '', dueDate: '' });
          });
        }
        if (data.preventiveActions) {
          data.preventiveActions.forEach((a: Record<string, unknown>) => {
            allActions.push({ title: a.title, description: '', type: 'PREVENTIVE', owner: a.owner || '', dueDate: '' });
          });
        }
        setForm(prev => ({
          ...prev,
          rootCauseAnalysis: data.rootCauseAnalysis || prev.rootCauseAnalysis,
          containmentActions: data.containmentActions || prev.containmentActions,
          successCriteria: data.successCriteria || prev.successCriteria,
          verificationMethod: data.verificationMethod || prev.verificationMethod,
          actions: allActions.length > 0 ? allActions : prev.actions,
        }));
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.title || !form.capaType || !form.source) return;
    setSaving(true);
    try {
      const validActions = form.actions.filter(a => a.title).map(a => ({
        title: a.title,
        description: a.description || undefined,
        type: a.type as 'IMMEDIATE' | 'CORRECTIVE' | 'PREVENTIVE',
        owner: a.owner || undefined,
        dueDate: a.dueDate || undefined,
      }));
      await api.post('/capa', {
        title: form.title,
        capaType: form.capaType,
        source: form.source,
        sourceReference: form.sourceReference || undefined,
        priority: form.priority,
        targetCompletionDate: form.targetCompletionDate || undefined,
        department: form.department || undefined,
        responsiblePerson: form.responsiblePerson || undefined,
        problemStatement: form.problemStatement || undefined,
        rootCauseAnalysis: form.rootCauseAnalysis || undefined,
        containmentActions: form.containmentActions || undefined,
        successCriteria: form.successCriteria || undefined,
        verificationMethod: form.verificationMethod || undefined,
        aiAnalysisGenerated: !!(form.rootCauseAnalysis || form.containmentActions),
        actions: validActions.length > 0 ? validActions : undefined,
      });
      setModalOpen(false);
      loadCapas();
    } catch (error) {
      console.error('Failed to create CAPA:', error);
    } finally {
      setSaving(false);
    }
  }

  const getPriorityColor = (priority: string) => {
    const p = CAPA_PRIORITIES.find(cp => cp.value === priority);
    return p?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const s = CAPA_STATUSES.find(cs => cs.value === status);
    return s?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const isOverdue = (dateStr: string, status: string) => {
    if (status === 'CLOSED') return false;
    return dateStr && new Date(dateStr) < new Date();
  };

  const counts = {
    total: capas.length,
    OPEN: capas.filter(c => c.status === 'OPEN').length,
    IN_PROGRESS: capas.filter(c => c.status === 'IN_PROGRESS').length,
    OVERDUE: capas.filter(c => isOverdue(c.targetCompletionDate, c.status)).length,
    CLOSED: capas.filter(c => c.status === 'CLOSED').length,
  };

  const sections = ['CAPA Identification', 'Problem Analysis & Actions'];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">CAPA Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Corrective and Preventive Actions</p>
          </div>
          <Button onClick={openModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create CAPA
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold">{counts.total}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-blue-600">{counts.OPEN}</p><p className="text-sm text-gray-500 dark:text-gray-400">Open</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-indigo-600">{counts.IN_PROGRESS}</p><p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-red-600">{counts.OVERDUE}</p><p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-green-600">{counts.CLOSED}</p><p className="text-sm text-gray-500 dark:text-gray-400">Closed</p></div></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" aria-label="Search CAPAs..." placeholder="Search CAPAs..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">All Statuses</option>
            {CAPA_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select aria-label="Filter by type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">All Types</option>
            {CAPA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select aria-label="Filter by priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">All Priorities</option>
            {CAPA_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        {/* CAPA Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}</div>
            ) : capas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Responsible</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capas.map(capa => {
                    const overdue = isOverdue(capa.targetCompletionDate, capa.status);
                    return (
                      <TableRow key={capa.id} className={overdue ? 'bg-red-50' : ''}>
                        <TableCell className="font-mono text-xs">{capa.referenceNumber}</TableCell>
                        <TableCell className="font-medium">{capa.title}</TableCell>
                        <TableCell><Badge variant="outline">{capa.capaType}</Badge></TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">{capa.source.replace(/_/g, ' ')}</TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(capa.priority)}`}>{capa.priority}</span></TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">{capa.responsiblePerson || '-'}</TableCell>
                        <TableCell className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          {capa.targetCompletionDate ? new Date(capa.targetCompletionDate).toLocaleDateString() : '-'}
                          {overdue && <AlertCircle className="h-3 w-3 inline ml-1" />}
                        </TableCell>
                        <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(capa.status)}`}>{capa.status.replace(/_/g, ' ')}</span></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No CAPAs found</p>
                <Button variant="outline" className="mt-4" onClick={openModal}><Plus className="h-4 w-4 mr-2" />Create First CAPA</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create CAPA" size="lg">
            <div className="flex gap-1 mb-6 border-b">
              {sections.map((s, i) => (
                <button key={i} onClick={() => setSection(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${section === i ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Section A: CAPA Identification */}
            {section === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="Brief description of the CAPA" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Type *</Label>
                    <Select value={form.capaType} onChange={e => updateForm('capaType', e.target.value)}>
                      {CAPA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Source *</Label>
                    <Select value={form.source} onChange={e => updateForm('source', e.target.value)}>
                      {CAPA_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onChange={e => updateForm('priority', e.target.value)}>
                      {CAPA_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Source Reference</Label>
                  <Input value={form.sourceReference} onChange={e => updateForm('sourceReference', e.target.value)} placeholder="e.g., INC-2601-0001, Audit ref" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department</Label>
                    <Input value={form.department} onChange={e => updateForm('department', e.target.value)} placeholder="Department" />
                  </div>
                  <div>
                    <Label>Responsible Person</Label>
                    <Input value={form.responsiblePerson} onChange={e => updateForm('responsiblePerson', e.target.value)} placeholder="Name" />
                  </div>
                </div>
                <div>
                  <Label>Target Completion Date</Label>
                  <Input type="date" value={form.targetCompletionDate} onChange={e => updateForm('targetCompletionDate', e.target.value)} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-calculated from priority if left blank</p>
                </div>
              </div>
            )}

            {/* Section B: Problem Analysis & Actions */}
            {section === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Problem Statement</Label>
                  <Textarea value={form.problemStatement} onChange={e => updateForm('problemStatement', e.target.value)}
                    rows={3} placeholder="Describe the problem in detail (min 20 chars for AI analysis)" />
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> AI CAPA Analysis
                    </h3>
                    <Button size="sm" variant="outline" onClick={generateAiAnalysis} disabled={aiLoading || form.problemStatement.length < 20}>
                      {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analysing...</> : 'Analyse with AI'}
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600">Enter a problem statement (20+ chars), then AI generates root cause analysis, actions, and verification.</p>
                  <AIDisclosure variant="inline" provider="claude" analysisType="CAPA Recommendation" confidence={0.85} />
                </div>
                <div>
                  <Label>Root Cause Analysis {form.rootCauseAnalysis && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Textarea value={form.rootCauseAnalysis} onChange={e => updateForm('rootCauseAnalysis', e.target.value)} rows={3} placeholder="5-Why root cause analysis" />
                </div>
                <div>
                  <Label>Containment Actions {form.containmentActions && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Textarea value={form.containmentActions} onChange={e => updateForm('containmentActions', e.target.value)} rows={2} placeholder="Immediate containment actions" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Success Criteria {form.successCriteria && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                    <Textarea value={form.successCriteria} onChange={e => updateForm('successCriteria', e.target.value)} rows={2} placeholder="How to measure success" />
                  </div>
                  <div>
                    <Label>Verification Method {form.verificationMethod && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                    <Textarea value={form.verificationMethod} onChange={e => updateForm('verificationMethod', e.target.value)} rows={2} placeholder="How to verify effectiveness" />
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>CAPA Actions</Label>
                    <Button size="sm" variant="outline" onClick={addAction}><Plus className="h-3 w-3 mr-1" />Add Action</Button>
                  </div>
                  {form.actions.length > 0 ? (
                    <div className="space-y-3">
                      {form.actions.map((a, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                          <div className="flex gap-2 items-center">
                            <Input value={a.title} onChange={e => updateAction(i, 'title', e.target.value)} placeholder="Action title" className="flex-1" />
                            <select value={a.type} onChange={e => updateAction(i, 'type', e.target.value)} className="px-2 py-1.5 border rounded text-sm">
                              {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <button onClick={() => removeAction(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input value={a.owner} onChange={e => updateAction(i, 'owner', e.target.value)} placeholder="Owner" />
                            <Input type="date" value={a.dueDate} onChange={e => updateAction(i, 'dueDate', e.target.value)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No actions. Use AI to generate them or add manually.</p>
                  )}
                </div>
              </div>
            )}

            <ModalFooter>
              <div className="flex justify-between w-full">
                <div>{section > 0 && <Button variant="outline" onClick={() => setSection(0)}>Previous</Button>}</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                  {section < 1 ? (
                    <Button onClick={() => setSection(1)}>Next</Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={saving || !form.title}>
                      {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Create CAPA'}
                    </Button>
                  )}
                </div>
              </div>
            </ModalFooter>
          </Modal>
        )}
      </div>
    </div>
  );
}
