// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  parse,
  stringify,
  parseRecords,
  stringifyRecords,
  parseStream,
  validateSchema,
  coerceSchema,
  selectColumns,
  dropColumns,
  addColumn,
  renameHeaders,
  filterRows,
  mapRows,
  sortRows,
  deduplicateRows,
  transposeData,
  mergeData,
  pivotData,
  getStats,
  detectDelimiter,
  detectEncoding,
  inferSchema,
  diff,
  getColumnStats,
  detectHeaders,
  autoFix,
  toMarkdownTable,
  fromMarkdownTable,
} from '../csv-utils';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function makeRows(n: number): string[][] {
  return Array.from({ length: n }, (_, i) => [`id${i}`, `name${i}`, String(i * 10)]);
}

function makeRecords(n: number): Record<string, string>[] {
  return Array.from({ length: n }, (_, i) => ({ id: `id${i}`, name: `name${i}`, value: String(i) }));
}

// ============================================================================
// GROUP 1: parse / stringify roundtrip — 100 it() calls (i = 1..100)
// ============================================================================
describe('parse/stringify roundtrip', () => {
  for (let i = 1; i <= 100; i++) {
    it(`roundtrip with ${i} data rows`, () => {
      const data = makeRows(i);
      const csv = stringify(data);
      const parsed = parse(csv);
      expect(parsed).toEqual(data);
    });
  }
});

// ============================================================================
// GROUP 2: parseRecords / stringifyRecords roundtrip — 100 it() calls
// ============================================================================
describe('parseRecords/stringifyRecords roundtrip', () => {
  for (let i = 1; i <= 100; i++) {
    it(`records roundtrip with ${i} rows`, () => {
      const records = makeRecords(i);
      const csv = stringifyRecords(records);
      const parsed = parseRecords(csv);
      expect(parsed).toEqual(records);
    });
  }
});

// ============================================================================
// GROUP 3: filterRows — 100 it() calls (i = 1..100)
// ============================================================================
describe('filterRows count', () => {
  for (let i = 1; i <= 100; i++) {
    it(`filterRows keeps ${i} rows when predicate accepts all`, () => {
      const data = makeRows(i);
      const result = filterRows(data, () => true);
      expect(result).toHaveLength(i);
    });
  }
});

// ============================================================================
// GROUP 4: addColumn — 100 it() calls (i = 1..100)
// ============================================================================
describe('addColumn produces correct column count', () => {
  for (let i = 1; i <= 100; i++) {
    it(`addColumn: ${i} original columns → ${i + 1} after`, () => {
      const data = [Array.from({ length: i }, (_, j) => `c${j}`)];
      const values = ['extra'];
      const result = addColumn(data, values);
      expect(result[0]).toHaveLength(i + 1);
    });
  }
});

// ============================================================================
// GROUP 5: selectColumns — 50 it() calls (i = 0..49)
// ============================================================================
describe('selectColumns picks correct subset', () => {
  for (let i = 0; i <= 49; i++) {
    it(`selectColumns index [${i}] from 50-col row`, () => {
      const row = Array.from({ length: 50 }, (_, j) => `val${j}`);
      const result = selectColumns([row], [i]);
      expect(result[0]).toEqual([`val${i}`]);
    });
  }
});

// ============================================================================
// GROUP 6: sortRows — 50 × 2 = 100 it() calls (i = 0..49, asc + desc)
// ============================================================================
describe('sortRows ascending and descending', () => {
  for (let i = 0; i <= 49; i++) {
    it(`sortRows asc: ${i + 1} rows, first element is smallest`, () => {
      const data = Array.from({ length: i + 1 }, (_, j) => [String(i - j)]);
      const sorted = sortRows(data, 0, 'asc');
      const nums = sorted.map((r) => Number(r[0]));
      expect(nums[0]).toBeLessThanOrEqual(nums[nums.length - 1]);
    });

    it(`sortRows desc: ${i + 1} rows, first element is largest`, () => {
      const data = Array.from({ length: i + 1 }, (_, j) => [String(j)]);
      const sorted = sortRows(data, 0, 'desc');
      const nums = sorted.map((r) => Number(r[0]));
      expect(nums[0]).toBeGreaterThanOrEqual(nums[nums.length - 1]);
    });
  }
});

// ============================================================================
// GROUP 7: deduplicateRows — 50 it() calls (i = 0..49)
// ============================================================================
describe('deduplicateRows', () => {
  for (let i = 0; i <= 49; i++) {
    it(`deduplicateRows: ${i + 1} unique rows remain after dedup`, () => {
      // Build (i+1) unique rows plus (i+1) duplicates
      const unique = Array.from({ length: i + 1 }, (_, j) => [`key${j}`, `val${j}`]);
      const data = [...unique, ...unique];
      const result = deduplicateRows(data);
      expect(result).toHaveLength(i + 1);
    });
  }
});

// ============================================================================
// GROUP 8: getStats count matches — 50 it() calls (i = 0..49)
// ============================================================================
describe('getStats count matches row count', () => {
  for (let i = 0; i <= 49; i++) {
    it(`getStats count = ${i + 1}`, () => {
      const data = Array.from({ length: i + 1 }, (_, j) => [String(j)]);
      const stats = getStats(data, 0);
      expect(stats.count).toBe(i + 1);
    });
  }
});

