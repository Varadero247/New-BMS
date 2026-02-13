'use client';

import { useState, useMemo } from 'react';
import { Search, AlertTriangle, CheckCircle, Clock, XCircle, ChevronDown, ChevronRight, Shield } from 'lucide-react';

interface CAPA {
  id: string;
  capaNumber: string;
  title: string;
  type: 'corrective' | 'preventive';
  source: 'complaint' | 'audit' | 'ncr' | 'capa-review' | 'risk-assessment';
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'investigation' | 'action-plan' | 'implementation' | 'verification' | 'closed';
  product: string;
  rootCause: string;
  owner: string;
  dateOpened: string;
  targetDate: string;
  daysOpen: number;
  effectivenessCheck: boolean;
}

const capas: CAPA[] = [
  { id: '1', capaNumber: 'CAPA-2026-001', title: 'Biocompatibility test failure on silicone housing', type: 'corrective', source: 'complaint', severity: 'critical', status: 'implementation', product: 'CardioMonitor Pro X3', rootCause: 'Supplier changed silicone formulation without notification', owner: 'Dr. Sarah Chen', dateOpened: '2026-01-08', targetDate: '2026-03-08', daysOpen: 36, effectivenessCheck: false },
  { id: '2', capaNumber: 'CAPA-2026-002', title: 'Software validation gap in alarm subsystem', type: 'corrective', source: 'audit', severity: 'major', status: 'verification', product: 'NeuroStim Controller V2', rootCause: 'Incomplete test coverage for edge-case alarm conditions', owner: 'James Wilson', dateOpened: '2026-01-15', targetDate: '2026-02-28', daysOpen: 29, effectivenessCheck: true },
  { id: '3', capaNumber: 'CAPA-2026-003', title: 'Labelling non-conformance — missing UDI on packaging', type: 'corrective', source: 'ncr', severity: 'major', status: 'closed', product: 'SurgiView Endoscope', rootCause: 'Label template not updated after UDI regulation change', owner: 'Emily Rodriguez', dateOpened: '2025-12-10', targetDate: '2026-01-31', daysOpen: 0, effectivenessCheck: true },
  { id: '4', capaNumber: 'CAPA-2026-004', title: 'Sterilization process deviation — EtO residuals above limit', type: 'corrective', source: 'ncr', severity: 'critical', status: 'investigation', product: 'OrthoFix Implant Kit', rootCause: 'Under investigation — aeration cycle parameters suspect', owner: 'Dr. Michael Zhang', dateOpened: '2026-02-05', targetDate: '2026-04-05', daysOpen: 8, effectivenessCheck: false },
  { id: '5', capaNumber: 'CAPA-2026-005', title: 'Preventive action for supplier qualification process', type: 'preventive', source: 'capa-review', severity: 'minor', status: 'action-plan', product: 'All Products', rootCause: 'Gap analysis identified insufficient supplier audit frequency', owner: 'Lisa Park', dateOpened: '2026-01-20', targetDate: '2026-03-20', daysOpen: 24, effectivenessCheck: false },
  { id: '6', capaNumber: 'CAPA-2026-006', title: 'Risk management file incomplete for design transfer', type: 'preventive', source: 'risk-assessment', severity: 'major', status: 'open', product: 'DiagnosScan Portable', rootCause: 'Pending investigation', owner: 'Dr. Sarah Chen', dateOpened: '2026-02-10', targetDate: '2026-04-10', daysOpen: 3, effectivenessCheck: false },
  { id: '7', capaNumber: 'CAPA-2025-042', title: 'Customer complaint — intermittent display failure', type: 'corrective', source: 'complaint', severity: 'major', status: 'closed', product: 'VitalSign Monitor M5', rootCause: 'Solder joint fatigue due to thermal cycling', owner: 'Robert Kim', dateOpened: '2025-11-05', targetDate: '2026-01-15', daysOpen: 0, effectivenessCheck: true },
];

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700', step: 1 },
  investigation: { label: 'Investigation', color: 'bg-purple-100 text-purple-700', step: 2 },
  'action-plan': { label: 'Action Plan', color: 'bg-indigo-100 text-indigo-700', step: 3 },
  implementation: { label: 'Implementation', color: 'bg-amber-100 text-amber-700', step: 4 },
  verification: { label: 'Verification', color: 'bg-cyan-100 text-cyan-700', step: 5 },
  closed: { label: 'Closed', color: 'bg-emerald-100 text-emerald-700', step: 6 },
};

const severityConfig: Record<string, { color: string }> = {
  critical: { color: 'bg-red-100 text-red-700' },
  major: { color: 'bg-orange-100 text-orange-700' },
  minor: { color: 'bg-yellow-100 text-yellow-700' },
};

const steps = ['Open', 'Investigation', 'Action Plan', 'Implementation', 'Verification', 'Closed'];

export default function CAPAClient() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const open = capas.filter((c) => c.status !== 'closed').length;
  const critical = capas.filter((c) => c.severity === 'critical' && c.status !== 'closed').length;
  const overdue = capas.filter((c) => c.status !== 'closed' && new Date(c.targetDate) < new Date('2026-02-13')).length;

  const filtered = useMemo(() => {
    return capas.filter((c) => {
      const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.capaNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesType = filterType === 'all' || c.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, filterStatus, filterType]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CAPA Management</h1>
        <p className="text-sm text-gray-500 mt-1">Corrective and Preventive Actions — FDA 21 CFR 820.90 / ISO 13485:2016</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Total CAPAs</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{capas.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Open</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{open}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Critical Open</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{critical}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase font-medium">Overdue</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{overdue}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search CAPAs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Types</option>
          <option value="corrective">Corrective</option>
          <option value="preventive">Preventive</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((capa) => {
          const sc = statusConfig[capa.status];
          const sev = severityConfig[capa.severity];
          const isExpanded = expandedId === capa.id;
          return (
            <div key={capa.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : capa.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-blue-600">{capa.capaNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sev.color}`}>{capa.severity}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${capa.type === 'corrective' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{capa.type === 'corrective' ? 'CA' : 'PA'}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{capa.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                    {capa.status !== 'closed' && <span className="text-xs text-gray-400">{capa.daysOpen}d open</span>}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-0.5 mt-2 ml-7">
                  {steps.map((s, i) => (
                    <div key={s} className="flex-1">
                      <div className={`h-1.5 rounded-full ${i + 1 <= sc.step ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    </div>
                  ))}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 ml-7 space-y-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-gray-500">Product:</span> <span className="font-medium text-gray-900">{capa.product}</span></div>
                    <div><span className="text-gray-500">Source:</span> <span className="font-medium text-gray-900">{capa.source}</span></div>
                    <div><span className="text-gray-500">Owner:</span> <span className="font-medium text-gray-900">{capa.owner}</span></div>
                    <div><span className="text-gray-500">Target:</span> <span className="font-medium text-gray-900">{capa.targetDate}</span></div>
                  </div>
                  <div className="text-xs"><span className="text-gray-500">Root Cause:</span> <span className="text-gray-700">{capa.rootCause}</span></div>
                  {capa.effectivenessCheck && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle className="h-3 w-3" /> Effectiveness check completed
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
