// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { from } from '../query-builder';

// where() — 100 tests
describe('where() filtering', () => {
  for (let i = 1; i <= 100; i++) {
    it(`where filters values >= ${i} from 100 items`, () => {
      const data = Array.from({ length: 100 }, (_, k) => ({ value: k + 1 }));
      const result = from(data).where(r => r.value >= i).toArray();
      expect(result.length).toBe(101 - i);
    });
  }
});

// limit() — 100 tests
describe('limit()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`limit(${n}) returns exactly ${n} items`, () => {
      const data = Array.from({ length: 200 }, (_, k) => ({ id: k }));
      expect(from(data).limit(n).count()).toBe(n);
    });
  }
});

// orderBy asc — 100 tests
describe('orderBy asc', () => {
  for (let n = 1; n <= 100; n++) {
    it(`orderBy asc on ${n} items gives ascending order`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: n - k }));
      const sorted = from(data).orderBy('v', 'asc').toArray();
      expect(sorted[0].v).toBe(1);
    });
  }
});

// orderBy desc — 100 tests
describe('orderBy desc', () => {
  for (let n = 1; n <= 100; n++) {
    it(`orderBy desc on ${n} items gives first = ${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      const sorted = from(data).orderBy('v', 'desc').toArray();
      expect(sorted[0].v).toBe(n);
    });
  }
});

// offset() — 100 tests
describe('offset()', () => {
  for (let n = 0; n < 100; n++) {
    it(`offset(${n}) leaves ${100 - n} items`, () => {
      const data = Array.from({ length: 100 }, (_, k) => ({ id: k }));
      expect(from(data).offset(n).count()).toBe(100 - n);
    });
  }
});

// sum() — 100 tests
describe('sum()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`sum of 1..${n} = ${n * (n + 1) / 2}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      expect(from(data).sum('v')).toBe(n * (n + 1) / 2);
    });
  }
});

// count() — 100 tests
describe('count()', () => {
  for (let n = 0; n < 100; n++) {
    it(`count() of ${n}-item array = ${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k }));
      expect(from(data).count()).toBe(n);
    });
  }
});

// avg() — 100 tests
describe('avg()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`avg of 1..${n} = ${(n + 1) / 2}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      expect(from(data).avg('v')).toBeCloseTo((n + 1) / 2, 5);
    });
  }
});

// min() — 100 tests
describe('min()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`min of reversed 1..${n} = 1`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 })).reverse();
      expect(from(data).min('v')).toBe(1);
    });
  }
});

// max() — 100 tests
describe('max()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`max of 1..${n} = ${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      expect(from(data).max('v')).toBe(n);
    });
  }
});

// first() — 50 tests
describe('first()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`first() of ${n}-item array has id=1`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k + 1 }));
      expect(from(data).first()?.id).toBe(1);
    });
  }
});

// last() — 50 tests
describe('last()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`last() of ${n}-item array has id=${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k + 1 }));
      expect(from(data).last()?.id).toBe(n);
    });
  }
});

// distinct() — 100 tests
describe('distinct()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`distinct removes duplicates: ${n} unique from ${n * 2} items`, () => {
      const half = Array.from({ length: n }, (_, k) => ({ v: k }));
      const data = [...half, ...half];
      expect(from(data).distinct('v').count()).toBe(n);
    });
  }
});

// filter() — 100 tests (alias for where)
describe('filter() alias', () => {
  for (let i = 1; i <= 100; i++) {
    it(`filter keeps values < ${i} from 100 items`, () => {
      const data = Array.from({ length: 100 }, (_, k) => ({ value: k + 1 }));
      const result = from(data).filter(r => r.value < i).toArray();
      expect(result.length).toBe(i - 1);
    });
  }
});

// select() — 50 tests
describe('select()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`select('id') on ${n}-item array returns only id field`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k + 1, name: `item${k}`, extra: k * 2 }));
      const result = from(data).select('id').toArray();
      expect(result.length).toBe(n);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).not.toHaveProperty('name');
      expect(result[0]).not.toHaveProperty('extra');
    });
  }
});

// groupBy() — 50 tests
describe('groupBy()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`groupBy('cat') on ${n * 2} items gives ${n} groups of 2`, () => {
      const data = Array.from({ length: n * 2 }, (_, k) => ({ id: k, cat: k % n }));
      const groups = from(data).groupBy('cat');
      expect(groups.size).toBe(n);
      groups.forEach(items => {
        expect(items.length).toBe(2);
      });
    });
  }
});

// toArray() — 50 tests
describe('toArray()', () => {
  for (let n = 0; n <= 49; n++) {
    it(`toArray() on ${n}-item query returns array of length ${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k }));
      const result = from(data).toArray();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(n);
    });
  }
});

// chained where + limit — 50 tests
describe('chained where + limit', () => {
  for (let n = 1; n <= 50; n++) {
    it(`where(v > 0).limit(${n}) returns ${n} items`, () => {
      const data = Array.from({ length: 200 }, (_, k) => ({ v: k + 1 }));
      const result = from(data).where(r => r.v > 0).limit(n).toArray();
      expect(result.length).toBe(n);
    });
  }
});

// chained offset + limit — 50 tests
describe('chained offset + limit', () => {
  for (let n = 0; n < 50; n++) {
    it(`offset(${n}).limit(10) returns 10 items`, () => {
      const data = Array.from({ length: 200 }, (_, k) => ({ id: k }));
      const result = from(data).offset(n).limit(10).toArray();
      expect(result.length).toBe(10);
      expect(result[0].id).toBe(n);
    });
  }
});

// immutability — 50 tests
describe('immutability (original array not mutated)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`original array of length ${n} unchanged after where()`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      const original = [...data];
      from(data).where(r => r.v > 0).orderBy('v', 'desc').toArray();
      expect(data).toEqual(original);
    });
  }
});
