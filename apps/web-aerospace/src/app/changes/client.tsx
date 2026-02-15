'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Plus, ChevronDown, ChevronRight, AlertTriangle, Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';

interface ECR {
  id: string;
  ecrNumber: string;
  title: string;
  type: 'major' | 'minor' | 'emergency';
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'rejected';
  impactLevel: 1 | 2 | 3 | 4;
  requestor: string;
  affectedParts: string[];
  dateSubmitted: string;
}

const MOCK_ECRS: ECR[] = [
  { id: '1', ecrNumber: 'ECR-2026-001', title: 'Update tolerance spec on Frame Assembly Bracket', type: 'major', status: 'review', impactLevel: 3, requestor: 'J. Harrison', affectedParts: ['AS-1042-A', 'AS-1043-B', 'AS-1044-C'], dateSubmitted: '2026-01-15' },
  { id: '2', ecrNumber: 'ECR-2026-002', title: 'Material substitution for Wing Spar Rib', type: 'emergency', status: 'approved', impactLevel: 4, requestor: 'M. Chen', affectedParts: ['WS-2201-X', 'WS-2202-X'], dateSubmitted: '2026-01-18' },
  { id: '3', ecrNumber: 'ECR-2026-003', title: 'Fastener torque spec revision — Fuselage Panel', type: 'minor', status: 'implemented', impactLevel: 1, requestor: 'R. Patel', affectedParts: ['FP-3310-A'], dateSubmitted: '2026-01-20' },
  { id: '4', ecrNumber: 'ECR-2026-004', title: 'Surface treatment process change — Landing Gear', type: 'major', status: 'draft', impactLevel: 3, requestor: 'S. Williams', affectedParts: ['LG-4401-M', 'LG-4402-M', 'LG-4403-M', 'LG-4404-M'], dateSubmitted: '2026-01-22' },
  { id: '5', ecrNumber: 'ECR-2026-005', title: 'Weld inspection criteria update — Engine Mount', type: 'minor', status: 'review', impactLevel: 2, requestor: 'T. Brooks', affectedParts: ['EM-5501-W', 'EM-5502-W'], dateSubmitted: '2026-01-25' },
  { id: '6', ecrNumber: 'ECR-2026-006', title: 'Drawing revision — Hydraulic Manifold Block', type: 'major', status: 'rejected', impactLevel: 2, requestor: 'A. Kumar', affectedParts: ['HM-6601-B'], dateSubmitted: '2026-01-28' },
  { id: '7', ecrNumber: 'ECR-2026-007', title: 'Emergency re-design of Oxygen System Valve seat', type: 'emergency', status: 'approved', impactLevel: 4, requestor: 'L. Morgan', affectedParts: ['OS-7701-V', 'OS-7702-V', 'OS-7703-V'], dateSubmitted: '2026-02-01' },
  { id: '8', ecrNumber: 'ECR-2026-008', title: 'NDT procedure update — Rotor Blade attachment', type: 'minor', status: 'implemented', impactLevel: 1, requestor: 'D. Foster', affectedParts: ['RB-8801-A', 'RB-8802-A'], dateSubmitted: '2026-02-05' },
];

const STATUS_CONFIG = {
  draft:       { label: 'Draft',       bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-700 dark:text-gray-300',   icon: FileEdit },
  review:      { label: 'In Review',   bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Clock },
  approved:    { label: 'Approved',    bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  implemented: { label: 'Implemented', bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle2 },
  rejected:    { label: 'Rejected',    bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle },
};

const TYPE_CONFIG = {
  major:     { label: 'Major',     bg: 'bg-orange-100', text: 'text-orange-700' },
  minor:     { label: 'Minor',     bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-600' },
  emergency: { label: 'Emergency', bg: 'bg-red-100',    text: 'text-red-700' },
};

const IMPACT_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Low',      color: 'bg-green-500' },
  2: { label: 'Medium',   color: 'bg-yellow-500' },
  3: { label: 'High',     color: 'bg-orange-500' },
  4: { label: 'Critical', color: 'bg-red-600' },
};

export default function EngineeringChangesClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_ECRS.filter(e => {
      const matchSearch = e.ecrNumber.toLowerCase().includes(search.toLowerCase()) || e.title.toLowerCase().includes(search.toLowerCase()) || e.requestor.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [search, statusFilter, typeFilter]);

  const counts = useMemo(() => ({
    total: MOCK_ECRS.length,
    open: MOCK_ECRS.filter(e => e.status === 'review' || e.status === 'draft').length,
    emergency: MOCK_ECRS.filter(e => e.type === 'emergency').length,
    implemented: MOCK_ECRS.filter(e => e.status === 'implemented').length,
  }), []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Engineering Changes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">AS9100D Clause 8.3.6 — Engineering Change Requests</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New ECR
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total ECRs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{counts.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Open / In Review</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{counts.open}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting action</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-red-200 p-4 bg-red-50">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Emergency</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{counts.emergency}</p>
            <p className="text-xs text-red-500 mt-1">Expedited review</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Implemented</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{counts.implemented}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Closed out</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search ECR number, title, requestor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="implemented">Implemented</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="w-6 px-4 py-3"></th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ECR Number</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Impact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Requestor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(ecr => {
                const status = STATUS_CONFIG[ecr.status];
                const type = TYPE_CONFIG[ecr.type];
                const impact = IMPACT_CONFIG[ecr.impactLevel];
                const StatusIcon = status.icon;
                const isExpanded = expandedId === ecr.id;
                return (
                  <>
                    <tr key={ecr.id} className="hover:bg-gray-50 dark:bg-gray-800 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : ecr.id)}>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-blue-700">{ecr.ecrNumber}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100 max-w-xs truncate">{ecr.title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${type.bg} ${type.text}`}>{type.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4].map(n => (
                              <div key={n} className={`w-2 h-4 rounded-sm ${n <= ecr.impactLevel ? impact.color : 'bg-gray-200'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{impact.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ecr.requestor}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{ecr.dateSubmitted}</td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${ecr.id}-expanded`} className="bg-blue-50">
                        <td colSpan={8} className="px-8 py-3">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-medium text-gray-600 mr-1">Affected Parts:</span>
                            {ecr.affectedParts.map(part => (
                              <span key={part} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">{part}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No engineering changes match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
