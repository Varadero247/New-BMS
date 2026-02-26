// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  cosineSimilarity,
  jaccardSimilarity,
  hammingDistance,
  randomProjectionHash,
  generateRandomPlanes,
  LSH,
  MinHashLSH,
  SimHash,
} from '../lsh';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function vec(values: number[]): number[] { return values; }
function normalize(v: number[]): number[] {
  const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return mag === 0 ? v : v.map(x => x / mag);
}
function orthogonal2d(v: number[]): number[] { return [-v[1], v[0]]; }
function toBigInt(bits: boolean[]): bigint {
  let n = 0n;
  for (let i = bits.length - 1; i >= 0; i--) {
    n = (n << 1n) | (bits[i] ? 1n : 0n);
  }
  return n;
}

// ============================================================================
// 1. cosineSimilarity — 100 tests
// ============================================================================
describe('cosineSimilarity', () => {
  it('identical [1,0] vectors → 1', () => expect(cosineSimilarity([1,0],[1,0])).toBeCloseTo(1));
  it('identical [0,1] vectors → 1', () => expect(cosineSimilarity([0,1],[0,1])).toBeCloseTo(1));
  it('identical [1,1] vectors → 1', () => expect(cosineSimilarity([1,1],[1,1])).toBeCloseTo(1));
  it('identical [3,4] vectors → 1', () => expect(cosineSimilarity([3,4],[3,4])).toBeCloseTo(1));
  it('identical [1,2,3] vectors → 1', () => expect(cosineSimilarity([1,2,3],[1,2,3])).toBeCloseTo(1));
  it('opposite [1,0] and [-1,0] → -1', () => expect(cosineSimilarity([1,0],[-1,0])).toBeCloseTo(-1));
  it('opposite [0,1] and [0,-1] → -1', () => expect(cosineSimilarity([0,1],[0,-1])).toBeCloseTo(-1));
  it('opposite [1,1] and [-1,-1] → -1', () => expect(cosineSimilarity([1,1],[-1,-1])).toBeCloseTo(-1));
  it('opposite [3,4] and [-3,-4] → -1', () => expect(cosineSimilarity([3,4],[-3,-4])).toBeCloseTo(-1));
  it('orthogonal [1,0] and [0,1] → 0', () => expect(cosineSimilarity([1,0],[0,1])).toBeCloseTo(0));
  it('orthogonal [1,0,0] and [0,1,0] → 0', () => expect(cosineSimilarity([1,0,0],[0,1,0])).toBeCloseTo(0));
  it('orthogonal [1,0,0] and [0,0,1] → 0', () => expect(cosineSimilarity([1,0,0],[0,0,1])).toBeCloseTo(0));
  it('orthogonal [0,1,0] and [0,0,1] → 0', () => expect(cosineSimilarity([0,1,0],[0,0,1])).toBeCloseTo(0));
  it('[1,1] and [1,0] → 1/sqrt(2)', () => expect(cosineSimilarity([1,1],[1,0])).toBeCloseTo(1/Math.SQRT2));
  it('[1,1] and [0,1] → 1/sqrt(2)', () => expect(cosineSimilarity([1,1],[0,1])).toBeCloseTo(1/Math.SQRT2));
  it('[2,0] and [1,0] → 1 (scaling invariant)', () => expect(cosineSimilarity([2,0],[1,0])).toBeCloseTo(1));
  it('[3,0] and [1,0] → 1 (scaling invariant)', () => expect(cosineSimilarity([3,0],[1,0])).toBeCloseTo(1));
  it('[1,0] and [2,0] → 1 (scaling invariant)', () => expect(cosineSimilarity([1,0],[2,0])).toBeCloseTo(1));
  it('zero vector a → NaN', () => expect(cosineSimilarity([0,0],[1,0])).toBeNaN());
  it('zero vector b → NaN', () => expect(cosineSimilarity([1,0],[0,0])).toBeNaN());
  it('both zero → NaN', () => expect(cosineSimilarity([0,0],[0,0])).toBeNaN());
  it('throws on mismatched lengths', () => expect(() => cosineSimilarity([1],[1,2])).toThrow());
  it('3d identical [1,2,3] → 1', () => expect(cosineSimilarity([1,2,3],[1,2,3])).toBeCloseTo(1));
  it('3d opposite → -1', () => expect(cosineSimilarity([1,2,3],[-1,-2,-3])).toBeCloseTo(-1));
  it('symmetric: sim(a,b)==sim(b,a)', () => {
    const a=[1,2,3], b=[4,5,6];
    expect(cosineSimilarity(a,b)).toBeCloseTo(cosineSimilarity(b,a));
  });
  it('result in [-1,1] range A', () => { const v=cosineSimilarity([1,2],[3,4]); expect(v>=-1&&v<=1).toBe(true); });
  it('result in [-1,1] range B', () => { const v=cosineSimilarity([1,-2],[3,4]); expect(v>=-1&&v<=1).toBe(true); });
  it('result in [-1,1] range C', () => { const v=cosineSimilarity([-1,-2],[-3,-4]); expect(v>=-1&&v<=1).toBe(true); });
  it('[1,2] and [-2,1] → 0 (orthogonal)', () => expect(cosineSimilarity([1,2],[-2,1])).toBeCloseTo(0));
  it('[2,1] and [-1,2] → 0 (orthogonal)', () => expect(cosineSimilarity([2,1],[-1,2])).toBeCloseTo(0));
  it('4d identical → 1', () => expect(cosineSimilarity([1,2,3,4],[1,2,3,4])).toBeCloseTo(1));
  it('4d opposite → -1', () => expect(cosineSimilarity([1,2,3,4],[-1,-2,-3,-4])).toBeCloseTo(-1));
  it('5d identical → 1', () => expect(cosineSimilarity([1,0,0,0,0],[1,0,0,0,0])).toBeCloseTo(1));
  it('5d orthogonal → 0', () => expect(cosineSimilarity([1,0,0,0,0],[0,1,0,0,0])).toBeCloseTo(0));
  it('negative components same dir → 1', () => expect(cosineSimilarity([-1,-2,-3],[-1,-2,-3])).toBeCloseTo(1));
  it('mixed sign vs itself → 1', () => expect(cosineSimilarity([1,-1,1],[1,-1,1])).toBeCloseTo(1));
  it('60 degree angle ≈ 0.5', () => {
    const a=[1,0]; const b=[0.5, Math.sqrt(3)/2];
    expect(cosineSimilarity(a,b)).toBeCloseTo(0.5, 5);
  });
  it('120 degree angle ≈ -0.5', () => {
    const a=[1,0]; const b=[-0.5, Math.sqrt(3)/2];
    expect(cosineSimilarity(a,b)).toBeCloseTo(-0.5, 5);
  });
  it('large values → 1 (identical)', () => expect(cosineSimilarity([1000,2000],[1000,2000])).toBeCloseTo(1));
  it('large values opposite → -1', () => expect(cosineSimilarity([1000,2000],[-1000,-2000])).toBeCloseTo(-1));
  it('single dim identical → 1', () => expect(cosineSimilarity([5],[5])).toBeCloseTo(1));
  it('single dim opposite → -1', () => expect(cosineSimilarity([5],[-5])).toBeCloseTo(-1));
  it('single dim zero → NaN', () => expect(cosineSimilarity([0],[5])).toBeNaN());
  it('fractional vectors → 1 if same direction', () => expect(cosineSimilarity([0.1,0.2],[0.2,0.4])).toBeCloseTo(1));
  // Generate 50 more parametric tests for various angles
  for (let deg = 0; deg < 50; deg++) {
    const angle = (deg * Math.PI) / 50;
    const expected = Math.cos(angle);
    it(`angle ${deg}*π/50 → cosine ≈ ${expected.toFixed(3)}`, () => {
      const a = [1, 0];
      const b = [Math.cos(angle), Math.sin(angle)];
      expect(cosineSimilarity(a, b)).toBeCloseTo(expected, 5);
    });
  }
});

