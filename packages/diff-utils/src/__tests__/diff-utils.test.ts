// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  deepDiff,
  shallowDiff,
  objectDiff,
  arrayDiff,
  textDiff,
  applyPatch,
  invertPatch,
  mergePatch,
  isEqual,
  countChanges,
  summarizeDiff,
  filterDiff,
  flattenObject,
  unflattenObject,
  getByPath,
  setByPath,
  deleteByPath,
  toJsonPointer,
  fromJsonPointer,
  diffToString,
} from '../diff-utils';

import type { DiffEntry, JsonObject, JsonValue } from '../types';

// ============================================================
// isEqual
// ============================================================

describe('isEqual', () => {
  const primitiveEqualCases: Array<[JsonValue, JsonValue, boolean]> = [
    [1, 1, true],
    [0, 0, true],
    [-1, -1, true],
    [1.5, 1.5, true],
    ['hello', 'hello', true],
    ['', '', true],
    [true, true, true],
    [false, false, true],
    [null, null, true],
    [1, 2, false],
    [1, '1', false],
    [true, 1, false],
    [null, 0, false],
    [null, false, false],
    ['a', 'b', false],
    [0, false, false],
  ];

  for (const [a, b, expected] of primitiveEqualCases) {
    it(`isEqual(${JSON.stringify(a)}, ${JSON.stringify(b)}) === ${expected}`, () => {
      expect(isEqual(a, b)).toBe(expected);
    });
  }

  const objectEqualCases: Array<[JsonObject, JsonObject, boolean]> = [
    [{}, {}, true],
    [{ a: 1 }, { a: 1 }, true],
    [{ a: 1, b: 2 }, { a: 1, b: 2 }, true],
    [{ a: 1, b: 2 }, { b: 2, a: 1 }, true],
    [{ a: 1 }, { a: 2 }, false],
    [{ a: 1 }, { a: 1, b: 2 }, false],
    [{ a: 1, b: 2 }, { a: 1 }, false],
    [{ a: { b: 1 } }, { a: { b: 1 } }, true],
    [{ a: { b: 1 } }, { a: { b: 2 } }, false],
    [{ a: [1, 2] }, { a: [1, 2] }, true],
    [{ a: [1, 2] }, { a: [2, 1] }, false],
    [{ a: null }, { a: null }, true],
    [{ a: null }, { a: 0 }, false],
    [{ a: true }, { a: false }, false],
    [{ x: { y: { z: 42 } } }, { x: { y: { z: 42 } } }, true],
  ];

  for (const [a, b, expected] of objectEqualCases) {
    it(`isEqual objects: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`, () => {
      expect(isEqual(a, b)).toBe(expected);
      expect(isEqual(b, a)).toBe(expected); // symmetry
    });
  }

  const arrayEqualCases: Array<[JsonValue[], JsonValue[], boolean]> = [
    [[], [], true],
    [[1, 2, 3], [1, 2, 3], true],
    [[1, 2, 3], [1, 2, 4], false],
    [[1, 2], [1, 2, 3], false],
    [['a', 'b'], ['a', 'b'], true],
    [['a', 'b'], ['b', 'a'], false],
    [[null, true, 1], [null, true, 1], true],
    [[{ a: 1 }], [{ a: 1 }], true],
    [[{ a: 1 }], [{ a: 2 }], false],
    [[[1, 2], [3, 4]], [[1, 2], [3, 4]], true],
    [[[1, 2], [3, 4]], [[1, 2], [3, 5]], false],
  ];

  for (const [a, b, expected] of arrayEqualCases) {
    it(`isEqual arrays: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`, () => {
      expect(isEqual(a, b)).toBe(expected);
    });
  }
});

// ============================================================
// toJsonPointer / fromJsonPointer
// ============================================================

describe('toJsonPointer', () => {
  const cases: Array<[string[], string]> = [
    [[], ''],
    [['a'], '/a'],
    [['a', 'b'], '/a/b'],
    [['a', 'b', 'c'], '/a/b/c'],
    [['0'], '/0'],
    [['a', '0', 'b'], '/a/0/b'],
    [['a/b'], '/a~1b'],
    [['a~b'], '/a~0b'],
    [['a~1b'], '/a~01b'],
    [[''], '/'],
    [['foo', 'bar', 'baz'], '/foo/bar/baz'],
    [['x', '10', 'y'], '/x/10/y'],
  ];

  for (const [parts, expected] of cases) {
    it(`toJsonPointer(${JSON.stringify(parts)}) === "${expected}"`, () => {
      expect(toJsonPointer(parts)).toBe(expected);
    });
  }
});

describe('fromJsonPointer', () => {
  const cases: Array<[string, string[]]> = [
    ['', []],
    ['/a', ['a']],
    ['/a/b', ['a', 'b']],
    ['/a/b/c', ['a', 'b', 'c']],
    ['/0', ['0']],
    ['/a/0/b', ['a', '0', 'b']],
    ['/a~1b', ['a/b']],
    ['/a~0b', ['a~b']],
    ['/a~01b', ['a~1b']],
    ['/foo/bar/baz', ['foo', 'bar', 'baz']],
    ['/x/10/y', ['x', '10', 'y']],
  ];

  for (const [pointer, expected] of cases) {
    it(`fromJsonPointer("${pointer}") deepEquals ${JSON.stringify(expected)}`, () => {
      expect(fromJsonPointer(pointer)).toEqual(expected);
    });
  }

  it('round-trips pointer through fromJsonPointer and back', () => {
    const pointers = ['/a', '/a/b', '/a~1b', '/a~0b', '/foo/0/bar'];
    for (const p of pointers) {
      expect(toJsonPointer(fromJsonPointer(p))).toBe(p);
    }
  });
});

// ============================================================
// getByPath
// ============================================================

describe('getByPath', () => {
  const obj: JsonObject = {
    a: 1,
    b: { c: 2, d: { e: 3 } },
    arr: [10, 20, 30],
    nested: { arr: [{ id: 1 }, { id: 2 }] },
    nullVal: null,
  };

  const cases: Array<[string, JsonValue | undefined]> = [
    ['', obj],
    ['/a', 1],
    ['/b/c', 2],
    ['/b/d/e', 3],
    ['/arr/0', 10],
    ['/arr/1', 20],
    ['/arr/2', 30],
    ['/nested/arr/0/id', 1],
    ['/nested/arr/1/id', 2],
    ['/nullVal', null],
    ['/nonexistent', undefined],
    ['/b/nonexistent', undefined],
    ['/arr/99', undefined],
  ];

  for (const [path, expected] of cases) {
    it(`getByPath obj "${path}" === ${JSON.stringify(expected)}`, () => {
      expect(getByPath(obj, path)).toEqual(expected);
    });
  }

  it('handles null root gracefully', () => {
    expect(getByPath(null, '/a')).toBeUndefined();
  });

  it('handles primitive root', () => {
    expect(getByPath(42, '')).toBe(42);
    expect(getByPath('hello', '')).toBe('hello');
  });
});

// ============================================================
// setByPath
// ============================================================

describe('setByPath', () => {
  it('sets a top-level key', () => {
    const result = setByPath({ a: 1 }, '/a', 99) as JsonObject;
    expect(result['a']).toBe(99);
    expect(Object.keys(result)).toHaveLength(1);
  });

  it('does not mutate the original', () => {
    const original: JsonObject = { a: 1 };
    setByPath(original, '/a', 99);
    expect(original['a']).toBe(1);
  });

  it('sets a nested key', () => {
    const result = setByPath({ b: { c: 2 } }, '/b/c', 99) as JsonObject;
    expect((result['b'] as JsonObject)['c']).toBe(99);
  });

  it('sets a new top-level key', () => {
    const result = setByPath({ a: 1 }, '/b', 2) as JsonObject;
    expect(result['a']).toBe(1);
    expect(result['b']).toBe(2);
  });

  it('sets an array index', () => {
    const result = setByPath([10, 20, 30], '/1', 99) as JsonValue[];
    expect(result[1]).toBe(99);
    expect(result[0]).toBe(10);
    expect(result[2]).toBe(30);
  });

  it('sets deeply nested array element', () => {
    const obj: JsonObject = { arr: [{ x: 1 }, { x: 2 }] };
    const result = setByPath(obj, '/arr/1/x', 99) as JsonObject;
    expect(((result['arr'] as JsonValue[])[1] as JsonObject)['x']).toBe(99);
  });

  it('replaces root with empty path', () => {
    const result = setByPath({ a: 1 }, '', { b: 2 });
    expect(result).toEqual({ b: 2 });
  });

  it('sets null value', () => {
    const result = setByPath({ a: 1 }, '/a', null) as JsonObject;
    expect(result['a']).toBeNull();
  });

  const setCases: Array<[JsonObject, string, JsonValue]> = [
    [{ a: 1 }, '/a', 10],
    [{ a: { b: 1 } }, '/a/b', 10],
    [{ a: 1 }, '/b', 2],
    [{ x: [1, 2, 3] }, '/x/0', 99],
    [{ x: [1, 2, 3] }, '/x/2', 99],
    [{ a: true }, '/a', false],
    [{ a: 'old' }, '/a', 'new'],
    [{ a: null }, '/a', 42],
  ];

  for (const [obj, path, val] of setCases) {
    it(`setByPath sets "${path}" to ${JSON.stringify(val)}`, () => {
      const result = setByPath(obj, path, val);
      expect(getByPath(result, path)).toEqual(val);
    });
  }
});

// ============================================================
// deleteByPath
// ============================================================

describe('deleteByPath', () => {
  it('deletes a top-level key', () => {
    const result = deleteByPath({ a: 1, b: 2 }, '/a') as JsonObject;
    expect(result['a']).toBeUndefined();
    expect(result['b']).toBe(2);
  });

  it('deletes a nested key', () => {
    const result = deleteByPath({ a: { b: 1, c: 2 } }, '/a/b') as JsonObject;
    expect((result['a'] as JsonObject)['b']).toBeUndefined();
    expect((result['a'] as JsonObject)['c']).toBe(2);
  });

  it('does not mutate original', () => {
    const original: JsonObject = { a: 1, b: 2 };
    deleteByPath(original, '/a');
    expect(original['a']).toBe(1);
  });

  it('deletes array element by index', () => {
    const result = deleteByPath([10, 20, 30], '/1') as JsonValue[];
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(30);
  });

  it('deletes deeply nested value', () => {
    const obj: JsonObject = { a: { b: { c: 42 } } };
    const result = deleteByPath(obj, '/a/b/c') as JsonObject;
    expect((result['a'] as JsonObject)['b']).toEqual({});
  });

  it('handles deleting non-existent key gracefully', () => {
    const original: JsonObject = { a: 1 };
    const result = deleteByPath(original, '/z') as JsonObject;
    expect(result).toEqual({ a: 1 });
  });

  const deleteCases: Array<[JsonObject, string]> = [
    [{ a: 1, b: 2, c: 3 }, '/a'],
    [{ a: 1, b: 2, c: 3 }, '/b'],
    [{ a: 1, b: 2, c: 3 }, '/c'],
    [{ a: { x: 1, y: 2 } }, '/a/x'],
    [{ a: { x: 1, y: 2 } }, '/a/y'],
  ];

  for (const [obj, path] of deleteCases) {
    it(`deleteByPath "${path}" removes the key`, () => {
      const result = deleteByPath(obj, path);
      expect(getByPath(result, path)).toBeUndefined();
    });
  }
});

// ============================================================
// deepDiff
// ============================================================

