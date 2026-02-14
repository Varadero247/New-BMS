'use client';

import { useState, useEffect } from 'react';
import {
  Zap, Shield, Leaf, Heart, Users, Wrench,
  ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, SkipForward,
  ToggleLeft, ToggleRight, Filter,
} from 'lucide-react';
import api from '@/lib/api';

interface RuleTrigger {
  type: string;
  module: string;
  recordType: string;
}

interface RuleCondition {
  field: string;
  operator: string;
  value: string | number | string[];
}

interface RuleAction {
  type: string;
  target: string;
  params: Record<string, unknown>;
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  category: string;
  enabled: boolean;
}

interface ExecutionLogEntry {
  id: string;
  ruleId: string;
  status: string;
  details: string;
  timestamp: string;
}

const CATEGORIES = ['all', 'quality', 'safety', 'environment', 'compliance', 'hr', 'maintenance'] as const;

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  quality: Shield,
  safety: Heart,
  environment: Leaf,
  compliance: Shield,
  hr: Users,
  maintenance: Wrench,
};

const CATEGORY_COLORS: Record<string, string> = {
  quality: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  safety: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  environment: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  compliance: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  hr: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  maintenance: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const TRIGGER_LABELS: Record<string, string> = {
  record_created: 'On Create',
  record_updated: 'On Update',
  status_changed: 'Status Change',
  field_threshold: 'Threshold',
  date_approaching: 'Date Approaching',
  date_passed: 'Date Passed',
  score_changed: 'Score Change',
  periodic: 'Periodic',
};

const ACTION_LABELS: Record<string, string> = {
  create_record: 'Create Record',
  send_notification: 'Notify',
  send_email: 'Email',
  update_field: 'Update',
  escalate: 'Escalate',
  assign_task: 'Assign Task',
  webhook: 'Webhook',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
  if (status === 'failed') return <XCircle className="h-3.5 w-3.5 text-red-500" />;
  return <SkipForward className="h-3.5 w-3.5 text-gray-400" />;
}

export default function RulesPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<Record<string, ExecutionLogEntry[]>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  async function loadRules() {
    try {
      const res = await api.get('/admin/automation-rules');
      setRules(res.data.data || []);
    } catch {
      // Use empty array on error
      setRules([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRule(ruleId: string, currentEnabled: boolean) {
    setTogglingId(ruleId);
    try {
      const action = currentEnabled ? 'disable' : 'enable';
      await api.post(`/admin/automation-rules/${ruleId}/${action}`);
      setRules(prev => prev.map(r =>
        r.id === ruleId ? { ...r, enabled: !currentEnabled } : r
      ));
    } catch {
      // Optimistic update anyway
      setRules(prev => prev.map(r =>
        r.id === ruleId ? { ...r, enabled: !currentEnabled } : r
      ));
    } finally {
      setTogglingId(null);
    }
  }

  async function loadExecutionLog(ruleId: string) {
    try {
      const res = await api.get(`/admin/automation-rules/${ruleId}/log?limit=5`);
      setExecutionLogs(prev => ({ ...prev, [ruleId]: res.data.data || [] }));
    } catch {
      setExecutionLogs(prev => ({ ...prev, [ruleId]: [] }));
    }
  }

  function handleExpand(ruleId: string) {
    if (expandedRule === ruleId) {
      setExpandedRule(null);
    } else {
      setExpandedRule(ruleId);
      if (!executionLogs[ruleId]) {
        loadExecutionLog(ruleId);
      }
    }
  }

  const filtered = activeCategory === 'all'
    ? rules
    : rules.filter(r => r.category === activeCategory);

  const enabledCount = rules.filter(r => r.enabled).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Automation Rules Library</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {rules.length} pre-built rules available -- {enabledCount} enabled for your organisation
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              activeCategory === cat
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {cat === 'all' ? `All (${rules.length})` : `${cat} (${rules.filter(r => r.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(rule => {
          const CategoryIcon = CATEGORY_ICONS[rule.category] || Zap;
          const isExpanded = expandedRule === rule.id;
          const logs = executionLogs[rule.id] || [];

          return (
            <div
              key={rule.id}
              className={`rounded-lg border bg-white dark:bg-gray-900 shadow-sm transition-all ${
                rule.enabled
                  ? 'border-brand-200 dark:border-brand-800'
                  : 'border-gray-200 dark:border-gray-700 opacity-75'
              }`}
            >
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {rule.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {rule.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id, rule.enabled)}
                    disabled={togglingId === rule.id}
                    className="flex-shrink-0"
                  >
                    {rule.enabled ? (
                      <ToggleRight className="h-7 w-7 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {/* Trigger Chip */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    <Zap className="h-3 w-3" />
                    {TRIGGER_LABELS[rule.trigger.type] || rule.trigger.type}
                  </span>

                  {/* Action Chips */}
                  {rule.actions.map((action, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {ACTION_LABELS[action.type] || action.type}
                    </span>
                  ))}

                  {/* Category Badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[rule.category] || 'bg-gray-100 text-gray-700'}`}>
                    <CategoryIcon className="h-3 w-3" />
                    {rule.category}
                  </span>
                </div>

                {/* Module Info */}
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Module: <span className="font-medium">{rule.trigger.module}</span> -- Record: <span className="font-medium">{rule.trigger.recordType}</span>
                </div>
              </div>

              {/* Expand/Collapse */}
              <button
                onClick={() => handleExpand(rule.id)}
                className="w-full flex items-center justify-center gap-1 px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-100 dark:border-gray-800 transition-colors"
              >
                {isExpanded ? (
                  <>Hide Executions <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <>View Executions <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </button>

              {/* Execution Log */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
                  {logs.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">No executions recorded yet</p>
                  ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                      {logs.map(log => (
                        <li key={log.id} className="flex items-center gap-2 py-2">
                          <StatusIcon status={log.status} />
                          <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">
                            {log.details}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Filter className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No automation rules found in this category
          </p>
        </div>
      )}
    </div>
  );
}