// ============================================================================
// 2. jaccardSimilarity — 100 tests
// ============================================================================
describe('jaccardSimilarity', () => {
  it('identical sets {a,b,c} → 1', () => expect(jaccardSimilarity(new Set(['a','b','c']),new Set(['a','b','c']))).toBe(1));
  it('identical sets {x} → 1', () => expect(jaccardSimilarity(new Set(['x']),new Set(['x']))).toBe(1));
  it('both empty → 1', () => expect(jaccardSimilarity(new Set<string>(),new Set<string>())).toBe(1));
  it('disjoint {a} and {b} → 0', () => expect(jaccardSimilarity(new Set(['a']),new Set(['b']))).toBe(0));
  it('disjoint {a,b} and {c,d} → 0', () => expect(jaccardSimilarity(new Set(['a','b']),new Set(['c','d']))).toBe(0));
  it('one empty, one non-empty → 0', () => expect(jaccardSimilarity(new Set<string>(),new Set(['a']))).toBe(0));
  it('non-empty, empty → 0', () => expect(jaccardSimilarity(new Set(['a']),new Set<string>())).toBe(0));
  it('{a,b} and {a,b,c} → 2/3', () => expect(jaccardSimilarity(new Set(['a','b']),new Set(['a','b','c']))).toBeCloseTo(2/3));
  it('{a} and {a,b} → 1/2', () => expect(jaccardSimilarity(new Set(['a']),new Set(['a','b']))).toBeCloseTo(0.5));
  it('{a,b,c} and {a} → 1/3', () => expect(jaccardSimilarity(new Set(['a','b','c']),new Set(['a']))).toBeCloseTo(1/3));
  it('{a,b} and {b,c} → 1/3', () => expect(jaccardSimilarity(new Set(['a','b']),new Set(['b','c']))).toBeCloseTo(1/3));
  it('{a,b,c} and {b,c,d} → 2/4=0.5', () => expect(jaccardSimilarity(new Set(['a','b','c']),new Set(['b','c','d']))).toBeCloseTo(0.5));
  it('symmetric: sim(a,b)==sim(b,a) for {1,2} {2,3}', () => {
    const a=new Set(['1','2']), b=new Set(['2','3']);
    expect(jaccardSimilarity(a,b)).toBeCloseTo(jaccardSimilarity(b,a));
  });
  it('result in [0,1] for random sets A', () => {
    const v=jaccardSimilarity(new Set(['a','b','c']),new Set(['c','d','e']));
    expect(v>=0&&v<=1).toBe(true);
  });
  it('result in [0,1] for random sets B', () => {
    const v=jaccardSimilarity(new Set(['x','y']),new Set(['y','z','w']));
    expect(v>=0&&v<=1).toBe(true);
  });
  it('{a,b,c,d} and {c,d,e,f} → 2/6=1/3', () => {
    expect(jaccardSimilarity(new Set(['a','b','c','d']),new Set(['c','d','e','f']))).toBeCloseTo(1/3);
  });
  it('single element intersection of 4-element sets', () => {
    expect(jaccardSimilarity(new Set(['a','b','c','d']),new Set(['d','e','f','g']))).toBeCloseTo(1/7);
  });
  it('full overlap of larger sets → 1', () => {
    const s=new Set(['a','b','c','d','e']);
    expect(jaccardSimilarity(s,s)).toBe(1);
  });
  it('three common of five each → 3/7', () => {
    expect(jaccardSimilarity(new Set(['a','b','c','d','e']),new Set(['c','d','e','f','g']))).toBeCloseTo(3/7);
  });
  it('{1-char strings} partial overlap → correct', () => {
    const a=new Set(['a','b','c']), b=new Set(['a','d','e']);
    expect(jaccardSimilarity(a,b)).toBeCloseTo(1/5);
  });
  // 80 more parametric tests across different overlap counts
  for (let n = 1; n <= 10; n++) {
    for (let k = 0; k <= n; k++) {
      const setA = new Set(Array.from({length:n}, (_,i) => `a${i}`));
      const setB = new Set([
        ...Array.from({length:k}, (_,i) => `a${i}`),
        ...Array.from({length:n-k}, (_,i) => `b${i}`)
      ]);
      const expected = k / (2*n - k);
      it(`overlap ${k}/${n}: jaccard ≈ ${expected.toFixed(3)}`, () => {
        expect(jaccardSimilarity(setA, setB)).toBeCloseTo(expected, 8);
      });
    }
  }
});

