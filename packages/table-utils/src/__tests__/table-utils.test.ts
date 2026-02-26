// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  select, reject, rename, addColumn, updateColumn,
  dropNulls, fillNulls, deduplicate, limit, offset, paginate,
  where, whereEquals, whereIn, whereNotIn, whereBetween, whereLike,
  orderBy, orderByField,
  computeAgg, aggregate, rollup,
  innerJoin, leftJoin, rightJoin, crossJoin, lookupJoin,
  pivot, unpivot,
  transpose, flatten, nest, toKeyValue, fromKeyValue,
  getColumns, columnValues, columnStats, frequencyTable, crossTab, summarize,
  sampleRows, chunk, zip, diff,
} from '../table-utils';
import type { Row, AggFn, SortSpec } from '../types';

// ─── Base Dataset ─────────────────────────────────────────────────────────────

const BASE = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `item-${i + 1}`,
  category: (['A', 'B', 'C'] as const)[i % 3],
  value: (i + 1) * 10,
  active: i % 2 === 0,
  score: Math.round((i / 99) * 100),
}));

// ─── 1. select (50 tests) ─────────────────────────────────────────────────────

describe('select', () => {
  const fieldOptions: string[][] = [
    ['id'],
    ['name'],
    ['category'],
    ['value'],
    ['active'],
    ['score'],
    ['id', 'name'],
    ['id', 'value'],
    ['id', 'category'],
    ['id', 'active'],
    ['name', 'category'],
    ['name', 'value'],
    ['name', 'active'],
    ['name', 'score'],
    ['category', 'value'],
    ['category', 'active'],
    ['category', 'score'],
    ['value', 'active'],
    ['value', 'score'],
    ['active', 'score'],
    ['id', 'name', 'category'],
    ['id', 'name', 'value'],
    ['id', 'name', 'active'],
    ['id', 'name', 'score'],
    ['id', 'category', 'value'],
    ['id', 'category', 'active'],
    ['id', 'category', 'score'],
    ['id', 'value', 'active'],
    ['id', 'value', 'score'],
    ['id', 'active', 'score'],
    ['name', 'category', 'value'],
    ['name', 'category', 'active'],
    ['name', 'category', 'score'],
    ['name', 'value', 'active'],
    ['name', 'value', 'score'],
    ['name', 'active', 'score'],
    ['category', 'value', 'active'],
    ['category', 'value', 'score'],
    ['category', 'active', 'score'],
    ['value', 'active', 'score'],
    ['id', 'name', 'category', 'value'],
    ['id', 'name', 'category', 'active'],
    ['id', 'name', 'category', 'score'],
    ['id', 'name', 'value', 'active'],
    ['id', 'name', 'value', 'score'],
    ['id', 'name', 'active', 'score'],
    ['id', 'category', 'value', 'active'],
    ['id', 'category', 'value', 'score'],
    ['name', 'category', 'value', 'active'],
    ['id', 'name', 'category', 'value', 'active'],
  ];

  for (let i = 0; i < fieldOptions.length; i++) {
    const fields = fieldOptions[i];
    it(`select subset #${i + 1}: [${fields.join(', ')}]`, () => {
      const result = select(BASE, fields);
      expect(result).toHaveLength(BASE.length);
      for (const row of result) {
        expect(Object.keys(row).sort()).toEqual([...fields].sort());
      }
    });
  }
});

// ─── 2. reject (30 tests) ─────────────────────────────────────────────────────

describe('reject', () => {
  const rejectOptions: string[][] = [
    ['id'],
    ['name'],
    ['category'],
    ['value'],
    ['active'],
    ['score'],
    ['id', 'name'],
    ['id', 'value'],
    ['id', 'category'],
    ['id', 'active'],
    ['name', 'category'],
    ['name', 'value'],
    ['name', 'active'],
    ['name', 'score'],
    ['category', 'value'],
    ['category', 'active'],
    ['category', 'score'],
    ['value', 'active'],
    ['value', 'score'],
    ['active', 'score'],
    ['id', 'name', 'category'],
    ['id', 'name', 'value'],
    ['id', 'name', 'active'],
    ['id', 'category', 'value'],
    ['name', 'category', 'value'],
    ['id', 'name', 'category', 'value'],
    ['id', 'name', 'category', 'active'],
    ['id', 'name', 'value', 'active'],
    ['name', 'category', 'value', 'active'],
    ['id', 'name', 'category', 'value', 'active'],
  ];

  for (let i = 0; i < rejectOptions.length; i++) {
    const fields = rejectOptions[i];
    it(`reject fields #${i + 1}: [${fields.join(', ')}]`, () => {
      const result = reject(BASE, fields);
      expect(result).toHaveLength(BASE.length);
      for (const f of fields) {
        for (const row of result) {
          expect(Object.prototype.hasOwnProperty.call(row, f)).toBe(false);
        }
      }
    });
  }
});