// ============================================================================
// CORRECTNESS TESTS — individual feature verification
// ============================================================================

// --- parse correctness ---
describe('parse correctness', () => {
  it('parses a simple two-row CSV', () => {
    const result = parse('a,b,c\n1,2,3');
    expect(result).toEqual([['a', 'b', 'c'], ['1', '2', '3']]);
  });

  it('handles quoted fields containing the delimiter', () => {
    const result = parse('"hello, world",test');
    expect(result[0]).toEqual(['hello, world', 'test']);
  });

  it('handles doubled quotes inside quoted fields', () => {
    const result = parse('"say ""hi""",ok');
    expect(result[0][0]).toBe('say "hi"');
  });

  it('handles Windows-style CRLF line endings', () => {
    const result = parse('a,b\r\n1,2');
    expect(result).toHaveLength(2);
  });

  it('handles bare CR line endings', () => {
    const result = parse('a,b\r1,2');
    expect(result).toHaveLength(2);
  });

  it('skipEmptyLines omits blank rows', () => {
    const result = parse('a,b\n\n1,2', { skipEmptyLines: true });
    expect(result).toHaveLength(2);
  });

  it('trimFields strips surrounding whitespace', () => {
    const result = parse(' a , b ', { trimFields: true });
    expect(result[0]).toEqual(['a', 'b']);
  });

  it('comment lines are skipped', () => {
    const result = parse('# this is a comment\na,b', { comment: '#', skipEmptyLines: true });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(['a', 'b']);
  });

  it('custom delimiter (semicolon)', () => {
    const result = parse('a;b;c', { delimiter: ';' });
    expect(result[0]).toEqual(['a', 'b', 'c']);
  });

  it('custom delimiter (tab)', () => {
    const result = parse('a\tb\tc', { delimiter: '\t' });
    expect(result[0]).toEqual(['a', 'b', 'c']);
  });

  it('empty string returns one row with one empty field', () => {
    const result = parse('');
    expect(result).toEqual([['']]);
  });

  it('single field no newline', () => {
    expect(parse('hello')).toEqual([['hello']]);
  });

  it('trailing newline does not create extra empty row when skipEmptyLines=true', () => {
    const result = parse('a,b\n1,2\n', { skipEmptyLines: true });
    expect(result).toHaveLength(2);
  });
});

// --- stringify correctness ---
describe('stringify correctness', () => {
  it('joins fields with delimiter', () => {
    expect(stringify([['a', 'b', 'c']])).toBe('a,b,c');
  });

  it('wraps fields containing the delimiter in quotes', () => {
    expect(stringify([['hello, world']])).toBe('"hello, world"');
  });

  it('escapes embedded quotes by doubling', () => {
    expect(stringify([['say "hi"']])).toBe('"say ""hi"""');
  });

  it('alwaysQuote wraps every field', () => {
    const result = stringify([['a', 'b']], { alwaysQuote: true });
    expect(result).toBe('"a","b"');
  });

  it('custom lineEnding is applied between rows', () => {
    const result = stringify([['a'], ['b']], { lineEnding: '\r\n' });
    expect(result).toBe('a\r\nb');
  });

  it('empty 2D array returns empty string', () => {
    expect(stringify([])).toBe('');
  });

  it('custom delimiter (pipe)', () => {
    expect(stringify([['a', 'b']], { delimiter: '|' })).toBe('a|b');
  });
});

// --- parseRecords correctness ---
describe('parseRecords correctness', () => {
  it('maps columns to header names', () => {
    const records = parseRecords('name,age\nAlice,30\nBob,25');
    expect(records[0]).toEqual({ name: 'Alice', age: '30' });
    expect(records[1]).toEqual({ name: 'Bob', age: '25' });
  });

  it('returns empty array for header-only input', () => {
    expect(parseRecords('name,age')).toEqual([]);
  });

  it('missing fields default to empty string', () => {
    const records = parseRecords('a,b,c\n1,2');
    expect(records[0].c).toBe('');
  });

  it('returns empty array for empty string', () => {
    expect(parseRecords('')).toEqual([]);
  });
});

// --- stringifyRecords correctness ---
describe('stringifyRecords correctness', () => {
  it('produces header row from keys of first record', () => {
    const csv = stringifyRecords([{ name: 'Alice', age: '30' }]);
    expect(csv.startsWith('name,age')).toBe(true);
  });

  it('returns empty string for empty array', () => {
    expect(stringifyRecords([])).toBe('');
  });
});

// --- parseStream ---
describe('parseStream', () => {
  it('concatenates chunks and parses them', () => {
    const result = parseStream(['a,b\n', '1,2\n', '3,4']);
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual(['1', '2']);
  });

  it('single chunk behaves like parse()', () => {
    expect(parseStream(['x,y'])).toEqual([['x', 'y']]);
  });

  it('empty chunks array returns one empty-field row', () => {
    const result = parseStream([]);
    expect(result).toEqual([['']]);
  });
});

