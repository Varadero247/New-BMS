'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, ModalFooter, Input, Label, Select, Textarea, AIDisclosure } from '@ims/ui';
import { Plus, Truck, Search, ShieldCheck, AlertTriangle, ClipboardCheck, Leaf, Star, RefreshCw, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Supplier {
  id: string;
  supplierName: string;
  supplierCode: string;
  category: string;
  countryOfOrigin: string;
  primaryContact: string;
  contactEmail: string;
  contactPhone: string;
  accountManager: string;
  approvedStatus: string;

  // Quality assessment (ISO 9001)
  iso9001Certified: string;
  certificationBody: string;
  certificateExpiry: string;
  qmsEvidence: string;
  onTimeDeliveryPct: number;
  qualityRejectPct: number;
  ncrsRaised: number;
  capaCompletionPct: number;
  qualityScore: number;
  qualityRating: string;

  // H&S assessment (ISO 45001)
  iso45001Certified: string;
  riddorLtiRate: number;
  hsPolicyInPlace: boolean;
  methodStatements: boolean;
  hsAuditScore: number;
  hsComments: string;
  hsRating: string;

  // Environmental assessment (ISO 14001)
  iso14001Certified: string;
  envPolicyInPlace: boolean;
  carbonFootprintData: string;
  wasteManagementPlan: boolean;
  envIncidents: number;
  envAuditScore: number;
  envComments: string;
  envRating: string;

  // Overall IMS rating
  overallImsScore: number;
  overallRating: string;
  riskLevel: string;

  // Audit & review
  lastAuditDate: string;
  nextAuditDue: string;
  auditType: string;
  auditFindings: string;
  openNcrs: number;
  correctiveActionsDue: number;
  reviewFrequency: string;

  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  'MATERIALS',
  'SERVICES',
  'EQUIPMENT',
  'LABOUR',
  'SUBCONTRACT',
  'UTILITIES',
  'PROFESSIONAL_SERVICES',
  'OTHER',
] as const;

const APPROVED_STATUSES = ['APPROVED', 'PROBATIONARY', 'PENDING', 'SUSPENDED', 'REJECTED'] as const;

const CERT_OPTIONS = ['YES', 'NO', 'IN_PROGRESS'] as const;

const RATING_OPTIONS = ['EXCELLENT', 'GOOD', 'SATISFACTORY', 'POOR', 'CRITICAL'] as const;

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const AUDIT_TYPES = ['DESKTOP', 'ON_SITE', 'REMOTE', 'FULL_SYSTEM', 'PROCESS', 'PRODUCT'] as const;

const REVIEW_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY', 'BIANNUALLY'] as const;

// ---------------------------------------------------------------------------
// Form shape
// ---------------------------------------------------------------------------

const emptyForm = {
  // A - Supplier identification
  supplierName: '',
  supplierCode: '',
  category: 'MATERIALS' as string,
  countryOfOrigin: '',
  primaryContact: '',
  contactEmail: '',
  contactPhone: '',
  accountManager: '',
  approvedStatus: 'PENDING' as string,

  // B - Quality assessment (ISO 9001)
  iso9001Certified: 'NO' as string,
  certificationBody: '',
  certificateExpiry: '',
  qmsEvidence: '',
  onTimeDeliveryPct: 0,
  qualityRejectPct: 0,
  ncrsRaised: 0,
  capaCompletionPct: 0,
  qualityScore: 0,
  qualityRating: 'SATISFACTORY' as string,

  // C - H&S assessment (ISO 45001)
  iso45001Certified: 'NO' as string,
  riddorLtiRate: 0,
  hsPolicyInPlace: false,
  methodStatements: false,
  hsAuditScore: 0,
  hsComments: '',
  hsRating: 'SATISFACTORY' as string,

  // D - Environmental assessment (ISO 14001)
  iso14001Certified: 'NO' as string,
  envPolicyInPlace: false,
  carbonFootprintData: '',
  wasteManagementPlan: false,
  envIncidents: 0,
  envAuditScore: 0,
  envComments: '',
  envRating: 'SATISFACTORY' as string,

  // E - Overall IMS rating (auto-calculated)
  overallImsScore: 0,
  overallRating: 'SATISFACTORY' as string,
  riskLevel: 'MEDIUM' as string,

  // F - Audit & review
  lastAuditDate: '',
  nextAuditDue: '',
  auditType: 'ON_SITE' as string,
  auditFindings: '',
  openNcrs: 0,
  correctiveActionsDue: 0,
  reviewFrequency: 'ANNUALLY' as string,
};

type SupplierForm = typeof emptyForm;

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

const approvedStatusColors: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-800',
  PROBATIONARY: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-blue-100 text-blue-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-200 text-red-900',
};

