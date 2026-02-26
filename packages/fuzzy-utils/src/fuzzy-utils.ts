// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { EditOperation, FuzzyMatch, FuzzySearchOptions } from './types';

// ---------------------------------------------------------------------------
// Edit distance algorithms
// ---------------------------------------------------------------------------

/** Classic Levenshtein distance using DP matrix. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Use two rows to save memory
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1];
      } else {
        curr[j] = 1 + Math.min(prev[j - 1], prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** Levenshtein similarity in range [0, 1]. */
export function levenshteinSimilarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  const maxLen = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / maxLen;
}

/** Damerau-Levenshtein distance (includes transpositions as a single operation). */
export function damerauLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Full matrix needed for transpositions
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d[i] = new Array<number>(n + 1).fill(0);
    d[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // transposition
      }
    }
  }
  return d[m][n];
}

/** Hamming distance between two equal-length strings. Returns -1 if lengths differ. */
export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return -1;
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) count++;
  }
  return count;
}

/** Longest common subsequence length via DP. */
export function lcsLength(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0 || n === 0) return 0;

  let prev = new Array<number>(n + 1).fill(0);
  let curr = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** LCS-based similarity: 2 * lcsLength / (|a| + |b|). */
export function lcsSimilarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  return (2 * lcsLength(a, b)) / (a.length + b.length);
}

/** Backtrack Levenshtein DP matrix to get a list of edit operations. */
export function editOperations(a: string, b: string): EditOperation[] {
  const m = a.length;
  const n = b.length;

  // Build full DP matrix
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d[i] = new Array<number>(n + 1).fill(0);
    d[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    d[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }

  // Backtrack
  const ops: EditOperation[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] && a[i - 1] === b[j - 1]) {
      i--;
      j--;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      ops.unshift({ type: 'replace', position: i - 1, from: a[i - 1], to: b[j - 1] });
      i--;
      j--;
    } else if (j > 0 && d[i][j] === d[i][j - 1] + 1) {
      ops.unshift({ type: 'insert', position: i, to: b[j - 1] });
      j--;
    } else {
      ops.unshift({ type: 'delete', position: i - 1, from: a[i - 1] });
      i--;
    }
  }
  return ops;
}

// ---------------------------------------------------------------------------
// Jaro-Winkler
// ---------------------------------------------------------------------------

