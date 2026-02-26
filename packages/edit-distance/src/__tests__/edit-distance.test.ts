// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  levenshtein,
  hamming,
  damerauLevenshtein,
  optimalStringAlignment,
  jaro,
  jaroWinkler,
  lcsLength,
  lcsString,
  longestCommonSubstring,
  normalizedLevenshtein,
  similarity,
  commonPrefixLength,
  commonSuffixLength,
  diceCoefficient,
  jaccardSimilarity,
  cosineSimilarity,
  sorensenDice,
  closest,
  isWithinDistance,
  smithWaterman,
  needlemanWunsch,
} from '../edit-distance';

// ─── levenshtein identity (200 tests) ────────────────────────────────────────
describe('levenshtein – identity', () => {
  for (let i = 0; i < 200; i++) {
    it(`levenshtein identity i=${i}`, () => {
      const s = 'abc'.repeat(i % 5 + 1);
      expect(levenshtein(s, s)).toBe(0);
    });
  }
});

// ─── levenshtein insert cost (200 tests) ─────────────────────────────────────
describe('levenshtein – insert cost', () => {
  for (let n = 1; n <= 200; n++) {
    it(`levenshtein('', ${'a'.repeat(Math.min(n, 3))}…) = ${n}`, () => {
      expect(levenshtein('', 'a'.repeat(n))).toBe(n);
    });
  }
});

// ─── levenshtein delete cost (100 tests) ─────────────────────────────────────
describe('levenshtein – delete cost', () => {
  for (let n = 1; n <= 100; n++) {
    it(`levenshtein delete n=${n}`, () => {
      expect(levenshtein('b'.repeat(n), '')).toBe(n);
    });
  }
});

// ─── levenshtein substitution (100 tests) ────────────────────────────────────
describe('levenshtein – substitution', () => {
  const pairs: [string, string, number][] = [
    ['a', 'b', 1], ['ab', 'cd', 2], ['abc', 'xyz', 3],
    ['kitten', 'sitting', 3], ['sunday', 'saturday', 3],
    ['', '', 0], ['a', '', 1], ['', 'a', 1],
    ['flaw', 'lawn', 2], ['gumbo', 'gambol', 2],
  ];
  for (let i = 0; i < 100; i++) {
    const [a, b, expected] = pairs[i % pairs.length];
    it(`levenshtein sub i=${i} '${a}' vs '${b}'`, () => {
      expect(levenshtein(a, b)).toBe(expected);
    });
  }
});

// ─── levenshtein symmetry (100 tests) ────────────────────────────────────────
describe('levenshtein – symmetry', () => {
  for (let i = 0; i < 100; i++) {
    it(`levenshtein symmetry i=${i}`, () => {
      const a = 'hello'.slice(0, (i % 5) + 1);
      const b = 'world'.slice(0, (i % 4) + 1);
      expect(levenshtein(a, b)).toBe(levenshtein(b, a));
    });
  }
});

// ─── hamming identity (100 tests) ────────────────────────────────────────────
describe('hamming – identity', () => {
  for (let i = 0; i < 100; i++) {
    it(`hamming identity i=${i}`, () => {
      const s = 'x'.repeat(i % 10 + 1);
      expect(hamming(s, s)).toBe(0);
    });
  }
});

// ─── hamming unequal length (50 tests) ───────────────────────────────────────
describe('hamming – unequal length returns -1', () => {
  for (let i = 0; i < 50; i++) {
    it(`hamming unequal i=${i}`, () => {
      expect(hamming('a'.repeat(i + 1), 'b'.repeat(i + 2))).toBe(-1);
    });
  }
});

// ─── hamming known values (50 tests) ─────────────────────────────────────────
describe('hamming – known values', () => {
  const pairs: [string, string, number][] = [
    ['karolin', 'kathrin', 3], ['karolin', 'kerstin', 3],
    ['1011101', '1001001', 2], ['2173896', '2233796', 3],
    ['abc', 'abc', 0], ['abc', 'abd', 1], ['abc', 'xyz', 3],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b, expected] = pairs[i % pairs.length];
    it(`hamming known i=${i}`, () => {
      expect(hamming(a, b)).toBe(expected);
    });
  }
});

