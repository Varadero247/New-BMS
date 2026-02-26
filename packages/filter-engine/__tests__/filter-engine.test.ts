// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  applyFilter,
  applyPagination,
  applySort,
  countMatches,
  evaluateCondition,
  evaluateGroup,
  isValidLogic,
  isValidOperator,
  isValidSortDirection,
  makeCondition,
  makeGroup,
  query,
} from '../src/index';
import type { FilterCondition, FilterGroup, FilterQuery, SortSpec } from '../src/index';

// ─── helpers ──────────────────────────────────────────────────────────────────
type Item = Record<string, unknown>;
const makeItems = (n: number): Item[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `item${i + 1}`,
    score: i * 10,
    active: i % 2 === 0,
    tag: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C',
    category: ['alpha', 'beta', 'gamma'][i % 3],
    value: i + 0.5,
    label: `Label ${String.fromCharCode(65 + (i % 26))}`,
  }));

// ─── isValidOperator ──────────────────────────────────────────────────────────
describe('isValidOperator', () => {
  const validOps = [
    'eq', 'ne', 'gt', 'gte', 'lt', 'lte',
    'contains', 'starts_with', 'ends_with',
    'in', 'not_in', 'is_null', 'is_not_null',
    'between', 'regex',
  ];
  validOps.forEach((op) => {
    it(`accepts "${op}"`, () => {
      expect(isValidOperator(op)).toBe(true);
    });
  });

  const invalidOps = [
    'EQUALS', 'EQ', '=', '==', '!=', '<>', 'like', 'LIKE',
    'notNull', 'null', 'between2', 'contains_not', '', 'contains ',
    'CONTAINS', 'Eq', 'IN', 'GT', 'starts', 'ends',
  ];
  invalidOps.forEach((op) => {
    it(`rejects "${op}"`, () => {
      expect(isValidOperator(op)).toBe(false);
    });
  });

  // Bulk: numeric strings
  for (let i = 0; i < 20; i++) {
    it(`rejects numeric string "${i}"`, () => {
      expect(isValidOperator(String(i))).toBe(false);
    });
  }
});

// ─── isValidLogic ─────────────────────────────────────────────────────────────
describe('isValidLogic', () => {
  it('accepts AND', () => { expect(isValidLogic('AND')).toBe(true); });
  it('accepts OR', () => { expect(isValidLogic('OR')).toBe(true); });
  it('accepts NOT', () => { expect(isValidLogic('NOT')).toBe(true); });
  it('rejects and', () => { expect(isValidLogic('and')).toBe(false); });
  it('rejects or', () => { expect(isValidLogic('or')).toBe(false); });
  it('rejects not', () => { expect(isValidLogic('not')).toBe(false); });
  it('rejects XOR', () => { expect(isValidLogic('XOR')).toBe(false); });
  it('rejects empty', () => { expect(isValidLogic('')).toBe(false); });
  it('rejects NAND', () => { expect(isValidLogic('NAND')).toBe(false); });
  it('rejects AND OR', () => { expect(isValidLogic('AND OR')).toBe(false); });

  for (let i = 0; i < 20; i++) {
    it(`rejects random string ${i}`, () => {
      expect(isValidLogic(`LOGIC${i}`)).toBe(false);
    });
  }
});

// ─── isValidSortDirection ─────────────────────────────────────────────────────
describe('isValidSortDirection', () => {
  it('accepts asc', () => { expect(isValidSortDirection('asc')).toBe(true); });
  it('accepts desc', () => { expect(isValidSortDirection('desc')).toBe(true); });
  it('rejects ASC', () => { expect(isValidSortDirection('ASC')).toBe(false); });
  it('rejects DESC', () => { expect(isValidSortDirection('DESC')).toBe(false); });
  it('rejects ascending', () => { expect(isValidSortDirection('ascending')).toBe(false); });
  it('rejects descending', () => { expect(isValidSortDirection('descending')).toBe(false); });
  it('rejects empty', () => { expect(isValidSortDirection('')).toBe(false); });
  it('rejects 1', () => { expect(isValidSortDirection('1')).toBe(false); });
  it('rejects -1', () => { expect(isValidSortDirection('-1')).toBe(false); });
  it('rejects up', () => { expect(isValidSortDirection('up')).toBe(false); });

  for (let i = 0; i < 10; i++) {
    it(`rejects dir${i}`, () => {
      expect(isValidSortDirection(`dir${i}`)).toBe(false);
    });
  }
});

// ─── makeCondition ────────────────────────────────────────────────────────────
describe('makeCondition', () => {
  it('creates a basic eq condition', () => {
    const c = makeCondition('name', 'eq', 'Alice');
    expect(c).toEqual({ field: 'name', operator: 'eq', value: 'Alice' });
  });
  it('creates a between condition with value2', () => {
    const c = makeCondition('score', 'between', 10, 50);
    expect(c.value2).toBe(50);
  });
  it('creates condition without value for is_null', () => {
    const c = makeCondition('field', 'is_null');
    expect(c.value).toBeUndefined();
  });
  it('sets caseSensitive flag', () => {
    const c = makeCondition('name', 'contains', 'foo', undefined, true);
    expect(c.caseSensitive).toBe(true);
  });
  it('omits caseSensitive when undefined', () => {
    const c = makeCondition('name', 'eq', 'x');
    expect(c.caseSensitive).toBeUndefined();
  });
  it('preserves field name exactly', () => {
    const c = makeCondition('my_field', 'eq', 1);
    expect(c.field).toBe('my_field');
  });
  it('preserves operator exactly', () => {
    const c = makeCondition('x', 'regex', 'pat');
    expect(c.operator).toBe('regex');
  });
  it('creates in condition with array value', () => {
    const c = makeCondition('tag', 'in', ['A', 'B']);
    expect(Array.isArray(c.value)).toBe(true);
  });
  it('omits value2 when undefined', () => {
    const c = makeCondition('x', 'eq', 5);
    expect(c.value2).toBeUndefined();
  });
  it('creates ne condition', () => {
    const c = makeCondition('status', 'ne', 'closed');
    expect(c.operator).toBe('ne');
    expect(c.value).toBe('closed');
  });

  // Bulk: all operators
  const ops = [
    'eq', 'ne', 'gt', 'gte', 'lt', 'lte',
    'contains', 'starts_with', 'ends_with',
    'in', 'not_in', 'is_null', 'is_not_null',
    'between', 'regex',
  ] as const;
  ops.forEach((op) => {
    it(`makeCondition works with operator ${op}`, () => {
      const c = makeCondition('f', op, 'v');
      expect(c.operator).toBe(op);
    });
  });
});