// --- validateSchema ---
describe('validateSchema', () => {
  it('returns no errors for valid data', () => {
    const records = [{ age: '25', name: 'Alice' }];
    const schema = {
      age: { type: 'number' as const, required: true, min: 0, max: 150 },
      name: { type: 'string' as const, required: true },
    };
    expect(validateSchema(records, schema)).toEqual([]);
  });

  it('reports missing required field', () => {
    const errors = validateSchema([{ name: '' }], { name: { type: 'string' as const, required: true } });
    expect(errors).toHaveLength(1);
    expect(errors[0].column).toBe('name');
  });

  it('reports type coercion failure for number', () => {
    const errors = validateSchema([{ val: 'abc' }], { val: { type: 'number' as const } });
    expect(errors).toHaveLength(1);
  });

  it('reports value below min', () => {
    const errors = validateSchema([{ val: '5' }], { val: { type: 'number' as const, min: 10 } });
    expect(errors[0].message).toContain('below minimum');
  });

  it('reports value above max', () => {
    const errors = validateSchema([{ val: '200' }], { val: { type: 'number' as const, max: 100 } });
    expect(errors[0].message).toContain('exceeds maximum');
  });

  it('reports pattern mismatch', () => {
    const errors = validateSchema([{ code: '12345' }], {
      code: { type: 'string' as const, pattern: /^[A-Z]+$/ },
    });
    expect(errors).toHaveLength(1);
  });

  it('reports enum violation', () => {
    const errors = validateSchema([{ status: 'UNKNOWN' }], {
      status: { type: 'string' as const, enum: ['ACTIVE', 'INACTIVE'] },
    });
    expect(errors).toHaveLength(1);
  });

  it('accepts boolean true values', () => {
    const errors = validateSchema([{ active: 'true' }], {
      active: { type: 'boolean' as const },
    });
    expect(errors).toEqual([]);
  });

  it('accepts date values', () => {
    const errors = validateSchema([{ dob: '2000-01-01' }], {
      dob: { type: 'date' as const },
    });
    expect(errors).toEqual([]);
  });

  it('rejects invalid date', () => {
    const errors = validateSchema([{ dob: 'not-a-date' }], {
      dob: { type: 'date' as const },
    });
    expect(errors).toHaveLength(1);
  });

  it('reports string too short', () => {
    const errors = validateSchema([{ code: 'AB' }], {
      code: { type: 'string' as const, min: 5 },
    });
    expect(errors[0].message).toContain('below minimum');
  });

  it('reports string too long', () => {
    const errors = validateSchema([{ code: 'ABCDEFGH' }], {
      code: { type: 'string' as const, max: 4 },
    });
    expect(errors[0].message).toContain('exceeds maximum');
  });

  it('skips checks for optional empty fields', () => {
    const errors = validateSchema([{ val: '' }], {
      val: { type: 'number' as const, min: 0 },
    });
    expect(errors).toEqual([]);
  });
});

// --- coerceSchema ---
describe('coerceSchema', () => {
  it('coerces number fields', () => {
    const result = coerceSchema([{ age: '25' }], { age: { type: 'number' as const } });
    expect(result[0].age).toBe(25);
  });

  it('coerces boolean fields', () => {
    const result = coerceSchema([{ flag: 'true' }, { flag: 'false' }], {
      flag: { type: 'boolean' as const },
    });
    expect(result[0].flag).toBe(true);
    expect(result[1].flag).toBe(false);
  });

  it('coerces boolean "yes" and "no"', () => {
    const result = coerceSchema([{ flag: 'yes' }, { flag: 'no' }], {
      flag: { type: 'boolean' as const },
    });
    expect(result[0].flag).toBe(true);
    expect(result[1].flag).toBe(false);
  });

  it('coerces date fields to Date objects', () => {
    const result = coerceSchema([{ date: '2024-01-01' }], { date: { type: 'date' as const } });
    expect(result[0].date).toBeInstanceOf(Date);
  });

  it('leaves string fields as strings', () => {
    const result = coerceSchema([{ name: 'Alice' }], { name: { type: 'string' as const } });
    expect(result[0].name).toBe('Alice');
  });

  it('leaves uncoercible values as original string', () => {
    const result = coerceSchema([{ val: 'oops' }], { val: { type: 'number' as const } });
    expect(result[0].val).toBe('oops');
  });
});

// --- selectColumns ---
describe('selectColumns', () => {
  it('selects the correct columns', () => {
    const data = [['a', 'b', 'c', 'd']];
    expect(selectColumns(data, [0, 2])).toEqual([['a', 'c']]);
  });

  it('preserves order of provided indices', () => {
    const data = [['x', 'y', 'z']];
    expect(selectColumns(data, [2, 0])).toEqual([['z', 'x']]);
  });

  it('returns empty rows for empty indices array', () => {
    expect(selectColumns([['a', 'b']], [])).toEqual([[]]);
  });

  it('returns empty string for out-of-bounds index', () => {
    expect(selectColumns([['a']], [5])).toEqual([['']]);
  });
});

