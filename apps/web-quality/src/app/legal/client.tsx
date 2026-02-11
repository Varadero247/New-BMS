'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea } from '@ims/ui';
import { Plus, Scale, Search, Shield, AlertTriangle, CheckCircle, Clock, Brain, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LegalRequirement {
  id: string;
  referenceNumber?: string;
  title: string;
  description: string;
  obligationType: string;
  issuingBody: string;
  referenceDoc: string;
  requirements: string;
  applicableScope: string;
  customerName: string;
  contractNumber: string;
  productServiceScope: string;
  certificationBody: string;
  complianceStatus: string;
  complianceNotes: string;
  gapAnalysis: string;
  lastAssessmentDate: string;
  nextAssessmentDate: string;
  responsiblePerson: string;
  reviewFrequency: string;
  effectiveDate: string;
  expiryDate: string;
  status: string;
  trackedInHs: boolean;
  trackedInEnv: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AiAnalysis {
  loading: boolean;
  result: string | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OBLIGATION_TYPES = [
  'PRODUCT_STANDARD',
  'CUSTOMER_CONTRACT',
  'REGULATORY',
  'INDUSTRY_CODE',
  'CERTIFICATION_REQUIREMENT',
  'VOLUNTARY_COMMITMENT',
] as const;

const COMPLIANCE_STATUSES = [
  'COMPLIANT',
  'PARTIALLY_COMPLIANT',
  'NON_COMPLIANT',
  'NOT_ASSESSED',
] as const;

const RECORD_STATUSES = [
  'ACTIVE',
  'UNDER_REVIEW',
  'EXPIRED',
  'WITHDRAWN',
  'DRAFT',
] as const;

const REVIEW_FREQUENCIES = [
  'MONTHLY',
  'QUARTERLY',
  'SEMI_ANNUALLY',
  'ANNUALLY',
  'BIANNUALLY',
  'AD_HOC',
] as const;

const complianceColor = (status: string): string => {
  switch (status) {
    case 'COMPLIANT': return 'bg-green-100 text-green-800';
    case 'PARTIALLY_COMPLIANT': return 'bg-amber-100 text-amber-800';
    case 'NON_COMPLIANT': return 'bg-red-100 text-red-800';
    case 'NOT_ASSESSED': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const complianceBadgeVariant = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' => {
  switch (status) {
    case 'COMPLIANT': return 'success';
    case 'PARTIALLY_COMPLIANT': return 'warning';
    case 'NON_COMPLIANT': return 'destructive';
    default: return 'secondary';
  }
};

const obligationBadgeVariant = (type: string): 'info' | 'warning' | 'destructive' | 'secondary' | 'default' | 'outline' => {
  switch (type) {
    case 'REGULATORY': return 'destructive';
    case 'CUSTOMER_CONTRACT': return 'info';
    case 'PRODUCT_STANDARD': return 'warning';
    case 'CERTIFICATION_REQUIREMENT': return 'default';
    case 'INDUSTRY_CODE': return 'secondary';
    case 'VOLUNTARY_COMMITMENT': return 'outline';
    default: return 'outline';
  }
};

const statusBadgeVariant = (status: string): 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'UNDER_REVIEW': return 'warning';
    case 'EXPIRED': return 'destructive';
    case 'WITHDRAWN': return 'secondary';
    case 'DRAFT': return 'outline';
    default: return 'outline';
  }
};

const emptyForm = {
  title: '',
  description: '',
  obligationType: 'REGULATORY' as string,
  issuingBody: '',
  referenceDoc: '',
  requirements: '',
  applicableScope: '',
  customerName: '',
  contractNumber: '',
  productServiceScope: '',
  certificationBody: '',
  complianceStatus: 'NOT_ASSESSED' as string,
  complianceNotes: '',
  gapAnalysis: '',
  lastAssessmentDate: '',
  nextAssessmentDate: '',
  responsiblePerson: '',
  reviewFrequency: 'ANNUALLY' as string,
  effectiveDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  status: 'ACTIVE' as string,
  trackedInHs: false,
  trackedInEnv: false,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LegalClient() {
  // Data state
  const [requirements, setRequirements] = useState<LegalRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [obligationFilter, setObligationFilter] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeSection, setActiveSection] = useState<string>('requirement');

  // Detail modal
  const [selectedReq, setSelectedReq] = useState<LegalRequirement | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis>({ loading: false, result: null, error: null });

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------

  const loadRequirements = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/legal');
      setRequirements(response.data.data || []);
    } catch (err) {
      console.error('Failed to load legal requirements:', err);
      setError('Failed to load legal requirements. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/legal', {
        ...form,
        lastAssessmentDate: form.lastAssessmentDate || undefined,
        nextAssessmentDate: form.nextAssessmentDate || undefined,
        effectiveDate: form.effectiveDate || undefined,
        expiryDate: form.expiryDate || undefined,
      });
      setShowModal(false);
      setForm(emptyForm);
      setActiveSection('requirement');
      loadRequirements();
    } catch (err) {
      console.error('Failed to create legal requirement:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateModal() {
    setForm(emptyForm);
    setActiveSection('requirement');
    setShowModal(true);
  }

  function openDetail(req: LegalRequirement) {
    setSelectedReq(req);
    setAiAnalysis({ loading: false, result: null, error: null });
    setShowDetail(true);
  }

  async function runAiAnalysis(req: LegalRequirement) {
    setAiAnalysis({ loading: true, result: null, error: null });
    try {
      const response = await api.post('/legal/ai-analysis', {
        requirementId: req.id,
        title: req.title,
        obligationType: req.obligationType,
        complianceStatus: req.complianceStatus,
        requirements: req.requirements,
        gapAnalysis: req.gapAnalysis,
      });
      setAiAnalysis({ loading: false, result: response.data.data?.analysis || 'No analysis available.', error: null });
    } catch (err) {
      console.error('AI analysis failed:', err);
      setAiAnalysis({ loading: false, result: null, error: 'AI analysis failed. Please try again.' });
    }
  }

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------

  const filtered = requirements
    .filter(r => obligationFilter === 'all' || r.obligationType === obligationFilter)
    .filter(r => complianceFilter === 'all' || r.complianceStatus === complianceFilter)
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .filter(r =>
      !searchQuery ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.issuingBody?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceDoc?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // -------------------------------------------------------------------------
  // Summary Counts
  // -------------------------------------------------------------------------

  const counts = {
    total: requirements.length,
    compliant: requirements.filter(r => r.complianceStatus === 'COMPLIANT').length,
    nonCompliant: requirements.filter(r => r.complianceStatus === 'NON_COMPLIANT').length,
    dueForReview: requirements.filter(r => {
      if (!r.nextAssessmentDate) return false;
      const daysUntil = Math.ceil((new Date(r.nextAssessmentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30;
    }).length,
  };

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  }

  function isDueForReview(dateStr: string | undefined | null): boolean {
    if (!dateStr) return false;
    const daysUntil = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30;
  }

  function isOverdue(dateStr: string | undefined | null): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  // -------------------------------------------------------------------------
  // Section navigation for create modal
  // -------------------------------------------------------------------------

  const sections = [
    { id: 'requirement', label: 'Requirement', icon: Scale },
    { id: 'quality', label: 'Quality Specifics', icon: Shield },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle },
    { id: 'monitoring', label: 'Monitoring', icon: Clock },
    { id: 'ims', label: 'IMS Links', icon: ExternalLink },
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Legal Register</h1>
            <p className="text-gray-500 mt-1">Manage quality obligations, standards, and compliance requirements</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadRequirements} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Requirement
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Requirements</p>
                  <p className="text-3xl font-bold">{counts.total}</p>
                </div>
                <Scale className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Compliant</p>
                  <p className="text-3xl font-bold text-green-600">{counts.compliant}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Non-Compliant</p>
                  <p className="text-3xl font-bold text-red-600">{counts.nonCompliant}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Due for Review</p>
                  <p className="text-3xl font-bold text-amber-600">{counts.dueForReview}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={loadRequirements}>Retry</Button>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs text-gray-500 mb-1 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, reference, body..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="min-w-[180px]">
                <Label className="text-xs text-gray-500 mb-1 block">Obligation Type</Label>
                <Select value={obligationFilter} onChange={(e) => setObligationFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  {OBLIGATION_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[180px]">
                <Label className="text-xs text-gray-500 mb-1 block">Compliance Status</Label>
                <Select value={complianceFilter} onChange={(e) => setComplianceFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {COMPLIANCE_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[150px]">
                <Label className="text-xs text-gray-500 mb-1 block">Record Status</Label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  {RECORD_STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-500" />
                Legal Requirements ({filtered.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-28 bg-gray-200 rounded" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((req) => {
                  const dueForReview = isDueForReview(req.nextAssessmentDate);
                  const overdue = isOverdue(req.nextAssessmentDate);
                  return (
                    <div
                      key={req.id}
                      onClick={() => openDetail(req)}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        overdue ? 'border-red-300 bg-red-50 hover:border-red-400' :
                        dueForReview ? 'border-amber-300 bg-amber-50 hover:border-amber-400' :
                        'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {req.referenceNumber && (
                              <span className="text-xs text-gray-500 font-mono">{req.referenceNumber}</span>
                            )}
                            <Badge className={complianceColor(req.complianceStatus)}>
                              {req.complianceStatus?.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant={obligationBadgeVariant(req.obligationType)}>
                              {req.obligationType?.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant={statusBadgeVariant(req.status)}>
                              {req.status?.replace(/_/g, ' ')}
                            </Badge>
                            {overdue && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                OVERDUE
                              </Badge>
                            )}
                            {dueForReview && !overdue && (
                              <Badge variant="warning" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                DUE SOON
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900">{req.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{req.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                            {req.issuingBody && <span>Issuing Body: {req.issuingBody}</span>}
                            {req.referenceDoc && <span>Ref: {req.referenceDoc}</span>}
                            {req.responsiblePerson && <span>Responsible: {req.responsiblePerson}</span>}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 text-right ml-4 shrink-0">
                          <div className="text-xs">Next Assessment</div>
                          <div className={overdue ? 'text-red-600 font-medium' : dueForReview ? 'text-amber-600 font-medium' : ''}>
                            {formatDate(req.nextAssessmentDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Scale className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No legal requirements found</h3>
                <p className="text-sm text-gray-400 mb-6">
                  {searchQuery || obligationFilter !== 'all' || complianceFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by adding your first quality legal requirement.'}
                </p>
                {!searchQuery && obligationFilter === 'all' && complianceFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Add First Requirement
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ================================================================= */}
      {/* CREATE MODAL                                                      */}
      {/* ================================================================= */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Legal Requirement" size="full">
        <form onSubmit={handleSubmit}>
          {/* Section Navigation */}
          <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {/* Section A: Requirement */}
            {activeSection === 'requirement' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Requirement Details</h3>

                <div>
                  <Label htmlFor="legal-title">Title *</Label>
                  <Input
                    id="legal-title"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. ISO 9001:2015 Quality Management System"
                  />
                </div>

                <div>
                  <Label htmlFor="legal-obligationType">Obligation Type *</Label>
                  <Select
                    id="legal-obligationType"
                    value={form.obligationType}
                    onChange={e => setForm({ ...form, obligationType: e.target.value })}
                  >
                    {OBLIGATION_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal-issuingBody">Issuing Body</Label>
                    <Input
                      id="legal-issuingBody"
                      value={form.issuingBody}
                      onChange={e => setForm({ ...form, issuingBody: e.target.value })}
                      placeholder="e.g. ISO, BSI, OSHA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="legal-referenceDoc">Reference Document</Label>
                    <Input
                      id="legal-referenceDoc"
                      value={form.referenceDoc}
                      onChange={e => setForm({ ...form, referenceDoc: e.target.value })}
                      placeholder="e.g. ISO 9001:2015"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="legal-description">Description</Label>
                  <Textarea
                    id="legal-description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Overview of the legal/regulatory requirement"
                  />
                </div>

                <div>
                  <Label htmlFor="legal-requirements">Specific Requirements</Label>
                  <Textarea
                    id="legal-requirements"
                    value={form.requirements}
                    onChange={e => setForm({ ...form, requirements: e.target.value })}
                    rows={4}
                    placeholder="Detail the specific requirements or clauses that apply"
                  />
                </div>

                <div>
                  <Label htmlFor="legal-applicableScope">Applicable Scope</Label>
                  <Textarea
                    id="legal-applicableScope"
                    value={form.applicableScope}
                    onChange={e => setForm({ ...form, applicableScope: e.target.value })}
                    rows={2}
                    placeholder="Which products, processes, or areas does this apply to?"
                  />
                </div>
              </div>
            )}

            {/* Section B: Quality Specifics */}
            {activeSection === 'quality' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quality Specifics</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal-customerName">Customer Name</Label>
                    <Input
                      id="legal-customerName"
                      value={form.customerName}
                      onChange={e => setForm({ ...form, customerName: e.target.value })}
                      placeholder="Customer name (if contract-based)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="legal-contractNumber">Contract Number</Label>
                    <Input
                      id="legal-contractNumber"
                      value={form.contractNumber}
                      onChange={e => setForm({ ...form, contractNumber: e.target.value })}
                      placeholder="Contract/PO number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="legal-productServiceScope">Product/Service Scope</Label>
                  <Textarea
                    id="legal-productServiceScope"
                    value={form.productServiceScope}
                    onChange={e => setForm({ ...form, productServiceScope: e.target.value })}
                    rows={3}
                    placeholder="Products or services covered by this requirement"
                  />
                </div>

                <div>
                  <Label htmlFor="legal-certificationBody">Certification Body</Label>
                  <Input
                    id="legal-certificationBody"
                    value={form.certificationBody}
                    onChange={e => setForm({ ...form, certificationBody: e.target.value })}
                    placeholder="e.g. BSI, Lloyd's Register, SGS"
                  />
                </div>
              </div>
            )}

            {/* Section C: Compliance */}
            {activeSection === 'compliance' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Compliance Assessment</h3>

                <div>
                  <Label htmlFor="legal-complianceStatus">Compliance Status *</Label>
                  <Select
                    id="legal-complianceStatus"
                    value={form.complianceStatus}
                    onChange={e => setForm({ ...form, complianceStatus: e.target.value })}
                  >
                    {COMPLIANCE_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label htmlFor="legal-complianceNotes">Compliance Notes</Label>
                  <Textarea
                    id="legal-complianceNotes"
                    value={form.complianceNotes}
                    onChange={e => setForm({ ...form, complianceNotes: e.target.value })}
                    rows={3}
                    placeholder="Notes on current compliance status, evidence, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="legal-gapAnalysis">Gap Analysis</Label>
                  <Textarea
                    id="legal-gapAnalysis"
                    value={form.gapAnalysis}
                    onChange={e => setForm({ ...form, gapAnalysis: e.target.value })}
                    rows={4}
                    placeholder="Identified gaps between current state and requirements"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal-lastAssessmentDate">Last Assessment Date</Label>
                    <Input
                      id="legal-lastAssessmentDate"
                      type="date"
                      value={form.lastAssessmentDate}
                      onChange={e => setForm({ ...form, lastAssessmentDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="legal-nextAssessmentDate">Next Assessment Date</Label>
                    <Input
                      id="legal-nextAssessmentDate"
                      type="date"
                      value={form.nextAssessmentDate}
                      onChange={e => setForm({ ...form, nextAssessmentDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section D: Monitoring */}
            {activeSection === 'monitoring' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Monitoring & Review</h3>

                <div>
                  <Label htmlFor="legal-responsiblePerson">Responsible Person</Label>
                  <Input
                    id="legal-responsiblePerson"
                    value={form.responsiblePerson}
                    onChange={e => setForm({ ...form, responsiblePerson: e.target.value })}
                    placeholder="Person responsible for maintaining compliance"
                  />
                </div>

                <div>
                  <Label htmlFor="legal-reviewFrequency">Review Frequency</Label>
                  <Select
                    id="legal-reviewFrequency"
                    value={form.reviewFrequency}
                    onChange={e => setForm({ ...form, reviewFrequency: e.target.value })}
                  >
                    {REVIEW_FREQUENCIES.map(f => (
                      <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="legal-effectiveDate">Effective Date</Label>
                    <Input
                      id="legal-effectiveDate"
                      type="date"
                      value={form.effectiveDate}
                      onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="legal-expiryDate">Expiry Date</Label>
                    <Input
                      id="legal-expiryDate"
                      type="date"
                      value={form.expiryDate}
                      onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="legal-status">Record Status</Label>
                  <Select
                    id="legal-status"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    {RECORD_STATUSES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {/* Section E: IMS Links */}
            {activeSection === 'ims' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">IMS Cross-References</h3>
                <p className="text-sm text-gray-500">Link this requirement to other IMS modules for integrated compliance tracking.</p>

                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Track in Health & Safety</p>
                      <p className="text-sm text-gray-500">Also monitor this requirement in the H&S legal register</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, trackedInHs: !form.trackedInHs })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.trackedInHs ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.trackedInHs ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Track in Environment</p>
                      <p className="text-sm text-gray-500">Also monitor this requirement in the Environmental legal register</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, trackedInEnv: !form.trackedInEnv })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.trackedInEnv ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.trackedInEnv ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {sections.findIndex(s => s.id === activeSection) + 1} / {sections.length}
              </div>
              <div className="flex items-center gap-2">
                {activeSection !== 'requirement' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const idx = sections.findIndex(s => s.id === activeSection);
                      if (idx > 0) setActiveSection(sections[idx - 1].id);
                    }}
                  >
                    Previous
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                {activeSection !== 'ims' ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const idx = sections.findIndex(s => s.id === activeSection);
                      if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Requirement'}
                  </Button>
                )}
              </div>
            </div>
          </ModalFooter>
        </form>
      </Modal>

      {/* ================================================================= */}
      {/* DETAIL MODAL                                                      */}
      {/* ================================================================= */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={selectedReq?.title || 'Requirement Detail'} size="full">
        {selectedReq && (
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6">
            {/* Section A: Requirement */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Requirement
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="text-sm font-medium">{selectedReq.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Obligation Type</p>
                  <Badge variant={obligationBadgeVariant(selectedReq.obligationType)}>
                    {selectedReq.obligationType?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Issuing Body</p>
                  <p className="text-sm">{selectedReq.issuingBody || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reference Document</p>
                  <p className="text-sm">{selectedReq.referenceDoc || '-'}</p>
                </div>
              </div>
              {selectedReq.description && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedReq.description}</p>
                </div>
              )}
              {selectedReq.requirements && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Specific Requirements</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedReq.requirements}</p>
                </div>
              )}
              {selectedReq.applicableScope && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Applicable Scope</p>
                  <p className="text-sm mt-1">{selectedReq.applicableScope}</p>
                </div>
              )}
            </div>

            {/* Section B: Quality Specifics */}
            {(selectedReq.customerName || selectedReq.contractNumber || selectedReq.productServiceScope || selectedReq.certificationBody) && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Quality Specifics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Customer Name</p>
                    <p className="text-sm">{selectedReq.customerName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contract Number</p>
                    <p className="text-sm">{selectedReq.contractNumber || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Product/Service Scope</p>
                    <p className="text-sm">{selectedReq.productServiceScope || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Certification Body</p>
                    <p className="text-sm">{selectedReq.certificationBody || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Section C: Compliance */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Compliance Assessment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Compliance Status</p>
                  <Badge className={complianceColor(selectedReq.complianceStatus)}>
                    {selectedReq.complianceStatus?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Assessment</p>
                  <p className="text-sm">{formatDate(selectedReq.lastAssessmentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Next Assessment</p>
                  <p className={`text-sm ${isOverdue(selectedReq.nextAssessmentDate) ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(selectedReq.nextAssessmentDate)}
                  </p>
                </div>
              </div>
              {selectedReq.complianceNotes && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Compliance Notes</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedReq.complianceNotes}</p>
                </div>
              )}
              {selectedReq.gapAnalysis && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">Gap Analysis</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedReq.gapAnalysis}</p>
                </div>
              )}
            </div>

            {/* Section D: Monitoring */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Monitoring & Review
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Responsible Person</p>
                  <p className="text-sm">{selectedReq.responsiblePerson || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Review Frequency</p>
                  <p className="text-sm">{selectedReq.reviewFrequency?.replace(/_/g, ' ') || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Effective Date</p>
                  <p className="text-sm">{formatDate(selectedReq.effectiveDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expiry Date</p>
                  <p className="text-sm">{formatDate(selectedReq.expiryDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Record Status</p>
                  <Badge variant={statusBadgeVariant(selectedReq.status)}>
                    {selectedReq.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Section E: IMS Links */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                IMS Links
              </h3>
              <div className="flex gap-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${selectedReq.trackedInHs ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                  <div className={`h-2 w-2 rounded-full ${selectedReq.trackedInHs ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Health & Safety</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${selectedReq.trackedInEnv ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  <div className={`h-2 w-2 rounded-full ${selectedReq.trackedInEnv ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Environment</span>
                </div>
              </div>
            </div>

            {/* Section F: AI Compliance Analysis */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Compliance Analysis
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runAiAnalysis(selectedReq)}
                  disabled={aiAnalysis.loading}
                  className="flex items-center gap-2"
                >
                  {aiAnalysis.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
              {aiAnalysis.loading && (
                <div className="flex items-center gap-3 text-sm text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>AI is analysing compliance status, gaps, and recommendations...</span>
                </div>
              )}
              {aiAnalysis.result && (
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-white rounded-lg p-4 mt-2">
                  {aiAnalysis.result}
                </div>
              )}
              {aiAnalysis.error && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mt-2">
                  {aiAnalysis.error}
                </div>
              )}
              {!aiAnalysis.loading && !aiAnalysis.result && !aiAnalysis.error && (
                <p className="text-sm text-blue-600">Click &quot;Run Analysis&quot; to get AI-powered insights on compliance gaps, risks, and recommended actions.</p>
              )}
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
