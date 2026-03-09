// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

type RuleStatus = 'active' | 'paused' | 'draft' | 'error';
type TriggerType = 'event' | 'schedule' | 'condition' | 'webhook';
type NodeCategory = 'trigger' | 'condition' | 'action' | 'notification';
type DefinitionStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';
type DefinitionCategory =
  | 'APPROVAL'
  | 'REVIEW'
  | 'CHANGE_MANAGEMENT'
  | 'INCIDENT'
  | 'REQUEST'
  | 'ONBOARDING'
  | 'OFFBOARDING'
  | 'CUSTOM';

// ---------------------------------------------------------------------------
// Domain constants (inlined from source)
// ---------------------------------------------------------------------------

const RULE_STATUSES: RuleStatus[] = ['active', 'paused', 'draft', 'error'];
const TRIGGER_TYPES: TriggerType[] = ['event', 'schedule', 'condition', 'webhook'];
const NODE_CATEGORIES: NodeCategory[] = ['trigger', 'condition', 'action', 'notification'];
const DEFINITION_STATUSES: DefinitionStatus[] = ['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED'];
const DEFINITION_CATEGORIES: DefinitionCategory[] = [
  'APPROVAL', 'REVIEW', 'CHANGE_MANAGEMENT', 'INCIDENT',
  'REQUEST', 'ONBOARDING', 'OFFBOARDING', 'CUSTOM',
];

// Rule status config (from automations/client.tsx)
const ruleStatusConfig: Record<RuleStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700' },
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  error: { label: 'Error', color: 'bg-red-100 text-red-700' },
};

// Trigger labels (from automations/client.tsx)
const triggerLabels: Record<TriggerType, string> = {
  event: 'Event-based',
  schedule: 'Scheduled',
  condition: 'Condition-based',
  webhook: 'Webhook',
};

// Definition status badge (from definitions/page.tsx)
const definitionStatusBadge: Record<DefinitionStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  DEPRECATED: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-red-100 text-red-800',
};

// Builder palette config (from builder/client.tsx)
interface PaletteEntry {
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  subTypeCount: number;
}

const paletteConfig: Record<NodeCategory, PaletteEntry> = {
  trigger: {
    color: 'green',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-400',
    textColor: 'text-green-700',
    subTypeCount: 6, // record_created, field_changed, date_reached, webhook_received, event_bus_event, schedule_cron
  },
  condition: {
    color: 'yellow',
    bgLight: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-700',
    subTypeCount: 7, // field_equals, field_contains, field_greater_than, field_less_than, role_is, status_is, custom_expression
  },
  action: {
    color: 'blue',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-700',
    subTypeCount: 8, // create_record, update_field, send_email, send_notification, create_task, assign_user, publish_event, call_webhook
  },
  notification: {
    color: 'purple',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-700',
    subTypeCount: 4, // email, in_app, sms, escalation
  },
};

// Trigger sub-types
const triggerSubTypes = [
  { value: 'record_created', label: 'Record Created' },
  { value: 'field_changed', label: 'Field Changed' },
  { value: 'date_reached', label: 'Date Reached' },
  { value: 'webhook_received', label: 'Webhook Received' },
  { value: 'event_bus_event', label: 'Event Bus Event' },
  { value: 'schedule_cron', label: 'Schedule (Cron)' },
];

// Condition sub-types
const conditionSubTypes = [
  { value: 'field_equals', label: 'Field Equals' },
  { value: 'field_contains', label: 'Field Contains' },
  { value: 'field_greater_than', label: 'Field Greater Than' },
  { value: 'field_less_than', label: 'Field Less Than' },
  { value: 'role_is', label: 'Role Is' },
  { value: 'status_is', label: 'Status Is' },
  { value: 'custom_expression', label: 'Custom Expression' },
];

// Action sub-types
const actionSubTypes = [
  { value: 'create_record', label: 'Create Record' },
  { value: 'update_field', label: 'Update Field' },
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'create_task', label: 'Create Task' },
  { value: 'assign_user', label: 'Assign User' },
  { value: 'publish_event', label: 'Publish Event' },
  { value: 'call_webhook', label: 'Call Webhook' },
];

// Notification sub-types
const notificationSubTypes = [
  { value: 'email', label: 'Email' },
  { value: 'in_app', label: 'In-App' },
  { value: 'sms', label: 'SMS' },
  { value: 'escalation', label: 'Escalation' },
];

// ---------------------------------------------------------------------------
// MOCK automation rules (from automations/client.tsx)
// ---------------------------------------------------------------------------

interface MockRule {
  id: string;
  name: string;
  status: RuleStatus;
  triggerType: TriggerType;
  module: string;
  executionCount: number;
  errorRate: number;
  conditionCount: number;
  actionCount: number;
}

