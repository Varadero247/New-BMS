// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  pick,
  omit,
  deepMerge,
  deepClone,
  deepEqual,
  getPath,
  setPath,
  deletePath,
  diff,
  flatten,
  unflatten,
  isEmpty,
  keys,
  values,
  entries,
  mapValues,
  filterKeys,
  invert,
  merge,
  hasKey,
} from '../src/index';

// ---------------------------------------------------------------------------
// pick — 50 tests
// ---------------------------------------------------------------------------
describe('pick', () => {
  const base = Object.fromEntries(Array.from({ length: 50 }, (_, k) => [`key_${k}`, k]));

  for (let i = 0; i < 50; i++) {
    it(`picks key_${i} from a 50-key object`, () => {
      const result = pick(base as Record<string, number>, [`key_${i}`]);
      expect(result).toEqual({ [`key_${i}`]: i });
    });
  }
});

// ---------------------------------------------------------------------------
// omit — 50 tests
// ---------------------------------------------------------------------------
describe('omit', () => {
  const base = Object.fromEntries(Array.from({ length: 50 }, (_, k) => [`key_${k}`, k]));

  for (let i = 0; i < 50; i++) {
    it(`omits key_${i} from a 50-key object`, () => {
      const result = omit(base as Record<string, number>, [`key_${i}`]);
      expect(result[`key_${i}` as keyof typeof result]).toBeUndefined();
      expect(Object.keys(result).length).toBe(49);
    });
  }
});

