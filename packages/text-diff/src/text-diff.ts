// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Operation types
export type DiffOp = 'equal' | 'insert' | 'delete';

export interface DiffChunk {
  op: DiffOp;
  value: string;
  oldStart?: number;
  newStart?: number;
  count: number;
}

// ─── Internal LCS table for arrays of tokens ───────────────────────────────

function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

/** Longest Common Subsequence of two string arrays. */
export function lcs(a: string[], b: string[]): string[] {
  if (a.length === 0 || b.length === 0) return [];
  const dp = lcsTable(a, b);
  const result: string[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return result;
}

// ─── Token-based diff (shared by chars, words, lines) ──────────────────────

function tokenDiff(
  aTokens: string[],
  bTokens: string[],
  join: (tokens: string[]) => string
): DiffChunk[] {
  const chunks: DiffChunk[] = [];
  const dp = lcsTable(aTokens, bTokens);

  // Build edit path from dp table
  interface Edit {
    op: DiffOp;
    token: string;
    ai: number; // index in aTokens (0-based) of where this token comes from
    bi: number;
  }
  const edits: Edit[] = [];
  let i = aTokens.length;
  let j = bTokens.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aTokens[i - 1] === bTokens[j - 1]) {
      edits.unshift({ op: 'equal', token: aTokens[i - 1], ai: i - 1, bi: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      edits.unshift({ op: 'insert', token: bTokens[j - 1], ai: i, bi: j - 1 });
      j--;
    } else {
      edits.unshift({ op: 'delete', token: aTokens[i - 1], ai: i - 1, bi: j });
      i--;
    }
  }

  // Merge consecutive same-op edits into chunks
  let oldPos = 0;
  let newPos = 0;
  let ei = 0;
  while (ei < edits.length) {
    const op = edits[ei].op;
    const group: string[] = [];
    const chunkOldStart = oldPos;
    const chunkNewStart = newPos;
    while (ei < edits.length && edits[ei].op === op) {
      group.push(edits[ei].token);
      if (op === 'equal') { oldPos++; newPos++; }
      else if (op === 'delete') { oldPos++; }
      else { newPos++; }
      ei++;
    }
    chunks.push({
      op,
      value: join(group),
      oldStart: chunkOldStart,
      newStart: chunkNewStart,
      count: group.length,
    });
  }
  return chunks;
}

// ─── Character-level diff ──────────────────────────────────────────────────

/**
 * Returns minimal sequence of equal/insert/delete DiffChunks for two strings
 * at the character level.
 */
export function diffChars(oldStr: string, newStr: string): DiffChunk[] {
  const aTokens = Array.from(oldStr);
  const bTokens = Array.from(newStr);
  return tokenDiff(aTokens, bTokens, (tokens) => tokens.join(''));
}

// ─── Word-level diff ───────────────────────────────────────────────────────

function splitWords(str: string): string[] {
  // Split keeping delimiters so we can reconstruct
  return str.split(/(\s+)/);
}

/**
 * Word-level diff. Splits on whitespace boundaries and diffs the resulting
 * tokens (including whitespace tokens so applyPatch reconstructs correctly).
 */
export function diffWords(oldStr: string, newStr: string): DiffChunk[] {
  const aTokens = splitWords(oldStr);
  const bTokens = splitWords(newStr);
  return tokenDiff(aTokens, bTokens, (tokens) => tokens.join(''));
}

// ─── Line-level diff ───────────────────────────────────────────────────────

function splitLines(str: string): string[] {
  if (str === '') return [''];
  const lines = str.split('\n');
  // Preserve trailing newline by keeping the last empty element
  return lines.map((l, idx) => (idx < lines.length - 1 ? l + '\n' : l));
}

/**
 * Line-level diff. Splits on newlines and diffs line by line.
 */
export function diffLines(oldStr: string, newStr: string): DiffChunk[] {
  const aTokens = splitLines(oldStr);
  const bTokens = splitLines(newStr);
  return tokenDiff(aTokens, bTokens, (tokens) => tokens.join(''));
}

// ─── Apply patch ───────────────────────────────────────────────────────────

/**
 * Reconstruct the result string from original + diff chunks.
 * Equal and insert chunks contribute their value; delete chunks are skipped.
 */
export function applyPatch(original: string, chunks: DiffChunk[]): string {
  let result = '';
  for (const chunk of chunks) {
    if (chunk.op === 'equal' || chunk.op === 'insert') {
      result += chunk.value;
    }
    // delete chunks: skip (they came from original which we're not using directly)
  }
  return result;
}

// ─── Verify patch round-trips ──────────────────────────────────────────────

/**
 * Verifies that diffChars(original, result) followed by applyPatch produces
 * the same result string.
 */
export function verifyPatch(original: string, result: string): boolean {
  const chunks = diffChars(original, result);
  return applyPatch(original, chunks) === result;
}

// ─── Diff stats ────────────────────────────────────────────────────────────

export interface DiffStats {
  insertions: number;
  deletions: number;
  unchanged: number;
  similarity: number;
}

/**
 * Compute aggregate statistics from a diff chunk array.
 */
export function diffStats(chunks: DiffChunk[]): DiffStats {
  let insertions = 0;
  let deletions = 0;
  let unchanged = 0;
  for (const chunk of chunks) {
    if (chunk.op === 'insert') insertions += chunk.count;
    else if (chunk.op === 'delete') deletions += chunk.count;
    else unchanged += chunk.count;
  }
  const total = insertions + deletions + unchanged;
  // similarity = unchanged / max(old_len, new_len)
  const oldLen = deletions + unchanged;
  const newLen = insertions + unchanged;
  const maxLen = Math.max(oldLen, newLen);
  const similarity = maxLen === 0 ? 1 : unchanged / maxLen;
  return { insertions, deletions, unchanged, similarity };
}

// ─── Edit distance (Levenshtein) ───────────────────────────────────────────

/**
 * Compute Levenshtein edit distance between two strings.
 */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  // Rolling two-row DP
  let prev = Array.from({ length: n + 1 }, (_, k) => k);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// ─── Semantic similarity ───────────────────────────────────────────────────

/**
 * Returns a 0–1 similarity ratio based on diffStats over character diff.
 */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 && b.length === 0) return 1;
  const chunks = diffChars(a, b);
  return diffStats(chunks).similarity;
}

