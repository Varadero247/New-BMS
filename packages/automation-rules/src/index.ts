import { v4 as uuidv4 } from 'uuid';

// ─── Types ──────────────────────────────────────────────────────────────────

export type RuleCategory = 'quality' | 'safety' | 'environment' | 'compliance' | 'hr' | 'maintenance';

export type TriggerType =
  | 'record_created'
  | 'record_updated'
  | 'status_changed'
  | 'field_threshold'
  | 'date_approaching'
  | 'date_passed'
  | 'score_changed'
  | 'periodic';

export interface RuleTrigger {
  type: TriggerType;
  module: string;
  recordType: string;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'days_before' | 'days_after';
  value: string | number | string[];
}

export interface RuleAction {
  type: 'create_record' | 'send_notification' | 'send_email' | 'update_field' | 'escalate' | 'assign_task' | 'webhook';
  target: string;
  params: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  actions: RuleAction[];
  category: RuleCategory;
}

export type ExecutionStatus = 'success' | 'failed' | 'skipped';

export interface ExecutionLogEntry {
  id: string;
  orgId: string;
  ruleId: string;
  status: ExecutionStatus;
  details: string;
  timestamp: string;
}

export interface RuleWithStatus extends AutomationRule {
  enabled: boolean;
}

// ─── Pre-built Rule Templates ───────────────────────────────────────────────

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'rule-001',
    name: 'Critical NCR → Auto-CAPA',
    description: 'Automatically creates a CAPA when a critical non-conformance is raised.',
    trigger: { type: 'record_created', module: 'quality', recordType: 'ncr' },
    conditions: [{ field: 'severity', operator: 'equals', value: 'CRITICAL' }],
    actions: [{ type: 'create_record', target: 'quality.capa', params: { linkToNcr: true, priority: 'HIGH' } }],
    category: 'quality',
  },
  {
    id: 'rule-002',
    name: 'CAPA Overdue Escalation',
    description: 'Escalates to department manager when a CAPA passes its due date.',
    trigger: { type: 'date_passed', module: 'quality', recordType: 'capa' },
    conditions: [{ field: 'dueDate', operator: 'days_after', value: 0 }],
    actions: [{ type: 'escalate', target: 'department_manager', params: { message: 'CAPA is overdue and requires immediate attention' } }],
    category: 'quality',
  },
  {
    id: 'rule-003',
    name: 'Calibration Due Alert (30 days)',
    description: 'Sends alert when equipment calibration is due within 30 days.',
    trigger: { type: 'date_approaching', module: 'quality', recordType: 'calibration' },
    conditions: [{ field: 'nextCalibrationDate', operator: 'days_before', value: 30 }],
    actions: [{ type: 'send_notification', target: 'equipment_owner', params: { template: 'calibration_due' } }],
    category: 'quality',
  },
  {
    id: 'rule-004',
    name: 'Competence Expiry Alert (60 days)',
    description: 'Notifies HR when an employee competence certification expires within 60 days.',
    trigger: { type: 'date_approaching', module: 'hr', recordType: 'competence' },
    conditions: [{ field: 'expiryDate', operator: 'days_before', value: 60 }],
    actions: [{ type: 'send_notification', target: 'hr_manager', params: { template: 'competence_expiry' } }],
    category: 'hr',
  },
  {
    id: 'rule-005',
    name: 'Audit Finding → CAPA (Major NC)',
    description: 'Creates a CAPA automatically when an audit finding is classified as a Major NC.',
    trigger: { type: 'record_created', module: 'quality', recordType: 'audit_finding' },
    conditions: [{ field: 'classification', operator: 'equals', value: 'MAJOR_NC' }],
    actions: [{ type: 'create_record', target: 'quality.capa', params: { linkToFinding: true, classification: 'MAJOR' } }],
    category: 'quality',
  },
  {
    id: 'rule-006',
    name: 'Supplier Score Drop Alert',
    description: 'Alerts procurement when a supplier score drops below the acceptable threshold.',
    trigger: { type: 'score_changed', module: 'quality', recordType: 'supplier_evaluation' },
    conditions: [{ field: 'overallScore', operator: 'less_than', value: 60 }],
    actions: [{ type: 'send_notification', target: 'procurement_manager', params: { template: 'supplier_score_drop' } }],
    category: 'quality',
  },
  {
    id: 'rule-007',
    name: 'Management Review Due (Annual)',
    description: 'Sends reminder to senior management when annual management review is approaching.',
    trigger: { type: 'date_approaching', module: 'quality', recordType: 'management_review' },
    conditions: [{ field: 'scheduledDate', operator: 'days_before', value: 30 }],
    actions: [{ type: 'send_email', target: 'senior_management', params: { template: 'management_review_due' } }],
    category: 'compliance',
  },
  {
    id: 'rule-008',
    name: 'CSAT Complaint → NCR Auto-Create',
    description: 'Automatically creates a non-conformance report when a customer complaint is received.',
    trigger: { type: 'record_created', module: 'crm', recordType: 'complaint' },
    conditions: [{ field: 'type', operator: 'equals', value: 'COMPLAINT' }],
    actions: [{ type: 'create_record', target: 'quality.ncr', params: { source: 'customer_complaint', linkToComplaint: true } }],
    category: 'quality',
  },
  {
    id: 'rule-009',
    name: 'AI Review Required → Notify Reviewer',
    description: 'Notifies the designated reviewer when an AI analysis requires human review.',
    trigger: { type: 'record_created', module: 'ai', recordType: 'analysis' },
    conditions: [{ field: 'requiresReview', operator: 'equals', value: 'true' }],
    actions: [{ type: 'send_notification', target: 'ai_reviewer', params: { template: 'ai_review_required', urgent: true } }],
    category: 'compliance',
  },
  {
    id: 'rule-010',
    name: 'Document Review Due (30 days)',
    description: 'Alerts document owner when a controlled document review date is approaching.',
    trigger: { type: 'date_approaching', module: 'quality', recordType: 'document' },
    conditions: [{ field: 'reviewDate', operator: 'days_before', value: 30 }],
    actions: [{ type: 'send_notification', target: 'document_owner', params: { template: 'document_review_due' } }],
    category: 'compliance',
  },
  {
    id: 'rule-011',
    name: 'Incident RIDDOR → Notify HS Manager',
    description: 'Immediately notifies the H&S manager when a RIDDOR-reportable incident is logged.',
    trigger: { type: 'record_created', module: 'health-safety', recordType: 'incident' },
    conditions: [{ field: 'riddorReportable', operator: 'equals', value: 'true' }],
    actions: [
      { type: 'send_notification', target: 'hs_manager', params: { template: 'riddor_incident', urgent: true } },
      { type: 'send_email', target: 'hs_manager', params: { template: 'riddor_notification' } },
    ],
    category: 'safety',
  },
  {
    id: 'rule-012',
    name: 'High RPN FMEA → Auto-CAPA',
    description: 'Creates a CAPA when an FMEA risk item has an RPN exceeding 200.',
    trigger: { type: 'field_threshold', module: 'quality', recordType: 'fmea_item' },
    conditions: [{ field: 'rpn', operator: 'greater_than', value: 200 }],
    actions: [{ type: 'create_record', target: 'quality.capa', params: { source: 'fmea', linkToItem: true } }],
    category: 'quality',
  },
  {
    id: 'rule-013',
    name: 'Objective Off-Track → Alert Owner',
    description: 'Alerts the objective owner when progress falls behind the expected trajectory.',
    trigger: { type: 'score_changed', module: 'quality', recordType: 'objective' },
    conditions: [{ field: 'progressPercentage', operator: 'less_than', value: 50 }],
    actions: [{ type: 'send_notification', target: 'objective_owner', params: { template: 'objective_off_track' } }],
    category: 'compliance',
  },
  {
    id: 'rule-014',
    name: 'Certificate Expiry (90 days)',
    description: 'Notifies the compliance team when an ISO certificate expires within 90 days.',
    trigger: { type: 'date_approaching', module: 'quality', recordType: 'certificate' },
    conditions: [{ field: 'expiryDate', operator: 'days_before', value: 90 }],
    actions: [
      { type: 'send_notification', target: 'compliance_team', params: { template: 'certificate_expiry' } },
      { type: 'send_email', target: 'compliance_manager', params: { template: 'certificate_expiry_email' } },
    ],
    category: 'compliance',
  },
  {
    id: 'rule-015',
    name: 'ISO Readiness Below 70% → Alert',
    description: 'Sends alert when ISO audit readiness score drops below 70%.',
    trigger: { type: 'score_changed', module: 'quality', recordType: 'readiness_score' },
    conditions: [{ field: 'score', operator: 'less_than', value: 70 }],
    actions: [{ type: 'send_notification', target: 'quality_manager', params: { template: 'readiness_low', urgent: true } }],
    category: 'compliance',
  },
  {
    id: 'rule-016',
    name: 'New User → Assign Onboarding Tasks',
    description: 'Assigns onboarding tasks and training when a new user is created.',
    trigger: { type: 'record_created', module: 'hr', recordType: 'user' },
    conditions: [],
    actions: [{ type: 'assign_task', target: 'new_user', params: { taskList: 'onboarding_checklist', dueInDays: 14 } }],
    category: 'hr',
  },
  {
    id: 'rule-017',
    name: 'Trial Expiry (7 days) → Upgrade Nudge',
    description: 'Sends upgrade reminder when organisation trial expires in 7 days.',
    trigger: { type: 'date_approaching', module: 'settings', recordType: 'organisation' },
    conditions: [{ field: 'trialEndDate', operator: 'days_before', value: 7 }],
    actions: [{ type: 'send_email', target: 'org_admin', params: { template: 'trial_expiry_nudge' } }],
    category: 'compliance',
  },
  {
    id: 'rule-018',
    name: 'AI Error Rate Spike → Alert Admin',
    description: 'Alerts admin when the AI service error rate exceeds 5% in the last hour.',
    trigger: { type: 'field_threshold', module: 'ai', recordType: 'metrics' },
    conditions: [{ field: 'errorRate', operator: 'greater_than', value: 5 }],
    actions: [{ type: 'send_notification', target: 'system_admin', params: { template: 'ai_error_spike', urgent: true } }],
    category: 'compliance',
  },
  {
    id: 'rule-019',
    name: 'Energy Deviation → EnPI Alert',
    description: 'Alerts energy manager when energy performance indicator deviates beyond threshold.',
    trigger: { type: 'field_threshold', module: 'energy', recordType: 'enpi' },
    conditions: [{ field: 'deviationPercent', operator: 'greater_than', value: 10 }],
    actions: [{ type: 'send_notification', target: 'energy_manager', params: { template: 'enpi_deviation' } }],
    category: 'environment',
  },
  {
    id: 'rule-020',
    name: 'Risk Score Increase → Notify Owner',
    description: 'Notifies the risk owner when a risk score increases above its previous assessment.',
    trigger: { type: 'score_changed', module: 'health-safety', recordType: 'risk' },
    conditions: [{ field: 'scoreChange', operator: 'greater_than', value: 0 }],
    actions: [{ type: 'send_notification', target: 'risk_owner', params: { template: 'risk_score_increase' } }],
    category: 'safety',
  },
];

