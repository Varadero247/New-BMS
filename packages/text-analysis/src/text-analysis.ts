// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
export function charCount(text: string, includeSpaces = true): number {
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}
export function sentenceCount(text: string): number {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : 0;
}
export function paragraphCount(text: string): number {
  return text.split(/\n\s*\n/).filter(p => p.trim()).length;
}
export function averageWordLength(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w);
  if (!words.length) return 0;
  return words.reduce((s, w) => s + w.replace(/[^a-zA-Z]/g,'').length, 0) / words.length;
}
export function fleschReadingEase(text: string): number {
  const words = wordCount(text), sents = Math.max(1, sentenceCount(text));
  const syllables = text.trim().split(/\s+/).reduce((s, w) => s + countSyllables(w), 0);
  return 206.835 - 1.015*(words/sents) - 84.6*(syllables/words);
}
export function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  const m = word.match(/[aeiouy]+/g);
  return Math.max(1, m ? m.length : 1);
}
export function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).filter(t => t);
}
export function ngrams(tokens: string[], n: number): string[][] {
  const result: string[][] = [];
  for (let i = 0; i <= tokens.length - n; i++) result.push(tokens.slice(i, i+n));
  return result;
}
export function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  const total = tokens.length;
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  for (const [k,v] of freq) freq.set(k, v/total);
  return freq;
}
export function topKeywords(text: string, n = 10, stopWords?: Set<string>): string[] {
  const stops = stopWords ?? new Set(['the','a','an','is','it','in','of','to','and','or','but','for','on','at','by','with','as','be','was','are','were','has','have']);
  const tokens = tokenize(text).filter(t => !stops.has(t));
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return [...freq.entries()].sort((a,b) => b[1]-a[1]).slice(0,n).map(([k]) => k);
}
export function simpleSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const pos = new Set(['good','great','excellent','amazing','wonderful','best','happy','love','perfect','fantastic']);
  const neg = new Set(['bad','terrible','awful','horrible','worst','hate','poor','disappointing','ugly','sad']);
  const tokens = tokenize(text);
  let score = 0;
  for (const t of tokens) { if (pos.has(t)) score++; else if (neg.has(t)) score--; }
  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
}
export function excerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
export function countOccurrences(text: string, search: string, caseSensitive = false): number {
  if (!search) return 0;
  const t = caseSensitive ? text : text.toLowerCase();
  const s = caseSensitive ? search : search.toLowerCase();
  let count = 0, pos = 0;
  while ((pos = t.indexOf(s, pos)) !== -1) { count++; pos += s.length; }
  return count;
}
export function highlightKeyword(text: string, keyword: string): string {
  const re = new RegExp(`(${keyword})`, 'gi');
  return text.replace(re, '[$1]');
}
export function removeDuplicateWords(text: string): string {
  return text.split(/\s+/).filter((w,i,a) => a.indexOf(w) === i).join(' ');
}
export function readabilityLevel(score: number): string {
  if (score >= 90) return 'very easy';
  if (score >= 70) return 'easy';
  if (score >= 50) return 'standard';
  if (score >= 30) return 'difficult';
  return 'very difficult';
}
