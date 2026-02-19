'use client';

import { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Search,
  Filter,
  Eye,
  Lock,
  Edit3 } from 'lucide-react';

type DocStatus = 'draft' | 'under-review' | 'approved' | 'archived';
type DocType =
  | 'charter'
  | 'plan'
  | 'report'
  | 'specification'
  | 'meeting-minutes'
  | 'change-request'
  | 'risk-register'
  | 'other';

interface Document {
  id: string;
  name: string;
  type: DocType;
  project: string;
  status: DocStatus;
  version: string;
  author: string;
  lastModified: string;
  size: string;
  approver: string | null;
  approvedDate: string | null;
  tags: string[];
  revisions: { version: string; date: string; author: string; changes: string }[];
}

const documents: Document[] = [
  {
    id: 'd1',
    name: 'Project Charter — ERP Migration',
    type: 'charter',
    project: 'ERP Migration',
    status: 'approved',
    version: '2.1',
    author: 'Emma Clarke',
    lastModified: '2025-09-15',
    size: '245 KB',
    approver: 'David Hughes',
    approvedDate: '2025-09-20',
    tags: ['Charter', 'ERP', 'Phase 1'],
    revisions: [
      {
        version: '2.1',
        date: '2025-09-15',
        author: 'Emma Clarke',
        changes: 'Updated budget section and stakeholder matrix' },
      {
        version: '2.0',
        date: '2025-07-01',
        author: 'Emma Clarke',
        changes: 'Major revision — expanded scope to include HR module' },
      { version: '1.0', date: '2025-03-10', author: 'Emma Clarke', changes: 'Initial release' },
    ] },
  {
    id: 'd2',
    name: 'Risk Register — New Factory Build',
    type: 'risk-register',
    project: 'New Factory Build',
    status: 'approved',
    version: '3.4',
    author: 'Tom Parker',
    lastModified: '2026-01-20',
    size: '180 KB',
    approver: 'Sarah Chen',
    approvedDate: '2026-01-22',
    tags: ['Risk', 'Factory', 'Construction'],
    revisions: [
      {
        version: '3.4',
        date: '2026-01-20',
        author: 'Tom Parker',
        changes: 'Added 3 new supply chain risks post-review' },
      {
        version: '3.3',
        date: '2025-12-01',
        author: 'Tom Parker',
        changes: 'Monthly update — closed 2 risks' },
    ] },
  {
    id: 'd3',
    name: 'Phase 2 Specification — Mobile App',
    type: 'specification',
    project: 'Mobile App v3',
    status: 'under-review',
    version: '1.2',
    author: 'Liam Chen',
    lastModified: '2026-02-05',
    size: '512 KB',
    approver: null,
    approvedDate: null,
    tags: ['Mobile', 'Phase 2', 'API'],
    revisions: [
      {
        version: '1.2',
        date: '2026-02-05',
        author: 'Liam Chen',
        changes: 'Addressed reviewer comments on API endpoints' },
      {
        version: '1.1',
        date: '2026-01-28',
        author: 'Liam Chen',
        changes: 'Added offline sync specifications' },
      { version: '1.0', date: '2026-01-15', author: 'Liam Chen', changes: 'Initial draft' },
    ] },
  {
    id: 'd4',
    name: 'Monthly Status Report — January 2026',
    type: 'report',
    project: 'ERP Migration',
    status: 'approved',
    version: '1.0',
    author: 'Emma Clarke',
    lastModified: '2026-02-01',
    size: '89 KB',
    approver: 'David Hughes',
    approvedDate: '2026-02-02',
    tags: ['Report', 'Monthly', 'Status'],
    revisions: [
      {
        version: '1.0',
        date: '2026-02-01',
        author: 'Emma Clarke',
        changes: 'January 2026 status report' },
    ] },
  {
    id: 'd5',
    name: 'Project Management Plan — ISO 27001',
    type: 'plan',
    project: 'ISO 27001 Certification',
    status: 'draft',
    version: '0.3',
    author: 'Alex Kim',
    lastModified: '2026-02-10',
    size: '324 KB',
    approver: null,
    approvedDate: null,
    tags: ['InfoSec', 'ISO 27001', 'Plan'],
    revisions: [
      {
        version: '0.3',
        date: '2026-02-10',
        author: 'Alex Kim',
        changes: 'Added resource plan and RACI matrix' },
      {
        version: '0.2',
        date: '2026-01-25',
        author: 'Alex Kim',
        changes: 'WBS and schedule baseline' },
      { version: '0.1', date: '2026-01-10', author: 'Alex Kim', changes: 'Initial outline' },
    ] },
  {
    id: 'd6',
    name: 'Steering Committee Minutes — Feb 2026',
    type: 'meeting-minutes',
    project: 'New Factory Build',
    status: 'approved',
    version: '1.0',
    author: 'Priya Patel',
    lastModified: '2026-02-08',
    size: '42 KB',
    approver: 'Tom Parker',
    approvedDate: '2026-02-09',
    tags: ['Minutes', 'Steering', 'Monthly'],
    revisions: [
      {
        version: '1.0',
        date: '2026-02-08',
        author: 'Priya Patel',
        changes: 'Meeting minutes from Feb 6th steering committee' },
    ] },
  {
    id: 'd7',
    name: 'Change Request CR-042 — Scope Extension',
    type: 'change-request',
    project: 'Mobile App v3',
    status: 'under-review',
    version: '1.0',
    author: 'Liam Chen',
    lastModified: '2026-02-11',
    size: '67 KB',
    approver: null,
    approvedDate: null,
    tags: ['Change', 'Scope', 'CR'],
    revisions: [
      {
        version: '1.0',
        date: '2026-02-11',
        author: 'Liam Chen',
        changes: 'Request to add biometric login feature' },
    ] },
  {
    id: 'd8',
    name: 'Lessons Learned — Phase 1',
    type: 'report',
    project: 'ERP Migration',
    status: 'archived',
    version: '1.0',
    author: 'Emma Clarke',
    lastModified: '2025-12-20',
    size: '156 KB',
    approver: 'David Hughes',
    approvedDate: '2025-12-22',
    tags: ['Lessons', 'Phase 1', 'Archive'],
    revisions: [
      {
        version: '1.0',
        date: '2025-12-20',
        author: 'Emma Clarke',
        changes: 'Phase 1 lessons learned compilation' },
    ] },
];

