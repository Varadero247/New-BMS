// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Options for CSV parsing and serialisation. */
export interface ParseOptions {
  /** Column delimiter. Defaults to ','. */
  delimiter?: string;
  /** Quote character. Defaults to '"'. */
  quote?: string;
  /** Escape character inside quoted fields. Defaults to the quote character (doubling). */
  escape?: string;
  /** Whether to trim whitespace from unquoted fields. Defaults to false. */
  trim?: boolean;
  /** Skip empty lines. Defaults to true. */
  skipEmptyLines?: boolean;
  /** Line ending to use when serialising. Defaults to '\n'. */
  newline?: string;
  /** Whether to treat the first row as a header. Defaults to false. */
  header?: boolean;
}

/** CSV-specific options (alias kept for clarity). */
export type CsvOptions = ParseOptions;

/** A parsed INI section: a flat map of key → value strings. */
export type IniSection = Record<string, string>;

/**
 * Scalar value types that can appear inside a TOML-like structure.
 * Full TOML parsing is out of scope; this type covers the common
 * value shapes you will encounter after basic parsing.
 */
export type TomlValue =
  | string
  | number
  | boolean
  | null
  | TomlValue[]
  | { [key: string]: TomlValue };

/** Enum of token types used by the expression tokeniser. */
export enum TokenType {
  Number = 'Number',
  String = 'String',
  Identifier = 'Identifier',
  Operator = 'Operator',
  Punctuation = 'Punctuation',
  Whitespace = 'Whitespace',
  Unknown = 'Unknown',
}

/** A single token produced by the expression tokeniser. */
export interface Token {
  type: TokenType;
  value: string;
  /** Zero-based character position of the token's first character. */
  position: number;
}

/** The result returned by parsing operations that can fail gracefully. */
export interface ParseResult<T> {
  /** Whether parsing succeeded. */
  success: boolean;
  /** The parsed value, present when success is true. */
  data?: T;
  /** Human-readable error message, present when success is false. */
  error?: string;
}

/** Mutable state carried through a single-pass lexer. */
export interface LexerState {
  /** Source text being lexed. */
  source: string;
  /** Current read position (index into source). */
  pos: number;
  /** Accumulated tokens so far. */
  tokens: Token[];
}
