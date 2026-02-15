'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Microscope } from 'lucide-react';

interface SupplierVerification {
  id: string;
  partNumber: string;
  partDescription: string;
  supplier: string;
  verificationMethod: 'certificate' | 'xrf' | 'visual' | 'dimensional';
  status: 'verified' | 'suspect' | 'quarantined';
  lastCheck: string;
  nextCheck: string;
  riskScore: number;
  quantity: number;
  notes: string;
}

const MOCK_VERIFICATIONS: SupplierVerification[] = [
  { id: '1', partNumber: 'MS27500C22RC3', partDescription: 'Mil-Spec Aircraft Wire Harness', supplier: 'TrueSource Aviation Parts', verificationMethod: 'certificate', status: 'verified', lastCheck: '2026-01-15', nextCheck: '2026-07-15', riskScore: 12, quantity: 500, notes: 'DLA CAGE verified, CoC on file, lot traceability confirmed' },
  { id: '2', partNumber: 'AN960-416L', partDescription: 'Flat Washer — Aluminium', supplier: 'GlobalFasteners LLC', verificationMethod: 'xrf', status: 'suspect', lastCheck: '2026-01-28', nextCheck: '2026-02-15', riskScore: 78, quantity: 2000, notes: 'XRF analysis shows atypical alloy composition vs. AMS 2770 spec. Quarantine recommended.' },
  { id: '3', partNumber: 'NAS1149F0332P', partDescription: 'Flat Washer — Steel', supplier: 'AeroFasten Direct', verificationMethod: 'certificate', status: 'verified', lastCheck: '2026-01-10', nextCheck: '2026-07-10', riskScore: 8, quantity: 1000, notes: 'Full lot traceability from authorized distributor with DFARS compliance' },
  { id: '4', partNumber: 'MS21042L3', partDescription: 'Self-Locking Nut', supplier: 'Pacific Aerospace Dist.', verificationMethod: 'dimensional', status: 'quarantined', lastCheck: '2026-02-02', nextCheck: '—', riskScore: 91, quantity: 350, notes: 'Dimensional non-conformance detected. Thread pitch irregular. Counterfeit suspected. DHS notification pending.' },
  { id: '5', partNumber: 'AN3-6A', partDescription: 'Hex Head Bolt — AN Standard', supplier: 'VerifiedParts Inc.', verificationMethod: 'xrf', status: 'verified', lastCheck: '2026-01-20', nextCheck: '2026-07-20', riskScore: 15, quantity: 800, notes: 'XRF confirms 4130 steel alloy. CoC batch matched, head markings consistent.' },
  { id: '6', partNumber: 'MS9021-08', partDescription: 'O-Ring — Hydraulic Fitting', supplier: 'SealTech Suppliers', verificationMethod: 'visual', status: 'verified', lastCheck: '2025-12-18', nextCheck: '2026-06-18', riskScore: 22, quantity: 200, notes: 'Visual inspection and shore hardness testing within MIL-P-25732 tolerances' },
];

const METHOD_CONFIG = {
  certificate: { label: 'Certificate',  bg: 'bg-green-100',  text: 'text-green-700' },
  xrf:         { label: 'XRF Analysis', bg: 'bg-purple-100', text: 'text-purple-700' },
  visual:      { label: 'Visual',       bg: 'bg-blue-100',   text: 'text-blue-700' },
  dimensional: { label: 'Dimensional',  bg: 'bg-orange-100', text: 'text-orange-700' },
};

const STATUS_CONFIG = {
  verified:    { label: 'Verified',    bg: 'bg-green-100', text: 'text-green-700',  icon: CheckCircle2 },
  suspect:     { label: 'Suspect',     bg: 'bg-yellow-100',text: 'text-yellow-700', icon: AlertTriangle },
  quarantined: { label: 'Quarantined', bg: 'bg-red-100',   text: 'text-red-700',    icon: XCircle },
};

function getRiskColor(score: number) {
  if (score >= 75) return { bar: 'bg-red-500', text: 'text-red-700', label: 'High' };
  if (score >= 40) return { bar: 'bg-orange-500', text: 'text-orange-600', label: 'Medium' };
  return { bar: 'bg-green-500', text: 'text-green-600', label: 'Low' };
}

export default function CounterfeitPartsClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_VERIFICATIONS.filter(v => {
      const matchSearch = v.partNumber.toLowerCase().includes(search.toLowerCase()) || v.partDescription.toLowerCase().includes(search.toLowerCase()) || v.supplier.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchMethod = methodFilter === 'all' || v.verificationMethod === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [search, statusFilter, methodFilter]);

  const counts = {
    verified: MOCK_VERIFICATIONS.filter(v => v.status === 'verified').length,
    suspect: MOCK_VERIFICATIONS.filter(v => v.status === 'suspect').length,
    quarantined: MOCK_VERIFICATIONS.filter(v => v.status === 'quarantined').length,
    highRisk: MOCK_VERIFICATIONS.filter(v => v.riskScore >= 75).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Counterfeit Parts Prevention</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">AS9100D Clause 8.1.4 — Prevention of Counterfeit/Suspect Unapproved Parts</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Verification
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Verified</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{counts.verified}</p>
            <p className="text-xs text-green-500 mt-1">Cleared for use</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <p className="text-xs text-yellow-700 uppercase tracking-wide font-medium">Suspect</p>
            <p className="text-3xl font-bold text-yellow-700 mt-1">{counts.suspect}</p>
            <p className="text-xs text-yellow-600 mt-1">Under investigation</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Quarantined</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{counts.quarantined}</p>
            <p className="text-xs text-red-500 mt-1">Do not use</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">High Risk Score</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{counts.highRisk}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Risk score &ge; 75</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search part number, description, supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="suspect">Suspect</option>
            <option value="quarantined">Quarantined</option>
          </select>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Methods</option>
            <option value="certificate">Certificate</option>
            <option value="xrf">XRF Analysis</option>
            <option value="visual">Visual</option>
            <option value="dimensional">Dimensional</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Part Number</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Method</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Risk Score</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Check</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Qty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(v => {
                const mc = METHOD_CONFIG[v.verificationMethod];
                const sc = STATUS_CONFIG[v.status];
                const risk = getRiskColor(v.riskScore);
                const StatusIcon = sc.icon;
                return (
                  <tr key={v.id} className={`hover:bg-gray-50 dark:bg-gray-800 ${v.status === 'quarantined' ? 'bg-red-50' : v.status === 'suspect' ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-gray-100">{v.partNumber}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[180px]">
                      <p className="truncate">{v.partDescription}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{v.notes}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{v.supplier}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${mc.bg} ${mc.text}`}>
                        <Microscope className="w-3 h-3" />
                        {mc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full w-16">
                          <div className={`h-1.5 rounded-full ${risk.bar}`} style={{ width: `${v.riskScore}%` }} />
                        </div>
                        <span className={`text-xs font-bold ${risk.text}`}>{v.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{v.lastCheck}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{v.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${sc.bg} ${sc.text}`}>
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
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No verifications match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
