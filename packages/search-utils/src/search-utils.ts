// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  SearchDocument,
  SearchResult,
  IndexOptions,
  QueryToken,
  SearchOptions,
  IndexStats,
} from './types';

// ---------------------------------------------------------------------------
// Stop words
// ---------------------------------------------------------------------------

export const STOP_WORDS: string[] = [
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'that', 'this',
  'these', 'those', 'it', 'its', 'which', 'who', 'whom', 'what', 'when', 'where',
  'how', 'if', 'then', 'than', 'so', 'as', 'not', 'no', 'nor', 'neither', 'either',
  'both', 'each', 'every', 'all', 'some', 'any', 'few', 'more', 'most', 'other',
  'such', 'own', 'same', 'just', 'because', 'while', 'although', 'though', 'since',
  'unless', 'until', 'whether', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him',
  'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their',
];

// ---------------------------------------------------------------------------
// Porter Stemmer (5-step algorithm)
// ---------------------------------------------------------------------------

function consonant(word: string, i: number): boolean {
  const c = word[i];
  if (c === 'a' || c === 'e' || c === 'i' || c === 'o' || c === 'u') return false;
  if (c === 'y') return i === 0 || !consonant(word, i - 1);
  return true;
}

function measure(word: string): number {
  let n = 0;
  let i = 0;
  const len = word.length;
  // skip initial consonant cluster
  while (i < len && consonant(word, i)) i++;
  while (i < len) {
    // vowel sequence
    while (i < len && !consonant(word, i)) i++;
    if (i >= len) break;
    n++;
    // consonant sequence
    while (i < len && consonant(word, i)) i++;
  }
  return n;
}

function hasVowel(word: string): boolean {
  for (let i = 0; i < word.length; i++) {
    if (!consonant(word, i)) return true;
  }
  return false;
}

function endsDoubleConsonant(word: string): boolean {
  const len = word.length;
  if (len < 2) return false;
  if (word[len - 1] !== word[len - 2]) return false;
  return consonant(word, len - 1);
}

function endsCvc(word: string): boolean {
  const len = word.length;
  if (len < 3) return false;
  const c = word[len - 1];
  if (c === 'w' || c === 'x' || c === 'y') return false;
  return consonant(word, len - 1) && !consonant(word, len - 2) && consonant(word, len - 3);
}

function step1a(word: string): string {
  if (word.endsWith('sses')) return word.slice(0, -2);
  if (word.endsWith('ies')) return word.slice(0, -2);
  if (word.endsWith('ss')) return word;
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}

function step1b(word: string): string {
  if (word.endsWith('eed')) {
    const stem = word.slice(0, -3);
    if (measure(stem) > 0) return stem + 'ee';
    return word;
  }
  if (word.endsWith('ed')) {
    const stem = word.slice(0, -2);
    if (hasVowel(stem)) {
      word = stem;
      return step1bFix(word);
    }
    return word;
  }
  if (word.endsWith('ing')) {
    const stem = word.slice(0, -3);
    if (hasVowel(stem)) {
      word = stem;
      return step1bFix(word);
    }
    return word;
  }
  return word;
}

function step1bFix(word: string): string {
  if (word.endsWith('at') || word.endsWith('bl') || word.endsWith('iz')) return word + 'e';
  if (endsDoubleConsonant(word)) {
    const last = word[word.length - 1];
    if (last !== 'l' && last !== 's' && last !== 'z') return word.slice(0, -1);
  }
  if (measure(word) === 1 && endsCvc(word)) return word + 'e';
  return word;
}

function step1c(word: string): string {
  if (word.endsWith('y') && hasVowel(word.slice(0, -1))) {
    return word.slice(0, -1) + 'i';
  }
  return word;
}

const step2Map: [string, string][] = [
  ['ational', 'ate'], ['tional', 'tion'], ['enci', 'ence'], ['anci', 'ance'],
  ['izer', 'ize'], ['abli', 'able'], ['alli', 'al'], ['entli', 'ent'],
  ['eli', 'e'], ['ousli', 'ous'], ['ization', 'ize'], ['ation', 'ate'],
  ['ator', 'ate'], ['alism', 'al'], ['iveness', 'ive'], ['fulness', 'ful'],
  ['ousness', 'ous'], ['aliti', 'al'], ['iviti', 'ive'], ['biliti', 'ble'],
];

