'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Shield, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface ProductSafetyAssessment {
  id: string;
  product: string;
  partNumber: string;
  hazardCategory: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  mitigations: string[];
  lastAssessed: string;
  nextReview: string;
  status: 'open' | 'mitigated' | 'accepted';
  assessedBy: string;
}

const MOCK_ASSESSMENTS: ProductSafetyAssessment[] = [
  { id: '1', product: 'Oxygen System Valve Assembly', partNumber: 'OS-7701-V', hazardCategory: 'Pressure / Hypoxia', riskLevel: 'critical', mitigations: ['Dual redundant shutoff valves', 'Pressure relief at 45 PSI', 'Visual and audio low-O2 warning system', 'Crew emergency procedures'], lastAssessed: '2026-01-20', nextReview: '2026-07-20', status: 'mitigated', assessedBy: 'L. Morgan' },
  { id: '2', product: 'Main Landing Gear Actuator', partNumber: 'LG-4401-M', hazardCategory: 'Structural Failure', riskLevel: 'critical', mitigations: ['Fracture-critical part designation', 'Enhanced NDT schedule (100-hr intervals)', 'Fatigue life tracking per AC 120-66B'], lastAssessed: '2026-01-15', nextReview: '2026-04-15', status: 'open', assessedBy: 'S. Williams' },
  { id: '3', product: 'Fuel System Manifold', partNumber: 'FS-9901-FM', hazardCategory: 'Fire / Ignition Source', riskLevel: 'high', mitigations: ['Fire-resistant materials (FAR 25.863)', 'Bonding and grounding verification', 'Vent path analysis'], lastAssessed: '2025-12-10', nextReview: '2026-06-10', status: 'mitigated', assessedBy: 'J. Harrison' },
  { id: '4', product: 'Pitot-Static System Probe', partNumber: 'PS-1101-P', hazardCategory: 'Erroneous Airspeed Indication', riskLevel: 'high', mitigations: ['Triple pitot probe redundancy', 'Pitot heat auto-activation', 'Crew awareness training'], lastAssessed: '2026-01-05', nextReview: '2026-07-05', status: 'accepted', assessedBy: 'P. Nakamura' },
  { id: '5', product: 'Emergency Exit Door Mechanism', partNumber: 'EX-2201-D', hazardCategory: 'Egress Failure', riskLevel: 'medium', mitigations: ['Secondary mechanical release', 'Load-limited deployment', 'Monthly functional checks'], lastAssessed: '2025-11-30', nextReview: '2026-05-30', status: 'mitigated', assessedBy: 'M. Chen' },
  { id: '6', product: 'Avionics Cooling Fan Assembly', partNumber: 'AV-3301-CF', hazardCategory: 'Overheating / Smoke', riskLevel: 'low', mitigations: ['Over-temperature shutoff at 85°C', 'Smoke detection in avionics bay'], lastAssessed: '2026-02-01', nextReview: '2027-02-01', status: 'accepted', assessedBy: 'T. Brooks' },
];

const RISK_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-300',    dot: 'bg-red-600' },
  high:     { label: 'High',     bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-400' },
  low:      { label: 'Low',      bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300',  dot: 'bg-green-500' },
};

const STATUS_CONFIG = {
  open:      { label: 'Open',      bg: 'bg-red-50',    text: 'text-red-700',    icon: AlertTriangle },
  mitigated: { label: 'Mitigated', bg: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle2 },
  accepted:  { label: 'Accepted',  bg: 'bg-blue-50',   text: 'text-blue-700',   icon: Shield },
};

export default function ProductSafetyClient() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_ASSESSMENTS.filter(a => {
      const matchSearch = a.product.toLowerCase().includes(search.toLowerCase()) || a.partNumber.toLowerCase().includes(search.toLowerCase()) || a.hazardCategory.toLowerCase().includes(search.toLowerCase());
      const matchRisk = riskFilter === 'all' || a.riskLevel === riskFilter;
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchSearch && matchRisk && matchStatus;
    });
  }, [search, riskFilter, statusFilter]);

  const counts = {
    critical: MOCK_ASSESSMENTS.filter(a => a.riskLevel === 'critical').length,
    high: MOCK_ASSESSMENTS.filter(a => a.riskLevel === 'high').length,
    open: MOCK_ASSESSMENTS.filter(a => a.status === 'open').length,
    mitigated: MOCK_ASSESSMENTS.filter(a => a.status === 'mitigated').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Product Safety</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">AS9100D Clause 8.1.1 — Safety of Products and Services</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Critical Risk</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{counts.critical}</p>
            <p className="text-xs text-red-500 mt-1">Highest priority items</p>
          </div>
          <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">High Risk</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{counts.high}</p>
            <p className="text-xs text-orange-500 mt-1">Close monitoring needed</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Open Items</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{counts.open}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mitigations pending</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Mitigated</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{counts.mitigated}</p>
            <p className="text-xs text-green-500 mt-1">Controls in place</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search product, part number, hazard..." placeholder="Search product, part number, hazard..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select aria-label="Filter by risk level" value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="mitigated">Mitigated</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        {/* Risk Cards */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(assessment => {
            const rc = RISK_CONFIG[assessment.riskLevel];
            const sc = STATUS_CONFIG[assessment.status];
            const StatusIcon = sc.icon;
            return (
              <div key={assessment.id} className={`bg-white dark:bg-gray-900 rounded-lg border ${rc.border} overflow-hidden hover:shadow-md transition-shadow`}>
                <div className={`px-5 py-3 ${rc.bg} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${rc.dot}`} />
                    <span className={`font-semibold text-sm ${rc.text}`}>{assessment.product}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${rc.bg} ${rc.text} border ${rc.border}`}>{rc.label} Risk</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.bg} ${sc.text}`}>
                      <StatusIcon className="w-3 h-3" />
                      {sc.label}
                    </span>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{assessment.partNumber}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Assessed by {assessment.assessedBy}</span>
                  </div>
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <ShieldAlert className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      <span className="font-medium">Hazard:</span> {assessment.hazardCategory}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 mb-1.5">Mitigations ({assessment.mitigations.length})</p>
                    <ul className="space-y-1">
                      {assessment.mitigations.map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <span>Last assessed: {assessment.lastAssessed}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Next review: {assessment.nextReview}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 py-16 text-center text-gray-400 dark:text-gray-500">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No product safety assessments match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
