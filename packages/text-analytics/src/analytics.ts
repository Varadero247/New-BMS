// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { WordFrequency, ReadabilityScore, TextStats, SimilarityResult } from './types';

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'not', 'no', 'it',
  'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we',
  'they', 'my', 'your', 'his', 'her', 'our', 'their', 'what', 'which',
  'who', 'whom', 'how', 'when', 'where', 'why', 'as', 'if', 'so', 'up',
  'about', 'into', 'through', 'than', 'then', 'also', 'just', 'more',
  'out', 'all', 'some', 'such', 'each', 'very', 'any', 'other', 'own',
]);

export function tokenize(text: string): string[] {
  if (!text || text.trim() === '') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

export function countWords(text: string): number {
  return tokenize(text).length;
}

export function countSentences(text: string): number {
  if (!text || text.trim() === '') return 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences.length;
}

export function countParagraphs(text: string): number {
  if (!text || text.trim() === '') return 0;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return paragraphs.length;
}

export function countChars(text: string, includeSpaces = true): number {
  if (!text) return 0;
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}

export function countSyllables(word: string): number {
  if (!word || word.length === 0) return 0;
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length === 0) return 0;
  if (cleaned.length <= 3) return 1;

  const vowelGroups = cleaned
    .replace(/e$/, '')
    .match(/[aeiouy]+/g);

  const count = vowelGroups ? vowelGroups.length : 0;
  return Math.max(1, count);
}

export function wordFrequency(text: string, topN?: number): WordFrequency[] {
  const tokens = tokenize(text);
  if (tokens.length === 0) return [];

  const freq: Record<string, number> = {};
  for (const token of tokens) {
    freq[token] = (freq[token] || 0) + 1;
  }

  const total = tokens.length;
  const result: WordFrequency[] = Object.entries(freq).map(([word, count]) => ({
    word,
    count,
    frequency: count / total,
  }));

  result.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  return topN !== undefined ? result.slice(0, topN) : result;
}

export function fleschKincaid(text: string): ReadabilityScore {
  const words = tokenize(text);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, countSentences(text));

  if (wordCount === 0) {
    return { fleschKincaid: 0, avgWordsPerSentence: 0, avgSyllablesPerWord: 0 };
  }

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;

  // Flesch Reading Ease formula (inverted to grade level approximation)
  const fkScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  return {
    fleschKincaid: Math.round(fkScore * 100) / 100,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 100) / 100,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
  };
}

export function textStats(text: string): TextStats {
  const tokens = tokenize(text);
  const wordCount = tokens.length;
  const charCount = countChars(text, false);
  const sentenceCount = countSentences(text);
  const paragraphCount = countParagraphs(text);
  const avgWordLength = wordCount > 0
    ? tokens.reduce((sum, w) => sum + w.length, 0) / wordCount
    : 0;

  return {
    wordCount,
    charCount,
    sentenceCount,
    paragraphCount,
    avgWordLength: Math.round(avgWordLength * 100) / 100,
  };
}

export function extractKeywords(text: string, topN = 10): string[] {
  const tokens = tokenize(text);
  const filtered = tokens.filter(w => !STOPWORDS.has(w) && w.length > 2);

  const freq: Record<string, number> = {};
  for (const token of filtered) {
    freq[token] = (freq[token] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, topN)
    .map(([word]) => word);
}

function buildTfVector(tokens: string[]): Record<string, number> {
  const vec: Record<string, number> = {};
  for (const t of tokens) {
    vec[t] = (vec[t] || 0) + 1;
  }
  return vec;
}

export function cosineSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const vecA = buildTfVector(tokensA);
  const vecB = buildTfVector(tokensB);

  const allWords = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const word of allWords) {
    const va = vecA[word] || 0;
    const vb = vecB[word] || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }

  if (magA === 0 || magB === 0) return 0;
  return Math.round((dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 1000) / 1000;
}

export function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));

  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionSize = 0;
  for (const word of setA) {
    if (setB.has(word)) intersectionSize++;
  }

  const unionSize = setA.size + setB.size - intersectionSize;
  return Math.round((intersectionSize / unionSize) * 1000) / 1000;
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

export function similarity(a: string, b: string): SimilarityResult {
  return {
    score: cosineSimilarity(a, b),
    method: 'cosine',
  };
}

export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const cutoff = maxLength - suffix.length;
  if (cutoff <= 0) return suffix.slice(0, maxLength);
  return text.slice(0, cutoff) + suffix;
}

export function excerpt(text: string, maxWords: number): string {
  const tokens = text.trim().split(/\s+/).filter(w => w.length > 0);
  return tokens.slice(0, maxWords).join(' ');
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text
    .split(/\s+/)
    .map(word => word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : '')
    .join(' ');
}

export function camelToWords(str: string): string {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();
}

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function isPalindrome(text: string): boolean {
  if (!text) return true;
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

export function reverseWords(text: string): string {
  if (!text || text.trim() === '') return text;
  return text.trim().split(/\s+/).reverse().join(' ');
}

export function removeDuplicateWords(text: string): string {
  if (!text || text.trim() === '') return text;
  const words = text.split(/\s+/);
  const result: string[] = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      result.push(words[i]);
    }
  }
  return result.join(' ');
}

export function highlightKeywords(text: string, keywords: string[], wrapper = '*'): string {
  if (!text || keywords.length === 0) return text;
  let result = text;
  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, `${wrapper}$&${wrapper}`);
  }
  return result;
}

const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'best',
  'love', 'happy', 'joy', 'positive', 'perfect', 'superb', 'outstanding',
  'brilliant', 'beautiful', 'awesome', 'nice', 'pleasant', 'delight',
  'glad', 'pleased', 'satisfied', 'impressive', 'exceptional', 'helpful',
  'success', 'win', 'better', 'improved', 'effective', 'efficient',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'angry',
  'negative', 'poor', 'wrong', 'fail', 'failure', 'broken', 'useless',
  'disappointing', 'frustrating', 'annoying', 'dreadful', 'unacceptable',
  'inferior', 'inadequate', 'defective', 'damaged', 'harmful', 'ugly',
  'problem', 'issue', 'error', 'mistake', 'difficult', 'slow',
]);

export function sentimentScore(text: string): number {
  const tokens = tokenize(text);
  if (tokens.length === 0) return 0;

  let score = 0;
  for (const token of tokens) {
    if (POSITIVE_WORDS.has(token)) score += 1;
    else if (NEGATIVE_WORDS.has(token)) score -= 1;
  }

  // Normalize to -1 to 1 range
  const normalised = score / tokens.length;
  return Math.round(normalised * 1000) / 1000;
}
