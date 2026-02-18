'use client';

import { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Shield,
  FileCheck,
  Wrench,
  Users,
  Eye,
  Search,
  Filter,
  BarChart3,
} from 'lucide-react';

interface Requirement {
  id: string;
  clause: string;
  title: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';
  evidence: string[];
  owner: string;
  lastAudit: string;
  nextReview: string;
  findings: number;
  notes: string;
}

interface Section {
  id: string;
  number: string;
  title: string;
  icon: React.ReactNode;
  requirements: Requirement[];
}

const sections: Section[] = [
  {
    id: 'context',
    number: '4',
    title: 'Context of the Organisation',
    icon: <Eye className="h-5 w-5" />,
    requirements: [
      {
        id: 'r1',
        clause: '4.1',
        title: 'Understanding the organisation and its context',
        description:
          'Determine external and internal issues relevant to the QMS including aviation, space & defence industry requirements',
        status: 'compliant',
        evidence: ['Context Analysis Report v3.2', 'Stakeholder Register'],
        owner: 'Quality Director',
        lastAudit: '2025-11-15',
        nextReview: '2026-05-15',
        findings: 0,
        notes: 'Includes SWOT and PESTLE analysis',
      },
      {
        id: 'r2',
        clause: '4.2',
        title: 'Understanding needs and expectations of interested parties',
        description:
          'Determine interested parties and their requirements including regulatory authorities, customers, and certification bodies',
        status: 'compliant',
        evidence: ['Interested Parties Matrix', 'Customer Requirements Log'],
        owner: 'Quality Director',
        lastAudit: '2025-11-15',
        nextReview: '2026-05-15',
        findings: 0,
        notes: '',
      },
      {
        id: 'r3',
        clause: '4.3',
        title: 'Determining the scope of the QMS',
        description: 'Scope includes AS9100D requirements for aviation products and services',
        status: 'compliant',
        evidence: ['QMS Scope Statement', 'Certificate of Registration'],
        owner: 'Quality Director',
        lastAudit: '2025-11-15',
        nextReview: '2026-05-15',
        findings: 0,
        notes: 'OASIS registered',
      },
      {
        id: 'r4',
        clause: '4.4',
        title: 'Quality management system and its processes',
        description:
          'Process-based approach with product safety and counterfeit parts prevention integrated',
        status: 'partial',
        evidence: ['Process Map v2.8'],
        owner: 'Process Owner',
        lastAudit: '2025-11-15',
        nextReview: '2026-03-01',
        findings: 1,
        notes: 'Turtle diagrams need updating for 3 processes',
      },
    ],
  },
  {
    id: 'leadership',
    number: '5',
    title: 'Leadership',
    icon: <Users className="h-5 w-5" />,
    requirements: [
      {
        id: 'r5',
        clause: '5.1',
        title: 'Leadership and commitment',
        description:
          'Top management demonstrates commitment to QMS including product safety and on-time delivery',
        status: 'compliant',
        evidence: ['Management Review Minutes Q4', 'Quality Policy'],
        owner: 'CEO',
        lastAudit: '2025-12-01',
        nextReview: '2026-06-01',
        findings: 0,
        notes: '',
      },
      {
        id: 'r6',
        clause: '5.2',
        title: 'Policy',
        description: 'Quality policy appropriate to AS9100D including product safety commitment',
        status: 'compliant',
        evidence: ['Quality Policy Rev 8', 'Communication Records'],
        owner: 'Quality Director',
        lastAudit: '2025-12-01',
        nextReview: '2026-06-01',
        findings: 0,
        notes: '',
      },
      {
        id: 'r7',
        clause: '5.3',
        title: 'Organisational roles, responsibilities and authorities',
        description:
          'Roles include product safety, counterfeit parts prevention, and FOD prevention responsibilities',
        status: 'compliant',
        evidence: ['Org Chart', 'Role Descriptions', 'Delegation Matrix'],
        owner: 'HR Manager',
        lastAudit: '2025-12-01',
        nextReview: '2026-06-01',
        findings: 0,
        notes: '',
      },
    ],
  },
  {
    id: 'planning',
    number: '6',
    title: 'Planning',
    icon: <BarChart3 className="h-5 w-5" />,
    requirements: [
      {
        id: 'r8',
        clause: '6.1',
        title: 'Actions to address risks and opportunities',
        description:
          'Risk management includes operational risks, product safety risks, and supply chain risks',
        status: 'partial',
        evidence: ['Risk Register v4.1', 'Opportunity Log'],
        owner: 'Risk Manager',
        lastAudit: '2025-10-20',
        nextReview: '2026-04-20',
        findings: 2,
        notes: 'Supply chain risk assessment overdue for 2 critical suppliers',
      },
      {
        id: 'r9',
        clause: '6.2',
        title: 'Quality objectives and planning to achieve them',
        description:
          'Measurable objectives for OTD, quality escapes, customer satisfaction, and product safety',
        status: 'compliant',
        evidence: ['Quality Objectives Dashboard', 'KPI Tracker'],
        owner: 'Quality Director',
        lastAudit: '2025-10-20',
        nextReview: '2026-04-20',
        findings: 0,
        notes: 'All KPIs on target',
      },
      {
        id: 'r10',
        clause: '6.3',
        title: 'Planning of changes',
        description: 'Change management process for QMS changes including impact on airworthiness',
        status: 'compliant',
        evidence: ['Change Control Procedure', 'Change Log'],
        owner: 'Quality Director',
        lastAudit: '2025-10-20',
        nextReview: '2026-04-20',
        findings: 0,
        notes: '',
      },
    ],
  },
  {
    id: 'support',
    number: '7',
    title: 'Support',
    icon: <Wrench className="h-5 w-5" />,
    requirements: [
      {
        id: 'r11',
        clause: '7.1',
        title: 'Resources',
        description:
          'Resources including calibrated measurement equipment, work environment control, and organisational knowledge',
        status: 'compliant',
        evidence: ['Resource Plan', 'Calibration Schedule', 'Infrastructure Register'],
        owner: 'Operations Director',
        lastAudit: '2025-11-01',
        nextReview: '2026-05-01',
        findings: 0,
        notes: '',
      },
      {
        id: 'r12',
        clause: '7.2',
        title: 'Competence',
        description:
          'Competence requirements include special processes, NDT, and product safety awareness',
        status: 'partial',
        evidence: ['Training Matrix', 'Competence Records'],
        owner: 'HR Manager',
        lastAudit: '2025-11-01',
        nextReview: '2026-03-15',
        findings: 1,
        notes: 'NDT Level III certification renewal pending for 1 inspector',
      },
      {
        id: 'r13',
        clause: '7.3',
        title: 'Awareness',
        description:
          'Personnel aware of quality policy, objectives, and their contribution to product safety',
        status: 'compliant',
        evidence: ['Awareness Training Records', 'Toolbox Talk Log'],
        owner: 'HR Manager',
        lastAudit: '2025-11-01',
        nextReview: '2026-05-01',
        findings: 0,
        notes: '',
      },
      {
        id: 'r14',
        clause: '7.4',
        title: 'Communication',
        description:
          'Internal and external communication including customer notifications and regulatory reporting',
        status: 'compliant',
        evidence: ['Communication Plan', 'Customer Notification Log'],
        owner: 'Quality Director',
        lastAudit: '2025-11-01',
        nextReview: '2026-05-01',
        findings: 0,
        notes: '',
      },
      {
        id: 'r15',
        clause: '7.5',
        title: 'Documented information',
        description:
          'Document control including retention per customer and regulatory requirements',
        status: 'compliant',
        evidence: ['Document Control Procedure', 'Records Retention Schedule'],
        owner: 'Document Controller',
        lastAudit: '2025-11-01',
        nextReview: '2026-05-01',
        findings: 0,
        notes: '10-year retention for airworthiness records',
      },
    ],
  },
  {
    id: 'operation',
    number: '8',
    title: 'Operation',
    icon: <Shield className="h-5 w-5" />,
    requirements: [
      {
        id: 'r16',
        clause: '8.1',
        title: 'Operational planning and control',
        description:
          'Planning includes product safety, configuration management, and work transfer controls',
        status: 'compliant',
        evidence: ['Operations Manual', 'Work Transfer Procedure'],
        owner: 'Operations Director',
        lastAudit: '2025-12-10',
        nextReview: '2026-06-10',
        findings: 0,
        notes: '',
      },
      {
        id: 'r17',
        clause: '8.2',
        title: 'Requirements for products and services',
        description:
          'Customer requirements review including airworthiness, special requirements, and key characteristics',
        status: 'compliant',
        evidence: ['Contract Review Checklist', 'Key Characteristics Register'],
        owner: 'Sales Director',
        lastAudit: '2025-12-10',
        nextReview: '2026-06-10',
        findings: 0,
        notes: '',
      },
      {
        id: 'r18',
        clause: '8.3',
        title: 'Design and development',
        description:
          'Design controls including verification, validation, design reviews, and configuration management',
        status: 'partial',
        evidence: ['Design Control Procedure', 'Design Review Records'],
        owner: 'Engineering Director',
        lastAudit: '2025-12-10',
        nextReview: '2026-03-10',
        findings: 2,
        notes: 'Design review records incomplete for 2 active projects',
      },
      {
        id: 'r19',
        clause: '8.4',
        title: 'Control of externally provided processes',
        description:
          'Supplier management including approved supplier list, OASIS checks, and counterfeit parts prevention',
        status: 'non-compliant',
        evidence: ['Approved Supplier List'],
        owner: 'Procurement Manager',
        lastAudit: '2025-12-10',
        nextReview: '2026-02-28',
        findings: 3,
        notes: 'CRITICAL: 3 suppliers missing current OASIS registration verification',
      },
      {
        id: 'r20',
        clause: '8.5',
        title: 'Production and service provision',
        description:
          'Production controls including special processes (NADCAP), FOD prevention, and first article inspection',
        status: 'partial',
        evidence: ['Production Manual', 'FAI Records', 'FOD Prevention Plan'],
        owner: 'Production Manager',
        lastAudit: '2025-12-10',
        nextReview: '2026-04-10',
        findings: 1,
        notes: 'FAI backlog — 4 FAs overdue',
      },
      {
        id: 'r21',
        clause: '8.6',
        title: 'Release of products and services',
        description:
          'Inspection and release including authorised release certificates (EASA Form 1 / FAA 8130-3)',
        status: 'compliant',
        evidence: ['Release Procedure', 'Authorised Signatory List'],
        owner: 'Quality Manager',
        lastAudit: '2025-12-10',
        nextReview: '2026-06-10',
        findings: 0,
        notes: '',
      },
      {
        id: 'r22',
        clause: '8.7',
        title: 'Control of nonconforming outputs',
        description:
          'NCR process including MRB authority, customer notification for shipped NCs, and scrap controls',
        status: 'compliant',
        evidence: ['NCR Procedure', 'MRB Charter'],
        owner: 'Quality Manager',
        lastAudit: '2025-12-10',
        nextReview: '2026-06-10',
        findings: 0,
        notes: '',
      },
    ],
  },
  {
    id: 'evaluation',
    number: '9',
    title: 'Performance Evaluation',
    icon: <FileCheck className="h-5 w-5" />,
    requirements: [
      {
        id: 'r23',
        clause: '9.1',
        title: 'Monitoring, measurement, analysis and evaluation',
        description:
          'KPIs include OTD, quality escapes, customer satisfaction, and product safety metrics',
        status: 'compliant',
        evidence: ['KPI Dashboard', 'Customer Satisfaction Survey Results'],
        owner: 'Quality Director',
        lastAudit: '2025-11-20',
        nextReview: '2026-05-20',
        findings: 0,
        notes: 'Monthly trend analysis active',
      },
      {
        id: 'r24',
        clause: '9.2',
        title: 'Internal audit',
        description:
          'Process-based audit programme covering all AS9100D requirements within 12-month cycle',
        status: 'compliant',
        evidence: ['Audit Schedule 2026', 'Audit Reports'],
        owner: 'Lead Auditor',
        lastAudit: '2025-11-20',
        nextReview: '2026-05-20',
        findings: 0,
        notes: '12 audits scheduled for 2026',
      },
      {
        id: 'r25',
        clause: '9.3',
        title: 'Management review',
        description:
          'Reviews include product safety, on-time delivery trends, and certification body findings',
        status: 'compliant',
        evidence: ['Management Review Minutes', 'Action Tracker'],
        owner: 'Quality Director',
        lastAudit: '2025-11-20',
        nextReview: '2026-05-20',
        findings: 0,
        notes: 'Quarterly reviews on schedule',
      },
    ],
  },
  {
    id: 'improvement',
    number: '10',
    title: 'Improvement',
    icon: <BarChart3 className="h-5 w-5" />,
    requirements: [
      {
        id: 'r26',
        clause: '10.1',
        title: 'General',
        description:
          'Continual improvement including process capability and product conformity trends',
        status: 'compliant',
        evidence: ['Improvement Register', 'Trend Analysis'],
        owner: 'Quality Director',
        lastAudit: '2025-11-20',
        nextReview: '2026-05-20',
        findings: 0,
        notes: '',
      },
      {
        id: 'r27',
        clause: '10.2',
        title: 'Nonconformity and corrective action',
        description:
          'Root cause analysis (8D method), effectiveness verification, and lessons learned',
        status: 'partial',
        evidence: ['CAPA Log', '8D Reports'],
        owner: 'Quality Manager',
        lastAudit: '2025-11-20',
        nextReview: '2026-03-20',
        findings: 1,
        notes: '2 CAPAs overdue for effectiveness verification',
      },
      {
        id: 'r28',
        clause: '10.3',
        title: 'Continual improvement',
        description:
          'Improvement projects aligned with strategic objectives and customer requirements',
        status: 'compliant',
        evidence: ['Improvement Project Tracker', 'Kaizen Log'],
        owner: 'Quality Director',
        lastAudit: '2025-11-20',
        nextReview: '2026-05-20',
        findings: 0,
        notes: '',
      },
    ],
  },
];

