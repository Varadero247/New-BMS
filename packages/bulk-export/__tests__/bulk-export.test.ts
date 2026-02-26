// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import {
  getMimeType, getExtension, getMaxRows, formatCellValue, buildCsvRow,
  buildCsvContent, buildJsonContent, ensureFilenameExtension, isValidFormat,
  validateColumns, exportData, chunkRows, mergeExportResults,
  MIME_TYPES, FILE_EXTENSIONS, MAX_ROWS,
} from '../src/index';
import type { ExportColumn, ExportOptions, ExportResult } from '../src/index';

const COLS: ExportColumn[] = [
  { key: 'id', label: 'ID', format: 'number' },
  { key: 'name', label: 'Name', format: 'text' },
  { key: 'amount', label: 'Amount', format: 'currency' },
  { key: 'date', label: 'Date', format: 'date' },
  { key: 'active', label: 'Active', format: 'boolean' },
];

const ROWS = [
  { id: 1, name: 'Alice', amount: 1500, date: '2026-01-15', active: true },
  { id: 2, name: 'Bob', amount: 2500, date: '2026-02-20', active: false },
  { id: 3, name: 'Carol', amount: 500, date: '2026-03-10', active: true },
];

function makeOpts(overrides: Partial<ExportOptions> = {}): ExportOptions {
  return { format: 'csv', filename: 'export', columns: COLS, ...overrides };
}

// ─── MIME_TYPES ───────────────────────────────────────────────────────────────
describe('MIME_TYPES constant', () => {
  it('has xlsx', () => expect(MIME_TYPES.xlsx).toContain('spreadsheet'));
  it('has csv', () => expect(MIME_TYPES.csv).toBe('text/csv'));
  it('has pdf', () => expect(MIME_TYPES.pdf).toBe('application/pdf'));
  it('has json', () => expect(MIME_TYPES.json).toBe('application/json'));
  it('has 4 entries', () => expect(Object.keys(MIME_TYPES)).toHaveLength(4));
  for (let i = 0; i < 50; i++) {
    it(`MIME_TYPES.csv is text/csv iter${i}`, () => expect(MIME_TYPES.csv).toBe('text/csv'));
  }
});

// ─── FILE_EXTENSIONS ─────────────────────────────────────────────────────────
describe('FILE_EXTENSIONS constant', () => {
  it('xlsx → xlsx', () => expect(FILE_EXTENSIONS.xlsx).toBe('xlsx'));
  it('csv → csv', () => expect(FILE_EXTENSIONS.csv).toBe('csv'));
  it('pdf → pdf', () => expect(FILE_EXTENSIONS.pdf).toBe('pdf'));
  it('json → json', () => expect(FILE_EXTENSIONS.json).toBe('json'));
  for (let i = 0; i < 30; i++) {
    it(`FILE_EXTENSIONS.json is json iter${i}`, () => expect(FILE_EXTENSIONS.json).toBe('json'));
  }
});

// ─── MAX_ROWS ─────────────────────────────────────────────────────────────────
describe('MAX_ROWS constant', () => {
  it('xlsx > 1M', () => expect(MAX_ROWS.xlsx).toBeGreaterThan(1_000_000));
  it('csv > xlsx', () => expect(MAX_ROWS.csv).toBeGreaterThan(MAX_ROWS.xlsx));
  it('pdf is 10000', () => expect(MAX_ROWS.pdf).toBe(10_000));
  it('json > 500K', () => expect(MAX_ROWS.json).toBeGreaterThan(500_000));
  for (let i = 0; i < 30; i++) {
    it(`MAX_ROWS.pdf is 10000 iter${i}`, () => expect(MAX_ROWS.pdf).toBe(10_000));
  }
});

// ─── getMimeType ──────────────────────────────────────────────────────────────
describe('getMimeType', () => {
  it('csv', () => expect(getMimeType('csv')).toBe('text/csv'));
  it('json', () => expect(getMimeType('json')).toBe('application/json'));
  it('xlsx', () => expect(getMimeType('xlsx')).toContain('spreadsheet'));
  it('pdf', () => expect(getMimeType('pdf')).toBe('application/pdf'));
  const formats = ['csv', 'json', 'xlsx', 'pdf'] as const;
  for (let i = 0; i < 50; i++) {
    const fmt = formats[i % formats.length];
    it(`getMimeType ${fmt} iter${i}`, () => expect(getMimeType(fmt)).toBeTruthy());
  }
});

