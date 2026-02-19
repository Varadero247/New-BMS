'use client';

import { useState, useEffect } from 'react';
import {  } from '@ims/ui';
import {
  Zap,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Play,
  ToggleLeft,
  ToggleRight,
  XCircle } from 'lucide-react';
import api from '@/lib/api';

interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  triggerType: string;
  priority: number;
  isActive: boolean;
  lastExecutedAt: string | null;
  executionCount: number;
  successCount: number;
  failureCount: number;
  definition?: { name: string } | null;
}

const TRIGGER_COLORS: Record<string, string> = {
  ON_CREATE: 'bg-green-100 text-green-800',
  ON_UPDATE: 'bg-blue-100 text-blue-800',
  ON_STATUS_CHANGE: 'bg-purple-100 text-purple-800',
  ON_FIELD_CHANGE: 'bg-orange-100 text-orange-800',
  SCHEDULED: 'bg-yellow-100 text-yellow-800',
  MANUAL: 'bg-gray-100 dark:bg-gray-800 text-gray-800',
  WEBHOOK: 'bg-cyan-100 text-cyan-800' };

const MOCK_RULES: AutomationRule[] = [
  {
    id: '1',
    name: 'Auto-assign NCR to Quality Manager',
    description: 'Assigns newly created NCRs to the quality manager on call.',
    triggerType: 'ON_CREATE',
    priority: 1,
    isActive: true,
    lastExecutedAt: new Date(Date.now() - 3600000).toISOString(),
    executionCount: 47,
    successCount: 46,
    failureCount: 1,
    definition: { name: 'NCR Workflow' } },
  {
    id: '2',
    name: 'Escalate overdue CAPA',
    description: 'Sends escalation email when CAPA due date is exceeded by 3 days.',
    triggerType: 'SCHEDULED',
    priority: 2,
    isActive: true,
    lastExecutedAt: new Date(Date.now() - 86400000).toISOString(),
    executionCount: 120,
    successCount: 120,
    failureCount: 0,
    definition: null },
  {
    id: '3',
    name: 'Auto-close incident on CAPA closure',
    description: 'Closes the linked incident when all CAPAs are marked complete.',
    triggerType: 'ON_STATUS_CHANGE',
    priority: 3,
    isActive: true,
    lastExecutedAt: new Date(Date.now() - 7200000).toISOString(),
    executionCount: 34,
    successCount: 33,
    failureCount: 1,
    definition: { name: 'Incident Workflow' } },
  {
    id: '4',
    name: 'Notify manager on high-risk assessment',
    description: 'Sends notification when risk score exceeds 20.',
    triggerType: 'ON_FIELD_CHANGE',
    priority: 4,
    isActive: false,
    lastExecutedAt: null,
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    definition: null },
  {
    id: '5',
    name: 'Weekly compliance summary',
    description: 'Generates and emails weekly compliance status report every Monday.',
    triggerType: 'SCHEDULED',
    priority: 5,
    isActive: true,
    lastExecutedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    executionCount: 52,
    successCount: 52,
    failureCount: 0,
    definition: null },
  {
    id: '6',
    name: 'Webhook: Jira issue → CAPA',
    description: 'Creates a CAPA from inbound Jira webhook payload.',
    triggerType: 'WEBHOOK',
    priority: 6,
    isActive: false,
    lastExecutedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    executionCount: 8,
    successCount: 7,
    failureCount: 1,
    definition: { name: 'CAPA Workflow' } },
];

function SuccessRate({ success, total }: { success: number; total: number }) {
  if (total === 0) return <span className="text-gray-400 dark:text-gray-500 text-xs">No runs</span>;
  const pct = Math.round((success / total) * 100);
  return (
    <span
      className={`text-xs font-medium ${pct >= 95 ? 'text-green-600' : pct >= 80 ? 'text-yellow-600' : 'text-red-600'}`}
    >
      {pct}% ({success}/{total})
    </span>
  );
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/automation/rules');
        setRules(res.data.data || MOCK_RULES);
      } catch {
        setRules(MOCK_RULES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  async function toggleRule(id: string, current: boolean) {
    try {
      await api.put(`/automation/rules/${id}`, { isActive: !current });
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r)));
    } catch {
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r)));
    }
  }

  const filtered = rules.filter((r) => {
    const matchSearch =
      search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(search.toLowerCase());
    const matchTrigger = triggerFilter === '' || r.triggerType === triggerFilter;
    const matchStatus =
      statusFilter === '' ||
      (statusFilter === 'active' && r.isActive) ||
      (statusFilter === 'inactive' && !r.isActive);
    return matchSearch && matchTrigger && matchStatus;
  });

  const active = rules.filter((r) => r.isActive).length;
  const totalRuns = rules.reduce((s, r) => s + r.executionCount, 0);
  const failures = rules.reduce((s, r) => s + r.failureCount, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Automation Rules</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Event-driven rules that trigger workflow actions automatically
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Rules', value: rules.length, icon: Zap, color: 'indigo' },
          { label: 'Active', value: active, icon: Play, color: 'green' },
          { label: 'Total Executions', value: totalRuns, icon: CheckCircle, color: 'blue' },
          { label: 'Failures', value: failures, icon: AlertTriangle, color: 'red' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg bg-white dark:bg-gray-900 p-4 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-full bg-${stat.color}-100`}>
                  <Icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            aria-label="Search rules..."
            placeholder="Search rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={triggerFilter}
          onChange={(e) => setTriggerFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Triggers</option>
          {[
            'ON_CREATE',
            'ON_UPDATE',
            'ON_STATUS_CHANGE',
            'ON_FIELD_CHANGE',
            'SCHEDULED',
            'MANUAL',
            'WEBHOOK',
          ].map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Rules Table */}
      <div className="rounded-lg bg-white dark:bg-gray-900 shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Rule
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Trigger
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Workflow
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Success Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Last Run
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <Zap className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                  No automation rules found.
                </td>
              </tr>
            ) : (
              filtered.map((rule) => (
                <tr
                  key={rule.id}
                  className={`hover:bg-gray-50 dark:bg-gray-800 ${!rule.isActive ? 'opacity-60' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Zap
                        className={`h-4 w-4 flex-shrink-0 ${rule.isActive ? 'text-indigo-500' : 'text-gray-300'}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {rule.name}
                        </p>
                        {rule.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs truncate">
                            {rule.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TRIGGER_COLORS[rule.triggerType] || 'bg-gray-100 dark:bg-gray-800 text-gray-800'}`}
                    >
                      {rule.triggerType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {rule.definition?.name || (
                      <span className="text-gray-300 dark:text-gray-600">Global</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SuccessRate success={rule.successCount} total={rule.executionCount} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {rule.lastExecutedAt ? (
                      new Date(rule.lastExecutedAt).toLocaleString()
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleRule(rule.id, rule.isActive)}
                      className="flex items-center gap-1.5 mx-auto text-xs font-medium"
                    >
                      {rule.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      )}
                      <span className={rule.isActive ? 'text-green-600' : 'text-gray-400'}>
                        {rule.isActive ? 'Active' : 'Off'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {rule.triggerType === 'MANUAL' && rule.isActive && (
                        <button className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 font-medium">
                          Run Now
                        </button>
                      )}
                      <button className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Rule Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                New Automation Rule
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Auto-escalate overdue items"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trigger Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select trigger...</option>
                  {[
                    'ON_CREATE',
                    'ON_UPDATE',
                    'ON_STATUS_CHANGE',
                    'SCHEDULED',
                    'MANUAL',
                    'WEBHOOK',
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe what this rule does..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