const statusConfig: Record<DocStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
    icon: <Edit3 className="h-3.5 w-3.5" /> },
  'under-review': {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-700',
    icon: <Eye className="h-3.5 w-3.5" /> },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="h-3.5 w-3.5" /> },
  archived: {
    label: 'Archived',
    color: 'bg-amber-100 text-amber-700',
    icon: <Lock className="h-3.5 w-3.5" /> } };

const typeLabels: Record<DocType, string> = {
  charter: 'Charter',
  plan: 'Plan',
  report: 'Report',
  specification: 'Specification',
  'meeting-minutes': 'Meeting Minutes',
  'change-request': 'Change Request',
  'risk-register': 'Risk Register',
  other: 'Other' };

export default function DocumentsClient() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = documents.filter((d) => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesType = typeFilter === 'all' || d.type === typeFilter;
    const matchesSearch =
      !searchTerm ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const projects = [...new Set(documents.map((d) => d.project))];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Project Documents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Version-controlled project documentation library
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Documents
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {documents.length}
          </p>
        </div>
        {(['draft', 'under-review', 'approved', 'archived'] as DocStatus[]).map((s) => {
          const count = documents.filter((d) => d.status === s).length;
          return (
            <div
              key={s}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                {statusConfig[s].label}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search documents, projects, tags..."
            placeholder="Search documents, projects, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          aria-label="Filter by type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {['all', 'draft', 'under-review', 'approved', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
            >
              {s === 'all' ? 'All' : statusConfig[s as DocStatus]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Documents Table */}
        <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Document
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-32">
                  Project
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">
                  Type
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-16">
                  Ver
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-28">
                  Modified
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const cfg = statusConfig[doc.status];
                return (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`border-t border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedDoc?.id === doc.id ? 'bg-indigo-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {doc.author} · {doc.size}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.project}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {typeLabels[doc.type]}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{doc.version}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {doc.lastModified}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedDoc && (
          <div className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4 self-start sticky top-6">
            <div>
              <p className="text-xs text-indigo-600 font-medium">{typeLabels[selectedDoc.type]}</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                {selectedDoc.name}
              </h3>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedDoc.status].color}`}
            >
              {statusConfig[selectedDoc.status].icon}
              {statusConfig[selectedDoc.status].label}
            </span>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Version</p>
                <p className="font-medium">{selectedDoc.version}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Size</p>
                <p className="font-medium">{selectedDoc.size}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Author</p>
                <p className="font-medium">{selectedDoc.author}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Project</p>
                <p className="font-medium">{selectedDoc.project}</p>
              </div>
              {selectedDoc.approver && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Approver</p>
                    <p className="font-medium">{selectedDoc.approver}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                    <p className="font-medium">{selectedDoc.approvedDate}</p>
                  </div>
                </>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Revision History
              </h4>
              <div className="space-y-2">
                {selectedDoc.revisions.map((r, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono font-medium text-indigo-600">v{r.version}</span>
                      <span className="text-gray-400 dark:text-gray-500">{r.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{r.changes}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">by {r.author}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedDoc.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
