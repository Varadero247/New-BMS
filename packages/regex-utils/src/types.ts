// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * A record of named capture groups from a regex match.
 * Keys are group names, values are the captured strings (or undefined if not captured).
 */
export type NamedGroups = Record<string, string | undefined>;

/**
 * The result of a single regex match operation.
 */
export interface MatchResult {
  /** Whether the pattern matched */
  matched: boolean;
  /** Named capture groups (empty object if none) */
  groups: NamedGroups;
  /** Index of the match in the source string (-1 if no match) */
  index: number;
  /** The matched string value (empty string if no match) */
  value: string;
}

/**
 * Options for replace operations.
 */
export interface ReplaceOptions {
  /** Replacement string or function */
  replacement: string | ((match: string, ...groups: string[]) => string);
  /** Maximum number of replacements (undefined = all) */
  limit?: number;
}

/**
 * Options for pattern creation.
 */
export interface PatternOptions {
  /** Whether the pattern should be case-insensitive */
  caseInsensitive?: boolean;
  /** Whether the pattern should be multiline */
  multiline?: boolean;
  /** Whether the pattern should be global */
  global?: boolean;
  /** Whether the pattern should use dotAll mode */
  dotAll?: boolean;
  /** Whether the pattern should be sticky */
  sticky?: boolean;
  /** Whether the pattern should use unicode mode */
  unicode?: boolean;
}

/**
 * String type for regex flag characters.
 */
export type RegexFlags = string;

/**
 * The result of an extraction operation returning named groups.
 */
export interface ExtractResult {
  /** The full matched string */
  match: string;
  /** Named capture groups from the match */
  groups: NamedGroups;
  /** Zero-based index of the match */
  index: number;
}