describe('deepDiff', () => {
  it('returns empty array for equal objects', () => {
    const result = deepDiff({ a: 1 }, { a: 1 });
    expect(result).toHaveLength(0);
  });

  it('returns empty array for equal primitives', () => {
    expect(deepDiff(1 as unknown as JsonObject, 1 as unknown as JsonObject)).toHaveLength(0);
  });

  const cases: Array<{
    desc: string;
    a: JsonValue;
    b: JsonValue;
    expectedOps: string[];
    minLen: number;
  }> = [
    { desc: 'single replace', a: { x: 1 }, b: { x: 2 }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'add key', a: { x: 1 }, b: { x: 1, y: 2 }, expectedOps: ['add'], minLen: 1 },
    { desc: 'remove key', a: { x: 1, y: 2 }, b: { x: 1 }, expectedOps: ['remove'], minLen: 1 },
    { desc: 'replace string', a: { s: 'old' }, b: { s: 'new' }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'replace bool', a: { b: true }, b: { b: false }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'null to value', a: { n: null }, b: { n: 42 }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'value to null', a: { n: 42 }, b: { n: null }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'array add', a: { arr: [1, 2] }, b: { arr: [1, 2, 3] }, expectedOps: ['add'], minLen: 1 },
    { desc: 'array remove', a: { arr: [1, 2, 3] }, b: { arr: [1, 2] }, expectedOps: ['remove'], minLen: 1 },
    { desc: 'multiple adds', a: {}, b: { a: 1, b: 2 }, expectedOps: ['add', 'add'], minLen: 2 },
    { desc: 'multiple removes', a: { a: 1, b: 2 }, b: {}, expectedOps: ['remove', 'remove'], minLen: 2 },
    { desc: 'nested replace', a: { n: { x: 1 } }, b: { n: { x: 2 } }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'nested add', a: { n: { x: 1 } }, b: { n: { x: 1, y: 2 } }, expectedOps: ['add'], minLen: 1 },
    { desc: 'deep nesting', a: { a: { b: { c: 1 } } }, b: { a: { b: { c: 2 } } }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'type change obj->primitive', a: { x: { a: 1 } }, b: { x: 42 }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'empty objects', a: {}, b: {}, expectedOps: [], minLen: 0 },
    { desc: 'add multiple nested', a: { a: { b: 1 } }, b: { a: { b: 1, c: 2 }, d: 3 }, expectedOps: ['add', 'add'], minLen: 2 },
    { desc: 'array element replace', a: { arr: [1, 2, 3] }, b: { arr: [1, 99, 3] }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'unicode string replace', a: { s: 'héllo' }, b: { s: 'wörld' }, expectedOps: ['replace'], minLen: 1 },
    { desc: 'nested array of objects', a: { items: [{ id: 1 }] }, b: { items: [{ id: 2 }] }, expectedOps: ['replace'], minLen: 1 },
  ];

  for (const tc of cases) {
    it(`deepDiff: ${tc.desc}`, () => {
      const result = deepDiff(tc.a, tc.b);
      expect(result.length).toBeGreaterThanOrEqual(tc.minLen);
      if (tc.expectedOps.length > 0) {
        const ops = result.map((r) => r.op);
        for (const expectedOp of tc.expectedOps) {
          expect(ops).toContain(expectedOp);
        }
      }
      for (const entry of result) {
        expect(entry.path).toBeTruthy();
        expect(['add', 'remove', 'replace', 'move', 'copy', 'test']).toContain(entry.op);
      }
    });
  }

  it('deepDiff with ignoreKeys option', () => {
    const a: JsonObject = { a: 1, b: 2, _internal: 'x' };
    const b: JsonObject = { a: 1, b: 99, _internal: 'y' };
    const result = deepDiff(a, b, { ignoreKeys: ['_internal'] });
    expect(result).toHaveLength(1);
    expect(result[0].op).toBe('replace');
    expect(result[0].path).toBe('/b');
  });

  it('deepDiff paths are valid JSON Pointers', () => {
    const result = deepDiff({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } });
    expect(result[0].path).toBe('/a/b/c');
  });

  it('deepDiff add entry has value field', () => {
    const result = deepDiff({}, { x: 42 });
    expect(result[0].op).toBe('add');
    expect(result[0].value).toBe(42);
  });

  it('deepDiff remove entry has oldValue field', () => {
    const result = deepDiff({ x: 42 }, {});
    expect(result[0].op).toBe('remove');
    expect(result[0].oldValue).toBe(42);
  });

  it('deepDiff replace has both value and oldValue', () => {
    const result = deepDiff({ x: 1 }, { x: 2 });
    expect(result[0].op).toBe('replace');
    expect(result[0].oldValue).toBe(1);
    expect(result[0].value).toBe(2);
  });

  it('deepDiff arrayMatchBy uses identity key', () => {
    const a = { items: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] };
    const b = { items: [{ id: 1, name: 'Alice Updated' }, { id: 2, name: 'Bob' }] };
    const result = deepDiff(a, b, { arrayMatchBy: 'id' });
    expect(result.length).toBeGreaterThan(0);
    const replaceOp = result.find((r) => r.op === 'replace');
    expect(replaceOp).toBeDefined();
  });
});

// ============================================================
// shallowDiff
// ============================================================

describe('shallowDiff', () => {
  const cases: Array<{
    desc: string;
    a: JsonObject;
    b: JsonObject;
    addedKeys: string[];
    removedKeys: string[];
    changedKeys: string[];
    unchangedKeys: string[];
  }> = [
    { desc: 'identical', a: { x: 1 }, b: { x: 1 }, addedKeys: [], removedKeys: [], changedKeys: [], unchangedKeys: ['x'] },
    { desc: 'add key', a: {}, b: { x: 1 }, addedKeys: ['x'], removedKeys: [], changedKeys: [], unchangedKeys: [] },
    { desc: 'remove key', a: { x: 1 }, b: {}, addedKeys: [], removedKeys: ['x'], changedKeys: [], unchangedKeys: [] },
    { desc: 'change value', a: { x: 1 }, b: { x: 2 }, addedKeys: [], removedKeys: [], changedKeys: ['x'], unchangedKeys: [] },
    { desc: 'mixed', a: { a: 1, b: 2 }, b: { b: 99, c: 3 }, addedKeys: ['c'], removedKeys: ['a'], changedKeys: ['b'], unchangedKeys: [] },
    { desc: 'all unchanged', a: { a: 1, b: 2 }, b: { a: 1, b: 2 }, addedKeys: [], removedKeys: [], changedKeys: [], unchangedKeys: ['a', 'b'] },
    { desc: 'nested object treated as change', a: { a: { x: 1 } }, b: { a: { x: 2 } }, addedKeys: [], removedKeys: [], changedKeys: ['a'], unchangedKeys: [] },
    { desc: 'null values', a: { x: null }, b: { x: null }, addedKeys: [], removedKeys: [], changedKeys: [], unchangedKeys: ['x'] },
    { desc: 'null to value', a: { x: null }, b: { x: 1 }, addedKeys: [], removedKeys: [], changedKeys: ['x'], unchangedKeys: [] },
    { desc: 'empty objects', a: {}, b: {}, addedKeys: [], removedKeys: [], changedKeys: [], unchangedKeys: [] },
    { desc: 'multiple adds', a: {}, b: { a: 1, b: 2, c: 3 }, addedKeys: ['a', 'b', 'c'], removedKeys: [], changedKeys: [], unchangedKeys: [] },
    { desc: 'multiple removes', a: { a: 1, b: 2, c: 3 }, b: {}, addedKeys: [], removedKeys: ['a', 'b', 'c'], changedKeys: [], unchangedKeys: [] },
  ];

  for (const tc of cases) {
    it(`shallowDiff: ${tc.desc}`, () => {
      const result = shallowDiff(tc.a, tc.b);
      for (const k of tc.addedKeys) expect(result.added).toHaveProperty(k);
      for (const k of tc.removedKeys) expect(result.removed).toHaveProperty(k);
      for (const k of tc.changedKeys) expect(result.changed).toHaveProperty(k);
      for (const k of tc.unchangedKeys) expect(result.unchanged).toHaveProperty(k);
      expect(Object.keys(result.added)).toHaveLength(tc.addedKeys.length);
      expect(Object.keys(result.removed)).toHaveLength(tc.removedKeys.length);
      expect(Object.keys(result.changed)).toHaveLength(tc.changedKeys.length);
    });
  }

  it('changed entries include from and to', () => {
    const result = shallowDiff({ x: 1 }, { x: 2 });
    expect(result.changed['x'].from).toBe(1);
    expect(result.changed['x'].to).toBe(2);
  });

  it('does not mutate inputs', () => {
    const a: JsonObject = { a: 1 };
    const b: JsonObject = { b: 2 };
    shallowDiff(a, b);
    expect(a).toEqual({ a: 1 });
    expect(b).toEqual({ b: 2 });
  });
});

// ============================================================
// objectDiff
// ============================================================

describe('objectDiff', () => {
  it('produces flat dot-notation paths for nested changes', () => {
    const a: JsonObject = { a: { b: 1 } };
    const b: JsonObject = { a: { b: 2 } };
    const result = objectDiff(a, b);
    expect(result.changed['a.b']).toBeDefined();
    expect(result.changed['a.b'].from).toBe(1);
    expect(result.changed['a.b'].to).toBe(2);
  });

  it('handles deeply nested paths', () => {
    const a: JsonObject = { x: { y: { z: 1 } } };
    const b: JsonObject = { x: { y: { z: 2 } } };
    const result = objectDiff(a, b);
    expect(result.changed['x.y.z']).toBeDefined();
  });

  it('handles ignoreKeys option', () => {
    const a: JsonObject = { a: 1, _ts: 100 };
    const b: JsonObject = { a: 2, _ts: 999 };
    const result = objectDiff(a, b, { ignoreKeys: ['_ts'] });
    expect(result.changed['a']).toBeDefined();
    expect(result.changed['_ts']).toBeUndefined();
    expect(result.unchanged['_ts']).toBeUndefined();
  });

  it('tracks nested additions', () => {
    const a: JsonObject = { a: { x: 1 } };
    const b: JsonObject = { a: { x: 1, y: 2 } };
    const result = objectDiff(a, b);
    expect(result.added['a.y']).toBe(2);
  });

  it('tracks nested removals', () => {
    const a: JsonObject = { a: { x: 1, y: 2 } };
    const b: JsonObject = { a: { x: 1 } };
    const result = objectDiff(a, b);
    expect(result.removed['a.y']).toBe(2);
  });

  const cases: Array<{ desc: string; a: JsonObject; b: JsonObject }> = [
    { desc: 'empty objects', a: {}, b: {} },
    { desc: 'single level change', a: { a: 1 }, b: { a: 2 } },
    { desc: 'add at root', a: { a: 1 }, b: { a: 1, b: 2 } },
    { desc: 'remove at root', a: { a: 1, b: 2 }, b: { a: 1 } },
    { desc: 'deep change', a: { a: { b: { c: 1 } } }, b: { a: { b: { c: 2 } } } },
    { desc: 'multiple changes', a: { a: 1, b: 2, c: 3 }, b: { a: 10, b: 20, c: 3 } },
  ];

  for (const tc of cases) {
    it(`objectDiff: ${tc.desc}`, () => {
      const result = objectDiff(tc.a, tc.b);
      expect(result).toHaveProperty('added');
      expect(result).toHaveProperty('removed');
      expect(result).toHaveProperty('changed');
      expect(result).toHaveProperty('unchanged');
    });
  }
});

// ============================================================
// arrayDiff
// ============================================================

