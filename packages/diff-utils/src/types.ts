// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type DiffOperation = 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export interface DiffEntry {
  op: DiffOperation;
  path: string;       // JSON Pointer path e.g. "/a/b/0"
  value?: JsonValue;
  oldValue?: JsonValue;
  from?: string;      // For 'move'/'copy'
}

export interface TextDiffLine {
  type: 'equal' | 'insert' | 'delete';
  value: string;
  lineNumber?: number;
}

export interface ArrayDiffResult<T> {
  added: Array<{ index: number; value: T }>;
  removed: Array<{ index: number; value: T }>;
  moved: Array<{ from: number; to: number; value: T }>;
  unchanged: Array<{ index: number; value: T }>;
}

export interface ObjectDiffResult {
  added: Record<string, JsonValue>;
  removed: Record<string, JsonValue>;
  changed: Record<string, { from: JsonValue; to: JsonValue }>;
  unchanged: Record<string, JsonValue>;
}

export interface PatchResult {
  success: boolean;
  result?: JsonValue;
  error?: string;
}

export interface MergeConflict {
  path: string;
  base: JsonValue;
  ours: JsonValue;
  theirs: JsonValue;
}

export interface MergeResult {
  merged: JsonValue;
  conflicts: MergeConflict[];
}

export interface DiffOptions {
  deep?: boolean;
  ignoreKeys?: string[];
  arrayMatchBy?: string;  // Key to use for array item identity
}
