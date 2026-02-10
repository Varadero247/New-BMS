'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import { Plus, Target, Loader2, Search, Sparkles, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────

const OBJECTIVE_CATEGORIES = [
  { value: 'INCIDENT_REDUCTION', label: 'Incident Reduction' },
  { value: 'HAZARD_ELIMINATION', label: 'Hazard Elimination' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'LEGAL_COMPLIANCE', label: 'Legal Compliance' },
  { value: 'HEALTH_WELLBEING', label: 'Health & Wellbeing' },
  { value: 'RISK_REDUCTION', label: 'Risk Reduction' },
  { value: 'CONTRACTOR_MANAGEMENT', label: 'Contractor Management' },
  { value: 'OTHER', label: 'Other' },
] as const;

const OBJECTIVE_STATUSES = [
  { value: 'ACTIVE', label: 'Active', color: 'bg-blue-100 text-blue-800' },
  { value: 'ON_TRACK', label: 'On Track', color: 'bg-green-100 text-green-800' },
  { value: 'AT_RISK', label: 'At Risk', color: 'bg-orange-100 text-orange-800' },
  { value: 'BEHIND', label: 'Behind', color: 'bg-red-100 text-red-800' },
  { value: 'ACHIEVED', label: 'Achieved', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
] as const;

// ─── Types ────────────────────────────────────────────────────────

interface Milestone {
  id?: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface Objective {
  id: string;
  referenceNumber: string;
  title: string;
  objectiveStatement: string;
  category: string;
  ohsPolicyLink: string;
  department: string;
  owner: string;
  startDate: string;
  targetDate: string;
  kpiDescription: string;
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  progressPercent: number;
  monitoringFrequency: string;
  resourcesRequired: string;
  progressNotes: string;
  status: string;
  milestones: Milestone[];
  createdAt: string;
}

interface ObjectiveForm {
  title: string;
  objectiveStatement: string;
  category: string;
  ohsPolicyLink: string;
  department: string;
  owner: string;
  startDate: string;
  targetDate: string;
  kpiDescription: string;
  baselineValue: string;
  targetValue: string;
  currentValue: string;
  unit: string;
  monitoringFrequency: string;
  resourcesRequired: string;
  progressNotes: string;
  status: string;
  milestones: { title: string; dueDate: string }[];
}

const emptyForm: ObjectiveForm = {
  title: '', objectiveStatement: '', category: 'INCIDENT_REDUCTION',
  ohsPolicyLink: '', department: '', owner: '',
  startDate: new Date().toISOString().split('T')[0], targetDate: '',
  kpiDescription: '', baselineValue: '', targetValue: '', currentValue: '0', unit: '',
  monitoringFrequency: '', resourcesRequired: '', progressNotes: '',
  status: 'ACTIVE', milestones: [],
};

// ─── Component ────────────────────────────────────────────────────

export default function ObjectivesClient() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState<ObjectiveForm>({ ...emptyForm });
  const [section, setSection] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadObjectives = useCallback(async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const response = await api.get('/objectives', { params });
      setObjectives(response.data.data || []);
    } catch (error) {
      console.error('Failed to load objectives:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter]);

  useEffect(() => { loadObjectives(); }, [loadObjectives]);

  function openModal() {
    setForm({ ...emptyForm, milestones: [] });
    setSection(0);
    setModalOpen(true);
  }

  function updateForm(field: keyof ObjectiveForm, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function addMilestone() {
    setForm(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', dueDate: '' }],
    }));
  }

  function updateMilestone(index: number, field: 'title' | 'dueDate', value: string) {
    setForm(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  }

  function removeMilestone(index: number) {
    setForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  }

  async function generateAiAssist() {
    if (form.title.length < 5) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/objectives/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectiveTitle: form.title,
          category: form.category,
          department: form.department,
          targetDate: form.targetDate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          objectiveStatement: data.objectiveStatement || prev.objectiveStatement,
          ohsPolicyLink: data.ohsPolicyLink || prev.ohsPolicyLink,
          kpiDescription: data.kpiDescription || prev.kpiDescription,
          resourcesRequired: data.resourcesRequired || prev.resourcesRequired,
          milestones: data.suggestedMilestones?.length > 0
            ? data.suggestedMilestones.map((m: any) => {
                const start = new Date(prev.startDate || new Date());
                const dueDate = new Date(start.getTime() + (m.weeksFromStart || 4) * 7 * 24 * 60 * 60 * 1000);
                return { title: m.title, dueDate: dueDate.toISOString().split('T')[0] };
              })
            : prev.milestones,
        }));
      }
    } catch (error) {
      console.error('AI assist failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.title || !form.category || !form.targetDate) return;
    setSaving(true);
    try {
      const validMilestones = form.milestones.filter(m => m.title && m.dueDate);
      await api.post('/objectives', {
        title: form.title,
        objectiveStatement: form.objectiveStatement || undefined,
        category: form.category,
        ohsPolicyLink: form.ohsPolicyLink || undefined,
        department: form.department || undefined,
        owner: form.owner || undefined,
        startDate: form.startDate || undefined,
        targetDate: form.targetDate,
        kpiDescription: form.kpiDescription || undefined,
        baselineValue: form.baselineValue ? parseFloat(form.baselineValue) : undefined,
        targetValue: form.targetValue ? parseFloat(form.targetValue) : undefined,
        currentValue: form.currentValue ? parseFloat(form.currentValue) : 0,
        unit: form.unit || undefined,
        monitoringFrequency: form.monitoringFrequency || undefined,
        resourcesRequired: form.resourcesRequired || undefined,
        progressNotes: form.progressNotes || undefined,
        aiGenerated: !!(form.objectiveStatement || form.kpiDescription),
        status: form.status,
        milestones: validMilestones.length > 0 ? validMilestones : undefined,
      });
      setModalOpen(false);
      loadObjectives();
    } catch (error) {
      console.error('Failed to create objective:', error);
    } finally {
      setSaving(false);
    }
  }

  const getStatusColor = (status: string) => {
    const s = OBJECTIVE_STATUSES.find(os => os.value === status);
    return s?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (value: string) => {
    const c = OBJECTIVE_CATEGORIES.find(oc => oc.value === value);
    return c?.label || value;
  };

  const counts = {
    total: objectives.length,
    ACHIEVED: objectives.filter(o => o.status === 'ACHIEVED').length,
    ON_TRACK: objectives.filter(o => o.status === 'ON_TRACK' || o.status === 'ACTIVE').length,
    AT_RISK: objectives.filter(o => o.status === 'AT_RISK' || o.status === 'BEHIND').length,
  };

  const sections = ['Objective Definition', 'Measurement & Milestones'];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OHS Objectives</h1>
            <p className="text-gray-500 mt-1">Track and monitor safety objectives and targets</p>
          </div>
          <Button onClick={openModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Objective
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold">{counts.total}</p><p className="text-sm text-gray-500">Total Objectives</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-green-600">{counts.ACHIEVED}</p><p className="text-sm text-gray-500">Achieved</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-blue-600">{counts.ON_TRACK}</p><p className="text-sm text-gray-500">On Track</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-red-600">{counts.AT_RISK}</p><p className="text-sm text-gray-500">At Risk / Behind</p></div></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search objectives..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="all">All Statuses</option>
            {OBJECTIVE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="all">All Categories</option>
            {OBJECTIVE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* Objectives Cards */}
        {loading ? (
          <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded" />)}</div>
        ) : objectives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {objectives.map(obj => {
              const completedMilestones = obj.milestones?.filter(m => m.completed).length || 0;
              const totalMilestones = obj.milestones?.length || 0;
              const progress = obj.progressPercent || 0;

              return (
                <Card key={obj.id} className={obj.status === 'AT_RISK' || obj.status === 'BEHIND' ? 'border-red-200' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500">{obj.referenceNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(obj.status)}`}>
                            {obj.status.replace(/_/g, ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">{getCategoryLabel(obj.category)}</Badge>
                        </div>
                        <h3 className="font-medium text-gray-900">{obj.title}</h3>
                        {obj.objectiveStatement && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{obj.objectiveStatement}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-700">{Math.round(progress)}%</p>
                        {obj.targetValue > 0 && (
                          <p className="text-xs text-gray-400">{obj.currentValue}/{obj.targetValue} {obj.unit}</p>
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div className={`h-2 rounded-full ${
                        progress >= 100 ? 'bg-green-500' :
                        progress >= 70 ? 'bg-blue-500' :
                        progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} style={{ width: `${Math.min(100, progress)}%` }} />
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{obj.owner || 'No owner'}</span>
                      <span>Target: {new Date(obj.targetDate).toLocaleDateString()}</span>
                      {totalMilestones > 0 && (
                        <span>Milestones: {completedMilestones}/{totalMilestones}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No objectives defined yet</p>
                <Button variant="outline" className="mt-4" onClick={openModal}><Plus className="h-4 w-4 mr-2" />Create First Objective</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        {modalOpen && (
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Objective" size="lg">
            <div className="flex gap-1 mb-6 border-b">
              {sections.map((s, i) => (
                <button key={i} onClick={() => setSection(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${section === i ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Section A: Objective Definition */}
            {section === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="e.g., Reduce workplace injuries by 20%" />
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> AI Objective Assistant
                    </h3>
                    <Button size="sm" variant="outline" onClick={generateAiAssist} disabled={aiLoading || form.title.length < 5}>
                      {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating...</> : 'Assist with AI'}
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600">Enter a title, then AI will generate a SMART statement, KPIs, and milestones.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={form.category} onChange={e => updateForm('category', e.target.value)}>
                      {OBJECTIVE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onChange={e => updateForm('status', e.target.value)}>
                      {OBJECTIVE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department</Label>
                    <Input value={form.department} onChange={e => updateForm('department', e.target.value)} placeholder="e.g., Manufacturing" />
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <Input value={form.owner} onChange={e => updateForm('owner', e.target.value)} placeholder="Name of responsible person" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={form.startDate} onChange={e => updateForm('startDate', e.target.value)} />
                  </div>
                  <div>
                    <Label>Target Date *</Label>
                    <Input type="date" value={form.targetDate} onChange={e => updateForm('targetDate', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Section B: Measurement & Milestones */}
            {section === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Objective Statement {form.objectiveStatement && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Textarea value={form.objectiveStatement} onChange={e => updateForm('objectiveStatement', e.target.value)} rows={3} placeholder="SMART objective statement" />
                </div>
                <div>
                  <Label>OHS Policy Link {form.ohsPolicyLink && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Input value={form.ohsPolicyLink} onChange={e => updateForm('ohsPolicyLink', e.target.value)} placeholder="How this links to OHS policy" />
                </div>
                <div>
                  <Label>KPI Description {form.kpiDescription && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Input value={form.kpiDescription} onChange={e => updateForm('kpiDescription', e.target.value)} placeholder="Measurable KPI" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Baseline</Label>
                    <Input type="number" value={form.baselineValue} onChange={e => updateForm('baselineValue', e.target.value)} />
                  </div>
                  <div>
                    <Label>Target</Label>
                    <Input type="number" value={form.targetValue} onChange={e => updateForm('targetValue', e.target.value)} />
                  </div>
                  <div>
                    <Label>Current</Label>
                    <Input type="number" value={form.currentValue} onChange={e => updateForm('currentValue', e.target.value)} />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Input value={form.unit} onChange={e => updateForm('unit', e.target.value)} placeholder="e.g., %, count" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monitoring Frequency</Label>
                    <Select value={form.monitoringFrequency} onChange={e => updateForm('monitoringFrequency', e.target.value)}>
                      <option value="">Select...</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Resources Required {form.resourcesRequired && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                    <Input value={form.resourcesRequired} onChange={e => updateForm('resourcesRequired', e.target.value)} placeholder="Budget, staff, tools" />
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Milestones</Label>
                    <Button size="sm" variant="outline" onClick={addMilestone}><Plus className="h-3 w-3 mr-1" />Add</Button>
                  </div>
                  {form.milestones.length > 0 ? (
                    <div className="space-y-2">
                      {form.milestones.map((m, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <Input value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)} placeholder="Milestone title" className="flex-1" />
                          <Input type="date" value={m.dueDate} onChange={e => updateMilestone(i, 'dueDate', e.target.value)} className="w-40" />
                          <button onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No milestones. Use AI to generate them or add manually.</p>
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
                    <Button onClick={handleSubmit} disabled={saving || !form.title || !form.targetDate}>
                      {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Create Objective'}
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