function step2(word: string): string {
  for (const [suffix, replacement] of step2Map) {
    if (word.endsWith(suffix)) {
      const stem = word.slice(0, -suffix.length);
      if (measure(stem) > 0) return stem + replacement;
      return word;
    }
  }
  return word;
}

const step3Map: [string, string][] = [
  ['icate', 'ic'], ['ative', ''], ['alize', 'al'], ['iciti', 'ic'],
  ['ical', 'ic'], ['ful', ''], ['ness', ''],
];

function step3(word: string): string {
  for (const [suffix, replacement] of step3Map) {
    if (word.endsWith(suffix)) {
      const stem = word.slice(0, -suffix.length);
      if (measure(stem) > 0) return stem + replacement;
      return word;
    }
  }
  return word;
}

const step4Suffixes: string[] = [
  'ement', 'ment', 'ance', 'ence', 'able', 'ible', 'ant', 'ent', 'ism',
  'ate', 'iti', 'ous', 'ive', 'ize', 'ion', 'al', 'er', 'ic', 'ou',
];

function step4(word: string): string {
  for (const suffix of step4Suffixes) {
    if (word.endsWith(suffix)) {
      const stem = word.slice(0, -suffix.length);
      if (suffix === 'ion') {
        if (measure(stem) > 1 && (stem.endsWith('s') || stem.endsWith('t'))) {
          return stem;
        }
        return word;
      }
      if (measure(stem) > 1) return stem;
      return word;
    }
  }
  return word;
}

function step5a(word: string): string {
  if (word.endsWith('e')) {
    const stem = word.slice(0, -1);
    const m = measure(stem);
    if (m > 1) return stem;
    if (m === 1 && !endsCvc(stem)) return stem;
  }
  return word;
}

function step5b(word: string): string {
  if (measure(word) > 1 && endsDoubleConsonant(word) && word.endsWith('l')) {
    return word.slice(0, -1);
  }
  return word;
}

export function stem(word: string): string {
  if (word.length <= 2) return word;
  let w = word.toLowerCase();
  w = step1a(w);
  w = step1b(w);
  w = step1c(w);
  w = step2(w);
  w = step3(w);
  w = step4(w);
  w = step5a(w);
  w = step5b(w);
  return w;
}

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(
  text: string,
  options?: { stopWords?: string[]; stemming?: boolean; caseSensitive?: boolean },
): string[] {
  const caseSensitive = options?.caseSensitive ?? false;
  const normalized = caseSensitive ? text.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim() : normalizeText(text);
  const raw = normalized.split(' ').filter(Boolean);

  const stopSet = new Set<string>(
    options?.stopWords !== undefined ? options.stopWords.map(s => s.toLowerCase()) : STOP_WORDS,
  );

  let tokens = raw.filter(t => {
    const check = caseSensitive ? t.toLowerCase() : t;
    return !stopSet.has(check) && t.length > 0;
  });

  if (options?.stemming) {
    tokens = tokens.map(t => stem(t));
  }

  return tokens;
}

export function ngrams(text: string, n: number): string[] {
  if (n <= 0 || text.length < n) return [];
  const result: string[] = [];
  for (let i = 0; i <= text.length - n; i++) {
    result.push(text.slice(i, i + n));
  }
  return result;
}

export function wordNgrams(tokens: string[], n: number): string[] {
  if (n <= 0 || tokens.length < n) return [];
  const result: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join(' '));
  }
  return result;
}

export function termFrequency(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tokens) {
    map.set(t, (map.get(t) ?? 0) + 1);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export function tfidf(tf: number, df: number, n: number): number {
  if (df <= 0 || n <= 0 || tf <= 0) return 0;
  return tf * Math.log(n / df);
}

export function bm25Score(
  tf: number,
  df: number,
  n: number,
  dl: number,
  avgdl: number,
  k1 = 1.5,
  b = 0.75,
): number {
  if (df <= 0 || n <= 0 || tf <= 0) return 0;
  const idf = Math.log((n - df + 0.5) / (df + 0.5) + 1);
  const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / (avgdl || 1))));
  return idf * tfNorm;
}