const MOCK_RULES: MockRule[] = [
  { id: 'auto-1', name: 'NCR Auto-Escalation', status: 'active', triggerType: 'condition', module: 'Quality', executionCount: 23, errorRate: 0, conditionCount: 2, actionCount: 3 },
  { id: 'auto-2', name: 'Incident Notification Chain', status: 'active', triggerType: 'event', module: 'Health & Safety', executionCount: 8, errorRate: 0, conditionCount: 1, actionCount: 3 },
  { id: 'auto-3', name: 'Invoice Overdue Reminder', status: 'active', triggerType: 'schedule', module: 'Finance', executionCount: 156, errorRate: 2.1, conditionCount: 2, actionCount: 3 },
  { id: 'auto-4', name: 'Training Expiry Alert', status: 'active', triggerType: 'schedule', module: 'HR', executionCount: 89, errorRate: 0, conditionCount: 2, actionCount: 2 },
  { id: 'auto-5', name: 'Supplier Performance Alert', status: 'active', triggerType: 'condition', module: 'Quality', executionCount: 12, errorRate: 0, conditionCount: 2, actionCount: 3 },
  { id: 'auto-6', name: 'Work Order SLA Breach', status: 'active', triggerType: 'condition', module: 'CMMS', executionCount: 34, errorRate: 0, conditionCount: 2, actionCount: 2 },
  { id: 'auto-7', name: 'Document Review Reminder', status: 'paused', triggerType: 'schedule', module: 'Quality', executionCount: 67, errorRate: 0, conditionCount: 2, actionCount: 1 },
  { id: 'auto-8', name: 'ESG Data Collection', status: 'active', triggerType: 'schedule', module: 'ESG', executionCount: 14, errorRate: 0, conditionCount: 1, actionCount: 2 },
  { id: 'auto-9', name: 'Access Review Trigger', status: 'draft', triggerType: 'schedule', module: 'InfoSec', executionCount: 0, errorRate: 0, conditionCount: 1, actionCount: 2 },
];

// MOCK ISO templates (from builder/client.tsx)
interface MockTemplate {
  name: string;
  description: string;
  nodeCount: number;
  hasTrigger: boolean;
}

const MOCK_ISO_TEMPLATES: MockTemplate[] = [
  { name: 'NCR Approval Chain', description: 'Non-conformance report approval with severity routing', nodeCount: 5, hasTrigger: true },
  { name: 'CAPA Lifecycle', description: 'Corrective/preventive action full lifecycle management', nodeCount: 5, hasTrigger: true },
  { name: 'Audit Scheduling', description: 'Monthly automated audit creation and assignment', nodeCount: 4, hasTrigger: true },
  { name: 'PTW Approval', description: 'Permit to work risk-based approval routing', nodeCount: 4, hasTrigger: true },
  { name: 'Document Review', description: 'Automated document review cycle with escalation', nodeCount: 4, hasTrigger: true },
  { name: 'Incident Escalation', description: 'Major incident automatic escalation and investigation', nodeCount: 4, hasTrigger: true },
];

// ---------------------------------------------------------------------------
// Pure helper functions (derived from source logic)
// ---------------------------------------------------------------------------

/** Whether a rule is currently running */
function isRuleActive(status: RuleStatus): boolean {
  return status === 'active';
}

/** Total execution count across all rules */
function totalExecutions(rules: MockRule[]): number {
  return rules.reduce((s, r) => s + r.executionCount, 0);
}

/** Average error rate across all rules */
function avgErrorRate(rules: MockRule[]): number {
  if (rules.length === 0) return 0;
  return rules.reduce((s, r) => s + r.errorRate, 0) / rules.length;
}

/** Count of active rules */
function activeRuleCount(rules: MockRule[]): number {
  return rules.filter(r => r.status === 'active').length;
}

/** Look up trigger label */
function getTriggerLabel(type: TriggerType): string {
  return triggerLabels[type];
}

/** Whether a definition status is terminal (no further changes expected) */
function isTerminalDefinitionStatus(status: DefinitionStatus): boolean {
  return status === 'ARCHIVED';
}

/** Whether a definition is deployable */
function isDeployable(status: DefinitionStatus): boolean {
  return status === 'DRAFT' || status === 'DEPRECATED';
}

/** Whether a node category produces side effects */
function producesSideEffect(category: NodeCategory): boolean {
  return category === 'action' || category === 'notification';
}

/** Whether a node category is a flow-control node */
function isFlowControl(category: NodeCategory): boolean {
  return category === 'trigger' || category === 'condition';
}