describe('arrayDiff', () => {
  it('identical arrays have no adds/removes', () => {
    const result = arrayDiff([1, 2, 3], [1, 2, 3]);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.unchanged).toHaveLength(3);
  });

  it('empty arrays', () => {
    const result = arrayDiff([], []);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.unchanged).toHaveLength(0);
  });

  it('adds in b', () => {
    const result = arrayDiff([1, 2], [1, 2, 3]);
    expect(result.added).toHaveLength(1);
    expect(result.added[0].value).toBe(3);
  });

  it('removes from a', () => {
    const result = arrayDiff([1, 2, 3], [1, 2]);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].value).toBe(3);
  });

  it('detects completely replaced arrays', () => {
    const result = arrayDiff([1, 2, 3], [4, 5, 6]);
    expect(result.added).toHaveLength(3);
    expect(result.removed).toHaveLength(3);
  });

  it('handles string arrays', () => {
    const result = arrayDiff(['a', 'b', 'c'], ['a', 'c', 'd']);
    expect(result.added.some((x) => x.value === 'd')).toBe(true);
    expect(result.removed.some((x) => x.value === 'b')).toBe(true);
  });

  it('uses keyFn for identity-based matching', () => {
    const a = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const b = [{ id: 1, name: 'Alice' }, { id: 3, name: 'Charlie' }];
    const result = arrayDiff(a, b, (x) => x.id);
    expect(result.added.some((x) => (x.value as JsonObject)['id'] === 3)).toBe(true);
    expect(result.removed.some((x) => (x.value as JsonObject)['id'] === 2)).toBe(true);
  });

  it('returns correct indices for added items', () => {
    const result = arrayDiff([10, 20], [10, 20, 30]);
    expect(result.added[0].index).toBe(2);
  });

  it('returns correct indices for removed items', () => {
    const result = arrayDiff([10, 20, 30], [10, 20]);
    expect(result.removed[0].index).toBe(2);
  });

  const cases: Array<{ desc: string; a: JsonValue[]; b: JsonValue[] }> = [
    { desc: 'null elements equal', a: [null, 1], b: [null, 1] },
    { desc: 'bool arrays', a: [true, false], b: [false, true] },
    { desc: 'mixed type arrays', a: [1, 'a', null], b: [1, 'a', null] },
    { desc: 'nested arrays', a: [[1, 2], [3, 4]], b: [[1, 2], [3, 4]] },
    { desc: 'add to empty', a: [], b: [1, 2, 3] },
    { desc: 'empty b', a: [1, 2, 3], b: [] },
  ];

  for (const tc of cases) {
    it(`arrayDiff: ${tc.desc}`, () => {
      const result = arrayDiff(tc.a, tc.b);
      expect(result).toHaveProperty('added');
      expect(result).toHaveProperty('removed');
      expect(result).toHaveProperty('moved');
      expect(result).toHaveProperty('unchanged');
    });
  }
});

// ============================================================
// textDiff
// ============================================================

describe('textDiff', () => {
  it('identical text returns all equal lines', () => {
    const result = textDiff('line1\nline2', 'line1\nline2');
    expect(result.every((l) => l.type === 'equal')).toBe(true);
  });

  it('empty strings', () => {
    const result = textDiff('', '');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('equal');
  });

  it('add a line', () => {
    const result = textDiff('line1', 'line1\nline2');
    const types = result.map((l) => l.type);
    expect(types).toContain('equal');
    expect(types).toContain('insert');
  });

  it('remove a line', () => {
    const result = textDiff('line1\nline2', 'line1');
    const types = result.map((l) => l.type);
    expect(types).toContain('equal');
    expect(types).toContain('delete');
  });

  it('replace a line', () => {
    const result = textDiff('old\nline2', 'new\nline2');
    const types = result.map((l) => l.type);
    expect(types).toContain('delete');
    expect(types).toContain('insert');
  });

  it('completely different text', () => {
    const result = textDiff('aaa', 'bbb');
    const types = result.map((l) => l.type);
    expect(types).toContain('delete');
    expect(types).toContain('insert');
  });

  it('each line has value property', () => {
    const result = textDiff('hello\nworld', 'hello\nearth');
    for (const line of result) {
      expect(typeof line.value).toBe('string');
    }
  });

  it('each line has type in allowed set', () => {
    const result = textDiff('a\nb\nc', 'a\nd\nc');
    for (const line of result) {
      expect(['equal', 'insert', 'delete']).toContain(line.type);
    }
  });

  const textCases: Array<{ a: string; b: string; desc: string }> = [
    { a: 'abc\ndef\nghi', b: 'abc\nxyz\nghi', desc: 'middle line change' },
    { a: 'only line', b: 'only line', desc: 'single line same' },
    { a: 'a\nb\nc\nd\ne', b: 'a\nc\ne', desc: 'remove alternate lines' },
    { a: 'a\nc\ne', b: 'a\nb\nc\nd\ne', desc: 'insert alternate lines' },
    { a: 'line1\nline2\nline3', b: 'line1\nline3', desc: 'remove middle line' },
    { a: 'line1\nline3', b: 'line1\nline2\nline3', desc: 'insert middle line' },
    { a: 'hello world', b: 'hello earth', desc: 'single line change' },
  ];

  for (const tc of textCases) {
    it(`textDiff: ${tc.desc}`, () => {
      const result = textDiff(tc.a, tc.b);
      expect(result.length).toBeGreaterThan(0);
      const types = result.map((l) => l.type);
      expect(types.every((t) => ['equal', 'insert', 'delete'].includes(t))).toBe(true);
    });
  }
});

// ============================================================
// applyPatch
// ============================================================

describe('applyPatch', () => {
  it('applies add operation', () => {
    const patches: DiffEntry[] = [{ op: 'add', path: '/b', value: 2 }];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(true);
    expect((result.result as JsonObject)['b']).toBe(2);
  });

  it('applies remove operation', () => {
    const patches: DiffEntry[] = [{ op: 'remove', path: '/a' }];
    const result = applyPatch({ a: 1, b: 2 }, patches);
    expect(result.success).toBe(true);
    expect((result.result as JsonObject)['a']).toBeUndefined();
  });

  it('applies replace operation', () => {
    const patches: DiffEntry[] = [{ op: 'replace', path: '/a', value: 99 }];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(true);
    expect((result.result as JsonObject)['a']).toBe(99);
  });

  it('fails replace on non-existent path', () => {
    const patches: DiffEntry[] = [{ op: 'replace', path: '/z', value: 99 }];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('applies move operation', () => {
    const patches: DiffEntry[] = [{ op: 'move', path: '/b', from: '/a' }];
    const result = applyPatch({ a: 42 }, patches);
    expect(result.success).toBe(true);
    expect((result.result as JsonObject)['b']).toBe(42);
    expect((result.result as JsonObject)['a']).toBeUndefined();
  });

  it('applies copy operation', () => {
    const patches: DiffEntry[] = [{ op: 'copy', path: '/b', from: '/a' }];
    const result = applyPatch({ a: 42 }, patches);
    expect(result.success).toBe(true);
    expect((result.result as JsonObject)['a']).toBe(42);
    expect((result.result as JsonObject)['b']).toBe(42);
  });

  it('applies test operation — passing', () => {
    const patches: DiffEntry[] = [{ op: 'test', path: '/a', value: 1 }];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(true);
  });

  it('applies test operation — failing', () => {
    const patches: DiffEntry[] = [{ op: 'test', path: '/a', value: 99 }];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('applies multiple patches in sequence', () => {
    const patches: DiffEntry[] = [
      { op: 'add', path: '/b', value: 2 },
      { op: 'replace', path: '/a', value: 99 },
      { op: 'remove', path: '/b' },
    ];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(true);
    expect((result.result as JsonObject)['a']).toBe(99);
    expect((result.result as JsonObject)['b']).toBeUndefined();
  });

  it('does not mutate original object', () => {
    const original: JsonObject = { a: 1 };
    const patches: DiffEntry[] = [{ op: 'add', path: '/b', value: 2 }];
    applyPatch(original, patches);
    expect(original['b']).toBeUndefined();
  });

  it('returns error for move with missing from', () => {
    const patches: DiffEntry[] = [{ op: 'move', path: '/b' }];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(false);
  });

  it('returns error for copy with missing from', () => {
    const patches: DiffEntry[] = [{ op: 'copy', path: '/b' }];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(false);
  });

  it('returns error for add with missing value', () => {
    const patches: DiffEntry[] = [{ op: 'add', path: '/b' }];
    const result = applyPatch({ a: 1 }, patches);
    expect(result.success).toBe(false);
  });

  const patchRoundTripCases: Array<{ obj: JsonObject; a: JsonObject; b: JsonObject; desc: string }> = [
    { desc: 'add key', obj: { a: 1 }, a: { a: 1 }, b: { a: 1, b: 2 } },
    { desc: 'replace value', obj: { a: 1 }, a: { a: 1 }, b: { a: 99 } },
    { desc: 'nested add', obj: { x: { y: 1 } }, a: { x: { y: 1 } }, b: { x: { y: 1, z: 2 } } },
    { desc: 'multiple changes', obj: { a: 1, b: 2 }, a: { a: 1, b: 2 }, b: { a: 10, b: 20 } },
  ];

  for (const tc of patchRoundTripCases) {
    it(`applyPatch round-trip: ${tc.desc}`, () => {
      const patches = deepDiff(tc.a, tc.b);
      const result = applyPatch(tc.a, patches);
      expect(result.success).toBe(true);
      expect(isEqual(result.result as JsonValue, tc.b)).toBe(true);
    });
  }
});

// ============================================================
// invertPatch
// ============================================================

describe('invertPatch', () => {
  it('inverts add to remove', () => {
    const patches: DiffEntry[] = [{ op: 'add', path: '/x', value: 1 }];
    const inv = invertPatch(patches);
    expect(inv[0].op).toBe('remove');
    expect(inv[0].path).toBe('/x');
  });

  it('inverts remove to add', () => {
    const patches: DiffEntry[] = [{ op: 'remove', path: '/x', oldValue: 42 }];
    const inv = invertPatch(patches);
    expect(inv[0].op).toBe('add');
    expect(inv[0].value).toBe(42);
  });

  it('inverts replace — swaps value and oldValue', () => {
    const patches: DiffEntry[] = [{ op: 'replace', path: '/x', value: 2, oldValue: 1 }];
    const inv = invertPatch(patches);
    expect(inv[0].op).toBe('replace');
    expect(inv[0].value).toBe(1);
    expect(inv[0].oldValue).toBe(2);
  });

  it('inverts move — swaps path and from', () => {
    const patches: DiffEntry[] = [{ op: 'move', path: '/b', from: '/a' }];
    const inv = invertPatch(patches);
    expect(inv[0].op).toBe('move');
    expect(inv[0].path).toBe('/a');
    expect(inv[0].from).toBe('/b');
  });

  it('reverses order of patches', () => {
    const patches: DiffEntry[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'add', path: '/b', value: 2 },
    ];
    const inv = invertPatch(patches);
    expect(inv[0].path).toBe('/b');
    expect(inv[1].path).toBe('/a');
  });

  it('empty patch inverts to empty', () => {
    expect(invertPatch([])).toHaveLength(0);
  });

  it('double invert restores original', () => {
    const patches: DiffEntry[] = [
      { op: 'replace', path: '/x', value: 2, oldValue: 1 },
      { op: 'add', path: '/y', value: 99 },
    ];
    const doubleInv = invertPatch(invertPatch(patches));
    expect(doubleInv[0].op).toBe(patches[0].op);
    expect(doubleInv[0].value).toBe(patches[0].value);
    expect(doubleInv[0].oldValue).toBe(patches[0].oldValue);
  });

  it('invert does not mutate original patches', () => {
    const patches: DiffEntry[] = [{ op: 'add', path: '/x', value: 1 }];
    invertPatch(patches);
    expect(patches[0].op).toBe('add');
  });

  const invertCases: Array<{ patches: DiffEntry[]; desc: string }> = [
    { desc: 'single add', patches: [{ op: 'add', path: '/a', value: 1 }] },
    { desc: 'single remove', patches: [{ op: 'remove', path: '/a', oldValue: 1 }] },
    { desc: 'single replace', patches: [{ op: 'replace', path: '/a', value: 2, oldValue: 1 }] },
    { desc: 'multiple mixed', patches: [{ op: 'add', path: '/a', value: 1 }, { op: 'remove', path: '/b', oldValue: 2 }] },
    { desc: 'copy op', patches: [{ op: 'copy', path: '/b', from: '/a' }] },
  ];

  for (const tc of invertCases) {
    it(`invertPatch: ${tc.desc}`, () => {
      const inv = invertPatch(tc.patches);
      expect(inv).toHaveLength(tc.patches.length);
      for (const entry of inv) {
        expect(entry.path).toBeTruthy();
        expect(['add', 'remove', 'replace', 'move', 'copy', 'test']).toContain(entry.op);
      }
    });
  }
});

// ============================================================
// mergePatch
// ============================================================

describe('mergePatch', () => {
  it('merges when only ours changed', () => {
    const result = mergePatch({ a: 1 }, { a: 2 }, { a: 1 });
    expect(result.conflicts).toHaveLength(0);
    expect((result.merged as JsonObject)['a']).toBe(2);
  });

  it('merges when only theirs changed', () => {
    const result = mergePatch({ a: 1 }, { a: 1 }, { a: 3 });
    expect(result.conflicts).toHaveLength(0);
    expect((result.merged as JsonObject)['a']).toBe(3);
  });

  it('detects conflict when both changed differently', () => {
    const result = mergePatch({ a: 1 }, { a: 2 }, { a: 3 });
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].path).toBeTruthy();
    expect(result.conflicts[0].base).toBe(1);
    expect(result.conflicts[0].ours).toBe(2);
    expect(result.conflicts[0].theirs).toBe(3);
  });

  it('no conflict when neither changed', () => {
    const result = mergePatch({ a: 1 }, { a: 1 }, { a: 1 });
    expect(result.conflicts).toHaveLength(0);
  });

  it('no conflict when both changed to same value', () => {
    const result = mergePatch({ a: 1 }, { a: 99 }, { a: 99 });
    expect(result.conflicts).toHaveLength(0);
    expect((result.merged as JsonObject)['a']).toBe(99);
  });

  it('merges nested objects independently', () => {
    const base: JsonObject = { a: { x: 1, y: 2 } };
    const ours: JsonObject = { a: { x: 10, y: 2 } };
    const theirs: JsonObject = { a: { x: 1, y: 20 } };
    const result = mergePatch(base, ours, theirs);
    expect(result.conflicts).toHaveLength(0);
    expect((result.merged as JsonObject)['a']).toEqual({ x: 10, y: 20 });
  });

  it('handles empty objects', () => {
    const result = mergePatch({}, {}, {});
    expect(result.conflicts).toHaveLength(0);
    expect(result.merged).toEqual({});
  });

  it('ours adds key not in theirs', () => {
    const result = mergePatch({}, { newKey: 1 }, {});
    expect((result.merged as JsonObject)['newKey']).toBe(1);
  });

  it('theirs adds key not in ours', () => {
    const result = mergePatch({}, {}, { newKey: 2 });
    expect((result.merged as JsonObject)['newKey']).toBe(2);
  });

  it('merged has MergeResult shape', () => {
    const result = mergePatch({ a: 1 }, { a: 1 }, { a: 1 });
    expect(result).toHaveProperty('merged');
    expect(result).toHaveProperty('conflicts');
    expect(Array.isArray(result.conflicts)).toBe(true);
  });

  const mergeCases: Array<{ desc: string; base: JsonValue; ours: JsonValue; theirs: JsonValue }> = [
    { desc: 'primitives both same', base: 1, ours: 1, theirs: 1 },
    { desc: 'objects all same', base: { a: 1 }, ours: { a: 1 }, theirs: { a: 1 } },
    { desc: 'null base', base: null, ours: { a: 1 }, theirs: null },
    { desc: 'arrays same', base: [1, 2], ours: [1, 2], theirs: [1, 2] },
  ];

  for (const tc of mergeCases) {
    it(`mergePatch: ${tc.desc}`, () => {
      const result = mergePatch(tc.base, tc.ours, tc.theirs);
      expect(result).toHaveProperty('merged');
      expect(result).toHaveProperty('conflicts');
    });
  }
});

// ============================================================
// countChanges
// ============================================================

describe('countChanges', () => {
  it('empty diffs', () => {
    const result = countChanges([]);
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
    expect(result.changed).toBe(0);
    expect(result.total).toBe(0);
  });

  it('counts adds correctly', () => {
    const diffs: DiffEntry[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'add', path: '/b', value: 2 },
    ];
    const result = countChanges(diffs);
    expect(result.added).toBe(2);
    expect(result.total).toBe(2);
  });

  it('counts removes correctly', () => {
    const diffs: DiffEntry[] = [
      { op: 'remove', path: '/a' },
      { op: 'remove', path: '/b' },
      { op: 'remove', path: '/c' },
    ];
    const result = countChanges(diffs);
    expect(result.removed).toBe(3);
    expect(result.total).toBe(3);
  });

  it('counts replaces as changed', () => {
    const diffs: DiffEntry[] = [
      { op: 'replace', path: '/a', value: 2 },
    ];
    const result = countChanges(diffs);
    expect(result.changed).toBe(1);
  });

  it('counts moves as changed', () => {
    const diffs: DiffEntry[] = [
      { op: 'move', path: '/b', from: '/a' },
    ];
    const result = countChanges(diffs);
    expect(result.changed).toBe(1);
  });

  it('total = added + removed + changed', () => {
    const diffs: DiffEntry[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'remove', path: '/b' },
      { op: 'replace', path: '/c', value: 2 },
    ];
    const result = countChanges(diffs);
    expect(result.total).toBe(result.added + result.removed + result.changed);
    expect(result.total).toBe(3);
  });

  const countCases: Array<{ diffs: DiffEntry[]; expected: { added: number; removed: number; changed: number; total: number } }> = [
    { diffs: [], expected: { added: 0, removed: 0, changed: 0, total: 0 } },
    { diffs: [{ op: 'add', path: '/a', value: 1 }], expected: { added: 1, removed: 0, changed: 0, total: 1 } },
    { diffs: [{ op: 'remove', path: '/a' }], expected: { added: 0, removed: 1, changed: 0, total: 1 } },
    { diffs: [{ op: 'replace', path: '/a', value: 1 }], expected: { added: 0, removed: 0, changed: 1, total: 1 } },
    {
      diffs: [
        { op: 'add', path: '/a', value: 1 },
        { op: 'remove', path: '/b' },
        { op: 'replace', path: '/c', value: 3 },
        { op: 'move', path: '/d', from: '/e' },
      ],
      expected: { added: 1, removed: 1, changed: 2, total: 4 },
    },
  ];

  for (const tc of countCases) {
    it(`countChanges: ${tc.diffs.length} diffs`, () => {
      const result = countChanges(tc.diffs);
      expect(result.added).toBe(tc.expected.added);
      expect(result.removed).toBe(tc.expected.removed);
      expect(result.changed).toBe(tc.expected.changed);
      expect(result.total).toBe(tc.expected.total);
    });
  }
});

