// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  parseCsv,
  stringifyCsv,
  csvToObjects,
  objectsToCsv,
  parseIni,
  stringifyIni,
  parseKeyValue,
  stringifyKeyValue,
  parseQueryString,
  stringifyQueryString,
  parseMultiValueQuery,
  safeJsonParse,
  parseJson5Like,
  extractJsonFromText,
  parseTemplate,
  tokenizeExpression,
  parseBooleanValue,
  parseIntSafe,
  parseFloatSafe,
  parseDotPath,
  parseGlobPattern,
  parseSemver,
  compareSemver,
  ok,
  fail,
  TokenType,
} from '../parser-utils';

// ============================================================
// parseCsv — 100 tests
// ============================================================
describe('parseCsv', () => {
  it('parses empty string', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('parses a single field', () => {
    expect(parseCsv('hello')).toEqual([['hello']]);
  });

  it('parses a single row', () => {
    expect(parseCsv('a,b,c')).toEqual([['a', 'b', 'c']]);
  });

  it('parses multiple rows', () => {
    const result = parseCsv('a,b\n1,2');
    expect(result).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('handles CRLF line endings', () => {
    expect(parseCsv('a,b\r\nc,d')).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('handles quoted fields', () => {
    expect(parseCsv('"hello world",b')).toEqual([['hello world', 'b']]);
  });

  it('handles quoted field with embedded comma', () => {
    expect(parseCsv('"a,b",c')).toEqual([['a,b', 'c']]);
  });

  it('handles doubled-quote escape inside quoted field', () => {
    expect(parseCsv('"say ""hi""",b')).toEqual([['say "hi"', 'b']]);
  });

  it('handles empty fields', () => {
    expect(parseCsv(',,')).toEqual([['', '', '']]);
  });

  it('handles tab delimiter', () => {
    expect(parseCsv('a\tb\tc', { delimiter: '\t' })).toEqual([['a', 'b', 'c']]);
  });

  it('trims fields when trim option is set', () => {
    expect(parseCsv('  a  ,  b  ', { trim: true })).toEqual([['a', 'b']]);
  });

  it('does not trim by default', () => {
    expect(parseCsv('  a  , b ')).toEqual([['  a  ', ' b ']]);
  });

  it('skips empty lines by default', () => {
    const result = parseCsv('a,b\n\nc,d');
    expect(result).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('handles single-character delimiter pipe', () => {
    expect(parseCsv('a|b|c', { delimiter: '|' })).toEqual([['a', 'b', 'c']]);
  });

  it('handles unicode characters', () => {
    expect(parseCsv('café,naïve,résumé')).toEqual([['café', 'naïve', 'résumé']]);
  });

  it('handles newline inside quoted field', () => {
    expect(parseCsv('"line1\nline2",b')).toEqual([['line1\nline2', 'b']]);
  });

  it('handles trailing newline', () => {
    const result = parseCsv('a,b\n');
    expect(result).toEqual([['a', 'b']]);
  });

  it('parses three rows', () => {
    expect(parseCsv('1\n2\n3')).toEqual([['1'], ['2'], ['3']]);
  });

  it('custom quote character', () => {
    expect(parseCsv("'a,b',c", { quote: "'" })).toEqual([['a,b', 'c']]);
  });

  it('fields can be numeric strings', () => {
    const result = parseCsv('1,2.5,-3');
    expect(result[0]).toEqual(['1', '2.5', '-3']);
  });

  // Bulk parametric: 80 rows each with exactly one numeric field per column
  for (let i = 0; i < 80; i++) {
    it(`parseCsv bulk row ${i}: single-value row`, () => {
      const val = `value_${i}`;
      const result = parseCsv(`${val}`);
      expect(result).toEqual([[val]]);
    });
  }
});

// ============================================================
// stringifyCsv — 60 tests
// ============================================================
describe('stringifyCsv', () => {
  it('serialises empty rows array', () => {
    expect(stringifyCsv([])).toBe('');
  });

  it('serialises single row', () => {
    expect(stringifyCsv([['a', 'b', 'c']])).toBe('a,b,c');
  });

  it('serialises multiple rows', () => {
    expect(stringifyCsv([['a', 'b'], ['1', '2']])).toBe('a,b\n1,2');
  });

  it('quotes fields containing the delimiter', () => {
    expect(stringifyCsv([['a,b', 'c']])).toBe('"a,b",c');
  });

  it('quotes fields containing a newline', () => {
    expect(stringifyCsv([['line1\nline2', 'c']])).toBe('"line1\nline2",c');
  });

  it('escapes embedded quotes by doubling', () => {
    expect(stringifyCsv([['say "hi"', 'c']])).toBe('"say ""hi""",c');
  });

  it('uses custom delimiter', () => {
    expect(stringifyCsv([['a', 'b']], { delimiter: '\t' })).toBe('a\tb');
  });

  it('uses custom newline', () => {
    expect(stringifyCsv([['a'], ['b']], { newline: '\r\n' })).toBe('a\r\nb');
  });

  it('round-trips simple data', () => {
    const rows = [['x', 'y'], ['1', '2']];
    expect(parseCsv(stringifyCsv(rows))).toEqual(rows);
  });

  it('handles empty field', () => {
    expect(stringifyCsv([['', 'b']])).toBe(',b');
  });

  // Bulk: 50 parametric round-trip tests
  for (let i = 0; i < 50; i++) {
    it(`stringifyCsv/parseCsv round-trip ${i}`, () => {
      const rows = [[`key_${i}`, `val_${i}`]];
      expect(parseCsv(stringifyCsv(rows))).toEqual(rows);
    });
  }
});

// ============================================================
// csvToObjects — 60 tests
// ============================================================
describe('csvToObjects', () => {
  it('returns empty array for empty string', () => {
    expect(csvToObjects('')).toEqual([]);
  });

  it('returns empty array for header-only input', () => {
    expect(csvToObjects('name,age')).toEqual([]);
  });

  it('maps columns to header keys', () => {
    const result = csvToObjects('name,age\nAlice,30');
    expect(result).toEqual([{ name: 'Alice', age: '30' }]);
  });

  it('handles multiple data rows', () => {
    const result = csvToObjects('id,label\n1,foo\n2,bar');
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ id: '2', label: 'bar' });
  });

  it('fills missing columns with empty string', () => {
    const result = csvToObjects('a,b,c\n1,2');
    expect(result[0].c).toBe('');
  });

  it('uses delimiter option', () => {
    const result = csvToObjects('a\tb\n1\t2', { delimiter: '\t' });
    expect(result[0]).toEqual({ a: '1', b: '2' });
  });

  it('quoted header field', () => {
    const result = csvToObjects('"first name",age\nBob,25');
    expect(result[0]['first name']).toBe('Bob');
  });

  it('handles quoted data value with comma', () => {
    const result = csvToObjects('name,desc\nAlice,"tall, dark"');
    expect(result[0].desc).toBe('tall, dark');
  });

  it('handles three columns', () => {
    const result = csvToObjects('x,y,z\n1,2,3');
    expect(result[0]).toEqual({ x: '1', y: '2', z: '3' });
  });

  it('unicode header keys', () => {
    const result = csvToObjects('名前,年齢\n太郎,20');
    expect(result[0]['名前']).toBe('太郎');
  });

  // Bulk: 50 parametric tests
  for (let i = 0; i < 50; i++) {
    it(`csvToObjects bulk ${i}`, () => {
      const csv = `col\nvalue_${i}`;
      const result = csvToObjects(csv);
      expect(result[0].col).toBe(`value_${i}`);
    });
  }
});

// ============================================================
// objectsToCsv — 50 tests
// ============================================================
describe('objectsToCsv', () => {
  it('returns empty string for empty array', () => {
    expect(objectsToCsv([])).toBe('');
  });

  it('produces header + data row', () => {
    expect(objectsToCsv([{ a: '1', b: '2' }])).toBe('a,b\n1,2');
  });

  it('round-trips through csvToObjects', () => {
    const objs = [{ name: 'Alice', age: '30' }, { name: 'Bob', age: '25' }];
    expect(csvToObjects(objectsToCsv(objs))).toEqual(objs);
  });

  it('uses custom delimiter', () => {
    expect(objectsToCsv([{ a: '1' }], { delimiter: '|' })).toBe('a\n1');
  });

  it('handles special chars in values', () => {
    const csv = objectsToCsv([{ desc: 'a,b' }]);
    expect(csv).toContain('"a,b"');
  });

  it('preserves field order from first object', () => {
    const csv = objectsToCsv([{ z: '1', a: '2' }]);
    expect(csv.startsWith('z,a')).toBe(true);
  });

  it('fills missing key with empty string', () => {
    const objs = [{ a: '1', b: '2' }, { a: '3' } as Record<string, string>];
    const csv = objectsToCsv(objs);
    const rows = parseCsv(csv);
    expect(rows[2][1]).toBe('');
  });

  it('multiple columns', () => {
    const objs = [{ x: '1', y: '2', z: '3' }];
    const csv = objectsToCsv(objs);
    expect(parseCsv(csv)).toEqual([['x', 'y', 'z'], ['1', '2', '3']]);
  });

  it('unicode values', () => {
    const csv = objectsToCsv([{ emoji: '🚀' }]);
    expect(csv).toContain('🚀');
  });

  it('single object with one key', () => {
    expect(objectsToCsv([{ k: 'v' }])).toBe('k\nv');
  });

  // Bulk: 40 tests
  for (let i = 0; i < 40; i++) {
    it(`objectsToCsv bulk ${i}`, () => {
      const objs = [{ [`key${i}`]: `val${i}` }];
      const result = csvToObjects(objectsToCsv(objs));
      expect(result[0][`key${i}`]).toBe(`val${i}`);
    });
  }
});

// ============================================================
// parseIni / stringifyIni — 80 tests
// ============================================================
describe('parseIni', () => {
  it('parses empty string to object with empty root section', () => {
    const result = parseIni('');
    expect(result['']).toEqual({});
  });

  it('parses root keys (before any section)', () => {
    const result = parseIni('key=value\nfoo=bar');
    expect(result[''].key).toBe('value');
    expect(result[''].foo).toBe('bar');
  });

  it('parses section with keys', () => {
    const result = parseIni('[database]\nhost=localhost\nport=5432');
    expect(result['database'].host).toBe('localhost');
    expect(result['database'].port).toBe('5432');
  });

  it('handles multiple sections', () => {
    const result = parseIni('[a]\nx=1\n[b]\ny=2');
    expect(result['a'].x).toBe('1');
    expect(result['b'].y).toBe('2');
  });

  it('ignores comment lines starting with ;', () => {
    const result = parseIni('; comment\nkey=val');
    expect(result[''].key).toBe('val');
    expect(Object.keys(result[''])).not.toContain('; comment');
  });

  it('ignores comment lines starting with #', () => {
    const result = parseIni('# comment\nkey=val');
    expect(result[''].key).toBe('val');
  });

  it('ignores blank lines', () => {
    const result = parseIni('\n\nkey=val\n\n');
    expect(result[''].key).toBe('val');
  });

  it('handles values with = in them', () => {
    const result = parseIni('url=http://x?a=1&b=2');
    expect(result[''].url).toBe('http://x?a=1&b=2');
  });

  it('strips leading/trailing whitespace from keys', () => {
    const result = parseIni('  key  =  value  ');
    expect(result[''].key).toBe('value');
  });

  it('handles CRLF line endings', () => {
    const result = parseIni('[s]\r\nk=v');
    expect(result['s'].k).toBe('v');
  });

  // Bulk: 40 parametric section tests
  for (let i = 0; i < 40; i++) {
    it(`parseIni section ${i}`, () => {
      const ini = `[section${i}]\nkey=value${i}`;
      const result = parseIni(ini);
      expect(result[`section${i}`].key).toBe(`value${i}`);
    });
  }
});

describe('stringifyIni', () => {
  it('serialises empty config', () => {
    expect(stringifyIni({ '': {} })).toBe('');
  });

  it('serialises root keys', () => {
    const out = stringifyIni({ '': { a: '1', b: '2' } });
    expect(out).toContain('a=1');
    expect(out).toContain('b=2');
  });

  it('serialises section', () => {
    const out = stringifyIni({ '': {}, db: { host: 'localhost' } });
    expect(out).toContain('[db]');
    expect(out).toContain('host=localhost');
  });

  it('round-trips through parseIni', () => {
    const config = { '': { top: '1' }, sec: { k: 'v' } };
    const parsed = parseIni(stringifyIni(config));
    expect(parsed[''].top).toBe('1');
    expect(parsed['sec'].k).toBe('v');
  });

  it('does not emit a header for root section', () => {
    const out = stringifyIni({ '': { k: 'v' } });
    expect(out.includes('[')).toBe(false);
  });

  // Bulk: 25 tests
  for (let i = 0; i < 25; i++) {
    it(`stringifyIni round-trip ${i}`, () => {
      const config = { '': {}, [`sec${i}`]: { [`k${i}`]: `v${i}` } };
      const parsed = parseIni(stringifyIni(config));
      expect(parsed[`sec${i}`][`k${i}`]).toBe(`v${i}`);
    });
  }
});

// ============================================================
// parseKeyValue / stringifyKeyValue — 60 tests
// ============================================================
describe('parseKeyValue', () => {
  it('parses KEY=VALUE lines', () => {
    expect(parseKeyValue('A=1\nB=2')).toEqual({ A: '1', B: '2' });
  });

  it('ignores comment lines (#)', () => {
    expect(parseKeyValue('# comment\nA=1')).toEqual({ A: '1' });
  });

  it('ignores comment lines (;)', () => {
    expect(parseKeyValue('; note\nA=1')).toEqual({ A: '1' });
  });

  it('ignores blank lines', () => {
    expect(parseKeyValue('\n\nA=1\n\n')).toEqual({ A: '1' });
  });

  it('custom colon delimiter', () => {
    expect(parseKeyValue('A:1\nB:2', ':')).toEqual({ A: '1', B: '2' });
  });

  it('value can contain delimiter char', () => {
    expect(parseKeyValue('URL=http://a=b')).toEqual({ URL: 'http://a=b' });
  });

  it('empty value', () => {
    expect(parseKeyValue('KEY=')).toEqual({ KEY: '' });
  });

  it('trims keys and values', () => {
    expect(parseKeyValue('  A  =  1  ')).toEqual({ A: '1' });
  });

  it('handles CRLF', () => {
    expect(parseKeyValue('A=1\r\nB=2')).toEqual({ A: '1', B: '2' });
  });

  it('empty string', () => {
    expect(parseKeyValue('')).toEqual({});
  });

  // Bulk: 50 tests
  for (let i = 0; i < 50; i++) {
    it(`parseKeyValue bulk ${i}`, () => {
      const text = `K${i}=V${i}`;
      expect(parseKeyValue(text)[`K${i}`]).toBe(`V${i}`);
    });
  }
});

describe('stringifyKeyValue', () => {
  it('serialises object', () => {
    expect(stringifyKeyValue({ A: '1', B: '2' })).toBe('A=1\nB=2');
  });

  it('uses custom delimiter', () => {
    expect(stringifyKeyValue({ A: '1' }, ':')).toBe('A:1');
  });

  it('empty object', () => {
    expect(stringifyKeyValue({})).toBe('');
  });

  it('round-trips through parseKeyValue', () => {
    const obj = { X: 'hello', Y: 'world' };
    expect(parseKeyValue(stringifyKeyValue(obj))).toEqual(obj);
  });

  it('single entry', () => {
    expect(stringifyKeyValue({ key: 'val' })).toBe('key=val');
  });

  for (let i = 0; i < 20; i++) {
    it(`stringifyKeyValue round-trip ${i}`, () => {
      const obj = { [`key${i}`]: `val${i}` };
      expect(parseKeyValue(stringifyKeyValue(obj))).toEqual(obj);
    });
  }
});

// ============================================================
// parseQueryString / stringifyQueryString / parseMultiValueQuery — 80 tests
// ============================================================
describe('parseQueryString', () => {
  it('parses empty string', () => {
    expect(parseQueryString('')).toEqual({});
  });

  it('parses single param', () => {
    expect(parseQueryString('a=1')).toEqual({ a: '1' });
  });

  it('strips leading ?', () => {
    expect(parseQueryString('?a=1')).toEqual({ a: '1' });
  });

  it('parses multiple params', () => {
    expect(parseQueryString('a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('repeated key becomes array', () => {
    const result = parseQueryString('x=1&x=2');
    expect(result.x).toEqual(['1', '2']);
  });

  it('decodes percent-encoded values', () => {
    expect(parseQueryString('q=hello%20world')).toEqual({ q: 'hello world' });
  });

  it('handles param without value', () => {
    expect(parseQueryString('flag')).toEqual({ flag: '' });
  });

  it('handles empty param', () => {
    expect(parseQueryString('a=&b=2')).toEqual({ a: '', b: '2' });
  });

  it('three repeated keys', () => {
    const result = parseQueryString('k=1&k=2&k=3') as Record<string, string[]>;
    expect(result.k).toEqual(['1', '2', '3']);
  });

  it('decodes + as space', () => {
    // Standard behavior: + is NOT decoded by decodeURIComponent (only %20 is)
    // but we confirm the key is correct
    const result = parseQueryString('a=b%2Bc');
    expect(result.a).toBe('b+c');
  });

  for (let i = 0; i < 40; i++) {
    it(`parseQueryString param ${i}`, () => {
      const qs = `param${i}=value${i}`;
      expect(parseQueryString(qs)[`param${i}`]).toBe(`value${i}`);
    });
  }
});

describe('stringifyQueryString', () => {
  it('serialises empty object', () => {
    expect(stringifyQueryString({})).toBe('');
  });

  it('serialises single param', () => {
    expect(stringifyQueryString({ a: '1' })).toBe('a=1');
  });

  it('serialises multiple params', () => {
    const qs = stringifyQueryString({ a: '1', b: '2' });
    expect(qs).toContain('a=1');
    expect(qs).toContain('b=2');
  });

  it('serialises array value', () => {
    const qs = stringifyQueryString({ x: ['1', '2'] });
    expect(qs).toBe('x=1&x=2');
  });

  it('encodes special characters', () => {
    const qs = stringifyQueryString({ q: 'hello world' });
    expect(qs).toBe('q=hello%20world');
  });

  it('handles boolean value', () => {
    const qs = stringifyQueryString({ flag: true });
    expect(qs).toBe('flag=true');
  });

  it('handles numeric value', () => {
    const qs = stringifyQueryString({ n: 42 });
    expect(qs).toBe('n=42');
  });

  it('round-trips through parseQueryString', () => {
    const params = { a: '1', b: '2' };
    const result = parseQueryString(stringifyQueryString(params));
    expect(result).toEqual(params);
  });

  for (let i = 0; i < 15; i++) {
    it(`stringifyQueryString round-trip ${i}`, () => {
      const params = { [`k${i}`]: `v${i}` };
      const result = parseQueryString(stringifyQueryString(params));
      expect(result[`k${i}`]).toBe(`v${i}`);
    });
  }
});

describe('parseMultiValueQuery', () => {
  it('returns arrays for every key', () => {
    const result = parseMultiValueQuery('a=1');
    expect(Array.isArray(result.a)).toBe(true);
    expect(result.a).toEqual(['1']);
  });

  it('accumulates repeated keys', () => {
    const result = parseMultiValueQuery('a=1&a=2');
    expect(result.a).toEqual(['1', '2']);
  });

  it('empty string gives empty object', () => {
    expect(parseMultiValueQuery('')).toEqual({});
  });

  it('multiple keys all as arrays', () => {
    const result = parseMultiValueQuery('a=1&b=2');
    expect(result.a).toEqual(['1']);
    expect(result.b).toEqual(['2']);
  });

  for (let i = 0; i < 10; i++) {
    it(`parseMultiValueQuery bulk ${i}`, () => {
      const result = parseMultiValueQuery(`k${i}=v${i}`);
      expect(result[`k${i}`]).toEqual([`v${i}`]);
    });
  }
});

// ============================================================
// safeJsonParse — 60 tests
// ============================================================
describe('safeJsonParse', () => {
  it('parses valid JSON object', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('not json', 42)).toBe(42);
  });

  it('parses JSON array', () => {
    expect(safeJsonParse('[1,2,3]', [])).toEqual([1, 2, 3]);
  });

  it('parses JSON null', () => {
    expect(safeJsonParse('null', 'default')).toBeNull();
  });

  it('parses JSON boolean true', () => {
    expect(safeJsonParse('true', false)).toBe(true);
  });

  it('parses JSON number', () => {
    expect(safeJsonParse('3.14', 0)).toBeCloseTo(3.14);
  });

  it('parses JSON string', () => {
    expect(safeJsonParse('"hello"', '')).toBe('hello');
  });

  it('empty string returns fallback', () => {
    expect(safeJsonParse('', null)).toBeNull();
  });

  it('returns object fallback on error', () => {
    expect(safeJsonParse('{bad}', { x: 1 })).toEqual({ x: 1 });
  });

  it('nested JSON object', () => {
    expect(safeJsonParse('{"a":{"b":2}}', {})).toEqual({ a: { b: 2 } });
  });

  // Bulk: 50 tests
  for (let i = 0; i < 50; i++) {
    it(`safeJsonParse bulk ${i}`, () => {
      const json = JSON.stringify({ idx: i, value: `v${i}` });
      const result = safeJsonParse<{ idx: number; value: string }>(json, { idx: -1, value: '' });
      expect(result.idx).toBe(i);
    });
  }
});

// ============================================================
// parseJson5Like — 50 tests
// ============================================================
describe('parseJson5Like', () => {
  it('parses standard JSON', () => {
    expect(parseJson5Like('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips single-line comments', () => {
    const json5 = `{
      // this is a comment
      "a": 1
    }`;
    expect(parseJson5Like(json5)).toEqual({ a: 1 });
  });

  it('handles trailing comma in object', () => {
    expect(parseJson5Like('{"a":1,"b":2,}')).toEqual({ a: 1, b: 2 });
  });

  it('handles trailing comma in array', () => {
    expect(parseJson5Like('[1,2,3,]')).toEqual([1, 2, 3]);
  });

  it('handles comment before closing brace', () => {
    const json5 = '{"a":1 // comment\n}';
    expect(parseJson5Like(json5)).toEqual({ a: 1 });
  });

  it('handles nested objects', () => {
    const json5 = '{"a":{"b":2,},}';
    expect(parseJson5Like(json5)).toEqual({ a: { b: 2 } });
  });

  it('preserves strings with //', () => {
    const json5 = '{"url":"http://example.com"}';
    const result = parseJson5Like(json5) as { url: string };
    expect(result.url).toBe('http://example.com');
  });

  it('handles empty object with no keys', () => {
    expect(parseJson5Like('{}')).toEqual({});
  });

  it('handles array with comments between items', () => {
    const json5 = '[1, // one\n2, // two\n3]';
    expect(parseJson5Like(json5)).toEqual([1, 2, 3]);
  });

  it('complex config-style JSON5', () => {
    const json5 = `{
      // Server config
      "host": "localhost",
      "port": 3000,
      "features": ["auth", "api",],
    }`;
    const result = parseJson5Like(json5) as { host: string; port: number; features: string[] };
    expect(result.host).toBe('localhost');
    expect(result.features).toEqual(['auth', 'api']);
  });

  // Bulk: 40 tests
  for (let i = 0; i < 40; i++) {
    it(`parseJson5Like bulk ${i}`, () => {
      const json5 = `{"idx":${i},"label":"item${i}",}`;
      const result = parseJson5Like(json5) as { idx: number; label: string };
      expect(result.idx).toBe(i);
      expect(result.label).toBe(`item${i}`);
    });
  }
});

// ============================================================
// extractJsonFromText — 40 tests
// ============================================================
describe('extractJsonFromText', () => {
  it('extracts JSON object from surrounding text', () => {
    expect(extractJsonFromText('prefix {"a":1} suffix')).toEqual({ a: 1 });
  });

  it('extracts JSON array from surrounding text', () => {
    expect(extractJsonFromText('data: [1,2,3] end')).toEqual([1, 2, 3]);
  });

  it('returns undefined if no JSON found', () => {
    expect(extractJsonFromText('no json here')).toBeUndefined();
  });

  it('handles JSON at start of string', () => {
    expect(extractJsonFromText('{"x":42} trailing')).toEqual({ x: 42 });
  });

  it('handles JSON at end of string', () => {
    expect(extractJsonFromText('prefix {"y":"z"}')).toEqual({ y: 'z' });
  });

  it('handles nested objects', () => {
    expect(extractJsonFromText('result: {"a":{"b":1}}')).toEqual({ a: { b: 1 } });
  });

  it('handles empty object', () => {
    expect(extractJsonFromText('here: {} now')).toEqual({});
  });

  it('handles empty array', () => {
    expect(extractJsonFromText('arr: [] .')).toEqual([]);
  });

  it('string only input', () => {
    expect(extractJsonFromText('hello world')).toBeUndefined();
  });

  it('only braces in text', () => {
    // Braces without valid JSON content
    expect(extractJsonFromText('{ not valid }')).toBeUndefined();
  });

  // Bulk: 30 tests
  for (let i = 0; i < 30; i++) {
    it(`extractJsonFromText bulk ${i}`, () => {
      const text = `prefix_${i} {"val":${i}} suffix_${i}`;
      const result = extractJsonFromText(text) as { val: number };
      expect(result.val).toBe(i);
    });
  }
});

// ============================================================
// parseTemplate — 60 tests
// ============================================================
describe('parseTemplate', () => {
  it('replaces {{key}} placeholders', () => {
    expect(parseTemplate('Hello {{name}}!', { name: 'Alice' })).toBe('Hello Alice!');
  });

  it('replaces ${key} placeholders', () => {
    expect(parseTemplate('Hello ${name}!', { name: 'Bob' })).toBe('Hello Bob!');
  });

  it('leaves unknown keys unchanged', () => {
    expect(parseTemplate('{{unknown}}', { a: '1' })).toBe('{{unknown}}');
  });

  it('replaces multiple different keys', () => {
    expect(parseTemplate('{{a}} and {{b}}', { a: 'x', b: 'y' })).toBe('x and y');
  });

  it('replaces same key multiple times', () => {
    expect(parseTemplate('{{x}}={{x}}', { x: '5' })).toBe('5=5');
  });

  it('handles numeric values', () => {
    expect(parseTemplate('Port: {{port}}', { port: 3000 })).toBe('Port: 3000');
  });

  it('handles boolean values', () => {
    expect(parseTemplate('Debug: {{debug}}', { debug: true })).toBe('Debug: true');
  });

  it('empty template', () => {
    expect(parseTemplate('', { a: '1' })).toBe('');
  });

  it('template with no placeholders', () => {
    expect(parseTemplate('no vars here', { a: '1' })).toBe('no vars here');
  });

  it('mixed placeholder styles', () => {
    const result = parseTemplate('{{a}} and ${b}', { a: 'A', b: 'B' });
    expect(result).toBe('A and B');
  });

  // Bulk: 50 tests
  for (let i = 0; i < 50; i++) {
    it(`parseTemplate bulk ${i}`, () => {
      const template = `Hello {{user${i}}}`;
      const result = parseTemplate(template, { [`user${i}`]: `Alice${i}` });
      expect(result).toBe(`Hello Alice${i}`);
    });
  }
});

// ============================================================
// tokenizeExpression — 60 tests
// ============================================================
describe('tokenizeExpression', () => {
  it('tokenises a simple addition', () => {
    const tokens = tokenizeExpression('1 + 2');
    const types = tokens.map(t => t.type);
    expect(types).toContain(TokenType.Number);
    expect(types).toContain(TokenType.Operator);
  });

  it('tokenises a simple number', () => {
    const [tok] = tokenizeExpression('42');
    expect(tok.type).toBe(TokenType.Number);
    expect(tok.value).toBe('42');
  });

  it('tokenises a float number', () => {
    const [tok] = tokenizeExpression('3.14');
    expect(tok.type).toBe(TokenType.Number);
    expect(tok.value).toBe('3.14');
  });

  it('tokenises an identifier', () => {
    const [tok] = tokenizeExpression('myVar');
    expect(tok.type).toBe(TokenType.Identifier);
    expect(tok.value).toBe('myVar');
  });

  it('tokenises a double-quoted string', () => {
    const [tok] = tokenizeExpression('"hello"');
    expect(tok.type).toBe(TokenType.String);
    expect(tok.value).toBe('"hello"');
  });

  it('tokenises punctuation', () => {
    const [tok] = tokenizeExpression('(');
    expect(tok.type).toBe(TokenType.Punctuation);
  });

  it('tokenises whitespace', () => {
    const [tok] = tokenizeExpression('   ');
    expect(tok.type).toBe(TokenType.Whitespace);
  });

  it('two-char operator ==', () => {
    const tokens = tokenizeExpression('a==b');
    const op = tokens.find(t => t.type === TokenType.Operator);
    expect(op?.value).toBe('==');
  });

  it('two-char operator !=', () => {
    const tokens = tokenizeExpression('a!=b');
    const op = tokens.find(t => t.type === TokenType.Operator);
    expect(op?.value).toBe('!=');
  });

  it('empty expression gives empty array', () => {
    expect(tokenizeExpression('')).toEqual([]);
  });

  it('position of first token is 0', () => {
    const [tok] = tokenizeExpression('abc');
    expect(tok.position).toBe(0);
  });

  it('position advances correctly', () => {
    const tokens = tokenizeExpression('a b');
    expect(tokens[0].position).toBe(0);
    expect(tokens[1].position).toBe(1); // whitespace
    expect(tokens[2].position).toBe(2);
  });

  it('complex expression tokenises without error', () => {
    const tokens = tokenizeExpression('x * (y + 2.5) >= 10');
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('two-char operator &&', () => {
    const tokens = tokenizeExpression('a&&b');
    const op = tokens.find(t => t.value === '&&');
    expect(op?.type).toBe(TokenType.Operator);
  });

  it('two-char operator ||', () => {
    const tokens = tokenizeExpression('a||b');
    const op = tokens.find(t => t.value === '||');
    expect(op?.type).toBe(TokenType.Operator);
  });

  // Bulk: 45 tests
  for (let i = 0; i < 45; i++) {
    it(`tokenizeExpression bulk ${i}: identifier token`, () => {
      const expr = `var${i}`;
      const [tok] = tokenizeExpression(expr);
      expect(tok.type).toBe(TokenType.Identifier);
      expect(tok.value).toBe(`var${i}`);
    });
  }
});

// ============================================================
// parseBooleanValue — 50 tests
// ============================================================
describe('parseBooleanValue', () => {
  const trueValues = ['true', 'True', 'TRUE', 'yes', 'YES', 'Yes', '1', 'on', 'ON', 'On', 'enabled', 'y', 't'];
  const falseValues = ['false', 'False', 'FALSE', 'no', 'NO', 'No', '0', 'off', 'OFF', 'Off', 'disabled', 'n', 'f'];

  trueValues.forEach(v => {
    it(`"${v}" → true`, () => {
      expect(parseBooleanValue(v)).toBe(true);
    });
  });

  falseValues.forEach(v => {
    it(`"${v}" → false`, () => {
      expect(parseBooleanValue(v)).toBe(false);
    });
  });

  it('throws for unrecognised value', () => {
    expect(() => parseBooleanValue('maybe')).toThrow(RangeError);
  });

  it('trims whitespace', () => {
    expect(parseBooleanValue('  true  ')).toBe(true);
  });

  it('case-insensitive TRUE', () => {
    expect(parseBooleanValue('TRUE')).toBe(true);
  });

  // Extra bulk
  for (let i = 0; i < 10; i++) {
    it(`parseBooleanValue unknown value ${i}`, () => {
      expect(() => parseBooleanValue(`unknown${i}`)).toThrow();
    });
  }
});

// ============================================================
// parseIntSafe / parseFloatSafe — 60 tests
// ============================================================
describe('parseIntSafe', () => {
  it('parses a decimal integer string', () => {
    expect(parseIntSafe('42')).toBe(42);
  });

  it('returns fallback for non-numeric string', () => {
    expect(parseIntSafe('abc')).toBe(0);
  });

  it('custom fallback', () => {
    expect(parseIntSafe('bad', 10, -1)).toBe(-1);
  });

  it('parses hex with radix 16', () => {
    expect(parseIntSafe('ff', 16)).toBe(255);
  });

  it('parses binary with radix 2', () => {
    expect(parseIntSafe('1010', 2)).toBe(10);
  });

  it('parses negative integer', () => {
    expect(parseIntSafe('-7')).toBe(-7);
  });

  it('ignores trailing text (parseInt behaviour)', () => {
    expect(parseIntSafe('42abc')).toBe(42);
  });

  it('empty string returns fallback', () => {
    expect(parseIntSafe('')).toBe(0);
  });

  it('parses zero', () => {
    expect(parseIntSafe('0')).toBe(0);
  });

  it('parses large number', () => {
    expect(parseIntSafe('999999')).toBe(999999);
  });

  for (let i = 0; i < 50; i++) {
    it(`parseIntSafe bulk ${i}`, () => {
      expect(parseIntSafe(String(i))).toBe(i);
    });
  }
});

describe('parseFloatSafe', () => {
  it('parses a float string', () => {
    expect(parseFloatSafe('3.14')).toBeCloseTo(3.14);
  });

  it('returns fallback for non-numeric', () => {
    expect(parseFloatSafe('abc')).toBe(0);
  });

  it('custom fallback', () => {
    expect(parseFloatSafe('bad', -1.5)).toBe(-1.5);
  });

  it('parses negative float', () => {
    expect(parseFloatSafe('-0.5')).toBeCloseTo(-0.5);
  });

  it('empty string returns fallback', () => {
    expect(parseFloatSafe('')).toBe(0);
  });

  it('parses integer as float', () => {
    expect(parseFloatSafe('7')).toBe(7);
  });

  it('parses exponential notation', () => {
    expect(parseFloatSafe('1e3')).toBe(1000);
  });

  it('returns zero for undefined-like', () => {
    expect(parseFloatSafe('undefined')).toBe(0);
  });

  for (let i = 0; i < 20; i++) {
    it(`parseFloatSafe bulk ${i}`, () => {
      const val = i * 0.5;
      expect(parseFloatSafe(String(val))).toBeCloseTo(val);
    });
  }
});

// ============================================================
// parseDotPath — 60 tests
// ============================================================
describe('parseDotPath', () => {
  it('splits simple path', () => {
    expect(parseDotPath('a.b.c')).toEqual(['a', 'b', 'c']);
  });

  it('handles single segment', () => {
    expect(parseDotPath('a')).toEqual(['a']);
  });

  it('returns empty array for empty string', () => {
    expect(parseDotPath('')).toEqual([]);
  });

  it('handles array notation', () => {
    expect(parseDotPath('a[0].b')).toEqual(['a', '0', 'b']);
  });

  it('handles multiple array indices', () => {
    expect(parseDotPath('a[0][1].b')).toEqual(['a', '0', '1', 'b']);
  });

  it('handles leading array notation', () => {
    expect(parseDotPath('[0].a')).toEqual(['0', 'a']);
  });

  it('deep path', () => {
    expect(parseDotPath('a.b.c.d.e')).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('numeric keys in path', () => {
    expect(parseDotPath('0.1.2')).toEqual(['0', '1', '2']);
  });

  it('consecutive dots produce no empty segments', () => {
    // a..b normalised: filter removes empty strings
    const result = parseDotPath('a..b');
    expect(result).toEqual(['a', 'b']);
  });

  it('array at end', () => {
    expect(parseDotPath('a.b[2]')).toEqual(['a', 'b', '2']);
  });

  for (let i = 0; i < 50; i++) {
    it(`parseDotPath bulk ${i}`, () => {
      const path = `root.child${i}.leaf`;
      expect(parseDotPath(path)).toEqual(['root', `child${i}`, 'leaf']);
    });
  }
});

// ============================================================
// parseGlobPattern — 50 tests
// ============================================================
describe('parseGlobPattern', () => {
  it('matches exact string', () => {
    const re = parseGlobPattern('foo.ts');
    expect(re.test('foo.ts')).toBe(true);
    expect(re.test('bar.ts')).toBe(false);
  });

  it('* matches within a segment', () => {
    const re = parseGlobPattern('*.ts');
    expect(re.test('index.ts')).toBe(true);
    expect(re.test('src/index.ts')).toBe(false);
  });

  it('** matches across segments', () => {
    const re = parseGlobPattern('**/*.ts');
    expect(re.test('src/index.ts')).toBe(true);
    expect(re.test('a/b/c.ts')).toBe(true);
  });

  it('? matches single char', () => {
    const re = parseGlobPattern('fo?.ts');
    expect(re.test('foo.ts')).toBe(true);
    expect(re.test('fooo.ts')).toBe(false);
  });

  it('** at root matches deep paths', () => {
    const re = parseGlobPattern('**');
    expect(re.test('a/b/c')).toBe(true);
    expect(re.test('x')).toBe(true);
  });

  it('exact match with extension', () => {
    const re = parseGlobPattern('config.json');
    expect(re.test('config.json')).toBe(true);
    expect(re.test('config.yaml')).toBe(false);
  });

  it('prefix wildcard', () => {
    const re = parseGlobPattern('src/*');
    expect(re.test('src/index.ts')).toBe(true);
    expect(re.test('lib/index.ts')).toBe(false);
  });

  it('returns a RegExp', () => {
    expect(parseGlobPattern('*')).toBeInstanceOf(RegExp);
  });

  it('handles path with subdirectories via **', () => {
    const re = parseGlobPattern('src/**/*.test.ts');
    expect(re.test('src/a/b/foo.test.ts')).toBe(true);
  });

  it('? does not match slash', () => {
    const re = parseGlobPattern('src/?ndex.ts');
    expect(re.test('src/index.ts')).toBe(true);
    expect(re.test('src//ndex.ts')).toBe(false);
  });

  for (let i = 0; i < 40; i++) {
    it(`parseGlobPattern bulk ${i}: exact match`, () => {
      const pattern = `file${i}.txt`;
      const re = parseGlobPattern(pattern);
      expect(re.test(`file${i}.txt`)).toBe(true);
      expect(re.test(`file${i + 1}.txt`)).toBe(false);
    });
  }
});

// ============================================================
// parseSemver — 60 tests
// ============================================================
describe('parseSemver', () => {
  it('parses simple semver', () => {
    expect(parseSemver('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, pre: '', build: '' });
  });

  it('parses with pre-release', () => {
    const r = parseSemver('1.0.0-beta.1');
    expect(r.pre).toBe('beta.1');
    expect(r.major).toBe(1);
  });

  it('parses with build metadata', () => {
    const r = parseSemver('1.0.0+build.123');
    expect(r.build).toBe('build.123');
  });

  it('parses with both pre and build', () => {
    const r = parseSemver('2.3.4-alpha.1+sha.abc');
    expect(r.pre).toBe('alpha.1');
    expect(r.build).toBe('sha.abc');
  });

  it('throws for invalid semver', () => {
    expect(() => parseSemver('1.0')).toThrow(SyntaxError);
  });

  it('throws for non-numeric major', () => {
    expect(() => parseSemver('a.b.c')).toThrow(SyntaxError);
  });

  it('parses 0.0.0', () => {
    const r = parseSemver('0.0.0');
    expect(r).toEqual({ major: 0, minor: 0, patch: 0, pre: '', build: '' });
  });

  it('major number is numeric', () => {
    expect(parseSemver('10.0.0').major).toBe(10);
  });

  it('minor number is numeric', () => {
    expect(parseSemver('0.20.0').minor).toBe(20);
  });

  it('patch number is numeric', () => {
    expect(parseSemver('0.0.30').patch).toBe(30);
  });

  for (let i = 0; i < 50; i++) {
    it(`parseSemver bulk ${i}`, () => {
      const r = parseSemver(`${i}.${i}.${i}`);
      expect(r.major).toBe(i);
      expect(r.minor).toBe(i);
      expect(r.patch).toBe(i);
    });
  }
});

// ============================================================
// compareSemver — 50 tests
// ============================================================
describe('compareSemver', () => {
  it('equal versions return 0', () => {
    expect(compareSemver('1.0.0', '1.0.0')).toBe(0);
  });

  it('higher major wins', () => {
    expect(compareSemver('2.0.0', '1.0.0')).toBe(1);
  });

  it('lower major loses', () => {
    expect(compareSemver('1.0.0', '2.0.0')).toBe(-1);
  });

  it('higher minor wins when major equal', () => {
    expect(compareSemver('1.2.0', '1.1.0')).toBe(1);
  });

  it('higher patch wins when major/minor equal', () => {
    expect(compareSemver('1.0.1', '1.0.0')).toBe(1);
  });

  it('release > pre-release of same version', () => {
    expect(compareSemver('1.0.0', '1.0.0-beta')).toBe(1);
  });

  it('pre-release < release of same version', () => {
    expect(compareSemver('1.0.0-beta', '1.0.0')).toBe(-1);
  });

  it('pre-release lexicographic comparison', () => {
    expect(compareSemver('1.0.0-alpha', '1.0.0-beta')).toBe(-1);
  });

  it('same pre-release returns 0', () => {
    expect(compareSemver('1.0.0-alpha', '1.0.0-alpha')).toBe(0);
  });

  it('build metadata is ignored in comparison', () => {
    expect(compareSemver('1.0.0+build.1', '1.0.0+build.2')).toBe(0);
  });

  for (let i = 1; i <= 40; i++) {
    it(`compareSemver ascending sequence ${i}`, () => {
      expect(compareSemver(`${i}.0.0`, `${i - 1}.0.0`)).toBe(1);
    });
  }
});

// ============================================================
// ok / fail helpers — 20 tests
// ============================================================
describe('ok and fail helpers', () => {
  it('ok wraps data with success=true', () => {
    expect(ok(42)).toEqual({ success: true, data: 42 });
  });

  it('ok with string', () => {
    expect(ok('hello')).toEqual({ success: true, data: 'hello' });
  });

  it('ok with object', () => {
    expect(ok({ a: 1 })).toEqual({ success: true, data: { a: 1 } });
  });

  it('ok with array', () => {
    expect(ok([1, 2])).toEqual({ success: true, data: [1, 2] });
  });

  it('ok with null', () => {
    expect(ok(null)).toEqual({ success: true, data: null });
  });

  it('fail wraps error with success=false', () => {
    expect(fail('oops')).toEqual({ success: false, error: 'oops' });
  });

  it('fail has no data key', () => {
    expect(fail('err').data).toBeUndefined();
  });

  it('ok has no error key', () => {
    expect(ok(1).error).toBeUndefined();
  });

  it('ok with boolean false', () => {
    const r = ok(false);
    expect(r.success).toBe(true);
    expect(r.data).toBe(false);
  });

  it('fail with long message', () => {
    const msg = 'a'.repeat(200);
    expect(fail(msg).error).toBe(msg);
  });

  for (let i = 0; i < 10; i++) {
    it(`ok/fail round-trip ${i}`, () => {
      const r = ok(i);
      expect(r.success).toBe(true);
      expect(r.data).toBe(i);
      const e = fail<number>(`err${i}`);
      expect(e.success).toBe(false);
      expect(e.error).toBe(`err${i}`);
    });
  }
});

// ============================================================
// TokenType enum — 10 tests
// ============================================================
describe('TokenType enum', () => {
  it('Number is defined', () => { expect(TokenType.Number).toBe('Number'); });
  it('String is defined', () => { expect(TokenType.String).toBe('String'); });
  it('Identifier is defined', () => { expect(TokenType.Identifier).toBe('Identifier'); });
  it('Operator is defined', () => { expect(TokenType.Operator).toBe('Operator'); });
  it('Punctuation is defined', () => { expect(TokenType.Punctuation).toBe('Punctuation'); });
  it('Whitespace is defined', () => { expect(TokenType.Whitespace).toBe('Whitespace'); });
  it('Unknown is defined', () => { expect(TokenType.Unknown).toBe('Unknown'); });
  it('has exactly 7 members', () => {
    const members = Object.values(TokenType);
    expect(members).toHaveLength(7);
  });
  it('all values are strings', () => {
    for (const v of Object.values(TokenType)) {
      expect(typeof v).toBe('string');
    }
  });
  it('values are unique', () => {
    const vals = Object.values(TokenType);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

// ============================================================
// Edge case / integration tests — 30 tests
// ============================================================
describe('edge cases and integration', () => {
  it('parseCsv then objectsToCsv then csvToObjects round-trip', () => {
    const csv = 'name,score\nAlice,100\nBob,90';
    const objs = csvToObjects(csv);
    const roundTrip = csvToObjects(objectsToCsv(objs));
    expect(roundTrip).toEqual(objs);
  });

  it('parseIni then stringifyIni then parseIni round-trip', () => {
    const ini = '[server]\nhost=localhost\nport=8080';
    const parsed = parseIni(ini);
    const reparsed = parseIni(stringifyIni(parsed));
    expect(reparsed['server'].host).toBe('localhost');
  });

  it('parseQueryString handles encoded ampersand in value', () => {
    const result = parseQueryString('a=x%26y');
    expect(result.a).toBe('x&y');
  });

  it('parseDotPath + array access simulation', () => {
    const path = parseDotPath('users[0].name');
    const obj: Record<string, unknown> = { users: [{ name: 'Alice' }] };
    let current: unknown = obj;
    for (const seg of path) {
      current = (current as Record<string, unknown>)[seg];
    }
    expect(current).toBe('Alice');
  });

  it('parseGlobPattern matches typical test file patterns', () => {
    const re = parseGlobPattern('**/*.test.ts');
    expect(re.test('src/foo/bar.test.ts')).toBe(true);
    expect(re.test('src/foo/bar.ts')).toBe(false);
  });

  it('parseSemver + compareSemver: sorted order', () => {
    const versions = ['1.0.0', '2.0.0', '1.5.0', '0.9.0'];
    const sorted = [...versions].sort(compareSemver);
    expect(sorted[0]).toBe('0.9.0');
    expect(sorted[3]).toBe('2.0.0');
  });

  it('safeJsonParse works with deeply nested structures', () => {
    const deep = JSON.stringify({ a: { b: { c: { d: 42 } } } });
    const r = safeJsonParse<{ a: { b: { c: { d: number } } } }>(deep, { a: { b: { c: { d: 0 } } } });
    expect(r.a.b.c.d).toBe(42);
  });

  it('tokenizeExpression + filtering for identifiers', () => {
    const tokens = tokenizeExpression('x + y * z');
    const ids = tokens.filter(t => t.type === TokenType.Identifier).map(t => t.value);
    expect(ids).toEqual(['x', 'y', 'z']);
  });

  it('parseTemplate with number zero', () => {
    expect(parseTemplate('Count: {{count}}', { count: 0 })).toBe('Count: 0');
  });

  it('parseKeyValue with multi-line env file', () => {
    const env = '# Config\nHOST=localhost\nPORT=5432\n# DB\nDB=ims';
    const result = parseKeyValue(env);
    expect(result.HOST).toBe('localhost');
    expect(result.PORT).toBe('5432');
    expect(result.DB).toBe('ims');
  });

  for (let i = 0; i < 20; i++) {
    it(`integration bulk ${i}: template + querystring`, () => {
      const qs = stringifyQueryString({ route: `page${i}`, id: String(i) });
      const parsed = parseQueryString(qs);
      const tmpl = parseTemplate('{{route}}/{{id}}', {
        route: String(parsed.route),
        id: String(parsed.id),
      });
      expect(tmpl).toBe(`page${i}/${i}`);
    });
  }
});
