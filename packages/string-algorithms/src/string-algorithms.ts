// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function kmpSearch(text: string, pattern: string): number[] {
  if (!pattern.length) return [];
  const n = text.length, m = pattern.length;
  const lps = buildLPS(pattern);
  const matches: number[] = [];
  let j = 0;
  for (let i = 0; i < n;) {
    if (text[i] === pattern[j]) { i++; j++; }
    if (j === m) { matches.push(i - j); j = lps[j - 1]; }
    else if (i < n && text[i] !== pattern[j]) {
      if (j !== 0) j = lps[j - 1]; else i++;
    }
  }
  return matches;
}

function buildLPS(pattern: string): number[] {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0, i = 1;
  while (i < m) {
    if (pattern[i] === pattern[len]) { lps[i++] = ++len; }
    else if (len) { len = lps[len - 1]; }
    else { lps[i++] = 0; }
  }
  return lps;
}

export function rabinKarp(text: string, pattern: string): number[] {
  const n = text.length, m = pattern.length;
  if (m > n) return [];
  const BASE = 31, MOD = 1_000_000_007n;
  const bign = BigInt(n), bigm = BigInt(m), bigBase = BigInt(BASE), bigMod = BigInt(MOD);
  const hash = (s: string, len: number): bigint => {
    let h = 0n;
    for (let i = 0; i < len; i++) h = (h * bigBase + BigInt(s.charCodeAt(i) - 96)) % bigMod;
    return h;
  };
  const pow = (base: bigint, exp: bigint, mod: bigint): bigint => {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) { if (exp % 2n === 1n) result = result * base % mod; exp = exp / 2n; base = base * base % mod; }
    return result;
  };
  const ph = hash(pattern, m);
  let th = hash(text, m);
  const highPow = pow(bigBase, bigm - 1n, bigMod);
  const matches: number[] = [];
  if (ph === th && text.slice(0, m) === pattern) matches.push(0);
  for (let i = 1; i + m <= n; i++) {
    th = ((th - BigInt(text.charCodeAt(i - 1) - 96) * highPow % bigMod + bigMod) * bigBase + BigInt(text.charCodeAt(i + m - 1) - 96)) % bigMod;
    if (th === ph && text.slice(i, i + m) === pattern) matches.push(i);
  }
  return matches;
}

export function longestCommonSubsequence(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}

export function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

export function longestPalindrome(s: string): string {
  if (!s.length) return '';
  let start = 0, maxLen = 1;
  const expand = (l: number, r: number): void => {
    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }
    if (r - l - 1 > maxLen) { maxLen = r - l - 1; start = l + 1; }
  };
  for (let i = 0; i < s.length; i++) { expand(i, i); expand(i, i + 1); }
  return s.slice(start, start + maxLen);
}

export function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

export function anagramGroups(words: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const w of words) {
    const key = w.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(w);
  }
  return [...map.values()];
}

export function reverseWords(s: string): string {
  return s.trim().split(/\s+/).reverse().join(' ');
}

export function countOccurrences(text: string, pattern: string): number {
  return kmpSearch(text, pattern).length;
}

export function longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return '';
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (!prefix) return '';
  }
  return prefix;
}