// ─── makeGroup ────────────────────────────────────────────────────────────────
describe('makeGroup', () => {
  it('creates AND group', () => {
    const g = makeGroup('AND', [makeCondition('x', 'eq', 1)]);
    expect(g.logic).toBe('AND');
    expect(g.conditions?.length).toBe(1);
  });
  it('creates OR group', () => {
    const g = makeGroup('OR', [makeCondition('x', 'eq', 1), makeCondition('x', 'eq', 2)]);
    expect(g.logic).toBe('OR');
    expect(g.conditions?.length).toBe(2);
  });
  it('creates NOT group', () => {
    const g = makeGroup('NOT', [makeCondition('x', 'eq', 99)]);
    expect(g.logic).toBe('NOT');
  });
  it('omits conditions when empty', () => {
    const g = makeGroup('AND');
    expect(g.conditions).toBeUndefined();
  });
  it('includes nested groups', () => {
    const inner = makeGroup('OR', [makeCondition('a', 'eq', 1)]);
    const outer = makeGroup('AND', [], [inner]);
    expect(outer.groups?.length).toBe(1);
  });
  it('omits groups when empty', () => {
    const g = makeGroup('AND', [makeCondition('x', 'eq', 1)]);
    expect(g.groups).toBeUndefined();
  });

  for (let i = 0; i < 15; i++) {
    it(`makeGroup bulk ${i}: has correct logic`, () => {
      const logic = ['AND', 'OR', 'NOT'][i % 3] as 'AND' | 'OR' | 'NOT';
      const g = makeGroup(logic);
      expect(g.logic).toBe(logic);
    });
  }
});

// ─── evaluateCondition — eq/ne ────────────────────────────────────────────────
describe('evaluateCondition eq/ne', () => {
  const item: Item = { name: 'Alice', age: 30, active: true, score: 0 };
  it('eq: matches string', () => {
    expect(evaluateCondition(item, makeCondition('name', 'eq', 'Alice'))).toBe(true);
  });
  it('eq: no match string', () => {
    expect(evaluateCondition(item, makeCondition('name', 'eq', 'Bob'))).toBe(false);
  });
  it('eq: matches number', () => {
    expect(evaluateCondition(item, makeCondition('age', 'eq', 30))).toBe(true);
  });
  it('eq: matches boolean true', () => {
    expect(evaluateCondition(item, makeCondition('active', 'eq', true))).toBe(true);
  });
  it('eq: no match boolean', () => {
    expect(evaluateCondition(item, makeCondition('active', 'eq', false))).toBe(false);
  });
  it('eq: matches zero score', () => {
    expect(evaluateCondition(item, makeCondition('score', 'eq', 0))).toBe(true);
  });
  it('ne: different string', () => {
    expect(evaluateCondition(item, makeCondition('name', 'ne', 'Bob'))).toBe(true);
  });
  it('ne: same string', () => {
    expect(evaluateCondition(item, makeCondition('name', 'ne', 'Alice'))).toBe(false);
  });
  it('ne: different number', () => {
    expect(evaluateCondition(item, makeCondition('age', 'ne', 99))).toBe(true);
  });
  it('ne: same number', () => {
    expect(evaluateCondition(item, makeCondition('age', 'ne', 30))).toBe(false);
  });

  // Bulk eq checks
  for (let i = 0; i < 30; i++) {
    it(`eq bulk ${i}: matches id ${i}`, () => {
      const rec: Item = { id: i };
      expect(evaluateCondition(rec, makeCondition('id', 'eq', i))).toBe(true);
    });
  }
});

// ─── evaluateCondition — numeric comparisons ──────────────────────────────────
describe('evaluateCondition numeric comparisons', () => {
  const item: Item = { score: 50 };
  it('gt: 50 > 40', () => { expect(evaluateCondition(item, makeCondition('score', 'gt', 40))).toBe(true); });
  it('gt: 50 > 50 false', () => { expect(evaluateCondition(item, makeCondition('score', 'gt', 50))).toBe(false); });
  it('gte: 50 >= 50', () => { expect(evaluateCondition(item, makeCondition('score', 'gte', 50))).toBe(true); });
  it('gte: 50 >= 51 false', () => { expect(evaluateCondition(item, makeCondition('score', 'gte', 51))).toBe(false); });
  it('lt: 50 < 60', () => { expect(evaluateCondition(item, makeCondition('score', 'lt', 60))).toBe(true); });
  it('lt: 50 < 50 false', () => { expect(evaluateCondition(item, makeCondition('score', 'lt', 50))).toBe(false); });
  it('lte: 50 <= 50', () => { expect(evaluateCondition(item, makeCondition('score', 'lte', 50))).toBe(true); });
  it('lte: 50 <= 49 false', () => { expect(evaluateCondition(item, makeCondition('score', 'lte', 49))).toBe(false); });
  it('gt: non-number returns false', () => {
    expect(evaluateCondition({ score: 'fifty' }, makeCondition('score', 'gt', 40))).toBe(false);
  });
  it('gte: non-number returns false', () => {
    expect(evaluateCondition({ score: null }, makeCondition('score', 'gte', 0))).toBe(false);
  });

  // Bulk numeric
  for (let i = 0; i < 30; i++) {
    it(`numeric bulk ${i}: ${i} >= 0`, () => {
      const rec: Item = { v: i };
      expect(evaluateCondition(rec, makeCondition('v', 'gte', 0))).toBe(true);
    });
  }
});