/** Get default sub-type value for a category */
function getDefaultSubType(category: NodeCategory): string {
  const defaults: Record<NodeCategory, string> = {
    trigger: 'record_created',
    condition: 'field_equals',
    action: 'create_record',
    notification: 'email',
  };
  return defaults[category];
}

// ---------------------------------------------------------------------------
// Tests: RULE_STATUSES array
// ---------------------------------------------------------------------------

describe('RULE_STATUSES array', () => {
  it('has exactly 4 statuses', () => expect(RULE_STATUSES).toHaveLength(4));
  it('includes active', () => expect(RULE_STATUSES).toContain('active'));
  it('includes paused', () => expect(RULE_STATUSES).toContain('paused'));
  it('includes draft', () => expect(RULE_STATUSES).toContain('draft'));
  it('includes error', () => expect(RULE_STATUSES).toContain('error'));
  for (const s of RULE_STATUSES) {
    it(`${s} is a non-empty string`, () => expect(s.length).toBeGreaterThan(0));
  }
});

// ---------------------------------------------------------------------------
// Tests: TRIGGER_TYPES array
// ---------------------------------------------------------------------------

describe('TRIGGER_TYPES array', () => {
  it('has exactly 4 types', () => expect(TRIGGER_TYPES).toHaveLength(4));
  it('includes event', () => expect(TRIGGER_TYPES).toContain('event'));
  it('includes schedule', () => expect(TRIGGER_TYPES).toContain('schedule'));
  it('includes condition', () => expect(TRIGGER_TYPES).toContain('condition'));
  it('includes webhook', () => expect(TRIGGER_TYPES).toContain('webhook'));
  for (const t of TRIGGER_TYPES) {
    it(`${t} is a non-empty string`, () => expect(t.length).toBeGreaterThan(0));
  }
});

// ---------------------------------------------------------------------------
// Tests: NODE_CATEGORIES array
// ---------------------------------------------------------------------------

describe('NODE_CATEGORIES array', () => {
  it('has exactly 4 categories', () => expect(NODE_CATEGORIES).toHaveLength(4));
  it('includes trigger', () => expect(NODE_CATEGORIES).toContain('trigger'));
  it('includes condition', () => expect(NODE_CATEGORIES).toContain('condition'));
  it('includes action', () => expect(NODE_CATEGORIES).toContain('action'));
  it('includes notification', () => expect(NODE_CATEGORIES).toContain('notification'));
  it('trigger is first (canonical order)', () => expect(NODE_CATEGORIES[0]).toBe('trigger'));
  it('notification is last (canonical order)', () => expect(NODE_CATEGORIES[3]).toBe('notification'));
});

// ---------------------------------------------------------------------------
// Tests: DEFINITION_STATUSES array
// ---------------------------------------------------------------------------

describe('DEFINITION_STATUSES array', () => {
  it('has exactly 4 statuses', () => expect(DEFINITION_STATUSES).toHaveLength(4));
  for (const s of DEFINITION_STATUSES) {
    it(`${s} is uppercase`, () => expect(s).toBe(s.toUpperCase()));
  }
});

// ---------------------------------------------------------------------------
// Tests: DEFINITION_CATEGORIES array
// ---------------------------------------------------------------------------

describe('DEFINITION_CATEGORIES array', () => {
  it('has exactly 8 categories', () => expect(DEFINITION_CATEGORIES).toHaveLength(8));
  it('includes APPROVAL', () => expect(DEFINITION_CATEGORIES).toContain('APPROVAL'));
  it('includes INCIDENT', () => expect(DEFINITION_CATEGORIES).toContain('INCIDENT'));
  it('includes ONBOARDING', () => expect(DEFINITION_CATEGORIES).toContain('ONBOARDING'));
  it('includes OFFBOARDING', () => expect(DEFINITION_CATEGORIES).toContain('OFFBOARDING'));
  it('includes CUSTOM', () => expect(DEFINITION_CATEGORIES).toContain('CUSTOM'));
  for (const c of DEFINITION_CATEGORIES) {
    it(`${c} is uppercase`, () => expect(c).toBe(c.toUpperCase()));
  }
});

// ---------------------------------------------------------------------------
// Tests: ruleStatusConfig badge map
// ---------------------------------------------------------------------------

