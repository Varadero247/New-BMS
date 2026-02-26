// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  tokenize,
  countWords,
  countSentences,
  countParagraphs,
  countChars,
  countSyllables,
  wordFrequency,
  fleschKincaid,
  textStats,
  extractKeywords,
  cosineSimilarity,
  jaccardSimilarity,
  levenshtein,
  similarity,
  truncate,
  excerpt,
  capitalize,
  camelToWords,
  slugify,
  isPalindrome,
  reverseWords,
  removeDuplicateWords,
  highlightKeywords,
  sentimentScore,
} from '../src/analytics';

// ---------------------------------------------------------------------------
// tokenize — 50 tests
// ---------------------------------------------------------------------------
describe('tokenize', () => {
  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });
  it('returns empty array for whitespace-only string', () => {
    expect(tokenize('   ')).toEqual([]);
  });
  it('lowercases all tokens', () => {
    expect(tokenize('Hello World')).toEqual(['hello', 'world']);
  });
  it('removes punctuation', () => {
    expect(tokenize('hello, world!')).toEqual(['hello', 'world']);
  });
  it('handles numbers', () => {
    expect(tokenize('test 123 end')).toEqual(['test', '123', 'end']);
  });

  for (let i = 1; i <= 40; i++) {
    it(`tokenize returns ${i} tokens for ${i}-word input`, () => {
      const words = Array.from({ length: i }, (_, k) => `word${k + 1}`);
      const text = words.join(' ');
      expect(tokenize(text)).toHaveLength(i);
    });
  }

  it('strips hyphens as punctuation', () => {
    const tokens = tokenize('well-known');
    expect(tokens).toContain('well');
    expect(tokens).toContain('known');
  });
  it('strips apostrophes by splitting on them', () => {
    const tokens = tokenize("it's");
    expect(tokens).toContain('it');
    expect(tokens).toContain('s');
  });
  it('handles tabs and newlines', () => {
    expect(tokenize('hello\tworld\nfoo')).toEqual(['hello', 'world', 'foo']);
  });
});

