'use client';

import { useState, useMemo } from 'react';
import { Search, Shield, AlertCircle, AlertTriangle, CheckCircle2, Zap, Calendar, BarChart3, ChevronRight } from 'lucide-react';

type PenTestType = 'external' | 'internal' | 'web-app' | 'social-engineering' | 'wireless';
type PenTestStatus = 'completed' | 'in-progress' | 'scheduled' | 'remediation';

interface PenTestFinding {
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
}

interface PenTest {
  id: string;
  name: string;
  type: PenTestType;
  vendor: string;
  startDate: string;
  endDate: string;
  status: PenTestStatus;
  findingsCount: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  scope: string;
  executiveSummary: string;
}

const MOCK_PEN_TESTS: PenTest[] = [
  {
    id: '1',
    name: 'Q1 2026 External Penetration Test',
    type: 'external',
    vendor: 'CyberDefense Inc.',
    startDate: '2026-01-15',
    endDate: '2026-02-01',
    status: 'completed',
    findingsCount: 18,
    criticalFindings: 2,
    highFindings: 5,
    mediumFindings: 8,
    scope: 'All internet-facing applications and infrastructure (web servers, mail servers, VPN endpoints)',
    executiveSummary: 'Assessment identified critical remote code execution vulnerability in production web server and several weak authentication mechanisms. Primary risks mitigated through emergency patching.'
  },
  {
    id: '2',
    name: 'Internal Network Security Assessment',
    type: 'internal',
    vendor: 'SecureNet Solutions',
    startDate: '2026-02-03',
    endDate: '2026-02-10',
    status: 'in-progress',
    findingsCount: 12,
    criticalFindings: 1,
    highFindings: 3,
    mediumFindings: 6,
    scope: 'Internal network segments, domain controllers, file servers, and user workstations across all facilities',
    executiveSummary: 'Assessment reveals several privilege escalation paths and lateral movement opportunities. Recommendations focus on network segmentation and access control improvements.'
  },
  {
    id: '3',
    name: 'Web Application Security Test - Portal',
    type: 'web-app',
    vendor: 'AppSecurity Labs',
    startDate: '2026-01-28',
    endDate: '2026-02-08',
    status: 'completed',
    findingsCount: 22,
    criticalFindings: 3,
    highFindings: 7,
    mediumFindings: 10,
    scope: 'Customer portal, API endpoints, payment processing, and user management functions',
    executiveSummary: 'Multiple OWASP Top 10 vulnerabilities identified including IDOR, broken authentication, and sensitive data exposure. Urgent remediation required for payment-related findings.'
  },
  {
    id: '4',
    name: 'Social Engineering Awareness Test',
    type: 'social-engineering',
    vendor: 'Human Risk Analytics',
    startDate: '2026-02-05',
    endDate: '2026-02-12',
    status: 'remediation',
    findingsCount: 8,
    criticalFindings: 0,
    highFindings: 2,
    mediumFindings: 4,
    scope: 'Email phishing simulations, phone calls, physical pretexting targeting employees across departments',
    executiveSummary: 'Employee click rate on phishing emails improved from 35% to 12%. Identified need for targeted training in finance and HR departments.'
  },
  {
    id: '5',
    name: 'Wireless Security Assessment',
    type: 'wireless',
    vendor: 'NetSecure Testing',
    startDate: '2026-02-06',
    endDate: '2026-02-13',
    status: 'scheduled',
    findingsCount: 0,
    criticalFindings: 0,
    highFindings: 0,
    mediumFindings: 0,
    scope: 'Corporate Wi-Fi networks, guest networks, and Bluetooth devices across all office locations',
    executiveSummary: 'Test is scheduled to begin next week. Will evaluate WPA2/WPA3 configurations, default credentials, and rogue access point detection.'
  },
];

const typeConfig: Record<PenTestType, { bg: string; text: string; label: string }> = {
  external: { bg: 'bg-red-100', text: 'text-red-700', label: 'External' },
  internal: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Internal' },
  'web-app': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Web App' },
  'social-engineering': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Social Engineering' },
  wireless: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Wireless' },
};

const statusConfig: Record<PenTestStatus, { bg: string; text: string; icon: any; label: string }> = {
  completed: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Completed' },
  'in-progress': { bg: 'bg-blue-50', text: 'text-blue-700', icon: Zap, label: 'In Progress' },
  scheduled: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Calendar, label: 'Scheduled' },
  remediation: { bg: 'bg-orange-50', text: 'text-orange-700', icon: AlertTriangle, label: 'Remediation' },
};