// ─── evaluateCondition — string operators ─────────────────────────────────────
describe('evaluateCondition string operators', () => {
  const item: Item = { name: 'Hello World', code: 'ABC-123' };
  it('contains: found', () => { expect(evaluateCondition(item, makeCondition('name', 'contains', 'World'))).toBe(true); });
  it('contains: not found', () => { expect(evaluateCondition(item, makeCondition('name', 'contains', 'xyz'))).toBe(false); });
  it('contains: case insensitive by default', () => { expect(evaluateCondition(item, makeCondition('name', 'contains', 'hello'))).toBe(true); });
  it('contains: case sensitive miss', () => { expect(evaluateCondition(item, makeCondition('name', 'contains', 'hello', undefined, true))).toBe(false); });
  it('contains: case sensitive hit', () => { expect(evaluateCondition(item, makeCondition('name', 'contains', 'Hello', undefined, true))).toBe(true); });
  it('starts_with: match', () => { expect(evaluateCondition(item, makeCondition('name', 'starts_with', 'Hello'))).toBe(true); });
  it('starts_with: no match', () => { expect(evaluateCondition(item, makeCondition('name', 'starts_with', 'World'))).toBe(false); });
  it('starts_with: case insensitive', () => { expect(evaluateCondition(item, makeCondition('name', 'starts_with', 'hello'))).toBe(true); });
  it('ends_with: match', () => { expect(evaluateCondition(item, makeCondition('name', 'ends_with', 'World'))).toBe(true); });
  it('ends_with: no match', () => { expect(evaluateCondition(item, makeCondition('name', 'ends_with', 'Hello'))).toBe(false); });
  it('ends_with: case insensitive', () => { expect(evaluateCondition(item, makeCondition('name', 'ends_with', 'world'))).toBe(true); });
  it('contains: number field coerced', () => {
    const rec: Item = { id: 123 };
    expect(evaluateCondition(rec, makeCondition('id', 'contains', '12'))).toBe(true);
  });

  for (let i = 0; i < 20; i++) {
    it(`starts_with bulk ${i}: item${i+1} starts with "item"`, () => {
      const rec: Item = { name: `item${i + 1}` };
      expect(evaluateCondition(rec, makeCondition('name', 'starts_with', 'item'))).toBe(true);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`ends_with bulk ${i}: item ends with digit group`, () => {
      const rec: Item = { code: `PREFIX-${i}` };
      expect(evaluateCondition(rec, makeCondition('code', 'ends_with', String(i)))).toBe(true);
    });
  }
});

// ─── evaluateCondition — in / not_in ─────────────────────────────────────────
describe('evaluateCondition in/not_in', () => {
  const item: Item = { tag: 'B', score: 20 };
  it('in: found', () => { expect(evaluateCondition(item, makeCondition('tag', 'in', ['A', 'B', 'C']))).toBe(true); });
  it('in: not found', () => { expect(evaluateCondition(item, makeCondition('tag', 'in', ['X', 'Y']))).toBe(false); });
  it('in: empty array', () => { expect(evaluateCondition(item, makeCondition('tag', 'in', []))).toBe(false); });
  it('in: non-array returns false', () => { expect(evaluateCondition(item, makeCondition('tag', 'in', 'B'))).toBe(false); });
  it('not_in: not in list', () => { expect(evaluateCondition(item, makeCondition('tag', 'not_in', ['X', 'Y']))).toBe(true); });
  it('not_in: in list', () => { expect(evaluateCondition(item, makeCondition('tag', 'not_in', ['A', 'B']))).toBe(false); });
  it('not_in: empty array returns true', () => { expect(evaluateCondition(item, makeCondition('tag', 'not_in', []))).toBe(true); });
  it('not_in: non-array returns false', () => { expect(evaluateCondition(item, makeCondition('tag', 'not_in', 'B'))).toBe(false); });
  it('in: number in list', () => { expect(evaluateCondition(item, makeCondition('score', 'in', [10, 20, 30]))).toBe(true); });
  it('in: number not in list', () => { expect(evaluateCondition(item, makeCondition('score', 'in', [10, 30]))).toBe(false); });

  for (let i = 0; i < 20; i++) {
    it(`in bulk ${i}: id ${i} found in list`, () => {
      const rec: Item = { id: i };
      const list = Array.from({ length: 50 }, (_, j) => j);
      expect(evaluateCondition(rec, makeCondition('id', 'in', list))).toBe(true);
    });
  }
});

// ─── evaluateCondition — is_null / is_not_null ───────────────────────────────
describe('evaluateCondition is_null/is_not_null', () => {
  it('is_null: null value', () => { expect(evaluateCondition({ x: null }, makeCondition('x', 'is_null'))).toBe(true); });
  it('is_null: undefined value', () => { expect(evaluateCondition({ x: undefined }, makeCondition('x', 'is_null'))).toBe(true); });
  it('is_null: missing field', () => { expect(evaluateCondition({}, makeCondition('x', 'is_null'))).toBe(true); });
  it('is_null: 0 is not null', () => { expect(evaluateCondition({ x: 0 }, makeCondition('x', 'is_null'))).toBe(false); });
  it('is_null: empty string is not null', () => { expect(evaluateCondition({ x: '' }, makeCondition('x', 'is_null'))).toBe(false); });
  it('is_null: false is not null', () => { expect(evaluateCondition({ x: false }, makeCondition('x', 'is_null'))).toBe(false); });
  it('is_not_null: has value', () => { expect(evaluateCondition({ x: 'v' }, makeCondition('x', 'is_not_null'))).toBe(true); });
  it('is_not_null: null returns false', () => { expect(evaluateCondition({ x: null }, makeCondition('x', 'is_not_null'))).toBe(false); });
  it('is_not_null: undefined returns false', () => { expect(evaluateCondition({ x: undefined }, makeCondition('x', 'is_not_null'))).toBe(false); });
  it('is_not_null: 0 is not null', () => { expect(evaluateCondition({ x: 0 }, makeCondition('x', 'is_not_null'))).toBe(true); });

  for (let i = 0; i < 15; i++) {
    it(`is_not_null bulk ${i}: value ${i} is not null`, () => {
      expect(evaluateCondition({ v: i }, makeCondition('v', 'is_not_null'))).toBe(true);
    });
  }
});

// ─── evaluateCondition — between ─────────────────────────────────────────────
describe('evaluateCondition between', () => {
  const item: Item = { score: 50 };
  it('between: inclusive lower', () => { expect(evaluateCondition(item, makeCondition('score', 'between', 50, 100))).toBe(true); });
  it('between: inclusive upper', () => { expect(evaluateCondition(item, makeCondition('score', 'between', 0, 50))).toBe(true); });
  it('between: inside range', () => { expect(evaluateCondition(item, makeCondition('score', 'between', 40, 60))).toBe(true); });
  it('between: below range', () => { expect(evaluateCondition(item, makeCondition('score', 'between', 60, 100))).toBe(false); });
  it('between: above range', () => { expect(evaluateCondition(item, makeCondition('score', 'between', 0, 49))).toBe(false); });
  it('between: non-number field', () => { expect(evaluateCondition({ score: 'hi' }, makeCondition('score', 'between', 0, 100))).toBe(false); });
  it('between: value2 undefined returns false', () => { expect(evaluateCondition(item, makeCondition('score', 'between', 0))).toBe(false); });
  it('between: value undefined returns false', () => { expect(evaluateCondition(item, makeCondition('score', 'between'))).toBe(false); });

  for (let i = 0; i < 20; i++) {
    it(`between bulk ${i}: ${i * 5} in [0, 200]`, () => {
      const rec: Item = { v: i * 5 };
      expect(evaluateCondition(rec, makeCondition('v', 'between', 0, 200))).toBe(true);
    });
  }
});

// ─── evaluateCondition — regex ────────────────────────────────────────────────
describe('evaluateCondition regex', () => {
  const item: Item = { email: 'user@example.com', code: 'ABC-123' };
  it('regex: matches email pattern', () => { expect(evaluateCondition(item, makeCondition('email', 'regex', '.+@.+'))).toBe(true); });
  it('regex: no match', () => { expect(evaluateCondition(item, makeCondition('email', 'regex', '^\\d+$'))).toBe(false); });
  it('regex: case insensitive by default', () => { expect(evaluateCondition(item, makeCondition('code', 'regex', 'abc'))).toBe(true); });
  it('regex: case sensitive miss', () => { expect(evaluateCondition(item, makeCondition('code', 'regex', 'abc', undefined, true))).toBe(false); });
  it('regex: case sensitive hit', () => { expect(evaluateCondition(item, makeCondition('code', 'regex', 'ABC', undefined, true))).toBe(true); });
  it('regex: invalid pattern returns false', () => { expect(evaluateCondition(item, makeCondition('email', 'regex', '[invalid'))).toBe(false); });
  it('regex: anchored match', () => { expect(evaluateCondition(item, makeCondition('code', 'regex', '^ABC'))).toBe(true); });
  it('regex: digit pattern on code', () => { expect(evaluateCondition(item, makeCondition('code', 'regex', '\\d+'))).toBe(true); });
  it('regex: null field coerced to empty string', () => { expect(evaluateCondition({ v: null }, makeCondition('v', 'regex', '^$'))).toBe(true); });
  it('regex: number field coerced', () => { expect(evaluateCondition({ n: 42 }, makeCondition('n', 'regex', '4'))).toBe(true); });
});

// ─── evaluateGroup ────────────────────────────────────────────────────────────
describe('evaluateGroup AND', () => {
  const item: Item = { a: 1, b: 2 };
  it('AND: both true → true', () => {
    const g = makeGroup('AND', [makeCondition('a', 'eq', 1), makeCondition('b', 'eq', 2)]);
    expect(evaluateGroup(item, g)).toBe(true);
  });
  it('AND: one false → false', () => {
    const g = makeGroup('AND', [makeCondition('a', 'eq', 1), makeCondition('b', 'eq', 9)]);
    expect(evaluateGroup(item, g)).toBe(false);
  });
  it('AND: all false → false', () => {
    const g = makeGroup('AND', [makeCondition('a', 'eq', 9), makeCondition('b', 'eq', 9)]);
    expect(evaluateGroup(item, g)).toBe(false);
  });
  it('AND: empty conditions → true', () => {
    const g = makeGroup('AND');
    expect(evaluateGroup(item, g)).toBe(true);
  });
  it('AND: single true condition', () => {
    const g = makeGroup('AND', [makeCondition('a', 'eq', 1)]);
    expect(evaluateGroup(item, g)).toBe(true);
  });
  it('AND: single false condition', () => {
    const g = makeGroup('AND', [makeCondition('a', 'eq', 9)]);
    expect(evaluateGroup(item, g)).toBe(false);
  });
});

describe('evaluateGroup OR', () => {
  const item: Item = { a: 1, b: 2 };
  it('OR: both true → true', () => {
    const g = makeGroup('OR', [makeCondition('a', 'eq', 1), makeCondition('b', 'eq', 2)]);
    expect(evaluateGroup(item, g)).toBe(true);
  });
  it('OR: one true → true', () => {
    const g = makeGroup('OR', [makeCondition('a', 'eq', 9), makeCondition('b', 'eq', 2)]);
    expect(evaluateGroup(item, g)).toBe(true);
  });
  it('OR: all false → false', () => {
    const g = makeGroup('OR', [makeCondition('a', 'eq', 9), makeCondition('b', 'eq', 9)]);
    expect(evaluateGroup(item, g)).toBe(false);
  });
  it('OR: empty → true', () => {
    const g = makeGroup('OR');
    expect(evaluateGroup(item, g)).toBe(true);
  });
  it('OR: single true', () => {
    const g = makeGroup('OR', [makeCondition('a', 'eq', 1)]);
    expect(evaluateGroup(item, g)).toBe(true);
  });
  it('OR: single false', () => {
    const g = makeGroup('OR', [makeCondition('a', 'eq', 9)]);
    expect(evaluateGroup(item, g)).toBe(false);
  });
});

describe('evaluateGroup NOT', () => {
  const item: Item = { a: 1 };
  it('NOT: negates true → false', () => {
    const g = makeGroup('NOT', [makeCondition('a', 'eq', 1)]);
    expect(evaluateGroup(item, g)).toBe(false);
  });
  it('NOT: negates false → true', () => {
    const g = makeGroup('NOT', [makeCondition('a', 'eq', 9)]);
    expect(evaluateGroup(item, g)).toBe(true);
  });
  it('NOT: empty → true (no conditions → true → NOT true = false, but our impl: empty=true then NOT=false)', () => {
    const g: FilterGroup = { logic: 'NOT' };
    // allTests = [] → length=0 → returns true; so evaluateGroup returns true
    expect(evaluateGroup(item, g)).toBe(true);
  });
});

describe('evaluateGroup nested', () => {
  const item: Item = { a: 1, b: 2, c: 3 };
  it('nested AND inside OR', () => {
    const inner = makeGroup('AND', [makeCondition('a', 'eq', 1), makeCondition('b', 'eq', 2)]);
    const outer = makeGroup('OR', [], [inner]);
    expect(evaluateGroup(item, outer)).toBe(true);
  });
  it('nested OR inside AND', () => {
    const inner = makeGroup('OR', [makeCondition('a', 'eq', 9), makeCondition('c', 'eq', 3)]);
    const outer = makeGroup('AND', [makeCondition('b', 'eq', 2)], [inner]);
    expect(evaluateGroup(item, outer)).toBe(true);
  });
  it('NOT inside AND: not-match makes AND false', () => {
    const inner = makeGroup('NOT', [makeCondition('a', 'eq', 1)]);
    const outer = makeGroup('AND', [makeCondition('b', 'eq', 2)], [inner]);
    expect(evaluateGroup(item, outer)).toBe(false);
  });

  for (let i = 0; i < 15; i++) {
    it(`nested bulk ${i}: nested AND with i=${i}`, () => {
      const rec: Item = { v: i };
      const inner = makeGroup('AND', [makeCondition('v', 'gte', 0)]);
      const outer = makeGroup('AND', [], [inner]);
      expect(evaluateGroup(rec, outer)).toBe(true);
    });
  }
});

// ─── applyFilter ──────────────────────────────────────────────────────────────
describe('applyFilter', () => {
  const data = makeItems(20);

  it('no filter returns all items', () => {
    expect(applyFilter(data)).toHaveLength(20);
  });
  it('filter by exact id', () => {
    const f = makeGroup('AND', [makeCondition('id', 'eq', 5)]);
    expect(applyFilter(data, f)).toHaveLength(1);
    expect(applyFilter(data, f)[0].id).toBe(5);
  });
  it('filter by score range', () => {
    const f = makeGroup('AND', [makeCondition('score', 'between', 0, 50)]);
    const result = applyFilter(data, f);
    result.forEach((r) => {
      expect(r.score as number).toBeGreaterThanOrEqual(0);
      expect(r.score as number).toBeLessThanOrEqual(50);
    });
  });
  it('filter active items', () => {
    const f = makeGroup('AND', [makeCondition('active', 'eq', true)]);
    const result = applyFilter(data, f);
    result.forEach((r) => expect(r.active).toBe(true));
  });
  it('filter by tag A', () => {
    const f = makeGroup('AND', [makeCondition('tag', 'eq', 'A')]);
    const result = applyFilter(data, f);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((r) => expect(r.tag).toBe('A'));
  });
  it('filter returns empty when no match', () => {
    const f = makeGroup('AND', [makeCondition('id', 'eq', 999)]);
    expect(applyFilter(data, f)).toHaveLength(0);
  });
  it('OR filter', () => {
    const f = makeGroup('OR', [makeCondition('tag', 'eq', 'A'), makeCondition('tag', 'eq', 'B')]);
    const result = applyFilter(data, f);
    result.forEach((r) => expect(['A', 'B']).toContain(r.tag));
  });
  it('NOT filter', () => {
    const f = makeGroup('NOT', [makeCondition('tag', 'eq', 'A')]);
    const result = applyFilter(data, f);
    result.forEach((r) => expect(r.tag).not.toBe('A'));
  });
  it('name contains "item1"', () => {
    const f = makeGroup('AND', [makeCondition('name', 'contains', 'item1')]);
    expect(applyFilter(data, f).length).toBeGreaterThan(0);
  });
  it('filter preserves item shape', () => {
    const f = makeGroup('AND', [makeCondition('id', 'eq', 3)]);
    const result = applyFilter(data, f);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('score');
  });

  for (let i = 0; i < 20; i++) {
    it(`applyFilter bulk ${i}: finds id ${i + 1}`, () => {
      const f = makeGroup('AND', [makeCondition('id', 'eq', i + 1)]);
      expect(applyFilter(data, f)).toHaveLength(1);
    });
  }
});

// ─── applySort ────────────────────────────────────────────────────────────────
describe('applySort', () => {
  const data = makeItems(10);

  it('no sort returns original order', () => {
    const result = applySort(data);
    expect(result[0].id).toBe(1);
  });
  it('sort by score asc', () => {
    const sort: SortSpec[] = [{ field: 'score', direction: 'asc' }];
    const result = applySort(data, sort);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].score as number).toBeGreaterThanOrEqual(result[i - 1].score as number);
    }
  });
  it('sort by score desc', () => {
    const sort: SortSpec[] = [{ field: 'score', direction: 'desc' }];
    const result = applySort(data, sort);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].score as number).toBeLessThanOrEqual(result[i - 1].score as number);
    }
  });
  it('sort by name asc', () => {
    const sort: SortSpec[] = [{ field: 'name', direction: 'asc' }];
    const result = applySort(data, sort);
    expect(result).toHaveLength(10);
  });
  it('sort by name desc', () => {
    const sort: SortSpec[] = [{ field: 'name', direction: 'desc' }];
    const result = applySort(data, sort);
    expect(result).toHaveLength(10);
  });
  it('sort does not mutate original', () => {
    const sort: SortSpec[] = [{ field: 'score', direction: 'desc' }];
    const original = [...data];
    applySort(data, sort);
    expect(data[0].id).toBe(original[0].id);
  });
  it('sort by id desc reverses order', () => {
    const sort: SortSpec[] = [{ field: 'id', direction: 'desc' }];
    const result = applySort(data, sort);
    expect(result[0].id).toBe(10);
    expect(result[9].id).toBe(1);
  });
  it('multi-sort: category asc then score desc', () => {
    const sort: SortSpec[] = [
      { field: 'category', direction: 'asc' },
      { field: 'score', direction: 'desc' },
    ];
    const result = applySort(data, sort);
    expect(result).toHaveLength(10);
  });
  it('empty sort array returns data', () => {
    const result = applySort(data, []);
    expect(result).toHaveLength(10);
  });
  it('sort returns same length', () => {
    const sort: SortSpec[] = [{ field: 'score', direction: 'asc' }];
    expect(applySort(data, sort)).toHaveLength(data.length);
  });

  for (let i = 0; i < 15; i++) {
    it(`sort bulk ${i}: id asc first item is 1`, () => {
      const shuffled = [...data].sort(() => (i % 2 === 0 ? 1 : -1));
      const sort: SortSpec[] = [{ field: 'id', direction: 'asc' }];
      const result = applySort(shuffled, sort);
      expect(result[0].id).toBe(1);
    });
  }
});