const statusConfig = {
  compliant: {
    label: 'Compliant',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    ringColor: 'ring-green-500',
  },
  partial: {
    label: 'Partial',
    color: 'bg-amber-100 text-amber-800',
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    ringColor: 'ring-amber-500',
  },
  'non-compliant': {
    label: 'Non-Compliant',
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    ringColor: 'ring-red-500',
  },
  'not-assessed': {
    label: 'Not Assessed',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-600',
    icon: <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />,
    ringColor: 'ring-gray-400',
  },
};

export default function ComplianceTrackerClient() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['operation']));
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const allRequirements = sections.flatMap((s) => s.requirements);
  const totalReqs = allRequirements.length;
  const compliantCount = allRequirements.filter((r) => r.status === 'compliant').length;
  const partialCount = allRequirements.filter((r) => r.status === 'partial').length;
  const ncCount = allRequirements.filter((r) => r.status === 'non-compliant').length;
  const totalFindings = allRequirements.reduce((sum, r) => sum + r.findings, 0);
  const complianceRate = Math.round((compliantCount / totalReqs) * 100);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSections = sections
    .map((section) => ({
      ...section,
      requirements: section.requirements.filter((r) => {
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesSearch =
          !searchTerm ||
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.clause.includes(searchTerm) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    }))
    .filter((s) => s.requirements.length > 0);

  const overdueReviews = allRequirements.filter((r) => new Date(r.nextReview) < new Date());

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          AS9100D Compliance Tracker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Aviation, Space & Defence Quality Management System — Clause-by-clause compliance status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Overall Compliance
          </p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{complianceRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Compliant
          </p>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-3xl font-bold text-green-700">{compliantCount}</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            of {totalReqs} requirements
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Partial</p>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-3xl font-bold text-amber-700">{partialCount}</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">needs attention</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Non-Compliant
          </p>
          <div className="flex items-center gap-2 mt-1">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-3xl font-bold text-red-700">{ncCount}</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">critical items</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Open Findings
          </p>
          <div className="flex items-center gap-2 mt-1">
            <FileCheck className="h-5 w-5 text-indigo-600" />
            <p className="text-3xl font-bold text-indigo-700">{totalFindings}</p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">audit findings</p>
        </div>
      </div>

      {/* Overdue Reviews Alert */}
      {overdueReviews.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">
              Overdue Reviews ({overdueReviews.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {overdueReviews.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReq(r)}
                className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-lg hover:bg-red-200 transition-colors"
              >
                {r.clause} — {r.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search clauses, titles..."
            placeholder="Search clauses, titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          {['all', 'compliant', 'partial', 'non-compliant', 'not-assessed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : statusConfig[s as keyof typeof statusConfig].label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Progress Overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Section Compliance Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {sections.map((section) => {
            const sCompliant = section.requirements.filter((r) => r.status === 'compliant').length;
            const sTotal = section.requirements.length;
            const pct = Math.round((sCompliant / sTotal) * 100);
            return (
              <button
                key={section.id}
                onClick={() => {
                  setExpandedSections(new Set([section.id]));
                  document
                    .getElementById(`section-${section.id}`)
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 transition-colors"
              >
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Cl. {section.number}
                </p>
                <p className="text-sm font-medium text-gray-800 truncate">{section.title}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {sCompliant}/{sTotal} compliant
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requirements by Section */}
      <div className="space-y-4">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const sCompliant = section.requirements.filter((r) => r.status === 'compliant').length;
          const sTotal = section.requirements.length;

          return (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                  <div className="p-2 bg-indigo-50 rounded-lg">{section.icon}</div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Clause {section.number} — {section.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sCompliant}/{sTotal} requirements compliant
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.requirements.some((r) => r.status === 'non-compliant') && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      NC
                    </span>
                  )}
                  {section.requirements.some((r) => r.status === 'partial') && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Partial
                    </span>
                  )}
                  {sCompliant === sTotal && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Full
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-20">
                          Clause
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">
                          Requirement
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-32">
                          Status
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-32">
                          Owner
                        </th>
                        <th className="text-center px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-20">
                          Findings
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-28">
                          Next Review
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.requirements.map((req) => {
                        const cfg = statusConfig[req.status];
                        const isOverdue = new Date(req.nextReview) < new Date();
                        return (
                          <tr
                            key={req.id}
                            onClick={() => setSelectedReq(req)}
                            className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 transition-colors ${
                              selectedReq?.id === req.id
                                ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-300'
                                : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                              {req.clause}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {req.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                {req.description}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                              >
                                {cfg.icon}
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{req.owner}</td>
                            <td className="px-4 py-3 text-center">
                              {req.findings > 0 ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                  {req.findings}
                                </span>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600">—</span>
                              )}
                            </td>
                            <td
                              className={`px-4 py-3 text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                              {isOverdue && '⚠ '}
                              {req.nextReview}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selectedReq && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono text-indigo-600">Clause {selectedReq.clause}</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {selectedReq.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedReq.status].color}`}
              >
                {statusConfig[selectedReq.status].icon}
                {statusConfig[selectedReq.status].label}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Description
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReq.description}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Owner
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReq.owner}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Last Audit
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedReq.lastAudit}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Next Review
                </h4>
                <p
                  className={`text-sm ${new Date(selectedReq.nextReview) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {selectedReq.nextReview}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Open Findings
              </h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedReq.findings}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Evidence
              </h4>
              <div className="space-y-1">
                {selectedReq.evidence.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <FileCheck className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{e}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedReq.notes && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Notes
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  {selectedReq.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
