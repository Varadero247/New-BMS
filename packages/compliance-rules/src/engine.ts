import { ComplianceReport, ComplianceRule, RuleContext, RuleResult, RuleStatus, RuleSeverity, StandardType } from './types';

export function evaluateRuleSync(rule: ComplianceRule, context: RuleContext): RuleResult {
  let status: RuleStatus;
  let message: string | undefined;
  try {
    const result = rule.check(context);
    if (result instanceof Promise) {
      status = 'pending';
      message = 'Async rule evaluated synchronously';
    } else {
      status = result ? 'pass' : (rule.mandatory ? 'fail' : 'warning');
    }
  } catch (err) {
    status = 'fail';
    message = err instanceof Error ? err.message : 'Rule evaluation error';
  }
  return { ruleId: rule.id, ruleName: rule.name, status, severity: rule.severity, message, timestamp: Date.now() };
}

export async function evaluateRule(rule: ComplianceRule, context: RuleContext): Promise<RuleResult> {
  let status: RuleStatus;
  let message: string | undefined;
  try {
    const result = await rule.check(context);
    status = result ? 'pass' : (rule.mandatory ? 'fail' : 'warning');
  } catch (err) {
    status = 'fail';
    message = err instanceof Error ? err.message : 'Rule evaluation error';
  }
  return { ruleId: rule.id, ruleName: rule.name, status, severity: rule.severity, message, timestamp: Date.now() };
}

export async function evaluateRules(rules: ComplianceRule[], context: RuleContext): Promise<RuleResult[]> {
  return Promise.all(rules.map(r => evaluateRule(r, context)));
}

export function generateReport(entityType: string, entityId: string, results: RuleResult[], standard?: StandardType): ComplianceReport {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const total = results.length;
  const score = total > 0 ? Math.round((passed / total) * 100) : 100;
  const isCompliant = failed === 0;
  return { entityType, entityId, standard, results, score, passed, failed, warnings, total, isCompliant, timestamp: Date.now() };
}

export async function runCompliance(rules: ComplianceRule[], context: RuleContext, standard?: StandardType): Promise<ComplianceReport> {
  const filtered = standard ? rules.filter(r => r.standard === standard || r.standard === 'CUSTOM') : rules;
  const results = await evaluateRules(filtered, context);
  return generateReport(context.entityType, context.entityId, results, standard);
}

export function makeRule(
  id: string, name: string, standard: StandardType, clause: string, severity: RuleSeverity,
  check: (ctx: RuleContext) => boolean, mandatory = true
): ComplianceRule {
  return { id, name, description: name, standard, clause, severity, check, mandatory };
}

export function makeContext(entityType: string, entityId: string, data: Record<string, unknown>): RuleContext {
  return { entityType, entityId, data };
}

export function filterByStatus(results: RuleResult[], status: RuleStatus): RuleResult[] {
  return results.filter(r => r.status === status);
}

export function filterBySeverity(results: RuleResult[], severity: RuleSeverity): RuleResult[] {
  return results.filter(r => r.severity === severity);
}

export function filterByStandard(rules: ComplianceRule[], standard: StandardType): ComplianceRule[] {
  return rules.filter(r => r.standard === standard);
}

export function isValidStatus(s: string): s is RuleStatus {
  return ['pass', 'fail', 'warning', 'na', 'pending'].includes(s);
}

export function isValidSeverity(s: string): s is RuleSeverity {
  return ['critical', 'major', 'minor', 'info'].includes(s);
}

export function isValidStandard(s: string): s is StandardType {
  return ['ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_27001', 'GDPR', 'CUSTOM'].includes(s);
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Acceptable';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

export function mandatoryFailures(results: RuleResult[], rules: ComplianceRule[]): RuleResult[] {
  const mandatoryIds = new Set(rules.filter(r => r.mandatory).map(r => r.id));
  return results.filter(r => r.status === 'fail' && mandatoryIds.has(r.ruleId));
}

export function hasBlockingFailure(results: RuleResult[], rules: ComplianceRule[]): boolean {
  return mandatoryFailures(results, rules).some(r => r.severity === 'critical');
}
