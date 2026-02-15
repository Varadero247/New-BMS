'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, CheckCircle2, Clock, XCircle, Building2 } from 'lucide-react';

interface Requirement {
  name: string;
  status: 'compliant' | 'in-progress' | 'non-compliant' | 'not-applicable';
  dueDate: string | null;
  owner: string;
}

interface CustomerRequirementSet {
  id: string;
  customer: string;
  standard: string;
  requirements: Requirement[];
  complianceLevel: number;
  lastReview: string;
  nextReview: string;
  contactName: string;
  contactEmail: string;
}

const MOCK_CUSTOMER_REQS: CustomerRequirementSet[] = [
  {
    id: '1',
    customer: 'Volkswagen Group',
    standard: 'VW 01155 / Formel Q-Konkret',
    complianceLevel: 92,
    lastReview: '2026-01-15',
    nextReview: '2026-07-15',
    contactName: 'H. Zimmermann',
    contactEmail: 'h.zimmermann@vwgroup.com',
    requirements: [
      { name: 'IATF 16949 certification with VW scope', status: 'compliant', dueDate: null, owner: 'Quality Mgr' },
      { name: 'VDA 6.3 Process Audit ≥ Grade B', status: 'compliant', dueDate: null, owner: 'Quality Mgr' },
      { name: 'Zero-defect strategy documentation', status: 'compliant', dueDate: null, owner: 'Quality Eng.' },
      { name: 'Escalation matrix and 24hr response SLA', status: 'in-progress', dueDate: '2026-03-01', owner: 'Quality Mgr' },
      { name: 'Supplier self-assessment (Q-Cockpit) submission', status: 'compliant', dueDate: null, owner: 'Supplier Dev.' },
      { name: 'Annual quality plan submission to VW SQM', status: 'compliant', dueDate: null, owner: 'Quality Mgr' },
      { name: 'EMPB (First Sample Inspection Report) per VW 3979', status: 'compliant', dueDate: null, owner: 'PPAP Team' },
      { name: 'Product audit frequency: ≥ 1x per quarter', status: 'non-compliant', dueDate: '2026-02-28', owner: 'Quality Eng.' },
    ],
  },
  {
    id: '2',
    customer: 'BMW AG',
    standard: 'BMW QMW 100A',
    complianceLevel: 88,
    lastReview: '2026-01-20',
    nextReview: '2026-07-20',
    contactName: 'K. Huber',
    contactEmail: 'k.huber@bmwgroup.com',
    requirements: [
      { name: 'IATF 16949 with BMW-specific scope', status: 'compliant', dueDate: null, owner: 'Quality Mgr' },
      { name: 'BMW Group Standard 01-0003-2019 (Inspection)', status: 'compliant', dueDate: null, owner: 'Quality Eng.' },
      { name: 'ISO 14001 certification', status: 'compliant', dueDate: null, owner: 'EHS Mgr' },
      { name: 'SCC (Safety Certificate Contractors)', status: 'in-progress', dueDate: '2026-04-30', owner: 'EHS Mgr' },
      { name: 'Conflict minerals reporting (OECD 5-step)', status: 'compliant', dueDate: null, owner: 'Procurement' },
      { name: 'BMW SQS portal registration and updates', status: 'compliant', dueDate: null, owner: 'Supplier Dev.' },
      { name: 'Sub-supplier transparency (2nd tier)', status: 'non-compliant', dueDate: '2026-03-15', owner: 'Procurement' },
    ],
  },
  {
    id: '3',
    customer: 'Ford Motor Company',
    standard: 'Ford Q1 / MMOG/LE',
    complianceLevel: 95,
    lastReview: '2025-12-10',
    nextReview: '2026-06-10',
    contactName: 'J. Williams',
    contactEmail: 'j.williams@ford.com',
    requirements: [
      { name: 'Ford Q1 Manufacturing Excellence certification', status: 'compliant', dueDate: null, owner: 'Quality Mgr' },
      { name: 'MMOG/LE Level A or B self-assessment', status: 'compliant', dueDate: null, owner: 'Supply Chain' },
      { name: 'PPAP Level 3 for all new parts', status: 'compliant', dueDate: null, owner: 'PPAP Team' },
      { name: 'GPDS process adherence documentation', status: 'compliant', dueDate: null, owner: 'Prog. Mgmt' },
      { name: 'CQI-9 heat treatment process assessment', status: 'compliant', dueDate: null, owner: 'Process Eng.' },
      { name: 'Fordon Global Terms compliance sign-off', status: 'compliant', dueDate: null, owner: 'Legal' },
      { name: 'Ford specific packaging spec compliance', status: 'in-progress', dueDate: '2026-02-28', owner: 'Logistics' },
    ],
  },
  {
    id: '4',
    customer: 'Stellantis',
    standard: 'Stellantis SQR-003',
    complianceLevel: 79,
    lastReview: '2026-02-01',
    nextReview: '2026-05-01',
    contactName: 'P. Duval',
    contactEmail: 'p.duval@stellantis.com',
    requirements: [
      { name: 'IATF 16949 certification current', status: 'compliant', dueDate: null, owner: 'Quality Mgr' },
      { name: 'Stellantis SQR-003 self-assessment score ≥ 80%', status: 'non-compliant', dueDate: '2026-03-31', owner: 'Quality Mgr' },
      { name: 'PPAP Level 3 with dimensional balloon drawing', status: 'compliant', dueDate: null, owner: 'PPAP Team' },
      { name: 'IMDS material data submission', status: 'in-progress', dueDate: '2026-03-01', owner: 'Engineering' },
      { name: 'Stellantis DCSS portal connectivity', status: 'non-compliant', dueDate: '2026-02-28', owner: 'IT / Quality' },
      { name: 'EDI 830 / 862 scheduling integration', status: 'in-progress', dueDate: '2026-04-30', owner: 'IT / Supply Chain' },
    ],
  },
  {
    id: '5',
    customer: 'Continental AG',
    standard: 'Continental SQA Requirements',
    complianceLevel: 100,
    lastReview: '2025-11-30',
    nextReview: '2026-05-30',
    contactName: 'T. Braun',
    contactEmail: 't.braun@continental.com',
    requirements: [
      { name: 'IATF 16949 with Continental scope extension', status: 'compliant', dueDate: null, owner: 'Quality Mgr' },
      { name: 'Process capability Cpk ≥ 1.67 for key characteristics', status: 'compliant', dueDate: null, owner: 'SPC Specialist' },
      { name: 'FMEA review with Continental SQE annually', status: 'compliant', dueDate: null, owner: 'Quality Eng.' },
      { name: 'Control plan alignment with Continental template', status: 'compliant', dueDate: null, owner: 'Quality Eng.' },
      { name: 'Traceability to lot level for all shipments', status: 'compliant', dueDate: null, owner: 'Production' },
    ],
  },
  {
    id: '6',
    customer: 'Toyota Motor Europe',
    standard: 'Toyota SQAM / Global Supplier Guidelines',
    complianceLevel: 83,
    lastReview: '2026-01-08',
    nextReview: '2026-07-08',
    contactName: 'Y. Tanaka',
    contactEmail: 'y.tanaka@toyota-europe.com',
    requirements: [
      { name: 'IATF 16949 certificate covering Toyota parts', status: 'compliant', dueDate: null, owner: 'Quality Mgr' },
      { name: 'Toyota Supplier Quality Award achievement', status: 'in-progress', dueDate: '2026-12-31', owner: 'Quality Mgr' },
      { name: 'Toyota Global A3 problem solving methodology', status: 'compliant', dueDate: null, owner: 'Quality Eng.' },
      { name: 'Genchi Genbutsu audit participation', status: 'in-progress', dueDate: '2026-06-30', owner: 'Ops Mgr' },
      { name: 'Kaizen event hosting (min 2/year)', status: 'non-compliant', dueDate: '2026-06-30', owner: 'Ops Mgr' },
      { name: 'Toyota IMDS material reporting', status: 'compliant', dueDate: null, owner: 'Engineering' },
      { name: 'Packaging approval per TEPS specification', status: 'compliant', dueDate: null, owner: 'Logistics' },
    ],
  },
];