const categoryColors: Record<string, string> = {
  MATERIALS: 'bg-blue-100 text-blue-700',
  SERVICES: 'bg-purple-100 text-purple-700',
  EQUIPMENT: 'bg-cyan-100 text-cyan-700',
  LABOUR: 'bg-orange-100 text-orange-700',
  SUBCONTRACT: 'bg-indigo-100 text-indigo-700',
  UTILITIES: 'bg-teal-100 text-teal-700',
  PROFESSIONAL_SERVICES: 'bg-pink-100 text-pink-700',
  OTHER: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const riskLevelColors: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const ratingColors: Record<string, string> = {
  EXCELLENT: 'bg-green-100 text-green-800',
  GOOD: 'bg-emerald-100 text-emerald-700',
  SATISFACTORY: 'bg-yellow-100 text-yellow-700',
  POOR: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-800',
};

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function autoOverallScore(qualityScore: number, hsAuditScore: number, envAuditScore: number): number {
  return Math.round(qualityScore * 0.5 + hsAuditScore * 0.3 + envAuditScore * 0.2);
}

function autoOverallRating(score: number): string {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 75) return 'GOOD';
  if (score >= 60) return 'SATISFACTORY';
  if (score >= 40) return 'POOR';
  return 'CRITICAL';
}

function autoRiskLevel(score: number): string {
  if (score >= 80) return 'LOW';
  if (score >= 60) return 'MEDIUM';
  if (score >= 40) return 'HIGH';
  return 'CRITICAL';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SuppliersClient() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<SupplierForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('A');

  // AI analysis
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Data loading
  // -------------------------------------------------------------------------

  const loadSuppliers = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // -------------------------------------------------------------------------
  // Filtering
  // -------------------------------------------------------------------------

  const filteredSuppliers = suppliers
    .filter(s => !statusFilter || s.approvedStatus === statusFilter)
    .filter(s => !categoryFilter || s.category === categoryFilter)
    .filter(s => !ratingFilter || s.overallRating === ratingFilter)
    .filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.supplierName?.toLowerCase().includes(q) ||
        s.supplierCode?.toLowerCase().includes(q) ||
        s.primaryContact?.toLowerCase().includes(q) ||
        s.contactEmail?.toLowerCase().includes(q)
      );
    });

  // -------------------------------------------------------------------------
  // Summary stats
  // -------------------------------------------------------------------------

  const stats = {
    total: suppliers.length,
    approved: suppliers.filter(s => s.approvedStatus === 'APPROVED').length,
    probationary: suppliers.filter(s => s.approvedStatus === 'PROBATIONARY').length,
    dueForAudit: suppliers.filter(s => {
      if (!s.nextAuditDue) return false;
      const due = new Date(s.nextAuditDue);
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      return due <= thirtyDays;
    }).length,
  };

  // -------------------------------------------------------------------------
  // Auto-calculate IMS score when quality / HS / env scores change
  // -------------------------------------------------------------------------

  function updateFormField(field: string, value: unknown) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Recalculate overall when component scores change
      if (['qualityScore', 'hsAuditScore', 'envAuditScore'].includes(field)) {
        const qs = field === 'qualityScore' ? Number(value) : prev.qualityScore;
        const hs = field === 'hsAuditScore' ? Number(value) : prev.hsAuditScore;
        const ev = field === 'envAuditScore' ? Number(value) : prev.envAuditScore;
        next.overallImsScore = autoOverallScore(qs, hs, ev);
        next.overallRating = autoOverallRating(next.overallImsScore);
        next.riskLevel = autoRiskLevel(next.overallImsScore);
      }
      return next;
    });
  }

  // -------------------------------------------------------------------------
  // CRUD
  // -------------------------------------------------------------------------

  function openCreate() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setActiveSection('A');
    setAiAnalysis(null);
    setShowModal(true);
  }

  function openEdit(supplier: Supplier) {
    setForm({
      supplierName: supplier.supplierName || '',
      supplierCode: supplier.supplierCode || '',
      category: supplier.category || 'MATERIALS',
      countryOfOrigin: supplier.countryOfOrigin || '',
      primaryContact: supplier.primaryContact || '',
      contactEmail: supplier.contactEmail || '',
      contactPhone: supplier.contactPhone || '',
      accountManager: supplier.accountManager || '',
      approvedStatus: supplier.approvedStatus || 'PENDING',
      iso9001Certified: supplier.iso9001Certified || 'NO',
      certificationBody: supplier.certificationBody || '',
      certificateExpiry: supplier.certificateExpiry ? supplier.certificateExpiry.split('T')[0] : '',
      qmsEvidence: supplier.qmsEvidence || '',
      onTimeDeliveryPct: supplier.onTimeDeliveryPct ?? 0,
      qualityRejectPct: supplier.qualityRejectPct ?? 0,
      ncrsRaised: supplier.ncrsRaised ?? 0,
      capaCompletionPct: supplier.capaCompletionPct ?? 0,
      qualityScore: supplier.qualityScore ?? 0,
      qualityRating: supplier.qualityRating || 'SATISFACTORY',
      iso45001Certified: supplier.iso45001Certified || 'NO',
      riddorLtiRate: supplier.riddorLtiRate ?? 0,
      hsPolicyInPlace: supplier.hsPolicyInPlace ?? false,
      methodStatements: supplier.methodStatements ?? false,
      hsAuditScore: supplier.hsAuditScore ?? 0,
      hsComments: supplier.hsComments || '',
      hsRating: supplier.hsRating || 'SATISFACTORY',
      iso14001Certified: supplier.iso14001Certified || 'NO',
      envPolicyInPlace: supplier.envPolicyInPlace ?? false,
      carbonFootprintData: supplier.carbonFootprintData || '',
      wasteManagementPlan: supplier.wasteManagementPlan ?? false,
      envIncidents: supplier.envIncidents ?? 0,
      envAuditScore: supplier.envAuditScore ?? 0,
      envComments: supplier.envComments || '',
      envRating: supplier.envRating || 'SATISFACTORY',
      overallImsScore: supplier.overallImsScore ?? 0,
      overallRating: supplier.overallRating || 'SATISFACTORY',
      riskLevel: supplier.riskLevel || 'MEDIUM',
      lastAuditDate: supplier.lastAuditDate ? supplier.lastAuditDate.split('T')[0] : '',
      nextAuditDue: supplier.nextAuditDue ? supplier.nextAuditDue.split('T')[0] : '',
      auditType: supplier.auditType || 'ON_SITE',
      auditFindings: supplier.auditFindings || '',
      openNcrs: supplier.openNcrs ?? 0,
      correctiveActionsDue: supplier.correctiveActionsDue ?? 0,
      reviewFrequency: supplier.reviewFrequency || 'ANNUALLY',
    });
    setEditingId(supplier.id);
    setActiveSection('A');
    setAiAnalysis(null);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form);
      } else {
        await api.post('/suppliers', form);
      }
      setShowModal(false);
      setForm({ ...emptyForm });
      setEditingId(null);
      loadSuppliers();
    } catch (err) {
      console.error('Failed to save supplier:', err);
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------------------------------------------------------------
  // AI Analysis
  // -------------------------------------------------------------------------

  async function runAiAnalysis() {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const payload = {
        type: 'supplier_analysis',
        data: {
          supplierName: form.supplierName,
          category: form.category,
          qualityScore: form.qualityScore,
          hsAuditScore: form.hsAuditScore,
          envAuditScore: form.envAuditScore,
          overallImsScore: form.overallImsScore,
          iso9001Certified: form.iso9001Certified,
          iso45001Certified: form.iso45001Certified,
          iso14001Certified: form.iso14001Certified,
          onTimeDeliveryPct: form.onTimeDeliveryPct,
          qualityRejectPct: form.qualityRejectPct,
          riskLevel: form.riskLevel,
          approvedStatus: form.approvedStatus,
        },
      };
      const response = await api.post('/ai/analyze', payload);
      setAiAnalysis(response.data.data?.analysis || response.data.data?.result || 'Analysis complete. No detailed response received.');
    } catch (err) {
      console.error('AI analysis failed:', err);
      setAiAnalysis('AI analysis is currently unavailable. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // Section navigation
  // -------------------------------------------------------------------------

  const sections = [
    { key: 'A', label: 'Identification' },
    { key: 'B', label: 'Quality (ISO 9001)' },
    { key: 'C', label: 'H&S (ISO 45001)' },
    { key: 'D', label: 'Environment (ISO 14001)' },
    { key: 'E', label: 'Overall IMS Rating' },
    { key: 'F', label: 'Audit & Review' },
    { key: 'G', label: 'AI Analysis' },
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Supplier Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">IMS supplier qualification, scoring and audit tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSuppliers} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button onClick={openCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Supplier
            </Button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Suppliers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Probationary</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.probationary}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Due for Audit</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.dueForAudit}</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  aria-label="Search suppliers..." placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {APPROVED_STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </Select>
              <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </Select>
              <Select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                <option value="">All Ratings</option>
                {RATING_OPTIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
              {(searchQuery || statusFilter || categoryFilter || ratingFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setStatusFilter(''); setCategoryFilter(''); setRatingFilter(''); }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Supplier cards grid */}
        {filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSuppliers.map(supplier => (
              <Card
                key={supplier.id}
                className="cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => openEdit(supplier)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{supplier.supplierName}</CardTitle>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{supplier.supplierCode}</p>
                    </div>
                    <Badge className={approvedStatusColors[supplier.approvedStatus] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                      {supplier.approvedStatus?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={categoryColors[supplier.category] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                      {supplier.category?.replace(/_/g, ' ')}
                    </Badge>
                    {supplier.riskLevel && (
                      <Badge className={riskLevelColors[supplier.riskLevel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}>
                        {supplier.riskLevel} Risk
                      </Badge>
                    )}
                  </div>

                  {/* IMS Score gauge */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${
                        (supplier.overallImsScore ?? 0) >= 80 ? 'border-green-400' :
                        (supplier.overallImsScore ?? 0) >= 60 ? 'border-yellow-400' :
                        (supplier.overallImsScore ?? 0) >= 40 ? 'border-orange-400' :
                        'border-red-400'
                      }`}>
                        <span className={`text-lg font-bold ${getScoreColor(supplier.overallImsScore ?? 0)}`}>
                          {supplier.overallImsScore ?? 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                      <p>IMS Score / 100</p>
                      {supplier.overallRating && (
                        <Badge className={`mt-1 ${ratingColors[supplier.overallRating] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                          {supplier.overallRating}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Mini score indicators */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Star className="h-3.5 w-3.5 mx-auto text-blue-500 mb-1" />
                      <p className={`text-sm font-semibold ${getScoreColor(supplier.qualityScore ?? 0)}`}>
                        {supplier.qualityScore ?? 0}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Quality</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <ShieldCheck className="h-3.5 w-3.5 mx-auto text-orange-500 mb-1" />
                      <p className={`text-sm font-semibold ${getScoreColor(supplier.hsAuditScore ?? 0)}`}>
                        {supplier.hsAuditScore ?? 0}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">H&S</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Leaf className="h-3.5 w-3.5 mx-auto text-green-500 mb-1" />
                      <p className={`text-sm font-semibold ${getScoreColor(supplier.envAuditScore ?? 0)}`}>
                        {supplier.envAuditScore ?? 0}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Env</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No suppliers found</p>
                <p className="text-sm mt-1">
                  {suppliers.length === 0
                    ? 'Get started by adding your first supplier.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
                {suppliers.length === 0 && (
                  <Button onClick={openCreate} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" /> Add Supplier
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ================================================================== */}
      {/* Create / Edit Supplier Modal                                       */}
      {/* ================================================================== */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Supplier' : 'Add Supplier'}
        size="full"
      >
        <form onSubmit={handleSubmit}>
          {/* Section tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
            {sections.map(sec => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveSection(sec.key)}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  activeSection === sec.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sec.key}. {sec.label}
              </button>
            ))}
          </div>

          <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-2">
            {/* --------------------------------------------------------------- */}
            {/* A - SUPPLIER IDENTIFICATION                                      */}
            {/* --------------------------------------------------------------- */}
            {activeSection === 'A' && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b pb-1">Supplier Identification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplierName">Supplier Name *</Label>
                    <Input id="supplierName" value={form.supplierName} onChange={e => updateFormField('supplierName', e.target.value)} required placeholder="Company name" />
                  </div>
                  <div>
                    <Label htmlFor="supplierCode">Supplier Code</Label>
                    <Input id="supplierCode" value={form.supplierCode} onChange={e => updateFormField('supplierCode', e.target.value)} placeholder="e.g. SUP-001" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select id="category" value={form.category} onChange={e => updateFormField('category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="countryOfOrigin">Country of Origin</Label>
                    <Input id="countryOfOrigin" value={form.countryOfOrigin} onChange={e => updateFormField('countryOfOrigin', e.target.value)} placeholder="e.g. United Kingdom" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryContact">Primary Contact</Label>
                    <Input id="primaryContact" value={form.primaryContact} onChange={e => updateFormField('primaryContact', e.target.value)} placeholder="Contact name" />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" value={form.contactEmail} onChange={e => updateFormField('contactEmail', e.target.value)} placeholder="email@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" value={form.contactPhone} onChange={e => updateFormField('contactPhone', e.target.value)} placeholder="+44 ..." />
                  </div>
                  <div>
                    <Label htmlFor="accountManager">Account Manager</Label>
                    <Input id="accountManager" value={form.accountManager} onChange={e => updateFormField('accountManager', e.target.value)} placeholder="Internal account manager" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="approvedStatus">Approved Status</Label>
                  <Select id="approvedStatus" value={form.approvedStatus} onChange={e => updateFormField('approvedStatus', e.target.value)}>
                    {APPROVED_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </Select>
                </div>
              </>
            )}

            {/* --------------------------------------------------------------- */}
            {/* B - QUALITY ASSESSMENT (ISO 9001)                                */}
            {/* --------------------------------------------------------------- */}
            {activeSection === 'B' && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b pb-1">Quality Assessment (ISO 9001)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="iso9001Certified">ISO 9001 Certified</Label>
                    <Select id="iso9001Certified" value={form.iso9001Certified} onChange={e => updateFormField('iso9001Certified', e.target.value)}>
                      {CERT_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="certificationBody">Certification Body</Label>
                    <Input id="certificationBody" value={form.certificationBody} onChange={e => updateFormField('certificationBody', e.target.value)} placeholder="e.g. BSI, LRQA" />
                  </div>
                  <div>
                    <Label htmlFor="certificateExpiry">Certificate Expiry</Label>
                    <Input id="certificateExpiry" type="date" value={form.certificateExpiry} onChange={e => updateFormField('certificateExpiry', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="qmsEvidence">QMS Evidence</Label>
                  <Textarea id="qmsEvidence" value={form.qmsEvidence} onChange={e => updateFormField('qmsEvidence', e.target.value)} rows={2} placeholder="Evidence of quality management system" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="onTimeDeliveryPct">On-Time Delivery % (0-100)</Label>
                    <Input id="onTimeDeliveryPct" type="number" min={0} max={100} value={form.onTimeDeliveryPct} onChange={e => updateFormField('onTimeDeliveryPct', Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="qualityRejectPct">Quality Reject % (0-100)</Label>
                    <Input id="qualityRejectPct" type="number" min={0} max={100} value={form.qualityRejectPct} onChange={e => updateFormField('qualityRejectPct', Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ncrsRaised">NCRs Raised</Label>
                    <Input id="ncrsRaised" type="number" min={0} value={form.ncrsRaised} onChange={e => updateFormField('ncrsRaised', Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="capaCompletionPct">CAPA Completion % (0-100)</Label>
                    <Input id="capaCompletionPct" type="number" min={0} max={100} value={form.capaCompletionPct} onChange={e => updateFormField('capaCompletionPct', Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualityScore">Quality Score (0-100)</Label>
                    <Input id="qualityScore" type="number" min={0} max={100} value={form.qualityScore} onChange={e => updateFormField('qualityScore', Number(e.target.value))} />
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(form.qualityScore)}`} style={{ width: `${form.qualityScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="qualityRating">Quality Rating</Label>
                    <Select id="qualityRating" value={form.qualityRating} onChange={e => updateFormField('qualityRating', e.target.value)}>
                      {RATING_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* --------------------------------------------------------------- */}
            {/* C - H&S ASSESSMENT (ISO 45001)                                   */}
            {/* --------------------------------------------------------------- */}
            {activeSection === 'C' && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b pb-1">H&S Assessment (ISO 45001)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="iso45001Certified">ISO 45001 Certified</Label>
                    <Select id="iso45001Certified" value={form.iso45001Certified} onChange={e => updateFormField('iso45001Certified', e.target.value)}>
                      {CERT_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="riddorLtiRate">RIDDOR / LTI Rate</Label>
                    <Input id="riddorLtiRate" type="number" min={0} step={0.01} value={form.riddorLtiRate} onChange={e => updateFormField('riddorLtiRate', Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <input
                      id="hsPolicyInPlace"
                      type="checkbox"
                      checked={form.hsPolicyInPlace}
                      onChange={e => updateFormField('hsPolicyInPlace', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="hsPolicyInPlace" className="mb-0 cursor-pointer">H&S Policy in Place</Label>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <input
                      id="methodStatements"
                      type="checkbox"
                      checked={form.methodStatements}
                      onChange={e => updateFormField('methodStatements', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="methodStatements" className="mb-0 cursor-pointer">Method Statements Provided</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hsAuditScore">H&S Audit Score (0-100)</Label>
                    <Input id="hsAuditScore" type="number" min={0} max={100} value={form.hsAuditScore} onChange={e => updateFormField('hsAuditScore', Number(e.target.value))} />
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(form.hsAuditScore)}`} style={{ width: `${form.hsAuditScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="hsRating">H&S Rating</Label>
                    <Select id="hsRating" value={form.hsRating} onChange={e => updateFormField('hsRating', e.target.value)}>
                      {RATING_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="hsComments">H&S Comments</Label>
                  <Textarea id="hsComments" value={form.hsComments} onChange={e => updateFormField('hsComments', e.target.value)} rows={3} placeholder="Any H&S observations or notes" />
                </div>
              </>
            )}

            {/* --------------------------------------------------------------- */}
            {/* D - ENVIRONMENTAL ASSESSMENT (ISO 14001)                         */}
            {/* --------------------------------------------------------------- */}
            {activeSection === 'D' && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b pb-1">Environmental Assessment (ISO 14001)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="iso14001Certified">ISO 14001 Certified</Label>
                    <Select id="iso14001Certified" value={form.iso14001Certified} onChange={e => updateFormField('iso14001Certified', e.target.value)}>
                      {CERT_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="envIncidents">Environmental Incidents</Label>
                    <Input id="envIncidents" type="number" min={0} value={form.envIncidents} onChange={e => updateFormField('envIncidents', Number(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <input
                      id="envPolicyInPlace"
                      type="checkbox"
                      checked={form.envPolicyInPlace}
                      onChange={e => updateFormField('envPolicyInPlace', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="envPolicyInPlace" className="mb-0 cursor-pointer">Environmental Policy in Place</Label>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <input
                      id="wasteManagementPlan"
                      type="checkbox"
                      checked={form.wasteManagementPlan}
                      onChange={e => updateFormField('wasteManagementPlan', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="wasteManagementPlan" className="mb-0 cursor-pointer">Waste Management Plan</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="carbonFootprintData">Carbon Footprint Data</Label>
                  <Textarea id="carbonFootprintData" value={form.carbonFootprintData} onChange={e => updateFormField('carbonFootprintData', e.target.value)} rows={2} placeholder="Summary of carbon footprint data or reference" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="envAuditScore">Environmental Audit Score (0-100)</Label>
                    <Input id="envAuditScore" type="number" min={0} max={100} value={form.envAuditScore} onChange={e => updateFormField('envAuditScore', Number(e.target.value))} />
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getScoreBgColor(form.envAuditScore)}`} style={{ width: `${form.envAuditScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="envRating">Environmental Rating</Label>
                    <Select id="envRating" value={form.envRating} onChange={e => updateFormField('envRating', e.target.value)}>
                      {RATING_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="envComments">Environmental Comments</Label>
                  <Textarea id="envComments" value={form.envComments} onChange={e => updateFormField('envComments', e.target.value)} rows={3} placeholder="Environmental observations or notes" />
                </div>
              </>
            )}

            {/* --------------------------------------------------------------- */}
            {/* E - OVERALL IMS RATING                                           */}
            {/* --------------------------------------------------------------- */}
            {activeSection === 'E' && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b pb-1">Overall IMS Rating</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  The overall IMS score is auto-calculated: Quality 50% + H&S 30% + Environment 20%.
                  Adjust the component scores in their respective sections to update this automatically.
                </p>

                <div className="flex flex-col items-center py-6">
                  <div className={`w-28 h-28 rounded-full flex items-center justify-center border-8 ${
                    form.overallImsScore >= 80 ? 'border-green-400' :
                    form.overallImsScore >= 60 ? 'border-yellow-400' :
                    form.overallImsScore >= 40 ? 'border-orange-400' :
                    'border-red-400'
                  }`}>
                    <span className={`text-3xl font-bold ${getScoreColor(form.overallImsScore)}`}>
                      {form.overallImsScore}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Overall IMS Score / 100</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quality (50%)</p>
                    <p className={`text-2xl font-bold ${getScoreColor(form.qualityScore)}`}>{form.qualityScore}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">H&S (30%)</p>
                    <p className={`text-2xl font-bold ${getScoreColor(form.hsAuditScore)}`}>{form.hsAuditScore}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Environment (20%)</p>
                    <p className={`text-2xl font-bold ${getScoreColor(form.envAuditScore)}`}>{form.envAuditScore}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Overall Rating (auto)</Label>
                    <div className="mt-1">
                      <Badge className={`text-sm px-3 py-1 ${ratingColors[form.overallRating] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {form.overallRating}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Risk Level (auto)</Label>
                    <div className="mt-1">
                      <Badge className={`text-sm px-3 py-1 ${riskLevelColors[form.riskLevel] || 'bg-gray-100 dark:bg-gray-800 text-gray-700'}`}>
                        {form.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* --------------------------------------------------------------- */}
            {/* F - AUDIT & REVIEW                                               */}
            {/* --------------------------------------------------------------- */}
            {activeSection === 'F' && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b pb-1">Audit & Review</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastAuditDate">Last Audit Date</Label>
                    <Input id="lastAuditDate" type="date" value={form.lastAuditDate} onChange={e => updateFormField('lastAuditDate', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="nextAuditDue">Next Audit Due</Label>
                    <Input id="nextAuditDue" type="date" value={form.nextAuditDue} onChange={e => updateFormField('nextAuditDue', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="auditType">Audit Type</Label>
                    <Select id="auditType" value={form.auditType} onChange={e => updateFormField('auditType', e.target.value)}>
                      {AUDIT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reviewFrequency">Review Frequency</Label>
                    <Select id="reviewFrequency" value={form.reviewFrequency} onChange={e => updateFormField('reviewFrequency', e.target.value)}>
                      {REVIEW_FREQUENCIES.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="auditFindings">Audit Findings</Label>
                  <Textarea id="auditFindings" value={form.auditFindings} onChange={e => updateFormField('auditFindings', e.target.value)} rows={3} placeholder="Summary of audit findings" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openNcrs">Open NCRs</Label>
                    <Input id="openNcrs" type="number" min={0} value={form.openNcrs} onChange={e => updateFormField('openNcrs', Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="correctiveActionsDue">Corrective Actions Due</Label>
                    <Input id="correctiveActionsDue" type="number" min={0} value={form.correctiveActionsDue} onChange={e => updateFormField('correctiveActionsDue', Number(e.target.value))} />
                  </div>
                </div>
              </>
            )}

            {/* --------------------------------------------------------------- */}
            {/* G - AI SUPPLIER ANALYSIS                                         */}
            {/* --------------------------------------------------------------- */}
            {activeSection === 'G' && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide border-b pb-1">AI Supplier Analysis</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Run an AI-powered analysis of this supplier based on current assessment data.
                  The analysis will evaluate quality performance, risk factors, and provide recommendations.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={runAiAnalysis}
                  disabled={aiLoading}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {aiLoading ? 'Analysing...' : 'Run AI Analysis'}
                </Button>
                {aiAnalysis && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">AI Analysis Result</h4>
                    <div className="text-sm text-blue-900 whitespace-pre-wrap">{aiAnalysis}</div>
                    <AIDisclosure variant="inline" provider="claude" analysisType="Supplier Assessment" confidence={0.85} />
                  </div>
                )}
              </>
            )}
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