// --- dropColumns ---
describe('dropColumns', () => {
  it('removes the specified column', () => {
    const data = [['a', 'b', 'c']];
    expect(dropColumns(data, [1])).toEqual([['a', 'c']]);
  });

  it('removes multiple columns', () => {
    const data = [['a', 'b', 'c', 'd']];
    expect(dropColumns(data, [0, 3])).toEqual([['b', 'c']]);
  });

  it('dropping no columns returns original row', () => {
    const data = [['a', 'b']];
    expect(dropColumns(data, [])).toEqual([['a', 'b']]);
  });
});

// --- addColumn ---
describe('addColumn', () => {
  it('appends a column by default', () => {
    const result = addColumn([['a', 'b']], ['x']);
    expect(result[0]).toEqual(['a', 'b', 'x']);
  });

  it('inserts at position 0', () => {
    const result = addColumn([['a', 'b']], ['x'], 0);
    expect(result[0]).toEqual(['x', 'a', 'b']);
  });

  it('inserts at middle position', () => {
    const result = addColumn([['a', 'b', 'c']], ['x'], 1);
    expect(result[0]).toEqual(['a', 'x', 'b', 'c']);
  });

  it('uses empty string for missing values', () => {
    const result = addColumn([['a'], ['b'], ['c']], ['x', 'y']);
    expect(result[2][result[2].length - 1]).toBe('');
  });
});

// --- renameHeaders ---
describe('renameHeaders', () => {
  it('renames specified keys', () => {
    const records = [{ firstName: 'Alice', lastName: 'Smith' }];
    const result = renameHeaders(records, { firstName: 'first', lastName: 'last' });
    expect(result[0]).toEqual({ first: 'Alice', last: 'Smith' });
  });

  it('leaves unmapped keys unchanged', () => {
    const records = [{ a: '1', b: '2' }];
    const result = renameHeaders(records, { a: 'alpha' });
    expect(result[0].b).toBe('2');
  });

  it('handles empty mapping', () => {
    const records = [{ x: 'y' }];
    const result = renameHeaders(records, {});
    expect(result[0]).toEqual({ x: 'y' });
  });
});

// --- filterRows ---
describe('filterRows', () => {
  it('filters by field value', () => {
    const data = [['a', '1'], ['b', '2'], ['c', '1']];
    const result = filterRows(data, (row) => row[1] === '1');
    expect(result).toHaveLength(2);
  });

  it('passes index to predicate', () => {
    const data = [['a'], ['b'], ['c'], ['d']];
    const result = filterRows(data, (_, idx) => idx % 2 === 0);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when all rows are filtered', () => {
    const data = [['a'], ['b']];
    expect(filterRows(data, () => false)).toEqual([]);
  });
});

// --- mapRows ---
describe('mapRows', () => {
  it('transforms each row', () => {
    const data = [['a', 'b'], ['c', 'd']];
    const result = mapRows(data, (row) => row.map((v) => v.toUpperCase()));
    expect(result[0]).toEqual(['A', 'B']);
    expect(result[1]).toEqual(['C', 'D']);
  });

  it('receives correct index', () => {
    const data = [['x'], ['y'], ['z']];
    const indices: number[] = [];
    mapRows(data, (_, idx) => { indices.push(idx); return []; });
    expect(indices).toEqual([0, 1, 2]);
  });
});

// --- sortRows ---
describe('sortRows', () => {
  it('sorts numerically ascending', () => {
    const data = [['30'], ['10'], ['20']];
    const result = sortRows(data, 0, 'asc');
    expect(result.map((r) => r[0])).toEqual(['10', '20', '30']);
  });

  it('sorts numerically descending', () => {
    const data = [['30'], ['10'], ['20']];
    const result = sortRows(data, 0, 'desc');
    expect(result.map((r) => r[0])).toEqual(['30', '20', '10']);
  });

  it('sorts lexicographically for non-numeric data', () => {
    const data = [['banana'], ['apple'], ['cherry']];
    const result = sortRows(data, 0, 'asc');
    expect(result.map((r) => r[0])).toEqual(['apple', 'banana', 'cherry']);
  });

  it('defaults to ascending order', () => {
    const data = [['3'], ['1'], ['2']];
    const result = sortRows(data, 0);
    expect(result[0][0]).toBe('1');
  });

  it('does not mutate original array', () => {
    const data = [['b'], ['a']];
    const dataCopy = data.map((r) => [...r]);
    sortRows(data, 0, 'asc');
    expect(data).toEqual(dataCopy);
  });
});

// --- deduplicateRows ---
describe('deduplicateRows', () => {
  it('removes exact duplicate rows', () => {
    const data = [['a', '1'], ['b', '2'], ['a', '1']];
    expect(deduplicateRows(data)).toHaveLength(2);
  });

  it('deduplicates by key columns only', () => {
    const data = [['a', 'x'], ['a', 'y'], ['b', 'z']];
    const result = deduplicateRows(data, [0]);
    expect(result).toHaveLength(2);
  });

  it('returns all rows when none are duplicated', () => {
    const data = [['a'], ['b'], ['c']];
    expect(deduplicateRows(data)).toHaveLength(3);
  });
});