/** Jaro similarity between two strings, range [0, 1]. */
export function jaro(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matchWindow = Math.floor(Math.max(a.length, b.length) / 2) - 1;
  const safeWindow = Math.max(matchWindow, 0);

  const aMatched = new Array<boolean>(a.length).fill(false);
  const bMatched = new Array<boolean>(b.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - safeWindow);
    const end = Math.min(i + safeWindow + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatched[j] || a[i] !== b[j]) continue;
      aMatched[i] = true;
      bMatched[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatched[i]) continue;
    while (!bMatched[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  return (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;
}

/** Jaro-Winkler similarity. p is the prefix scaling factor (default 0.1). */
export function jaroWinkler(a: string, b: string, p = 0.1): number {
  const jaroScore = jaro(a, b);
  // Common prefix length (max 4)
  let prefixLen = 0;
  const maxPrefix = Math.min(4, Math.min(a.length, b.length));
  while (prefixLen < maxPrefix && a[prefixLen] === b[prefixLen]) {
    prefixLen++;
  }
  return jaroScore + prefixLen * p * (1 - jaroScore);
}

// ---------------------------------------------------------------------------
// Phonetic algorithms
// ---------------------------------------------------------------------------

const SOUNDEX_TABLE: Record<string, string> = {
  b: '1', f: '1', p: '1', v: '1',
  c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
  d: '3', t: '3',
  l: '4',
  m: '5', n: '5',
  r: '6',
};

/** American Soundex code. */
export function soundex(word: string): string {
  if (!word) return '';
  const upper = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (!upper) return '';

  const first = upper[0];
  let code = first;
  let prev = SOUNDEX_TABLE[first.toLowerCase()] ?? '0';

  for (let i = 1; i < upper.length && code.length < 4; i++) {
    const ch = upper[i].toLowerCase();
    // H and W are ignored (don't break adjacency)
    if (ch === 'h' || ch === 'w') continue;
    const digit = SOUNDEX_TABLE[ch] ?? '0';
    if (digit !== '0' && digit !== prev) {
      code += digit;
    }
    prev = digit;
  }

  return code.padEnd(4, '0');
}

/** Returns true if both words have the same Soundex code. */
export function soundexSimilar(a: string, b: string): boolean {
  return soundex(a) === soundex(b);
}

/** Simplified Metaphone encoding. */
export function metaphone(word: string): string {
  if (!word) return '';
  let s = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';

  // Drop initial silent letters
  s = s.replace(/^AE/, 'E');
  s = s.replace(/^GN/, 'N');
  s = s.replace(/^KN/, 'N');
  s = s.replace(/^PN/, 'N');
  s = s.replace(/^PS/, 'S');
  s = s.replace(/^WR/, 'R');

  let result = '';
  const vowels = new Set(['A', 'E', 'I', 'O', 'U']);

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const prev = i > 0 ? s[i - 1] : '';
    const next = i + 1 < s.length ? s[i + 1] : '';
    const next2 = i + 2 < s.length ? s[i + 2] : '';

    // Drop duplicate adjacent letters (except C)
    if (ch !== 'C' && ch === prev) continue;

    if (vowels.has(ch)) {
      // Vowels only kept if they're the first letter
      if (i === 0) result += ch;
      continue;
    }

    switch (ch) {
      case 'B':
        // Silent B after M at end
        if (prev === 'M' && i === s.length - 1) break;
        result += 'B';
        break;
      case 'C':
        if (next === 'I' || next === 'E' || next === 'Y') {
          result += 'S';
        } else if (next === 'H') {
          result += 'X';
          i++;
        } else if (next === 'K') {
          // CK → K
          result += 'K';
          i++;
        } else {
          result += 'K';
        }
        break;
      case 'D':
        if (next === 'G' && (next2 === 'I' || next2 === 'E' || next2 === 'Y')) {
          result += 'J';
          i++;
        } else {
          result += 'T';
        }
        break;
      case 'F':
        result += 'F';
        break;
      case 'G':
        if (next === 'H') {
          if (i === 0 || !vowels.has(prev)) {
            i++;
            break;
          }
          // GH at end → K
          if (i + 2 >= s.length) {
            result += 'K';
            i++;
          } else {
            i++;
          }
          break;
        }
        if (next === 'N') {
          if (i + 2 === s.length) break; // silent GN at end
        }
        if (prev === 'G') break;
        if (next === 'E' || next === 'I' || next === 'Y') {
          result += 'J';
        } else {
          result += 'K';
        }
        break;
      case 'H':
        // H before vowel and not after vowel
        if (vowels.has(next) && !vowels.has(prev)) {
          result += 'H';
        }
        break;
      case 'J':
        result += 'J';
        break;
      case 'K':
        if (prev !== 'C') result += 'K';
        break;
      case 'L':
        result += 'L';
        break;
      case 'M':
        result += 'M';
        break;
      case 'N':
        result += 'N';
        break;
      case 'P':
        if (next === 'H') {
          result += 'F';
          i++;
        } else {
          result += 'P';
        }
        break;
      case 'Q':
        result += 'K';
        break;
      case 'R':
        result += 'R';
        break;
      case 'S':
        if (next === 'H' || (next === 'I' && (next2 === 'O' || next2 === 'A'))) {
          result += 'X';
          if (next === 'H') i++;
        } else if (next === 'C' && next2 === 'H') {
          result += 'SK';
          i += 2;
        } else {
          result += 'S';
        }
        break;
      case 'T':
        if (next === 'H') {
          result += '0'; // theta
          i++;
        } else if (next === 'I' && (next2 === 'A' || next2 === 'O')) {
          result += 'X';
        } else {
          result += 'T';
        }
        break;
      case 'V':
        result += 'F';
        break;
      case 'W':
        if (vowels.has(next)) result += 'W';
        break;
      case 'X':
        result += 'KS';
        break;
      case 'Y':
        if (vowels.has(next)) result += 'Y';
        break;
      case 'Z':
        result += 'S';
        break;
      default:
        break;
    }
  }
  return result;
}

/** Simplified Double Metaphone — returns [primary, alternate]. */
export function doubleMetaphone(word: string): [string, string] {
  const primary = metaphone(word);
  // Alternate code: apply a few alternate rules on top of the primary
  let alternate = primary;

  // Simple alternation heuristics
  alternate = alternate.replace(/^X/, 'S');   // initial X sound can be S
  alternate = alternate.replace(/0/g, 'T');   // theta → T as alternate
  alternate = alternate.replace(/J/g, 'Y');   // J → Y alternate

  if (alternate === primary) {
    // Produce a meaningful second code by applying a second set of substitutions
    alternate = primary
      .replace(/K/g, 'C')
      .replace(/F/g, 'V')
      .replace(/S/g, 'Z');
  }

  return [primary, alternate];
}

// ---------------------------------------------------------------------------
// Token-based similarity
// ---------------------------------------------------------------------------

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/\s+/).filter(t => t.length > 0);
}

