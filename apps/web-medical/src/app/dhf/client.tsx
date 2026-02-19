'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  FolderOpen,
  ChevronDown,
  ChevronRight } from 'lucide-react';

interface DHFDocument {
  id: string;
  docNumber: string;
  title: string;
  type:
    | 'design-input'
    | 'design-output'
    | 'verification'
    | 'validation'
    | 'review'
    | 'transfer'
    | 'change';
  version: string;
  status: 'draft' | 'review' | 'approved' | 'obsolete';
  product: string;
  author: string;
  lastModified: string;
  approver: string;
}

interface DHFRecord {
  id: string;
  product: string;
  phase:
    | 'concept'
    | 'feasibility'
    | 'design'
    | 'verification'
    | 'validation'
    | 'transfer'
    | 'production';
  documents: DHFDocument[];
  completeness: number;
}

const dhfRecords: DHFRecord[] = [
  {
    id: '1',
    product: 'CardioMonitor Pro X3',
    phase: 'production',
    completeness: 95,
    documents: [
      {
        id: 'd1',
        docNumber: 'DHF-CMX3-001',
        title: 'Design Input Requirements',
        type: 'design-input',
        version: '3.2',
        status: 'approved',
        product: 'CardioMonitor Pro X3',
        author: 'Dr. Chen',
        lastModified: '2025-08-15',
        approver: 'Dr. Zhang' },
      {
        id: 'd2',
        docNumber: 'DHF-CMX3-002',
        title: 'Design Output Specifications',
        type: 'design-output',
        version: '3.1',
        status: 'approved',
        product: 'CardioMonitor Pro X3',
        author: 'J. Wilson',
        lastModified: '2025-09-20',
        approver: 'Dr. Chen' },
      {
        id: 'd3',
        docNumber: 'DHF-CMX3-003',
        title: 'Verification Test Protocol',
        type: 'verification',
        version: '2.0',
        status: 'approved',
        product: 'CardioMonitor Pro X3',
        author: 'E. Rodriguez',
        lastModified: '2025-10-10',
        approver: 'Dr. Zhang' },
      {
        id: 'd4',
        docNumber: 'DHF-CMX3-004',
        title: 'Clinical Validation Report',
        type: 'validation',
        version: '1.5',
        status: 'approved',
        product: 'CardioMonitor Pro X3',
        author: 'Dr. Chen',
        lastModified: '2025-11-30',
        approver: 'Regulatory' },
      {
        id: 'd5',
        docNumber: 'DHF-CMX3-005',
        title: 'Design Review Minutes',
        type: 'review',
        version: '4.0',
        status: 'approved',
        product: 'CardioMonitor Pro X3',
        author: 'L. Park',
        lastModified: '2025-12-05',
        approver: 'Dr. Chen' },
      {
        id: 'd6',
        docNumber: 'DHF-CMX3-006',
        title: 'Design Transfer Checklist',
        type: 'transfer',
        version: '1.0',
        status: 'approved',
        product: 'CardioMonitor Pro X3',
        author: 'R. Kim',
        lastModified: '2026-01-10',
        approver: 'Quality' },
    ] },
  {
    id: '2',
    product: 'NeuroStim Controller V2',
    phase: 'validation',
    completeness: 72,
    documents: [
      {
        id: 'd7',
        docNumber: 'DHF-NSV2-001',
        title: 'Design Input Requirements',
        type: 'design-input',
        version: '2.5',
        status: 'approved',
        product: 'NeuroStim Controller V2',
        author: 'Dr. Zhang',
        lastModified: '2025-06-20',
        approver: 'Dr. Chen' },
      {
        id: 'd8',
        docNumber: 'DHF-NSV2-002',
        title: 'Software Requirements Specification',
        type: 'design-input',
        version: '2.3',
        status: 'approved',
        product: 'NeuroStim Controller V2',
        author: 'J. Wilson',
        lastModified: '2025-07-15',
        approver: 'Dr. Zhang' },
      {
        id: 'd9',
        docNumber: 'DHF-NSV2-003',
        title: 'Verification Test Results',
        type: 'verification',
        version: '1.8',
        status: 'review',
        product: 'NeuroStim Controller V2',
        author: 'E. Rodriguez',
        lastModified: '2026-02-01',
        approver: 'Pending' },
      {
        id: 'd10',
        docNumber: 'DHF-NSV2-004',
        title: 'Usability Validation Protocol',
        type: 'validation',
        version: '1.0',
        status: 'draft',
        product: 'NeuroStim Controller V2',
        author: 'Dr. Chen',
        lastModified: '2026-02-10',
        approver: 'Pending' },
    ] },
  {
    id: '3',
    product: 'DiagnosScan Portable',
    phase: 'design',
    completeness: 35,
    documents: [
      {
        id: 'd11',
        docNumber: 'DHF-DSP-001',
        title: 'User Needs Document',
        type: 'design-input',
        version: '1.2',
        status: 'approved',
        product: 'DiagnosScan Portable',
        author: 'Dr. Chen',
        lastModified: '2026-01-05',
        approver: 'Dr. Zhang' },
      {
        id: 'd12',
        docNumber: 'DHF-DSP-002',
        title: 'Design Specifications',
        type: 'design-output',
        version: '0.8',
        status: 'draft',
        product: 'DiagnosScan Portable',
        author: 'J. Wilson',
        lastModified: '2026-02-08',
        approver: 'Pending' },
    ] },
  {
    id: '4',
    product: 'SurgiView Endoscope',
    phase: 'transfer',
    completeness: 88,
    documents: [
      {
        id: 'd13',
        docNumber: 'DHF-SVE-001',
        title: 'Design Input Requirements',
        type: 'design-input',
        version: '4.0',
        status: 'approved',
        product: 'SurgiView Endoscope',
        author: 'E. Rodriguez',
        lastModified: '2025-03-10',
        approver: 'Dr. Chen' },
      {
        id: 'd14',
        docNumber: 'DHF-SVE-005',
        title: 'Risk Management File',
        type: 'review',
        version: '3.2',
        status: 'approved',
        product: 'SurgiView Endoscope',
        author: 'Dr. Zhang',
        lastModified: '2025-12-20',
        approver: 'Regulatory' },
      {
        id: 'd15',
        docNumber: 'DHF-SVE-006',
        title: 'Design Transfer Report',
        type: 'transfer',
        version: '1.0',
        status: 'review',
        product: 'SurgiView Endoscope',
        author: 'R. Kim',
        lastModified: '2026-01-28',
        approver: 'Pending' },
    ] },
];