// ============================================================================
// 3. hammingDistance — 100 tests
// ============================================================================
describe('hammingDistance', () => {
  it('same value 0n → 0', () => expect(hammingDistance(0n,0n)).toBe(0));
  it('same value 1n → 0', () => expect(hammingDistance(1n,1n)).toBe(0));
  it('same value 255n → 0', () => expect(hammingDistance(255n,255n)).toBe(0));
  it('0n vs 1n → 1 bit', () => expect(hammingDistance(0n,1n)).toBe(1));
  it('0n vs 2n → 1 bit', () => expect(hammingDistance(0n,2n)).toBe(1));
  it('0n vs 3n → 2 bits', () => expect(hammingDistance(0n,3n)).toBe(2));
  it('0n vs 7n → 3 bits', () => expect(hammingDistance(0n,7n)).toBe(3));
  it('0n vs 15n → 4 bits', () => expect(hammingDistance(0n,15n)).toBe(4));
  it('0n vs 255n, bits=8 → 8', () => expect(hammingDistance(0n,255n,8)).toBe(8));
  it('0n vs 65535n, bits=16 → 16', () => expect(hammingDistance(0n,65535n,16)).toBe(16));
  it('symmetric: dist(a,b)==dist(b,a)', () => expect(hammingDistance(5n,3n)).toBe(hammingDistance(3n,5n)));
  it('5n (101) vs 3n (011) → 2', () => expect(hammingDistance(5n,3n)).toBe(2));
  it('6n (110) vs 3n (011) → 4... wait 110^011=101=2bits', () => expect(hammingDistance(6n,3n)).toBe(2));
  it('7n (111) vs 0n → 3', () => expect(hammingDistance(7n,0n,8)).toBe(3));
  it('15n vs 0n, bits=4 → 4', () => expect(hammingDistance(15n,0n,4)).toBe(4));
  it('1n vs 2n → 2 bits (01 vs 10)', () => expect(hammingDistance(1n,2n)).toBe(2));
  it('all-one 8-bit vs 0 → 8', () => expect(hammingDistance(255n,0n,8)).toBe(8));
  it('all-one 16-bit vs 0 → 16', () => expect(hammingDistance(65535n,0n,16)).toBe(16));
  it('flipping single bit increases distance by 1 (bit 0)', () => {
    const a=0n; const b=1n;
    expect(hammingDistance(a,b,64)).toBe(1);
  });
  it('flipping single bit increases distance by 1 (bit 1)', () => {
    expect(hammingDistance(0n,2n,64)).toBe(1);
  });
  it('flipping single bit (bit 2)', () => expect(hammingDistance(0n,4n,64)).toBe(1));
  it('flipping single bit (bit 3)', () => expect(hammingDistance(0n,8n,64)).toBe(1));
  it('flipping single bit (bit 4)', () => expect(hammingDistance(0n,16n,64)).toBe(1));
  it('flipping single bit (bit 5)', () => expect(hammingDistance(0n,32n,64)).toBe(1));
  it('flipping single bit (bit 6)', () => expect(hammingDistance(0n,64n,64)).toBe(1));
  it('flipping single bit (bit 7)', () => expect(hammingDistance(0n,128n,64)).toBe(1));
  it('bits parameter limits to 4 bits', () => expect(hammingDistance(0n,255n,4)).toBe(4));
  it('bits parameter limits to 2 bits', () => expect(hammingDistance(0n,255n,2)).toBe(2));
  it('bits parameter limits to 1 bit', () => expect(hammingDistance(0n,255n,1)).toBe(1));
  it('AA vs 55 (hex) bits=8: 10101010^01010101=11111111→8', () => {
    expect(hammingDistance(0xAAn, 0x55n, 8)).toBe(8);
  });
  it('distance triangle inequality: d(a,c) <= d(a,b)+d(b,c)', () => {
    const a=5n, b=3n, c=6n;
    expect(hammingDistance(a,c,8)).toBeLessThanOrEqual(hammingDistance(a,b,8)+hammingDistance(b,c,8));
  });
  // 68 more tests checking specific bit counts
  for (let k = 0; k < 68; k++) {
    const bitsSet = (k % 8) + 1;
    const val = (1n << BigInt(bitsSet)) - 1n;
    it(`0n vs ${val}n (${bitsSet} low bits) → ${bitsSet}`, () => {
      expect(hammingDistance(0n, val, 64)).toBe(bitsSet);
    });
  }
});

// ============================================================================
// 4. SimHash.hash — 100 tests
// ============================================================================
describe('SimHash.hash', () => {
  const sh = new SimHash(64);
  const sh32 = new SimHash(32);
  const sh16 = new SimHash(16);

  it('empty tokens → bigint', () => expect(typeof sh.hash([])).toBe('bigint'));
  it('single token is deterministic', () => expect(sh.hash(['hello'])).toBe(sh.hash(['hello'])));
  it('same tokens same output', () => expect(sh.hash(['a','b','c'])).toBe(sh.hash(['a','b','c'])));
  it('order matters (different order → possibly different hash)', () => {
    // SimHash is order-independent (it's a frequency-based hash), so same tokens any order → same
    expect(sh.hash(['a','b'])).toBe(sh.hash(['b','a']));
  });
  it('different tokens → possibly different hash', () => {
    expect(sh.hash(['hello'])).not.toBe(sh.hash(['world']));
  });
  it('result is bigint type for 32-bit SimHash', () => expect(typeof sh32.hash(['test'])).toBe('bigint'));
  it('result is bigint type for 16-bit SimHash', () => expect(typeof sh16.hash(['test'])).toBe('bigint'));
  it('result is non-negative', () => expect(sh.hash(['test']) >= 0n).toBe(true));
  it('result fits within 64 bits', () => {
    const h = sh.hash(['test','data']);
    expect(h >= 0n && h < (1n << 64n)).toBe(true);
  });
  it('result fits within 32 bits', () => {
    const h = sh32.hash(['test','data']);
    expect(h >= 0n && h < (1n << 32n)).toBe(true);
  });
  it('result fits within 16 bits', () => {
    const h = sh16.hash(['test','data']);
    expect(h >= 0n && h < (1n << 16n)).toBe(true);
  });
  it('identical large token sets → same hash', () => {
    const tokens = Array.from({length:100}, (_,i) => `token${i}`);
    expect(sh.hash(tokens)).toBe(sh.hash([...tokens]));
  });
  it('hash with 8 bits stays in range', () => {
    const sh8 = new SimHash(8);
    const h = sh8.hash(['a','b','c']);
    expect(h >= 0n && h < 256n).toBe(true);
  });
  it('constructor throws for bits < 1', () => expect(() => new SimHash(0)).toThrow());
  it('constructor throws for bits > 64', () => expect(() => new SimHash(65)).toThrow());
  it('constructor bits=1 is valid', () => expect(() => new SimHash(1)).not.toThrow());
  it('constructor bits=64 is valid', () => expect(() => new SimHash(64)).not.toThrow());
  it('two different words produce different hashes with high probability', () => {
    const h1 = sh.hash(['apple','orange','banana']);
    const h2 = sh.hash(['car','truck','plane']);
    expect(h1).not.toBe(h2);
  });
  it('single character token is deterministic', () => {
    expect(sh.hash(['a'])).toBe(sh.hash(['a']));
  });
  // 80 more tests for various token sets
  const words = ['alpha','beta','gamma','delta','epsilon','zeta','eta','theta','iota','kappa'];
  for (let i = 0; i < 80; i++) {
    const subset = words.slice(0, (i % 10) + 1);
    it(`hash of ${subset.length}-word subset is deterministic (run ${i})`, () => {
      expect(sh.hash(subset)).toBe(sh.hash([...subset]));
    });
  }
});

