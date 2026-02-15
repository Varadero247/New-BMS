'use client';

import { useState } from 'react';
import { Gauge, Badge } from '@ims/ui';
import { Shield, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

type ControlStatus = 'Implemented' | 'Partially Implemented' | 'Planned' | 'Not Applicable';

interface Control {
  id: string;
  name: string;
  status: ControlStatus;
  effectiveness: number;
  lastAssessed: string;
  owner: string;
}

interface ControlDomain {
  id: string;
  name: string;
  description: string;
  controls: Control[];
}

const DOMAINS: ControlDomain[] = [
  {
    id: 'A5', name: 'A.5 Organisational Controls', description: 'Policies, roles, responsibilities, and management direction',
    controls: [
      { id: 'A.5.1', name: 'Policies for information security', status: 'Implemented', effectiveness: 92, lastAssessed: '2026-01-15', owner: 'CISO' },
      { id: 'A.5.2', name: 'Information security roles and responsibilities', status: 'Implemented', effectiveness: 88, lastAssessed: '2026-01-15', owner: 'CISO' },
      { id: 'A.5.3', name: 'Segregation of duties', status: 'Implemented', effectiveness: 85, lastAssessed: '2025-12-10', owner: 'IT Manager' },
      { id: 'A.5.4', name: 'Management responsibilities', status: 'Implemented', effectiveness: 90, lastAssessed: '2026-01-20', owner: 'CISO' },
      { id: 'A.5.5', name: 'Contact with authorities', status: 'Implemented', effectiveness: 95, lastAssessed: '2025-11-30', owner: 'DPO' },
      { id: 'A.5.6', name: 'Contact with special interest groups', status: 'Partially Implemented', effectiveness: 60, lastAssessed: '2025-12-05', owner: 'CISO' },
      { id: 'A.5.7', name: 'Threat intelligence', status: 'Implemented', effectiveness: 78, lastAssessed: '2026-02-01', owner: 'SOC Lead' },
      { id: 'A.5.8', name: 'Information security in project management', status: 'Partially Implemented', effectiveness: 65, lastAssessed: '2025-11-15', owner: 'PM Lead' },
    ],
  },
  {
    id: 'A6', name: 'A.6 People Controls', description: 'Screening, terms of employment, awareness, training, and disciplinary',
    controls: [
      { id: 'A.6.1', name: 'Screening', status: 'Implemented', effectiveness: 90, lastAssessed: '2026-01-10', owner: 'HR Manager' },
      { id: 'A.6.2', name: 'Terms and conditions of employment', status: 'Implemented', effectiveness: 95, lastAssessed: '2026-01-10', owner: 'HR Manager' },
      { id: 'A.6.3', name: 'Information security awareness, education and training', status: 'Partially Implemented', effectiveness: 72, lastAssessed: '2026-02-05', owner: 'CISO' },
      { id: 'A.6.4', name: 'Disciplinary process', status: 'Implemented', effectiveness: 88, lastAssessed: '2025-12-20', owner: 'HR Manager' },
      { id: 'A.6.5', name: 'Responsibilities after termination', status: 'Implemented', effectiveness: 85, lastAssessed: '2025-12-20', owner: 'HR Manager' },
      { id: 'A.6.6', name: 'Confidentiality or non-disclosure agreements', status: 'Implemented', effectiveness: 92, lastAssessed: '2025-11-25', owner: 'Legal' },
      { id: 'A.6.7', name: 'Remote working', status: 'Implemented', effectiveness: 80, lastAssessed: '2026-01-25', owner: 'IT Manager' },
      { id: 'A.6.8', name: 'Information security event reporting', status: 'Implemented', effectiveness: 85, lastAssessed: '2026-02-01', owner: 'SOC Lead' },
    ],
  },
  {
    id: 'A7', name: 'A.7 Physical Controls', description: 'Physical perimeters, entry controls, securing offices, and equipment',
    controls: [
      { id: 'A.7.1', name: 'Physical security perimeters', status: 'Implemented', effectiveness: 95, lastAssessed: '2025-12-15', owner: 'Facilities' },
      { id: 'A.7.2', name: 'Physical entry', status: 'Implemented', effectiveness: 92, lastAssessed: '2025-12-15', owner: 'Facilities' },
      { id: 'A.7.3', name: 'Securing offices, rooms and facilities', status: 'Implemented', effectiveness: 88, lastAssessed: '2025-12-15', owner: 'Facilities' },
      { id: 'A.7.4', name: 'Physical security monitoring', status: 'Partially Implemented', effectiveness: 70, lastAssessed: '2026-01-05', owner: 'Facilities' },
      { id: 'A.7.5', name: 'Protecting against physical and environmental threats', status: 'Implemented', effectiveness: 85, lastAssessed: '2025-11-20', owner: 'Facilities' },
      { id: 'A.7.6', name: 'Working in secure areas', status: 'Implemented', effectiveness: 82, lastAssessed: '2025-12-10', owner: 'Facilities' },
      { id: 'A.7.7', name: 'Clear desk and clear screen', status: 'Partially Implemented', effectiveness: 55, lastAssessed: '2026-01-30', owner: 'IT Manager' },
      { id: 'A.7.8', name: 'Equipment siting and protection', status: 'Implemented', effectiveness: 90, lastAssessed: '2025-11-20', owner: 'IT Manager' },
    ],
  },
  {
    id: 'A8', name: 'A.8 Technological Controls', description: 'Endpoint devices, access rights, authentication, malware, backups, logging',
    controls: [
      { id: 'A.8.1', name: 'User endpoint devices', status: 'Implemented', effectiveness: 88, lastAssessed: '2026-02-05', owner: 'IT Manager' },
      { id: 'A.8.2', name: 'Privileged access rights', status: 'Implemented', effectiveness: 82, lastAssessed: '2026-01-20', owner: 'IT Manager' },
      { id: 'A.8.3', name: 'Information access restriction', status: 'Implemented', effectiveness: 85, lastAssessed: '2026-01-15', owner: 'IT Manager' },
      { id: 'A.8.4', name: 'Access to source code', status: 'Implemented', effectiveness: 90, lastAssessed: '2025-12-01', owner: 'Dev Lead' },
      { id: 'A.8.5', name: 'Secure authentication', status: 'Implemented', effectiveness: 92, lastAssessed: '2026-02-01', owner: 'IT Manager' },
      { id: 'A.8.6', name: 'Capacity management', status: 'Partially Implemented', effectiveness: 68, lastAssessed: '2026-01-10', owner: 'Infra Lead' },
      { id: 'A.8.7', name: 'Protection against malware', status: 'Implemented', effectiveness: 95, lastAssessed: '2026-02-10', owner: 'SOC Lead' },
      { id: 'A.8.8', name: 'Management of technical vulnerabilities', status: 'Implemented', effectiveness: 78, lastAssessed: '2026-02-08', owner: 'SOC Lead' },
      { id: 'A.8.9', name: 'Configuration management', status: 'Partially Implemented', effectiveness: 65, lastAssessed: '2026-01-25', owner: 'Infra Lead' },
      { id: 'A.8.10', name: 'Information deletion', status: 'Implemented', effectiveness: 80, lastAssessed: '2025-12-20', owner: 'DPO' },
      { id: 'A.8.11', name: 'Data masking', status: 'Planned', effectiveness: 0, lastAssessed: '2026-01-15', owner: 'Dev Lead' },
      { id: 'A.8.12', name: 'Data leakage prevention', status: 'Partially Implemented', effectiveness: 55, lastAssessed: '2026-02-01', owner: 'SOC Lead' },
      { id: 'A.8.13', name: 'Information backup', status: 'Implemented', effectiveness: 92, lastAssessed: '2026-01-30', owner: 'Infra Lead' },
      { id: 'A.8.14', name: 'Redundancy of information processing facilities', status: 'Implemented', effectiveness: 88, lastAssessed: '2025-12-15', owner: 'Infra Lead' },
      { id: 'A.8.15', name: 'Logging', status: 'Implemented', effectiveness: 90, lastAssessed: '2026-02-10', owner: 'SOC Lead' },
      { id: 'A.8.16', name: 'Monitoring activities', status: 'Implemented', effectiveness: 85, lastAssessed: '2026-02-10', owner: 'SOC Lead' },
    ],
  },
];

const statusConfig: Record<ControlStatus, { bg: string; text: string; icon: typeof CheckCircle }> = {
  Implemented: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  'Partially Implemented': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  Planned: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  'Not Applicable': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', icon: XCircle },
};

export default function ControlsDashboardClient() {
  const [expandedDomain, setExpandedDomain] = useState<string | null>('A5');

  // Stats
  const allControls = DOMAINS.flatMap(d => d.controls);
  const total = allControls.length;
  const implemented = allControls.filter(c => c.status === 'Implemented').length;
  const partial = allControls.filter(c => c.status === 'Partially Implemented').length;
  const planned = allControls.filter(c => c.status === 'Planned').length;
  const avgEffectiveness = Math.round(allControls.filter(c => c.effectiveness > 0).reduce((s, c) => s + c.effectiveness, 0) / allControls.filter(c => c.effectiveness > 0).length);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ISO 27001 Controls Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Annex A control implementation status — ISO/IEC 27001:2022</p>
        </div>
        <a href="/controls" className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800">
          Controls Register
        </a>
      </div>

      {/* Top gauges */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
          <Gauge value={implemented} max={total} size="lg" label="Implemented" sublabel={`${implemented}/${total}`} color="green" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
          <Gauge value={implemented + partial} max={total} size="lg" label="Coverage" sublabel="Impl + Partial" color="blue" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
          <Gauge value={avgEffectiveness} max={100} size="lg" label="Avg Effectiveness" sublabel="across all controls" color="auto" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
          <Gauge value={total - planned} max={total} size="lg" label="Maturity" sublabel="active controls" color="purple" />
        </div>
      </div>

      {/* Status summary bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-6 mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{implemented} Implemented</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{partial} Partially Implemented</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{planned} Planned</span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
          <div className="bg-green-500 h-full" style={{ width: `${(implemented / total) * 100}%` }} />
          <div className="bg-yellow-400 h-full" style={{ width: `${(partial / total) * 100}%` }} />
          <div className="bg-blue-400 h-full" style={{ width: `${(planned / total) * 100}%` }} />
        </div>
      </div>

      {/* Domain sections */}
      <div className="space-y-3">
        {DOMAINS.map(domain => {
          const isExpanded = expandedDomain === domain.id;
          const domainImpl = domain.controls.filter(c => c.status === 'Implemented').length;
          const domainTotal = domain.controls.length;
          const domainAvg = Math.round(domain.controls.filter(c => c.effectiveness > 0).reduce((s, c) => s + c.effectiveness, 0) / domain.controls.filter(c => c.effectiveness > 0).length);

          return (
            <div key={domain.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Domain header */}
              <button
                onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-cyan-600" />
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{domain.name}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{domain.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${(domainImpl / domainTotal) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">{domainImpl}/{domainTotal}</span>
                  </div>
                  <span className={`text-xs font-bold ${domainAvg >= 80 ? 'text-green-600' : domainAvg >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {domainAvg}%
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Controls table */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-gray-400">Control</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                        <th className="text-center py-2 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="text-center py-2 px-4 font-medium text-gray-500 dark:text-gray-400">Effectiveness</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-gray-400">Owner</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-500 dark:text-gray-400">Last Assessed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {domain.controls.map(control => {
                        const sc = statusConfig[control.status];
                        return (
                          <tr key={control.id} className="hover:bg-gray-50 dark:bg-gray-800">
                            <td className="py-2 px-4 font-mono font-medium text-cyan-700">{control.id}</td>
                            <td className="py-2 px-4 text-gray-900 dark:text-gray-100">{control.name}</td>
                            <td className="py-2 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                                {control.status}
                              </span>
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${control.effectiveness >= 80 ? 'bg-green-500' : control.effectiveness >= 60 ? 'bg-yellow-500' : control.effectiveness > 0 ? 'bg-red-500' : 'bg-gray-300'}`}
                                    style={{ width: `${control.effectiveness}%` }}
                                  />
                                </div>
                                <span className="text-gray-600 w-8 text-right">{control.effectiveness}%</span>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-gray-600">{control.owner}</td>
                            <td className="py-2 px-4 text-gray-400 dark:text-gray-500 font-mono">{control.lastAssessed}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
