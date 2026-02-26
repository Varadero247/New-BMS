// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/** Build suffix array using naive O(n^2 log n) sort */
export function buildSuffixArray(s: string): number[] {
  const n = s.length;
  const suffixes = Array.from({ length: n }, (_, i) => i);
  suffixes.sort((a, b) => {
    const sa = s.slice(a), sb = s.slice(b);
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
  return suffixes;
}

/** Build LCP array from string and its suffix array */
export function buildLCPArray(s: string, sa: number[]): number[] {
  const n = s.length;
  const rank = new Array(n).fill(0);
  for (let i = 0; i < n; i++) rank[sa[i]] = i;
  const lcp = new Array(n).fill(0);
  let h = 0;
  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1];
      while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
      lcp[rank[i]] = h;
      if (h > 0) h--;
    }
  }
  return lcp;
}

/** Count distinct substrings using suffix array + LCP */
export function countDistinctSubstrings(s: string): number {
  const n = s.length;
  const sa = buildSuffixArray(s);
  const lcp = buildLCPArray(s, sa);
  let count = n * (n + 1) / 2;
  for (let i = 1; i < n; i++) count -= lcp[i];
  return count;
}

/** Longest repeated substring */
export function longestRepeatedSubstring(s: string): string {
  const sa = buildSuffixArray(s);
  const lcp = buildLCPArray(s, sa);
  let maxLen = 0, pos = 0;
  for (let i = 1; i < lcp.length; i++) {
    if (lcp[i] > maxLen) { maxLen = lcp[i]; pos = sa[i]; }
  }
  return s.slice(pos, pos + maxLen);
}

/** Search for pattern in string using suffix array binary search */
export function search(s: string, sa: number[], pattern: string): number[] {
  const n = sa.length;
  const m = pattern.length;
  const results: number[] = [];
  let lo = 0, hi = n;
  // Find first occurrence
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (s.slice(sa[mid], sa[mid] + m) < pattern) lo = mid + 1;
    else hi = mid;
  }
  const first = lo;
  hi = n;
  // Find last occurrence
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (s.slice(sa[mid], sa[mid] + m) <= pattern &&
        s.slice(sa[mid], sa[mid] + m).startsWith(pattern)) lo = mid + 1;
    else hi = mid;
  }
  for (let i = first; i < lo; i++) {
    if (s.slice(sa[i], sa[i] + m) === pattern) results.push(sa[i]);
  }
  return results.sort((a, b) => a - b);
}

/** Longest common extension: max k such that s[i..i+k] === s[j..j+k] */
export function longestCommonExtension(s: string, i: number, j: number): number {
  let k = 0;
  while (i + k < s.length && j + k < s.length && s[i + k] === s[j + k]) k++;
  return k;
}

/** Suffix that starts at position i */
export function getSuffix(s: string, i: number): string { return s.slice(i); }

/** All suffixes sorted */
export function allSortedSuffixes(s: string): string[] {
  return buildSuffixArray(s).map(i => s.slice(i));
}

/** Longest common substring of two strings */
export function longestCommonSubstring(a: string, b: string): string {
  const combined = a + '#' + b;
  const sa = buildSuffixArray(combined);
  const lcp = buildLCPArray(combined, sa);
  const n = a.length;
  let maxLen = 0, pos = 0;
  for (let i = 1; i < sa.length; i++) {
    const p = sa[i-1], q = sa[i];
    if ((p < n) !== (q < n) && lcp[i] > maxLen) {
      maxLen = lcp[i]; pos = sa[i] < n ? sa[i] : sa[i-1];
      if (pos >= n) pos = sa[i];
    }
  }
  return a.slice(pos, pos + maxLen);
}

/** Z-array: z[i] = length of longest substring starting at i that is also prefix of s */
export function buildZArray(s: string): number[] {
  const n = s.length;
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

/** Z-function based pattern matching: return all start positions */
export function zMatch(text: string, pattern: string): number[] {
  const combined = pattern + '$' + text;
  const z = buildZArray(combined);
  const result: number[] = [];
  const m = pattern.length;
  for (let i = m + 1; i < combined.length; i++) {
    if (z[i] >= m) result.push(i - m - 1);
  }
  return result;
}

/** Burrows-Wheeler Transform */
export function bwt(s: string): { transform: string; index: number } {
  const n = s.length;
  const sa = buildSuffixArray(s);
  const transform = sa.map(i => s[(i - 1 + n) % n]).join('');
  const index = sa.indexOf(0);
  return { transform, index };
}

/** SuffixArray class — wraps string with search and lcp methods */
export class SuffixArray {
  private _s: string;
  private _sa: number[];
  constructor(s: string) {
    this._s = s;
    this._sa = buildSuffixArray(s);
  }
  search(pattern: string): number[] {
    const s = this._s, sa = this._sa, n = sa.length, m = pattern.length;
    const cmp = (idx: number) => s.slice(idx, idx + m) >= pattern;
    let lo = 0, hi = n;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cmp(sa[mid])) hi = mid; else lo = mid + 1; }
    const start = lo;
    lo = 0; hi = n;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (s.slice(sa[mid], sa[mid]+m) > pattern) hi = mid; else lo = mid + 1; }
    return sa.slice(start, lo).filter(i => s.slice(i, i+m) === pattern);
  }
  lcp(): number[] { return buildLCPArray(this._s, this._sa); }
  suffixes(): string[] { return this._sa.map(i => this._s.slice(i)); }
}

/** SuffixAutomaton class — provides contains and countDistinct */
export class SuffixAutomaton {
  private _s: string;
  constructor(s: string) { this._s = s; }
  contains(sub: string): boolean {
    if (sub.length === 0) return true;
    return this._s.includes(sub);
  }
  countDistinct(): number {
    // Count distinct non-empty substrings = sum over SA of (n - SA[i] - LCP[i])
    const sa = buildSuffixArray(this._s);
    const lcp = buildLCPArray(this._s, sa);
    const n = this._s.length;
    let count = 0;
    for (let i = 0; i < n; i++) count += (n - sa[i]) - lcp[i];
    return count;
  }
}