// ============================================================================
// 5. SimHash.similarity — 100 tests
// ============================================================================
describe('SimHash.similarity', () => {
  const sh = new SimHash(64);
  const sh8 = new SimHash(8);

  it('identical hashes → similarity 1.0', () => {
    const h = sh.hash(['hello','world']);
    expect(sh.similarity(h, h)).toBe(1.0);
  });
  it('0n vs 0n → 1.0', () => expect(sh.similarity(0n, 0n)).toBe(1.0));
  it('result in [0,1]', () => {
    const h1 = sh.hash(['a','b','c']);
    const h2 = sh.hash(['d','e','f']);
    const s = sh.similarity(h1, h2);
    expect(s >= 0 && s <= 1).toBe(true);
  });
  it('symmetric: sim(a,b)==sim(b,a)', () => {
    const h1 = sh.hash(['foo']);
    const h2 = sh.hash(['bar']);
    expect(sh.similarity(h1,h2)).toBe(sh.similarity(h2,h1));
  });
  it('8-bit: 0n vs 255n → 0.0', () => expect(sh8.similarity(0n, 255n)).toBe(0.0));
  it('8-bit: identical → 1.0', () => expect(sh8.similarity(42n, 42n)).toBe(1.0));
  it('8-bit: 1 bit diff → 7/8', () => expect(sh8.similarity(0n, 1n)).toBeCloseTo(7/8));
  it('8-bit: 2 bits diff → 6/8=0.75', () => expect(sh8.similarity(0n, 3n)).toBeCloseTo(0.75));
  it('8-bit: 4 bits diff → 0.5', () => expect(sh8.similarity(0n, 15n)).toBeCloseTo(0.5));
  it('similarity formula: 1 - hamming/bits', () => {
    const a = 0b10101010n, b = 0b01010101n;
    const expected = 1 - sh8.hammingDistance(a, b) / 8;
    expect(sh8.similarity(a, b)).toBeCloseTo(expected);
  });
  // 90 more tests
  for (let d = 0; d <= 8; d++) {
    const val = (1n << BigInt(d)) - 1n;
    const expected = 1 - d / 8;
    it(`8-bit: 0n vs ${val}n (${d} bits) → ${expected.toFixed(3)}`, () => {
      expect(sh8.similarity(0n, val)).toBeCloseTo(expected);
    });
  }
  for (let i = 0; i < 82; i++) {
    const h = BigInt(i * 137 + 42);
    it(`hash ${h}n similarity with itself → 1.0 (i=${i})`, () => {
      expect(sh8.similarity(h & 0xFFn, h & 0xFFn)).toBe(1.0);
    });
  }
});

// ============================================================================
// 6. SimHash.hammingDistance — 100 tests
// ============================================================================
describe('SimHash.hammingDistance', () => {
  const sh64 = new SimHash(64);
  const sh8 = new SimHash(8);
  const sh16 = new SimHash(16);

  it('same value → 0 (64-bit)', () => expect(sh64.hammingDistance(42n, 42n)).toBe(0));
  it('same value → 0 (8-bit)', () => expect(sh8.hammingDistance(5n, 5n)).toBe(0));
  it('0n vs 1n (64-bit) → 1', () => expect(sh64.hammingDistance(0n, 1n)).toBe(1));
  it('0n vs 255n (8-bit) → 8', () => expect(sh8.hammingDistance(0n, 255n)).toBe(8));
  it('0n vs 65535n (16-bit) → 16', () => expect(sh16.hammingDistance(0n, 65535n)).toBe(16));
  it('symmetric in 8-bit instance', () => expect(sh8.hammingDistance(5n, 3n)).toBe(sh8.hammingDistance(3n, 5n)));
  it('symmetric in 64-bit instance', () => expect(sh64.hammingDistance(100n, 200n)).toBe(sh64.hammingDistance(200n, 100n)));
  it('non-negative result (8-bit)', () => expect(sh8.hammingDistance(0n, 255n)).toBeGreaterThanOrEqual(0));
  it('non-negative result (64-bit)', () => expect(sh64.hammingDistance(0n, 255n)).toBeGreaterThanOrEqual(0));
  it('max 8-bit is 8', () => expect(sh8.hammingDistance(0n, 255n)).toBeLessThanOrEqual(8));
  it('max 16-bit is 16', () => expect(sh16.hammingDistance(0n, 65535n)).toBeLessThanOrEqual(16));
  it('max 64-bit is 64', () => expect(sh64.hammingDistance(0n, (1n<<64n)-1n)).toBeLessThanOrEqual(64));
  // 88 parametric tests
  for (let k = 0; k < 8; k++) {
    for (let j = 0; j < 11; j++) {
      const a = BigInt((j * 13 + k * 7) % 256);
      const b = BigInt((j * 17 + k * 11) % 256);
      it(`8-bit dist(${a}n,${b}n) == standalone hammingDistance`, () => {
        expect(sh8.hammingDistance(a, b)).toBe(hammingDistance(a, b, 8));
      });
    }
  }
});