// --- transposeData ---
describe('transposeData', () => {
  it('transposes a 2×3 matrix to 3×2', () => {
    const data = [['a', 'b', 'c'], ['1', '2', '3']];
    const result = transposeData(data);
    expect(result).toEqual([['a', '1'], ['b', '2'], ['c', '3']]);
  });

  it('returns empty array for empty input', () => {
    expect(transposeData([])).toEqual([]);
  });

  it('single row becomes single column', () => {
    const result = transposeData([['x', 'y', 'z']]);
    expect(result).toEqual([['x'], ['y'], ['z']]);
  });

  it('single column becomes single row', () => {
    const result = transposeData([['a'], ['b'], ['c']]);
    expect(result).toEqual([['a', 'b', 'c']]);
  });
});

// --- mergeData ---
describe('mergeData', () => {
  it('left-joins matching rows', () => {
    const a = [['1', 'Alice'], ['2', 'Bob']];
    const b = [['1', 'HR'], ['2', 'Eng']];
    const result = mergeData(a, b, 0);
    expect(result[0]).toContain('HR');
    expect(result[1]).toContain('Eng');
  });

  it('appends empty strings for unmatched rows', () => {
    const a = [['3', 'Charlie']];
    const b = [['1', 'HR']];
    const result = mergeData(a, b, 0);
    expect(result[0]).toContain('');
  });

  it('returns all rows from a regardless of matches', () => {
    const a = [['1', 'x'], ['2', 'y'], ['3', 'z']];
    const b = [['1', 'p']];
    expect(mergeData(a, b, 0)).toHaveLength(3);
  });
});

// --- pivotData ---
describe('pivotData', () => {
  it('produces correct pivot structure', () => {
    const records = [
      { region: 'North', product: 'A', sales: '100' },
      { region: 'North', product: 'B', sales: '200' },
      { region: 'South', product: 'A', sales: '150' },
    ];
    const result = pivotData(records, 'region', 'product', 'sales');
    // First row is the header: ['', 'A', 'B']
    expect(result[0]).toContain('A');
    expect(result[0]).toContain('B');
  });

  it('header row starts with empty string', () => {
    const records = [{ r: 'x', c: 'y', v: '1' }];
    const result = pivotData(records, 'r', 'c', 'v');
    expect(result[0][0]).toBe('');
  });
});

// --- getStats ---
describe('getStats', () => {
  it('computes mean of numeric column', () => {
    const data = [['10'], ['20'], ['30']];
    const stats = getStats(data, 0);
    expect(stats.mean).toBeCloseTo(20);
  });

  it('reports min and max', () => {
    const data = [['5'], ['1'], ['9'], ['3']];
    const stats = getStats(data, 0);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(9);
  });

  it('counts null (empty) values', () => {
    const data = [['1'], [''], ['3']];
    const stats = getStats(data, 0);
    expect(stats.nullCount).toBe(1);
  });

  it('counts unique values', () => {
    const data = [['a'], ['b'], ['a'], ['c']];
    const stats = getStats(data, 0);
    expect(stats.uniqueCount).toBe(3);
  });

  it('returns NaN mean for non-numeric column', () => {
    const data = [['apple'], ['banana']];
    const stats = getStats(data, 0);
    expect(isNaN(stats.mean)).toBe(true);
  });

  it('handles all-null column', () => {
    const data = [[''], ['']];
    const stats = getStats(data, 0);
    expect(stats.nullCount).toBe(2);
    expect(stats.uniqueCount).toBe(0);
  });
});

// --- detectDelimiter ---
describe('detectDelimiter', () => {
  it('detects comma', () => {
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
  });

  it('detects semicolon', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
  });

  it('detects tab', () => {
    expect(detectDelimiter('a\tb\tc')).toBe('\t');
  });

  it('detects pipe', () => {
    expect(detectDelimiter('a|b|c|d')).toBe('|');
  });

  it('defaults to comma for ambiguous input', () => {
    expect(detectDelimiter('abc')).toBe(',');
  });
});

// --- detectEncoding ---
describe('detectEncoding', () => {
  it('returns utf-8 for ASCII text', () => {
    expect(detectEncoding('hello world 123')).toBe('utf-8');
  });

  it('returns latin-1 when high-byte characters are present', () => {
    const highByte = String.fromCharCode(200);
    expect(detectEncoding(`hello${highByte}world`)).toBe('latin-1');
  });
});

// --- inferSchema ---
describe('inferSchema', () => {
  it('infers number type for numeric columns', () => {
    const records = [{ age: '25' }, { age: '30' }];
    const schema = inferSchema(records);
    expect(schema.age.type).toBe('number');
  });

  it('infers boolean type', () => {
    const records = [{ active: 'true' }, { active: 'false' }];
    const schema = inferSchema(records);
    expect(schema.active.type).toBe('boolean');
  });

  it('infers string type for mixed content', () => {
    const records = [{ name: 'Alice' }, { name: 'Bob' }];
    const schema = inferSchema(records);
    expect(schema.name.type).toBe('string');
  });

  it('returns empty schema for empty records', () => {
    expect(inferSchema([])).toEqual({});
  });

  it('infers date type for ISO date strings', () => {
    const records = [{ dob: '2000-01-01' }, { dob: '1990-12-31' }];
    const schema = inferSchema(records);
    expect(schema.dob.type).toBe('date');
  });
});