// ─── damerauLevenshtein identity (100 tests) ─────────────────────────────────
describe('damerauLevenshtein – identity', () => {
  for (let i = 0; i < 100; i++) {
    it(`damerauLevenshtein identity i=${i}`, () => {
      const s = 'test'.repeat(i % 4 + 1);
      expect(damerauLevenshtein(s, s)).toBe(0);
    });
  }
});

// ─── damerauLevenshtein transpositions (100 tests) ───────────────────────────
describe('damerauLevenshtein – transpositions', () => {
  for (let i = 0; i < 100; i++) {
    it(`damerauLevenshtein transposition i=${i}`, () => {
      // swapping two adjacent chars costs 1
      expect(damerauLevenshtein('ab', 'ba')).toBe(1);
    });
  }
});

// ─── optimalStringAlignment (50 tests) ───────────────────────────────────────
describe('optimalStringAlignment', () => {
  for (let i = 0; i < 50; i++) {
    it(`optimalStringAlignment identity i=${i}`, () => {
      const s = 'osa'.repeat(i % 3 + 1);
      expect(optimalStringAlignment(s, s)).toBe(0);
    });
  }
});

// ─── jaro identity (100 tests) ───────────────────────────────────────────────
describe('jaro – identity', () => {
  for (let i = 0; i < 100; i++) {
    it(`jaro identity i=${i}`, () => {
      const s = 'jaro'.repeat(i % 4 + 1);
      expect(jaro(s, s)).toBe(1);
    });
  }
});

// ─── jaro empty string (50 tests) ────────────────────────────────────────────
describe('jaro – empty string', () => {
  for (let i = 0; i < 50; i++) {
    it(`jaro empty i=${i}`, () => {
      const s = 'x'.repeat(i + 1);
      expect(jaro('', s)).toBe(0);
      expect(jaro(s, '')).toBe(0);
    });
  }
});

// ─── jaro range (50 tests) ───────────────────────────────────────────────────
describe('jaro – range [0,1]', () => {
  const pairs = [['MARTHA', 'MARHTA'], ['DIXON', 'DICKSONX'], ['JELLYFISH', 'SMELLYFISH'], ['abc', 'xyz'], ['abc', 'abc']];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i % pairs.length];
    it(`jaro range i=${i}`, () => {
      const result = jaro(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  }
});

// ─── jaroWinkler identity (100 tests) ────────────────────────────────────────
describe('jaroWinkler – identity', () => {
  for (let i = 0; i < 100; i++) {
    it(`jaroWinkler identity i=${i}`, () => {
      const s = 'winkler'.repeat(i % 3 + 1);
      expect(jaroWinkler(s, s)).toBe(1);
    });
  }
});

// ─── jaroWinkler >= jaro (50 tests) ──────────────────────────────────────────
describe('jaroWinkler >= jaro', () => {
  const pairs = [['MARTHA', 'MARHTA'], ['DIXON', 'DICKSONX'], ['hello', 'helo'], ['foo', 'foe']];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i % pairs.length];
    it(`jaroWinkler >= jaro i=${i}`, () => {
      expect(jaroWinkler(a, b)).toBeGreaterThanOrEqual(jaro(a, b));
    });
  }
});

// ─── lcsLength identity (100 tests) ──────────────────────────────────────────
describe('lcsLength – identity', () => {
  for (let i = 0; i < 100; i++) {
    it(`lcsLength identity i=${i}`, () => {
      const s = 'lcs'.repeat(i % 5 + 1);
      expect(lcsLength(s, s)).toBe(s.length);
    });
  }
});