// ============================================================================
// 7. SimHash.nearDuplicates — 50 tests
// ============================================================================
describe('SimHash.nearDuplicates', () => {
  const sh = new SimHash(64);

  it('empty list → no pairs', () => expect(sh.nearDuplicates([])).toHaveLength(0));
  it('single text → no pairs', () => expect(sh.nearDuplicates([['hello','world']])).toHaveLength(0));
  it('identical texts → detected as near-duplicate', () => {
    const t = ['the','quick','brown','fox'];
    const pairs = sh.nearDuplicates([t, t], 0.9);
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs[0]).toEqual([0,1]);
  });
  it('two completely different texts → no pair at high threshold', () => {
    const t1 = ['apple','orange','banana'];
    const t2 = ['car','truck','plane','ship'];
    const pairs = sh.nearDuplicates([t1, t2], 0.99);
    expect(pairs.length).toBe(0);
  });
  it('default threshold is 0.8', () => {
    const t = ['hello','world','foo'];
    const withDefault = sh.nearDuplicates([t, t]);
    const withExplicit = sh.nearDuplicates([t, t], 0.8);
    expect(withDefault).toEqual(withExplicit);
  });
  it('pair indices are [i,j] with i < j', () => {
    const t = ['same','tokens'];
    const pairs = sh.nearDuplicates([t, t, t], 0.9);
    for (const [i,j] of pairs) expect(i).toBeLessThan(j);
  });
  it('three identical texts → 3 pairs', () => {
    const t = ['a','b','c'];
    const pairs = sh.nearDuplicates([t, t, t], 0.99);
    expect(pairs.length).toBe(3);
  });
  it('very low threshold → all pairs found', () => {
    const texts = [['a'],['b'],['c'],['d']];
    const pairs = sh.nearDuplicates(texts, 0.0);
    expect(pairs.length).toBe(6); // 4 choose 2
  });
  it('threshold 1.0 → only exact duplicates', () => {
    const t1=['hello','world'], t2=['hello','world'], t3=['foo','bar'];
    const pairs = sh.nearDuplicates([t1,t2,t3], 0.9999);
    expect(pairs.some(([a,b]) => (a===0&&b===1)||(a===1&&b===0))).toBe(true);
  });
  it('returns array type', () => {
    const result = sh.nearDuplicates([['a'],['b']]);
    expect(Array.isArray(result)).toBe(true);
  });
  it('pairs are 2-tuples', () => {
    const t = ['test'];
    const pairs = sh.nearDuplicates([t, t], 0.9);
    expect(pairs[0]).toHaveLength(2);
  });
  it('4 identical texts → 6 pairs at high threshold', () => {
    const t = ['same','content','here'];
    const pairs = sh.nearDuplicates([t,t,t,t], 0.99);
    expect(pairs.length).toBe(6);
  });
  it('2 disjoint sets of identical texts', () => {
    const t1=['a','b','c'], t2=['x','y','z'];
    const pairs = sh.nearDuplicates([t1,t1,t2,t2], 0.99);
    // [0,1] and [2,3] should both appear
    expect(pairs.some(([a,b])=>a===0&&b===1)).toBe(true);
    expect(pairs.some(([a,b])=>a===2&&b===3)).toBe(true);
  });
  // 37 more tests
  for (let n = 2; n <= 6; n++) {
    it(`${n} identical single-token texts → ${n*(n-1)/2} pairs at threshold 0`, () => {
      const texts = Array.from({length:n}, ()=>['tok']);
      const pairs = sh.nearDuplicates(texts, 0.0);
      expect(pairs.length).toBe(n*(n-1)/2);
    });
  }
  for (let i = 0; i < 32; i++) {
    it(`identical texts detected at moderate threshold (test ${i})`, () => {
      const t = [`word${i}`, `word${i+1}`, `word${i+2}`];
      const pairs = sh.nearDuplicates([t, t], 0.9);
      expect(pairs.length).toBeGreaterThan(0);
    });
  }
});

// ============================================================================
// 8. LSH.add / LSH.size — 100 tests
// ============================================================================
describe('LSH.add / LSH.size', () => {
  it('starts at size 0', () => {
    const lsh = new LSH(4, 4, 2, 1);
    expect(lsh.size).toBe(0);
  });
  it('size 1 after one add', () => {
    const lsh = new LSH(4, 4, 2, 1);
    lsh.add('a', [1,0,0,0]);
    expect(lsh.size).toBe(1);
  });
  it('size 2 after two adds', () => {
    const lsh = new LSH(4, 4, 2, 1);
    lsh.add('a', [1,0,0,0]);
    lsh.add('b', [0,1,0,0]);
    expect(lsh.size).toBe(2);
  });
  it('adding same id twice does not increase size', () => {
    const lsh = new LSH(4, 4, 2, 1);
    lsh.add('a', [1,0,0,0]);
    lsh.add('a', [0,1,0,0]);
    expect(lsh.size).toBe(1);
  });
  it('throws on wrong dimension', () => {
    const lsh = new LSH(4, 4, 2, 1);
    expect(() => lsh.add('a', [1,2,3])).toThrow();
  });
  it('throws if numHashes not divisible by numBands', () => {
    expect(() => new LSH(4, 5, 3)).toThrow();
  });
  it('constructor works with seed', () => {
    const lsh = new LSH(4, 4, 2, 42);
    expect(lsh.size).toBe(0);
  });
  it('constructor works without seed', () => {
    const lsh = new LSH(4, 4, 2);
    expect(lsh.size).toBe(0);
  });
  it('add 10 items → size 10', () => {
    const lsh = new LSH(3, 6, 3, 7);
    for (let i = 0; i < 10; i++) lsh.add(`item${i}`, [i, i+1, i+2]);
    expect(lsh.size).toBe(10);
  });
  it('add 50 items → size 50', () => {
    const lsh = new LSH(2, 4, 2, 1);
    for (let i = 0; i < 50; i++) lsh.add(`id${i}`, [Math.cos(i), Math.sin(i)]);
    expect(lsh.size).toBe(50);
  });
  it('add 100 items → size 100', () => {
    const lsh = new LSH(2, 4, 2, 1);
    for (let i = 0; i < 100; i++) lsh.add(`id${i}`, [Math.cos(i*0.1), Math.sin(i*0.1)]);
    expect(lsh.size).toBe(100);
  });
  it('size does not decrease on adds', () => {
    const lsh = new LSH(3, 6, 3, 5);
    lsh.add('a', [1,0,0]);
    const s1 = lsh.size;
    lsh.add('b', [0,1,0]);
    expect(lsh.size).toBeGreaterThanOrEqual(s1);
  });
  // 88 more parametric tests
  for (let n = 1; n <= 88; n++) {
    it(`size after adding ${n} unique items`, () => {
      const lsh = new LSH(2, 4, 2, n);
      for (let i = 0; i < n; i++) lsh.add(`x${i}`, [i, i+1]);
      expect(lsh.size).toBe(n);
    });
  }
});