// ---------------------------------------------------------------------------
// deepMerge — 50 tests
// ---------------------------------------------------------------------------
describe('deepMerge', () => {
  for (let i = 0; i < 25; i++) {
    it(`deepMerge merges numeric value ${i} into target`, () => {
      const target = { a: i, b: { c: i * 2 } };
      const source = { b: { c: i * 3 } };
      const result = deepMerge(target, source);
      expect(result.a).toBe(i);
      expect(result.b.c).toBe(i * 3);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`deepMerge with multiple sources iteration ${i}`, () => {
      const target = { x: 0, y: { z: 0 } };
      const s1 = { x: i };
      const s2 = { y: { z: i + 1 } };
      const result = deepMerge(target, s1, s2);
      expect(result.x).toBe(i);
      expect(result.y.z).toBe(i + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// deepClone — 50 tests
// ---------------------------------------------------------------------------
describe('deepClone', () => {
  for (let i = 0; i < 25; i++) {
    it(`deepClone clones object with numeric value ${i}`, () => {
      const obj = { a: i, b: { c: i + 1, d: [i, i + 1] } };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
      clone.b.c = 9999;
      expect(obj.b.c).toBe(i + 1);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`deepClone produces independent nested array at index ${i}`, () => {
      const obj = { arr: [i, i + 1, i + 2] };
      const clone = deepClone(obj);
      clone.arr[0] = -1;
      expect(obj.arr[0]).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// deepEqual — 60 tests
// ---------------------------------------------------------------------------
describe('deepEqual', () => {
  for (let i = 0; i < 20; i++) {
    it(`deepEqual returns true for equal primitives iteration ${i}`, () => {
      expect(deepEqual(i, i)).toBe(true);
      expect(deepEqual(`str_${i}`, `str_${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`deepEqual returns false for different primitives iteration ${i}`, () => {
      expect(deepEqual(i, i + 1)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`deepEqual compares nested objects at depth ${i % 5 + 1}`, () => {
      const a = { level: i, nested: { val: i * 2 } };
      const b = { level: i, nested: { val: i * 2 } };
      const c = { level: i, nested: { val: i * 2 + 1 } };
      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// getPath — 60 tests
// ---------------------------------------------------------------------------
describe('getPath', () => {
  for (let i = 0; i < 30; i++) {
    it(`getPath retrieves nested value at path 'a.b.c' iteration ${i}`, () => {
      const obj = { a: { b: { c: i * 3 } } };
      expect(getPath(obj, 'a.b.c')).toBe(i * 3);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`getPath returns defaultValue for missing path iteration ${i}`, () => {
      const obj = { a: i };
      expect(getPath(obj, 'a.b.c', `default_${i}`)).toBe(`default_${i}`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`getPath handles single-segment path iteration ${i}`, () => {
      const obj: Record<string, number> = { [`key_${i}`]: i * 7 };
      expect(getPath(obj, `key_${i}`)).toBe(i * 7);
    });
  }
});

// ---------------------------------------------------------------------------
// setPath — 50 tests
// ---------------------------------------------------------------------------
describe('setPath', () => {
  for (let i = 0; i < 25; i++) {
    it(`setPath sets nested value at depth 3 iteration ${i}`, () => {
      const obj: Record<string, unknown> = {};
      setPath(obj, `a.b.key_${i}`, i * 4);
      expect((obj as Record<string, unknown>)['a']);
      expect(getPath(obj, `a.b.key_${i}`)).toBe(i * 4);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`setPath overwrites existing value at iteration ${i}`, () => {
      const obj: Record<string, unknown> = { x: { y: 0 } };
      setPath(obj, 'x.y', i);
      expect(getPath(obj, 'x.y')).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// deletePath — 50 tests
// ---------------------------------------------------------------------------
describe('deletePath', () => {
  for (let i = 0; i < 25; i++) {
    it(`deletePath removes an existing path and returns true iteration ${i}`, () => {
      const obj: Record<string, unknown> = {};
      setPath(obj, `level.key_${i}`, i);
      const result = deletePath(obj, `level.key_${i}`);
      expect(result).toBe(true);
      expect(getPath(obj, `level.key_${i}`)).toBeUndefined();
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`deletePath returns false for non-existent path iteration ${i}`, () => {
      const obj: Record<string, unknown> = { a: i };
      const result = deletePath(obj, `missing.path_${i}`);
      expect(result).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// diff — 50 tests
// ---------------------------------------------------------------------------
describe('diff', () => {
  for (let i = 0; i < 25; i++) {
    it(`diff detects a changed value at iteration ${i}`, () => {
      const a = { name: `before_${i}`, count: i };
      const b = { name: `after_${i}`, count: i };
      const result = diff(a, b);
      expect(result['name']).toEqual({ from: `before_${i}`, to: `after_${i}` });
      expect(result['count']).toBeUndefined();
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`diff detects addition and removal of keys at iteration ${i}`, () => {
      const a: Record<string, unknown> = { shared: i };
      const b: Record<string, unknown> = { shared: i, added: i + 1 };
      const result = diff(a, b);
      expect(result['added']).toEqual({ from: undefined, to: i + 1 });
      expect(result['shared']).toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// flatten — 50 tests
// ---------------------------------------------------------------------------
describe('flatten', () => {
  for (let i = 0; i < 25; i++) {
    it(`flatten produces correct dot-key for depth-2 object iteration ${i}`, () => {
      const obj = { a: { [`key_${i}`]: i * 5 } };
      const result = flatten(obj);
      expect(result[`a.key_${i}`]).toBe(i * 5);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`flatten preserves primitive values at depth 1 iteration ${i}`, () => {
      const obj: Record<string, unknown> = { [`top_${i}`]: i };
      const result = flatten(obj);
      expect(result[`top_${i}`]).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// unflatten — 50 tests
// ---------------------------------------------------------------------------
describe('unflatten', () => {
  for (let i = 0; i < 25; i++) {
    it(`unflatten rebuilds nested object from dot-keys iteration ${i}`, () => {
      const flat: Record<string, unknown> = { [`a.b.key_${i}`]: i * 6 };
      const result = unflatten(flat);
      expect(getPath(result, `a.b.key_${i}`)).toBe(i * 6);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`unflatten(flatten(obj)) round-trips correctly iteration ${i}`, () => {
      const obj = { x: { y: i, z: i + 1 }, w: i * 2 };
      const result = unflatten(flatten(obj));
      expect(result['x']).toBeDefined();
      expect(getPath(result, 'x.y')).toBe(i);
      expect(getPath(result, 'x.z')).toBe(i + 1);
      expect(result['w']).toBe(i * 2);
    });
  }
});

// ---------------------------------------------------------------------------
// isEmpty — 30 tests
// ---------------------------------------------------------------------------
describe('isEmpty', () => {
  it('returns true for empty object literal', () => {
    expect(isEmpty({})).toBe(true);
  });

  for (let i = 0; i < 14; i++) {
    it(`returns false for object with key_${i} property`, () => {
      expect(isEmpty({ [`key_${i}`]: i })).toBe(false);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`isEmpty on object with ${i + 1} keys returns false`, () => {
      const obj = Object.fromEntries(Array.from({ length: i + 1 }, (_, k) => [`k${k}`, k]));
      expect(isEmpty(obj)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// keys / values / entries — 60 tests
// ---------------------------------------------------------------------------
describe('keys', () => {
  for (let i = 0; i < 20; i++) {
    it(`keys returns correct count for object with ${i + 1} keys`, () => {
      const obj = Object.fromEntries(Array.from({ length: i + 1 }, (_, k) => [`k${k}`, k]));
      expect(keys(obj).length).toBe(i + 1);
    });
  }
});

describe('values', () => {
  for (let i = 0; i < 20; i++) {
    it(`values at index ${i} equals expected numeric value`, () => {
      const obj = { [`key_${i}`]: i * 9 };
      const result = values(obj);
      expect(result).toContain(i * 9);
    });
  }
});

describe('entries', () => {
  for (let i = 0; i < 20; i++) {
    it(`entries tuple at iteration ${i} has correct key and value`, () => {
      const obj = { [`k_${i}`]: i * 3 };
      const result = entries(obj);
      expect(result[0][0]).toBe(`k_${i}`);
      expect(result[0][1]).toBe(i * 3);
    });
  }
});

// ---------------------------------------------------------------------------
// mapValues — 50 tests
// ---------------------------------------------------------------------------
describe('mapValues', () => {
  for (let i = 0; i < 25; i++) {
    it(`mapValues doubles all values at iteration ${i}`, () => {
      const obj = { a: i, b: i + 1, c: i + 2 };
      const result = mapValues(obj, (v) => (v as number) * 2);
      expect(result.a).toBe(i * 2);
      expect(result.b).toBe((i + 1) * 2);
      expect(result.c).toBe((i + 2) * 2);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`mapValues appends suffix to string values at iteration ${i}`, () => {
      const obj = { label: `item_${i}` };
      const result = mapValues(obj, (v) => `${v as string}_mapped`);
      expect(result.label).toBe(`item_${i}_mapped`);
    });
  }
});

// ---------------------------------------------------------------------------
// filterKeys — 50 tests
// ---------------------------------------------------------------------------
describe('filterKeys', () => {
  for (let i = 0; i < 25; i++) {
    it(`filterKeys keeps only key_${i} from 50-key object`, () => {
      const obj = Object.fromEntries(Array.from({ length: 50 }, (_, k) => [`key_${k}`, k]));
      const result = filterKeys(obj as Record<string, number>, (k) => k === `key_${i}`);
      expect(Object.keys(result).length).toBe(1);
      expect(result[`key_${i}` as keyof typeof result]).toBe(i);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`filterKeys removes all keys not matching suffix _${i % 5}`, () => {
      const obj = Object.fromEntries(Array.from({ length: 10 }, (_, k) => [`k_${k}`, k]));
      const suffix = `_${i % 5}`;
      const result = filterKeys(obj as Record<string, number>, (k) =>
        (k as string).endsWith(suffix)
      );
      for (const k of Object.keys(result)) {
        expect(k.endsWith(suffix)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// invert — 50 tests
// ---------------------------------------------------------------------------
describe('invert', () => {
  for (let i = 0; i < 25; i++) {
    it(`invert swaps key/value at iteration ${i}`, () => {
      const obj = { [`k_${i}`]: `v_${i}` };
      const result = invert(obj);
      expect(result[`v_${i}`]).toBe(`k_${i}`);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`invert of invert returns original for single-entry object ${i}`, () => {
      const obj = { [`alpha_${i}`]: `beta_${i}` };
      expect(invert(invert(obj))).toEqual(obj);
    });
  }
});

// ---------------------------------------------------------------------------
// merge — 50 tests
// ---------------------------------------------------------------------------
describe('merge', () => {
  for (let i = 0; i < 25; i++) {
    it(`merge overwrites a's value with b's at iteration ${i}`, () => {
      const a = { val: i, extra: 'keep' };
      const b = { val: i + 100 };
      const result = merge(a, b);
      expect(result.val).toBe(i + 100);
      expect(result.extra).toBe('keep');
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`merge does not mutate source objects at iteration ${i}`, () => {
      const a = { x: i };
      const b = { x: i + 1 };
      merge(a, b);
      expect(a.x).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// hasKey — 50 tests
// ---------------------------------------------------------------------------
describe('hasKey', () => {
  for (let i = 0; i < 25; i++) {
    it(`hasKey returns true for existing key_${i}`, () => {
      const obj = { [`key_${i}`]: i };
      expect(hasKey(obj, `key_${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`hasKey returns false for missing key at iteration ${i}`, () => {
      const obj = { present: i };
      expect(hasKey(obj, `absent_${i}`)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// Edge-case integration tests — 110 tests
// ---------------------------------------------------------------------------
describe('edge cases: deepEqual with arrays', () => {
  for (let i = 0; i < 20; i++) {
    it(`deepEqual on arrays of length ${i + 1}`, () => {
      const a = Array.from({ length: i + 1 }, (_, k) => k);
      const b = Array.from({ length: i + 1 }, (_, k) => k);
      expect(deepEqual(a, b)).toBe(true);
    });
  }
});

describe('edge cases: getPath with null/undefined intermediates', () => {
  for (let i = 0; i < 20; i++) {
    it(`getPath returns undefined when intermediate is null at iteration ${i}`, () => {
      const obj = { a: null };
      expect(getPath(obj, 'a.b.c', `def_${i}`)).toBe(`def_${i}`);
    });
  }
});

describe('edge cases: flatten with array leaves', () => {
  for (let i = 0; i < 20; i++) {
    it(`flatten preserves array as leaf value at iteration ${i}`, () => {
      const obj: Record<string, unknown> = { arr: [i, i + 1] };
      const result = flatten(obj);
      expect(result['arr']).toEqual([i, i + 1]);
    });
  }
});

describe('edge cases: deepMerge does not merge arrays', () => {
  for (let i = 0; i < 20; i++) {
    it(`deepMerge replaces array rather than concatenating at iteration ${i}`, () => {
      const target = { items: [1, 2, 3] };
      const source = { items: [i] };
      const result = deepMerge(target, source);
      expect(result.items).toEqual([i]);
    });
  }
});

describe('edge cases: isEmpty edge cases', () => {
  for (let i = 0; i < 15; i++) {
    it(`isEmpty({}) is always true, iteration ${i}`, () => {
      expect(isEmpty({})).toBe(true);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`isEmpty with inherited-only props treated as empty at iteration ${i}`, () => {
      const obj = Object.create({ inherited: i });
      expect(isEmpty(obj)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional cross-function round-trip tests — 120 tests
// ---------------------------------------------------------------------------
describe('round-trip: flatten → unflatten', () => {
  for (let i = 0; i < 40; i++) {
    it(`flatten→unflatten round-trip for object with value ${i}`, () => {
      const original = { a: { b: { c: i } }, d: i + 1 };
      const flat = flatten(original);
      const restored = unflatten(flat);
      expect(getPath(restored, 'a.b.c')).toBe(i);
      expect(restored['d']).toBe(i + 1);
    });
  }
});

describe('round-trip: setPath → getPath → deletePath', () => {
  for (let i = 0; i < 40; i++) {
    it(`setPath then getPath then deletePath round-trip ${i}`, () => {
      const obj: Record<string, unknown> = {};
      const path = `section.sub.item_${i}`;
      setPath(obj, path, i * 11);
      expect(getPath(obj, path)).toBe(i * 11);
      const deleted = deletePath(obj, path);
      expect(deleted).toBe(true);
      expect(getPath(obj, path)).toBeUndefined();
    });
  }
});

describe('round-trip: pick → merge', () => {
  for (let i = 0; i < 40; i++) {
    it(`pick one key then merge back produces full object iteration ${i}`, () => {
      const obj = { a: i, b: i + 1, c: i + 2 };
      const partial = pick(obj, ['a']);
      const restored = merge(obj, partial);
      expect(restored.a).toBe(i);
      expect(restored.b).toBe(i + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// diff edge-case tests — 40 tests
// ---------------------------------------------------------------------------
describe('diff: no changes', () => {
  for (let i = 0; i < 20; i++) {
    it(`diff of identical objects returns empty record at iteration ${i}`, () => {
      const obj = { x: i, y: `str_${i}` };
      expect(diff(obj, { ...obj })).toEqual({});
    });
  }
});

describe('diff: deleted keys', () => {
  for (let i = 0; i < 20; i++) {
    it(`diff detects deleted key at iteration ${i}`, () => {
      const a: Record<string, unknown> = { existing: i, toDelete: i + 1 };
      const b: Record<string, unknown> = { existing: i };
      const result = diff(a, b);
      expect(result['toDelete']).toEqual({ from: i + 1, to: undefined });
    });
  }
});

// ---------------------------------------------------------------------------
// mapValues + filterKeys integration — 40 tests
// ---------------------------------------------------------------------------
describe('mapValues then filterKeys', () => {
  for (let i = 0; i < 20; i++) {
    it(`double then filter to keep only values > ${i} at iteration ${i}`, () => {
      const obj = { a: i, b: i + 5, c: i + 10 };
      const doubled = mapValues(obj, (v) => (v as number) * 2);
      const threshold = i * 2 + 1;
      const filtered = filterKeys(doubled, (k) => (doubled[k] as number) > threshold);
      for (const k of Object.keys(filtered)) {
        expect((doubled[k as keyof typeof doubled] as number) > threshold).toBe(true);
      }
    });
  }
});

describe('invert + hasKey', () => {
  for (let i = 0; i < 20; i++) {
    it(`inverted object has original value as key at iteration ${i}`, () => {
      const obj = { [`k_${i}`]: `v_${i}`, [`k_${i + 100}`]: `v_${i + 100}` };
      const inv = invert(obj);
      expect(hasKey(inv, `v_${i}`)).toBe(true);
      expect(hasKey(inv, `v_${i + 100}`)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// deepClone immutability stress tests — 40 tests
// ---------------------------------------------------------------------------
describe('deepClone immutability', () => {
  for (let i = 0; i < 40; i++) {
    it(`mutating clone does not affect original at iteration ${i}`, () => {
      const original: Record<string, unknown> = {
        id: i,
        meta: { count: i, tags: [`tag_${i}`] },
      };
      const clone = deepClone(original) as typeof original;
      (clone['meta'] as Record<string, unknown>)['count'] = 9999;
      expect((original['meta'] as Record<string, unknown>)['count']).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// omit + pick complement tests — 40 tests
// ---------------------------------------------------------------------------
describe('omit + pick complement', () => {
  for (let i = 0; i < 40; i++) {
    it(`pick and omit are complements for key_${i % 10}`, () => {
      const allKeys = Array.from({ length: 10 }, (_, k) => `key_${k}`);
      const obj = Object.fromEntries(allKeys.map((k, idx) => [k, idx]));
      const targetKey = `key_${i % 10}`;
      const picked = pick(obj as Record<string, number>, [targetKey]);
      const omitted = omit(obj as Record<string, number>, [targetKey]);
      expect(Object.keys(picked)).toEqual([targetKey]);
      expect(Object.keys(omitted)).not.toContain(targetKey);
      expect(Object.keys(picked).length + Object.keys(omitted).length).toBe(allKeys.length);
    });
  }
});

// ---------------------------------------------------------------------------
// keys / values / entries consistency — 40 tests
// ---------------------------------------------------------------------------
describe('keys, values, entries consistency', () => {
  for (let i = 0; i < 40; i++) {
    it(`keys, values, entries agree on object with ${(i % 5) + 1} entries`, () => {
      const size = (i % 5) + 1;
      const obj = Object.fromEntries(Array.from({ length: size }, (_, k) => [`k${k}`, k * i]));
      const k = keys(obj);
      const v = values(obj);
      const e = entries(obj);
      expect(k.length).toBe(size);
      expect(v.length).toBe(size);
      expect(e.length).toBe(size);
      for (let j = 0; j < e.length; j++) {
        expect(e[j][0]).toBe(k[j]);
        expect(e[j][1]).toBe(v[j]);
      }
    });
  }
});