const phaseLabels = [
  'concept',
  'feasibility',
  'design',
  'verification',
  'validation',
  'transfer',
  'production',
];
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
  review: { label: 'In Review', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  obsolete: { label: 'Obsolete', color: 'bg-red-100 text-red-600' } };
const typeLabels: Record<string, string> = {
  'design-input': 'Design Input',
  'design-output': 'Design Output',
  verification: 'Verification',
  validation: 'Validation',
  review: 'Review',
  transfer: 'Transfer',
  change: 'Change' };

export default function DHFClient() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const filtered = useMemo(() => {
    return dhfRecords.filter(
      (r) => !search || r.product.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Design History File (DHF)
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Device design documentation per FDA 21 CFR 820.30 / ISO 13485:2016 Clause 7.3
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Active DHFs
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {dhfRecords.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Total Documents
          </p>
          <p className="text-3xl font-bold text-blue-700 mt-1">
            {dhfRecords.reduce((s, r) => s + r.documents.length, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Pending Review
          </p>
          <p className="text-3xl font-bold text-amber-700 mt-1">
            {dhfRecords.reduce(
              (s, r) => s + r.documents.filter((d) => d.status === 'review').length,
              0
            )}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
            Avg Completeness
          </p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">
            {Math.round(dhfRecords.reduce((s, r) => s + r.completeness, 0) / dhfRecords.length)}%
          </p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          aria-label="Search products..."
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((dhf) => {
          const isExpanded = expandedId === dhf.id;
          const phaseIndex = phaseLabels.indexOf(dhf.phase);
          return (
            <div
              key={dhf.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : dhf.id)}
                className="w-full text-left px-4 py-4 hover:bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                    <FolderOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {dhf.product}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dhf.documents.length} documents · Phase: {dhf.phase}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${dhf.completeness >= 80 ? 'bg-emerald-500' : dhf.completeness >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${dhf.completeness}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-10">
                      {dhf.completeness}%
                    </span>
                  </div>
                </div>
                {/* Phase progress */}
                <div className="flex items-center gap-0.5 mt-3 ml-12">
                  {phaseLabels.map((p, i) => (
                    <div key={p} className="flex-1 text-center">
                      <div
                        className={`h-1.5 rounded-full ${i <= phaseIndex ? 'bg-blue-500' : 'bg-gray-200'}`}
                      />
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
                        {p}
                      </p>
                    </div>
                  ))}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-28">
                          Doc Number
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400">
                          Title
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-24">
                          Type
                        </th>
                        <th className="text-center px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-16">
                          Ver
                        </th>
                        <th className="text-center px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-24">
                          Status
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500 dark:text-gray-400 w-24">
                          Modified
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dhf.documents.map((doc) => {
                        const sc = statusConfig[doc.status];
                        return (
                          <tr
                            key={doc.id}
                            className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800"
                          >
                            <td className="px-4 py-2 font-mono text-xs text-blue-600">
                              {doc.docNumber}
                            </td>
                            <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100 text-xs">
                              {doc.title}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                              {typeLabels[doc.type]}
                            </td>
                            <td className="px-4 py-2 text-center text-xs text-gray-600">
                              v{doc.version}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}
                              >
                                {sc.label}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                              {doc.lastModified}
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
    </div>
  );
}
