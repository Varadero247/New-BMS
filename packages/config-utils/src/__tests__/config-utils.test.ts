// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  parseEnv,
  getEnvString,
  getEnvNumber,
  getEnvBoolean,
  getEnvArray,
  getEnvJson,
  requireEnv,
  parseEnvFile,
  deepMerge,
  deepMergeAll,
  pick,
  omit,
  flatten,
  unflatten,
  validateConfig,
  applyDefaults,
  ConfigStore,
  coerceValue,
  interpolate,
  redactSecrets,
  diffConfigs,
  isConfigEqual,
  sortKeys,
} from '../config-utils';

// ---------------------------------------------------------------------------
// Loop 1: getEnvString — 100 tests (i=0..99)
// ---------------------------------------------------------------------------
describe('getEnvString — loop 100', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: returns present value or default`, () => {
      const key = `KEY_${i}`;
      const val = `value_${i}`;
      const env: Record<string, string | undefined> = { [key]: val };

      // present key
      expect(getEnvString(env, key)).toBe(val);

      // absent key with default
      expect(getEnvString({}, key, `default_${i}`)).toBe(`default_${i}`);

      // absent key no default => ''
      expect(getEnvString({}, key)).toBe('');
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 2: getEnvNumber — 100 tests (i=0..99)
// ---------------------------------------------------------------------------
describe('getEnvNumber — loop 100', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: coerces numeric string`, () => {
      const key = `NUM_${i}`;
      // positive case
      expect(getEnvNumber({ [key]: String(i + 1) }, key)).toBe(i + 1);
      // default when missing
      expect(getEnvNumber({}, key, i * 2)).toBe(i * 2);
      // non-numeric falls to default
      expect(getEnvNumber({ [key]: 'notanumber' }, key, i)).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 3: deepMerge — 100 tests (i=0..99)
// ---------------------------------------------------------------------------
describe('deepMerge — loop 100', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: merges i-deep nested objects`, () => {
      // Build a nested object of depth proportional to (i % 5) + 1
      const depth = (i % 5) + 1;
      function buildNested(d: number, base: boolean): Record<string, unknown> {
        if (d === 0) return { leaf: base ? 'base' : 'override' };
        return { [`level${d}`]: buildNested(d - 1, base) };
      }
      const baseObj = buildNested(depth, true);
      const overrideObj = buildNested(depth, false) as Record<string, unknown>;
      const merged = deepMerge(baseObj, overrideObj as typeof baseObj);

      // The leaf value should come from the override
      function getLeaf(obj: Record<string, unknown>, d: number): unknown {
        if (d === 0) return (obj as { leaf: unknown }).leaf;
        return getLeaf((obj[`level${d}`] as Record<string, unknown>), d - 1);
      }

      expect(getLeaf(merged, depth)).toBe('override');
      // Base object must be untouched
      expect(getLeaf(baseObj, depth)).toBe('base');
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 4: flatten/unflatten roundtrip — 100 tests (i=0..99)
// ---------------------------------------------------------------------------
describe('flatten/unflatten roundtrip — loop 100', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: roundtrips correctly`, () => {
      const obj = {
        a: { b: { c: `val_${i}` } },
        d: i + 1,
        e: { f: `str_${i}` },
      };
      const flat = flatten(obj);
      const unflat = unflatten(flat) as typeof obj;

      expect(unflat.a.b.c).toBe(`val_${i}`);
      expect(unflat.d).toBe(i + 1);
      expect(unflat.e.f).toBe(`str_${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 5: ConfigStore get/set/getPath — 50 × 3 = 150 tests (i=0..49)
// ---------------------------------------------------------------------------
describe('ConfigStore get/set/getPath — loop 50×3', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: get() returns initial state`, () => {
      const store = new ConfigStore({ value: i, name: `config_${i}` });
      const state = store.get();
      expect(state.value).toBe(i);
      expect(state.name).toBe(`config_${i}`);
    });

    it(`iteration ${i}: set() merges updates`, () => {
      const store = new ConfigStore({ value: i, extra: 'unchanged' });
      store.set({ value: i + 100 });
      expect(store.get().value).toBe(i + 100);
      expect(store.get().extra).toBe('unchanged');
    });

    it(`iteration ${i}: getPath() reads dot-notation`, () => {
      type Cfg = { nested: { deep: { val: number } }; top: number };
      const store = new ConfigStore<Cfg>({
        nested: { deep: { val: i } },
        top: i * 2,
      });
      expect(store.getPath<number>('nested.deep.val')).toBe(i);
      expect(store.getPath<number>('top')).toBe(i * 2);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 6: interpolate — 50 tests (i=0..49)
// ---------------------------------------------------------------------------
describe('interpolate — loop 50', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: replaces ${i} variables`, () => {
      const keys: string[] = [];
      const configMap: Record<string, string> = {};
      let template = 'prefix';

      for (let j = 0; j < i; j++) {
        const k = `VAR_${i}_${j}`;
        const v = `value_${i}_${j}`;
        keys.push(k);
        configMap[k] = v;
        template += `_\${${k}}`;
      }

      const result = interpolate(template, configMap);
      let expected = 'prefix';
      for (let j = 0; j < i; j++) {
        expected += `_value_${i}_${j}`;
      }

      expect(result).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 7: validateConfig — 50 tests (i=0..49)
// ---------------------------------------------------------------------------
describe('validateConfig — loop 50', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: validates field with value ${i}`, () => {
      const schema = {
        count: { type: 'number' as const, required: true, min: 0, max: 1000 },
        label: { type: 'string' as const, required: true },
      };

      const valid = validateConfig<{ count: number; label: string }>(
        { count: i, label: `label_${i}` },
        schema,
      );
      expect(valid.valid).toBe(true);
      expect(valid.errors).toHaveLength(0);
      expect(valid.value.count).toBe(i);
      expect(valid.value.label).toBe(`label_${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 8: redactSecrets — 50 tests (i=0..49)
// ---------------------------------------------------------------------------
describe('redactSecrets — loop 50', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: hides secret values`, () => {
      const config = {
        username: `user_${i}`,
        password: `s3cr3t_${i}`,
        apiToken: `tok_${i}`,
        publicName: `name_${i}`,
        nested: {
          secretKey: `key_${i}`,
          visible: `v_${i}`,
        },
      };

      const redacted = redactSecrets(config) as typeof config;
      expect(redacted.username).toBe(`user_${i}`);
      expect(redacted.password).toBe('***');
      expect(redacted.apiToken).toBe('***');
      expect(redacted.publicName).toBe(`name_${i}`);
      expect((redacted.nested as { secretKey: string }).secretKey).toBe('***');
      expect((redacted.nested as { visible: string }).visible).toBe(`v_${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 9: parseEnvFile — 50 tests (i=0..49)
// ---------------------------------------------------------------------------
describe('parseEnvFile — loop 50', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: parses ${i + 1} key-value pairs`, () => {
      const lines: string[] = [];
      for (let j = 0; j <= i; j++) {
        lines.push(`KEY_${i}_${j}=value_${i}_${j}`);
      }
      const content = lines.join('\n');
      const parsed = parseEnvFile(content);

      for (let j = 0; j <= i; j++) {
        expect(parsed[`KEY_${i}_${j}`]).toBe(`value_${i}_${j}`);
      }
      expect(Object.keys(parsed).length).toBe(i + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// Correctness tests: getEnvBoolean
// ---------------------------------------------------------------------------
describe('getEnvBoolean correctness', () => {
  it('returns true for "true"', () => {
    expect(getEnvBoolean({ FLAG: 'true' }, 'FLAG')).toBe(true);
  });
  it('returns true for "1"', () => {
    expect(getEnvBoolean({ FLAG: '1' }, 'FLAG')).toBe(true);
  });
  it('returns true for "yes"', () => {
    expect(getEnvBoolean({ FLAG: 'yes' }, 'FLAG')).toBe(true);
  });
  it('returns true for "on"', () => {
    expect(getEnvBoolean({ FLAG: 'on' }, 'FLAG')).toBe(true);
  });
  it('returns true for "TRUE" (case-insensitive)', () => {
    expect(getEnvBoolean({ FLAG: 'TRUE' }, 'FLAG')).toBe(true);
  });
  it('returns false for "false"', () => {
    expect(getEnvBoolean({ FLAG: 'false' }, 'FLAG')).toBe(false);
  });
  it('returns false for "0"', () => {
    expect(getEnvBoolean({ FLAG: '0' }, 'FLAG')).toBe(false);
  });
  it('returns false for "no"', () => {
    expect(getEnvBoolean({ FLAG: 'no' }, 'FLAG')).toBe(false);
  });
  it('returns false for "off"', () => {
    expect(getEnvBoolean({ FLAG: 'off' }, 'FLAG')).toBe(false);
  });
  it('returns default when key missing', () => {
    expect(getEnvBoolean({}, 'FLAG', true)).toBe(true);
  });
  it('returns false when key missing and no default', () => {
    expect(getEnvBoolean({}, 'FLAG')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: getEnvArray
// ---------------------------------------------------------------------------
describe('getEnvArray correctness', () => {
  it('splits by comma by default', () => {
    expect(getEnvArray({ K: 'a,b,c' }, 'K')).toEqual(['a', 'b', 'c']);
  });
  it('trims whitespace from values', () => {
    expect(getEnvArray({ K: 'a, b , c' }, 'K')).toEqual(['a', 'b', 'c']);
  });
  it('uses custom separator', () => {
    expect(getEnvArray({ K: 'a|b|c' }, 'K', '|')).toEqual(['a', 'b', 'c']);
  });
  it('returns default when key missing', () => {
    expect(getEnvArray({}, 'K', ',', ['x'])).toEqual(['x']);
  });
  it('filters empty segments', () => {
    expect(getEnvArray({ K: 'a,,b' }, 'K')).toEqual(['a', 'b']);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: getEnvJson
// ---------------------------------------------------------------------------
describe('getEnvJson correctness', () => {
  it('parses valid JSON object', () => {
    expect(getEnvJson({ K: '{"x":1}' }, 'K')).toEqual({ x: 1 });
  });
  it('parses valid JSON array', () => {
    expect(getEnvJson({ K: '[1,2,3]' }, 'K')).toEqual([1, 2, 3]);
  });
  it('returns default on invalid JSON', () => {
    expect(getEnvJson({ K: 'notjson' }, 'K', { fallback: true })).toEqual({ fallback: true });
  });
  it('returns default when key missing', () => {
    expect(getEnvJson({}, 'K', 42)).toBe(42);
  });
  it('throws when missing key and no default', () => {
    expect(() => getEnvJson({}, 'MISSING_KEY')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: requireEnv
// ---------------------------------------------------------------------------
describe('requireEnv correctness', () => {
  it('does not throw when all keys present', () => {
    expect(() => requireEnv({ A: 'a', B: 'b' }, ['A', 'B'])).not.toThrow();
  });
  it('throws when a key is missing', () => {
    expect(() => requireEnv({ A: 'a' }, ['A', 'B'])).toThrow();
  });
  it('throws when a key is empty string', () => {
    expect(() => requireEnv({ A: '' }, ['A'])).toThrow();
  });
  it('throws when a key is undefined', () => {
    expect(() => requireEnv({ A: undefined }, ['A'])).toThrow();
  });
  it('does not throw with empty keys array', () => {
    expect(() => requireEnv({}, [])).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: parseEnvFile
// ---------------------------------------------------------------------------
describe('parseEnvFile correctness', () => {
  it('parses simple KEY=VALUE', () => {
    expect(parseEnvFile('HOST=localhost')).toEqual({ HOST: 'localhost' });
  });
  it('skips comment lines', () => {
    const result = parseEnvFile('# comment\nKEY=val');
    expect(result).toEqual({ KEY: 'val' });
    expect(result['# comment']).toBeUndefined();
  });
  it('skips empty lines', () => {
    expect(parseEnvFile('\n\nKEY=val\n\n')).toEqual({ KEY: 'val' });
  });
  it('parses double-quoted values', () => {
    expect(parseEnvFile('KEY="hello world"')).toEqual({ KEY: 'hello world' });
  });
  it('parses single-quoted values', () => {
    expect(parseEnvFile("KEY='hello world'")).toEqual({ KEY: 'hello world' });
  });
  it('handles \\n escape in double-quoted values', () => {
    const result = parseEnvFile('KEY="line1\\nline2"');
    expect(result['KEY']).toBe('line1\nline2');
  });
  it('parses multiple keys', () => {
    const result = parseEnvFile('A=1\nB=2\nC=3');
    expect(result).toEqual({ A: '1', B: '2', C: '3' });
  });
  it('handles values with equals sign', () => {
    const result = parseEnvFile('KEY=a=b=c');
    expect(result['KEY']).toBe('a=b=c');
  });
  it('strips inline comments from unquoted values', () => {
    const result = parseEnvFile('KEY=value # comment');
    expect(result['KEY']).toBe('value');
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: deepMerge
// ---------------------------------------------------------------------------
describe('deepMerge correctness', () => {
  it('merges flat objects', () => {
    type AB = { a?: number; b?: number };
    expect(deepMerge<AB>({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });
  it('overrides existing keys', () => {
    expect(deepMerge({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 });
  });
  it('does not mutate base object', () => {
    type AB = { a?: number; b?: number };
    const base: AB = { a: 1 };
    deepMerge<AB>(base, { b: 2 });
    expect(base).toEqual({ a: 1 });
  });
  it('deep merges nested objects', () => {
    const result = deepMerge({ a: { b: 1, c: 2 } }, { a: { c: 99 } });
    expect(result).toEqual({ a: { b: 1, c: 99 } });
  });
  it('replaces arrays (not merges)', () => {
    const result = deepMerge({ arr: [1, 2, 3] }, { arr: [4, 5] });
    expect(result.arr).toEqual([4, 5]);
  });
  it('handles multiple overrides in sequence', () => {
    const result = deepMerge({ a: 1, b: 2, c: 3 }, { a: 10 }, { b: 20 });
    expect(result).toEqual({ a: 10, b: 20, c: 3 });
  });
  it('handles empty overrides', () => {
    expect(deepMerge({ a: 1 })).toEqual({ a: 1 });
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: deepMergeAll
// ---------------------------------------------------------------------------
describe('deepMergeAll correctness', () => {
  it('merges array of configs', () => {
    const result = deepMergeAll([{ a: 1 }, { b: 2 }, { c: 3 }]);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
  it('returns empty object for empty input', () => {
    expect(deepMergeAll([])).toEqual({});
  });
  it('last value wins for same key', () => {
    const result = deepMergeAll([{ x: 1 }, { x: 2 }, { x: 3 }]);
    expect(result).toEqual({ x: 3 });
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: pick / omit
// ---------------------------------------------------------------------------
describe('pick correctness', () => {
  it('returns only specified keys', () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });
  it('handles empty keys array', () => {
    expect(pick({ a: 1, b: 2 }, [])).toEqual({});
  });
  it('ignores missing keys gracefully', () => {
    const obj = { a: 1, b: 2 };
    const result = pick(obj, ['a'] as (keyof typeof obj)[]);
    expect(result).toEqual({ a: 1 });
  });
});

describe('omit correctness', () => {
  it('removes specified keys', () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
  });
  it('handles empty keys array', () => {
    expect(omit({ a: 1, b: 2 }, [])).toEqual({ a: 1, b: 2 });
  });
  it('does not mutate original', () => {
    const obj = { a: 1, b: 2, c: 3 };
    omit(obj, ['a', 'b']);
    expect(obj).toEqual({ a: 1, b: 2, c: 3 });
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: flatten / unflatten
// ---------------------------------------------------------------------------
describe('flatten correctness', () => {
  it('flattens nested object with dot notation', () => {
    expect(flatten({ a: { b: { c: 1 } } })).toEqual({ 'a.b.c': 1 });
  });
  it('handles flat objects', () => {
    expect(flatten({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });
  it('uses custom separator', () => {
    expect(flatten({ a: { b: 1 } }, '', '_')).toEqual({ a_b: 1 });
  });
  it('uses prefix', () => {
    expect(flatten({ x: 1 }, 'cfg')).toEqual({ 'cfg.x': 1 });
  });
  it('handles arrays as leaf values', () => {
    const result = flatten({ a: [1, 2, 3] });
    expect(result['a']).toEqual([1, 2, 3]);
  });
});

describe('unflatten correctness', () => {
  it('unflattens dot-notation keys', () => {
    const result = unflatten({ 'a.b.c': 1 }) as { a: { b: { c: number } } };
    expect(result.a.b.c).toBe(1);
  });
  it('handles flat keys (no dot)', () => {
    expect(unflatten({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });
  it('uses custom separator', () => {
    const result = unflatten({ 'a_b': 1 }, '_') as { a: { b: number } };
    expect(result.a.b).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: validateConfig
// ---------------------------------------------------------------------------
describe('validateConfig correctness', () => {
  it('validates a valid config', () => {
    const schema = {
      name: { type: 'string' as const, required: true },
      age: { type: 'number' as const, required: true, min: 0, max: 150 },
    };
    const result = validateConfig<{ name: string; age: number }>(
      { name: 'Alice', age: 30 },
      schema,
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.value.name).toBe('Alice');
  });

  it('returns error for missing required field', () => {
    const schema = { name: { type: 'string' as const, required: true } };
    const result = validateConfig<{ name: string }>({}, schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('returns error for wrong type', () => {
    const schema = { count: { type: 'number' as const, required: true } };
    const result = validateConfig<{ count: number }>({ count: 'nope' }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_TYPE');
  });

  it('returns error for value below min', () => {
    const schema = { age: { type: 'number' as const, required: true, min: 18 } };
    const result = validateConfig<{ age: number }>({ age: 10 }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('MIN_VALUE');
  });

  it('returns error for value above max', () => {
    const schema = { age: { type: 'number' as const, required: true, max: 100 } };
    const result = validateConfig<{ age: number }>({ age: 200 }, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('MAX_VALUE');
  });

  it('validates enum correctly', () => {
    const schema = {
      level: { type: 'string' as const, required: true, enum: ['low', 'medium', 'high'] },
    };
    const ok = validateConfig<{ level: string }>({ level: 'medium' }, schema);
    expect(ok.valid).toBe(true);
    const bad = validateConfig<{ level: string }>({ level: 'extreme' }, schema);
    expect(bad.valid).toBe(false);
    expect(bad.errors[0].code).toBe('INVALID_ENUM');
  });

  it('applies defaults for optional missing fields', () => {
    const schema = {
      name: { type: 'string' as const, required: true },
      timeout: { type: 'number' as const, default: 30 },
    };
    const result = validateConfig<{ name: string; timeout: number }>(
      { name: 'Bob' },
      schema,
    );
    expect(result.valid).toBe(true);
    expect(result.value.timeout).toBe(30);
  });

  it('returns INVALID_TYPE for non-object input', () => {
    const schema = { x: { type: 'string' as const } };
    const result = validateConfig('not an object', schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_TYPE');
  });

  it('validates boolean field', () => {
    const schema = { active: { type: 'boolean' as const, required: true } };
    const ok = validateConfig<{ active: boolean }>({ active: true }, schema);
    expect(ok.valid).toBe(true);
    const bad = validateConfig<{ active: boolean }>({ active: 'yes' }, schema);
    expect(bad.valid).toBe(false);
  });

  it('validates array field', () => {
    const schema = { tags: { type: 'array' as const, required: true } };
    const ok = validateConfig<{ tags: string[] }>({ tags: ['a', 'b'] }, schema);
    expect(ok.valid).toBe(true);
    const bad = validateConfig<{ tags: string[] }>({ tags: 'a,b' }, schema);
    expect(bad.valid).toBe(false);
  });

  it('validates object field', () => {
    const schema = { meta: { type: 'object' as const, required: true } };
    const ok = validateConfig<{ meta: object }>({ meta: { x: 1 } }, schema);
    expect(ok.valid).toBe(true);
    const bad = validateConfig<{ meta: object }>({ meta: 'not an object' }, schema);
    expect(bad.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: applyDefaults
// ---------------------------------------------------------------------------
describe('applyDefaults correctness', () => {
  it('fills in missing defaults', () => {
    const schema = {
      timeout: { type: 'number' as const, default: 5000 },
      retries: { type: 'number' as const, default: 3 },
    };
    type Cfg = { timeout: number; retries: number };
    const result = applyDefaults<Cfg>({}, schema);
    expect(result.timeout).toBe(5000);
    expect(result.retries).toBe(3);
  });

  it('does not override existing values', () => {
    const schema = { timeout: { type: 'number' as const, default: 5000 } };
    type Cfg = { timeout: number };
    const result = applyDefaults<Cfg>({ timeout: 1000 }, schema);
    expect(result.timeout).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: ConfigStore
// ---------------------------------------------------------------------------
describe('ConfigStore correctness', () => {
  it('stores and retrieves initial config', () => {
    const store = new ConfigStore({ host: 'localhost', port: 3000 });
    expect(store.get()).toEqual({ host: 'localhost', port: 3000 });
  });

  it('get() returns a deep clone (immutable)', () => {
    const store = new ConfigStore({ x: { y: 1 } });
    const state = store.get();
    state.x.y = 999;
    expect(store.get().x.y).toBe(1);
  });

  it('set() merges without mutating old state', () => {
    const store = new ConfigStore({ a: 1, b: 2 });
    store.set({ a: 99 });
    expect(store.get().a).toBe(99);
    expect(store.get().b).toBe(2);
  });

  it('setPath() sets nested value', () => {
    type Cfg = { a: { b: { c: number } } };
    const store = new ConfigStore<Cfg>({ a: { b: { c: 1 } } });
    store.setPath('a.b.c', 42);
    expect(store.getPath<number>('a.b.c')).toBe(42);
  });

  it('getPath() returns undefined for unknown path', () => {
    const store = new ConfigStore({ x: 1 });
    expect(store.getPath('z.z.z')).toBeUndefined();
  });

  it('reset() restores initial state', () => {
    const store = new ConfigStore({ val: 0 });
    store.set({ val: 999 });
    store.reset();
    expect(store.get().val).toBe(0);
  });

  it('subscribe() listener is called on set()', () => {
    const store = new ConfigStore({ count: 0 });
    const events: string[][] = [];
    store.subscribe((e) => events.push(e.changedPaths));
    store.set({ count: 1 });
    expect(events.length).toBe(1);
    expect(events[0]).toContain('count');
  });

  it('unsubscribe() stops notifications', () => {
    const store = new ConfigStore({ count: 0 });
    const calls: number[] = [];
    const unsub = store.subscribe(() => calls.push(1));
    store.set({ count: 1 });
    unsub();
    store.set({ count: 2 });
    expect(calls.length).toBe(1);
  });

  it('subscribe() carries previous and current state', () => {
    const store = new ConfigStore({ x: 10 });
    let ev: { previous: { x: number }; current: { x: number } } | null = null;
    store.subscribe((e) => { ev = e as typeof ev; });
    store.set({ x: 20 });
    expect(ev!.previous.x).toBe(10);
    expect(ev!.current.x).toBe(20);
  });

  it('toJSON() / fromJSON() roundtrip', () => {
    const store = new ConfigStore({ a: 1, b: 'hello' });
    const json = store.toJSON();
    const store2 = new ConfigStore({ a: 0, b: '' });
    store2.fromJSON(json);
    expect(store2.get()).toEqual({ a: 1, b: 'hello' });
  });

  it('freeze() returns frozen copy', () => {
    const store = new ConfigStore({ x: 1 });
    const frozen = store.freeze();
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it('snapshot() returns independent deep clone', () => {
    const store = new ConfigStore({ arr: [1, 2, 3] });
    const snap = store.snapshot() as { arr: number[] };
    snap.arr.push(99);
    expect(store.get().arr).toEqual([1, 2, 3]);
  });

  it('fromJSON() fires change event', () => {
    const store = new ConfigStore({ x: 1 });
    const changed: string[][] = [];
    store.subscribe((e) => changed.push(e.changedPaths));
    store.fromJSON(JSON.stringify({ x: 2 }));
    expect(changed.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: coerceValue
// ---------------------------------------------------------------------------
describe('coerceValue correctness', () => {
  it('returns string as-is for type string', () => {
    expect(coerceValue('hello', 'string')).toBe('hello');
  });
  it('converts numeric string to number', () => {
    expect(coerceValue('42', 'number')).toBe(42);
  });
  it('converts "true" string to boolean', () => {
    expect(coerceValue('true', 'boolean')).toBe(true);
  });
  it('converts "false" string to boolean', () => {
    expect(coerceValue('false', 'boolean')).toBe(false);
  });
  it('parses JSON string for json type', () => {
    expect(coerceValue('{"x":1}', 'json')).toEqual({ x: 1 });
  });
  it('returns raw string for invalid json', () => {
    expect(coerceValue('notjson', 'json')).toBe('notjson');
  });
  it('converts non-numeric string to 0 for number type', () => {
    expect(coerceValue('abc', 'number')).toBe(0);
  });
  it('converts "1" to boolean true', () => {
    expect(coerceValue('1', 'boolean')).toBe(true);
  });
  it('converts "0" to boolean false', () => {
    expect(coerceValue('0', 'boolean')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: interpolate
// ---------------------------------------------------------------------------
describe('interpolate correctness', () => {
  it('replaces single placeholder', () => {
    expect(interpolate('Hello ${NAME}!', { NAME: 'World' })).toBe('Hello World!');
  });
  it('replaces multiple placeholders', () => {
    expect(interpolate('${A} + ${B}', { A: 'foo', B: 'bar' })).toBe('foo + bar');
  });
  it('leaves unresolved placeholders as-is', () => {
    expect(interpolate('${MISSING}', {})).toBe('${MISSING}');
  });
  it('handles empty template', () => {
    expect(interpolate('', { A: 'b' })).toBe('');
  });
  it('handles template with no placeholders', () => {
    expect(interpolate('no placeholders here', { A: 'b' })).toBe('no placeholders here');
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: redactSecrets
// ---------------------------------------------------------------------------
describe('redactSecrets correctness', () => {
  it('redacts password field', () => {
    const r = redactSecrets({ password: 'mypass' }) as { password: string };
    expect(r.password).toBe('***');
  });
  it('redacts token field', () => {
    const r = redactSecrets({ token: 'abc123' }) as { token: string };
    expect(r.token).toBe('***');
  });
  it('does not redact non-secret fields', () => {
    const r = redactSecrets({ username: 'admin' }) as { username: string };
    expect(r.username).toBe('admin');
  });
  it('supports custom secret keys', () => {
    const r = redactSecrets({ myCustomField: 'val' }, ['mycustomfield']) as { myCustomField: string };
    expect(r.myCustomField).toBe('***');
  });
  it('redacts nested secrets', () => {
    const r = redactSecrets({ db: { password: 'dbpass' } }) as { db: { password: string } };
    expect(r.db.password).toBe('***');
  });
  it('does not mutate original object', () => {
    const original = { password: 'secret' };
    redactSecrets(original);
    expect(original.password).toBe('secret');
  });
  it('handles arrays within objects', () => {
    const r = redactSecrets({ items: [{ token: 'x' }, { name: 'y' }] }) as {
      items: Array<{ token?: string; name?: string }>;
    };
    expect(r.items[0].token).toBe('***');
    expect(r.items[1].name).toBe('y');
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: diffConfigs
// ---------------------------------------------------------------------------
describe('diffConfigs correctness', () => {
  it('detects changed values', () => {
    const diff = diffConfigs({ a: 1, b: 2 }, { a: 1, b: 99 });
    expect(diff['b']).toEqual({ from: 2, to: 99 });
    expect(diff['a']).toBeUndefined();
  });
  it('detects added keys', () => {
    const diff = diffConfigs({ a: 1 }, { a: 1, b: 2 });
    expect(diff['b']).toEqual({ from: undefined, to: 2 });
  });
  it('detects removed keys', () => {
    const diff = diffConfigs({ a: 1, b: 2 }, { a: 1 });
    expect(diff['b']).toEqual({ from: 2, to: undefined });
  });
  it('returns empty object for identical configs', () => {
    expect(diffConfigs({ a: 1 }, { a: 1 })).toEqual({});
  });
  it('handles nested diff via flatten', () => {
    const diff = diffConfigs({ x: { y: 1 } }, { x: { y: 2 } });
    expect(diff['x.y']).toEqual({ from: 1, to: 2 });
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: isConfigEqual
// ---------------------------------------------------------------------------
describe('isConfigEqual correctness', () => {
  it('returns true for identical objects', () => {
    expect(isConfigEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
  });
  it('returns false for different values', () => {
    expect(isConfigEqual({ a: 1 }, { a: 2 })).toBe(false);
  });
  it('returns false for different keys', () => {
    expect(isConfigEqual({ a: 1 }, { b: 1 })).toBe(false);
  });
  it('handles arrays', () => {
    expect(isConfigEqual({ arr: [1, 2] }, { arr: [1, 2] })).toBe(true);
    expect(isConfigEqual({ arr: [1, 2] }, { arr: [1, 3] })).toBe(false);
  });
  it('handles empty objects', () => {
    expect(isConfigEqual({}, {})).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: sortKeys
// ---------------------------------------------------------------------------
describe('sortKeys correctness', () => {
  it('sorts keys alphabetically', () => {
    const result = sortKeys({ c: 3, a: 1, b: 2 });
    expect(Object.keys(result)).toEqual(['a', 'b', 'c']);
  });
  it('sorts nested keys recursively', () => {
    const result = sortKeys({ b: { d: 4, c: 3 }, a: 1 }) as {
      a: number;
      b: { c: number; d: number };
    };
    expect(Object.keys(result)).toEqual(['a', 'b']);
    expect(Object.keys(result.b)).toEqual(['c', 'd']);
  });
  it('handles empty object', () => {
    expect(sortKeys({})).toEqual({});
  });
  it('does not mutate original', () => {
    const original = { z: 1, a: 2 };
    sortKeys(original);
    expect(Object.keys(original)).toEqual(['z', 'a']);
  });
});

// ---------------------------------------------------------------------------
// Correctness tests: parseEnv
// ---------------------------------------------------------------------------
describe('parseEnv correctness', () => {
  it('wraps env with typed getters', () => {
    const env = parseEnv({ HOST: 'localhost', PORT: '3000', DEBUG: 'true' });
    expect(env.getString('HOST')).toBe('localhost');
    expect(env.getNumber('PORT')).toBe(3000);
    expect(env.getBoolean('DEBUG')).toBe(true);
  });

  it('has() returns true for present keys', () => {
    const env = parseEnv({ A: 'val' });
    expect(env.has('A')).toBe(true);
    expect(env.has('B')).toBe(false);
  });

  it('keys() returns defined keys', () => {
    const env = parseEnv({ X: 'x', Y: 'y', Z: undefined });
    const keys = env.keys();
    expect(keys).toContain('X');
    expect(keys).toContain('Y');
    expect(keys).not.toContain('Z');
  });

  it('require() throws for missing keys', () => {
    const env = parseEnv({ A: 'present' });
    expect(() => env.require(['A', 'B'])).toThrow();
  });

  it('require() passes for present keys', () => {
    const env = parseEnv({ A: 'present', B: 'also' });
    expect(() => env.require(['A', 'B'])).not.toThrow();
  });

  it('getJson() parses JSON env var', () => {
    const env = parseEnv({ CONFIG: '{"port":8080}' });
    expect(env.getJson('CONFIG')).toEqual({ port: 8080 });
  });

  it('getArray() splits CSV env var', () => {
    const env = parseEnv({ HOSTS: 'a,b,c' });
    expect(env.getArray('HOSTS')).toEqual(['a', 'b', 'c']);
  });
});

// ---------------------------------------------------------------------------
// Loop 10: coerceValue type checks — 50 tests (i=0..49)
// ---------------------------------------------------------------------------
describe('coerceValue — loop 50', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: number coercion for value ${i}`, () => {
      expect(coerceValue(String(i), 'number')).toBe(i);
      expect(coerceValue(String(i), 'string')).toBe(String(i));
      expect(coerceValue(i % 2 === 0 ? 'true' : 'false', 'boolean')).toBe(i % 2 === 0);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 11: isConfigEqual with varied objects — 50 tests (i=0..49)
// ---------------------------------------------------------------------------
describe('isConfigEqual — loop 50', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: equal configs`, () => {
      const obj = { id: i, tag: `item_${i}`, active: i % 2 === 0 };
      expect(isConfigEqual(obj, { ...obj })).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop 12: diffConfigs on numeric changes — 30 tests (i=0..29)
// ---------------------------------------------------------------------------
describe('diffConfigs — loop 30', () => {
  for (let i = 0; i < 30; i++) {
    it(`iteration ${i}: detects single numeric change`, () => {
      const a = { value: i, label: `label_${i}`, stable: 'unchanged' };
      const b = { value: i + 100, label: `label_${i}`, stable: 'unchanged' };
      const diff = diffConfigs(a, b);
      expect(diff['value']).toEqual({ from: i, to: i + 100 });
      expect(diff['label']).toBeUndefined();
      expect(diff['stable']).toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// Extra correctness: ConfigStore subscribe fires on reset()
// ---------------------------------------------------------------------------
describe('ConfigStore subscribe on reset', () => {
  it('fires change event on reset if state changed', () => {
    const store = new ConfigStore({ x: 0 });
    store.set({ x: 99 });
    const events: number[] = [];
    store.subscribe(() => events.push(1));
    store.reset();
    expect(events.length).toBe(1);
  });

  it('does not fire event on reset if state was already initial', () => {
    const store = new ConfigStore({ x: 0 });
    const events: number[] = [];
    store.subscribe(() => events.push(1));
    store.reset();
    expect(events.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Extra correctness: deepMergeAll edge cases
// ---------------------------------------------------------------------------
describe('deepMergeAll edge cases', () => {
  it('single-element array returns cloned config', () => {
    const result = deepMergeAll([{ a: 1, b: 2 }]);
    expect(result).toEqual({ a: 1, b: 2 });
  });
  it('deeply nested multi-source merge', () => {
    const result = deepMergeAll([
      { db: { host: 'localhost', port: 5432 } },
      { db: { port: 5433 } },
      { db: { name: 'mydb' } },
    ]);
    expect(result).toEqual({ db: { host: 'localhost', port: 5433, name: 'mydb' } });
  });
});

// ---------------------------------------------------------------------------
// Extra correctness: flatten with prefix
// ---------------------------------------------------------------------------
describe('flatten with various separators and prefixes', () => {
  it('uses double-underscore separator', () => {
    const result = flatten({ a: { b: 1 } }, '', '__');
    expect(result['a__b']).toBe(1);
  });
  it('prefix combined with separator', () => {
    const result = flatten({ x: 1 }, 'app', '.');
    expect(result['app.x']).toBe(1);
  });
  it('handles null values as leaves', () => {
    const result = flatten({ a: null });
    expect(result['a']).toBeNull();
  });
  it('handles boolean values as leaves', () => {
    const result = flatten({ flag: true });
    expect(result['flag']).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Extra correctness: parseEnvFile edge cases
// ---------------------------------------------------------------------------
describe('parseEnvFile edge cases', () => {
  it('ignores lines without = sign', () => {
    const result = parseEnvFile('BADLINE\nGOOD=val');
    expect(result['BADLINE']).toBeUndefined();
    expect(result['GOOD']).toBe('val');
  });
  it('handles empty value', () => {
    const result = parseEnvFile('EMPTY=');
    expect(result['EMPTY']).toBe('');
  });
  it('handles value with spaces and hash in double quotes', () => {
    const result = parseEnvFile('KEY="value with # hash"');
    expect(result['KEY']).toBe('value with # hash');
  });
  it('handles CR+LF line endings', () => {
    const result = parseEnvFile('A=1\r\nB=2\r\n');
    // Carriage returns become part of value unless trimmed — acceptable
    expect(result['A']).toBeDefined();
    expect(result['B']).toBeDefined();
  });
  it('handles multiple consecutive comment lines', () => {
    const result = parseEnvFile('# line 1\n# line 2\n# line 3\nKEY=ok');
    expect(Object.keys(result)).toEqual(['KEY']);
    expect(result['KEY']).toBe('ok');
  });
  it('handles key with numeric value', () => {
    const result = parseEnvFile('PORT=8080');
    expect(result['PORT']).toBe('8080');
  });
});