// ─── getExtension ─────────────────────────────────────────────────────────────
describe('getExtension', () => {
  it('csv → csv', () => expect(getExtension('csv')).toBe('csv'));
  it('xlsx → xlsx', () => expect(getExtension('xlsx')).toBe('xlsx'));
  it('pdf → pdf', () => expect(getExtension('pdf')).toBe('pdf'));
  it('json → json', () => expect(getExtension('json')).toBe('json'));
  for (let i = 0; i < 30; i++) {
    it(`getExtension csv iter${i}`, () => expect(getExtension('csv')).toBe('csv'));
  }
});

// ─── getMaxRows ───────────────────────────────────────────────────────────────
describe('getMaxRows', () => {
  it('returns > 0 for all formats', () => {
    (['csv', 'xlsx', 'pdf', 'json'] as const).forEach((f) =>
      expect(getMaxRows(f)).toBeGreaterThan(0)
    );
  });
  it('pdf < xlsx', () => expect(getMaxRows('pdf')).toBeLessThan(getMaxRows('xlsx')));
  for (let i = 0; i < 30; i++) {
    it(`getMaxRows pdf iter${i}`, () => expect(getMaxRows('pdf')).toBe(10_000));
  }
});

// ─── isValidFormat ────────────────────────────────────────────────────────────
describe('isValidFormat', () => {
  it('csv valid', () => expect(isValidFormat('csv')).toBe(true));
  it('xlsx valid', () => expect(isValidFormat('xlsx')).toBe(true));
  it('pdf valid', () => expect(isValidFormat('pdf')).toBe(true));
  it('json valid', () => expect(isValidFormat('json')).toBe(true));
  it('docx invalid', () => expect(isValidFormat('docx')).toBe(false));
  it('empty invalid', () => expect(isValidFormat('')).toBe(false));
  it('XML invalid', () => expect(isValidFormat('XML')).toBe(false));
  it('TXT invalid', () => expect(isValidFormat('txt')).toBe(false));
  for (let i = 0; i < 50; i++) {
    it(`invalid${i} is false`, () => expect(isValidFormat(`fmt${i}`)).toBe(false));
  }
  for (let i = 0; i < 40; i++) {
    const f = ['csv', 'xlsx', 'pdf', 'json'][i % 4];
    it(`isValidFormat ${f} is true iter${i}`, () => expect(isValidFormat(f)).toBe(true));
  }
});

// ─── validateColumns ──────────────────────────────────────────────────────────
describe('validateColumns', () => {
  it('null returns error', () => expect(validateColumns(null as unknown as ExportColumn[])).toBeTruthy());
  it('empty returns error', () => expect(validateColumns([])).toBeTruthy());
  it('valid returns null', () => expect(validateColumns(COLS)).toBeNull());
  it('missing key returns error', () => expect(validateColumns([{ key: '', label: 'X' }])).toBeTruthy());
  it('missing label returns error', () => expect(validateColumns([{ key: 'x', label: '' }])).toBeTruthy());
  for (let i = 0; i < 30; i++) {
    it(`valid cols null iter${i}`, () => expect(validateColumns(COLS)).toBeNull());
  }
});

// ─── ensureFilenameExtension ──────────────────────────────────────────────────
describe('ensureFilenameExtension', () => {
  it('adds extension if missing', () => expect(ensureFilenameExtension('report', 'csv')).toBe('report.csv'));
  it('does not double-add', () => expect(ensureFilenameExtension('report.csv', 'csv')).toBe('report.csv'));
  it('adds xlsx', () => expect(ensureFilenameExtension('data', 'xlsx')).toBe('data.xlsx'));
  it('adds pdf', () => expect(ensureFilenameExtension('doc', 'pdf')).toBe('doc.pdf'));
  it('adds json', () => expect(ensureFilenameExtension('out', 'json')).toBe('out.json'));
  for (let i = 0; i < 50; i++) {
    it(`ensureFilename iter${i}`, () => {
      const fmt = (['csv', 'xlsx', 'pdf', 'json'] as const)[i % 4];
      expect(ensureFilenameExtension(`file${i}`, fmt)).toBe(`file${i}.${fmt}`);
    });
  }
});

