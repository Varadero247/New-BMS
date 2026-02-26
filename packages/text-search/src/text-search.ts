// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Naive O(n*m) search — returns all start indices of pattern in text.
 */
export function naiveSearch(text: string, pattern: string): number[] {
  const results: number[] = [];
  if (pattern.length === 0) {
    for (let i = 0; i <= text.length; i++) results.push(i);
    return results;
  }
  if (pattern.length > text.length) return results;
  for (let i = 0; i <= text.length - pattern.length; i++) {
    let match = true;
    for (let j = 0; j < pattern.length; j++) {
      if (text[i + j] !== pattern[j]) { match = false; break; }
    }
    if (match) results.push(i);
  }
  return results;
}

/**
 * KMP failure function (partial match table).
 */
export function kmpFailureFunction(pattern: string): number[] {
  const m = pattern.length;
  const fail = new Array<number>(m).fill(0);
  let k = 0;
  for (let j = 1; j < m; j++) {
    while (k > 0 && pattern[k] !== pattern[j]) k = fail[k - 1];
    if (pattern[k] === pattern[j]) k++;
    fail[j] = k;
  }
  return fail;
}

/**
 * KMP (Knuth-Morris-Pratt) O(n+m) — returns all start indices.
 */
export function kmpSearch(text: string, pattern: string): number[] {
  const results: number[] = [];
  if (pattern.length === 0) {
    for (let i = 0; i <= text.length; i++) results.push(i);
    return results;
  }
  const fail = kmpFailureFunction(pattern);
  let k = 0;
  for (let i = 0; i < text.length; i++) {
    while (k > 0 && pattern[k] !== text[i]) k = fail[k - 1];
    if (pattern[k] === text[i]) k++;
    if (k === pattern.length) {
      results.push(i - pattern.length + 1);
      k = fail[k - 1];
    }
  }
  return results;
}

/**
 * Rabin-Karp rolling hash search — returns all start indices.
 */
export function rabinKarpSearch(
  text: string,
  pattern: string,
  base: number = 31,
  mod: number = 1_000_000_007,
): number[] {
  const results: number[] = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) {
    for (let i = 0; i <= n; i++) results.push(i);
    return results;
  }
  if (m > n) return results;

  // Compute base^(m-1) % mod
  let power = 1;
  for (let i = 0; i < m - 1; i++) power = (power * base) % mod;

  // Compute hash of pattern and first window
  let patHash = 0;
  let winHash = 0;
  for (let i = 0; i < m; i++) {
    patHash = (patHash * base + pattern.charCodeAt(i)) % mod;
    winHash = (winHash * base + text.charCodeAt(i)) % mod;
  }

  for (let i = 0; i <= n - m; i++) {
    if (winHash === patHash) {
      // Verify character by character
      let match = true;
      for (let j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) { match = false; break; }
      }
      if (match) results.push(i);
    }
    if (i < n - m) {
      winHash = (winHash - text.charCodeAt(i) * power % mod + mod) % mod;
      winHash = (winHash * base + text.charCodeAt(i + m)) % mod;
    }
  }
  return results;
}

/**
 * Bad character table for Boyer-Moore-Horspool.
 * Returns a Map from character to its last occurrence index in pattern
 * (excluding the last character, which is always pattern.length - 1).
 */
export function badCharTable(pattern: string): Map<string, number> {
  const table = new Map<string, number>();
  for (let i = 0; i < pattern.length - 1; i++) {
    table.set(pattern[i], i);
  }
  return table;
}

/**
 * Boyer-Moore-Horspool (simplified BM with bad character heuristic) — returns all start indices.
 */