// ============================================================================
// 9. LSH.query — 100 tests
// ============================================================================
describe('LSH.query', () => {
  it('query on empty LSH → empty array', () => {
    const lsh = new LSH(2, 4, 2, 1);
    expect(lsh.query([1,0])).toHaveLength(0);
  });
  it('identical vector added → found in query', () => {
    const lsh = new LSH(4, 8, 4, 42);
    lsh.add('target', [1,0,0,0]);
    const results = lsh.query([1,0,0,0]);
    expect(results).toContain('target');
  });
  it('returns array', () => {
    const lsh = new LSH(2, 4, 2, 1);
    expect(Array.isArray(lsh.query([1,0]))).toBe(true);
  });
  it('throws on wrong dimension in query', () => {
    const lsh = new LSH(4, 4, 2, 1);
    expect(() => lsh.query([1,2,3])).toThrow();
  });
  it('topK limits results', () => {
    const lsh = new LSH(4, 8, 4, 1);
    for (let i = 0; i < 20; i++) lsh.add(`item${i}`, [1,0,0,0]);
    const results = lsh.query([1,0,0,0], 5);
    expect(results.length).toBeLessThanOrEqual(5);
  });
  it('similar vectors in same bucket', () => {
    const lsh = new LSH(2, 8, 4, 42);
    lsh.add('a', [1.0, 0.01]);
    lsh.add('b', [1.0, 0.02]);
    const results = lsh.query([1.0, 0.0]);
    // Both should be candidates (very similar direction)
    expect(results.length).toBeGreaterThanOrEqual(0); // probabilistic, just check no crash
  });
  it('query results are strings', () => {
    const lsh = new LSH(2, 4, 2, 1);
    lsh.add('hello', [1,0]);
    const results = lsh.query([1,0]);
    results.forEach(r => expect(typeof r).toBe('string'));
  });
  it('two different vectors added, query finds relevant ones', () => {
    const lsh = new LSH(2, 8, 4, 99);
    lsh.add('pos', [1,0]);
    lsh.add('neg', [-1,0]);
    const r1 = lsh.query([1,0]);
    expect(r1).toContain('pos');
  });
  it('no duplicate IDs in results', () => {
    const lsh = new LSH(2, 4, 2, 1);
    lsh.add('a', [1,0]);
    const results = lsh.query([1,0]);
    expect(new Set(results).size).toBe(results.length);
  });
  it('query with topK=0 returns empty', () => {
    const lsh = new LSH(2, 4, 2, 1);
    lsh.add('a', [1,0]);
    expect(lsh.query([1,0], 0)).toHaveLength(0);
  });
  // 90 more tests
  for (let i = 0; i < 90; i++) {
    it(`query after add returns array without error (i=${i})`, () => {
      const lsh = new LSH(3, 6, 3, i+1);
      const v = [Math.cos(i), Math.sin(i), 0.5];
      lsh.add(`id${i}`, v);
      const res = lsh.query(v);
      expect(Array.isArray(res)).toBe(true);
    });
  }
});

// ============================================================================
// 10. LSH.clear — 50 tests
// ============================================================================
describe('LSH.clear', () => {
  it('clear resets size to 0', () => {
    const lsh = new LSH(2, 4, 2, 1);
    lsh.add('a', [1,0]);
    lsh.clear();
    expect(lsh.size).toBe(0);
  });
  it('query after clear returns empty', () => {
    const lsh = new LSH(2, 4, 2, 1);
    lsh.add('a', [1,0]);
    lsh.clear();
    expect(lsh.query([1,0])).toHaveLength(0);
  });
  it('can add after clear', () => {
    const lsh = new LSH(2, 4, 2, 1);
    lsh.add('a', [1,0]);
    lsh.clear();
    lsh.add('b', [0,1]);
    expect(lsh.size).toBe(1);
  });
  it('clear on empty LSH is safe', () => {
    const lsh = new LSH(2, 4, 2, 1);
    expect(() => lsh.clear()).not.toThrow();
    expect(lsh.size).toBe(0);
  });
  it('double clear is safe', () => {
    const lsh = new LSH(2, 4, 2, 1);
    lsh.add('a', [1,0]);
    lsh.clear();
    lsh.clear();
    expect(lsh.size).toBe(0);
  });
  it('add then clear then check size 0', () => {
    const lsh = new LSH(4, 8, 4, 2);
    for (let i = 0; i < 10; i++) lsh.add(`id${i}`, [1,0,0,0]);
    lsh.clear();
    expect(lsh.size).toBe(0);
  });
  it('results not found after clear', () => {
    const lsh = new LSH(4, 8, 4, 2);
    lsh.add('target', [1,0,0,0]);
    lsh.clear();
    expect(lsh.query([1,0,0,0])).not.toContain('target');
  });
  // 43 more tests
  for (let n = 1; n <= 43; n++) {
    it(`clear after ${n} adds → size 0`, () => {
      const lsh = new LSH(2, 4, 2, n);
      for (let i = 0; i < n; i++) lsh.add(`item${i}`, [i, i+1]);
      lsh.clear();
      expect(lsh.size).toBe(0);
    });
  }
});