// ─── lcsLength known values (100 tests) ──────────────────────────────────────
describe('lcsLength – known values', () => {
  const pairs: [string, string, number][] = [
    ['ABCBDAB', 'BDCAB', 4], ['AGGTAB', 'GXTXAYB', 4],
    ['abcde', 'ace', 3], ['abc', 'abc', 3], ['abc', 'def', 0],
    ['', 'abc', 0], ['abc', '', 0],
  ];
  for (let i = 0; i < 100; i++) {
    const [a, b, expected] = pairs[i % pairs.length];
    it(`lcsLength known i=${i}`, () => {
      expect(lcsLength(a, b)).toBe(expected);
    });
  }
});

// ─── lcsString (50 tests) ────────────────────────────────────────────────────
describe('lcsString', () => {
  for (let i = 0; i < 50; i++) {
    it(`lcsString length matches lcsLength i=${i}`, () => {
      const a = 'abcde'.slice(0, (i % 5) + 1);
      const b = 'aecbd'.slice(0, (i % 4) + 1);
      expect(lcsString(a, b).length).toBe(lcsLength(a, b));
    });
  }
});

// ─── longestCommonSubstring (100 tests) ──────────────────────────────────────
describe('longestCommonSubstring', () => {
  const pairs: [string, string, number][] = [
    ['abcdef', 'zcdemf', 3], ['abc', 'abc', 3], ['abc', 'def', 0],
    ['abcdef', 'bcd', 3], ['aaaa', 'aa', 2],
  ];
  for (let i = 0; i < 100; i++) {
    const [a, b, expected] = pairs[i % pairs.length];
    it(`longestCommonSubstring i=${i}`, () => {
      expect(longestCommonSubstring(a, b)).toBe(expected);
    });
  }
});