export function boyerMooreSearch(text: string, pattern: string): number[] {
  const results: number[] = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) {
    for (let i = 0; i <= n; i++) results.push(i);
    return results;
  }
  if (m > n) return results;

  // Build bad character shift table: shift[c] = m - 1 - last index of c in pattern[0..m-2]
  const shift = new Map<string, number>();
  for (let i = 0; i < m - 1; i++) {
    shift.set(pattern[i], m - 1 - i);
  }

  let i = 0;
  while (i <= n - m) {
    let j = m - 1;
    while (j >= 0 && pattern[j] === text[i + j]) j--;
    if (j < 0) {
      results.push(i);
      i += 1;
    } else {
      const badChar = text[i + m - 1];
      const s = shift.get(badChar);
      i += s !== undefined ? s : m;
    }
  }
  return results;
}

/**
 * Z-algorithm — Z array where Z[i] = length of longest substring
 * starting at index i that also matches a prefix of s.
 * Z[0] is defined as 0 (or s.length by some conventions; here 0).
 */
export function zArray(s: string): number[] {
  const n = s.length;
  const z = new Array<number>(n).fill(0);
  if (n === 0) return z;
  z[0] = 0; // convention: z[0] is not used / set to 0
  let l = 0;
  let r = 0;
  for (let i = 1; i < n; i++) {
    if (i < r) {
      z[i] = Math.min(r - i, z[i - l]);
    }
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++;
    }
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
    }
  }
  return z;
}

/**
 * Z-algorithm search — returns all start indices of pattern in text.
 */
export function zSearch(text: string, pattern: string): number[] {
  const results: number[] = [];
  if (pattern.length === 0) {
    for (let i = 0; i <= text.length; i++) results.push(i);
    return results;
  }
  const concat = pattern + '$' + text;
  const z = zArray(concat);
  const m = pattern.length;
  for (let i = m + 1; i < concat.length; i++) {
    if (z[i] >= m) {
      results.push(i - m - 1);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Aho-Corasick multi-pattern search
// ---------------------------------------------------------------------------

interface ACNode {
  children: Map<string, number>;
  fail: number;
  output: string[];
}

export class AhoCorasick {
  private nodes: ACNode[];
  private patterns: string[];

  constructor(patterns: string[]) {
    this.patterns = patterns;
    this.nodes = [{ children: new Map(), fail: 0, output: [] }];
    this._build(patterns);
  }

  private _build(patterns: string[]): void {
    // Insert all patterns into the trie
    for (const pat of patterns) {
      if (pat.length === 0) continue;
      let cur = 0;
      for (const ch of pat) {
        if (!this.nodes[cur].children.has(ch)) {
          this.nodes[cur].children.set(ch, this.nodes.length);
          this.nodes.push({ children: new Map(), fail: 0, output: [] });
        }
        cur = this.nodes[cur].children.get(ch)!;
      }
      this.nodes[cur].output.push(pat);
    }

    // BFS to set fail links
    const queue: number[] = [];
    for (const [, child] of this.nodes[0].children) {
      this.nodes[child].fail = 0;
      queue.push(child);
    }
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const [ch, v] of this.nodes[u].children) {
        let f = this.nodes[u].fail;
        while (f !== 0 && !this.nodes[f].children.has(ch)) f = this.nodes[f].fail;
        const failState = this.nodes[f].children.get(ch);
        this.nodes[v].fail = failState !== undefined && failState !== v ? failState : 0;
        this.nodes[v].output = [
          ...this.nodes[v].output,
          ...this.nodes[this.nodes[v].fail].output,
        ];
        queue.push(v);
      }
    }
  }

  /**
   * Returns Map<pattern, number[]> with all match positions (start index) for each pattern.
   */
  search(text: string): Map<string, number[]> {
    const result = new Map<string, number[]>();
    for (const p of this.patterns) if (!result.has(p)) result.set(p, []);

    let cur = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      while (cur !== 0 && !this.nodes[cur].children.has(ch)) cur = this.nodes[cur].fail;
      if (this.nodes[cur].children.has(ch)) cur = this.nodes[cur].children.get(ch)!;
      for (const pat of this.nodes[cur].output) {
        const arr = result.get(pat);
        if (arr) arr.push(i - pat.length + 1);
      }
    }
    return result;
  }

  /**
   * All match events as {pattern, index} sorted by index.
   */
  searchAll(text: string): Array<{ pattern: string; index: number }> {
    const events: Array<{ pattern: string; index: number }> = [];
    let cur = 0;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      while (cur !== 0 && !this.nodes[cur].children.has(ch)) cur = this.nodes[cur].fail;
      if (this.nodes[cur].children.has(ch)) cur = this.nodes[cur].children.get(ch)!;
      for (const pat of this.nodes[cur].output) {
        events.push({ pattern: pat, index: i - pat.length + 1 });
      }
    }
    events.sort((a, b) => a.index - b.index || a.pattern.localeCompare(b.pattern));
    return events;
  }
}

