'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Modal } from '@ims/ui';
import {
  Award,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  Calendar,
  User,
  PenTool,
  Shield,
  XCircle,
  Globe } from 'lucide-react';

interface Declaration {
  id: string;
  title: string;
  version: string;
  status: string;
  scope?: string;
  statement?: string;
  exclusions?: string;
  preparedBy?: string;
  signedBy?: string;
  signatoryTitle?: string;
  signatoryOrg?: string;
  approvedBy?: string;
  approvedAt?: string;
  validFrom?: string;
  validTo?: string;
  standardsCovered?: string[];
  createdAt: string;
  updatedAt: string;
}

const statusOptions = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'EXPIRED'];

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: typeof Clock; label: string; dotColor: string }
> = {
  DRAFT: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    icon: Edit3,
    label: 'Draft',
    dotColor: 'bg-gray-400' },
  UNDER_REVIEW: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: Clock,
    label: 'Under Review',
    dotColor: 'bg-yellow-500' },
  APPROVED: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    icon: CheckCircle2,
    label: 'Approved',
    dotColor: 'bg-blue-500' },
  PUBLISHED: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    icon: Award,
    label: 'Published',
    dotColor: 'bg-green-500' },
  EXPIRED: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    icon: XCircle,
    label: 'Expired',
    dotColor: 'bg-red-500' } };

const workflowSteps = [
  { status: 'DRAFT', label: 'Draft' },
  { status: 'UNDER_REVIEW', label: 'Review' },
  { status: 'APPROVED', label: 'Approved' },
  { status: 'PUBLISHED', label: 'Published' },
];

const standardsOptions = [
  'ISO 42001:2023',
  'ISO/IEC 27001:2022',
  'ISO 9001:2015',
  'ISO 14001:2015',
  'EU AI Act',
  'NIST AI RMF',
];

