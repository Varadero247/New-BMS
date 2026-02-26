// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  CsvParseOptions,
  CsvStringifyOptions,
  CsvRecord,
  CsvColumn,
  CsvSchema,
  CsvValidationError,
  CsvStats,
  CsvDiff,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Escape a single field value for CSV output. */
function escapeField(
  value: string,
  delimiter: string,
  quote: string,
  alwaysQuote: boolean,
): string {
  const needsQuote =
    alwaysQuote ||
    value.includes(quote) ||
    value.includes(delimiter) ||
    value.includes('\n') ||
    value.includes('\r');
  if (!needsQuote) return value;
  const escaped = value.split(quote).join(quote + quote);
  return `${quote}${escaped}${quote}`;
}

/** Low-level RFC 4180-compatible CSV parser. Returns a 2D array of strings. */
function parseCsvCore(csv: string, opts: Required<CsvParseOptions>): string[][] {
  const { delimiter, quote, escape, skipEmptyLines, trimFields, comment } = opts;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = csv.length;

  while (i < len) {
    const ch = csv[i];

    if (inQuotes) {
      // Handle escape sequences inside a quoted field
      if (escape !== quote && ch === escape && i + 1 < len) {
        field += csv[i + 1];
        i += 2;
        continue;
      }
      // Double-quote escape or closing quote
      if (ch === quote) {
        if (i + 1 < len && csv[i + 1] === quote) {
          // Doubled quote → literal quote character
          field += quote;
          i += 2;
          continue;
        }
        // End of quoted section
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    // Not inside quotes
    if (ch === quote) {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === delimiter) {
      row.push(trimFields ? field.trim() : field);
      field = '';
      i++;
      continue;
    }

    if (ch === '\r') {
      // Handle \r\n or bare \r as line ending
      row.push(trimFields ? field.trim() : field);
      rows.push(row);
      row = [];
      field = '';
      if (i + 1 < len && csv[i + 1] === '\n') i++;
      i++;
      continue;
    }

    if (ch === '\n') {
      row.push(trimFields ? field.trim() : field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Push the final field and row
  row.push(trimFields ? field.trim() : field);
  rows.push(row);

  // Post-process: skip empty lines and comment lines
  return rows.filter((r) => {
    if (skipEmptyLines && r.length === 1 && r[0] === '') return false;
    if (comment && r.length > 0 && r[0].startsWith(comment)) return false;
    return true;
  });
}

/** Build a Required<CsvParseOptions> by merging user opts with defaults. */
function resolveParseOpts(options?: CsvParseOptions): Required<CsvParseOptions> {
  return {
    delimiter: options?.delimiter ?? ',',
    quote: options?.quote ?? '"',
    escape: options?.escape ?? (options?.quote ?? '"'),
    skipEmptyLines: options?.skipEmptyLines ?? false,
    trimFields: options?.trimFields ?? false,
    comment: options?.comment ?? '',
  };
}

/** Build a Required<CsvStringifyOptions> by merging user opts with defaults. */
function resolveStringifyOpts(options?: CsvStringifyOptions): Required<CsvStringifyOptions> {
  return {
    delimiter: options?.delimiter ?? ',',
    quote: options?.quote ?? '"',
    lineEnding: options?.lineEnding ?? '\n',
    alwaysQuote: options?.alwaysQuote ?? false,
  };
}

// ---------------------------------------------------------------------------
// Core parsing / stringifying
// ---------------------------------------------------------------------------

/**
 * Parse a CSV string into a 2D array of strings.
 * Each inner array represents one row; each element is a field value.
 */
export function parse(csv: string, options?: CsvParseOptions): string[][] {
  return parseCsvCore(csv, resolveParseOpts(options));
}

/**
 * Serialise a 2D string array to CSV text.
 */
export function stringify(data: string[][], options?: CsvStringifyOptions): string {
  const opts = resolveStringifyOpts(options);
  return data
    .map((row) =>
      row.map((field) => escapeField(field, opts.delimiter, opts.quote, opts.alwaysQuote)).join(opts.delimiter),
    )
    .join(opts.lineEnding);
}

/**
 * Parse a CSV string that has a header row.
 * Returns an array of objects where each key is a column header.
 */
export function parseRecords(csv: string, options?: CsvParseOptions): CsvRecord[] {
  const rows = parseCsvCore(csv, resolveParseOpts(options));
  if (rows.length === 0) return [];
  const [headers, ...dataRows] = rows;
  return dataRows.map((row) => {
    const record: CsvRecord = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx] ?? '';
    });
    return record;
  });
}

/**
 * Serialise an array of records to CSV text (header row is derived from the
 * keys of the first record).
 */
export function stringifyRecords(records: CsvRecord[], options?: CsvStringifyOptions): string {
  if (records.length === 0) return '';
  const opts = resolveStringifyOpts(options);
  const headers = Object.keys(records[0]);
  const headerRow = headers
    .map((h) => escapeField(h, opts.delimiter, opts.quote, opts.alwaysQuote))
    .join(opts.delimiter);
  const dataRows = records.map((r) =>
    headers
      .map((h) => escapeField(r[h] ?? '', opts.delimiter, opts.quote, opts.alwaysQuote))
      .join(opts.delimiter),
  );
  return [headerRow, ...dataRows].join(opts.lineEnding);
}

/**
 * Streaming-style parse: concatenate all chunks and parse as one document.
 */
export function parseStream(chunks: string[], options?: CsvParseOptions): string[][] {
  return parse(chunks.join(''), options);
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

/** Coerce a raw string to the target CsvColumn type (returns undefined on failure). */
function coerceValue(raw: string, col: CsvColumn): unknown | undefined {
  const trimmed = raw.trim();
  switch (col.type) {
    case 'number': {
      const n = Number(trimmed);
      return isNaN(n) ? undefined : n;
    }
    case 'boolean': {
      const lower = trimmed.toLowerCase();
      if (['true', '1', 'yes', 'y'].includes(lower)) return true;
      if (['false', '0', 'no', 'n'].includes(lower)) return false;
      return undefined;
    }
    case 'date': {
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? undefined : d;
    }
    default:
      return trimmed;
  }
}

/**
 * Validate an array of CsvRecord objects against a schema.
 * Returns a (possibly empty) array of CsvValidationError objects.
 */
export function validateSchema(records: CsvRecord[], schema: CsvSchema): CsvValidationError[] {
  const errors: CsvValidationError[] = [];

  records.forEach((record, rowIdx) => {
    for (const [colName, colDef] of Object.entries(schema)) {
      const raw = record[colName] ?? '';

      // Required check
      if (colDef.required && raw.trim() === '') {
        errors.push({ row: rowIdx, column: colName, message: `Field '${colName}' is required.` });
        continue;
      }

      // Skip further checks if the field is empty and not required
      if (raw.trim() === '') continue;

      // Type coercion check
      const coerced = coerceValue(raw, colDef);
      if (coerced === undefined) {
        errors.push({
          row: rowIdx,
          column: colName,
          message: `Field '${colName}' value '${raw}' cannot be coerced to type '${colDef.type}'.`,
        });
        continue;
      }

      // Numeric range checks
      if (colDef.type === 'number' && typeof coerced === 'number') {
        if (colDef.min !== undefined && coerced < colDef.min) {
          errors.push({
            row: rowIdx,
            column: colName,
            message: `Field '${colName}' value ${coerced} is below minimum ${colDef.min}.`,
          });
        }
        if (colDef.max !== undefined && coerced > colDef.max) {
          errors.push({
            row: rowIdx,
            column: colName,
            message: `Field '${colName}' value ${coerced} exceeds maximum ${colDef.max}.`,
          });
        }
      }

      // String length checks
      if (colDef.type === 'string' && typeof coerced === 'string') {
        if (colDef.min !== undefined && coerced.length < colDef.min) {
          errors.push({
            row: rowIdx,
            column: colName,
            message: `Field '${colName}' length ${coerced.length} is below minimum ${colDef.min}.`,
          });
        }
        if (colDef.max !== undefined && coerced.length > colDef.max) {
          errors.push({
            row: rowIdx,
            column: colName,
            message: `Field '${colName}' length ${coerced.length} exceeds maximum ${colDef.max}.`,
          });
        }
      }

      // Pattern check
      if (colDef.pattern && !colDef.pattern.test(raw)) {
        errors.push({
          row: rowIdx,
          column: colName,
          message: `Field '${colName}' value '${raw}' does not match pattern ${colDef.pattern}.`,
        });
      }

      // Enum check
      if (colDef.enum && !colDef.enum.includes(raw.trim())) {
        errors.push({
          row: rowIdx,
          column: colName,
          message: `Field '${colName}' value '${raw}' is not in allowed set [${colDef.enum.join(', ')}].`,
        });
      }
    }
  });

  return errors;
}

/**
 * Coerce all string values in an array of CsvRecord objects to their typed
 * representations according to the provided schema.
 */
export function coerceSchema(records: CsvRecord[], schema: CsvSchema): Record<string, unknown>[] {
  return records.map((record) => {
    const result: Record<string, unknown> = { ...record };
    for (const [colName, colDef] of Object.entries(schema)) {
      if (colName in record) {
        const coerced = coerceValue(record[colName], colDef);
        result[colName] = coerced !== undefined ? coerced : record[colName];
      }
    }
    return result;
  });
}

// ---------------------------------------------------------------------------
// Transformation
// ---------------------------------------------------------------------------

/**
 * Return a new 2D array containing only the columns at the given indices.
 */
export function selectColumns(data: string[][], indices: number[]): string[][] {
  return data.map((row) => indices.map((i) => row[i] ?? ''));
}

/**
 * Return a new 2D array with the columns at the given indices removed.
 */
export function dropColumns(data: string[][], indices: number[]): string[][] {
  const dropSet = new Set(indices);
  return data.map((row) => row.filter((_, i) => !dropSet.has(i)));
}

/**
 * Insert a column of values into a 2D array.
 * @param position Column index to insert at. Default: end of row.
 */
export function addColumn(data: string[][], values: string[], position?: number): string[][] {
  return data.map((row, rowIdx) => {
    const value = values[rowIdx] ?? '';
    if (position === undefined || position >= row.length) {
      return [...row, value];
    }
    const pos = Math.max(0, position);
    return [...row.slice(0, pos), value, ...row.slice(pos)];
  });
}

/**
 * Rename columns in an array of records according to a mapping of old→new name.
 */
export function renameHeaders(records: CsvRecord[], mapping: Record<string, string>): CsvRecord[] {
  return records.map((record) => {
    const result: CsvRecord = {};
    for (const [key, value] of Object.entries(record)) {
      result[mapping[key] ?? key] = value;
    }
    return result;
  });
}

/**
 * Keep only rows for which the predicate returns true.
 */
export function filterRows(
  data: string[][],
  predicate: (row: string[], index: number) => boolean,
): string[][] {
  return data.filter((row, idx) => predicate(row, idx));
}

/**
 * Apply a mapping function to every row.
 */
export function mapRows(
  data: string[][],
  fn: (row: string[], index: number) => string[],
): string[][] {
  return data.map((row, idx) => fn(row, idx));
}

/**
 * Sort rows by a specific column index.
 */
export function sortRows(
  data: string[][],
  columnIndex: number,
  order: 'asc' | 'desc' = 'asc',
): string[][] {
  const sorted = [...data].sort((a, b) => {
    const av = a[columnIndex] ?? '';
    const bv = b[columnIndex] ?? '';
    const an = Number(av);
    const bn = Number(bv);
    if (!isNaN(an) && !isNaN(bn)) {
      return order === 'asc' ? an - bn : bn - an;
    }
    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}

/**
 * Remove duplicate rows. If keyColumns is provided, rows are considered
 * duplicates when all keyColumn values match; otherwise all columns are compared.
 */
export function deduplicateRows(data: string[][], keyColumns?: number[]): string[][] {
  const seen = new Set<string>();
  return data.filter((row) => {
    const key =
      keyColumns !== undefined
        ? keyColumns.map((i) => row[i] ?? '').join('\x00')
        : row.join('\x00');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Transpose rows and columns (matrix transpose).
 */
export function transposeData(data: string[][]): string[][] {
  if (data.length === 0) return [];
  const cols = Math.max(...data.map((r) => r.length));
  return Array.from({ length: cols }, (_, colIdx) =>
    data.map((row) => row[colIdx] ?? ''),
  );
}

/**
 * Left-join two 2D arrays on the column at `on`.
 * Rows in `a` without a matching row in `b` keep empty strings for b's extra columns.
 */
export function mergeData(a: string[][], b: string[][], on: number): string[][] {
  // Build a map from key → first matching row of b
  const bMap = new Map<string, string[]>();
  for (const row of b) {
    const key = row[on] ?? '';
    if (!bMap.has(key)) bMap.set(key, row);
  }

  const bColCount = b.length > 0 ? b[0].length : 0;

  return a.map((aRow) => {
    const key = aRow[on] ?? '';
    const bRow = bMap.get(key);
    if (!bRow) {
      // No match: append empty strings for b's columns (excluding the join key)
      const bExtra = Array(Math.max(0, bColCount - 1)).fill('');
      return [...aRow, ...bExtra];
    }
    // Append b's columns excluding the join-key column to avoid duplication
    const bExtra = bRow.filter((_, i) => i !== on);
    return [...aRow, ...bExtra];
  });
}

/**
 * Pivot records into a 2D array.
 * rowKey: field whose distinct values become row labels.
 * colKey: field whose distinct values become column headers.
 * valueKey: field whose value fills the pivot cells.
 */
export function pivotData(
  records: CsvRecord[],
  rowKey: string,
  colKey: string,
  valueKey: string,
): string[][] {
  const rowLabels = [...new Set(records.map((r) => r[rowKey] ?? ''))];
  const colLabels = [...new Set(records.map((r) => r[colKey] ?? ''))];

  // Build lookup: rowLabel → colLabel → value
  const lookup = new Map<string, Map<string, string>>();
  for (const record of records) {
    const rLabel = record[rowKey] ?? '';
    const cLabel = record[colKey] ?? '';
    const val = record[valueKey] ?? '';
    if (!lookup.has(rLabel)) lookup.set(rLabel, new Map());
    lookup.get(rLabel)!.set(cLabel, val);
  }

  const header = ['', ...colLabels];
  const dataRows = rowLabels.map((rLabel) => {
    const row = [rLabel];
    for (const cLabel of colLabels) {
      row.push(lookup.get(rLabel)?.get(cLabel) ?? '');
    }
    return row;
  });

  return [header, ...dataRows];
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

/**
 * Compute descriptive statistics for a single column.
 */
export function getStats(data: string[][], columnIndex: number): CsvStats {
  const values = data.map((row) => row[columnIndex] ?? '');
  const nonNull = values.filter((v) => v !== '');
  const unique = new Set(nonNull);

  // Attempt numeric interpretation
  const nums = nonNull.map(Number);
  const allNumeric = nums.every((n) => !isNaN(n));

  let minVal: number | string;
  let maxVal: number | string;
  let mean: number;

  if (allNumeric && nonNull.length > 0) {
    minVal = Math.min(...nums);
    maxVal = Math.max(...nums);
    mean = nums.reduce((a, b) => a + b, 0) / nums.length;
  } else {
    // Lexicographic min/max
    minVal = nonNull.length > 0 ? nonNull.reduce((a, b) => (a < b ? a : b)) : '';
    maxVal = nonNull.length > 0 ? nonNull.reduce((a, b) => (a > b ? a : b)) : '';
    mean = NaN;
  }

  return {
    count: values.length,
    nullCount: values.length - nonNull.length,
    uniqueCount: unique.size,
    min: minVal,
    max: maxVal,
    mean,
  };
}

/**
 * Sniff the most likely delimiter from a CSV sample string.
 * Candidates: comma, semicolon, tab, pipe.
 */
export function detectDelimiter(sample: string): string {
  const candidates = [',', ';', '\t', '|'];
  const firstLine = sample.split('\n')[0] ?? '';
  let bestDelimiter = ',';
  let bestCount = 0;
  for (const d of candidates) {
    const count = firstLine.split(d).length - 1;
    if (count > bestCount) {
      bestCount = count;
      bestDelimiter = d;
    }
  }
  return bestDelimiter;
}

/**
 * Heuristic check for character encoding: returns 'latin-1' if high-byte
 * characters are present in the sample, otherwise 'utf-8'.
 */
export function detectEncoding(sample: string): string {
  for (let i = 0; i < sample.length; i++) {
    if (sample.charCodeAt(i) > 127) return 'latin-1';
  }
  return 'utf-8';
}

/**
 * Infer a CsvSchema from an array of records by sampling values.
 */
export function inferSchema(records: CsvRecord[]): CsvSchema {
  if (records.length === 0) return {};
  const columns = Object.keys(records[0]);
  const schema: CsvSchema = {};

  for (const col of columns) {
    const values = records.map((r) => r[col] ?? '').filter((v) => v !== '');
    let type: CsvColumn['type'] = 'string';

    if (values.length > 0) {
      const allNum = values.every((v) => !isNaN(Number(v)));
      if (allNum) {
        type = 'number';
      } else {
        const boolValues = new Set(['true', 'false', '1', '0', 'yes', 'no', 'y', 'n']);
        const allBool = values.every((v) => boolValues.has(v.toLowerCase()));
        if (allBool) {
          type = 'boolean';
        } else {
          const allDate = values.every((v) => !isNaN(new Date(v).getTime()));
          if (allDate) type = 'date';
        }
      }
    }

    schema[col] = { type, required: false };
  }

  return schema;
}

/**
 * Compute the diff between two 2D arrays identified by a key column.
 */
export function diff(a: string[][], b: string[][], keyColumn = 0): CsvDiff {
  const aMap = new Map<string, string[]>();
  const bMap = new Map<string, string[]>();

  for (const row of a) aMap.set(row[keyColumn] ?? '', row);
  for (const row of b) bMap.set(row[keyColumn] ?? '', row);

  const added: string[][] = [];
  const removed: string[][] = [];
  const modified: string[][] = [];

  for (const [key, row] of bMap) {
    if (!aMap.has(key)) {
      added.push(row);
    } else {
      const aRow = aMap.get(key)!;
      if (aRow.join('\x00') !== row.join('\x00')) {
        modified.push(row);
      }
    }
  }

  for (const [key, row] of aMap) {
    if (!bMap.has(key)) removed.push(row);
  }

  return { added, removed, modified };
}

/**
 * Compute CsvStats for every column in the 2D array.
 */
export function getColumnStats(data: string[][]): CsvStats[] {
  if (data.length === 0) return [];
  const colCount = Math.max(...data.map((r) => r.length));
  return Array.from({ length: colCount }, (_, i) => getStats(data, i));
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Heuristic: return true if the first row of the CSV looks like a header row
 * (i.e. the first row contains no purely-numeric values and has distinct
 * entries from the second row).
 */
export function detectHeaders(csv: string): boolean {
  const rows = parse(csv, { skipEmptyLines: true });
  if (rows.length < 2) return false;
  const first = rows[0];
  // Headers typically contain no purely numeric fields
  const hasNumericField = first.some((f) => f.trim() !== '' && !isNaN(Number(f.trim())));
  if (hasNumericField) return false;
  // Headers should be distinct from the second row
  const second = rows[1];
  const allSame = first.every((f, i) => f === second[i]);
  return !allSame;
}

/**
 * Attempt to auto-fix common CSV issues:
 * - Remove trailing delimiters from each line.
 * - Close any unclosed quoted fields at end of a line.
 */
export function autoFix(csv: string): string {
  const lines = csv.split('\n');
  const fixed = lines.map((line) => {
    // Remove trailing comma (or other last delimiter — we assume comma here)
    let l = line.replace(/,+$/, '');
    // Count unmatched quotes
    const quoteCount = (l.match(/"/g) ?? []).length;
    if (quoteCount % 2 !== 0) l += '"';
    return l;
  });
  return fixed.join('\n');
}

/**
 * Render a 2D string array as a GFM (GitHub Flavoured Markdown) table.
 * The first row is used as the header.
 */
export function toMarkdownTable(data: string[][]): string {
  if (data.length === 0) return '';
  const [header, ...rows] = data;
  const colWidths = header.map((h, i) => {
    const maxData = rows.reduce((m, r) => Math.max(m, (r[i] ?? '').length), 0);
    return Math.max(h.length, maxData, 3);
  });

  const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length));

  const headerRow = `| ${header.map((h, i) => pad(h, colWidths[i])).join(' | ')} |`;
  const separator = `| ${colWidths.map((w) => '-'.repeat(w)).join(' | ')} |`;
  const dataRows = rows.map(
    (row) => `| ${header.map((_, i) => pad(row[i] ?? '', colWidths[i])).join(' | ')} |`,
  );

  return [headerRow, separator, ...dataRows].join('\n');
}

/**
 * Parse a GFM markdown table back into a 2D string array.
 * The first data row is treated as the header.
 */
export function fromMarkdownTable(md: string): string[][] {
  const lines = md
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && l.endsWith('|'));

  const parseRow = (line: string): string[] =>
    line
      .slice(1, -1)
      .split('|')
      .map((cell) => cell.trim());

  const result: string[][] = [];
  for (const line of lines) {
    // Skip separator lines (only dashes and pipes)
    if (/^\|[\s\-|]+\|$/.test(line)) continue;
    result.push(parseRow(line));
  }
  return result;
}
