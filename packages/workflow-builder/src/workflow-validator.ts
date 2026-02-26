// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type {
  Workflow,
  WorkflowTrigger,
  WorkflowAction,
  WorkflowStep,
  TriggerType,
  ActionType,
} from './types';

const VALID_TRIGGER_TYPES: TriggerType[] = [
  'ncr_created', 'capa_overdue', 'incident_reported', 'audit_due',
  'document_expiring', 'risk_score_changed', 'training_overdue', 'scheduled',
  'manual', 'webhook', 'form_submitted', 'status_changed', 'field_changed',
];

const VALID_ACTION_TYPES: ActionType[] = [
  'send_email', 'send_notification', 'create_task', 'update_field',
  'assign_user', 'change_status', 'create_ncr', 'create_capa', 'webhook_call',
  'approve', 'reject', 'escalate', 'run_report', 'add_comment',
];

export function validateTrigger(trigger: Partial<WorkflowTrigger>): string[] {
  const errors: string[] = [];
  if (!trigger) {
    errors.push('Trigger is required');
    return errors;
  }
  if (!trigger.type) {
    errors.push('Trigger type is required');
  } else if (!VALID_TRIGGER_TYPES.includes(trigger.type as TriggerType)) {
    errors.push(`Unknown trigger type: "${trigger.type}"`);
  }
  if (trigger.config === undefined || trigger.config === null) {
    errors.push('Trigger config is required');
  }
  return errors;
}

export function validateAction(action: Partial<WorkflowAction>): string[] {
  const errors: string[] = [];
  if (!action) {
    errors.push('Action is required');
    return errors;
  }
  if (!action.id) errors.push('Action id is required');
  if (!action.type) {
    errors.push('Action type is required');
  } else if (!VALID_ACTION_TYPES.includes(action.type as ActionType)) {
    errors.push(`Unknown action type: "${action.type}"`);
  }
  if (action.config === undefined || action.config === null) {
    errors.push('Action config is required');
  }
  if (action.delay !== undefined && (typeof action.delay !== 'number' || action.delay < 0)) {
    errors.push('Action delay must be a non-negative number');
  }
  if (action.retryCount !== undefined && (typeof action.retryCount !== 'number' || action.retryCount < 0)) {
    errors.push('Action retryCount must be a non-negative number');
  }
  if (action.onError && !['skip', 'stop', 'notify'].includes(action.onError)) {
    errors.push('Action onError must be one of: skip, stop, notify');
  }
  return errors;
}

export function validateStep(step: Partial<WorkflowStep>): string[] {
  const errors: string[] = [];
  if (!step) {
    errors.push('Step is required');
    return errors;
  }
  if (!step.id) errors.push('Step id is required');
  if (!step.name) errors.push('Step name is required');
  if (!Array.isArray(step.actions) || step.actions.length === 0) {
    errors.push('Step must have at least one action');
  } else {
    step.actions.forEach((action, i) => {
      const actionErrors = validateAction(action);
      actionErrors.forEach((e) => errors.push(`Step action[${i}]: ${e}`));
    });
  }
  return errors;
}

/** Detects circular dependencies among steps via nextStepId references. */
export function detectCircularDeps(steps: WorkflowStep[]): boolean {
  const stepMap = new Map(steps.map((s) => [s.id, s]));

  for (const startStep of steps) {
    const visited = new Set<string>();
    let current: WorkflowStep | undefined = startStep;

    while (current) {
      if (visited.has(current.id)) return true; // cycle detected
      visited.add(current.id);
      if (!current.nextStepId) break;
      current = stepMap.get(current.nextStepId);
    }
  }

  return false;
}

export function validateWorkflow(workflow: Partial<Workflow>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!workflow.id) errors.push('Workflow id is required');
  if (!workflow.name || workflow.name.trim() === '') errors.push('Workflow name is required');
  if (!workflow.createdBy) errors.push('Workflow createdBy is required');

  if (workflow.version !== undefined && (typeof workflow.version !== 'number' || workflow.version < 0)) {
    errors.push('Workflow version must be a non-negative number');
  }

  if (!workflow.trigger) {
    errors.push('Workflow trigger is required');
  } else {
    const triggerErrors = validateTrigger(workflow.trigger);
    triggerErrors.forEach((e) => errors.push(`Trigger: ${e}`));
  }

  if (!Array.isArray(workflow.steps) || workflow.steps.length === 0) {
    errors.push('Workflow must have at least one step');
  } else {
    workflow.steps.forEach((step, i) => {
      const stepErrors = validateStep(step);
      stepErrors.forEach((e) => errors.push(`Step[${i}]: ${e}`));
    });

    if (detectCircularDeps(workflow.steps)) {
      errors.push('Workflow steps contain a circular dependency');
    }
  }

  return { valid: errors.length === 0, errors };
}
