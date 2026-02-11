'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
} from '@ims/ui';
import {
  Plus, RefreshCw, Loader2, Search, Sparkles, AlertTriangle, Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────

const CAPA_TYPES = [
  { value: 'CORRECTIVE', label: 'Corrective', color: 'bg-blue-100 text-blue-800' },
  { value: 'PREVENTIVE', label: 'Preventive', color: 'bg-purple-100 text-purple-800' },
  { value: 'IMPROVEMENT', label: 'Improvement', color: 'bg-green-100 text-green-800' },
] as const;

const SEVERITIES = [
  { value: 'MINOR', label: 'Minor', color: 'bg-green-100 text-green-800' },
  { value: 'MODERATE', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MAJOR', label: 'Major', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
] as const;

const TRIGGER_SOURCES = [
  { value: 'ENVIRONMENTAL_EVENT', label: 'Environmental Event' },
  { value: 'LEGAL_NON_CONFORMANCE', label: 'Legal Non-Conformance' },
  { value: 'INTERNAL_AUDIT', label: 'Internal Audit' },
  { value: 'EXTERNAL_AUDIT', label: 'External Audit' },
  { value: 'MANAGEMENT_REVIEW', label: 'Management Review' },
  { value: 'CUSTOMER_COMPLAINT', label: 'Customer Complaint' },
  { value: 'REGULATORY_INSPECTION', label: 'Regulatory Inspection' },
  { value: 'NEAR_MISS', label: 'Near Miss' },
  { value: 'SIGNIFICANT_ASPECT', label: 'Significant Aspect' },
  { value: 'OBJECTIVE_FAILURE', label: 'Objective Failure' },
  { value: 'OTHER', label: 'Other' },
] as const;

const RCA_METHODS = [
  { value: 'FIVE_WHY', label: '5-Why Analysis' },
  { value: 'FISHBONE', label: 'Fishbone (Ishikawa)' },
  { value: 'BOWTIE', label: 'Bowtie Analysis' },
  { value: 'FAULT_TREE', label: 'Fault Tree' },
  { value: 'TIMELINE', label: 'Timeline Analysis' },
  { value: 'BARRIER_ANALYSIS', label: 'Barrier Analysis' },
  { value: 'OTHER', label: 'Other' },
] as const;

const ROOT_CAUSE_CATEGORIES = [
  { value: 'HUMAN_ERROR', label: 'Human Error' },
  { value: 'PROCEDURE_FAILURE', label: 'Procedure Failure' },
  { value: 'EQUIPMENT_FAILURE', label: 'Equipment Failure' },
  { value: 'MANAGEMENT_SYSTEM_FAILURE', label: 'Management System Failure' },
  { value: 'ENVIRONMENTAL_CONDITION', label: 'Environmental Condition' },
  { value: 'DESIGN_FAILURE', label: 'Design Failure' },
  { value: 'TRAINING_GAP', label: 'Training Gap' },
  { value: 'COMMUNICATION_FAILURE', label: 'Communication Failure' },
  { value: 'SUPPLIER_FAILURE', label: 'Supplier Failure' },
  { value: 'REGULATORY_CHANGE', label: 'Regulatory Change' },
  { value: 'OTHER', label: 'Other' },
] as const;

const STATUSES = [
  { value: 'INITIATED', label: 'Initiated', color: 'bg-gray-100 text-gray-800' },
  { value: 'ROOT_CAUSE_ANALYSIS', label: 'Root Cause Analysis', color: 'bg-blue-100 text-blue-800' },
  { value: 'ACTIONS_DEFINED', label: 'Actions Defined', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'IMPLEMENTATION', label: 'Implementation', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'VERIFICATION', label: 'Verification', color: 'bg-purple-100 text-purple-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
] as const;

const PRIORITIES = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
] as const;

const STATUS_PIPELINE = ['INITIATED', 'ROOT_CAUSE_ANALYSIS', 'ACTIONS_DEFINED', 'IMPLEMENTATION', 'VERIFICATION', 'CLOSED'] as const;

const PIPELINE_LABELS: Record<string, string> = {
  INITIATED: 'Initiated',
  ROOT_CAUSE_ANALYSIS: 'RCA',
  ACTIONS_DEFINED: 'Actions',
  IMPLEMENTATION: 'Implementation',
  VERIFICATION: 'Verification',
  CLOSED: 'Closed',
};

// ─── Types ────────────────────────────────────────────────────────

interface CapaActionItem {
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: string;
}

interface Capa {
  id: string;
  referenceNumber: string;
  capaType: string;
  title: string;
  severity: string;
  triggerSource: string;
  sourceReference: string | null;
  description: string;
  dateInitiated: string;
  initiatedBy: string;
  iso14001Clause: string | null;
  immediateActionRequired: boolean;
  immediateActions: string | null;
  containmentVerifiedBy: string | null;
  containmentDate: string | null;
  rcaMethod: string | null;
  problemStatement: string | null;
  why1: string | null;
  why2: string | null;
  why3: string | null;
  why4: string | null;
  why5: string | null;
  fishbonePeople: string | null;
  fishboneProcess: string | null;
  fishbonePlant: string | null;
  fishbonePolicy: string | null;
  fishboneEnvironment: string | null;
  fishboneMeasurement: string | null;
  bowtieHazard: string | null;
  bowtieThreats: string | null;
  bowtiePreventive: string | null;
  bowtieConsequences: string | null;
  bowtieMitigating: string | null;
  rootCauseStatement: string | null;
  rootCauseCategory: string | null;
  effectivenessCriteria: string | null;
  effectivenessKPI: string | null;
  effectivenessTarget: string | null;
  effectivenessMethod: string | null;
  status: string;
  progressNotes: string | null;
  percentComplete: number;
  responsiblePerson: string;
  targetClosureDate: string;
  lessonsLearned: string | null;
  sharedLessonsLearned: boolean;
  capaActions: CapaActionItem[];
  createdAt: string;
}

interface CapaForm {
  capaType: string;
  title: string;
  severity: string;
  triggerSource: string;
  sourceReference: string;
  description: string;
  dateInitiated: string;
  initiatedBy: string;
  iso14001Clause: string;
  immediateActionRequired: boolean;
  immediateActions: string;
  containmentVerifiedBy: string;
  containmentDate: string;
  rcaMethod: string;
  problemStatement: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5: string;
  fishbonePeople: string;
  fishboneProcess: string;
  fishbonePlant: string;
  fishbonePolicy: string;
  fishboneEnvironment: string;
  fishboneMeasurement: string;
  bowtieHazard: string;
  bowtieThreats: string;
  bowtiePreventive: string;
  bowtieConsequences: string;
  bowtieMitigating: string;
  rootCauseStatement: string;
  rootCauseCategory: string;
  effectivenessCriteria: string;
  effectivenessKPI: string;
  effectivenessTarget: string;
  effectivenessMethod: string;
  status: string;
  progressNotes: string;
  percentComplete: number;
  responsiblePerson: string;
  targetClosureDate: string;
  lessonsLearned: string;
  sharedLessonsLearned: boolean;
  capaActions: CapaActionItem[];
}

const today = () => new Date().toISOString().split('T')[0];

const emptyForm: CapaForm = {
  capaType: 'CORRECTIVE',
  title: '',
  severity: 'MODERATE',
  triggerSource: 'ENVIRONMENTAL_EVENT',
  sourceReference: '',
  description: '',
  dateInitiated: today(),
  initiatedBy: '',
  iso14001Clause: '',
  immediateActionRequired: false,
  immediateActions: '',
  containmentVerifiedBy: '',
  containmentDate: '',
  rcaMethod: 'FIVE_WHY',
  problemStatement: '',
  why1: '',
  why2: '',
  why3: '',
  why4: '',
  why5: '',
  fishbonePeople: '',
  fishboneProcess: '',
  fishbonePlant: '',
  fishbonePolicy: '',
  fishboneEnvironment: '',
  fishboneMeasurement: '',
  bowtieHazard: '',
  bowtieThreats: '',
  bowtiePreventive: '',
  bowtieConsequences: '',
  bowtieMitigating: '',
  rootCauseStatement: '',
  rootCauseCategory: '',
  effectivenessCriteria: '',
  effectivenessKPI: '',
  effectivenessTarget: '',
  effectivenessMethod: '',
  status: 'INITIATED',
  progressNotes: '',
  percentComplete: 0,
  responsiblePerson: '',
  targetClosureDate: '',
  lessonsLearned: '',
  sharedLessonsLearned: false,
  capaActions: [],
};

// ─── Helpers ────────────────────────────────────────────────────

function getTypeColor(type: string) {
  return CAPA_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
}

function getSeverityColor(severity: string) {
  return SEVERITIES.find(s => s.value === severity)?.color || 'bg-gray-100 text-gray-800';
}

function getStatusColor(status: string) {
  return STATUSES.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
}

function getRcaLabel(method: string) {
  return RCA_METHODS.find(m => m.value === method)?.label || method;
}

function daysOpen(dateInitiated: string): number {
  const start = new Date(dateInitiated);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function isOverdue(targetClosureDate: string | null, status: string): boolean {
  if (!targetClosureDate || status === 'CLOSED' || status === 'CANCELLED') return false;
  return new Date(targetClosureDate) < new Date();
}

// ─── Component ────────────────────────────────────────────────────

export default function CAPAClient() {
  const [capas, setCapas] = useState<Capa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CapaForm>({ ...emptyForm });
  const [activeTab, setActiveTab] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<string | null>(null);
  const [aiCollapsed, setAiCollapsed] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadCapas = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.capaType = typeFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      const response = await api.get('/capa', { params });
      setCapas(response.data.data || []);
    } catch (error) {
      console.error('Failed to load CAPAs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter, severityFilter]);

  useEffect(() => { loadCapas(); }, [loadCapas]);

  // ── Form helpers ─────────────────────────────────────────────

  function openModal() {
    setForm({ ...emptyForm, dateInitiated: today(), capaActions: [] });
    setActiveTab(0);
    setAiGenerated(null);
    setAiCollapsed(true);
    setShowModal(true);
  }

  function updateForm<K extends keyof CapaForm>(field: K, value: CapaForm[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function addAction() {
    setForm(prev => ({
      ...prev,
      capaActions: [...prev.capaActions, { description: '', assignedTo: '', dueDate: '', priority: 'MEDIUM' }],
    }));
  }

  function updateAction(index: number, field: keyof CapaActionItem, value: string) {
    setForm(prev => ({
      ...prev,
      capaActions: prev.capaActions.map((a, i) => i === index ? { ...a, [field]: value } : a),
    }));
  }

  function removeAction(index: number) {
    setForm(prev => ({
      ...prev,
      capaActions: prev.capaActions.filter((_, i) => i !== index),
    }));
  }

  // ── AI functions ─────────────────────────────────────────────

  async function generateAiAnalysis() {
    if (form.description.length < 20) return;
    setAiLoading(true);
    try {
      const res = await api.post('/capa/ai-analysis', {
        capaType: form.capaType,
        title: form.title,
        severity: form.severity,
        triggerSource: form.triggerSource,
        description: form.description,
        problemStatement: form.problemStatement,
        rcaMethod: form.rcaMethod,
      });
      const data = res.data.data;
      if (data) {
        setAiGenerated(JSON.stringify(data, null, 2));
        setAiCollapsed(false);
        if (data.rootCauseStatement) updateForm('rootCauseStatement', data.rootCauseStatement);
        if (data.effectivenessCriteria) updateForm('effectivenessCriteria', data.effectivenessCriteria);
        if (data.lessonsLearned) updateForm('lessonsLearned', data.lessonsLearned);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  async function generateAiFiveWhy() {
    if (form.description.length < 10) return;
    setAiLoading(true);
    try {
      const res = await api.post('/capa/ai-five-why', {
        title: form.title,
        description: form.description,
        problemStatement: form.problemStatement || form.description,
      });
      const data = res.data.data;
      if (data) {
        setAiGenerated(JSON.stringify(data, null, 2));
        setAiCollapsed(false);
        if (data.why1) updateForm('why1', data.why1);
        if (data.why2) updateForm('why2', data.why2);
        if (data.why3) updateForm('why3', data.why3);
        if (data.why4) updateForm('why4', data.why4);
        if (data.why5) updateForm('why5', data.why5);
        if (data.rootCauseStatement) updateForm('rootCauseStatement', data.rootCauseStatement);
      }
    } catch (error) {
      console.error('AI 5-Why generation failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  async function generateAiFishbone() {
    if (form.description.length < 10) return;
    setAiLoading(true);
    try {
      const res = await api.post('/capa/ai-fishbone', {
        title: form.title,
        description: form.description,
        problemStatement: form.problemStatement || form.description,
      });
      const data = res.data.data;
      if (data) {
        setAiGenerated(JSON.stringify(data, null, 2));
        setAiCollapsed(false);
        if (data.fishbonePeople) updateForm('fishbonePeople', data.fishbonePeople);
        if (data.fishboneProcess) updateForm('fishboneProcess', data.fishboneProcess);
        if (data.fishbonePlant) updateForm('fishbonePlant', data.fishbonePlant);
        if (data.fishbonePolicy) updateForm('fishbonePolicy', data.fishbonePolicy);
        if (data.fishboneEnvironment) updateForm('fishboneEnvironment', data.fishboneEnvironment);
        if (data.fishboneMeasurement) updateForm('fishboneMeasurement', data.fishboneMeasurement);
        if (data.rootCauseStatement) updateForm('rootCauseStatement', data.rootCauseStatement);
      }
    } catch (error) {
      console.error('AI Fishbone generation failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  // ── Submit ───────────────────────────────────────────────────

  async function handleSubmit() {
    if (!form.title || !form.description || !form.initiatedBy || !form.responsiblePerson || !form.targetClosureDate) return;
    setSubmitting(true);
    try {
      const validActions = form.capaActions
        .filter(a => a.description)
        .map(a => ({
          description: a.description,
          assignedTo: a.assignedTo || 'Unassigned',
          dueDate: a.dueDate ? new Date(a.dueDate).toISOString() : new Date(form.targetClosureDate).toISOString(),
          priority: a.priority || 'MEDIUM',
        }));

      await api.post('/capa', {
        capaType: form.capaType,
        title: form.title,
        severity: form.severity,
        triggerSource: form.triggerSource,
        sourceReference: form.sourceReference || undefined,
        description: form.description,
        dateInitiated: new Date(form.dateInitiated).toISOString(),
        initiatedBy: form.initiatedBy,
        iso14001Clause: form.iso14001Clause || undefined,
        immediateActionRequired: form.immediateActionRequired,
        immediateActions: form.immediateActions || undefined,
        containmentVerifiedBy: form.containmentVerifiedBy || undefined,
        containmentDate: form.containmentDate ? new Date(form.containmentDate).toISOString() : undefined,
        rcaMethod: form.rcaMethod || undefined,
        problemStatement: form.problemStatement || undefined,
        why1: form.why1 || undefined,
        why2: form.why2 || undefined,
        why3: form.why3 || undefined,
        why4: form.why4 || undefined,
        why5: form.why5 || undefined,
        fishbonePeople: form.fishbonePeople || undefined,
        fishboneProcess: form.fishboneProcess || undefined,
        fishbonePlant: form.fishbonePlant || undefined,
        fishbonePolicy: form.fishbonePolicy || undefined,
        fishboneEnvironment: form.fishboneEnvironment || undefined,
        fishboneMeasurement: form.fishboneMeasurement || undefined,
        bowtieHazard: form.bowtieHazard || undefined,
        bowtieThreats: form.bowtieThreats || undefined,
        bowtiePreventive: form.bowtiePreventive || undefined,
        bowtieConsequences: form.bowtieConsequences || undefined,
        bowtieMitigating: form.bowtieMitigating || undefined,
        rootCauseStatement: form.rootCauseStatement || undefined,
        rootCauseCategory: form.rootCauseCategory || undefined,
        effectivenessCriteria: form.effectivenessCriteria || undefined,
        effectivenessKPI: form.effectivenessKPI || undefined,
        effectivenessTarget: form.effectivenessTarget || undefined,
        effectivenessMethod: form.effectivenessMethod || undefined,
        status: form.status,
        progressNotes: form.progressNotes || undefined,
        percentComplete: form.percentComplete,
        responsiblePerson: form.responsiblePerson,
        targetClosureDate: new Date(form.targetClosureDate).toISOString(),
        lessonsLearned: form.lessonsLearned || undefined,
        sharedLessonsLearned: form.sharedLessonsLearned,
        capaActions: validActions.length > 0 ? validActions : undefined,
      });
      setShowModal(false);
      loadCapas();
    } catch (error) {
      console.error('Failed to create CAPA:', error);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Status pipeline counts ───────────────────────────────────

  const pipelineCounts: Record<string, number> = {};
  STATUS_PIPELINE.forEach(s => {
    pipelineCounts[s] = capas.filter(c => c.status === s).length;
  });

  // ── Tab definitions ──────────────────────────────────────────

  const tabs = [
    'Initiation & Containment',
    'Root Cause Analysis',
    'Actions',
    'Effectiveness & Tracking',
    'AI Analysis & Closure',
  ];

  // ── Filtered capas ──────────────────────────────────────────

  const filtered = capas.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !c.title.toLowerCase().includes(q) &&
        !c.referenceNumber.toLowerCase().includes(q) &&
        !c.description.toLowerCase().includes(q) &&
        !c.responsiblePerson.toLowerCase().includes(q)
      ) return false;
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (typeFilter !== 'all' && c.capaType !== typeFilter) return false;
    if (severityFilter !== 'all' && c.severity !== severityFilter) return false;
    return true;
  });

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CAPA Management</h1>
            <p className="text-gray-500 mt-1">ISO 14001 Clause 10.2 -- Corrective Action & Preventive Action</p>
          </div>
          <Button onClick={openModal} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" />
            Create CAPA
          </Button>
        </div>

        {/* Status Pipeline */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {STATUS_PIPELINE.map((step, idx) => {
                const count = pipelineCounts[step] || 0;
                const isActive = count > 0;
                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          isActive
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {count}
                      </div>
                      <span className="text-xs mt-1 text-gray-600 font-medium">{PIPELINE_LABELS[step]}</span>
                    </div>
                    {idx < STATUS_PIPELINE.length - 1 && (
                      <div className="w-12 h-0.5 bg-gray-300 mx-1 mt-[-12px]" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filter Bar */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search CAPAs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            {CAPA_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Severities</option>
            {SEVERITIES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* CAPA List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-500">Loading CAPAs...</span>
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No CAPA records found</p>
                <p className="text-gray-400 text-sm mb-6">
                  Click Create CAPA to initiate your first corrective or preventive action
                </p>
                <Button onClick={openModal} variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Create CAPA
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map(capa => {
              const overdue = isOverdue(capa.targetClosureDate, capa.status);
              const days = daysOpen(capa.dateInitiated);
              return (
                <Card key={capa.id} className={`hover:shadow-md transition-shadow ${overdue ? 'border-red-300 bg-red-50/30' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-gray-400">{capa.referenceNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(capa.capaType)}`}>
                            {capa.capaType}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(capa.severity)}`}>
                            {capa.severity}
                          </span>
                          {capa.rcaMethod && (
                            <Badge variant="outline" className="text-xs">
                              {getRcaLabel(capa.rcaMethod)}
                            </Badge>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(capa.status)}`}>
                            {capa.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{capa.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{capa.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span>Responsible: <strong className="text-gray-600">{capa.responsiblePerson}</strong></span>
                          <span>{days} day{days !== 1 ? 's' : ''} open</span>
                          {capa.targetClosureDate && (
                            <span className={overdue ? 'text-red-600 font-medium' : ''}>
                              Target: {new Date(capa.targetClosureDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        {overdue && (
                          <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Overdue
                          </div>
                        )}
                        {capa.percentComplete > 0 && (
                          <div className="w-24">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{capa.percentComplete}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full">
                              <div
                                className="h-1.5 bg-green-500 rounded-full transition-all"
                                style={{ width: `${capa.percentComplete}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ──── Create CAPA Modal ──── */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create CAPA" size="full">
          <div className="max-h-[70vh] overflow-y-auto">
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 border-b sticky top-0 bg-white z-10 pt-1">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === i
                      ? 'border-green-500 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs mr-2">
                    {i + 1}
                  </span>
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Tab 1: Initiation & Containment ── */}
            {activeTab === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>CAPA Type *</Label>
                    <Select value={form.capaType} onChange={e => updateForm('capaType', e.target.value)}>
                      {CAPA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Severity *</Label>
                    <Select value={form.severity} onChange={e => updateForm('severity', e.target.value)}>
                      {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Trigger Source</Label>
                    <Select value={form.triggerSource} onChange={e => updateForm('triggerSource', e.target.value)}>
                      {TRIGGER_SOURCES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={e => updateForm('title', e.target.value)}
                    placeholder="Brief description of the non-conformance or improvement"
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={form.description}
                    onChange={e => updateForm('description', e.target.value)}
                    rows={3}
                    placeholder="Detailed description of the issue, including context, impact, and observations"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Source Reference</Label>
                    <Input
                      value={form.sourceReference}
                      onChange={e => updateForm('sourceReference', e.target.value)}
                      placeholder="e.g., EVT-2601-0001, Audit ref"
                    />
                  </div>
                  <div>
                    <Label>ISO 14001 Clause</Label>
                    <Input
                      value={form.iso14001Clause}
                      onChange={e => updateForm('iso14001Clause', e.target.value)}
                      placeholder="e.g., 6.1.2, 8.1, 10.2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date Initiated</Label>
                    <Input
                      type="date"
                      value={form.dateInitiated}
                      onChange={e => updateForm('dateInitiated', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Initiated By *</Label>
                    <Input
                      value={form.initiatedBy}
                      onChange={e => updateForm('initiatedBy', e.target.value)}
                      placeholder="Name of person raising the CAPA"
                    />
                  </div>
                </div>

                {/* Immediate Action */}
                <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="immediateActionRequired"
                      checked={form.immediateActionRequired}
                      onChange={e => updateForm('immediateActionRequired', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="immediateActionRequired" className="cursor-pointer">
                      Immediate Action Required
                    </Label>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  {form.immediateActionRequired && (
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label>Immediate / Containment Actions</Label>
                        <Textarea
                          value={form.immediateActions}
                          onChange={e => updateForm('immediateActions', e.target.value)}
                          rows={2}
                          placeholder="Describe immediate containment actions taken"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Containment Verified By</Label>
                          <Input
                            value={form.containmentVerifiedBy}
                            onChange={e => updateForm('containmentVerifiedBy', e.target.value)}
                            placeholder="Verifier name"
                          />
                        </div>
                        <div>
                          <Label>Containment Date</Label>
                          <Input
                            type="date"
                            value={form.containmentDate}
                            onChange={e => updateForm('containmentDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab 2: Root Cause Analysis ── */}
            {activeTab === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>RCA Method</Label>
                  <Select value={form.rcaMethod} onChange={e => updateForm('rcaMethod', e.target.value)}>
                    {RCA_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </Select>
                </div>

                {/* ── 5-Why Analysis ── */}
                {form.rcaMethod === 'FIVE_WHY' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">5-Why Analysis</h3>
                    <div className="mb-4">
                      <Label>Problem Statement</Label>
                      <Textarea
                        value={form.problemStatement || form.description}
                        onChange={e => updateForm('problemStatement', e.target.value)}
                        rows={2}
                        placeholder="State the problem clearly"
                      />
                    </div>
                    <div className="space-y-3">
                      {[
                        { key: 'why1' as const, num: 1, required: true },
                        { key: 'why2' as const, num: 2, required: true },
                        { key: 'why3' as const, num: 3, required: false },
                        { key: 'why4' as const, num: 4, required: false },
                        { key: 'why5' as const, num: 5, required: false },
                      ].map(({ key, num, required }) => (
                        <div key={key} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                              {num}
                            </div>
                            {num < 5 && <div className="w-0.5 h-6 bg-green-300 mt-1" />}
                          </div>
                          <div className="flex-1">
                            <Label>Why {num}? {required && '*'}</Label>
                            <Textarea
                              value={form[key]}
                              onChange={e => updateForm(key, e.target.value)}
                              rows={1}
                              placeholder={`Why did this ${num === 1 ? 'happen' : 'occur'}?`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Fishbone (Ishikawa) ── */}
                {form.rcaMethod === 'FISHBONE' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Fishbone (Ishikawa) Diagram Categories</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>People</Label>
                        <Textarea
                          value={form.fishbonePeople}
                          onChange={e => updateForm('fishbonePeople', e.target.value)}
                          rows={3}
                          placeholder="Human factors, training, competence, fatigue..."
                        />
                      </div>
                      <div>
                        <Label>Process</Label>
                        <Textarea
                          value={form.fishboneProcess}
                          onChange={e => updateForm('fishboneProcess', e.target.value)}
                          rows={3}
                          placeholder="Process steps, procedures, work instructions..."
                        />
                      </div>
                      <div>
                        <Label>Plant / Equipment</Label>
                        <Textarea
                          value={form.fishbonePlant}
                          onChange={e => updateForm('fishbonePlant', e.target.value)}
                          rows={3}
                          placeholder="Equipment condition, maintenance, calibration..."
                        />
                      </div>
                      <div>
                        <Label>Policy</Label>
                        <Textarea
                          value={form.fishbonePolicy}
                          onChange={e => updateForm('fishbonePolicy', e.target.value)}
                          rows={3}
                          placeholder="Company policies, management decisions, standards..."
                        />
                      </div>
                      <div>
                        <Label>Environment</Label>
                        <Textarea
                          value={form.fishboneEnvironment}
                          onChange={e => updateForm('fishboneEnvironment', e.target.value)}
                          rows={3}
                          placeholder="Environmental conditions, weather, site layout..."
                        />
                      </div>
                      <div>
                        <Label>Measurement</Label>
                        <Textarea
                          value={form.fishboneMeasurement}
                          onChange={e => updateForm('fishboneMeasurement', e.target.value)}
                          rows={3}
                          placeholder="Monitoring, data accuracy, measurement frequency..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Bowtie ── */}
                {form.rcaMethod === 'BOWTIE' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Bowtie Analysis</h3>
                    <div className="mb-4">
                      <Label>Hazard / Top Event</Label>
                      <Input
                        value={form.bowtieHazard}
                        onChange={e => updateForm('bowtieHazard', e.target.value)}
                        placeholder="Central hazard or top event"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left side: Threats + Preventive */}
                      <div className="space-y-3">
                        <div className="text-center text-xs font-semibold text-red-600 uppercase tracking-wider">Threats (Left)</div>
                        <div>
                          <Label>Threats</Label>
                          <Textarea
                            value={form.bowtieThreats}
                            onChange={e => updateForm('bowtieThreats', e.target.value)}
                            rows={3}
                            placeholder="Potential threats that could trigger the hazard..."
                          />
                        </div>
                        <div>
                          <Label>Preventive Barriers</Label>
                          <Textarea
                            value={form.bowtiePreventive}
                            onChange={e => updateForm('bowtiePreventive', e.target.value)}
                            rows={3}
                            placeholder="Barriers to prevent the hazard from occurring..."
                          />
                        </div>
                      </div>
                      {/* Right side: Consequences + Mitigating */}
                      <div className="space-y-3">
                        <div className="text-center text-xs font-semibold text-orange-600 uppercase tracking-wider">Consequences (Right)</div>
                        <div>
                          <Label>Consequences</Label>
                          <Textarea
                            value={form.bowtieConsequences}
                            onChange={e => updateForm('bowtieConsequences', e.target.value)}
                            rows={3}
                            placeholder="Potential consequences if the hazard occurs..."
                          />
                        </div>
                        <div>
                          <Label>Mitigating Barriers</Label>
                          <Textarea
                            value={form.bowtieMitigating}
                            onChange={e => updateForm('bowtieMitigating', e.target.value)}
                            rows={3}
                            placeholder="Barriers to mitigate consequences..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Always shown: Root Cause Statement + Category */}
                <div className="border-t pt-4 mt-4">
                  <div>
                    <Label>Root Cause Statement *</Label>
                    <Textarea
                      value={form.rootCauseStatement}
                      onChange={e => updateForm('rootCauseStatement', e.target.value)}
                      rows={2}
                      placeholder="Summarise the identified root cause"
                    />
                  </div>
                  <div className="mt-3">
                    <Label>Root Cause Category</Label>
                    <Select value={form.rootCauseCategory} onChange={e => updateForm('rootCauseCategory', e.target.value)}>
                      <option value="">-- Select Category --</option>
                      {ROOT_CAUSE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 3: Corrective/Preventive Actions ── */}
            {activeTab === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Corrective / Preventive Actions</h3>
                    <p className="text-xs text-gray-500">Define actions to address the root cause and prevent recurrence</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addAction} className="border-green-300 text-green-700 hover:bg-green-50">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Action
                  </Button>
                </div>

                {form.capaActions.length > 0 ? (
                  <div className="space-y-3">
                    {form.capaActions.map((action, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-500">Action {i + 1}</span>
                          <button
                            onClick={() => removeAction(i)}
                            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label>Description *</Label>
                            <Textarea
                              value={action.description}
                              onChange={e => updateAction(i, 'description', e.target.value)}
                              rows={2}
                              placeholder="What needs to be done?"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label>Assigned To</Label>
                              <Input
                                value={action.assignedTo}
                                onChange={e => updateAction(i, 'assignedTo', e.target.value)}
                                placeholder="Person responsible"
                              />
                            </div>
                            <div>
                              <Label>Due Date</Label>
                              <Input
                                type="date"
                                value={action.dueDate}
                                onChange={e => updateAction(i, 'dueDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <Select
                                value={action.priority}
                                onChange={e => updateAction(i, 'priority', e.target.value)}
                              >
                                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-400">No actions defined yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Add actions manually or use AI Analysis to generate suggestions.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab 4: Effectiveness & Tracking ── */}
            {activeTab === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Effectiveness Criteria</Label>
                    <Textarea
                      value={form.effectivenessCriteria}
                      onChange={e => updateForm('effectivenessCriteria', e.target.value)}
                      rows={2}
                      placeholder="How will you measure if the CAPA was effective?"
                    />
                  </div>
                  <div>
                    <Label>Effectiveness KPI</Label>
                    <Input
                      value={form.effectivenessKPI}
                      onChange={e => updateForm('effectivenessKPI', e.target.value)}
                      placeholder="e.g., Zero repeat spills within 6 months"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Effectiveness Target</Label>
                    <Input
                      value={form.effectivenessTarget}
                      onChange={e => updateForm('effectivenessTarget', e.target.value)}
                      placeholder="Target value or outcome"
                    />
                  </div>
                  <div>
                    <Label>Verification Method</Label>
                    <Input
                      value={form.effectivenessMethod}
                      onChange={e => updateForm('effectivenessMethod', e.target.value)}
                      placeholder="e.g., Audit, monitoring data review"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Status & Tracking</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={form.status} onChange={e => updateForm('status', e.target.value)}>
                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </Select>
                    </div>
                    <div>
                      <Label>Percent Complete: {form.percentComplete}%</Label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={form.percentComplete}
                        onChange={e => updateForm('percentComplete', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Progress Notes</Label>
                  <Textarea
                    value={form.progressNotes}
                    onChange={e => updateForm('progressNotes', e.target.value)}
                    rows={2}
                    placeholder="Notes on CAPA progress and updates"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Responsible Person *</Label>
                    <Input
                      value={form.responsiblePerson}
                      onChange={e => updateForm('responsiblePerson', e.target.value)}
                      placeholder="Person responsible for closing this CAPA"
                    />
                  </div>
                  <div>
                    <Label>Target Closure Date *</Label>
                    <Input
                      type="date"
                      value={form.targetClosureDate}
                      onChange={e => updateForm('targetClosureDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab 5: AI Analysis & Closure ── */}
            {activeTab === 4 && (
              <div className="space-y-4">
                {/* AI Analysis Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-green-800">AI-Powered Analysis</h3>
                  </div>
                  <p className="text-xs text-green-600 mb-4">
                    Use AI to generate root cause analysis, suggest actions, and validate your CAPA approach.
                    Ensure description is at least 20 characters for full analysis.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={generateAiAnalysis}
                      disabled={aiLoading || form.description.length < 20}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Generate AI CAPA Analysis
                    </Button>
                    {form.rcaMethod === 'FIVE_WHY' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={generateAiFiveWhy}
                        disabled={aiLoading || form.description.length < 10}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Generate AI 5-Why
                      </Button>
                    )}
                    {form.rcaMethod === 'FISHBONE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={generateAiFishbone}
                        disabled={aiLoading || form.description.length < 10}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Generate AI Fishbone
                      </Button>
                    )}
                  </div>

                  {/* AI Results */}
                  {aiGenerated && (
                    <div className="mt-4">
                      <button
                        onClick={() => setAiCollapsed(!aiCollapsed)}
                        className="text-xs font-medium text-green-700 hover:text-green-900 flex items-center gap-1"
                      >
                        {aiCollapsed ? 'Show' : 'Hide'} AI Results
                        <svg
                          className={`h-3 w-3 transition-transform ${aiCollapsed ? '' : 'rotate-180'}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {!aiCollapsed && (
                        <pre className="mt-2 bg-white border border-green-200 rounded p-3 text-xs text-gray-700 overflow-auto max-h-48">
                          {aiGenerated}
                        </pre>
                      )}
                    </div>
                  )}
                </div>

                {/* Closure Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Closure & Lessons Learned</h3>
                  <div>
                    <Label>Lessons Learned</Label>
                    <Textarea
                      value={form.lessonsLearned}
                      onChange={e => updateForm('lessonsLearned', e.target.value)}
                      rows={3}
                      placeholder="What lessons can be taken from this CAPA? What can be improved systemically?"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      id="sharedLessonsLearned"
                      checked={form.sharedLessonsLearned}
                      onChange={e => updateForm('sharedLessonsLearned', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="sharedLessonsLearned" className="cursor-pointer">
                      Share lessons learned across the organisation
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer: Tab navigation + Submit */}
          <ModalFooter>
            <div className="flex justify-between w-full">
              <div>
                {activeTab > 0 && (
                  <Button variant="outline" onClick={() => setActiveTab(activeTab - 1)}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                {activeTab < tabs.length - 1 ? (
                  <Button onClick={() => setActiveTab(activeTab + 1)} className="bg-green-600 hover:bg-green-700">
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !form.title || !form.description || !form.initiatedBy || !form.responsiblePerson || !form.targetClosureDate}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</>
                    ) : (
                      'Create CAPA'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
