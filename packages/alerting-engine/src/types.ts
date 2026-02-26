// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

export type AlertOperator =
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'eq'
  | 'neq'
  | 'between'
  | 'outside'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'matches'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
  | 'changedBy'
  | 'changedByPct';

export interface AlertCondition {
  field: string;
  operator: AlertOperator;
  threshold: number | string | number[];
  and?: AlertCondition[];
  or?: AlertCondition[];
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  conditions: AlertCondition[];
  severity: AlertSeverity;
  cooldownMs?: number;
  enabled?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AlertContext {
  values: Record<string, number | string | boolean | null>;
  previousValues?: Record<string, number | string | boolean | null>;
  timestamp?: number;
}

export interface AlertEvaluation {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  severity: AlertSeverity;
  matchedConditions: string[];
  timestamp: number;
  context: AlertContext;
}

export interface AlertState {
  ruleId: string;
  lastTriggeredAt?: number;
  triggerCount: number;
  consecutiveTriggers: number;
  inCooldown: boolean;
}

export interface AlertSummary {
  total: number;
  triggered: number;
  info: number;
  warning: number;
  critical: number;
  emergency: number;
  inCooldown: number;
}