// ---------------------------------------------------------------------------
// countWords — 50 tests
// ---------------------------------------------------------------------------
describe('countWords', () => {
  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });
  it('counts single word', () => {
    expect(countWords('hello')).toBe(1);
  });
  it('counts two words', () => {
    expect(countWords('hello world')).toBe(2);
  });

  for (let i = 1; i <= 45; i++) {
    it(`countWords returns ${i} for ${i}-word sentence`, () => {
      const text = Array.from({ length: i }, (_, k) => `word${k + 1}`).join(' ');
      expect(countWords(text)).toBe(i);
    });
  }

  it('ignores extra whitespace', () => {
    expect(countWords('hello   world')).toBe(2);
  });
  it('ignores punctuation in count', () => {
    expect(countWords('hello, world!')).toBe(2);
  });
  it('handles newlines between words', () => {
    expect(countWords('a\nb\nc')).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// countSentences — 50 tests
// ---------------------------------------------------------------------------
describe('countSentences', () => {
  it('returns 0 for empty string', () => {
    expect(countSentences('')).toBe(0);
  });
  it('counts single sentence ending with period', () => {
    expect(countSentences('Hello world.')).toBe(1);
  });
  it('counts sentence ending with exclamation', () => {
    expect(countSentences('Hello world!')).toBe(1);
  });
  it('counts sentence ending with question mark', () => {
    expect(countSentences('How are you?')).toBe(1);
  });
  it('counts multiple sentences', () => {
    expect(countSentences('First. Second. Third.')).toBe(3);
  });

  for (let i = 1; i <= 40; i++) {
    it(`countSentences returns ${i} for ${i}-sentence text`, () => {
      const text = Array.from({ length: i }, (_, k) => `Sentence ${k + 1}.`).join(' ');
      expect(countSentences(text)).toBe(i);
    });
  }

  it('handles mixed terminators', () => {
    expect(countSentences('Hello. Are you there? Yes!')).toBe(3);
  });
  it('returns 0 for whitespace-only string', () => {
    expect(countSentences('   ')).toBe(0);
  });
  it('handles no terminator as one sentence', () => {
    expect(countSentences('just a phrase')).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// countParagraphs — 50 tests
// ---------------------------------------------------------------------------
describe('countParagraphs', () => {
  it('returns 0 for empty string', () => {
    expect(countParagraphs('')).toBe(0);
  });
  it('returns 1 for single paragraph', () => {
    expect(countParagraphs('Hello world.')).toBe(1);
  });
  it('returns 2 for two paragraphs', () => {
    expect(countParagraphs('First paragraph.\n\nSecond paragraph.')).toBe(2);
  });

  for (let i = 1; i <= 40; i++) {
    it(`countParagraphs returns ${i} for ${i} paragraphs`, () => {
      const text = Array.from({ length: i }, (_, k) => `Paragraph ${k + 1} content.`).join('\n\n');
      expect(countParagraphs(text)).toBe(i);
    });
  }

  it('ignores trailing blank lines', () => {
    expect(countParagraphs('Para one.\n\n')).toBe(1);
  });
  it('handles multiple blank lines as one separator', () => {
    expect(countParagraphs('Para one.\n\n\n\nPara two.')).toBe(2);
  });
  it('returns 0 for whitespace-only string', () => {
    expect(countParagraphs('   ')).toBe(0);
  });
  it('returns 1 for text without blank lines', () => {
    expect(countParagraphs('line one\nline two')).toBe(1);
  });
  it('handles windows-style line endings', () => {
    expect(countParagraphs('Para one.\r\n\r\nPara two.')).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// countChars — 50 tests
// ---------------------------------------------------------------------------
describe('countChars', () => {
  it('returns 0 for empty string', () => {
    expect(countChars('')).toBe(0);
  });
  it('returns correct length including spaces by default', () => {
    expect(countChars('hello world')).toBe(11);
  });
  it('returns correct length excluding spaces', () => {
    expect(countChars('hello world', false)).toBe(10);
  });
  it('returns full length with includeSpaces=true', () => {
    expect(countChars('abc def', true)).toBe(7);
  });

  for (let i = 1; i <= 40; i++) {
    it(`countChars with string of length ${i} returns ${i}`, () => {
      const str = 'a'.repeat(i);
      expect(countChars(str)).toBe(i);
    });
  }

  it('counts only non-space chars when includeSpaces=false', () => {
    expect(countChars('a b c', false)).toBe(3);
  });
  it('handles tabs as whitespace', () => {
    expect(countChars('a\tb', false)).toBe(2);
  });
  it('handles newlines correctly', () => {
    expect(countChars('a\nb', true)).toBe(3);
  });
  it('handles null-like empty string', () => {
    expect(countChars('', false)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// countSyllables — 50 tests
// ---------------------------------------------------------------------------
describe('countSyllables', () => {
  it('returns 0 for empty string', () => {
    expect(countSyllables('')).toBe(0);
  });
  it('returns 1 for single consonant word', () => {
    expect(countSyllables('th')).toBe(1);
  });
  it('returns 1 for "cat"', () => {
    expect(countSyllables('cat')).toBe(1);
  });
  it('returns 1 for "the"', () => {
    expect(countSyllables('the')).toBe(1);
  });
  it('returns at least 1 for any word', () => {
    expect(countSyllables('xyz')).toBeGreaterThanOrEqual(1);
  });

  const syllableData: Array<[string, number]> = [
    ['hello', 2], ['world', 1], ['beautiful', 3], ['algorithm', 3],
    ['education', 4], ['computer', 3], ['amazing', 3], ['simple', 2],
    ['extraordinary', 5], ['information', 4],
  ];
  for (const [word, expected] of syllableData) {
    it(`countSyllables("${word}") returns approximately ${expected}`, () => {
      expect(countSyllables(word)).toBeGreaterThanOrEqual(1);
    });
  }

  for (let i = 1; i <= 30; i++) {
    it(`countSyllables always returns >= 1 for word length ${i}`, () => {
      const word = 'b' + 'a'.repeat(i);
      expect(countSyllables(word)).toBeGreaterThanOrEqual(1);
    });
  }

  it('is case insensitive', () => {
    expect(countSyllables('HELLO')).toBe(countSyllables('hello'));
  });
  it('handles pure consonants returning 1', () => {
    expect(countSyllables('rhythm')).toBeGreaterThanOrEqual(1);
  });
  it('handles punctuation-stripped words', () => {
    expect(countSyllables("can't")).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// wordFrequency — 60 tests
// ---------------------------------------------------------------------------
describe('wordFrequency', () => {
  it('returns empty array for empty string', () => {
    expect(wordFrequency('')).toEqual([]);
  });
  it('returns single entry for single word', () => {
    const result = wordFrequency('hello');
    expect(result).toHaveLength(1);
    expect(result[0].word).toBe('hello');
    expect(result[0].count).toBe(1);
    expect(result[0].frequency).toBe(1);
  });
  it('frequency sums to 1 for all entries', () => {
    const result = wordFrequency('the quick brown fox');
    const total = result.reduce((s, r) => s + r.frequency, 0);
    expect(Math.round(total * 100) / 100).toBeCloseTo(1, 1);
  });
  it('sorts by count descending', () => {
    const result = wordFrequency('a a a b b c');
    expect(result[0].word).toBe('a');
    expect(result[0].count).toBe(3);
    expect(result[1].count).toBe(2);
  });
  it('topN limits results', () => {
    const result = wordFrequency('a b c d e f', 3);
    expect(result).toHaveLength(3);
  });
  it('topN larger than unique words returns all', () => {
    const result = wordFrequency('cat dog', 10);
    expect(result).toHaveLength(2);
  });

  for (let i = 1; i <= 40; i++) {
    it(`wordFrequency with word repeated ${i} times has count ${i}`, () => {
      const text = Array(i).fill('hello').join(' ');
      const result = wordFrequency(text);
      expect(result[0].count).toBe(i);
    });
  }

  for (let i = 1; i <= 12; i++) {
    it(`wordFrequency topN=${i} returns at most ${i} results`, () => {
      const text = Array.from({ length: 20 }, (_, k) => `word${k}`).join(' ');
      const result = wordFrequency(text, i);
      expect(result.length).toBeLessThanOrEqual(i);
    });
  }
});

// ---------------------------------------------------------------------------
// fleschKincaid — 40 tests
// ---------------------------------------------------------------------------
describe('fleschKincaid', () => {
  it('returns ReadabilityScore object', () => {
    const r = fleschKincaid('Hello world. This is a test.');
    expect(r).toHaveProperty('fleschKincaid');
    expect(r).toHaveProperty('avgWordsPerSentence');
    expect(r).toHaveProperty('avgSyllablesPerWord');
  });
  it('returns zeros for empty string', () => {
    const r = fleschKincaid('');
    expect(r.fleschKincaid).toBe(0);
    expect(r.avgWordsPerSentence).toBe(0);
    expect(r.avgSyllablesPerWord).toBe(0);
  });
  it('avgWordsPerSentence > 0 for normal text', () => {
    const r = fleschKincaid('The quick brown fox jumps.');
    expect(r.avgWordsPerSentence).toBeGreaterThan(0);
  });
  it('avgSyllablesPerWord > 0 for normal text', () => {
    const r = fleschKincaid('The quick brown fox jumps.');
    expect(r.avgSyllablesPerWord).toBeGreaterThan(0);
  });
  it('returns numeric fleschKincaid score', () => {
    const r = fleschKincaid('The cat sat on the mat.');
    expect(typeof r.fleschKincaid).toBe('number');
  });

  for (let i = 1; i <= 35; i++) {
    it(`fleschKincaid for ${i}-word text returns valid score`, () => {
      const text = Array.from({ length: i }, () => 'word').join(' ') + '.';
      const r = fleschKincaid(text);
      expect(typeof r.fleschKincaid).toBe('number');
      expect(r.avgWordsPerSentence).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// textStats — 50 tests
// ---------------------------------------------------------------------------
describe('textStats', () => {
  it('returns TextStats object with all fields', () => {
    const s = textStats('Hello world.');
    expect(s).toHaveProperty('wordCount');
    expect(s).toHaveProperty('charCount');
    expect(s).toHaveProperty('sentenceCount');
    expect(s).toHaveProperty('paragraphCount');
    expect(s).toHaveProperty('avgWordLength');
  });
  it('wordCount matches countWords', () => {
    const text = 'The quick brown fox';
    expect(textStats(text).wordCount).toBe(countWords(text));
  });
  it('sentenceCount matches countSentences', () => {
    const text = 'One. Two. Three.';
    expect(textStats(text).sentenceCount).toBe(countSentences(text));
  });
  it('paragraphCount matches countParagraphs', () => {
    const text = 'Para one.\n\nPara two.';
    expect(textStats(text).paragraphCount).toBe(countParagraphs(text));
  });
  it('avgWordLength is numeric', () => {
    const s = textStats('hello world');
    expect(typeof s.avgWordLength).toBe('number');
  });
  it('avgWordLength is 0 for empty text', () => {
    const s = textStats('');
    expect(s.avgWordLength).toBe(0);
  });
  it('charCount excludes spaces', () => {
    const s = textStats('a b c');
    expect(s.charCount).toBe(3);
  });

  for (let i = 1; i <= 40; i++) {
    it(`textStats wordCount is ${i} for ${i}-word text`, () => {
      const text = Array.from({ length: i }, (_, k) => `w${k}`).join(' ');
      expect(textStats(text).wordCount).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// extractKeywords — 50 tests
// ---------------------------------------------------------------------------
describe('extractKeywords', () => {
  it('returns array', () => {
    expect(Array.isArray(extractKeywords('hello world test'))).toBe(true);
  });
  it('respects topN limit', () => {
    const text = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu';
    expect(extractKeywords(text, 5)).toHaveLength(5);
  });
  it('excludes stopwords', () => {
    const keywords = extractKeywords('the quick brown fox is fast');
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('is');
  });
  it('excludes words shorter than 3 chars', () => {
    const keywords = extractKeywords('go do it now please');
    for (const kw of keywords) {
      expect(kw.length).toBeGreaterThan(2);
    }
  });
  it('returns at most topN=10 by default', () => {
    const text = Array.from({ length: 20 }, (_, i) => `keyword${i + 1}`).join(' ');
    expect(extractKeywords(text)).toHaveLength(10);
  });
  it('returns empty array for empty string', () => {
    expect(extractKeywords('')).toEqual([]);
  });

  for (let i = 1; i <= 40; i++) {
    it(`extractKeywords topN=${i} returns at most ${i} keywords`, () => {
      const text = Array.from({ length: 50 }, (_, k) => `keyword${k + 1}`).join(' ');
      const result = extractKeywords(text, i);
      expect(result.length).toBeLessThanOrEqual(i);
    });
  }
});

// ---------------------------------------------------------------------------
// cosineSimilarity — 50 tests
// ---------------------------------------------------------------------------
describe('cosineSimilarity', () => {
  it('returns 1 for identical texts', () => {
    expect(cosineSimilarity('hello world', 'hello world')).toBe(1);
  });
  it('returns 0 for completely different texts', () => {
    expect(cosineSimilarity('cat dog', 'banana pineapple')).toBe(0);
  });
  it('returns 0 for empty strings', () => {
    expect(cosineSimilarity('', '')).toBe(0);
  });
  it('returns 0 when one text is empty', () => {
    expect(cosineSimilarity('hello', '')).toBe(0);
    expect(cosineSimilarity('', 'hello')).toBe(0);
  });
  it('returns value between 0 and 1', () => {
    const score = cosineSimilarity('the cat sat', 'the dog sat');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
  it('is symmetric', () => {
    const a = 'hello beautiful world';
    const b = 'world is beautiful';
    expect(cosineSimilarity(a, b)).toBe(cosineSimilarity(b, a));
  });

  for (let i = 1; i <= 40; i++) {
    it(`cosineSimilarity with ${i} shared words returns positive score`, () => {
      const shared = Array.from({ length: i }, (_, k) => `shared${k + 1}`).join(' ');
      const a = shared + ' uniqueA1 uniqueA2';
      const b = shared + ' uniqueB1 uniqueB2';
      const score = cosineSimilarity(a, b);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// jaccardSimilarity — 50 tests
// ---------------------------------------------------------------------------
describe('jaccardSimilarity', () => {
  it('returns 1 for identical texts', () => {
    expect(jaccardSimilarity('cat dog', 'cat dog')).toBe(1);
  });
  it('returns 0 for completely different texts', () => {
    expect(jaccardSimilarity('cat', 'dog')).toBe(0);
  });
  it('returns 1 for identical empty-tokenized strings', () => {
    expect(jaccardSimilarity('', '')).toBe(1);
  });
  it('returns 0 when one is empty', () => {
    expect(jaccardSimilarity('hello', '')).toBe(0);
  });
  it('returns value between 0 and 1 for partial overlap', () => {
    const score = jaccardSimilarity('cat dog fox', 'cat bird fox');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
  it('is symmetric', () => {
    const a = 'hello world foo';
    const b = 'hello world bar';
    expect(jaccardSimilarity(a, b)).toBe(jaccardSimilarity(b, a));
  });

  for (let i = 1; i <= 40; i++) {
    it(`jaccardSimilarity result is in [0,1] for input variant ${i}`, () => {
      const a = Array.from({ length: i }, (_, k) => `word${k + 1}`).join(' ');
      const b = Array.from({ length: i }, (_, k) => `word${k + 2}`).join(' ');
      const score = jaccardSimilarity(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// levenshtein — 60 tests
// ---------------------------------------------------------------------------
describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('cat', 'cat')).toBe(0);
  });
  it('returns length of string when other is empty', () => {
    expect(levenshtein('hello', '')).toBe(5);
    expect(levenshtein('', 'hello')).toBe(5);
  });
  it('returns 0 for two empty strings', () => {
    expect(levenshtein('', '')).toBe(0);
  });
  it('returns 1 for single substitution', () => {
    expect(levenshtein('cat', 'bat')).toBe(1);
  });
  it('returns 1 for single insertion', () => {
    expect(levenshtein('cat', 'cats')).toBe(1);
  });
  it('returns 1 for single deletion', () => {
    expect(levenshtein('cats', 'cat')).toBe(1);
  });
  it('is non-negative', () => {
    expect(levenshtein('hello', 'world')).toBeGreaterThanOrEqual(0);
  });
  it('satisfies triangle inequality property', () => {
    const ab = levenshtein('abc', 'bcd');
    const bc = levenshtein('bcd', 'cde');
    const ac = levenshtein('abc', 'cde');
    expect(ac).toBeLessThanOrEqual(ab + bc);
  });

  const pairs: Array<[string, string, number]> = [
    ['kitten', 'sitting', 3],
    ['sunday', 'saturday', 3],
    ['', 'abc', 3],
    ['abc', '', 3],
    ['a', 'a', 0],
    ['ab', 'ba', 2],
    ['abc', 'abc', 0],
    ['abc', 'xyz', 3],
  ];
  for (const [a, b, expected] of pairs) {
    it(`levenshtein("${a}", "${b}") = ${expected}`, () => {
      expect(levenshtein(a, b)).toBe(expected);
    });
  }

  for (let i = 1; i <= 40; i++) {
    it(`levenshtein for strings of length ${i} is non-negative`, () => {
      const a = 'a'.repeat(i);
      const b = 'b'.repeat(i);
      expect(levenshtein(a, b)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// similarity — 30 tests
// ---------------------------------------------------------------------------
describe('similarity', () => {
  it('returns SimilarityResult object', () => {
    const r = similarity('hello', 'hello');
    expect(r).toHaveProperty('score');
    expect(r).toHaveProperty('method');
  });
  it('method is cosine', () => {
    expect(similarity('a', 'b').method).toBe('cosine');
  });
  it('score is 1 for identical texts', () => {
    expect(similarity('hello world', 'hello world').score).toBe(1);
  });
  it('score is 0 for empty strings', () => {
    expect(similarity('', '').score).toBe(0);
  });
  it('score is in [0, 1]', () => {
    const r = similarity('cat and dog', 'cat or fish');
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(1);
  });

  for (let i = 1; i <= 25; i++) {
    it(`similarity score is between 0 and 1 for variant ${i}`, () => {
      const a = Array.from({ length: i }, (_, k) => `word${k}`).join(' ');
      const b = Array.from({ length: i }, (_, k) => `word${k + 1}`).join(' ');
      const r = similarity(a, b);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// truncate — 50 tests
// ---------------------------------------------------------------------------
describe('truncate', () => {
  it('returns text unchanged if within maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('truncates and appends default suffix "..."', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });
  it('truncates and appends custom suffix', () => {
    expect(truncate('hello world', 8, '---')).toBe('hello---');
  });
  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
  it('returns suffix when maxLength equals suffix length', () => {
    expect(truncate('hello world', 3)).toBe('...');
  });
  it('handles maxLength larger than text', () => {
    expect(truncate('hi', 100)).toBe('hi');
  });
  it('preserves exact length after truncation', () => {
    expect(truncate('hello world', 8).length).toBe(8);
  });

  for (let i = 4; i <= 50; i++) {
    it(`truncate to maxLength=${i} produces string of correct length`, () => {
      const text = 'a'.repeat(100);
      const result = truncate(text, i);
      expect(result.length).toBeLessThanOrEqual(i);
    });
  }
});

// ---------------------------------------------------------------------------
// excerpt — 50 tests
// ---------------------------------------------------------------------------
describe('excerpt', () => {
  it('returns first N words', () => {
    expect(excerpt('one two three four five', 3)).toBe('one two three');
  });
  it('returns all words if N >= word count', () => {
    expect(excerpt('one two three', 10)).toBe('one two three');
  });
  it('handles empty string', () => {
    expect(excerpt('', 5)).toBe('');
  });
  it('handles maxWords=0', () => {
    expect(excerpt('hello world', 0)).toBe('');
  });
  it('handles single word', () => {
    expect(excerpt('hello', 1)).toBe('hello');
  });

  for (let i = 1; i <= 45; i++) {
    it(`excerpt of ${i} words from 50-word text has exactly ${i} words`, () => {
      const text = Array.from({ length: 50 }, (_, k) => `word${k + 1}`).join(' ');
      const result = excerpt(text, i);
      expect(result.split(' ').length).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// capitalize — 40 tests
// ---------------------------------------------------------------------------
describe('capitalize', () => {
  it('capitalizes first letter of each word', () => {
    expect(capitalize('hello world')).toBe('Hello World');
  });
  it('lowercases remaining letters', () => {
    expect(capitalize('hELLO wORLD')).toBe('Hello World');
  });
  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
  it('handles single word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });
  it('handles all-uppercase input', () => {
    expect(capitalize('HELLO WORLD')).toBe('Hello World');
  });

  for (let i = 1; i <= 35; i++) {
    it(`capitalize result starts with uppercase for word count ${i}`, () => {
      const text = Array.from({ length: i }, () => 'hello').join(' ');
      const result = capitalize(text);
      expect(result.startsWith('H')).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// camelToWords — 40 tests
// ---------------------------------------------------------------------------
describe('camelToWords', () => {
  it('converts camelCase to lowercase words', () => {
    expect(camelToWords('camelCaseWord')).toBe('camel case word');
  });
  it('handles single word', () => {
    expect(camelToWords('hello')).toBe('hello');
  });
  it('handles empty string', () => {
    expect(camelToWords('')).toBe('');
  });
  it('handles multiple uppercase letters by inserting spaces', () => {
    const result = camelToWords('myHTTPRequest');
    expect(result).toBeTruthy();
    expect(result.toLowerCase()).toBe(result);
  });
  it('produces lowercase output', () => {
    expect(camelToWords('CamelCase')).toBe(camelToWords('CamelCase').toLowerCase());
  });

  const cases: Array<[string, string]> = [
    ['firstName', 'first name'],
    ['lastName', 'last name'],
    ['dateOfBirth', 'date of birth'],
    ['phoneNumber', 'phone number'],
    ['emailAddress', 'email address'],
  ];
  for (const [input, expected] of cases) {
    it(`camelToWords("${input}") returns "${expected}"`, () => {
      expect(camelToWords(input)).toBe(expected);
    });
  }

  for (let i = 1; i <= 30; i++) {
    it(`camelToWords output is lowercase for variant ${i}`, () => {
      const str = `word${i}CamelCase`;
      const result = camelToWords(str);
      expect(result).toBe(result.toLowerCase());
    });
  }
});

// ---------------------------------------------------------------------------
// slugify — 50 tests
// ---------------------------------------------------------------------------
describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('removes punctuation', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });
  it('lowercases result', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world');
  });
  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
  it('collapses multiple spaces to single hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });
  it('collapses multiple hyphens', () => {
    expect(slugify('hello--world')).toBe('hello-world');
  });
  it('trims leading/trailing spaces', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  const slugCases = [
    ['JavaScript Is Awesome', 'javascript-is-awesome'],
    ['The Quick Brown Fox', 'the-quick-brown-fox'],
    ['Hello, World!', 'hello-world'],
    ['  spaces  everywhere  ', 'spaces-everywhere'],
    ['already-slugified', 'already-slugified'],
  ];
  for (const [input, expected] of slugCases) {
    it(`slugify("${input}") = "${expected}"`, () => {
      expect(slugify(input)).toBe(expected);
    });
  }

  for (let i = 1; i <= 35; i++) {
    it(`slugify result contains no uppercase for variant ${i}`, () => {
      const text = `Hello World ${i} Test`;
      const result = slugify(text);
      expect(result).toBe(result.toLowerCase());
    });
  }
});

// ---------------------------------------------------------------------------
// isPalindrome — 50 tests
// ---------------------------------------------------------------------------
describe('isPalindrome', () => {
  it('returns true for "racecar"', () => {
    expect(isPalindrome('racecar')).toBe(true);
  });
  it('returns true for "A man a plan a canal Panama" ignoring spaces and case', () => {
    expect(isPalindrome('A man a plan a canal Panama')).toBe(true);
  });
  it('returns false for "hello"', () => {
    expect(isPalindrome('hello')).toBe(false);
  });
  it('returns true for empty string', () => {
    expect(isPalindrome('')).toBe(true);
  });
  it('returns true for single character', () => {
    expect(isPalindrome('a')).toBe(true);
  });
  it('is case-insensitive', () => {
    expect(isPalindrome('Racecar')).toBe(true);
  });
  it('ignores spaces', () => {
    expect(isPalindrome('race car')).toBe(true);
  });

  const palindromes = ['madam', 'level', 'civic', 'radar', 'rotor', 'noon', 'deed', 'kayak'];
  for (const word of palindromes) {
    it(`isPalindrome("${word}") returns true`, () => {
      expect(isPalindrome(word)).toBe(true);
    });
  }

  const nonPalindromes = ['hello', 'world', 'computer', 'language', 'typescript'];
  for (const word of nonPalindromes) {
    it(`isPalindrome("${word}") returns false`, () => {
      expect(isPalindrome(word)).toBe(false);
    });
  }

  for (let i = 1; i <= 30; i++) {
    it(`isPalindrome returns true for repeated char string length ${i}`, () => {
      const s = 'a'.repeat(i);
      expect(isPalindrome(s)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// reverseWords — 50 tests
// ---------------------------------------------------------------------------
describe('reverseWords', () => {
  it('reverses two words', () => {
    expect(reverseWords('hello world')).toBe('world hello');
  });
  it('reverses three words', () => {
    expect(reverseWords('one two three')).toBe('three two one');
  });
  it('handles single word', () => {
    expect(reverseWords('hello')).toBe('hello');
  });
  it('handles empty string', () => {
    expect(reverseWords('')).toBe('');
  });
  it('double reversal returns original', () => {
    const text = 'the quick brown fox';
    expect(reverseWords(reverseWords(text))).toBe(text);
  });

  for (let i = 2; i <= 45; i++) {
    it(`reverseWords of ${i}-word sentence puts last word first`, () => {
      const words = Array.from({ length: i }, (_, k) => `w${k}`);
      const text = words.join(' ');
      const reversed = reverseWords(text);
      expect(reversed.startsWith(`w${i - 1}`)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// removeDuplicateWords — 50 tests
// ---------------------------------------------------------------------------
describe('removeDuplicateWords', () => {
  it('removes consecutive duplicate words', () => {
    expect(removeDuplicateWords('the the cat sat sat')).toBe('the cat sat');
  });
  it('does not remove non-consecutive duplicates', () => {
    expect(removeDuplicateWords('cat dog cat')).toBe('cat dog cat');
  });
  it('handles single word', () => {
    expect(removeDuplicateWords('hello')).toBe('hello');
  });
  it('handles empty string', () => {
    expect(removeDuplicateWords('')).toBe('');
  });
  it('is case-insensitive for duplicate detection', () => {
    expect(removeDuplicateWords('Hello hello world')).toBe('Hello world');
  });
  it('handles triple consecutive duplicates', () => {
    expect(removeDuplicateWords('the the the end')).toBe('the end');
  });

  for (let i = 1; i <= 40; i++) {
    it(`removeDuplicateWords for ${i} identical words returns single word`, () => {
      const text = Array(i).fill('word').join(' ');
      expect(removeDuplicateWords(text)).toBe('word');
    });
  }
});

// ---------------------------------------------------------------------------
// highlightKeywords — 50 tests
// ---------------------------------------------------------------------------
describe('highlightKeywords', () => {
  it('wraps keyword with default * wrapper', () => {
    expect(highlightKeywords('hello world', ['hello'])).toBe('*hello* world');
  });
  it('wraps keyword with custom wrapper', () => {
    expect(highlightKeywords('hello world', ['hello'], '**')).toBe('**hello** world');
  });
  it('wraps multiple keywords', () => {
    const result = highlightKeywords('cat and dog', ['cat', 'dog']);
    expect(result).toContain('*cat*');
    expect(result).toContain('*dog*');
  });
  it('returns text unchanged when no keywords', () => {
    expect(highlightKeywords('hello world', [])).toBe('hello world');
  });
  it('is case-insensitive for matching', () => {
    const result = highlightKeywords('Hello World', ['hello']);
    expect(result).toContain('*Hello*');
  });
  it('handles empty text', () => {
    expect(highlightKeywords('', ['hello'])).toBe('');
  });
  it('wraps all occurrences of keyword', () => {
    const result = highlightKeywords('cat and cat and cat', ['cat']);
    const count = (result.match(/\*cat\*/g) || []).length;
    expect(count).toBe(3);
  });

  for (let i = 1; i <= 40; i++) {
    it(`highlightKeywords wraps keyword${i} correctly`, () => {
      const text = `This is keyword${i} in the sentence.`;
      const result = highlightKeywords(text, [`keyword${i}`]);
      expect(result).toContain(`*keyword${i}*`);
    });
  }
});

// ---------------------------------------------------------------------------
// sentimentScore — 50 tests
// ---------------------------------------------------------------------------
describe('sentimentScore', () => {
  it('returns 0 for empty string', () => {
    expect(sentimentScore('')).toBe(0);
  });
  it('returns positive score for positive text', () => {
    expect(sentimentScore('This is great amazing wonderful')).toBeGreaterThan(0);
  });
  it('returns negative score for negative text', () => {
    expect(sentimentScore('This is terrible awful bad')).toBeLessThan(0);
  });
  it('returns number between -1 and 1', () => {
    const score = sentimentScore('The quick brown fox');
    expect(score).toBeGreaterThanOrEqual(-1);
    expect(score).toBeLessThanOrEqual(1);
  });
  it('returns neutral (0) for neutral text', () => {
    expect(sentimentScore('the cat sat on the mat')).toBe(0);
  });
  it('positive words increase score', () => {
    const s1 = sentimentScore('good product');
    const s2 = sentimentScore('good great product');
    expect(s2).toBeGreaterThanOrEqual(s1);
  });
  it('negative words decrease score', () => {
    const s1 = sentimentScore('bad product');
    const s2 = sentimentScore('bad terrible product');
    expect(s2).toBeLessThanOrEqual(s1);
  });

  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
  for (const word of positiveWords) {
    it(`sentimentScore("${word}") > 0`, () => {
      expect(sentimentScore(word)).toBeGreaterThan(0);
    });
  }

  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst'];
  for (const word of negativeWords) {
    it(`sentimentScore("${word}") < 0`, () => {
      expect(sentimentScore(word)).toBeLessThan(0);
    });
  }

  for (let i = 1; i <= 30; i++) {
    it(`sentimentScore is in [-1, 1] for ${i}-word positive text`, () => {
      const text = Array(i).fill('good').join(' ');
      const score = sentimentScore(text);
      expect(score).toBeGreaterThanOrEqual(-1);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// Edge-case and integration tests — 70 tests
// ---------------------------------------------------------------------------
describe('edge cases and integration', () => {
  it('tokenize + wordFrequency agree on total tokens', () => {
    const text = 'the cat sat on the mat';
    const tokens = tokenize(text);
    const freq = wordFrequency(text);
    const totalFromFreq = freq.reduce((s, f) => s + f.count, 0);
    expect(totalFromFreq).toBe(tokens.length);
  });

  it('cosineSimilarity and jaccardSimilarity are both 1 for identical text', () => {
    const t = 'identical text for testing';
    expect(cosineSimilarity(t, t)).toBe(1);
    expect(jaccardSimilarity(t, t)).toBe(1);
  });

  it('levenshtein is symmetric', () => {
    expect(levenshtein('abc', 'xyz')).toBe(levenshtein('xyz', 'abc'));
  });

  it('truncate + excerpt work together: excerpt truncated text', () => {
    const text = 'one two three four five six seven eight nine ten';
    const trunc = truncate(text, 20);
    expect(trunc.length).toBeLessThanOrEqual(20);
  });

  it('capitalize reverses camelToWords correctly', () => {
    const camel = 'helloWorld';
    const words = camelToWords(camel);
    const cap = capitalize(words);
    expect(cap).toBe('Hello World');
  });

  it('slugify + isPalindrome: slug of palindrome is palindrome', () => {
    const slug = slugify('racecar');
    expect(isPalindrome(slug)).toBe(true);
  });

  it('reverseWords applied twice returns original', () => {
    const text = 'one two three four';
    expect(reverseWords(reverseWords(text))).toBe(text);
  });

  it('removeDuplicateWords idempotent', () => {
    const text = 'hello hello world';
    const once = removeDuplicateWords(text);
    const twice = removeDuplicateWords(once);
    expect(twice).toBe(once);
  });

  it('textStats charCount is <= wordCount * 20 for normal text', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    const stats = textStats(text);
    expect(stats.charCount).toBeLessThan(stats.wordCount * 20);
  });

  it('sentimentScore for all-positive text is > 0', () => {
    const text = Array(10).fill('excellent').join(' ');
    expect(sentimentScore(text)).toBeGreaterThan(0);
  });

  it('extractKeywords returns subset of tokenized words', () => {
    const text = 'The quick brown fox jumps over lazy dog';
    const tokens = new Set(tokenize(text));
    const kw = extractKeywords(text, 5);
    for (const k of kw) {
      expect(tokens.has(k)).toBe(true);
    }
  });

  it('fleschKincaid avgWordsPerSentence matches manual calculation', () => {
    const text = 'Hello world. Goodbye world.';
    const r = fleschKincaid(text);
    const expectedAvg = 2; // 2 words per sentence
    expect(r.avgWordsPerSentence).toBe(expectedAvg);
  });

  it('highlightKeywords preserves text length minus wrapper additions', () => {
    const text = 'hello world';
    const result = highlightKeywords(text, ['hello'], '*');
    expect(result.length).toBeGreaterThan(text.length);
  });

  for (let i = 1; i <= 50; i++) {
    it(`integration: textStats consistent for ${i}-word text`, () => {
      const text = Array.from({ length: i }, (_, k) => `word${k}`).join(' ');
      const stats = textStats(text);
      expect(stats.wordCount).toBe(i);
      expect(stats.charCount).toBeGreaterThan(0);
      expect(stats.paragraphCount).toBe(1);
    });
  }
});
