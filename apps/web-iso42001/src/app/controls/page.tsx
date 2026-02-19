'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@ims/ui';
import { api } from '@/lib/api';
import {
  Shield,
  CheckCircle2,
  Clock,
  MinusCircle,
  Ban,
  Filter,
  FileText,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Control {
  id: string;
  code: string;
  title: string;
  description?: string;
  domain: string;
  status: string;
  implementationNotes?: string;
  evidence?: string;
  owner?: string;
  targetDate?: string;
  reviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Annex A Controls (39 controls)                                     */
/* ------------------------------------------------------------------ */

const annexAControls = [
  {
    code: 'A.2',
    domain: 'AI_GOVERNANCE',
    label: 'Policies for AI',
    controls: [
      {
        code: 'A.2.2',
        title: 'AI Policy',
        description:
          "Establish and maintain an AI policy aligned with the organisation's objectives",
      },
      {
        code: 'A.2.3',
        title: 'Roles and Responsibilities',
        description: 'Define and communicate AI-related roles, responsibilities and authorities',
      },
      {
        code: 'A.2.4',
        title: 'Internal Audit',
        description: 'Plan and conduct internal audits of the AI management system',
      },
    ],
  },
  {
    code: 'A.3',
    domain: 'AI_GOVERNANCE',
    label: 'Internal Organisation',
    controls: [
      {
        code: 'A.3.2',
        title: 'AI System Life Cycle',
        description: 'Establish processes for each stage of the AI system life cycle',
      },
      {
        code: 'A.3.3',
        title: 'Third-party and Customer Relationships',
        description: 'Manage third-party and customer interactions involving AI systems',
      },
      {
        code: 'A.3.4',
        title: 'AI System Inventory',
        description: 'Maintain an inventory of AI systems including their risk classifications',
      },
      {
        code: 'A.3.5',
        title: 'Management Review of AI',
        description: 'Conduct management reviews of AI management system performance',
      },
    ],
  },
  {
    code: 'A.4',
    domain: 'AI_RESOURCES',
    label: 'Resources for AI Systems',
    controls: [
      {
        code: 'A.4.2',
        title: 'Data Resources',
        description: 'Identify and manage data resources needed for AI systems',
      },
      {
        code: 'A.4.3',
        title: 'Tooling',
        description: 'Determine and provide tools for AI system development and operation',
      },
      {
        code: 'A.4.4',
        title: 'System and Computing Resources',
        description: 'Provide computing infrastructure for AI systems',
      },
      {
        code: 'A.4.5',
        title: 'Human Resources',
        description: 'Ensure competence of personnel involved in AI systems',
      },
      {
        code: 'A.4.6',
        title: 'Awareness and Training',
        description: 'Ensure AI-specific awareness and training programmes',
      },
    ],
  },
  {
    code: 'A.5',
    domain: 'AI_RISK',
    label: 'Assessing AI Impacts',
    controls: [
      {
        code: 'A.5.2',
        title: 'AI Impact Assessment Process',
        description: 'Establish a process for conducting AI impact assessments',
      },
      {
        code: 'A.5.3',
        title: 'Documentation of AI Impact Assessment',
        description: 'Document and maintain records of AI impact assessments',
      },
      {
        code: 'A.5.4',
        title: 'AI Risk Assessment',
        description: 'Assess risks associated with AI systems systematically',
      },
      {
        code: 'A.5.5',
        title: 'AI Risk Treatment',
        description: 'Determine and implement AI risk treatment options',
      },
    ],
  },
  {
    code: 'A.6',
    domain: 'AI_DEVELOPMENT',
    label: 'AI System Life Cycle',
    controls: [
      {
        code: 'A.6.2.2',
        title: 'AI System Design and Development',
        description: 'Implement controls for AI system design and development activities',
      },
      {
        code: 'A.6.2.3',
        title: 'AI System Data',
        description: 'Manage data used in AI system development ensuring quality and governance',
      },
      {
        code: 'A.6.2.4',
        title: 'AI System Testing',
        description: 'Test and validate AI systems before deployment',
      },
      {
        code: 'A.6.2.5',
        title: 'AI System Operation',
        description: 'Implement operational controls for deployed AI systems',
      },
      {
        code: 'A.6.2.6',
        title: 'AI System Retirement',
        description: 'Plan and manage the retirement and decommissioning of AI systems',
      },
      {
        code: 'A.6.2.7',
        title: 'AI System Documentation',
        description: 'Maintain comprehensive documentation for AI systems',
      },
      {
        code: 'A.6.2.8',
        title: 'AI Model Performance',
        description: 'Monitor and evaluate AI model performance continuously',
      },
    ],
  },
  {
    code: 'A.7',
    domain: 'AI_DATA',
    label: 'Data for AI Systems',
    controls: [
      {
        code: 'A.7.2',
        title: 'Data Provenance',
        description: 'Track and maintain records of data origin, lineage and transformations',
      },
      {
        code: 'A.7.3',
        title: 'Data Quality for AI',
        description: 'Ensure data quality standards for training, testing and inference data',
      },
      {
        code: 'A.7.4',
        title: 'Data Preparation',
        description: 'Control data preprocessing, transformation and augmentation processes',
      },
      {
        code: 'A.7.5',
        title: 'Data Privacy and Protection',
        description: 'Implement privacy controls for data used in AI systems',
      },
    ],
  },
  {
    code: 'A.8',
    domain: 'AI_RESPONSIBLE',
    label: 'Responsible AI',
    controls: [
      {
        code: 'A.8.2',
        title: 'Transparency',
        description:
          'Provide appropriate transparency about AI system capabilities and limitations',
      },
      {
        code: 'A.8.3',
        title: 'Explainability',
        description: 'Enable explanation of AI decisions to relevant stakeholders',
      },
      {
        code: 'A.8.4',
        title: 'Bias and Fairness',
        description: 'Detect, measure and mitigate bias in AI systems',
      },
      {
        code: 'A.8.5',
        title: 'Human Oversight',
        description: 'Implement human oversight mechanisms for AI decisions',
      },
      {
        code: 'A.8.6',
        title: 'Accountability',
        description: 'Establish accountability mechanisms for AI system outcomes',
      },
    ],
  },
  {
    code: 'A.9',
    domain: 'AI_THIRD_PARTY',
    label: 'Third-party & Customer',
    controls: [
      {
        code: 'A.9.2',
        title: 'AI Use Guidance',
        description: "Provide guidance to third parties using the organisation's AI systems",
      },
      {
        code: 'A.9.3',
        title: 'Monitoring of Third-Party Use',
        description: "Monitor how third parties use the organisation's AI systems",
      },
      {
        code: 'A.9.4',
        title: 'Supply Chain AI Governance',
        description: 'Govern AI components and services in the supply chain',
      },
    ],
  },
  {
    code: 'A.10',
    domain: 'AI_IMPROVEMENT',
    label: 'AI System Events',
    controls: [
      {
        code: 'A.10.2',
        title: 'AI Event and Incident Response',
        description: 'Establish procedures to respond to AI events and incidents',
      },
      {
        code: 'A.10.3',
        title: 'Learning from AI Events',
        description: 'Analyze AI events to improve systems and prevent recurrence',
      },
      {
        code: 'A.10.4',
        title: 'AI Incident Communication',
        description: 'Communicate AI incidents to relevant stakeholders promptly',
      },
      {
        code: 'A.10.5',
        title: 'Continual Improvement',
        description: 'Implement processes for continual improvement of AI management system',
      },
    ],
  },
];

const domainLabels: Record<string, string> = {
  AI_GOVERNANCE: 'AI Governance',
  AI_RESOURCES: 'AI Resources',
  AI_RISK: 'AI Risk',
  AI_DEVELOPMENT: 'AI Development',
  AI_DATA: 'AI Data',
  AI_RESPONSIBLE: 'Responsible AI',
  AI_THIRD_PARTY: 'Third-party',
  AI_IMPROVEMENT: 'Improvement',
};

const domainColors: Record<
  string,
  { bg: string; text: string; border: string; darkBg: string; darkText: string }
> = {
  AI_GOVERNANCE: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    darkBg: 'dark:bg-indigo-900/20',
    darkText: 'dark:text-indigo-400',
  },
  AI_RESOURCES: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    darkBg: 'dark:bg-violet-900/20',
    darkText: 'dark:text-violet-400',
  },
  AI_RISK: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    darkBg: 'dark:bg-red-900/20',
    darkText: 'dark:text-red-400',
  },
  AI_DEVELOPMENT: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    darkBg: 'dark:bg-blue-900/20',
    darkText: 'dark:text-blue-400',
  },
  AI_DATA: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    darkBg: 'dark:bg-emerald-900/20',
    darkText: 'dark:text-emerald-400',
  },
  AI_RESPONSIBLE: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    darkBg: 'dark:bg-purple-900/20',
    darkText: 'dark:text-purple-400',
  },
  AI_THIRD_PARTY: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    darkBg: 'dark:bg-amber-900/20',
    darkText: 'dark:text-amber-400',
  },
  AI_IMPROVEMENT: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    darkBg: 'dark:bg-cyan-900/20',
    darkText: 'dark:text-cyan-400',
  },
};