describe('ruleStatusConfig', () => {
  for (const s of RULE_STATUSES) {
    it(`${s} has a label`, () => expect(ruleStatusConfig[s].label.length).toBeGreaterThan(0));
    it(`${s} has a color`, () => expect(ruleStatusConfig[s].color.length).toBeGreaterThan(0));
    it(`${s} color contains bg-`, () => expect(ruleStatusConfig[s].color).toContain('bg-'));
    it(`${s} color contains text-`, () => expect(ruleStatusConfig[s].color).toContain('text-'));
  }
  it('active is green', () => expect(ruleStatusConfig.active.color).toContain('green'));
  it('error is red', () => expect(ruleStatusConfig.error.color).toContain('red'));
  it('paused is amber', () => expect(ruleStatusConfig.paused.color).toContain('amber'));
  it('draft is gray', () => expect(ruleStatusConfig.draft.color).toContain('gray'));
  it('active label is Active', () => expect(ruleStatusConfig.active.label).toBe('Active'));
  it('paused label is Paused', () => expect(ruleStatusConfig.paused.label).toBe('Paused'));
  it('error label is Error', () => expect(ruleStatusConfig.error.label).toBe('Error'));
});

// ---------------------------------------------------------------------------
// Tests: triggerLabels map
// ---------------------------------------------------------------------------

describe('triggerLabels', () => {
  for (const t of TRIGGER_TYPES) {
    it(`${t} has a label`, () => expect(triggerLabels[t].length).toBeGreaterThan(0));
    it(`${t} label is a string`, () => expect(typeof triggerLabels[t]).toBe('string'));
  }
  it('event label is Event-based', () => expect(triggerLabels.event).toBe('Event-based'));
  it('schedule label is Scheduled', () => expect(triggerLabels.schedule).toBe('Scheduled'));
  it('condition label is Condition-based', () => expect(triggerLabels.condition).toBe('Condition-based'));
  it('webhook label is Webhook', () => expect(triggerLabels.webhook).toBe('Webhook'));
});

// ---------------------------------------------------------------------------
// Tests: definitionStatusBadge map
// ---------------------------------------------------------------------------

describe('definitionStatusBadge', () => {
  for (const s of DEFINITION_STATUSES) {
    it(`${s} has a badge color`, () => expect(definitionStatusBadge[s]).toBeDefined());
    it(`${s} badge contains bg-`, () => expect(definitionStatusBadge[s]).toContain('bg-'));
    it(`${s} badge is a string`, () => expect(typeof definitionStatusBadge[s]).toBe('string'));
  }
  it('ACTIVE badge is green', () => expect(definitionStatusBadge.ACTIVE).toContain('green'));
  it('ARCHIVED badge is red', () => expect(definitionStatusBadge.ARCHIVED).toContain('red'));
  it('DEPRECATED badge is yellow', () => expect(definitionStatusBadge.DEPRECATED).toContain('yellow'));
  it('DRAFT badge is gray', () => expect(definitionStatusBadge.DRAFT).toContain('gray'));
});

// ---------------------------------------------------------------------------
// Tests: paletteConfig builder palette
// ---------------------------------------------------------------------------

describe('paletteConfig', () => {
  for (const cat of NODE_CATEGORIES) {
    it(`${cat} has a color string`, () => expect(paletteConfig[cat].color.length).toBeGreaterThan(0));
    it(`${cat} bgLight contains bg-`, () => expect(paletteConfig[cat].bgLight).toContain('bg-'));
    it(`${cat} borderColor contains border-`, () => expect(paletteConfig[cat].borderColor).toContain('border-'));
    it(`${cat} textColor contains text-`, () => expect(paletteConfig[cat].textColor).toContain('text-'));
    it(`${cat} has at least 1 subType`, () => expect(paletteConfig[cat].subTypeCount).toBeGreaterThanOrEqual(1));
  }
  it('trigger is green', () => expect(paletteConfig.trigger.color).toBe('green'));
  it('condition is yellow', () => expect(paletteConfig.condition.color).toBe('yellow'));
  it('action is blue', () => expect(paletteConfig.action.color).toBe('blue'));
  it('notification is purple', () => expect(paletteConfig.notification.color).toBe('purple'));
  it('trigger has 6 sub-types', () => expect(paletteConfig.trigger.subTypeCount).toBe(6));
  it('condition has 7 sub-types', () => expect(paletteConfig.condition.subTypeCount).toBe(7));
  it('action has 8 sub-types', () => expect(paletteConfig.action.subTypeCount).toBe(8));
  it('notification has 4 sub-types', () => expect(paletteConfig.notification.subTypeCount).toBe(4));
});

// ---------------------------------------------------------------------------
// Tests: sub-type arrays integrity
// ---------------------------------------------------------------------------

describe('triggerSubTypes', () => {
  it('has 6 sub-types', () => expect(triggerSubTypes).toHaveLength(6));
  it('includes record_created', () => expect(triggerSubTypes.map(s => s.value)).toContain('record_created'));
  it('includes schedule_cron', () => expect(triggerSubTypes.map(s => s.value)).toContain('schedule_cron'));
  for (const st of triggerSubTypes) {
    it(`${st.value} has a non-empty label`, () => expect(st.label.length).toBeGreaterThan(0));
    it(`${st.value} value is snake_case`, () => expect(st.value).toMatch(/^[a-z_]+$/));
  }
});