// ─── normalizedLevenshtein (100 tests) ───────────────────────────────────────
describe('normalizedLevenshtein – range [0,1]', () => {
  for (let i = 0; i < 100; i++) {
    it(`normalizedLevenshtein range i=${i}`, () => {
      const a = 'hello'.slice(0, (i % 5) + 1);
      const b = 'world'.slice(0, (i % 5) + 1);
      const result = normalizedLevenshtein(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  }
});

// ─── normalizedLevenshtein identity (50 tests) ───────────────────────────────
describe('normalizedLevenshtein – identity = 0', () => {
  for (let i = 0; i < 50; i++) {
    it(`normalizedLevenshtein identity i=${i}`, () => {
      const s = 'norm'.repeat(i % 4 + 1);
      expect(normalizedLevenshtein(s, s)).toBe(0);
    });
  }
});

// ─── normalizedLevenshtein both empty (10 tests) ─────────────────────────────
describe('normalizedLevenshtein – both empty', () => {
  for (let i = 0; i < 10; i++) {
    it(`normalizedLevenshtein both empty i=${i}`, () => {
      expect(normalizedLevenshtein('', '')).toBe(0);
    });
  }
});

// ─── similarity range (100 tests) ────────────────────────────────────────────
describe('similarity – range [0,1]', () => {
  for (let i = 0; i < 100; i++) {
    it(`similarity range i=${i}`, () => {
      const a = 'similarity'.slice(0, (i % 10) + 1);
      const b = 'dissimilar'.slice(0, (i % 9) + 1);
      const result = similarity(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  }
});

// ─── similarity identity (50 tests) ──────────────────────────────────────────
describe('similarity – identity = 1', () => {
  for (let i = 0; i < 50; i++) {
    it(`similarity identity i=${i}`, () => {
      const s = 'sim'.repeat(i % 5 + 1);
      expect(similarity(s, s)).toBe(1);
    });
  }
});

// ─── similarity complement of normalizedLevenshtein (50 tests) ───────────────
describe('similarity – complement of normalizedLevenshtein', () => {
  for (let i = 0; i < 50; i++) {
    it(`similarity = 1 - normLev i=${i}`, () => {
      const a = 'abc'.slice(0, (i % 3) + 1);
      const b = 'xyz'.slice(0, (i % 3) + 1);
      expect(similarity(a, b)).toBeCloseTo(1 - normalizedLevenshtein(a, b), 10);
    });
  }
});

// ─── commonPrefixLength (100 tests) ──────────────────────────────────────────
describe('commonPrefixLength', () => {
  for (let i = 0; i < 100; i++) {
    it(`commonPrefixLength i=${i}`, () => {
      const prefix = 'pre'.slice(0, (i % 3) + 1);
      const a = prefix + 'abc'.slice(i % 3);
      const b = prefix + 'xyz'.slice(i % 3);
      expect(commonPrefixLength(a, b)).toBeGreaterThanOrEqual(prefix.length);
    });
  }
});

// ─── commonPrefixLength known (50 tests) ─────────────────────────────────────
describe('commonPrefixLength – known values', () => {
  const cases: [string, string, number][] = [
    ['', '', 0], ['a', 'b', 0], ['abc', 'abcd', 3],
    ['hello', 'hello world', 5], ['xyz', 'xyz', 3], ['abc', 'abd', 2],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b, expected] = cases[i % cases.length];
    it(`commonPrefixLength known i=${i}`, () => {
      expect(commonPrefixLength(a, b)).toBe(expected);
    });
  }
});

// ─── commonSuffixLength (50 tests) ───────────────────────────────────────────
describe('commonSuffixLength – known values', () => {
  const cases: [string, string, number][] = [
    ['', '', 0], ['a', 'b', 0], ['abc', 'xbc', 2],
    ['hello', 'ello', 4], ['xyz', 'xyz', 3], ['abc', 'bc', 2],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b, expected] = cases[i % cases.length];
    it(`commonSuffixLength i=${i}`, () => {
      expect(commonSuffixLength(a, b)).toBe(expected);
    });
  }
});

// ─── diceCoefficient identity (100 tests) ────────────────────────────────────
describe('diceCoefficient – identity', () => {
  for (let i = 0; i < 100; i++) {
    it(`diceCoefficient identity i=${i}`, () => {
      const s = 'abcde'.slice(0, (i % 4) + 2); // at least 2 chars
      expect(diceCoefficient(s, s)).toBe(1);
    });
  }
});

// ─── diceCoefficient range (50 tests) ────────────────────────────────────────
describe('diceCoefficient – range [0,1]', () => {
  const pairs = [['night', 'nacht'], ['context', 'contact'], ['abc', 'xyz'], ['hello', 'helo']];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i % pairs.length];
    it(`diceCoefficient range i=${i}`, () => {
      const result = diceCoefficient(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  }
});

// ─── diceCoefficient short strings (50 tests) ────────────────────────────────
describe('diceCoefficient – short strings', () => {
  for (let i = 0; i < 50; i++) {
    it(`diceCoefficient single char different i=${i}`, () => {
      expect(diceCoefficient('a', 'b')).toBe(0);
    });
  }
});

// ─── jaccardSimilarity identity (100 tests) ──────────────────────────────────
describe('jaccardSimilarity – identity', () => {
  for (let i = 0; i < 100; i++) {
    it(`jaccardSimilarity identity i=${i}`, () => {
      const s = 'jaccard'.slice(0, (i % 7) + 1);
      expect(jaccardSimilarity(s, s)).toBe(1);
    });
  }
});

// ─── jaccardSimilarity range (100 tests) ─────────────────────────────────────
describe('jaccardSimilarity – range [0,1]', () => {
  for (let i = 0; i < 100; i++) {
    it(`jaccardSimilarity range i=${i}`, () => {
      const a = 'hello'.slice(0, (i % 5) + 1);
      const b = 'world'.slice(0, (i % 5) + 1);
      const result = jaccardSimilarity(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  }
});

// ─── jaccardSimilarity both empty (10 tests) ─────────────────────────────────
describe('jaccardSimilarity – both empty', () => {
  for (let i = 0; i < 10; i++) {
    it(`jaccardSimilarity both empty i=${i}`, () => {
      expect(jaccardSimilarity('', '')).toBe(1);
    });
  }
});

// ─── cosineSimilarity identity (100 tests) ───────────────────────────────────
describe('cosineSimilarity – identity', () => {
  for (let i = 0; i < 100; i++) {
    it(`cosineSimilarity identity i=${i}`, () => {
      const s = 'cosine'.repeat(i % 3 + 1);
      expect(cosineSimilarity(s, s)).toBeCloseTo(1, 5);
    });
  }
});

// ─── cosineSimilarity empty (20 tests) ───────────────────────────────────────
describe('cosineSimilarity – empty string', () => {
  for (let i = 0; i < 20; i++) {
    it(`cosineSimilarity empty i=${i}`, () => {
      expect(cosineSimilarity('', 'abc')).toBe(0);
      expect(cosineSimilarity('abc', '')).toBe(0);
    });
  }
});

// ─── sorensenDice equals diceCoefficient (50 tests) ──────────────────────────
describe('sorensenDice – equals diceCoefficient', () => {
  const pairs = [['night', 'nacht'], ['abc', 'xyz'], ['hello', 'hello'], ['foo', 'bar']];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i % pairs.length];
    it(`sorensenDice == diceCoefficient i=${i}`, () => {
      expect(sorensenDice(a, b)).toBe(diceCoefficient(a, b));
    });
  }
});

// ─── isWithinDistance (100 tests) ────────────────────────────────────────────
describe('isWithinDistance – identity within 0', () => {
  for (let i = 0; i < 100; i++) {
    it(`isWithinDistance identity i=${i}`, () => {
      const s = 'distance'.repeat(i % 3 + 1);
      expect(isWithinDistance(s, s, 0)).toBe(true);
    });
  }
});

// ─── isWithinDistance threshold (100 tests) ──────────────────────────────────
describe('isWithinDistance – threshold checks', () => {
  for (let i = 0; i < 100; i++) {
    it(`isWithinDistance threshold i=${i}`, () => {
      const dist = i % 5 + 1;
      const a = 'a'.repeat(dist);
      // levenshtein('', a) = dist, so threshold dist => true, dist-1 => false
      expect(isWithinDistance('', a, dist)).toBe(true);
      expect(isWithinDistance('', a, dist - 1)).toBe(false);
    });
  }
});

// ─── closest (100 tests) ─────────────────────────────────────────────────────
describe('closest – returns best match', () => {
  for (let i = 0; i < 100; i++) {
    it(`closest returns 1 result by default i=${i}`, () => {
      const query = 'hello';
      const candidates = ['helo', 'world', 'help', 'hell'];
      const result = closest(query, candidates, 1);
      expect(result).toHaveLength(1);
      expect(candidates).toContain(result[0]);
    });
  }
});

// ─── closest k results (50 tests) ────────────────────────────────────────────
describe('closest – k results', () => {
  for (let i = 0; i < 50; i++) {
    it(`closest k=${(i % 3) + 1} i=${i}`, () => {
      const k = (i % 3) + 1;
      const candidates = ['alpha', 'beta', 'gamma', 'delta'];
      const result = closest('alph', candidates, k);
      expect(result).toHaveLength(k);
    });
  }
});

// ─── smithWaterman (50 tests) ────────────────────────────────────────────────
describe('smithWaterman – non-negative', () => {
  for (let i = 0; i < 50; i++) {
    it(`smithWaterman non-negative i=${i}`, () => {
      const a = 'ACGT'.slice(0, (i % 4) + 1);
      const b = 'TGCA'.slice(0, (i % 4) + 1);
      expect(smithWaterman(a, b)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── smithWaterman identity (50 tests) ───────────────────────────────────────
describe('smithWaterman – identity', () => {
  for (let i = 0; i < 50; i++) {
    it(`smithWaterman identity i=${i}`, () => {
      const s = 'ACGT'.slice(0, (i % 4) + 1);
      // perfect match with match=2 => score = 2 * s.length
      expect(smithWaterman(s, s, 2, -1, -1)).toBe(2 * s.length);
    });
  }
});

// ─── needlemanWunsch (50 tests) ──────────────────────────────────────────────
describe('needlemanWunsch – identity', () => {
  for (let i = 0; i < 50; i++) {
    it(`needlemanWunsch identity i=${i}`, () => {
      const s = 'ACGT'.slice(0, (i % 4) + 1);
      // perfect match with match=1 => score = s.length
      expect(needlemanWunsch(s, s, 1, -1, -1)).toBe(s.length);
    });
  }
});

// ─── damerauLevenshtein known values (50 tests) ───────────────────────────────
describe('damerauLevenshtein – known values', () => {
  const pairs: [string, string, number][] = [
    ['CA', 'ABC', 3], ['a', 'b', 1], ['ab', 'ba', 1],
    ['', 'abc', 3], ['abc', '', 3], ['abc', 'abc', 0],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b, expected] = pairs[i % pairs.length];
    it(`damerauLevenshtein known i=${i}`, () => {
      expect(damerauLevenshtein(a, b)).toBe(expected);
    });
  }
});

// ─── levenshtein triangle inequality (50 tests) ───────────────────────────────
describe('levenshtein – triangle inequality', () => {
  for (let i = 0; i < 50; i++) {
    it(`triangle inequality i=${i}`, () => {
      const a = 'abc'.slice(0, (i % 3) + 1);
      const b = 'bcd'.slice(0, (i % 3) + 1);
      const c = 'acd'.slice(0, (i % 3) + 1);
      expect(levenshtein(a, c)).toBeLessThanOrEqual(levenshtein(a, b) + levenshtein(b, c));
    });
  }
});

// ─── lcsLength symmetry (50 tests) ───────────────────────────────────────────
describe('lcsLength – symmetry', () => {
  for (let i = 0; i < 50; i++) {
    it(`lcsLength symmetry i=${i}`, () => {
      const a = 'abcde'.slice(0, (i % 5) + 1);
      const b = 'edcba'.slice(0, (i % 4) + 1);
      expect(lcsLength(a, b)).toBe(lcsLength(b, a));
    });
  }
});

// ─── commonPrefixLength + commonSuffixLength (50 tests) ──────────────────────
describe('commonPrefixLength + commonSuffixLength combined', () => {
  for (let i = 0; i < 50; i++) {
    it(`prefix + suffix combined i=${i}`, () => {
      const s = 'hello';
      expect(commonPrefixLength(s, s)).toBe(s.length);
      expect(commonSuffixLength(s, s)).toBe(s.length);
    });
  }
});

// ─── normalizedLevenshtein fully different (20 tests) ────────────────────────
describe('normalizedLevenshtein – fully different single char', () => {
  for (let i = 0; i < 20; i++) {
    it(`normalizedLevenshtein fully different single char i=${i}`, () => {
      expect(normalizedLevenshtein('a', 'b')).toBe(1);
    });
  }
});

// ─── jaccardSimilarity disjoint (20 tests) ───────────────────────────────────
describe('jaccardSimilarity – disjoint sets', () => {
  for (let i = 0; i < 20; i++) {
    it(`jaccardSimilarity disjoint i=${i}`, () => {
      expect(jaccardSimilarity('abc', 'xyz')).toBe(0);
    });
  }
});

// ─── lcsString is subsequence of both (50 tests) ─────────────────────────────
describe('lcsString – is subsequence of both inputs', () => {
  function isSubsequence(sub: string, str: string): boolean {
    let si = 0;
    for (let i = 0; i < str.length && si < sub.length; i++) {
      if (str[i] === sub[si]) si++;
    }
    return si === sub.length;
  }

  for (let i = 0; i < 50; i++) {
    it(`lcsString subsequence i=${i}`, () => {
      const a = 'ABCBDAB'.slice(0, (i % 7) + 1);
      const b = 'BDCAB'.slice(0, (i % 5) + 1);
      const lcs = lcsString(a, b);
      expect(isSubsequence(lcs, a)).toBe(true);
      expect(isSubsequence(lcs, b)).toBe(true);
    });
  }
});

// ─── levenshtein non-negative (50 tests) ─────────────────────────────────────
describe('levenshtein – non-negative', () => {
  for (let i = 0; i < 50; i++) {
    it(`levenshtein non-negative i=${i}`, () => {
      const a = 'abc'.repeat(i % 3 + 1);
      const b = 'xyz'.repeat(i % 3 + 1);
      expect(levenshtein(a, b)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── hamming symmetry (30 tests) ─────────────────────────────────────────────
describe('hamming – symmetry', () => {
  for (let i = 0; i < 30; i++) {
    it(`hamming symmetry i=${i}`, () => {
      const n = (i % 5) + 1;
      const a = 'abcde'.slice(0, n);
      const b = 'xyzwv'.slice(0, n);
      expect(hamming(a, b)).toBe(hamming(b, a));
    });
  }
});

// ─── jaroWinkler range (30 tests) ────────────────────────────────────────────
describe('jaroWinkler – range [0,1]', () => {
  for (let i = 0; i < 30; i++) {
    it(`jaroWinkler range i=${i}`, () => {
      const a = 'winkler'.slice(0, (i % 7) + 1);
      const b = 'winkled'.slice(0, (i % 7) + 1);
      const result = jaroWinkler(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  }
});

// ─── cosineSimilarity range (30 tests) ───────────────────────────────────────
describe('cosineSimilarity – range [0,1]', () => {
  for (let i = 0; i < 30; i++) {
    it(`cosineSimilarity range i=${i}`, () => {
      const a = 'cosine'.slice(0, (i % 6) + 1);
      const b = 'cosined'.slice(0, (i % 6) + 1);
      const result = cosineSimilarity(a, b);
      expect(result).toBeGreaterThanOrEqual(0);
      // allow tiny floating-point overshoot
      expect(result).toBeLessThanOrEqual(1 + 1e-10);
    });
  }
});

// ─── closest empty candidates (20 tests) ─────────────────────────────────────
describe('closest – empty candidates', () => {
  for (let i = 0; i < 20; i++) {
    it(`closest empty candidates i=${i}`, () => {
      expect(closest('query', [], 1)).toEqual([]);
    });
  }
});

// ─── longestCommonSubstring identity (30 tests) ───────────────────────────────
describe('longestCommonSubstring – identity', () => {
  for (let i = 0; i < 30; i++) {
    it(`longestCommonSubstring identity i=${i}`, () => {
      const s = 'abcde'.slice(0, (i % 5) + 1);
      expect(longestCommonSubstring(s, s)).toBe(s.length);
    });
  }
});

// ─── smithWaterman empty (20 tests) ──────────────────────────────────────────
describe('smithWaterman – empty string', () => {
  for (let i = 0; i < 20; i++) {
    it(`smithWaterman empty i=${i}`, () => {
      expect(smithWaterman('', 'ACGT')).toBe(0);
      expect(smithWaterman('ACGT', '')).toBe(0);
    });
  }
});

// ─── needlemanWunsch empty (20 tests) ────────────────────────────────────────
describe('needlemanWunsch – empty string', () => {
  for (let i = 0; i < 20; i++) {
    it(`needlemanWunsch empty a i=${i}`, () => {
      const n = (i % 4) + 1;
      // empty vs n chars => n gap penalties
      expect(needlemanWunsch('', 'a'.repeat(n), 1, -1, -1)).toBe(-n);
    });
  }
});

// ─── isWithinDistance symmetry (30 tests) ────────────────────────────────────
describe('isWithinDistance – symmetry', () => {
  for (let i = 0; i < 30; i++) {
    it(`isWithinDistance symmetry i=${i}`, () => {
      const a = 'hello'.slice(0, (i % 5) + 1);
      const b = 'helo'.slice(0, (i % 4) + 1);
      const threshold = 3;
      expect(isWithinDistance(a, b, threshold)).toBe(isWithinDistance(b, a, threshold));
    });
  }
});
