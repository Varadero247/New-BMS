'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Zap, Play, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  triggerType: string;
  priority: number;
  isActive: boolean;
  lastExecutedAt: string | null;
  definition: { name: string } | null;
  _count: { executions: number };
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  executionsByStatus: Array<{ status: string; _count: number }>;
  recentExecutions: any[];
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggerFilter, setTriggerFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [triggerFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (triggerFilter) params.append('triggerType', triggerFilter);

      const [rulesRes, statsRes] = await Promise.all([
        api.get(`/automation/rules?${params.toString()}`),
        api.get('/automation/stats'),
      ]);

      setRules(rulesRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await api.put(`/automation/rules/${ruleId}`, { isActive: !isActive });
      fetchData();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleExecuteRule = async (ruleId: string) => {
    try {
      await api.post(`/automation/rules/${ruleId}/execute`, {
        contextData: {},
        triggeredById: 'current-user',
      });
      fetchData();
    } catch (error) {
      console.error('Error executing rule:', error);
    }
  };

  const getTriggerBadge = (trigger: string) => {
    const styles: Record<string, string> = {
      ON_CREATE: 'bg-green-100 text-green-800',
      ON_UPDATE: 'bg-blue-100 text-blue-800',
      ON_STATUS_CHANGE: 'bg-purple-100 text-purple-800',
      ON_FIELD_CHANGE: 'bg-orange-100 text-orange-800',
      SCHEDULED: 'bg-yellow-100 text-yellow-800',
      MANUAL: 'bg-gray-100 text-gray-800',
      WEBHOOK: 'bg-cyan-100 text-cyan-800',
    };
    return styles[trigger] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading automation rules...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Process Automation</h1>
        <Link
          href="/automation/rules/new"
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          <span>Create Rule</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={triggerFilter}
          onChange={(e) => setTriggerFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Triggers</option>
          <option value="ON_CREATE">On Create</option>
          <option value="ON_UPDATE">On Update</option>
          <option value="ON_STATUS_CHANGE">On Status Change</option>
          <option value="ON_FIELD_CHANGE">On Field Change</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="MANUAL">Manual</option>
          <option value="WEBHOOK">Webhook</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Zap className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Total Rules</p>
              <p className="text-xl font-semibold">{stats?.totalRules || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <Play className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Active Rules</p>
              <p className="text-xl font-semibold">{stats?.activeRules || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Successful Executions</p>
              <p className="text-xl font-semibold">
                {stats?.executionsByStatus?.find((e) => e.status === 'COMPLETED')?._count || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Failed Executions</p>
              <p className="text-xl font-semibold">
                {stats?.executionsByStatus?.find((e) => e.status === 'FAILED')?._count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Rule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Trigger
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Workflow
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Executions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Last Run
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rules.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No automation rules found.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <Zap className={`h-5 w-5 ${rule.isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{rule.name}</p>
                        {rule.description && (
                          <p className="max-w-xs truncate text-sm text-gray-500">{rule.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTriggerBadge(rule.triggerType)}`}>
                      {rule.triggerType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {rule.definition?.name || 'Global'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {rule._count.executions}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {rule.lastExecutedAt
                      ? new Date(rule.lastExecutedAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleRule(rule.id, rule.isActive)}
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          rule.isActive
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </button>
                      {rule.triggerType === 'MANUAL' && (
                        <button
                          onClick={() => handleExecuteRule(rule.id)}
                          className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                        >
                          Run
                        </button>
                      )}
                      <Link
                        href={`/automation/rules/${rule.id}`}
                        className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Executions */}
      {stats?.recentExecutions && stats.recentExecutions.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Executions</h2>
          <div className="space-y-3">
            {stats.recentExecutions.map((execution: any) => (
              <div
                key={execution.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className={`rounded-full p-2 ${
                    execution.status === 'COMPLETED' ? 'bg-green-100' :
                    execution.status === 'FAILED' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    {execution.status === 'COMPLETED' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : execution.status === 'FAILED' ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{execution.rule?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(execution.executedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  execution.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  execution.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {execution.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
