'use client';

import { useEffect, useState, useCallback } from 'react';
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
  AIDisclosure,
} from '@ims/ui';
import { Plus, Scale, Loader2, Search, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────

const OBLIGATION_TYPES = [
  { value: 'LEGISLATION', label: 'Legislation' },
  { value: 'REGULATION', label: 'Regulation' },
  { value: 'PERMIT', label: 'Permit' },
  { value: 'LICENCE', label: 'Licence' },
  { value: 'PLANNING_CONDITION', label: 'Planning Condition' },
  { value: 'INDUSTRY_STANDARD', label: 'Industry Standard' },
  { value: 'VOLUNTARY_COMMITMENT', label: 'Voluntary Commitment' },
  { value: 'CONTRACTUAL', label: 'Contractual' },
  { value: 'ACOP', label: 'Approved Code of Practice' },
  { value: 'GUIDANCE', label: 'Guidance' },
] as const;

const JURISDICTIONS = [
  { value: 'UK', label: 'United Kingdom' },
  { value: 'EU', label: 'European Union' },
  { value: 'INTERNATIONAL', label: 'International' },
  { value: 'LOCAL_AUTHORITY', label: 'Local Authority' },
  { value: 'OTHER', label: 'Other' },
] as const;

const LEGAL_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'REVIEW_DUE', label: 'Review Due' },
  { value: 'SUPERSEDED', label: 'Superseded' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

const COMPLIANCE_STATUSES = [
  {
    value: 'COMPLIANT',
    label: 'Compliant',
    color: 'bg-green-100 text-green-800',
    variant: 'success' as const,
  },
  {
    value: 'PARTIALLY_COMPLIANT',
    label: 'Partially Compliant',
    color: 'bg-yellow-100 text-yellow-800',
    variant: 'warning' as const,
  },
  {
    value: 'NON_COMPLIANT',
    label: 'Non-Compliant',
    color: 'bg-red-100 text-red-800',
    variant: 'danger' as const,
  },
  {
    value: 'NOT_ASSESSED',
    label: 'Not Assessed',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
    variant: 'secondary' as const,
  },
  {
    value: 'NOT_APPLICABLE',
    label: 'Not Applicable',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
    variant: 'outline' as const,
  },
] as const;

const ASSESSMENT_METHODS = [
  { value: 'INTERNAL_AUDIT', label: 'Internal Audit' },
  { value: 'THIRD_PARTY_AUDIT', label: 'Third Party Audit' },
  { value: 'SELF_ASSESSMENT', label: 'Self Assessment' },
  { value: 'REGULATORY_INSPECTION', label: 'Regulatory Inspection' },
  { value: 'CONTINUOUS_MONITORING', label: 'Continuous Monitoring' },
] as const;

const ACTION_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
] as const;

const REPORTING_FREQUENCIES = [
  { value: 'CONTINUOUS', label: 'Continuous' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'AS_REQUIRED', label: 'As Required' },
] as const;

// ─── Types ────────────────────────────────────────────────────────

interface LegalRecord {
  id: string;
  referenceNumber: string;
  obligationType: string;
  title: string;
  jurisdiction: string;
  regulatoryBody: string;
  legislationReference: string;
  relevantSection: string | null;
  effectiveDate: string | null;
  expiryReviewDate: string | null;
  status: string;
  description: string;
  applicableActivities: string;
  applicableSites: string | null;
  linkedAspects: string[];
  penalties: string | null;
  complianceStatus: string;
  complianceEvidence: string | null;
  evidenceReference: string | null;
  lastAssessedDate: string | null;
  assessedBy: string | null;
  assessmentMethod: string | null;
  complianceGaps: string | null;
  requiredActions: string | null;
  actionPriority: string | null;
  actionsDueDate: string | null;
  responsiblePerson: string | null;
  capaRequired: boolean | null;
  monitoringRequirements: string | null;
  reportingRequirements: string | null;
  reportingFrequency: string | null;
  nextReportingDue: string | null;
  permitConditions: string | null;
  aiGenerated: boolean;
  createdAt: string;
}