export default function SelfDeclarationsPage() {
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDeclaration, setViewDeclaration] = useState<Declaration | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [printMode, setPrintMode] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    title: '',
    version: '1.0',
    status: 'DRAFT',
    scope: '',
    statement: '',
    exclusions: '',
    preparedBy: '',
    signedBy: '',
    signatoryTitle: '',
    signatoryOrg: '',
    validFrom: '',
    validTo: '',
    standardsCovered: ['ISO 42001:2023'] as string[] });

  useEffect(() => {
    loadDeclarations();
  }, []);

  async function loadDeclarations() {
    try {
      setError(null);
      const res = await api.get('/self-declarations');
      const data = (res.data.data || []).map((d: Declaration) => ({
        ...d,
        standardsCovered: d.standardsCovered || ['ISO 42001:2023'],
        signatoryTitle: d.signatoryTitle || '',
        signatoryOrg: d.signatoryOrg || '' }));
      setDeclarations(data);
    } catch (err) {
      console.error('Error loading declarations:', err);
      setError('Failed to load declarations.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingDeclaration(null);
    setForm({
      title: '',
      version: '1.0',
      status: 'DRAFT',
      scope: '',
      statement: '',
      exclusions: '',
      preparedBy: '',
      signedBy: '',
      signatoryTitle: '',
      signatoryOrg: '',
      validFrom: '',
      validTo: '',
      standardsCovered: ['ISO 42001:2023'] });
    setModalOpen(true);
  }

  function openEditModal(declaration: Declaration) {
    setEditingDeclaration(declaration);
    setForm({
      title: declaration.title,
      version: declaration.version,
      status: declaration.status,
      scope: declaration.scope || '',
      statement: declaration.statement || '',
      exclusions: declaration.exclusions || '',
      preparedBy: declaration.preparedBy || '',
      signedBy: declaration.signedBy || '',
      signatoryTitle: declaration.signatoryTitle || '',
      signatoryOrg: declaration.signatoryOrg || '',
      validFrom: declaration.validFrom ? declaration.validFrom.split('T')[0] : '',
      validTo: declaration.validTo ? declaration.validTo.split('T')[0] : '',
      standardsCovered: declaration.standardsCovered || ['ISO 42001:2023'] });
    setModalOpen(true);
  }

  function openViewModal(declaration: Declaration) {
    setViewDeclaration(declaration);
    setPrintMode(false);
    setViewModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingDeclaration) {
        await api.put(`/self-declarations/${editingDeclaration.id}`, form);
      } else {
        await api.post('/self-declarations', form);
      }
      setModalOpen(false);
      loadDeclarations();
    } catch (err) {
      console.error('Error saving declaration:', err);
      setError('Failed to save declaration.');
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const payload: Record<string, string> = { status: newStatus };
      if (newStatus === 'APPROVED') {
        payload.approvedBy = 'Current User';
      }
      await api.put(`/self-declarations/${id}`, payload);
      loadDeclarations();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this declaration?')) return;
    try {
      await api.delete(`/self-declarations/${id}`);
      loadDeclarations();
    } catch (err) {
      console.error('Error deleting declaration:', err);
      setError('Failed to delete declaration.');
    }
  }

  function handlePrint() {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 300);
  }

  function toggleStandard(std: string) {
    setForm((prev) => ({
      ...prev,
      standardsCovered: prev.standardsCovered.includes(std)
        ? prev.standardsCovered.filter((s) => s !== std)
        : [...prev.standardsCovered, std] }));
  }

  function getWorkflowStepIndex(status: string) {
    return workflowSteps.findIndex((s) => s.status === status);
  }

  function isExpired(d: Declaration): boolean {
    if (!d.validTo) return false;
    return new Date(d.validTo) < new Date();
  }

  function daysUntilExpiry(d: Declaration): number | null {
    if (!d.validTo) return null;
    const diff = new Date(d.validTo).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  }

  const filteredDeclarations = declarations.filter((d) => {
    if (filterStatus && d.status !== filterStatus) return false;
    return true;
  });

  const publishedCount = declarations.filter((d) => d.status === 'PUBLISHED').length;
  const _draftCount = declarations.filter((d) => d.status === 'DRAFT').length;
  const expiredCount = declarations.filter((d) => d.status === 'EXPIRED' || isExpired(d)).length;
  const expiringCount = declarations.filter((d) => {
    const days = daysUntilExpiry(d);
    return days !== null && days > 0 && days <= 30;
  }).length;

  if (loading) {
    return (
      <div className="p-8 bg-background min-h-screen">
        <div className="animate-pulse space-y-4 max-w-7xl mx-auto">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Self-Declarations</h1>
            <p className="text-muted-foreground mt-1">
              ISO 42001 conformance self-declarations with print-ready formatting and status
              tracking
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Declaration
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{declarations.length}</div>
                <div className="text-xs text-muted-foreground">Total Declarations</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{publishedCount}</div>
                <div className="text-xs text-muted-foreground">Published</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{expiringCount}</div>
                <div className="text-xs text-muted-foreground">Expiring Soon</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{expiredCount}</div>
                <div className="text-xs text-muted-foreground">Expired</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <div className="flex gap-1 bg-card border border-border rounded-lg p-0.5">
            <button
              onClick={() => setFilterStatus('')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                !filterStatus
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            {statusOptions.map((s) => {
              const sc = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    filterStatus === s
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${sc.dotColor}`} />
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Declarations Cards */}
        {filteredDeclarations.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No self-declarations found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new declaration to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDeclarations.map((declaration) => {
              const sc = statusConfig[declaration.status] || statusConfig.DRAFT;
              const StatusIcon = sc.icon;
              const expired = isExpired(declaration);
              const daysLeft = daysUntilExpiry(declaration);
              const expiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

              return (
                <div
                  key={declaration.id}
                  className={`bg-card rounded-xl border ${expired ? 'border-red-300 dark:border-red-800' : expiringSoon ? 'border-yellow-300 dark:border-yellow-800' : 'border-border'} hover:shadow-md transition-shadow`}
                >
                  <div className="p-5">
                    {/* Title row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`h-10 w-10 rounded-lg ${sc.bg} flex items-center justify-center shrink-0`}
                        >
                          <StatusIcon className={`h-5 w-5 ${sc.text}`} />
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => openViewModal(declaration)}
                            className="text-lg font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                          >
                            {declaration.title}
                          </button>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${sc.bg} ${sc.text}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {sc.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              v{declaration.version}
                            </span>
                            {expired && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                <XCircle className="h-3 w-3" />
                                Expired
                              </span>
                            )}
                            {expiringSoon && !expired && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                <AlertTriangle className="h-3 w-3" />
                                {daysLeft}d left
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scope preview */}
                    {declaration.scope && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {declaration.scope}
                      </p>
                    )}

                    {/* Standards covered */}
                    {declaration.standardsCovered && declaration.standardsCovered.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {declaration.standardsCovered.map((std) => (
                          <span
                            key={std}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 rounded"
                          >
                            <Shield className="h-2.5 w-2.5" />
                            {std}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Signatory info */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-3">
                      {declaration.preparedBy && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Prepared: {declaration.preparedBy}</span>
                        </div>
                      )}
                      {declaration.signedBy && (
                        <div className="flex items-center gap-1.5">
                          <PenTool className="h-3.5 w-3.5" />
                          <span>Signed: {declaration.signedBy}</span>
                        </div>
                      )}
                      {declaration.validFrom && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Date(declaration.validFrom).toLocaleDateString()} -{' '}
                            {declaration.validTo
                              ? new Date(declaration.validTo).toLocaleDateString()
                              : 'Ongoing'}
                          </span>
                        </div>
                      )}
                      {declaration.approvedBy && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          <span>Approved: {declaration.approvedBy}</span>
                        </div>
                      )}
                    </div>

                    {/* Workflow mini tracker */}
                    <div className="flex items-center gap-1 mb-4">
                      {workflowSteps.map((step, idx) => {
                        const currentIdx = getWorkflowStepIndex(declaration.status);
                        const isCompleted = idx <= currentIdx;
                        return (
                          <div key={step.status} className="flex items-center flex-1">
                            <div
                              className={`h-1.5 flex-1 rounded-full ${isCompleted ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 border-t border-border pt-3">
                      <button
                        onClick={() => openViewModal(declaration)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(declaration)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      {declaration.status === 'DRAFT' && (
                        <button
                          onClick={() => handleStatusChange(declaration.id, 'UNDER_REVIEW')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-600 hover:text-yellow-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Submit
                        </button>
                      )}
                      {declaration.status === 'UNDER_REVIEW' && (
                        <button
                          onClick={() => handleStatusChange(declaration.id, 'APPROVED')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      )}
                      {declaration.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusChange(declaration.id, 'PUBLISHED')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          Publish
                        </button>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={() => handleDelete(declaration.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View / Print Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Self-Declaration of Conformance"
        size="lg"
      >
        {viewDeclaration && (
          <div ref={printRef}>
            {/* Print-ready header */}
            <div className={`${printMode ? 'border-2 border-gray-900 p-8' : ''}`}>
              <div className="text-center mb-6 border-b-2 border-indigo-500 pb-4">
                <h2 className="text-xl font-bold text-foreground">
                  SELF-DECLARATION OF CONFORMANCE
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  In accordance with ISO 42001:2023 -- AI Management System
                </p>
              </div>

              {/* Meta badges */}
              <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
                {(() => {
                  const sc = statusConfig[viewDeclaration.status] || statusConfig.DRAFT;
                  return (
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${sc.bg} ${sc.text}`}
                    >
                      {sc.label}
                    </span>
                  );
                })()}
                <span className="text-sm text-muted-foreground">
                  Version {viewDeclaration.version}
                </span>
                {viewDeclaration.validFrom && (
                  <span className="text-xs text-muted-foreground">
                    Valid: {new Date(viewDeclaration.validFrom).toLocaleDateString()} -{' '}
                    {viewDeclaration.validTo
                      ? new Date(viewDeclaration.validTo).toLocaleDateString()
                      : 'Ongoing'}
                  </span>
                )}
              </div>

              {/* Standards covered */}
              {viewDeclaration.standardsCovered && viewDeclaration.standardsCovered.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Standards Covered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewDeclaration.standardsCovered.map((std) => (
                      <span
                        key={std}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800"
                      >
                        <Shield className="h-3 w-3" />
                        {std}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scope */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Scope of Declaration
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {viewDeclaration.scope || 'No scope defined.'}
                  </p>
                </div>
              </div>

              {/* Statement of Conformance */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Statement of Conformance
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {viewDeclaration.statement || 'No conformance statement defined.'}
                  </p>
                </div>
              </div>

              {/* Exclusions */}
              {viewDeclaration.exclusions && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Exclusions
                  </h3>
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {viewDeclaration.exclusions}
                    </p>
                  </div>
                </div>
              )}

              {/* Signatory block */}
              <div className="border-t-2 border-border pt-6 mt-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Authorised Signatory
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Prepared By</p>
                      <p className="text-sm font-medium text-foreground">
                        {viewDeclaration.preparedBy || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Signed By</p>
                      <p className="text-sm font-medium text-foreground">
                        {viewDeclaration.signedBy || '-'}
                      </p>
                    </div>
                    {viewDeclaration.signatoryTitle && (
                      <div>
                        <p className="text-xs text-muted-foreground">Title</p>
                        <p className="text-sm text-foreground">{viewDeclaration.signatoryTitle}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {viewDeclaration.signatoryOrg && (
                      <div>
                        <p className="text-xs text-muted-foreground">Organisation</p>
                        <p className="text-sm text-foreground">{viewDeclaration.signatoryOrg}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Approved By</p>
                      <p className="text-sm font-medium text-foreground">
                        {viewDeclaration.approvedBy || '-'}
                      </p>
                    </div>
                    {viewDeclaration.approvedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground">Approval Date</p>
                        <p className="text-sm text-foreground">
                          {new Date(viewDeclaration.approvedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signature line */}
                <div className="mt-8 pt-4">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="border-b border-gray-400 dark:border-gray-600 mb-1 h-8" />
                      <p className="text-xs text-muted-foreground">Signature</p>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 dark:border-gray-600 mb-1 h-8" />
                      <p className="text-xs text-muted-foreground">Date</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 text-sm"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  openEditModal(viewDeclaration);
                }}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDeclaration ? 'Edit Declaration' : 'New Declaration'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Declaration Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="e.g. ISO 42001 Conformance Self-Declaration 2026"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Version</label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s]?.label || s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prepared By</label>
              <input
                type="text"
                value={form.preparedBy}
                onChange={(e) => setForm({ ...form, preparedBy: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Standards covered */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Standards Covered
            </label>
            <div className="flex flex-wrap gap-2">
              {standardsOptions.map((std) => (
                <button
                  key={std}
                  type="button"
                  onClick={() => toggleStandard(std)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    form.standardsCovered.includes(std)
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700'
                      : 'bg-card text-muted-foreground border-border hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  {form.standardsCovered.includes(std) && <CheckCircle2 className="h-3 w-3" />}
                  {std}
                </button>
              ))}
            </div>
          </div>

          {/* Signatory info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Signed By</label>
              <input
                type="text"
                value={form.signedBy}
                onChange={(e) => setForm({ ...form, signedBy: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Name of signatory"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Signatory Title
              </label>
              <input
                type="text"
                value={form.signatoryTitle}
                onChange={(e) => setForm({ ...form, signatoryTitle: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Chief Technology Officer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Organisation</label>
            <input
              type="text"
              value={form.signatoryOrg}
              onChange={(e) => setForm({ ...form, signatoryOrg: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Organisation name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Scope</label>
            <textarea
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Scope of the AI management system covered by this declaration..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Statement of Conformance
            </label>
            <textarea
              value={form.statement}
              onChange={(e) => setForm({ ...form, statement: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="We hereby declare that our AI management system conforms to the requirements of ISO 42001:2023..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Exclusions</label>
            <textarea
              value={form.exclusions}
              onChange={(e) => setForm({ ...form, exclusions: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Any clauses or controls excluded from the scope (if applicable)..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Valid To</label>
              <input
                type="date"
                value={form.validTo}
                onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {editingDeclaration ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