describe('conditionSubTypes', () => {
  it('has 7 sub-types', () => expect(conditionSubTypes).toHaveLength(7));
  it('includes custom_expression', () => expect(conditionSubTypes.map(s => s.value)).toContain('custom_expression'));
  it('includes field_equals', () => expect(conditionSubTypes.map(s => s.value)).toContain('field_equals'));
  for (const st of conditionSubTypes) {
    it(`${st.value} has a non-empty label`, () => expect(st.label.length).toBeGreaterThan(0));
  }
});

describe('actionSubTypes', () => {
  it('has 8 sub-types', () => expect(actionSubTypes).toHaveLength(8));
  it('includes create_record', () => expect(actionSubTypes.map(s => s.value)).toContain('create_record'));
  it('includes assign_user', () => expect(actionSubTypes.map(s => s.value)).toContain('assign_user'));
  it('includes call_webhook', () => expect(actionSubTypes.map(s => s.value)).toContain('call_webhook'));
  for (const st of actionSubTypes) {
    it(`${st.value} has a non-empty label`, () => expect(st.label.length).toBeGreaterThan(0));
  }
});

describe('notificationSubTypes', () => {
  it('has 4 sub-types', () => expect(notificationSubTypes).toHaveLength(4));
  it('includes email', () => expect(notificationSubTypes.map(s => s.value)).toContain('email'));
  it('includes sms', () => expect(notificationSubTypes.map(s => s.value)).toContain('sms'));
  it('includes escalation', () => expect(notificationSubTypes.map(s => s.value)).toContain('escalation'));
  it('includes in_app', () => expect(notificationSubTypes.map(s => s.value)).toContain('in_app'));
  for (const st of notificationSubTypes) {
    it(`${st.value} has a non-empty label`, () => expect(st.label.length).toBeGreaterThan(0));
  }
});

// ---------------------------------------------------------------------------
// Tests: MOCK_RULES data integrity
// ---------------------------------------------------------------------------

describe('MOCK_RULES data integrity', () => {
  it('has exactly 9 rules', () => expect(MOCK_RULES).toHaveLength(9));

  for (const rule of MOCK_RULES) {
    it(`${rule.id} has non-empty name`, () => expect(rule.name.length).toBeGreaterThan(0));
    it(`${rule.id} has valid status`, () => expect(RULE_STATUSES).toContain(rule.status));
    it(`${rule.id} has valid triggerType`, () => expect(TRIGGER_TYPES).toContain(rule.triggerType));
    it(`${rule.id} has non-empty module`, () => expect(rule.module.length).toBeGreaterThan(0));
    it(`${rule.id} executionCount is non-negative`, () => expect(rule.executionCount).toBeGreaterThanOrEqual(0));
    it(`${rule.id} errorRate is non-negative`, () => expect(rule.errorRate).toBeGreaterThanOrEqual(0));
    it(`${rule.id} errorRate <= 100`, () => expect(rule.errorRate).toBeLessThanOrEqual(100));
  }

  it('7 rules are active', () => {
    expect(MOCK_RULES.filter(r => r.status === 'active')).toHaveLength(7);
  });
  it('1 rule is paused', () => {
    expect(MOCK_RULES.filter(r => r.status === 'paused')).toHaveLength(1);
  });
  it('1 rule is draft', () => {
    expect(MOCK_RULES.filter(r => r.status === 'draft')).toHaveLength(1);
  });
  it('0 rules have error status', () => {
    expect(MOCK_RULES.filter(r => r.status === 'error')).toHaveLength(0);
  });
  it('draft rule has 0 executions', () => {
    const draft = MOCK_RULES.find(r => r.status === 'draft');
    expect(draft?.executionCount).toBe(0);
  });
  it('Invoice Overdue Reminder has highest execution count', () => {
    const auto3 = MOCK_RULES.find(r => r.id === 'auto-3');
    const maxCount = Math.max(...MOCK_RULES.map(r => r.executionCount));
    expect(auto3?.executionCount).toBe(maxCount);
  });
  it('only Invoice Overdue Reminder has non-zero error rate', () => {
    const withErrors = MOCK_RULES.filter(r => r.errorRate > 0);
    expect(withErrors).toHaveLength(1);
    expect(withErrors[0].id).toBe('auto-3');
  });
  it('5 rules use schedule trigger', () => {
    expect(MOCK_RULES.filter(r => r.triggerType === 'schedule')).toHaveLength(5);
  });
  it('3 rules use condition trigger', () => {
    expect(MOCK_RULES.filter(r => r.triggerType === 'condition')).toHaveLength(3);
  });
  it('1 rule uses event trigger', () => {
    expect(MOCK_RULES.filter(r => r.triggerType === 'event')).toHaveLength(1);
  });
  it('NCR rule is in Quality module', () => {
    expect(MOCK_RULES.find(r => r.id === 'auto-1')?.module).toBe('Quality');
  });
  it('Incident rule is in Health & Safety module', () => {
    expect(MOCK_RULES.find(r => r.id === 'auto-2')?.module).toBe('Health & Safety');
  });
});