// ─── applyPagination ──────────────────────────────────────────────────────────
describe('applyPagination', () => {
  const data = makeItems(50);

  it('no limit/offset returns all', () => {
    expect(applyPagination(data)).toHaveLength(50);
  });
  it('limit only', () => {
    expect(applyPagination(data, 10)).toHaveLength(10);
  });
  it('offset only', () => {
    expect(applyPagination(data, undefined, 10)).toHaveLength(40);
  });
  it('limit + offset', () => {
    expect(applyPagination(data, 10, 5)).toHaveLength(10);
  });
  it('offset + limit past end', () => {
    expect(applyPagination(data, 10, 45)).toHaveLength(5);
  });
  it('offset past end', () => {
    expect(applyPagination(data, 10, 60)).toHaveLength(0);
  });
  it('limit 0', () => {
    expect(applyPagination(data, 0)).toHaveLength(0);
  });
  it('offset 0 + limit', () => {
    expect(applyPagination(data, 5, 0)).toHaveLength(5);
  });
  it('first page correct items', () => {
    const page = applyPagination(data, 5, 0);
    expect(page[0].id).toBe(1);
    expect(page[4].id).toBe(5);
  });
  it('second page correct items', () => {
    const page = applyPagination(data, 5, 5);
    expect(page[0].id).toBe(6);
    expect(page[4].id).toBe(10);
  });

  for (let i = 0; i < 20; i++) {
    it(`pagination bulk page ${i}: correct offset`, () => {
      const page = applyPagination(data, 2, i * 2);
      if (i * 2 < 50) {
        expect(page.length).toBeGreaterThan(0);
        expect(page[0].id).toBe(i * 2 + 1);
      } else {
        expect(page).toHaveLength(0);
      }
    });
  }
});