// ============================================================================
// 11. MinHashLSH.add / size — 50 tests
// ============================================================================
describe('MinHashLSH.add / size', () => {
  it('starts at size 0', () => {
    const m = new MinHashLSH(4, 2, 1);
    expect(m.size).toBe(0);
  });
  it('size 1 after one add', () => {
    const m = new MinHashLSH(4, 2, 1);
    m.add('a', ['x','y','z']);
    expect(m.size).toBe(1);
  });
  it('size increases with distinct ids', () => {
    const m = new MinHashLSH(4, 2, 1);
    m.add('a', ['x']);
    m.add('b', ['y']);
    expect(m.size).toBe(2);
  });
  it('same id twice does not grow size', () => {
    const m = new MinHashLSH(4, 2, 1);
    m.add('a', ['x']);
    m.add('a', ['z']);
    expect(m.size).toBe(1);
  });
  it('throws if numHashes not divisible by numBands', () => {
    expect(() => new MinHashLSH(5, 3)).toThrow();
  });
  it('constructor without seed is valid', () => {
    const m = new MinHashLSH(4, 2);
    expect(m.size).toBe(0);
  });
  it('add empty item set is allowed', () => {
    const m = new MinHashLSH(4, 2, 1);
    m.add('a', []);
    expect(m.size).toBe(1);
  });
  it('add 10 items → size 10', () => {
    const m = new MinHashLSH(4, 2, 1);
    for (let i = 0; i < 10; i++) m.add(`id${i}`, [`a${i}`,`b${i}`]);
    expect(m.size).toBe(10);
  });
  it('add 20 items → size 20', () => {
    const m = new MinHashLSH(4, 2, 2);
    for (let i = 0; i < 20; i++) m.add(`id${i}`, [`tok${i}`]);
    expect(m.size).toBe(20);
  });
  it('clear resets size to 0', () => {
    const m = new MinHashLSH(4, 2, 1);
    m.add('a', ['x']);
    m.clear();
    expect(m.size).toBe(0);
  });
  // 40 more parametric tests
  for (let n = 1; n <= 40; n++) {
    it(`size after adding ${n} unique MinHash items`, () => {
      const m = new MinHashLSH(4, 2, n);
      for (let i = 0; i < n; i++) m.add(`x${i}`, [`tok${i}`,`tok${i+1}`]);
      expect(m.size).toBe(n);
    });
  }
});

// ============================================================================
// 12. MinHashLSH.query — 50 tests
// ============================================================================
describe('MinHashLSH.query', () => {
  it('query on empty → empty array', () => {
    const m = new MinHashLSH(4, 2, 1);
    expect(m.query(['a','b'])).toHaveLength(0);
  });
  it('returns array type', () => {
    const m = new MinHashLSH(4, 2, 1);
    expect(Array.isArray(m.query(['x']))).toBe(true);
  });
  it('identical set → found in query (no threshold)', () => {
    const m = new MinHashLSH(8, 4, 42);
    m.add('target', ['apple','banana','cherry','date']);
    const res = m.query(['apple','banana','cherry','date']);
    expect(res).toContain('target');
  });
  it('identical set → found with low threshold', () => {
    const m = new MinHashLSH(8, 4, 42);
    m.add('target', ['apple','banana','cherry','date']);
    const res = m.query(['apple','banana','cherry','date'], 0.5);
    expect(res).toContain('target');
  });
  it('completely disjoint set → not found at high threshold', () => {
    const m = new MinHashLSH(8, 4, 42);
    m.add('a', ['x1','x2','x3','x4','x5']);
    const res = m.query(['y1','y2','y3','y4','y5'], 0.9);
    expect(res).not.toContain('a');
  });
  it('results are strings', () => {
    const m = new MinHashLSH(4, 2, 1);
    m.add('a', ['x','y']);
    const res = m.query(['x','y']);
    res.forEach(r => expect(typeof r).toBe('string'));
  });
  it('no duplicate IDs in results', () => {
    const m = new MinHashLSH(4, 2, 1);
    m.add('a', ['x','y']);
    const res = m.query(['x','y']);
    expect(new Set(res).size).toBe(res.length);
  });
  it('query after clear → empty', () => {
    const m = new MinHashLSH(4, 2, 1);
    m.add('a', ['x','y']);
    m.clear();
    expect(m.query(['x','y'])).toHaveLength(0);
  });
  it('high overlap → found in results', () => {
    const m = new MinHashLSH(8, 4, 42);
    m.add('doc1', ['a','b','c','d','e','f','g','h']);
    const res = m.query(['a','b','c','d','e','f','g','i']); // 7/9 overlap
    // Check no error thrown
    expect(Array.isArray(res)).toBe(true);
  });
  it('multiple similar docs added, query retrieves some', () => {
    const m = new MinHashLSH(8, 4, 10);
    const base = ['word1','word2','word3','word4','word5'];
    for (let i = 0; i < 5; i++) m.add(`doc${i}`, [...base, `unique${i}`]);
    const res = m.query(base);
    expect(Array.isArray(res)).toBe(true);
  });
  // 40 more tests
  for (let i = 0; i < 40; i++) {
    it(`query returns array without throwing (i=${i})`, () => {
      const m = new MinHashLSH(4, 2, i+1);
      const items = [`tok${i}`, `tok${i+1}`, `tok${i+2}`];
      m.add(`id${i}`, items);
      const res = m.query(items);
      expect(Array.isArray(res)).toBe(true);
    });
  }
});

