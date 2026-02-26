// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { ConditionOperator, WorkflowCondition } from './types';

/** Extracts a nested value from a context object using dot notation (e.g. "risk.score"). */
export function getFieldValue(context: Record<string, unknown>, field: string): unknown {
  const parts = field.split('.');
  let current: unknown = context;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Compares a field value against a condition value using the given operator. */
export function compareValues(
  op: ConditionOperator,
  fieldValue: unknown,
  conditionValue: unknown
): boolean {
  switch (op) {
    case 'equals':
      return fieldValue === conditionValue;

    case 'not_equals':
      return fieldValue !== conditionValue;

    case 'contains':
      if (typeof fieldValue === 'string' && typeof conditionValue === 'string') {
        return fieldValue.includes(conditionValue);
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(conditionValue);
      }
      return false;

    case 'not_contains':
      if (typeof fieldValue === 'string' && typeof conditionValue === 'string') {
        return !fieldValue.includes(conditionValue);
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(conditionValue);
      }
      return true;

    case 'greater_than':
      return Number(fieldValue) > Number(conditionValue);

    case 'less_than':
      return Number(fieldValue) < Number(conditionValue);

    case 'is_null':
      return fieldValue === null || fieldValue === undefined;

    case 'is_not_null':
      return fieldValue !== null && fieldValue !== undefined;

    case 'in':
      if (Array.isArray(conditionValue)) {
        return conditionValue.includes(fieldValue);
      }
      return false;

    case 'not_in':
      if (Array.isArray(conditionValue)) {
        return !conditionValue.includes(fieldValue);
      }
      return true;

    case 'between': {
      if (Array.isArray(conditionValue) && conditionValue.length === 2) {
        const n = Number(fieldValue);
        return n >= Number(conditionValue[0]) && n <= Number(conditionValue[1]);
      }
      return false;
    }

    default:
      return false;
  }
}

/** Evaluates a single condition against a context object. */
export function evaluateCondition(
  condition: WorkflowCondition,
  context: Record<string, unknown>
): boolean {
  const fieldValue = getFieldValue(context, condition.field);
  return compareValues(condition.operator, fieldValue, condition.value);
}

/**
 * Evaluates an array of conditions respecting `logicalOperator` on each condition.
 * The first condition's logical operator is ignored (it begins the chain).
 * Default operator is AND.
 */
export function evaluateConditions(
  conditions: WorkflowCondition[],
  context: Record<string, unknown>
): boolean {
  if (!conditions || conditions.length === 0) return true;

  let result = evaluateCondition(conditions[0], context);

  for (let i = 1; i < conditions.length; i++) {
    const cond = conditions[i];
    const condResult = evaluateCondition(cond, context);
    if (cond.logicalOperator === 'OR') {
      result = result || condResult;
    } else {
      // default AND
      result = result && condResult;
    }
  }

  return result;
}