const statusOptions = ['NOT_STARTED', 'IN_PROGRESS', 'IMPLEMENTED', 'NOT_APPLICABLE'];

const statusConfig: Record<
  string,
  { color: string; darkColor: string; icon: typeof CheckCircle2; label: string }
> = {
  NOT_STARTED: {
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
    darkColor: 'dark:bg-gray-800 dark:text-gray-400',
    icon: MinusCircle,
    label: 'Not Started',
  },
  IN_PROGRESS: {
    color: 'bg-yellow-100 text-yellow-700',
    darkColor: 'dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
    label: 'In Progress',
  },
  IMPLEMENTED: {
    color: 'bg-green-100 text-green-700',
    darkColor: 'dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
    label: 'Implemented',
  },
  NOT_APPLICABLE: {
    color: 'bg-blue-100 text-blue-700',
    darkColor: 'dark:bg-blue-900/30 dark:text-blue-400',
    icon: Ban,
    label: 'N/A',
  },
};

/* ------------------------------------------------------------------ */
/*  Compliance Score Ring                                              */
/* ------------------------------------------------------------------ */

function ComplianceRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#DC2626';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-300"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{score}%</span>
        <span className="text-[10px] text-muted-foreground">Compliant</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ControlsPage() {
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<{
    code: string;
    title: string;
    domain: string;
    description: string;
  } | null>(null);
  const [controlStatuses, setControlStatuses] = useState<
    Record<
      string,
      {
        status: string;
        notes: string;
        evidence: string;
        owner: string;
        targetDate: string;
        reviewDate: string;
      }
    >
  >({});
  const [activeClause, setActiveClause] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    status: 'NOT_STARTED',
    implementationNotes: '',
    evidence: '',
    owner: '',
    targetDate: '',
    reviewDate: '',
  });

  useEffect(() => {
    loadControls();
  }, []);

  async function loadControls() {
    try {
      setError(null);
      const res = await api.get('/controls');
      const data = res.data.data || [];
      setControls(data);
      const statuses: Record<
        string,
        {
          status: string;
          notes: string;
          evidence: string;
          owner: string;
          targetDate: string;
          reviewDate: string;
        }
      > = {};
      data.forEach((c: Control) => {
        statuses[c.code] = {
          status: c.status,
          notes: c.implementationNotes || '',
          evidence: c.evidence || '',
          owner: c.owner || '',
          targetDate: c.targetDate ? c.targetDate.split('T')[0] : '',
          reviewDate: c.reviewDate ? c.reviewDate.split('T')[0] : '',
        };
      });
      setControlStatuses(statuses);
    } catch {
      setError('Failed to load controls.');
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(control: {
    code: string;
    title: string;
    domain: string;
    description: string;
  }) {
    setEditingControl(control);
    const existing = controlStatuses[control.code];
    setForm({
      status: existing?.status || 'NOT_STARTED',
      implementationNotes: existing?.notes || '',
      evidence: existing?.evidence || '',
      owner: existing?.owner || '',
      targetDate: existing?.targetDate || '',
      reviewDate: existing?.reviewDate || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingControl) return;
    setSaving(true);
    try {
      await api.put(`/controls/${editingControl.code}`, {
        code: editingControl.code,
        title: editingControl.title,
        domain: editingControl.domain,
        description: editingControl.description,
        ...form,
      });
      setControlStatuses({
        ...controlStatuses,
        [editingControl.code]: {
          status: form.status,
          notes: form.implementationNotes,
          evidence: form.evidence,
          owner: form.owner,
          targetDate: form.targetDate,
          reviewDate: form.reviewDate,
        },
      });
      setModalOpen(false);
      loadControls();
    } catch {
      setError('Failed to update control.');
    } finally {
      setSaving(false);
    }
  }

  const allControls = annexAControls.flatMap((domain) =>
    domain.controls.map((c) => ({ ...c, domain: domain.domain }))
  );
  const totalControls = allControls.length;
  const implementedCount = allControls.filter(
    (c) => controlStatuses[c.code]?.status === 'IMPLEMENTED'
  ).length;
  const inProgressCount = allControls.filter(
    (c) => controlStatuses[c.code]?.status === 'IN_PROGRESS'
  ).length;
  const naCount = allControls.filter(
    (c) => controlStatuses[c.code]?.status === 'NOT_APPLICABLE'
  ).length;
  const notStartedCount = totalControls - implementedCount - inProgressCount - naCount;
  const applicableTotal = totalControls - naCount;
  const progressPercent =
    applicableTotal > 0 ? Math.round((implementedCount / applicableTotal) * 100) : 0;

  const filteredDomains = annexAControls
    .filter((d) => activeClause === 'ALL' || d.code === activeClause)
    .map((d) => ({
      ...d,
      controls: d.controls.filter((c) => {
        if (!filterStatus) return true;
        const cs = controlStatuses[c.code];
        const status = cs?.status || 'NOT_STARTED';
        return status === filterStatus;
      }),
    }))
    .filter((d) => d.controls.length > 0);

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors';

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Annex A Controls</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ISO 42001:2023 Annex A -- {totalControls} controls across {annexAControls.length} clause
            groups
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Score Overview */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ComplianceRing score={progressPercent} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Implementation Progress
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {implementedCount} of {applicableTotal} applicable controls implemented
              </p>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                <div className="flex h-full rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 transition-all duration-500"
                    style={{
                      width: `${applicableTotal > 0 ? (implementedCount / totalControls) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-yellow-500 transition-all duration-500"
                    style={{
                      width: `${applicableTotal > 0 ? (inProgressCount / totalControls) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-blue-400 transition-all duration-500"
                    style={{
                      width: `${applicableTotal > 0 ? (naCount / totalControls) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Implemented', count: implementedCount, color: 'bg-green-500' },
                  { label: 'In Progress', count: inProgressCount, color: 'bg-yellow-500' },
                  { label: 'Not Started', count: notStartedCount, color: 'bg-gray-400' },
                  { label: 'N/A', count: naCount, color: 'bg-blue-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-muted-foreground">{item.label}:</span>
                    <span className="text-sm font-bold text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Clause Tabs */}
        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-1 p-2 overflow-x-auto border-b border-border">
            <button
              onClick={() => setActiveClause('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeClause === 'ALL'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              All ({totalControls})
            </button>
            {annexAControls.map((clause) => {
              const clauseImplemented = clause.controls.filter(
                (c) => controlStatuses[c.code]?.status === 'IMPLEMENTED'
              ).length;
              return (
                <button
                  key={clause.code}
                  onClick={() => setActiveClause(clause.code)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    activeClause === clause.code
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {clause.code} ({clauseImplemented}/{clause.controls.length})
                </button>
              );
            })}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus('')}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls list */}
          {filteredDomains.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No controls match the selected filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredDomains.map((domain) => {
                const dc = domainColors[domain.domain] || domainColors.AI_GOVERNANCE;
                const clauseImplemented = domain.controls.filter(
                  (c) => controlStatuses[c.code]?.status === 'IMPLEMENTED'
                ).length;

                return (
                  <div key={domain.code}>
                    {/* Clause header */}
                    <div
                      className={`px-5 py-3 flex items-center justify-between ${dc.bg} ${dc.darkBg}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${dc.text} ${dc.darkText}`}>
                          {domain.code}
                        </span>
                        <span className={`text-sm font-medium ${dc.text} ${dc.darkText}`}>
                          {domain.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${dc.border} ${dc.bg} ${dc.text} ${dc.darkBg} ${dc.darkText}`}
                        >
                          {clauseImplemented}/{domain.controls.length} implemented
                        </span>
                      </div>
                    </div>

                    {/* Controls */}
                    {domain.controls.map((control) => {
                      const cs = controlStatuses[control.code];
                      const status = cs?.status || 'NOT_STARTED';
                      const sc = statusConfig[status];
                      const StatusIcon = sc.icon;

                      return (
                        <div
                          key={control.code}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                        >
                          {/* Status icon */}
                          <StatusIcon
                            className={`w-5 h-5 shrink-0 ${
                              status === 'IMPLEMENTED'
                                ? 'text-green-500'
                                : status === 'IN_PROGRESS'
                                  ? 'text-yellow-500'
                                  : status === 'NOT_APPLICABLE'
                                    ? 'text-blue-400'
                                    : 'text-gray-400'
                            }`}
                          />

                          {/* Code */}
                          <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">
                            {control.code}
                          </span>

                          {/* Title & description */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{control.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {control.description}
                            </p>
                          </div>

                          {/* Status chip */}
                          <span
                            className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap ${sc.color} ${sc.darkColor}`}
                          >
                            {sc.label}
                          </span>

                          {/* Owner */}
                          <div className="hidden lg:flex items-center gap-1 w-28 shrink-0">
                            {cs?.owner ? (
                              <>
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate">
                                  {cs.owner}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">No owner</span>
                            )}
                          </div>

                          {/* Review date */}
                          <div className="hidden lg:flex items-center gap-1 w-24 shrink-0">
                            {cs?.reviewDate ? (
                              <>
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(cs.reviewDate).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                  })}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">No date</span>
                            )}
                          </div>

                          {/* Evidence indicator */}
                          <div className="hidden md:block w-6 shrink-0">
                            {cs?.evidence ? (
                              <ExternalLink
                                className="w-3.5 h-3.5 text-indigo-500"
                                aria-label="Evidence linked"
                              />
                            ) : null}
                          </div>

                          {/* Action */}
                          <button
                            onClick={() => openEditModal({ ...control, domain: domain.domain })}
                            className="shrink-0 p-1.5 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Update control"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Control Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingControl ? `Update Control ${editingControl.code}` : 'Update Control'}
        size="lg"
      >
        {editingControl && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Control info header */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium text-foreground">{editingControl.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{editingControl.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Domain: {domainLabels[editingControl.domain] || editingControl.domain}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {statusOptions.map((s) => {
                  const sc = statusConfig[s];
                  const StatusIcon = sc.icon;
                  const isSelected = form.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {sc.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Owner</label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Review Date</label>
              <input
                type="date"
                value={form.reviewDate}
                onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Implementation Notes
              </label>
              <textarea
                value={form.implementationNotes}
                onChange={(e) => setForm({ ...form, implementationNotes: e.target.value })}
                className={inputClass}
                rows={3}
                placeholder="Describe how this control has been implemented..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Evidence Links
              </label>
              <textarea
                value={form.evidence}
                onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                className={inputClass}
                rows={2}
                placeholder="Links to evidence documents, audit reports, policies, etc."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Update Control'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
