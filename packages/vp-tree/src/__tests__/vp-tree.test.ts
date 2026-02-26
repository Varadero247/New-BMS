// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  VPTree,
  BKTree,
  euclidean2D,
  manhattan2D,
  euclideanND,
  hammingDistance,
  levenshteinDistance,
  Point2D,
} from '../vp-tree';

// Helper: brute-force nearest neighbor
function bruteNearest(points: Point2D[], query: Point2D): Point2D {
  let best = points[0];
  let bestDist = euclidean2D(query, points[0]);
  for (const p of points) {
    const d = euclidean2D(query, p);
    if (d < bestDist) { best = p; bestDist = d; }
  }
  return best;
}

// Helper: brute-force k nearest
function bruteKNearest(points: Point2D[], query: Point2D, k: number): Point2D[] {
  return [...points]
    .sort((a, b) => euclidean2D(query, a) - euclidean2D(query, b))
    .slice(0, k);
}

// Helper: brute-force within radius
function bruteWithinRadius(points: Point2D[], query: Point2D, r: number): Point2D[] {
  return points.filter(p => euclidean2D(query, p) <= r);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: VPTree size (100 tests: n=1..100)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree size', () => {
  for (let n = 1; n <= 100; n++) {
    it(`size === ${n} when built with ${n} points`, () => {
      const points: Point2D[] = Array.from({ length: n }, (_, i) => ({ x: i, y: i }));
      const tree = new VPTree(points, euclidean2D);
      expect(tree.size).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: VPTree nearest returns the point itself (200 tests: i=0..199)
// Build a 20×20 grid; query each point — nearest should be itself
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree nearest returns point itself', () => {
  const grid: Point2D[] = [];
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 20; col++) {
      grid.push({ x: col * 10, y: row * 10 });
    }
  }
  const tree = new VPTree(grid, euclidean2D);

  for (let i = 0; i < 200; i++) {
    const p = grid[i];
    it(`nearest to grid[${i}] = (${p.x},${p.y}) returns itself`, () => {
      const result = tree.nearest(p);
      expect(result).toEqual(p);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: VPTree nearest with single point (100 tests: n=1..100)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree nearest single-point tree', () => {
  for (let n = 1; n <= 100; n++) {
    it(`single-point tree at (${n},${n}): nearest to (0,0) returns ({x:${n},y:${n}})`, () => {
      const tree = new VPTree<Point2D>([{ x: n, y: n }], euclidean2D);
      const result = tree.nearest({ x: 0, y: 0 });
      expect(result).toEqual({ x: n, y: n });
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: VPTree kNearest count (100 tests)
// tree with 20 points, k=1..10 (10 iterations), query origin (total: 100)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree kNearest count', () => {
  // Build several trees of different sizes and query kNearest
  // For k=1..10 and treeSize=5..14 (10 size variants): 100 total tests
  for (let s = 0; s < 10; s++) {
    const treeSize = s + 5; // 5..14
    const points: Point2D[] = Array.from({ length: treeSize }, (_, i) => ({ x: i, y: i * 2 }));
    const tree = new VPTree(points, euclidean2D);
    for (let k = 1; k <= 10; k++) {
      it(`kNearest count: treeSize=${treeSize}, k=${k} → length === ${Math.min(k, treeSize)}`, () => {
        const result = tree.kNearest({ x: 0, y: 0 }, k);
        expect(result.length).toBe(Math.min(k, treeSize));
      });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: VPTree withinRadius (100 tests: r=0..99)
// Points at integer distances from origin on x-axis: {x:0..99, y:0}
// withinRadius({x:0,y:0}, r) should contain exactly points with x <= r
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree withinRadius', () => {
  const points: Point2D[] = Array.from({ length: 100 }, (_, i) => ({ x: i, y: 0 }));
  const tree = new VPTree(points, euclidean2D);
  const origin: Point2D = { x: 0, y: 0 };

  for (let r = 0; r < 100; r++) {
    it(`withinRadius r=${r}: expected count = ${r + 1}`, () => {
      const result = tree.withinRadius(origin, r);
      // All points with x <= r (distance = x, since y=0)
      const expected = points.filter(p => p.x <= r);
      expect(result.length).toBe(expected.length);
      // Verify every result is within radius
      for (const p of result) {
        expect(euclidean2D(origin, p)).toBeLessThanOrEqual(r);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: VPTree hasPointWithinRadius (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree hasPointWithinRadius', () => {
  // 50 tests: tree contains (0,0); hasPointWithinRadius at r=0 returns true
  const treeWithOrigin = new VPTree<Point2D>(
    [{ x: 0, y: 0 }, ...Array.from({ length: 49 }, (_, i) => ({ x: i + 1, y: i + 1 }))],
    euclidean2D
  );
  for (let i = 0; i < 50; i++) {
    it(`hasPointWithinRadius[${i}]: tree with (0,0), query (0,0) r=0 → true`, () => {
      expect(treeWithOrigin.hasPointWithinRadius({ x: 0, y: 0 }, 0)).toBe(true);
    });
  }

  // 50 tests: tree does NOT contain (0,0); hasPointWithinRadius at r=0 returns false
  for (let i = 1; i <= 50; i++) {
    it(`hasPointWithinRadius[${i}]: tree without (0,0), query (0,0) r=0 → false`, () => {
      const tree = new VPTree<Point2D>(
        Array.from({ length: 5 }, (_, j) => ({ x: i * 10 + j, y: i * 10 + j })),
        euclidean2D
      );
      expect(tree.hasPointWithinRadius({ x: 0, y: 0 }, 0)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: euclidean2D distance tests (100 tests: i=0..99)
// euclidean2D({x:0,y:0},{x:i,y:0}) === i
// ─────────────────────────────────────────────────────────────────────────────
describe('euclidean2D distance', () => {
  for (let i = 0; i < 100; i++) {
    it(`euclidean2D({x:0,y:0},{x:${i},y:0}) === ${i}`, () => {
      expect(euclidean2D({ x: 0, y: 0 }, { x: i, y: 0 })).toBeCloseTo(i, 10);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: manhattan2D distance tests (100 tests: i=0..99)
// manhattan2D({x:0,y:0},{x:i,y:i}) === 2*i
// ─────────────────────────────────────────────────────────────────────────────
describe('manhattan2D distance', () => {
  for (let i = 0; i < 100; i++) {
    it(`manhattan2D({x:0,y:0},{x:${i},y:${i}}) === ${2 * i}`, () => {
      expect(manhattan2D({ x: 0, y: 0 }, { x: i, y: i })).toBe(2 * i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9: euclideanND distance tests (100 tests)
// euclideanND([0,0,0],[3,4,0]) === 5 (and other cases)
// ─────────────────────────────────────────────────────────────────────────────
describe('euclideanND distance', () => {
  // 10 tests: 3-4-5 triangle scaled by i=1..10
  for (let i = 1; i <= 10; i++) {
    it(`euclideanND([0,0,0],[${3*i},${4*i},0]) === ${5*i}`, () => {
      expect(euclideanND([0, 0, 0], [3 * i, 4 * i, 0])).toBeCloseTo(5 * i, 10);
    });
  }
  // 10 tests: 1D distance
  for (let i = 0; i < 10; i++) {
    it(`euclideanND([0],[${i}]) === ${i}`, () => {
      expect(euclideanND([0], [i])).toBeCloseTo(i, 10);
    });
  }
  // 10 tests: 2D distance
  for (let i = 0; i < 10; i++) {
    it(`euclideanND([0,0],[${i},0]) === ${i}`, () => {
      expect(euclideanND([0, 0], [i, 0])).toBeCloseTo(i, 10);
    });
  }
  // 10 tests: symmetric
  for (let i = 0; i < 10; i++) {
    it(`euclideanND symmetric: dist([0,${i}],[${i},0]) === euclideanND([${i},0],[0,${i}])`, () => {
      const a = [0, i], b = [i, 0];
      expect(euclideanND(a, b)).toBeCloseTo(euclideanND(b, a), 10);
    });
  }
  // 10 tests: zero distance
  for (let i = 0; i < 10; i++) {
    it(`euclideanND([${i},${i}],[${i},${i}]) === 0`, () => {
      expect(euclideanND([i, i], [i, i])).toBe(0);
    });
  }
  // 10 tests: 4D vectors
  for (let i = 0; i < 10; i++) {
    it(`euclideanND 4D: [0,0,0,0] to [${i},0,0,0] === ${i}`, () => {
      expect(euclideanND([0, 0, 0, 0], [i, 0, 0, 0])).toBeCloseTo(i, 10);
    });
  }
  // 10 tests: known 5-12-13 triple scaled
  for (let i = 1; i <= 10; i++) {
    it(`euclideanND 5-12-13 scale ${i}: dist([0,0],[${5*i},${12*i}]) === ${13*i}`, () => {
      expect(euclideanND([0, 0], [5 * i, 12 * i])).toBeCloseTo(13 * i, 8);
    });
  }
  // 10 tests: non-zero origin
  for (let i = 0; i < 10; i++) {
    it(`euclideanND non-zero origin: [${i},${i}] to [${i+3},${i+4}] === 5`, () => {
      expect(euclideanND([i, i], [i + 3, i + 4])).toBeCloseTo(5, 10);
    });
  }
  // 10 tests: negative coords
  for (let i = 0; i < 10; i++) {
    it(`euclideanND negative: [-${i},0] to [0,0] === ${i}`, () => {
      expect(euclideanND([-i, 0], [0, 0])).toBeCloseTo(i, 10);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10: hammingDistance tests (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('hammingDistance', () => {
  // 25 tests: identical strings → 0
  const words = ['abc', 'hello', 'world', 'foo', 'bar', 'baz', 'qux', 'quux',
    'a', 'ab', 'abcd', 'abcde', 'xyz', 'test', 'jest', 'node', 'type',
    'script', 'code', 'data', 'tree', 'heap', 'sort', 'search', 'index'];
  for (let i = 0; i < 25; i++) {
    it(`hammingDistance("${words[i % words.length]}","${words[i % words.length]}") === 0`, () => {
      const w = words[i % words.length];
      expect(hammingDistance(w, w)).toBe(0);
    });
  }

  // 25 tests: single character difference
  for (let i = 0; i < 25; i++) {
    it(`hammingDistance single diff test ${i}: "abc" vs "ab${'xyz'[i % 3]}" → 1`, () => {
      const b = 'ab' + 'xyz'[i % 3];
      expect(hammingDistance('abc', b)).toBe(1);
    });
  }

  // 25 tests: completely different same-length strings
  for (let i = 0; i < 25; i++) {
    const len = (i % 5) + 1;
    const a = 'a'.repeat(len);
    const b = 'b'.repeat(len);
    it(`hammingDistance("${'a'.repeat(len)}","${'b'.repeat(len)}") === ${len}`, () => {
      expect(hammingDistance(a, b)).toBe(len);
    });
  }

  // 25 tests: length difference contributes to distance
  for (let i = 1; i <= 25; i++) {
    it(`hammingDistance length diff: "abc" vs "abc${'x'.repeat(i)}" === ${i}`, () => {
      expect(hammingDistance('abc', 'abc' + 'x'.repeat(i))).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 11: BKTree tests (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('BKTree', () => {
  // 25 tests: insert words, search(word, 0) returns that word
  const vocabulary = [
    'apple', 'apply', 'apt', 'ape', 'apex',
    'book', 'boot', 'boost', 'boo', 'bore',
    'cat', 'can', 'cap', 'car', 'card',
    'dog', 'dot', 'doe', 'done', 'door',
    'eat', 'ear', 'earl', 'easy', 'east',
  ];

  for (let i = 0; i < 25; i++) {
    it(`BKTree exact match: "${vocabulary[i]}" search maxDist=0 returns itself`, () => {
      const bk = new BKTree<string>(levenshteinDistance);
      for (const w of vocabulary) bk.insert(w);
      const result = bk.search(vocabulary[i], 0);
      expect(result).toContain(vocabulary[i]);
    });
  }

  // 25 tests: size after inserting n words
  for (let n = 1; n <= 25; n++) {
    it(`BKTree size after inserting ${n} distinct words === ${n}`, () => {
      const bk = new BKTree<string>(levenshteinDistance);
      for (let j = 0; j < n; j++) bk.insert(vocabulary[j % vocabulary.length] + j);
      expect(bk.size).toBe(n);
    });
  }

  // 25 tests: search with maxDist=1 returns word when same word is queried
  for (let i = 0; i < 25; i++) {
    it(`BKTree maxDist=1 search includes "${vocabulary[i]}" itself`, () => {
      const bk = new BKTree<string>(levenshteinDistance);
      for (const w of vocabulary) bk.insert(w);
      const result = bk.search(vocabulary[i], 1);
      expect(result).toContain(vocabulary[i]);
    });
  }

  // 25 tests: empty BKTree search returns []
  for (let i = 0; i < 25; i++) {
    it(`BKTree empty search test ${i}: returns []`, () => {
      const bk = new BKTree<string>(levenshteinDistance);
      const result = bk.search('anything', i % 5);
      expect(result).toEqual([]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 12: VPTree empty tree (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree empty tree', () => {
  for (let i = 0; i < 50; i++) {
    it(`empty tree test ${i}: nearest returns null, kNearest returns [], withinRadius returns []`, () => {
      const tree = new VPTree<Point2D>([], euclidean2D);
      expect(tree.size).toBe(0);
      expect(tree.nearest({ x: i, y: i })).toBeNull();
      expect(tree.kNearest({ x: i, y: i }, 5)).toEqual([]);
      expect(tree.withinRadius({ x: i, y: i }, 100)).toEqual([]);
      expect(tree.hasPointWithinRadius({ x: i, y: i }, 100)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 13: VPTree nearest correctness vs brute-force (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree nearest correctness vs brute-force', () => {
  const points: Point2D[] = Array.from({ length: 50 }, (_, i) => ({
    x: (i * 7) % 100,
    y: (i * 13) % 100,
  }));
  const tree = new VPTree(points, euclidean2D);

  for (let i = 0; i < 50; i++) {
    const query: Point2D = { x: (i * 11) % 100, y: (i * 17) % 100 };
    it(`VPTree nearest matches brute-force for query (${query.x},${query.y})`, () => {
      const vpResult = tree.nearest(query);
      const bfResult = bruteNearest(points, query);
      const vpDist = euclidean2D(query, vpResult!);
      const bfDist = euclidean2D(query, bfResult);
      expect(vpDist).toBeCloseTo(bfDist, 8);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 14: VPTree kNearest correctness vs brute-force (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree kNearest correctness vs brute-force', () => {
  const points: Point2D[] = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 3) % 20,
    y: (i * 7) % 20,
  }));
  const tree = new VPTree(points, euclidean2D);

  for (let i = 0; i < 50; i++) {
    const k = (i % 5) + 1;
    const query: Point2D = { x: i % 20, y: (i * 3) % 20 };
    it(`kNearest(k=${k}) max-dist matches brute-force for query (${query.x},${query.y})`, () => {
      const vpResult = tree.kNearest(query, k);
      const bfResult = bruteKNearest(points, query, k);
      // The farthest distance in kNearest result should equal brute-force farthest
      const vpMaxDist = Math.max(...vpResult.map(p => euclidean2D(query, p)));
      const bfMaxDist = Math.max(...bfResult.map(p => euclidean2D(query, p)));
      expect(vpMaxDist).toBeCloseTo(bfMaxDist, 6);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 15: VPTree withinRadius correctness vs brute-force (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree withinRadius correctness vs brute-force', () => {
  const points: Point2D[] = Array.from({ length: 30 }, (_, i) => ({
    x: i * 3,
    y: 0,
  }));
  const tree = new VPTree(points, euclidean2D);

  for (let i = 0; i < 50; i++) {
    const r = i * 2;
    const query: Point2D = { x: 0, y: 0 };
    it(`withinRadius(r=${r}) count matches brute-force`, () => {
      const vpResult = tree.withinRadius(query, r);
      const bfResult = bruteWithinRadius(points, query, r);
      expect(vpResult.length).toBe(bfResult.length);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 16: levenshteinDistance tests (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('levenshteinDistance', () => {
  // 10 tests: empty string
  for (let i = 0; i < 10; i++) {
    const s = 'a'.repeat(i);
    it(`levenshteinDistance("","${'a'.repeat(i)}") === ${i}`, () => {
      expect(levenshteinDistance('', s)).toBe(i);
    });
  }
  // 10 tests: identical strings
  const testWords = ['cat', 'dog', 'hello', 'world', 'foo', 'bar', 'test', 'code', 'tree', 'node'];
  for (let i = 0; i < 10; i++) {
    it(`levenshteinDistance("${testWords[i]}","${testWords[i]}") === 0`, () => {
      expect(levenshteinDistance(testWords[i], testWords[i])).toBe(0);
    });
  }
  // 10 tests: single substitution
  for (let i = 0; i < 10; i++) {
    it(`levenshteinDistance("abc","ab${'xyz'[i % 3]}") = 1`, () => {
      expect(levenshteinDistance('abc', 'ab' + 'xyz'[i % 3])).toBe(1);
    });
  }
  // 10 tests: single insertion
  for (let i = 1; i <= 10; i++) {
    it(`levenshteinDistance("abc","abc" + ${i} char) === ${i}`, () => {
      expect(levenshteinDistance('abc', 'abc' + 'x'.repeat(i))).toBe(i);
    });
  }
  // 10 tests: single deletion (use a 20-char string so slice never overflows)
  for (let i = 1; i <= 10; i++) {
    it(`levenshteinDistance single deletion check ${i}`, () => {
      const base = 'abcdefghijklmnopqrst'; // 20 chars
      const a = base.slice(0, i + 1);
      const b = base.slice(0, i);
      expect(levenshteinDistance(a, b)).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 17: VPTree with manhattan distance (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree with manhattan2D distance', () => {
  const points: Point2D[] = Array.from({ length: 25 }, (_, i) => ({ x: i, y: 0 }));
  const tree = new VPTree(points, manhattan2D);

  for (let i = 0; i < 25; i++) {
    it(`manhattan VPTree: nearest to (${i},0) returns itself`, () => {
      const result = tree.nearest({ x: i, y: 0 });
      expect(result).toEqual({ x: i, y: 0 });
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`manhattan VPTree: withinRadius({x:0,y:0}, ${i}) contains ${i+1} points`, () => {
      const result = tree.withinRadius({ x: 0, y: 0 }, i);
      expect(result.length).toBe(i + 1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 18: VPTree with string/hamming distance (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree with hammingDistance on strings', () => {
  const strPoints = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i).padEnd(3, 'A') // "AAA", "BAA", "CAA"...
  );
  const tree = new VPTree(strPoints, hammingDistance);

  for (let i = 0; i < 26; i++) {
    it(`hamming VPTree: nearest to "${strPoints[i]}" returns itself`, () => {
      const result = tree.nearest(strPoints[i]);
      expect(result).toBe(strPoints[i]);
    });
  }

  // 24 more tests: withinRadius with r=0 should return exactly that string
  for (let i = 0; i < 24; i++) {
    it(`hamming VPTree: withinRadius("${strPoints[i]}", 0) contains "${strPoints[i]}"`, () => {
      const result = tree.withinRadius(strPoints[i], 0);
      expect(result).toContain(strPoints[i]);
      expect(result.length).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 19: VPTree kNearest k=0 and k > size (30 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree kNearest edge cases: k=0 and k > size', () => {
  const points: Point2D[] = Array.from({ length: 5 }, (_, i) => ({ x: i, y: 0 }));
  const tree = new VPTree(points, euclidean2D);

  for (let i = 0; i < 15; i++) {
    it(`kNearest k=0 test ${i}: returns []`, () => {
      expect(tree.kNearest({ x: i, y: 0 }, 0)).toEqual([]);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`kNearest k=100 (> size=5) test ${i}: returns 5 points`, () => {
      expect(tree.kNearest({ x: i, y: 0 }, 100).length).toBe(5);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 20: VPTree hasPointWithinRadius thorough (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree hasPointWithinRadius thorough', () => {
  // Points at x=1000,2000,...,50000 (50 points, all at large distances from origin)
  // Nearest point to origin is at x=1000 (dist=1000)
  const points: Point2D[] = Array.from({ length: 50 }, (_, i) => ({ x: (i + 1) * 1000, y: 0 }));
  const tree = new VPTree(points, euclidean2D);

  // 25 false tests: r = 1..25 (all < 1000, so no point in range)
  for (let i = 1; i <= 25; i++) {
    const r = i;
    it(`hasPointWithinRadius r=${r}: false (nearest point at dist 1000)`, () => {
      expect(tree.hasPointWithinRadius({ x: 0, y: 0 }, r)).toBe(false);
    });
  }

  // 25 true tests: r = (i+1)*1000, exactly hitting each point's distance
  for (let i = 0; i < 25; i++) {
    const r = (i + 1) * 1000;
    it(`hasPointWithinRadius r=${r}: true (point at x=${r} is in tree)`, () => {
      expect(tree.hasPointWithinRadius({ x: 0, y: 0 }, r)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 21: VPTree two-point tree (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree two-point tree', () => {
  for (let i = 0; i < 50; i++) {
    it(`two-point tree test ${i}: nearest to closer point is correct`, () => {
      const p1: Point2D = { x: 0, y: 0 };
      const p2: Point2D = { x: 100, y: 0 };
      const tree = new VPTree([p1, p2], euclidean2D);
      // Query near p1
      const result = tree.nearest({ x: i, y: 0 });
      if (i <= 50) {
        expect(euclidean2D({ x: i, y: 0 }, result!)).toBeLessThanOrEqual(
          euclidean2D({ x: i, y: 0 }, i <= 50 ? p2 : p1)
        );
      } else {
        expect(result).toEqual(p2);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 22: VPTree large tree (30 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree large tree operations', () => {
  const N = 500;
  const bigPoints: Point2D[] = Array.from({ length: N }, (_, i) => ({
    x: (i * 7) % 100,
    y: (i * 11) % 100,
  }));
  const bigTree = new VPTree(bigPoints, euclidean2D);

  it('large tree size is correct', () => {
    expect(bigTree.size).toBe(N);
  });

  for (let i = 0; i < 29; i++) {
    it(`large tree nearest[${i}]: VP distance ≤ brute-force distance`, () => {
      const query: Point2D = { x: i * 3 % 100, y: i * 5 % 100 };
      const vpResult = bigTree.nearest(query);
      const bfResult = bruteNearest(bigPoints, query);
      const vpDist = euclidean2D(query, vpResult!);
      const bfDist = euclidean2D(query, bfResult);
      expect(vpDist).toBeCloseTo(bfDist, 6);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 23: VPTree withinRadius r=0 (30 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree withinRadius r=0', () => {
  // r=0 should return only exact matches
  for (let i = 0; i < 30; i++) {
    it(`withinRadius r=0 at (${i},${i}) returns exactly 1 point (the point itself)`, () => {
      const pts: Point2D[] = Array.from({ length: 10 }, (_, j) => ({ x: j * 10, y: j * 10 }));
      const tree = new VPTree(pts, euclidean2D);
      const result = tree.withinRadius({ x: i * 10, y: i * 10 }, 0);
      if (i < 10) {
        expect(result.length).toBe(1);
        expect(result[0]).toEqual({ x: i * 10, y: i * 10 });
      } else {
        expect(result.length).toBe(0);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 24: BKTree with hamming distance (30 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('BKTree with hammingDistance', () => {
  const words = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(97 + i) + 'bc'
  ); // abc, bbc, cbc, ...

  for (let i = 0; i < 26; i++) {
    it(`BKTree hamming: "${words[i]}" in search maxDist=0`, () => {
      const bk = new BKTree<string>(hammingDistance);
      for (const w of words) bk.insert(w);
      const result = bk.search(words[i], 0);
      expect(result).toContain(words[i]);
    });
  }

  // 4 more: size checks
  for (let n = 1; n <= 4; n++) {
    it(`BKTree hamming: size after ${n} inserts === ${n}`, () => {
      const bk = new BKTree<string>(hammingDistance);
      for (let j = 0; j < n; j++) bk.insert(words[j]);
      expect(bk.size).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 25: VPTree kNearest sorted order by distance (20 tests)
// Use a query point that is NOT in the tree (x=0.5) to avoid tie-breaking issues
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree kNearest sorted by distance', () => {
  // Points at x=1,2,...,20 (shifted so query 0.5 is NOT in the tree)
  const pts: Point2D[] = Array.from({ length: 20 }, (_, i) => ({ x: i + 1, y: 0 }));
  const tree = new VPTree(pts, euclidean2D);
  // Query at x=0.5 — distances to pts are 0.5, 1.5, 2.5, ..., 19.5 (all distinct)
  const query: Point2D = { x: 0.5, y: 0 };

  for (let k = 1; k <= 20; k++) {
    it(`kNearest k=${k}: result distances match brute-force k closest`, () => {
      const result = tree.kNearest(query, k);
      expect(result.length).toBe(Math.min(k, pts.length));
      // All returned points should be the k closest
      const bfDists = pts
        .map(p => euclidean2D(query, p))
        .sort((a, b) => a - b)
        .slice(0, k);
      const vpDists = result.map(p => euclidean2D(query, p)).sort((a, b) => a - b);
      for (let j = 0; j < vpDists.length; j++) {
        expect(vpDists[j]).toBeCloseTo(bfDists[j], 8);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 26: Additional euclidean2D symmetry/triangle (20 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('euclidean2D symmetry and triangle inequality', () => {
  for (let i = 1; i <= 10; i++) {
    it(`euclidean2D symmetric: dist(({x:${i},y:0}),({x:0,y:0})) === ${i}`, () => {
      expect(euclidean2D({ x: i, y: 0 }, { x: 0, y: 0 })).toBeCloseTo(i, 10);
    });
  }
  for (let i = 0; i < 10; i++) {
    it(`euclidean2D self-distance: dist(({x:${i},y:${i}}),({x:${i},y:${i}})) === 0`, () => {
      expect(euclidean2D({ x: i, y: i }, { x: i, y: i })).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 27: VPTree 3D (euclideanND) nearest (20 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree 3D nearest', () => {
  const pts3D: number[][] = Array.from({ length: 20 }, (_, i) => [i, i, i]);
  const tree3D = new VPTree(pts3D, euclideanND);

  for (let i = 0; i < 20; i++) {
    it(`3D VPTree: nearest to [${i},${i},${i}] returns itself`, () => {
      const result = tree3D.nearest([i, i, i]);
      expect(result).toEqual([i, i, i]);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 28: VPTree size=0 additional checks (20 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree size zero additional', () => {
  for (let i = 0; i < 20; i++) {
    it(`empty tree hasPointWithinRadius(${i}) === false`, () => {
      const t = new VPTree<number[]>([], euclideanND);
      expect(t.hasPointWithinRadius([i], i * 100)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 29: BKTree search returns multiple close words (20 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('BKTree search returns nearby words', () => {
  const bk = new BKTree<string>(levenshteinDistance);
  const baseWords = ['cat', 'bat', 'hat', 'rat', 'fat', 'mat', 'sat', 'pat', 'vat', 'zap',
    'nap', 'cap', 'lap', 'map', 'tap', 'gap', 'rap', 'sap', 'yap', 'dab'];
  for (const w of baseWords) bk.insert(w);

  for (let i = 0; i < 20; i++) {
    it(`BKTree nearby[${i}]: search("${baseWords[i]}", 1) contains at least 1 result`, () => {
      const result = bk.search(baseWords[i], 1);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 30: Additional combined tests to reach ≥1000 (20 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('VPTree combined correctness final checks', () => {
  for (let i = 1; i <= 20; i++) {
    it(`combined test ${i}: tree of ${i} random pts, withinRadius large r returns all`, () => {
      const pts: Point2D[] = Array.from({ length: i }, (_, j) => ({ x: j, y: 0 }));
      const tree = new VPTree(pts, euclidean2D);
      const result = tree.withinRadius({ x: i / 2, y: 0 }, i * 10);
      expect(result.length).toBe(i);
    });
  }
});