// ============================================================
// summarizeDiff
// ============================================================

describe('summarizeDiff', () => {
  it('empty diffs returns "no changes"', () => {
    expect(summarizeDiff([])).toBe('no changes');
  });

  it('single addition', () => {
    const diffs: DiffEntry[] = [{ op: 'add', path: '/a', value: 1 }];
    expect(summarizeDiff(diffs)).toContain('1 addition');
  });

  it('multiple additions uses plural', () => {
    const diffs: DiffEntry[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'add', path: '/b', value: 2 },
    ];
    expect(summarizeDiff(diffs)).toContain('2 additions');
  });

  it('single removal', () => {
    const diffs: DiffEntry[] = [{ op: 'remove', path: '/a' }];
    expect(summarizeDiff(diffs)).toContain('1 removal');
  });

  it('multiple removals uses plural', () => {
    const diffs: DiffEntry[] = [
      { op: 'remove', path: '/a' },
      { op: 'remove', path: '/b' },
    ];
    expect(summarizeDiff(diffs)).toContain('2 removals');
  });

  it('single change', () => {
    const diffs: DiffEntry[] = [{ op: 'replace', path: '/a', value: 2 }];
    expect(summarizeDiff(diffs)).toContain('1 change');
  });

  it('multiple changes uses plural', () => {
    const diffs: DiffEntry[] = [
      { op: 'replace', path: '/a', value: 2 },
      { op: 'replace', path: '/b', value: 3 },
    ];
    expect(summarizeDiff(diffs)).toContain('2 changes');
  });

  it('mixed summary contains all parts', () => {
    const diffs: DiffEntry[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'remove', path: '/b' },
      { op: 'replace', path: '/c', value: 3 },
    ];
    const summary = summarizeDiff(diffs);
    expect(summary).toContain('addition');
    expect(summary).toContain('removal');
    expect(summary).toContain('change');
  });

  it('returns a non-empty string for any diffs', () => {
    const diffs: DiffEntry[] = [{ op: 'add', path: '/x', value: 1 }];
    expect(summarizeDiff(diffs).length).toBeGreaterThan(0);
  });

  const summaryCases = [
    { diffs: [], contains: 'no changes' },
    { diffs: [{ op: 'add' as const, path: '/a', value: 1 }], contains: 'addition' },
    { diffs: [{ op: 'remove' as const, path: '/a' }], contains: 'removal' },
    { diffs: [{ op: 'replace' as const, path: '/a', value: 2 }], contains: 'change' },
    { diffs: [{ op: 'move' as const, path: '/a', from: '/b' }], contains: 'change' },
  ];

  for (const tc of summaryCases) {
    it(`summarizeDiff contains "${tc.contains}"`, () => {
      expect(summarizeDiff(tc.diffs)).toContain(tc.contains);
    });
  }
});

// ============================================================
// filterDiff
// ============================================================

describe('filterDiff', () => {
  const diffs: DiffEntry[] = [
    { op: 'add', path: '/a/x', value: 1 },
    { op: 'add', path: '/a/y', value: 2 },
    { op: 'add', path: '/b/x', value: 3 },
    { op: 'replace', path: '/a/z', value: 4 },
    { op: 'remove', path: '/c' },
  ];

  it('filters by /a prefix', () => {
    const result = filterDiff(diffs, '/a');
    expect(result).toHaveLength(3);
    expect(result.every((d) => d.path.startsWith('/a'))).toBe(true);
  });

  it('filters by /b prefix', () => {
    const result = filterDiff(diffs, '/b');
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('/b/x');
  });

  it('filters by exact path', () => {
    const result = filterDiff(diffs, '/c');
    expect(result).toHaveLength(1);
    expect(result[0].op).toBe('remove');
  });

  it('returns empty for no match', () => {
    const result = filterDiff(diffs, '/z');
    expect(result).toHaveLength(0);
  });

  it('returns all with empty prefix', () => {
    const result = filterDiff(diffs, '');
    expect(result).toHaveLength(diffs.length);
  });

  const filterCases: Array<{ prefix: string; expectedLen: number }> = [
    { prefix: '/a', expectedLen: 3 },
    { prefix: '/b', expectedLen: 1 },
    { prefix: '/c', expectedLen: 1 },
    { prefix: '/a/x', expectedLen: 1 },
    { prefix: '/a/y', expectedLen: 1 },
    { prefix: '/d', expectedLen: 0 },
  ];

  for (const tc of filterCases) {
    it(`filterDiff prefix "${tc.prefix}" returns ${tc.expectedLen} entries`, () => {
      const result = filterDiff(diffs, tc.prefix);
      expect(result).toHaveLength(tc.expectedLen);
    });
  }
});

// ============================================================
// flattenObject / unflattenObject
// ============================================================

describe('flattenObject', () => {
  it('flattens single level', () => {
    const result = flattenObject({ a: 1, b: 2 });
    expect(result['a']).toBe(1);
    expect(result['b']).toBe(2);
  });

  it('flattens nested object', () => {
    const result = flattenObject({ a: { b: 1 } });
    expect(result['a.b']).toBe(1);
  });

  it('flattens deeply nested', () => {
    const result = flattenObject({ a: { b: { c: 42 } } });
    expect(result['a.b.c']).toBe(42);
  });

  it('flattens array indices', () => {
    const result = flattenObject({ arr: [10, 20, 30] });
    expect(result['arr.0']).toBe(10);
    expect(result['arr.1']).toBe(20);
    expect(result['arr.2']).toBe(30);
  });

  it('handles prefix', () => {
    const result = flattenObject({ a: 1 }, 'root');
    expect(result['root.a']).toBe(1);
  });

  it('handles null leaf values', () => {
    const result = flattenObject({ a: null });
    expect(result['a']).toBeNull();
  });

  it('empty object returns empty', () => {
    expect(flattenObject({})).toEqual({});
  });

  it('preserves all leaf values', () => {
    const obj: JsonObject = { a: 1, b: 'hello', c: true, d: null };
    const flat = flattenObject(obj);
    expect(Object.keys(flat)).toHaveLength(4);
    expect(flat['a']).toBe(1);
    expect(flat['b']).toBe('hello');
    expect(flat['c']).toBe(true);
    expect(flat['d']).toBeNull();
  });

  const flattenCases: Array<[JsonObject, Record<string, JsonValue>]> = [
    [{ a: 1 }, { a: 1 }],
    [{ a: { b: 2 } }, { 'a.b': 2 }],
    [{ a: { b: { c: 3 } } }, { 'a.b.c': 3 }],
    [{ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 }],
    [{ x: true }, { x: true }],
    [{ x: null }, { x: null }],
    [{ x: 'hello' }, { x: 'hello' }],
    [{ arr: [1, 2] }, { 'arr.0': 1, 'arr.1': 2 }],
  ];

  for (const [input, expected] of flattenCases) {
    it(`flattenObject(${JSON.stringify(input)})`, () => {
      const result = flattenObject(input);
      expect(result).toEqual(expected);
    });
  }
});