// ---------------------------------------------------------------------------
// Inverted Index
// ---------------------------------------------------------------------------

interface PostingEntry {
  tf: number;
  positions: number[];
  fieldTfs: Map<string, number>;
}

export class InvertedIndex<T extends SearchDocument> {
  private options: Required<IndexOptions>;
  // term → docId → posting
  private index: Map<string, Map<string, PostingEntry>>;
  // docId → document
  private docs: Map<string, T>;
  // docId → token count
  private docLengths: Map<string, number>;

  constructor(options?: IndexOptions) {
    this.options = {
      fields: options?.fields ?? [],
      stopWords: options?.stopWords ?? STOP_WORDS,
      stemming: options?.stemming ?? false,
      caseSensitive: options?.caseSensitive ?? false,
    };
    this.index = new Map();
    this.docs = new Map();
    this.docLengths = new Map();
  }

  private tokenizeDoc(doc: T): { allTokens: string[]; fieldTokens: Map<string, string[]> } {
    const fieldTokens = new Map<string, string[]>();
    const allTokens: string[] = [];
    const fields = this.options.fields.length > 0 ? this.options.fields : Object.keys(doc).filter(k => k !== 'id');

    for (const field of fields) {
      const val = doc[field];
      if (val == null) continue;
      const text = String(val);
      const toks = tokenize(text, {
        stopWords: this.options.stopWords,
        stemming: this.options.stemming,
        caseSensitive: this.options.caseSensitive,
      });
      fieldTokens.set(field, toks);
      allTokens.push(...toks);
    }
    return { allTokens, fieldTokens };
  }

  add(doc: T): void {
    const { allTokens, fieldTokens } = this.tokenizeDoc(doc);
    this.docs.set(doc.id, doc);
    this.docLengths.set(doc.id, allTokens.length);

    for (let pos = 0; pos < allTokens.length; pos++) {
      const term = allTokens[pos];
      if (!this.index.has(term)) this.index.set(term, new Map());
      const postings = this.index.get(term)!;
      if (!postings.has(doc.id)) {
        postings.set(doc.id, { tf: 0, positions: [], fieldTfs: new Map() });
      }
      const entry = postings.get(doc.id)!;
      entry.tf++;
      entry.positions.push(pos);
    }

    // Field-level TF
    for (const [field, toks] of fieldTokens) {
      const ftf = termFrequency(toks);
      for (const [term, count] of ftf) {
        if (!this.index.has(term)) this.index.set(term, new Map());
        const postings = this.index.get(term)!;
        if (!postings.has(doc.id)) {
          postings.set(doc.id, { tf: 0, positions: [], fieldTfs: new Map() });
        }
        const entry = postings.get(doc.id)!;
        entry.fieldTfs.set(field, (entry.fieldTfs.get(field) ?? 0) + count);
      }
    }
  }

  addBatch(docs: T[]): void {
    for (const doc of docs) this.add(doc);
  }

  remove(id: string): void {
    if (!this.docs.has(id)) return;
    this.docs.delete(id);
    this.docLengths.delete(id);
    for (const postings of this.index.values()) {
      postings.delete(id);
    }
    // Clean up empty postings
    for (const [term, postings] of this.index) {
      if (postings.size === 0) this.index.delete(term);
    }
  }

  update(doc: T): void {
    this.remove(doc.id);
    this.add(doc);
  }

  has(id: string): boolean {
    return this.docs.has(id);
  }

  getDocument(id: string): T | undefined {
    return this.docs.get(id);
  }

  getStats(): IndexStats {
    const documentCount = this.docs.size;
    const termCount = this.index.size;
    const lengths = Array.from(this.docLengths.values());
    const avgDocLength = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
    return { documentCount, termCount, avgDocLength };
  }

  getTerms(): string[] {
    return Array.from(this.index.keys());
  }

