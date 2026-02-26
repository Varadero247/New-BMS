import { Condition, EvaluationResult, LogicalOperator, Operator, Rule, RuleAction, RuleContext, RuleGroup, RuleResult } from './types';

export function evaluateCondition(ctx: RuleContext, cond: Condition): boolean {
  const val = ctx[cond.field];
  switch (cond.operator) {
    case 'eq': return val === cond.value;
    case 'neq': return val !== cond.value;
    case 'gt': return typeof val === 'number' && typeof cond.value === 'number' && val > cond.value;
    case 'gte': return typeof val === 'number' && typeof cond.value === 'number' && val >= cond.value;
    case 'lt': return typeof val === 'number' && typeof cond.value === 'number' && val < cond.value;
    case 'lte': return typeof val === 'number' && typeof cond.value === 'number' && val <= cond.value;
    case 'in': return Array.isArray(cond.value) && (cond.value as unknown[]).includes(val);
    case 'nin': return Array.isArray(cond.value) && !(cond.value as unknown[]).includes(val);
    case 'contains': return typeof val === 'string' && typeof cond.value === 'string' && val.includes(cond.value);
    case 'startsWith': return typeof val === 'string' && typeof cond.value === 'string' && val.startsWith(cond.value);
    case 'endsWith': return typeof val === 'string' && typeof cond.value === 'string' && val.endsWith(cond.value);
    case 'matches': {
      if (typeof val !== 'string' || typeof cond.value !== 'string') return false;
      try { return new RegExp(cond.value).test(val); } catch { return false; }
    }
    case 'exists': return val !== undefined && val !== null;
    case 'notExists': return val === undefined || val === null;
    default: return false;
  }
}

export function evaluateGroup(ctx: RuleContext, group: RuleGroup): boolean {
  const results = group.conditions.map(c =>
    'field' in c ? evaluateCondition(ctx, c as Condition) : evaluateGroup(ctx, c as RuleGroup)
  );
  switch (group.logic) {
    case 'and': return results.every(Boolean);
    case 'or': return results.some(Boolean);
    case 'not': return !results[0];
    default: return false;
  }
}

export function applyAction(ctx: RuleContext, action: RuleAction): RuleContext {
  const result = { ...ctx };
  switch (action.type) {
    case 'set': if (action.target) result[action.target] = action.value; break;
    case 'unset': if (action.target) delete result[action.target]; break;
    case 'increment': if (action.target && typeof result[action.target] === 'number') result[action.target] = (result[action.target] as number) + (typeof action.value === 'number' ? action.value : 1); break;
    case 'decrement': if (action.target && typeof result[action.target] === 'number') result[action.target] = (result[action.target] as number) - (typeof action.value === 'number' ? action.value : 1); break;
    case 'append': if (action.target && Array.isArray(result[action.target])) result[action.target] = [...(result[action.target] as unknown[]), action.value]; break;
    case 'notify': break;
    case 'block': break;
  }
  return result;
}

export function evaluateRule(ctx: RuleContext, rule: Rule): RuleResult {
  if (!rule.enabled) return { ruleId: rule.id, ruleName: rule.name, matched: false, actionsExecuted: [] };
  const matched = evaluateGroup(ctx, rule.conditions);
  return { ruleId: rule.id, ruleName: rule.name, matched, actionsExecuted: matched ? rule.actions : [] };
}

export function evaluate(rules: Rule[], ctx: RuleContext): EvaluationResult {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority);
  const results: RuleResult[] = [];
  let currentCtx = { ...ctx };
  for (const rule of sorted) {
    const result = evaluateRule(currentCtx, rule);
    results.push(result);
    if (result.matched) {
      for (const action of rule.actions) currentCtx = applyAction(currentCtx, action);
    }
  }
  return { results, matchedCount: results.filter(r => r.matched).length, context: currentCtx };
}

export function isValidOperator(op: string): op is Operator {
  return ['eq','neq','gt','gte','lt','lte','in','nin','contains','startsWith','endsWith','matches','exists','notExists'].includes(op);
}

export function isValidLogicalOperator(op: string): op is LogicalOperator {
  return ['and', 'or', 'not'].includes(op);
}

export function isValidActionType(t: string): t is import('./types').ActionType {
  return ['set','unset','increment','decrement','append','notify','block'].includes(t);
}

export function makeCondition(field: string, operator: Operator, value?: unknown): Condition {
  return { field, operator, ...(value !== undefined ? { value } : {}) };
}

export function makeAndGroup(conditions: Array<Condition | RuleGroup>): RuleGroup {
  return { logic: 'and', conditions };
}

export function makeOrGroup(conditions: Array<Condition | RuleGroup>): RuleGroup {
  return { logic: 'or', conditions };
}

export function makeNotGroup(condition: Condition | RuleGroup): RuleGroup {
  return { logic: 'not', conditions: [condition] };
}

export function makeRule(id: string, name: string, priority: number, conditions: RuleGroup, actions: RuleAction[], enabled = true): Rule {
  return { id, name, priority, enabled, conditions, actions };
}

export function filterEnabledRules(rules: Rule[]): Rule[] {
  return rules.filter(r => r.enabled);
}

export function getRulesByTag(rules: Rule[], tag: string): Rule[] {
  return rules.filter(r => r.tags?.includes(tag));
}
