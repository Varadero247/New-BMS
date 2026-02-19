'use client';

import { useState } from 'react';
import {
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Upload,
  Globe,
  Calendar,
} from 'lucide-react';

type SubmissionType = '510(k)' | 'PMA' | 'De Novo' | 'CE Mark' | 'UKCA' | 'TGA';
type Status =
  | 'drafting'
  | 'submitted'
  | 'under-review'
  | 'additional-info'
  | 'approved'
  | 'rejected';

interface Submission {
  id: string;
  refNumber: string;
  deviceName: string;
  type: SubmissionType;
  status: Status;
  authority: string;
  submittedDate: string | null;
  expectedDecision: string;
  reviewer: string;
  owner: string;
  classification: string;
  progress: number;
  milestones: { name: string; date: string; completed: boolean }[];
  notes: string;
}

const submissions: Submission[] = [
  {
    id: 's1',
    refNumber: 'SUB-2025-001',
    deviceName: 'CardioMonitor Pro X3',
    type: '510(k)',
    status: 'under-review',
    authority: 'FDA',
    submittedDate: '2025-08-15',
    expectedDecision: '2026-02-15',
    reviewer: 'CDRH Division',
    owner: 'Dr. Sarah Mitchell',
    classification: 'Class II',
    progress: 65,
    milestones: [
      { name: 'Pre-submission meeting', date: '2025-06-01', completed: true },
      { name: 'Submission filed', date: '2025-08-15', completed: true },
      { name: 'Acceptance review', date: '2025-09-01', completed: true },
      { name: 'Substantive review', date: '2025-11-15', completed: false },
      { name: 'Decision', date: '2026-02-15', completed: false },
    ],
    notes: 'Predicate device: K192345. FDA requested additional biocompatibility data.',
  },
  {
    id: 's2',
    refNumber: 'SUB-2025-002',
    deviceName: 'OrthoFlex Knee Implant v2',
    type: 'PMA',
    status: 'additional-info',
    authority: 'FDA',
    submittedDate: '2025-05-20',
    expectedDecision: '2026-06-30',
    reviewer: 'CDRH ODE',
    owner: 'Dr. James Park',
    classification: 'Class III',
    progress: 45,
    milestones: [
      { name: 'Pre-submission meeting', date: '2025-03-10', completed: true },
      { name: 'PMA filed', date: '2025-05-20', completed: true },
      { name: 'Filing review complete', date: '2025-07-20', completed: true },
      { name: 'Major deficiency letter', date: '2025-10-01', completed: true },
      { name: 'Response submitted', date: '2026-01-15', completed: false },
      { name: 'Advisory panel', date: '2026-04-01', completed: false },
      { name: 'Decision', date: '2026-06-30', completed: false },
    ],
    notes:
      'Major deficiency: additional 2-year clinical follow-up data required. Amendment in preparation.',
  },
  {
    id: 's3',
    refNumber: 'SUB-2025-003',
    deviceName: 'NeuroStim Wearable S1',
    type: 'De Novo',
    status: 'submitted',
    authority: 'FDA',
    submittedDate: '2025-12-01',
    expectedDecision: '2026-06-01',
    reviewer: 'CDRH',
    owner: 'Elena Torres',
    classification: 'Class II (proposed)',
    progress: 30,
    milestones: [
      { name: 'Pre-submission meeting', date: '2025-09-15', completed: true },
      { name: 'De Novo request filed', date: '2025-12-01', completed: true },
      { name: 'Acceptance review', date: '2026-01-01', completed: false },
      { name: 'Substantive review', date: '2026-03-01', completed: false },
      { name: 'Decision', date: '2026-06-01', completed: false },
    ],
    notes: 'First-of-kind novel TENS device with AI-driven stimulation patterns.',
  },
  {
    id: 's4',
    refNumber: 'SUB-2025-004',
    deviceName: 'CardioMonitor Pro X3',
    type: 'CE Mark',
    status: 'approved',
    authority: 'EU Notified Body (BSI)',
    submittedDate: '2025-03-10',
    expectedDecision: '2025-11-30',
    reviewer: 'BSI Group',
    owner: 'Dr. Sarah Mitchell',
    classification: 'Class IIa (MDR)',
    progress: 100,
    milestones: [
      { name: 'Technical file submitted', date: '2025-03-10', completed: true },
      { name: 'Document review', date: '2025-05-15', completed: true },
      { name: 'On-site audit', date: '2025-07-20', completed: true },
      { name: 'Certificate issued', date: '2025-11-15', completed: true },
    ],
    notes: 'EU MDR CE marking obtained. Valid until 2030-11-15.',
  },
  {
    id: 's5',
    refNumber: 'SUB-2025-005',
    deviceName: 'DermaView AI Scanner',
    type: 'UKCA',
    status: 'drafting',
    authority: 'MHRA',
    submittedDate: null,
    expectedDecision: '2026-09-30',
    reviewer: 'TBC',
    owner: 'Dr. Lisa Chang',
    classification: 'Class IIa',
    progress: 15,
    milestones: [
      { name: 'UKCA technical file prep', date: '2026-01-15', completed: false },
      { name: 'UK approved body engagement', date: '2026-03-01', completed: false },
      { name: 'Submission', date: '2026-05-01', completed: false },
      { name: 'Decision', date: '2026-09-30', completed: false },
    ],
    notes: 'Awaiting UKCA transition guidance clarification from MHRA.',
  },
  {
    id: 's6',
    refNumber: 'SUB-2025-006',
    deviceName: 'OrthoFlex Knee Implant v1',
    type: 'TGA',
    status: 'approved',
    authority: 'TGA (Australia)',
    submittedDate: '2024-11-01',
    expectedDecision: '2025-08-01',
    reviewer: 'TGA Medical Devices',
    owner: 'Dr. James Park',
    classification: 'Class III',
    progress: 100,
    milestones: [
      { name: 'Application filed', date: '2024-11-01', completed: true },
      { name: 'TGA assessment', date: '2025-02-15', completed: true },
      { name: 'ARTG inclusion', date: '2025-07-20', completed: true },
    ],
    notes: 'ARTG #372541. Post-market conditions apply.',
  },
];