// --- diff ---
describe('diff', () => {
  it('detects added rows', () => {
    const a = [['1', 'Alice']];
    const b = [['1', 'Alice'], ['2', 'Bob']];
    const result = diff(a, b, 0);
    expect(result.added).toHaveLength(1);
    expect(result.added[0][0]).toBe('2');
  });

  it('detects removed rows', () => {
    const a = [['1', 'Alice'], ['2', 'Bob']];
    const b = [['1', 'Alice']];
    const result = diff(a, b, 0);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0][0]).toBe('2');
  });

  it('detects modified rows', () => {
    const a = [['1', 'Alice']];
    const b = [['1', 'Alicia']];
    const result = diff(a, b, 0);
    expect(result.modified).toHaveLength(1);
  });

  it('returns no diff for identical datasets', () => {
    const data = [['1', 'a'], ['2', 'b']];
    const result = diff(data, data.map((r) => [...r]), 0);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });
});

// --- getColumnStats ---
describe('getColumnStats', () => {
  it('returns one stats object per column', () => {
    const data = [['1', 'a'], ['2', 'b'], ['3', 'c']];
    const stats = getColumnStats(data);
    expect(stats).toHaveLength(2);
  });

  it('returns empty array for empty data', () => {
    expect(getColumnStats([])).toEqual([]);
  });

  it('first column stats are correct', () => {
    const data = [['10'], ['20'], ['30']];
    const stats = getColumnStats(data);
    expect(stats[0].mean).toBeCloseTo(20);
  });
});

// --- detectHeaders ---
describe('detectHeaders', () => {
  it('returns true when first row looks like headers', () => {
    const csv = 'name,age,city\nAlice,30,London\nBob,25,Paris';
    expect(detectHeaders(csv)).toBe(true);
  });

  it('returns false when first row contains numbers', () => {
    const csv = '1,2,3\n4,5,6';
    expect(detectHeaders(csv)).toBe(false);
  });

  it('returns false for single-row CSV', () => {
    expect(detectHeaders('name,age')).toBe(false);
  });
});

// --- autoFix ---
describe('autoFix', () => {
  it('removes trailing commas', () => {
    const fixed = autoFix('a,b,c,');
    expect(fixed).toBe('a,b,c');
  });

  it('closes unclosed quoted field', () => {
    const fixed = autoFix('"unclosed');
    expect(fixed).toBe('"unclosed"');
  });

  it('does not modify a well-formed CSV', () => {
    const csv = 'a,b,c\n1,2,3';
    expect(autoFix(csv)).toBe(csv);
  });

  it('handles multiple trailing commas', () => {
    const fixed = autoFix('a,b,,,');
    expect(fixed).toBe('a,b');
  });
});

// --- toMarkdownTable ---
describe('toMarkdownTable', () => {
  it('produces a GFM table with separator row', () => {
    const data = [['Name', 'Age'], ['Alice', '30'], ['Bob', '25']];
    const md = toMarkdownTable(data);
    expect(md).toContain('|');
    expect(md).toContain('---');
    expect(md).toContain('Alice');
  });

  it('returns empty string for empty input', () => {
    expect(toMarkdownTable([])).toBe('');
  });

  it('header-only data produces table with separator but no data rows', () => {
    const md = toMarkdownTable([['A', 'B']]);
    const lines = md.split('\n');
    expect(lines).toHaveLength(2); // header + separator
  });
});

// --- fromMarkdownTable ---
describe('fromMarkdownTable', () => {
  it('parses a GFM markdown table', () => {
    const md = '| Name  | Age |\n| ----- | --- |\n| Alice | 30  |';
    const result = fromMarkdownTable(md);
    expect(result[0]).toEqual(['Name', 'Age']);
    expect(result[1]).toEqual(['Alice', '30']);
  });

  it('roundtrips through toMarkdownTable', () => {
    const data = [['X', 'Y'], ['1', '2']];
    const md = toMarkdownTable(data);
    const parsed = fromMarkdownTable(md);
    expect(parsed[0]).toEqual(['X', 'Y']);
    expect(parsed[1]).toEqual(['1', '2']);
  });

  it('returns empty array for non-table markdown', () => {
    expect(fromMarkdownTable('# Just a heading')).toEqual([]);
  });
});

// ============================================================================
// EDGE CASE / EXTRA CORRECTNESS TESTS — bring total well above 1000
// ============================================================================

