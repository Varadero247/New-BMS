// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Options for parsing CSV text into a 2D string array. */
export interface CsvParseOptions {
  /** Field delimiter character. Default: ',' */
  delimiter?: string;
  /** Quote character used to wrap fields. Default: '"' */
  quote?: string;
  /** Escape character inside quoted fields. Default: same as quote (doubling). */
  escape?: string;
  /** Skip rows that are entirely empty. Default: false */
  skipEmptyLines?: boolean;
  /** Trim leading/trailing whitespace from each field value. Default: false */
  trimFields?: boolean;
  /** Lines beginning with this string are treated as comments and ignored. Default: none */
  comment?: string;
}

/** Options for serialising a 2D string array (or records) to CSV text. */
export interface CsvStringifyOptions {
  /** Field delimiter character. Default: ',' */
  delimiter?: string;
  /** Quote character. Default: '"' */
  quote?: string;
  /** Line-ending sequence. Default: '\n' */
  lineEnding?: string;
  /** Always wrap every field in quotes, even if not required. Default: false */
  alwaysQuote?: boolean;
}

/** A single CSV record represented as a key→value map. */
export type CsvRecord = Record<string, string>;

/** Definition of a single column in a CsvSchema. */
export interface CsvColumn {
  /** The expected data type for the column's values. */
  type: 'string' | 'number' | 'boolean' | 'date';
  /** Whether the field is mandatory (non-empty). Default: false */
  required?: boolean;
  /** Minimum numeric value (for type:'number') or minimum string length (for type:'string'). */
  min?: number;
  /** Maximum numeric value (for type:'number') or maximum string length (for type:'string'). */
  max?: number;
  /** Regex that the raw string value must satisfy. */
  pattern?: RegExp;
  /** Allowed values (allowlist). */
  enum?: string[];
}

/** A schema describing expected columns: column-name → CsvColumn definition. */
export type CsvSchema = Record<string, CsvColumn>;

/** A single validation error produced by validateSchema. */
export interface CsvValidationError {
  /** 0-based row index in the records array. */
  row: number;
  /** Column name. */
  column: string;
  /** Human-readable description of the problem. */
  message: string;
}

/** Options controlling a streaming transformation pass. */
export interface CsvTransformOptions {
  /** Whether to skip the header row during transformation. Default: false */
  skipHeader?: boolean;
  /** Batch size for chunk processing. Default: 100 */
  batchSize?: number;
}

/** Descriptive statistics for a single CSV column. */
export interface CsvStats {
  /** Total number of rows examined (including nulls). */
  count: number;
  /** Number of rows where the field is empty/null. */
  nullCount: number;
  /** Number of distinct non-null values. */
  uniqueCount: number;
  /** Minimum value (numeric or lexicographic). */
  min: number | string;
  /** Maximum value (numeric or lexicographic). */
  max: number | string;
  /** Arithmetic mean for numeric columns; NaN for non-numeric. */
  mean: number;
}

/** The result of diffing two CSV datasets. */
export interface CsvDiff {
  /** Rows present in b but not in a. */
  added: string[][];
  /** Rows present in a but not in b. */
  removed: string[][];
  /** Rows whose key exists in both but whose non-key fields differ. */
  modified: string[][];
}
