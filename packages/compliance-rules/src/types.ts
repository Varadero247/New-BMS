export type RuleStatus = 'pass' | 'fail' | 'warning' | 'na' | 'pending';
export type RuleSeverity = 'critical' | 'major' | 'minor' | 'info';
export type StandardType = 'ISO_9001' | 'ISO_14001' | 'ISO_45001' | 'ISO_27001' | 'GDPR' | 'CUSTOM';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  standard: StandardType;
  clause: string;
  severity: RuleSeverity;
  check: (context: RuleContext) => boolean | Promise<boolean>;
  mandatory: boolean;
}

export interface RuleContext {
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  status: RuleStatus;
  severity: RuleSeverity;
  message?: string;
  timestamp: number;
}

export interface ComplianceReport {
  entityType: string;
  entityId: string;
  standard?: StandardType;
  results: RuleResult[];
  score: number;
  passed: number;
  failed: number;
  warnings: number;
  total: number;
  isCompliant: boolean;
  timestamp: number;
}