// ─── HTML diff ─────────────────────────────────────────────────────────────

/**
 * Returns an HTML string that wraps insertions with <ins> and deletions with
 * <del> (or custom tags).
 */
export function htmlDiff(
  oldStr: string,
  newStr: string,
  opts?: { insertTag?: string; deleteTag?: string }
): string {
  const insTag = opts?.insertTag ?? 'ins';
  const delTag = opts?.deleteTag ?? 'del';
  const chunks = diffChars(oldStr, newStr);
  let out = '';
  for (const chunk of chunks) {
    const escaped = chunk.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (chunk.op === 'equal') {
      out += escaped;
    } else if (chunk.op === 'insert') {
      out += `<${insTag}>${escaped}</${insTag}>`;
    } else {
      out += `<${delTag}>${escaped}</${delTag}>`;
    }
  }
  return out;
}

// ─── Unified diff ──────────────────────────────────────────────────────────

export interface UnifiedDiffOptions {
  context?: number;
  oldLabel?: string;
  newLabel?: string;
}

export interface ParsedHunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: Array<{ op: '+' | '-' | ' '; text: string }>;
}

/**
 * Generate a unified diff string (git-style) between two multi-line strings.
 */
export function unifiedDiff(
  oldStr: string,
  newStr: string,
  opts?: UnifiedDiffOptions
): string {
  const context = opts?.context ?? 3;
  const oldLabel = opts?.oldLabel ?? 'a';
  const newLabel = opts?.newLabel ?? 'b';

  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');

  // Build line-level diff using tokenDiff on raw lines
  const chunks = tokenDiff(oldLines, newLines, (tokens) => tokens.join('\n'));

  // Expand each chunk into per-line entries
  interface LineEntry {
    op: '+' | '-' | ' ';
    text: string;
    oldLineNo: number; // 1-indexed, -1 for inserts
    newLineNo: number; // 1-indexed, -1 for deletes
  }
  const entries: LineEntry[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const chunk of chunks) {
    const lines = chunk.value === '' ? [''] : chunk.value.split('\n');
    if (chunk.op === 'equal') {
      for (const l of lines) {
        entries.push({ op: ' ', text: l, oldLineNo: oldLine++, newLineNo: newLine++ });
      }
    } else if (chunk.op === 'delete') {
      for (const l of lines) {
        entries.push({ op: '-', text: l, oldLineNo: oldLine++, newLineNo: -1 });
      }
    } else {
      for (const l of lines) {
        entries.push({ op: '+', text: l, oldLineNo: -1, newLineNo: newLine++ });
      }
    }
  }

  // Group into hunks with context
  const changed = entries.map((e, i) => (e.op !== ' ' ? i : -1)).filter((i) => i !== -1);
  if (changed.length === 0) return '';

  const hunks: Array<{ start: number; end: number }> = [];
  let hunkStart = Math.max(0, changed[0] - context);
  let hunkEnd = Math.min(entries.length - 1, changed[0] + context);

  for (let ci = 1; ci < changed.length; ci++) {
    const lo = Math.max(0, changed[ci] - context);
    const hi = Math.min(entries.length - 1, changed[ci] + context);
    if (lo <= hunkEnd + 1) {
      hunkEnd = hi;
    } else {
      hunks.push({ start: hunkStart, end: hunkEnd });
      hunkStart = lo;
      hunkEnd = hi;
    }
  }
  hunks.push({ start: hunkStart, end: hunkEnd });

  const lines: string[] = [`--- ${oldLabel}`, `+++ ${newLabel}`];

  for (const h of hunks) {
    const slice = entries.slice(h.start, h.end + 1);
    const oldStart = slice.find((e) => e.oldLineNo !== -1)?.oldLineNo ?? 1;
    const newStart = slice.find((e) => e.newLineNo !== -1)?.newLineNo ?? 1;
    const oldCount = slice.filter((e) => e.op !== '+').length;
    const newCount = slice.filter((e) => e.op !== '-').length;
    lines.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`);
    for (const e of slice) {
      lines.push(`${e.op}${e.text}`);
    }
  }

  return lines.join('\n');
}

// ─── Parse unified diff ────────────────────────────────────────────────────

/**
 * Parse a unified diff string into an array of ParsedHunk objects.
 */
export function parseUnifiedDiff(diff: string): ParsedHunk[] {
  const lines = diff.split('\n');
  const hunks: ParsedHunk[] = [];
  let current: ParsedHunk | null = null;

  for (const line of lines) {
    const hunkHeader = line.match(/^@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@/);
    if (hunkHeader) {
      current = {
        oldStart: parseInt(hunkHeader[1], 10),
        oldCount: hunkHeader[2] !== undefined ? parseInt(hunkHeader[2], 10) : 1,
        newStart: parseInt(hunkHeader[3], 10),
        newCount: hunkHeader[4] !== undefined ? parseInt(hunkHeader[4], 10) : 1,
        lines: [],
      };
      hunks.push(current);
    } else if (current) {
      if (line.startsWith('+')) {
        current.lines.push({ op: '+', text: line.slice(1) });
      } else if (line.startsWith('-')) {
        current.lines.push({ op: '-', text: line.slice(1) });
      } else if (line.startsWith(' ')) {
        current.lines.push({ op: ' ', text: line.slice(1) });
      }
    }
  }
  return hunks;
}

// ─── Apply unified diff ────────────────────────────────────────────────────

/**
 * Apply a unified diff string to an original string and return the patched result.
 */
export function applyUnifiedDiff(original: string, diff: string): string {
  const hunks = parseUnifiedDiff(diff);
  if (hunks.length === 0) return original;

  const originalLines = original.split('\n');
  const resultLines: string[] = [...originalLines];
  let offset = 0; // cumulative offset from inserts/deletes

  for (const hunk of hunks) {
    let pos = hunk.oldStart - 1 + offset; // 0-indexed
    for (const hl of hunk.lines) {
      if (hl.op === ' ') {
        pos++;
      } else if (hl.op === '-') {
        resultLines.splice(pos, 1);
        offset--;
      } else {
        resultLines.splice(pos, 0, hl.text);
        pos++;
        offset++;
      }
    }
  }
  return resultLines.join('\n');
}

// ─── Summarize changes ─────────────────────────────────────────────────────

/**
 * Returns a human-readable summary of differences.
 * E.g. "3 insertions, 2 deletions, 85% similarity"
 */
export function summarizeChanges(oldStr: string, newStr: string): string {
  const chunks = diffChars(oldStr, newStr);
  const stats = diffStats(chunks);
  const pct = Math.round(stats.similarity * 100);
  const parts: string[] = [];
  if (stats.insertions === 1) parts.push('1 insertion');
  else if (stats.insertions > 0) parts.push(`${stats.insertions} insertions`);
  if (stats.deletions === 1) parts.push('1 deletion');
  else if (stats.deletions > 0) parts.push(`${stats.deletions} deletions`);
  if (parts.length === 0) parts.push('no changes');
  parts.push(`${pct}% similarity`);
  return parts.join(', ');
}

// ─── Structural diff for objects ───────────────────────────────────────────

export interface ObjectDiff {
  added: string[];
  removed: string[];
  changed: string[];
}

function flattenObject(obj: unknown, prefix = ''): Map<string, unknown> {
  const map = new Map<string, unknown>();
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    map.set(prefix || '.', obj);
    return map;
  }
  const rec = obj as Record<string, unknown>;
  for (const key of Object.keys(rec)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = rec[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const nested = flattenObject(val, fullKey);
      nested.forEach((v, k) => map.set(k, v));
    } else {
      map.set(fullKey, val);
    }
  }
  return map;
}

/**
 * Structural diff for JSON-serializable objects. Returns dot-notation paths
 * for added, removed, and changed properties.
 */
export function diffObjects(a: unknown, b: unknown, path = ''): ObjectDiff {
  const flatA = flattenObject(a, path);
  const flatB = flattenObject(b, path);

  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  flatB.forEach((val, key) => {
    if (!flatA.has(key)) {
      added.push(key);
    } else if (JSON.stringify(flatA.get(key)) !== JSON.stringify(val)) {
      changed.push(key);
    }
  });

  flatA.forEach((_, key) => {
    if (!flatB.has(key)) {
      removed.push(key);
    }
  });

  return { added, removed, changed };
}

// ─── Three-way merge ───────────────────────────────────────────────────────

export interface MergeResult {
  merged: string;
  conflicts: number;
  hasConflicts: boolean;
}

/**
 * Three-way merge of base, ours, theirs at the line level.
 * Where only one side changed → auto-merge.
 * Where both sides changed differently from base → conflict marker.
 */
export function threeWayMerge(base: string, ours: string, theirs: string): MergeResult {
  const baseLines = base.split('\n');
  const ourLines = ours.split('\n');
  const theirLines = theirs.split('\n');

  // Compute diffs from base
  const ourChunks = tokenDiff(baseLines, ourLines, (t) => t.join('\n'));
  const theirChunks = tokenDiff(baseLines, theirLines, (t) => t.join('\n'));

  // Map base line index → our change and their change
  // Build two aligned edit scripts indexed by base line
  interface LineChange {
    type: 'equal' | 'delete' | 'insert';
    lines: string[];
  }

  function expandToBaseAlign(
    baseLen: number,
    chunks: DiffChunk[]
  ): Array<{ baseIdx: number | null; text: string; op: DiffOp }> {
    const aligned: Array<{ baseIdx: number | null; text: string; op: DiffOp }> = [];
    for (const chunk of chunks) {
      const lines = chunk.value.split('\n');
      if (chunk.op === 'equal') {
        const start = chunk.oldStart ?? 0;
        for (let li = 0; li < lines.length; li++) {
          aligned.push({ baseIdx: start + li, text: lines[li], op: 'equal' });
        }
      } else if (chunk.op === 'delete') {
        const start = chunk.oldStart ?? 0;
        for (let li = 0; li < lines.length; li++) {
          aligned.push({ baseIdx: start + li, text: lines[li], op: 'delete' });
        }
      } else {
        for (const l of lines) {
          aligned.push({ baseIdx: null, text: l, op: 'insert' });
        }
      }
    }
    return aligned;
  }

  const ourAligned = expandToBaseAlign(baseLines.length, ourChunks);
  const theirAligned = expandToBaseAlign(baseLines.length, theirChunks);

  // Build maps: base index → new text from ours / theirs
  const ourByBase = new Map<number, string[]>();
  const ourInsertsBefore = new Map<number, string[]>();
  const theirByBase = new Map<number, string[]>();
  const theirInsertsBefore = new Map<number, string[]>();

  // Process our changes
  let nextBaseIdx = 0;
  for (const entry of ourAligned) {
    if (entry.op === 'insert') {
      const arr = ourInsertsBefore.get(nextBaseIdx) ?? [];
      arr.push(entry.text);
      ourInsertsBefore.set(nextBaseIdx, arr);
    } else if (entry.op === 'delete') {
      ourByBase.set(entry.baseIdx!, []); // deleted → empty
      nextBaseIdx = (entry.baseIdx ?? nextBaseIdx) + 1;
    } else {
      ourByBase.set(entry.baseIdx!, [entry.text]); // kept
      nextBaseIdx = (entry.baseIdx ?? nextBaseIdx) + 1;
    }
  }

  // Process their changes
  nextBaseIdx = 0;
  for (const entry of theirAligned) {
    if (entry.op === 'insert') {
      const arr = theirInsertsBefore.get(nextBaseIdx) ?? [];
      arr.push(entry.text);
      theirInsertsBefore.set(nextBaseIdx, arr);
    } else if (entry.op === 'delete') {
      theirByBase.set(entry.baseIdx!, []);
      nextBaseIdx = (entry.baseIdx ?? nextBaseIdx) + 1;
    } else {
      theirByBase.set(entry.baseIdx!, [entry.text]);
      nextBaseIdx = (entry.baseIdx ?? nextBaseIdx) + 1;
    }
  }

  const mergedLines: string[] = [];
  let conflicts = 0;

  for (let bi = 0; bi <= baseLines.length - 1; bi++) {
    // Inserts before this base line
    const ourIns = ourInsertsBefore.get(bi) ?? [];
    const theirIns = theirInsertsBefore.get(bi) ?? [];
    // Determine what each side has for this base line
    const ourLine = ourByBase.has(bi) ? ourByBase.get(bi)! : [baseLines[bi]];
    const theirLine = theirByBase.has(bi) ? theirByBase.get(bi)! : [baseLines[bi]];

    const ourChanged = ourByBase.has(bi) && JSON.stringify(ourByBase.get(bi)) !== JSON.stringify([baseLines[bi]]);
    const theirChanged = theirByBase.has(bi) && JSON.stringify(theirByBase.get(bi)) !== JSON.stringify([baseLines[bi]]);

    const insConflict =
      ourIns.length > 0 &&
      theirIns.length > 0 &&
      JSON.stringify(ourIns) !== JSON.stringify(theirIns);
    const lineConflict =
      ourChanged &&
      theirChanged &&
      JSON.stringify(ourLine) !== JSON.stringify(theirLine);

    if (insConflict || lineConflict) {
      // Emit conflict markers
      conflicts++;
      mergedLines.push('<<<<<<< ours');
      mergedLines.push(...ourIns, ...ourLine);
      mergedLines.push('=======');
      mergedLines.push(...theirIns, ...theirLine);
      mergedLines.push('>>>>>>> theirs');
    } else {
      // Auto-merge
      if (ourIns.length > 0) mergedLines.push(...ourIns);
      else if (theirIns.length > 0) mergedLines.push(...theirIns);

      if (ourChanged) mergedLines.push(...ourLine);
      else if (theirChanged) mergedLines.push(...theirLine);
      else mergedLines.push(baseLines[bi]);
    }
  }

  // Handle trailing inserts after last base line
  const trailingBaseIdx = baseLines.length;
  const ourTrailing = ourInsertsBefore.get(trailingBaseIdx) ?? [];
  const theirTrailing = theirInsertsBefore.get(trailingBaseIdx) ?? [];
  if (ourTrailing.length > 0 && theirTrailing.length > 0 && JSON.stringify(ourTrailing) !== JSON.stringify(theirTrailing)) {
    conflicts++;
    mergedLines.push('<<<<<<< ours');
    mergedLines.push(...ourTrailing);
    mergedLines.push('=======');
    mergedLines.push(...theirTrailing);
    mergedLines.push('>>>>>>> theirs');
  } else {
    if (ourTrailing.length > 0) mergedLines.push(...ourTrailing);
    else if (theirTrailing.length > 0) mergedLines.push(...theirTrailing);
  }

  return {
    merged: mergedLines.join('\n'),
    conflicts,
    hasConflicts: conflicts > 0,
  };
}
