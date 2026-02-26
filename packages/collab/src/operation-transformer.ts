// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { CollabOperation } from './types';

/**
 * Basic Operational Transform: adjusts `op` positions relative to a concurrent `against` op.
 * Only position-sensitive ops (insert/delete) are adjusted.
 */
export function transformOperation(
  op: CollabOperation,
  against: CollabOperation
): CollabOperation {
  if (op.field !== against.field) return { ...op };

  if (op.type === 'insert' && against.type === 'insert') {
    const opPos = op.position ?? 0;
    const againstPos = against.position ?? 0;
    if (againstPos <= opPos) {
      return { ...op, position: opPos + (against.value as string ?? '').length };
    }
    return { ...op };
  }

  if (op.type === 'insert' && against.type === 'delete') {
    const opPos = op.position ?? 0;
    const againstPos = against.position ?? 0;
    const againstLen = against.length ?? 0;
    if (againstPos < opPos) {
      return { ...op, position: Math.max(0, opPos - againstLen) };
    }
    return { ...op };
  }

  if (op.type === 'delete' && against.type === 'insert') {
    const opPos = op.position ?? 0;
    const againstPos = against.position ?? 0;
    if (againstPos <= opPos) {
      return { ...op, position: opPos + (against.value as string ?? '').length };
    }
    return { ...op };
  }

  if (op.type === 'delete' && against.type === 'delete') {
    const opPos = op.position ?? 0;
    const againstPos = against.position ?? 0;
    const againstLen = against.length ?? 0;
    if (againstPos < opPos) {
      return { ...op, position: Math.max(0, opPos - againstLen) };
    }
    if (againstPos === opPos) {
      return { ...op, length: 0 }; // already deleted
    }
    return { ...op };
  }

  return { ...op };
}

/**
 * Squash adjacent same-field same-type operations where possible.
 */
export function composeOperations(ops: CollabOperation[]): CollabOperation[] {
  if (ops.length === 0) return [];
  const result: CollabOperation[] = [{ ...ops[0] }];

  for (let i = 1; i < ops.length; i++) {
    const prev = result[result.length - 1];
    const curr = ops[i];

    if (
      prev.field === curr.field &&
      prev.type === 'insert' &&
      curr.type === 'insert' &&
      prev.userId === curr.userId
    ) {
      const prevVal = String(prev.value ?? '');
      const currVal = String(curr.value ?? '');
      result[result.length - 1] = {
        ...prev,
        value: prevVal + currVal,
      };
    } else if (
      prev.field === curr.field &&
      prev.type === 'delete' &&
      curr.type === 'delete' &&
      prev.userId === curr.userId
    ) {
      result[result.length - 1] = {
        ...prev,
        length: (prev.length ?? 0) + (curr.length ?? 0),
      };
    } else {
      result.push({ ...curr });
    }
  }

  return result;
}

/** Creates the inverse (undo) operation for a given operation. */
export function invertOperation(op: CollabOperation): CollabOperation {
  if (op.type === 'insert') {
    return {
      ...op,
      type: 'delete',
      length: String(op.value ?? '').length,
      value: undefined,
    };
  }
  if (op.type === 'delete') {
    return {
      ...op,
      type: 'insert',
      value: '',
      length: undefined,
    };
  }
  // set → set with undefined (cannot reverse without previous value)
  return { ...op };
}

/** Applies an operation to a plain document object (shallow field mutation). */
export function applyOperation(
  doc: Record<string, unknown>,
  op: CollabOperation
): Record<string, unknown> {
  const result = { ...doc };

  if (op.type === 'set') {
    result[op.field] = op.value;
    return result;
  }

  const current = String(result[op.field] ?? '');

  if (op.type === 'insert') {
    const pos = op.position ?? current.length;
    const safePos = Math.max(0, Math.min(pos, current.length));
    result[op.field] =
      current.slice(0, safePos) + String(op.value ?? '') + current.slice(safePos);
    return result;
  }

  if (op.type === 'delete') {
    const pos = op.position ?? 0;
    const len = op.length ?? 0;
    const safePos = Math.max(0, Math.min(pos, current.length));
    result[op.field] = current.slice(0, safePos) + current.slice(safePos + len);
    return result;
  }

  if (op.type === 'retain') {
    // retain = no change
    return result;
  }

  return result;
}

/** Returns true if two ops on the same field conflict (concurrent writes at overlapping positions). */
export function isConflict(op1: CollabOperation, op2: CollabOperation): boolean {
  if (op1.field !== op2.field) return false;
  if (op1.userId === op2.userId) return false;
  if (op1.version === op2.version) return true;

  // Both modify same positional range
  if (op1.type === 'set' || op2.type === 'set') return true;

  const pos1 = op1.position ?? 0;
  const pos2 = op2.position ?? 0;
  const len1 = op1.type === 'delete' ? (op1.length ?? 0) : String(op1.value ?? '').length;
  const len2 = op2.type === 'delete' ? (op2.length ?? 0) : String(op2.value ?? '').length;

  return pos1 < pos2 + len2 && pos2 < pos1 + len1;
}
