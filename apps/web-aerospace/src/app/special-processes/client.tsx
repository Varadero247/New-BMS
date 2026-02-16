'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Award, AlertTriangle, Clock, CheckCircle2, XCircle, Wrench } from 'lucide-react';

interface SpecialProcess {
  id: string;
  processName: string;
  type: 'welding' | 'NDT' | 'heat-treat' | 'surface-treatment' | 'composites' | 'chemical-processing';
  certification: 'NADCAP' | 'customer-approved' | 'internal';
  expiryDate: string;
  status: 'active' | 'expiring-soon' | 'expired' | 'pending';
  lastAudit: string;
  performedBy: string;
  accreditationNumber: string;
}

const MOCK_PROCESSES: SpecialProcess[] = [
  { id: '1', processName: 'Electron Beam Welding', type: 'welding', certification: 'NADCAP', expiryDate: '2026-09-30', status: 'active', lastAudit: '2025-09-15', performedBy: 'PrecisionWeld Inc.', accreditationNumber: 'NADCAP-W-21045' },
  { id: '2', processName: 'Fluorescent Penetrant Inspection (FPI)', type: 'NDT', certification: 'NADCAP', expiryDate: '2026-03-31', status: 'expiring-soon', lastAudit: '2025-03-20', performedBy: 'AeroNDT Services', accreditationNumber: 'NADCAP-NDT-18932' },
  { id: '3', processName: 'Vacuum Heat Treatment', type: 'heat-treat', certification: 'NADCAP', expiryDate: '2025-12-31', status: 'expired', lastAudit: '2024-12-10', performedBy: 'ThermoAero LLC', accreditationNumber: 'NADCAP-HT-14567' },
  { id: '4', processName: 'Hard Anodising (MIL-A-8625 Type III)', type: 'surface-treatment', certification: 'NADCAP', expiryDate: '2026-11-15', status: 'active', lastAudit: '2025-11-02', performedBy: 'AeroCoat Technologies', accreditationNumber: 'NADCAP-CT-29843' },
  { id: '5', processName: 'Carbon Fibre Lay-up (Autoclave)', type: 'composites', certification: 'customer-approved', expiryDate: '2026-06-30', status: 'active', lastAudit: '2025-06-12', performedBy: 'CompositeTech Corp.', accreditationNumber: 'CA-BOEING-7734' },
  { id: '6', processName: 'Cadmium Plating', type: 'chemical-processing', certification: 'NADCAP', expiryDate: '2026-05-01', status: 'pending', lastAudit: '2025-04-22', performedBy: 'ChemFinish Ltd.', accreditationNumber: 'NADCAP-CP-33201' },
  { id: '7', processName: 'Magnetic Particle Inspection (MPI)', type: 'NDT', certification: 'internal', expiryDate: '2026-08-31', status: 'active', lastAudit: '2025-08-14', performedBy: 'In-house QA Team', accreditationNumber: 'INT-NDT-MPI-001' },
  { id: '8', processName: 'Resistance Spot Welding', type: 'welding', certification: 'customer-approved', expiryDate: '2026-04-15', status: 'expiring-soon', lastAudit: '2025-04-01', performedBy: 'StructWeld Partners', accreditationNumber: 'CA-AIRBUS-1192' },
];