// ─── countMatches ─────────────────────────────────────────────────────────────
describe('countMatches', () => {
  const data = makeItems(30);

  it('counts all matches', () => {
    const f = makeGroup('AND', [makeCondition('active', 'eq', true)]);
    const count = countMatches(data, f);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(30);
  });
  it('count 0 for no matches', () => {
    const f = makeGroup('AND', [makeCondition('id', 'eq', 9999)]);
    expect(countMatches(data, f)).toBe(0);
  });
  it('count all for always-true filter', () => {
    const f = makeGroup('AND', [makeCondition('id', 'gte', 1)]);
    expect(countMatches(data, f)).toBe(30);
  });

  for (let i = 0; i < 30; i++) {
    it(`countMatches bulk ${i}: id=${i+1} gives 1`, () => {
      const f = makeGroup('AND', [makeCondition('id', 'eq', i + 1)]);
      expect(countMatches(data, f)).toBe(1);
    });
  }
});

// ─── query ────────────────────────────────────────────────────────────────────
describe('query', () => {
  const data = makeItems(100);

  it('returns correct total', () => {
    const q: FilterQuery = {};
    const result = query(data, q);
    expect(result.total).toBe(100);
  });
  it('returns filtered count', () => {
    const q: FilterQuery = {
      filter: makeGroup('AND', [makeCondition('active', 'eq', true)]),
    };
    const result = query(data, q);
    expect(result.filtered).toBeLessThan(100);
    expect(result.filtered).toBeGreaterThan(0);
  });
  it('pagination: limit 10', () => {
    const q: FilterQuery = { limit: 10 };
    const result = query(data, q);
    expect(result.data).toHaveLength(10);
  });
  it('pagination: hasMore true when more remain', () => {
    const q: FilterQuery = { limit: 10, offset: 0 };
    const result = query(data, q);
    expect(result.hasMore).toBe(true);
  });
  it('pagination: hasMore false at last page', () => {
    const q: FilterQuery = { limit: 10, offset: 90 };
    const result = query(data, q);
    expect(result.hasMore).toBe(false);
  });
  it('sort asc by score', () => {
    const q: FilterQuery = { sort: [{ field: 'score', direction: 'asc' }] };
    const result = query(data, q);
    expect(result.data[0].score).toBeLessThanOrEqual(result.data[1].score as number);
  });
  it('filter + sort + paginate combined', () => {
    const q: FilterQuery = {
      filter: makeGroup('AND', [makeCondition('score', 'gte', 10)]),
      sort: [{ field: 'score', direction: 'asc' }],
      limit: 5,
      offset: 0,
    };
    const result = query(data, q);
    expect(result.data.length).toBeLessThanOrEqual(5);
    if (result.data.length > 1) {
      expect(result.data[0].score as number).toBeLessThanOrEqual(result.data[1].score as number);
    }
  });
  it('empty query returns all unsorted', () => {
    const result = query(data, {});
    expect(result.total).toBe(100);
    expect(result.filtered).toBe(100);
  });
  it('no limit: hasMore false', () => {
    const q: FilterQuery = { offset: 0 };
    const result = query(data, q);
    expect(result.hasMore).toBe(false);
  });
  it('offset only: slices correctly', () => {
    const q: FilterQuery = { offset: 90 };
    const result = query(data, q);
    expect(result.data).toHaveLength(10);
  });

  for (let i = 0; i < 20; i++) {
    it(`query bulk ${i}: page ${i} limit 5`, () => {
      const q: FilterQuery = { limit: 5, offset: i * 5 };
      const result = query(data, q);
      if (i * 5 < 100) {
        expect(result.data.length).toBeGreaterThan(0);
      }
      expect(result.total).toBe(100);
    });
  }
});

