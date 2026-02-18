'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ClipboardCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

interface Audit {
  id: string;
  auditNumber: string;
  type: 'FCA' | 'PCA' | 'internal';
  status: 'planned' | 'in-progress' | 'completed' | 'closed';
  findings: { major: number; minor: number; observations: number };
  auditor: string;
  auditDate: string;
  scope: string;
  area: string;
}

const MOCK_AUDITS: Audit[] = [
  {
    id: '1',
    auditNumber: 'AUD-2026-001',
    type: 'FCA',
    status: 'completed',
    findings: { major: 0, minor: 1, observations: 3 },
    auditor: 'P. Nakamura',
    auditDate: '2026-01-08',
    scope: 'Airframe Assembly — Functional Configuration Audit',
    area: 'Production',
  },
  {
    id: '2',
    auditNumber: 'AUD-2026-002',
    type: 'PCA',
    status: 'in-progress',
    findings: { major: 1, minor: 2, observations: 1 },
    auditor: 'S. Williams',
    auditDate: '2026-01-15',
    scope: 'Avionics Suite — Physical Configuration Audit against drawing package',
    area: 'Avionics',
  },
  {
    id: '3',
    auditNumber: 'AUD-2026-003',
    type: 'internal',
    status: 'planned',
    findings: { major: 0, minor: 0, observations: 0 },
    auditor: 'R. Patel',
    auditDate: '2026-02-20',
    scope: 'Document control and configuration management procedures',
    area: 'Quality',
  },
  {
    id: '4',
    auditNumber: 'AUD-2026-004',
    type: 'internal',
    status: 'completed',
    findings: { major: 0, minor: 3, observations: 5 },
    auditor: 'M. Chen',
    auditDate: '2026-01-22',
    scope: 'Supplier configuration data packages — AS9100D Clause 8.4',
    area: 'Supply Chain',
  },
  {
    id: '5',
    auditNumber: 'AUD-2026-005',
    type: 'FCA',
    status: 'closed',
    findings: { major: 0, minor: 0, observations: 2 },
    auditor: 'L. Morgan',
    auditDate: '2025-12-10',
    scope: 'Propulsion System — all functional requirements validated against test data',
    area: 'Propulsion',
  },
  {
    id: '6',
    auditNumber: 'AUD-2026-006',
    type: 'PCA',
    status: 'planned',
    findings: { major: 0, minor: 0, observations: 0 },
    auditor: 'J. Harrison',
    auditDate: '2026-03-05',
    scope: 'Landing Gear assembly — drawing versus physical configuration verification',
    area: 'Structures',
  },
  {
    id: '7',
    auditNumber: 'AUD-2025-098',
    type: 'internal',
    status: 'closed',
    findings: { major: 2, minor: 4, observations: 6 },
    auditor: 'T. Brooks',
    auditDate: '2025-11-15',
    scope: 'Configuration Management System full-scope internal audit — AS9100D readiness review',
    area: 'Quality',
  },
];

const STATUS_CONFIG = {
  planned: { label: 'Planned', bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
  'in-progress': { label: 'In Progress', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 },
  closed: {
    label: 'Closed',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-500 dark:text-gray-400',
    icon: XCircle,
  },
};

const TYPE_CONFIG = {
  FCA: { label: 'FCA', bg: 'bg-purple-100', text: 'text-purple-700' },
  PCA: { label: 'PCA', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  internal: { label: 'Internal', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600' },
};

export default function ConfigAuditsClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_AUDITS.filter((a) => {
      const matchSearch =
        a.auditNumber.toLowerCase().includes(search.toLowerCase()) ||
        a.scope.toLowerCase().includes(search.toLowerCase()) ||
        a.auditor.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchType = typeFilter === 'all' || a.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [search, statusFilter, typeFilter]);

  const totalMajor = MOCK_AUDITS.reduce((s, a) => s + a.findings.major, 0);
  const totalMinor = MOCK_AUDITS.reduce((s, a) => s + a.findings.minor, 0);
  const totalObs = MOCK_AUDITS.reduce((s, a) => s + a.findings.observations, 0);
  const openCount = MOCK_AUDITS.filter(
    (a) => a.status === 'planned' || a.status === 'in-progress'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Configuration Audits
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              AS9100D — FCA, PCA & Internal Configuration Audits
            </p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Schedule Audit
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Open / In Progress
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{openCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active audits</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">
              Major Findings
            </p>
            <p className="text-3xl font-bold text-red-700 mt-1">{totalMajor}</p>
            <p className="text-xs text-red-500 mt-1">Require immediate action</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">
              Minor Findings
            </p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{totalMinor}</p>
            <p className="text-xs text-orange-500 mt-1">Corrective actions needed</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Observations
            </p>
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300 mt-1">{totalObs}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Improvement opportunities
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search audit number, scope, auditor..."
              placeholder="Search audit number, scope, auditor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="closed">Closed</option>
          </select>
          <select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="FCA">FCA</option>
            <option value="PCA">PCA</option>
            <option value="internal">Internal</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Audit #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Scope</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Area</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Findings</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Auditor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((audit) => {
                const sc = STATUS_CONFIG[audit.status];
                const tc = TYPE_CONFIG[audit.type];
                const StatusIcon = sc.icon;
                return (
                  <tr key={audit.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-3 font-mono font-medium text-blue-700">
                      {audit.auditNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${tc.bg} ${tc.text}`}
                      >
                        {tc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs">
                      <p className="truncate">{audit.scope}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {audit.area}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {audit.findings.major > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            {audit.findings.major}M
                          </span>
                        )}
                        {audit.findings.minor > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-700">
                            <AlertTriangle className="w-3 h-3" />
                            {audit.findings.minor}m
                          </span>
                        )}
                        {audit.findings.observations > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600">
                            <Info className="w-3 h-3" />
                            {audit.findings.observations}
                          </span>
                        )}
                        {audit.findings.major === 0 &&
                          audit.findings.minor === 0 &&
                          audit.findings.observations === 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{audit.auditor}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {audit.auditDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.bg} ${sc.text}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No audits match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