// ---------------------------------------------------------------------------
// Longest Common Substring
// ---------------------------------------------------------------------------

/**
 * Longest Common Substring (not subsequence) using dynamic programming.
 */
export function longestCommonSubstring(a: string, b: string): string {
  const m = a.length;
  const n = b.length;
  if (m === 0 || n === 0) return '';
  // dp[i][j] = length of LCS ending at a[i-1] and b[j-1]
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  let maxLen = 0;
  let endIdx = 0; // end index (exclusive) in a
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        if (dp[i][j] > maxLen) {
          maxLen = dp[i][j];
          endIdx = i;
        }
      }
    }
  }
  return a.slice(endIdx - maxLen, endIdx);
}

// ---------------------------------------------------------------------------
// Edit Distance (Levenshtein)
// ---------------------------------------------------------------------------

/**
 * Edit distance (Levenshtein) — minimum number of single-character
 * insertions, deletions, or substitutions to transform a into b.
 */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  // Use two rows to save memory
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = new Array<number>(n + 1);
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
    }
    prev = curr;
  }
  return prev[n];
}

// ---------------------------------------------------------------------------
// Fuzzy Match
// ---------------------------------------------------------------------------

/**
 * Fuzzy search: returns true if any substring of text matches pattern
 * with at most maxErrors substitutions (Hamming-style, fixed length window).
 */
export function fuzzyMatch(text: string, pattern: string, maxErrors: number): boolean {
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return true;
  if (m > n) return false;
  for (let i = 0; i <= n - m; i++) {
    let errors = 0;
    for (let j = 0; j < m; j++) {
      if (text[i + j] !== pattern[j]) errors++;
      if (errors > maxErrors) break;
    }
    if (errors <= maxErrors) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Dictionary Search
// ---------------------------------------------------------------------------

/**
 * All occurrences of any word from a dictionary in text (case-insensitive).
 * Returns an array of {word, index} sorted by index.
 */
export function dictionarySearch(
  text: string,
  words: string[],
): Array<{ word: string; index: number }> {
  const results: Array<{ word: string; index: number }> = [];
  const lowerText = text.toLowerCase();
  for (const word of words) {
    if (word.length === 0) continue;
    const lowerWord = word.toLowerCase();
    let start = 0;
    while (start <= lowerText.length - lowerWord.length) {
      const idx = lowerText.indexOf(lowerWord, start);
      if (idx === -1) break;
      results.push({ word, index: idx });
      start = idx + 1;
    }
  }
  results.sort((a, b) => a.index - b.index || a.word.localeCompare(b.word));
  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Count occurrences of pattern in text.
 */
export function countOccurrences(text: string, pattern: string): number {
  if (pattern.length === 0) return text.length + 1;
  return kmpSearch(text, pattern).length;
}

/**
 * Find first occurrence (or -1).
 */
export function findFirst(text: string, pattern: string): number {
  if (pattern.length === 0) return 0;
  const matches = kmpSearch(text, pattern);
  return matches.length > 0 ? matches[0] : -1;
}

/**
 * Find last occurrence (or -1).
 */
export function findLast(text: string, pattern: string): number {
  if (pattern.length === 0) return text.length;
  const matches = kmpSearch(text, pattern);
  return matches.length > 0 ? matches[matches.length - 1] : -1;
}