const TYPE_CONFIG = {
  welding:              { label: 'Welding',              bg: 'bg-orange-100', text: 'text-orange-700' },
  NDT:                  { label: 'NDT',                  bg: 'bg-blue-100',   text: 'text-blue-700' },
  'heat-treat':         { label: 'Heat Treatment',       bg: 'bg-red-100',    text: 'text-red-700' },
  'surface-treatment':  { label: 'Surface Treatment',    bg: 'bg-purple-100', text: 'text-purple-700' },
  composites:           { label: 'Composites',           bg: 'bg-teal-100',   text: 'text-teal-700' },
  'chemical-processing':{ label: 'Chemical Processing',  bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-700 dark:text-gray-300' },
};

const CERT_CONFIG = {
  NADCAP:             { label: 'NADCAP',            bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  'customer-approved':{ label: 'Customer Approved', bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300' },
  internal:           { label: 'Internal',          bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-700 dark:text-gray-300',   border: 'border-gray-300' },
};

const STATUS_CONFIG = {
  active:          { label: 'Active',          bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  'expiring-soon': { label: 'Expiring Soon',   bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock },
  expired:         { label: 'Expired',         bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle },
  pending:         { label: 'Pending Renewal', bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Clock },
};

function daysUntilExpiry(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function SpecialProcessesClient() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_PROCESSES.filter(p => {
      const matchSearch = p.processName.toLowerCase().includes(search.toLowerCase()) || p.performedBy.toLowerCase().includes(search.toLowerCase()) || p.accreditationNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      const matchCert = certFilter === 'all' || p.certification === certFilter;
      return matchSearch && matchStatus && matchType && matchCert;
    });
  }, [search, statusFilter, typeFilter, certFilter]);

  const counts = {
    active: MOCK_PROCESSES.filter(p => p.status === 'active').length,
    expiring: MOCK_PROCESSES.filter(p => p.status === 'expiring-soon').length,
    expired: MOCK_PROCESSES.filter(p => p.status === 'expired').length,
    nadcap: MOCK_PROCESSES.filter(p => p.certification === 'NADCAP').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Special Processes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">AS9100D Clause 8.5.1 — NADCAP & Customer-Approved Special Processes</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Process
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Active</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{counts.active}</p>
            <p className="text-xs text-green-500 mt-1">Current certifications</p>
          </div>
          <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
            <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">Expiring Soon</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{counts.expiring}</p>
            <p className="text-xs text-orange-500 mt-1">Action required</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Expired</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{counts.expired}</p>
            <p className="text-xs text-red-500 mt-1">Cannot use process</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <p className="text-xs text-yellow-700 uppercase tracking-wide font-medium">NADCAP Certified</p>
            <p className="text-3xl font-bold text-yellow-700 mt-1">{counts.nadcap}</p>
            <p className="text-xs text-yellow-600 mt-1">Accredited suppliers</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              aria-label="Search process, supplier, accreditation #..." placeholder="Search process, supplier, accreditation #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring-soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>
          <select aria-label="Filter by type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Types</option>
            <option value="welding">Welding</option>
            <option value="NDT">NDT</option>
            <option value="heat-treat">Heat Treatment</option>
            <option value="surface-treatment">Surface Treatment</option>
            <option value="composites">Composites</option>
            <option value="chemical-processing">Chemical Processing</option>
          </select>
          <select aria-label="Filter by certification" value={certFilter} onChange={e => setCertFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Certifications</option>
            <option value="NADCAP">NADCAP</option>
            <option value="customer-approved">Customer Approved</option>
            <option value="internal">Internal</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Process Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Certification</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Performed By</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Accreditation #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expiry</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Last Audit</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(proc => {
                const tc = TYPE_CONFIG[proc.type];
                const cc = CERT_CONFIG[proc.certification];
                const sc = STATUS_CONFIG[proc.status];
                const StatusIcon = sc.icon;
                const days = daysUntilExpiry(proc.expiryDate);
                return (
                  <tr key={proc.id} className="hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{proc.processName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tc.bg} ${tc.text}`}>{tc.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cc.bg} ${cc.text} ${cc.border}`}>
                        <Award className="w-3 h-3" />
                        {cc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{proc.performedBy}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{proc.accreditationNumber}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-700 dark:text-gray-300">{proc.expiryDate}</p>
                        {proc.status === 'expiring-soon' && (
                          <p className="text-xs text-orange-600 flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />{days}d remaining
                          </p>
                        )}
                        {proc.status === 'expired' && (
                          <p className="text-xs text-red-600 font-medium mt-0.5">Expired {Math.abs(days)}d ago</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{proc.lastAudit}</td>
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
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No special processes match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