  getPostings(term: string): Map<string, number> {
    const postings = this.index.get(term);
    if (!postings) return new Map();
    const result = new Map<string, number>();
    for (const [docId, entry] of postings) {
      result.set(docId, entry.tf);
    }
    return result;
  }

  /** @internal — used by scoring functions */
  _getPostingEntry(term: string, docId: string): PostingEntry | undefined {
    return this.index.get(term)?.get(docId);
  }

  _getDocLength(docId: string): number {
    return this.docLengths.get(docId) ?? 0;
  }

  _getAllDocIds(): string[] {
    return Array.from(this.docs.keys());
  }

  clear(): void {
    this.index.clear();
    this.docs.clear();
    this.docLengths.clear();
  }
}

// ---------------------------------------------------------------------------
// TF-IDF on index
// ---------------------------------------------------------------------------

export function computeTfIdf(
  index: InvertedIndex<SearchDocument>,
  docId: string,
  term: string,
): number {
  const postings = index.getPostings(term);
  const tf = postings.get(docId) ?? 0;
  const df = postings.size;
  const n = index.getStats().documentCount;
  return tfidf(tf, df, n);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export function search<T extends SearchDocument>(
  index: InvertedIndex<T>,
  query: string,
  options?: SearchOptions,
): SearchResult<T>[] {
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;
  const fuzzy = options?.fuzzy ?? false;

  const queryTokens = tokenize(query, { stopWords: STOP_WORDS, stemming: false });
  if (queryTokens.length === 0) return [];

  const stats = index.getStats();
  const n = stats.documentCount;
  const avgdl = stats.avgDocLength;

  const scores = new Map<string, number>();

  for (const term of queryTokens) {
    let postings = index.getPostings(term);

    // Fuzzy fallback: prefix/substring matching
    if (postings.size === 0 && fuzzy) {
      for (const indexTerm of index.getTerms()) {
        if (indexTerm.startsWith(term) || indexTerm.includes(term)) {
          const p = index.getPostings(indexTerm);
          for (const [docId, tf] of p) {
            const df = p.size;
            const dl = (index as InvertedIndex<SearchDocument>)._getDocLength(docId);
            const s = bm25Score(tf, df, n, dl, avgdl) * 0.5; // penalty for fuzzy
            scores.set(docId, (scores.get(docId) ?? 0) + s);
          }
        }
      }
      continue;
    }

    const df = postings.size;
    for (const [docId, tf] of postings) {
      const dl = (index as InvertedIndex<SearchDocument>)._getDocLength(docId);
      const s = bm25Score(tf, df, n, dl, avgdl);
      scores.set(docId, (scores.get(docId) ?? 0) + s);
    }
  }

  let results = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(offset, offset + limit)
    .map(([docId, score]) => {
      const document = index.getDocument(docId)!;
      const result: SearchResult<T> = { document, score };
      if (options?.highlight) {
        result.highlights = {};
        for (const [field, val] of Object.entries(document)) {
          if (typeof val === 'string') {
            result.highlights[field] = highlight(val, queryTokens);
          }
        }
      }
      return result;
    });

  return results;
}

export function searchMultiField<T extends SearchDocument>(
  index: InvertedIndex<T>,
  query: string,
  fieldBoosts?: Record<string, number>,
  options?: SearchOptions,
): SearchResult<T>[] {
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  const queryTokens = tokenize(query, { stopWords: STOP_WORDS, stemming: false });
  if (queryTokens.length === 0) return [];

  const stats = index.getStats();
  const n = stats.documentCount;
  const avgdl = stats.avgDocLength;

  const scores = new Map<string, number>();

  for (const term of queryTokens) {
    const postings = index.getPostings(term);
    const df = postings.size;

    for (const [docId, tf] of postings) {
      const dl = (index as InvertedIndex<SearchDocument>)._getDocLength(docId);
      let baseScore = bm25Score(tf, df, n, dl, avgdl);

      // Apply field boosts
      if (fieldBoosts) {
        const entry = (index as InvertedIndex<SearchDocument>)._getPostingEntry(term, docId);
        if (entry) {
          let boostMultiplier = 1;
          for (const [field, boost] of Object.entries(fieldBoosts)) {
            if ((entry.fieldTfs.get(field) ?? 0) > 0) {
              boostMultiplier = Math.max(boostMultiplier, boost);
            }
          }
          baseScore *= boostMultiplier;
        }
      }

      scores.set(docId, (scores.get(docId) ?? 0) + baseScore);
    }
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(offset, offset + limit)
    .map(([docId, score]) => ({ document: index.getDocument(docId)!, score }));
}

// ---------------------------------------------------------------------------
// Query parsing
// ---------------------------------------------------------------------------

export function parseQuery(query: string): QueryToken[] {
  const tokens: QueryToken[] = [];
  let i = 0;
  const s = query.trim();

  while (i < s.length) {
    // skip whitespace
    while (i < s.length && s[i] === ' ') i++;
    if (i >= s.length) break;

    // Phrase
    if (s[i] === '"') {
      i++;
      let phrase = '';
      while (i < s.length && s[i] !== '"') { phrase += s[i++]; }
      if (s[i] === '"') i++;
      if (phrase) tokens.push({ type: 'phrase', value: phrase.trim() });
      continue;
    }

    // Must (+) or must_not (-)
    if (s[i] === '+') {
      i++;
      let term = '';
      while (i < s.length && s[i] !== ' ') { term += s[i++]; }
      if (term) tokens.push({ type: 'must', value: term.toLowerCase() });
      continue;
    }

    if (s[i] === '-') {
      i++;
      let term = '';
      while (i < s.length && s[i] !== ' ') { term += s[i++]; }
      if (term) tokens.push({ type: 'must_not', value: term.toLowerCase() });
      continue;
    }

    // Plain term or wildcard
    let term = '';
    while (i < s.length && s[i] !== ' ') { term += s[i++]; }
    if (term) {
      if (term.endsWith('*')) {
        tokens.push({ type: 'wildcard', value: term.slice(0, -1).toLowerCase() });
      } else {
        tokens.push({ type: 'term', value: term.toLowerCase() });
      }
    }
  }

  return tokens;
}

export function executeQuery<T extends SearchDocument>(
  index: InvertedIndex<T>,
  tokens: QueryToken[],
  options?: SearchOptions,
): SearchResult<T>[] {
  const limit = options?.limit ?? 10;
  const offset = options?.offset ?? 0;

  const stats = index.getStats();
  const n = stats.documentCount;
  const avgdl = stats.avgDocLength;

  const mustTerms = tokens.filter(t => t.type === 'must').map(t => t.value);
  const mustNotTerms = tokens.filter(t => t.type === 'must_not').map(t => t.value);
  const plainTerms = tokens.filter(t => t.type === 'term').map(t => t.value);
  const wildcardTokens = tokens.filter(t => t.type === 'wildcard').map(t => t.value);
  const phrases = tokens.filter(t => t.type === 'phrase').map(t => t.value);

  // Collect candidate docs
  const scores = new Map<string, number>();

  const scoreTerms = [...mustTerms, ...plainTerms];
  for (const term of scoreTerms) {
    const postings = index.getPostings(term);
    const df = postings.size;
    for (const [docId, tf] of postings) {
      const dl = (index as InvertedIndex<SearchDocument>)._getDocLength(docId);
      const s = bm25Score(tf, df, n, dl, avgdl);
      scores.set(docId, (scores.get(docId) ?? 0) + s);
    }
  }

  // Wildcard matching
  for (const prefix of wildcardTokens) {
    for (const indexTerm of index.getTerms()) {
      if (indexTerm.startsWith(prefix)) {
        const postings = index.getPostings(indexTerm);
        const df = postings.size;
        for (const [docId, tf] of postings) {
          const dl = (index as InvertedIndex<SearchDocument>)._getDocLength(docId);
          const s = bm25Score(tf, df, n, dl, avgdl);
          scores.set(docId, (scores.get(docId) ?? 0) + s);
        }
      }
    }
  }

  // If no scoring terms, include all docs
  if (scoreTerms.length === 0 && wildcardTokens.length === 0 && phrases.length > 0) {
    for (const docId of (index as InvertedIndex<SearchDocument>)._getAllDocIds()) {
      if (!scores.has(docId)) scores.set(docId, 1);
    }
  }

  // Must filter: keep only docs that contain all must terms
  const mustPostingSets = mustTerms.map(t => index.getPostings(t));
  const excludeIds = new Set<string>();

  for (const [docId] of scores) {
    // Check must terms
    for (const postings of mustPostingSets) {
      if (!postings.has(docId)) { excludeIds.add(docId); break; }
    }
    // Check must_not terms
    for (const term of mustNotTerms) {
      const postings = index.getPostings(term);
      if (postings.has(docId)) { excludeIds.add(docId); break; }
    }
  }

  // Phrase matching: check subsequence in doc
  for (const [docId] of scores) {
    if (excludeIds.has(docId)) continue;
    const doc = index.getDocument(docId);
    if (!doc) continue;
    for (const phrase of phrases) {
      const phraseTokens = phrase.toLowerCase().split(/\s+/);
      let docText = '';
      for (const val of Object.values(doc)) {
        if (typeof val === 'string') docText += ' ' + val.toLowerCase();
      }
      // Check if phrase tokens appear in order in docText
      let pos = 0;
      for (const pt of phraseTokens) {
        const idx = docText.indexOf(pt, pos);
        if (idx === -1) { excludeIds.add(docId); break; }
        pos = idx + pt.length;
      }
    }
  }

  return Array.from(scores.entries())
    .filter(([docId]) => !excludeIds.has(docId))
    .sort((a, b) => b[1] - a[1])
    .slice(offset, offset + limit)
    .map(([docId, score]) => ({ document: index.getDocument(docId)!, score }));
}

// ---------------------------------------------------------------------------
// Highlighting
// ---------------------------------------------------------------------------

export function highlight(
  text: string,
  terms: string[],
  preTag = '<mark>',
  postTag = '</mark>',
): string {
  if (!terms.length) return text;
  // Escape terms for regex
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
  return text.replace(pattern, `${preTag}$1${postTag}`);
}

export function excerpt(text: string, terms: string[], maxLength = 200): string {
  if (!terms.length || !text) return text.slice(0, maxLength);
  const lower = text.toLowerCase();
  let firstIdx = -1;
  for (const term of terms) {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) firstIdx = idx;
  }
  if (firstIdx === -1) return text.slice(0, maxLength);
  const half = Math.floor(maxLength / 2);
  const start = Math.max(0, firstIdx - half);
  const end = Math.min(text.length, start + maxLength);
  return text.slice(start, end);
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function createIndex<T extends SearchDocument>(
  docs: T[],
  options?: IndexOptions,
): InvertedIndex<T> {
  const idx = new InvertedIndex<T>(options);
  idx.addBatch(docs);
  return idx;
}

export function suggest(
  index: InvertedIndex<SearchDocument>,
  prefix: string,
  limit = 10,
): string[] {
  const lower = prefix.toLowerCase();
  return index.getTerms()
    .filter(t => t.startsWith(lower))
    .sort()
    .slice(0, limit);
}

export function autocomplete(
  index: InvertedIndex<SearchDocument>,
  partial: string,
  limit = 10,
): string[] {
  const lower = partial.toLowerCase();
  return index.getTerms()
    .filter(t => t.includes(lower))
    .sort((a, b) => {
      const aStarts = a.startsWith(lower) ? 0 : 1;
      const bStarts = b.startsWith(lower) ? 0 : 1;
      return aStarts - bStarts || a.localeCompare(b);
    })
    .slice(0, limit);
}

export function termFrequencyInCorpus(
  index: InvertedIndex<SearchDocument>,
): Array<{ term: string; df: number; idf: number }> {
  const n = index.getStats().documentCount;
  return index.getTerms()
    .map(term => {
      const df = index.getPostings(term).size;
      const idf = n > 0 ? Math.log((n - df + 0.5) / (df + 0.5) + 1) : 0;
      return { term, df, idf };
    })
    .sort((a, b) => b.df - a.df);
}
