// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type {
  CsvParseOptions,
  CsvStringifyOptions,
  CsvRecord,
  CsvColumn,
  CsvSchema,
  CsvValidationError,
  CsvTransformOptions,
  CsvStats,
  CsvDiff,
} from './types';

export {
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
} from './csv-utils';