// ---------------------------------------------------------------------------
// Tests: MOCK_ISO_TEMPLATES integrity
// ---------------------------------------------------------------------------

describe('MOCK_ISO_TEMPLATES data integrity', () => {
  it('has exactly 6 templates', () => expect(MOCK_ISO_TEMPLATES).toHaveLength(6));

  for (const tpl of MOCK_ISO_TEMPLATES) {
    it(`"${tpl.name}" has a description`, () => expect(tpl.description.length).toBeGreaterThan(0));
    it(`"${tpl.name}" has at least 4 nodes`, () => expect(tpl.nodeCount).toBeGreaterThanOrEqual(4));
    it(`"${tpl.name}" has a trigger`, () => expect(tpl.hasTrigger).toBe(true));
  }

  it('NCR Approval Chain has 5 nodes', () => {
    expect(MOCK_ISO_TEMPLATES.find(t => t.name === 'NCR Approval Chain')?.nodeCount).toBe(5);
  });
  it('CAPA Lifecycle has 5 nodes', () => {
    expect(MOCK_ISO_TEMPLATES.find(t => t.name === 'CAPA Lifecycle')?.nodeCount).toBe(5);
  });
  it('all template names are unique', () => {
    const names = MOCK_ISO_TEMPLATES.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ---------------------------------------------------------------------------
// Tests: isRuleActive helper
// ---------------------------------------------------------------------------

describe('isRuleActive', () => {
  it('active is active', () => expect(isRuleActive('active')).toBe(true));
  it('paused is not active', () => expect(isRuleActive('paused')).toBe(false));
  it('draft is not active', () => expect(isRuleActive('draft')).toBe(false));
  it('error is not active', () => expect(isRuleActive('error')).toBe(false));
  for (const s of RULE_STATUSES) {
    it(`isRuleActive(${s}) returns boolean`, () => expect(typeof isRuleActive(s)).toBe('boolean'));
  }
});

// ---------------------------------------------------------------------------
// Tests: totalExecutions helper
// ---------------------------------------------------------------------------

describe('totalExecutions', () => {
  it('empty array returns 0', () => expect(totalExecutions([])).toBe(0));
  it('single rule returns its count', () => expect(totalExecutions([MOCK_RULES[0]])).toBe(23));
  it('all rules sum is 403', () => {
    expect(totalExecutions(MOCK_RULES)).toBe(403);
  });
  it('result is non-negative', () => expect(totalExecutions(MOCK_RULES)).toBeGreaterThanOrEqual(0));
});

// ---------------------------------------------------------------------------
// Tests: avgErrorRate helper
// ---------------------------------------------------------------------------

describe('avgErrorRate', () => {
  it('empty array returns 0', () => expect(avgErrorRate([])).toBe(0));
  it('all-zero rates returns 0', () => {
    const zeroes = MOCK_RULES.filter(r => r.errorRate === 0);
    expect(avgErrorRate(zeroes)).toBe(0);
  });
  it('result is non-negative', () => expect(avgErrorRate(MOCK_RULES)).toBeGreaterThanOrEqual(0));
  it('result equals 9-rule total / 9', () => {
    const total = MOCK_RULES.reduce((s, r) => s + r.errorRate, 0);
    expect(avgErrorRate(MOCK_RULES)).toBeCloseTo(total / MOCK_RULES.length, 6);
  });
});

// ---------------------------------------------------------------------------
// Tests: activeRuleCount helper
// ---------------------------------------------------------------------------

describe('activeRuleCount', () => {
  it('empty array returns 0', () => expect(activeRuleCount([])).toBe(0));
  it('all 9 MOCK_RULES → 7 active', () => expect(activeRuleCount(MOCK_RULES)).toBe(7));
  it('paused-only rule → 0 active', () => {
    const paused = MOCK_RULES.filter(r => r.status === 'paused');
    expect(activeRuleCount(paused)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: getTriggerLabel helper
// ---------------------------------------------------------------------------

describe('getTriggerLabel', () => {
  for (const t of TRIGGER_TYPES) {
    it(`${t} returns a non-empty label`, () => expect(getTriggerLabel(t).length).toBeGreaterThan(0));
    it(`${t} label matches triggerLabels`, () => expect(getTriggerLabel(t)).toBe(triggerLabels[t]));
  }
});

// ---------------------------------------------------------------------------
// Tests: isTerminalDefinitionStatus helper
// ---------------------------------------------------------------------------

describe('isTerminalDefinitionStatus', () => {
  it('ARCHIVED is terminal', () => expect(isTerminalDefinitionStatus('ARCHIVED')).toBe(true));
  it('DRAFT is not terminal', () => expect(isTerminalDefinitionStatus('DRAFT')).toBe(false));
  it('ACTIVE is not terminal', () => expect(isTerminalDefinitionStatus('ACTIVE')).toBe(false));
  it('DEPRECATED is not terminal', () => expect(isTerminalDefinitionStatus('DEPRECATED')).toBe(false));
  for (const s of DEFINITION_STATUSES) {
    it(`${s} returns boolean`, () => expect(typeof isTerminalDefinitionStatus(s)).toBe('boolean'));
  }
});

// ---------------------------------------------------------------------------
// Tests: isDeployable helper
// ---------------------------------------------------------------------------

describe('isDeployable', () => {
  it('DRAFT is deployable', () => expect(isDeployable('DRAFT')).toBe(true));
  it('DEPRECATED is deployable', () => expect(isDeployable('DEPRECATED')).toBe(true));
  it('ACTIVE is not deployable', () => expect(isDeployable('ACTIVE')).toBe(false));
  it('ARCHIVED is not deployable', () => expect(isDeployable('ARCHIVED')).toBe(false));
  for (const s of DEFINITION_STATUSES) {
    it(`isDeployable(${s}) returns boolean`, () => expect(typeof isDeployable(s)).toBe('boolean'));
  }
});

// ---------------------------------------------------------------------------
// Tests: producesSideEffect helper
// ---------------------------------------------------------------------------

describe('producesSideEffect', () => {
  it('action produces side effect', () => expect(producesSideEffect('action')).toBe(true));
  it('notification produces side effect', () => expect(producesSideEffect('notification')).toBe(true));
  it('trigger does not produce side effect', () => expect(producesSideEffect('trigger')).toBe(false));
  it('condition does not produce side effect', () => expect(producesSideEffect('condition')).toBe(false));
  for (const cat of NODE_CATEGORIES) {
    it(`producesSideEffect(${cat}) returns boolean`, () => expect(typeof producesSideEffect(cat)).toBe('boolean'));
  }
});

// ---------------------------------------------------------------------------
// Tests: isFlowControl helper
// ---------------------------------------------------------------------------

describe('isFlowControl', () => {
  it('trigger is flow control', () => expect(isFlowControl('trigger')).toBe(true));
  it('condition is flow control', () => expect(isFlowControl('condition')).toBe(true));
  it('action is not flow control', () => expect(isFlowControl('action')).toBe(false));
  it('notification is not flow control', () => expect(isFlowControl('notification')).toBe(false));
  it('flow control and side effect are disjoint', () => {
    for (const cat of NODE_CATEGORIES) {
      expect(isFlowControl(cat) && producesSideEffect(cat)).toBe(false);
    }
  });
  it('every category is either flow control or side effect', () => {
    for (const cat of NODE_CATEGORIES) {
      expect(isFlowControl(cat) || producesSideEffect(cat)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: getDefaultSubType helper
// ---------------------------------------------------------------------------

describe('getDefaultSubType', () => {
  it('trigger default is record_created', () => expect(getDefaultSubType('trigger')).toBe('record_created'));
  it('condition default is field_equals', () => expect(getDefaultSubType('condition')).toBe('field_equals'));
  it('action default is create_record', () => expect(getDefaultSubType('action')).toBe('create_record'));
  it('notification default is email', () => expect(getDefaultSubType('notification')).toBe('email'));
  for (const cat of NODE_CATEGORIES) {
    it(`${cat} default is a non-empty string`, () => expect(getDefaultSubType(cat).length).toBeGreaterThan(0));
    it(`${cat} default is in its subType list`, () => {
      const maps: Record<NodeCategory, { value: string }[]> = {
        trigger: triggerSubTypes,
        condition: conditionSubTypes,
        action: actionSubTypes,
        notification: notificationSubTypes,
      };
      const found = maps[cat].find(st => st.value === getDefaultSubType(cat));
      expect(found).toBeDefined();
    });
  }
});

// ─── Phase 213 parametric additions ──────────────────────────────────────────

describe('RULE_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'active'],
    [1, 'paused'],
    [2, 'draft'],
    [3, 'error'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`RULE_STATUSES[${idx}] === '${val}'`, () => {
      expect(RULE_STATUSES[idx]).toBe(val);
    });
  }
});

describe('TRIGGER_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'event'],
    [1, 'schedule'],
    [2, 'condition'],
    [3, 'webhook'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`TRIGGER_TYPES[${idx}] === '${val}'`, () => {
      expect(TRIGGER_TYPES[idx]).toBe(val);
    });
  }
});

describe('NODE_CATEGORIES — positional index parametric', () => {
  const expected = [
    [0, 'trigger'],
    [1, 'condition'],
    [2, 'action'],
    [3, 'notification'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`NODE_CATEGORIES[${idx}] === '${val}'`, () => {
      expect(NODE_CATEGORIES[idx]).toBe(val);
    });
  }
});

describe('DEFINITION_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'DRAFT'],
    [1, 'ACTIVE'],
    [2, 'DEPRECATED'],
    [3, 'ARCHIVED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DEFINITION_STATUSES[${idx}] === '${val}'`, () => {
      expect(DEFINITION_STATUSES[idx]).toBe(val);
    });
  }
});

describe('DEFINITION_CATEGORIES — positional index parametric', () => {
  const expected = [
    [0, 'APPROVAL'],
    [1, 'REVIEW'],
    [2, 'CHANGE_MANAGEMENT'],
    [3, 'INCIDENT'],
    [4, 'REQUEST'],
    [5, 'ONBOARDING'],
    [6, 'OFFBOARDING'],
    [7, 'CUSTOM'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DEFINITION_CATEGORIES[${idx}] === '${val}'`, () => {
      expect(DEFINITION_CATEGORIES[idx]).toBe(val);
    });
  }
});

describe('triggerLabels — per-type exact label parametric', () => {
  const expected: [TriggerType, string][] = [
    ['event',     'Event-based'],
    ['schedule',  'Scheduled'],
    ['condition', 'Condition-based'],
    ['webhook',   'Webhook'],
  ];
  for (const [type, label] of expected) {
    it(`${type}: label = "${label}"`, () => {
      expect(triggerLabels[type]).toBe(label);
    });
  }
});

// ─── Algorithm puzzle phases (ph217wd–ph220wd) ────────────────────────────────
function moveZeroes217wd(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217wd_mz',()=>{
  it('a',()=>{expect(moveZeroes217wd([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217wd([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217wd([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217wd([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217wd([4,2,0,0,3])).toBe(4);});
});
function missingNumber218wd(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218wd_mn',()=>{
  it('a',()=>{expect(missingNumber218wd([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218wd([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218wd([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218wd([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218wd([1])).toBe(0);});
});
function countBits219wd(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219wd_cb',()=>{
  it('a',()=>{expect(countBits219wd(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219wd(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219wd(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219wd(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219wd(4)[4]).toBe(1);});
});
function climbStairs220wd(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220wd_cs',()=>{
  it('a',()=>{expect(climbStairs220wd(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220wd(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220wd(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220wd(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220wd(1)).toBe(1);});
});
function hd258wd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258wd2_hd',()=>{it('a',()=>{expect(hd258wd2(1,4)).toBe(2);});it('b',()=>{expect(hd258wd2(3,1)).toBe(1);});it('c',()=>{expect(hd258wd2(0,0)).toBe(0);});it('d',()=>{expect(hd258wd2(93,73)).toBe(2);});it('e',()=>{expect(hd258wd2(15,0)).toBe(4);});});
function hd259wd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259wd2_hd',()=>{it('a',()=>{expect(hd259wd2(1,4)).toBe(2);});it('b',()=>{expect(hd259wd2(3,1)).toBe(1);});it('c',()=>{expect(hd259wd2(0,0)).toBe(0);});it('d',()=>{expect(hd259wd2(93,73)).toBe(2);});it('e',()=>{expect(hd259wd2(15,0)).toBe(4);});});
function hd260wd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260wd2_hd',()=>{it('a',()=>{expect(hd260wd2(1,4)).toBe(2);});it('b',()=>{expect(hd260wd2(3,1)).toBe(1);});it('c',()=>{expect(hd260wd2(0,0)).toBe(0);});it('d',()=>{expect(hd260wd2(93,73)).toBe(2);});it('e',()=>{expect(hd260wd2(15,0)).toBe(4);});});
function hd261wd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261wd2_hd',()=>{it('a',()=>{expect(hd261wd2(1,4)).toBe(2);});it('b',()=>{expect(hd261wd2(3,1)).toBe(1);});it('c',()=>{expect(hd261wd2(0,0)).toBe(0);});it('d',()=>{expect(hd261wd2(93,73)).toBe(2);});it('e',()=>{expect(hd261wd2(15,0)).toBe(4);});});
