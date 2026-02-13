'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@ims/ui';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'APPROVE' | 'REJECT';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  module: string;
  action: AuditAction;
  resource: string;
  details: string;
  ip: string;
}

const MODULES = [
  'All Modules', 'Gateway', 'Health & Safety', 'Environment', 'Quality', 'Inventory',
  'HR', 'Payroll', 'Workflows', 'Project Mgmt', 'Finance', 'CRM', 'InfoSec',
  'ESG', 'CMMS', 'Portal', 'Food Safety', 'Energy', 'Analytics', 'Field Service',
  'ISO 42001', 'ISO 37001',
];

const ACTIONS: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'APPROVE', 'REJECT'];

const actionConfig: Record<AuditAction, { color: string; bg: string; icon: string }> = {
  CREATE: { color: 'text-green-700', bg: 'bg-green-100', icon: '+' },
  UPDATE: { color: 'text-blue-700', bg: 'bg-blue-100', icon: '~' },
  DELETE: { color: 'text-red-700', bg: 'bg-red-100', icon: 'x' },
  LOGIN: { color: 'text-purple-700', bg: 'bg-purple-100', icon: '→' },
  EXPORT: { color: 'text-cyan-700', bg: 'bg-cyan-100', icon: '↓' },
  APPROVE: { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '✓' },
  REJECT: { color: 'text-orange-700', bg: 'bg-orange-100', icon: '✗' },
};

// Generate realistic mock audit data
function generateMockData(): AuditEntry[] {
  const users = ['admin@ims.local', 'j.smith@acme.com', 'm.jones@acme.com', 'a.patel@acme.com', 'l.chen@acme.com'];
  const modules = ['Health & Safety', 'Environment', 'Quality', 'Finance', 'HR', 'CRM', 'ESG', 'CMMS', 'ISO 42001', 'Gateway'];
  const entries: AuditEntry[] = [];

  const resourceExamples: Record<string, string[]> = {
    'Health & Safety': ['Risk Assessment RA-2026-042', 'Incident INC-2026-015', 'CAPA CAPA-2026-008'],
    'Environment': ['Aspect ENV-ASP-2026-011', 'Event ENV-EVT-2026-003', 'Objective ENV-OBJ-2026-002'],
    'Quality': ['NCR NCR-2026-019', 'CAPA QCA-2026-007', 'Audit QA-2026-004'],
    'Finance': ['Invoice INV-2026-089', 'Account ACC-001', 'Report FIN-RPT-Q1'],
    'HR': ['Employee EMP-2026-045', 'Leave Request LR-2026-112', 'Training TR-2026-033'],
    'CRM': ['Deal D-2026-023', 'Contact CT-2026-087', 'Campaign CMP-2026-005'],
    'ESG': ['Emission Record EM-2026-034', 'Initiative INI-2026-012', 'Metric MET-2026-006'],
    'CMMS': ['Work Order WO-2026-156', 'Asset AST-2026-034', 'PM Plan PM-2026-009'],
    'ISO 42001': ['AI System AIS-001', 'Impact Assessment IA-2026-003', 'Control CTRL-A.6.2.1'],
    'Gateway': ['User Session', 'API Key ak_****3f2d', 'Role assignment'],
  };

  const detailExamples = [
    'Created new record', 'Updated status to Active', 'Deleted draft record',
    'Logged in via SSO', 'Exported CSV report (234 rows)', 'Approved for release',
    'Rejected — insufficient evidence', 'Updated risk score from 12 to 18',
    'Changed severity to MAJOR', 'Added 3 corrective actions', 'Completed calibration review',
    'Assigned to Quality Team', 'Uploaded 2 evidence documents', 'Generated compliance report',
  ];

  for (let i = 0; i < 50; i++) {
    const module = modules[Math.floor(Math.random() * modules.length)];
    const resources = resourceExamples[module] || ['Record'];
    const actionIdx = Math.floor(Math.random() * ACTIONS.length);
    const minutesAgo = Math.floor(Math.random() * 10080); // up to 7 days

    entries.push({
      id: `audit-${String(i + 1).padStart(4, '0')}`,
      timestamp: new Date(Date.now() - minutesAgo * 60000).toISOString(),
      user: users[Math.floor(Math.random() * users.length)],
      module,
      action: ACTIONS[actionIdx],
      resource: resources[Math.floor(Math.random() * resources.length)],
      details: detailExamples[Math.floor(Math.random() * detailExamples.length)],
      ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
    });
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const mockData = generateMockData();

export default function AuditTrailClient() {
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'1d' | '7d' | '30d' | 'all'>('7d');

  const filtered = useMemo(() => {
    let data = mockData;

    if (moduleFilter !== 'All Modules') {
      data = data.filter(e => e.module === moduleFilter);
    }
    if (actionFilter !== 'ALL') {
      data = data.filter(e => e.action === actionFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(e =>
        e.user.toLowerCase().includes(q) ||
        e.resource.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q)
      );
    }

    const now = Date.now();
    if (dateRange === '1d') data = data.filter(e => now - new Date(e.timestamp).getTime() < 86400000);
    else if (dateRange === '7d') data = data.filter(e => now - new Date(e.timestamp).getTime() < 604800000);
    else if (dateRange === '30d') data = data.filter(e => now - new Date(e.timestamp).getTime() < 2592000000);

    return data;
  }, [moduleFilter, actionFilter, searchQuery, dateRange]);

  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of filtered) counts[e.action] = (counts[e.action] || 0) + 1;
    return counts;
  }, [filtered]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-sm text-gray-500 mt-1">Cross-module activity log with full traceability</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
            <div className="text-sm text-gray-500">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{actionCounts['CREATE'] || 0}</div>
            <div className="text-sm text-gray-500">Creates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{actionCounts['UPDATE'] || 0}</div>
            <div className="text-sm text-gray-500">Updates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{actionCounts['DELETE'] || 0}</div>
            <div className="text-sm text-gray-500">Deletes</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-lg border p-4">
        <input
          type="text"
          placeholder="Search user, resource, details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white"
        >
          {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as AuditAction | 'ALL')}
          className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white"
        >
          <option value="ALL">All Actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="flex rounded-md border border-gray-300 overflow-hidden">
          {(['1d', '7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 text-xs font-medium ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-700 w-40">Timestamp</th>
              <th className="text-left p-3 font-medium text-gray-700 w-40">User</th>
              <th className="text-left p-3 font-medium text-gray-700 w-28">Module</th>
              <th className="text-left p-3 font-medium text-gray-700 w-24">Action</th>
              <th className="text-left p-3 font-medium text-gray-700">Resource</th>
              <th className="text-left p-3 font-medium text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">No audit entries match your filters</td>
              </tr>
            ) : filtered.slice(0, 100).map(entry => {
              const ac = actionConfig[entry.action];
              const ts = new Date(entry.timestamp);
              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs text-gray-500">
                    {ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}{' '}
                    {ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-3 text-xs text-gray-700 truncate max-w-[160px]">{entry.user}</td>
                  <td className="p-3">
                    <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700">
                      {entry.module}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ac.bg} ${ac.color}`}>
                      <span className="font-mono">{ac.icon}</span>
                      {entry.action}
                    </span>
                  </td>
                  <td className="p-3 text-xs font-medium text-gray-900 truncate max-w-[200px]">{entry.resource}</td>
                  <td className="p-3 text-xs text-gray-500 truncate max-w-[250px]">{entry.details}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <div className="p-3 text-center text-xs text-gray-500 border-t bg-gray-50">
            Showing 100 of {filtered.length} entries
          </div>
        )}
      </div>
    </div>
  );
}