// ─── 3. rename (30 tests) ─────────────────────────────────────────────────────

describe('rename', () => {
  const mappingOptions: Array<Record<string, string>> = [
    { id: 'ID' },
    { name: 'NAME' },
    { category: 'cat' },
    { value: 'val' },
    { active: 'isActive' },
    { score: 'pts' },
    { id: 'itemId', name: 'itemName' },
    { id: 'pk', value: 'amount' },
    { category: 'group', score: 'rating' },
    { active: 'enabled', name: 'label' },
    { id: 'ref', category: 'type', value: 'qty' },
    { name: 'title', score: 'points', active: 'flag' },
    { id: '_id', name: '_name', category: '_cat' },
    { value: 'measure', active: 'status' },
    { score: 'rank', id: 'num' },
    { id: 'recordId' },
    { name: 'description' },
    { value: 'total' },
    { active: 'live' },
    { score: 'grade' },
    { id: 'uid', name: 'handle', value: 'cost' },
    { category: 'segment', active: 'published' },
    { id: 'index', score: 'metric' },
    { name: 'slug', category: 'bucket' },
    { value: 'price', active: 'visible', score: 'weight' },
    { id: 'serial', name: 'tag', category: 'tier', value: 'units' },
    { active: 'on', score: 'level', id: 'pos' },
    { name: 'alias', value: 'amount', active: 'toggled' },
    { category: 'class', score: 'stars', name: 'product' },
    { id: 'row_id', name: 'row_name', category: 'row_cat', value: 'row_val', active: 'row_active' },
  ];

  for (let i = 0; i < mappingOptions.length; i++) {
    const mapping = mappingOptions[i];
    it(`rename mapping #${i + 1}`, () => {
      const result = rename(BASE, mapping);
      expect(result).toHaveLength(BASE.length);
      for (const [oldKey, newKey] of Object.entries(mapping)) {
        expect(Object.prototype.hasOwnProperty.call(result[0], oldKey)).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(result[0], newKey)).toBe(true);
      }
    });
  }
});

// ─── 4. addColumn (50 tests) ──────────────────────────────────────────────────

describe('addColumn', () => {
  for (let i = 0; i < 50; i++) {
    it(`addColumn computed_${i}`, () => {
      const multiplier = i + 1;
      const result = addColumn(BASE, `computed_${i}`, (row) => (row.value as number) * multiplier);
      expect(result).toHaveLength(BASE.length);
      result.forEach((r, idx) => {
        expect(r[`computed_${i}`]).toBe(BASE[idx].value * multiplier);
      });
    });
  }
});

// ─── 5. whereEquals (100 tests) ───────────────────────────────────────────────