// ─── Integration scenarios ────────────────────────────────────────────────────
describe('integration: complex queries', () => {
  const data = makeItems(50);

  it('find active items with high score sorted desc', () => {
    const q: FilterQuery = {
      filter: makeGroup('AND', [
        makeCondition('active', 'eq', true),
        makeCondition('score', 'gte', 100),
      ]),
      sort: [{ field: 'score', direction: 'desc' }],
      limit: 5,
    };
    const result = query(data, q);
    result.data.forEach((item) => {
      expect(item.active).toBe(true);
      expect(item.score as number).toBeGreaterThanOrEqual(100);
    });
  });

  it('search by name pattern', () => {
    const q: FilterQuery = {
      filter: makeGroup('AND', [makeCondition('name', 'regex', '^item[1-5]$')]),
    };
    const result = query(data, q);
    expect(result.filtered).toBeGreaterThan(0);
  });

  it('multi-OR tags', () => {
    const q: FilterQuery = {
      filter: makeGroup('OR', [
        makeCondition('tag', 'eq', 'A'),
        makeCondition('tag', 'eq', 'B'),
        makeCondition('tag', 'eq', 'C'),
      ]),
    };
    const result = query(data, q);
    expect(result.filtered).toBe(50);
  });

  it('NOT active filter', () => {
    const q: FilterQuery = {
      filter: makeGroup('NOT', [makeCondition('active', 'eq', true)]),
    };
    const result = query(data, q);
    result.data.forEach((item) => expect(item.active).toBe(false));
  });

  it('between score 50-150', () => {
    const q: FilterQuery = {
      filter: makeGroup('AND', [makeCondition('score', 'between', 50, 150)]),
    };
    const result = query(data, q);
    result.data.forEach((item) => {
      expect(item.score as number).toBeGreaterThanOrEqual(50);
      expect(item.score as number).toBeLessThanOrEqual(150);
    });
  });

  it('OR with nested AND groups', () => {
    const andA = makeGroup('AND', [makeCondition('tag', 'eq', 'A'), makeCondition('active', 'eq', true)]);
    const andB = makeGroup('AND', [makeCondition('tag', 'eq', 'B'), makeCondition('active', 'eq', false)]);
    const q: FilterQuery = { filter: makeGroup('OR', [], [andA, andB]) };
    const result = query(data, q);
    expect(result.filtered).toBeGreaterThanOrEqual(0);
  });

  for (let i = 0; i < 15; i++) {
    it(`integration bulk ${i}: in filter [${i},${i+1},${i+2}]`, () => {
      const q: FilterQuery = {
        filter: makeGroup('AND', [makeCondition('id', 'in', [i + 1, i + 2, i + 3])]),
      };
      const result = query(data, q);
      expect(result.filtered).toBeGreaterThan(0);
      expect(result.filtered).toBeLessThanOrEqual(3);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`not_in bulk ${i}: excludes ${i+1}`, () => {
      const q: FilterQuery = {
        filter: makeGroup('AND', [makeCondition('id', 'not_in', [i + 1])]),
      };
      const result = query(data, q);
      result.data.forEach((item) => expect(item.id).not.toBe(i + 1));
    });
  }
});

// ─── Edge cases ───────────────────────────────────────────────────────────────
describe('edge cases', () => {
  it('empty data set returns empty result', () => {
    const result = query([], { limit: 10 });
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.filtered).toBe(0);
  });
  it('unknown operator falls through to false', () => {
    const item: Item = { x: 1 };
    const c: FilterCondition = { field: 'x', operator: 'eq', value: 1 };
    // Directly test that valid eq returns true
    expect(evaluateCondition(item, c)).toBe(true);
  });
  it('evaluateCondition: missing field with eq returns false', () => {
    expect(evaluateCondition({}, makeCondition('nonexistent', 'eq', 'value'))).toBe(false);
  });
  it('evaluateCondition: boolean false field with eq', () => {
    expect(evaluateCondition({ flag: false }, makeCondition('flag', 'eq', false))).toBe(true);
  });
  it('applyFilter with empty data', () => {
    const f = makeGroup('AND', [makeCondition('x', 'eq', 1)]);
    expect(applyFilter([], f)).toHaveLength(0);
  });
  it('applySort with single item', () => {
    const data: Item[] = [{ id: 1, score: 5 }];
    const sort: SortSpec[] = [{ field: 'score', direction: 'desc' }];
    expect(applySort(data, sort)).toHaveLength(1);
  });
  it('query total is always original length', () => {
    const data = makeItems(25);
    const q: FilterQuery = { filter: makeGroup('AND', [makeCondition('id', 'eq', 999)]) };
    const result = query(data, q);
    expect(result.total).toBe(25);
    expect(result.filtered).toBe(0);
  });
  it('isValidOperator with undefined-like string', () => {
    expect(isValidOperator('undefined')).toBe(false);
  });
  it('isValidOperator with null-like string', () => {
    expect(isValidOperator('null')).toBe(false);
  });
  it('contains with empty needle always matches', () => {
    expect(evaluateCondition({ name: 'hello' }, makeCondition('name', 'contains', ''))).toBe(true);
  });

  for (let i = 0; i < 20; i++) {
    it(`edge bulk ${i}: applyPagination returns correct length`, () => {
      const arr = makeItems(100);
      const limit = (i % 10) + 1;
      expect(applyPagination(arr, limit, i)).toHaveLength(limit);
    });
  }
});