interface LegalForm {
  obligationType: string;
  title: string;
  jurisdiction: string;
  regulatoryBody: string;
  legislationReference: string;
  relevantSection: string;
  effectiveDate: string;
  expiryReviewDate: string;
  status: string;
  description: string;
  applicableActivities: string;
  applicableSites: string;
  linkedAspects: string[];
  penalties: string;
  complianceStatus: string;
  complianceEvidence: string;
  evidenceReference: string;
  lastAssessedDate: string;
  assessedBy: string;
  assessmentMethod: string;
  complianceGaps: string;
  requiredActions: string;
  actionPriority: string;
  actionsDueDate: string;
  responsiblePerson: string;
  capaRequired: boolean;
  monitoringRequirements: string;
  reportingRequirements: string;
  reportingFrequency: string;
  nextReportingDue: string;
  permitConditions: string;
}

const emptyForm: LegalForm = {
  obligationType: 'LEGISLATION',
  title: '',
  jurisdiction: 'UK',
  regulatoryBody: '',
  legislationReference: '',
  relevantSection: '',
  effectiveDate: '',
  expiryReviewDate: '',
  status: 'ACTIVE',
  description: '',
  applicableActivities: '',
  applicableSites: '',
  linkedAspects: [],
  penalties: '',
  complianceStatus: 'NOT_ASSESSED',
  complianceEvidence: '',
  evidenceReference: '',
  lastAssessedDate: '',
  assessedBy: '',
  assessmentMethod: '',
  complianceGaps: '',
  requiredActions: '',
  actionPriority: '',
  actionsDueDate: '',
  responsiblePerson: '',
  capaRequired: false,
  monitoringRequirements: '',
  reportingRequirements: '',
  reportingFrequency: '',
  nextReportingDue: '',
  permitConditions: '',
};

interface AiAnalysis {
  keyObligations?: string;
  complianceChecklist?: string;
  gapAnalysis?: string;
  requiredActions?: string;
  evidenceRequired?: string;
  monitoring?: string;
  penalty?: string;
  recentChanges?: string;
}

// ─── Component ────────────────────────────────────────────────────