/** Sort tokens then compute levenshteinSimilarity. */
export function tokenSort(a: string, b: string): number {
  const sortedA = tokenize(a).sort().join(' ');
  const sortedB = tokenize(b).sort().join(' ');
  return levenshteinSimilarity(sortedA, sortedB);
}

/** Token set ratio: intersection + sorted remainder approach. */
export function tokenSet(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));

  const intersection: string[] = [];
  const onlyA: string[] = [];
  const onlyB: string[] = [];

  for (const t of setA) {
    if (setB.has(t)) intersection.push(t);
    else onlyA.push(t);
  }
  for (const t of setB) {
    if (!setA.has(t)) onlyB.push(t);
  }

  intersection.sort();
  onlyA.sort();
  onlyB.sort();

  const base = intersection.join(' ');
  const s1 = [base, ...onlyA].join(' ').trim();
  const s2 = [base, ...onlyB].join(' ').trim();
  const s3 = [...intersection, ...onlyA, ...onlyB].join(' ').trim();

  return Math.max(
    levenshteinSimilarity(base, s1),
    levenshteinSimilarity(base, s2),
    levenshteinSimilarity(s1, s2),
    levenshteinSimilarity(s1, s3),
    levenshteinSimilarity(s2, s3)
  );
}

/** Token overlap: |intersection| / min(|A|, |B|). */
export function tokenOverlap(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionSize = 0;
  for (const t of setA) {
    if (setB.has(t)) intersectionSize++;
  }
  return intersectionSize / Math.min(setA.size, setB.size);
}

/** N-gram similarity (default bigrams). */
export function ngramSimilarity(a: string, b: string, n = 2): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length < n && b.length < n) return a.toLowerCase() === b.toLowerCase() ? 1 : 0;
  if (a.length < n || b.length < n) return 0;

  const getNgrams = (s: string): Map<string, number> => {
    const lower = s.toLowerCase();
    const map = new Map<string, number>();
    for (let i = 0; i <= lower.length - n; i++) {
      const gram = lower.slice(i, i + n);
      map.set(gram, (map.get(gram) ?? 0) + 1);
    }
    return map;
  };

  const gramsA = getNgrams(a);
  const gramsB = getNgrams(b);

  let intersection = 0;
  for (const [gram, countA] of gramsA) {
    const countB = gramsB.get(gram) ?? 0;
    intersection += Math.min(countA, countB);
  }

  const totalA = a.length - n + 1;
  const totalB = b.length - n + 1;
  return (2 * intersection) / (totalA + totalB);
}

/** TF cosine similarity on character trigrams. */
export function cosineSimilarity(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const n = 3;
  const getTf = (s: string): Map<string, number> => {
    const lower = s.toLowerCase();
    const map = new Map<string, number>();
    if (lower.length < n) {
      // Fallback to unigrams
      for (const ch of lower) {
        map.set(ch, (map.get(ch) ?? 0) + 1);
      }
      return map;
    }
    for (let i = 0; i <= lower.length - n; i++) {
      const gram = lower.slice(i, i + n);
      map.set(gram, (map.get(gram) ?? 0) + 1);
    }
    return map;
  };

  const tfA = getTf(a);
  const tfB = getTf(b);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const [gram, freqA] of tfA) {
    const freqB = tfB.get(gram) ?? 0;
    dot += freqA * freqB;
    magA += freqA * freqA;
  }
  for (const [, freqB] of tfB) {
    magB += freqB * freqB;
  }

  if (magA === 0 || magB === 0) return 0;
  return Math.min(1, dot / (Math.sqrt(magA) * Math.sqrt(magB)));
}

// ---------------------------------------------------------------------------
// Fuzzy search
// ---------------------------------------------------------------------------

