// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type TriggerType =
  | 'ncr_created'
  | 'capa_overdue'
  | 'incident_reported'
  | 'audit_due'
  | 'document_expiring'
  | 'risk_score_changed'
  | 'training_overdue'
  | 'scheduled'
  | 'manual'
  | 'webhook'
  | 'form_submitted'
  | 'status_changed'
  | 'field_changed';

export type ActionType =
  | 'send_email'
  | 'send_notification'
  | 'create_task'
  | 'update_field'
  | 'assign_user'
  | 'change_status'
  | 'create_ncr'
  | 'create_capa'
  | 'webhook_call'
  | 'approve'
  | 'reject'
  | 'escalate'
  | 'run_report'
  | 'add_comment';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_null'
  | 'is_not_null'
  | 'in'
  | 'not_in'
  | 'between';

export interface WorkflowTrigger {
  type: TriggerType;
  config: Record<string, unknown>;
  filters?: WorkflowCondition[];
}

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  config: Record<string, unknown>;
  conditions?: WorkflowCondition[];
  delay?: number; // ms
  retryCount?: number;
  onError?: 'skip' | 'stop' | 'notify';
}

export interface WorkflowStep {
  id: string;
  name: string;
  actions: WorkflowAction[];
  nextStepId?: string;
  conditions?: WorkflowCondition[];
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  enabled: boolean;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  runCount: number;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  stepsCompleted: number;
  error?: string;
  context: Record<string, unknown>;
}
