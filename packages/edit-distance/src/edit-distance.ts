// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  }
  return dp[m][n];
}

export function hamming(a: string, b: string): number {
  if (a.length !== b.length) return -1;
  let dist = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

export function damerauLevenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const cost = a[i-1] === b[j-1] ? 0 : 1;
    dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
    if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1])
      dp[i][j] = Math.min(dp[i][j], dp[i-2][j-2] + cost);
  }
  return dp[m][n];
}

export function optimalStringAlignment(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const cost = a[i-1] === b[j-1] ? 0 : 1;
    dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
    if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1])
      dp[i][j] = Math.min(dp[i][j], dp[i-2][j-2] + cost);
  }
  return dp[m][n];
}

export function jaro(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const matchDist = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const aMatches = new Array(a.length).fill(false);
  const bMatches = new Array(b.length).fill(false);
  let matches = 0, transpositions = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true; bMatches[j] = true; matches++; break;
    }
  }
  if (!matches) return 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  return (matches/a.length + matches/b.length + (matches - transpositions/2)/matches) / 3;
}

export function jaroWinkler(a: string, b: string, p = 0.1): number {
  const j = jaro(a, b);
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(a.length, b.length)); i++) {
    if (a[i] === b[i]) prefix++; else break;
  }
  return j + prefix * p * (1 - j);
}

export function lcsLength(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
  }
  return dp[m][n];
}

export function lcsString(a: string, b: string): string {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
  }
  let result = '', i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i-1] === b[j-1]) { result = a[i-1] + result; i--; j--; }
    else if (dp[i-1][j] > dp[i][j-1]) i--;
    else j--;
  }
  return result;
}

export function longestCommonSubstring(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let maxLen = 0;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : 0;
    maxLen = Math.max(maxLen, dp[i][j]);
  }
  return maxLen;
}

export function normalizedLevenshtein(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return levenshtein(a, b) / maxLen;
}

export function similarity(a: string, b: string): number { return 1 - normalizedLevenshtein(a, b); }

export function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

export function commonSuffixLength(a: string, b: string): number {
  let i = a.length - 1, j = b.length - 1, count = 0;
  while (i >= 0 && j >= 0 && a[i] === b[j]) { count++; i--; j--; }
  return count;
}

function getBigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  for (let i = 0; i < s.length - 1; i++) { const bg = s[i]+s[i+1]; m.set(bg, (m.get(bg)||0)+1); }
  return m;
}

export function diceCoefficient(a: string, b: string): number {
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
  const ba = getBigrams(a), bb = getBigrams(b);
  let intersection = 0;
  for (const [bg, count] of ba) intersection += Math.min(count, bb.get(bg) || 0);
  return (2 * intersection) / (a.length - 1 + b.length - 1);
}

export function jaccardSimilarity(a: string, b: string): number {
  const sa = new Set(a.split('')), sb = new Set(b.split(''));
  let inter = 0;
  for (const c of sa) if (sb.has(c)) inter++;
  const union = new Set([...sa, ...sb]).size;
  return union === 0 ? 1 : inter / union;
}

export function cosineSimilarity(a: string, b: string): number {
  const freq = (s: string) => { const m = new Map<string, number>(); for (const c of s) m.set(c, (m.get(c)||0)+1); return m; };
  const fa = freq(a), fb = freq(b);
  let dot = 0, magA = 0, magB = 0;
  for (const [c, v] of fa) { dot += v * (fb.get(c)||0); magA += v*v; }
  for (const v of fb.values()) magB += v*v;
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function sorensenDice(a: string, b: string): number { return diceCoefficient(a, b); }

export function closest(query: string, candidates: string[], k = 1): string[] {
  return candidates.slice().sort((a, b) => levenshtein(query, a) - levenshtein(query, b)).slice(0, k);
}

export function isWithinDistance(a: string, b: string, threshold: number): boolean {
  return levenshtein(a, b) <= threshold;
}

export function smithWaterman(a: string, b: string, match = 2, mismatch = -1, gap = -1): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  let maxScore = 0;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const score = a[i-1] === b[j-1] ? match : mismatch;
    dp[i][j] = Math.max(0, dp[i-1][j-1] + score, dp[i-1][j] + gap, dp[i][j-1] + gap);
    maxScore = Math.max(maxScore, dp[i][j]);
  }
  return maxScore;
}

export function needlemanWunsch(a: string, b: string, match = 1, mismatch = -1, gap = -1): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j * gap : j === 0 ? i * gap : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const score = a[i-1] === b[j-1] ? match : mismatch;
    dp[i][j] = Math.max(dp[i-1][j-1] + score, dp[i-1][j] + gap, dp[i][j-1] + gap);
  }
  return dp[m][n];
}