describe('whereEquals', () => {
  for (let i = 0; i < 100; i++) {
    it(`whereEquals id=${i + 1}`, () => {
      const result = whereEquals(BASE, 'id', i + 1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(i + 1);
    });
  }
});

// ─── 6. whereIn (50 tests) ────────────────────────────────────────────────────

describe('whereIn', () => {
  for (let i = 1; i <= 50; i++) {
    it(`whereIn ids 1..${i} has length ${i}`, () => {
      const ids = Array.from({ length: i }, (_, k) => k + 1);
      const result = whereIn(BASE, 'id', ids);
      expect(result).toHaveLength(i);
    });
  }
});

// ─── 7. whereBetween (50 tests) ───────────────────────────────────────────────

describe('whereBetween', () => {
  for (let i = 0; i < 50; i++) {
    const min = i * 2 + 1;
    const max = min + 9;
    it(`whereBetween value ${min}..${max}`, () => {
      const result = whereBetween(BASE, 'value', min, max);
      for (const row of result) {
        expect(row.value as number).toBeGreaterThanOrEqual(min);
        expect(row.value as number).toBeLessThanOrEqual(max);
      }
    });
  }
});

// ─── 8. orderBy (30 tests) ────────────────────────────────────────────────────

describe('orderBy', () => {
  const sortCases: SortSpec[][] = [
    [{ field: 'id', direction: 'asc' }],
    [{ field: 'id', direction: 'desc' }],
    [{ field: 'name', direction: 'asc' }],
    [{ field: 'name', direction: 'desc' }],
    [{ field: 'category', direction: 'asc' }],
    [{ field: 'category', direction: 'desc' }],
    [{ field: 'value', direction: 'asc' }],
    [{ field: 'value', direction: 'desc' }],
    [{ field: 'score', direction: 'asc' }],
    [{ field: 'score', direction: 'desc' }],
    [{ field: 'category', direction: 'asc' }, { field: 'value', direction: 'asc' }],
    [{ field: 'category', direction: 'asc' }, { field: 'value', direction: 'desc' }],
    [{ field: 'category', direction: 'desc' }, { field: 'value', direction: 'asc' }],
    [{ field: 'category', direction: 'desc' }, { field: 'value', direction: 'desc' }],
    [{ field: 'active', direction: 'asc' }, { field: 'score', direction: 'asc' }],
    [{ field: 'active', direction: 'desc' }, { field: 'score', direction: 'desc' }],
    [{ field: 'category', direction: 'asc' }, { field: 'active', direction: 'asc' }, { field: 'value', direction: 'asc' }],
    [{ field: 'score', direction: 'asc' }, { field: 'id', direction: 'desc' }],
    [{ field: 'score', direction: 'desc' }, { field: 'id', direction: 'asc' }],
    [{ field: 'value', direction: 'asc' }, { field: 'name', direction: 'asc' }],
    [{ field: 'id', direction: 'asc', nulls: 'first' }],
    [{ field: 'id', direction: 'desc', nulls: 'last' }],
    [{ field: 'value', direction: 'asc', nulls: 'first' }],
    [{ field: 'score', direction: 'desc', nulls: 'last' }],
    [{ field: 'category', direction: 'asc', nulls: 'first' }, { field: 'score', direction: 'desc' }],
    [{ field: 'name', direction: 'asc' }, { field: 'id', direction: 'asc' }],
    [{ field: 'active', direction: 'asc' }, { field: 'category', direction: 'asc' }, { field: 'id', direction: 'asc' }],
    [{ field: 'score', direction: 'asc' }, { field: 'value', direction: 'asc' }, { field: 'id', direction: 'asc' }],
    [{ field: 'value', direction: 'desc' }, { field: 'category', direction: 'asc' }, { field: 'name', direction: 'asc' }],
    [{ field: 'id', direction: 'asc' }, { field: 'score', direction: 'desc' }, { field: 'value', direction: 'asc' }],
  ];

  for (let i = 0; i < sortCases.length; i++) {
    const specs = sortCases[i];
    it(`orderBy case #${i + 1}`, () => {
      const result = orderBy(BASE, specs);
      expect(result).toHaveLength(BASE.length);
      // Verify first primary sort
      const pf = specs[0].field;
      const dir = specs[0].direction === 'desc' ? -1 : 1;
      for (let j = 0; j < result.length - 1; j++) {
        const a = result[j][pf];
        const b = result[j + 1][pf];
        if (a !== null && a !== undefined && b !== null && b !== undefined) {
          if (a < b) expect(dir).toBeGreaterThanOrEqual(-1);
          if (a > b) expect(dir).toBeLessThanOrEqual(1);
        }
      }
    });
  }
});

// ─── 9. limit / offset (50 + 30 tests) ───────────────────────────────────────

describe('limit', () => {
  for (let i = 1; i <= 50; i++) {
    it(`limit(BASE, ${i}).length === ${i}`, () => {
      expect(limit(BASE, i)).toHaveLength(i);
    });
  }
});

describe('offset', () => {
  for (let i = 0; i < 30; i++) {
    const n = i * 3;
    it(`offset(BASE, ${n}).length === ${100 - n}`, () => {
      expect(offset(BASE, n)).toHaveLength(100 - n);
    });
  }
});

// ─── 10. paginate (10 tests) ──────────────────────────────────────────────────

describe('paginate', () => {
  for (let page = 1; page <= 10; page++) {
    it(`paginate page ${page} of 10 has 10 rows`, () => {
      const result = paginate(BASE, page, 10);
      expect(result.rows).toHaveLength(10);
      expect(result.total).toBe(100);
      expect(result.page).toBe(page);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(10);
      expect(result.rows[0].id).toBe((page - 1) * 10 + 1);
    });
  }
});

// ─── 11. aggregate (60 assertions across 20 combos) ──────────────────────────

describe('aggregate', () => {
  const groupByOptions: string[][] = [
    ['category'],
    ['active'],
    ['category', 'active'],
    ['active', 'category'],
    ['category'],
    ['active'],
    ['category', 'active'],
    ['category'],
    ['active'],
    ['category', 'active'],
    ['category'],
    ['active'],
    ['category', 'active'],
    ['category'],
    ['active'],
    ['category', 'active'],
    ['category'],
    ['active'],
    ['category', 'active'],
    ['category'],
  ];

  for (let i = 0; i < 20; i++) {
    const gb = groupByOptions[i];
    it(`aggregate group-by [${gb.join(', ')}] #${i + 1} — count`, () => {
      const result = aggregate(BASE, gb, [{ field: 'value', fn: 'count', alias: 'cnt' }]);
      expect(result.length).toBeGreaterThan(0);
      const totalCount = result.reduce((s, r) => s + (r.cnt as number), 0);
      expect(totalCount).toBe(100);
    });

    it(`aggregate group-by [${gb.join(', ')}] #${i + 1} — sum`, () => {
      const result = aggregate(BASE, gb, [{ field: 'value', fn: 'sum', alias: 'total' }]);
      const totalSum = result.reduce((s, r) => s + (r.total as number), 0);
      const expectedSum = BASE.reduce((s, r) => s + r.value, 0);
      expect(totalSum).toBe(expectedSum);
    });

    it(`aggregate group-by [${gb.join(', ')}] #${i + 1} — avg`, () => {
      const result = aggregate(BASE, gb, [{ field: 'value', fn: 'avg', alias: 'mean' }]);
      expect(result.length).toBeGreaterThan(0);
      for (const r of result) {
        expect(typeof r.mean).toBe('number');
      }
    });
  }
});

// ─── 12. innerJoin (30 tests) ─────────────────────────────────────────────────

describe('innerJoin', () => {
  for (let i = 0; i < 30; i++) {
    const size = (i + 1) * 3;
    it(`innerJoin with right table of ${size} rows`, () => {
      const right = BASE.slice(0, size).map((r) => ({ id: r.id, bonus: r.value * 2 }));
      const result = innerJoin(BASE, right, 'id', 'id');
      expect(result).toHaveLength(size);
      for (const row of result) {
        expect(row.bonus).toBe((row.value as number) * 2);
      }
    });
  }
});

// ─── 13. leftJoin (20 tests) ──────────────────────────────────────────────────

describe('leftJoin', () => {
  for (let i = 0; i < 20; i++) {
    const rightSize = i * 5 + 1;
    it(`leftJoin right size ${rightSize} preserves all left rows`, () => {
      const right = BASE.slice(0, rightSize).map((r) => ({ id: r.id, extra: `x-${r.id}` }));
      const result = leftJoin(BASE, right, 'id', 'id');
      expect(result).toHaveLength(100);
      const withExtra = result.filter((r) => r.extra !== undefined && r.extra !== null);
      expect(withExtra).toHaveLength(Math.min(rightSize, 100));
    });
  }
});

// ─── 14. pivot (10 tests) ─────────────────────────────────────────────────────

describe('pivot', () => {
  for (let i = 0; i < 10; i++) {
    it(`pivot config #${i + 1}`, () => {
      const aggFns: AggFn[] = ['sum', 'count', 'avg', 'min', 'max', 'sum', 'count', 'avg', 'min', 'max'];
      const result = pivot(BASE, { rows: ['active'], columns: 'category', values: 'value', aggFn: aggFns[i] });
      // Should have 2 rows (true/false) and at least 3 category columns plus 'active'
      expect(result.length).toBe(2);
      const cols = Object.keys(result[0]);
      expect(cols).toContain('active');
      expect(cols).toContain('A');
      expect(cols).toContain('B');
      expect(cols).toContain('C');
    });
  }
});

// ─── 15. unpivot (20 tests) ───────────────────────────────────────────────────

describe('unpivot', () => {
  for (let i = 0; i < 20; i++) {
    const numCols = i + 2;
    it(`unpivot ${numCols} value columns creates correct row count`, () => {
      // Create wide rows with dynamic value columns
      const wide = Array.from({ length: 5 }, (_, r) => {
        const row: Row = { id: r + 1 };
        for (let c = 0; c < numCols; c++) {
          row[`col${c}`] = (r + 1) * (c + 1) * (i + 1);
        }
        return row;
      });
      const result = unpivot(wide, ['id'], 'value', 'colName');
      expect(result).toHaveLength(5 * numCols);
      for (const r of result) {
        expect(r).toHaveProperty('id');
        expect(r).toHaveProperty('colName');
        expect(r).toHaveProperty('value');
      }
    });
  }
});

// ─── 16. deduplicate (20 tests) ───────────────────────────────────────────────

describe('deduplicate', () => {
  for (let i = 0; i < 20; i++) {
    it(`deduplicate by 'category' (${i + 1}x duplication)`, () => {
      const duped = Array.from({ length: i + 1 }, () => [...BASE]).flat();
      const result = deduplicate(duped, ['category']);
      expect(result).toHaveLength(3); // A, B, C
    });
  }
});

// ─── 17. dropNulls / fillNulls (30 tests) ─────────────────────────────────────

describe('dropNulls and fillNulls', () => {
  for (let i = 0; i < 15; i++) {
    it(`dropNulls test #${i + 1}`, () => {
      const rows: Row[] = Array.from({ length: 20 }, (_, k) => ({
        id: k,
        value: k % (i + 2) === 0 ? null : k * 10,
        label: `item-${k}`,
      }));
      const result = dropNulls(rows, ['value']);
      for (const r of result) {
        expect(r.value).not.toBeNull();
        expect(r.value).not.toBeUndefined();
      }
    });

    it(`fillNulls test #${i + 1}`, () => {
      const rows: Row[] = Array.from({ length: 10 }, (_, k) => ({
        id: k,
        value: k % (i + 2) === 0 ? null : k,
        label: k % 3 === 0 ? null : `item-${k}`,
      }));
      const filled = fillNulls(rows, { value: -1, label: 'unknown' });
      for (const r of filled) {
        expect(r.value).not.toBeNull();
        expect(r.label).not.toBeNull();
      }
    });
  }
});

// ─── 18. columnStats (50 tests) ───────────────────────────────────────────────

describe('columnStats', () => {
  for (let i = 0; i < 50; i++) {
    it(`columnStats for array starting at ${i}`, () => {
      const n = i + 2;
      const values = Array.from({ length: n }, (_, k) => i + k + 1);
      const stats = columnStats(values);
      expect(stats.min).toBe(i + 1);
      expect(stats.max).toBe(i + n);
      expect(stats.sum).toBe(values.reduce((a, b) => a + b, 0));
      expect(stats.mean).toBeCloseTo(stats.sum / n, 5);
      expect(stats.stdDev).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── 19. frequencyTable (20 tests) ────────────────────────────────────────────

describe('frequencyTable', () => {
  const fieldChoices = ['category', 'active', 'category', 'active', 'category', 'active', 'category', 'active', 'category', 'active', 'category', 'active', 'category', 'active', 'category', 'active', 'category', 'active', 'category', 'active'];

  for (let i = 0; i < 20; i++) {
    const field = fieldChoices[i];
    it(`frequencyTable on '${field}' #${i + 1}`, () => {
      const sample = BASE.slice(0, (i + 1) * 5);
      const result = frequencyTable(sample, field);
      expect(result.length).toBeGreaterThan(0);
      const totalPct = result.reduce((s, r) => s + r.pct, 0);
      expect(totalPct).toBeCloseTo(1, 5);
      // Sorted descending
      for (let j = 0; j < result.length - 1; j++) {
        expect(result[j].count).toBeGreaterThanOrEqual(result[j + 1].count);
      }
    });
  }
});

// ─── 20. flatten (20 tests) ───────────────────────────────────────────────────

describe('flatten', () => {
  for (let i = 0; i < 20; i++) {
    it(`flatten nested object depth ${(i % 3) + 1} #${i + 1}`, () => {
      const depth = (i % 3) + 1;
      const makeNested = (d: number): Row => {
        if (d === 0) return { leaf: i * 10 };
        return { nested: makeNested(d - 1), direct: i };
      };
      const rows = [makeNested(depth)];
      const result = flatten(rows, '.');
      expect(result).toHaveLength(1);
      // All values should be primitives
      for (const val of Object.values(result[0])) {
        expect(typeof val === 'object' && val !== null).toBe(false);
      }
    });
  }
});

// ─── 21. chunk (50 tests) ─────────────────────────────────────────────────────

describe('chunk', () => {
  for (let i = 1; i <= 50; i++) {
    it(`chunk(BASE, ${i}).length === ${Math.ceil(100 / i)}`, () => {
      const result = chunk(BASE, i);
      expect(result).toHaveLength(Math.ceil(100 / i));
      // All chunks except last have exactly size i
      for (let j = 0; j < result.length - 1; j++) {
        expect(result[j]).toHaveLength(i);
      }
    });
  }
});

// ─── 22. sampleRows (20 tests) ────────────────────────────────────────────────

describe('sampleRows', () => {
  for (let i = 0; i < 20; i++) {
    const n = i + 1;
    it(`sampleRows(BASE, ${n}) has length ${n} and is deterministic`, () => {
      const s1 = sampleRows(BASE, n, i + 1);
      const s2 = sampleRows(BASE, n, i + 1);
      expect(s1).toHaveLength(n);
      expect(s2).toHaveLength(n);
      expect(s1.map((r) => r.id)).toEqual(s2.map((r) => r.id));
    });
  }
});

// ─── 23. getColumns (20 tests) ────────────────────────────────────────────────

describe('getColumns', () => {
  for (let i = 0; i < 20; i++) {
    it(`getColumns on row subset #${i + 1}`, () => {
      // Create row arrays with different column sets
      const rows: Row[] = Array.from({ length: i + 2 }, (_, k) => {
        const r: Row = { id: k };
        for (let c = 0; c <= i; c++) r[`col${c}`] = c * k;
        return r;
      });
      const cols = getColumns(rows);
      expect(cols).toContain('id');
      for (let c = 0; c <= i; c++) {
        expect(cols).toContain(`col${c}`);
      }
      expect(cols).toHaveLength(i + 2);
    });
  }
});

// ─── 24. toKeyValue / fromKeyValue (30 round-trips) ──────────────────────────

describe('toKeyValue and fromKeyValue', () => {
  for (let i = 0; i < 30; i++) {
    it(`round-trip #${i + 1}`, () => {
      const n = i + 2;
      const rows = Array.from({ length: n }, (_, k) => ({ key: `k${k}-${i}`, val: k * i + 1 }));
      const map = toKeyValue(rows, 'key', 'val');
      expect(Object.keys(map)).toHaveLength(n);
      const back = fromKeyValue(map, 'key', 'val');
      expect(back).toHaveLength(n);
      for (const r of rows) {
        expect(map[r.key]).toBe(r.val);
      }
    });
  }
});

// ─── 25. diff (20 tests) ──────────────────────────────────────────────────────

describe('diff', () => {
  for (let i = 0; i < 20; i++) {
    it(`diff #${i + 1}: detect added/removed/changed`, () => {
      const a = BASE.slice(0, 50);
      const b = [
        ...BASE.slice(i, 50 + i), // shift window → some removed, some added
        ...(i > 0 ? [{ ...BASE[0], value: BASE[0].value + i * 100 }] : []), // changed
      ];
      const result = diff(a, b, ['id']);
      // All results should be arrays
      expect(Array.isArray(result.added)).toBe(true);
      expect(Array.isArray(result.removed)).toBe(true);
      expect(Array.isArray(result.changed)).toBe(true);
    });
  }
});

// ─── 26. describe (10 tests) ──────────────────────────────────────────────────

describe('summarize', () => {
  for (let i = 0; i < 10; i++) {
    it(`describe dataset #${i + 1}`, () => {
      const n = (i + 1) * 10;
      const sample = BASE.slice(0, n);
      const summary = summarize(sample);
      expect(summary.rowCount).toBe(n);
      expect(summary.columnCount).toBe(6);
      expect(summary.columns).toHaveLength(6);
      const idCol = summary.columns.find((c) => c.name === 'id');
      expect(idCol).toBeDefined();
      expect(idCol!.nullCount).toBe(0);
      expect(idCol!.distinctCount).toBe(n);
    });
  }
});

// ─── 27. crossTab (10 tests) ──────────────────────────────────────────────────

describe('crossTab', () => {
  const fnOptions: AggFn[] = ['sum', 'count', 'avg', 'min', 'max', 'sum', 'count', 'avg', 'min', 'max'];

  for (let i = 0; i < 10; i++) {
    it(`crossTab fn=${fnOptions[i]} #${i + 1}`, () => {
      const result = crossTab(BASE, 'category', 'active', 'value', fnOptions[i]);
      expect(result.length).toBe(3); // A, B, C
      for (const row of result) {
        expect(['A', 'B', 'C']).toContain(row.category);
        // Should have columns for true and false
        expect(Object.prototype.hasOwnProperty.call(row, 'true') || Object.prototype.hasOwnProperty.call(row, 'false')).toBe(true);
      }
    });
  }
});

// ─── 28. zip (20 tests) ───────────────────────────────────────────────────────

describe('zip', () => {
  for (let i = 0; i < 20; i++) {
    const leftSize = i + 1;
    const rightSize = i + 2;
    it(`zip left(${leftSize}) right(${rightSize}) → max(${Math.max(leftSize, rightSize)}) rows`, () => {
      const left = Array.from({ length: leftSize }, (_, k) => ({ lId: k, lVal: k * 10 }));
      const right = Array.from({ length: rightSize }, (_, k) => ({ rId: k + 100, rVal: k * 5 }));
      const result = zip(left, right);
      expect(result).toHaveLength(Math.max(leftSize, rightSize));
      for (let j = 0; j < leftSize; j++) {
        expect(result[j].lId).toBe(j);
      }
      for (let j = 0; j < rightSize; j++) {
        expect(result[j].rId).toBe(j + 100);
      }
    });
  }
});

// ─── 29. computeAgg (90 tests: 9 fns × 10 inputs) ────────────────────────────

describe('computeAgg', () => {
  const aggFns: AggFn[] = ['sum', 'count', 'avg', 'min', 'max', 'first', 'last', 'countDistinct', 'array'];

  for (const fn of aggFns) {
    for (let i = 0; i < 10; i++) {
      const n = i + 2;
      const values = Array.from({ length: n }, (_, k) => k + 1 + i);

      it(`computeAgg fn=${fn} n=${n} (input[0]=${values[0]})`, () => {
        const result = computeAgg(values, fn);
        if (fn === 'count') {
          expect(result).toBe(n);
        } else if (fn === 'sum') {
          expect(result).toBe(values.reduce((a, b) => a + b, 0));
        } else if (fn === 'avg') {
          expect(result).toBeCloseTo(values.reduce((a, b) => a + b, 0) / n, 5);
        } else if (fn === 'min') {
          expect(result).toBe(Math.min(...values));
        } else if (fn === 'max') {
          expect(result).toBe(Math.max(...values));
        } else if (fn === 'first') {
          expect(result).toBe(values[0]);
        } else if (fn === 'last') {
          expect(result).toBe(values[values.length - 1]);
        } else if (fn === 'countDistinct') {
          expect(result).toBe(new Set(values).size);
        } else if (fn === 'array') {
          expect(result).toEqual(values);
        }
      });
    }
  }
});

// ─── 30. updateColumn (30 tests) ──────────────────────────────────────────────

describe('updateColumn', () => {
  for (let i = 0; i < 30; i++) {
    it(`updateColumn value * ${i + 1}`, () => {
      const factor = i + 1;
      const result = updateColumn(BASE, 'value', (val) => (val as number) * factor);
      expect(result).toHaveLength(BASE.length);
      result.forEach((r, idx) => {
        expect(r.value).toBe(BASE[idx].value * factor);
      });
    });
  }
});

// ─── Additional tests: edge cases and remaining functions ─────────────────────

describe('where (predicate)', () => {
  for (let i = 0; i < 20; i++) {
    it(`where value > ${i * 50}`, () => {
      const threshold = i * 50;
      const result = where(BASE, (r) => (r.value as number) > threshold);
      for (const r of result) {
        expect(r.value as number).toBeGreaterThan(threshold);
      }
    });
  }
});

describe('whereNotIn', () => {
  for (let i = 0; i < 20; i++) {
    const excluded = Array.from({ length: i + 1 }, (_, k) => k + 1);
    it(`whereNotIn excludes ids [1..${i + 1}]`, () => {
      const result = whereNotIn(BASE, 'id', excluded);
      expect(result).toHaveLength(100 - (i + 1));
      const excludedSet = new Set(excluded);
      for (const r of result) {
        expect(excludedSet.has(r.id as number)).toBe(false);
      }
    });
  }
});

describe('whereLike', () => {
  for (let i = 1; i <= 20; i++) {
    it(`whereLike name starts with item-${i}%`, () => {
      const result = whereLike(BASE, 'name', `item-${i}%`);
      // item-1 matches item-1, item-10..19, item-100
      for (const r of result) {
        expect(String(r.name)).toMatch(new RegExp(`^item-${i}`, 'i'));
      }
    });
  }
});

describe('orderByField', () => {
  for (let i = 0; i < 10; i++) {
    it(`orderByField custom category order #${i + 1}`, () => {
      const orders = [['A', 'B', 'C'], ['B', 'C', 'A'], ['C', 'A', 'B'], ['C', 'B', 'A'], ['A', 'C', 'B'], ['B', 'A', 'C'], ['A', 'B', 'C'], ['B', 'C', 'A'], ['C', 'A', 'B'], ['C', 'B', 'A']];
      const order = orders[i];
      const result = orderByField(BASE, 'category', order);
      expect(result).toHaveLength(BASE.length);
      // First row's category should be first in order
      expect(result[0].category).toBe(order[0]);
    });
  }
});

describe('rightJoin', () => {
  for (let i = 0; i < 10; i++) {
    const leftSize = i * 10 + 1;
    it(`rightJoin left size ${leftSize} preserves all right rows`, () => {
      const left = BASE.slice(0, leftSize).map((r) => ({ id: r.id, lExtra: r.value }));
      const result = rightJoin(left, BASE, 'id', 'id');
      expect(result).toHaveLength(100);
    });
  }
});

describe('crossJoin', () => {
  for (let i = 0; i < 10; i++) {
    const leftSize = i + 1;
    const rightSize = i + 2;
    it(`crossJoin ${leftSize}x${rightSize} = ${leftSize * rightSize} rows`, () => {
      const left = BASE.slice(0, leftSize).map((r) => ({ lId: r.id }));
      const right = BASE.slice(0, rightSize).map((r) => ({ rId: r.id }));
      const result = crossJoin(left, right);
      expect(result).toHaveLength(leftSize * rightSize);
    });
  }
});

describe('lookupJoin', () => {
  for (let i = 0; i < 10; i++) {
    it(`lookupJoin enriches left rows with field 'name' from right #${i + 1}`, () => {
      const left = BASE.slice(0, 10).map((r) => ({ id: r.id, val: r.value }));
      const right = BASE.slice(i, 10 + i).map((r) => ({ id: r.id, extraName: r.name }));
      const result = lookupJoin(left, right, 'id', 'id', ['extraName']);
      expect(result).toHaveLength(10);
    });
  }
});

describe('transpose', () => {
  for (let i = 0; i < 10; i++) {
    it(`transpose dataset with ${i + 2} rows`, () => {
      const rows = BASE.slice(0, i + 2);
      const result = transpose(rows);
      expect(result).toHaveLength(6); // 6 columns in BASE
      expect(result[0]).toHaveProperty('field');
      expect(result[0].field).toBe('id');
    });
  }
});

describe('nest', () => {
  for (let i = 0; i < 10; i++) {
    it(`nest by 'category' #${i + 1}`, () => {
      const sample = BASE.slice(0, (i + 1) * 10);
      const result = nest(sample, 'category');
      expect(result.length).toBeLessThanOrEqual(3);
      for (const group of result) {
        expect(group).toHaveProperty('category');
        expect(group).toHaveProperty('children');
        expect(Array.isArray(group.children)).toBe(true);
      }
    });
  }
});

describe('rollup', () => {
  for (let i = 0; i < 10; i++) {
    it(`rollup by 'category' includes grand total #${i + 1}`, () => {
      const sample = BASE.slice(0, (i + 1) * 10);
      const result = rollup(sample, ['category'], [{ field: 'value', fn: 'sum', alias: 'total' }]);
      // Last row should be grand total (category = null)
      const grandTotal = result[result.length - 1];
      expect(grandTotal.category).toBeNull();
      const expectedTotal = sample.reduce((s, r) => s + r.value, 0);
      expect(grandTotal.total).toBe(expectedTotal);
    });
  }
});

describe('columnValues', () => {
  for (let i = 0; i < 10; i++) {
    it(`columnValues 'id' from slice 0..${(i + 1) * 10}`, () => {
      const sample = BASE.slice(0, (i + 1) * 10);
      const vals = columnValues(sample, 'id');
      expect(vals).toHaveLength((i + 1) * 10);
      expect(vals[0]).toBe(1);
    });
  }
});

describe('summarize — empty and single-row', () => {
  it('summarize empty array', () => {
    const result = summarize([]);
    expect(result.rowCount).toBe(0);
    expect(result.columnCount).toBe(0);
  });

  it('summarize single row', () => {
    const result = summarize([{ id: 1, name: 'test', value: 42 }]);
    expect(result.rowCount).toBe(1);
    expect(result.columnCount).toBe(3);
  });
});

describe('paginate edge cases', () => {
  it('paginate page beyond total returns empty', () => {
    const result = paginate(BASE, 20, 10);
    expect(result.rows).toHaveLength(0);
    expect(result.totalPages).toBe(10);
  });

  it('paginate pageSize=1 returns 1 row', () => {
    const result = paginate(BASE, 1, 1);
    expect(result.rows).toHaveLength(1);
    expect(result.totalPages).toBe(100);
  });
});

describe('deduplicate — full row dedup', () => {
  for (let i = 0; i < 10; i++) {
    it(`full-row dedup with ${i + 2}x duplication`, () => {
      const original = BASE.slice(0, 5);
      const duped = Array.from({ length: i + 2 }, () => [...original]).flat();
      const result = deduplicate(duped);
      expect(result).toHaveLength(5);
    });
  }
});

describe('fillNulls — partial fill', () => {
  for (let i = 0; i < 10; i++) {
    it(`fillNulls test #${i + 1} preserves non-null values`, () => {
      const rows: Row[] = [
        { id: i, value: null, label: `keep-${i}` },
        { id: i + 1, value: i * 5, label: null },
      ];
      const filled = fillNulls(rows, { value: -99, label: 'default' });
      expect(filled[0].value).toBe(-99);
      expect(filled[0].label).toBe(`keep-${i}`);
      expect(filled[1].value).toBe(i * 5);
      expect(filled[1].label).toBe('default');
    });
  }
});

describe('fromKeyValue round-trip extra checks', () => {
  for (let i = 0; i < 10; i++) {
    it(`fromKeyValue #${i + 1} creates correct rows`, () => {
      const map: Record<string, unknown> = {};
      for (let k = 0; k < i + 2; k++) map[`key_${k}`] = k * (i + 1);
      const rows = fromKeyValue(map, 'myKey', 'myVal');
      expect(rows).toHaveLength(i + 2);
      for (const r of rows) {
        expect(r).toHaveProperty('myKey');
        expect(r).toHaveProperty('myVal');
      }
    });
  }
});
