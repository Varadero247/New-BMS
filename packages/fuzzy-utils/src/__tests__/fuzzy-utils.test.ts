// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  levenshtein,
  levenshteinSimilarity,
  damerauLevenshtein,
  hammingDistance,
  lcsLength,
  lcsSimilarity,
  editOperations,
  jaro,
  jaroWinkler,
  soundex,
  soundexSimilar,
  metaphone,
  doubleMetaphone,
  tokenSort,
  tokenSet,
  tokenOverlap,
  ngramSimilarity,
  cosineSimilarity,
  fuzzySearch,
  fuzzyMatch,
  bestMatch,
  rankMatches,
  areAnagrams,
  longestCommonSubstring,
  commonPrefix,
  commonSuffix,
  abbreviationMatch,
  normalizeForComparison,
} from '../fuzzy-utils';

// ---------------------------------------------------------------------------
// 1. levenshtein — 100 loop tests
// ---------------------------------------------------------------------------
describe('levenshtein loop (non-negative)', () => {
  const words = [
    'abc', 'abcd', 'abcde', 'ab', 'a', '', 'xyz', 'test', 'hello', 'world',
    'foo', 'bar', 'baz', 'qux', 'quux', 'cat', 'dog', 'hat', 'hot', 'lot',
  ];
  for (let i = 0; i < 100; i++) {
    const a = words[i % words.length];
    const b = words[(i + 3) % words.length];
    it(`levenshtein(${JSON.stringify(a)}, ${JSON.stringify(b)}) >= 0 [${i}]`, () => {
      expect(levenshtein(a, b)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. levenshtein known values — 20 tests
// ---------------------------------------------------------------------------
describe('levenshtein known values', () => {
  const cases: [string, string, number][] = [
    ['', '', 0],
    ['a', '', 1],
    ['', 'b', 1],
    ['a', 'a', 0],
    ['abc', 'abc', 0],
    ['kitten', 'sitting', 3],
    ['saturday', 'sunday', 3],
    ['abc', 'cab', 2],
    ['intention', 'execution', 5],
    ['abc', 'ab', 1],
    ['ab', 'abc', 1],
    ['a', 'b', 1],
    ['abc', 'axc', 1],
    ['horse', 'ros', 3],
    ['exponential', 'polynomial', 6],
    ['algorithm', 'altruistic', 6],
    ['abcdef', 'azced', 3],
    ['ca', 'abc', 3],
    ['book', 'back', 2],
    ['flaw', 'lawn', 2],
  ];
  for (const [a, b, expected] of cases) {
    it(`levenshtein(${JSON.stringify(a)}, ${JSON.stringify(b)}) === ${expected}`, () => {
      expect(levenshtein(a, b)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. levenshteinSimilarity — 50 loop tests
// ---------------------------------------------------------------------------
describe('levenshteinSimilarity range [0,1]', () => {
  const pairs: [string, string][] = [
    ['apple', 'apple'], ['apple', 'aple'], ['hello', 'helo'], ['test', 'text'],
    ['abc', 'xyz'], ['', ''], ['cat', 'car'], ['dog', 'log'], ['foo', 'bar'],
    ['similar', 'simlar'], ['distance', 'distanc'], ['fuzzy', 'fuzz'],
    ['algorithm', 'logarithm'], ['data', 'date'], ['input', 'output'],
    ['abc', ''], ['', 'abc'], ['python', 'pythons'], ['java', 'javascript'],
    ['node', 'nodes'], ['react', 'reacts'], ['vue', 'vue'], ['angular', 'angularjs'],
    ['typescript', 'javascript'], ['html', 'css'], ['sql', 'nosql'],
    ['graph', 'grape'], ['train', 'trail'], ['brain', 'braid'], ['chair', 'chain'],
    ['world', 'word'], ['string', 'strong'], ['bring', 'brink'], ['thing', 'think'],
    ['about', 'above'], ['dance', 'lance'], ['fancy', 'nancy'], ['mango', 'tango'],
    ['light', 'night'], ['fight', 'right'], ['might', 'sight'], ['tight', 'light'],
    ['black', 'slack'], ['crack', 'track'], ['snack', 'stack'], ['beach', 'peach'],
    ['reach', 'teach'], ['learn', 'yearn'], ['heart', 'heard'], ['smart', 'start'],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i];
    it(`levenshteinSimilarity(${JSON.stringify(a)}, ${JSON.stringify(b)}) in [0,1] [${i}]`, () => {
      const score = levenshteinSimilarity(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. damerauLevenshtein — 50 tests (includes transpositions)
// ---------------------------------------------------------------------------
describe('damerauLevenshtein', () => {
  it('transposition ab→ba is distance 1', () => {
    expect(damerauLevenshtein('ab', 'ba')).toBe(1);
  });
  it('transposition ca→ac is distance 1', () => {
    expect(damerauLevenshtein('ca', 'ac')).toBe(1);
  });
  it('identical strings → 0', () => {
    expect(damerauLevenshtein('hello', 'hello')).toBe(0);
  });
  it('empty strings → 0', () => {
    expect(damerauLevenshtein('', '')).toBe(0);
  });
  it('damerau <= levenshtein for any pair (transpositions reduce cost)', () => {
    const pairs: [string, string][] = [
      ['ab', 'ba'], ['abc', 'acb'], ['abcd', 'abdc'], ['hello', 'hlelo'],
      ['world', 'wrold'], ['test', 'tset'], ['data', 'daet'], ['fuzzy', 'fuzz'],
    ];
    for (const [a, b] of pairs) {
      expect(damerauLevenshtein(a, b)).toBeLessThanOrEqual(levenshtein(a, b));
    }
  });

  const words = ['cat', 'dog', 'hat', 'bat', 'rat', 'sat', 'mat', 'fat', 'pat', 'vat'];
  for (let i = 0; i < 40; i++) {
    const a = words[i % words.length];
    const b = words[(i + 2) % words.length];
    it(`damerauLevenshtein(${a}, ${b}) >= 0 [loop ${i}]`, () => {
      expect(damerauLevenshtein(a, b)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. hammingDistance — 50 tests
// ---------------------------------------------------------------------------
describe('hammingDistance', () => {
  it('identical strings → 0', () => {
    expect(hammingDistance('abc', 'abc')).toBe(0);
  });
  it('different lengths → -1', () => {
    expect(hammingDistance('abc', 'ab')).toBe(-1);
  });
  it('completely different → length', () => {
    expect(hammingDistance('abc', 'xyz')).toBe(3);
  });
  it('single char diff', () => {
    expect(hammingDistance('abc', 'aXc')).toBe(1);
  });
  it('two char diffs', () => {
    expect(hammingDistance('abcd', 'aXcX')).toBe(2);
  });

  const sameLen = [
    ['karolin', 'kathrin'],
    ['1011101', '1001001'],
    ['2173896', '2233796'],
    ['toned', 'roses'],
    ['1011101', '1001001'],
  ];
  for (let i = 0; i < sameLen.length; i++) {
    const [a, b] = sameLen[i];
    it(`hammingDistance(${a}, ${b}) >= 0 [${i}]`, () => {
      expect(hammingDistance(a, b)).toBeGreaterThanOrEqual(0);
    });
  }

  // Loop 44 more
  const words = ['abcde', 'fghij', 'klmno', 'pqrst', 'uvwxy'];
  for (let i = 0; i < 44; i++) {
    const a = words[i % words.length];
    const b = words[(i + 1) % words.length];
    it(`hammingDistance loop ${i}: same-length strings return count >= 0`, () => {
      const dist = hammingDistance(a, b);
      expect(dist).toBeGreaterThanOrEqual(0);
      expect(dist).toBeLessThanOrEqual(a.length);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. lcsLength — 30 tests
// ---------------------------------------------------------------------------
describe('lcsLength', () => {
  const cases: [string, string, number][] = [
    ['', '', 0],
    ['a', 'a', 1],
    ['abc', 'abc', 3],
    ['abc', 'xyz', 0],
    ['abcdef', 'ace', 3],
    ['abcde', 'ace', 3],
    ['aab', 'azb', 2],
    ['longest', 'stone', 3],
    ['AGGTAB', 'GXTXAYB', 4],
    ['ABCBDAB', 'BDCAB', 4],
    ['abcba', 'abcbcba', 5],
    ['oxcpqrsvwf', 'shmtulqoxq', 3],    // LCS = oxq (3)
    ['nematode', 'empty', 3],
    ['abcde', 'abcde', 5],
    ['hello', 'world', 1],              // LCS = 'l' or 'o' (1)
    ['abc', 'ac', 2],
    ['a', '', 0],
    ['', 'b', 0],
    ['abc', 'cba', 1],
    ['aacbcbba', 'aabc', 4],
    ['xmjyauz', 'mzjawxu', 4],
    ['abab', 'baba', 3],
    ['abcabc', 'abc', 3],
    ['test', 'testing', 4],
    ['fuzzy', 'fuzz', 4],
    ['algorithm', 'logarithm', 7],      // LCS = logarithm minus 'l' = lgorithm? alg shared...
    ['abc', 'bcd', 2],
    ['AABBA', 'BBAA', 3],
    ['apple', 'pale', 3],
    ['cats', 'cast', 3],
  ];
  for (const [a, b, expected] of cases) {
    it(`lcsLength(${JSON.stringify(a)}, ${JSON.stringify(b)}) === ${expected}`, () => {
      expect(lcsLength(a, b)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. jaro — 50 tests, range [0,1]
// ---------------------------------------------------------------------------
describe('jaro range [0,1]', () => {
  const pairs = [
    ['apple', 'apple'], ['apple', 'aple'], ['hello', 'world'], ['test', 'text'],
    ['abc', 'xyz'], ['', ''], ['cat', 'car'], ['dog', 'log'], ['foo', 'bar'],
    ['similar', 'simlar'], ['MARTHA', 'MARHTA'], ['DWAYNE', 'DUANE'],
    ['DIXON', 'DICKSONX'], ['', 'abc'], ['abc', ''], ['a', 'a'],
    ['a', 'b'], ['ab', 'ba'], ['abc', 'abc'], ['abc', 'cba'],
    ['algorithm', 'altruistic'], ['python', 'pythons'], ['java', 'javascript'],
    ['node', 'nodes'], ['react', 'reacts'], ['vue', 'vue'], ['angular', 'angularjs'],
    ['typescript', 'javascript'], ['html', 'css'], ['sql', 'nosql'],
    ['graph', 'grape'], ['train', 'trail'], ['brain', 'braid'], ['chair', 'chain'],
    ['world', 'word'], ['string', 'strong'], ['bring', 'brink'], ['thing', 'think'],
    ['about', 'above'], ['dance', 'lance'], ['fancy', 'nancy'], ['mango', 'tango'],
    ['light', 'night'], ['fight', 'right'], ['might', 'sight'], ['tight', 'light'],
    ['black', 'slack'], ['crack', 'track'], ['snack', 'stack'], ['beach', 'peach'],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i];
    it(`jaro(${JSON.stringify(a)}, ${JSON.stringify(b)}) in [0,1] [${i}]`, () => {
      const score = jaro(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. jaro known values — 20 tests
// ---------------------------------------------------------------------------
describe('jaro known values', () => {
  it("jaro('', '') === 1", () => {
    expect(jaro('', '')).toBe(1);
  });
  it("jaro('a', 'a') === 1", () => {
    expect(jaro('a', 'a')).toBe(1);
  });
  it("jaro('a', 'b') === 0", () => {
    expect(jaro('a', 'b')).toBe(0);
  });
  it("jaro('', 'abc') === 0", () => {
    expect(jaro('', 'abc')).toBe(0);
  });
  it("jaro('abc', '') === 0", () => {
    expect(jaro('abc', '')).toBe(0);
  });
  it("jaro('abc', 'abc') === 1", () => {
    expect(jaro('abc', 'abc')).toBe(1);
  });
  it("jaro('MARTHA', 'MARHTA') ≈ 0.944", () => {
    expect(jaro('MARTHA', 'MARHTA')).toBeCloseTo(0.944, 2);
  });
  it("jaro('DWAYNE', 'DUANE') ≈ 0.822", () => {
    expect(jaro('DWAYNE', 'DUANE')).toBeCloseTo(0.822, 2);
  });
  it("jaro('DIXON', 'DICKSONX') ≈ 0.767", () => {
    expect(jaro('DIXON', 'DICKSONX')).toBeCloseTo(0.767, 2);
  });
  it("jaro('hello', 'hello') === 1", () => {
    expect(jaro('hello', 'hello')).toBe(1);
  });
  it("jaro('abc', 'xyz') === 0", () => {
    expect(jaro('abc', 'xyz')).toBe(0);
  });
  it("jaro('cat', 'cat') === 1", () => {
    expect(jaro('cat', 'cat')).toBe(1);
  });
  it("jaro('aa', 'ab') > 0", () => {
    expect(jaro('aa', 'ab')).toBeGreaterThan(0);
  });
  it("jaro('abc', 'ac') > 0", () => {
    expect(jaro('abc', 'ac')).toBeGreaterThan(0);
  });
  it("jaro('test', 'text') > 0.8", () => {
    expect(jaro('test', 'text')).toBeGreaterThan(0.8);
  });
  it("jaro('NLP', 'NLP') === 1", () => {
    expect(jaro('NLP', 'NLP')).toBe(1);
  });
  it("jaro('kitten', 'sitting') is between 0 and 1", () => {
    const score = jaro('kitten', 'sitting');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
  it("jaro('CRATE', 'TRACE') is between 0 and 1", () => {
    const score = jaro('CRATE', 'TRACE');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });
  it("jaro('abc', 'def') === 0 (no matches)", () => {
    expect(jaro('abc', 'def')).toBe(0);
  });
  it("jaro('abcde', 'abcde') === 1", () => {
    expect(jaro('abcde', 'abcde')).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 9. jaroWinkler — 50 tests
// ---------------------------------------------------------------------------
describe('jaroWinkler', () => {
  it("jaroWinkler('', '') === 1", () => {
    expect(jaroWinkler('', '')).toBe(1);
  });
  it("jaroWinkler('a', 'a') === 1", () => {
    expect(jaroWinkler('a', 'a')).toBe(1);
  });
  it("jaroWinkler in [0,1] for identical", () => {
    expect(jaroWinkler('hello', 'hello')).toBe(1);
  });
  it('jaroWinkler >= jaro for strings with common prefix (MARTHA/MARHTA)', () => {
    const a = 'MARTHA';
    const b = 'MARHTA';
    expect(jaroWinkler(a, b)).toBeGreaterThanOrEqual(jaro(a, b));
  });
  it('jaroWinkler >= jaro for strings with common prefix (apple/apply)', () => {
    expect(jaroWinkler('apple', 'apply')).toBeGreaterThanOrEqual(jaro('apple', 'apply'));
  });

  // Pairs that share at least a 1-char prefix → jaroWinkler >= jaro
  const sharedPrefixPairs: [string, string][] = [
    ['abc', 'abd'], ['test', 'text'], ['node', 'note'], ['react', 'reach'],
    ['data', 'date'], ['black', 'blank'], ['brain', 'brand'], ['cloud', 'clout'],
    ['dream', 'dread'], ['flame', 'flare'], ['grace', 'grade'], ['hello', 'hells'],
    ['input', 'inset'], ['japan', 'jarred'], ['karma', 'kart'], ['laser', 'lasso'],
    ['macro', 'macros'], ['naval', 'native'], ['ocean', 'octet'], ['piano', 'piane'],
    ['quest', 'quick'], ['rapid', 'raven'], ['solar', 'solid'], ['tiger', 'tight'],
    ['ultra', 'uncle'], ['valor', 'valet'], ['waste', 'watch'], ['xenon', 'xenon'],
    ['yield', 'yells'], ['zebra', 'zeta'], ['apple', 'apply'], ['apron', 'apron'],
    ['basic', 'basin'], ['candy', 'canny'], ['daisy', 'dairy'], ['eagle', 'early'],
    ['fable', 'facet'], ['happy', 'harpy'], ['image', 'imbue'],
    ['jolly', 'joust'], ['kitty', 'kiosk'], ['lemon', 'level'],
    ['mango', 'manor'], ['ninja', 'nimble'],
  ];
  for (let i = 0; i < sharedPrefixPairs.length; i++) {
    const [a, b] = sharedPrefixPairs[i];
    it(`jaroWinkler(${a}, ${b}) >= jaro(${a}, ${b}) [prefix pair ${i}]`, () => {
      expect(jaroWinkler(a, b)).toBeGreaterThanOrEqual(jaro(a, b));
    });
  }
});

// ---------------------------------------------------------------------------
// 10. soundex known values — 20 tests
// ---------------------------------------------------------------------------
describe('soundex known values', () => {
  const cases: [string, string][] = [
    ['Robert', 'R163'],
    ['Rupert', 'R163'],
    ['Rubin', 'R150'],
    ['Euler', 'E460'],
    ['Ellery', 'E460'],
    ['Gauss', 'G200'],
    ['Ghosh', 'G200'],
    ['Hilbert', 'H416'],
    ['Heilbronn', 'H416'],
    ['Knuth', 'K530'],
    ['Kant', 'K530'],
    ['Thompson', 'T512'],
    ['Smith', 'S530'],
    ['Smythe', 'S530'],
    ['Jackson', 'J250'],
    ['Lee', 'L000'],
    ['Washington', 'W252'],
    ['Jefferson', 'J162'],
    ['Lincoln', 'L524'],
    ['Adams', 'A352'],
  ];
  for (const [word, expected] of cases) {
    it(`soundex(${word}) === ${expected}`, () => {
      expect(soundex(word)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. soundexSimilar — 20 tests
// ---------------------------------------------------------------------------
describe('soundexSimilar', () => {
  const similarPairs: [string, string, boolean][] = [
    ['Robert', 'Rupert', true],
    ['Euler', 'Ellery', true],
    ['Gauss', 'Ghosh', true],
    ['Hilbert', 'Heilbronn', true],
    ['Smith', 'Smythe', true],
    ['Thompson', 'Thomson', false],
    ['Robert', 'Smith', false],
    ['John', 'Jane', true],    // Both J500
    ['Lee', 'Li', true],
    ['Jackson', 'Jakson', true],   // J250 == J250 (k and s share code 2)
    ['Knuth', 'Kant', true],
    ['Washington', 'Watson', false],
    ['Adams', 'Addams', true],
    ['Lincoln', 'Lenkon', false],
    ['Jefferson', 'Jeffreson', true],
    ['Alice', 'Alec', true],
    ['Brian', 'Bryan', true],
    ['Cathy', 'Kathy', false],     // C300 != K300 (different first letter)
    ['David', 'Davies', false],
    ['Emma', 'Em', true],          // E500 == E500
  ];
  for (const [a, b, expected] of similarPairs) {
    it(`soundexSimilar(${a}, ${b}) === ${expected}`, () => {
      expect(soundexSimilar(a, b)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. ngramSimilarity — 50 tests
// ---------------------------------------------------------------------------
describe('ngramSimilarity range [0,1]', () => {
  const pairs = [
    ['apple', 'apple'], ['apple', 'aple'], ['hello', 'world'], ['test', 'text'],
    ['abc', 'xyz'], ['', ''], ['cat', 'car'], ['dog', 'log'], ['foo', 'bar'],
    ['similar', 'simlar'], ['MARTHA', 'MARHTA'], ['distance', 'distanc'],
    ['algorithm', 'logarithm'], ['data', 'date'], ['input', 'output'],
    ['python', 'pythons'], ['java', 'javascript'], ['node', 'nodes'],
    ['react', 'reacts'], ['vue', 'vue'], ['angular', 'angularjs'],
    ['typescript', 'javascript'], ['html', 'css'], ['sql', 'nosql'],
    ['graph', 'grape'], ['train', 'trail'], ['brain', 'braid'], ['chair', 'chain'],
    ['world', 'word'], ['string', 'strong'], ['bring', 'brink'], ['thing', 'think'],
    ['about', 'above'], ['dance', 'lance'], ['fancy', 'nancy'], ['mango', 'tango'],
    ['light', 'night'], ['fight', 'right'], ['might', 'sight'], ['tight', 'light'],
    ['black', 'slack'], ['crack', 'track'], ['snack', 'stack'], ['beach', 'peach'],
    ['reach', 'teach'], ['learn', 'yearn'], ['heart', 'heard'], ['smart', 'start'],
    ['fuzzy', 'fuzz'], ['logic', 'local'],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i];
    it(`ngramSimilarity(${JSON.stringify(a)}, ${JSON.stringify(b)}) in [0,1] [${i}]`, () => {
      const score = ngramSimilarity(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. tokenSort — 30 tests
// ---------------------------------------------------------------------------
describe('tokenSort', () => {
  const phrasePairs: [string, string][] = [
    ['hello world', 'world hello'],
    ['the quick brown fox', 'fox brown quick the'],
    ['foo bar baz', 'baz bar foo'],
    ['apple banana cherry', 'cherry apple banana'],
    ['one two three', 'three one two'],
    ['a b c d', 'd c b a'],
    ['new york city', 'city new york'],
    ['red green blue', 'blue red green'],
    ['north south east west', 'west east south north'],
    ['alpha beta gamma', 'gamma alpha beta'],
    ['cat dog bird', 'bird cat dog'],
    ['sun moon star', 'star sun moon'],
    ['fire water earth', 'earth fire water'],
    ['small medium large', 'large small medium'],
    ['left right center', 'center left right'],
    ['happy sad angry', 'angry happy sad'],
    ['open close save', 'save open close'],
    ['read write execute', 'execute read write'],
    ['buy sell hold', 'hold buy sell'],
    ['start stop pause', 'pause start stop'],
    ['in out through', 'through in out'],
    ['up down left', 'left up down'],
    ['fast slow medium', 'medium fast slow'],
    ['hot warm cold', 'cold hot warm'],
    ['hard soft medium', 'medium hard soft'],
    ['big small tiny', 'tiny big small'],
    ['tall short medium', 'medium tall short'],
    ['new old classic', 'classic new old'],
    ['raw cooked frozen', 'frozen raw cooked'],
    ['public private protected', 'protected public private'],
  ];
  for (let i = 0; i < 30; i++) {
    const [a, b] = phrasePairs[i];
    it(`tokenSort(${JSON.stringify(a)}, ${JSON.stringify(b)}) === 1 [${i}]`, () => {
      expect(tokenSort(a, b)).toBeCloseTo(1, 5);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. tokenOverlap — 30 tests
// ---------------------------------------------------------------------------
describe('tokenOverlap', () => {
  it('identical sentences → 1', () => {
    expect(tokenOverlap('hello world', 'hello world')).toBe(1);
  });
  it('no overlap → 0', () => {
    expect(tokenOverlap('abc def', 'ghi jkl')).toBe(0);
  });
  it('single token match out of two → 0.5', () => {
    expect(tokenOverlap('cat dog', 'cat fish')).toBe(0.5);
  });
  it('empty both → 1', () => {
    expect(tokenOverlap('', '')).toBe(1);
  });
  it('one empty → 0', () => {
    expect(tokenOverlap('hello', '')).toBe(0);
  });

  const pairs: [string, string][] = [
    ['the cat sat', 'the cat ran'],
    ['quick brown fox', 'quick red fox'],
    ['hello world foo', 'hello world bar'],
    ['a b c', 'a b d'],
    ['one two three', 'one two four'],
    ['alpha beta gamma', 'alpha beta delta'],
    ['red green blue', 'red green yellow'],
    ['sun moon star', 'sun moon planet'],
    ['apple orange pear', 'apple orange grape'],
    ['cat dog bird fish', 'cat dog bird snake'],
    ['north south', 'north east'],
    ['fast slow', 'fast medium'],
    ['hot warm cold', 'hot warm cool'],
    ['big small', 'big tiny'],
    ['open close', 'open save'],
    ['read write', 'read execute'],
    ['left right', 'left center'],
    ['up down', 'up left'],
    ['start stop', 'start pause'],
    ['buy sell', 'buy hold'],
    ['public private', 'public protected'],
    ['new old', 'new classic'],
    ['in out', 'in through'],
    ['fire water', 'fire earth'],
    ['happy sad', 'happy angry'],
  ];
  for (let i = 0; i < 25; i++) {
    const [a, b] = pairs[i];
    it(`tokenOverlap(${JSON.stringify(a)}, ${JSON.stringify(b)}) in [0,1] [${i}]`, () => {
      const score = tokenOverlap(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. fuzzySearch strings — 30 tests
// ---------------------------------------------------------------------------
describe('fuzzySearch strings', () => {
  const items = ['apple', 'apply', 'maple', 'application', 'pear', 'banana', 'apricot', 'appetizer', 'apt'];
  const queries = [
    'apple', 'aple', 'appl', 'app', 'apricot', 'apt', 'apply', 'appetizer',
    'maple', 'map', 'pear', 'per', 'banana', 'banan', 'appleX', 'application',
    'applicat', 'applic', 'appli', 'applet', 'appt', 'appy', 'appe', 'apPle',
    'appLE', 'APPle', 'APPLE', 'aPPle', 'ApPlE', 'APPL',
  ];
  for (let i = 0; i < 30; i++) {
    const query = queries[i];
    it(`fuzzySearch(${JSON.stringify(query)}) returns array with scores in [0,1] [${i}]`, () => {
      const results = fuzzySearch(query, items);
      expect(Array.isArray(results)).toBe(true);
      for (const r of results) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(1);
        expect(r.index).toBeGreaterThanOrEqual(0);
        expect(r.index).toBeLessThan(items.length);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 16. fuzzyMatch — 70 tests (50 true + 20 false)
// ---------------------------------------------------------------------------
describe('fuzzyMatch', () => {
  // 50 true pairs (high similarity)
  const truePairs: [string, string][] = [
    ['apple', 'apple'], ['hello', 'hello'], ['test', 'test'], ['world', 'world'],
    ['data', 'data'], ['node', 'node'], ['react', 'react'], ['vue', 'vue'],
    ['python', 'python'], ['java', 'java'], ['algorithm', 'algorithm'],
    ['database', 'database'], ['network', 'network'], ['server', 'server'],
    ['client', 'client'], ['module', 'module'], ['function', 'function'],
    ['variable', 'variable'], ['constant', 'constant'], ['boolean', 'boolean'],
    ['integer', 'integer'], ['string', 'string'], ['array', 'array'],
    ['object', 'object'], ['class', 'class'], ['interface', 'interface'],
    ['method', 'method'], ['property', 'property'], ['event', 'event'],
    ['listener', 'listener'], ['callback', 'callback'], ['promise', 'promise'],
    ['async', 'async'], ['await', 'await'], ['export', 'export'],
    ['import', 'import'], ['return', 'return'], ['default', 'default'],
    ['static', 'static'], ['public', 'public'], ['private', 'private'],
    ['protected', 'protected'], ['abstract', 'abstract'], ['override', 'override'],
    ['readonly', 'readonly'], ['optional', 'optional'], ['required', 'required'],
    ['nullable', 'nullable'], ['generic', 'generic'], ['template', 'template'],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b] = truePairs[i];
    it(`fuzzyMatch(${JSON.stringify(a)}, ${JSON.stringify(b)}) === true [${i}]`, () => {
      expect(fuzzyMatch(a, b)).toBe(true);
    });
  }

  // 20 false pairs (very different)
  const falsePairs: [string, string][] = [
    ['apple', 'zzzzz'],
    ['hello', 'xyzwv'],
    ['cat', 'qjzwx'],
    ['dog', 'fffff'],
    ['node', 'qqqqq'],
    ['react', 'vvvvvv'],
    ['vue', 'zzzzzzz'],
    ['python', 'jjjjjj'],
    ['java', 'wwwww'],
    ['algorithm', 'xxxxxxxx'],
    ['database', 'yyyyyyy'],
    ['network', 'zzzzzzzz'],
    ['server', 'qqqqqq'],
    ['client', 'jjjjjjj'],
    ['module', 'vvvvvvv'],
    ['function', 'xxxxxxxx'],
    ['variable', 'qqqqqqq'],
    ['constant', 'zzzzzzz'],
    ['boolean', 'xxxxxxx'],
    ['integer', 'yyyyyyy'],
  ];
  for (let i = 0; i < 20; i++) {
    const [a, b] = falsePairs[i];
    it(`fuzzyMatch(${JSON.stringify(a)}, ${JSON.stringify(b)}) === false (threshold 0.9) [${i}]`, () => {
      expect(fuzzyMatch(a, b, 0.9)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. bestMatch — 30 tests
// ---------------------------------------------------------------------------
describe('bestMatch', () => {
  const candidates = ['apple', 'apply', 'maple', 'application', 'apricot', 'appetizer', 'apt'];
  const queries = [
    'apple', 'apply', 'aple', 'appl', 'app', 'apricot', 'apt',
    'appetizer', 'maple', 'appleX', 'APPLE', 'application', 'applicat',
    'applic', 'appli', 'applet', 'appt', 'appy', 'appe', 'apPle',
    'appLE', 'APPle', 'aPPle', 'ApPlE', 'APPL', 'aapple', 'appleee',
    'apricott', 'aptX', 'mapleX',
  ];
  for (let i = 0; i < 30; i++) {
    const query = queries[i];
    it(`bestMatch(${JSON.stringify(query)}) returns non-null with valid score [${i}]`, () => {
      const result = bestMatch(query, candidates);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
        expect(typeof result.item).toBe('string');
        expect(result.index).toBeGreaterThanOrEqual(0);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 18. areAnagrams — 30 tests (15 true, 15 false)
// ---------------------------------------------------------------------------
describe('areAnagrams', () => {
  const truePairs: [string, string][] = [
    ['listen', 'silent'],
    ['triangle', 'integral'],
    ['cinema', 'iceman'],
    ['astronomer', 'moon starer'],
    ['dusty', 'study'],
    ['night', 'thing'],
    ['arc', 'car'],
    ['elbow', 'below'],
    ['state', 'taste'],
    ['crate', 'trace'],
    ['dormitory', 'dirty room'],
    ['school master', 'the classroom'],
    ['conversation', 'voices rant on'],
    ['listen', 'enlist'],
    ['cat', 'act'],
  ];
  for (const [a, b] of truePairs) {
    it(`areAnagrams(${JSON.stringify(a)}, ${JSON.stringify(b)}) === true`, () => {
      expect(areAnagrams(a, b)).toBe(true);
    });
  }

  const falsePairs: [string, string][] = [
    ['hello', 'world'],
    ['apple', 'orange'],
    ['cat', 'dog'],
    ['test', 'best'],
    ['algorithm', 'rhythm'],
    ['abc', 'abcd'],
    ['aab', 'abb'],
    ['foo', 'bar'],
    ['node', 'modes'],   // node != modes (node=d,e,n,o; modes=d,e,m,o,s)
    ['data', 'byte'],
    ['java', 'rust'],
    ['python', 'kotlin'],
    ['code', 'coda'],
    ['fuzzy', 'fizzy'],
    ['exact', 'react'],
  ];
  for (const [a, b] of falsePairs) {
    it(`areAnagrams(${JSON.stringify(a)}, ${JSON.stringify(b)}) === false`, () => {
      expect(areAnagrams(a, b)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 19. longestCommonSubstring — 20 tests
// ---------------------------------------------------------------------------
describe('longestCommonSubstring', () => {
  const cases: [string, string, string][] = [
    ['abcdef', 'zcdemf', 'cde'],
    ['abcde', 'abfde', 'ab'],
    ['hello', 'world', 'o'],
    ['abcabc', 'abc', 'abc'],
    ['', 'abc', ''],
    ['abc', '', ''],
    ['', '', ''],
    ['abc', 'abc', 'abc'],
    ['abc', 'xyz', ''],
    ['abcdef', 'bcde', 'bcde'],
    ['hello world', 'world peace', 'world'],
    ['foobar', 'barfoo', 'foo'],
    ['abcba', 'abcba', 'abcba'],
    ['aaaaaa', 'aaa', 'aaa'],
    ['12345', '345678', '345'],
    ['teststring', 'testcase', 'test'],
    ['programming', 'gaming', 'ming'],    // p-r-o-g-r-a-m-m-i-n-g has 'ming'
    ['algorithm', 'logarithm', 'rithm'],
    ['python', 'thong', 'thon'],
    ['javascript', 'java', 'java'],
  ];
  for (const [a, b, expected] of cases) {
    it(`longestCommonSubstring(${JSON.stringify(a)}, ${JSON.stringify(b)}) is superstring of ${JSON.stringify(expected)}`, () => {
      const result = longestCommonSubstring(a, b);
      // The result should be a substring of both a and b
      expect(a.includes(result)).toBe(true);
      expect(b.includes(result)).toBe(true);
      // And at least as long as expected
      expect(result.length).toBeGreaterThanOrEqual(expected.length);
    });
  }
});

// ---------------------------------------------------------------------------
// 20. commonPrefix / commonSuffix — 60 tests (30 each)
// ---------------------------------------------------------------------------
describe('commonPrefix', () => {
  const cases: [string, string, string][] = [
    ['hello', 'help', 'hel'],
    ['abc', 'abcdef', 'abc'],
    ['abc', 'xyz', ''],
    ['', 'abc', ''],
    ['abc', '', ''],
    ['prefix', 'predict', 'pre'],
    ['typescript', 'typesafe', 'types'],
    ['javascript', 'java', 'java'],
    ['node', 'nodejs', 'node'],
    ['react', 'reacts', 'react'],
    ['angular', 'angularjs', 'angular'],
    ['vue', 'vuepress', 'vue'],
    ['python', 'pythons', 'python'],
    ['algorithm', 'algo', 'algo'],
    ['database', 'data', 'data'],
    ['network', 'netw', 'netw'],
    ['server', 'service', 'serv'],
    ['client', 'clip', 'cli'],
    ['module', 'model', 'mod'],
    ['function', 'func', 'func'],
    ['variable', 'var', 'var'],
    ['constant', 'const', 'const'],
    ['boolean', 'bool', 'bool'],
    ['integer', 'int', 'int'],
    ['string', 'str', 'str'],
    ['array', 'arr', 'arr'],
    ['object', 'obj', 'obj'],
    ['class', 'classname', 'class'],
    ['interface', 'inter', 'inter'],
    ['method', 'meta', 'met'],
  ];
  for (const [a, b, expected] of cases) {
    it(`commonPrefix(${JSON.stringify(a)}, ${JSON.stringify(b)}) === ${JSON.stringify(expected)}`, () => {
      expect(commonPrefix(a, b)).toBe(expected);
    });
  }
});

describe('commonSuffix', () => {
  const cases: [string, string, string][] = [
    ['hello', 'cello', 'ello'],
    ['abc', 'xbc', 'bc'],
    ['abc', 'xyz', ''],
    ['', 'abc', ''],
    ['abc', '', ''],
    ['testing', 'resting', 'esting'],
    ['running', 'cunning', 'unning'],
    ['able', 'table', 'able'],
    ['action', 'traction', 'action'],
    ['nation', 'vacation', 'ation'],
    ['tion', 'cation', 'tion'],
    ['ness', 'darkness', 'ness'],
    ['ment', 'payment', 'ment'],
    ['ful', 'helpful', 'ful'],
    ['less', 'helpless', 'less'],
    ['ing', 'running', 'ing'],
    ['er', 'runner', 'er'],
    ['ed', 'walked', 'ed'],
    ['ly', 'quickly', 'ly'],
    ['ive', 'active', 'ive'],
    ['ous', 'famous', 'ous'],
    ['al', 'natural', 'al'],
    ['ic', 'atomic', 'ic'],
    ['ity', 'ability', 'ity'],
    ['ism', 'realism', 'ism'],
    ['ist', 'pianist', 'ist'],
    ['ize', 'realize', 'ize'],
    ['ise', 'realise', 'ise'],
    ['ify', 'notify', 'ify'],
    ['ate', 'create', 'ate'],
  ];
  for (const [a, b, expected] of cases) {
    it(`commonSuffix(${JSON.stringify(a)}, ${JSON.stringify(b)}) === ${JSON.stringify(expected)}`, () => {
      expect(commonSuffix(a, b)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. abbreviationMatch — 20 tests
// ---------------------------------------------------------------------------
describe('abbreviationMatch', () => {
  const cases: [string, string, boolean][] = [
    ['cfg', 'configuration', true],
    ['abc', 'alphabet beta charlie', true],
    ['js', 'javascript', true],
    ['ts', 'typescript', true],
    ['py', 'python', true],
    ['db', 'database', true],
    ['srv', 'server', true],
    ['app', 'application', true],
    ['msg', 'message', true],
    ['btn', 'button', true],
    ['xyz', 'apple', false],
    ['zzz', 'zebra', false],
    ['qrs', 'typescript', false],
    ['abc', 'xyz', false],
    ['hello', 'hi', false],
    ['abcde', 'ace', false],
    ['ml', 'machine learning', true],
    ['ai', 'artificial intelligence', true],
    ['nlp', 'natural language processing', true],
    ['api', 'application programming interface', true],
  ];
  for (const [abbr, target, expected] of cases) {
    it(`abbreviationMatch(${JSON.stringify(abbr)}, ${JSON.stringify(target)}) === ${expected}`, () => {
      expect(abbreviationMatch(abbr, target)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 22. normalizeForComparison — 20 tests
// ---------------------------------------------------------------------------
describe('normalizeForComparison', () => {
  it('lowercases input', () => {
    expect(normalizeForComparison('HELLO')).toBe('hello');
  });
  it('removes punctuation', () => {
    expect(normalizeForComparison('hello, world!')).toBe('hello world');
  });
  it('collapses whitespace', () => {
    expect(normalizeForComparison('hello   world')).toBe('hello world');
  });
  it('trims leading/trailing whitespace', () => {
    expect(normalizeForComparison('  hello  ')).toBe('hello');
  });
  it('handles empty string', () => {
    expect(normalizeForComparison('')).toBe('');
  });
  it('strips accented é → e', () => {
    expect(normalizeForComparison('café')).toBe('cafe');
  });
  it('strips accented ñ → n', () => {
    expect(normalizeForComparison('mañana')).toBe('manana');
  });
  it('strips accented ü → u', () => {
    expect(normalizeForComparison('über')).toBe('uber');
  });
  it('handles mixed case and accents', () => {
    expect(normalizeForComparison('Héllo Wörld')).toBe('hello world');
  });
  it('removes hyphens', () => {
    expect(normalizeForComparison('well-known')).toBe('wellknown');
  });
  it('removes apostrophes', () => {
    expect(normalizeForComparison("it's")).toBe('its');
  });
  it('handles numbers', () => {
    expect(normalizeForComparison('abc123')).toBe('abc123');
  });
  it('handles tabs as whitespace', () => {
    expect(normalizeForComparison('hello\tworld')).toBe('hello world');
  });
  it('handles newlines', () => {
    expect(normalizeForComparison('hello\nworld')).toBe('hello world');
  });
  it('strips à → a', () => {
    expect(normalizeForComparison('à la carte')).toBe('a la carte');
  });
  it('strips ç → c', () => {
    expect(normalizeForComparison('français')).toBe('francais');
  });
  it('strips multiple punctuation', () => {
    expect(normalizeForComparison('...hello...world...')).toBe('helloworld');
  });
  it('handles already normalized string unchanged', () => {
    expect(normalizeForComparison('hello world')).toBe('hello world');
  });
  it('strips Ö → o', () => {
    expect(normalizeForComparison('Österreich')).toBe('osterreich');
  });
  it('strips â → a', () => {
    expect(normalizeForComparison('château')).toBe('chateau');
  });
});

// ---------------------------------------------------------------------------
// 23. lcsSimilarity — 50 tests
// ---------------------------------------------------------------------------
describe('lcsSimilarity range [0,1]', () => {
  const pairs: [string, string][] = [
    ['apple', 'apple'], ['apple', 'aple'], ['hello', 'world'], ['test', 'text'],
    ['abc', 'xyz'], ['', ''], ['cat', 'car'], ['dog', 'log'], ['foo', 'bar'],
    ['similar', 'simlar'], ['MARTHA', 'MARHTA'], ['distance', 'distanc'],
    ['algorithm', 'logarithm'], ['data', 'date'], ['input', 'output'],
    ['python', 'pythons'], ['java', 'javascript'], ['node', 'nodes'],
    ['react', 'reacts'], ['vue', 'vue'], ['angular', 'angularjs'],
    ['typescript', 'javascript'], ['html', 'css'], ['sql', 'nosql'],
    ['graph', 'grape'], ['train', 'trail'], ['brain', 'braid'], ['chair', 'chain'],
    ['world', 'word'], ['string', 'strong'], ['bring', 'brink'], ['thing', 'think'],
    ['about', 'above'], ['dance', 'lance'], ['fancy', 'nancy'], ['mango', 'tango'],
    ['light', 'night'], ['fight', 'right'], ['might', 'sight'], ['tight', 'light'],
    ['black', 'slack'], ['crack', 'track'], ['snack', 'stack'], ['beach', 'peach'],
    ['reach', 'teach'], ['learn', 'yearn'], ['heart', 'heard'], ['smart', 'start'],
    ['fuzzy', 'fuzz'], ['logic', 'local'],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i];
    it(`lcsSimilarity(${JSON.stringify(a)}, ${JSON.stringify(b)}) in [0,1] [${i}]`, () => {
      const score = lcsSimilarity(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. rankMatches — 20 tests
// ---------------------------------------------------------------------------
describe('rankMatches', () => {
  const candidates = ['apple', 'apply', 'maple', 'application', 'apricot', 'appetizer', 'apt'];
  const queries = [
    'apple', 'apply', 'aple', 'appl', 'app', 'apricot', 'apt',
    'appetizer', 'maple', 'appleX', 'APPLE', 'application', 'applicat',
    'applic', 'appli', 'applet', 'appt', 'appy', 'appe', 'apPle',
  ];
  for (let i = 0; i < 20; i++) {
    const query = queries[i];
    it(`rankMatches(${JSON.stringify(query)}) returns sorted array [${i}]`, () => {
      const results = rankMatches(query, candidates);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(candidates.length);
      // Verify sorted descending
      for (let j = 1; j < results.length; j++) {
        expect(results[j - 1].score).toBeGreaterThanOrEqual(results[j].score);
      }
      // All scores in [0,1]
      for (const r of results) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(1);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 25. cosineSimilarity — 50 tests
// ---------------------------------------------------------------------------
describe('cosineSimilarity range [0,1]', () => {
  const pairs: [string, string][] = [
    ['apple', 'apple'], ['apple', 'aple'], ['hello', 'world'], ['test', 'text'],
    ['abc', 'xyz'], ['', ''], ['cat', 'car'], ['dog', 'log'], ['foo', 'bar'],
    ['similar', 'simlar'], ['MARTHA', 'MARHTA'], ['distance', 'distanc'],
    ['algorithm', 'logarithm'], ['data', 'date'], ['input', 'output'],
    ['python', 'pythons'], ['java', 'javascript'], ['node', 'nodes'],
    ['react', 'reacts'], ['vue', 'vue'], ['angular', 'angularjs'],
    ['typescript', 'javascript'], ['html', 'css'], ['sql', 'nosql'],
    ['graph', 'grape'], ['train', 'trail'], ['brain', 'braid'], ['chair', 'chain'],
    ['world', 'word'], ['string', 'strong'], ['bring', 'brink'], ['thing', 'think'],
    ['about', 'above'], ['dance', 'lance'], ['fancy', 'nancy'], ['mango', 'tango'],
    ['light', 'night'], ['fight', 'right'], ['might', 'sight'], ['tight', 'light'],
    ['black', 'slack'], ['crack', 'track'], ['snack', 'stack'], ['beach', 'peach'],
    ['reach', 'teach'], ['learn', 'yearn'], ['heart', 'heard'], ['smart', 'start'],
    ['fuzzy', 'fuzz'], ['logic', 'local'],
  ];
  for (let i = 0; i < 50; i++) {
    const [a, b] = pairs[i];
    it(`cosineSimilarity(${JSON.stringify(a)}, ${JSON.stringify(b)}) in [0,1] [${i}]`, () => {
      const score = cosineSimilarity(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 26. editOperations — additional structural tests
// ---------------------------------------------------------------------------
describe('editOperations', () => {
  it('identical strings → empty ops', () => {
    expect(editOperations('abc', 'abc')).toEqual([]);
  });
  it('empty to abc → 3 inserts', () => {
    const ops = editOperations('', 'abc');
    expect(ops.length).toBe(3);
    expect(ops.every(o => o.type === 'insert')).toBe(true);
  });
  it('abc to empty → 3 deletes', () => {
    const ops = editOperations('abc', '');
    expect(ops.length).toBe(3);
    expect(ops.every(o => o.type === 'delete')).toBe(true);
  });
  it('number of ops matches levenshtein distance', () => {
    const pairs: [string, string][] = [
      ['kitten', 'sitting'],
      ['saturday', 'sunday'],
      ['a', 'b'],
      ['abc', 'axc'],
      ['horse', 'ros'],
    ];
    for (const [a, b] of pairs) {
      const ops = editOperations(a, b);
      expect(ops.length).toBe(levenshtein(a, b));
    }
  });
  it('op types are valid', () => {
    const ops = editOperations('hello', 'world');
    const validTypes = new Set(['insert', 'delete', 'replace', 'transpose']);
    for (const op of ops) {
      expect(validTypes.has(op.type)).toBe(true);
    }
  });
  it('ops have position >= 0', () => {
    const ops = editOperations('abc', 'xyz');
    for (const op of ops) {
      expect(op.position).toBeGreaterThanOrEqual(0);
    }
  });

  // Loop 20 more
  const wordPairs = [
    ['cat', 'car'], ['dog', 'fog'], ['hat', 'bat'], ['sit', 'set'],
    ['run', 'gun'], ['fun', 'sun'], ['tan', 'man'], ['pan', 'pin'],
    ['bin', 'win'], ['hit', 'bit'], ['dim', 'dip'], ['fin', 'sin'],
    ['fix', 'mix'], ['fox', 'box'], ['hot', 'hot'], ['lot', 'not'],
    ['pot', 'dot'], ['rot', 'dot'], ['tot', 'top'], ['wet', 'bet'],
  ];
  for (let i = 0; i < 20; i++) {
    const [a, b] = wordPairs[i];
    it(`editOperations(${a}, ${b}).length === levenshtein(${a}, ${b}) [loop ${i}]`, () => {
      expect(editOperations(a, b).length).toBe(levenshtein(a, b));
    });
  }
});

// ---------------------------------------------------------------------------
// 27. metaphone — basic sanity tests
// ---------------------------------------------------------------------------
describe('metaphone', () => {
  it('returns empty string for empty input', () => {
    expect(metaphone('')).toBe('');
  });
  it('drops initial KN', () => {
    const code = metaphone('Knight');
    expect(code.startsWith('N')).toBe(true);
  });
  it('drops initial WR', () => {
    const code = metaphone('Write');
    expect(code.startsWith('R')).toBe(true);
  });
  it('returns uppercase', () => {
    const code = metaphone('hello');
    expect(code).toBe(code.toUpperCase());
  });
  it('smith encodes consistently', () => {
    expect(metaphone('Smith')).toBe(metaphone('Smythe'));
  });

  // Loop 20 pairs that should encode similarly
  const similarPairs: [string, string][] = [
    ['Smith', 'Smythe'],
    ['phone', 'fone'],
    ['knight', 'night'],
    ['wrap', 'rap'],
    ['know', 'no'],
    ['gnome', 'nome'],
    ['write', 'rite'],
    ['knave', 'nave'],   // KN→N drop, both → NF
    ['kneel', 'neel'],
    ['pneumonia', 'neumonia'],
    ['knife', 'nife'],
    ['knack', 'nack'],
    ['gnat', 'nat'],
    ['knob', 'nob'],
    ['knee', 'nee'],
    ['knit', 'nit'],
    ['knoll', 'nol'],
    ['knowledge', 'nowledge'],
    ['wrist', 'rist'],
    ['wrong', 'rong'],
  ];
  for (let i = 0; i < 20; i++) {
    const [a, b] = similarPairs[i];
    it(`metaphone(${a}) === metaphone(${b}) [similar pair ${i}]`, () => {
      expect(metaphone(a)).toBe(metaphone(b));
    });
  }
});

// ---------------------------------------------------------------------------
// 28. doubleMetaphone — basic tests
// ---------------------------------------------------------------------------
describe('doubleMetaphone', () => {
  it('returns a tuple of two strings', () => {
    const result = doubleMetaphone('Smith');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(typeof result[0]).toBe('string');
    expect(typeof result[1]).toBe('string');
  });

  const words = [
    'Thompson', 'Smith', 'Johnson', 'Williams', 'Brown',
    'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
    'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
    'Martin', 'Garcia', 'Martinez', 'Robinson', 'Clark',
  ];
  for (let i = 0; i < 20; i++) {
    const word = words[i];
    it(`doubleMetaphone(${word}) returns tuple [${i}]`, () => {
      const [primary, alternate] = doubleMetaphone(word);
      expect(typeof primary).toBe('string');
      expect(typeof alternate).toBe('string');
      expect(primary.length).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 29. tokenSet — additional tests
// ---------------------------------------------------------------------------
describe('tokenSet', () => {
  it('identical strings → 1', () => {
    expect(tokenSet('hello world', 'hello world')).toBeCloseTo(1, 5);
  });
  it('same tokens different order → high score', () => {
    const score = tokenSet('quick brown fox', 'fox brown quick');
    expect(score).toBeGreaterThan(0.9);
  });
  it('completely different → lower score than identical', () => {
    const different = tokenSet('apple orange', 'cat dog');
    const identical = tokenSet('hello world', 'hello world');
    expect(different).toBeLessThan(identical);
  });
  it('empty strings', () => {
    const score = tokenSet('', '');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  // Loop 20 more
  const pairs: [string, string][] = [
    ['the cat sat', 'cat the sat'],
    ['one two three', 'three two one'],
    ['a b c', 'c b a'],
    ['hello world', 'world hello'],
    ['foo bar baz', 'baz foo bar'],
    ['red green blue', 'blue green red'],
    ['north south east', 'east north south'],
    ['alpha beta gamma', 'gamma beta alpha'],
    ['dog cat bird', 'bird dog cat'],
    ['left right center', 'center right left'],
    ['sun moon star', 'star moon sun'],
    ['fire water earth', 'earth water fire'],
    ['small medium large', 'large medium small'],
    ['open close save', 'save close open'],
    ['read write exec', 'exec write read'],
    ['buy sell hold', 'hold sell buy'],
    ['start stop pause', 'pause stop start'],
    ['up down left', 'left down up'],
    ['fast slow medium', 'medium fast slow'],
    ['hot warm cold', 'cold warm hot'],
  ];
  for (let i = 0; i < 20; i++) {
    const [a, b] = pairs[i];
    it(`tokenSet(${JSON.stringify(a)}, ${JSON.stringify(b)}) > 0.9 [${i}]`, () => {
      expect(tokenSet(a, b)).toBeGreaterThan(0.9);
    });
  }
});

// ---------------------------------------------------------------------------
// 30. levenshteinSimilarity edge cases
// ---------------------------------------------------------------------------
describe('levenshteinSimilarity edge cases', () => {
  it('same string → 1', () => {
    expect(levenshteinSimilarity('abc', 'abc')).toBe(1);
  });
  it('empty strings → 1', () => {
    expect(levenshteinSimilarity('', '')).toBe(1);
  });
  it('one empty → 0', () => {
    expect(levenshteinSimilarity('abc', '')).toBe(0);
    expect(levenshteinSimilarity('', 'abc')).toBe(0);
  });
  it('single char diff in long string is high similarity', () => {
    const score = levenshteinSimilarity('abcdefghij', 'abcdefghix');
    expect(score).toBeGreaterThan(0.8);
  });
  it('completely different → 0', () => {
    expect(levenshteinSimilarity('abc', 'xyz')).toBe(0);
  });

  // Loop 20 more range checks
  const wordPairs = [
    ['testing', 'texting'], ['fuzzy', 'fuzz'], ['match', 'batch'],
    ['catch', 'latch'], ['hatch', 'watch'], ['fetch', 'retch'],
    ['ditch', 'witch'], ['pitch', 'switch'], ['stitch', 'stitch'],
    ['fiction', 'diction'], ['section', 'mention'], ['action', 'fraction'],
    ['motion', 'notion'], ['lotion', 'potion'], ['ocean', 'beacon'],
    ['reason', 'season'], ['treason', 'reason'], ['prison', 'risen'],
    ['frozen', 'chosen'], ['dozen', 'token'],
  ];
  for (let i = 0; i < 20; i++) {
    const [a, b] = wordPairs[i];
    it(`levenshteinSimilarity(${a}, ${b}) in [0,1] [${i}]`, () => {
      const score = levenshteinSimilarity(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 31. fuzzySearch with objects
// ---------------------------------------------------------------------------
describe('fuzzySearch with objects', () => {
  const items = [
    { id: 1, name: 'apple' },
    { id: 2, name: 'apply' },
    { id: 3, name: 'maple' },
    { id: 4, name: 'application' },
    { id: 5, name: 'apricot' },
  ];

  it('finds object by key', () => {
    const results = fuzzySearch('apple', items, { key: 'name' });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('respects threshold', () => {
    const results = fuzzySearch('zzzzz', items, { key: 'name', threshold: 0.9 });
    expect(results.length).toBe(0);
  });

  it('respects limit', () => {
    const results = fuzzySearch('app', items, { key: 'name', threshold: 0, limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('results are sorted by score descending', () => {
    const results = fuzzySearch('apple', items, { key: 'name', threshold: 0 });
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('items have correct index', () => {
    const results = fuzzySearch('apple', items, { key: 'name', threshold: 0 });
    for (const r of results) {
      expect(r.index).toBeGreaterThanOrEqual(0);
      expect(r.index).toBeLessThan(items.length);
      expect(items[r.index]).toEqual(r.item);
    }
  });

  // Loop 10 queries on object array
  const queries = ['app', 'apl', 'apr', 'mpl', 'mape', 'aplic', 'aplic', 'appli', 'apricot', 'maple'];
  for (let i = 0; i < 10; i++) {
    const query = queries[i];
    it(`fuzzySearch objects with key=name query=${JSON.stringify(query)} [${i}]`, () => {
      const results = fuzzySearch(query, items, { key: 'name', threshold: 0 });
      expect(results.length).toBe(items.length);
      for (const r of results) {
        expect(typeof r.score).toBe('number');
        expect(r.score).toBeGreaterThanOrEqual(0);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 32. bestMatch edge cases
// ---------------------------------------------------------------------------
describe('bestMatch edge cases', () => {
  it('empty candidates → null', () => {
    expect(bestMatch('apple', [])).toBeNull();
  });
  it('single candidate → that item', () => {
    const result = bestMatch('apple', ['apple']);
    expect(result).not.toBeNull();
    expect(result?.item).toBe('apple');
    expect(result?.score).toBe(1);
  });
  it('best match is exact', () => {
    const result = bestMatch('apple', ['orange', 'banana', 'apple', 'pear']);
    expect(result?.item).toBe('apple');
    expect(result?.score).toBe(1);
  });
  it('index is correct', () => {
    const candidates = ['orange', 'banana', 'apple', 'pear'];
    const result = bestMatch('apple', candidates);
    expect(result?.index).toBe(2);
  });
  it('returns highest score among all', () => {
    const candidates = ['a', 'ab', 'abc', 'abcd'];
    const result = bestMatch('abcd', candidates);
    expect(result?.item).toBe('abcd');
  });
});

// ---------------------------------------------------------------------------
// 33. hammingDistance edge cases
// ---------------------------------------------------------------------------
describe('hammingDistance edge cases', () => {
  it('empty equal strings → 0', () => {
    expect(hammingDistance('', '')).toBe(0);
  });
  it('one empty, one not → -1', () => {
    expect(hammingDistance('', 'a')).toBe(-1);
    expect(hammingDistance('a', '')).toBe(-1);
  });
  it('single char same → 0', () => {
    expect(hammingDistance('a', 'a')).toBe(0);
  });
  it('single char different → 1', () => {
    expect(hammingDistance('a', 'b')).toBe(1);
  });
  it('all different → length', () => {
    expect(hammingDistance('abc', 'xyz')).toBe(3);
  });
  it('all same → 0', () => {
    expect(hammingDistance('aaaa', 'aaaa')).toBe(0);
  });
  it('returns -1 for length mismatch', () => {
    expect(hammingDistance('abc', 'abcd')).toBe(-1);
  });
  it('result <= string length', () => {
    const result = hammingDistance('hello', 'world');
    expect(result).toBeLessThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// 34. levenshtein symmetry
// ---------------------------------------------------------------------------
describe('levenshtein symmetry', () => {
  const pairs: [string, string][] = [
    ['abc', 'xyz'], ['hello', 'world'], ['cat', 'dog'], ['test', 'text'],
    ['algorithm', 'altruistic'], ['kitten', 'sitting'], ['saturday', 'sunday'],
    ['a', 'b'], ['ab', 'ba'], ['foo', 'bar'],
  ];
  for (const [a, b] of pairs) {
    it(`levenshtein(${a}, ${b}) === levenshtein(${b}, ${a})`, () => {
      expect(levenshtein(a, b)).toBe(levenshtein(b, a));
    });
  }
});

// ---------------------------------------------------------------------------
// 35. jaroWinkler range [0,1] — extra 30 tests
// ---------------------------------------------------------------------------
describe('jaroWinkler range [0,1] extra', () => {
  const words = [
    'abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx', 'yza', 'bcd',
  ];
  for (let i = 0; i < 30; i++) {
    const a = words[i % words.length];
    const b = words[(i + 4) % words.length];
    it(`jaroWinkler(${a}, ${b}) in [0,1] [${i}]`, () => {
      const score = jaroWinkler(a, b);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  }
});