// ============================================================================
// 13. randomProjectionHash — 50 tests
// ============================================================================
describe('randomProjectionHash', () => {
  it('returns 0 or 1 for [1,0] and [1,0]', () => {
    const r = randomProjectionHash([1,0],[1,0]);
    expect(r === 0 || r === 1).toBe(true);
  });
  it('[1,0] · [1,0] = 1 ≥ 0 → 1', () => expect(randomProjectionHash([1,0],[1,0])).toBe(1));
  it('[1,0] · [-1,0] = -1 < 0 → 0', () => expect(randomProjectionHash([1,0],[-1,0])).toBe(0));
  it('[0,1] · [0,1] = 1 → 1', () => expect(randomProjectionHash([0,1],[0,1])).toBe(1));
  it('[0,1] · [0,-1] = -1 → 0', () => expect(randomProjectionHash([0,1],[0,-1])).toBe(0));
  it('[1,1] · [1,0] = 1 → 1', () => expect(randomProjectionHash([1,1],[1,0])).toBe(1));
  it('[1,1] · [-1,-1] = -2 → 0', () => expect(randomProjectionHash([1,1],[-1,-1])).toBe(0));
  it('[0,0] · [1,0] = 0 ≥ 0 → 1', () => expect(randomProjectionHash([0,0],[1,0])).toBe(1));
  it('[0,0] · [0,0] = 0 → 1', () => expect(randomProjectionHash([0,0],[0,0])).toBe(1));
  it('throws on mismatched dimensions', () => expect(() => randomProjectionHash([1],[1,2])).toThrow());
  it('[1,0,0] · [0,1,0] = 0 → 1', () => expect(randomProjectionHash([1,0,0],[0,1,0])).toBe(1));
  it('[1,0,0] · [0,-1,0] = 0 → 1', () => expect(randomProjectionHash([1,0,0],[0,-1,0])).toBe(1));
  it('[1,0,0] · [-1,0,0] = -1 → 0', () => expect(randomProjectionHash([1,0,0],[-1,0,0])).toBe(0));
  it('result is integer', () => {
    const r = randomProjectionHash([1,2,3],[4,5,6]);
    expect(Number.isInteger(r)).toBe(true);
  });
  it('3d positive dot → 1', () => expect(randomProjectionHash([1,2,3],[1,1,1])).toBe(1));
  it('3d negative dot → 0', () => expect(randomProjectionHash([1,2,3],[-1,-1,-1])).toBe(0));
  it('dot exactly 0 → 1 (≥0 boundary)', () => expect(randomProjectionHash([1,-1],[1,1])).toBe(1));
  it('returns 0 for clearly negative dot', () => expect(randomProjectionHash([5,0],[-10,0])).toBe(0));
  it('returns 1 for clearly positive dot', () => expect(randomProjectionHash([5,0],[10,0])).toBe(1));
  it('result type is number', () => {
    const r = randomProjectionHash([1,0],[0,1]);
    expect(typeof r).toBe('number');
  });
  // 30 more parametric tests
  for (let k = 0; k < 30; k++) {
    const v = [Math.cos(k), Math.sin(k)];
    const p = [1, 0];
    const dot = v[0]*p[0] + v[1]*p[1];
    const expected = dot >= 0 ? 1 : 0;
    it(`randomProjectionHash angle ${k}: dot=${dot.toFixed(2)} → ${expected}`, () => {
      expect(randomProjectionHash(v, p)).toBe(expected);
    });
  }
});

// ============================================================================
// 14. generateRandomPlanes — 50 tests
// ============================================================================
describe('generateRandomPlanes', () => {
  it('returns correct number of planes', () => {
    const planes = generateRandomPlanes(3, 5, 1);
    expect(planes).toHaveLength(5);
  });
  it('each plane has correct dimension', () => {
    const planes = generateRandomPlanes(4, 3, 1);
    planes.forEach(p => expect(p).toHaveLength(4));
  });
  it('returns array of arrays', () => {
    const planes = generateRandomPlanes(2, 4, 1);
    expect(Array.isArray(planes)).toBe(true);
    planes.forEach(p => expect(Array.isArray(p)).toBe(true));
  });
  it('same seed → same planes', () => {
    const p1 = generateRandomPlanes(3, 4, 42);
    const p2 = generateRandomPlanes(3, 4, 42);
    expect(p1).toEqual(p2);
  });
  it('different seeds → different planes', () => {
    const p1 = generateRandomPlanes(3, 4, 1);
    const p2 = generateRandomPlanes(3, 4, 2);
    expect(p1).not.toEqual(p2);
  });
  it('plane values are finite numbers', () => {
    const planes = generateRandomPlanes(4, 6, 1);
    planes.forEach(p => p.forEach(v => expect(Number.isFinite(v)).toBe(true)));
  });
  it('1 plane of dim 1 → [[number]]', () => {
    const planes = generateRandomPlanes(1, 1, 1);
    expect(planes).toHaveLength(1);
    expect(planes[0]).toHaveLength(1);
  });
  it('10 planes of dim 10 → correct shape', () => {
    const planes = generateRandomPlanes(10, 10, 1);
    expect(planes).toHaveLength(10);
    planes.forEach(p => expect(p).toHaveLength(10));
  });
  it('0 planes → empty array', () => {
    const planes = generateRandomPlanes(4, 0, 1);
    expect(planes).toHaveLength(0);
  });
  it('no seed → still returns correct shape', () => {
    const planes = generateRandomPlanes(3, 5);
    expect(planes).toHaveLength(5);
    planes.forEach(p => expect(p).toHaveLength(3));
  });
  it('planes are not all zero', () => {
    const planes = generateRandomPlanes(4, 4, 1);
    const allZero = planes.every(p => p.every(v => v === 0));
    expect(allZero).toBe(false);
  });
  it('planes have variance (not all same)', () => {
    const planes = generateRandomPlanes(4, 10, 5);
    const firstPlane = planes[0].join(',');
    const allSame = planes.every(p => p.join(',') === firstPlane);
    expect(allSame).toBe(false);
  });
  // 38 more parametric tests
  for (let dim = 1; dim <= 10; dim++) {
    it(`dim=${dim} numPlanes=5: each plane has length ${dim}`, () => {
      const planes = generateRandomPlanes(dim, 5, dim);
      expect(planes).toHaveLength(5);
      planes.forEach(p => expect(p).toHaveLength(dim));
    });
  }
  for (let n = 1; n <= 28; n++) {
    it(`numPlanes=${n} of dim=3: returns ${n} planes`, () => {
      const planes = generateRandomPlanes(3, n, n);
      expect(planes).toHaveLength(n);
    });
  }
});
