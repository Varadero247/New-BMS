'use client';

import { useState } from 'react';
import { Search, CheckCircle, Clock, AlertTriangle, Users, ChevronDown, ChevronRight } from 'lucide-react';

interface ValidationActivity {
  id: string;
  validationId: string;
  title: string;
  product: string;
  type: 'clinical-evaluation' | 'usability' | 'process-validation' | 'software-validation' | 'packaging' | 'shelf-life';
  status: 'planned' | 'protocol-approved' | 'in-execution' | 'report-draft' | 'completed';
  protocol: string;
  startDate: string;
  endDate: string;
  participants: number;
  findings: number;
  owner: string;
  summary: string;
}

const activities: ValidationActivity[] = [
  { id: '1', validationId: 'VAL-CMX3-001', title: 'Clinical Evaluation — 30-day Monitoring Study', product: 'CardioMonitor Pro X3', type: 'clinical-evaluation', status: 'completed', protocol: 'PROT-CMX3-CE-001 v2.0', startDate: '2025-09-01', endDate: '2025-12-15', participants: 120, findings: 2, owner: 'Dr. Sarah Chen', summary: 'Study completed with 120 patients across 4 clinical sites. Primary endpoint met. Two minor usability findings noted and addressed in labelling update.' },
  { id: '2', validationId: 'VAL-CMX3-002', title: 'Summative Usability Test — IEC 62366', product: 'CardioMonitor Pro X3', type: 'usability', status: 'completed', protocol: 'PROT-CMX3-USE-001 v1.3', startDate: '2025-10-10', endDate: '2025-11-20', participants: 15, findings: 1, owner: 'L. Park', summary: 'Summative usability test with 15 representative users (nurses, cardiologists). No use errors leading to harm. One close call identified — mitigated by label update.' },
  { id: '3', validationId: 'VAL-NSV2-001', title: 'Formative Usability Study — Round 2', product: 'NeuroStim Controller V2', type: 'usability', status: 'in-execution', protocol: 'PROT-NSV2-USE-002 v1.0', startDate: '2026-02-01', endDate: '2026-03-15', participants: 8, findings: 0, owner: 'L. Park', summary: 'Second round of formative testing focusing on revised programming interface. 8 of 12 sessions completed.' },
  { id: '4', validationId: 'VAL-NSV2-002', title: 'Software Validation — IEC 62304 Class C', product: 'NeuroStim Controller V2', type: 'software-validation', status: 'protocol-approved', protocol: 'PROT-NSV2-SW-001 v1.0', startDate: '2026-02-20', endDate: '2026-04-30', participants: 0, findings: 0, owner: 'J. Wilson', summary: 'Full system-level software validation including fault injection, boundary conditions, and timing analysis. Protocol approved — execution pending.' },
  { id: '5', validationId: 'VAL-OFK-001', title: 'Process Validation — Sterilization (EtO)', product: 'OrthoFix Implant Kit', type: 'process-validation', status: 'completed', protocol: 'PROT-OFK-STER-001 v3.0', startDate: '2025-08-15', endDate: '2025-09-30', participants: 0, findings: 0, owner: 'Dr. M. Zhang', summary: 'IQ/OQ/PQ completed for EtO sterilization cycle. Bioburden and sterility testing confirmed SAL of 10^-6. All acceptance criteria met.' },
  { id: '6', validationId: 'VAL-SVE-001', title: 'Packaging Validation — ASTM D4169', product: 'SurgiView Endoscope', type: 'packaging', status: 'report-draft', protocol: 'PROT-SVE-PKG-001 v1.0', startDate: '2026-01-05', endDate: '2026-01-25', participants: 0, findings: 1, owner: 'R. Kim', summary: 'Distribution simulation testing complete. One minor finding: inner tray dislodged during vibration test. Corrective action implemented, re-test passed.' },
  { id: '7', validationId: 'VAL-DSP-001', title: 'Shelf-Life Validation — Accelerated Ageing', product: 'DiagnosScan Portable', type: 'shelf-life', status: 'planned', protocol: 'PROT-DSP-SL-001 v0.5', startDate: '2026-03-01', endDate: '2026-09-01', participants: 0, findings: 0, owner: 'E. Rodriguez', summary: 'Accelerated ageing study at 55°C/75% RH to demonstrate 3-year shelf life. Protocol in draft — awaiting review.' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  planned: { label: 'Planned', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
  'protocol-approved': { label: 'Protocol Approved', color: 'bg-blue-100 text-blue-700' },
  'in-execution': { label: 'In Execution', color: 'bg-amber-100 text-amber-700' },
  'report-draft': { label: 'Report Draft', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
};

const typeLabels: Record<string, string> = {
  'clinical-evaluation': 'Clinical Evaluation', usability: 'Usability', 'process-validation': 'Process Validation', 'software-validation': 'Software Validation', packaging: 'Packaging', 'shelf-life': 'Shelf Life',
};

export default function ValidationClient() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const completed = activities.filter((a) => a.status === 'completed').length;
  const inProgress = activities.filter((a) => a.status === 'in-execution').length;
  const totalFindings = activities.reduce((s, a) => s + a.findings, 0);

  const filtered = activities.filter((a) => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.product.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Design Validation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Clinical evaluation, usability, and process validation — ISO 13485:2016 Clause 7.3.7</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Activities</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{activities.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Completed</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">In Execution</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Findings</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalFindings}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Types</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((activity) => {
          const sc = statusConfig[activity.status];
          const isExpanded = expandedId === activity.id;
          return (
            <div key={activity.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : activity.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-blue-600">{activity.validationId}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600">{typeLabels[activity.type]}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">{activity.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.product}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                    {activity.participants > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"><Users className="h-3 w-3" />{activity.participants}</span>
                    )}
                  </div>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 space-y-2 ml-7">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-gray-500 dark:text-gray-400">Protocol:</span> <span className="font-medium text-gray-900 dark:text-gray-100">{activity.protocol}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Start:</span> <span className="font-medium">{activity.startDate}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">End:</span> <span className="font-medium">{activity.endDate}</span></div>
                    <div><span className="text-gray-500 dark:text-gray-400">Owner:</span> <span className="font-medium">{activity.owner}</span></div>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Summary:</span>
                    <p className="text-gray-700 dark:text-gray-300 mt-0.5">{activity.summary}</p>
                  </div>
                  {activity.findings > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" /> {activity.findings} finding(s) identified
                    </div>
                  )}
                  {activity.status === 'completed' && activity.findings === 0 && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle className="h-3 w-3" /> All acceptance criteria met — no findings
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