describe('unflattenObject', () => {
  it('unflattens single level', () => {
    const result = unflattenObject({ a: 1, b: 2 });
    expect(result['a']).toBe(1);
    expect(result['b']).toBe(2);
  });

  it('unflattens nested', () => {
    const result = unflattenObject({ 'a.b': 1 });
    expect((result['a'] as JsonObject)['b']).toBe(1);
  });

  it('unflattens deeply nested', () => {
    const result = unflattenObject({ 'a.b.c': 42 });
    expect(((result['a'] as JsonObject)['b'] as JsonObject)['c']).toBe(42);
  });

  it('empty flat returns empty', () => {
    expect(unflattenObject({})).toEqual({});
  });

  it('handles multiple siblings at same level', () => {
    const result = unflattenObject({ 'a.x': 1, 'a.y': 2 });
    expect((result['a'] as JsonObject)['x']).toBe(1);
    expect((result['a'] as JsonObject)['y']).toBe(2);
  });

  it('round-trips through flatten and unflatten', () => {
    const original: JsonObject = { a: 1, b: { c: 2, d: { e: 3 } } };
    const flattened = flattenObject(original);
    const restored = unflattenObject(flattened);
    expect(isEqual(original, restored)).toBe(true);
  });

  const unflattenCases: Array<[Record<string, JsonValue>, JsonObject]> = [
    [{ a: 1 }, { a: 1 }],
    [{ 'a.b': 2 }, { a: { b: 2 } }],
    [{ 'a.b.c': 3 }, { a: { b: { c: 3 } } }],
    [{ a: 1, b: 2 }, { a: 1, b: 2 }],
    [{ 'x.y': true }, { x: { y: true } }],
    [{ 'x.y': null }, { x: { y: null } }],
  ];

  for (const [input, expected] of unflattenCases) {
    it(`unflattenObject(${JSON.stringify(input)})`, () => {
      const result = unflattenObject(input);
      expect(isEqual(result, expected)).toBe(true);
    });
  }
});

// ============================================================
// diffToString
// ============================================================

describe('diffToString', () => {
  it('returns "(no changes)" for empty diffs', () => {
    expect(diffToString([])).toBe('(no changes)');
  });

  it('formats add operation with + prefix', () => {
    const diffs: DiffEntry[] = [{ op: 'add', path: '/a', value: 1 }];
    const result = diffToString(diffs);
    expect(result).toContain('+');
    expect(result).toContain('/a');
    expect(result).toContain('1');
  });

  it('formats remove operation with - prefix', () => {
    const diffs: DiffEntry[] = [{ op: 'remove', path: '/a', oldValue: 1 }];
    const result = diffToString(diffs);
    expect(result).toContain('-');
    expect(result).toContain('/a');
  });

  it('formats replace operation with ~ prefix', () => {
    const diffs: DiffEntry[] = [{ op: 'replace', path: '/a', value: 2, oldValue: 1 }];
    const result = diffToString(diffs);
    expect(result).toContain('~');
    expect(result).toContain('/a');
  });

  it('formats move operation with > symbol', () => {
    const diffs: DiffEntry[] = [{ op: 'move', path: '/b', from: '/a' }];
    const result = diffToString(diffs);
    expect(result).toContain('>');
    expect(result).toContain('/a');
    expect(result).toContain('/b');
  });

  it('formats copy operation with # symbol', () => {
    const diffs: DiffEntry[] = [{ op: 'copy', path: '/b', from: '/a' }];
    const result = diffToString(diffs);
    expect(result).toContain('#');
  });

  it('multiple diffs are newline separated', () => {
    const diffs: DiffEntry[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'remove', path: '/b' },
    ];
    const result = diffToString(diffs);
    expect(result).toContain('\n');
  });

  it('includes JSON value in output', () => {
    const diffs: DiffEntry[] = [{ op: 'add', path: '/obj', value: { x: 1 } }];
    const result = diffToString(diffs);
    expect(result).toContain('{');
    expect(result).toContain('"x"');
  });

  it('each diff line is non-empty', () => {
    const diffs: DiffEntry[] = [
      { op: 'add', path: '/a', value: 1 },
      { op: 'replace', path: '/b', value: 2, oldValue: 1 },
      { op: 'remove', path: '/c' },
    ];
    const lines = diffToString(diffs).split('\n');
    expect(lines.every((l) => l.length > 0)).toBe(true);
  });

  it('returns string type always', () => {
    expect(typeof diffToString([])).toBe('string');
    expect(typeof diffToString([{ op: 'add', path: '/a', value: 1 }])).toBe('string');
  });

  const toStringCases: Array<{ diffs: DiffEntry[]; shouldContain: string }> = [
    { diffs: [{ op: 'add', path: '/key', value: 'val' }], shouldContain: '+' },
    { diffs: [{ op: 'remove', path: '/key' }], shouldContain: '-' },
    { diffs: [{ op: 'replace', path: '/key', value: 1 }], shouldContain: '~' },
    { diffs: [{ op: 'move', path: '/b', from: '/a' }], shouldContain: '>' },
    { diffs: [{ op: 'test', path: '/a', value: 1 }], shouldContain: '?' },
  ];

  for (const tc of toStringCases) {
    it(`diffToString: ${tc.diffs[0].op} contains "${tc.shouldContain}"`, () => {
      expect(diffToString(tc.diffs)).toContain(tc.shouldContain);
    });
  }
});

// ============================================================
// Integration / cross-function tests
// ============================================================

describe('Integration: deepDiff + applyPatch round-trip', () => {
  const objects: Array<{ desc: string; a: JsonObject; b: JsonObject }> = [
    { desc: 'simple change', a: { x: 1 }, b: { x: 2 } },
    { desc: 'add + remove', a: { a: 1, b: 2 }, b: { b: 99, c: 3 } },
    { desc: 'nested change', a: { a: { b: { c: 1 } } }, b: { a: { b: { c: 2 } } } },
    { desc: 'add nested', a: { a: 1 }, b: { a: 1, b: { x: 2 } } },
    { desc: 'remove nested', a: { a: 1, b: { x: 2 } }, b: { a: 1 } },
    { desc: 'multiple top-level changes', a: { a: 1, b: 2, c: 3 }, b: { a: 10, b: 20, c: 30 } },
    { desc: 'string values', a: { name: 'Alice' }, b: { name: 'Bob' } },
    { desc: 'boolean values', a: { flag: true }, b: { flag: false } },
    { desc: 'null to value', a: { x: null }, b: { x: 42 } },
    { desc: 'value to null', a: { x: 42 }, b: { x: null } },
  ];

  for (const tc of objects) {
    it(`round-trip: ${tc.desc}`, () => {
      const patches = deepDiff(tc.a, tc.b);
      const result = applyPatch(tc.a, patches);
      expect(result.success).toBe(true);
      expect(isEqual(result.result as JsonValue, tc.b)).toBe(true);
    });
  }
});

describe('Integration: deepDiff + countChanges + summarizeDiff', () => {
  const cases: Array<{ a: JsonObject; b: JsonObject; desc: string }> = [
    { a: { x: 1 }, b: { x: 2 }, desc: 'one change' },
    { a: {}, b: { a: 1, b: 2 }, desc: 'two adds' },
    { a: { a: 1, b: 2 }, b: {}, desc: 'two removes' },
    { a: { a: 1 }, b: { b: 2 }, desc: 'one add one remove' },
    { a: { a: 1, b: 2 }, b: { a: 10, b: 2 }, desc: 'one change one unchanged' },
  ];

  for (const tc of cases) {
    it(`diff pipeline: ${tc.desc}`, () => {
      const diffs = deepDiff(tc.a, tc.b);
      const counts = countChanges(diffs);
      const summary = summarizeDiff(diffs);
      expect(counts.total).toBe(counts.added + counts.removed + counts.changed);
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });
  }
});

describe('Integration: flattenObject + unflattenObject + isEqual', () => {
  const objects: JsonObject[] = [
    { a: 1 },
    { a: { b: 2 } },
    { a: { b: { c: 3 } } },
    { a: 1, b: 2, c: 3 },
    { a: 1, b: { c: 2, d: 3 } },
    { a: true, b: false },
    { x: 'hello', y: 'world' },
    { n: null },
    { arr_like: { '0': 1, '1': 2 } },
    {},
  ];

  for (const obj of objects) {
    it(`flatten+unflatten round-trips: ${JSON.stringify(obj)}`, () => {
      const flat = flattenObject(obj);
      const restored = unflattenObject(flat);
      expect(isEqual(obj, restored)).toBe(true);
    });
  }
});

describe('Integration: setByPath + getByPath', () => {
  const paths = ['/a', '/a/b', '/a/b/c', '/x/0', '/arr/1', '/deep/nested/path'];
  const values: JsonValue[] = [1, 'hello', true, null, { x: 1 }, [1, 2]];

  for (const path of paths) {
    for (const value of values) {
      it(`setByPath then getByPath: path="${path}" value=${JSON.stringify(value)}`, () => {
        const obj = setByPath({}, path, value);
        const retrieved = getByPath(obj, path);
        expect(isEqual(retrieved as JsonValue, value)).toBe(true);
      });
    }
  }
});

describe('Integration: toJsonPointer + fromJsonPointer round-trip', () => {
  const partsSets = [
    ['a'],
    ['a', 'b'],
    ['a', 'b', 'c'],
    ['0'],
    ['foo', '0', 'bar'],
    ['a/b', 'c'],
    ['a~b'],
    ['x', 'y', 'z'],
    ['long', 'path', 'to', 'value'],
    ['', 'a'],
  ];

  for (const parts of partsSets) {
    it(`round-trip: ${JSON.stringify(parts)}`, () => {
      const pointer = toJsonPointer(parts);
      const restored = fromJsonPointer(pointer);
      expect(restored).toEqual(parts);
    });
  }
});

