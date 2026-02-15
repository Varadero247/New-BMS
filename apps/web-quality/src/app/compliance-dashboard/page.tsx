'use client';

import { useState } from 'react';
import { Card, CardContent, Badge, AIDisclosure } from '@ims/ui';

interface ClauseStatus {
  clause: string;
  title: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';
  evidence: number;
  required: number;
  subClauses: SubClause[];
  link?: string;
}

interface SubClause {
  id: string;
  title: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-assessed';
  notes?: string;
}

const clauseData: ClauseStatus[] = [
  {
    clause: '4',
    title: 'Context of the Organisation',
    description: 'Understanding the organisation, interested parties, scope, and QMS',
    status: 'compliant',
    evidence: 12,
    required: 12,
    link: '/risks',
    subClauses: [
      { id: '4.1', title: 'Understanding the organisation and its context', status: 'compliant' },
      { id: '4.2', title: 'Understanding the needs and expectations of interested parties', status: 'compliant' },
      { id: '4.3', title: 'Determining the scope of the QMS', status: 'compliant' },
      { id: '4.4', title: 'Quality management system and its processes', status: 'compliant' },
    ],
  },
  {
    clause: '5',
    title: 'Leadership',
    description: 'Top management commitment, policy, and organisational roles',
    status: 'compliant',
    evidence: 8,
    required: 8,
    link: '/raci',
    subClauses: [
      { id: '5.1', title: 'Leadership and commitment', status: 'compliant' },
      { id: '5.2', title: 'Policy', status: 'compliant' },
      { id: '5.3', title: 'Organisational roles, responsibilities and authorities', status: 'compliant', notes: 'RACI matrix fully defined' },
    ],
  },
  {
    clause: '6',
    title: 'Planning',
    description: 'Actions to address risks/opportunities, quality objectives, and planning changes',
    status: 'partial',
    evidence: 9,
    required: 10,
    link: '/risks',
    subClauses: [
      { id: '6.1', title: 'Actions to address risks and opportunities', status: 'compliant' },
      { id: '6.2', title: 'Quality objectives and planning to achieve them', status: 'partial', notes: '1 objective missing KPI metric' },
      { id: '6.3', title: 'Planning of changes', status: 'compliant' },
    ],
  },
  {
    clause: '7',
    title: 'Support',
    description: 'Resources, competence, awareness, communication, and documented information',
    status: 'partial',
    evidence: 14,
    required: 18,
    subClauses: [
      { id: '7.1', title: 'Resources (including monitoring/measuring)', status: 'partial', notes: '2 calibrations overdue' },
      { id: '7.2', title: 'Competence', status: 'partial', notes: '3 competence records need review' },
      { id: '7.3', title: 'Awareness', status: 'compliant' },
      { id: '7.4', title: 'Communication', status: 'compliant' },
      { id: '7.5', title: 'Documented information', status: 'compliant' },
    ],
  },
  {
    clause: '8',
    title: 'Operation',
    description: 'Operational planning, requirements, design, production, and release',
    status: 'compliant',
    evidence: 22,
    required: 22,
    subClauses: [
      { id: '8.1', title: 'Operational planning and control', status: 'compliant' },
      { id: '8.2', title: 'Requirements for products and services', status: 'compliant' },
      { id: '8.3', title: 'Design and development', status: 'compliant' },
      { id: '8.4', title: 'Control of externally provided processes', status: 'compliant' },
      { id: '8.5', title: 'Production and service provision', status: 'compliant' },
      { id: '8.6', title: 'Release of products and services', status: 'compliant', notes: 'Release register active' },
      { id: '8.7', title: 'Control of nonconforming outputs', status: 'compliant' },
    ],
  },
  {
    clause: '9',
    title: 'Performance Evaluation',
    description: 'Monitoring, measurement, analysis, evaluation, and management review',
    status: 'partial',
    evidence: 7,
    required: 10,
    link: '/management-reviews',
    subClauses: [
      { id: '9.1', title: 'Monitoring, measurement, analysis and evaluation', status: 'compliant' },
      { id: '9.2', title: 'Internal audit', status: 'partial', notes: 'Next audit due in 14 days' },
      { id: '9.3', title: 'Management review', status: 'partial', notes: 'Q1 2026 review pending' },
    ],
  },
  {
    clause: '10',
    title: 'Improvement',
    description: 'Nonconformity, corrective action, and continual improvement',
    status: 'compliant',
    evidence: 15,
    required: 15,
    link: '/capa',
    subClauses: [
      { id: '10.1', title: 'General', status: 'compliant' },
      { id: '10.2', title: 'Nonconformity and corrective action', status: 'compliant' },
      { id: '10.3', title: 'Continual improvement', status: 'compliant' },
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; darkColor: string; variant: string }> = {
  compliant: { label: 'Compliant', color: 'text-green-700 bg-green-100', darkColor: 'dark:text-green-300 dark:bg-green-900/40', variant: 'success' },
  partial: { label: 'Partial', color: 'text-yellow-700 bg-yellow-100', darkColor: 'dark:text-yellow-300 dark:bg-yellow-900/40', variant: 'warning' },
  'non-compliant': { label: 'Non-Compliant', color: 'text-red-700 bg-red-100', darkColor: 'dark:text-red-300 dark:bg-red-900/40', variant: 'danger' },
  'not-assessed': { label: 'Not Assessed', color: 'text-gray-600 bg-gray-100', darkColor: 'dark:text-gray-400 dark:bg-gray-700/40', variant: 'default' },
};

export default function ComplianceDashboardPage() {
  const [expandedClause, setExpandedClause] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const totalClauses = clauseData.length;
  const compliantClauses = clauseData.filter(c => c.status === 'compliant').length;
  const partialClauses = clauseData.filter(c => c.status === 'partial').length;
  const nonCompliantClauses = clauseData.filter(c => c.status === 'non-compliant').length;
  const overallPct = Math.round((compliantClauses / totalClauses) * 100);

  const totalEvidence = clauseData.reduce((s, c) => s + c.evidence, 0);
  const totalRequired = clauseData.reduce((s, c) => s + c.required, 0);
  const evidencePct = totalRequired > 0 ? Math.round((totalEvidence / totalRequired) * 100) : 0;

  const filtered = filterStatus ? clauseData.filter(c => c.status === filterStatus) : clauseData;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">ISO 9001:2015 Compliance Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Clause-by-clause compliance status and gap analysis</p>
      </div>

      <AIDisclosure variant="banner" provider="claude" analysisType="Compliance Analysis" confidence={0.92} />

      {/* Overall gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-300" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" strokeWidth="3"
                  className="text-brand-600" strokeDasharray={`${overallPct} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{overallPct}%</span>
                <span className="text-[10px] text-muted-foreground uppercase">Compliant</span>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{compliantClauses} of {totalClauses} clauses fully compliant</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Evidence Coverage</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{totalEvidence} / {totalRequired} items</span>
              <span className="font-bold text-brand-600">{evidencePct}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div className="bg-brand-600 rounded-full h-3 transition-all" style={{ width: `${evidencePct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /><span className="text-muted-foreground">Compliant: {compliantClauses}</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /><span className="text-muted-foreground">Partial: {partialClauses}</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="text-muted-foreground">Non-Compliant: {nonCompliantClauses}</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-400" /><span className="text-muted-foreground">Not Assessed: {clauseData.filter(c => c.status === 'not-assessed').length}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Upcoming Actions</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30">
                <span className="h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
                <div className="text-xs"><span className="font-medium text-yellow-800 dark:text-yellow-300">&sect;9.2 Internal Audit</span><span className="text-yellow-600 dark:text-yellow-400"> &mdash; due in 14 days</span></div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30">
                <span className="h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
                <div className="text-xs"><span className="font-medium text-yellow-800 dark:text-yellow-300">&sect;9.3 Management Review</span><span className="text-yellow-600 dark:text-yellow-400"> &mdash; Q1 2026 pending</span></div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30">
                <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                <div className="text-xs"><span className="font-medium text-orange-800 dark:text-orange-300">&sect;7.1.5 Calibrations</span><span className="text-orange-600 dark:text-orange-400"> &mdash; 2 overdue</span></div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/30">
                <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                <div className="text-xs"><span className="font-medium text-brand-800 dark:text-brand-300">&sect;7.2 Competence</span><span className="text-brand-600 dark:text-brand-400"> &mdash; 3 records need review</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filter:</span>
        {[
          { value: '', label: 'All Clauses' },
          { value: 'compliant', label: 'Compliant' },
          { value: 'partial', label: 'Partial' },
          { value: 'non-compliant', label: 'Non-Compliant' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filterStatus === f.value
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-card text-foreground border-border hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Clause-by-clause */}
      <div className="space-y-3">
        {filtered.map(clause => {
          const isExpanded = expandedClause === clause.clause;
          const sc = statusConfig[clause.status];
          const clauseEvidencePct = clause.required > 0 ? Math.round((clause.evidence / clause.required) * 100) : 0;

          return (
            <div key={clause.clause} className="bg-card rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedClause(isExpanded ? null : clause.clause)}
                className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-bold text-sm shrink-0">
                  {clause.clause}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{clause.title}</h3>
                    <Badge variant={sc.variant as any}>{sc.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{clause.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Evidence</div>
                    <div className="text-sm font-medium text-foreground">{clause.evidence}/{clause.required}</div>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${clauseEvidencePct === 100 ? 'bg-green-500' : clauseEvidencePct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${clauseEvidencePct}%` }}
                    />
                  </div>
                  <svg className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-foreground w-20">Clause</th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">Requirement</th>
                        <th className="text-left px-4 py-2 font-medium text-foreground w-32">Status</th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {clause.subClauses.map(sub => {
                        const subSc = statusConfig[sub.status];
                        return (
                          <tr key={sub.id} className="hover:bg-muted/30">
                            <td className="px-4 py-2 font-mono text-xs text-brand-600 dark:text-brand-400">{sub.id}</td>
                            <td className="px-4 py-2 text-foreground">{sub.title}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${subSc.color} ${subSc.darkColor}`}>
                                {subSc.label}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-muted-foreground">{sub.notes || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {clause.link && (
                    <div className="px-4 py-2 border-t border-border bg-muted/30">
                      <a href={clause.link} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Go to related module &rarr;</a>
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
