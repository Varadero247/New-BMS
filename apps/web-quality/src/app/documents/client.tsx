'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
  Button, Badge, Modal, ModalFooter,
  Input, Label, Select, Textarea,
  AIDisclosure,
} from '@ims/ui';
import {
  Plus, FileText, Search, Loader2, Sparkles,
  AlertCircle, Clock, CheckCircle, Eye,
  BookOpen, ClipboardCheck, File, FolderOpen,
  Shield, ChevronDown, ChevronUp, Calendar,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES = [
  { value: 'POLICY', label: 'Policy', icon: Shield },
  { value: 'PROCEDURE', label: 'Procedure', icon: BookOpen },
  { value: 'WORK_INSTRUCTION', label: 'Work Instruction', icon: ClipboardCheck },
  { value: 'FORM', label: 'Form', icon: FileText },
  { value: 'RECORD', label: 'Record', icon: File },
  { value: 'SPECIFICATION', label: 'Specification', icon: FileText },
  { value: 'DRAWING', label: 'Drawing', icon: FileText },
  { value: 'EXTERNAL', label: 'External', icon: FolderOpen },
  { value: 'PLAN', label: 'Plan', icon: ClipboardCheck },
  { value: 'REPORT', label: 'Report', icon: FileText },
] as const;

const DOCUMENT_STATUSES = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-blue-100 text-blue-700' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'OBSOLETE', label: 'Obsolete', color: 'bg-red-100 text-red-700' },
  { value: 'EXTERNAL', label: 'External', color: 'bg-purple-100 text-purple-700' },
] as const;

const ACCESS_LEVELS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'CONFIDENTIAL', label: 'Confidential' },
] as const;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'es', label: 'Spanish' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
] as const;

const FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'OBSOLETE', label: 'Obsolete' },
  { key: 'EXTERNAL', label: 'External' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentRecord {
  id: string;
  documentNumber: string;
  title: string;
  documentType: string;
  status: string;
  version: string;
  isoClause: string;
  linkedProcess: string;
  language: string;
  purpose: string;
  scope: string;
  summary: string;
  keyChanges: string;
  author: string;
  ownerCustodian: string;
  reviewer: string;
  approvedBy: string;
  issueDate: string;
  effectiveDate: string;
  nextReviewDate: string;
  distributionList: string;
  accessLevel: string;
  locationUrl: string;
  controlledCopies: number;
  supersedesDocument: string;
  relatedProcedures: string;
  relatedForms: string;
  relatedRecords: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentForm {
  title: string;
  documentType: string;
  isoClause: string;
  linkedProcess: string;
  version: string;
  status: string;
  language: string;
  purpose: string;
  scope: string;
  summary: string;
  keyChanges: string;
  author: string;
  ownerCustodian: string;
  reviewer: string;
  approvedBy: string;
  issueDate: string;
  effectiveDate: string;
  nextReviewDate: string;
  distributionList: string;
  accessLevel: string;
  locationUrl: string;
  controlledCopies: number;
  supersedesDocument: string;
  relatedProcedures: string;
  relatedForms: string;
  relatedRecords: string;
}

interface AiDocReview {
  completenessScore: number;
  complianceNotes: string[];
  suggestedImprovements: string[];
  isoAlignmentNotes: string;
  riskAreas: string[];
  reviewRecommendation: string;
}

const emptyForm: DocumentForm = {
  title: '',
  documentType: 'PROCEDURE',
  isoClause: '',
  linkedProcess: '',
  version: '1.0',
  status: 'DRAFT',
  language: 'en',
  purpose: '',
  scope: '',
  summary: '',
  keyChanges: '',
  author: '',
  ownerCustodian: '',
  reviewer: '',
  approvedBy: '',
  issueDate: '',
  effectiveDate: '',
  nextReviewDate: '',
  distributionList: '',
  accessLevel: 'INTERNAL',
  locationUrl: '',
  controlledCopies: 0,
  supersedesDocument: '',
  relatedProcedures: '',
  relatedForms: '',
  relatedRecords: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentsClient() {
  // Data state
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DocumentForm>({ ...emptyForm });
  const [activeSection, setActiveSection] = useState<string>('A');
  const [formError, setFormError] = useState<string | null>(null);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReview, setAiReview] = useState<AiDocReview | null>(null);

  // ─── Data Loading ─────────────────────────────────────────────────

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (activeTab !== 'ALL') params.status = activeTab;
      if (typeFilter !== 'all') params.documentType = typeFilter;
      const response = await api.get('/documents', { params });
      setDocuments(response.data.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, typeFilter]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // ─── Helpers ──────────────────────────────────────────────────────

  const getStatusStyle = (status: string) => {
    const s = DOCUMENT_STATUSES.find(ds => ds.value === status);
    return s?.color || 'bg-gray-100 dark:bg-gray-800 text-gray-700';
  };

  const getDocTypeConfig = (type: string) => {
    return DOCUMENT_TYPES.find(dt => dt.value === type) || DOCUMENT_TYPES[1];
  };

  const isExpiringSoon = (nextReviewDate: string): boolean => {
    if (!nextReviewDate) return false;
    const reviewDate = new Date(nextReviewDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return reviewDate <= thirtyDaysFromNow && reviewDate >= now;
  };

  const isExpired = (nextReviewDate: string): boolean => {
    if (!nextReviewDate) return false;
    return new Date(nextReviewDate) < new Date();
  };

  // ─── Summary Metrics ──────────────────────────────────────────────

  const counts = {
    total: documents.length,
    active: documents.filter(d => d.status === 'ACTIVE' || d.status === 'APPROVED').length,
    underReview: documents.filter(d => d.status === 'UNDER_REVIEW').length,
    expiringSoon: documents.filter(d => isExpiringSoon(d.nextReviewDate) || isExpired(d.nextReviewDate)).length,
  };

  // ─── Filtering ────────────────────────────────────────────────────

  const filteredDocs = documents.filter(d => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.documentNumber?.toLowerCase().includes(q) ||
        d.author?.toLowerCase().includes(q) ||
        d.isoClause?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ─── Modal Handlers ───────────────────────────────────────────────

  function openCreateModal() {
    setForm({ ...emptyForm });
    setActiveSection('A');
    setFormError(null);
    setAiReview(null);
    setModalOpen(true);
  }

  function updateForm(field: keyof DocumentForm, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Document title is required.');
      setActiveSection('A');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        documentType: form.documentType,
        isoClause: form.isoClause || undefined,
        linkedProcess: form.linkedProcess || undefined,
        version: form.version || '1.0',
        status: form.status,
        language: form.language,
        purpose: form.purpose || undefined,
        scope: form.scope || undefined,
        summary: form.summary || undefined,
        keyChanges: form.keyChanges || undefined,
        author: form.author || undefined,
        ownerCustodian: form.ownerCustodian || undefined,
        reviewer: form.reviewer || undefined,
        approvedBy: form.approvedBy || undefined,
        issueDate: form.issueDate || undefined,
        effectiveDate: form.effectiveDate || undefined,
        nextReviewDate: form.nextReviewDate || undefined,
        distributionList: form.distributionList || undefined,
        accessLevel: form.accessLevel,
        locationUrl: form.locationUrl || undefined,
        controlledCopies: form.controlledCopies || undefined,
        supersedesDocument: form.supersedesDocument || undefined,
        relatedProcedures: form.relatedProcedures || undefined,
        relatedForms: form.relatedForms || undefined,
        relatedRecords: form.relatedRecords || undefined,
      };
      await api.post('/documents', payload);
      setModalOpen(false);
      setForm({ ...emptyForm });
      loadDocuments();
    } catch (err) {
      console.error('Failed to create document:', err);
      setFormError('Failed to create document. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── AI Document Review ───────────────────────────────────────────

  async function generateAiReview() {
    if (!form.title || form.title.length < 5) return;
    setAiLoading(true);
    try {
      const response = await api.post('/documents/ai-review', {
        title: form.title,
        documentType: form.documentType,
        purpose: form.purpose,
        scope: form.scope,
        summary: form.summary,
        isoClause: form.isoClause,
        keyChanges: form.keyChanges,
      });
      const data = response.data.data;
      if (data) {
        setAiReview(data);
      }
    } catch (err) {
      console.error('AI review failed:', err);
    } finally {
      setAiLoading(false);
    }
  }

  // ─── Section Definitions ──────────────────────────────────────────

  const sections = [
    { key: 'A', label: 'Document Identity' },
    { key: 'B', label: 'Content Summary' },
    { key: 'C', label: 'Ownership & Approval' },
    { key: 'D', label: 'Distribution & Access' },
    { key: 'E', label: 'Related Documents' },
    { key: 'F', label: 'AI Document Review' },
  ];

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Document Control</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage controlled documents, policies, procedures, and records
            </p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Documents</p>
                  <p className="text-3xl font-bold">{counts.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-green-600">{counts.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Under Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{counts.underReview}</p>
                </div>
                <Eye className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
                  <p className="text-3xl font-bold text-orange-600">{counts.expiringSoon}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? tab.key === 'OBSOLETE'
                    ? 'bg-red-600 text-white'
                    : tab.key === 'UNDER_REVIEW'
                    ? 'bg-yellow-500 text-white'
                    : tab.key === 'ACTIVE'
                    ? 'bg-green-600 text-white'
                    : tab.key === 'EXTERNAL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Type Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  aria-label="Search by title, document number, author, ISO clause..." placeholder="Search by title, document number, author, ISO clause..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                {DOCUMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Documents ({filteredDocs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                ))}
              </div>
            ) : filteredDocs.length > 0 ? (
              <div className="space-y-4">
                {filteredDocs.map(doc => {
                  const typeConfig = getDocTypeConfig(doc.documentType);
                  const IconComponent = typeConfig.icon;
                  const expiring = isExpiringSoon(doc.nextReviewDate);
                  const expired = isExpired(doc.nextReviewDate);
                  return (
                    <div
                      key={doc.id}
                      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                        expired
                          ? 'border-red-300 bg-red-50 hover:border-red-400'
                          : expiring
                          ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-1 flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                {doc.documentNumber}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {typeConfig.label}
                              </Badge>
                              {doc.version && (
                                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                  v{doc.version}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(doc.status)}`}>
                                {DOCUMENT_STATUSES.find(s => s.value === doc.status)?.label || doc.status}
                              </span>
                              {expired && (
                                <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                                  <AlertCircle className="h-3 w-3" />
                                  REVIEW OVERDUE
                                </Badge>
                              )}
                              {expiring && !expired && (
                                <Badge variant="warning" className="flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  REVIEW DUE
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{doc.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                              {doc.isoClause && <span>ISO {doc.isoClause}</span>}
                              {doc.author && <span>Author: {doc.author}</span>}
                              {doc.linkedProcess && <span>Process: {doc.linkedProcess}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 text-right flex-shrink-0">
                          {doc.nextReviewDate && (
                            <div className={`text-sm flex items-center gap-1 ${
                              expired ? 'text-red-600 font-medium' :
                              expiring ? 'text-orange-600' : 'text-gray-400'
                            }`}>
                              <Calendar className="h-4 w-4" />
                              {new Date(doc.nextReviewDate).toLocaleDateString()}
                            </div>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Next Review</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-1">No documents found</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  Start building your document library by creating your first controlled document.
                </p>
                <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Create First Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Create Document Modal ───────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Controlled Document"
        size="full"
      >
        <form onSubmit={handleSubmit}>
          {/* Section Tabs */}
          <div className="flex gap-1 mb-6 border-b overflow-x-auto">
            {sections.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => setActiveSection(s.key)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === s.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                {s.key}. {s.label}
              </button>
            ))}
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {/* Section A: Document Identity */}
            {activeSection === 'A' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  A -- Document Identity
                </div>
                <div>
                  <Label htmlFor="doc-title">Title *</Label>
                  <Input
                    id="doc-title"
                    value={form.title}
                    onChange={e => updateForm('title', e.target.value)}
                    required
                    placeholder="Document title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doc-type">Document Type *</Label>
                    <Select
                      id="doc-type"
                      value={form.documentType}
                      onChange={e => updateForm('documentType', e.target.value)}
                    >
                      {DOCUMENT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doc-isoClause">ISO Clause</Label>
                    <Input
                      id="doc-isoClause"
                      value={form.isoClause}
                      onChange={e => updateForm('isoClause', e.target.value)}
                      placeholder="e.g., 7.5.1, 8.5.2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doc-linkedProcess">Linked Process</Label>
                    <Input
                      id="doc-linkedProcess"
                      value={form.linkedProcess}
                      onChange={e => updateForm('linkedProcess', e.target.value)}
                      placeholder="e.g., Quality Management, Purchasing"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-version">Version</Label>
                    <Input
                      id="doc-version"
                      value={form.version}
                      onChange={e => updateForm('version', e.target.value)}
                      placeholder="e.g., 1.0, 2.1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doc-status">Status</Label>
                    <Select
                      id="doc-status"
                      value={form.status}
                      onChange={e => updateForm('status', e.target.value)}
                    >
                      {DOCUMENT_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doc-language">Language</Label>
                    <Select
                      id="doc-language"
                      value={form.language}
                      onChange={e => updateForm('language', e.target.value)}
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Section B: Content Summary */}
            {activeSection === 'B' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  B -- Content Summary
                </div>
                <div>
                  <Label htmlFor="doc-purpose">Purpose</Label>
                  <Textarea
                    id="doc-purpose"
                    value={form.purpose}
                    onChange={e => updateForm('purpose', e.target.value)}
                    rows={3}
                    placeholder="Why this document exists and what it aims to achieve"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-scope">Scope</Label>
                  <Textarea
                    id="doc-scope"
                    value={form.scope}
                    onChange={e => updateForm('scope', e.target.value)}
                    rows={2}
                    placeholder="What areas, processes, or personnel this document covers"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-summary">Summary</Label>
                  <Textarea
                    id="doc-summary"
                    value={form.summary}
                    onChange={e => updateForm('summary', e.target.value)}
                    rows={4}
                    placeholder="Brief overview of the document content"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-keyChanges">Key Changes (from previous version)</Label>
                  <Textarea
                    id="doc-keyChanges"
                    value={form.keyChanges}
                    onChange={e => updateForm('keyChanges', e.target.value)}
                    rows={3}
                    placeholder="List significant changes made in this revision"
                  />
                </div>
              </div>
            )}

            {/* Section C: Ownership & Approval */}
            {activeSection === 'C' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  C -- Ownership & Approval
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doc-author">Author</Label>
                    <Input
                      id="doc-author"
                      value={form.author}
                      onChange={e => updateForm('author', e.target.value)}
                      placeholder="Document author name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-ownerCustodian">Owner / Custodian</Label>
                    <Input
                      id="doc-ownerCustodian"
                      value={form.ownerCustodian}
                      onChange={e => updateForm('ownerCustodian', e.target.value)}
                      placeholder="Person or role responsible for this document"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doc-reviewer">Reviewer</Label>
                    <Input
                      id="doc-reviewer"
                      value={form.reviewer}
                      onChange={e => updateForm('reviewer', e.target.value)}
                      placeholder="Person who reviewed this version"
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-approvedBy">Approved By</Label>
                    <Input
                      id="doc-approvedBy"
                      value={form.approvedBy}
                      onChange={e => updateForm('approvedBy', e.target.value)}
                      placeholder="Approving authority"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="doc-issueDate">Issue Date</Label>
                    <Input
                      id="doc-issueDate"
                      type="date"
                      value={form.issueDate}
                      onChange={e => updateForm('issueDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-effectiveDate">Effective Date</Label>
                    <Input
                      id="doc-effectiveDate"
                      type="date"
                      value={form.effectiveDate}
                      onChange={e => updateForm('effectiveDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-nextReviewDate">Next Review Date</Label>
                    <Input
                      id="doc-nextReviewDate"
                      type="date"
                      value={form.nextReviewDate}
                      onChange={e => updateForm('nextReviewDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section D: Distribution & Access */}
            {activeSection === 'D' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  D -- Distribution & Access
                </div>
                <div>
                  <Label htmlFor="doc-distributionList">Distribution List</Label>
                  <Textarea
                    id="doc-distributionList"
                    value={form.distributionList}
                    onChange={e => updateForm('distributionList', e.target.value)}
                    rows={3}
                    placeholder="List of roles, departments, or individuals who should receive this document"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doc-accessLevel">Access Level</Label>
                    <Select
                      id="doc-accessLevel"
                      value={form.accessLevel}
                      onChange={e => updateForm('accessLevel', e.target.value)}
                    >
                      {ACCESS_LEVELS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doc-controlledCopies">Controlled Copies</Label>
                    <Input
                      id="doc-controlledCopies"
                      type="number"
                      min={0}
                      value={form.controlledCopies}
                      onChange={e => updateForm('controlledCopies', parseInt(e.target.value) || 0)}
                      placeholder="Number of controlled copies"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="doc-locationUrl">Location / URL</Label>
                  <Input
                    id="doc-locationUrl"
                    value={form.locationUrl}
                    onChange={e => updateForm('locationUrl', e.target.value)}
                    placeholder="File path, SharePoint URL, or document management system link"
                  />
                </div>
              </div>
            )}

            {/* Section E: Related Documents */}
            {activeSection === 'E' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  E -- Related Documents
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Link this document to related procedures, forms, and records for cross-referencing.
                </p>
                <div>
                  <Label htmlFor="doc-supersedes">Supersedes Document</Label>
                  <Input
                    id="doc-supersedes"
                    value={form.supersedesDocument}
                    onChange={e => updateForm('supersedesDocument', e.target.value)}
                    placeholder="Document number or title of the previous version this replaces"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-relatedProcedures">Related Procedures</Label>
                  <Textarea
                    id="doc-relatedProcedures"
                    value={form.relatedProcedures}
                    onChange={e => updateForm('relatedProcedures', e.target.value)}
                    rows={2}
                    placeholder="List related procedures (comma-separated or one per line)"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-relatedForms">Related Forms</Label>
                  <Textarea
                    id="doc-relatedForms"
                    value={form.relatedForms}
                    onChange={e => updateForm('relatedForms', e.target.value)}
                    rows={2}
                    placeholder="List related forms (comma-separated or one per line)"
                  />
                </div>
                <div>
                  <Label htmlFor="doc-relatedRecords">Related Records</Label>
                  <Textarea
                    id="doc-relatedRecords"
                    value={form.relatedRecords}
                    onChange={e => updateForm('relatedRecords', e.target.value)}
                    rows={2}
                    placeholder="List related records (comma-separated or one per line)"
                  />
                </div>
              </div>
            )}

            {/* Section F: AI Document Review */}
            {activeSection === 'F' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  F -- AI Document Review
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-purple-800 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Document Review
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={generateAiReview}
                      disabled={aiLoading || !form.title || form.title.length < 5}
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Reviewing...
                        </>
                      ) : (
                        'Review with AI'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600 mb-3">
                    Fill in the document identity and content summary sections, then click to get
                    an AI-powered review with completeness scoring, compliance notes, and improvement suggestions.
                  </p>

                  {aiReview && (
                    <div className="space-y-3 mt-4">
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Completeness Score</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                aiReview.completenessScore >= 80 ? 'bg-green-500' :
                                aiReview.completenessScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${aiReview.completenessScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{aiReview.completenessScore}%</span>
                        </div>
                      </div>
                      {aiReview.complianceNotes && aiReview.complianceNotes.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Compliance Notes</p>
                          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                            {aiReview.complianceNotes.map((note, idx) => (
                              <li key={idx}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiReview.suggestedImprovements && aiReview.suggestedImprovements.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Suggested Improvements</p>
                          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                            {aiReview.suggestedImprovements.map((sug, idx) => (
                              <li key={idx}>{sug}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ISO Alignment</p>
                        <p className="text-sm text-gray-800">{aiReview.isoAlignmentNotes}</p>
                      </div>
                      {aiReview.riskAreas && aiReview.riskAreas.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Risk Areas</p>
                          <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                            {aiReview.riskAreas.map((risk, idx) => (
                              <li key={idx}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Review Recommendation</p>
                        <p className="text-sm text-gray-800">{aiReview.reviewRecommendation}</p>
                      </div>
                      <AIDisclosure variant="inline" provider="claude" analysisType="Document Analysis" confidence={0.85} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <div className="flex justify-between w-full">
              <div>
                {activeSection !== 'A' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const idx = sections.findIndex(s => s.key === activeSection);
                      if (idx > 0) setActiveSection(sections[idx - 1].key);
                    }}
                  >
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                {activeSection !== 'F' ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const idx = sections.findIndex(s => s.key === activeSection);
                      if (idx < sections.length - 1) setActiveSection(sections[idx + 1].key);
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting || !form.title}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Document'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
