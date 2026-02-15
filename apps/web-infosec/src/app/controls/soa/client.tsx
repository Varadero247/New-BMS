'use client';

import { useState, useMemo } from 'react';
import { Search, Download, CheckCircle, XCircle, MinusCircle, Filter } from 'lucide-react';

interface SoAControl {
  id: string;
  clause: string;
  title: string;
  applicable: boolean;
  justification: string;
  implemented: boolean;
  implementationStatus: 'fully' | 'partial' | 'planned' | 'n/a';
  evidenceRef: string;
  riskRef: string;
  owner: string;
}

const controls: SoAControl[] = [
  { id: '1', clause: 'A.5.1', title: 'Policies for information security', applicable: true, justification: 'Required for governance framework', implemented: true, implementationStatus: 'fully', evidenceRef: 'IS-POL-001', riskRef: 'R-001', owner: 'CISO' },
  { id: '2', clause: 'A.5.2', title: 'Information security roles and responsibilities', applicable: true, justification: 'Required for accountability', implemented: true, implementationStatus: 'fully', evidenceRef: 'RACI-001', riskRef: 'R-002', owner: 'CISO' },
  { id: '3', clause: 'A.5.3', title: 'Segregation of duties', applicable: true, justification: 'Prevents fraud and errors', implemented: true, implementationStatus: 'partial', evidenceRef: 'SOD-001', riskRef: 'R-003', owner: 'IT Manager' },
  { id: '4', clause: 'A.5.4', title: 'Management responsibilities', applicable: true, justification: 'Required for leadership commitment', implemented: true, implementationStatus: 'fully', evidenceRef: 'MGT-001', riskRef: 'R-001', owner: 'CISO' },
  { id: '5', clause: 'A.5.5', title: 'Contact with authorities', applicable: true, justification: 'Regulatory requirement', implemented: true, implementationStatus: 'fully', evidenceRef: 'AUTH-001', riskRef: 'R-005', owner: 'DPO' },
  { id: '6', clause: 'A.5.6', title: 'Contact with special interest groups', applicable: true, justification: 'Industry collaboration', implemented: false, implementationStatus: 'partial', evidenceRef: '', riskRef: 'R-006', owner: 'CISO' },
  { id: '7', clause: 'A.5.7', title: 'Threat intelligence', applicable: true, justification: 'Proactive threat management', implemented: true, implementationStatus: 'fully', evidenceRef: 'TI-001', riskRef: 'R-007', owner: 'SOC Lead' },
  { id: '8', clause: 'A.5.8', title: 'Information security in project management', applicable: true, justification: 'Secure-by-design requirement', implemented: false, implementationStatus: 'partial', evidenceRef: 'PM-SEC-001', riskRef: 'R-008', owner: 'PMO Lead' },
  { id: '9', clause: 'A.6.1', title: 'Screening', applicable: true, justification: 'Pre-employment verification', implemented: true, implementationStatus: 'fully', evidenceRef: 'HR-SCR-001', riskRef: 'R-009', owner: 'HR Manager' },
  { id: '10', clause: 'A.6.2', title: 'Terms and conditions of employment', applicable: true, justification: 'Contractual obligations', implemented: true, implementationStatus: 'fully', evidenceRef: 'HR-T&C-001', riskRef: 'R-010', owner: 'HR Manager' },
  { id: '11', clause: 'A.6.3', title: 'Information security awareness, education and training', applicable: true, justification: 'Human factor risk mitigation', implemented: true, implementationStatus: 'partial', evidenceRef: 'TRAIN-001', riskRef: 'R-011', owner: 'CISO' },
  { id: '12', clause: 'A.6.4', title: 'Disciplinary process', applicable: true, justification: 'Policy enforcement', implemented: true, implementationStatus: 'fully', evidenceRef: 'HR-DISC-001', riskRef: 'R-012', owner: 'HR Manager' },
  { id: '13', clause: 'A.6.5', title: 'Responsibilities after termination', applicable: true, justification: 'Ongoing confidentiality', implemented: true, implementationStatus: 'fully', evidenceRef: 'HR-TERM-001', riskRef: 'R-013', owner: 'HR Manager' },
  { id: '14', clause: 'A.7.1', title: 'Physical security perimeters', applicable: true, justification: 'Data centre protection', implemented: true, implementationStatus: 'fully', evidenceRef: 'PHYS-001', riskRef: 'R-014', owner: 'Facilities' },
  { id: '15', clause: 'A.7.2', title: 'Physical entry', applicable: true, justification: 'Access control', implemented: true, implementationStatus: 'fully', evidenceRef: 'ACCESS-001', riskRef: 'R-015', owner: 'Facilities' },
  { id: '16', clause: 'A.7.3', title: 'Securing offices, rooms and facilities', applicable: true, justification: 'Asset protection', implemented: true, implementationStatus: 'partial', evidenceRef: 'PHYS-002', riskRef: 'R-016', owner: 'Facilities' },
  { id: '17', clause: 'A.7.4', title: 'Physical security monitoring', applicable: true, justification: 'Surveillance requirement', implemented: true, implementationStatus: 'partial', evidenceRef: 'CCTV-001', riskRef: 'R-017', owner: 'Facilities' },
  { id: '18', clause: 'A.8.1', title: 'User endpoint devices', applicable: true, justification: 'Remote work security', implemented: true, implementationStatus: 'fully', evidenceRef: 'MDM-001', riskRef: 'R-018', owner: 'IT Manager' },
  { id: '19', clause: 'A.8.2', title: 'Privileged access rights', applicable: true, justification: 'Least privilege principle', implemented: true, implementationStatus: 'fully', evidenceRef: 'PAM-001', riskRef: 'R-019', owner: 'IT Manager' },
  { id: '20', clause: 'A.8.3', title: 'Information access restriction', applicable: true, justification: 'Need-to-know basis', implemented: true, implementationStatus: 'fully', evidenceRef: 'RBAC-001', riskRef: 'R-020', owner: 'IT Manager' },
  { id: '21', clause: 'A.8.5', title: 'Secure authentication', applicable: true, justification: 'Identity verification', implemented: true, implementationStatus: 'fully', evidenceRef: 'MFA-001', riskRef: 'R-022', owner: 'IT Manager' },
  { id: '22', clause: 'A.8.7', title: 'Protection against malware', applicable: true, justification: 'Endpoint protection', implemented: true, implementationStatus: 'fully', evidenceRef: 'AV-001', riskRef: 'R-024', owner: 'SOC Lead' },
  { id: '23', clause: 'A.8.8', title: 'Management of technical vulnerabilities', applicable: true, justification: 'Vulnerability management program', implemented: true, implementationStatus: 'fully', evidenceRef: 'VULN-001', riskRef: 'R-025', owner: 'SOC Lead' },
  { id: '24', clause: 'A.8.11', title: 'Data masking', applicable: false, justification: 'No PII processing requiring masking at this time', implemented: false, implementationStatus: 'n/a', evidenceRef: '', riskRef: '', owner: 'N/A' },
  { id: '25', clause: 'A.8.15', title: 'Logging', applicable: true, justification: 'Audit trail requirement', implemented: true, implementationStatus: 'fully', evidenceRef: 'LOG-001', riskRef: 'R-028', owner: 'SOC Lead' },
];

