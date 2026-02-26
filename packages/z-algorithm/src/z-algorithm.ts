// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * Build Z-array for a string.
 * Z[i] = length of the longest substring starting at s[i] which is also a prefix of s.
 * Z[0] is conventionally set to s.length.
 */
export function buildZArray(s: string): number[] {
  const n = s.length;
  if (n === 0) return [];
  const z = new Array(n).fill(0);
  z[0] = n;
  let l = 0, r = 0;
  for (let i = 1; i < n; i++) {
    if (i < r) z[i] = Math.min(r - i, z[i - l]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] > r) { l = i; r = i + z[i]; }
  }
  return z;
}

/**
 * Find all occurrences of pattern p in text t using Z-algorithm.
 * Returns array of starting indices.
 */
export function zSearch(text: string, pattern: string): number[] {
  if (pattern.length === 0) {
    return Array.from({ length: text.length + 1 }, (_, i) => i);
  }
  if (pattern.length > text.length) return [];
  const combined = pattern + '$' + text;
  const z = buildZArray(combined);
  const m = pattern.length;
  const result: number[] = [];
  for (let i = m + 1; i < combined.length; i++) {
    if (z[i] >= m) result.push(i - m - 1);
  }
  return result;
}

/**
 * Count occurrences of pattern in text.
 */
export function countOccurrences(text: string, pattern: string): number {
  return zSearch(text, pattern).length;
}

/**
 * Check if pattern occurs in text at least once.
 */
export function contains(text: string, pattern: string): boolean {
  if (pattern.length === 0) return true;
  if (pattern.length > text.length) return false;
  const combined = pattern + '$' + text;
  const z = buildZArray(combined);
  const m = pattern.length;
  for (let i = m + 1; i < combined.length; i++) {
    if (z[i] >= m) return true;
  }
  return false;
}

/**
 * Find the longest prefix of s that is also a suffix.
 * (Equivalent to KMP failure function's last value.)
 */
export function longestPrefixSuffix(s: string): number {
  if (s.length === 0) return 0;
  const z = buildZArray(s);
  let best = 0;
  for (let i = 1; i < s.length; i++) {
    if (i + z[i] === s.length) best = Math.max(best, z[i]);
  }
  return best;
}

/**
 * Check if s has a period p (s can be formed by repeating a prefix of length p).
 */
export function hasPeriod(s: string, p: number): boolean {
  if (p <= 0 || p > s.length) return false;
  if (s.length % p !== 0) return false;
  const prefix = s.slice(0, p);
  return s === prefix.repeat(s.length / p);
}

/**
 * Find the minimum period of s.
 */
export function minPeriod(s: string): number {
  const n = s.length;
  if (n === 0) return 0;
  const z = buildZArray(s);
  for (let p = 1; p <= n; p++) {
    if (n % p === 0) {
      let ok = true;
      for (let i = p; i < n; i += p) {
        if (z[i] < n - i) { ok = false; break; }
      }
      if (ok) return p;
    }
  }
  return n;
}

/**
 * Get all periods of s.
 */
export function allPeriods(s: string): number[] {
  const n = s.length;
  const result: number[] = [];
  for (let p = 1; p <= n; p++) {
    if (hasPeriod(s, p)) result.push(p);
  }
  return result;
}

/**
 * Build failure function (KMP) from Z-array.
 */
export function zToKMPFailure(z: number[]): number[] {
  const n = z.length;
  const f = new Array(n).fill(0);
  for (let i = 1; i < n; i++) {
    if (z[i] > 0) {
      for (let j = z[i] - 1; j >= (i > 0 ? 1 : 1); j--) {
        if (f[i + j - 1] === 0) f[i + j - 1] = j;
        else break;
      }
    }
  }
  return f;
}

/**
 * Count distinct substrings using Z-array (incremental construction).
 */
export function countDistinctSubstrings(s: string): number {
  const n = s.length;
  let count = 0;
  for (let i = 0; i < n; i++) {
    const suffix = s.slice(i);
    const z = buildZArray(suffix);
    const maxZ = z.slice(1).reduce((a, b) => Math.max(a, b), 0);
    count += suffix.length - maxZ;
  }
  return count;
}

/**
 * Check if t is a rotation of s.
 */
export function isRotation(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  if (s.length === 0) return true;
  return contains(s + s, t);
}

/**
 * Find all positions where s[i..] has a prefix of length >= minLen equal to the string prefix.
 */
export function findPrefixMatches(s: string, minLen: number): number[] {
  const z = buildZArray(s);
  const result: number[] = [];
  for (let i = 1; i < s.length; i++) {
    if (z[i] >= minLen) result.push(i);
  }
  return result;
}

/**
 * Lexicographically smallest rotation of s.
 */
export function smallestRotation(s: string): string {
  if (s.length === 0) return '';
  const doubled = s + s;
  const n = s.length;
  let best = 0;
  for (let i = 1; i < n; i++) {
    if (doubled.slice(i, i + n) < doubled.slice(best, best + n)) best = i;
  }
  return s.slice(best) + s.slice(0, best);
}

/**
 * Compute Z-function for an integer array (for generalized pattern matching).
 */
export function buildZArrayInt(arr: number[]): number[] {
  const n = arr.length;
  if (n === 0) return [];
  const z = new Array(n).fill(0);
  z[0] = n;
  let l = 0, r = 0;
  for (let i = 1; i < n; i++) {
    if (i < r) z[i] = Math.min(r - i, z[i - l]);
    while (i + z[i] < n && arr[z[i]] === arr[i + z[i]]) z[i]++;
    if (i + z[i] > r) { l = i; r = i + z[i]; }
  }
  return z;
}

/**
 * Find all anagram positions of pattern in text.
 * An anagram match means text[i..i+m-1] is an anagram of pattern.
 * Works for lowercase a-z only.
 */
export function findAnagrams(text: string, pattern: string): number[] {
  const m = pattern.length;
  const n = text.length;
  if (m > n) return [];
  const result: number[] = [];
  const pCount = new Array(26).fill(0);
  const tCount = new Array(26).fill(0);
  const aCode = 'a'.charCodeAt(0);
  for (const ch of pattern) pCount[ch.charCodeAt(0) - aCode]++;
  for (let i = 0; i < m; i++) tCount[text.charCodeAt(i) - aCode]++;
  if (pCount.join(',') === tCount.join(',')) result.push(0);
  for (let i = m; i < n; i++) {
    tCount[text.charCodeAt(i) - aCode]++;
    tCount[text.charCodeAt(i - m) - aCode]--;
    if (pCount.join(',') === tCount.join(',')) result.push(i - m + 1);
  }
  return result;
}
