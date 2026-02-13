'use client';

import { useState } from 'react';

interface ClauseStatus {
  clause: string;
  title: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';
  evidence: number;
  required: number;
  subClauses: { id: string; title: string; status: string; notes?: string }[];
  link?: string;
}

const clauseData: ClauseStatus[] = [
  {
    clause: '4', title: 'Context of the Organisation', status: 'compliant', evidence: 8, required: 8,
    subClauses: [
      { id: '4.1', title: 'Understanding the organisation and its context', status: 'compliant' },
      { id: '4.2', title: 'Understanding the needs of interested parties', status: 'compliant' },
      { id: '4.3', title: 'Determining the scope of the ABMS', status: 'compliant' },
      { id: '4.4', title: 'Anti-bribery management system', status: 'compliant' },
      { id: '4.5', title: 'Bribery risk assessment', status: 'compliant' },
    ],
  },
  {
    clause: '5', title: 'Leadership', status: 'compliant', evidence: 6, required: 6,
    subClauses: [
      { id: '5.1', title: 'Leadership and commitment', status: 'compliant' },
      { id: '5.2', title: 'Anti-bribery policy', status: 'compliant' },
      { id: '5.3', title: 'Organisational roles, responsibilities and authorities', status: 'compliant' },
    ],
    link: '/policies',
  },
  {
    clause: '6', title: 'Planning', status: 'partial', evidence: 4, required: 5,
    subClauses: [
      { id: '6.1', title: 'Actions to address risks and opportunities', status: 'compliant' },
      { id: '6.2', title: 'Anti-bribery objectives and planning', status: 'partial', notes: '1 objective missing target date' },
    ],
    link: '/risk-assessments',
  },
  {
    clause: '7', title: 'Support', status: 'partial', evidence: 7, required: 10,
    subClauses: [
      { id: '7.1', title: 'Resources', status: 'compliant' },
      { id: '7.2', title: 'Competence', status: 'partial', notes: '5 staff training overdue' },
      { id: '7.3', title: 'Awareness and training', status: 'partial', notes: 'Board training due Q2' },
      { id: '7.4', title: 'Communication', status: 'compliant' },
      { id: '7.5', title: 'Documented information', status: 'compliant' },
    ],
    link: '/training',
  },
  {
    clause: '8', title: 'Operation', status: 'compliant', evidence: 14, required: 14,
    subClauses: [
      { id: '8.1', title: 'Operational planning and control', status: 'compliant' },
      { id: '8.2', title: 'Due diligence', status: 'compliant' },
      { id: '8.3', title: 'Financial controls', status: 'compliant' },
      { id: '8.4', title: 'Non-financial controls', status: 'compliant' },
      { id: '8.5', title: 'Anti-bribery controls by associated persons', status: 'compliant' },
      { id: '8.6', title: 'Anti-bribery commitments', status: 'compliant' },
      { id: '8.7', title: 'Gifts, hospitality, donations and similar benefits', status: 'compliant' },
      { id: '8.8', title: 'Managing inadequacy of anti-bribery controls', status: 'compliant' },
      { id: '8.9', title: 'Raising concerns', status: 'compliant' },
      { id: '8.10', title: 'Investigating and dealing with bribery', status: 'compliant' },
    ],
    link: '/due-diligence',
  },
  {
    clause: '9', title: 'Performance Evaluation', status: 'partial', evidence: 5, required: 7,
    subClauses: [
      { id: '9.1', title: 'Monitoring, measurement, analysis and evaluation', status: 'compliant' },
      { id: '9.2', title: 'Internal audit', status: 'partial', notes: 'Annual ABMS audit due next month' },
      { id: '9.3', title: 'Management review', status: 'partial', notes: 'Q1 review scheduled' },
      { id: '9.4', title: 'Anti-bribery compliance function review', status: 'compliant' },
    ],
  },
  {
    clause: '10', title: 'Improvement', status: 'compliant', evidence: 4, required: 4,
    subClauses: [
      { id: '10.1', title: 'Nonconformity and corrective action', status: 'compliant' },
      { id: '10.2', title: 'Continual improvement', status: 'compliant' },
    ],
    link: '/investigations',
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  compliant: { label: 'Compliant', color: 'text-green-700', bg: 'bg-green-100' },
  partial: { label: 'Partial', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  'non-compliant': { label: 'Non-Compliant', color: 'text-red-700', bg: 'bg-red-100' },
  'not-assessed': { label: 'Not Assessed', color: 'text-gray-600', bg: 'bg-gray-100' },
};

export default function CompliancePage() {
  const [expandedClause, setExpandedClause] = useState<string | null>(null);

  const totalClauses = clauseData.length;
  const compliantCount = clauseData.filter(c => c.status === 'compliant').length;
  const overallPct = Math.round((compliantCount / totalClauses) * 100);
  const totalEvidence = clauseData.reduce((s, c) => s + c.evidence, 0);
  const totalRequired = clauseData.reduce((s, c) => s + c.required, 0);
  const evidencePct = totalRequired > 0 ? Math.round((totalEvidence / totalRequired) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ISO 37001:2016 Compliance Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Anti-Bribery Management System — Clause-by-clause conformity</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 flex flex-col items-center">
          <div className="relative h-20 w-20 mb-2">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e11d48" strokeWidth="3" strokeDasharray={`${overallPct} 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{overallPct}%</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">Clauses Compliant</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
          <div className="text-sm text-gray-500">Fully Compliant</div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 rounded-full h-2" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">{clauseData.filter(c => c.status === 'partial').length}</div>
          <div className="text-sm text-gray-500">Partially Compliant</div>
          <div className="text-xs text-gray-400 mt-2">Gaps identified</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-rose-600">{evidencePct}%</div>
          <div className="text-sm text-gray-500">Evidence Coverage</div>
          <div className="text-xs text-gray-400 mt-2">{totalEvidence} / {totalRequired} items</div>
        </div>
      </div>

      {/* Clauses */}
      <div className="space-y-2">
        {clauseData.map(clause => {
          const sc = statusConfig[clause.status];
          const isExpanded = expandedClause === clause.clause;
          const pct = clause.required > 0 ? Math.round((clause.evidence / clause.required) * 100) : 0;

          return (
            <div key={clause.clause} className="bg-white rounded-lg border overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedClause(isExpanded ? null : clause.clause)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-rose-50 text-rose-700 font-bold text-sm shrink-0">
                  {clause.clause}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{clause.title}</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.color}`}>{sc.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{clause.evidence}/{clause.required}</span>
                  <svg className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t">
                  <table className="w-full text-sm">
                    <tbody className="divide-y">
                      {clause.subClauses.map(sub => {
                        const subSc = statusConfig[sub.status] || statusConfig['not-assessed'];
                        return (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono text-xs text-rose-600 w-16">{sub.id}</td>
                            <td className="px-4 py-2 text-gray-900">{sub.title}</td>
                            <td className="px-4 py-2 w-28">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${subSc.bg} ${subSc.color}`}>{subSc.label}</span>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500">{sub.notes || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {clause.link && (
                    <div className="px-4 py-2 border-t bg-gray-50">
                      <a href={clause.link} className="text-xs text-rose-600 hover:underline">Go to related module →</a>
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
