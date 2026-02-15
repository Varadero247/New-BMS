'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  AIDisclosure,
} from '@ims/ui';
import { Plus, FileWarning, Loader2, Search, Sparkles, X } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────

const INCIDENT_TYPES = [
  { value: 'INJURY', label: 'Injury' },
  { value: 'NEAR_MISS', label: 'Near Miss' },
  { value: 'DANGEROUS_OCCURRENCE', label: 'Dangerous Occurrence' },
  { value: 'OCCUPATIONAL_ILLNESS', label: 'Occupational Illness' },
  { value: 'PROPERTY_DAMAGE', label: 'Property Damage' },
  { value: 'FIRST_AID', label: 'First Aid' },
  { value: 'MEDICAL_TREATMENT', label: 'Medical Treatment' },
  { value: 'LOST_TIME', label: 'Lost Time' },
] as const;

const SEVERITIES = [
  { value: 'MINOR', label: 'Minor', color: 'bg-green-100 text-green-800' },
  { value: 'MODERATE', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MAJOR', label: 'Major', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
  { value: 'CATASTROPHIC', label: 'Catastrophic', color: 'bg-red-200 text-red-900' },
] as const;

const STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
  { value: 'AWAITING_ACTIONS', label: 'Awaiting Actions' },
  { value: 'ACTIONS_IN_PROGRESS', label: 'Actions in Progress' },
  { value: 'VERIFICATION', label: 'Verification' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

const EMPLOYMENT_TYPES = ['Employee', 'Contractor', 'Visitor', 'Member of Public'] as const;

// ─── Types ────────────────────────────────────────────────────────

interface Incident {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  category: string;
  location: string;
  dateOccurred: string;
  dateReported: string;
  status: string;
  injuredPersonName: string;
  injuredPersonRole: string;
  employmentType: string;
  injuryType: string;
  bodyPart: string;
  treatmentType: string;
  lostTime: boolean;
  daysLost: number;
  witnesses: string;
  riddorReportable: boolean;
  regulatoryReference: string;
  reportedToAuthority: boolean;
  reportedToAuthorityDate: string;
  reportedBy: string;
  investigationRequired: boolean;
  investigationDueDate: string;
  immediateCause: string;
  rootCauses: string;
  contributingFactors: string;
  aiImmediateCause: string;
  aiUnderlyingCause: string;
  aiRootCause: string;
  aiContributingFactors: string;
  aiRecurrencePrevention: string;
  aiAnalysisGenerated: boolean;
  createdAt: string;
}

interface IncidentForm {
  title: string;
  description: string;
  type: string;
  severity: string;
  category: string;
  location: string;
  dateOccurred: string;
  injuredPersonName: string;
  injuredPersonRole: string;
  employmentType: string;
  injuryType: string;
  bodyPart: string;
  treatmentType: string;
  lostTime: boolean;
  daysLost: number;
  witnesses: string;
  riddorReportable: boolean;
  regulatoryReference: string;
  reportedToAuthority: boolean;
  reportedToAuthorityDate: string;
  reportedBy: string;
  investigationRequired: boolean;
  investigationDueDate: string;
  immediateCause: string;
  rootCauses: string;
  contributingFactors: string;
  aiImmediateCause: string;
  aiUnderlyingCause: string;
  aiRootCause: string;
  aiContributingFactors: string;
  aiRecurrencePrevention: string;
}

const emptyForm: IncidentForm = {
  title: '', description: '', type: 'INJURY', severity: 'MODERATE',
  category: '', location: '', dateOccurred: new Date().toISOString().split('T')[0],
  injuredPersonName: '', injuredPersonRole: '', employmentType: '',
  injuryType: '', bodyPart: '', treatmentType: '', lostTime: false, daysLost: 0,
  witnesses: '', riddorReportable: false, regulatoryReference: '',
  reportedToAuthority: false, reportedToAuthorityDate: '', reportedBy: '',
  investigationRequired: false, investigationDueDate: '',
  immediateCause: '', rootCauses: '', contributingFactors: '',
  aiImmediateCause: '', aiUnderlyingCause: '', aiRootCause: '',
  aiContributingFactors: '', aiRecurrencePrevention: '',
};

// ─── Component ────────────────────────────────────────────────────

export default function IncidentRegisterClient() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState<IncidentForm>({ ...emptyForm });
  const [section, setSection] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const loadIncidents = useCallback(async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      const response = await api.get('/incidents', { params });
      setIncidents(response.data.data || []);
    } catch (error) {
      console.error('Failed to load incidents:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, severityFilter]);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  function openModal() {
    setForm({ ...emptyForm });
    setSection(0);
    setModalOpen(true);
  }

  function updateForm(field: keyof IncidentForm, value: any) {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-set RIDDOR and investigation for Critical/Major
      if (field === 'severity') {
        const isSevere = value === 'CRITICAL' || value === 'CATASTROPHIC' || value === 'MAJOR';
        updated.riddorReportable = isSevere;
        updated.investigationRequired = isSevere;
      }
      return updated;
    });
  }

  async function generateAiAnalysis() {
    if (form.description.length < 20) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/incidents/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentType: form.type,
          severity: form.severity,
          description: form.description,
          location: form.location,
          injuryType: form.injuryType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          aiImmediateCause: data.immediateCause || '',
          aiUnderlyingCause: data.underlyingCause || '',
          aiRootCause: data.rootCause || '',
          aiContributingFactors: data.contributingFactors || '',
          aiRecurrencePrevention: data.recurrencePrevention || '',
        }));
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.title || !form.description || !form.type) return;
    setSaving(true);
    try {
      await api.post('/incidents', {
        ...form,
        daysLost: form.daysLost || undefined,
        reportedToAuthorityDate: form.reportedToAuthorityDate || undefined,
        investigationDueDate: form.investigationDueDate || undefined,
        aiAnalysisGenerated: !!(form.aiImmediateCause || form.aiRootCause),
      });
      setModalOpen(false);
      loadIncidents();
    } catch (error) {
      console.error('Failed to create incident:', error);
    } finally {
      setSaving(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    const s = SEVERITIES.find(sv => sv.value === severity);
    return s?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const statusCounts = {
    total: incidents.length,
    OPEN: incidents.filter(i => i.status === 'OPEN').length,
    UNDER_INVESTIGATION: incidents.filter(i => i.status === 'UNDER_INVESTIGATION').length,
    CLOSED: incidents.filter(i => i.status === 'CLOSED').length,
  };

  const sections = ['Incident Details', 'Persons Involved', 'AI Root Cause Analysis', 'Regulatory & Investigation'];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Incident Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage workplace incidents</p>
          </div>
          <Button onClick={openModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Report Incident
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold">{statusCounts.total}</p><p className="text-sm text-gray-500 dark:text-gray-400">Total Incidents</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-red-600">{statusCounts.OPEN}</p><p className="text-sm text-gray-500 dark:text-gray-400">Open</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-yellow-600">{statusCounts.UNDER_INVESTIGATION}</p><p className="text-sm text-gray-500 dark:text-gray-400">Under Investigation</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-center"><p className="text-3xl font-bold text-green-600">{statusCounts.CLOSED}</p><p className="text-sm text-gray-500 dark:text-gray-400">Closed</p></div></CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder="Search incidents..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value="all">All Severities</option>
            {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Incidents Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 rounded" />)}</div>
            ) : incidents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map(inc => (
                    <TableRow key={inc.id} className={inc.severity === 'CRITICAL' || inc.severity === 'CATASTROPHIC' ? 'border-l-4 border-l-red-500' : ''}>
                      <TableCell className="font-mono text-xs">{inc.referenceNumber}</TableCell>
                      <TableCell className="text-sm">{new Date(inc.dateOccurred).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{inc.title}</TableCell>
                      <TableCell><Badge variant="outline">{inc.type.replace(/_/g, ' ')}</Badge></TableCell>
                      <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(inc.severity)}`}>{inc.severity}</span></TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">{inc.location || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={inc.status === 'OPEN' ? 'destructive' : inc.status === 'CLOSED' ? 'secondary' : 'default'}>
                          {inc.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileWarning className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No incidents found</p>
                <Button variant="outline" className="mt-4" onClick={openModal}><Plus className="h-4 w-4 mr-2" />Report First Incident</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Report Incident" size="lg">
            {/* Section Tabs */}
            <div className="flex gap-1 mb-6 border-b">
              {sections.map((s, i) => (
                <button key={i} onClick={() => setSection(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${section === i ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Section A: Incident Details */}
            {section === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="Brief incident title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type *</Label>
                    <Select value={form.type} onChange={e => updateForm('type', e.target.value)}>
                      {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Severity *</Label>
                    <Select value={form.severity} onChange={e => updateForm('severity', e.target.value)}>
                      {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date Occurred *</Label>
                    <Input type="date" value={form.dateOccurred} onChange={e => updateForm('dateOccurred', e.target.value)} />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={form.location} onChange={e => updateForm('location', e.target.value)} placeholder="Where did it happen?" />
                  </div>
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea value={form.description} onChange={e => updateForm('description', e.target.value)}
                    placeholder="Detailed description of the incident..." rows={4} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={form.category} onChange={e => updateForm('category', e.target.value)} placeholder="e.g., Slip/Trip/Fall" />
                </div>
              </div>
            )}

            {/* Section B: Persons Involved */}
            {section === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Injured Person Name</Label>
                    <Input value={form.injuredPersonName} onChange={e => updateForm('injuredPersonName', e.target.value)} />
                  </div>
                  <div>
                    <Label>Role/Job Title</Label>
                    <Input value={form.injuredPersonRole} onChange={e => updateForm('injuredPersonRole', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employment Type</Label>
                    <Select value={form.employmentType} onChange={e => updateForm('employmentType', e.target.value)}>
                      <option value="">Select...</option>
                      {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Injury Type</Label>
                    <Input value={form.injuryType} onChange={e => updateForm('injuryType', e.target.value)} placeholder="e.g., Laceration, Fracture" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Body Part Affected</Label>
                    <Input value={form.bodyPart} onChange={e => updateForm('bodyPart', e.target.value)} placeholder="e.g., Right hand, Lower back" />
                  </div>
                  <div>
                    <Label>Treatment Type</Label>
                    <Select value={form.treatmentType} onChange={e => updateForm('treatmentType', e.target.value)}>
                      <option value="">Select...</option>
                      <option value="NONE">None</option>
                      <option value="FIRST_AID">First Aid</option>
                      <option value="MEDICAL">Medical Treatment</option>
                      <option value="HOSPITAL">Hospital</option>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.lostTime} onChange={e => updateForm('lostTime', e.target.checked)} className="rounded" />
                    <span className="text-sm">Lost Time Incident</span>
                  </label>
                  {form.lostTime && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Days Lost:</Label>
                      <Input type="number" value={form.daysLost} onChange={e => updateForm('daysLost', parseInt(e.target.value) || 0)} className="w-20" />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Witnesses</Label>
                  <Textarea value={form.witnesses} onChange={e => updateForm('witnesses', e.target.value)} placeholder="Names and contact details of witnesses" rows={2} />
                </div>
              </div>
            )}

            {/* Section C: AI Root Cause Analysis */}
            {section === 2 && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> AI-Assisted Root Cause Analysis
                    </h3>
                    <Button size="sm" variant="outline" onClick={generateAiAnalysis} disabled={aiLoading || form.description.length < 20}>
                      {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analysing...</> : 'Analyse with AI'}
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600">Fill in incident details first, then click to generate AI analysis. All fields are editable.</p>
                  <AIDisclosure variant="inline" provider="claude" analysisType="Incident Analysis" confidence={0.85} />
                </div>
                <div>
                  <Label>Immediate Cause {form.aiImmediateCause && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Textarea value={form.aiImmediateCause} onChange={e => updateForm('aiImmediateCause', e.target.value)} rows={2} placeholder="Direct cause of the incident" />
                </div>
                <div>
                  <Label>Underlying Cause {form.aiUnderlyingCause && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Textarea value={form.aiUnderlyingCause} onChange={e => updateForm('aiUnderlyingCause', e.target.value)} rows={2} placeholder="Systemic or procedural cause" />
                </div>
                <div>
                  <Label>Root Cause {form.aiRootCause && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Textarea value={form.aiRootCause} onChange={e => updateForm('aiRootCause', e.target.value)} rows={2} placeholder="Fundamental root cause" />
                </div>
                <div>
                  <Label>Contributing Factors {form.aiContributingFactors && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Textarea value={form.aiContributingFactors} onChange={e => updateForm('aiContributingFactors', e.target.value)} rows={2} placeholder="Other contributing factors" />
                </div>
                <div>
                  <Label>Recurrence Prevention {form.aiRecurrencePrevention && <Badge variant="outline" className="ml-2 text-xs">AI Suggested</Badge>}</Label>
                  <Textarea value={form.aiRecurrencePrevention} onChange={e => updateForm('aiRecurrencePrevention', e.target.value)} rows={2} placeholder="Measures to prevent recurrence" />
                </div>
              </div>
            )}

            {/* Section D: Regulatory & Investigation */}
            {section === 3 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-amber-800 mb-2">RIDDOR / Regulatory Reporting</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={form.riddorReportable} onChange={e => updateForm('riddorReportable', e.target.checked)} className="rounded" />
                      <span className="text-sm">RIDDOR Reportable</span>
                      {(form.severity === 'CRITICAL' || form.severity === 'CATASTROPHIC' || form.severity === 'MAJOR') && (
                        <Badge variant="destructive" className="text-xs">Auto-set for {form.severity}</Badge>
                      )}
                    </label>
                    <div>
                      <Label>Regulatory Reference</Label>
                      <Input value={form.regulatoryReference} onChange={e => updateForm('regulatoryReference', e.target.value)} placeholder="e.g., RIDDOR 2013, Reg 7" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.reportedToAuthority} onChange={e => updateForm('reportedToAuthority', e.target.checked)} className="rounded" />
                        <span className="text-sm">Reported to Authority</span>
                      </label>
                      {form.reportedToAuthority && (
                        <div>
                          <Label>Date Reported</Label>
                          <Input type="date" value={form.reportedToAuthorityDate} onChange={e => updateForm('reportedToAuthorityDate', e.target.value)} />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Reported By</Label>
                      <Input value={form.reportedBy} onChange={e => updateForm('reportedBy', e.target.value)} placeholder="Name of person who reported" />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Investigation</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={form.investigationRequired} onChange={e => updateForm('investigationRequired', e.target.checked)} className="rounded" />
                      <span className="text-sm">Investigation Required</span>
                      {(form.severity === 'CRITICAL' || form.severity === 'CATASTROPHIC' || form.severity === 'MAJOR') && (
                        <Badge variant="default" className="text-xs">Auto-set for {form.severity}</Badge>
                      )}
                    </label>
                    {form.investigationRequired && (
                      <div>
                        <Label>Investigation Due Date</Label>
                        <Input type="date" value={form.investigationDueDate} onChange={e => updateForm('investigationDueDate', e.target.value)} />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-calculated based on severity if left blank</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <ModalFooter>
              <div className="flex justify-between w-full">
                <div className="flex gap-2">
                  {section > 0 && <Button variant="outline" onClick={() => setSection(s => s - 1)}>Previous</Button>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                  {section < 3 ? (
                    <Button onClick={() => setSection(s => s + 1)}>Next</Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={saving || !form.title || !form.description}>
                      {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Submit Incident'}
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