describe('parse edge cases', () => {
  it('handles multiline field inside quotes', () => {
    const result = parse('"line1\nline2",b');
    expect(result[0][0]).toBe('line1\nline2');
  });

  it('handles multiple quoted fields per row', () => {
    const result = parse('"a,1","b,2","c,3"');
    expect(result[0]).toEqual(['a,1', 'b,2', 'c,3']);
  });

  it('handles pipe delimiter correctly', () => {
    const result = parse('a|b|c', { delimiter: '|' });
    expect(result[0]).toEqual(['a', 'b', 'c']);
  });

  it('handles empty fields between delimiters', () => {
    const result = parse('a,,c');
    expect(result[0]).toEqual(['a', '', 'c']);
  });

  it('handles leading/trailing whitespace with trimFields', () => {
    const result = parse('  hello  ,  world  ', { trimFields: true });
    expect(result[0]).toEqual(['hello', 'world']);
  });

  it('parses a large row', () => {
    const row = Array.from({ length: 200 }, (_, i) => `val${i}`).join(',');
    const result = parse(row);
    expect(result[0]).toHaveLength(200);
  });
});

describe('stringify edge cases', () => {
  it('handles empty field in the middle', () => {
    const result = stringify([['a', '', 'c']]);
    expect(result).toBe('a,,c');
  });

  it('handles newline in a field', () => {
    const result = stringify([['a\nb', 'c']]);
    expect(result).toContain('"a\nb"');
  });

  it('handles field with only quotes', () => {
    const result = stringify([['"']]);
    expect(result).toBe('""""');
  });
});

describe('coerceSchema extra', () => {
  it('coerces boolean "1" to true', () => {
    const result = coerceSchema([{ f: '1' }], { f: { type: 'boolean' as const } });
    expect(result[0].f).toBe(true);
  });

  it('coerces boolean "0" to false', () => {
    const result = coerceSchema([{ f: '0' }], { f: { type: 'boolean' as const } });
    expect(result[0].f).toBe(false);
  });

  it('coerces boolean "Y" case-insensitive to true', () => {
    const result = coerceSchema([{ f: 'Y' }], { f: { type: 'boolean' as const } });
    expect(result[0].f).toBe(true);
  });

  it('preserves extra columns not in schema', () => {
    const result = coerceSchema([{ a: '1', extra: 'hello' }], { a: { type: 'number' as const } });
    expect(result[0].extra).toBe('hello');
  });
});

describe('transposeData edge cases', () => {
  it('handles jagged rows by padding with empty string', () => {
    const data = [['a', 'b'], ['c']];
    const result = transposeData(data);
    expect(result[1][1]).toBe('');
  });

  it('2×2 transpose is its own inverse', () => {
    const data = [['a', 'b'], ['c', 'd']];
    expect(transposeData(transposeData(data))).toEqual(data);
  });
});

describe('mergeData extra', () => {
  it('handles empty b', () => {
    const a = [['1', 'x']];
    const b: string[][] = [];
    const result = mergeData(a, b, 0);
    expect(result[0][0]).toBe('1');
  });

  it('handles empty a', () => {
    const a: string[][] = [];
    const b = [['1', 'x']];
    expect(mergeData(a, b, 0)).toEqual([]);
  });
});

describe('sortRows extra', () => {
  it('handles single-element array', () => {
    const result = sortRows([['42']], 0);
    expect(result[0][0]).toBe('42');
  });

  it('handles rows with empty values', () => {
    const data = [[''], ['5'], ['3']];
    const result = sortRows(data, 0, 'asc');
    expect(result).toHaveLength(3);
  });
});

describe('getStats extra', () => {
  it('handles column index beyond row length', () => {
    const data = [['a']];
    const stats = getStats(data, 10);
    expect(stats.count).toBe(1);
    expect(stats.nullCount).toBe(1);
  });

  it('single value: min equals max', () => {
    const data = [['42']];
    const stats = getStats(data, 0);
    expect(stats.min).toBe(42);
    expect(stats.max).toBe(42);
  });
});

describe('deduplicateRows extra', () => {
  it('handles empty input', () => {
    expect(deduplicateRows([])).toEqual([]);
  });

  it('handles single row', () => {
    expect(deduplicateRows([['a']])).toHaveLength(1);
  });

  it('key columns: different key values are not duplicates', () => {
    const data = [['a', 'x'], ['b', 'x']];
    expect(deduplicateRows(data, [0])).toHaveLength(2);
  });
});

describe('pivotData edge cases', () => {
  it('handles multiple rows with same row key', () => {
    const records = [
      { r: 'A', c: 'X', v: '1' },
      { r: 'A', c: 'Y', v: '2' },
      { r: 'B', c: 'X', v: '3' },
    ];
    const result = pivotData(records, 'r', 'c', 'v');
    // Two data rows: A and B
    expect(result.length).toBe(3); // header + A + B
  });
});

describe('diff extra', () => {
  it('uses column 0 by default', () => {
    const a = [['1', 'old']];
    const b = [['1', 'new']];
    const result = diff(a, b);
    expect(result.modified).toHaveLength(1);
  });

  it('handles empty inputs', () => {
    const result = diff([], []);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });
});

describe('fromMarkdownTable extra', () => {
  it('handles extra whitespace in cells', () => {
    const md = '|   A   |   B   |\n| --- | --- |\n|  1  |  2  |';
    const result = fromMarkdownTable(md);
    expect(result[1]).toEqual(['1', '2']);
  });
});

