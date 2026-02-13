'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@ims/ui';
import { FileText, Search, AlertTriangle, CheckCircle, Clock, Archive, Eye } from 'lucide-react';

type DocStatus = 'Draft' | 'Under Review' | 'Approved' | 'Obsolete';
type DocCategory = 'Policy' | 'Procedure' | 'Work Instruction' | 'Form' | 'Record' | 'Manual' | 'SOP' | 'Specification';

interface ControlledDocument {
  id: string;
  docNumber: string;
  title: string;
  category: DocCategory;
  status: DocStatus;
  currentRevision: string;
  revisionDate: string;
  nextReviewDate: string;
  owner: string;
  approver: string;
  department: string;
  isoClause: string;
  description: string;
  revisionHistory: { rev: string; date: string; author: string; changes: string }[];
}

const MOCK_DOCUMENTS: ControlledDocument[] = [
  {
    id: '1', docNumber: 'QMS-MAN-001', title: 'Quality Management System Manual', category: 'Manual', status: 'Approved',
    currentRevision: 'Rev 5', revisionDate: '2026-01-15', nextReviewDate: '2027-01-15', owner: 'Quality Manager',
    approver: 'Managing Director', department: 'Quality', isoClause: '4.4',
    description: 'Top-level QMS manual describing the scope, processes, and interactions of the quality management system.',
    revisionHistory: [
      { rev: 'Rev 5', date: '2026-01-15', author: 'J. Smith', changes: 'Updated for ISO 9001:2015 transition audit findings' },
      { rev: 'Rev 4', date: '2025-06-20', author: 'J. Smith', changes: 'Annual review — minor formatting updates' },
      { rev: 'Rev 3', date: '2024-12-10', author: 'M. Jones', changes: 'Added remote work process references' },
    ],
  },
  {
    id: '2', docNumber: 'QMS-POL-001', title: 'Quality Policy', category: 'Policy', status: 'Approved',
    currentRevision: 'Rev 3', revisionDate: '2026-01-05', nextReviewDate: '2027-01-05', owner: 'Managing Director',
    approver: 'Board of Directors', department: 'Executive', isoClause: '5.2',
    description: 'Statement of the organisation\'s commitment to quality, customer satisfaction, and continual improvement.',
    revisionHistory: [
      { rev: 'Rev 3', date: '2026-01-05', author: 'CEO', changes: 'Refreshed for 2026 strategic objectives' },
    ],
  },
  {
    id: '3', docNumber: 'QMS-PRO-001', title: 'Document Control Procedure', category: 'Procedure', status: 'Approved',
    currentRevision: 'Rev 4', revisionDate: '2025-11-20', nextReviewDate: '2026-11-20', owner: 'Quality Engineer',
    approver: 'Quality Manager', department: 'Quality', isoClause: '7.5',
    description: 'Defines the process for creating, reviewing, approving, distributing, and retiring controlled documents.',
    revisionHistory: [
      { rev: 'Rev 4', date: '2025-11-20', author: 'A. Patel', changes: 'Added electronic signature requirements' },
      { rev: 'Rev 3', date: '2025-03-15', author: 'A. Patel', changes: 'Added retention schedule table' },
    ],
  },
  {
    id: '4', docNumber: 'QMS-PRO-002', title: 'Internal Audit Procedure', category: 'Procedure', status: 'Under Review',
    currentRevision: 'Rev 6', revisionDate: '2026-02-01', nextReviewDate: '2026-08-01', owner: 'Internal Audit Lead',
    approver: 'Quality Manager', department: 'Quality', isoClause: '9.2',
    description: 'Defines the planning, execution, and follow-up of internal QMS audits including auditor competence.',
    revisionHistory: [
      { rev: 'Rev 6', date: '2026-02-01', author: 'R. Brown', changes: 'Under review — adding remote audit provisions' },
    ],
  },
  {
    id: '5', docNumber: 'QMS-PRO-003', title: 'Non-Conformance Management Procedure', category: 'Procedure', status: 'Approved',
    currentRevision: 'Rev 5', revisionDate: '2025-09-10', nextReviewDate: '2026-09-10', owner: 'Quality Engineer',
    approver: 'Quality Manager', department: 'Quality', isoClause: '10.2',
    description: 'Describes the identification, recording, investigation, and closure of non-conformances.',
    revisionHistory: [
      { rev: 'Rev 5', date: '2025-09-10', author: 'A. Patel', changes: 'Added containment action requirements' },
    ],
  },
  {
    id: '6', docNumber: 'QMS-WI-001', title: 'Incoming Inspection Work Instruction', category: 'Work Instruction', status: 'Approved',
    currentRevision: 'Rev 3', revisionDate: '2025-08-15', nextReviewDate: '2026-08-15', owner: 'Inspection Supervisor',
    approver: 'Quality Engineer', department: 'Quality Control', isoClause: '8.6',
    description: 'Step-by-step instructions for receiving inspection of incoming materials and components.',
    revisionHistory: [
      { rev: 'Rev 3', date: '2025-08-15', author: 'L. Chen', changes: 'Updated sampling plan per AQL changes' },
    ],
  },
  {
    id: '7', docNumber: 'QMS-WI-045', title: 'CNC Machine Setup — Part Family A', category: 'Work Instruction', status: 'Draft',
    currentRevision: 'Rev 1', revisionDate: '2026-02-10', nextReviewDate: '2026-08-10', owner: 'Production Engineer',
    approver: 'Production Manager', department: 'Production', isoClause: '8.5',
    description: 'Detailed setup instructions for CNC machining of Part Family A components.',
    revisionHistory: [
      { rev: 'Rev 1', date: '2026-02-10', author: 'M. Jones', changes: 'Initial draft — pending review' },
    ],
  },
  {
    id: '8', docNumber: 'QMS-FRM-001', title: 'CAPA Request Form', category: 'Form', status: 'Approved',
    currentRevision: 'Rev 2', revisionDate: '2025-07-22', nextReviewDate: '2026-07-22', owner: 'Quality Engineer',
    approver: 'Quality Manager', department: 'Quality', isoClause: '10.2',
    description: 'Standard form for initiating corrective and preventive action requests.',
    revisionHistory: [
      { rev: 'Rev 2', date: '2025-07-22', author: 'A. Patel', changes: 'Added root cause analysis section' },
    ],
  },
  {
    id: '9', docNumber: 'QMS-SPC-001', title: 'Material Specification — Aluminium 6061-T6', category: 'Specification', status: 'Approved',
    currentRevision: 'Rev 1', revisionDate: '2025-05-10', nextReviewDate: '2026-05-10', owner: 'Materials Engineer',
    approver: 'Engineering Manager', department: 'Engineering', isoClause: '8.4',
    description: 'Defines the chemical composition, mechanical properties, and testing requirements for Aluminium 6061-T6.',
    revisionHistory: [
      { rev: 'Rev 1', date: '2025-05-10', author: 'R. Brown', changes: 'Initial issue' },
    ],
  },
  {
    id: '10', docNumber: 'QMS-SOP-001', title: 'Calibration SOP', category: 'SOP', status: 'Obsolete',
    currentRevision: 'Rev 3', revisionDate: '2024-06-15', nextReviewDate: '2025-06-15', owner: 'Metrology Lead',
    approver: 'Quality Manager', department: 'Quality Control', isoClause: '7.1.5',
    description: 'Standard operating procedure for the calibration of measuring and test equipment. Superseded by QMS-PRO-010.',
    revisionHistory: [
      { rev: 'Rev 3', date: '2024-06-15', author: 'L. Chen', changes: 'Obsoleted — replaced by QMS-PRO-010' },
    ],
  },
  {
    id: '11', docNumber: 'QMS-REC-001', title: 'Management Review Minutes Template', category: 'Record', status: 'Approved',
    currentRevision: 'Rev 2', revisionDate: '2025-12-01', nextReviewDate: '2026-12-01', owner: 'Quality Manager',
    approver: 'Managing Director', department: 'Quality', isoClause: '9.3',
    description: 'Template for recording management review meetings, inputs, outputs, and action items.',
    revisionHistory: [
      { rev: 'Rev 2', date: '2025-12-01', author: 'J. Smith', changes: 'Added KPI tracking table' },
    ],
  },
];