const REQ_STATUS_CONFIG = {
  compliant:       { label: 'Compliant',       bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle2 },
  'in-progress':   { label: 'In Progress',     bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Clock },
  'non-compliant': { label: 'Non-Compliant',   bg: 'bg-red-100',    text: 'text-red-700',    icon: XCircle },
  'not-applicable':{ label: 'N/A',             bg: 'bg-gray-100 dark:bg-gray-800',   text: 'text-gray-500 dark:text-gray-400',   icon: XCircle },
};

function ComplianceBar({ level }: { level: number }) {
  const color = level >= 90 ? 'bg-green-500' : level >= 75 ? 'bg-yellow-400' : 'bg-red-500';
  const textColor = level >= 90 ? 'text-green-700' : level >= 75 ? 'text-yellow-700' : 'text-red-700';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-2.5 rounded-full ${color} transition-all`} style={{ width: `${level}%` }} />
      </div>
      <span className={`text-sm font-bold w-10 text-right ${textColor}`}>{level}%</span>
    </div>
  );
}

export default function CustomerReqsClient() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_CUSTOMER_REQS.filter(r =>
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.standard.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const avgCompliance = Math.round(MOCK_CUSTOMER_REQS.reduce((s, r) => s + r.complianceLevel, 0) / MOCK_CUSTOMER_REQS.length);
  const fullCompliance = MOCK_CUSTOMER_REQS.filter(r => r.complianceLevel === 100).length;
  const totalNonCompliant = MOCK_CUSTOMER_REQS.reduce((s, r) => s + r.requirements.filter(req => req.status === 'non-compliant').length, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer-Specific Requirements</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">IATF 16949 — Customer-Specific Requirements (CSRs) Compliance</p>
          </div>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Customers Tracked</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{MOCK_CUSTOMER_REQS.length}</p>
          </div>
          <div className={`rounded-lg border p-4 ${avgCompliance >= 90 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <p className={`text-xs uppercase tracking-wide font-medium ${avgCompliance >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>Avg Compliance</p>
            <p className={`text-3xl font-bold mt-1 ${avgCompliance >= 90 ? 'text-green-700' : 'text-yellow-700'}`}>{avgCompliance}%</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-xs text-green-600 uppercase tracking-wide font-medium">100% Compliant</p>
            <p className="text-3xl font-bold text-green-700 mt-1">{fullCompliance}</p>
            <p className="text-xs text-green-500 mt-1">Customers fully met</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Open Non-Conformances</p>
            <p className="text-3xl font-bold text-red-700 mt-1">{totalNonCompliant}</p>
            <p className="text-xs text-red-500 mt-1">Across all customers</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search customer name or standard..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Customer Requirement Cards */}
        <div className="space-y-4">
          {filtered.map(csr => {
            const isExpanded = expandedId === csr.id;
            const nonCompliantCount = csr.requirements.filter(r => r.status === 'non-compliant').length;
            const inProgressCount = csr.requirements.filter(r => r.status === 'in-progress').length;
            return (
              <div key={csr.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{csr.customer}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{csr.standard}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {nonCompliantCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                              <XCircle className="w-3 h-3" />{nonCompliantCount} non-compliant
                            </span>
                          )}
                          {inProgressCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                              <Clock className="w-3 h-3" />{inProgressCount} in progress
                            </span>
                          )}
                          <button onClick={() => setExpandedId(isExpanded ? null : csr.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <ComplianceBar level={csr.complianceLevel} />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{csr.requirements.length} requirements</span>
                        <span>&bull;</span>
                        <span>Contact: {csr.contactName} ({csr.contactEmail})</span>
                        <span>&bull;</span>
                        <span>Last review: {csr.lastReview}</span>
                        <span>&bull;</span>
                        <span>Next: {csr.nextReview}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Requirement Checklist */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Requirements Checklist</p>
                    <div className="space-y-2">
                      {csr.requirements.map((req, idx) => {
                        const rc = REQ_STATUS_CONFIG[req.status];
                        const ReqIcon = rc.icon;
                        return (
                          <div key={idx} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg ${rc.bg} border border-opacity-50`}>
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <ReqIcon className={`w-4 h-4 shrink-0 mt-0.5 ${rc.text}`} />
                              <span className="text-sm text-gray-800">{req.name}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {req.dueDate && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />Due {req.dueDate}
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${rc.bg} ${rc.text}`}>
                                {rc.label}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">{req.owner}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 py-16 text-center text-gray-400 dark:text-gray-500">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No customer requirements match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