// ─── In-Memory Stores ───────────────────────────────────────────────────────

// orgId -> Set of enabled rule IDs
const enabledRulesStore = new Map<string, Set<string>>();

// execution log entries
const executionLogStore: ExecutionLogEntry[] = [];

// ─── Rule Management Functions ──────────────────────────────────────────────

export function enableRule(orgId: string, ruleId: string): boolean {
  const rule = AUTOMATION_RULES.find(r => r.id === ruleId);
  if (!rule) return false;

  if (!enabledRulesStore.has(orgId)) {
    enabledRulesStore.set(orgId, new Set());
  }
  enabledRulesStore.get(orgId)!.add(ruleId);
  return true;
}

export function disableRule(orgId: string, ruleId: string): boolean {
  const rule = AUTOMATION_RULES.find(r => r.id === ruleId);
  if (!rule) return false;

  const orgRules = enabledRulesStore.get(orgId);
  if (orgRules) {
    orgRules.delete(ruleId);
  }
  return true;
}

export function listRules(orgId: string): RuleWithStatus[] {
  const orgRules = enabledRulesStore.get(orgId) || new Set<string>();
  return AUTOMATION_RULES.map(rule => ({
    ...rule,
    enabled: orgRules.has(rule.id),
  }));
}

export function getEnabledRules(orgId: string): AutomationRule[] {
  const orgRules = enabledRulesStore.get(orgId) || new Set<string>();
  return AUTOMATION_RULES.filter(rule => orgRules.has(rule.id));
}

export function getRuleById(ruleId: string): AutomationRule | undefined {
  return AUTOMATION_RULES.find(r => r.id === ruleId);
}

// ─── Execution Log Functions ────────────────────────────────────────────────

export function logExecution(
  orgId: string,
  ruleId: string,
  status: ExecutionStatus,
  details: string
): ExecutionLogEntry {
  const entry: ExecutionLogEntry = {
    id: uuidv4(),
    orgId,
    ruleId,
    status,
    details,
    timestamp: new Date().toISOString(),
  };
  executionLogStore.push(entry);
  return entry;
}

export function getExecutionLog(
  orgId: string,
  ruleId?: string,
  limit: number = 50
): ExecutionLogEntry[] {
  let entries = executionLogStore.filter(e => e.orgId === orgId);
  if (ruleId) {
    entries = entries.filter(e => e.ruleId === ruleId);
  }
  // Return in reverse insertion order (newest first)
  return entries
    .reverse()
    .slice(0, limit);
}

// ─── Reset (for testing) ────────────────────────────────────────────────────

export function _resetStores(): void {
  enabledRulesStore.clear();
  executionLogStore.length = 0;
}
