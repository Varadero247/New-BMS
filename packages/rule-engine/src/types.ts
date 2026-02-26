export type Operator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith' | 'matches' | 'exists' | 'notExists';
export type LogicalOperator = 'and' | 'or' | 'not';
export type ActionType = 'set' | 'unset' | 'increment' | 'decrement' | 'append' | 'notify' | 'block';

export interface Condition {
  field: string;
  operator: Operator;
  value?: unknown;
}

export interface RuleGroup {
  logic: LogicalOperator;
  conditions: Array<Condition | RuleGroup>;
}

export interface RuleAction {
  type: ActionType;
  target?: string;
  value?: unknown;
  message?: string;
}

export interface Rule {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  conditions: RuleGroup;
  actions: RuleAction[];
  description?: string;
  tags?: string[];
}

export interface RuleContext {
  [field: string]: unknown;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  actionsExecuted: RuleAction[];
}

export interface EvaluationResult {
  results: RuleResult[];
  matchedCount: number;
  context: RuleContext;
}