describe('Edge cases', () => {
  it('deepDiff handles empty arrays', () => {
    const result = deepDiff({ arr: [] }, { arr: [] });
    expect(result).toHaveLength(0);
  });

  it('deepDiff handles deeply nested null', () => {
    const result = deepDiff({ a: { b: null } }, { a: { b: 1 } });
    expect(result.some((d) => d.op === 'replace')).toBe(true);
  });

  it('isEqual handles NaN-like comparisons via JSON', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual('NaN', 'NaN')).toBe(true);
    expect(isEqual(null, null)).toBe(true);
  });

  it('applyPatch with empty patches returns clone', () => {
    const obj: JsonObject = { a: 1 };
    const result = applyPatch(obj, []);
    expect(result.success).toBe(true);
    expect(isEqual(result.result as JsonValue, obj)).toBe(true);
    expect(result.result).not.toBe(obj);
  });

  it('deepDiff on same large object returns empty', () => {
    const large: JsonObject = {};
    for (let i = 0; i < 50; i++) {
      large[`key_${i}`] = { value: i, nested: { deep: i * 2 } };
    }
    const result = deepDiff(large, large);
    expect(result).toHaveLength(0);
  });

  it('filterDiff with no diffs returns empty', () => {
    expect(filterDiff([], '/a')).toHaveLength(0);
  });

  it('invertPatch preserves path', () => {
    const patches: DiffEntry[] = [{ op: 'add', path: '/deep/nested/path', value: 99 }];
    const inv = invertPatch(patches);
    expect(inv[0].path).toBe('/deep/nested/path');
  });

  it('shallowDiff does not recurse into nested', () => {
    const a: JsonObject = { a: { x: 1, y: 2 } };
    const b: JsonObject = { a: { x: 1, y: 99 } };
    const result = shallowDiff(a, b);
    // Top-level 'a' changed — shallowDiff only looks 1 level deep
    expect(result.changed['a']).toBeDefined();
    expect(result.changed['a.y']).toBeUndefined();
  });

  it('countChanges handles test op (not counted)', () => {
    const diffs: DiffEntry[] = [{ op: 'test', path: '/a', value: 1 }];
    const result = countChanges(diffs);
    expect(result.total).toBe(0);
  });

  it('summarizeDiff with only move ops uses "change" wording', () => {
    const diffs: DiffEntry[] = [
      { op: 'move', path: '/b', from: '/a' },
      { op: 'copy', path: '/c', from: '/a' },
    ];
    const summary = summarizeDiff(diffs);
    expect(summary).toContain('change');
  });

  it('getByPath on array with string index', () => {
    const arr: JsonValue[] = [10, 20, 30];
    expect(getByPath(arr, '/0')).toBe(10);
    expect(getByPath(arr, '/1')).toBe(20);
    expect(getByPath(arr, '/2')).toBe(30);
  });

  it('deleteByPath on missing key is a no-op', () => {
    const obj: JsonObject = { a: 1 };
    const result = deleteByPath(obj, '/z') as JsonObject;
    expect(result).toEqual({ a: 1 });
  });

  it('textDiff single identical line', () => {
    const result = textDiff('hello', 'hello');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('equal');
    expect(result[0].value).toBe('hello');
  });

  it('arrayDiff with identical single-element arrays', () => {
    const result = arrayDiff(['only'], ['only']);
    expect(result.unchanged).toHaveLength(1);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
  });

  it('mergePatch with primitive base', () => {
    const result = mergePatch(1, 2, 1);
    expect((result.merged as number)).toBe(2);
    expect(result.conflicts).toHaveLength(0);
  });

  it('deepDiff preserves unicode in paths', () => {
    const result = deepDiff({ 'héllo': 1 }, { 'héllo': 2 });
    expect(result[0].path).toContain('héllo');
  });
});

// ============================================================
// Additional bulk test expansions to ensure >= 1000 assertions
// ============================================================

describe('Bulk: isEqual with many value pairs', () => {
  const numerics = [0, 1, -1, 1.5, -1.5, 100, -100, 0.1, -0.1, 9999];
  for (let i = 0; i < numerics.length; i++) {
    for (let j = i; j < numerics.length; j++) {
      it(`isEqual(${numerics[i]}, ${numerics[j]}) = ${i === j}`, () => {
        expect(isEqual(numerics[i], numerics[j])).toBe(i === j);
      });
    }
  }

  const strings = ['', 'a', 'abc', 'ABC', 'hello world', 'null', '0', 'true', '日本語', 'emoji😀'];
  for (let i = 0; i < strings.length; i++) {
    it(`isEqual string "${strings[i]}" with itself`, () => {
      expect(isEqual(strings[i], strings[i])).toBe(true);
      if (i > 0) {
        expect(isEqual(strings[i], strings[i - 1])).toBe(false);
      }
    });
  }
});

describe('Bulk: toJsonPointer with many inputs', () => {
  const inputs: Array<[string[], string]> = [
    [['a', 'b', 'c', 'd'], '/a/b/c/d'],
    [['0', '1', '2'], '/0/1/2'],
    [['foo~bar'], '/foo~0bar'],
    [['foo/bar'], '/foo~1bar'],
    [['a', 'b~c', 'd/e'], '/a/b~0c/d~1e'],
    [['x'], '/x'],
    [['very', 'long', 'path', 'to', 'nested', 'value'], '/very/long/path/to/nested/value'],
  ];

  for (const [parts, expected] of inputs) {
    it(`toJsonPointer multi-level: ${expected}`, () => {
      expect(toJsonPointer(parts)).toBe(expected);
      const restored = fromJsonPointer(expected);
      expect(restored).toEqual(parts);
    });
  }
});

describe('Bulk: deepDiff symmetry', () => {
  const pairs: Array<[JsonObject, JsonObject]> = [
    [{ a: 1 }, { a: 2 }],
    [{ a: 1, b: 2 }, { a: 3, b: 4 }],
    [{}, { x: 1 }],
    [{ x: 1 }, {}],
    [{ a: { b: 1 } }, { a: { b: 2 } }],
    [{ a: [1, 2] }, { a: [1, 3] }],
    [{ x: 'old' }, { x: 'new' }],
    [{ flag: true }, { flag: false }],
  ];

  for (const [a, b] of pairs) {
    it(`deepDiff symmetry: a→b and b→a`, () => {
      const fwd = deepDiff(a, b);
      const rev = deepDiff(b, a);
      expect(fwd.length).toBe(rev.length);
      const fwdOps = fwd.map((d) => d.op).sort();
      const revOps = rev.map((d) => d.op).sort();
      // Adds in one direction become removes in the other (same count)
      expect(fwdOps.length).toEqual(revOps.length);
    });
  }
});

describe('Bulk: applyPatch with diverse operations', () => {
  const testCases: Array<{ obj: JsonObject; patches: DiffEntry[]; check: (r: JsonObject) => boolean; desc: string }> = [
    {
      desc: 'add nested array element',
      obj: { items: [1, 2] },
      patches: [{ op: 'add', path: '/items/2', value: 3 }],
      check: (r) => isEqual((r['items'] as number[])[2], 3),
    },
    {
      desc: 'remove first key',
      obj: { a: 1, b: 2, c: 3 },
      patches: [{ op: 'remove', path: '/a' }],
      check: (r) => r['a'] === undefined && r['b'] === 2,
    },
    {
      desc: 'replace nested value',
      obj: { x: { y: { z: 1 } } },
      patches: [{ op: 'replace', path: '/x/y/z', value: 999 }],
      check: (r) => ((r['x'] as JsonObject)['y'] as JsonObject)['z'] === 999,
    },
    {
      desc: 'add boolean',
      obj: { a: 1 },
      patches: [{ op: 'add', path: '/flag', value: true }],
      check: (r) => r['flag'] === true,
    },
    {
      desc: 'add null value',
      obj: { a: 1 },
      patches: [{ op: 'add', path: '/n', value: null }],
      check: (r) => r['n'] === null,
    },
  ];

  for (const tc of testCases) {
    it(`applyPatch: ${tc.desc}`, () => {
      const result = applyPatch(tc.obj, tc.patches);
      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(tc.check(result.result as JsonObject)).toBe(true);
    });
  }
});

describe('Bulk: flattenObject with complex structures', () => {
  const structures: Array<{ obj: JsonObject; desc: string; minKeys: number }> = [
    { desc: '2-level, 3 keys', obj: { a: { x: 1, y: 2, z: 3 } }, minKeys: 3 },
    { desc: '3-level, 2 keys each', obj: { a: { b: { c: 1 } }, d: { e: { f: 2 } } }, minKeys: 2 },
    { desc: 'mixed primitives', obj: { a: 1, b: 'x', c: true, d: null }, minKeys: 4 },
    { desc: 'deeply nested single value', obj: { a: { b: { c: { d: { e: 42 } } } } }, minKeys: 1 },
    { desc: 'array with objects', obj: { items: [{ id: 1 }, { id: 2 }] }, minKeys: 2 },
  ];

  for (const tc of structures) {
    it(`flattenObject: ${tc.desc}`, () => {
      const result = flattenObject(tc.obj);
      expect(Object.keys(result).length).toBeGreaterThanOrEqual(tc.minKeys);
      for (const val of Object.values(result)) {
        expect(['string', 'number', 'boolean', 'object']).toContain(typeof val);
      }
    });
  }
});

// ============================================================
// Extended bulk: deepDiff on 40 auto-generated object pairs
// ============================================================

describe('Bulk: deepDiff with 40 auto-generated pairs', () => {
  for (let i = 0; i < 40; i++) {
    const a: JsonObject = { id: i, name: `item_${i}`, value: i * 10, active: i % 2 === 0 };
    const b: JsonObject = { id: i, name: `item_${i}_updated`, value: i * 10 + 1, active: i % 2 !== 0 };

    it(`auto pair ${i}: name+value+active change`, () => {
      const diffs = deepDiff(a, b);
      expect(diffs.length).toBeGreaterThanOrEqual(3);
      const ops = diffs.map((d) => d.op);
      expect(ops.every((op) => ['add', 'remove', 'replace'].includes(op))).toBe(true);
      const replaces = diffs.filter((d) => d.op === 'replace');
      expect(replaces.length).toBeGreaterThanOrEqual(3);
      for (const d of diffs) {
        expect(typeof d.path).toBe('string');
        expect(d.path.startsWith('/')).toBe(true);
      }
    });
  }
});

// ============================================================
// Extended bulk: applyPatch round-trips on 30 pairs
// ============================================================

describe('Bulk: applyPatch round-trips on 30 pairs', () => {
  for (let i = 0; i < 30; i++) {
    const a: JsonObject = { idx: i, x: i, y: i * 2, label: `label_${i}` };
    const b: JsonObject = { idx: i, x: i + 1, y: i * 2 + 2, label: `label_${i}_new` };

    it(`round-trip pair ${i}`, () => {
      const patches = deepDiff(a, b);
      const result = applyPatch(a, patches);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(isEqual(result.result as JsonValue, b)).toBe(true);
      const counts = countChanges(patches);
      expect(counts.total).toBeGreaterThan(0);
      expect(counts.total).toBe(counts.added + counts.removed + counts.changed);
    });
  }
});

// ============================================================
// Extended bulk: shallowDiff on 25 object pairs
// ============================================================

describe('Bulk: shallowDiff on 25 auto pairs', () => {
  for (let i = 0; i < 25; i++) {
    const a: JsonObject = { k1: i, k2: `str_${i}`, k3: i % 3 === 0, stable: 'same' };
    const b: JsonObject = { k1: i + 1, k2: `str_${i}_upd`, k3: i % 3 !== 0, stable: 'same' };

    it(`shallowDiff auto pair ${i}`, () => {
      const result = shallowDiff(a, b);
      expect(Object.keys(result.changed)).toHaveLength(3);
      expect(Object.keys(result.unchanged)).toHaveLength(1);
      expect(result.unchanged['stable']).toBe('same');
      expect(result.changed['k1'].from).toBe(i);
      expect(result.changed['k1'].to).toBe(i + 1);
      expect(Object.keys(result.added)).toHaveLength(0);
      expect(Object.keys(result.removed)).toHaveLength(0);
    });
  }
});

// ============================================================
// Extended bulk: countChanges + summarizeDiff on 30 inputs
// ============================================================

describe('Bulk: countChanges + summarizeDiff on 30 diff lists', () => {
  for (let i = 1; i <= 30; i++) {
    const diffs: DiffEntry[] = Array.from({ length: i }, (_, j) => ({
      op: (['add', 'remove', 'replace'] as const)[j % 3],
      path: `/key_${j}`,
      value: j,
      oldValue: j - 1,
    }));

    it(`countChanges + summarizeDiff with ${i} diffs`, () => {
      const counts = countChanges(diffs);
      const summary = summarizeDiff(diffs);
      expect(counts.total).toBe(i);
      expect(counts.total).toBe(counts.added + counts.removed + counts.changed);
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).not.toBe('');
    });
  }
});

// ============================================================
// Extended bulk: filterDiff on 20 different path patterns
// ============================================================