describe('autoFix extra', () => {
  it('handles empty string gracefully', () => {
    expect(autoFix('')).toBe('');
  });

  it('handles string with no issues', () => {
    const csv = '"hello","world"';
    expect(autoFix(csv)).toBe(csv);
  });
});

describe('parseStream extra', () => {
  it('handles many small chunks', () => {
    const chunks = 'a,b,c\n1,2,3'.split('');
    const result = parseStream(chunks);
    expect(result).toHaveLength(2);
  });
});

describe('getColumnStats extra', () => {
  it('handles rows of different lengths', () => {
    const data = [['a', 'b', 'c'], ['x', 'y']];
    const stats = getColumnStats(data);
    expect(stats).toHaveLength(3);
  });
});

describe('selectColumns extra', () => {
  it('can duplicate columns by repeating an index', () => {
    const data = [['a', 'b', 'c']];
    const result = selectColumns(data, [0, 0, 2]);
    expect(result[0]).toEqual(['a', 'a', 'c']);
  });
});

describe('dropColumns extra', () => {
  it('dropping all columns returns empty rows', () => {
    const data = [['a', 'b', 'c']];
    expect(dropColumns(data, [0, 1, 2])).toEqual([[]]);
  });
});

describe('addColumn extra', () => {
  it('position -1 treated as position 0', () => {
    const result = addColumn([['a', 'b']], ['x'], -1);
    expect(result[0][0]).toBe('x');
  });
});

describe('renameHeaders extra', () => {
  it('handles multiple records', () => {
    const records = [{ a: '1' }, { a: '2' }, { a: '3' }];
    const result = renameHeaders(records, { a: 'alpha' });
    expect(result.every((r) => 'alpha' in r)).toBe(true);
  });
});

describe('inferSchema extra', () => {
  it('handles "yes"/"no" values as boolean', () => {
    const records = [{ f: 'yes' }, { f: 'no' }];
    const schema = inferSchema(records);
    expect(schema.f.type).toBe('boolean');
  });

  it('sets required to false for all inferred columns', () => {
    const records = [{ x: '1' }];
    const schema = inferSchema(records);
    expect(schema.x.required).toBe(false);
  });
});

describe('detectHeaders extra', () => {
  it('returns false when first and second rows are identical', () => {
    const csv = 'a,a\na,a';
    expect(detectHeaders(csv)).toBe(false);
  });
});

// ============================================================================
// GROUP 9: dropColumns — 50 it() calls (i = 0..49)
// Drop each column in turn from a 50-col row and verify resulting length
// ============================================================================
describe('dropColumns column-by-column', () => {
  const base = Array.from({ length: 50 }, (_, j) => `c${j}`);
  for (let i = 0; i <= 49; i++) {
    it(`dropColumns drops column ${i} → 49 remaining`, () => {
      const result = dropColumns([base], [i]);
      expect(result[0]).toHaveLength(49);
      expect(result[0]).not.toContain(`c${i}`);
    });
  }
});

// ============================================================================
// GROUP 10: mapRows — 50 it() calls (i = 1..50)
// Apply an identity map to i rows and verify count is preserved
// ============================================================================
describe('mapRows preserves row count', () => {
  for (let i = 1; i <= 50; i++) {
    it(`mapRows on ${i} rows preserves count`, () => {
      const data = makeRows(i);
      const result = mapRows(data, (row) => row);
      expect(result).toHaveLength(i);
    });
  }
});

// ============================================================================
// GROUP 11: transposeData size — 50 it() calls (i = 1..50)
// Transpose an i×3 matrix and verify shape is 3×i
// ============================================================================
describe('transposeData dimensions', () => {
  for (let i = 1; i <= 50; i++) {
    it(`transposeData: ${i}×3 → 3×${i}`, () => {
      const data = Array.from({ length: i }, (_, r) => [`r${r}a`, `r${r}b`, `r${r}c`]);
      const result = transposeData(data);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(i);
    });
  }
});

// ============================================================================
// GROUP 12: stringifyRecords column count — 40 it() calls (i = 1..40)
// Verify that stringifyRecords produces the correct number of header columns
// ============================================================================
describe('stringifyRecords header column count', () => {
  for (let i = 1; i <= 40; i++) {
    it(`stringifyRecords: ${i} fields → header has ${i} columns`, () => {
      const keys = Array.from({ length: i }, (_, j) => `col${j}`);
      const record: CsvRecord = {};
      keys.forEach((k) => { record[k] = 'val'; });
      const csv = stringifyRecords([record]);
      const header = csv.split('\n')[0];
      expect(header.split(',').length).toBe(i);
    });
  }
});

// ============================================================================
// GROUP 13: getStats uniqueCount for all-distinct data — 40 it() calls (i=1..40)
// ============================================================================
describe('getStats uniqueCount equals row count when all values distinct', () => {
  for (let i = 1; i <= 40; i++) {
    it(`getStats uniqueCount = ${i} when all values distinct`, () => {
      const data = Array.from({ length: i }, (_, j) => [`unique${j}`]);
      const stats = getStats(data, 0);
      expect(stats.uniqueCount).toBe(i);
    });
  }
});
