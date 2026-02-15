'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Modal } from '@ims/ui';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Send,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Clock,
  Users,
  UserCheck,
  AlertTriangle,
  Shield,
  Lock,
  Scale,
  Search,
  GitBranch,
  History,
  X,
} from 'lucide-react';

interface Policy {
  id: string;
  title: string;
  description?: string;
  policyType: string;
  status: string;
  version: string;
  approvedBy?: string;
  approvedAt?: string;
  content?: string;
  sections?: PolicySections;
  acknowledgements?: Acknowledgement[];
  versionHistory?: VersionEntry[];
  createdAt: string;
  updatedAt: string;
}

interface PolicySections {
  statement: string;
  scope: string;
  approvedUses: string;
  prohibitedUses: string;
  dataGovernance: string;
  oversightRules: string;
  incidentProcedure: string;
  reviewSchedule: string;
}

interface Acknowledgement {
  userId: string;
  userName: string;
  role: string;
  acknowledgedAt: string | null;
}

interface VersionEntry {
  version: string;
  changedBy: string;
  changedAt: string;
  summary: string;
}

const emptySections: PolicySections = {
  statement: '',
  scope: '',
  approvedUses: '',
  prohibitedUses: '',
  dataGovernance: '',
  oversightRules: '',
  incidentProcedure: '',
  reviewSchedule: '',
};

const sectionMeta: { key: keyof PolicySections; label: string; icon: typeof FileText; placeholder: string }[] = [
  { key: 'statement', label: 'Policy Statement', icon: FileText, placeholder: 'Define the organisation\'s commitment to responsible AI development and deployment in accordance with ISO 42001:2023...' },
  { key: 'scope', label: 'Scope', icon: Search, placeholder: 'Define which AI systems, processes, and organisational units this policy covers...' },
  { key: 'approvedUses', label: 'Approved Uses', icon: CheckCircle2, placeholder: 'List approved use cases: document classification, risk scoring, anomaly detection, predictive analytics...' },
  { key: 'prohibitedUses', label: 'Prohibited Uses', icon: AlertTriangle, placeholder: 'List prohibited applications: autonomous decision-making without human oversight, social scoring, mass surveillance...' },
  { key: 'dataGovernance', label: 'Data Governance', icon: Lock, placeholder: 'Define data quality requirements, retention periods, consent management, anonymisation standards...' },
  { key: 'oversightRules', label: 'Human Oversight Rules', icon: Users, placeholder: 'Specify human-in-the-loop requirements, escalation thresholds, review frequencies, override procedures...' },
  { key: 'incidentProcedure', label: 'Incident Procedure', icon: Shield, placeholder: 'Define AI incident reporting process: detection, classification, investigation, remediation, communication...' },
  { key: 'reviewSchedule', label: 'Review Schedule', icon: Clock, placeholder: 'Specify review frequency (e.g. quarterly), review board membership, criteria for ad-hoc reviews...' },
];

const policyTypeOptions = [
  'AI_ETHICS', 'AI_GOVERNANCE', 'HUMAN_OVERSIGHT', 'DATA_GOVERNANCE',
  'TRANSPARENCY', 'RISK_MANAGEMENT', 'SECURITY', 'PRIVACY', 'OTHER',
];

const policyTypeLabels: Record<string, string> = {
  AI_ETHICS: 'AI Ethics', AI_GOVERNANCE: 'AI Governance', HUMAN_OVERSIGHT: 'Human Oversight',
  DATA_GOVERNANCE: 'Data Governance', TRANSPARENCY: 'Transparency', RISK_MANAGEMENT: 'Risk Management',
  SECURITY: 'Security', PRIVACY: 'Privacy', OTHER: 'Other',
};

const policyTypeColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  AI_ETHICS: { bg: 'bg-purple-100', text: 'text-purple-700', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-300' },
  AI_GOVERNANCE: { bg: 'bg-indigo-100', text: 'text-indigo-700', darkBg: 'dark:bg-indigo-900/30', darkText: 'dark:text-indigo-300' },
  HUMAN_OVERSIGHT: { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-300' },
  DATA_GOVERNANCE: { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'dark:bg-emerald-900/30', darkText: 'dark:text-emerald-300' },
  TRANSPARENCY: { bg: 'bg-cyan-100', text: 'text-cyan-700', darkBg: 'dark:bg-cyan-900/30', darkText: 'dark:text-cyan-300' },
  RISK_MANAGEMENT: { bg: 'bg-red-100', text: 'text-red-700', darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-300' },
  SECURITY: { bg: 'bg-orange-100', text: 'text-orange-700', darkBg: 'dark:bg-orange-900/30', darkText: 'dark:text-orange-300' },
  PRIVACY: { bg: 'bg-pink-100', text: 'text-pink-700', darkBg: 'dark:bg-pink-900/30', darkText: 'dark:text-pink-300' },
  OTHER: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', darkBg: 'dark:bg-gray-700', darkText: 'dark:text-gray-300' },
};

const statusOptions = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:text-gray-300',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  APPROVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  ARCHIVED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const workflowSteps = [
  { status: 'DRAFT', label: 'Draft', description: 'Initial draft being prepared' },
  { status: 'UNDER_REVIEW', label: 'Under Review', description: 'Submitted for stakeholder review' },
  { status: 'APPROVED', label: 'Approved', description: 'Approved by designated authority' },
  { status: 'PUBLISHED', label: 'Published', description: 'Published and in effect' },
];

// Mock acknowledgement data for demo
function mockAcknowledgements(): Acknowledgement[] {
  return [
    { userId: '1', userName: 'Sarah Chen', role: 'AI Governance Lead', acknowledgedAt: '2026-02-10T09:30:00Z' },
    { userId: '2', userName: 'James Mitchell', role: 'CTO', acknowledgedAt: '2026-02-11T14:15:00Z' },
    { userId: '3', userName: 'Priya Patel', role: 'Data Protection Officer', acknowledgedAt: '2026-02-12T11:00:00Z' },
    { userId: '4', userName: 'Marcus Johnson', role: 'ML Engineering Lead', acknowledgedAt: null },
    { userId: '5', userName: 'Elena Rodriguez', role: 'Legal Counsel', acknowledgedAt: null },
    { userId: '6', userName: 'David Kim', role: 'Risk Manager', acknowledgedAt: '2026-02-13T08:45:00Z' },
  ];
}

function mockVersionHistory(currentVersion: string): VersionEntry[] {
  const [major, minor] = currentVersion.split('.').map(Number);
  const entries: VersionEntry[] = [];
  for (let mj = 1; mj <= major; mj++) {
    const maxMinor = mj === major ? minor : 2;
    for (let mn = 0; mn <= maxMinor; mn++) {
      entries.push({
        version: `${mj}.${mn}`,
        changedBy: ['Sarah Chen', 'James Mitchell', 'Priya Patel'][entries.length % 3],
        changedAt: new Date(Date.now() - (entries.length * 7 * 86400000)).toISOString(),
        summary: mn === 0
          ? `Major revision ${mj}.0 - restructured policy sections`
          : `Minor update ${mj}.${mn} - clarifications and corrections`,
      });
    }
  }
  return entries.reverse();
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPolicy, setViewPolicy] = useState<Policy | null>(null);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeSection, setActiveSection] = useState(0);
  const [viewTab, setViewTab] = useState<'sections' | 'workflow' | 'acknowledgements' | 'history'>('sections');

  const [form, setForm] = useState({
    title: '',
    description: '',
    policyType: 'AI_GOVERNANCE',
    status: 'DRAFT',
    version: '1.0',
    content: '',
    sections: { ...emptySections },
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  async function loadPolicies() {
    try {
      setError(null);
      const res = await api.get('/policies');
      const data = (res.data.data || []).map((p: Policy) => ({
        ...p,
        sections: p.sections || { ...emptySections },
        acknowledgements: mockAcknowledgements(),
        versionHistory: mockVersionHistory(p.version || '1.0'),
      }));
      setPolicies(data);
    } catch (err) {
      console.error('Error loading policies:', err);
      setError('Failed to load policies.');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingPolicy(null);
    setForm({
      title: '', description: '', policyType: 'AI_GOVERNANCE', status: 'DRAFT',
      version: '1.0', content: '',
      sections: { ...emptySections },
    });
    setActiveSection(0);
    setModalOpen(true);
  }

  function openEditModal(policy: Policy) {
    setEditingPolicy(policy);
    setForm({
      title: policy.title,
      description: policy.description || '',
      policyType: policy.policyType,
      status: policy.status,
      version: policy.version,
      content: policy.content || '',
      sections: policy.sections || { ...emptySections },
    });
    setActiveSection(0);
    setModalOpen(true);
  }

  function openViewModal(policy: Policy) {
    setViewPolicy(policy);
    setViewTab('sections');
    setViewModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        content: JSON.stringify(form.sections),
      };
      if (editingPolicy) {
        await api.put(`/policies/${editingPolicy.id}`, payload);
      } else {
        await api.post('/policies', payload);
      }
      setModalOpen(false);
      loadPolicies();
    } catch (err) {
      console.error('Error saving policy:', err);
      setError('Failed to save policy.');
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const payload: Record<string, string> = { status: newStatus };
      if (newStatus === 'APPROVED') {
        payload.approvedBy = 'Current User';
      }
      await api.put(`/policies/${id}`, payload);
      loadPolicies();
    } catch (err) {
      console.error('Error updating policy status:', err);
      setError('Failed to update policy status.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.delete(`/policies/${id}`);
      loadPolicies();
    } catch (err) {
      console.error('Error deleting policy:', err);
      setError('Failed to delete policy.');
    }
  }

  function bumpVersion(currentVersion: string, type: 'major' | 'minor'): string {
    const [major, minor] = currentVersion.split('.').map(Number);
    if (type === 'major') return `${major + 1}.0`;
    return `${major}.${minor + 1}`;
  }

  function getWorkflowStepIndex(status: string) {
    return workflowSteps.findIndex((s) => s.status === status);
  }

  const filteredPolicies = policies.filter((p) => {
    if (filterType && p.policyType !== filterType) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const publishedCount = policies.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = policies.filter((p) => p.status === 'DRAFT').length;
  const reviewCount = policies.filter((p) => p.status === 'UNDER_REVIEW').length;
  const completionPct = policies.length > 0
    ? Math.round((policies.filter((p) => p.status === 'PUBLISHED' || p.status === 'APPROVED').length / policies.length) * 100)
    : 0;

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
            <h1 className="text-3xl font-bold text-foreground">AI Governance Policies</h1>
            <p className="text-muted-foreground mt-1">ISO 42001:2023 -- 8-section structured policies with version control and acknowledgement tracking</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Policy
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
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{policies.length}</div>
                <div className="text-xs text-muted-foreground">Total Policies</div>
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
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{reviewCount}</div>
                <div className="text-xs text-muted-foreground">Under Review</div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{completionPct}%</div>
                <div className="text-xs text-muted-foreground">Approved/Published</div>
              </div>
            </div>
            {/* Mini progress bar */}
            <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Types</option>
            {policyTypeOptions.map((p) => (
              <option key={p} value={p}>{policyTypeLabels[p]}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {(filterType || filterStatus) && (
            <button
              onClick={() => { setFilterType(''); setFilterStatus(''); }}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Policies Cards */}
        {filteredPolicies.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No policies found</p>
            <p className="text-sm text-muted-foreground mt-1">Create a new policy to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPolicies.map((policy) => {
              const tc = policyTypeColors[policy.policyType] || policyTypeColors.OTHER;
              const acks = policy.acknowledgements || [];
              const ackCount = acks.filter((a) => a.acknowledgedAt).length;
              const totalAck = acks.length;
              const sectionsFilled = policy.sections
                ? Object.values(policy.sections).filter((v) => v && v.trim().length > 0).length
                : 0;

              return (
                <div
                  key={policy.id}
                  className="bg-card rounded-xl border border-border hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`h-10 w-10 rounded-lg ${tc.bg} ${tc.darkBg} flex items-center justify-center shrink-0`}>
                          <FileText className={`h-5 w-5 ${tc.text} ${tc.darkText}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <button
                              onClick={() => openViewModal(policy)}
                              className="text-lg font-semibold text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left truncate"
                            >
                              {policy.title}
                            </button>
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${tc.bg} ${tc.text} ${tc.darkBg} ${tc.darkText}`}>
                              {policyTypeLabels[policy.policyType]}
                            </span>
                            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[policy.status]}`}>
                              {policy.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {policy.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-2xl">{policy.description}</p>
                          )}
                          <div className="flex items-center gap-5 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <GitBranch className="h-3.5 w-3.5" />
                              v{policy.version}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              {sectionsFilled}/8 sections
                            </span>
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5" />
                              {ackCount}/{totalAck} acknowledged
                            </span>
                            {policy.approvedBy && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                Approved by {policy.approvedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <button
                          onClick={() => openViewModal(policy)}
                          className="p-2 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(policy)}
                          className="p-2 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {policy.status === 'DRAFT' && (
                          <button
                            onClick={() => handleStatusChange(policy.id, 'UNDER_REVIEW')}
                            className="p-2 text-yellow-600 hover:text-yellow-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                            title="Submit for Review"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {policy.status === 'UNDER_REVIEW' && (
                          <button
                            onClick={() => handleStatusChange(policy.id, 'APPROVED')}
                            className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Approve"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {policy.status === 'APPROVED' && (
                          <button
                            onClick={() => handleStatusChange(policy.id, 'PUBLISHED')}
                            className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Publish"
                          >
                            <BookOpen className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(policy.id)}
                          className="p-2 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Section completeness bar */}
                    <div className="mt-3 flex gap-1">
                      {sectionMeta.map((sec, idx) => {
                        const filled = policy.sections && policy.sections[sec.key] && policy.sections[sec.key].trim().length > 0;
                        return (
                          <div
                            key={sec.key}
                            className={`flex-1 h-1.5 rounded-full ${filled ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                            title={`${sec.label}: ${filled ? 'Complete' : 'Empty'}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Policy Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={viewPolicy?.title || 'Policy Details'} size="lg">
        {viewPolicy && (
          <div className="space-y-4">
            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap">
              {(() => {
                const tc = policyTypeColors[viewPolicy.policyType] || policyTypeColors.OTHER;
                return (
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${tc.bg} ${tc.text} ${tc.darkBg} ${tc.darkText}`}>
                    {policyTypeLabels[viewPolicy.policyType]}
                  </span>
                );
              })()}
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[viewPolicy.status]}`}>
                {viewPolicy.status.replace(/_/g, ' ')}
              </span>
              <span className="text-sm text-muted-foreground">v{viewPolicy.version}</span>
              {viewPolicy.approvedBy && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approved by {viewPolicy.approvedBy}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {(['sections', 'workflow', 'acknowledgements', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    viewTab === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'sections' ? 'Sections' : tab === 'workflow' ? 'Workflow' : tab === 'acknowledgements' ? 'Acknowledgements' : 'Version History'}
                </button>
              ))}
            </div>

            {/* Sections tab */}
            {viewTab === 'sections' && (
              <div className="space-y-3">
                {sectionMeta.map((sec) => {
                  const Icon = sec.icon;
                  const content = viewPolicy.sections?.[sec.key];
                  return (
                    <div key={sec.key} className="border border-border rounded-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50">
                        <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                        <span className="text-sm font-medium text-foreground">{sec.label}</span>
                        {content && content.trim() ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-auto" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 ml-auto" />
                        )}
                      </div>
                      <div className="px-4 py-3">
                        {content && content.trim() ? (
                          <p className="text-sm text-foreground whitespace-pre-wrap">{content}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No content defined for this section.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Workflow tab */}
            {viewTab === 'workflow' && (
              <div className="py-4">
                <div className="flex items-center">
                  {workflowSteps.map((step, idx) => {
                    const currentIdx = getWorkflowStepIndex(viewPolicy.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step.status} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                              isCompleted
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-muted-foreground'
                            } ${isCurrent ? 'ring-2 ring-indigo-300 dark:ring-indigo-700' : ''}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <p className={`text-xs mt-2 text-center font-medium ${isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground text-center mt-0.5">{step.description}</p>
                        </div>
                        {idx < workflowSteps.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-2 ${idx < currentIdx ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Acknowledgements tab */}
            {viewTab === 'acknowledgements' && (
              <div className="space-y-3">
                {(() => {
                  const acks = viewPolicy.acknowledgements || [];
                  const ackDone = acks.filter((a) => a.acknowledgedAt).length;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{ackDone}/{acks.length} acknowledged</span>
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${acks.length > 0 ? (ackDone / acks.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Role</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {acks.map((ack) => (
                              <tr key={ack.userId}>
                                <td className="px-4 py-2.5 text-foreground font-medium">{ack.userName}</td>
                                <td className="px-4 py-2.5 text-muted-foreground">{ack.role}</td>
                                <td className="px-4 py-2.5">
                                  {ack.acknowledgedAt ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Acknowledged
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                      <Clock className="h-3.5 w-3.5" />
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                  {ack.acknowledgedAt ? new Date(ack.acknowledgedAt).toLocaleDateString() : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Version History tab */}
            {viewTab === 'history' && (
              <div className="space-y-3">
                {(viewPolicy.versionHistory || []).map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        idx === 0 ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <History className={`h-3.5 w-3.5 ${idx === 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`} />
                      </div>
                      {idx < (viewPolicy.versionHistory || []).length - 1 && (
                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">v{entry.version}</span>
                        {idx === 0 && (
                          <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.summary}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.changedBy} -- {new Date(entry.changedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  openEditModal(viewPolicy);
                }}
                className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 text-sm"
              >
                Edit Policy
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

      {/* Create/Edit Modal with 8 sections */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPolicy ? 'Edit Policy' : 'New Policy'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              placeholder="e.g. AI Governance Policy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief summary of this policy's purpose"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type</label>
              <select
                value={form.policyType}
                onChange={(e) => setForm({ ...form, policyType: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {policyTypeOptions.map((p) => (
                  <option key={p} value={p}>{policyTypeLabels[p]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Version</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  className="flex-1 px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {editingPolicy && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, version: bumpVersion(form.version, 'minor') })}
                      className="px-2 py-1 text-[10px] bg-gray-100 dark:bg-gray-700 text-muted-foreground rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Bump minor version"
                    >
                      +0.1
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, version: bumpVersion(form.version, 'major') })}
                      className="px-2 py-1 text-[10px] bg-gray-100 dark:bg-gray-700 text-muted-foreground rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Bump major version"
                    >
                      +1.0
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 8-section editor */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Policy Sections (8)</h3>
            </div>
            {/* Section tabs */}
            <div className="flex overflow-x-auto border-b border-border bg-gray-50 dark:bg-gray-800/30">
              {sectionMeta.map((sec, idx) => {
                const filled = form.sections[sec.key] && form.sections[sec.key].trim().length > 0;
                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => setActiveSection(idx)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeSection === idx
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filled && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                    {sec.label}
                  </button>
                );
              })}
            </div>
            {/* Active section editor */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = sectionMeta[activeSection].icon;
                  return <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />;
                })()}
                <span className="text-sm font-medium text-foreground">{sectionMeta[activeSection].label}</span>
              </div>
              <textarea
                value={form.sections[sectionMeta[activeSection].key]}
                onChange={(e) => {
                  const key = sectionMeta[activeSection].key;
                  setForm({
                    ...form,
                    sections: { ...form.sections, [key]: e.target.value },
                  });
                }}
                className="w-full px-3 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={6}
                placeholder={sectionMeta[activeSection].placeholder}
              />
              {/* Section nav buttons */}
              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  disabled={activeSection === 0}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  Previous Section
                </button>
                <span className="text-xs text-muted-foreground">{activeSection + 1} / 8</span>
                <button
                  type="button"
                  onClick={() => setActiveSection(Math.min(7, activeSection + 1))}
                  disabled={activeSection === 7}
                  className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  Next Section
                </button>
              </div>
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
              {editingPolicy ? 'Update Policy' : 'Create Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
