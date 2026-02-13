'use client';

import { useState, useMemo } from 'react';
import { Search, AlertCircle, AlertTriangle, Info, Activity, ZapOff, Clock, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';

type ScanStatus = 'completed' | 'running' | 'scheduled' | 'failed';
type Scanner = 'Nessus' | 'Qualys' | 'OpenVAS';

interface Vulnerability {
  cveId: string;
  title: string;
  cvssScore: number;
  affectedHosts: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

interface VulnerabilityScan {
  id: string;
  name: string;
  target: string;
  scanDate: string;
  status: ScanStatus;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  scanner: Scanner;
  vulnerabilities?: Vulnerability[];
}

const MOCK_SCANS: VulnerabilityScan[] = [
  {
    id: '1',
    name: 'Production Web Server',
    target: '192.168.1.100',
    scanDate: '2026-02-12',
    status: 'completed',
    criticalCount: 2,
    highCount: 5,
    mediumCount: 12,
    lowCount: 8,
    infoCount: 15,
    scanner: 'Nessus',
    vulnerabilities: [
      { cveId: 'CVE-2024-1234', title: 'Remote Code Execution in OpenSSL', cvssScore: 9.8, affectedHosts: 1, severity: 'critical' },
      { cveId: 'CVE-2024-5678', title: 'SQL Injection in Legacy API', cvssScore: 8.9, affectedHosts: 1, severity: 'critical' },
      { cveId: 'CVE-2024-9012', title: 'Unpatched Apache Struts', cvssScore: 8.1, affectedHosts: 1, severity: 'high' },
    ]
  },
  {
    id: '2',
    name: 'Database Server - Primary',
    target: 'db-primary.internal',
    scanDate: '2026-02-11',
    status: 'completed',
    criticalCount: 0,
    highCount: 2,
    mediumCount: 7,
    lowCount: 14,
    infoCount: 22,
    scanner: 'Qualys',
    vulnerabilities: [
      { cveId: 'CVE-2024-2468', title: 'PostgreSQL Authentication Bypass', cvssScore: 7.5, affectedHosts: 1, severity: 'high' },
      { cveId: 'CVE-2024-3579', title: 'Weak SSL/TLS Configuration', cvssScore: 7.2, affectedHosts: 1, severity: 'high' },
      { cveId: 'CVE-2024-0135', title: 'Missing Security Headers', cvssScore: 5.3, affectedHosts: 1, severity: 'medium' },
    ]
  },
  {
    id: '3',
    name: 'Application Scan - Mobile API',
    target: 'api.mobile.internal',
    scanDate: '2026-02-10',
    status: 'completed',
    criticalCount: 1,
    highCount: 3,
    mediumCount: 9,
    lowCount: 5,
    infoCount: 18,
    scanner: 'OpenVAS',
    vulnerabilities: [
      { cveId: 'CVE-2024-4567', title: 'Insecure Direct Object Reference (IDOR)', cvssScore: 9.1, affectedHosts: 1, severity: 'critical' },
      { cveId: 'CVE-2024-6789', title: 'Broken Authentication', cvssScore: 8.2, affectedHosts: 1, severity: 'high' },
      { cveId: 'CVE-2024-1098', title: 'Sensitive Data Exposure', cvssScore: 7.8, affectedHosts: 1, severity: 'high' },
    ]
  },
  {
    id: '4',
    name: 'Network Infrastructure',
    target: '10.0.0.0/24',
    scanDate: '2026-02-09',
    status: 'running',
    criticalCount: 0,
    highCount: 1,
    mediumCount: 4,
    lowCount: 3,
    infoCount: 8,
    scanner: 'Nessus',
    vulnerabilities: [
      { cveId: 'CVE-2024-7890', title: 'Exposed SSH Service', cvssScore: 7.0, affectedHosts: 3, severity: 'high' },
      { cveId: 'CVE-2024-2345', title: 'Outdated SNMP Version', cvssScore: 5.5, affectedHosts: 2, severity: 'medium' },
      { cveId: 'CVE-2024-5432', title: 'Open DNS Resolver', cvssScore: 5.0, affectedHosts: 1, severity: 'medium' },
    ]
  },
  {
    id: '5',
    name: 'Third-party Payment Gateway',
    target: 'payment.vendor.com',
    scanDate: '2026-02-08',
    status: 'completed',
    criticalCount: 0,
    highCount: 0,
    mediumCount: 2,
    lowCount: 4,
    infoCount: 11,
    scanner: 'Qualys',
    vulnerabilities: [
      { cveId: 'CVE-2024-8765', title: 'Missing Security Patches', cvssScore: 6.5, affectedHosts: 1, severity: 'medium' },
      { cveId: 'CVE-2024-3210', title: 'Deprecated Cipher Suites', cvssScore: 5.9, affectedHosts: 1, severity: 'medium' },
      { cveId: 'CVE-2024-6543', title: 'Certificate Expiry Warning', cvssScore: 4.2, affectedHosts: 1, severity: 'low' },
    ]
  },
  {
    id: '6',
    name: 'Scheduled Compliance Scan',
    target: 'compliance-net.internal',
    scanDate: '2026-02-15T10:00:00Z',
    status: 'scheduled',
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    infoCount: 0,
    scanner: 'OpenVAS',
  },
];

const statusConfig: Record<ScanStatus, { bg: string; text: string; icon: any; label: string }> = {
  completed: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Completed' },
  running: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Activity, label: 'Running' },
  scheduled: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Clock, label: 'Scheduled' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, label: 'Failed' },
};