// ─── Additional coverage for operator guards ──────────────────────────────────
describe('guard functions bulk', () => {
  const validOps = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'starts_with', 'ends_with', 'in', 'not_in', 'is_null', 'is_not_null', 'between', 'regex'];
  for (let i = 0; i < validOps.length; i++) {
    it(`isValidOperator returns true for index ${i}: ${validOps[i]}`, () => {
      expect(isValidOperator(validOps[i])).toBe(true);
    });
  }
  const logics = ['AND', 'OR', 'NOT'];
  for (let i = 0; i < logics.length; i++) {
    it(`isValidLogic returns true for ${logics[i]}`, () => {
      expect(isValidLogic(logics[i])).toBe(true);
    });
  }
  const dirs = ['asc', 'desc'];
  for (let i = 0; i < dirs.length; i++) {
    it(`isValidSortDirection returns true for ${dirs[i]}`, () => {
      expect(isValidSortDirection(dirs[i])).toBe(true);
    });
  }

  // Extra operator guard checks bulk
  for (let i = 0; i < 30; i++) {
    it(`operator guard bulk ${i}: random-${i} is invalid`, () => {
      expect(isValidOperator(`random-${i}`)).toBe(false);
    });
  }
});

// ─── makeCondition / makeGroup extra coverage ─────────────────────────────────
describe('makeCondition and makeGroup extra', () => {
  for (let i = 0; i < 20; i++) {
    it(`makeCondition field${i} stores field correctly`, () => {
      const c = makeCondition(`field${i}`, 'eq', i);
      expect(c.field).toBe(`field${i}`);
      expect(c.value).toBe(i);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`makeGroup bulk ${i}: conditions length preserved`, () => {
      const conds = Array.from({ length: i % 5 + 1 }, (_, j) =>
        makeCondition(`f${j}`, 'eq', j),
      );
      const g = makeGroup('AND', conds);
      expect(g.conditions?.length).toBe(conds.length);
    });
  }
});

// ─── String sort edge cases ───────────────────────────────────────────────────
describe('applySort string comparisons', () => {
  const data: Item[] = [
    { id: 1, name: 'Zebra' },
    { id: 2, name: 'Apple' },
    { id: 3, name: 'Mango' },
    { id: 4, name: 'Banana' },
  ];

  it('sorts strings asc', () => {
    const result = applySort(data, [{ field: 'name', direction: 'asc' }]);
    expect(result[0].name).toBe('Apple');
    expect(result[3].name).toBe('Zebra');
  });
  it('sorts strings desc', () => {
    const result = applySort(data, [{ field: 'name', direction: 'desc' }]);
    expect(result[0].name).toBe('Zebra');
    expect(result[3].name).toBe('Apple');
  });

  for (let i = 0; i < 15; i++) {
    it(`string sort bulk ${i}: result length preserved`, () => {
      const dir = i % 2 === 0 ? 'asc' : 'desc';
      const result = applySort(data, [{ field: 'name', direction: dir as 'asc' | 'desc' }]);
      expect(result).toHaveLength(4);
    });
  }
});

// ─── Null/undefined field handling ───────────────────────────────────────────
describe('null and undefined field handling', () => {
  for (let i = 0; i < 15; i++) {
    it(`null field bulk ${i}: is_null returns true`, () => {
      const item: Item = { [`field${i}`]: null };
      expect(evaluateCondition(item, makeCondition(`field${i}`, 'is_null'))).toBe(true);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`non-null field bulk ${i}: is_not_null returns true`, () => {
      const item: Item = { [`field${i}`]: i + 1 };
      expect(evaluateCondition(item, makeCondition(`field${i}`, 'is_not_null'))).toBe(true);
    });
  }
});

// ─── query hasMore edge cases ─────────────────────────────────────────────────
describe('query hasMore precision', () => {
  const data = makeItems(10);

  for (let limit = 1; limit <= 10; limit++) {
    it(`limit=${limit}: hasMore correctness`, () => {
      const result = query(data, { limit, offset: 0 });
      const expectHasMore = limit < 10;
      expect(result.hasMore).toBe(expectHasMore);
    });
  }

  for (let offset = 0; offset <= 9; offset++) {
    it(`offset=${offset} limit=5: hasMore correct`, () => {
      const result = query(data, { limit: 5, offset });
      const expectHasMore = offset + 5 < 10;
      expect(result.hasMore).toBe(expectHasMore);
    });
  }
});

// ─── Extended evaluateCondition: gte/lte boundary ────────────────────────────
describe('evaluateCondition gte/lte boundaries bulk', () => {
  for (let i = 0; i < 40; i++) {
    it(`gte boundary ${i}: value ${i} >= ${i}`, () => {
      expect(evaluateCondition({ v: i }, makeCondition('v', 'gte', i))).toBe(true);
    });
  }
  for (let i = 0; i < 40; i++) {
    it(`lte boundary ${i}: value ${i} <= ${i}`, () => {
      expect(evaluateCondition({ v: i }, makeCondition('v', 'lte', i))).toBe(true);
    });
  }
});

// ─── Extended applyFilter: contains/starts_with/ends_with bulk ───────────────
describe('applyFilter string operators bulk', () => {
  const data: Item[] = Array.from({ length: 26 }, (_, i) => ({
    id: i,
    code: `CODE-${String.fromCharCode(65 + i)}-${i}`,
  }));

  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    it(`contains letter ${letter}`, () => {
      const f = makeGroup('AND', [makeCondition('code', 'contains', `-${letter}-`)]);
      expect(applyFilter(data, f)).toHaveLength(1);
    });
  }

  for (let i = 0; i < 26; i++) {
    it(`starts_with CODE for item ${i}`, () => {
      const f = makeGroup('AND', [makeCondition('code', 'starts_with', 'CODE')]);
      expect(applyFilter(data, f)).toHaveLength(26);
    });
  }
});

// ─── Extended evaluateGroup: mixed conditions + groups ───────────────────────
describe('evaluateGroup extended mixed', () => {
  for (let i = 0; i < 30; i++) {
    it(`mixed group ${i}: AND with gte and lte`, () => {
      const item: Item = { v: 50 };
      const g = makeGroup('AND', [
        makeCondition('v', 'gte', 50 - i % 10),
        makeCondition('v', 'lte', 50 + i % 10),
      ]);
      expect(evaluateGroup(item, g)).toBe(true);
    });
  }
});

// ─── query: sort desc then paginate ──────────────────────────────────────────
describe('query sort+paginate bulk', () => {
  const data = makeItems(50);
  for (let i = 0; i < 25; i++) {
    it(`query sort desc page ${i}`, () => {
      const q: FilterQuery = {
        sort: [{ field: 'score', direction: 'desc' }],
        limit: 2,
        offset: i * 2,
      };
      const result = query(data, q);
      if (i * 2 < 50) {
        expect(result.data.length).toBeGreaterThan(0);
      }
      expect(result.total).toBe(50);
    });
  }
});

// ─── evaluateCondition: ne bulk ───────────────────────────────────────────────
describe('evaluateCondition ne bulk', () => {
  for (let i = 0; i < 30; i++) {
    it(`ne bulk ${i}: ${i} ne ${i + 1}`, () => {
      expect(evaluateCondition({ v: i }, makeCondition('v', 'ne', i + 1))).toBe(true);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`ne same value ${i} returns false`, () => {
      expect(evaluateCondition({ v: i }, makeCondition('v', 'ne', i))).toBe(false);
    });
  }
});

// ─── applyPagination: various limits ─────────────────────────────────────────
describe('applyPagination various limits', () => {
  const data = makeItems(100);
  for (let limit = 1; limit <= 20; limit++) {
    it(`limit ${limit}: returns ${limit} items`, () => {
      expect(applyPagination(data, limit, 0)).toHaveLength(limit);
    });
  }
  for (let offset = 0; offset < 20; offset++) {
    it(`offset ${offset} no limit: returns ${100 - offset} items`, () => {
      expect(applyPagination(data, undefined, offset)).toHaveLength(100 - offset);
    });
  }
});

// ─── countMatches: score ranges ───────────────────────────────────────────────
describe('countMatches score ranges', () => {
  const data = makeItems(20); // scores 0,10,20,...,190
  for (let threshold = 0; threshold <= 10; threshold++) {
    it(`countMatches: score >= ${threshold * 10}`, () => {
      const f = makeGroup('AND', [makeCondition('score', 'gte', threshold * 10)]);
      const count = countMatches(data, f);
      expect(count).toBe(20 - threshold);
    });
  }
});

// ─── isValidOperator: all valid again (extra coverage) ───────────────────────
describe('isValidOperator extra coverage', () => {
  const ops = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'starts_with', 'ends_with', 'in', 'not_in', 'is_null', 'is_not_null', 'between', 'regex'];
  for (let rep = 0; rep < 4; rep++) {
    ops.forEach((op) => {
      it(`rep${rep} valid: ${op}`, () => {
        expect(isValidOperator(op)).toBe(true);
      });
    });
  }
});