export default function PenTestsClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<PenTestType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PenTestStatus | 'all'>('all');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Calculate summary stats
  const totalTests = MOCK_PEN_TESTS.length;
  const inProgressTests = MOCK_PEN_TESTS.filter(t => t.status === 'in-progress').length;
  const totalCriticalFindings = MOCK_PEN_TESTS.reduce((sum, test) => sum + test.criticalFindings, 0);
  const completedTests = MOCK_PEN_TESTS.filter(t => t.status === 'completed').length;
  const remediatedFindingsCount = MOCK_PEN_TESTS.filter(t => t.status === 'completed').reduce((sum, test) => sum + test.findingsCount, 0);
  const remediationRate = completedTests > 0 ? Math.round(((remediatedFindingsCount * 0.65) / remediatedFindingsCount) * 100) : 0;

  // Filter tests
  const filteredTests = useMemo(() => {
    return MOCK_PEN_TESTS.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           test.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || test.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, typeFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Penetration Tests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage third-party penetration testing assessments and remediation efforts</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{totalTests}</p>
            </div>
            <BarChart3 className="h-5 w-5 text-cyan-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{completedTests} completed</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{inProgressTests}</p>
            </div>
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Active assessments</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Critical Findings</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{totalCriticalFindings}</p>
            </div>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Across all tests</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remediation Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{remediationRate}%</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Findings addressed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by test name or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PenTestType | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="external">External</option>
          <option value="internal">Internal</option>
          <option value="web-app">Web App</option>
          <option value="social-engineering">Social Engineering</option>
          <option value="wireless">Wireless</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PenTestStatus | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="scheduled">Scheduled</option>
          <option value="remediation">Remediation</option>
        </select>
      </div>

      {/* Pen Tests Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTests.map((test) => {
          const isExpanded = expandedTestId === test.id;
          const tc = typeConfig[test.type];
          const sc = statusConfig[test.status];
          const startDate = new Date(test.startDate);
          const endDate = new Date(test.endDate);
          const daysSpan = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const findingsSeverityPercent = test.findingsCount > 0
            ? {
                critical: (test.criticalFindings / test.findingsCount) * 100,
                high: (test.highFindings / test.findingsCount) * 100,
                medium: (test.mediumFindings / test.findingsCount) * 100,
              }
            : { critical: 0, high: 0, medium: 0 };

          return (
            <div key={test.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Card Header */}
              <button
                onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                className="w-full px-4 py-4 hover:bg-gray-50 dark:bg-gray-800 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Title and Type */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{test.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${tc.bg} ${tc.text}`}>
                        {tc.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}>
                        <sc.icon className="h-3 w-3" />
                        {sc.label}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-6 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Shield className="h-3.5 w-3.5" />
                        <span className="font-medium">{test.vendor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
                        <span className="text-gray-400 dark:text-gray-500">({daysSpan} days)</span>
                      </div>
                    </div>

                    {/* Findings breakdown */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {test.criticalFindings > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                            C: {test.criticalFindings}
                          </span>
                        )}
                        {test.highFindings > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">
                            H: {test.highFindings}
                          </span>
                        )}
                        {test.mediumFindings > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">
                            M: {test.mediumFindings}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-2">
                        {test.findingsCount} total finding{test.findingsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Severity Bar and Toggle */}
                  <div className="flex items-center gap-4">
                    {test.findingsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-32 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                          {findingsSeverityPercent.critical > 0 && (
                            <div
                              className="bg-red-500 h-full"
                              style={{ width: `${findingsSeverityPercent.critical}%` }}
                            />
                          )}
                          {findingsSeverityPercent.high > 0 && (
                            <div
                              className="bg-orange-500 h-full"
                              style={{ width: `${findingsSeverityPercent.high}%` }}
                            />
                          )}
                          {findingsSeverityPercent.medium > 0 && (
                            <div
                              className="bg-yellow-500 h-full"
                              style={{ width: `${findingsSeverityPercent.medium}%` }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    <ChevronRight
                      className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                  <div className="space-y-4">
                    {/* Scope */}
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">Scope</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{test.scope}</p>
                    </div>

                    {/* Executive Summary */}
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">Executive Summary</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{test.executiveSummary}</p>
                    </div>

                    {/* Key Findings */}
                    {test.findingsCount > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">Findings Breakdown</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-white dark:bg-gray-900 border border-red-200 rounded p-3">
                            <p className="text-[10px] font-medium text-gray-600 uppercase mb-1">Critical</p>
                            <p className="text-lg font-bold text-red-600">{test.criticalFindings}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-900 border border-orange-200 rounded p-3">
                            <p className="text-[10px] font-medium text-gray-600 uppercase mb-1">High</p>
                            <p className="text-lg font-bold text-orange-600">{test.highFindings}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-900 border border-yellow-200 rounded p-3">
                            <p className="text-[10px] font-medium text-gray-600 uppercase mb-1">Medium</p>
                            <p className="text-lg font-bold text-yellow-600">{test.mediumFindings}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Remediation Status */}
                    {test.status === 'remediation' && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-orange-900 mb-2">Remediation in Progress</p>
                        <p className="text-xs text-orange-800">Follow-up assessment scheduled after remediation completion.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No penetration tests found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