const statusStyles: Record<string, { label: string; color: string }> = {
  fully: { label: 'Fully Implemented', color: 'bg-emerald-100 text-emerald-700' },
  partial: { label: 'Partially Implemented', color: 'bg-amber-100 text-amber-700' },
  planned: { label: 'Planned', color: 'bg-blue-100 text-blue-700' },
  'n/a': { label: 'Not Applicable', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500' },
};

export default function SoAClient() {
  const [search, setSearch] = useState('');
  const [filterApplicable, setFilterApplicable] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const applicable = controls.filter((c) => c.applicable).length;
  const notApplicable = controls.filter((c) => !c.applicable).length;
  const fullyImpl = controls.filter((c) => c.implementationStatus === 'fully').length;
  const partialImpl = controls.filter((c) => c.implementationStatus === 'partial').length;

  const filtered = useMemo(() => {
    return controls.filter((c) => {
      const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.clause.toLowerCase().includes(search.toLowerCase());
      const matchesApplicable = filterApplicable === 'all' || (filterApplicable === 'yes' ? c.applicable : !c.applicable);
      const matchesStatus = filterStatus === 'all' || c.implementationStatus === filterStatus;
      return matchesSearch && matchesApplicable && matchesStatus;
    });
  }, [search, filterApplicable, filterStatus]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Statement of Applicability</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ISO 27001:2022 Annex A controls — applicability and implementation status</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Download className="h-4 w-4" /> Export SoA
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Controls</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{controls.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Applicable</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{applicable}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{notApplicable} excluded</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Fully Implemented</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{fullyImpl}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Partial / In Progress</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{partialImpl}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search controls..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <select value={filterApplicable} onChange={(e) => setFilterApplicable(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Applicability</option>
          <option value="yes">Applicable</option>
          <option value="no">Not Applicable</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">All Statuses</option>
          <option value="fully">Fully Implemented</option>
          <option value="partial">Partially Implemented</option>
          <option value="planned">Planned</option>
          <option value="n/a">Not Applicable</option>
        </select>
      </div>

      {/* SoA Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Clause</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Control Title</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Applicable</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-48">Justification</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-36">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Evidence</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-20">Risk Ref</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-24">Owner</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const st = statusStyles[c.implementationStatus];
                return (
                  <tr key={c.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-2.5 font-mono text-xs text-indigo-600 font-medium">{c.clause}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100">{c.title}</td>
                    <td className="px-4 py-2.5 text-center">
                      {c.applicable ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 max-w-[12rem] truncate">{c.justification}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">{c.evidenceRef || '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500 dark:text-gray-400">{c.riskRef || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{c.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {controls.length} controls
        </div>
      </div>
    </div>
  );
}