const severityConfig: Record<string, { bg: string; text: string; icon: any }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info },
  info: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Info },
};

export default function VulnerabilityScansClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScanStatus | 'all'>('all');
  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);

  // Calculate summary stats
  const totalScans = MOCK_SCANS.length;
  const totalCritical = MOCK_SCANS.reduce((sum, scan) => sum + scan.criticalCount, 0);
  const totalHigh = MOCK_SCANS.reduce((sum, scan) => sum + scan.highCount, 0);
  const totalMedium = MOCK_SCANS.reduce((sum, scan) => sum + scan.mediumCount, 0);
  const openFindings = totalCritical + totalHigh + totalMedium;

  // Filter scans
  const filteredScans = useMemo(() => {
    return MOCK_SCANS.filter(scan => {
      const matchesSearch = scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scan.target.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || scan.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vulnerability Scans</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor security vulnerability assessments across infrastructure</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Scans</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalScans}</p>
            </div>
            <Activity className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">{MOCK_SCANS.filter(s => s.status === 'completed').length} completed</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{totalCritical}</p>
            </div>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Require immediate action</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">High</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{totalHigh}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">High priority items</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Open Findings</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">{openFindings}</p>
            </div>
            <ZapOff className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Critical + High + Medium</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ScanStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="scheduled">Scheduled</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Scans Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Scan Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Target</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Scanner</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">Vulnerabilities</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredScans.map((scan) => {
              const isExpanded = expandedScanId === scan.id;
              const sc = statusConfig[scan.status];
              const totalVulns = scan.criticalCount + scan.highCount + scan.mediumCount + scan.lowCount + scan.infoCount;

              return (
                <div key={scan.id}>
                  <tr className={`hover:bg-gray-50 ${isExpanded ? 'bg-indigo-50' : ''}`}>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}
                        className="text-left font-medium text-gray-900 hover:text-indigo-700"
                      >
                        {scan.name}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{scan.target}</td>
                    <td className="py-3 px-4 text-gray-600">{scan.scanner}</td>
                    <td className="py-3 px-4 text-gray-600">{new Date(scan.scanDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                        <sc.icon className="h-3 w-3" />
                        {sc.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {scan.criticalCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                            C:{scan.criticalCount}
                          </span>
                        )}
                        {scan.highCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">
                            H:{scan.highCount}
                          </span>
                        )}
                        {scan.mediumCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">
                            M:{scan.mediumCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {isExpanded && scan.vulnerabilities && (
                    <tr className="bg-indigo-50">
                      <td colSpan={7} className="py-4 px-4">
                        <div className="space-y-3">
                          <div className="font-medium text-gray-900 text-xs uppercase tracking-wider">Top 3 Vulnerabilities</div>
                          {scan.vulnerabilities.slice(0, 3).map((vuln, idx) => {
                            const sc = severityConfig[vuln.severity];
                            return (
                              <div key={idx} className="bg-white border border-gray-200 rounded p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                                        <sc.icon className="h-3 w-3" />
                                        {vuln.severity.toUpperCase()}
                                      </span>
                                      <span className="font-mono text-[10px] font-medium text-gray-600">{vuln.cveId}</span>
                                      <span className="text-[10px] font-bold text-indigo-700">CVSS: {vuln.cvssScore}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-900 mt-1">{vuln.title}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">{vuln.affectedHosts} host(s) affected</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredScans.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No scans found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