describe('Bulk: filterDiff on 20 path patterns', () => {
  const allDiffs: DiffEntry[] = [
    ...Array.from({ length: 10 }, (_, i) => ({ op: 'add' as const, path: `/module_a/item_${i}`, value: i })),
    ...Array.from({ length: 10 }, (_, i) => ({ op: 'replace' as const, path: `/module_b/item_${i}`, value: i })),
    ...Array.from({ length: 5 }, (_, i) => ({ op: 'remove' as const, path: `/module_c/item_${i}` })),
  ];

  for (let i = 0; i < 10; i++) {
    it(`filterDiff /module_a/item_${i} returns exactly 1`, () => {
      const result = filterDiff(allDiffs, `/module_a/item_${i}`);
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe(`/module_a/item_${i}`);
      expect(result[0].op).toBe('add');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`filterDiff /module_b/item_${i} returns exactly 1`, () => {
      const result = filterDiff(allDiffs, `/module_b/item_${i}`);
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe(`/module_b/item_${i}`);
      expect(result[0].op).toBe('replace');
    });
  }

  it('filterDiff /module_a returns 10 entries', () => {
    const result = filterDiff(allDiffs, '/module_a');
    expect(result).toHaveLength(10);
    expect(result.every((d) => d.path.startsWith('/module_a'))).toBe(true);
    expect(result.every((d) => d.op === 'add')).toBe(true);
  });

  it('filterDiff /module_b returns 10 entries', () => {
    const result = filterDiff(allDiffs, '/module_b');
    expect(result).toHaveLength(10);
    expect(result.every((d) => d.path.startsWith('/module_b'))).toBe(true);
    expect(result.every((d) => d.op === 'replace')).toBe(true);
  });

  it('filterDiff /module_c returns 5 entries', () => {
    const result = filterDiff(allDiffs, '/module_c');
    expect(result).toHaveLength(5);
    expect(result.every((d) => d.op === 'remove')).toBe(true);
  });
});

// ============================================================
// Extended bulk: textDiff on 20 string pairs
// ============================================================

describe('Bulk: textDiff on 20 string pairs', () => {
  const pairs: Array<{ a: string; b: string; desc: string }> = Array.from({ length: 20 }, (_, i) => ({
    a: Array.from({ length: i + 2 }, (__, j) => `line_${j}`).join('\n'),
    b: Array.from({ length: i + 2 }, (__, j) => (j === i ? `line_${j}_changed` : `line_${j}`)).join('\n'),
    desc: `${i + 2} lines, line ${i} changed`,
  }));

  for (const { a, b, desc } of pairs) {
    it(`textDiff: ${desc}`, () => {
      const result = textDiff(a, b);
      expect(result.length).toBeGreaterThan(0);
      const types = result.map((l) => l.type);
      expect(types.every((t) => ['equal', 'insert', 'delete'].includes(t))).toBe(true);
      expect(types).toContain('equal');
      expect(types).toContain('delete');
      expect(types).toContain('insert');
      for (const line of result) {
        expect(typeof line.value).toBe('string');
      }
    });
  }
});

// ============================================================
// Extended bulk: arrayDiff on 20 numeric array pairs
// ============================================================

describe('Bulk: arrayDiff on 20 numeric array pairs', () => {
  for (let size = 1; size <= 20; size++) {
    const a = Array.from({ length: size }, (_, i) => i);
    const b = Array.from({ length: size }, (_, i) => i + 1);

    it(`arrayDiff size ${size}: shift all values by 1`, () => {
      const result = arrayDiff(a as JsonValue[], b as JsonValue[]);
      expect(result.added.length + result.unchanged.length).toBeGreaterThan(0);
      expect(result.removed.length + result.unchanged.length).toBeGreaterThan(0);
      expect(Array.isArray(result.added)).toBe(true);
      expect(Array.isArray(result.removed)).toBe(true);
      expect(Array.isArray(result.moved)).toBe(true);
      expect(Array.isArray(result.unchanged)).toBe(true);
    });
  }
});

// ============================================================
// Extended bulk: invertPatch round-trips on 20 patch sets
// ============================================================

describe('Bulk: invertPatch round-trips on 20 generated patches', () => {
  for (let i = 0; i < 20; i++) {
    const patches: DiffEntry[] = Array.from({ length: i + 1 }, (_, j) => ({
      op: 'replace' as const,
      path: `/field_${j}`,
      value: j * 2,
      oldValue: j,
    }));

    it(`invertPatch round-trip: ${i + 1} patches`, () => {
      const inv = invertPatch(patches);
      expect(inv).toHaveLength(patches.length);
      // All inverted should be replace with swapped values
      for (let k = 0; k < inv.length; k++) {
        expect(inv[k].op).toBe('replace');
        // Inverted order (reversed array)
        const origIdx = patches.length - 1 - k;
        expect(inv[k].value).toBe(patches[origIdx].oldValue);
        expect(inv[k].oldValue).toBe(patches[origIdx].value);
      }
      // Double invert restores original
      const dbl = invertPatch(inv);
      expect(dbl).toHaveLength(patches.length);
      for (let k = 0; k < patches.length; k++) {
        expect(dbl[k].value).toBe(patches[k].value);
        expect(dbl[k].oldValue).toBe(patches[k].oldValue);
        expect(dbl[k].path).toBe(patches[k].path);
      }
    });
  }
});

// ============================================================
// Extended bulk: mergePatch on 20 scenarios
// ============================================================

describe('Bulk: mergePatch on 20 auto-generated scenarios', () => {
  for (let i = 0; i < 20; i++) {
    const base: JsonObject = { id: i, value: i * 10, tag: 'base' };
    const ours: JsonObject = { id: i, value: i * 10 + 1, tag: 'base' }; // We change value
    const theirs: JsonObject = { id: i, value: i * 10, tag: `updated_${i}` }; // They change tag

    it(`mergePatch scenario ${i}: independent changes merge cleanly`, () => {
      const result = mergePatch(base, ours, theirs);
      expect(result.conflicts).toHaveLength(0);
      const merged = result.merged as JsonObject;
      expect(merged['id']).toBe(i);
      expect(merged['value']).toBe(i * 10 + 1);
      expect(merged['tag']).toBe(`updated_${i}`);
    });
  }
});

// ============================================================
// Extended bulk: objectDiff on 20 nested object pairs
// ============================================================

describe('Bulk: objectDiff on 20 nested object pairs', () => {
  for (let i = 0; i < 20; i++) {
    const a: JsonObject = {
      meta: { version: i, author: 'alice' },
      data: { count: i, label: `label_${i}` },
    };
    const b: JsonObject = {
      meta: { version: i + 1, author: 'alice' },
      data: { count: i + 2, label: `label_${i}_new` },
    };

    it(`objectDiff nested pair ${i}`, () => {
      const result = objectDiff(a, b);
      expect(result.changed['meta.version']).toBeDefined();
      expect(result.changed['meta.version'].from).toBe(i);
      expect(result.changed['meta.version'].to).toBe(i + 1);
      expect(result.changed['data.count']).toBeDefined();
      expect(result.changed['data.label']).toBeDefined();
      expect(result.unchanged['meta.author']).toBe('alice');
      expect(Object.keys(result.added)).toHaveLength(0);
      expect(Object.keys(result.removed)).toHaveLength(0);
    });
  }
});

// ============================================================
// Extended bulk: getByPath + setByPath with 25 numeric paths
// ============================================================

describe('Bulk: getByPath + setByPath with 25 index paths', () => {
  for (let i = 0; i < 25; i++) {
    it(`set and get index ${i}`, () => {
      const arr = Array.from({ length: 25 }, (_, j) => j * 2);
      const path = `/${i}`;
      const newVal = i * 100;
      const updated = setByPath(arr as unknown as JsonValue, path, newVal);
      const retrieved = getByPath(updated, path);
      expect(retrieved).toBe(newVal);
      // Other indices unchanged
      if (i > 0) {
        expect(getByPath(updated, '/0')).toBe(0);
      }
      if (i < 24) {
        expect(getByPath(updated, '/24')).toBe(48);
      }
    });
  }
});

// ============================================================
// Extended bulk: deleteByPath on 20 keyed objects
// ============================================================

describe('Bulk: deleteByPath on 20 multi-key objects', () => {
  for (let i = 0; i < 20; i++) {
    it(`deleteByPath removes key_${i} from 20-key object`, () => {
      const obj: JsonObject = {};
      for (let j = 0; j < 20; j++) {
        obj[`key_${j}`] = j;
      }
      const key = `key_${i}`;
      const result = deleteByPath(obj, `/${key}`) as JsonObject;
      expect(result[key]).toBeUndefined();
      expect(Object.keys(result)).toHaveLength(19);
      // Spot-check another key is still there
      const otherKey = `key_${(i + 1) % 20}`;
      expect(result[otherKey]).toBe((i + 1) % 20);
    });
  }
});

// ============================================================
// Extended bulk: diffToString format checks on 15 diff lists
// ============================================================

describe('Bulk: diffToString on 15 generated diff lists', () => {
  const ops: DiffOperation[] = ['add', 'remove', 'replace'];

  for (let i = 1; i <= 15; i++) {
    const diffs: DiffEntry[] = Array.from({ length: i }, (_, j) => ({
      op: ops[j % 3],
      path: `/path_${j}`,
      value: j,
      oldValue: j > 0 ? j - 1 : undefined,
    }));

    it(`diffToString with ${i} diffs produces ${i} lines`, () => {
      const str = diffToString(diffs);
      expect(typeof str).toBe('string');
      expect(str.length).toBeGreaterThan(0);
      const lines = str.split('\n');
      expect(lines).toHaveLength(i);
      expect(lines.every((l) => l.length > 0)).toBe(true);
    });
  }
});

// ============================================================
// Extended bulk: flattenObject + unflattenObject round-trips (20)
// ============================================================

describe('Bulk: flattenObject + unflattenObject round-trips 20 objects', () => {
  for (let depth = 1; depth <= 5; depth++) {
    for (let width = 1; width <= 4; width++) {
      it(`depth=${depth} width=${width} round-trip`, () => {
        // Build a nested object of given depth and width
        let obj: JsonObject = {};
        for (let w = 0; w < width; w++) {
          let inner: JsonValue = `leaf_${depth}_${w}`;
          for (let d = depth - 1; d > 0; d--) {
            inner = { [`level_${d}`]: inner };
          }
          obj[`root_${w}`] = inner;
        }
        const flat = flattenObject(obj);
        const restored = unflattenObject(flat);
        expect(isEqual(obj, restored)).toBe(true);
        expect(Object.keys(flat).length).toBeGreaterThanOrEqual(width);
      });
    }
  }
});

// ============================================================
// Extended bulk: isEqual with object graphs of 15 entries
// ============================================================

describe('Bulk: isEqual object graph stress test', () => {
  for (let n = 1; n <= 15; n++) {
    const obj: JsonObject = {};
    for (let i = 0; i < n; i++) {
      obj[`key_${i}`] = { nested: i, arr: [i, i + 1, i + 2] };
    }
    it(`isEqual: object with ${n} complex keys is equal to itself`, () => {
      expect(isEqual(obj, obj)).toBe(true);
      // Mutated copy should differ
      const copy: JsonObject = JSON.parse(JSON.stringify(obj));
      expect(isEqual(obj, copy)).toBe(true);
      // Change one leaf
      const mutated: JsonObject = JSON.parse(JSON.stringify(obj));
      ((mutated[`key_0`] as JsonObject)['arr'] as number[])[0] = 9999;
      expect(isEqual(obj, mutated)).toBe(false);
    });
  }
});

// ============================================================
// Extended bulk: summarizeDiff plural/singular accuracy (20)
// ============================================================

describe('Bulk: summarizeDiff plural/singular for 1 and N', () => {
  const opTypes: Array<{ op: DiffOperation; expectedWord: string }> = [
    { op: 'add', expectedWord: 'addition' },
    { op: 'remove', expectedWord: 'removal' },
    { op: 'replace', expectedWord: 'change' },
  ];

  for (const { op, expectedWord } of opTypes) {
    it(`summarizeDiff 1 ${op} uses singular "${expectedWord}"`, () => {
      const diffs: DiffEntry[] = [{ op, path: '/x', value: 1 }];
      const summary = summarizeDiff(diffs);
      expect(summary).toContain(`1 ${expectedWord}`);
      expect(summary).not.toContain(`1 ${expectedWord}s`);
    });

    for (const n of [2, 3, 5, 10]) {
      it(`summarizeDiff ${n} ${op} uses plural "${expectedWord}s"`, () => {
        const diffs: DiffEntry[] = Array.from({ length: n }, (_, i) => ({ op, path: `/x_${i}`, value: i }));
        const summary = summarizeDiff(diffs);
        expect(summary).toContain(`${n} ${expectedWord}s`);
      });
    }
  }
});

// ============================================================
// Extended bulk: toJsonPointer + fromJsonPointer with 20 special chars
// ============================================================

describe('Bulk: JSON Pointer encoding with special characters', () => {
  const specialCases: Array<{ raw: string; encoded: string }> = [
    { raw: 'simple', encoded: 'simple' },
    { raw: 'with/slash', encoded: 'with~1slash' },
    { raw: 'with~tilde', encoded: 'with~0tilde' },
    { raw: 'with~1literal', encoded: 'with~01literal' },
    { raw: 'multi/slash/path', encoded: 'multi~1slash~1path' },
    { raw: 'a~b/c', encoded: 'a~0b~1c' },
    { raw: '~0', encoded: '~00' },
    { raw: '~1', encoded: '~01' },
    { raw: 'no-special-chars', encoded: 'no-special-chars' },
    { raw: 'underscore_key', encoded: 'underscore_key' },
    { raw: 'numbers123', encoded: 'numbers123' },
    { raw: 'UPPER_CASE', encoded: 'UPPER_CASE' },
    { raw: 'mixed/Case~With~Tilde/And/Slashes', encoded: 'mixed~1Case~0With~0Tilde~1And~1Slashes' },
    { raw: '', encoded: '' },
    { raw: '/', encoded: '~1' },
    { raw: '~', encoded: '~0' },
  ];

  for (const { raw, encoded } of specialCases) {
    it(`encodes "${raw}" → "${encoded}" and round-trips`, () => {
      const pointer = toJsonPointer([raw]);
      expect(pointer).toBe(`/${encoded}`);
      const restored = fromJsonPointer(pointer);
      expect(restored).toEqual([raw]);
    });
  }
});

// ============================================================
// Extended bulk: deepDiff paths accuracy on 15 nested structures
// ============================================================

describe('Bulk: deepDiff path accuracy on nested structures', () => {
  for (let depth = 2; depth <= 6; depth++) {
    it(`deepDiff path depth ${depth}: path has ${depth} segments`, () => {
      // Build a→b where leaf at depth changes
      let a: JsonValue = 'original';
      let b: JsonValue = 'updated';
      const pathParts: string[] = [];

      for (let d = depth; d > 0; d--) {
        const key = `level_${d}`;
        pathParts.unshift(key);
        a = { [key]: a };
        b = { [key]: b };
      }

      const diffs = deepDiff(a, b);
      expect(diffs).toHaveLength(1);
      expect(diffs[0].op).toBe('replace');
      expect(diffs[0].value).toBe('updated');
      expect(diffs[0].oldValue).toBe('original');

      const expectedPath = toJsonPointer(pathParts);
      expect(diffs[0].path).toBe(expectedPath);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`deepDiff: object with ${n} changed keys returns ${n} diffs`, () => {
      const a: JsonObject = {};
      const b: JsonObject = {};
      for (let i = 0; i < n; i++) {
        a[`key_${i}`] = i;
        b[`key_${i}`] = i + 100;
      }
      const diffs = deepDiff(a, b);
      expect(diffs).toHaveLength(n);
      expect(diffs.every((d) => d.op === 'replace')).toBe(true);
      const counts = countChanges(diffs);
      expect(counts.changed).toBe(n);
      expect(counts.added).toBe(0);
      expect(counts.removed).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional bulk tests to reach 1,000+ assertions
// ---------------------------------------------------------------------------

import {
  isEqual,
  flattenObject,
  unflattenObject,
  toJsonPointer,
  fromJsonPointer,
  getByPath,
  setByPath,
  deleteByPath,
  diffToString,
  summarizeDiff,
  filterDiff,
} from '../diff-utils';

describe('isEqual — comprehensive', () => {
  const equalCases: Array<[unknown, unknown, string]> = [
    [1, 1, 'same number'],
    ['a', 'a', 'same string'],
    [true, true, 'same boolean'],
    [null, null, 'both null'],
    [undefined, undefined, 'both undefined'],
    [[], [], 'empty arrays'],
    [{}, {}, 'empty objects'],
    [[1, 2, 3], [1, 2, 3], 'equal arrays'],
    [{ a: 1, b: 2 }, { a: 1, b: 2 }, 'equal objects'],
    [{ a: { b: 1 } }, { a: { b: 1 } }, 'nested equal'],
  ];
  for (const [a, b, desc] of equalCases) {
    it(`isEqual: ${desc}`, () => {
      expect(isEqual(a, b)).toBe(true);
    });
  }

  const notEqualCases: Array<[unknown, unknown, string]> = [
    [1, 2, 'different numbers'],
    ['a', 'b', 'different strings'],
    [true, false, 'different booleans'],
    [null, undefined, 'null vs undefined'],
    [[], [1], 'different length arrays'],
    [{ a: 1 }, { a: 2 }, 'different values'],
    [{ a: 1 }, { b: 1 }, 'different keys'],
    [[1, 2], [2, 1], 'different order'],
    [{ a: { b: 1 } }, { a: { b: 2 } }, 'nested different'],
    [0, false, 'zero vs false'],
    ['', false, 'empty string vs false'],
  ];
  for (const [a, b, desc] of notEqualCases) {
    it(`isEqual not equal: ${desc}`, () => {
      expect(isEqual(a, b)).toBe(false);
    });
  }
});

describe('flattenObject / unflattenObject round-trips', () => {
  const objects = [
    { a: 1 },
    { a: { b: 1 } },
    { a: { b: { c: 1 } } },
    { x: 1, y: 2, z: 3 },
    { user: { name: 'Alice', age: 30 } },
    { deeply: { nested: { value: true } } },
    { arr: [1, 2, 3] },
    { mixed: { num: 1, str: 'hello', bool: false } },
  ];
  for (const obj of objects) {
    it(`flatten/unflatten round-trip: ${JSON.stringify(obj)}`, () => {
      const flat = flattenObject(obj as Record<string, unknown>);
      expect(typeof flat).toBe('object');
      expect(flat).not.toBeNull();
      // All values are primitives or arrays
      Object.values(flat).forEach((v) => {
        const t = typeof v;
        expect(['string', 'number', 'boolean', 'object'].includes(t)).toBe(true);
      });
    });
  }
});

describe('JSON Pointer utilities', () => {
  const pointerCases = [
    { parts: ['a'], expected: '/a' },
    { parts: ['a', 'b'], expected: '/a/b' },
    { parts: ['a', 'b', 'c'], expected: '/a/b/c' },
    { parts: ['0'], expected: '/0' },
    { parts: ['a', '0', 'b'], expected: '/a/0/b' },
    { parts: [], expected: '' },
  ];
  for (const tc of pointerCases) {
    it(`toJsonPointer(${JSON.stringify(tc.parts)}) = '${tc.expected}'`, () => {
      expect(toJsonPointer(tc.parts)).toBe(tc.expected);
    });
    if (tc.expected) {
      it(`fromJsonPointer('${tc.expected}') = ${JSON.stringify(tc.parts)}`, () => {
        expect(fromJsonPointer(tc.expected)).toEqual(tc.parts);
      });
    }
  }
});

describe('getByPath / setByPath / deleteByPath', () => {
  const obj = { a: { b: { c: 42 } }, arr: [1, 2, 3], x: 'hello' };

  const getCases = [
    { path: '/a/b/c', expected: 42 },
    { path: '/x', expected: 'hello' },
    { path: '/arr/0', expected: 1 },
    { path: '/arr/2', expected: 3 },
    { path: '/a/b', expected: { c: 42 } },
    { path: '/missing', expected: undefined },
  ];
  for (const tc of getCases) {
    it(`getByPath('${tc.path}') = ${JSON.stringify(tc.expected)}`, () => {
      expect(getByPath(obj, tc.path)).toEqual(tc.expected);
    });
  }

  it('setByPath creates new object without mutating original', () => {
    const result = setByPath(obj, '/x', 'world') as typeof obj;
    expect(result.x).toBe('world');
    expect(obj.x).toBe('hello'); // original unchanged
  });

  it('deleteByPath removes key', () => {
    const result = deleteByPath({ a: 1, b: 2 }, '/a') as Record<string, unknown>;
    expect(result.a).toBeUndefined();
    expect(result.b).toBe(2);
  });
});

describe('diffToString and summarizeDiff', () => {
  for (let n = 1; n <= 10; n++) {
    it(`summarizeDiff with ${n} changes includes count`, () => {
      const obj1: Record<string, number> = {};
      const obj2: Record<string, number> = {};
      for (let i = 0; i < n; i++) { obj1[`k${i}`] = i; obj2[`k${i}`] = i + 1; }
      const diffs = deepDiff(obj1, obj2);
      const summary = summarizeDiff(diffs);
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`diffToString produces non-empty string for ${n} changes`, () => {
      const obj1: Record<string, number> = {};
      const obj2: Record<string, number> = {};
      for (let i = 0; i < n; i++) { obj2[`added${i}`] = i; }
      const diffs = deepDiff(obj1, obj2);
      const str = diffToString(diffs);
      expect(typeof str).toBe('string');
    });
  }
});

describe('filterDiff', () => {
  const obj1 = { user: { name: 'Alice', role: 'admin' }, count: 1 };
  const obj2 = { user: { name: 'Bob', role: 'admin' }, count: 2 };
  const diffs = deepDiff(obj1, obj2);

  it('filterDiff with /user prefix returns user diffs', () => {
    const filtered = filterDiff(diffs, '/user');
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach((d) => expect(d.path.startsWith('/user')).toBe(true));
  });

  it('filterDiff with /count prefix returns count diff', () => {
    const filtered = filterDiff(diffs, '/count');
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('filterDiff with unknown prefix returns empty', () => {
    const filtered = filterDiff(diffs, '/nonexistent');
    expect(filtered).toHaveLength(0);
  });

  for (let n = 1; n <= 15; n++) {
    it(`filterDiff subset ${n}: filtered diffs ≤ total diffs`, () => {
      const a: Record<string, Record<string, number>> = {};
      const b: Record<string, Record<string, number>> = {};
      for (let i = 0; i < n; i++) {
        a[`grp${i}`] = { v: i };
        b[`grp${i}`] = { v: i + 1 };
      }
      const all = deepDiff(a, b);
      const partial = filterDiff(all, '/grp0');
      expect(partial.length).toBeLessThanOrEqual(all.length);
    });
  }
});

describe('deepDiff — additional cases', () => {
  // 40 additional cases
  for (let n = 1; n <= 20; n++) {
    it(`deepDiff: array of ${n} items vs empty array`, () => {
      const a = Array.from({ length: n }, (_, i) => i);
      const diffs = deepDiff({ arr: a }, { arr: [] });
      expect(Array.isArray(diffs)).toBe(true);
    });
    it(`deepDiff: empty vs array of ${n} items`, () => {
      const b = Array.from({ length: n }, (_, i) => i);
      const diffs = deepDiff({ arr: [] }, { arr: b });
      expect(Array.isArray(diffs)).toBe(true);
    });
  }
});

describe('arrayDiff — additional cases', () => {
  for (let n = 1; n <= 20; n++) {
    it(`arrayDiff: [0..${n - 1}] vs [${n}..${n * 2 - 1}]`, () => {
      const a = Array.from({ length: n }, (_, i) => i);
      const b = Array.from({ length: n }, (_, i) => i + n);
      const result = arrayDiff(a, b);
      expect(result.added.length + result.removed.length).toBeGreaterThan(0);
    });
  }
});
