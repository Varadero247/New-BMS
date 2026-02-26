// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

/**
 * Build KMP failure function (partial match table) for a pattern.
 * @param pattern - The pattern string.
 * @returns The failure function array of length pattern.length.
 */
export function buildKMPTable(pattern: string): number[] {
  const m = pattern.length;
  const table = new Array<number>(m).fill(0);
  if (m === 0) return table;
  table[0] = 0;
  let len = 0;
  let i = 1;
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++;
      table[i] = len;
      i++;
    } else if (len !== 0) {
      len = table[len - 1];
    } else {
      table[i] = 0;
      i++;
    }
  }
  return table;
}

/**
 * Knuth-Morris-Pratt string search.
 * Returns all starting indices (0-based) of pattern in text.
 */
export function kmpSearch(text: string, pattern: string): number[] {
  const results: number[] = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) {
    for (let i = 0; i <= n; i++) results.push(i);
    return results;
  }
  if (m > n) return results;

  const table = buildKMPTable(pattern);
  let q = 0;
  for (let i = 0; i < n; i++) {
    while (q > 0 && text[i] !== pattern[q]) {
      q = table[q - 1];
    }
    if (text[i] === pattern[q]) {
      q++;
    }
    if (q === m) {
      results.push(i - m + 1);
      q = table[q - 1];
    }
  }
  return results;
}

/**
 * Rabin-Karp rolling hash string search.
 * Returns all starting indices (0-based) of pattern in text.
 */
export function rabinKarp(text: string, pattern: string): number[] {
  const results: number[] = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) {
    for (let i = 0; i <= n; i++) results.push(i);
    return results;
  }
  if (m > n) return results;

  const BASE = 31;
  const MOD = 1_000_000_007;

  // Precompute BASE^(m-1) % MOD
  let basePow = 1;
  for (let i = 0; i < m - 1; i++) {
    basePow = (basePow * BASE) % MOD;
  }

  // Hash of pattern and first window
  let patHash = 0;
  let winHash = 0;
  for (let i = 0; i < m; i++) {
    patHash = (patHash * BASE + pattern.charCodeAt(i)) % MOD;
    winHash = (winHash * BASE + text.charCodeAt(i)) % MOD;
  }

  for (let i = 0; i <= n - m; i++) {
    if (winHash === patHash) {
      // Verify character by character to avoid false positives
      if (text.substring(i, i + m) === pattern) {
        results.push(i);
      }
    }
    if (i < n - m) {
      winHash = (winHash - text.charCodeAt(i) * basePow % MOD + MOD) % MOD;
      winHash = (winHash * BASE + text.charCodeAt(i + m)) % MOD;
    }
  }
  return results;
}

/**
 * Boyer-Moore bad-character heuristic string search.
 * Returns all starting indices (0-based) of pattern in text.
 */
export function boyerMoore(text: string, pattern: string): number[] {
  const results: number[] = [];
  const n = text.length;
  const m = pattern.length;
  if (m === 0) {
    for (let i = 0; i <= n; i++) results.push(i);
    return results;
  }
  if (m > n) return results;

  // Build bad-character table: last occurrence of each character in pattern
  const badChar = new Map<string, number>();
  for (let i = 0; i < m; i++) {
    badChar.set(pattern[i], i);
  }

  let s = 0;
  while (s <= n - m) {
    let j = m - 1;
    while (j >= 0 && pattern[j] === text[s + j]) {
      j--;
    }
    if (j < 0) {
      results.push(s);
      // After a match, shift by good-suffix or 1
      const nextBad = badChar.get(text[s + m] ?? '') ?? -1;
      s += m - nextBad > 1 ? m - nextBad : 1;
    } else {
      const bcShift = j - (badChar.get(text[s + j]) ?? -1);
      s += bcShift > 1 ? bcShift : 1;
    }
  }
  return results;
}

/**
 * Z-algorithm: compute Z-array for string s.
 * Z[i] = length of the longest substring starting at s[i] that is also a prefix of s.
 * Z[0] is defined as s.length (length of the whole string).
 */
export function zAlgorithm(s: string): number[] {
  const n = s.length;
  const z = new Array<number>(n).fill(0);
  if (n === 0) return z;
  z[0] = n;
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
