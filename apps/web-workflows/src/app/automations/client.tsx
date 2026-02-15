'use client';

import { useState } from 'react';
import {
  Zap, Play, Pause, Clock, CheckCircle, AlertTriangle, Search,
  ArrowRight, Bell, Mail, FileText, Users, Shield, ChevronDown, ChevronRight
} from 'lucide-react';

type RuleStatus = 'active' | 'paused' | 'draft' | 'error';
type TriggerType = 'event' | 'schedule' | 'condition' | 'webhook';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  status: RuleStatus;
  triggerType: TriggerType;
  trigger: string;
  conditions: string[];
  actions: { type: string; detail: string; icon: React.ReactNode }[];
  module: string;
  executionCount: number;
  lastExecuted: string;
  createdBy: string;
  errorRate: number;
}

const rules: AutomationRule[] = [
  {
    id: 'auto-1', name: 'NCR Auto-Escalation', description: 'Automatically escalate non-conformances to Quality Manager if not addressed within 48 hours',
    status: 'active', triggerType: 'condition', trigger: 'NCR status = OPEN AND created_at < NOW() - 48 hours',
    conditions: ['NCR severity >= MAJOR', 'No action taken within 48 hours'], module: 'Quality',
    actions: [
      { type: 'Notify', detail: 'Email Quality Manager', icon: <Mail className="h-3.5 w-3.5" /> },
      { type: 'Update', detail: 'Set priority to CRITICAL', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
      { type: 'Notify', detail: 'Push notification to assigned user', icon: <Bell className="h-3.5 w-3.5" /> },
    ],
    executionCount: 23, lastExecuted: '2026-02-12 14:30', createdBy: 'Quality Director', errorRate: 0,
  },
  {
    id: 'auto-2', name: 'Incident Notification Chain', description: 'When a MAJOR or CRITICAL incident is reported, notify HSE Manager, CEO, and create CAPA automatically',
    status: 'active', triggerType: 'event', trigger: 'hs_incidents.created WHERE severity IN (MAJOR, CRITICAL)',
    conditions: ['Severity is MAJOR or CRITICAL'], module: 'Health & Safety',
    actions: [
      { type: 'Notify', detail: 'Email HSE Manager + CEO', icon: <Mail className="h-3.5 w-3.5" /> },
      { type: 'Create', detail: 'Auto-create CAPA linked to incident', icon: <FileText className="h-3.5 w-3.5" /> },
      { type: 'Notify', detail: 'SMS to site emergency contact', icon: <Bell className="h-3.5 w-3.5" /> },
    ],
    executionCount: 8, lastExecuted: '2026-02-10 09:15', createdBy: 'HSE Manager', errorRate: 0,
  },
  {
    id: 'auto-3', name: 'Invoice Overdue Reminder', description: 'Send automated reminders for invoices overdue by 7, 14, and 30 days',
    status: 'active', triggerType: 'schedule', trigger: 'Daily at 08:00 UTC',
    conditions: ['Invoice status = SENT', 'Due date exceeded by 7/14/30 days'], module: 'Finance',
    actions: [
      { type: 'Email', detail: 'Send reminder to customer', icon: <Mail className="h-3.5 w-3.5" /> },
      { type: 'Notify', detail: 'Notify AR team at 30 days', icon: <Bell className="h-3.5 w-3.5" /> },
      { type: 'Update', detail: 'Flag as OVERDUE in system', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
    ],
    executionCount: 156, lastExecuted: '2026-02-13 08:00', createdBy: 'Finance Manager', errorRate: 2.1,
  },
  {
    id: 'auto-4', name: 'Training Expiry Alert', description: 'Alert HR and line managers 30 days before training certificates expire',
    status: 'active', triggerType: 'schedule', trigger: 'Daily at 07:00 UTC',
    conditions: ['Certificate expiry_date <= NOW() + 30 days', 'Renewal not in progress'], module: 'HR',
    actions: [
      { type: 'Notify', detail: 'Email employee and line manager', icon: <Mail className="h-3.5 w-3.5" /> },
      { type: 'Create', detail: 'Create training request in HR module', icon: <FileText className="h-3.5 w-3.5" /> },
    ],
    executionCount: 89, lastExecuted: '2026-02-13 07:00', createdBy: 'HR Manager', errorRate: 0,
  },
  {
    id: 'auto-5', name: 'Supplier Performance Alert', description: 'Flag suppliers dropping below 85% OTD or quality score and notify procurement',
    status: 'active', triggerType: 'condition', trigger: 'supplier_scorecard.updated WHERE otd_score < 85 OR quality_score < 85',
    conditions: ['OTD < 85% or Quality Score < 85%', 'Supplier status = APPROVED'], module: 'Quality',
    actions: [
      { type: 'Notify', detail: 'Email Procurement Manager', icon: <Mail className="h-3.5 w-3.5" /> },
      { type: 'Update', detail: 'Change supplier status to CONDITIONAL', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
      { type: 'Create', detail: 'Create supplier improvement action', icon: <FileText className="h-3.5 w-3.5" /> },
    ],
    executionCount: 12, lastExecuted: '2026-02-08 16:45', createdBy: 'Quality Director', errorRate: 0,
  },
  {
    id: 'auto-6', name: 'Work Order SLA Breach', description: 'Escalate maintenance work orders exceeding SLA response time',
    status: 'active', triggerType: 'condition', trigger: 'cmms_work_orders WHERE status = OPEN AND age > sla_hours',
    conditions: ['Work order open beyond SLA', 'Priority = CRITICAL or HIGH'], module: 'CMMS',
    actions: [
      { type: 'Reassign', detail: 'Escalate to Maintenance Supervisor', icon: <Users className="h-3.5 w-3.5" /> },
      { type: 'Notify', detail: 'SMS to on-call technician', icon: <Bell className="h-3.5 w-3.5" /> },
    ],
    executionCount: 34, lastExecuted: '2026-02-13 11:20', createdBy: 'Operations Manager', errorRate: 0,
  },
  {
    id: 'auto-7', name: 'Document Review Reminder', description: 'Remind document owners 30 days before periodic review date',
    status: 'paused', triggerType: 'schedule', trigger: 'Weekly on Monday at 09:00 UTC',
    conditions: ['Document review_date <= NOW() + 30 days', 'Status = APPROVED'], module: 'Quality',
    actions: [
      { type: 'Notify', detail: 'Email document owner', icon: <Mail className="h-3.5 w-3.5" /> },
    ],
    executionCount: 67, lastExecuted: '2026-01-27 09:00', createdBy: 'Document Controller', errorRate: 0,
  },
  {
    id: 'auto-8', name: 'ESG Data Collection', description: 'Monthly reminder to department heads to submit ESG metrics data',
    status: 'active', triggerType: 'schedule', trigger: '1st of each month at 08:00 UTC',
    conditions: ['Previous month data not submitted'], module: 'ESG',
    actions: [
      { type: 'Notify', detail: 'Email department heads with data form', icon: <Mail className="h-3.5 w-3.5" /> },
      { type: 'Create', detail: 'Create data collection tasks', icon: <FileText className="h-3.5 w-3.5" /> },
    ],
    executionCount: 14, lastExecuted: '2026-02-01 08:00', createdBy: 'ESG Manager', errorRate: 0,
  },
  {
    id: 'auto-9', name: 'Access Review Trigger', description: 'Trigger quarterly access review for all users with elevated permissions',
    status: 'draft', triggerType: 'schedule', trigger: 'Quarterly on 1st Jan/Apr/Jul/Oct',
    conditions: ['User has ADMIN or MANAGER role'], module: 'InfoSec',
    actions: [
      { type: 'Create', detail: 'Generate access review tasks', icon: <Shield className="h-3.5 w-3.5" /> },
      { type: 'Notify', detail: 'Email IT Security team', icon: <Mail className="h-3.5 w-3.5" /> },
    ],
    executionCount: 0, lastExecuted: 'Never', createdBy: 'InfoSec Manager', errorRate: 0,
  },
];

const statusConfig: Record<RuleStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: <Play className="h-3.5 w-3.5" /> },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700', icon: <Pause className="h-3.5 w-3.5" /> },
  draft: { label: 'Draft', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600', icon: <Clock className="h-3.5 w-3.5" /> },
  error: { label: 'Error', color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const triggerLabels: Record<TriggerType, string> = {
  event: 'Event-based', schedule: 'Scheduled', condition: 'Condition-based', webhook: 'Webhook',
};

export default function AutomationsClient() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['auto-1']));
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = rules.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.module.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = rules.filter((r) => r.status === 'active').length;
  const totalExecutions = rules.reduce((s, r) => s + r.executionCount, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" />
          Automation Rules
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure automated workflows triggered by events, schedules, or conditions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Rules</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{rules.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Active</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Executions</p>
          <p className="text-3xl font-bold text-indigo-700 mt-1">{totalExecutions}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Avg Error Rate</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{(rules.reduce((s, r) => s + r.errorRate, 0) / rules.length).toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search automation rules..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'paused', 'draft'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === s ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : statusConfig[s as RuleStatus]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((rule) => {
          const isExpanded = expanded.has(rule.id);
          const cfg = statusConfig[rule.status];
          return (
            <div key={rule.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded((prev) => { const n = new Set(prev); n.has(rule.id) ? n.delete(rule.id) : n.add(rule.id); return n; })}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
                  <Zap className={`h-5 w-5 ${rule.status === 'active' ? 'text-amber-500' : 'text-gray-300'}`} />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{rule.name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.icon}{cfg.label}</span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded-full text-xs">{rule.module}</span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">{triggerLabels[rule.triggerType]}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{rule.executionCount} runs</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Trigger</h4>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <p className="text-xs font-mono text-indigo-700">{rule.trigger}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Conditions</h4>
                      <div className="space-y-1">
                        {rule.conditions.map((c, i) => (
                          <p key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                            <CheckCircle className="h-3 w-3 text-green-500" /> {c}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Actions</h4>
                      <div className="space-y-1.5">
                        {rule.actions.map((a, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {i > 0 && <ArrowRight className="h-3 w-3 text-gray-300 dark:text-gray-600 ml-1" />}
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                              {a.icon}
                              <span className="text-xs text-gray-700 dark:text-gray-300">{a.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <span>Created by: {rule.createdBy}</span>
                    <span>Last executed: {rule.lastExecuted}</span>
                    <span>Executions: {rule.executionCount}</span>
                    <span>Error rate: {rule.errorRate}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