export default function LegalClient() {
  const [records, setRecords] = useState<LegalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<LegalForm>({ ...emptyForm });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<AiAnalysis | null>(null);

  // Filters
  const [complianceFilter, setComplianceFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRecords = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (complianceFilter !== 'ALL') params.complianceStatus = complianceFilter;
      if (typeFilter !== 'ALL') params.obligationType = typeFilter;
      const response = await api.get('/legal', { params }).catch(() => ({ data: { data: [] } }));
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Failed to load legal records:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, complianceFilter, typeFilter]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  function openModal() {
    setForm({ ...emptyForm });
    setAiGenerated(null);
    setShowModal(true);
  }

  function updateForm(field: keyof LegalForm, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function generateAiAnalysis() {
    if (form.title.length < 5) return;
    setAiLoading(true);
    try {
      const res = await api.post('/legal/ai-analyse', {
        title: form.title,
        legislationReference: form.legislationReference,
        obligationType: form.obligationType,
        jurisdiction: form.jurisdiction,
        description: form.description,
      });
      const data: AiAnalysis = res.data.data || res.data;
      setAiGenerated(data);
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (
      !form.title ||
      !form.description ||
      !form.regulatoryBody ||
      !form.legislationReference ||
      !form.responsiblePerson
    )
      return;
    setSubmitting(true);
    try {
      await api.post('/legal', {
        ...form,
        effectiveDate: form.effectiveDate || undefined,
        expiryReviewDate: form.expiryReviewDate || undefined,
        lastAssessedDate: form.lastAssessedDate || undefined,
        actionsDueDate: form.actionsDueDate || undefined,
        nextReportingDue: form.nextReportingDue || undefined,
        assessmentMethod: form.assessmentMethod || undefined,
        actionPriority: form.actionPriority || undefined,
        reportingFrequency: form.reportingFrequency || undefined,
        linkedAspects: form.linkedAspects.length > 0 ? form.linkedAspects : undefined,
        aiGenerated: !!aiGenerated,
      });
      setShowModal(false);
      setForm({ ...emptyForm });
      setAiGenerated(null);
      loadRecords();
    } catch (error) {
      console.error('Failed to create legal requirement:', error);
    } finally {
      setSubmitting(false);
    }
  }

  function getComplianceBadgeVariant(status: string) {
    const found = COMPLIANCE_STATUSES.find((s) => s.value === status);
    return found?.variant || 'secondary';
  }

  function getComplianceLabel(status: string) {
    const found = COMPLIANCE_STATUSES.find((s) => s.value === status);
    return found?.label || status.replace(/_/g, ' ');
  }

  function getObligationLabel(type: string) {
    const found = OBLIGATION_TYPES.find((t) => t.value === type);
    return found?.label || type.replace(/_/g, ' ');
  }

  function getJurisdictionLabel(j: string) {
    const found = JURISDICTIONS.find((jur) => jur.value === j);
    return found?.label || j;
  }

  function isReviewOverdue(record: LegalRecord): boolean {
    if (!record.expiryReviewDate) return false;
    return new Date(record.expiryReviewDate) < new Date();
  }

  // ─── Computed ────────────────────────────────────────────────────

  const counts = {
    total: records.length,
    compliant: records.filter((r) => r.complianceStatus === 'COMPLIANT').length,
    partiallyCompliant: records.filter((r) => r.complianceStatus === 'PARTIALLY_COMPLIANT').length,
    nonCompliant: records.filter((r) => r.complianceStatus === 'NON_COMPLIANT').length,
    notAssessed: records.filter((r) => r.complianceStatus === 'NOT_ASSESSED').length,
  };

  const compliancePercentage =
    counts.total > 0 ? Math.round((counts.compliant / counts.total) * 100) : 0;

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Legal Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              ISO 14001 Clause 6.1.3 -- Compliance Obligations Register
            </p>
          </div>
          <Button
            onClick={openModal}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Requirement
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-3xl font-bold">{counts.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Requirements</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{counts.compliant}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Compliant</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{counts.partiallyCompliant}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Partially Compliant</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{counts.nonCompliant}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Non-Compliant</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Health Dashboard */}
        {counts.total > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Compliance Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                  {counts.compliant > 0 && (
                    <div
                      className="bg-green-500 h-full transition-all"
                      style={{ width: `${(counts.compliant / counts.total) * 100}%` }}
                    />
                  )}
                  {counts.partiallyCompliant > 0 && (
                    <div
                      className="bg-yellow-400 h-full transition-all"
                      style={{ width: `${(counts.partiallyCompliant / counts.total) * 100}%` }}
                    />
                  )}
                  {counts.nonCompliant > 0 && (
                    <div
                      className="bg-red-500 h-full transition-all"
                      style={{ width: `${(counts.nonCompliant / counts.total) * 100}%` }}
                    />
                  )}
                  {counts.notAssessed > 0 && (
                    <div
                      className="bg-gray-300 h-full transition-all"
                      style={{ width: `${(counts.notAssessed / counts.total) * 100}%` }}
                    />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {compliancePercentage}%
                </span>
              </div>
              <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Compliant (
                  {counts.compliant})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Partial (
                  {counts.partiallyCompliant})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Non-Compliant (
                  {counts.nonCompliant})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Not Assessed (
                  {counts.notAssessed})
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Bar */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search legal requirements..."
              placeholder="Search legal requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="ALL">All Compliance</option>
            {COMPLIANCE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="ALL">All Types</option>
            {OBLIGATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* List View */}
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          ) : records.length > 0 ? (
            records.map((record) => (
              <Card key={record.id} className="hover:border-green-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Top row: ref + compliance badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                          {record.referenceNumber}
                        </span>
                        <Badge variant={getComplianceBadgeVariant(record.complianceStatus)}>
                          {getComplianceLabel(record.complianceStatus)}
                        </Badge>
                        {isReviewOverdue(record) && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            Review Overdue
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {record.title}
                      </h3>

                      {/* Type + Jurisdiction badges */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{getObligationLabel(record.obligationType)}</Badge>
                        <Badge variant="info">{getJurisdictionLabel(record.jurisdiction)}</Badge>
                        {record.status === 'REVIEW_DUE' && (
                          <Badge variant="warning">Review Due</Badge>
                        )}
                      </div>

                      {/* Description preview */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                        {record.description}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
                        {record.regulatoryBody && (
                          <span>Regulatory Body: {record.regulatoryBody}</span>
                        )}
                        {record.expiryReviewDate && (
                          <span>
                            Review: {new Date(record.expiryReviewDate).toLocaleDateString()}
                          </span>
                        )}
                        {record.responsiblePerson && (
                          <span>Responsible: {record.responsiblePerson}</span>
                        )}
                        {record.legislationReference && (
                          <span>Ref: {record.legislationReference}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Scale className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No legal requirements found
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Click Add Requirement to start building your compliance register
                  </p>
                  <Button variant="outline" className="mt-4" onClick={openModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add Legal Requirement"
          size="full"
        >
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-8">
            {/* Section A - Legislation Identification */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">
                A. Legislation Identification
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Obligation Type *</Label>
                    <Select
                      value={form.obligationType}
                      onChange={(e) => updateForm('obligationType', e.target.value)}
                    >
                      {OBLIGATION_TYPES.map((t) => (
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
                      onChange={(e) => updateForm('status', e.target.value)}
                    >
                      {LEGAL_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="e.g., Environmental Protection Act 1990"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Jurisdiction *</Label>
                    <Select
                      value={form.jurisdiction}
                      onChange={(e) => updateForm('jurisdiction', e.target.value)}
                    >
                      {JURISDICTIONS.map((j) => (
                        <option key={j.value} value={j.value}>
                          {j.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Regulatory Body *</Label>
                    <Input
                      value={form.regulatoryBody}
                      onChange={(e) => updateForm('regulatoryBody', e.target.value)}
                      placeholder="e.g., Environment Agency"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Legislation Reference *</Label>
                    <Input
                      value={form.legislationReference}
                      onChange={(e) => updateForm('legislationReference', e.target.value)}
                      placeholder="e.g., EPA 1990, SI 2010/675"
                    />
                  </div>
                  <div>
                    <Label>Relevant Section</Label>
                    <Input
                      value={form.relevantSection}
                      onChange={(e) => updateForm('relevantSection', e.target.value)}
                      placeholder="e.g., Part 2A, Section 34"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Effective Date</Label>
                    <Input
                      type="date"
                      value={form.effectiveDate}
                      onChange={(e) => updateForm('effectiveDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Expiry / Review Date</Label>
                    <Input
                      type="date"
                      value={form.expiryReviewDate}
                      onChange={(e) => updateForm('expiryReviewDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section B - Scope & Applicability */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">
                B. Scope &amp; Applicability
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Describe the legal requirement, its scope and key provisions..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Applicable Activities *</Label>
                  <Textarea
                    value={form.applicableActivities}
                    onChange={(e) => updateForm('applicableActivities', e.target.value)}
                    placeholder="e.g., Waste handling, emissions discharge, chemical storage..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Applicable Sites</Label>
                  <Input
                    value={form.applicableSites}
                    onChange={(e) => updateForm('applicableSites', e.target.value)}
                    placeholder="e.g., All sites, Main plant, Warehouse A"
                  />
                </div>
                <div>
                  <Label>Penalties</Label>
                  <Textarea
                    value={form.penalties}
                    onChange={(e) => updateForm('penalties', e.target.value)}
                    placeholder="Describe potential penalties for non-compliance..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Section C - Compliance Assessment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">
                C. Compliance Assessment
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Compliance Status</Label>
                    <Select
                      value={form.complianceStatus}
                      onChange={(e) => updateForm('complianceStatus', e.target.value)}
                    >
                      {COMPLIANCE_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Assessment Method</Label>
                    <Select
                      value={form.assessmentMethod}
                      onChange={(e) => updateForm('assessmentMethod', e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {ASSESSMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Compliance Evidence</Label>
                  <Textarea
                    value={form.complianceEvidence}
                    onChange={(e) => updateForm('complianceEvidence', e.target.value)}
                    placeholder="Describe evidence of compliance..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Evidence Reference</Label>
                  <Input
                    value={form.evidenceReference}
                    onChange={(e) => updateForm('evidenceReference', e.target.value)}
                    placeholder="e.g., Document reference, audit report number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Last Assessed Date</Label>
                    <Input
                      type="date"
                      value={form.lastAssessedDate}
                      onChange={(e) => updateForm('lastAssessedDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Assessed By</Label>
                    <Input
                      value={form.assessedBy}
                      onChange={(e) => updateForm('assessedBy', e.target.value)}
                      placeholder="Name of assessor"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section D - Gap Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">
                D. Gap Analysis &amp; Actions
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Compliance Gaps</Label>
                  <Textarea
                    value={form.complianceGaps}
                    onChange={(e) => updateForm('complianceGaps', e.target.value)}
                    placeholder="Describe any identified compliance gaps..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Required Actions</Label>
                  <Textarea
                    value={form.requiredActions}
                    onChange={(e) => updateForm('requiredActions', e.target.value)}
                    placeholder="Actions required to achieve or maintain compliance..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Action Priority</Label>
                    <Select
                      value={form.actionPriority}
                      onChange={(e) => updateForm('actionPriority', e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {ACTION_PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Actions Due Date</Label>
                    <Input
                      type="date"
                      value={form.actionsDueDate}
                      onChange={(e) => updateForm('actionsDueDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Responsible Person *</Label>
                    <Input
                      value={form.responsiblePerson}
                      onChange={(e) => updateForm('responsiblePerson', e.target.value)}
                      placeholder="Name of responsible person"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.capaRequired}
                        onChange={(e) => updateForm('capaRequired', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        CAPA Required
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section E - Monitoring & Reporting */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">
                E. Monitoring &amp; Reporting
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Monitoring Requirements</Label>
                  <Textarea
                    value={form.monitoringRequirements}
                    onChange={(e) => updateForm('monitoringRequirements', e.target.value)}
                    placeholder="Describe ongoing monitoring requirements..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Reporting Requirements</Label>
                  <Textarea
                    value={form.reportingRequirements}
                    onChange={(e) => updateForm('reportingRequirements', e.target.value)}
                    placeholder="Describe regulatory reporting obligations..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Reporting Frequency</Label>
                    <Select
                      value={form.reportingFrequency}
                      onChange={(e) => updateForm('reportingFrequency', e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      {REPORTING_FREQUENCIES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Next Reporting Due</Label>
                    <Input
                      type="date"
                      value={form.nextReportingDue}
                      onChange={(e) => updateForm('nextReportingDue', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Permit Conditions</Label>
                  <Textarea
                    value={form.permitConditions}
                    onChange={(e) => updateForm('permitConditions', e.target.value)}
                    placeholder="Describe any specific permit conditions..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Section F - AI Compliance Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-l-4 border-green-500 pl-3 mb-4">
                F. AI Compliance Analysis
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-green-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> AI-Powered Compliance Assessment
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateAiAnalysis}
                      disabled={aiLoading || form.title.length < 5}
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analysing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate AI Compliance Assessment
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-green-600">
                    Enter the requirement title and legislation reference first, then click to
                    generate an AI compliance assessment including key obligations, gap analysis,
                    and recommended actions.
                  </p>
                </div>

                {aiGenerated && (
                  <div className="border border-green-200 rounded-lg p-4 bg-white dark:bg-gray-900 space-y-3">
                    <h4 className="font-medium text-green-800 flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4" /> AI Analysis Results
                    </h4>
                    <AIDisclosure
                      variant="inline"
                      provider="claude"
                      analysisType="Legal Compliance"
                      confidence={0.85}
                    />
                    {aiGenerated.keyObligations && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          Key Obligations
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {aiGenerated.keyObligations}
                        </p>
                      </div>
                    )}
                    {aiGenerated.complianceChecklist && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          Compliance Checklist
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {aiGenerated.complianceChecklist}
                        </p>
                      </div>
                    )}
                    {aiGenerated.gapAnalysis && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          Gap Analysis
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {aiGenerated.gapAnalysis}
                        </p>
                      </div>
                    )}
                    {aiGenerated.requiredActions && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          Required Actions
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {aiGenerated.requiredActions}
                        </p>
                      </div>
                    )}
                    {aiGenerated.evidenceRequired && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          Evidence Required
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {aiGenerated.evidenceRequired}
                        </p>
                      </div>
                    )}
                    {aiGenerated.monitoring && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          Monitoring Recommendations
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {aiGenerated.monitoring}
                        </p>
                      </div>
                    )}
                    {aiGenerated.penalty && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          Penalty Information
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {aiGenerated.penalty}
                        </p>
                      </div>
                    )}
                    {aiGenerated.recentChanges && (
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                          Recent Legislative Changes
                        </Label>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {aiGenerated.recentChanges}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !form.title ||
                !form.description ||
                !form.regulatoryBody ||
                !form.legislationReference ||
                !form.responsiblePerson
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Add Requirement'
              )}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
}
