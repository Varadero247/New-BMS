// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  DiffEntry,
  DiffOperation,
  DiffOptions,
  JsonArray,
  JsonObject,
  JsonValue,
  MergeConflict,
  MergeResult,
  ObjectDiffResult,
  PatchResult,
  TextDiffLine,
  ArrayDiffResult,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isObject(v: JsonValue): v is JsonObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function isArray(v: JsonValue): v is JsonArray {
  return Array.isArray(v);
}

function cloneDeep(v: JsonValue): JsonValue {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return (v as JsonArray).map(cloneDeep);
  const out: JsonObject = {};
  for (const k of Object.keys(v as JsonObject)) {
    out[k] = cloneDeep((v as JsonObject)[k]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. isEqual — deep equality
// ---------------------------------------------------------------------------

export function isEqual(a: JsonValue, b: JsonValue): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const ao = a as JsonObject;
  const bo = b as JsonObject;
  const aKeys = Object.keys(ao).sort();
  const bKeys = Object.keys(bo).sort();
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) return false;
    if (!isEqual(ao[aKeys[i]], bo[bKeys[i]])) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// 18. toJsonPointer — join parts to pointer string
// ---------------------------------------------------------------------------

export function toJsonPointer(parts: string[]): string {
  if (parts.length === 0) return '';
  return '/' + parts.map((p) => String(p).replace(/~/g, '~0').replace(/\//g, '~1')).join('/');
}

// ---------------------------------------------------------------------------
// 19. fromJsonPointer — split pointer to parts array
// ---------------------------------------------------------------------------

export function fromJsonPointer(pointer: string): string[] {
  if (pointer === '' || pointer === '/') return pointer === '/' ? [''] : [];
  if (!pointer.startsWith('/')) return [pointer];
  return pointer
    .slice(1)
    .split('/')
    .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
}

// ---------------------------------------------------------------------------
// 15. getByPath — get value at JSON Pointer path
// ---------------------------------------------------------------------------

export function getByPath(obj: JsonValue, path: string): JsonValue | undefined {
  if (path === '' || path === undefined) return obj;
  const parts = fromJsonPointer(path);
  let current: JsonValue = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (isArray(current)) {
      const idx = parseInt(part, 10);
      if (isNaN(idx)) return undefined;
      current = (current as JsonArray)[idx];
    } else if (isObject(current)) {
      current = (current as JsonObject)[part];
    } else {
      return undefined;
    }
  }
  return current as JsonValue;
}

// ---------------------------------------------------------------------------
// 16. setByPath — set value at JSON Pointer path (returns new object)
// ---------------------------------------------------------------------------

export function setByPath(obj: JsonValue, path: string, value: JsonValue): JsonValue {
  if (path === '') return cloneDeep(value);
  const parts = fromJsonPointer(path);
  const result = cloneDeep(obj);

  function setIn(current: JsonValue, remainingParts: string[]): JsonValue {
    if (remainingParts.length === 0) return cloneDeep(value);
    const [head, ...tail] = remainingParts;

    if (isArray(current)) {
      const arr = [...(current as JsonArray)];
      const idx = head === '-' ? arr.length : parseInt(head, 10);
      if (isNaN(idx)) return current;
      arr[idx] = setIn(arr[idx] !== undefined ? arr[idx] : null, tail);
      return arr;
    }

    if (isObject(current)) {
      const obj2 = { ...(current as JsonObject) };
      obj2[head] = setIn(obj2[head] !== undefined ? obj2[head] : null, tail);
      return obj2;
    }

    // Primitive — create structure
    if (tail.length === 0) {
      const base: JsonObject = {};
      base[head] = cloneDeep(value);
      return base;
    }
    const base: JsonObject = {};
    base[head] = setIn(null, tail);
    return base;
  }

  return setIn(result, parts);
}

// ---------------------------------------------------------------------------
// 17. deleteByPath — delete key at JSON Pointer path
// ---------------------------------------------------------------------------

export function deleteByPath(obj: JsonValue, path: string): JsonValue {
  if (path === '') return null;
  const parts = fromJsonPointer(path);
  const result = cloneDeep(obj);

  function deleteIn(current: JsonValue, remainingParts: string[]): JsonValue {
    if (remainingParts.length === 0) return current;
    const [head, ...tail] = remainingParts;

    if (isArray(current)) {
      const arr = [...(current as JsonArray)];
      const idx = parseInt(head, 10);
      if (isNaN(idx)) return current;
      if (tail.length === 0) {
        arr.splice(idx, 1);
      } else {
        arr[idx] = deleteIn(arr[idx], tail);
      }
      return arr;
    }

    if (isObject(current)) {
      const obj2 = { ...(current as JsonObject) };
      if (tail.length === 0) {
        delete obj2[head];
      } else {
        obj2[head] = deleteIn(obj2[head], tail);
      }
      return obj2;
    }

    return current;
  }

  return deleteIn(result, parts);
}

// ---------------------------------------------------------------------------
// 1. deepDiff — recursive diff returning DiffEntry[]
// ---------------------------------------------------------------------------

export function deepDiff(a: JsonValue, b: JsonValue, options: DiffOptions = {}, basePath = ''): DiffEntry[] {
  const { ignoreKeys = [], arrayMatchBy } = options;
  const entries: DiffEntry[] = [];

  if (isEqual(a, b)) return entries;

  if (isObject(a) && isObject(b)) {
    const ao = a as JsonObject;
    const bo = b as JsonObject;
    const allKeys = new Set([...Object.keys(ao), ...Object.keys(bo)]);

    for (const key of allKeys) {
      if (ignoreKeys.includes(key)) continue;
      const childPath = basePath + toJsonPointer([key]);

      if (!(key in ao)) {
        entries.push({ op: 'add', path: childPath, value: cloneDeep(bo[key]) });
      } else if (!(key in bo)) {
        entries.push({ op: 'remove', path: childPath, oldValue: cloneDeep(ao[key]) });
      } else if (!isEqual(ao[key], bo[key])) {
        if ((isObject(ao[key]) && isObject(bo[key])) || (isArray(ao[key]) && isArray(bo[key]))) {
          const nested = deepDiff(ao[key], bo[key], options, childPath);
          entries.push(...nested);
        } else {
          entries.push({ op: 'replace', path: childPath, value: cloneDeep(bo[key]), oldValue: cloneDeep(ao[key]) });
        }
      }
    }
  } else if (isArray(a) && isArray(b)) {
    const aa = a as JsonArray;
    const ba = b as JsonArray;

    if (arrayMatchBy && aa.every(isObject) && ba.every(isObject)) {
      // Identity-based matching
      const aMap = new Map<JsonValue, JsonObject>();
      for (const item of aa) {
        const key = (item as JsonObject)[arrayMatchBy];
        aMap.set(key, item as JsonObject);
      }
      const bMap = new Map<JsonValue, JsonObject>();
      for (const item of ba) {
        const key = (item as JsonObject)[arrayMatchBy];
        bMap.set(key, item as JsonObject);
      }

      let bIdx = 0;
      for (const [key, bItem] of bMap) {
        const childPath = basePath + toJsonPointer([String(bIdx)]);
        if (!aMap.has(key)) {
          entries.push({ op: 'add', path: childPath, value: cloneDeep(bItem) });
        } else {
          const aItem = aMap.get(key)!;
          if (!isEqual(aItem, bItem)) {
            const nested = deepDiff(aItem, bItem, options, childPath);
            entries.push(...nested);
          }
        }
        bIdx++;
      }
      for (const [key, aItem] of aMap) {
        if (!bMap.has(key)) {
          const idx = aa.indexOf(aItem);
          const childPath = basePath + toJsonPointer([String(idx)]);
          entries.push({ op: 'remove', path: childPath, oldValue: cloneDeep(aItem) });
        }
      }
    } else {
      // Index-based
      const maxLen = Math.max(aa.length, ba.length);
      for (let i = 0; i < maxLen; i++) {
        const childPath = basePath + toJsonPointer([String(i)]);
        if (i >= aa.length) {
          entries.push({ op: 'add', path: childPath, value: cloneDeep(ba[i]) });
        } else if (i >= ba.length) {
          entries.push({ op: 'remove', path: childPath, oldValue: cloneDeep(aa[i]) });
        } else if (!isEqual(aa[i], ba[i])) {
          if ((isObject(aa[i]) && isObject(ba[i])) || (isArray(aa[i]) && isArray(ba[i]))) {
            const nested = deepDiff(aa[i], ba[i], options, childPath);
            entries.push(...nested);
          } else {
            entries.push({ op: 'replace', path: childPath, value: cloneDeep(ba[i]), oldValue: cloneDeep(aa[i]) });
          }
        }
      }
    }
  } else {
    // Scalar replacement or type change
    const path = basePath || '/';
    entries.push({ op: 'replace', path, value: cloneDeep(b), oldValue: cloneDeep(a) });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// 2. shallowDiff — one level deep ObjectDiffResult
// ---------------------------------------------------------------------------

export function shallowDiff(a: JsonObject, b: JsonObject): ObjectDiffResult {
  const result: ObjectDiffResult = { added: {}, removed: {}, changed: {}, unchanged: {} };
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const inA = key in a;
    const inB = key in b;

    if (!inA) {
      result.added[key] = cloneDeep(b[key]);
    } else if (!inB) {
      result.removed[key] = cloneDeep(a[key]);
    } else if (!isEqual(a[key], b[key])) {
      result.changed[key] = { from: cloneDeep(a[key]), to: cloneDeep(b[key]) };
    } else {
      result.unchanged[key] = cloneDeep(a[key]);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 3. objectDiff — full deep ObjectDiffResult with nested key paths
// ---------------------------------------------------------------------------

export function objectDiff(a: JsonObject, b: JsonObject, options: DiffOptions = {}): ObjectDiffResult {
  const { ignoreKeys = [] } = options;
  const result: ObjectDiffResult = { added: {}, removed: {}, changed: {}, unchanged: {} };

  function walk(aObj: JsonObject, bObj: JsonObject, prefix: string): void {
    const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);

    for (const key of allKeys) {
      if (ignoreKeys.includes(key)) continue;
      const dotKey = prefix ? `${prefix}.${key}` : key;
      const inA = key in aObj;
      const inB = key in bObj;

      if (!inA) {
        result.added[dotKey] = cloneDeep(bObj[key]);
      } else if (!inB) {
        result.removed[dotKey] = cloneDeep(aObj[key]);
      } else if (isObject(aObj[key]) && isObject(bObj[key]) && options.deep !== false) {
        walk(aObj[key] as JsonObject, bObj[key] as JsonObject, dotKey);
      } else if (!isEqual(aObj[key], bObj[key])) {
        result.changed[dotKey] = { from: cloneDeep(aObj[key]), to: cloneDeep(bObj[key]) };
      } else {
        result.unchanged[dotKey] = cloneDeep(aObj[key]);
      }
    }
  }

  walk(a, b, '');
  return result;
}

// ---------------------------------------------------------------------------
// 4. arrayDiff — LCS-based array diff
// ---------------------------------------------------------------------------

function lcs<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (eq(a[i - 1], b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function backtrackLcs<T>(
  dp: number[][],
  a: T[],
  b: T[],
  i: number,
  j: number,
  eq: (x: T, y: T) => boolean,
): Array<[number, number]> {
  if (i === 0 || j === 0) return [];
  if (eq(a[i - 1], b[j - 1])) {
    return [...backtrackLcs(dp, a, b, i - 1, j - 1, eq), [i - 1, j - 1]];
  }
  if (dp[i - 1][j] > dp[i][j - 1]) {
    return backtrackLcs(dp, a, b, i - 1, j, eq);
  }
  return backtrackLcs(dp, a, b, i, j - 1, eq);
}

export function arrayDiff<T extends JsonValue>(
  a: T[],
  b: T[],
  keyFn?: (item: T) => JsonValue,
): ArrayDiffResult<T> {
  const result: ArrayDiffResult<T> = { added: [], removed: [], moved: [], unchanged: [] };

  const eq = keyFn
    ? (x: T, y: T) => isEqual(keyFn(x), keyFn(y))
    : (x: T, y: T) => isEqual(x, y);

  const dp = lcs(a, b, eq);
  const commonPairs = backtrackLcs(dp, a, b, a.length, b.length, eq);

  const aCommon = new Set(commonPairs.map(([ai]) => ai));
  const bCommon = new Set(commonPairs.map(([, bi]) => bi));

  // Unchanged — items in both via LCS
  for (const [ai, bi] of commonPairs) {
    const moved = ai !== bi;
    if (moved) {
      result.moved.push({ from: ai, to: bi, value: a[ai] });
    } else {
      result.unchanged.push({ index: bi, value: b[bi] });
    }
  }

  // Removed — in a but not in LCS
  for (let i = 0; i < a.length; i++) {
    if (!aCommon.has(i)) {
      result.removed.push({ index: i, value: a[i] });
    }
  }

  // Added — in b but not in LCS
  for (let j = 0; j < b.length; j++) {
    if (!bCommon.has(j)) {
      result.added.push({ index: j, value: b[j] });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 5. textDiff — line-by-line LCS diff
// ---------------------------------------------------------------------------

export function textDiff(a: string, b: string): TextDiffLine[] {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const result: TextDiffLine[] = [];

  const eq = (x: string, y: string) => x === y;
  const dp = lcs(aLines, bLines, eq);
  const commonPairs = backtrackLcs(dp, aLines, bLines, aLines.length, bLines.length, eq);

  const aCommon = new Map(commonPairs.map(([ai, bi]) => [ai, bi]));
  const bCommon = new Set(commonPairs.map(([, bi]) => bi));

  let aIdx = 0;
  let bIdx = 0;

  for (const [ai, bi] of commonPairs) {
    // Lines removed from a before this common line
    while (aIdx < ai) {
      result.push({ type: 'delete', value: aLines[aIdx], lineNumber: aIdx + 1 });
      aIdx++;
    }
    // Lines added in b before this common line
    while (bIdx < bi) {
      result.push({ type: 'insert', value: bLines[bIdx], lineNumber: bIdx + 1 });
      bIdx++;
    }
    result.push({ type: 'equal', value: aLines[ai], lineNumber: bi + 1 });
    aIdx++;
    bIdx++;
  }

  // Trailing removed lines
  while (aIdx < aLines.length) {
    if (!aCommon.has(aIdx)) {
      result.push({ type: 'delete', value: aLines[aIdx], lineNumber: aIdx + 1 });
    }
    aIdx++;
  }
  // Trailing inserted lines
  while (bIdx < bLines.length) {
    if (!bCommon.has(bIdx)) {
      result.push({ type: 'insert', value: bLines[bIdx], lineNumber: bIdx + 1 });
    }
    bIdx++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// 6. applyPatch — apply JSON Patch operations
// ---------------------------------------------------------------------------

export function applyPatch(obj: JsonValue, patches: DiffEntry[]): PatchResult {
  try {
    let current = cloneDeep(obj);

    for (const patch of patches) {
      switch (patch.op) {
        case 'add':
          if (patch.value === undefined) return { success: false, error: `add op missing value at ${patch.path}` };
          current = setByPath(current, patch.path, patch.value);
          break;

        case 'remove':
          current = deleteByPath(current, patch.path);
          break;

        case 'replace': {
          if (patch.value === undefined) return { success: false, error: `replace op missing value at ${patch.path}` };
          const existing = getByPath(current, patch.path);
          if (existing === undefined) return { success: false, error: `replace target not found: ${patch.path}` };
          current = setByPath(current, patch.path, patch.value);
          break;
        }

        case 'move': {
          if (!patch.from) return { success: false, error: `move op missing from at ${patch.path}` };
          const fromVal = getByPath(current, patch.from);
          if (fromVal === undefined) return { success: false, error: `move source not found: ${patch.from}` };
          current = deleteByPath(current, patch.from);
          current = setByPath(current, patch.path, fromVal);
          break;
        }

        case 'copy': {
          if (!patch.from) return { success: false, error: `copy op missing from at ${patch.path}` };
          const fromVal = getByPath(current, patch.from);
          if (fromVal === undefined) return { success: false, error: `copy source not found: ${patch.from}` };
          current = setByPath(current, patch.path, cloneDeep(fromVal));
          break;
        }

        case 'test': {
          const testVal = getByPath(current, patch.path);
          if (!isEqual(testVal as JsonValue, patch.value as JsonValue)) {
            return { success: false, error: `test failed at ${patch.path}: expected ${JSON.stringify(patch.value)}, got ${JSON.stringify(testVal)}` };
          }
          break;
        }

        default:
          return { success: false, error: `unknown op: ${(patch as DiffEntry).op}` };
      }
    }

    return { success: true, result: current };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// 7. invertPatch — invert a patch
// ---------------------------------------------------------------------------

export function invertPatch(patches: DiffEntry[]): DiffEntry[] {
  return [...patches].reverse().map((patch) => {
    switch (patch.op) {
      case 'add':
        return { op: 'remove' as DiffOperation, path: patch.path, oldValue: patch.value };
      case 'remove':
        return { op: 'add' as DiffOperation, path: patch.path, value: patch.oldValue };
      case 'replace':
        return { op: 'replace' as DiffOperation, path: patch.path, value: patch.oldValue, oldValue: patch.value };
      case 'move':
        return { op: 'move' as DiffOperation, path: patch.from!, from: patch.path };
      case 'copy':
        return { op: 'remove' as DiffOperation, path: patch.path };
      case 'test':
        return { ...patch };
      default:
        return { ...patch };
    }
  });
}

// ---------------------------------------------------------------------------
// 8. mergePatch — three-way merge
// ---------------------------------------------------------------------------

export function mergePatch(base: JsonValue, ours: JsonValue, theirs: JsonValue): MergeResult {
  const conflicts: MergeConflict[] = [];

  function mergeValues(b: JsonValue, o: JsonValue, t: JsonValue, path: string): JsonValue {
    const oursChanged = !isEqual(b, o);
    const theirsChanged = !isEqual(b, t);

    if (!oursChanged && !theirsChanged) return cloneDeep(b);
    if (!oursChanged) return cloneDeep(t);
    if (!theirsChanged) return cloneDeep(o);

    // Both changed
    if (isObject(b) && isObject(o) && isObject(t)) {
      const merged: JsonObject = {};
      const allKeys = new Set([...Object.keys(b as JsonObject), ...Object.keys(o as JsonObject), ...Object.keys(t as JsonObject)]);

      for (const key of allKeys) {
        const childPath = path ? `${path}.${key}` : key;
        const bv = (b as JsonObject)[key] !== undefined ? (b as JsonObject)[key] : null;
        const ov = (o as JsonObject)[key] !== undefined ? (o as JsonObject)[key] : null;
        const tv = (t as JsonObject)[key] !== undefined ? (t as JsonObject)[key] : null;

        const inBase = key in (b as JsonObject);
        const inOurs = key in (o as JsonObject);
        const inTheirs = key in (t as JsonObject);

        if (!inOurs && !inTheirs) continue; // Both removed

        if (inOurs && !inTheirs && !inBase) {
          merged[key] = cloneDeep(ov);
        } else if (!inOurs && inTheirs && !inBase) {
          merged[key] = cloneDeep(tv);
        } else {
          merged[key] = mergeValues(bv, ov, tv, childPath);
        }
      }
      return merged;
    }

    if (isEqual(o, t)) return cloneDeep(o);

    // Conflict
    conflicts.push({ path, base: cloneDeep(b), ours: cloneDeep(o), theirs: cloneDeep(t) });
    return cloneDeep(o); // Favour ours on conflict
  }

  const merged = mergeValues(base, ours, theirs, '');
  return { merged, conflicts };
}

// ---------------------------------------------------------------------------
// 10. countChanges
// ---------------------------------------------------------------------------

export function countChanges(diffs: DiffEntry[]): { added: number; removed: number; changed: number; total: number } {
  let added = 0;
  let removed = 0;
  let changed = 0;

  for (const d of diffs) {
    if (d.op === 'add') added++;
    else if (d.op === 'remove') removed++;
    else if (d.op === 'replace' || d.op === 'move' || d.op === 'copy') changed++;
  }

  return { added, removed, changed, total: added + removed + changed };
}

// ---------------------------------------------------------------------------
// 11. summarizeDiff
// ---------------------------------------------------------------------------

export function summarizeDiff(diffs: DiffEntry[]): string {
  const counts = countChanges(diffs);
  const parts: string[] = [];

  if (counts.added > 0) parts.push(`${counts.added} addition${counts.added !== 1 ? 's' : ''}`);
  if (counts.removed > 0) parts.push(`${counts.removed} removal${counts.removed !== 1 ? 's' : ''}`);
  if (counts.changed > 0) parts.push(`${counts.changed} change${counts.changed !== 1 ? 's' : ''}`);

  if (parts.length === 0) return 'no changes';
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// 12. filterDiff
// ---------------------------------------------------------------------------

export function filterDiff(diffs: DiffEntry[], pathPrefix: string): DiffEntry[] {
  return diffs.filter((d) => d.path.startsWith(pathPrefix));
}

// ---------------------------------------------------------------------------
// 13. flattenObject
// ---------------------------------------------------------------------------

export function flattenObject(obj: JsonObject, prefix = ''): Record<string, JsonValue> {
  const result: Record<string, JsonValue> = {};

  function walk(current: JsonValue, currentPrefix: string): void {
    if (isObject(current)) {
      for (const key of Object.keys(current as JsonObject)) {
        const newKey = currentPrefix ? `${currentPrefix}.${key}` : key;
        walk((current as JsonObject)[key], newKey);
      }
    } else if (isArray(current)) {
      for (let i = 0; i < (current as JsonArray).length; i++) {
        const newKey = currentPrefix ? `${currentPrefix}.${i}` : String(i);
        walk((current as JsonArray)[i], newKey);
      }
    } else {
      result[currentPrefix] = current;
    }
  }

  walk(obj, prefix);
  return result;
}

// ---------------------------------------------------------------------------
// 14. unflattenObject
// ---------------------------------------------------------------------------

export function unflattenObject(flat: Record<string, JsonValue>): JsonObject {
  const result: JsonObject = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current: JsonObject = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as JsonObject;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

// ---------------------------------------------------------------------------
// 20. diffToString
// ---------------------------------------------------------------------------

export function diffToString(diffs: DiffEntry[]): string {
  if (diffs.length === 0) return '(no changes)';

  return diffs
    .map((d) => {
      switch (d.op) {
        case 'add':
          return `+ ${d.path}: ${JSON.stringify(d.value)}`;
        case 'remove':
          return `- ${d.path}: ${JSON.stringify(d.oldValue)}`;
        case 'replace':
          return `~ ${d.path}: ${JSON.stringify(d.oldValue)} → ${JSON.stringify(d.value)}`;
        case 'move':
          return `> ${d.from} → ${d.path}`;
        case 'copy':
          return `# ${d.from} → ${d.path}`;
        case 'test':
          return `? ${d.path}: ${JSON.stringify(d.value)}`;
        default:
          return `? ${d.path}`;
      }
    })
    .join('\n');
}