/** Search array of strings or objects. Returns sorted matches above threshold. */
export function fuzzySearch<T>(
  query: string,
  items: T[],
  options: FuzzySearchOptions & { key?: keyof T } = {}
): FuzzyMatch<T>[] {
  const threshold = options.threshold ?? 0.5;
  const limit = options.limit ?? items.length;
  const caseSensitive = options.caseSensitive ?? false;
  const key = options.key;

  const normalizedQuery = caseSensitive ? query : query.toLowerCase();

  const results: FuzzyMatch<T>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let target: string;

    if (key !== undefined) {
      target = String((item as Record<string, unknown>)[key as string] ?? '');
    } else if (typeof item === 'string') {
      target = item;
    } else {
      target = String(item);
    }

    const normalizedTarget = caseSensitive ? target : target.toLowerCase();
    const score = jaroWinkler(normalizedQuery, normalizedTarget);

    if (score >= threshold) {
      results.push({ item, score, index: i });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/** Quick boolean check: jaroWinkler >= threshold. */
export function fuzzyMatch(query: string, target: string, threshold = 0.5): boolean {
  return jaroWinkler(query.toLowerCase(), target.toLowerCase()) >= threshold;
}

/** Returns the highest-scoring match, or null if no candidates. */
export function bestMatch(query: string, candidates: string[]): FuzzyMatch | null {
  if (candidates.length === 0) return null;
  const results = fuzzySearch(query, candidates, { threshold: 0 });
  return results.length > 0 ? results[0] : null;
}

/** Rank all candidates by score descending. */
export function rankMatches(query: string, candidates: string[]): FuzzyMatch[] {
  return fuzzySearch(query, candidates, { threshold: 0 });
}

// ---------------------------------------------------------------------------
// String comparison utilities
// ---------------------------------------------------------------------------

/** Returns true if a and b are anagrams (case-insensitive, ignoring spaces). */
export function areAnagrams(a: string, b: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/\s/g, '').split('').sort().join('');
  return normalize(a) === normalize(b);
}

/** Longest common substring (the actual string, not just the length). */
export function longestCommonSubstring(a: string, b: string): string {
  if (a.length === 0 || b.length === 0) return '';

  let maxLen = 0;
  let endIdx = 0;
  const m = a.length;
  const n = b.length;

  // DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

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

/** Common prefix of two strings. */
export function commonPrefix(a: string, b: string): string {
  let i = 0;
  const len = Math.min(a.length, b.length);
  while (i < len && a[i] === b[i]) i++;
  return a.slice(0, i);
}

/** Common suffix of two strings. */
export function commonSuffix(a: string, b: string): string {
  let i = a.length - 1;
  let j = b.length - 1;
  let count = 0;
  while (i >= 0 && j >= 0 && a[i] === b[j]) {
    count++;
    i--;
    j--;
  }
  return a.slice(a.length - count);
}

/**
 * Returns true if abbreviation is a valid initialism of target
 * (each character of the abbreviation appears in order in the target).
 */
export function abbreviationMatch(abbreviation: string, target: string): boolean {
  const abbr = abbreviation.toLowerCase();
  const tgt = target.toLowerCase();
  let ai = 0;
  for (let ti = 0; ti < tgt.length && ai < abbr.length; ti++) {
    if (tgt[ti] === abbr[ai]) ai++;
  }
  return ai === abbr.length;
}

/**
 * Normalize a string for comparison:
 * lowercase, strip accent-like characters, remove punctuation, collapse whitespace.
 */
export function normalizeForComparison(s: string): string {
  // Replace common accented characters
  const accentMap: Record<string, string> = {
    à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a',
    è: 'e', é: 'e', ê: 'e', ë: 'e',
    ì: 'i', í: 'i', î: 'i', ï: 'i',
    ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
    ù: 'u', ú: 'u', û: 'u', ü: 'u',
    ý: 'y', ÿ: 'y',
    ñ: 'n', ç: 'c',
    À: 'a', Á: 'a', Â: 'a', Ã: 'a', Ä: 'a', Å: 'a',
    È: 'e', É: 'e', Ê: 'e', Ë: 'e',
    Ì: 'i', Í: 'i', Î: 'i', Ï: 'i',
    Ò: 'o', Ó: 'o', Ô: 'o', Õ: 'o', Ö: 'o',
    Ù: 'u', Ú: 'u', Û: 'u', Ü: 'u',
    Ý: 'y', Ñ: 'n', Ç: 'c',
  };

  let result = s.toLowerCase();
  for (const [accent, plain] of Object.entries(accentMap)) {
    result = result.split(accent).join(plain);
  }

  // Remove punctuation
  result = result.replace(/[^\w\s]/g, '');
  // Collapse whitespace
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}