const statusConfig: Record<DocStatus, { bg: string; text: string; icon: typeof CheckCircle }> = {
  Draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
  'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  Approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  Obsolete: { bg: 'bg-red-100', text: 'text-red-700', icon: Archive },
};

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export default function DocumentRegisterClient() {
  const [documents] = useState(MOCK_DOCUMENTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('');
  const [selectedDoc, setSelectedDoc] = useState<ControlledDocument | null>(null);

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      if (search && !`${doc.docNumber} ${doc.title} ${doc.owner}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && doc.status !== filterStatus) return false;
      if (filterCategory && doc.category !== filterCategory) return false;
      if (filterDept && doc.department !== filterDept) return false;
      return true;
    });
  }, [documents, search, filterStatus, filterCategory, filterDept]);

  const departments = [...new Set(documents.map(d => d.department))].sort();
  const categories: DocCategory[] = ['Policy', 'Manual', 'Procedure', 'SOP', 'Work Instruction', 'Form', 'Record', 'Specification'];

  // Stats
  const approved = documents.filter(d => d.status === 'Approved').length;
  const underReview = documents.filter(d => d.status === 'Under Review').length;
  const drafts = documents.filter(d => d.status === 'Draft').length;
  const overdueReviews = documents.filter(d => d.status === 'Approved' && isOverdue(d.nextReviewDate)).length;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Control Register</h1>
          <p className="text-sm text-gray-500 mt-1">ISO 9001:2015 Clause 7.5 — Controlled documents, revision history, and review schedules</p>
        </div>
        <a href="/documents" className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          Document Manager
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-700">{approved}</p>
          <p className="text-[10px] text-green-500">Approved</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-yellow-700">{underReview}</p>
          <p className="text-[10px] text-yellow-500">Under Review</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <FileText className="h-5 w-5 text-gray-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-700">{drafts}</p>
          <p className="text-[10px] text-gray-500">Drafts</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-700">{overdueReviews}</p>
          <p className="text-[10px] text-red-500">Overdue Reviews</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs border rounded-md w-full"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border rounded px-2 py-1.5">
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Obsolete">Obsolete</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="text-xs border rounded px-2 py-1.5">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="text-xs border rounded px-2 py-1.5">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} documents</span>
      </div>

      {/* Document table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Doc Number</th>
              <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Title</th>
              <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Category</th>
              <th className="text-center py-2.5 px-3 font-semibold text-gray-600">Status</th>
              <th className="text-center py-2.5 px-3 font-semibold text-gray-600">Rev</th>
              <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Owner</th>
              <th className="text-left py-2.5 px-3 font-semibold text-gray-600">ISO Clause</th>
              <th className="text-left py-2.5 px-3 font-semibold text-gray-600">Next Review</th>
              <th className="text-center py-2.5 px-3 font-semibold text-gray-600">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(doc => {
              const sc = statusConfig[doc.status];
              const overdue = doc.status === 'Approved' && isOverdue(doc.nextReviewDate);
              const isSelected = selectedDoc?.id === doc.id;

              return (
                <tr
                  key={doc.id}
                  className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedDoc(isSelected ? null : doc)}
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-blue-700">{doc.docNumber}</td>
                  <td className="py-2.5 px-3 text-gray-900 font-medium max-w-[250px] truncate">{doc.title}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="secondary" className="text-[9px]">{doc.category}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-gray-500">{doc.currentRevision}</td>
                  <td className="py-2.5 px-3 text-gray-600">{doc.owner}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-500">{doc.isoClause}</td>
                  <td className="py-2.5 px-3">
                    <span className={`font-mono ${overdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                      {overdue ? 'OVERDUE' : doc.nextReviewDate}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <Eye className="h-3.5 w-3.5 text-gray-400 inline-block" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedDoc && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-mono font-bold text-blue-700">{selectedDoc.docNumber}</span>
                <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${statusConfig[selectedDoc.status].bg} ${statusConfig[selectedDoc.status].text}`}>{selectedDoc.status}</span>
                <Badge variant="secondary" className="text-[9px]">{selectedDoc.category}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedDoc.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{selectedDoc.description}</p>
            </div>
            <button onClick={() => setSelectedDoc(null)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>

          <div className="grid grid-cols-4 gap-4 text-xs mb-4">
            <div><span className="text-gray-500">Revision:</span> <span className="font-medium text-gray-900">{selectedDoc.currentRevision}</span></div>
            <div><span className="text-gray-500">Revision Date:</span> <span className="font-medium text-gray-900">{selectedDoc.revisionDate}</span></div>
            <div><span className="text-gray-500">Owner:</span> <span className="font-medium text-gray-900">{selectedDoc.owner}</span></div>
            <div><span className="text-gray-500">Approver:</span> <span className="font-medium text-gray-900">{selectedDoc.approver}</span></div>
            <div><span className="text-gray-500">Department:</span> <span className="font-medium text-gray-900">{selectedDoc.department}</span></div>
            <div><span className="text-gray-500">ISO Clause:</span> <span className="font-mono font-medium text-gray-900">{selectedDoc.isoClause}</span></div>
            <div><span className="text-gray-500">Next Review:</span> <span className={`font-medium ${isOverdue(selectedDoc.nextReviewDate) ? 'text-red-600' : 'text-gray-900'}`}>{selectedDoc.nextReviewDate}</span></div>
          </div>

          {/* Revision History */}
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Revision History</h4>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Rev</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Author</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Change Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {selectedDoc.revisionHistory.map((rev, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-mono font-medium text-gray-700">{rev.rev}</td>
                    <td className="py-2 px-3 text-gray-500">{rev.date}</td>
                    <td className="py-2 px-3 text-gray-700">{rev.author}</td>
                    <td className="py-2 px-3 text-gray-600">{rev.changes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
