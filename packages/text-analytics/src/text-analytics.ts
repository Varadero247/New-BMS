// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\w+/g) ?? [];
}

export function ngrams(tokens: string[], n: number): string[][] {
  const result: string[][] = [];
  for (let i = 0; i <= tokens.length - n; i++) result.push(tokens.slice(i, i + n));
  return result;
}

export function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  const total = tokens.length;
  const tf = new Map<string, number>();
  for (const [t, c] of freq) tf.set(t, c / total);
  return tf;
}

export function wordCount(text: string): number {
  return tokenize(text).length;
}

export function uniqueWords(text: string): Set<string> {
  return new Set(tokenize(text));
}

export function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [term, wa] of a) { dot += wa * (b.get(term) ?? 0); normA += wa ** 2; }
  for (const wb of b.values()) normB += wb ** 2;
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const inter = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 1 : inter.size / union.size;
}

export function sentenceCount(text: string): number {
  return (text.match(/[.!?]+/g) ?? []).length;
}

export function averageWordLength(text: string): number {
  const words = tokenize(text);
  if (!words.length) return 0;
  return words.reduce((s, w) => s + w.length, 0) / words.length;
}

export function mostCommonWords(text: string, n: number): string[] {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

export function removeStopWords(tokens: string[], stopWords: Set<string>): string[] {
  return tokens.filter(t => !stopWords.has(t));
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i || j));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}