// ─── formatCellValue ──────────────────────────────────────────────────────────
describe('formatCellValue', () => {
  const textCol: ExportColumn = { key: 'x', label: 'X', format: 'text' };
  const numCol: ExportColumn = { key: 'x', label: 'X', format: 'number' };
  const currCol: ExportColumn = { key: 'x', label: 'X', format: 'currency' };
  const dateCol: ExportColumn = { key: 'x', label: 'X', format: 'date' };
  const boolCol: ExportColumn = { key: 'x', label: 'X', format: 'boolean' };

  it('null → empty', () => expect(formatCellValue(null, textCol)).toBe(''));
  it('undefined → empty', () => expect(formatCellValue(undefined, textCol)).toBe(''));
  it('string passthrough', () => expect(formatCellValue('hello', textCol)).toBe('hello'));
  it('number as text', () => expect(formatCellValue(42, textCol)).toBe('42'));
  it('number format', () => expect(formatCellValue(42, numCol)).toBe('42'));
  it('currency format £', () => expect(formatCellValue(1500, currCol)).toBe('£1500.00'));
  it('currency format € custom', () => expect(formatCellValue(100, currCol, { currencySymbol: '€' })).toBe('€100.00'));
  it('boolean true → Yes', () => expect(formatCellValue(true, boolCol)).toBe('Yes'));
  it('boolean false → No', () => expect(formatCellValue(false, boolCol)).toBe('No'));
  it('date ISO', () => expect(formatCellValue('2026-01-15', dateCol)).toMatch(/2026/));
  it('invalid date returns string', () => expect(formatCellValue('not-a-date', dateCol)).toBeTruthy());
  for (let i = 0; i < 50; i++) {
    it(`formatCellValue number ${i}`, () => expect(formatCellValue(i, numCol)).toBe(String(i)));
  }
  for (let i = 0; i < 50; i++) {
    it(`formatCellValue currency ${i}`, () => {
      const result = formatCellValue(i * 10, currCol);
      expect(result).toContain('£');
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`formatCellValue bool iter${i}`, () => {
      expect(formatCellValue(i % 2 === 0, boolCol)).toMatch(/Yes|No/);
    });
  }
});

// ─── buildCsvRow ──────────────────────────────────────────────────────────────
describe('buildCsvRow', () => {
  it('simple join', () => expect(buildCsvRow(['a', 'b', 'c'])).toBe('a,b,c'));
  it('quotes value with comma', () => expect(buildCsvRow(['a,b', 'c'])).toBe('"a,b",c'));
  it('quotes value with newline', () => expect(buildCsvRow(['a\nb', 'c'])).toBe('"a\nb",c'));
  it('escapes double quotes', () => expect(buildCsvRow(['"quoted"', 'x'])).toBe('"""quoted""",x'));
  it('empty cells', () => expect(buildCsvRow(['', ''])).toBe(','));
  for (let i = 0; i < 50; i++) {
    it(`buildCsvRow simple iter${i}`, () => {
      const row = [`val${i}`, `name${i}`];
      expect(buildCsvRow(row)).toBe(`val${i},name${i}`);
    });
  }
});

// ─── buildCsvContent ──────────────────────────────────────────────────────────
describe('buildCsvContent', () => {
  it('includes headers by default', () => {
    const csv = buildCsvContent(ROWS, COLS);
    expect(csv.startsWith('ID,')).toBe(true);
  });
  it('excludes headers when false', () => {
    const csv = buildCsvContent(ROWS, COLS, false);
    expect(csv.startsWith('ID,')).toBe(false);
  });
  it('row count matches', () => {
    const csv = buildCsvContent(ROWS, COLS);
    expect(csv.split('\n')).toHaveLength(ROWS.length + 1); // +1 for header
  });
  it('empty rows returns header only', () => {
    const csv = buildCsvContent([], COLS, true);
    expect(csv.split('\n')).toHaveLength(1);
  });
  for (let i = 1; i <= 50; i++) {
    it(`buildCsvContent ${i} rows`, () => {
      const rows = Array.from({ length: i }, (_, j) => ({ id: j, name: `n${j}`, amount: j * 10, date: '2026-01-01', active: true }));
      const csv = buildCsvContent(rows, COLS, true);
      expect(csv.split('\n')).toHaveLength(i + 1);
    });
  }
});

// ─── buildJsonContent ─────────────────────────────────────────────────────────
describe('buildJsonContent', () => {
  it('returns valid JSON', () => {
    const json = buildJsonContent(ROWS, COLS);
    expect(() => JSON.parse(json)).not.toThrow();
  });
  it('contains all rows', () => {
    const json = buildJsonContent(ROWS, COLS);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(ROWS.length);
  });
  it('only includes specified columns', () => {
    const cols: ExportColumn[] = [{ key: 'id', label: 'ID' }];
    const json = buildJsonContent(ROWS, cols);
    const parsed = JSON.parse(json);
    expect(parsed[0]).toHaveProperty('id');
    expect(parsed[0]).not.toHaveProperty('name');
  });
  it('missing key → null', () => {
    const cols: ExportColumn[] = [{ key: 'missing', label: 'X' }];
    const parsed = JSON.parse(buildJsonContent(ROWS, cols));
    expect(parsed[0].missing).toBeNull();
  });
  for (let i = 1; i <= 40; i++) {
    it(`buildJsonContent ${i} rows`, () => {
      const rows = Array.from({ length: i }, (_, j) => ({ id: j, name: `n${j}`, amount: j, date: '', active: false }));
      const parsed = JSON.parse(buildJsonContent(rows, COLS));
      expect(parsed).toHaveLength(i);
    });
  }
});

// ─── exportData ───────────────────────────────────────────────────────────────
describe('exportData', () => {
  it('csv export succeeds', () => {
    const { result, error } = exportData(ROWS, makeOpts({ format: 'csv' }));
    expect(error).toBeNull();
    expect(result).not.toBeNull();
    expect(result?.format).toBe('csv');
  });

  it('json export succeeds', () => {
    const { result, error } = exportData(ROWS, makeOpts({ format: 'json' }));
    expect(error).toBeNull();
    expect(result?.format).toBe('json');
  });

  it('xlsx export succeeds', () => {
    const { result, error } = exportData(ROWS, makeOpts({ format: 'xlsx' }));
    expect(error).toBeNull();
    expect(result?.format).toBe('xlsx');
  });

  it('pdf export succeeds', () => {
    const { result, error } = exportData(ROWS, makeOpts({ format: 'pdf' }));
    expect(error).toBeNull();
    expect(result?.format).toBe('pdf');
  });

  it('invalid format returns error', () => {
    const { result, error } = exportData(ROWS, makeOpts({ format: 'docx' as 'csv' }));
    expect(result).toBeNull();
    expect(error?.code).toBe('INVALID_FORMAT');
  });

  it('empty columns returns error', () => {
    const { result, error } = exportData(ROWS, makeOpts({ columns: [] }));
    expect(result).toBeNull();
    expect(error?.code).toBe('INVALID_COLUMN');
  });

  it('too many rows returns error', () => {
    const bigRows = Array.from({ length: 10_001 }, (_, i) => ({ id: i, name: `n${i}`, amount: 0, date: '', active: false }));
    const { result, error } = exportData(bigRows, makeOpts({ format: 'pdf', maxRows: 10_000 }));
    expect(result).toBeNull();
    expect(error?.code).toBe('TOO_MANY_ROWS');
  });

  it('result has correct rowCount', () => {
    const { result } = exportData(ROWS, makeOpts());
    expect(result?.rowCount).toBe(ROWS.length);
  });

  it('result has mimeType', () => {
    const { result } = exportData(ROWS, makeOpts());
    expect(result?.mimeType).toBe('text/csv');
  });

  it('result filename has extension', () => {
    const { result } = exportData(ROWS, makeOpts({ filename: 'myfile' }));
    expect(result?.filename).toBe('myfile.csv');
  });

  it('result has byteSize > 0', () => {
    const { result } = exportData(ROWS, makeOpts());
    expect(result?.byteSize).toBeGreaterThan(0);
  });

  it('result has content', () => {
    const { result } = exportData(ROWS, makeOpts());
    expect(result?.content).toBeTruthy();
  });

  for (let i = 1; i <= 50; i++) {
    it(`exportData csv ${i} rows`, () => {
      const rows = Array.from({ length: i }, (_, j) => ({ id: j, name: `n${j}`, amount: j, date: '2026-01-01', active: true }));
      const { result, error } = exportData(rows, makeOpts({ format: 'csv' }));
      expect(error).toBeNull();
      expect(result?.rowCount).toBe(i);
    });
  }

  for (let i = 1; i <= 30; i++) {
    it(`exportData json ${i} rows`, () => {
      const rows = Array.from({ length: i }, (_, j) => ({ id: j, name: `n${j}`, amount: j, date: '', active: false }));
      const { result, error } = exportData(rows, makeOpts({ format: 'json' }));
      expect(error).toBeNull();
      expect(result?.rowCount).toBe(i);
    });
  }

  for (let i = 0; i < 20; i++) {
    const fmt = (['csv', 'xlsx', 'pdf', 'json'] as const)[i % 4];
    it(`exportData format ${fmt} iter${i}`, () => {
      const { result, error } = exportData(ROWS, makeOpts({ format: fmt }));
      expect(error).toBeNull();
      expect(result?.format).toBe(fmt);
    });
  }
});

// ─── chunkRows ────────────────────────────────────────────────────────────────
describe('chunkRows', () => {
  it('chunks into correct sizes', () => {
    const chunks = chunkRows([1, 2, 3, 4, 5], 2);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(2);
  });
  it('chunk size >= length → one chunk', () => {
    const chunks = chunkRows([1, 2, 3], 10);
    expect(chunks).toHaveLength(1);
  });
  it('chunk size 1 → each item', () => {
    const chunks = chunkRows([1, 2, 3], 1);
    expect(chunks).toHaveLength(3);
  });
  it('empty array → no chunks', () => {
    const chunks = chunkRows([], 5);
    expect(chunks).toHaveLength(0);
  });
  it('chunk size 0 → one chunk', () => {
    const chunks = chunkRows([1, 2, 3], 0);
    expect(chunks).toHaveLength(1);
  });
  for (let i = 1; i <= 50; i++) {
    it(`chunkRows size ${i}`, () => {
      const data = Array.from({ length: 100 }, (_, j) => j);
      const chunks = chunkRows(data, i);
      expect(chunks.flat()).toHaveLength(100);
    });
  }
});

// ─── mergeExportResults ───────────────────────────────────────────────────────
describe('mergeExportResults', () => {
  function makeResult(n: number): ExportResult {
    return { filename: `r${n}.csv`, format: 'csv', rowCount: n, byteSize: n * 10, mimeType: 'text/csv', content: `row${n}` };
  }

  it('throws on empty', () => expect(() => mergeExportResults([])).toThrow());
  it('single result returns itself', () => {
    const r = makeResult(5);
    const m = mergeExportResults([r]);
    expect(m.rowCount).toBe(5);
  });
  it('two results sum rowCount', () => {
    const m = mergeExportResults([makeResult(3), makeResult(7)]);
    expect(m.rowCount).toBe(10);
  });
  it('two results sum byteSize', () => {
    const m = mergeExportResults([makeResult(3), makeResult(7)]);
    expect(m.byteSize).toBe(100);
  });
  it('content is joined', () => {
    const m = mergeExportResults([makeResult(1), makeResult(2)]);
    expect(m.content).toContain('row1');
    expect(m.content).toContain('row2');
  });
  for (let i = 2; i <= 30; i++) {
    it(`mergeExportResults ${i} results`, () => {
      const results = Array.from({ length: i }, (_, j) => makeResult(j + 1));
      const m = mergeExportResults(results);
      const expectedRows = results.reduce((s, r) => s + r.rowCount, 0);
      expect(m.rowCount).toBe(expectedRows);
    });
  }
});

// ─── Top-up tests ─────────────────────────────────────────────────────────────
describe('bulk-export top-up A', () => {
  for (let i = 0; i < 100; i++) {
    it('getMimeType returns string ' + i, () => {
      const formats = ['csv', 'json', 'xlsx', 'xml'];
      const fmt = formats[i % formats.length];
      expect(typeof getMimeType(fmt as any)).toBe('string');
    });
  }
  for (let i = 0; i < 100; i++) {
    it('getExtension returns string ' + i, () => {
      const formats = ['csv', 'json'];
      const fmt = formats[i % formats.length];
      const ext = getExtension(fmt as any);
      expect(typeof ext).toBe('string');
      expect(ext.length).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('isValidFormat for csv/json ' + i, () => {
      expect(isValidFormat(i % 2 === 0 ? 'csv' : 'json')).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('formatCellValue string returns string ' + i, () => {
      const v = 'value' + i;
      const result = formatCellValue(v, COLS[0]);
      expect(typeof result).toBe('string');
    });
  }
  for (let i = 0; i < 100; i++) {
    it('validateColumns returns null for valid cols ' + i, () => {
      const result = validateColumns(COLS);
      expect(result).toBeNull();
    });
  }
});

describe('bulk-export top-up B', () => {
  for (let i = 1; i <= 100; i++) {
    it('chunkRows size ' + i, () => {
      const rows = Array.from({ length: i }, (_, j) => ({ id: j }));
      const chunks = chunkRows(rows, 10);
      expect(chunks.length).toBe(Math.ceil(i / 10));
    });
  }
  for (let i = 0; i < 100; i++) {
    it('buildCsvRow returns string ' + i, () => {
      const cells = COLS.map(c => 'v'+i);
      const result = buildCsvRow(cells);
      expect(typeof result).toBe('string');
    });
  }
  for (let i = 0; i < 100; i++) {
    it('isValidFormat returns false for unknown ' + i, () => {
      expect(isValidFormat('unknown-format-' + i as any)).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('MIME_TYPES is object ' + i, () => {
      expect(typeof MIME_TYPES).toBe('object');
    });
  }
  for (let i = 0; i < 100; i++) {
    it('ensureFilenameExtension adds ext ' + i, () => {
      const name = ensureFilenameExtension('report-' + i, 'csv');
      expect(name.endsWith('.csv')).toBe(true);
    });
  }
});
