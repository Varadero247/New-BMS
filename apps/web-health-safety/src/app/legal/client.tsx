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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  AIDisclosure,
} from '@ims/ui';
import { Plus, Scale, Loader2, Search, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────

const LEGAL_CATEGORIES = [
  { value: 'PRIMARY_LEGISLATION', label: 'Primary Legislation' },
  { value: 'SUBORDINATE_LEGISLATION', label: 'Subordinate Legislation' },
  { value: 'ACOP', label: 'Approved Code of Practice' },
  { value: 'HSE_GUIDANCE', label: 'HSE Guidance' },
  { value: 'INTERNATIONAL_STANDARD', label: 'International Standard' },
  { value: 'INDUSTRY_STANDARD', label: 'Industry Standard' },
  { value: 'CONTRACTUAL', label: 'Contractual' },
  { value: 'VOLUNTARY', label: 'Voluntary' },
] as const;

const COMPLIANCE_STATUSES = [
  { value: 'COMPLIANT', label: 'Compliant', color: 'bg-green-100 text-green-800' },
  { value: 'PARTIAL', label: 'Partial', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'NON_COMPLIANT', label: 'Non-Compliant', color: 'bg-red-100 text-red-800' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  {
    value: 'NOT_ASSESSED',
    label: 'Not Assessed',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
  },
] as const;

const JURISDICTIONS = [
  'United Kingdom',
  'England & Wales',
  'Scotland',
  'Northern Ireland',
  'EU',
] as const;

// ─── Types ────────────────────────────────────────────────────────

interface LegalRequirement {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  legislationRef: string;
  section: string;
  applicableAreas: string;
  effectiveDate: string;
  reviewDate: string;
  complianceStatus: string;
  complianceNotes: string;
  responsiblePerson: string;
  aiKeyObligations: string;
  aiGapAnalysis: string;
  aiRequiredActions: string;
  aiEvidenceRequired: string;
  aiPenaltyForNonCompliance: string;
  aiAssessmentGenerated: boolean;
  status: string;
  createdAt: string;
}

interface LegalForm {
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  legislationRef: string;
  section: string;
  applicableAreas: string;
  effectiveDate: string;
  reviewDate: string;
  complianceStatus: string;
  complianceNotes: string;
  responsiblePerson: string;
  aiKeyObligations: string;
  aiGapAnalysis: string;
  aiRequiredActions: string;
  aiEvidenceRequired: string;
  aiPenaltyForNonCompliance: string;
}

const emptyForm: LegalForm = {
  title: '',
  description: '',
  category: 'PRIMARY_LEGISLATION',
  jurisdiction: 'United Kingdom',
  legislationRef: '',
  section: '',
  applicableAreas: '',
  effectiveDate: '',
  reviewDate: '',
  complianceStatus: 'NOT_ASSESSED',
  complianceNotes: '',
  responsiblePerson: '',
  aiKeyObligations: '',
  aiGapAnalysis: '',
  aiRequiredActions: '',
  aiEvidenceRequired: '',
  aiPenaltyForNonCompliance: '',
};

// ─── Component ────────────────────────────────────────────────────

export default function LegalRegisterClient() {
  const [requirements, setRequirements] = useState<LegalRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState<LegalForm>({ ...emptyForm });
  const [section, setSection] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadRequirements = useCallback(async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (complianceFilter !== 'all') params.complianceStatus = complianceFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const response = await api.get('/legal', { params });
      setRequirements(response.data.data || []);
    } catch (error) {
      console.error('Failed to load legal requirements:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, complianceFilter, categoryFilter]);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  function openModal() {
    setForm({ ...emptyForm });
    setSection(0);
    setModalOpen(true);
  }

  function updateForm(field: keyof LegalForm, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function generateAiAnalysis() {
    if (form.title.length < 5) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/legal/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementTitle: form.title,
          legislationRef: form.legislationRef,
          category: form.category,
          jurisdiction: form.jurisdiction,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          aiKeyObligations: data.keyObligations || '',
          aiGapAnalysis: data.gapAnalysis || '',
          aiRequiredActions: data.requiredActions || '',
          aiEvidenceRequired: data.evidenceRequired || '',
          aiPenaltyForNonCompliance: data.penaltyForNonCompliance || '',
        }));
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.title || !form.description || !form.category) return;
    setSaving(true);
    try {
      await api.post('/legal', {
        ...form,
        effectiveDate: form.effectiveDate || undefined,
        reviewDate: form.reviewDate || undefined,
        aiAssessmentGenerated: !!(form.aiKeyObligations || form.aiGapAnalysis),
      });
      setModalOpen(false);
      loadRequirements();
    } catch (error) {
      console.error('Failed to create requirement:', error);
    } finally {
      setSaving(false);
    }
  }

  const getComplianceColor = (status: string) => {
    const s = COMPLIANCE_STATUSES.find((cs) => cs.value === status);
    return s?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-800';
  };

  const counts = {
    total: requirements.length,
    COMPLIANT: requirements.filter((r) => r.complianceStatus === 'COMPLIANT').length,
    PARTIAL: requirements.filter((r) => r.complianceStatus === 'PARTIAL').length,
    NON_COMPLIANT: requirements.filter((r) => r.complianceStatus === 'NON_COMPLIANT').length,
  };

  const sections = ['Requirement Details', 'AI Compliance Assessment'];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Legal Register</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              OHS legislation and compliance obligations
            </p>
          </div>
          <Button onClick={openModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Requirement
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{counts.total}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Requirements</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{counts.COMPLIANT}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Compliant</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{counts.PARTIAL}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Partial</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{counts.NON_COMPLIANT}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Non-Compliant</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search requirements..."
              placeholder="Search requirements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            aria-label="Filter by compliance"
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="all">All Compliance</option>
            {COMPLIANCE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            {LEGAL_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="animate-pulse space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>
            ) : requirements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Review Date</TableHead>
                    <TableHead>Responsible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-mono text-xs">{req.referenceNumber}</TableCell>
                      <TableCell className="font-medium">{req.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{req.category.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {req.jurisdiction || '-'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(req.complianceStatus)}`}
                        >
                          {req.complianceStatus.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {req.reviewDate ? new Date(req.reviewDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {req.responsiblePerson || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Scale className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No legal requirements added yet</p>
                <Button variant="outline" className="mt-4" onClick={openModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Requirement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Add Legal Requirement"
            size="lg"
          >
            <div className="flex gap-1 mb-6 border-b">
              {sections.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSection(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${section === i ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Section A: Requirement Details */}
            {section === 0 && (
              <div className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => updateForm('title', e.target.value)}
                    placeholder="e.g., Health and Safety at Work etc. Act 1974"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={form.category}
                      onChange={(e) => updateForm('category', e.target.value)}
                    >
                      {LEGAL_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Jurisdiction</Label>
                    <Select
                      value={form.jurisdiction}
                      onChange={(e) => updateForm('jurisdiction', e.target.value)}
                    >
                      {JURISDICTIONS.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Legislation Reference</Label>
                    <Input
                      value={form.legislationRef}
                      onChange={(e) => updateForm('legislationRef', e.target.value)}
                      placeholder="e.g., HSWA 1974, SI 1999/3242"
                    />
                  </div>
                  <div>
                    <Label>Section/Clause</Label>
                    <Input
                      value={form.section}
                      onChange={(e) => updateForm('section', e.target.value)}
                      placeholder="e.g., Section 2(1)"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Describe the legal requirement and its scope..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Applicable Areas</Label>
                  <Input
                    value={form.applicableAreas}
                    onChange={(e) => updateForm('applicableAreas', e.target.value)}
                    placeholder="e.g., All departments, Manufacturing only"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Effective Date</Label>
                    <Input
                      type="date"
                      value={form.effectiveDate}
                      onChange={(e) => updateForm('effectiveDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Next Review Date</Label>
                    <Input
                      type="date"
                      value={form.reviewDate}
                      onChange={(e) => updateForm('reviewDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Responsible Person</Label>
                    <Input
                      value={form.responsiblePerson}
                      onChange={(e) => updateForm('responsiblePerson', e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section B: AI Compliance Assessment */}
            {section === 1 && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> AI Compliance Assessment
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateAiAnalysis}
                      disabled={aiLoading || form.title.length < 5}
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Analysing...
                        </>
                      ) : (
                        'Analyse with AI'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600">
                    Enter the requirement title and details first, then click to generate AI
                    compliance assessment.
                  </p>
                  <AIDisclosure
                    variant="inline"
                    provider="claude"
                    analysisType="Legal Compliance"
                    confidence={0.85}
                  />
                </div>
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
                  <Label>
                    Key Obligations{' '}
                    {form.aiKeyObligations && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        AI Suggested
                      </Badge>
                    )}
                  </Label>
                  <Textarea
                    value={form.aiKeyObligations}
                    onChange={(e) => updateForm('aiKeyObligations', e.target.value)}
                    rows={3}
                    placeholder="Key legal obligations under this requirement"
                  />
                </div>
                <div>
                  <Label>
                    Gap Analysis{' '}
                    {form.aiGapAnalysis && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        AI Suggested
                      </Badge>
                    )}
                  </Label>
                  <Textarea
                    value={form.aiGapAnalysis}
                    onChange={(e) => updateForm('aiGapAnalysis', e.target.value)}
                    rows={3}
                    placeholder="Common compliance gaps"
                  />
                </div>
                <div>
                  <Label>
                    Required Actions{' '}
                    {form.aiRequiredActions && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        AI Suggested
                      </Badge>
                    )}
                  </Label>
                  <Textarea
                    value={form.aiRequiredActions}
                    onChange={(e) => updateForm('aiRequiredActions', e.target.value)}
                    rows={3}
                    placeholder="Actions needed for compliance"
                  />
                </div>
                <div>
                  <Label>
                    Evidence Required{' '}
                    {form.aiEvidenceRequired && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        AI Suggested
                      </Badge>
                    )}
                  </Label>
                  <Textarea
                    value={form.aiEvidenceRequired}
                    onChange={(e) => updateForm('aiEvidenceRequired', e.target.value)}
                    rows={2}
                    placeholder="Documentation and evidence needed"
                  />
                </div>
                <div>
                  <Label>
                    Penalty for Non-Compliance{' '}
                    {form.aiPenaltyForNonCompliance && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        AI Suggested
                      </Badge>
                    )}
                  </Label>
                  <Textarea
                    value={form.aiPenaltyForNonCompliance}
                    onChange={(e) => updateForm('aiPenaltyForNonCompliance', e.target.value)}
                    rows={2}
                    placeholder="Potential penalties and consequences"
                  />
                </div>
                <div>
                  <Label>Compliance Notes</Label>
                  <Textarea
                    value={form.complianceNotes}
                    onChange={(e) => updateForm('complianceNotes', e.target.value)}
                    rows={2}
                    placeholder="Additional notes on compliance status"
                  />
                </div>
              </div>
            )}

            <ModalFooter>
              <div className="flex justify-between w-full">
                <div>
                  {section > 0 && (
                    <Button variant="outline" onClick={() => setSection(0)}>
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  {section < 1 ? (
                    <Button onClick={() => setSection(1)}>Next</Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={saving || !form.title || !form.description}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Add Requirement'
                      )}
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