const statusConfig: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  drafting: {
    label: 'Drafting',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  submitted: {
    label: 'Submitted',
    color: 'bg-blue-100 text-blue-700',
    icon: <Upload className="h-3.5 w-3.5" />,
  },
  'under-review': {
    label: 'Under Review',
    color: 'bg-purple-100 text-purple-700',
    icon: <FileCheck className="h-3.5 w-3.5" />,
  },
  'additional-info': {
    label: 'Additional Info Requested',
    color: 'bg-amber-100 text-amber-700',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

export default function SubmissionsClient() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['s1']));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = submissions.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesSearch =
      !searchTerm ||
      s.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = submissions.filter(
    (s) => !['approved', 'rejected'].includes(s.status)
  ).length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const pendingInfoCount = submissions.filter((s) => s.status === 'additional-info').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Regulatory Submissions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track regulatory submissions across FDA, EU, MHRA, and TGA authorities
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Submissions
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {submissions.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Active</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Approved</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Info Requested
          </p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{pendingInfoCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search devices, references..."
            placeholder="Search devices, references..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'drafting', 'submitted', 'under-review', 'additional-info', 'approved'].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
              >
                {s === 'all' ? 'All' : statusConfig[s as Status]?.label || s}
              </button>
            )
          )}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filtered.map((sub) => {
          const isExpanded = expanded.has(sub.id);
          const cfg = statusConfig[sub.status];
          return (
            <div
              key={sub.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpanded((prev) => {
                    const n = new Set(prev);
                    if (n.has(sub.id)) { n.delete(sub.id); } else { n.add(sub.id); }
                    return n;
                  })
                }
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {sub.deviceName}
                      </p>
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                        {sub.type}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {sub.refNumber} · {sub.authority} · {sub.classification} · Owner: {sub.owner}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 min-w-[140px]">
                  <div className="w-24">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${sub.progress === 100 ? 'bg-green-500' : sub.progress >= 50 ? 'bg-teal-500' : 'bg-amber-500'}`}
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 text-right">
                      {sub.progress}%
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        Submitted
                      </p>
                      <p className="font-medium">{sub.submittedDate || 'Not yet submitted'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        Expected Decision
                      </p>
                      <p className="font-medium">{sub.expectedDecision}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Reviewer</p>
                      <p className="font-medium">{sub.reviewer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        Authority
                      </p>
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <p className="font-medium">{sub.authority}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Submission Timeline
                    </h4>
                    <div className="space-y-3">
                      {sub.milestones.map((m, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${m.completed ? 'bg-green-500' : 'bg-gray-200'}`}
                          >
                            {m.completed ? (
                              <CheckCircle className="h-3 w-3 text-white" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm ${m.completed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}
                              >
                                {m.name}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{m.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sub.notes && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-sm text-amber-800">{sub.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
